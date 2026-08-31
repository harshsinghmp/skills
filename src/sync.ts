import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { loadManifest } from "./manifest.ts";
import type { SkillEntry, SyncOptions, SyncReport, UpstreamMeta } from "./types.ts";

export async function syncSkills(options: SyncOptions = {}): Promise<SyncReport> {
  const manifest = loadManifest();
  const baseDir = join(process.cwd(), "skills");
  const tmpDir = join(process.cwd(), ".tmp-skills-sync");

  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  mkdirSync(tmpDir, { recursive: true });

  const report: SyncReport = {
    timestamp: new Date().toISOString(),
    total: manifest.skills.length,
    synced: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  const skillsToSync = options.filter
    ? manifest.skills.filter((s) => s.name.toLowerCase().includes(options.filter!.toLowerCase()))
    : manifest.skills;

  console.log(`[SYNC] Starting synchronization of ${skillsToSync.length} skill(s)...`);

  for (const skill of skillsToSync) {
    if (!skill.upstream) {
      report.skipped++;
      report.details.push({
        name: skill.name,
        status: "skipped",
        message: "No upstream configuration provided (native/curated skill)",
      });
      continue;
    }

    const { repo, branch = "main", sourcePath } = skill.upstream;
    console.log(`-> Syncing '${skill.name}' from https://github.com/${repo} (${branch}) [${sourcePath}]...`);

    if (options.dryRun) {
      report.synced++;
      report.details.push({
        name: skill.name,
        status: "synced",
        message: "[DRY-RUN] Upstream check simulated successfully",
      });
      continue;
    }

    try {
      const cloneTarget = join(tmpDir, `${skill.name}-${Date.now()}`);

      // Perform shallow sparse checkout for high performance
      const token = options.token || process.env.GITHUB_TOKEN;
      const cloneUrl = token
        ? `https://x-access-token:${token}@github.com/${repo}.git`
        : `https://github.com/${repo}.git`;

      execSync(
        `git clone --depth 1 --filter=blob:none --sparse "${cloneUrl}" "${cloneTarget}" --branch "${branch}"`,
        { stdio: "pipe", timeout: 45000 }
      );

      execSync(`git -C "${cloneTarget}" sparse-checkout set "${sourcePath}"`, {
        stdio: "pipe",
        timeout: 15000,
      });

      const sourceFull = join(cloneTarget, sourcePath);
      const targetFull = join(baseDir, skill.name);

      if (!existsSync(sourceFull)) {
        throw new Error(`Source path '${sourcePath}' not found in repo '${repo}'`);
      }

      // Check if SKILL.md exists in source
      const skillMd = join(sourceFull, "SKILL.md");
      if (!existsSync(skillMd)) {
        throw new Error(`No SKILL.md found at '${sourcePath}' in '${repo}'`);
      }

      // Clean existing target and copy fresh content
      if (existsSync(targetFull)) {
        rmSync(targetFull, { recursive: true, force: true });
      }
      mkdirSync(targetFull, { recursive: true });
      execSync(`cp -r "${sourceFull}/." "${targetFull}/"`);

      // Write provenance metadata
      const commitSha = execSync(`git -C "${cloneTarget}" rev-parse HEAD`)
        .toString()
        .trim();

      const meta: UpstreamMeta = {
        upstream: `https://github.com/${repo}`,
        branch,
        sourcePath,
        syncedSha: commitSha,
        syncedAt: new Date().toISOString(),
      };

      writeFileSync(
        join(targetFull, ".upstream-meta.json"),
        JSON.stringify(meta, null, 2) + "\n",
        "utf8"
      );

      report.synced++;
      report.details.push({
        name: skill.name,
        status: "synced",
        sha: commitSha,
        message: `Synced @ ${commitSha.slice(0, 7)}`,
      });

      console.log(`   ✓ Synced ${skill.name} (commit ${commitSha.slice(0, 7)})`);
    } catch (err: any) {
      report.failed++;
      const msg = err.stderr ? err.stderr.toString() : err.message;
      report.details.push({
        name: skill.name,
        status: "failed",
        message: msg,
      });
      console.error(`   ✗ Failed to sync ${skill.name}: ${msg}`);
    }
  }

  // Cleanup temporary checkout directory
  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`\n[SYNC SUMMARY] Total: ${report.total} | Synced: ${report.synced} | Skipped: ${report.skipped} | Failed: ${report.failed}`);
  return report;
}
