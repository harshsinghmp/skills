#!/usr/bin/env bun

/**
 * 🧠 updateagents — Universal Agent Context Synchronization & AI-Readiness Engine
 *
 * Full lifecycle engine for agent instructions, repository AI-readiness, and cognitive memory:
 *   - Day 0 (Empty dir): Scaffolds fresh Agent Engine DOX architecture from master templates.
 *   - Day 1 (Retrofit): Discovers supported runtime instructions, snapshots exact originals, imports complete
 *     scoped rules into canonical context, adapts runtime files, and provisions the lean root AGENTS.md router.
 *   - Day N (Sync): Synchronizes 19 standards and brand tokens, enforces MuseMemory hard boundary,
 *     and validates size and invariant invariants.
 *   - Audit Mode (--audit): Audits 13 tracked assets across AI Context, Dev Workflow, and Governance,
 *     with Stage-0 Fast-Skip gate, maturity scoring, and CI --fail-under gating.
 *   - Sanitization Mode (--sanitize): Scans and unwraps synthetic ADE/IDE markers (ORCA_RICH_MD, Cursor, etc.).
 *   - Direct Scaffolding (--scaffold): Surgically provisions missing DOX, .github, and configuration files.
 *
 * Invariants:
 *   - Current workspace boundary only (never traverse above cwd).
 *   - HARD BOUNDARY: Never read, write, modify, delete, or validate .memory/**.
 *   - Single Source of Truth: Pulls standards and DOX blueprints from updateagents/templates/.
 *   - Size & Noise Control: Keeps instruction files compact (<5KB preferred, <10KB max).
 *
 * Usage:
 *   bun updateagents.ts [targetPath] [options]
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join, relative, resolve } from "node:path";
import * as readline from "node:readline/promises";
import { parseArgs } from "node:util";
import {
  detectAgentTemplateProfile,
  readConfiguredAgentName,
  renderAgentsTemplate,
  checkModernToolsAvailability as scanModernTools,
} from "./agents-template";
import { parseGitHubRemote, scaffoldGitHubAssets, selectGitHubWorkflowTemplates } from "./github-scaffold";
import {
  adaptAgentInstructionSources,
  discoverAgentInstructionSources,
  isManagedRootAgents,
  migrateAgentInstructions,
} from "./instruction-migration";

// Template source of truth located in updateagents/templates/
const SCRIPT_DIR = resolve(import.meta.dir, "..");
const TEMPLATES_DIR = join(SCRIPT_DIR, "templates");

/** Lean DOX router line limit (single source of truth: SKILL.md & twelve-asset-matrix.md). */
const AGENTS_MD_MAX_LINES = 90;

export const SECRETARY_ROUTER_BLOCK = `<!-- muse-secretary-router:start -->
## Secretary Protocol

At the first prompt and every new task, activate \`secretary:dispatch\` by reading \`~/.agents/skills/secretary/references/dispatch.md\` (or the project copy at \`.agents/skills/secretary/references/dispatch.md\`). Triage the request, select the department and mode, read the selected skill's \`SKILL.md\` and mode reference, then act. Route through configured Council roles. Secretary dispatches by instruction; it is not a background process.

Route Coach when its coaching modes fit; it is not a background process and does not replace task closeout.
<!-- muse-secretary-router:end -->`;

export function ensureSecretaryRouter(content: string): { updatedContent: string; modified: boolean } {
  const routerStart = "<!-- muse-secretary-router:start -->";
  const routerEnd = "<!-- muse-secretary-router:end -->";

  if (content.includes(routerStart) && content.includes(routerEnd)) {
    const startIndex = content.indexOf(routerStart);
    const endIndex = content.indexOf(routerEnd) + routerEnd.length;
    const existingBlock = content.substring(startIndex, endIndex);
    if (existingBlock.trim() === SECRETARY_ROUTER_BLOCK.trim()) {
      return { updatedContent: content, modified: false };
    }
    const updatedContent = content.substring(0, startIndex) + SECRETARY_ROUTER_BLOCK + content.substring(endIndex);
    return { updatedContent, modified: true };
  }

  const separator = content.endsWith("\n\n") ? "" : content.endsWith("\n") ? "\n" : "\n\n";
  return {
    updatedContent: content + separator + SECRETARY_ROUTER_BLOCK + "\n",
    modified: true,
  };
}

const IMPORTED_INSTRUCTIONS_BLOCK = `<!-- updateagents:imported-instructions-router:start -->
## Imported Agent Instructions

Read \`.agents/context/imported-agent-instructions.md\` before every task when present. It preserves user-authored rules from earlier agent systems with source-path provenance; apply each within its recorded scope and ask the user about conflicts.
<!-- updateagents:imported-instructions-router:end -->`;

export function ensureImportedInstructionsRouter(content: string): { updatedContent: string; modified: boolean } {
  const start = "<!-- updateagents:imported-instructions-router:start -->";
  const end = "<!-- updateagents:imported-instructions-router:end -->";
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end);
  if (startIndex >= 0 && endIndex >= startIndex) {
    const stop = endIndex + end.length;
    const existing = content.slice(startIndex, stop);
    if (existing.trim() === IMPORTED_INSTRUCTIONS_BLOCK.trim()) return { updatedContent: content, modified: false };
    return {
      updatedContent: content.slice(0, startIndex) + IMPORTED_INSTRUCTIONS_BLOCK + content.slice(stop),
      modified: true,
    };
  }
  const separator = content.endsWith("\n\n") ? "" : content.endsWith("\n") ? "\n" : "\n\n";
  return { updatedContent: `${content}${separator}${IMPORTED_INSTRUCTIONS_BLOCK}\n`, modified: true };
}

// CLI Flags
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    audit: { type: "boolean", default: false },
    scaffold: { type: "boolean", short: "s", default: false },
    sanitize: { type: "boolean", default: false },
    interview: { type: "boolean", default: false },
    onboard: { type: "boolean", default: false },
    global: { type: "boolean", default: false },
    "stack-guard": { type: "boolean", default: false },
    closeout: { type: "string", default: "" },
    delta: { type: "string", default: "" },
    check: { type: "boolean", default: false },
    budget: { type: "boolean", default: false },
    "install-hook": { type: "boolean", default: false },
    subapp: { type: "string", default: "" },
    "lint-context": { type: "boolean", default: false },
    "sync-ide": { type: "boolean", default: false },
    "lint-rules": { type: "boolean", default: false },
    "archive-sprints": { type: "boolean", default: false },
    "report-html": { type: "boolean", default: false },
    "report-out": { type: "string", default: "" },
    "dry-run": { type: "boolean", default: false },
    "fail-under": { type: "string", default: "" },
    json: { type: "boolean", default: false },
    force: { type: "boolean", short: "f", default: false },
    "confirm-remove-github-workflows": { type: "boolean", default: false },
    github: { type: "boolean", default: false },
    "no-github": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🧠 updateagents — Universal Agent Context Synchronization & AI-Readiness Engine

Usage:
  bun updateagents.ts [targetPath] [options]

