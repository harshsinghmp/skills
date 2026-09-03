import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { discoverSkillsInRepo, resolveDefaultBranch } from "./discover.ts";
import { addOrUpdateSkill, loadManifest, saveManifest } from "./manifest.ts";
import type {
  SkillCategory,
  SkillEntry,
  SyncOptions,
  SyncReport,
  SyncReportDetail,
  UpstreamMeta,
} from "./types.ts";

const DEFAULT_ATTEMPTS = 2;

interface RepoGroup {
  repo: string;
  host: "github" | "git";
  requestedBranch?: string;
  skills: { name: string; sourcePath: string }[];
}

const CATEGORY_KEYWORDS: Array<[RegExp, SkillCategory]> = [
  [/(security|auth|credential|secret|vulnerab)/i, "governance"],
  [/(marketing|seo|ads?|growth|campaign|social|content|copy)/i, "marketing"],
  [/(memory|cognit|brain|muse|recall)/i, "cognitive"],
  [/(design|ui|ux|visual|theme|style|render)/i, "creative"],
  [/(workflow|process|ops|operational|admin|automation)/i, "delivery"],
  [/(code|api|database|type|test|debug|architect|engineer|sql|frontend|backend|rust|python|php|java|golang)/i, "engineering"],
];

export function inferCategory(hint: string): SkillCategory {
  for (const [pattern, category] of CATEGORY_KEYWORDS) {
    if (pattern.test(hint)) return category;
  }
  return "general";
}

export async function syncSkills(options: SyncOptions = {}): Promise<SyncReport> {
  const manifest = loadManifest();

  if (options.discover) {
    await discoverNewSkills(manifest, options);
  }

  const skillsToSync = options.filter
    ? manifest.skills.filter((s) => s.name.toLowerCase().includes(options.filter!.toLowerCase()))
    : manifest.skills;

  const groups = groupByRepo(skillsToSync);
  const report: SyncReport = {
    timestamp: new Date().toISOString(),
    total: skillsToSync.length,
    synced: 0,
    unchanged: 0,
    added: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  console.log(
    `[SYNC] Syncing ${skillsToSync.length} skill(s) across ${groups.length} upstream repo(s)...`
  );

  const limit = Math.max(1, options.concurrency ?? 4);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, groups.length) }, async () => {
    while (cursor < groups.length) {
      const index = cursor++;
      const detail = await syncRepoGroup(groups[index], options, baseDir());
      for (const d of detail) {
        if (d.status === "synced" || d.status === "added") report.synced++;
        else if (d.status === "unchanged") report.unchanged++;
        else if (d.status === "skipped") report.skipped++;
        else if (d.status === "failed") report.failed++;
        report.details.push(d);
      }
    }
  });
  await Promise.all(workers);

  console.log(
    `\n[SYNC SUMMARY] Total: ${report.total} | Updated: ${report.synced} | Unchanged: ${report.unchanged} | Skipped: ${report.skipped} | Failed: ${report.failed}`
  );
  return report;
}

