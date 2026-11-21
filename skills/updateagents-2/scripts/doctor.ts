#!/usr/bin/env bun
/**
 * doctor.ts — portable install check that ships INSIDE the skill.
 *
 * `scripts/muse.ts doctor` needs a clone of the repository. This script is
 * installed with the skills, so any machine can answer "is my install current?"
 * with no repo and no network:
 *
 *   bun ~/.agents/skills/updateagents/scripts/doctor.ts [--json] [--fix]
 *
 * It validates the installed tree against itself: every skill present, every
 * installed mode reachable from its SKILL.md, the installed dispatch directory
 * resolving, the recorded version marker, the harness command surfaces declared
 * in `.muse/harness.json`, and the Claude/Amp skill mirror.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

interface HarnessCommands {
  format: string;
  extension: string;
  global?: string;
  project?: string;
}

interface Harness {
  id: string;
  label: string;
  status: string;
  commands: HarnessCommands | null;
  skills: string[];
}

interface Registry {
  harnesses: Harness[];
  skillRoots?: { mirrors?: string[] };
}

interface Check {
  id: string;
  ok: boolean;
  detail: string;
}

const MODE_REF = /^[a-z0-9-]+\.md$/;

function isDir(target: string): boolean {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

/** Project-scoped install wins over the global one, matching the installer. */
export function resolveSkillsRoot(home: string, workspace: string): string {
  const project = path.join(workspace, ".agents", "skills");
  return isDir(project) ? project : path.join(home, ".agents", "skills");
}

/** Every routable mode a skill ships, derived from the installed tree alone. */
function modesOf(skillDir: string): string[] {
  const refs = path.join(skillDir, "references");
  if (!isDir(refs)) return [];
  return fs
    .readdirSync(refs)
    .filter((file) => MODE_REF.test(file))
    .map((file) => file.replace(/\.md$/, ""))
    .sort();
}

function readRegistry(skillsRoot: string): Registry | null {
  for (const candidate of [path.join(skillsRoot, ".muse", "harness.json"), path.join(skillsRoot, "harness.json")]) {
    if (!fs.existsSync(candidate)) continue;
    try {
      return JSON.parse(fs.readFileSync(candidate, "utf8")) as Registry;
    } catch {
      return null;
    }
  }
  return null;
}

function expand(template: string, home: string, workspace: string): string {
  const expanded = template.replace(/^~/, home).replace(/^<project>/, workspace);
  return path.isAbsolute(expanded) ? expanded : path.join(workspace, expanded);
}

