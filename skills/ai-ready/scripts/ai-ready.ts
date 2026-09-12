#!/usr/bin/env bun
/**
 * 🤖 ai-ready — Repository AI-Readiness Auditor & Agent Engine Scaffolder
 * 
 * Capabilities:
 *   --audit     (default) Audits 13 tracked assets with sub-100ms Stage-0 Fast-Skip gate.
 *   --scaffold  Directly provisions the complete Agent Engine DOX container from templates.
 *   --fail-under N  Exit 1 when the audit score falls below N (CI gate).
 * 
 * Rules:
 *   - Sub-100ms Fast-Skip on fully compliant repositories (zero token burn).
 *   - HARD BOUNDARY: Never read, write, modify, or validate .memory/**.
 *   - Single Source of Truth: Scaffolds from ai-ready/templates/.
 * 
 * Usage:
 *   bun ai-ready/scripts/ai-ready.ts [targetPath] [options]
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, cpSync } from "node:fs";
import { resolve, join, basename, relative } from "node:path";
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";

const SCRIPT_DIR = resolve(import.meta.dir, "..");
const TEMPLATES_DIR = join(SCRIPT_DIR, "templates");

/** Lean DOX router line limit (single source of truth: SKILL.md & twelve-asset-matrix.md). */
const AGENTS_MD_MAX_LINES = 50;

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    audit: { type: "boolean", default: false },
    scaffold: { type: "boolean", short: "s", default: false },
    sanitize: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "fail-under": { type: "string", default: "" },
    json: { type: "boolean", default: false },
    force: { type: "boolean", short: "f", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🤖 ai-ready — Repository AI-Readiness Auditor & Agent Engine Scaffolder

Usage:
  bun ai-ready.ts [targetPath] [options]

Options:
  --audit          Audit 13 tracked assets, modern tools & synthetic artifacts (default)
  -s, --scaffold   Scaffold missing Agent Engine assets (DOX container, AGENTS.md, .github templates, .env.example)
  --fail-under N   Exit 1 when the audit score falls below N (CI gate)
  --sanitize       Scan and unwrap synthetic ADE/IDE artifacts (ORCA_RICH_MD, Cursor, etc.)
  --dry-run        Simulate without writing files to disk
  --json           Output audit results in JSON format
  -f, --force      Force overwrite during scaffolding
  -h, --help       Show this help message
`);
  process.exit(0);
}

const isDryRun = values["dry-run"] || false;
const isForce = values.force || false;
const isScaffold = values.scaffold || false;
const isSanitize = values.sanitize || false;

export function unwrapSyntheticArtifacts(content: string): { cleaned: string; unwrappedCount: number } {
  let unwrappedCount = 0;
  // Match ORCA_RICH_MD pattern: [[ORCA_RICH_MD:<hash>:<type>:<urlencoded-payload>]]
  const orcaRegex = /\[\[ORCA_RICH_MD:[a-f0-9]+:[a-z-]+:([^\]]+)\]\]/gi;
  let cleaned = content.replace(orcaRegex, (_match, payload) => {
    unwrappedCount++;
    try {
      return decodeURIComponent(payload);
    } catch {
      return payload;
    }
  });

  // Also strip proprietary editor wrappers that overtake content
  const genericADE = /\[\[(?:ADE|CURSOR|WINDSURF|ARTIFACT):[a-f0-9]+:[a-z-]+:([^\]]+)\]\]/gi;
  cleaned = cleaned.replace(genericADE, (_match, payload) => {
    unwrappedCount++;
    try {
      return decodeURIComponent(payload);
    } catch {
      return payload;
    }
  });

  return { cleaned, unwrappedCount };
}

export function scanForSyntheticArtifacts(target: string): { file: string; count: number }[] {
  const contaminated: { file: string; count: number }[] = [];
  const orcaPattern = /\[\[ORCA_RICH_MD:[a-f0-9]+:[a-z-]+:[^\]]+\]\]|<antArtifact|\[cursor:|<<<windsurf/i;

  if (!existsSync(target)) return contaminated;

  try {
    const st = statSync(target);
    if (st.isFile()) {
      try {
        const text = readFileSync(target, "utf8");
        if (orcaPattern.test(text)) {
          const matches = (text.match(/\[\[ORCA_RICH_MD:[a-f0-9]+:[a-z-]+:[^\]]+\]\]/gi) || []).length;
          contaminated.push({ file: basename(target), count: matches || 1 });
        }
      } catch {}
      return contaminated;
    }
  } catch {
    return contaminated;
  }

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist" || entry.name === ".worktrees" || entry.name === ".memory") continue;
          walk(fullPath);
        } else if (entry.isFile() && /\.(md|markdown|txt|json|yaml|yml|ts|js|tsx|jsx|sh)$/i.test(entry.name)) {
          try {
            const text = readFileSync(fullPath, "utf8");
            if (orcaPattern.test(text)) {
              const matches = (text.match(/\[\[ORCA_RICH_MD:[a-f0-9]+:[a-z-]+:[^\]]+\]\]/gi) || []).length;
              contaminated.push({ file: relative(target, fullPath), count: matches || 1 });
            }
          } catch {}
        }
      }
    } catch {}
  }

  walk(target);
  return contaminated;
}

export function checkModernToolsAvailability(): { installed: string[]; missing: string[] } {
  const coreTools = ["fd", "rg", "bat", "eza", "sd", "choose", "procs", "zoxide", "delta", "btop", "ncdu", "gojq", "zstd"];
  const installed: string[] = [];
  const missing: string[] = [];

  for (const tool of coreTools) {
    const res = spawnSync("which", [tool], { encoding: "utf8" });
    if (res.status === 0) {
      installed.push(tool);
    } else {
      missing.push(tool);
    }
  }

  return { installed, missing };
}


const rawTarget = positionals[0] || ".";
const workspaceDir = resolve(process.cwd(), rawTarget);

function assertNotMemory(pathToCheck: string) {
  const rel = relative(workspaceDir, pathToCheck);
  if (rel === ".memory" || rel.startsWith(".memory/") || rel.startsWith(".memory\\")) {
    throw new Error(`🛑 HARD BOUNDARY VIOLATION: ai-ready must NEVER touch .memory/** (${pathToCheck})`);
  }
}

interface AssetCheck {
  id: number;
  name: string;
  category: "AI Context" | "Dev Workflow" | "Onboarding & Governance";
  passed: boolean;
  path: string;
  details: string;
}

export function auditWorkspace(target: string): AssetCheck[] {
  const gitignorePath = join(target, ".gitignore");
  let gitignoreHasEnv = false;
  if (existsSync(gitignorePath)) {
    try {
      const gitignoreContent = readFileSync(gitignorePath, "utf8");
      gitignoreHasEnv = /^\.e[n]v|\.env/m.test(gitignoreContent);
    } catch {}
  }

  const agentsMdPath = join(target, "AGENTS.md");
  let agentsMdOk = false;
  if (existsSync(agentsMdPath)) {
    const lines = readFileSync(agentsMdPath, "utf8").split("\n").length;
    agentsMdOk = lines <= AGENTS_MD_MAX_LINES; // Lean DOX router (<50 lines)
  }

  // Asset 3: accept the breadth of modern agent tool configs, not just Gemini-era paths.
  const toolConfigOk =
    existsSync(join(target, ".mcp.json")) ||
    existsSync(join(target, ".gemini")) ||
    existsSync(join(target, ".claude")) ||
    existsSync(join(target, ".cursor"));
  const toolConfigDetail = toolConfigOk ? "Authorized agent tool configuration detected" : "Missing agent tool configuration";

  // Asset 12: .gitignore guard AND .env.example template (per twelve-asset-matrix.md).
  const envExampleOk = existsSync(join(target, ".env.example"));

  // Asset 13: working-artifacts container with its contract stub (artifacts rule).
  const artifactsOk =
    existsSync(join(target, ".agents/artifacts")) &&
    existsSync(join(target, ".agents/artifacts/README.md"));

  const checks: AssetCheck[] = [
    {
      id: 1,
      name: "Root Agent Router",
      category: "AI Context",
      path: "AGENTS.md",
      passed: existsSync(agentsMdPath) && agentsMdOk,
      details: existsSync(agentsMdPath) ? `Exists (<${AGENTS_MD_MAX_LINES + 1} lines DOX router)` : `Missing or exceeds ${AGENTS_MD_MAX_LINES} lines`,
    },
    {
      id: 2,
      name: "DOX Hierarchy Tree",
      category: "AI Context",
      path: ".agents/",
      passed: existsSync(join(target, ".agents/standards")) && existsSync(join(target, ".agents/context")),
      details: "Standards and context containers verified",
    },
    {
      id: 3,
      name: "Tool / MCP Config",
      category: "AI Context",
      path: ".mcp.json or agent config",
      passed: toolConfigOk,
      details: toolConfigDetail,
    },
    {
      id: 4,
      name: "AI Discovery Manifest",
      category: "AI Context",
      path: "llms.txt",
      passed: existsSync(join(target, "llms.txt")),
      details: "LLM index manifest present",
    },
    {
      id: 5,
      name: "CI Verification Pipeline",
      category: "Dev Workflow",
      path: ".github/workflows",
      passed: existsSync(join(target, ".github/workflows")),
      details: "Automated test & build workflow",
    },
    {
      id: 6,
      name: "Issue Templates",
      category: "Dev Workflow",
      path: ".github/ISSUE_TEMPLATE",
      passed: existsSync(join(target, ".github/ISSUE_TEMPLATE")),
      details: "Structured issue forms",
    },
    {
      id: 7,
      name: "PR Review Template",
      category: "Dev Workflow",
      path: ".github/pull_request_template.md",
      passed: existsSync(join(target, ".github/pull_request_template.md")) || existsSync(join(target, ".github/PULL_REQUEST_TEMPLATE.md")),
      details: "Anti-slop PR verification checklist",
    },
    {
      id: 8,
      name: "Dependency Automation",
      category: "Dev Workflow",
      path: ".github/dependabot.yml",
      passed: existsSync(join(target, ".github/dependabot.yml")),
      details: "Dependabot configuration present",
    },
    {
      id: 9,
      name: "Changelog",
      category: "Onboarding & Governance",
      path: "CHANGELOG.md or docs/CHANGELOG.md",
      passed: existsSync(join(target, "CHANGELOG.md")) || existsSync(join(target, "docs/CHANGELOG.md")),
      details: "Keep a Changelog standard",
    },
    {
      id: 10,
      name: "Contributing Protocol",
      category: "Onboarding & Governance",
      path: "CONTRIBUTING.md",
      passed: existsSync(join(target, "CONTRIBUTING.md")),
      details: "Conventional Commits protocol",
    },
    {
      id: 11,
      name: "Durable Documentation",
      category: "Onboarding & Governance",
      path: "docs/ or .agents/context/",
      passed: existsSync(join(target, "docs")) || existsSync(join(target, ".agents/context")),
      details: "Domain knowledge repository",
    },
    {
      id: 12,
      name: "Secret Hygiene & Guards",
      category: "Onboarding & Governance",
      path: ".gitignore + .env.example",
      passed: existsSync(gitignorePath) && gitignoreHasEnv && envExampleOk,
      details: envExampleOk
        ? ".gitignore blocks environment secret files; .env.example present"
        : ".gitignore guard OK, but .env.example missing",
    },
    {
      id: 13,
      name: "Working Artifacts Container",
      category: "Onboarding & Governance",
      path: ".agents/artifacts",
      passed: artifactsOk,
      details: artifactsOk
        ? "Artifacts container with contract stub present (research/planning stay out of the repo tree)"
        : "Missing .agents/artifacts/ or its README.md contract stub",
    },
  ];

  return checks;
}

export function scaffoldAgentEngine(target: string, options: { dryRun?: boolean; force?: boolean } = {}): { created: string[]; skipped: string[] } {
  const created: string[] = [];
  const skipped: string[] = [];
  const dry = options.dryRun || false;
  const force = options.force || false;

  if (!existsSync(TEMPLATES_DIR)) {
    throw new Error(`❌ Templates bundle not found at: ${TEMPLATES_DIR}`);
  }

  // 1. Provision 9-folder .agents/ tree
  const agentsDir = join(target, ".agents");
  const subdirs = [
    "archive",
    "artifacts",
    "brand",
    "brand/tokens",
    "brand/screenshots",
    "context",
    "goals",
    "research",
    "skills",
    "standards",
    "workflows",
  ];

  for (const sub of subdirs) {
    const p = join(agentsDir, sub);
    assertNotMemory(p);
    if (!existsSync(p) && !dry) {
      mkdirSync(p, { recursive: true });
      created.push(`.agents/${sub}/`);
    }
  }

  // 2. Copy standards
  const masterStandards = join(TEMPLATES_DIR, ".agents/standards");
  if (existsSync(masterStandards)) {
    const destStandards = join(agentsDir, "standards");
    if (!existsSync(destStandards) && !dry) mkdirSync(destStandards, { recursive: true });
    for (const std of readdirSync(masterStandards)) {
      const src = join(masterStandards, std);
      const dest = join(destStandards, std);
      assertNotMemory(dest);
      if (!existsSync(dest) || force) {
        if (!dry) cpSync(src, dest);
        created.push(`.agents/standards/${std}`);
      } else {
        skipped.push(`.agents/standards/${std}`);
      }
    }
  }

  // 3. Copy brand tokens & guidelines
  const masterBrand = join(TEMPLATES_DIR, ".agents/brand");
  if (existsSync(masterBrand)) {
    const destBrand = join(agentsDir, "brand");
    if (!existsSync(destBrand) && !dry) mkdirSync(destBrand, { recursive: true });
    for (const item of readdirSync(masterBrand)) {
      if (item === "tokens" || item === "screenshots") continue;
      const src = join(masterBrand, item);
      const dest = join(destBrand, item);
      assertNotMemory(dest);
      if (!existsSync(dest) || force) {
        if (!dry) cpSync(src, dest);
        created.push(`.agents/brand/${item}`);
      }
    }
    const masterTokens = join(masterBrand, "tokens");
    const destTokens = join(destBrand, "tokens");
    if (existsSync(masterTokens) && (!existsSync(destTokens) || force)) {
      if (!dry) cpSync(masterTokens, destTokens, { recursive: true });
      created.push(`.agents/brand/tokens/`);
    }
  }

  // 4. Copy context templates if missing
  const masterContext = join(TEMPLATES_DIR, ".agents/context");
  if (existsSync(masterContext)) {
    const destContext = join(agentsDir, "context");
    if (!existsSync(destContext) && !dry) mkdirSync(destContext, { recursive: true });
    for (const ctx of readdirSync(masterContext)) {
      const src = join(masterContext, ctx);
      const dest = join(destContext, ctx);
      assertNotMemory(dest);
      if (!existsSync(dest)) {
        if (!dry) cpSync(src, dest);
        created.push(`.agents/context/${ctx}`);
      } else {
        skipped.push(`.agents/context/${ctx}`);
      }
    }
  }

  // 5. Deploy lean root AGENTS.md router
  const rootAgents = join(target, "AGENTS.md");
  assertNotMemory(rootAgents);
  const srcAgents = join(TEMPLATES_DIR, "AGENTS.md");
  if (!existsSync(rootAgents) || force) {
    if (!dry && existsSync(srcAgents)) cpSync(srcAgents, rootAgents);
    created.push("AGENTS.md");
  } else {
    skipped.push("AGENTS.md");
  }

  // 5b. Deploy .mcp.json tool config if missing (asset 3)
  const srcMcp = join(TEMPLATES_DIR, "mcp.json.template");
  const destMcp = join(target, ".mcp.json");
  if (!existsSync(destMcp) && existsSync(srcMcp)) {
    if (!dry) cpSync(srcMcp, destMcp);
    created.push(".mcp.json");
  }

  // 5c. Deploy llms.txt skeleton if missing (asset 4)
  const srcLlms = join(TEMPLATES_DIR, "llms.txt");
  const destLlms = join(target, "llms.txt");
  if (!existsSync(destLlms) && existsSync(srcLlms)) {
    if (!dry) cpSync(srcLlms, destLlms);
    created.push("llms.txt");
  }

  // 6. Deploy .gitignore.template if .gitignore missing
  const gitignore = join(target, ".gitignore");
  const srcGitignore = join(TEMPLATES_DIR, "gitignore.template");
  if (!existsSync(gitignore) && existsSync(srcGitignore)) {
    if (!dry) cpSync(srcGitignore, gitignore);
    created.push(".gitignore");
  }

  // 7. Deploy GitHub workflow & template bundle if missing (assets 6, 7, 8)
  const githubTemplates = join(TEMPLATES_DIR, "github");
  if (existsSync(githubTemplates)) {
    for (const item of readdirSync(githubTemplates)) {
      const src = join(githubTemplates, item);
      const dest = join(target, ".github", item);
      if (!existsSync(dest)) {
        if (!dry) {
          mkdirSync(join(target, ".github"), { recursive: true });
          cpSync(src, dest, { recursive: true });
        }
        created.push(`.github/${item}`);
      } else {
        skipped.push(`.github/${item}`);
      }
    }
  }

  // 8. Deploy .env.example if missing (asset 12)
  const srcEnvExample = join(TEMPLATES_DIR, "env.example");
  const destEnvExample = join(target, ".env.example");
  if (!existsSync(destEnvExample) && existsSync(srcEnvExample)) {
    if (!dry) cpSync(srcEnvExample, destEnvExample);
    created.push(".env.example");
  }

  // 9. Deploy artifacts contract stub if missing (asset 13 — artifacts rule)
  const srcArtifactsStub = join(TEMPLATES_DIR, ".agents/artifacts/README.md");
  const destArtifactsStub = join(target, ".agents/artifacts/README.md");
  if (!existsSync(destArtifactsStub) && existsSync(srcArtifactsStub)) {
    if (!dry) {
      mkdirSync(join(target, ".agents/artifacts"), { recursive: true });
      cpSync(srcArtifactsStub, destArtifactsStub);
    }
    created.push(".agents/artifacts/README.md");
  }

  return { created, skipped };
}

// Execution Loop
const checks = auditWorkspace(workspaceDir);
const score = checks.filter((c) => c.passed).length;
const failUnder = values["fail-under"] ? parseInt(values["fail-under"], 10) : null;
const TOTAL_ASSETS = 13;

// Stage-0 Fast-Skip Gate
if (!isScaffold && score === TOTAL_ASSETS) {
  console.log(`[ai-ready] Repository is AI-ready (${TOTAL_ASSETS}/${TOTAL_ASSETS}). Skipping pass.`);
  process.exit(0);
}

if (values.json) {
  console.log(JSON.stringify({ score, total: TOTAL_ASSETS, passed: score === TOTAL_ASSETS, checks }, null, 2));
  process.exit(0);
}

if (isSanitize) {
  console.log("\n============================================================");
  console.log(" 🛡️ ai-ready — Synthetic ADE/IDE Artifact Sanitization Pass");
  console.log("============================================================");
  console.log(`📁 Target: ${workspaceDir}`);
  if (isDryRun) console.log(`🔍 [DRY RUN — No filesystem writes]`);
  console.log("------------------------------------------------------------\n");

  const contaminated = scanForSyntheticArtifacts(workspaceDir);
  if (contaminated.length === 0) {
    console.log("✅ Zero synthetic ADE/IDE artifacts detected in workspace.");
  } else {
    console.log(`⚠️ Found ${contaminated.length} files contaminated by synthetic artifacts:`);
    let totalUnwrapped = 0;
    for (const item of contaminated) {
      const fullPath = statSync(workspaceDir).isFile() ? workspaceDir : join(workspaceDir, item.file);
      try {
        const raw = readFileSync(fullPath, "utf8");
        const { cleaned, unwrappedCount } = unwrapSyntheticArtifacts(raw);
        if (unwrappedCount > 0) {
          totalUnwrapped += unwrappedCount;
          if (!isDryRun) writeFileSync(fullPath, cleaned, "utf8");
          console.log(`  • [Cleaned] ${item.file} (${unwrappedCount} synthetic artifacts unwrapped)`);
        }
      } catch (err) {
        console.error(`  • [Error] Failed to sanitize ${item.file}: ${(err as Error).message}`);
      }
    }
    console.log(`\n🎉 Sanitization complete! Total artifacts unwrapped: ${totalUnwrapped}`);
  }
  process.exit(0);
}

if (isScaffold) {
  console.log("\n============================================================");
  console.log(" 🤖 ai-ready — Scaffolding Agent Engine DOX Architecture");
  console.log("============================================================");
  console.log(`📁 Target: ${workspaceDir}`);
  if (isDryRun) console.log(`🔍 [DRY RUN — No filesystem writes]`);
  console.log("------------------------------------------------------------\n");

  const { created, skipped } = scaffoldAgentEngine(workspaceDir, { dryRun: isDryRun, force: isForce });
  console.log(`✅ Scaffolding complete:`);
  console.log(`  • Created / Provisioned: ${created.length} files/directories`);
  for (const c of created.slice(0, 10)) console.log(`    + ${c}`);
  if (created.length > 10) console.log(`    ... and ${created.length - 10} more.`);
  if (skipped.length > 0) {
    console.log(`  • Preserved (Already present): ${skipped.length} files`);
  }
  console.log("\n🎉 Agent Engine successfully provisioned!");
  process.exit(0);
}

// Audit Report Presentation
console.log("\n============================================================");
console.log("  🤖 AI-READY AUDIT REPORT");
console.log("============================================================");
const medal = score >= 11 ? "🏆 AI-Ready" : score >= 8 ? "🥇 Solid" : score >= 5 ? "🥈 On Track" : "🥉 Getting Started";
console.log(`  Score:  ${score} / 12 (${medal})`);
console.log(`  Target: ${workspaceDir}`);
console.log("------------------------------------------------------------");

for (const check of checks) {
  const icon = check.passed ? "✓" : "x";
  console.log(`  [${icon}] ${check.category}: ${check.name} (${check.path})`);
}

// Modern Tooling & Synthetic Artifact Health
const toolHealth = checkModernToolsAvailability();
const contaminated = scanForSyntheticArtifacts(workspaceDir);

console.log("\n⚡ Modern CLI Tooling Health (Host System):");
console.log(`  • Installed: ${toolHealth.installed.join(", ") || "None"}`);
if (toolHealth.missing.length > 0) {
  console.log(`  • Missing / Classic Fallback: ${toolHealth.missing.join(", ")}`);
}

if (contaminated.length > 0) {
  console.log(`\n⚠️ Synthetic ADE/IDE Artifact Warning:`);
  console.log(`  • Found ${contaminated.length} files with ORCA_RICH_MD or proprietary IDE wrappers.`);
  console.log(`  • Run 'bun ai-ready.ts --sanitize' to unwrap them automatically.`);
} else {
  console.log(`\n🛡️ Synthetic Artifact Hygiene: Clean (0 synthetic ADE wrappers detected).`);
}

console.log("============================================================");
const failedIds = checks.filter((c) => !c.passed).map((c) => c.id);
const scaffoldable = new Set([1, 2, 3, 4, 6, 7, 8, 12]);
const humanOnly = failedIds.filter((id) => !scaffoldable.has(id));

if (score < 12) {
  console.log(`💡 Tip: Run 'bun ai-ready.ts --scaffold' to auto-provision scaffolding-owned assets (1 AGENTS.md, 2 DOX container, 3 tool config, 4 llms.txt, 6 issue templates, 7 PR template, 8 dependabot, 12 .env.example, 13 artifacts stub).`);
  if (humanOnly.length > 0) {
    console.log(`   Remaining assets (${humanOnly.join(", ")}) are repository-specific and must be authored by the team: 5 CI pipeline, 9 changelog, 10 contributing, 11 durable docs.\n`);
  } else {
    console.log("");
  }
}

if (failUnder !== null && !Number.isNaN(failUnder) && score < failUnder) {
  console.log(`❌ Fail-under gate: score ${score} < ${failUnder}.`);
  process.exit(1);
}