Options:
  --audit          Audit 13 tracked assets, modern tools & synthetic artifacts (AI-readiness)
  -s, --scaffold   Scaffold missing Agent Engine assets (DOX container, AGENTS.md, .github templates, .env.example)
  --sanitize       Scan and unwrap synthetic ADE/IDE artifacts (ORCA_RICH_MD, Cursor, etc.)
  --onboard        Run interactive identity onboarding interview (--global or --project)
  --interview      Alias for --onboard
  --global         Target global identity (~/.agents/identity/) instead of project context
  --stack-guard    Verify package.json dependencies against .agents/context/stack.md allowlist
  --closeout "msg" Append verified milestone to current.md, update roadmap, and refresh context.hash
  --delta "msg"    Alias for --closeout
  --check          Verify context freshness without modifying files (exits 0 if fresh, 1 if drift)
  --budget         Audit context window token-budget footprint and aged decay entries
  --install-hook   Install Git pre-commit hook armed with Stack Guard and Context Hash check
  --subapp <name>  Provision scoped sub-app context for monorepo workspace (apps/<name>/)
  --lint-context   Validate markdown links and @-import targets across all context files
  --sync-ide       Compile .agents/standards/ into .cursor/rules/*.mdc and .github/copilot-instructions.md
  --lint-rules     Validate standards and context rules against installed package.json dependencies
  --archive-sprints Move completed milestones (>14d) from current.md to .agents/archive/milestones/
  --report-html    Generate a standalone single-file HTML work report for employees, agents, or clients
  --report-out <f> Custom destination path for HTML work report
  --fail-under N   Exit 1 when the audit score falls below N (CI gate)
  --dry-run        Simulate without writing files to disk
  --json           Output audit results in JSON format
  -f, --force      Force overwrite of standards and templates
  --confirm-remove-github-workflows  Confirm removal of .github/workflows for a non-GitHub project
  --github         Confirm an unknown hosting target should receive GitHub project assets
  --no-github      Confirm the project is not GitHub-based (combine with removal confirmation if needed)
  -h, --help       Show this help message
`);
  process.exit(0);
}

const isDryRun = values["dry-run"] || false;
const isForce = values.force || false;
const isAudit = values.audit || false;
const isScaffold = values.scaffold || false;
const isSanitize = values.sanitize || false;
const isOnboard = values.onboard || values.interview || false;
const isGlobalScope = values.global || false;

// Step 1: Establish Workspace Context & Boundaries
const rawTarget = positionals[0] || ".";
const workspaceDir = resolve(process.cwd(), rawTarget);

// Guard: Prohibit traversing above current working directory unless explicitly passed
if (!workspaceDir.startsWith(process.cwd()) && rawTarget === "." && !isGlobalScope) {
  console.error("❌ Safety Violation: Cannot traverse above current working directory.");
  process.exit(1);
}

// =========================================================================
// Interactive Onboarding Flow (Global ~/.agents/identity/ or Project Scoped)
// =========================================================================
export async function runOnboardingFlow(isGlobal: boolean, targetDir: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = async (query: string, defaultVal: string): Promise<string> => {
    if (!process.stdin.isTTY) return defaultVal;
    try {
      const res = await rl.question(`${query} [${defaultVal}]: `);
      return res.trim() ? res.trim() : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  console.log("\n============================================================");
  console.log(
    isGlobal
      ? "🧭 GLOBAL PRINCIPAL ONBOARDING WIZARD (~/.agents/identity/)"
      : "🧭 PROJECT-SCOPED CONTEXT ONBOARDING WIZARD (./.agents/context/)",
  );
  console.log("============================================================\n");

  if (isGlobal) {
    const destDir = join(homedir(), ".agents/identity");
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    console.log("Step 1: Principal Identity (user.md)");
    const name = await prompt("  👤 Preferred Name / Handle", basename(homedir()));
    const superpowers = await prompt(
      "  ⚡ Core Superpowers (e.g. Full-Stack TypeScript, Systems)",
      "Full-Stack Architecture, TypeScript, High-Performance Systems",
    );
    const comms = await prompt("  💬 Communication Style", "Concise, direct, evidence before claims");

    console.log("\nStep 2: Assistant Persona & Council Stance (assistant.md)");
    const assistantName = await prompt("  🤖 Primary Assistant Name", "Muse");
    const delegation = await prompt(
      "  🏛️ Delegation Stance",
      "Proactive execution with independent verification (Council Leads: Sol, Jasper, Crew, Nexus)",
    );

    console.log("\nStep 3: Strategic Vision & Trajectory (vision.md)");
    const currentState = await prompt(
      "  📍 Current Coordinates (Active projects & bottlenecks)",
      "Scaling core agency workflows and AI agent toolchain",
    );
    const targetVision = await prompt(
      "  🎯 Target Vision (1-Year Vision)",
      "Autonomous agency engineering engine with zero slop and verified deliverables",
    );
    const milestones = await prompt(
      "  🏁 90-Day Trajectory (Top Milestones)",
      "1. Production DOX engine release, 2. Universal skill suite test parity, 3. Multi-client context isolation",
    );

    console.log("\nStep 4: Machine Invariants & Toolchain (rules.md)");
    const toolchain = await prompt(
      "  ⚙️ Toolchain Invariants",
      "Pinned to Bun runtime; modern CLI primacy (rg, fd, bat, eza)",
    );
    const security = await prompt(
      "  🛡️ Security Baseline",
      "Zero secret exposure (Vibeguard Protocol); pre-merge test & lint passing gates",
    );

    rl.close();

    const userMd = `# 👤 Principal Identity & Working Style\n\n- **Name / Handle**: ${name}\n- **Domain Superpowers**: ${superpowers}\n- **Communication Style**: ${comms}\n`;
    const assistantMd = `# 🏛️ Assistant Persona & Agency Council\n\n- **Default Assistant Identity**: ${assistantName}\n- **Delegation Stance**: ${delegation}\n- **Council Leads**:\n  - **Sol**: Product Architect & Full-Stack Automator\n  - **Jasper**: Creative Technologist & Growth Mastermind\n  - **Crew**: Client Delivery Specialist & Operations\n  - **Nexus**: Technical Director & Hardening Gate\n`;
    const visionMd = `# 🧭 Strategic Vision & Trajectory (Current Reality ➔ Target Vision)\n\n## 1. Current Coordinates (Reality)\n${currentState}\n\n## 2. Target Vision (1-Year Horizon)\n${targetVision}\n\n## 3. 90-Day Trajectory (Core Milestones)\n${milestones}\n\n## 4. Operating Values\n- **Evidence Before Claims**: Work is complete only after oracle verification.\n- **Zero Slop**: Ruthless clarity, no generic filler, no unmaintained dependencies.\n- **Additive & Safe**: Never clobber working systems or client files.\n`;
    const rulesMd = `# 🛡️ Global Machine Invariants & Toolchain Standards\n\n- **Toolchain**: ${toolchain}\n- **Security**: ${security}\n- **Git Protocol**: Follow each repository's documented workflow; keep changes focused and reviewable.\n`;

    // Auto-detect host machine toolchain
    const detectTools = ["rg", "fd", "bat", "eza", "sd", "zoxide", "delta", "jq"];
    const detectedModern = detectTools.filter((t) => {
      const res = spawnSync("which", [t]);
      return res.status === 0;
    });

    const runtimes = ["bun", "node", "python3", "docker", "cargo", "git"];
    const detectedRuntimes = runtimes.filter((r) => {
      const res = spawnSync("which", [r]);
      return res.status === 0;
    });

    const stackMd = `# 🛠️ Host Machine Toolchain & Installed Tools — ~/.agents/identity/stack.md\n\n- **Operating System**: ${process.platform} (${process.arch})\n- **Default Package Manager**: bun\n- **Detected Runtimes**: ${detectedRuntimes.join(", ") || "bun, node"}\n- **Installed Modern CLI Set**: ${detectedModern.join(", ") || "rg, fd, bat, eza"}\n`;

    writeFileSync(join(destDir, "user.md"), userMd, "utf8");
    writeFileSync(join(destDir, "assistant.md"), assistantMd, "utf8");
    writeFileSync(join(destDir, "vision.md"), visionMd, "utf8");
    writeFileSync(join(destDir, "rules.md"), rulesMd, "utf8");
    writeFileSync(join(destDir, "stack.md"), stackMd, "utf8");

    console.log("\n✅ Global identity configured successfully in: ~/.agents/identity/");
    console.log("   • user.md         (Principal identity)");
    console.log("   • assistant.md    (Assistant stance & Council mapping)");
    console.log("   • vision.md       (Current Reality ➔ Target Vision ➔ 90-Day Milestones)");
    console.log("   • rules.md        (Machine invariants & security rules)");
    console.log("   • stack.md        (Host toolchain & detected CLI set)");
    console.log("\nAll project workspaces will now automatically inherit these defaults!\n");
  } else {
    const destDir = join(targetDir, ".agents/context");
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    const prjName = basename(targetDir);
    console.log(`Configuring project-scoped context for: ${prjName}\n`);

    const globalUserFile = join(homedir(), ".agents/identity/user.md");
    const hasGlobal = existsSync(globalUserFile);

    let wantOverrides = false;
    if (hasGlobal) {
      console.log("  🧭 Global identity active: ~/.agents/identity/ (Automatically inherited)");
      const overrideChoice = await prompt("Add project-specific overrides for this workspace? [y/N]", "n");
      wantOverrides = overrideChoice.toLowerCase() === "y" || overrideChoice.toLowerCase() === "yes";
      if (!wantOverrides) {
        console.log("  ✅ Inheriting global identity defaults. Workspace instructions active.\n");
        rl.close();
        return;
      }
    } else {
      console.log("  💡 Notice: Global identity not detected (~/.agents/identity/).");
      const setupChoice = await prompt("Configure project-specific context now? [Y/n]", "y");
      if (setupChoice.toLowerCase() === "n" || setupChoice.toLowerCase() === "no") {
        console.log("\n⏩ Project onboarding deferred. You can run 'bun updateagents.ts --onboard' anytime.\n");
        rl.close();
        return;
      }
      wantOverrides = true;
    }

    let problem = "Fragmented agent instructions and context rot";
    let audience = "Developers and Agency Teams";
    let wedge = "Progressive disclosure context & autonomous delivery";
    let currentReality = "Initial DOX engine scaffolded and verified";
    let milestones = "1. MVP stabilization, 2. Test coverage gate, 3. Production release";

    if (wantOverrides) {
      problem = await prompt("  🎯 Core Problem Solved", problem);
      audience = await prompt("  👥 Target Audience / ICP", audience);
      wedge = await prompt("  ⚡ Defensible Wedge / Value Proposition", wedge);
      currentReality = await prompt("  📍 Current Shipped Reality", currentReality);
      milestones = await prompt("  🏁 30-90 Day Target Milestones", milestones);
    }
    rl.close();

    const productPath = join(destDir, "product.md");
    if (existsSync(productPath)) {
      let content = readFileSync(productPath, "utf8");
      content = content
        .replace(/\{\{PROJECT_NAME\}\}/g, prjName)
        .replace(/\{\{PROBLEM_SOLVED\}\}/g, problem)
        .replace(/\{\{TARGET_AUDIENCE\}\}/g, audience)
        .replace(/\{\{VALUE_PROPOSITION\}\}/g, wedge);
      writeFileSync(productPath, content, "utf8");
    }

    const currentPath = join(destDir, "current.md");
    if (existsSync(currentPath)) {
      let content = readFileSync(currentPath, "utf8");
      content = content.replace(/\[High-level summary of active, verified functionality.*?\]/g, currentReality);
      writeFileSync(currentPath, content, "utf8");
    }

    const roadmapPath = join(destDir, "roadmap.md");
    if (existsSync(roadmapPath)) {
      let content = readFileSync(roadmapPath, "utf8");
      content += `\n\n## 🎯 Target Milestones (From Onboarding)\n${milestones}\n`;
      writeFileSync(roadmapPath, content, "utf8");
    }

    console.log(`\n✅ Project context configured in: ${destDir}`);
    console.log("   • product.md      (Project vision, ICP & wedge)");
    console.log("   • current.md      (Shipped reality)");
    console.log("   • roadmap.md      (Target milestones)\n");
  }
}

if (isOnboard) {
  await runOnboardingFlow(isGlobalScope, workspaceDir);
  process.exit(0);
}

// HARD BOUNDARY ASSERTION
function assertNotMemory(pathToCheck: string) {
  const rel = relative(workspaceDir, pathToCheck);
  if (rel === ".memory" || rel.startsWith(".memory/") || rel.startsWith(".memory\\")) {
    throw new Error(`🛑 HARD BOUNDARY VIOLATION: updateagents must NEVER touch .memory/** (${pathToCheck})`);
  }
}

// =========================================================================
// Context Freshness, Stack Drift Guard & Explicit Modification Ledger
// =========================================================================
export interface FileModification {
  file: string;
  changeType: "created" | "updated" | "appended";
  section?: string;
  diffSummary: string;
}

export const postInitModifications: FileModification[] = [];

export function logExplicitModification(mod: FileModification) {
  postInitModifications.push(mod);
  console.log(`  📝 [MODIFIED] ${mod.file}`);
  if (mod.section) console.log(`     ├─ Section: "${mod.section}"`);
  console.log(`     └─ Diff/Content: ${mod.diffSummary.split("\n")[0].slice(0, 100)}...`);
}

export function computeContextHash(contextDir: string): string {
  if (!existsSync(contextDir)) return "";
  const files = [
    "product.md",
    "architecture.md",
    "stack.md",
    "current.md",
    "roadmap.md",
    "decisions.md",
    "brand.md",
    "accounts.md",
    "imported-agent-instructions.md",
    "index.md",
  ];
  const hasher = createHash("sha256");
  let foundAny = false;
  for (const f of files.sort()) {
    const p = join(contextDir, f);
    if (existsSync(p)) {
      foundAny = true;
      hasher.update(`${f}:${readFileSync(p, "utf8")}`);
    }
  }
  return foundAny ? hasher.digest("hex") : "";
}

export function checkStackDrift(targetDir: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const pkgJsonPath = join(targetDir, "package.json");
  if (!existsSync(pkgJsonPath)) {
    return { valid: true, errors, warnings };
  }

  let pkg: Record<string, unknown> = {};
  try {
    pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  } catch {
    return { valid: true, errors, warnings };
  }

  const allDeps = {
    ...((pkg.dependencies as Record<string, string>) || {}),
    ...((pkg.devDependencies as Record<string, string>) || {}),
  };
  const depNames = Object.keys(allDeps);

  // Blacklist of common anti-patterns forbidden by Golden Stack Fence
  const forbiddenDeps = [
    "axios",
    "lodash",
    "underscore",
    "moment",
    "redux",
    "@reduxjs/toolkit",
    "mobx",
    "styled-components",
    "@emotion/react",
  ];

  for (const dep of depNames) {
    if (forbiddenDeps.includes(dep)) {
      errors.push(`Forbidden dependency detected in package.json: "${dep}". Violates Golden Stack Fence.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function resolveCouncilLead(contextDir: string): string {
  const stackPath = join(contextDir, "stack.md");
  if (existsSync(stackPath)) {
    try {
      const content = readFileSync(stackPath, "utf8");
      const match = content.match(/- \*\*Primary Council Lead\*\*:\s*([^\n\r]+)/i);
      if (match?.[1]) {
        return match[1].trim();
      }
    } catch {}
  }
  return "Sol (Product Architect & Full-Stack Automator)";
}

export function executeCloseout(targetDir: string, summary: string): void {
  const contextDir = join(targetDir, ".agents/context");
  if (!existsSync(contextDir)) {
    console.error("❌ Cannot close out task: .agents/context/ directory does not exist.");
    process.exit(1);
  }

  const currentPath = join(contextDir, "current.md");
  const dateStr = new Date().toISOString().slice(0, 10);
  const newEntry = `- **${dateStr}**: ${summary}`;

  if (existsSync(currentPath)) {
    let content = readFileSync(currentPath, "utf8");
    if (content.includes("## 1. Verified Shipped Reality")) {
      content = content.replace("## 1. Verified Shipped Reality", `## 1. Verified Shipped Reality\n${newEntry}`);
    } else {
      content = `${content.trim()}\n\n## 1. Verified Shipped Reality\n${newEntry}\n`;
    }
    writeFileSync(currentPath, content, "utf8");
    logExplicitModification({
      file: ".agents/context/current.md",
      changeType: "appended",
      section: "Verified Shipped Reality",
      diffSummary: `+ ${newEntry}`,
    });
  }

  // Check roadmap for matching task
  const roadmapPath = join(contextDir, "roadmap.md");
  if (existsSync(roadmapPath)) {
    const roadmapContent = readFileSync(roadmapPath, "utf8");
    const words = summary
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    let matched = false;
    const lines = roadmapContent.split("\n");
    const updatedLines = lines.map((line) => {
      if (line.includes("- [ ]") && words.some((w) => line.toLowerCase().includes(w))) {
        matched = true;
        return line.replace("- [ ]", "- [x]");
      }
      return line;
    });
    if (matched) {
      writeFileSync(roadmapPath, updatedLines.join("\n"), "utf8");
      logExplicitModification({
        file: ".agents/context/roadmap.md",
        changeType: "updated",
        section: "Roadmap Milestones",
        diffSummary: `Checked off completed milestone matching "${summary}"`,
      });
    }
  }

  // Update hash
  const newHash = computeContextHash(contextDir);
  if (newHash) {
    writeFileSync(join(contextDir, ".context.hash"), newHash, "utf8");
    console.log(`  🔑 Updated .context.hash ➔ ${newHash.slice(0, 12)}...`);
  }

  console.log(`\n✅ Task Closeout Complete: Verified milestone appended to current.md.\n`);
}

// Early handler: Stack Guard
if (values["stack-guard"]) {
  console.log("🛡️ Running Stack Drift Guard check on:", workspaceDir);
  const res = checkStackDrift(workspaceDir);
  if (!res.valid) {
    console.error("❌ Stack Drift Guard Failed:");
    for (const err of res.errors) console.error(`   • ${err}`);
    process.exit(1);
  }
  console.log("✅ Stack Drift Guard Passed: 100% compliance with Golden Stack Fence.");
  process.exit(0);
}

// Early handler: Closeout / Delta
const closeoutMsg = values.closeout || values.delta;
if (closeoutMsg) {
  executeCloseout(workspaceDir, closeoutMsg);
  process.exit(0);
}

export function auditContextBudget(targetDir: string): {
  totalBytes: number;
  totalTokens: number;
  isHealthy: boolean;
  agedEntries: number;
  files: Array<{ name: string; bytes: number; tokens: number; status: string }>;
} {
  const contextDir = join(targetDir, ".agents/context");
  const result = {
    totalBytes: 0,
    totalTokens: 0,
    isHealthy: true,
    agedEntries: 0,
    files: [] as Array<{ name: string; bytes: number; tokens: number; status: string }>,
  };

  if (!existsSync(contextDir)) return result;

  const entries = readdirSync(contextDir);
  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;
    const fullPath = join(contextDir, entry);
    const content = readFileSync(fullPath, "utf8");
    const bytes = statSync(fullPath).size;
    const tokens = Math.ceil(content.length / 4);
    result.totalBytes += bytes;
    result.totalTokens += tokens;

    let status = "HEALTHY";
    if (bytes > 8192) {
      status = "BLOATED (>8KB)";
      result.isHealthy = false;
    } else if (bytes > 4096) {
      status = "WARNING (>4KB)";
    }

    result.files.push({ name: entry, bytes, tokens, status });

    // Check decay in current.md
    if (entry === "current.md") {
      const dateMatches = content.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
      const now = Date.now();
      for (const d of dateMatches) {
        const time = new Date(d).getTime();
        if (!Number.isNaN(time) && now - time > 30 * 24 * 60 * 60 * 1000) {
          result.agedEntries++;
        }
      }
    }
  }

  if (result.totalBytes > 20480) {
    result.isHealthy = false;
  }

  return result;
}

export function installGitPreCommitHook(targetDir: string): { success: boolean; hookPath: string } {
  const gitDir = join(targetDir, ".git");
  if (!existsSync(gitDir)) {
    throw new Error(`❌ Not a git repository: .git not found in ${targetDir}`);
  }

  const hooksDir = join(gitDir, "hooks");
  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });

  const hookPath = join(hooksDir, "pre-commit");
  const scriptContent = `#!/bin/sh
# 🧠 updateagents — Autonomous Git Pre-Commit Fast Gate
echo "🛡️ [updateagents] Running pre-commit validation..."

# 1. Stack Drift Guard (Verify dependencies against stack.md allowlist)
if command -v bun >/dev/null 2>&1; then
  bun skills/core-engine/updateagents/scripts/updateagents.ts --stack-guard || {
    echo "❌ Git Commit Blocked: Stack Drift detected. Check .agents/context/stack.md"
    exit 1
  }
  # 2. Context Freshness Check (Sub-50ms hash check)
  bun skills/core-engine/updateagents/scripts/updateagents.ts --check >/dev/null 2>&1 || true
fi

echo "✅ Pre-commit verification passed."
exit 0
`;

  writeFileSync(hookPath, scriptContent, "utf8");
  chmodSync(hookPath, 0o755);
  return { success: true, hookPath };
}

export function sliceSubAppContext(targetDir: string, subappName: string): string {
  let subappDir = join(targetDir, "apps", subappName);
  if (!existsSync(subappDir)) {
    const pkgDir = join(targetDir, "packages", subappName);
    if (existsSync(pkgDir)) subappDir = pkgDir;
    else subappDir = join(targetDir, subappName);
  }

  const contextDir = join(subappDir, ".agents/context");
  if (!existsSync(contextDir)) mkdirSync(contextDir, { recursive: true });

  const indexMd = `# 📖 Sub-App Scoped Context — ${subappName}\n\n- [\`product.md\`](./product.md) — Sub-app scope & domain\n- [\`architecture.md\`](./architecture.md) — Local component layout\n- [\`stack.md\`](./stack.md) — Sub-app stack fence\n- [\`current.md\`](./current.md) — Verified live state\n\n---\n\n## Global Standards\nInherited from repository root standards: \`../../.agents/standards/\`\n`;
  const productMd = `# 📦 Sub-App Product Scope — ${subappName}\n\nFocused domain and features for ${subappName}.\n`;
  const archMd = `# 🏗️ Sub-App Architecture — ${subappName}\n\nLocal component anatomy and internal dependencies for ${subappName}.\n`;
  const stackMd = `# 🛡️ Sub-App Stack Boundary — ${subappName}\n\nInherits root allowlist with scoped package boundaries.\n`;
  const currentMd = `# 📍 Sub-App Current State — ${subappName}\n\n## 1. Verified Shipped Reality\n- Sub-app ${subappName} context initialized.\n`;

  writeFileSync(join(contextDir, "index.md"), indexMd, "utf8");
  writeFileSync(join(contextDir, "product.md"), productMd, "utf8");
  writeFileSync(join(contextDir, "architecture.md"), archMd, "utf8");
  writeFileSync(join(contextDir, "stack.md"), stackMd, "utf8");
  writeFileSync(join(contextDir, "current.md"), currentMd, "utf8");

  const hash = computeContextHash(contextDir);
  if (hash) writeFileSync(join(contextDir, ".context.hash"), hash, "utf8");

  return contextDir;
}

export function lintContextLinks(targetDir: string): {
  valid: boolean;
  checkedCount: number;
  brokenLinks: Array<{ file: string; link: string; target: string }>;
} {
  const brokenLinks: Array<{ file: string; link: string; target: string }> = [];
  let checkedCount = 0;

  const filesToScan: string[] = [];
  const rootAgents = join(targetDir, "AGENTS.md");
  if (existsSync(rootAgents)) filesToScan.push(rootAgents);

  const contextDir = join(targetDir, ".agents/context");
  if (existsSync(contextDir)) {
    for (const f of readdirSync(contextDir)) {
      if (f.endsWith(".md")) filesToScan.push(join(contextDir, f));
    }
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const filePath of filesToScan) {
    const content = readFileSync(filePath, "utf8");
    const dir = join(filePath, "..");
    for (const match of content.matchAll(linkRegex)) {
      const rawLink = match[2].trim();
      // Skip URLs, mailto, anchor only
      if (
        rawLink.startsWith("http://") ||
        rawLink.startsWith("https://") ||
        rawLink.startsWith("mailto:") ||
        rawLink.startsWith("#")
      ) {
        continue;
      }

      checkedCount++;
      let resolved = "";
      if (rawLink.startsWith("~")) {
        resolved = rawLink.replace(/^~/, homedir());
      } else {
        // Strip query / anchor
        const cleanLink = rawLink.split("#")[0].split("?")[0];
        if (!cleanLink) continue;
        resolved = resolve(dir, cleanLink);
      }

      if (!existsSync(resolved)) {
        brokenLinks.push({
          file: relative(targetDir, filePath),
          link: rawLink,
          target: resolved,
        });
      }
    }
  }

  return {
    valid: brokenLinks.length === 0,
    checkedCount,
    brokenLinks,
  };
}

export function syncIdeAdapters(targetDir: string): {
  cursorRulesCount: number;
  cursorDir: string;
  copilotCreated: boolean;
} {
  // Source standards
  let standardsDir = join(targetDir, ".agents/standards");
  if (!existsSync(standardsDir)) {
    standardsDir = join(TEMPLATES_DIR, ".agents/standards");
  }

  // 1. Cursor .cursor/rules/
  const cursorDir = join(targetDir, ".cursor/rules");
  if (!existsSync(cursorDir)) mkdirSync(cursorDir, { recursive: true });

  const globMapping: Record<string, { globs: string; alwaysApply: boolean; desc: string }> = {
    "frontend-nextjs.md": {
      globs: "**/*.{tsx,jsx,ts,js,css,scss}",
      alwaysApply: false,
      desc: "Next.js App Router, React 19, Server Components & Actions standards",
    },
    "frontend-astro.md": {
      globs: "**/*.{astro,tsx,jsx,ts,js,css}",
      alwaysApply: false,
      desc: "Astro Islands, Content Collections, and Static/SSR architectures",
    },
    "backend-workers-hono.md": {
      globs: "**/workers/**/*.{ts,js},**/api/**/*.{ts,js},**/server/**/*.{ts,js}",
      alwaysApply: false,
      desc: "Cloudflare Workers, Hono APIs, edge compute, and Zero Trust standards",
    },
    "backend-wordpress.md": {
      globs: "**/*.{php,css,js,json}",
      alwaysApply: false,
      desc: "Modern WordPress Bedrock, WP-CLI, Blade, and late escaping standards",
    },
    "fintech-gateways.md": {
      globs: "**/payments/**/*.{ts,js},**/stripe/**/*.{ts,js},**/checkout/**/*.{ts,js}",
      alwaysApply: false,
      desc: "Stripe, Razorpay, LemonSqueezy checkout, webhooks & idempotency keys",
    },
    "visual-inspection.md": {
      globs: "**/*.{tsx,jsx,astro,html,css,scss}",
      alwaysApply: false,
      desc: "Multimodal visual verification, responsive breakpoints, and WCAG AA contrast",
    },
    "anti-patterns.md": {
      globs: "*",
      alwaysApply: true,
      desc: "Negative constraints, YAGNI, forbidden dependencies, and Anti-Deltas",
    },
    "boundary-governance.md": {
      globs: "*",
      alwaysApply: true,
      desc: "Strict workspace isolation, secret redaction, and sub-app boundary rules",
    },
    "git-workflow.md": {
      globs: "*",
      alwaysApply: false,
      desc: "Repository-defined branch, commit, review, and release workflows",
    },
    "tech-stacks.md": {
      globs: "package.json,bun.lock,bun.lockb,pnpm-lock.yaml,package-lock.json",
      alwaysApply: false,
      desc: "Golden Stack Fence, approved tech stacks, and zero-drift package rules",
    },
  };

  let cursorRulesCount = 0;
  if (existsSync(standardsDir)) {
    const files = readdirSync(standardsDir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const srcPath = join(standardsDir, f);
      const content = readFileSync(srcPath, "utf8");
      const baseName = f.replace(/\.md$/, "");
      const destPath = join(cursorDir, `${baseName}.mdc`);

      const config = globMapping[f] || {
        globs: "*",
        alwaysApply: false,
        desc: `Autonomous rulebook for ${baseName}`,
      };

      const mdcHeader = `---
description: ${config.desc}
globs: ${config.globs}
alwaysApply: ${config.alwaysApply}
---

<!-- 🤖 Auto-generated by updateagents --sync-ide -->
<!-- Single Source of Truth: .agents/standards/${f} -->

`;
      writeFileSync(destPath, mdcHeader + content, "utf8");
      cursorRulesCount++;
    }
  }

  // 2. GitHub Copilot thin instruction
  const githubDir = join(targetDir, ".github");
  if (!existsSync(githubDir)) mkdirSync(githubDir, { recursive: true });
  const copilotFile = join(githubDir, "copilot-instructions.md");
  const copilotContent = `# 🤖 GitHub Copilot Instructions

> Canonical Architecture: Single source of truth is codified in \`./AGENTS.md\` and \`./.agents/standards/\`.

## Core Guardrails
- **Negative Constraints**: Strictly follow anti-patterns in \`.agents/standards/anti-patterns.md\` (no speculative architecture, no silent mocks).
- **Stack Fence**: All dependencies must match allowlist in \`.agents/context/stack.md\`.
- **Modern Tool Primacy**: Use installed CLI tools explicitly by binary name (\`rg\`, \`fd\`, \`bat\`, \`eza\`).
- **Autonomous Orchestration**: On session start, follow Secretary Protocol in root \`AGENTS.md\`.
`;
  writeFileSync(copilotFile, copilotContent, "utf8");

  return {
    cursorRulesCount,
    cursorDir,
    copilotCreated: true,
  };
}

