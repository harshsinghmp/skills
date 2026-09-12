# 🤖 Agent Context & Instruction Policy

Rules for maintaining, auditing, and synchronizing AI agent instruction files (`AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md`, Cursor rules, Copilot instructions) and the `.agents/` DOX architecture.

---

## 1. Purpose & Governance of Agent Context Files

Agent instruction files serve as binding operational contracts for AI coding assistants working in the repository. They establish behavioral boundaries, non-negotiable invariants, and essential workspace tooling.

> **Operational Reality**: `AGENTS.md` is **governed operational context**, not ordinary project documentation. It is not automatically safe to edit merely because it sits at repository root. Always read repository governance before touching any agent-facing instruction file.

---

## 2. `.agents/` Is Protected DOX Architecture

`.agents/` is part of the project's **DOX architecture** and operational infrastructure, not ordinary documentation storage:

- **Inspection Rule**: `updatedocs` may inspect `.agents/` ONLY after reading the applicable `AGENTS.md` governance.
- **Hard Permission Gate**: `updatedocs` MUST NOT modify anything under `.agents/` without explicit user permission (including creating, editing, deleting, moving, or regenerating files under `.agents/context/*`, `.agents/standards/*`, or `.agents/workflows/*`).
- **No Automatic Escalation**: A change being "obviously necessary" does not constitute authorization.
- **Reporting Over Mutation**: When agent-context impact exists, `updatedocs` must report the exact proposed change and require explicit user authorization before taking action.

---

## 3. What Belongs in Agent Context

Only include high-density, actionable information that directly guides an agent's code generation and tool usage:

| Category | Include in Agent Context | Do NOT Include |
|:---|:---|:---|
| **Commands** | Exact, verified build, test, lint, and typecheck commands (`bun test`, `npm run build`). | Long narrative tutorials on how to install Node or Git. |
| **Architecture** | Key entry points, core directory boundaries, state management models. | Full 1,000-line source code dumps or redundant directory listings. |
| **Conventions** | Naming conventions, error-handling contracts, styling tokens, typing strictness. | Generic programming advice (e.g. *"Write clean code"*). |
| **Hard Invariants** | Zero secret leakage, mandatory test runs before commit, forbidden files. | Unenforceable or speculative stylistic preferences. |
| **Gotchas** | Non-obvious environmental gotchas, ESM/CJS quirks, tricky test mocks. | Ephemeral bug logs that were permanently resolved. |

---

## 4. Token Budget & Progressive Disclosure

- **Size Budget**: Root `AGENTS.md` / `CLAUDE.md` should ideally stay under **5KB** (hard maximum **10KB**).
- **Progressive Disclosure**: Keep root contracts lean with turn invariants and DOX routing rails that point to modular standards in subdirectories (`.agents/standards/`, `docs/`) loaded only on-demand.
- **No README Duplication**: Do not copy marketing copy, badges, or user-facing onboarding text into agent context files.

---

## 5. Companion Skill Handoff (`updateagents`)

- **Ownership Boundary**: `updatedocs` audits and updates user-facing project documentation (README, changelog, architecture, APIs, contributing guides).
- **Agent Context Handoff**: When agent-context or instruction architecture changes are appropriate, `updatedocs` should report the required change and recommend **`updateagents`** rather than modifying protected agent architecture itself.
