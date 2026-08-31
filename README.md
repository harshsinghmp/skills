# 🧠 Harsh's Curated Skills Hub (`harshsinghmp/skills`)

[![CI](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml)
[![Upstream Sync](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills Count](https://img.shields.io/badge/Skills-142+-success.svg)](skills/)

> **A single downstream clearinghouse and package hub aggregating, validating, and auto-updating 140+ production-grade AI Agent Skills across multiple upstreams.**

Works natively with **Claude Code**, **Codex**, **Antigravity**, **OpenCode**, **Oh-My-Pi**, **Hermes**, **Cursor**, **Windsurf**, and any MCP / AI Agent ecosystem via `npx skills`.

---

## ⚡ Quick Start — Installing Skills with `npx skills`

You can install any or all skills directly from this repository without cloning or manual configuration:

### 1. Interactive Multi-Select (Pick the skills you need)
```bash
npx skills add harshsinghmp/skills
```
*Displays an interactive checklist of all 142+ skills with descriptions so you can choose which ones to add to your current workspace.*

### 2. Install ALL Skills in One Command
```bash
npx skills add harshsinghmp/skills -a
```

### 3. Install Globally (Available across every project on your workstation)
```bash
npx skills add harshsinghmp/skills -g
```
*Installs directly into `~/.agents/skills/` so all your local CLI agents can access them across all repositories.*

### 4. Install Specific Skills Directly
```bash
# Workflow & Reasoning
npx skills add harshsinghmp/skills/systematic-debugging
npx skills add harshsinghmp/skills/answer-first
npx skills add harshsinghmp/skills/save-progress

# Agency Divisions
npx skills add harshsinghmp/skills/agency-brand-guardian
npx skills add harshsinghmp/skills/agency-backend-architect

# Life Automation & Operations
npx skills add harshsinghmp/skills/company-setup
npx skills add harshsinghmp/skills/inbox-executive-assistant
npx skills add harshsinghmp/skills/crm-hygiene

# Social Media & Content Generation
npx skills add harshsinghmp/skills/analytics-dashboard
npx skills add harshsinghmp/skills/hook-generator
npx skills add harshsinghmp/skills/gemini-carousel

# Cognitive & Memory
npx skills add harshsinghmp/skills/muse-ground
npx skills add harshsinghmp/skills/ai-second-brain
```

---

## 🏛️ Skill Categories & Catalog Overview

| Category | Skills Count | Key Skills Included | Description |
| :--- | :---: | :--- | :--- |
| **🛡️ Quality & Security Governance** | 8 | `agency-code-reviewer`, `agency-reality-checker`, `agency-evidence-collector`, `exposure-audit`, `secure-code-guardian`, `security-reviewer` | Strict verification, credential & API key exposure auditing, security review, and zero-fantasy approvals. |
| **⚡ Engineering & Architecture** | 22 | `agency-backend-architect`, `agency-frontend-developer`, `agency-senior-developer`, `typescript-pro`, `javascript-pro`, `sql-pro`, `database-optimizer`, `spec-miner`, `mcp-builder` | Production backend/frontend architecture, type safety, database tuning, API design, and MCP server authoring. |
| **🎨 Creative, UI/UX & Visuals** | 18 | `agency-brand-guardian`, `agency-ui-designer`, `agency-ux-architect`, `show-me`, `gemini-carousel`, `gemini-infographic`, `graphic-designer`, `youtube-thumbnail`, `reels-scripting`, `ux-patterns` | Interactive dark-theme dashboards, visual rendering, design systems, WCAG accessibility, and motion design. |
| **🚀 Growth, Marketing & Social Media** | 40 | `analytics-dashboard`, `content-matrix`, `hook-generator`, `newsletter-voice`, `niche-research`, `pinned-comment`, `post-formatter`, `post-scorer`, `post-writer`, `profile-optimizer`, `quote-post`, `voice-builder`, `agency-growth-hacker`, `agency-seo-specialist` | High-impact social media frameworks, viral hook generation, audience targeting, and content scoring. |
| **📦 Operations & Life Automation** | 24 | `company-setup`, `crm-hygiene`, `doc-drafter`, `expense-wrangler`, `follow-up-chaser`, `inbox-executive-assistant`, `invoice-chaser`, `meeting-notes`, `meeting-scheduler`, `research-brief`, `standup-writer`, `task-capture`, `weekly-review`, `close`, `agency-senior-project-manager` | Automated admin workflows, CRM enrichment, calendar booking, invoice chasing, and loose-end closing. |
| **🔄 Superpowers Core Workflows** | 9 | `test-driven-development`, `systematic-debugging`, `executing-plans`, `writing-plans`, `brainstorming`, `subagent-driven-development`, `using-git-worktrees` | Disciplined TDD, root-cause debugging, plan execution, and multi-agent coordination. |
| **🧠 Cognitive, Knowledge & Memory** | 9 | `answer-first`, `ai-second-brain`, `save-progress`, `muse-brief`, `muse-capture`, `muse-current`, `muse-graph`, `muse-ground`, `muse-wiki` | Concise direct communication, living Karpathy second-brains, and persistent cognitive memory. |

---

## 🔄 Automated Upstream Synchronization

This repository uses an automated **GitHub Actions Sync Engine** (`.github/workflows/sync-skills.yml`) that runs daily at **04:00 UTC**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Upstream Repositories                    │
│  • charlie947/answer-first     • charlie947/life-automation │
│  • charlie947/social-media     • charlie947/ai-second-brain │
│  • charlie947/exposure-audit   • charlie947/show-me         │
│  • charlie947/close            • charlie947/save-progress   │
│  • harshsinghmp/muse-agents    • obra/superpowers           │
│  • harshsinghmp/musememory     • harshsinghmp/muse-skills   │
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
bun run sync -- --filter answer-first

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