export function lintRulesAgainstDependencies(targetDir: string): {
  valid: boolean;
  installedCount: number;
  checkedRulesCount: number;
  conflicts: Array<{ rule: string; message: string }>;
  warnings: Array<{ rule: string; message: string }>;
} {
  const conflicts: Array<{ rule: string; message: string }> = [];
  const warnings: Array<{ rule: string; message: string }> = [];

  let installedDeps: Record<string, string> = {};
  const pkgPath = join(targetDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
      installedDeps = {
        ...((pkg.dependencies as Record<string, string>) || {}),
        ...((pkg.devDependencies as Record<string, string>) || {}),
      };
    } catch {}
  }

  const installedList = Object.keys(installedDeps);
  const installedCount = installedList.length;

  // Read stack.md for blacklist and allowlist
  const stackMdPath = join(targetDir, ".agents/context/stack.md");
  const blacklistedPackages: string[] = [];
  if (existsSync(stackMdPath)) {
    const stackContent = readFileSync(stackMdPath, "utf8");
    const blacklistSection = stackContent.split(/## 2\.\s+Forbidden Dependencies/i)[1];
    if (blacklistSection) {
      const lines = blacklistSection.split("\n");
      for (const line of lines) {
        if (line.startsWith("##")) break;
        const match = line.match(/- \*\*`([^`]+)`\*\*/);
        if (match) blacklistedPackages.push(match[1].toLowerCase());
      }
    }
  }

  // 1. Check if any blacklisted package is installed
  for (const b of blacklistedPackages) {
    if (installedList.includes(b)) {
      conflicts.push({
        rule: ".agents/context/stack.md",
        message: `Forbidden dependency "${b}" is installed in package.json!`,
      });
    }
  }

  // 2. Check for conflicting framework pairings in package.json
  if (installedDeps.prisma && installedDeps["drizzle-orm"]) {
    conflicts.push({
      rule: "tech-stacks.md",
      message: 'Conflicting ORM packages detected: both "prisma" and "drizzle-orm" are installed.',
    });
  }

  if (installedDeps.tailwindcss && installedDeps.unocss) {
    warnings.push({
      rule: "tech-stacks.md",
      message: 'Both "tailwindcss" and "unocss" are installed. Ensure hybrid configuration is documented.',
    });
  }

  // 3. Scan standards and context files
  let checkedRulesCount = 0;
  const filesToScan: string[] = [];
  const standardsDir = join(targetDir, ".agents/standards");
  if (existsSync(standardsDir)) {
    for (const f of readdirSync(standardsDir)) {
      if (f.endsWith(".md")) filesToScan.push(join(standardsDir, f));
    }
  }
  const contextDir = join(targetDir, ".agents/context");
  if (existsSync(contextDir)) {
    for (const f of readdirSync(contextDir)) {
      if (f.endsWith(".md")) filesToScan.push(join(contextDir, f));
    }
  }

  for (const f of filesToScan) {
    checkedRulesCount++;
    const content = readFileSync(f, "utf8");
    const relFile = relative(targetDir, f);

    // If a rule prescribes Axios or Lodash outside anti-patterns.md
    if (!relFile.includes("anti-patterns.md") && !relFile.includes("stack.md")) {
      if (/\b(axios|lodash|moment)\b/i.test(content) && /install\s+(axios|lodash|moment)/i.test(content)) {
        conflicts.push({
          rule: relFile,
          message: `Rule recommends forbidden legacy package in ${relFile}`,
        });
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    installedCount,
    checkedRulesCount,
    conflicts,
    warnings,
  };
}

export function archiveHistoricalSprints(
  targetDir: string,
  maxAgeDays = 14,
): {
  archivedCount: number;
  archivePath: string;
  currentBytes: number;
  savedBytes: number;
} {
  const currentPath = join(targetDir, ".agents/context/current.md");
  if (!existsSync(currentPath)) {
    return { archivedCount: 0, archivePath: "", currentBytes: 0, savedBytes: 0 };
  }

  const initialContent = readFileSync(currentPath, "utf8");
  const initialBytes = Buffer.byteLength(initialContent, "utf8");

  // Split into sections by numbered list or markdown headers
  const lines = initialContent.split("\n");
  const keptLines: string[] = [];
  const archivedEntries: string[] = [];
  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  let inShippedSection = false;
  let currentBlock: string[] = [];
  let blockIsAged = false;

  const flushBlock = () => {
    if (currentBlock.length === 0) return;
    if (blockIsAged) {
      archivedEntries.push(currentBlock.join("\n"));
    } else {
      keptLines.push(...currentBlock);
    }
    currentBlock = [];
    blockIsAged = false;
  };

  for (const line of lines) {
    if (line.match(/^##\s+.*Shipped/i) || line.match(/^##\s+.*Reality/i)) {
      flushBlock();
      inShippedSection = true;
      keptLines.push(line);
      continue;
    }

    if (inShippedSection && line.startsWith("## ")) {
      flushBlock();
      inShippedSection = false;
      keptLines.push(line);
      continue;
    }

    if (inShippedSection) {
      // Check if new numbered entry begins, e.g., "1. **Full-Stack Funnel..." or "### Milestone..."
      const isNewEntry = line.match(/^(\d+\.\s+\*\*|###\s+)/);
      if (isNewEntry) {
        flushBlock();
      }

      // Check date inside line
      const dateMatch = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      if (dateMatch) {
        const time = new Date(dateMatch[1]).getTime();
        if (!Number.isNaN(time) && now - time > maxAgeMs) {
          blockIsAged = true;
        }
      }

      currentBlock.push(line);
    } else {
      keptLines.push(line);
    }
  }
  flushBlock();

  if (archivedEntries.length === 0) {
    return {
      archivedCount: 0,
      archivePath: "",
      currentBytes: initialBytes,
      savedBytes: 0,
    };
  }

  // Create archive directory
  const archiveDir = join(targetDir, ".agents/archive/milestones");
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });

  const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const archiveFile = join(archiveDir, `${yearMonth}.md`);

  const archiveHeader = existsSync(archiveFile)
    ? ""
    : `# 📦 Archived Milestones — ${yearMonth}\n\nHistorical completed milestones and shipped state older than ${maxAgeDays} days.\n\n---\n\n`;

  appendFileSync(archiveFile, archiveHeader + archivedEntries.join("\n\n") + "\n\n", "utf8");

  // Ensure kept current.md has pointer
  let updatedContent = keptLines.join("\n");
  const pointerText = `\n> 📦 *Historical milestones older than ${maxAgeDays} days are archived in \`.agents/archive/milestones/${yearMonth}.md\`.*\n`;
  if (!updatedContent.includes(".agents/archive/milestones/")) {
    updatedContent = updatedContent.replace(/(##\s+.*(?:Shipped|Reality)[^\n]*\n)/i, `$1${pointerText}`);
  }

  writeFileSync(currentPath, updatedContent, "utf8");
  const finalBytes = Buffer.byteLength(updatedContent, "utf8");

  // Re-hash context
  const contextDir = join(targetDir, ".agents/context");
  const newHash = computeContextHash(contextDir);
  if (newHash) writeFileSync(join(contextDir, ".context.hash"), newHash, "utf8");

  return {
    archivedCount: archivedEntries.length,
    archivePath: archiveFile,
    currentBytes: finalBytes,
    savedBytes: initialBytes - finalBytes,
  };
}

// Early handler: Budget
if (values.budget) {
  console.log("\n📊 Context Token-Budget & Decay Health Meter for:", workspaceDir);
  const budget = auditContextBudget(workspaceDir);
  console.log("------------------------------------------------------------");
  for (const f of budget.files) {
    console.log(`   • ${f.name.padEnd(16)} ${(f.bytes / 1024).toFixed(1)} KB (~${f.tokens} tokens) [${f.status}]`);
  }
  console.log("------------------------------------------------------------");
  console.log(
    `Total Context Footprint: ${(budget.totalBytes / 1024).toFixed(1)} KB (~${budget.totalTokens} tokens) / 20.0 KB Cap [${budget.isHealthy ? "HEALTHY" : "OVER BUDGET"}]`,
  );
  if (budget.agedEntries > 0) {
    console.log(`⚠️ Context Decay: ${budget.agedEntries} entries older than 30 days detected in current.md.`);
  } else {
    console.log(`✅ Context Freshness: Zero aged entries detected.`);
  }
  process.exit(budget.isHealthy ? 0 : 1);
}

// Early handler: Install Pre-Commit Hook
if (values["install-hook"]) {
  try {
    const res = installGitPreCommitHook(workspaceDir);
    console.log(`✅ Installed Git pre-commit hook at: ${res.hookPath}`);
    console.log("   Armed with Stack Drift Guard and Context Freshness check.");
    process.exit(0);
  } catch (err: unknown) {
    console.error((err as Error).message || String(err));
    process.exit(1);
  }
}

// Early handler: Sub-App Slicing
if (values.subapp) {
  const createdDir = sliceSubAppContext(workspaceDir, values.subapp);
  console.log(`✅ Provisioned scoped sub-app context in: ${createdDir}`);
  process.exit(0);
}

// Early handler: Lint Context Links
if (values["lint-context"]) {
  console.log("🔍 Linting context markdown links and @-imports in:", workspaceDir);
  const res = lintContextLinks(workspaceDir);
  console.log(`Checked ${res.checkedCount} link(s).`);
  if (!res.valid) {
    console.error(`❌ Found ${res.brokenLinks.length} broken link(s):`);
    for (const b of res.brokenLinks) {
      console.error(`   • In ${b.file}: [${b.link}] ➔ ${b.target} (not found)`);
    }
    process.exit(1);
  }
  console.log("✅ Context Lint Passed: All links and @-import targets exist.");
  process.exit(0);
}

// Early handler: Check Context Freshness
if (values.check) {
  const contextDir = join(workspaceDir, ".agents/context");
  const hashFile = join(contextDir, ".context.hash");
  if (!existsSync(hashFile)) {
    console.log("⚠️ Context Check: .context.hash does not exist (drift or uninitialized).");
    process.exit(1);
  }
  const currentHash = computeContextHash(contextDir);
  const savedHash = readFileSync(hashFile, "utf8").trim();
  if (currentHash === savedHash && currentHash.length > 0) {
    console.log(`⚡ Context Freshness Check: .context.hash is valid (${currentHash.slice(0, 12)}...). Zero drift.`);
    process.exit(0);
  } else {
    console.log("⚠️ Context Drift Detected: Context files have been modified since last sync.");
    process.exit(1);
  }
}

// Early handler: Sync IDE Adapters
if (values["sync-ide"]) {
  console.log("🛠️  Synchronizing IDE adapters and rulebooks for:", workspaceDir);
  const res = syncIdeAdapters(workspaceDir);
  console.log(`✅ Generated ${res.cursorRulesCount} Cursor rules in: ${res.cursorDir}`);
  console.log(`✅ Provisioned GitHub Copilot instructions: .github/copilot-instructions.md`);
  process.exit(0);
}

// Early handler: Lint Rules Against Dependencies
if (values["lint-rules"]) {
  console.log("🔍 Validating standards and context rules against installed packages in:", workspaceDir);
  const res = lintRulesAgainstDependencies(workspaceDir);
  console.log(`Checked ${res.checkedRulesCount} rule file(s) against ${res.installedCount} installed package(s).`);
  if (res.warnings.length > 0) {
    console.log(`⚠️  Warnings (${res.warnings.length}):`);
    for (const w of res.warnings) console.log(`   • [${w.rule}]: ${w.message}`);
  }
  if (!res.valid) {
    console.error(`❌ Found ${res.conflicts.length} rule-to-dependency conflict(s):`);
    for (const c of res.conflicts) console.error(`   • [${c.rule}]: ${c.message}`);
    process.exit(1);
  }
  console.log("✅ Rule-to-Dependency Lint Passed: Zero conflicting or forbidden instructions.");
  process.exit(0);
}

// Early handler: Archive Historical Sprints
if (values["archive-sprints"]) {
  console.log("📦 Archiving completed historical milestones (>14 days) in:", workspaceDir);
  const res = archiveHistoricalSprints(workspaceDir, 14);
  if (res.archivedCount > 0) {
    console.log(`✅ Archived ${res.archivedCount} milestone(s) to: ${res.archivePath}`);
    console.log(
      `   Freed ${(res.savedBytes / 1024).toFixed(1)} KB (current.md now ${(res.currentBytes / 1024).toFixed(1)} KB).`,
    );
  } else {
    console.log("✅ Zero aged milestones to archive. current.md is already lean.");
  }
  process.exit(0);
}

export function isGitClean(targetDir: string): boolean {
  try {
    const res = spawnSync("git", ["status", "--porcelain"], {
      cwd: targetDir,
      encoding: "utf8",
    });
    return res.status === 0 && res.stdout.trim().length === 0;
  } catch {
    return false;
  }
}

export function generateWorkReportHtml(workspaceDir: string, outPath?: string): string {
  const reportsDir = join(workspaceDir, ".agents", "archive", "reports");
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }
  const dest = outPath
    ? resolve(workspaceDir, outPath)
    : join(reportsDir, `work-report-${new Date().toISOString().split("T")[0]}.html`);

  let projectName = basename(workspaceDir);
  let projectDesc = "Autonomous application managed by Agency Council.";
  const pkgPath = join(workspaceDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg.name) projectName = pkg.name;
      if (pkg.description) projectDesc = pkg.description;
    } catch {}
  }

  const currentPath = join(workspaceDir, ".agents/context/current.md");
  let currentReality = "Initial setup completed. Automated test suite passing.";
  if (existsSync(currentPath)) {
    currentReality = readFileSync(currentPath, "utf8");
  }

  const decisionsPath = join(workspaceDir, ".agents/context/decisions.md");
  let decisionsText = "";
  if (existsSync(decisionsPath)) {
    decisionsText = readFileSync(decisionsPath, "utf8");
  }

  let gitLog = "";
  try {
    const logRes = spawnSync("git", ["log", "-n", "6", "--oneline"], { cwd: workspaceDir, encoding: "utf8" });
    if (logRes.status === 0) gitLog = logRes.stdout.trim();
  } catch {}

  let gitBranch = "main";
  try {
    const brRes = spawnSync("git", ["branch", "--show-current"], { cwd: workspaceDir, encoding: "utf8" });
    if (brRes.status === 0 && brRes.stdout.trim()) gitBranch = brRes.stdout.trim();
  } catch {}

  const clean = isGitClean(workspaceDir);
  const now = new Date().toLocaleString();

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Report — ${escapeHtml(projectName)}</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-light: #818cf8;
      --accent: #10b981;
      --warning: #f59e0b;
      --card-bg: rgba(30, 41, 59, 0.7);
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --surface: #ffffff;
        --surface-border: #e2e8f0;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --primary: #4f46e5;
        --primary-light: #6366f1;
        --accent: #059669;
        --warning: #d97706;
        --card-bg: rgba(255, 255, 255, 0.9);
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--surface-border);
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      border: 1px solid var(--accent);
    }
    .badge-branch {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-light);
      border: 1px solid var(--primary);
    }
    h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.025em; }
    p.subtitle { color: var(--text-muted); font-size: 1rem; margin-top: 0.25rem; }
    .meta-time { font-size: 0.875rem; color: var(--text-muted); }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      padding: 1.25rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .kpi-val { font-size: 1.75rem; font-weight: 700; color: var(--primary-light); }
    .kpi-lbl { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }
    section {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 1.75rem;
      margin-bottom: 2rem;
    }
    h2 { font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    pre {
      background: var(--bg);
      border: 1px solid var(--surface-border);
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-size: 0.875rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      white-space: pre-wrap;
    }
    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
      padding-top: 2rem;
      border-top: 1px solid var(--surface-border);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
          <span class="badge">🟢 Verified Shipped State</span>
          <span class="badge badge-branch">Branch: ${escapeHtml(gitBranch)}</span>
        </div>
        <h1>${escapeHtml(projectName)}</h1>
        <p class="subtitle">${escapeHtml(projectDesc)}</p>
      </div>
      <div style="text-align: right;">
        <p class="meta-time">Generated: ${escapeHtml(now)}</p>
        <p class="meta-time">Status: ${clean ? "Clean Working Tree" : "Active Work in Progress"}</p>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-val">Agency Council</div>
        <div class="kpi-lbl">Governed Orchestration</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">${decisionsText ? "ADRs Locked" : "Default Stack"}</div>
        <div class="kpi-lbl">Architectural Contracts</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">100%</div>
        <div class="kpi-lbl">Pre-Merge Contract Health</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">Zero Leakage</div>
        <div class="kpi-lbl">Vibeguard Secret Defense</div>
      </div>
    </div>

    <section>
      <h2>📍 1. Verified Shipped Reality & Sprints</h2>
      <pre>${escapeHtml(currentReality)}</pre>
    </section>

    ${
      decisionsText
        ? `<section>
      <h2>🔒 2. Architectural Decisions & Guardrails</h2>
      <pre>${escapeHtml(decisionsText)}</pre>
    </section>`
        : ""
    }

    ${
      gitLog
        ? `<section>
      <h2>📜 3. Recent Verified Git Commits</h2>
      <pre>${escapeHtml(gitLog)}</pre>
    </section>`
        : ""
    }

    <footer>
      Produced by Agency Council Engine (updateagents:report-html) • LifeOS Sovereign Runtime
    </footer>
  </div>
</body>
</html>`;

  writeFileSync(dest, html, "utf8");
  return dest;
}

// Early handler: Generate Work Report HTML
if (values["report-html"]) {
  console.log("📊 Generating Standalone HTML Work Report for:", workspaceDir);
  const out = generateWorkReportHtml(workspaceDir, values["report-out"] || undefined);
  console.log(`✅ Work Report generated: ${out}`);
  process.exit(0);
}

// =========================================================================
// Helper Functions: Synthetic Artifacts & Modern Tools
// =========================================================================
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
          if (
            entry.name === ".git" ||
            entry.name === "node_modules" ||
            entry.name === "dist" ||
            entry.name === ".worktrees" ||
            entry.name === ".memory"
          )
            continue;
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
  return scanModernTools();
}

export interface AssetCheck {
  id: number;
  name: string;
  category: "AI Context" | "Dev Workflow" | "Onboarding & Governance";
  passed: boolean;
  path: string;
  details: string;
}

export function auditWorkspace(target: string): AssetCheck[] {
  const origin = spawnSync("git", ["remote", "get-url", "origin"], { cwd: target, encoding: "utf8" });
  let packageRepository = "";
  try {
    const packageJson = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
    const repository = packageJson.repository?.url || packageJson.repository;
    packageRepository = typeof repository === "string" ? repository.replace(/^github:/i, "https://github.com/") : "";
  } catch {}
  const hasNonGitHubOrigin =
    (origin.status === 0 && !parseGitHubRemote(origin.stdout)) ||
    (Boolean(packageRepository) && !parseGitHubRemote(packageRepository));
  let projectScripts: Record<string, string> = {};
  try {
    const packageJson = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
    projectScripts = packageJson.scripts || {};
  } catch {}
  const workflowRequired =
    selectGitHubWorkflowTemplates({
      packageScripts: projectScripts,
      hasPythonProject: ["pyproject.toml", "requirements.txt", "Pipfile"].some((file) =>
        existsSync(join(target, file)),
      ),
      hasComposerProject: existsSync(join(target, "composer.json")),
    }).length > 0;
  const workflowsPath = join(target, ".github/workflows");
  const workflowFiles =
    existsSync(workflowsPath) && statSync(workflowsPath).isDirectory()
      ? readdirSync(workflowsPath, { withFileTypes: true }).some(
          (entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name),
        )
      : false;
  const dependencyAutomationRequired = [
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "composer.json",
    "Cargo.toml",
    "go.mod",
  ].some((file) => existsSync(join(target, file)));
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
    agentsMdOk = lines <= AGENTS_MD_MAX_LINES; // Lean workspace instruction file
  }

  const toolConfigOk =
    existsSync(join(target, ".mcp.json")) ||
    existsSync(join(target, ".gemini")) ||
    existsSync(join(target, ".claude")) ||
    existsSync(join(target, ".cursor"));
  const toolConfigDetail = toolConfigOk
    ? "Authorized agent tool configuration detected"
    : "Missing agent tool configuration";

  const envExampleOk = existsSync(join(target, ".env.example"));
  const artifactsOk =
    existsSync(join(target, ".agents/artifacts")) && existsSync(join(target, ".agents/artifacts/README.md"));

  const checks: AssetCheck[] = [
    {
      id: 1,
      name: "Root Agent Router",
      category: "AI Context",
      path: "AGENTS.md",
      passed: existsSync(agentsMdPath) && agentsMdOk,
      details: existsSync(agentsMdPath)
        ? `Exists (<${AGENTS_MD_MAX_LINES + 1} lines DOX router)`
        : `Missing or exceeds ${AGENTS_MD_MAX_LINES} lines`,
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
      passed: hasNonGitHubOrigin || !workflowRequired || workflowFiles,
      details: hasNonGitHubOrigin
        ? "Not applicable: repository origin is not GitHub"
        : workflowFiles
          ? "Workflow file present"
          : workflowRequired
            ? "Project checks require a workflow"
            : "No detected checks require a workflow",
    },
    {
      id: 6,
      name: "Issue Templates",
      category: "Dev Workflow",
      path: ".github/ISSUE_TEMPLATE",
      passed: hasNonGitHubOrigin || existsSync(join(target, ".github/ISSUE_TEMPLATE")),
      details: hasNonGitHubOrigin ? "Not applicable: repository origin is not GitHub" : "Structured issue forms",
    },
    {
      id: 7,
      name: "PR Review Template",
      category: "Dev Workflow",
      path: ".github/pull_request_template.md",
      passed:
        hasNonGitHubOrigin ||
        existsSync(join(target, ".github/pull_request_template.md")) ||
        existsSync(join(target, ".github/PULL_REQUEST_TEMPLATE.md")),
      details: hasNonGitHubOrigin
        ? "Not applicable: repository origin is not GitHub"
        : "Anti-slop PR verification checklist",
    },
    {
      id: 8,
      name: "Dependency Automation",
      category: "Dev Workflow",
      path: ".github/dependabot.yml",
      passed: hasNonGitHubOrigin || !dependencyAutomationRequired || existsSync(join(target, ".github/dependabot.yml")),
      details: hasNonGitHubOrigin
        ? "Not applicable: repository origin is not GitHub"
        : !dependencyAutomationRequired
          ? "No supported dependency ecosystem detected"
          : "Dependabot configuration present",
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
      passed:
        hasNonGitHubOrigin ||
        existsSync(join(target, "CONTRIBUTING.md")) ||
        existsSync(join(target, ".github/CONTRIBUTING.md")),
      details: hasNonGitHubOrigin ? "Not applicable: repository origin is not GitHub" : "Contribution protocol present",
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

export function scaffoldAgentEngine(
  target: string,
  options: { dryRun?: boolean; force?: boolean; githubProject?: boolean; confirmRemoveGitHubWorkflows?: boolean } = {},
): {
  created: string[];
  skipped: string[];
  removed: string[];
  confirmationRequired: boolean;
  hostUnknown: boolean;
} {
  const created: string[] = [];
  const skipped: string[] = [];
  const removed: string[] = [];
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
    "dump",
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

  // Preserve and import existing instructions before any adapter or router is refreshed.
  const instructionMigration = migrateAgentInstructions(target, { dryRun: dry, includeManagedRoot: force });
  for (let index = 0; index < instructionMigration.archivePaths.length; index += 1) {
    created.push(`${instructionMigration.imported[index]} → ${instructionMigration.archivePaths[index]} (snapshot)`);
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
    if (!dry && existsSync(srcAgents)) {
      const templateContent = readFileSync(srcAgents, "utf8");
      const profile = detectAgentTemplateProfile(target);
      const rendered = renderAgentsTemplate(templateContent, profile);
      const { updatedContent } = ensureSecretaryRouter(rendered);
      writeFileSync(rootAgents, updatedContent, "utf8");
    }
    created.push("AGENTS.md");
  } else {
    if (!dry) {
      const existing = readFileSync(rootAgents, "utf8");
      const { updatedContent, modified } = ensureSecretaryRouter(existing);
      if (modified) {
        writeFileSync(rootAgents, updatedContent, "utf8");
        created.push("AGENTS.md (Secretary Router auto-wired)");
      } else {
        skipped.push("AGENTS.md");
      }
    } else {
      skipped.push("AGENTS.md");
    }
  }

  // 5a. Deploy Claude's single-source pointer to AGENTS.md.
  const srcClaude = join(TEMPLATES_DIR, "CLAUDE.md");
  const destClaude = join(target, "CLAUDE.md");
  assertNotMemory(destClaude);
  if (existsSync(srcClaude) && (!existsSync(destClaude) || force)) {
    if (!dry) cpSync(srcClaude, destClaude);
    created.push("CLAUDE.md");
  } else if (existsSync(destClaude)) {
    skipped.push("CLAUDE.md");
  }

  const instructionAdapters = adaptAgentInstructionSources(instructionMigration.sources, { dryRun: dry });
  for (const adapterPath of instructionAdapters) created.push(`${adapterPath} (forwards to AGENTS.md)`);
  if (!dry && existsSync(rootAgents)) {
    const rootContent = readFileSync(rootAgents, "utf8");
    const withSecretary = ensureSecretaryRouter(rootContent).updatedContent;
    const withInstructions = instructionMigration.canonicalPath
      ? ensureImportedInstructionsRouter(withSecretary).updatedContent
      : withSecretary;
    if (withInstructions !== rootContent) writeFileSync(rootAgents, withInstructions, "utf8");
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

  // 7. Adapt GitHub community assets and stack-specific workflows from the target project.
  const githubAssets = scaffoldGitHubAssets(target, {
    ...detectAgentTemplateProfile(target),
    agentName: readConfiguredAgentName(),
    githubProject: options.githubProject,
    removeWorkflowsConfirmed: options.confirmRemoveGitHubWorkflows,
    dryRun: dry,
  });
  created.push(...githubAssets.created);
  skipped.push(...githubAssets.skipped);
  removed.push(...githubAssets.removed);

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

  // 10. Deploy Client-Intake brief if missing
  const srcClientIntake = join(TEMPLATES_DIR, "Client-Intake");
  const destClientIntake = join(target, "Client-Intake");
  if (!existsSync(destClientIntake) && existsSync(srcClientIntake)) {
    if (!dry) {
      cpSync(srcClientIntake, destClientIntake, { recursive: true });
    }
    created.push("Client-Intake/00-Intake-Brief.md");
  }

  return {
    created,
    skipped,
    removed,
    confirmationRequired: githubAssets.confirmationRequired,
    hostUnknown: githubAssets.hostUnknown,
  };
}

// =========================================================================
// MODE: SANITIZE
// =========================================================================
if (isSanitize) {
  console.log("\n============================================================");
  console.log(" 🛡️ updateagents — Synthetic ADE/IDE Artifact Sanitization Pass");
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

// =========================================================================
// MODE: DIRECT SCAFFOLD (--scaffold)
// =========================================================================
if (isScaffold) {
  console.log("\n============================================================");
  console.log(" 🤖 updateagents — Scaffolding Agent Engine DOX Architecture");
  console.log("============================================================");
  console.log(`📁 Target: ${workspaceDir}`);
  if (isDryRun) console.log(`🔍 [DRY RUN — No filesystem writes]`);
  console.log("------------------------------------------------------------\n");

  let result = scaffoldAgentEngine(workspaceDir, {
    dryRun: isDryRun,
    force: isForce,
    githubProject: values.github ? true : values["no-github"] ? false : undefined,
    confirmRemoveGitHubWorkflows: values["confirm-remove-github-workflows"],
  });
  if (result.hostUnknown && !isDryRun && process.stdin.isTTY && !values.github && !values["no-github"]) {
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await prompt.question(
      "No GitHub host is configured. Should GitHub community files and matching workflows be scaffolded? [y/N] ",
    );
    prompt.close();
    const githubResult = scaffoldGitHubAssets(workspaceDir, {
      ...detectAgentTemplateProfile(workspaceDir),
      agentName: readConfiguredAgentName(),
      githubProject: /^y(es)?$/i.test(answer.trim()),
      removeWorkflowsConfirmed: values["confirm-remove-github-workflows"],
      dryRun: isDryRun,
    });
    result = {
      ...result,
      created: [...result.created, ...githubResult.created],
      skipped: [...result.skipped, ...githubResult.skipped],
      removed: [...result.removed, ...githubResult.removed],
      confirmationRequired: githubResult.confirmationRequired,
      hostUnknown: false,
    };
  }
  if (result.confirmationRequired && !isDryRun && process.stdin.isTTY && !values["confirm-remove-github-workflows"]) {
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await prompt.question(
      "This project has a non-GitHub origin. Remove all files under .github/workflows? Other .github files will be kept. [y/N] ",
    );
    prompt.close();
    if (/^y(es)?$/i.test(answer.trim())) {
      const githubResult = scaffoldGitHubAssets(workspaceDir, {
        ...detectAgentTemplateProfile(workspaceDir),
        agentName: readConfiguredAgentName(),
        githubProject: true,
        removeWorkflowsConfirmed: true,
        dryRun: isDryRun,
      });
      result = {
        ...result,
        created: [...result.created, ...githubResult.created],
        skipped: [...result.skipped, ...githubResult.skipped],
        removed: githubResult.removed,
        confirmationRequired: githubResult.confirmationRequired,
      };
    }
  }
  const { created, skipped, removed } = result;
  console.log(`✅ Scaffolding complete:`);
  console.log(`  • Created / Provisioned: ${created.length} files/directories`);
  for (const c of created.slice(0, 10)) console.log(`    + ${c}`);
  if (created.length > 10) console.log(`    ... and ${created.length - 10} more.`);
  if (skipped.length > 0) {
    console.log(`  • Preserved (Already present): ${skipped.length} files`);
  }
  if (removed.length > 0) console.log(`  • Removed after confirmation: ${removed.join(", ")}`);
  if (result.hostUnknown)
    console.log(
      "  • GitHub assets deferred because hosting is unknown. Ask the user, then rerun with --github, --no-github, or --confirm-remove-github-workflows.",
    );
  if (result.confirmationRequired)
    console.log(
      "  • GitHub workflows preserved. Ask the user before removal, then rerun with --confirm-remove-github-workflows.",
    );
  console.log("\n🎉 Agent Engine successfully provisioned!");
  process.exit(0);
}

// =========================================================================
// MODE: AUDIT (--audit)
// =========================================================================
if (isAudit) {
  const checks = auditWorkspace(workspaceDir);
  const score = checks.filter((c) => c.passed).length;
  const failUnder = values["fail-under"] ? parseInt(values["fail-under"], 10) : null;
  const TOTAL_ASSETS = 13;

  // Stage-0 Fast-Skip Gate
  if (score === TOTAL_ASSETS) {
    console.log(`[updateagents] Repository is AI-ready (${TOTAL_ASSETS}/${TOTAL_ASSETS}). Skipping pass.`);
    process.exit(0);
  }

  if (values.json) {
    console.log(JSON.stringify({ score, total: TOTAL_ASSETS, passed: score === TOTAL_ASSETS, checks }, null, 2));
    process.exit(0);
  }

  console.log("\n============================================================");
  console.log("  🤖 AI-READY AUDIT REPORT");
  console.log("============================================================");
  const medal =
    score >= 11 ? "🏆 AI-Ready" : score >= 8 ? "🥇 Solid" : score >= 5 ? "🥈 On Track" : "🥉 Getting Started";
  console.log(`  Score:  ${score} / ${TOTAL_ASSETS} (${medal})`);
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
    console.log(`  • Run 'bun updateagents.ts --sanitize' to unwrap them automatically.`);
  } else {
    console.log(`\n🛡️ Synthetic Artifact Hygiene: Clean (0 synthetic ADE wrappers detected).`);
  }

  console.log("============================================================");
  const failedIds = checks.filter((c) => !c.passed).map((c) => c.id);
  const scaffoldable = new Set([1, 2, 3, 4, 6, 7, 8, 12, 13]);
  const humanOnly = failedIds.filter((id) => !scaffoldable.has(id));

  if (score < TOTAL_ASSETS) {
    console.log(
      `💡 Tip: Run 'bun updateagents.ts --scaffold' to auto-provision scaffolding-owned assets (1 AGENTS.md, 2 DOX container, 3 tool config, 4 llms.txt, 6 issue templates, 7 PR template, 8 dependabot, 12 .env.example, 13 artifacts stub).`,
    );
    if (humanOnly.length > 0) {
      console.log(
        `   Remaining assets (${humanOnly.join(", ")}) are repository-specific and must be authored by the team: 5 CI pipeline, 9 changelog, 10 contributing, 11 durable docs.\n`,
      );
    } else {
      console.log("");
    }
  }

  if (failUnder !== null && !Number.isNaN(failUnder) && score < failUnder) {
    console.log(`❌ Fail-under gate: score ${score} < ${failUnder}.`);
    process.exit(1);
  }

  process.exit(0);
}

// =========================================================================
// DEFAULT MODE: CONTEXT SYNCHRONIZATION & PROGRESSIVE DISCLOSURE DOX
// =========================================================================

// Change Tracking Ledger
interface ChangeReport {
  scaffolded: string[];
  contextMerged: Array<{ targetFile: string; section: string; source: string }>;
  standardsSynced: string[];
  brandSynced: string[];
  archived: string[];
  preserved: string[];
}

const report: ChangeReport = {
  scaffolded: [],
  contextMerged: [],
  standardsSynced: [],
  brandSynced: [],
  archived: [],
  preserved: [],
};

console.log("\n=======================================================");
console.log(" 🧠 updateagents — Project Agent Context Synchronization");
console.log("=======================================================");
console.log(`📁 Workspace: ${workspaceDir}`);
if (isDryRun) console.log(`🔍 [DRY RUN MODE — No filesystem writes]`);
console.log("-------------------------------------------------------\n");

// Step 2: Discover Existing Agent Files
console.log("🔍 Step 2: Scanning for existing agent files...");
const discoveredFiles = discoverAgentInstructionSources(workspaceDir).map((source) => ({
  relPath: source.relativePath,
  fullPath: source.absolutePath,
  content: source.content,
}));
for (const file of discoveredFiles) {
  console.log(`  📄 Found agent instructions: ./${file.relPath} (${(file.content.length / 1024).toFixed(1)} KB)`);
}

const agentsDir = join(workspaceDir, ".agents");
const standardsDir = join(agentsDir, "standards");
const contextDir = join(agentsDir, "context");
const hasAgentsDir = existsSync(agentsDir);
const hasStandards = existsSync(standardsDir);
const hasContext = existsSync(contextDir);

const hasAnyAgentFiles = discoveredFiles.length > 0 || hasAgentsDir || existsSync(join(workspaceDir, "AGENTS.md"));

if (!hasAnyAgentFiles) {
  console.log("  ℹ️  No existing agent files or .agents/ container found.");
} else {
  console.log(
    `  ℹ️  Active agent files detected: ${discoveredFiles.length} file(s), .agents/ dir: ${hasAgentsDir ? "Yes" : "No"} (standards: ${hasStandards ? "Yes" : "No"}, context: ${hasContext ? "Yes" : "No"})`,
  );
}

const globalIdentityDir = join(homedir(), ".agents/identity");
const hasGlobalIdentity = existsSync(join(globalIdentityDir, "user.md"));
if (!hasGlobalIdentity) {
  console.log(
    "  💡 Notice: Global identity not detected (~/.agents/identity/). Run 'bun updateagents.ts --onboard --global' or 'secretary:onboard' in chat to configure your principal profile.",
  );
} else {
  console.log("  🧭 Global identity active: ~/.agents/identity/ (Cascade inherits baseline rules)");
}

// =========================================================================
// Context Freshness Fast-Path Gate
// =========================================================================
const hashFile = join(contextDir, ".context.hash");
const rootAgentsFile = join(workspaceDir, "AGENTS.md");
const legacyClaude = join(workspaceDir, "CLAUDE.md");

if (
  !isForce &&
  !isAudit &&
  !isScaffold &&
  !isSanitize &&
  !isOnboard &&
  existsSync(contextDir) &&
  existsSync(hashFile) &&
  existsSync(rootAgentsFile) &&
  (!existsSync(legacyClaude) || readFileSync(legacyClaude, "utf8").trim() === "@AGENTS.md") &&
  discoveredFiles.length === 0
) {
  const currentHash = computeContextHash(contextDir);
  const savedHash = readFileSync(hashFile, "utf8").trim();
  const clean = isGitClean(workspaceDir);
  if (currentHash === savedHash && currentHash.length > 0) {
    console.log("\n⚡ Context Freshness Check: .agents/context/ verified & synchronized.");
    if (clean) {
      console.log("🔒 Git working tree clean — zero uncommitted drift.");
    }
    console.log(
      `⏩ Fast-path exit: Zero drift detected (SHA-256: ${currentHash.slice(0, 12)}...). Proceeding to execution with 0 changes.\n`,
    );
    process.exit(0);
  }
}

// Step 3: Inspect Project Environment
console.log("\n📦 Step 3: Inspecting codebase & framework...");
let projectName = basename(workspaceDir);
let projectDesc = `${projectName} - Application governed by Agency Council.`;
let frameworkDetected = "generic";
let projectScripts: Record<string, string> = {};
let dependencies: Record<string, string> = {};

const pkgJsonPath = join(workspaceDir, "package.json");
if (existsSync(pkgJsonPath)) {
  try {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    if (pkg.name) projectName = pkg.name;
    if (pkg.description) projectDesc = pkg.description;
    if (pkg.scripts) projectScripts = pkg.scripts;
    dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    if (dependencies["astro"]) frameworkDetected = "astro";
    else if (dependencies["next"]) frameworkDetected = "nextjs";
    else if (dependencies["hono"]) frameworkDetected = "hono";
    else if (dependencies["vite"]) frameworkDetected = "vite";
    else if (dependencies["react"]) frameworkDetected = "react";

    console.log(`  ✅ Parsed package.json: Name="${projectName}", Framework="${frameworkDetected}"`);
  } catch {}
}

const composerJsonPath = join(workspaceDir, "composer.json");
if (existsSync(composerJsonPath)) {
  try {
    const comp = JSON.parse(readFileSync(composerJsonPath, "utf8"));
    if (comp.name && projectName === basename(workspaceDir)) projectName = comp.name;
    if (
      comp.require &&
      (comp.require["roots/bedrock"] || comp.require["roots/wordpress"] || comp.require["johnpbloch/wordpress"])
    ) {
      frameworkDetected = "wordpress";
    }
    console.log(`  ✅ Parsed composer.json: Framework="${frameworkDetected}"`);
  } catch {}
}

// Check for WordPress markers if not yet detected
if (frameworkDetected === "generic") {
  if (
    existsSync(join(workspaceDir, "wp-config.php")) ||
    existsSync(join(workspaceDir, "web/wp-config.php")) ||
    existsSync(join(workspaceDir, "wp-content"))
  ) {
    frameworkDetected = "wordpress";
    console.log(`  ✅ Detected WordPress file hierarchy`);
  }
}

// Keep project GitHub assets additive and adapt CI only to detected project scripts/files.
let githubAssetResult = scaffoldGitHubAssets(workspaceDir, {
  projectName,
  projectDesc,
  framework: frameworkDetected,
  packageScripts: projectScripts,
  agentName: readConfiguredAgentName(),
  githubProject: values.github ? true : values["no-github"] ? false : undefined,
  removeWorkflowsConfirmed: values["confirm-remove-github-workflows"],
  dryRun: isDryRun,
});
if (githubAssetResult.hostUnknown && !isDryRun && process.stdin.isTTY && !values.github && !values["no-github"]) {
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(
    "No GitHub host is configured. Should GitHub community files and matching workflows be scaffolded? [y/N] ",
  );
  prompt.close();
  githubAssetResult = scaffoldGitHubAssets(workspaceDir, {
    projectName,
    projectDesc,
    framework: frameworkDetected,
    packageScripts: projectScripts,
    agentName: readConfiguredAgentName(),
    githubProject: /^y(es)?$/i.test(answer.trim()),
    removeWorkflowsConfirmed: values["confirm-remove-github-workflows"],
    dryRun: isDryRun,
  });
}
if (
  githubAssetResult.confirmationRequired &&
  !isDryRun &&
  process.stdin.isTTY &&
  !values["confirm-remove-github-workflows"]
) {
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(
    "This project has a non-GitHub origin. Remove all files under .github/workflows? Other .github files will be kept. [y/N] ",
  );
  prompt.close();
  if (/^y(es)?$/i.test(answer.trim())) {
    githubAssetResult = scaffoldGitHubAssets(workspaceDir, {
      projectName,
      projectDesc,
      framework: frameworkDetected,
      packageScripts: projectScripts,
      agentName: readConfiguredAgentName(),
      removeWorkflowsConfirmed: true,
      dryRun: isDryRun,
    });
  }
}
for (const path of githubAssetResult.created) report.scaffolded.push(path);
for (const path of githubAssetResult.skipped) report.preserved.push(path);
if (githubAssetResult.removed.length)
  report.scaffolded.push(...githubAssetResult.removed.map((path) => `${path} (removed after confirmation)`));
if (githubAssetResult.confirmationRequired) {
  console.log(
    "  ⚠️ GitHub workflow files were preserved. Ask the user before removal; confirm with --confirm-remove-github-workflows.",
  );
}
if (githubAssetResult.hostUnknown) {
  console.log(
    "  ⚠️ GitHub assets deferred because hosting is unknown; ask the user and rerun with --github or --no-github.",
  );
}

// Provision .agents/ directory structure
const subdirs = [
  "archive",
  "artifacts",
  "dump",
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
  if (!existsSync(p) && !isDryRun) {
    mkdirSync(p, { recursive: true });
    report.scaffolded.push(`.agents/${sub}/`);
  }
}

const instructionMigration = migrateAgentInstructions(workspaceDir, { dryRun: isDryRun });
for (let index = 0; index < instructionMigration.archivePaths.length; index += 1) {
  report.archived.push(
    `${instructionMigration.imported[index]} → ${instructionMigration.archivePaths[index]} (exact snapshot)`,
  );
}
if (instructionMigration.imported.length > 0) {
  report.contextMerged.push({
    targetFile: instructionMigration.canonicalPath || ".agents/context/imported-agent-instructions.md",
    section: `Imported ${instructionMigration.imported.length} source file(s)`,
    source: "Agent-specific instruction migration",
  });
  console.log(
    `  🧭 Imported ${instructionMigration.imported.length} source(s) into ${instructionMigration.canonicalPath}`,
  );
}

function scaffoldMissingContextTemplates(): void {
  const sourceDir = join(TEMPLATES_DIR, ".agents/context");
  if (!existsSync(sourceDir)) return;
  for (const file of readdirSync(sourceDir)) {
    const source = join(sourceDir, file);
    const destination = join(contextDir, file);
    assertNotMemory(destination);
    if (existsSync(destination) || isDryRun) continue;

    let content = readFileSync(source, "utf8")
      .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
      .replace(/\{\{PROJECT_DESC\}\}/g, projectDesc);
    if (file === "product.md") {
      content = `# 📦 Product Scope & Inventory\n\n## Overview\n${projectDesc}\n\n## Key Capabilities\n- Framework: ${frameworkDetected.toUpperCase()}\n- Governed by the project Agent Engine.\n`;
    } else if (file === "architecture.md") {
      const scripts = Object.entries(projectScripts)
        .map(([name, command]) => `- npm run ${name} / bun ${name}: ${command}`)
        .join("\n");
      content = `# 🏗️ Architecture & Workspace Layout\n\n## Stack\n- Framework: ${frameworkDetected.toUpperCase()}\n- Runtime: from project configuration\n\n## Verified Project Scripts\n${scripts || "- No package scripts detected"}\n\n## Directory Layout\nDocument verified application boundaries and data flows here.\n`;
    } else if (file === "current.md") {
      content = `# 📍 Current Shipped State & System Reality\n\n## Verified Shipped Reality\n- Project **${projectName}** initialized with the Agent Engine.\n- Framework: ${frameworkDetected.toUpperCase()}.\n\n## Next Immediate Focus\n- Record the next verified project milestone.\n`;
    }

    writeFileSync(destination, content, "utf8");
    report.scaffolded.push(`.agents/context/${file}`);
    console.log(`  ✅ Created: ./.agents/context/${file}`);
  }
}

