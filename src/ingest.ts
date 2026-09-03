import { readFileSync } from "node:fs";
import { join } from "node:path";
import { discoverSkillsInRepo } from "./discover.ts";
import { loadManifest, saveManifest } from "./manifest.ts";
import { resolveSource } from "./resolve.ts";
import { inferCategory, syncSkills } from "./sync.ts";
import type {
  IngestOptions,
  IngestReport,
  ResolvedSource,
  SkillEntry,
  SkillsManifest,
} from "./types.ts";

/**
 * Registers skills from upstream links into the manifest.
 *
 * Accepts:
 *  - GitHub repo URLs (or `owner/repo`)          → discovers and registers every skill in the repo
 *  - GitHub tree/blob URLs (`owner/repo/path`)   → registers a single skill
 *  - Any other git host URL                      → cloned and scanned via git
 */
export async function ingestFromUrls(
  urls: string[],
  options: IngestOptions = {}
): Promise<IngestReport> {
  const manifest = loadManifest();
  const report: IngestReport = { registered: 0, skipped: 0, errors: [], entries: [] };

  for (const url of urls) {
    try {
      const source = resolveSource(url);
      if (source.wholeRepo) {
        await registerWholeRepo(source, manifest, report, options);
      } else {
        registerSingleSkill(source, manifest, report, options);
      }
    } catch (err: any) {
      const msg = String(err.message ?? err);
      report.errors.push(`${url}: ${msg}`);
      console.error(`[INGEST] ✗ ${url}: ${msg}`);
    }
  }

  if (report.registered > 0 && !options.dryRun) {
    saveManifest(manifest);
    console.log(`[INGEST] Registered ${report.registered} skill(s) into skills.manifest.json.`);
  } else if (report.registered === 0 && report.errors.length === 0) {
    console.log(`[INGEST] Nothing new to register.`);
  }

  if (!options.dryRun && (options.sync ?? true) && report.registered > 0) {
    console.log(`[INGEST] Syncing newly registered skill(s)...`);
    const report_ = await syncSkills({ token: options.token });
    enrichDescriptions(manifest);
    saveManifest(manifest);
    if (report_.failed > 0) {
      report.errors.push(`Sync completed with ${report_.failed} failure(s); run 'bun run sync' to retry.`);
    }
  }

  return report;
}

async function registerWholeRepo(
  source: ResolvedSource,
  manifest: SkillsManifest,
  report: IngestReport,
  options: IngestOptions
): Promise<void> {
  console.log(`[INGEST] Scanning '${source.repo}' for skills...`);
  const discovery = await discoverSkillsInRepo(source.repo, {
    host: source.host,
    branch: source.branch,
    token: options.token,
  });

  const existingPaths = new Set(
    manifest.skills.map((s) => (s.upstream ? `${s.upstream.repo}#${s.upstream.sourcePath}` : ""))
  );
  const existingNames = new Set(manifest.skills.map((s) => s.name.toLowerCase()));

  for (const found of discovery.skills) {
    const pathKey = `${source.repo}#${found.path}`;
    if (existingPaths.has(pathKey)) {
      report.skipped++;
      continue;
    }

    const baseName = found.declaredName || found.dirName;
    const name = uniqueName(baseName, existingNames);
    if (name !== baseName) {
      console.warn(`[INGEST] Name collision for '${baseName}'; registering as '${name}'.`);
    }
    existingNames.add(name.toLowerCase());
    existingPaths.add(pathKey);

    const entry: SkillEntry = {
      name,
      category: options.category ?? inferCategory(`${name} ${found.description ?? ""}`),
      description: found.description || `Skill synced from ${source.repo}`,
      upstream: {
        repo: source.repo,
        branch: discovery.branch,
        sourcePath: found.path,
        host: source.host,
      },
      autoAdded: true,
    };
    manifest.skills.push(entry);
    report.entries.push({
      name,
      source: pathKey,
      description: entry.description,
    });
    console.log(`[INGEST] + '${name}' from ${source.repo} (${found.path})`);
    report.registered++;
  }

  if (discovery.truncated) {
    console.warn(
      `[INGEST] Upstream tree for '${source.repo}' was truncated; run again with more visibility later.`
    );
  }
}

function registerSingleSkill(
  source: ResolvedSource,
  manifest: SkillsManifest,
  report: IngestReport,
  options: IngestOptions
): void {
  const path = source.sourcePath!;
  const pathKey = `${source.repo}#${path}`;
  const existingPaths = new Set(
    manifest.skills.map((s) => (s.upstream ? `${s.upstream.repo}#${s.upstream.sourcePath}` : ""))
  );
  if (existingPaths.has(pathKey)) {
    console.warn(`[INGEST] = '${path}' from ${source.repo} is already registered; skipping.`);
    report.skipped++;
    return;
  }

  const name = path.split("/").pop() ?? "skill";
  const existingNames = new Set(manifest.skills.map((s) => s.name.toLowerCase()));
  if (existingNames.has(name.toLowerCase())) {
    const msg = `A skill named '${name}' already exists; refusing to overwrite it.`;
    report.errors.push(`${source.repo}: ${msg}`);
    console.error(`[INGEST] ✗ ${msg}`);
    report.skipped++;
    return;
  }

  const entry: SkillEntry = {
    name,
    category: options.category ?? inferCategory(name),
    description: `Skill synced from ${source.repo} (${path})`,
    upstream: {
      repo: source.repo,
      branch: source.branch,
      sourcePath: path,
      host: source.host,
    },
    autoAdded: true,
  };
  manifest.skills.push(entry);
  report.entries.push({ name, source: pathKey, description: entry.description });
  report.registered++;
  console.log(`[INGEST] + '${name}' from ${source.repo} (${path})`);
}

/** Fills in descriptions from the local SKILL.md files after the first sync. */
function enrichDescriptions(manifest: SkillsManifest): void {
  for (const skill of manifest.skills) {
    if (!skill.upstream || !skill.description.startsWith("Skill synced from")) continue;
    const file = join(process.cwd(), "skills", skill.name, "SKILL.md");
    try {
      const content = readFileSync(file, "utf8");
      const fm = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1];
      if (!fm) continue;
      const multiline = fm.match(/^description:\s*(?:[>|]-?)\s*\r?\n((?:[ \t]+.+\r?\n?)+)/m);
      const description = multiline
        ? multiline[1].replace(/^[ \t]+/gm, "").replace(/\r?\n/g, " ").trim()
        : fm.match(/^description:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
      if (description) {
        skill.description = description;
      }
    } catch {
      // file not yet synced; description stays as placeholder
    }
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
