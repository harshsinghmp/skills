# 🤖 ai-ready

> Universal AI-readiness auditor, Agent Engine DOX scaffolder, and PR convention miner.

`ai-ready` audits any software repository against **13 tracked assets** across AI Context, Dev Workflow, and Onboarding & Governance. It serves as the **master home of the Agent Engine DOX template bundle**, cuts token burn via a **Stage-0 Fast-Skip Gate**, and mines merged PR reviews into explicit agent rules.

---

## 🚀 Quick Start

### 1. Run Complete Audit (Fast-Skip Enabled)
Inspects repository health and outputs the 13-asset scorecard (exits in `<100ms` if already 13/13):
```bash
bun path/to/ai-ready/scripts/ai-ready.ts [targetPath] --audit
```

### 2. Scaffold Agent Engine & Workflow Assets
Directly provisions the complete 9-folder container, 13 modular standards (including WordPress), brand tokens, lean root `AGENTS.md`, the `.mcp.json` tool-config template, an `llms.txt` discovery skeleton, the `.github/` bundle (dependabot, issue templates, PR template), and `.env.example`:
```bash
bun path/to/ai-ready/scripts/ai-ready.ts [targetPath] --scaffold

# Or dry-run simulation:
bun path/to/ai-ready/scripts/ai-ready.ts [targetPath] --scaffold --dry-run
```
Never overwrites existing files; scaffolding fills only genuine gaps.

### 3. Stage-0 Fast-Skip Gate
On repositories that already have all 13 assets in place and verified:
```text
[ai-ready] Repository is AI-ready (13/13). Skipping pass.
```
*Zero token burn. Exits immediately so the agent can focus on your feature work.*

### 4. CI Gate (`--fail-under`)
Use the audit as a merge gate — the process exits `1` when the verified score falls below the threshold:
```bash
bun path/to/ai-ready/scripts/ai-ready.ts [targetPath] --fail-under 8
```

---

## 📋 The 12 Tracked Assets

| Category | # | Asset | Purpose |
|:---|:---|:---|:---|
| **AI Context** | 1 | `AGENTS.md` | Lean root router (`<50 lines`) pointing to modular standards. |
| | 2 | `.agents/` | 9-folder progressive disclosure container. |
| | 3 | `.mcp.json` or `.agents/`, `.cursor/`, `.gemini/` | Authorized MCP tools and server configs. `.agents/` is universal for any AI agent. |
| | 4 | `llms.txt` | Machine-readable index for agent web crawlers & discovery. |
| **Dev Workflow** | 5 | `.github/workflows/ci.yml` | Automated build, lint, and test gate on PRs. |
| | 6 | `.github/ISSUE_TEMPLATE/` | Structured bug and feature issue forms. |
| | 7 | `.github/pull_request_template.md` | Verification checklist and evidence enforcement. |
| | 8 | `.github/dependabot.yml` | Automated vulnerability and dependency updates. |
| **Onboarding** | 9 | `CHANGELOG.md` | Keep a Changelog taxonomy with `[Unreleased]` section. |
| | 10 | `CONTRIBUTING.md` | Conventional Commits, branch rules, and PR lifecycle. |
| | 11 | `docs/` or `.agents/context/` | Single source of truth for product & architecture. |
| | 12 | `.gitignore` + `.env.example` | Zero-secret exposure guarantee and credentials exclusion. |

---

## 🏆 Scoring Maturity

| Score | Tier | Meaning |
|:---:|:---|:---|
| **1–4** | 🥉 **Getting Started** | Basics present, but agents guess conventions and lack CI verification. |
| **5–7** | 🥈 **On Track** | Agents assist effectively, but lack structural boundaries and issue schemas. |
| **8–10** | 🥇 **Solid** | High confidence; agents follow automated testing and branch rules. |
| **12–13** | 🏆 **AI-Ready** | Autonomous excellence; zero-slop PRs, self-testing CI, and verified isolation. |

---

## 🔗 Council & Engine Integration

- **`new-project`**: Invokes `ai-ready` as Stage-0 pre-flight. If the target repository already has a healthy `.agents/` container, scaffolding is skipped automatically.
- **`updateagents`**: Runs `ai-ready` audit first to detect structural drift before modifying instruction files.
- **`git`**: Enforces that feature PRs adhere to the issue templates and verification checklists established by `ai-ready`.

---

## 📜 License

MIT © [Harsh Singh](https://github.com/harshsinghmp)