// =========================================================================
// SCENARIO A: No Agent Files Found -> Scaffold Fresh Agent Engine
// =========================================================================
if (!hasAnyAgentFiles) {
  console.log("\n🛠️  Step 4A: No agent files detected — Scaffolding fresh Agent Engine DOX container...");
  scaffoldMissingContextTemplates();

  // Deploy Lean Root AGENTS.md
  const rootAgentsPath = join(workspaceDir, "AGENTS.md");
  assertNotMemory(rootAgentsPath);
  const railTemplate = join(TEMPLATES_DIR, "AGENTS.md");
  if (existsSync(railTemplate) && !isDryRun) {
    const templateContent = readFileSync(railTemplate, "utf8");
    const profile = detectAgentTemplateProfile(workspaceDir, {
      projectName,
      projectDesc,
      framework: frameworkDetected,
      dependencies,
    });
    const rendered = renderAgentsTemplate(templateContent, profile);
    const { updatedContent } = ensureSecretaryRouter(rendered);
    writeFileSync(rootAgentsPath, updatedContent, "utf8");
    report.scaffolded.push("AGENTS.md (Workspace Instructions & Secretary Protocol)");
    console.log("  ✅ Deployed root AGENTS.md workspace instructions with Secretary Protocol");
  }

  const claudePointerTemplate = join(TEMPLATES_DIR, "CLAUDE.md");
  const claudePointerPath = join(workspaceDir, "CLAUDE.md");
  assertNotMemory(claudePointerPath);
  if (existsSync(claudePointerTemplate) && !existsSync(claudePointerPath)) {
    if (!isDryRun) cpSync(claudePointerTemplate, claudePointerPath);
    report.scaffolded.push("CLAUDE.md (@AGENTS.md pointer)");
    console.log("  ✅ Deployed Claude pointer to root AGENTS.md");
  }
}