function baseDir(): string {
  const dir = join(process.cwd(), "skills");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function groupByRepo(skills: SkillEntry[]): RepoGroup[] {
  const map = new Map<string, RepoGroup>();
  for (const skill of skills) {
    if (!skill.upstream) continue;
    const upstream = skill.upstream;
    const host = upstream.host ?? "github";
    const key = `${host}:${upstream.repo}#${upstream.branch ?? "*"}`;
    let group = map.get(key);
    if (!group) {
      group = { repo: upstream.repo, host, requestedBranch: upstream.branch, skills: [] };
      map.set(key, group);
    }
    group.skills.push({ name: skill.name, sourcePath: upstream.sourcePath });
  }
  return [...map.values()];
}

async function syncRepoGroup(
  group: RepoGroup,
  options: SyncOptions,
  baseDir: string
): Promise<SyncReportDetail[]> {
  const details: SyncReportDetail[] = [];
  const attempts = Math.max(1, options.attempts ?? DEFAULT_ATTEMPTS);

  if (options.dryRun) {
    for (const skill of group.skills) {
      details.push({
        name: skill.name,
        status: "skipped",
        message: "[DRY-RUN] Upstream sync simulated",
      });
    }
    return details;
  }

  const token = options.token || process.env.GITHUB_TOKEN;
  let cloneRoot: string | null = null;
  let resolvedBranch = group.requestedBranch ?? "main";
  let sha: string | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const tmp = mkdtempSync(join(tmpdir(), "skills-sync-"));
      if (cloneRoot) rmSync(cloneRoot, { recursive: true, force: true });
      cloneRoot = tmp;

      const branchToTry = group.requestedBranch ?? (await resolveDefaultBranch(group.repo, group.host, token)) ?? "main";
      const cloneUrl =
        group.host === "git"
          ? group.repo
          : token
            ? `https://x-access-token:${token}@github.com/${group.repo}.git`
            : `https://github.com/${group.repo}.git`;

      execSync(
        `git clone --depth 1 --filter=blob:none --sparse "${cloneUrl}" "${tmp}" --branch "${branchToTry}"`,
        { stdio: "pipe", timeout: 120000 }
      );

      const uniquePaths = [...new Set(group.skills.map((s) => s.sourcePath))];
      for (const path of uniquePaths) {
        execSync(`git -C "${tmp}" sparse-checkout add "${path}"`, {
          stdio: "pipe",
          timeout: 30000,
        });
      }

      resolvedBranch = branchToTry;
      sha = execSync(`git -C "${tmp}" rev-parse HEAD`).toString().trim();
      break;
    } catch (err: any) {
      const msg = String(err.stderr ?? err.message ?? err).trim();
      if (attempt >= attempts) {
        for (const skill of group.skills) {
          details.push({
            name: skill.name,
            status: "failed",
            message: `Upstream '${group.repo}' unreachable after ${attempts} attempt(s): ${msg.slice(0, 300)}`,
          });
        }
        if (cloneRoot) {
          rmSync(cloneRoot, { recursive: true, force: true });
          cloneRoot = null;
        }
        return details;
      }
      console.warn(`[WARN] Retrying upstream '${group.repo}' after failure: ${msg.slice(0, 160)}`);
    }
  }

  if (!cloneRoot || !sha) {
    for (const skill of group.skills) {
      details.push({ name: skill.name, status: "failed", message: "Upstream clone failed" });
    }
    return details;
  }

  try {
    for (const skill of group.skills) {
      try {
        const detail = syncSingleSkill(skill, group, cloneRoot, resolvedBranch, sha, baseDir);
        details.push(detail);
      } catch (err: any) {
        details.push({
          name: skill.name,
          status: "failed",
          message: String(err.message ?? err).slice(0, 300),
        });
      }
    }
  } finally {
    rmSync(cloneRoot, { recursive: true, force: true });
  }

  return details;
}

function syncSingleSkill(
  skill: { name: string; sourcePath: string },
  group: RepoGroup,
  cloneRoot: string,
  branch: string,
  sha: string,
  baseDir: string
): SyncReportDetail {
  const sourceFull = join(cloneRoot, skill.sourcePath);
  if (!existsSync(sourceFull)) {
    throw new Error(`Source path '${skill.sourcePath}' not found in '${group.repo}'`);
  }

  const skillMd = join(sourceFull, "SKILL.md");
  if (!existsSync(skillMd)) {
    throw new Error(`No SKILL.md found at '${skill.sourcePath}' in '${group.repo}'`);
  }

  const targetFull = join(baseDir, skill.name);
  const contentEqual = directoriesEqual(sourceFull, targetFull, ".upstream-meta.json");

  if (contentEqual) {
    const existingMetaPath = join(targetFull, ".upstream-meta.json");
    const existingMeta = existsSync(existingMetaPath)
      ? (JSON.parse(readFileSync(existingMetaPath, "utf8")) as UpstreamMeta)
      : null;

    if (existingMeta?.syncedSha === sha) {
      return {
        name: skill.name,
        status: "unchanged",
        sha,
        message: `Already at ${sha.slice(0, 7)}`,
      };
    }

    writeFileSync(
      existingMetaPath,
      JSON.stringify(
        {
          upstream: group.host === "git" ? group.repo : `https://github.com/${group.repo}`,
          branch,
          sourcePath: skill.sourcePath,
          syncedSha: sha,
          syncedAt: new Date().toISOString(),
        } satisfies UpstreamMeta,
        null,
        2
      ) + "\n",
      "utf8"
    );
    return {
      name: skill.name,
      status: "unchanged",
      sha,
      message: `Content identical; provenance updated to ${sha.slice(0, 7)}`,
    };
  }

  rmSync(targetFull, { recursive: true, force: true });
  cpSync(sourceFull, targetFull, { recursive: true });

  const meta: UpstreamMeta = {
    upstream: group.host === "git" ? group.repo : `https://github.com/${group.repo}`,
    branch,
    sourcePath: skill.sourcePath,
    syncedSha: sha,
    syncedAt: new Date().toISOString(),
  };
  writeFileSync(join(targetFull, ".upstream-meta.json"), JSON.stringify(meta, null, 2) + "\n", "utf8");

  return {
    name: skill.name,
    status: "synced",
    sha,
    message: `Updated @ ${sha.slice(0, 7)}`,
  };
}

