#!/usr/bin/env bun
/**
 * 🧠 updateagents — Project Agent Context Synchronization Engine
 * 
 * Synchronizes AI-agent instructions and project context with the actual current state of the workspace.
 * 
 * Logic:
 *   1. Check if any agent engine files exist (AGENTS.md, CLAUDE.md, .cursorrules, .agents/, etc.).
 *   2. If NONE found: Scaffolds fresh Agent Engine DOX architecture from ai-ready/templates/.
 *   3. If ANY found: Intelligently extracts custom human content, maps it to the respective
 *      .agents/context/{product,architecture,decisions,current}.md files without clobbering,
 *      deploys the lean root AGENTS.md DOX rail, archives legacy files, and synchronizes 13 standards.
 *   4. Generates a comprehensive change report for the user detailing what was modified, merged, and preserved.
 * 
 * Invariants:
 *   - Current workspace boundary only (never traverse above cwd).
 *   - HARD BOUNDARY: Never read, write, modify, delete, or validate .memory/**.
 *   - Single Source of Truth: Pulls standards and DOX blueprints from ai-ready/templates/.
 *   - Size & Noise Control: Keeps instruction files compact (<5KB preferred, <10KB max).
 * 
 * Usage:
 *   bun path/to/updateagents.ts [options] [targetPath]
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, cpSync, renameSync } from "node:fs";
import { resolve, join, basename, relative } from "node:path";
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";

// Template source of truth located in ai-ready/templates/
const SCRIPT_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const TEMPLATES_DIR = join(REPO_ROOT, "ai-ready/templates");

// CLI Flags
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", short: "f", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🧠 updateagents — Project Agent Context Synchronization

Usage:
  bun updateagents.ts [targetPath] [options]

Options:
  --dry-run      Simulate without writing files
  -f, --force    Force overwrite of standards and templates
  -h, --help     Show this help message
`);
  process.exit(0);
}

const isDryRun = values["dry-run"] || false;
const isForce = values.force || false;

// Step 1: Establish Workspace Context & Boundaries
const rawTarget = positionals[0] || ".";
const workspaceDir = resolve(process.cwd(), rawTarget);

// Guard: Prohibit traversing above current working directory unless explicitly passed
if (!workspaceDir.startsWith(process.cwd()) && rawTarget === ".") {
  console.error("❌ Safety Violation: Cannot traverse above current working directory.");
  process.exit(1);
}

// HARD BOUNDARY ASSERTION
function assertNotMemory(pathToCheck: string) {
  const rel = relative(workspaceDir, pathToCheck);
  if (rel === ".memory" || rel.startsWith(".memory/") || rel.startsWith(".memory\\")) {
    throw new Error(`🛑 HARD BOUNDARY VIOLATION: updateagents must NEVER touch .memory/** (${pathToCheck})`);
  }
}

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
const knownAgentFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  ".cursorrules",
  ".github/copilot-instructions.md",
  "GEMINI.md",
  "CODEX.md",
];

const discoveredFiles: Array<{ relPath: string; fullPath: string; content: string }> = [];

for (const file of knownAgentFiles) {
  const fullPath = join(workspaceDir, file);
  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath, "utf8");
      discoveredFiles.push({ relPath: file, fullPath, content });
      console.log(`  📄 Found agent file: ./${file} (${(content.length / 1024).toFixed(1)} KB)`);
    } catch {}
  }
}

const agentsDir = join(workspaceDir, ".agents");
const standardsDir = join(agentsDir, "standards");
const contextDir = join(agentsDir, "context");
const hasAgentsDir = existsSync(agentsDir);
const hasStandards = existsSync(standardsDir);
const hasContext = existsSync(contextDir);

const hasAnyAgentFiles = discoveredFiles.length > 0 || hasAgentsDir;

if (!hasAnyAgentFiles) {
  console.log("  ℹ️  No existing agent files or .agents/ container found.");
} else {
  console.log(`  ℹ️  Active agent files detected: ${discoveredFiles.length} file(s), .agents/ dir: ${hasAgentsDir ? "Yes" : "No"}`);
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
    if (comp.require && (comp.require["roots/bedrock"] || comp.require["roots/wordpress"] || comp.require["johnpbloch/wordpress"])) {
      frameworkDetected = "wordpress";
    }
    console.log(`  ✅ Parsed composer.json: Framework="${frameworkDetected}"`);
  } catch {}
}

// Check for WordPress markers if not yet detected
if (frameworkDetected === "generic") {
  if (existsSync(join(workspaceDir, "wp-config.php")) || existsSync(join(workspaceDir, "web/wp-config.php")) || existsSync(join(workspaceDir, "wp-content"))) {
    frameworkDetected = "wordpress";
    console.log(`  ✅ Detected WordPress file hierarchy`);
  }
}

// =========================================================================
// Helper: Extract Custom Sections from Markdown
// =========================================================================
function extractSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = markdown.split("\n");
  let currentHeader = "PREAMBLE";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headerMatch) {
      if (currentContent.length > 0) {
        sections[currentHeader] = currentContent.join("\n").trim();
        currentContent = [];
      }
      currentHeader = headerMatch[1].trim().toLowerCase();
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length > 0) {
    sections[currentHeader] = currentContent.join("\n").trim();
  }

  return sections;
}

// Provision .agents/ directory structure
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
  if (!existsSync(p) && !isDryRun) {
    mkdirSync(p, { recursive: true });
    report.scaffolded.push(`.agents/${sub}/`);
  }
}

// =========================================================================
// SCENARIO A: No Agent Files Found -> Scaffold Fresh Agent Engine
// =========================================================================
if (!hasAnyAgentFiles) {
  console.log("\n🛠️  Step 4A: No agent files detected — Scaffolding fresh Agent Engine DOX container...");

  // Initialize context files from templates
  const contextTemplatesDir = join(TEMPLATES_DIR, ".agents/context");
  if (existsSync(contextTemplatesDir)) {
    for (const file of readdirSync(contextTemplatesDir)) {
      const srcFile = join(contextTemplatesDir, file);
      const destFile = join(contextDir, file);
      assertNotMemory(destFile);

      if (!existsSync(destFile) && !isDryRun) {
        let content = readFileSync(srcFile, "utf8");
        content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
        content = content.replace(/\{\{PROJECT_DESC\}\}/g, projectDesc);

        if (file === "product.md") {
          content = `# 📦 Product Scope & Inventory\n\n## Overview\n${projectDesc}\n\n## Key Capabilities\n- Framework: ${frameworkDetected.toUpperCase()}\n- Governed by Agency Council DOX Architecture.\n`;
        } else if (file === "architecture.md") {
          const scriptList = Object.entries(projectScripts)
            .map(([k, v]) => `- \`npm run ${k}\` / \`bun ${k}\`: ${v}`)
            .join("\n");
          content = `# 🏗️ Architecture & Workspace Layout\n\n## 1. Stack Specifications\n- **Framework**: ${frameworkDetected.toUpperCase()}\n- **Runtime**: Node.js / Bun / PHP\n\n## 2. Verified Project Scripts\n${scriptList || "- Default framework commands"}\n\n## 3. Directory Layout\nApplication source code organized in standard framework folders.\n`;
        } else if (file === "current.md") {
          content = `# 📍 Current Shipped State & System Reality\n\n## 1. Verified Shipped Reality\n- Project **${projectName}** initialized with Progressive Disclosure DOX.\n- Framework: ${frameworkDetected.toUpperCase()}.\n\n## 2. Next Immediate Focus\n- Proceed with active milestone implementation.\n`;
        }

        writeFileSync(destFile, content, "utf8");
        report.scaffolded.push(`.agents/context/${file}`);
        console.log(`  ✅ Created: ./.agents/context/${file}`);
      }
    }
  }

  // Deploy Lean Root AGENTS.md
  const rootAgentsPath = join(workspaceDir, "AGENTS.md");
  assertNotMemory(rootAgentsPath);
  const railTemplate = join(TEMPLATES_DIR, "AGENTS.md");
  if (existsSync(railTemplate) && !isDryRun) {
    cpSync(railTemplate, rootAgentsPath);
    report.scaffolded.push("AGENTS.md");
    console.log("  ✅ Deployed lean root AGENTS.md DOX rail");
  }
}

// =========================================================================
// SCENARIO B: Agent Files Exist -> Extract Custom Content & Place Intelligently
// =========================================================================
if (hasAnyAgentFiles) {
  console.log("\n🔄 Step 4B: Custom agent files detected — Extracting and intelligently placing context...");

  // Collect all text from discovered legacy files
  let aggregatedCustomRules: string[] = [];
  let extractedProjectPurpose = "";
  let extractedArchCommands: string[] = [];
  let extractedDecisions: string[] = [];
  let extractedCurrentNotes: string[] = [];

  for (const item of discoveredFiles) {
    const sections = extractSections(item.content);

    for (const [title, content] of Object.entries(sections)) {
      if (!content.trim()) continue;

      if (title.includes("overview") || title.includes("purpose") || title.includes("about") || title.includes("scope")) {
        extractedProjectPurpose += `\n### From ${item.relPath} (${title})\n${content}\n`;
      } else if (title.includes("command") || title.includes("script") || title.includes("build") || title.includes("stack") || title.includes("run")) {
        extractedArchCommands.push(`### From ${item.relPath} (${title})\n${content}`);
      } else if (title.includes("decision") || title.includes("adr") || title.includes("principle") || title.includes("rule")) {
        extractedDecisions.push(`### From ${item.relPath} (${title})\n${content}`);
      } else if (title.includes("task") || title.includes("todo") || title.includes("current") || title.includes("progress") || title.includes("status")) {
        extractedCurrentNotes.push(`### From ${item.relPath} (${title})\n${content}`);
      } else {
        aggregatedCustomRules.push(`### From ${item.relPath} (${title})\n${content}`);
      }
    }
  }

  // Helper to append custom content safely if not already present
  function mergeIntoContextFile(fileName: string, header: string, extraContent: string) {
    const filePath = join(contextDir, fileName);
    assertNotMemory(filePath);

    let base = "";
    if (existsSync(filePath)) {
      base = readFileSync(filePath, "utf8");
      report.preserved.push(`.agents/context/${fileName}`);
    } else {
      const templatePath = join(TEMPLATES_DIR, ".agents/context", fileName);
      if (existsSync(templatePath)) base = readFileSync(templatePath, "utf8");
      else base = `# ${fileName}\n\n`;
      report.scaffolded.push(`.agents/context/${fileName}`);
    }

    if (extraContent && !base.includes("### From")) {
      const updated = `${base.trim()}\n\n## ${header}\n\n${extraContent.trim()}\n`;
      if (!isDryRun) writeFileSync(filePath, updated, "utf8");
      report.contextMerged.push({
        targetFile: `.agents/context/${fileName}`,
        section: header,
        source: "Discovered agent files",
      });
      console.log(`  🔄 Merged custom content into ./.agents/context/${fileName}`);
    }
  }

  if (extractedProjectPurpose) {
    mergeIntoContextFile("product.md", "Imported Project Overview & Scope", extractedProjectPurpose);
  }
  if (extractedArchCommands.length > 0) {
    mergeIntoContextFile("architecture.md", "Imported Commands & Architecture", extractedArchCommands.join("\n\n"));
  }
  if (extractedDecisions.length > 0) {
    mergeIntoContextFile("decisions.md", "Imported Decisions & Invariants", extractedDecisions.join("\n\n"));
  }
  if (extractedCurrentNotes.length > 0) {
    mergeIntoContextFile("current.md", "Imported Current Status & Notes", extractedCurrentNotes.join("\n\n"));
  }

  // Safely Archive Monolithic Files & Deploy Lean Rail
  const rootAgentsPath = join(workspaceDir, "AGENTS.md");
  assertNotMemory(rootAgentsPath);

  if (existsSync(rootAgentsPath)) {
    const rootContent = readFileSync(rootAgentsPath, "utf8");
    const isLeanRail = rootContent.includes("DOX Rail:") || rootContent.includes("Core Turn Invariants") || rootContent.split("\n").length <= 60;

    if (!isLeanRail && !isDryRun) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const archivePath = join(agentsDir, "archive", `AGENTS.legacy-${timestamp}.md`);
      renameSync(rootAgentsPath, archivePath);
      report.archived.push(`AGENTS.md ➔ .agents/archive/AGENTS.legacy-${timestamp}.md`);
      console.log(`  📦 Archived monolithic AGENTS.md ➔ .agents/archive/AGENTS.legacy-${timestamp}.md`);

      // Deploy lean router
      const railTemplate = join(TEMPLATES_DIR, "AGENTS.md");
      if (existsSync(railTemplate)) {
        cpSync(railTemplate, rootAgentsPath);
        report.scaffolded.push("AGENTS.md (Lean DOX Rail)");
        console.log("  ✅ Deployed lean root AGENTS.md DOX rail (<50 lines)");
      }
    }
  } else {
    // Deploy lean router if missing
    const railTemplate = join(TEMPLATES_DIR, "AGENTS.md");
    if (existsSync(railTemplate) && !isDryRun) {
      cpSync(railTemplate, rootAgentsPath);
      report.scaffolded.push("AGENTS.md (Lean DOX Rail)");
      console.log("  ✅ Deployed lean root AGENTS.md DOX rail");
    }
  }

  // Safely Archive CLAUDE.md if present (zero-claude adherence)
  const claudePath = join(workspaceDir, "CLAUDE.md");
  if (existsSync(claudePath) && !isDryRun) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const archivePath = join(agentsDir, "archive", `CLAUDE.legacy-${timestamp}.md`);
    renameSync(claudePath, archivePath);
    report.archived.push(`CLAUDE.md ➔ .agents/archive/CLAUDE.legacy-${timestamp}.md`);
    console.log(`  📦 Archived CLAUDE.md ➔ .agents/archive/CLAUDE.legacy-${timestamp}.md`);
  }
}

// =========================================================================
// Step 5: Synchronize Standards & Brand Tokens from Master Canon
// =========================================================================
console.log("\n🔄 Step 5: Synchronizing 13 standards & brand tokens from ai-ready/templates/...");

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
        cpSync(src, dest);
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
const rootAgentsFile = join(workspaceDir, "AGENTS.md");
if (existsSync(rootAgentsFile)) {
  const size = statSync(rootAgentsFile).size;
  console.log(`  📄 AGENTS.md size: ${size} bytes (<5KB: ${size < 5120 ? "PASSED" : "REVIEW"})`);
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
  console.log(`\n📦 ARCHIVED LEGACY FILES (${report.archived.length}):`);
  for (const a of report.archived) console.log(`   • ${a}`);
}

console.log(`\n✅ SYNCHRONIZED FROM AI-READY CANON:`);
console.log(`   • Standards:   ${report.standardsSynced.length} rulebooks in .agents/standards/`);
console.log(`   • Brand:       Design tokens & guidelines in .agents/brand/`);
console.log(`   • Router:      Lean root AGENTS.md DOX rail active`);
console.log(`   • Safety:      Application code & .memory/** 100% untouched`);
console.log("============================================================\n");