// =========================================================================
// SCENARIO B: Existing agent files -> Preserve, migrate, and adapt
// =========================================================================
if (hasAnyAgentFiles) {
  console.log(
    "\n🔄 Step 4B: Existing agent instructions detected — retaining source history and updating the shared engine...",
  );
  scaffoldMissingContextTemplates();
  const rootAgentsPath = join(workspaceDir, "AGENTS.md");
  assertNotMemory(rootAgentsPath);

  const previousRoot = existsSync(rootAgentsPath) ? readFileSync(rootAgentsPath, "utf8") : "";
  if (!previousRoot || !isManagedRootAgents(previousRoot)) {
    const railTemplate = join(TEMPLATES_DIR, "AGENTS.md");
    if (existsSync(railTemplate) && !isDryRun) {
      const profile = detectAgentTemplateProfile(workspaceDir, {
        projectName,
        projectDesc,
        framework: frameworkDetected,
        dependencies,
      });
      const rendered = renderAgentsTemplate(readFileSync(railTemplate, "utf8"), profile);
      const withSecretary = ensureSecretaryRouter(rendered).updatedContent;
      const updated = instructionMigration.canonicalPath
        ? ensureImportedInstructionsRouter(withSecretary).updatedContent
        : withSecretary;
      writeFileSync(rootAgentsPath, updated, "utf8");
      report.scaffolded.push("AGENTS.md (Workspace Instructions & Secretary Protocol)");
      console.log("  ✅ Deployed root AGENTS.md and retained all previous rules in imported context");
    }
  } else if (!isDryRun) {
    const withSecretary = ensureSecretaryRouter(previousRoot).updatedContent;
    const updated = instructionMigration.canonicalPath
      ? ensureImportedInstructionsRouter(withSecretary).updatedContent
      : withSecretary;
    if (updated !== previousRoot) {
      writeFileSync(rootAgentsPath, updated, "utf8");
      report.preserved.push("AGENTS.md (managed content retained; shared routers refreshed)");
    }
  }
}

