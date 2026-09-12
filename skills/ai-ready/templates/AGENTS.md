# 🏛️ {{PROJECT_NAME}} — Workspace Rules & Operating Constitution

> **Operating Identity**: **{{AGENT_NAME}}** ({{AGENT_ROLE}})
> **Mission**: {{PROJECT_DESC}}
> **Governance Model**: Contract Extraction → Workstream Execution → Quality Gate
> **Toolchain**: Default `bun` for workspace scripts; subprojects define their own runtime in sub-roots.
> **DOX Rail**: `AGENTS.md` files are binding work contracts for their subtrees. Walk from root to target path; closer docs control local work details.
> **Engine Aliases**: "Agent Engine" and "DOX Engine" reference this progressive disclosure scaffolding and governance engine.

---

## ⚡ Core Turn Invariants (Always Enforced)

1. **Context Hygiene**: Output `[Context: ~X% used]` at turn start. Prompt at 70% before compaction. Byte-cap large terminal outputs.
2. **Zero Secret Exposure (Vibeguard)**: Never print, echo, or commit raw credentials. Run pre-ship SecretScan before finalizing changes.
3. **The Confidence Gate**: Assess confidence before editing code (<80% Stop & Ask; 80–90% State Assumption; >90% Proceed).
4. **Destructive Command Gate**: Prohibit `rm -rf`, `git reset --hard`, force-pushes, or shell piping without stating blast radius, rollback plan, and getting user authorization.
5. **Universal English Standard**: All agent responses, code, comments, commits, specs, and docs MUST strictly be in English.
6. **Evidence Before Claims**: Work is complete only after independent oracle verification (tests, runtime logs, rendered DOM).
7. **Structured Commits**: Commits must follow `<type>(<scope>): <summary>` with Why/What/Verification blocks.
8. **Agent Containment & Archive**: Working artifacts (research, planning, reports) live in `./.agents/artifacts/<topic>/` — never the repo tree, never `./.memory`. Retired plans/scratchpads move to `./.agents/archive/[title]-[timestamp].md`; durable findings are promoted to `./.agents/context/`.
9. **Session Memory & Closeout DOX Pass**: Update `./.memory`, `./.agents/context/current.md`, and the nearest owning `AGENTS.md` before completing tasks.
10. **Modern Tool Primacy (MANDATORY)**: Always use modern high-speed tools (`fd` > `find`, `rg` > `grep`, `bat` > `cat`, `eza` > `ls`, `sd` > `sed`, `choose` > `cut`, `procs` > `ps`, `zoxide` > `cd`, `delta` > `git diff`, native `find_by_name`/`grep_search`). Subshells run non-interactively and DO NOT load `.bashrc` aliases—agents MUST invoke modern binaries explicitly by name, never legacy tools unless modern binaries are absent.
11. **Zero Synthetic ADE Artifact Leakage**: Never accept, commit, or propagate synthetic ADE/IDE placeholders or rich markdown wrappers (such as ORCA ADE `[[ORCA_RICH_MD:...]]`, Cursor `[cursor:...]`, Windsurf wrappers, or Claude artifacts). Always unwrap and decode them to raw content, and wrap template tokens in backticks (`<issue-id>`) to prevent ADE HTML parsers from hijacking them.
12. **Clean Package Syntax & No Published Refs**: In git/skills package syntax (`<owner>/<repo>#<ref>`), anything following `#` is a git reference. Never append, publish, or pass raw commit hashes or arbitrary branch references (`#<ref>`); downstream installers execute `git clone --depth 1 --branch <ref>` which fatally rejects commit SHAs. Always keep repository links and skill installation commands clean (`skills add <owner>/<repo>`). If a reference is strictly required anywhere, ensure it is a valid tag/branch that never breaks linking. For package managers (`npm`, `bun`, etc.), use `@latest` when specified as a parameter; otherwise keep commands clean without redundant arguments to fetch latest automatically.

---

## 📚 Standards & Detailed Protocols (Progressive Disclosure)
Load these relative modules on-demand when relevant to your active task:

### 🌐 Universal Core Standards (All Frameworks)
- ⚙️ [Execution & Cognitive Kernel](./.agents/standards/execution-kernel.md) — 6 Judgment laws, 32-tool modern CLI matrix & fallbacks, synthetic ADE sanitization, Fowler Refactoring.
- 🛡️ [Security & Vibeguard Protocol](./.agents/standards/security-vibeguard.md) — Secret isolation, Destructive Command Gate, Untrusted Tool Output defense.
- 📐 [System, Domain & Resilience Design](./.agents/standards/system-design.md) — Evans DDD, Nygard Release It! stability, migration rehearsal, and schemas.
- 🔄 [Development Workflows & Gates](./.agents/standards/workflows.md) — Scaled tiers (tiny-fix, quick-win, feature, architecture-change) & 5-phase pipeline.
- 📜 [Git Branching, Commits & SemVer](./.agents/standards/git-workflow.md) — Branch lifecycle (`master`/`dev`/`feature`/`release`/`hotfix`), commit standards, and SemVer.
- 📑 [DOX Hierarchy & Subtree Contracts](./.agents/standards/dox-hierarchy.md) — Reading order, child doc shape, closeout checklist, and pruning loop.
- 🎭 [Team Roles & Routing](./.agents/standards/council-roles.md) — Division responsibilities (Orchestrator, Architect, Creative, Operations, Quality Gate) and subagent dispatch policies.
- 🧠 [Context, Memory & Identity](./.agents/standards/memory-context.md) — Context hygiene, `./.memory` store lifecycle, Creed durable proposals, canonical identity sources.

### 🚀 Framework, Brand & Architecture Standards
- ⚛️ [Next.js & React Architecture](./.agents/standards/frontend-nextjs.md) — Next.js 16 (App Router), React 19, Server Components, TanStack Query.
- 🚀 [Astro Frontend Architecture](./.agents/standards/frontend-astro.md) — Astro v7.2.x, static-first with `client:*` islands, content collections with Zod.
- ⚡ [Cloudflare Workers & Hono API](./.agents/standards/backend-workers-hono.md) — Hono `@latest`, Drizzle ORM, Neon HTTP driver, route-per-resource.
- 🧭 [Agency Tech Stacks & Tooling](./.agents/standards/tech-stacks.md) — 3 Core Directions: Astro v7.2.x, Instatic HTML, and Payload CMS + Next.js.
- 🎨 [Design System & UI Standards](./.agents/brand/design.md) — Token architecture, 7 required UI component states, fluid typography.
- 📐 [Semantic BEM CSS Conventions](./.agents/brand/bem-conventions.md) — Block-Element-Modifier class architecture and shallow depth rules.
- ♿ [Accessibility (A11y) Baseline](./.agents/brand/a11y.md) — WCAG 2.2 AA non-negotiable mandates, contrast ratios, hit targets, and axe-core zero-tolerance.
- 📖 [Durable Project Context Map](./.agents/context/index.md) — Product scope, architecture truth, current shipped state, decisions, and roadmap.
