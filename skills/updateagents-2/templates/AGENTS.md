[//]: # (updateagents:managed)
# {{PROJECT_NAME}} — Workspace Instructions

> **Agent**: {{AGENT_NAME}} ({{AGENT_ROLE}}) · **Purpose**: {{PROJECT_DESC}}
> **Governance**: {{GOVERNANCE_MODEL}} · **Toolchain**: {{TOOLCHAIN}}
> **Repository**: {{REPOSITORY_REFERENCES}}

## Instruction Hierarchy

This file and each `AGENTS.md` from workspace root to target path are binding; the nearest governs local details. Project context in `.agents/context/` is authoritative for project purpose, architecture, stack and current state. `~/.agents/identity/` supplies the user's global identity, preferences, machine rules and tool inventory only when project context has no override. Use the name the user's agent system defines; if unavailable, ask rather than invent one. Inherit global identity, never copy personal identity into the project.

If `.agents/context/imported-agent-instructions.md` exists, read it before every task and apply its rules within their recorded source scopes. Report conflicting rules with their source paths and ask the user; never silently discard or choose between them.

## Two-Tier Identity & Context Resolution Cascade

Agent execution resolves context through a two-tier cascade:

1. **Local Project Scope (`./.agents/context/` & optional `./.agents/identity/`)**:
   - Primary authority for domain problem, ICP, architecture, stack allowlist, and sprint milestones (`product.md`, `architecture.md`, `stack.md`, `current.md`, `roadmap.md`).
   - Closer docs always govern local execution details.
2. **Global Principal Baseline (`~/.agents/identity/`)**:
   - Fallback authority for principal profile (`user.md`), default assistant delegation (`assistant.md`), strategic life/venture trajectory and intent (`vision.md`), global machine invariants (`rules.md`), and host toolchain inventory (`stack.md`).
   - If local project context does not specify an override, inherit global preferences seamlessly without duplicating global goals into the project tree.

## Rules for Every Task

1. **Context**: Start responses with `[Context: ~X% used]`; at 70%, ask before compaction. Byte-cap large command output.
2. **Secrets**: Never print, echo, log or commit credentials; don't ingest whole `.env` files when names suffice. Run configured SecretScan before finalizing.
3. **Destructive commands**: Do not run `rm -rf`, `git reset --hard`, force-pushes or shell piping until you state blast radius and rollback plan and receive user authorization.
4. **Confidence**: Below 80%, stop and ask; 80–90%, state the assumption; above 90%, proceed.
5. **Unknowns**: If a material project fact or choice cannot be verified, ask the user directly, apply their answer, then continue. Never invent identities, contacts, repo hosts or policy; keep unrelated work moving.
6. **Evidence and language**: Verify with relevant tests, logs, runtime or rendered output before claiming completion. Use English for agent responses, code, comments, commits, specifications and docs.
7. **Working artifacts**: Put plans, research and reports in `.agents/artifacts/<topic>/`; put user-supplied URLs, data, logs and exports submitted for extraction in `.agents/dump/<category>/<descriptive-file-name>`. Keep them out of the repo root and `.memory/`; never store secrets in dumps. Archive retired scratchpads in `.agents/archive/`; promote durable findings to `.agents/context/`.
8. **Closeout**: After every completed task, record session state only through the project's memory tooling or CLI, never by editing store files directly, and skip the step entirely where the project has no memory system. Update `.agents/context/current.md` when shipped state or active constraints changed. Then, **only for user-facing work** (see Session Report Protocol), append the **Layman Report** — never as a replacement for the technical report, always after it.
9. **Modern tools**: Invoke installed modern binaries by name; agent subshells may not load shell aliases. Preferred tools detected at scaffold: {{INSTALLED_MODERN_TOOLS}}. Use legacy fallbacks only when the preferred binary is unavailable: `rg`→`grep`, `fd`→`find`, `bat`→`cat`, `eza`→`ls`, `sd`→`sed`, `gojq`/`choose`→`jq`/`cut`, `delta`→`git diff`, `zoxide`→`cd`. Never require undetected tools.
10. **Synthetic wrappers**: Never propagate synthetic ADE/IDE payloads, including `[[ORCA_RICH_MD:...]]`, Cursor, Windsurf or Claude `<antArtifact>` wrappers. Unwrap and URL-decode to raw content, sanitize it, and backtick literal tokens such as `<issue-id>`. Run `updateagents --sanitize` to scan and unwrap a workspace.
11. **Packages**: In `<owner>/<repo>#<ref>`, `#<ref>` is a Git branch/tag/commit. Keep install targets clean (for example, `npx skills add <owner>/<repo>`); never publish raw commit SHAs or arbitrary refs. Installers using `git clone --depth 1 --branch <ref>` reject commit SHAs as missing remote branches. Add a ref only when required and only if it is a valid branch/tag. Use `@latest` only when latest is explicitly requested.
12. **Change discipline**: Keep changes focused; avoid unnecessary refactors, renames, frameworks, dependencies and infrastructure. Separate structural refactors from behavior changes. If `CHANGELOG.md` exists, add a concise entry under `Unreleased` for each shipped user-visible change; don't record unverified work or internal no-ops.
13. **Legacy-write promotion**: Never write or update foreign-harness instruction files (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, `.cursorrules`, `.windsurfrules`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, etc.). Intercept and promote rule-like guidance to `.agents/standards/` and project facts to `.agents/context/` via `updateagents --promote <path>` before resyncing `AGENTS.md`. Compiled IDE artifacts are regenerated via `updateagents --sync-ide`, never hand-edited.
14. **Harness independence & install paths**: Default to global-standard layout first: project `.agents/` (`standards/`, `context/`, `identity/`, `artifacts/`), then home-level agent config (`~/.agents/AGENTS.md`, `~/.agents/skills/`). If an opt-in harness follows the `.agents` and `AGENTS.md` standard, do not create its own files; have it follow the DOX engine directly. Harness-specific paths (`.claude/`, `.cursor/`, `.gemini/`, `.windsurf/`, `.codex/`, `~/.claude/settings.json`, etc.) are permitted only as explicit opt-in when that harness cannot read `AGENTS.md` natively. Never default an install path, tool script, or hook configuration to a harness-specific location.
15. **Landing Gate (core invariant)**: A commit is not a delivery. Work is LANDED only when reachable from the integration branch on the remote; until then it is LOCAL. The words landed/shipped/merged/released/deployed/"verified on <branch>" may be used ONLY after the gate exits 0 in the same session. Verdicts: LANDED/LOCAL, REVIEWABLE/NOT REVIEWABLE (never "NOT LANDED"). Full standard: `.agents/standards/landing-gate.md`. Gate: `bun run check:landed` (or this repo's equivalent).
16. **Test-Failure Audit (core invariant)**: When the same test or failure signature fails on two or more consecutive runs, stop editing, run a self-audit of the agent's own outputs (did the edit land? is the test exercising it? pre-existing on clean tree? flaky/env?), triage the root cause, then apply a targeted fix and re-run the full suite. Verdicts: SELF-AUDIT COMPLETE / SELF-AUDIT PENDING. Full standard: `.agents/standards/test-failure-audit.md`.
17. **Session Report**: For user-facing work, every completed task ends with two reports, in this order: (a) the technical report (files changed, commands run, tests, evidence), then (b) a **Layman Report** appendix — plain language, one bullet per file/skill/task touched, saying in everyday terms what changed and why, no jargon, no code. The Layman Report is additive: it never replaces, summarizes-away, or reorders the technical report. It is **never** emitted in agent-to-agent communication, subagent results, or internal tool flows. See the Session Report Protocol below.

## Session Report Protocol

**When to emit (scoping):**
- **Emit** the Layman Report for top-level, user-facing work — anything the user asked for and will read as the final answer.
- **Suppress** it entirely in agent-to-agent communication, subagent results, internal tool flows, and background/automated runs: those carry the technical report only.
- **Ask-first option:** when unsure whether the user wants the plain-language version, finish the technical report, then ask once ("Want the plain-language summary too?") and append it only on confirmation.

When a task is complete, the agent emits **two reports, in this order** (user-facing only):

1. **Technical report** — what changed (files, commands, tests, evidence, verification). This is the canonical record.
2. **Layman Report (appendix)** — the same work explained for a non-technical reader:
   - One bullet per file, skill, or task touched.
   - Plain language only: no jargon, no code snippets, no internal identifiers; if a technical term is unavoidable, define it inline in one short phrase.
   - Each bullet states **what changed** and **why it matters to the user**, not how it was implemented.
   - Group bullets by area (e.g., "Agency delivery", "Context orchestration") when more than ~8 bullets.
   - Never replaces, truncates, or reorders the technical report; it is appended after it, clearly labeled "Layman Report".

**Why both:** the technical report is for verification and future agents; the Layman Report is for the human owner who needs to understand outcomes without reading code. For user-facing work, a report without the Layman appendix is incomplete; a report with only the Layman appendix is never acceptable. (Agent-to-agent flows carry the technical report alone.)

## Required Standards

Read every **Always required** standard before work and every **Required when detected or selected** standard that applies. These are mandatory, not optional background reading. `updateagents` refreshes applicability from project evidence; ask when uncertain. If the user confirms one does not apply, unlink it here but retain its file.

**Always required**

[//]: # (ALWAYS_REQUIRED_STANDARDS:start)

- [Execution &amp; Cognitive Kernel](./.agents/standards/execution-kernel.md) — Judgment rules, modern CLI matrix, sanitization, and refactoring discipline.
- [Security &amp; Vibeguard](./.agents/standards/security-vibeguard.md) — Secret isolation, destructive-command gates, and untrusted-output defense.
- [Boundary Governance](./.agents/standards/boundary-governance.md) — Goal, facts, method, proof, and scope checkpoints.
- [Development Workflows](./.agents/standards/workflows.md) — Task tiers, execution phases, and verification gates.
- [Instruction Hierarchy](./.agents/standards/dox-hierarchy.md) — Instruction precedence, subtree contracts, and context closeout.
- [Landing Gate](./.agents/standards/landing-gate.md) — Delivery is not commitment: LANDED/LOCAL and REVIEWABLE/NOT REVIEWABLE verdicts, the gate, and the staging rule.
- [Test-Failure Audit](./.agents/standards/test-failure-audit.md) — Self-triage on repeated red: audit own outputs, triage root cause, then fix.
- [Context, Memory &amp; Identity](./.agents/standards/memory-context.md) — Project/global context sources and persistent-memory lifecycle.
- [Anti-Patterns](./.agents/standards/anti-patterns.md) — Failure patterns and preferred alternatives.
- [Team Roles &amp; Routing](./.agents/standards/council-roles.md) — Configured role responsibilities and task routing.
- [Project Context Map](./.agents/context/index.md) — Project purpose, architecture, current state, decisions, and roadmap.

[//]: # (ALWAYS_REQUIRED_STANDARDS:end)

**Required when detected or selected**

[//]: # (CONDITIONAL_STANDARDS:start)

- [Git Workflow](./.agents/standards/git-workflow.md) — Branches, atomic feature PRs, commit format, releases, and clean package refs.
- [Next.js &amp; React](./.agents/standards/frontend-nextjs.md) — Next.js/React: App Router, React patterns, server/client boundaries.
- [Astro](./.agents/standards/frontend-astro.md) — Astro: static-first pages, interactive islands, and content collections.
- [Cloudflare Workers &amp; Hono](./.agents/standards/backend-workers-hono.md) — Worker APIs, Hono routes, and edge data access.
- [WordPress](./.agents/standards/backend-wordpress.md) — WordPress architecture and operational conventions.
- [Agency Tech Stacks](./.agents/standards/tech-stacks.md) — framework or stack selected; approved tooling boundaries.
- [Design System](./.agents/brand/design.md) — UI tokens, component states, and responsive consistency.
- [Accessibility](./.agents/brand/a11y.md) — WCAG, contrast, keyboard access, and assistive technology.
- [Visual Inspection](./.agents/standards/visual-inspection.md) — rendered-output checks for visual UI changes.
- [BEM CSS](./.agents/brand/bem-conventions.md) — Block–Element–Modifier naming and shallow selector depth.
- [Fintech Gateways &amp; Tax Compliance](./.agents/standards/fintech-gateways.md) — payment settlement, reconciliation, and applicable tax handling.
- [Evidence-Based Client Reporting](./.agents/standards/client-reporting.md) — delivery claims grounded in artifacts and verification.
- [Animated Technical Diagrams](./.agents/standards/motion-diagrams.md) — accessible, lightweight SVG diagrams and data-flow animation.
- [System, Domain &amp; Resilience Design](./.agents/standards/system-design.md) — domain modeling, failure handling, and migration resilience.
[//]: # (CONDITIONAL_STANDARDS:end)

[//]: # (muse-secretary-router:start)

## Secretary Protocol

At the first prompt and every new task, activate `secretary:dispatch` by reading `~/.agents/skills/secretary/references/dispatch.md` (or the project copy at `.agents/skills/secretary/references/dispatch.md`). Triage the request, select the department and mode, read the selected skill's `SKILL.md` and mode reference, then act. Route through configured Council roles. Secretary dispatches by instruction; it is not a background process.

Route Coach when its coaching modes fit; it is not a background process and does not replace task closeout.

[//]: # (muse-secretary-router:end)