export function runPortableDoctor(options: { home?: string; workspace?: string; fix?: boolean } = {}): {
  ok: boolean;
  skillsRoot: string;
  version: string | null;
  skills: number;
  modes: number;
  checks: Check[];
} {
  const home = options.home ?? process.env.HOME ?? os.homedir();
  const workspace = options.workspace ?? process.cwd();
  const skillsRoot = resolveSkillsRoot(home, workspace);
  const checks: Check[] = [];

  // A skill directory is one that contains SKILL.md.
  const skills = isDir(skillsRoot)
    ? fs
        .readdirSync(skillsRoot)
        .filter((entry) => fs.existsSync(path.join(skillsRoot, entry, "SKILL.md")))
        .sort()
    : [];
  checks.push({
    id: "skills-installed",
    ok: skills.length > 0,
    detail: skills.length > 0 ? `${skills.length} skills in ${skillsRoot}` : `no skills found in ${skillsRoot}`,
  });

  const marker = path.join(skillsRoot, ".muse-version");
  const version = fs.existsSync(marker) ? fs.readFileSync(marker, "utf8").trim() || null : null;
  checks.push({
    id: "version-marker",
    ok: version !== null,
    detail: version ? `installed ${version}` : `no .muse-version (reinstall to stamp it)`,
  });

  let modes = 0;
  const unresolved: string[] = [];
  for (const skill of skills) {
    for (const mode of modesOf(path.join(skillsRoot, skill))) {
      modes += 1;
      if (!fs.existsSync(path.join(skillsRoot, skill, "references", `${mode}.md`))) unresolved.push(`${skill}:${mode}`);
    }
  }
  checks.push({
    id: "modes-resolve",
    ok: modes > 0 && unresolved.length === 0,
    detail:
      modes === 0
        ? "no routable modes found — the install looks incomplete"
        : unresolved.length === 0
          ? `${modes} modes across ${skills.length} skills`
          : `${unresolved.length} mode(s) missing references`,
  });

  // Installed dispatch must describe the installed tree, not a different release.
  const dispatchPath = path.join(skillsRoot, "secretary", "references", "dispatch.md");
  if (fs.existsSync(dispatchPath)) {
    const text = fs.readFileSync(dispatchPath, "utf8");
    const start = text.indexOf("<!-- agency-directory:start -->");
    const end = text.indexOf("<!-- agency-directory:end -->");
    const missing: string[] = [];
    let advertised = 0;
    if (start !== -1 && end > start) {
      for (const line of text.slice(start, end).split("\n")) {
        const skill = line.match(/^\|\s*\*\*`([a-z0-9-]+)`\*\*\s*\|/)?.[1];
        if (!skill) continue;
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
        for (const match of (cells[1] ?? "").matchAll(/`([a-z0-9-]+)`/g)) {
          advertised += 1;
          if (!fs.existsSync(path.join(skillsRoot, skill, "references", `${match[1]}.md`))) {
            missing.push(`${skill}:${match[1]}`);
          }
        }
      }
    }
    checks.push({
      id: "dispatch-resolves",
      ok: advertised > 0 && missing.length === 0,
      detail:
        missing.length === 0
          ? `${advertised} advertised modes resolve`
          : `${missing.length} advertised mode(s) missing: ${missing.slice(0, 4).join(", ")}`,
    });
  } else {
    checks.push({ id: "dispatch-resolves", ok: false, detail: "secretary/references/dispatch.md is not installed" });
  }

  // Harness command surfaces, from the registry shipped with the install.
  const registry = readRegistry(skillsRoot);
  let missingCommands = 0;
  let checkedDestinations = 0;
  if (!registry) {
    checks.push({
      id: "harness-surfaces",
      ok: false,
      detail: "no .muse/harness.json — reinstall so doctor knows the destinations",
    });
  } else {
    const detail: string[] = [];
    for (const harness of registry.harnesses) {
      if (!harness.commands) continue;
      for (const scope of ["global", "project"] as const) {
        const template = scope === "global" ? harness.commands.global : harness.commands.project;
        if (!template) continue;
        const dir = expand(template, home, workspace);
        if (!isDir(path.dirname(dir))) continue; // harness not installed on this machine
        checkedDestinations += 1;
        const present = isDir(dir) ? new Set(fs.readdirSync(dir)) : new Set<string>();
        const missing = skills.filter((skill) => !present.has(`${skill}${harness.commands?.extension}`));
        missingCommands += missing.length;
        for (const skill of skills) {
          for (const mode of modesOf(path.join(skillsRoot, skill))) {
            if (!present.has(`${skill}-${mode}${harness.commands?.extension}`)) missingCommands += 1;
          }
        }
        if (missing.length > 0) detail.push(`${harness.id} (${scope}): ${missing.length} skill command(s) missing`);
      }
    }
    checks.push({
      id: "harness-surfaces",
      ok: missingCommands === 0,
      detail:
        checkedDestinations === 0
          ? "no harness command directory detected"
          : missingCommands === 0
            ? `${checkedDestinations} destination(s) complete`
            : `${detail.slice(0, 3).join("; ")} (${missingCommands} missing file(s))`,
    });
  }

  // Claude Code reads its own root; keep the mirror resolvable.
  for (const mirrorTemplate of registry?.skillRoots?.mirrors ?? []) {
    if (!mirrorTemplate.includes(".claude")) continue;
    const mirror = expand(mirrorTemplate, home, workspace);
    if (!isDir(path.dirname(mirror))) continue;
    let repaired = 0;
    if (options.fix && isDir(skillsRoot)) {
      fs.mkdirSync(mirror, { recursive: true });
      for (const skill of skills) {
        const dest = path.join(mirror, skill);
        if (fs.existsSync(dest)) continue;
        try {
          fs.symlinkSync(path.join(skillsRoot, skill), dest, "dir");
          repaired += 1;
        } catch {
          // copy where symlinks are unavailable
          try {
            fs.cpSync(path.join(skillsRoot, skill), dest, { recursive: true });
            repaired += 1;
          } catch {
            // reported below
          }
        }
      }
    }
    const missing = skills.filter((skill) => !fs.existsSync(path.join(mirror, skill, "SKILL.md")));
    checks.push({
      id: "skill-mirror",
      ok: missing.length === 0,
      detail:
        missing.length === 0
          ? `${mirror} carries all ${skills.length} skills`
          : `${missing.length} skill(s) missing from ${mirror}${repaired > 0 ? ` (linked ${repaired})` : " — run --fix"}`,
    });
  }

  // Repository safety net: the branch guard lives in .git/hooks, which no
  // installer can reach for you, so a fresh clone silently loses it.
  const gitHooks = path.join(workspace, ".git", "hooks");
  if (isDir(path.join(workspace, ".git")) && isDir(gitHooks)) {
    const preCommitPath = path.join(gitHooks, "pre-commit");
    const preCommit = fs.existsSync(preCommitPath) ? fs.readFileSync(preCommitPath, "utf8") : "";
    let guarded = preCommit.includes("branch-guard-pre-commit.sh");
    let note = "";
    // --fix runs the repository's own installer, when this workspace has one.
    // An installed device has no scripts/ tree, so the message stays the fix there.
    const installer = path.join(workspace, "scripts", "hooks", "install-hooks.sh");
    if (!guarded && options.fix && fs.existsSync(installer)) {
      const result = Bun.spawnSync(["bash", installer], { cwd: workspace, stdout: "pipe", stderr: "pipe" });
      const after = fs.existsSync(preCommitPath) ? fs.readFileSync(preCommitPath, "utf8") : "";
      guarded = after.includes("branch-guard-pre-commit.sh");
      note = result.success && guarded ? " (installed by --fix)" : " (installer did not add the guard)";
    }
    checks.push({
      id: "branch-guard",
      ok: guarded,
      detail: guarded
        ? `pre-commit refuses ordinary commits on integration branches${note}`
        : "not installed — run `bash scripts/hooks/install-hooks.sh`",
    });
  }

  return {
    ok: checks.every((check) => check.ok || ADVISORY.has(check.id)),
    skillsRoot,
    version,
    skills: skills.length,
    modes,
    checks,
  };
}

/** Checks that inform but do not fail the report. */
const ADVISORY = new Set(["version-marker", "branch-guard"]);

function main(): void {
  const args = Bun.argv.slice(2);
  const json = args.includes("--json");
  const report = runPortableDoctor({ fix: args.includes("--fix") });
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🩺 muse doctor (portable) — ${report.skillsRoot}`);
    console.log(`   ${report.skills} skills · ${report.modes} modes · ${report.version ?? "unversioned"}\n`);
    for (const check of report.checks) {
      const icon = check.ok ? "✅" : ADVISORY.has(check.id) ? "⚠️ " : "❌";
      console.log(`   ${icon} ${check.id.padEnd(18)} ${check.detail}`);
    }
    console.log(
      report.ok
        ? "\n✅ This device is consistent."
        : "\n❌ This device needs attention (try --fix, or re-run the installer).",
    );
  }
  process.exit(report.ok ? 0 : 1);
}

if (import.meta.main) main();