function directoriesEqual(source: string, target: string, ignoreFile?: string): boolean {
  if (!existsSync(target) || !statSync(target).isDirectory()) return false;
  const sourceFiles = listFilesRecursive(source, ignoreFile);
  const targetFiles = listFilesRecursive(target, ignoreFile);
  const targetSet = new Set(targetFiles);
  if (sourceFiles.length !== targetFiles.length) return false;

  for (const rel of sourceFiles) {
    if (!targetSet.has(rel)) return false;
    const a = readFileSync(join(source, rel));
    const b = readFileSync(join(target, rel));
    if (Buffer.compare(a, b) !== 0) return false;
  }
  return true;
}

function listFilesRecursive(root: string, ignoreFile?: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name === ignoreFile) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full.slice(root.length + 1));
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Re-scans every distinct upstream repo already referenced by the manifest and
 * registers skills that were added upstream after the last ingest. Existing
 * entries are never overwritten; collisions are reported and skipped.
 */
async function discoverNewSkills(
  manifest: ReturnType<typeof loadManifest>,
  options: SyncOptions
): Promise<void> {
  const token = options.token || process.env.GITHUB_TOKEN;

  if (options.dryRun) {
    console.log("[DISCOVER] [DRY-RUN] Discovery preview not implemented in dry-run; skipping registration.");
    return;
  }
  const seenRepos = new Map<string, { host: "github" | "git"; branch?: string }>();
  for (const skill of manifest.skills) {
    if (!skill.upstream) continue;
    const host = skill.upstream.host ?? "github";
    seenRepos.set(skill.upstream.repo, { host, branch: skill.upstream.branch });
  }

  const existingPaths = new Set(
    manifest.skills.map((s) => (s.upstream ? `${s.upstream.repo}#${s.upstream.sourcePath}` : ""))
  );
  const existingNames = new Set(manifest.skills.map((s) => s.name.toLowerCase()));

  let added = 0;
  for (const [repo, info] of seenRepos) {
    try {
      const result = await discoverSkillsInRepo(repo, {
        host: info.host,
        branch: info.branch,
        token,
      });
      for (const found of result.skills) {
        const key = `${repo}#${found.path}`;
        if (existingPaths.has(key)) continue;

        const baseName = found.declaredName || found.dirName;
        const name = uniqueName(baseName, existingNames);
        if (name !== baseName) {
          console.warn(`[DISCOVER] Name collision for '${baseName}' from ${repo}; using '${name}'.`);
        }
        existingNames.add(name.toLowerCase());
        existingPaths.add(key);

        const entry: SkillEntry = {
          name,
          category: inferCategory(`${name} ${found.description ?? ""}`),
          description: found.description || `Synced from ${repo}`,
          upstream: {
            repo,
            branch: result.branch,
            sourcePath: found.path,
            host: info.host,
          },
          autoAdded: true,
        };
        addOrUpdateSkill(manifest, entry);
        added++;
        console.log(`[DISCOVER] Registered new upstream skill '${name}' from ${repo} (${found.path})`);
      }

      if (result.truncated) {
        console.warn(`[DISCOVER] Upstream tree for '${repo}' was truncated; results may be partial.`);
      }
    } catch (err: any) {
      console.warn(`[DISCOVER] Could not scan '${repo}': ${String(err.message ?? err)}`);
    }
  }

  if (added > 0) {
    saveManifest(manifest);
    console.log(`[DISCOVER] Registered ${added} new skill(s) in manifest.`);
  } else {
    console.log(`[DISCOVER] No new upstream skills found.`);
  }
}

function uniqueName(base: string, taken: Set<string>): string {
  const sanitized = base.replace(/[^a-zA-Z0-9-_.]/g, "-").toLowerCase() || "skill";
  let candidate = sanitized;
  let i = 2;
  while (taken.has(candidate)) {
    candidate = `${sanitized}-${i++}`;
  }
  return candidate;
}
