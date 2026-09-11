# 🧠 AI Agent Skills Hub — 142+ Production-Grade Skills for Claude Code, Codex & MCP Agents

[![CI](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/ci.yml)
[![Upstream Sync](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml/badge.svg)](https://github.com/harshsinghmp/skills/actions/workflows/sync-skills.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills Count](https://img.shields.io/badge/AI_Agent_Skills-142-success.svg)](#-skill-catalog)
[![Install](https://img.shields.io/badge/Install-npx_skills_add-8A2BE2.svg)](#-quick-start--install-skills-with-npx-skills)

> **A single-source AI agent skills aggregator** — install, update, and manage **142+ curated, production-grade agent skills** for **Claude Code**, **Codex**, **Antigravity**, **OpenCode**, **Cursor**, **Windsurf**, and any MCP or AI agent ecosystem. Skills are auto-synced daily from 12 upstream repositories so you always get the latest versions from one command: `npx skills add harshsinghmp/skills`.

---

## 📑 Table of Contents

- [Quick Start](#-quick-start--install-skills-with-npx-skills)
- [Skill Catalog](#-skill-catalog)
- [Why an Aggregator?](#-why-an-aggregator)
- [Automated Upstream Synchronization](#-automated-upstream-synchronization)
- [Adding Skills by Link](#-adding-skills-by-link-aggregator-ingest)
- [Declarative Manifest](#-declarative-manifest-skillsmanifestjson)
- [FAQ](#-faq)
- [License](#-license)

---

## ⚡ Quick Start — Install Skills with `npx skills`

No cloning, no manual configuration. Install any of the 142+ AI agent skills directly into your workspace or globally:

### 1. Interactive Multi-Select (pick the skills you need)
```bash
npx skills add harshsinghmp/skills
```

### 2. Install ALL skills in one command
```bash
npx skills add harshsinghmp/skills -a
```

### 3. Install globally (available to every AI agent on your machine)
```bash
npx skills add harshsinghmp/skills -g
```
*Installs into `~/.agents/skills/` so Claude Code, Codex, OpenCode, Antigravity, and other local agents can access every skill across all your projects.*

### 4. Install specific skills directly
```bash
# Workflow & Reasoning
npx skills add harshsinghmp/skills/systematic-debugging
npx skills add harshsinghmp/skills/save-progress
npx skills add harshsinghmp/skills/writing-plans

# Engineering & Architecture
npx skills add harshsinghmp/skills/typescript-pro
npx skills add harshsinghmp/skills/sql-pro
npx skills add harshsinghmp/skills/mcp-builder

# Agency Divisions (marketing, engineering, governance)
npx skills add harshsinghmp/skills/agency-brand-guardian
npx skills add harshsinghmp/skills/agency-backend-architect

# Marketing & Social Media
npx skills add harshsinghmp/skills/hook-generator
npx skills add harshsinghmp/skills/post-writer

# Operations & Life Automation
npx skills add harshsinghmp/skills/inbox-executive-assistant
npx skills add harshsinghmp/skills/crm-hygiene

# Cognitive & Memory
npx skills add harshsinghmp/skills/muse-ground
npx skills add harshsinghmp/skills/save-progress
```

**Compatible agents:** Claude Code · Codex CLI · Antigravity · OpenCode · Oh-My-Pi · Hermes · Cursor · Windsurf · any MCP client.

---

## 📚 Skill Catalog

142+ curated AI agent skills organized into 7 categories:

| Category | Count | Representative Skills | What You Get |
| :--- | :---: | :--- | :--- |
| 🛡️ **Quality, Security & Governance** | 11 | `agency-code-reviewer`, `secure-code-guardian`, `security-reviewer`, `exposure-audit` | Verification gates, credential-exposure audits, OWASP-aligned security review |
| ⚡ **Engineering & Architecture** | 33 | `typescript-pro`, `javascript-pro`, `sql-pro`, `database-optimizer`, `spec-miner`, `mcp-builder`, `agency-backend-architect` | System design, type safety, query tuning, MCP server authoring |
| 🎨 **Creative, UI/UX & Visuals** | 19 | `agency-brand-guardian`, `show-me`, `gemini-carousel`, `graphic-designer`, `ux-patterns` | Design systems, visual rendering, accessibility, motion design |
| 🚀 **Growth, Marketing & Social** | 45 | `hook-generator`, `post-writer`, `newsletter-voice`, `profile-optimizer`, `analytics-dashboard` | Viral hooks, platform-specific content, audience research |
| 📦 **Operations & Delivery** | 17 | `inbox-executive-assistant`, `crm-hygiene`, `meeting-notes`, `invoice-chaser`, `weekly-review` | Admin automation, CRM hygiene, calendar and follow-up workflows |
| 🔄 **Orchestration & Paid Media** | 8 | `agency-agents-orchestrator`, `agency-paid-social-strategist`, `agency-ppc-campaign-strategist`, `agency-tracking-measurement-specialist` | Pipeline orchestration, paid-media strategy, measurement and attribution |
| 🧠 **Cognitive, Knowledge & Memory** | 9 | `muse-ground`, `muse-capture`, `muse-graph`, `muse-wiki`, `save-progress` | Persistent agent memory and structured second-brain workflows |

Every skill ships with a `SKILL.md` featuring YAML frontmatter (`name`, `description`) that any modern AI agent can index and load. Disciplined developer workflows (`test-driven-development`, `systematic-debugging`, `writing-plans`, `executing-plans`, `using-git-worktrees`) live in the Engineering category.

---

## 🎯 Why an Aggregator?

Skills for AI agents are authored across dozens of separate repositories. A single-source hub solves three real problems:

1. **One install command** — `npx skills add harshsinghmp/skills` instead of remembering a dozen GitHub URLs.
2. **Always current** — a nightly sync engine pulls the latest versions from every upstream, so skills update without you lifting a finger.
3. **Provenance & trust** — every synced skill carries an immutable `.upstream-meta.json` stamp (source repo, branch, commit SHA, sync time), so you always know exactly which upstream commit produced a prompt.

---

## 🔄 Automated Upstream Synchronization

A **GitHub Actions Sync Engine** (`.github/workflows/sync-skills.yml`) runs daily at **04:00 UTC** and performs four steps:

1. **Discover** — re-scans all 12 upstream repos and registers skills newly added upstream (zero manual manifest edits).
2. **Sync** — pulls changed skills using one shallow sparse clone per upstream, concurrent workers, retry logic, and default-branch fallback.
3. **Validate** — checks YAML frontmatter and skill structure (`bun run validate`).
4. **Review PR** — opens an auto-mergeable pull request with the full changelog diff.

```
┌─────────────────────────────────────────────────────────────┐
│                    Upstream Repositories                    │
│  obra/superpowers · harshsinghmp/muse-agents                │
│  harshsinghmp/musememory · harshsinghmp/muse-skills         │
│  ...any GitHub or git-host repo, added by URL               │
└──────────────────────────────┬──────────────────────────────┘
                               │  Daily GitHub Action (04:00 UTC)
                               │  discover → sync → validate → PR
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             harshsinghmp/skills (Downstream Hub)            │
│  • Auto-discovers new upstream skills (--discover)          │
│  • Content-hash sync: zero churn when nothing changed       │
│  • Provenance stamps (.upstream-meta.json)                  │
└─────────────────────────────────────────────────────────────┘
```

### CLI Commands

```bash
bun install

# Sync all upstreams defined in skills.manifest.json
bun run sync

# Sync + re-scan upstream repos to register newly added skills
bun run sync -- --discover

# Sync a specific skill by name filter
bun run sync -- --filter answer-first

# Preview discovery + sync without writing anything
bun run sync -- --discover --dry-run

# Validate all skills conform to the npx skills standard
bun run validate

# Run the test suite
bun test
```

---

## ➕ Adding Skills by Link (Aggregator Ingest)

Turn any upstream repository into part of this hub with a single command. The ingest engine resolves the link, discovers every skill inside it, registers it in `skills.manifest.json`, and syncs it immediately:

```bash
# Whole repo: ingest EVERY skill found in it
bun run add https://github.com/obra/superpowers

# Single skill via a tree URL
bun run add https://github.com/obra/superpowers/tree/main/skills/test-driven-development

# Shorthand works too
bun run add obra/superpowers
bun run add obra/superpowers/skills/test-driven-development

# Non-GitHub git hosts (GitLab, Bitbucket, self-hosted) via pure git protocol
bun run add https://gitlab.com/owner/repo

# Options
bun run add <url> --category engineering   # force a category
bun run add <url> --no-sync                # register without syncing
bun run add <url> --dry-run                # preview what would be registered
```

| Input | Behavior |
| :--- | :--- |
| `https://github.com/owner/repo` | Discover & ingest **all** skills in the repo |
| `https://github.com/owner/repo/tree/<ref>/<path>` | Ingest that one skill |
| `https://github.com/owner/repo/blob/<ref>/<path>/SKILL.md` | Ingest that one skill |
| `https://raw.githubusercontent.com/...` | Ingest that one skill |
| `owner/repo` | Discover & ingest all skills |
| `owner/repo/<path>` | Ingest that one skill |
| Any other git host URL | Clone & scan via git protocol |

Every ingested skill keeps its upstream link in the manifest — all future `bun run sync -- --discover` runs keep it updated automatically. Name collisions are suffixed (`-2`, `-3`), never silently overwritten. Release/archive URLs are rejected (resend as repo root or tree/blob link); `--category` accepts only the seven manifest categories.

---

## 📜 Declarative Manifest (`skills.manifest.json`)

Prefer manual control? Add an entry directly to [`skills.manifest.json`](skills.manifest.json):

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

**Repository architecture:** see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full syndication spec — sparse-checkout mechanics, discovery engine, and provenance contract.

---

## ❓ FAQ

**Which AI agents can use these skills?**
Any agent that reads `SKILL.md` files: Claude Code, Codex CLI, Antigravity, OpenCode, Cursor, Windsurf, Hermes, and MCP-based clients via the `npx skills` standard.

**How do skills stay up to date?**
A nightly GitHub Action discovers and syncs changes from 12 upstream repositories. Upstream edits reach this hub within 24 hours, gated behind a validated review PR.

**Can I add my own skills?**
Yes — pass any repo URL to `bun run add <url>`, or open a PR editing `skills.manifest.json`.

**Are the original skill authors credited?**
Yes. Every skill directory carries `.upstream-meta.json` with its source repository and exact commit, preserving full provenance.

**Is this free?**
MIT licensed. Install, fork, and redistribute freely.

---

## 📄 License

MIT © [Harsh Singh (harshsinghmp)](https://github.com/harshsinghmp)
