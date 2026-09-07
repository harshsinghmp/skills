#!/usr/bin/env bun
/**
 * 🏛️ Universal Project OS & Progressive Disclosure DOX Scaffolder
 * 
 * Pipeline:
 *   Stage 1: Agents First (Directly copies Agent Engine from ai-ready/templates/)
 *   Stage 2: Project Type (Interactive Framework CLI: Astro, Next.js, WordPress, Instatic, Hono, Vite, or None)
 *   Stage 3: Closeout DOX Pass (Updates .agents/context/current.md with live deliverables)
 * 
 * Usage:
 *   bun new-project/scripts/new-project.ts [targetPath] [options]
 * 
 * Flags:
 *   -n, --name <name>        Project name
 *   -t, --type <type>        Project archetype (astro | nextjs | wordpress | instatic | hono | vite | none)
 *   -d, --desc <desc>        Project description
 *   -p, --path <path>        Target path
 *       --non-interactive    Skip prompts and use provided flags or defaults
 *       --dry-run            Simulate without writing files
 *   -f, --force              Force replace existing destination targets
 *   -h, --help               Show help message
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, cpSync } from "node:fs";
import { resolve, join, basename, isAbsolute, relative } from "node:path";
import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

// Template source of truth located in ai-ready/templates/
const SCRIPT_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const TEMPLATES_DIR = join(REPO_ROOT, "ai-ready/templates");

// CLI Flags Parsing
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: "string", short: "n" },
    type: { type: "string", short: "t" },
    desc: { type: "string", short: "d" },
    path: { type: "string", short: "p" },
    "non-interactive": { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", short: "f", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🏛️ Universal Project OS & Progressive Disclosure DOX Scaffolder

Usage:
  bun new-project/scripts/new-project.ts [targetPath] [options]

Options:
  -n, --name <name>        Project name (default: directory name)
  -t, --type <type>        Archetype: astro | nextjs | wordpress | instatic | hono | vite | none
  -d, --desc <desc>        Project description
  -p, --path <path>        Target directory path
      --non-interactive    Run without interactive prompts
      --dry-run            Simulate without writing files
  -f, --force              Force replace existing destination targets
  -h, --help               Show this help message
`);
  process.exit(0);
}

const isDryRun = values["dry-run"] || false;
const isForce = values.force || false;
const isNonInteractive = values["non-interactive"] || false;

async function ask(rl: ReturnType<typeof createInterface>, question: string, defaultVal: string = ""): Promise<string> {
  const suffix = defaultVal ? ` [${defaultVal}]: ` : ": ";
  const answer = await rl.question(question + suffix);
  return answer.trim() || defaultVal;
}

async function main() {
  console.log("\n=======================================================");
  console.log(" 🏛️ Agency Council — Universal Project OS Scaffolder");
  console.log("=======================================================\n");

  if (!existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Template bundle not found at: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  let targetPath = values.path || positionals[0] || "";
  let projectName = values.name || "";
  let projectType = values.type || "";
  let projectDesc = values.desc || "";

  // Interactive Prompt Mode
  if (!isNonInteractive && (!targetPath || !projectName || !projectType)) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    try {
      // 1. Path Picker
      if (!targetPath) {
        targetPath = await ask(rl, "Project Destination Directory", "./my-project");
      }

      // 2. Project Name
      if (!projectName) {
        const defaultName = basename(resolve(process.cwd(), targetPath));
        projectName = await ask(rl, "Project Name", defaultName);
      }

      // 3. Project Description
      if (!projectDesc) {
        projectDesc = await ask(
          rl,
          "Project Description",
          `${projectName} - High-performance application governed by Agency Council.`
        );
      }

      // 4. Project Archetype
      if (!projectType) {
        console.log("\n⚡ Select Tech Stack Archetype:");
        console.log("  [1] Astro v7.2.x        (High-speed content & web apps, Cloudflare edge)");
        console.log("  [2] Next.js 16          (React 19, App Router, Server Components/Actions)");
        console.log("  [3] WordPress           (Modern Roots Bedrock / Custom Theme / Gutenberg Blocks)");
        console.log("  [4] Instatic HTML       (Pure HTML brochure & zero-JS static site)");
        console.log("  [5] Hono / Workers      (Cloudflare Workers edge API microservice)");
        console.log("  [6] Vite + React SPA    (Client-side React 19 single-page app)");
        console.log("  [7] None / Existing     (AI DOX Governance ONLY — no framework init)");
        
        const typeChoice = await ask(rl, "Choose archetype [1-7]", "1");
        const typeMap: Record<string, string> = {
          "1": "astro",
          "2": "nextjs",
          "3": "wordpress",
          "4": "instatic",
          "5": "hono",
          "6": "vite",
          "7": "none",
        };
        projectType = typeMap[typeChoice] || "astro";
      }
    } finally {
      rl.close();
    }
  }

  // Fallbacks
  const resolvedTarget = isAbsolute(targetPath || ".") ? (targetPath || ".") : resolve(process.cwd(), targetPath || ".");
  projectName = projectName || basename(resolvedTarget);
  projectType = (projectType || "astro").toLowerCase();
  projectDesc = projectDesc || `${projectName} - Application governed by Agency Council.`;

  console.log("\n-------------------------------------------------------");
  console.log(`📁 Target Directory: ${resolvedTarget}`);
  console.log(`🏷️  Project Name:     ${projectName}`);
  console.log(`⚡ Archetype:        ${projectType}`);
  console.log(`📝 Description:      ${projectDesc}`);
  if (isDryRun) console.log(`🔍 [DRY RUN MODE — No filesystem writes]`);
  console.log("-------------------------------------------------------\n");

  // =========================================================================
  // STAGE 1: Agents First (Mandatory Governance Container)
  // Directly copies the Agent Engine from ai-ready/templates/
  // =========================================================================
  console.log("🛡️  STAGE 1: Initializing Agent Governance & Progressive Disclosure DOX (from ai-ready/templates)...");

  if (!isDryRun && !existsSync(resolvedTarget)) {
    mkdirSync(resolvedTarget, { recursive: true });
  }

  // 1.1 Copy Lean AGENTS.md
  const agentsSrc = join(TEMPLATES_DIR, "AGENTS.md");
  const agentsDest = join(resolvedTarget, "AGENTS.md");
  if (existsSync(agentsSrc)) {
    let content = readFileSync(agentsSrc, "utf8");
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    content = content.replace(/\{\{PROJECT_DESC\}\}/g, projectDesc);
    if (!existsSync(agentsDest) || isForce) {
      if (!isDryRun) writeFileSync(agentsDest, content, "utf8");
      console.log("  ✅ Created: ./AGENTS.md");
    } else {
      console.log("  ⏩ Skipped: ./AGENTS.md (already exists)");
    }
  }

  // 1.2 Copy .gitignore
  const gitignoreSrc = join(TEMPLATES_DIR, "gitignore.template");
  const gitignoreDest = join(resolvedTarget, ".gitignore");
  if (existsSync(gitignoreSrc)) {
    if (!existsSync(gitignoreDest) || isForce) {
      if (!isDryRun) cpSync(gitignoreSrc, gitignoreDest);
      console.log("  ✅ Created: ./.gitignore");
    } else {
      console.log("  ⏩ Skipped: ./.gitignore (already exists)");
    }
  }

  // 1.3 Scaffold .agents/ 9-Folder Tree
  const agentsDir = join(resolvedTarget, ".agents");
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
    if (!existsSync(p) && !isDryRun) {
      mkdirSync(p, { recursive: true });
    }
  }
  console.log("  ✅ Provisioned: ./.agents/ 9-folder tree");

  // 1.4 Copy Standards
  const standardsSrc = join(TEMPLATES_DIR, ".agents/standards");
  const standardsDest = join(agentsDir, "standards");
  if (existsSync(standardsSrc)) {
    const files = readdirSync(standardsSrc);
    for (const f of files) {
      const src = join(standardsSrc, f);
      const dest = join(standardsDest, f);
      if (!existsSync(dest) || isForce) {
        if (!isDryRun) cpSync(src, dest);
      }
    }
    console.log(`  ✅ Synced: ./.agents/standards/ (${readdirSync(standardsSrc).length} standards, including WordPress)`);
  }

  // 1.5 Copy Brand Guidelines & Tokens
  const brandSrc = join(TEMPLATES_DIR, ".agents/brand");
  const brandDest = join(agentsDir, "brand");
  if (existsSync(brandSrc)) {
    const brandFiles = ["design.md", "bem-conventions.md", "a11y.md"];
    for (const bf of brandFiles) {
      const src = join(brandSrc, bf);
      const dest = join(brandDest, bf);
      if (!existsSync(dest) || isForce) {
        if (!isDryRun) cpSync(src, dest);
      }
    }
    const tokensSrc = join(brandSrc, "tokens");
    const tokensDest = join(brandDest, "tokens");
    if (existsSync(tokensSrc) && !existsSync(tokensDest)) {
      if (!isDryRun) cpSync(tokensSrc, tokensDest, { recursive: true });
      console.log("  ✅ Provisioned: ./.agents/brand/tokens/ baseline");
    }
  }

  // 1.6 Copy and Tailor .agents/context/ Templates
  const contextSrc = join(TEMPLATES_DIR, ".agents/context");
  const contextDest = join(agentsDir, "context");
  if (existsSync(contextSrc)) {
    const ctxFiles = readdirSync(contextSrc);
    for (const f of ctxFiles) {
      const src = join(contextSrc, f);
      const dest = join(contextDest, f);
      if (!existsSync(dest) || isForce) {
        if (!isDryRun) {
          let c = readFileSync(src, "utf8");
          c = c.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
          c = c.replace(/\{\{PROJECT_DESC\}\}/g, projectDesc);
          writeFileSync(dest, c, "utf8");
        }
      }
    }
    console.log("  ✅ Initialized: ./.agents/context/ (product, architecture, decisions, roadmap)");
  }

  // 1.7 Initialize Cognitive Memory (.memory/ + CURRENT.md)
  const memoryDir = join(resolvedTarget, ".memory");
  if (!existsSync(memoryDir) && !isDryRun) {
    console.log("  🧠 Initializing persistent cognitive memory store...");
    mkdirSync(memoryDir, { recursive: true });

    // Check if musememory CLI is available
    const hasMemoryCli = spawnSync("which", ["memory"], { stdio: "ignore" }).status === 0;
    if (hasMemoryCli) {
      spawnSync("memory", ["init"], { cwd: resolvedTarget, stdio: "ignore" });
      console.log("  ✅ Initialized: ./.memory/ via Muse Memory CLI");
    } else {
      // Create baseline CURRENT.md for agent coordination
      const baselineCurrent = `# Active Project Constraints & In-Flight Context

> **Operational Guidelines**:
> - **For Humans**: Single-pane executive summary of active hard constraints and in-flight agent tasks. Zero verbose logs or transient filler.
> - **For AI Agents**: Mandatory grounding rules (never violate active constraints) and concurrent workstream awareness (check what other agents are touching before editing files).

---

## 🔒 Active Working Invariants & Hard Constraints
- **Vibeguard Secret Defense**: Never commit, print, or log plaintext secrets, tokens, or credentials. Always mask as \`[REDACTED]\`.
- **Definition of Done**: Work is complete only when all verification gates pass independently (tests pass, build succeeds, working tree is clean).

## 🤖 Active Concurrent Agent Workstreams
| Agent / Session ID | Status | Active Task | Target Scope / Files | Last Active |
| :--- | :--- | :--- | :--- | :--- |
`;
      writeFileSync(join(memoryDir, "CURRENT.md"), baselineCurrent, "utf8");
      console.log("  ✅ Initialized: ./.memory/CURRENT.md");
    }
  }

  console.log("  🛡️ Stage 1 Complete: Governance container active.\n");

  // =========================================================================
  // STAGE 2: Project Type (Framework Generation)
  // =========================================================================
  if (projectType !== "none" && !isDryRun) {
    console.log(`🚀 STAGE 2: Launching ${projectType.toUpperCase()} Framework Creator...`);
    console.log("   (Interactive framework configuration options will follow)\n");

    try {
      if (projectType === "astro") {
        spawnSync("bun", ["create", "astro@latest", "."], {
          cwd: resolvedTarget,
          stdio: "inherit",
        });
      } else if (projectType === "nextjs") {
        spawnSync("bun", ["create", "next-app@latest", "."], {
          cwd: resolvedTarget,
          stdio: "inherit",
        });
      } else if (projectType === "wordpress") {
        console.log("   Initializing Modern WordPress project (Roots Bedrock or Theme scaffold)...");
        const hasComposer = spawnSync("which", ["composer"], { stdio: "ignore" }).status === 0;
        if (hasComposer) {
          console.log("   Bootstrapping Roots Bedrock via Composer...");
          spawnSync("composer", ["create-project", "roots/bedrock", "."], {
            cwd: resolvedTarget,
            stdio: "inherit",
          });
        } else {
          console.log("   Composer not detected. Scaffolding modern custom WordPress theme/plugin layout...");
          mkdirSync(join(resolvedTarget, "wp-content/themes", projectName), { recursive: true });
          mkdirSync(join(resolvedTarget, "wp-content/plugins"), { recursive: true });
          writeFileSync(
            join(resolvedTarget, "wp-content/themes", projectName, "style.css"),
            `/*\nTheme Name: ${projectName}\nAuthor: Agency Council\nVersion: 1.0.0\n*/\n`,
            "utf8"
          );
          writeFileSync(
            join(resolvedTarget, "wp-content/themes", projectName, "index.php"),
            `<?php\n// Silence is golden.\n`,
            "utf8"
          );
          writeFileSync(
            join(resolvedTarget, "wp-content/themes", projectName, "functions.php"),
            `<?php\n// Theme functions\n`,
            "utf8"
          );
        }
      } else if (projectType === "hono") {
        spawnSync("bun", ["create", "hono@latest", "."], {
          cwd: resolvedTarget,
          stdio: "inherit",
        });
      } else if (projectType === "vite") {
        spawnSync("bun", ["create", "vite@latest", "."], {
          cwd: resolvedTarget,
          stdio: "inherit",
        });
      } else if (projectType === "instatic") {
        console.log("   Cloning Instatic pure-HTML static starter...");
        spawnSync("git", ["clone", "--depth", "1", "https://github.com/corebunch/instatic.git", "."], {
          cwd: resolvedTarget,
          stdio: "inherit",
        });
      }
      console.log(`\n  ✅ Stage 2 Complete: ${projectType.toUpperCase()} framework initialized.`);
    } catch (err) {
      console.warn(`  ⚠️ Framework initialization warning: ${err}`);
    }
  } else if (projectType === "none") {
    console.log("⚡ STAGE 2: Skipped (Governance-only workspace requested).");
  }

  // =========================================================================
  // STAGE 3: Closeout DOX Pass & Initial State Recording
  // =========================================================================
  console.log("\n📋 STAGE 3: Recording Initial Shipped State in .agents/context/current.md...");

  if (!isDryRun) {
    const currentMdPath = join(resolvedTarget, ".agents/context/current.md");
    if (existsSync(currentMdPath)) {
      // Gather top-level files for initial live artifacts list
      const topFiles = readdirSync(resolvedTarget).filter((f) => !f.startsWith(".") && f !== "node_modules");
      const artifactList = topFiles.map((f) => `- \`${f}\` — Initial ${f.includes(".") ? "configuration / root file" : "source directory"}`).join("\n");

      const initialCurrentContent = `# 📍 Current Shipped State & System Reality

> **Purpose**: The living snapshot of what is built, verified, and running in this repository, alongside active blockers and placeholders. Updated during the Closeout DOX Pass (Phase 5).

---

## 1. Verified Shipped Reality
- Initialized **${projectName}** with **${projectType.toUpperCase()}** archetype.
- Progressive Disclosure DOX container active with 13 modular standards, brand token baseline, and cognitive memory.

## 2. Live Deliverables & Key Artifacts
${artifactList}

## 3. Runtime Health & Verification Oracle
- **Framework**: ${projectType.toUpperCase()}
- **Governance**: Active via root \`AGENTS.md\` and \`.agents/\` container
- **Verification**: Pending initial build / test verification run

## 4. Known Gaps & Blockers
- None (Fresh scaffold initialization).

## 5. Next Immediate Focus
- Run framework dependencies installation (\`bun install\` / \`npm install\` / \`composer install\`).
- Verify initial local dev server and test execution.
`;
      writeFileSync(currentMdPath, initialCurrentContent, "utf8");
      console.log("  ✅ Updated: ./.agents/context/current.md with initial reality");
    }
  }

  console.log("\n=======================================================");
  console.log(" 🎉 SUCCESS: Project Successfully Initialized!");
  console.log("=======================================================");
  console.log(`📁 Project Directory: ${resolvedTarget}`);
  console.log(`⚡ Archetype:          ${projectType.toUpperCase()}`);
  console.log(`🛡️  Governance:         DOX Engine Active (Root AGENTS.md + .agents/ container)`);
  console.log(`\nNext Steps:`);
  console.log(`  1. cd ${relative(process.cwd(), resolvedTarget) || "."}`);
  if (projectType === "wordpress") {
    console.log(`  2. composer install`);
  } else if (projectType !== "instatic" && projectType !== "none") {
    console.log(`  2. bun install (or pnpm install)`);
    console.log(`  3. bun run dev`);
  }
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("❌ Scaffolding Error:", err);
  process.exit(1);
});