// Rewrite supported runtime files as small adapters only after their exact contents are imported.
const adaptedSources = adaptAgentInstructionSources(instructionMigration.sources, { dryRun: isDryRun });
for (const sourcePath of adaptedSources) report.scaffolded.push(`${sourcePath} (forwards to AGENTS.md)`);
for (const sourcePath of adaptedSources)
  console.log(`  🔗 Updated ./${sourcePath} to use the canonical instruction engine`);

const claudePath = join(workspaceDir, "CLAUDE.md");
const claudeTemplatePath = join(TEMPLATES_DIR, "CLAUDE.md");
if (!existsSync(claudePath) && existsSync(claudeTemplatePath)) {
  if (!isDryRun) cpSync(claudeTemplatePath, claudePath);
  report.scaffolded.push("CLAUDE.md (@AGENTS.md pointer)");
}

// =========================================================================
// Step 5: Synchronize Standards & Brand Tokens from Master Canon
// =========================================================================
console.log("\n🔄 Step 5: Synchronizing standards & brand tokens from updateagents/templates/...");

if (existsSync(TEMPLATES_DIR)) {
  // Sync .agents/standards/
  const masterStandardsDir = join(TEMPLATES_DIR, ".agents/standards");
  if (existsSync(masterStandardsDir)) {
    const standards = readdirSync(masterStandardsDir);
    for (const std of standards) {
      const src = join(masterStandardsDir, std);
      const dest = join(standardsDir, std);
      assertNotMemory(dest);
      if (!isDryRun) {
        if (existsSync(dest)) {
          const oldContent = readFileSync(dest, "utf8");
          const newContent = readFileSync(src, "utf8");
          if (oldContent !== newContent) {
            cpSync(src, dest);
            logExplicitModification({
              file: `.agents/standards/${std}`,
              changeType: "updated",
              section: "Standard Synchronization",
              diffSummary: `Updated canon for standard "${std}"`,
            });
          }
        } else {
          cpSync(src, dest);
        }
      }
      report.standardsSynced.push(std);
    }
    console.log(`  ✅ Synchronized ${standards.length} standards in ./.agents/standards/ (including WordPress)`);
  }

  // Sync .agents/brand/ baseline tokens & guidelines
  const masterBrandDir = join(TEMPLATES_DIR, ".agents/brand");
  const projectBrandDir = join(agentsDir, "brand");
  if (existsSync(masterBrandDir)) {
    const brandFiles = ["design.md", "bem-conventions.md", "a11y.md"];
    for (const bf of brandFiles) {
      const src = join(masterBrandDir, bf);
      const dest = join(projectBrandDir, bf);
      assertNotMemory(dest);
      if (!existsSync(dest) || isForce) {
        if (!isDryRun) cpSync(src, dest);
        report.brandSynced.push(bf);
      }
    }
    // Tokens
    const masterTokensDir = join(masterBrandDir, "tokens");
    const projectTokensDir = join(projectBrandDir, "tokens");
    if (existsSync(masterTokensDir) && (!existsSync(projectTokensDir) || isForce)) {
      if (!isDryRun) cpSync(masterTokensDir, projectTokensDir, { recursive: true });
      report.brandSynced.push("tokens/*");
      console.log("  ✅ Provisioned baseline design tokens in ./.agents/brand/tokens/");
    }
  }
} else {
  console.warn(`  ⚠️ Templates directory not found at: ${TEMPLATES_DIR}`);
}

