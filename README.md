# 🧠 Harsh's Curated Skills Hub (`harshsinghmp/skills`)

[![CI](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml)
[![Upstream Sync](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills Count](https://img.shields.io/badge/Skills-106+-success.svg)](skills/)

> **A single downstream clearinghouse and package hub aggregating, validating, and auto-updating 100+ production-grade AI Agent Skills across multiple upstreams.**

Works natively with **Claude Code**, **Codex**, **Antigravity**, **OpenCode**, **Oh-My-Pi**, **Hermes**, **Cursor**, **Windsurf**, and any MCP / AI Agent ecosystem via `npx skills`.

---

## ⚡ Quick Start — Installing Skills with `npx skills`

You can install any or all skills directly from this repository without cloning or manual configuration:

### 1. Interactive Multi-Select (Pick the skills you need)
```bash
npx skills add harshsinghmp/skills
```
*Displays an interactive checklist of all 106+ skills with descriptions so you can choose which ones to add to your current workspace.*

### 2. Install ALL Skills in One Command
```bash
npx skills add harshsinghmp/skills -a
```

### 3. Install Globally (Available across every project on your workstation)
```bash
npx skills add harshsinghmp/skills -g
```
*Installs directly into `~/.agents/skills/` so all your local CLI agents can access them across all repositories.*

### 4. Install a Specific Skill Directly
```bash
npx skills add harshsinghmp/skills/systematic-debugging
npx skills add harshsinghmp/skills/agency-brand-guardian
npx skills add harshsinghmp/skills/muse-ground
```

---

## 🏛️ Skill Categories & Catalog Overview

| Category | Skills Included | Description |
| :--- | :--- | :--- |
| **🛡️ Quality Gate & Governance (Nexus)** | `agency-code-reviewer`, `agency-reality-checker`, `agency-evidence-collector`, `secure-code-guardian`, `security-reviewer`, `agency-performance-benchmarker` | Strict verification, evidence-backed certification, security auditing, and zero-fantasy approvals. |
| **⚡ Engineering & Architecture (Sol)** | `agency-backend-architect`, `agency-frontend-developer`, `agency-senior-developer`, `typescript-pro`, `javascript-pro`, `sql-pro`, `database-optimizer`, `spec-miner`, `mcp-builder` | Production backend/frontend architecture, type safety, database tuning, API design. |
| **🎨 Creative & UI/UX (Jasper)** | `agency-brand-guardian`, `agency-ui-designer`, `agency-ux-architect`, `agency-ux-researcher`, `agency-visual-storyteller`, `agency-whimsy-injector`, `ux-patterns`, `frontend-design` | Visual hierarchy, design systems, WCAG accessibility, motion design, and brand identity. |
| **🚀 Growth & Marketing** | `agency-growth-hacker`, `agency-seo-specialist`, `agency-social-media-strategist`, `agency-tiktok-strategist`, `agency-twitter-engager`, `agency-reddit-community-builder`, `agency-book-co-author` | Conversion rate optimization (CRO), search dominance, storytelling, and viral distribution loops. |
| **📦 Delivery & Operations (Crew)** | `agency-senior-project-manager`, `agency-studio-operations`, `agency-studio-producer`, `agency-agents-orchestrator`, `agency-git-workflow-master`, `updateagents` | Scope enforcement, milestone tracking, client delivery, and git workflow mastery. |
| **🔄 Superpowers Core Workflows** | `test-driven-development`, `systematic-debugging`, `executing-plans`, `writing-plans`, `brainstorming`, `subagent-driven-development`, `using-git-worktrees` | Disciplined TDD, root-cause debugging, plan execution, and multi-agent coordination. |
| **🧠 Cognitive & Memory (Muse)** | `muse-brief`, `muse-capture`, `muse-current`, `muse-graph`, `muse-ground`, `muse-wiki` | Persistent cognitive memory, active constraint synchronization, and AST graph grounding. |

---

## 🔄 Automated Upstream Synchronization

This repository uses an automated **GitHub Actions Sync Engine** (`.github/workflows/sync-skills.yml`) that runs daily at **04:00 UTC**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Upstream Repositories                    │
│  • harshsinghmp/muse-agents  (Agency Divisions)             │
│  • obra/superpowers          (Workflow Skills)              │
│  • harshsinghmp/musememory   (Cognitive Memory Skills)      │
│  • harshsinghmp/muse-skills  (Developer Tooling)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Daily GitHub Action (04:00 UTC)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             harshsinghmp/skills (Downstream Hub)            │
│  • Validates YAML frontmatter & structure (`bun validate`)  │
│  • Stamps commit provenance (`.upstream-meta.json`)         │
│  • Opens automated review PR with changelog diffs           │
└─────────────────────────────────────────────────────────────┘
```

### Manual Sync from CLI:
```bash
# Sync all upstreams defined in skills.manifest.json
bun run sync

# Sync a specific skill by filter
bun run sync -- --filter brand-guardian

# Validate all skills conform to npx skills standard
bun run validate

# Run unit tests
bun test
```

---

## 📜 Declarative Manifest (`skills.manifest.json`)

To add a new upstream skill, add an entry to `skills.manifest.json`:

```json
{
  "name": "my-new-skill",
  "category": "engineering",
  "description": "Clear actionable description for LLM indexing",
  "upstream": {
    "repo": "upstream-org/upstream-repo",
    "branch": "main",
    "sourcePath": "skills/my-new-skill"
  }
}
```

Then run `bun run sync` to pull it with automatic provenance stamping.

---

## 📄 License
MIT © [Harsh Singh (harshsinghmp)](https://github.com/harshsinghmp)
