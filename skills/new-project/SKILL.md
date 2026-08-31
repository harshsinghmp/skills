---
name: new-project
description: "Interactive project creator and Project OS provisioner. Bootstraps canonical /docs/, 8-stage reality machine (STATE.md), .agentrules, AGENTS.md (Muse Council), dynamic llms.txt, .gitignore, and selective skill bundles into any repository or directory."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [scaffolding, governance, project-os, architecture, nextjs, astro, vite]
    related_skills: [updateagents, agent-handoff]
    requires_tools: [bash, view_file, write_to_file]
---

# 🚀 new-project — Autonomous Project OS & Governance Scaffolder

Interactive project creator and Project Operating System provisioner. Bootstraps the 10 Canonical `/docs/` knowledge base, 8-stage reality state machine (`STATE.md`), Council governance (`AGENTS.md`), dynamic `llms.txt`, `.gitignore`, and selective skill bundles into any workspace.

---

## When to Use

- User asks to *"create a new project"*, *"scaffold a workspace"*, or *"initialize Project OS"*.
- Setting up a new client application, microservice, or prototype.
- Upgrading an existing unorganized repository to the LifeOS Agency Council architecture.
- Bootstrapping AI governance (`.agentrules`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `STATE.md`).

---

## Quick Reference

| Tech Stack Archetype | Framework Target | Generator Command / Tool |
|:---|:---|:---|
| **Next.js 16** | App Router + Tailwind v4 + React 19 | `npx -y create-next-app@latest` |
| **Astro** | Static / SSR + Tailwind v4 + TS | `npx -y create-astro@latest` |
| **Vite + React** | Client SPA + TypeScript | `npx -y create-vite@latest` |
| **Node / Bun Backend** | Fastify / Hono API service | Bun native init |
| **WordPress / PHP** | Custom theme & plugin environment | PHP / Composer baseline |
| **Generic / Vanilla** | TypeScript library or tool | TypeScript strict starter |

---

## Procedure

### Step 1: Location & Folder Selection
Guide the user through interactive selection:
1. **Existing Projects Scan**: Scan `/home/harsh/Projects/` and present immediate selectable options.
2. **New Subfolder Creation**: Option to create `/home/harsh/Projects/<name>`.
3. **Current Working Directory**: Option to scaffold in `.`.

### Step 2: Tech Stack Selection (Always Latest)
Select framework archetype and extract project name and description.

### Step 3: Skill Preset Selection
- `[agency-suite]` *(Recommended / Default)*: Full agency suite (Design, Animation, Taste, Fullstack).
- `[design]`: Core design tokens, motion, and UI patterns.
- `[fullstack]`: Auth, API security, Next.js patterns, E2E testing.
- `[growth]`: CRO, SEO audit, keyword clustering, landing page copywriting.
- `[all]`: Complete workspace skill library.
- `[none]`: Lightweight baseline without skill copies.

### Step 4: AI Dotfiles & Governance Confirmation
Confirm generation of:
1. `.agentrules` (Vibeguard zero secret leakage + evidence-before-claims).
2. `AGENTS.md` (Muse as Chief Orchestrator, Sol, Jasper, Crew, Nexus).
3. `CLAUDE.md` (Operational commands & guidelines).
4. `.gitignore` (Hardened default ignore rules including agents, IDEs, and environments).
5. `llms.txt` & `llms-full.txt` + `scripts/generate_llms_txt.ts`.
6. `docs/01_OVERVIEW.md` through `docs/10_UNRESOLVED.md`.
7. `STATE.md` (8-Stage Reality Machine) & `SUMMARY.md` (Change Ledger).
8. `scripts/nexus_verify.sh` & `tests/e2e/harness_probe.spec.ts`.

### Step 5: Execution Command
Run the universal provisioner script:

```bash
bun ~/.claude/LIFEOS/TOOLS/NewProject.ts "<targetPath>" --name="<projectName>" --type="<type>" --desc="<description>" --skills="agency-suite"
```

---

## Pitfalls

- **Skipping Invariant Probes**: Never leave the project without running initial `scripts/nexus_verify.sh`.
- **Committing Secrets**: Always ensure `.env.example` exists and `.env` is listed in `.gitignore`.
- **Premature State Claims**: Never mark features as `LOCAL_VERIFIED` or `PROD_VERIFIED` in `STATE.md` without command receipts.

---

## Verification

After scaffolding, execute and verify:
1. **Directory Structure**: `ls -la <targetPath>/docs <targetPath>/.agents/skills`
2. **LLM Documentation Generator**: `cd <targetPath> && bun scripts/generate_llms_txt.ts`
3. **Vibeguard Secret Scan**: `bun ~/.claude/LIFEOS/TOOLS/SecretScan.ts <targetPath>`
4. **Summary Presentation**: Report provisioned OS summary and immediate next actions to the user.