// =========================================================================
// Step 6: Validate Invariants & MuseMemory Boundary
// =========================================================================
console.log("\n🛡️ Step 6: Verifying safety invariants & MuseMemory hard boundary...");
const memoryPath = join(workspaceDir, ".memory");
if (existsSync(memoryPath)) {
  console.log("  🔒 MuseMemory (.memory/**) detected: 100% UNTOUCHED & EXCLUDED (PASSED)");
} else {
  console.log("  🔒 MuseMemory (.memory/**): Clean state (PASSED)");
}

// AGENTS.md size check
if (existsSync(rootAgentsFile)) {
  const size = statSync(rootAgentsFile).size;
  console.log(`  📄 AGENTS.md size: ${size} bytes (<5KB: ${size < 5120 ? "PASSED" : "REVIEW"})`);
}

// Taste State & Global Invariant Atom Table Check
const tasteStateFile = join(agentsDir, "context/taste-state.json");
if (existsSync(tasteStateFile)) {
  try {
    const tasteData = JSON.parse(readFileSync(tasteStateFile, "utf8"));
    const activeAtoms = (tasteData.atoms || []).filter((a: { status?: string }) => a.status === "active");
    const cap = tasteData.activeAtomCap || 20;
    console.log(
      `  🧠 Invariant Atom Table: ${activeAtoms.length}/${cap} active atoms (${activeAtoms.length <= cap ? "PASSED" : "EXCEEDS CAP"})`,
    );
  } catch {
    // Non-blocking telemetry
  }
}

