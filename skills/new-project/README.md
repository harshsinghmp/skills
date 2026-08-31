# `new-project` Skill

> Autonomous Project Operating System Provisioner & Agency Council Scaffolder.

`new-project` transforms any new or existing workspace from a standard code repository into a fully governed **AI-Native Operating Environment**. 

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill new-project
```

*(Full URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/new-project` is also supported).*

---

## Features

- **🏛️ 10 Canonical `/docs/` Sources**: Permanent, durable knowledge base (`01_OVERVIEW.md` through `10_UNRESOLVED.md`).
- **⚙️ 8-Stage Reality Machine (`STATE.md`)**: Enforces strict evidence progression (`PROPOSED` → `APPROVED` → `LOCAL_DEV` → `LOCAL_VERIFIED` → `STAGING_DEPLOYED` → `STAGING_VERIFIED` → `PROD_DEPLOYED` → `PROD_VERIFIED`) so discussed features are never confused with implemented ones.
- **👑 Council Governance (`AGENTS.md`)**: Codifies **Muse** as Chief Agency Orchestrator leading specialized divisions: Sol (Full-Stack), Jasper (Creative UI), Crew (Operations), and Nexus (Quality Gate).
- **📜 Meaningful Git Commit Protocol**: Enforces high-signal, conventional git commits across all automated workflows.
- **🛡️ Nexus Adversarial Verification Suite**: Generates `scripts/nexus_verify.sh` and Playwright probes for deterministic pre-ship audits.
- **📄 Dynamic `llms.txt` & `llms-full.txt` Generator**: Auto-indexes documentation and schemas for instant LLM ingestion.
- **📦 Curated Skill Bundling**: Copies selected agency skills directly into `<project>/.agents/skills` with `skills-lock.json`.

---

## Usage

Ask your AI assistant:
```
"create a new project"
"scaffold an Astro agency showcase"
"run /new-project"
"initialize Project OS in this directory"
```

Or run the CLI directly:
```bash
bun new-project/scripts/new-project.ts /path/to/project --name="MyApp" --type="nextjs" --skills="agency-suite"
```

---

## Archetypes Supported

- **Next.js 16** (App Router + Tailwind CSS v4 + React 19)
- **Astro** (Static / SSR + Tailwind CSS v4 + TS)
- **Vite + React** (TypeScript)
- **Node / Bun API Backend**
- **WordPress / PHP Theme & Custom Development**
- **Generic / Vanilla TS**