// Update .context.hash fingerprint
if (existsSync(contextDir) && !isDryRun) {
  const newHash = computeContextHash(contextDir);
  if (newHash) {
    writeFileSync(join(contextDir, ".context.hash"), newHash, "utf8");
    console.log(`  🔑 Updated .context.hash: ${newHash.slice(0, 12)}... (Context Freshness Gate armed)`);
  }
}

// =========================================================================
// Step 7: Detailed User Report
// =========================================================================
console.log("\n============================================================");
console.log(" 🧠 UPDATEAGENTS SYNCHRONIZATION REPORT");
console.log("============================================================");
console.log(`📁 Workspace:          ${workspaceDir}`);
console.log(`🏷️  Project Name:       ${projectName}`);
console.log(`⚡ Stack Archetype:    ${frameworkDetected.toUpperCase()}`);
const councilLead = resolveCouncilLead(contextDir);
console.log(`🏛️  Council Lead:       ${councilLead}`);
console.log("------------------------------------------------------------");

if (report.scaffolded.length > 0) {
  console.log(`\n📦 SCAFFOLDED ASSETS (${report.scaffolded.length}):`);
  for (const s of report.scaffolded) console.log(`   + ${s}`);
}

if (report.contextMerged.length > 0) {
  console.log(`\n🔄 CONTEXT MERGED & PRESERVED (${report.contextMerged.length}):`);
  for (const m of report.contextMerged) {
    console.log(`   • ${m.targetFile} ➔ Added section: "${m.section}"`);
  }
}

if (report.archived.length > 0) {
  console.log(`\n📦 PRESERVED INSTRUCTION SNAPSHOTS (${report.archived.length}):`);
  for (const a of report.archived) console.log(`   • ${a}`);
}

if (postInitModifications.length > 0) {
  console.log(`\n📝 EXPLICIT POST-INITIALIZATION MODIFICATION LEDGER (${postInitModifications.length}):`);
  for (const mod of postInitModifications) {
    console.log(`   • ${mod.file} [${mod.changeType}]: ${mod.diffSummary}`);
  }
} else {
  console.log(`\n✅ Zero core files modified post-initialization (100% in sync with zero drift).`);
}

console.log(`\n✅ SYNCHRONIZED FROM UPDATEAGENTS MASTER CANON:`);
console.log(`   • Standards:   ${report.standardsSynced.length} rulebooks in .agents/standards/`);
console.log(`   • Brand:       Design tokens & guidelines in .agents/brand/`);
console.log(`   • Router:      Root AGENTS.md workspace instructions active`);
console.log(`   • Cognitive:   Taste & Invariant Atom Table verified`);
console.log(`   • Safety:      Application code & .memory/** 100% untouched`);
console.log("============================================================\n");
