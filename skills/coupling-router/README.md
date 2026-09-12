# Coupling Router (`coupling-router`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /router](https://img.shields.io/badge/Triggers-%2Frouter%20%7C%20%2Fcoupling-purple.svg?style=for-the-badge)](#)

Coupling-aware architectural delegation and skill-stack compatibility router for multi-agent workflows. Evaluates routing plans against a pre-execution gate (spec alignment, verifiable acceptance criteria, DAG integrity, scope overlap, evidence-backed assumptions) with multi-perspective review for plans of 5+ tasks, then analyzes task dependency graphs, shared mutable state, type definitions, and active skill interactions to deterministically route tasks to sequential builders or parallel fan-out workers, while auditing installed skills to suppress redundant instructions, resolve prompt contradictions, and eliminate token bloat. Completion claims require verification receipts. Enforces a shared-worktree lease so two agent sessions in one git checkout never collide on branches, stashes, or shared files.

---

## 🧭 What is this?

When an orchestrator agent breaks a project into subtasks or loads multiple skills, two major failure modes occur:
1. **Concurrency Failures**: Parallelizing coupled tasks creates diverging interfaces, broken imports, and merge hell. Serializing independent tasks wastes latency and agent compute.
2. **Skill Stack & Token Failures**: Loading multiple skills simultaneously causes prompt instruction collisions (e.g. speculative refactoring vs surgical diffs) and blows token budgets before writing code.

`coupling-router` audits both the **task graph's shared state** and the **active skill stack** to output a mathematically sound execution DAG and a Minimal Viable Skill Set (MVSS). Plans pass a five-check pre-execution gate (with multi-lens review on large plans) before dispatch, and every completion claim must carry a verification receipt.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill coupling-router
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/router
/coupling
/worktree-lease

# Natural language
"Audit active skills and analyze this task breakdown for coupling"
"Resolve skill stack conflicts and determine whether to run in parallel or sequentially"
"Another agent session is working in this checkout — respect the worktree lease"
"Two sessions, one clone — who owns the branch right now?"
```

---

## 🔒 Shared-Worktree Lease (multi-session checkouts)

When two agent sessions share one git clone, the worktree is a HIGH-coupling shared resource: one session's branch switch or stash pop can orphan the other's uncommitted work (the exact failure this skill's own repo hit and repaired). Before any git mutation:

1. **Probe** `.agents/artifacts/WORKTREE-LEASE.md` — absent → acquire it (owner, branch, heartbeat, scope, notes; ≤20 lines).
2. **Fresh heartbeat (≤30 min)?** You are the second session: take a separate `git worktree add` directory (preferred), work read-only, or wait. Never mutate shared git state.
3. **Stale heartbeat?** Takeover: append a takeover line, treat WIP recorded in the lease `notes` as foreign — preserve, never commit it.
4. **While holding**: stage explicit paths only, never pop a stash you did not create, re-diff shared surfaces (`skills.json`, `llms.txt`, `README.md`, `CHANGELOG.md`) hunk-by-hunk before staging, refresh the heartbeat at milestones.
5. **On release**: fold surviving state into `HANDOFF.md`, delete the lease, leave a residual-state note.

Collisions that slip through have a repair ladder: backup foreign WIP → rebuild your hunks on a feature branch (explicit paths) → `push --force-with-lease` → PR → restore foreign WIP. Full contract: [worktree-lease-protocol.md](references/worktree-lease-protocol.md).

**One-command gate** (zero-dependency Bun script, exit-code friendly for CI and agent runtimes):

```bash
bun <skill-dir>/coupling-router/scripts/worktree-lease.ts probe --owner <session-id> --scope "<paths>"  # exit 0 = clear to mutate, exit 1 = defer
bun <skill-dir>/coupling-router/scripts/worktree-lease.ts hold      # refresh heartbeat at milestones
bun <skill-dir>/coupling-router/scripts/worktree-lease.ts release   # delete lease at session close
```

---

## 🛡️ Skill Compatibility & Conflict Matrix

`coupling-router` resolves pairwise interactions across installed skills:

| Active Skill | Co-Active Skill | Interaction | Conflict Resolution |
| :--- | :--- | :--- | :--- |
| **`ai-ready`** | `new-project` | Redundant | Suppress `new-project` Stage 0; `ai-ready` dominates. |
| **`code-review`** | Generic Refactors | Conflicting | Enforce Linus/Karpathy surgical diffs; silence broad refactor rules. |
| **`git`** | Ad-Hoc VCS | Conflicting | Enforce strict dev-staging & Conventional Commits; suppress ad-hoc commits. |
| **`refactor-ui`** | Generic CSS | Conflicting / Redundant | Enforce 11 UI heuristics & 5-state anti-slop; suppress decorative border clutter. |

---

## 📄 Artifacts Generated

1. `ROUTING_PLAN.md` — Active Minimal Viable Skill Set (MVSS), suppressed redundant skills, execution strategy (`SEQUENTIAL` / `STAGED_PIPELINE` / `PARALLEL_FAN_OUT`), Mermaid task DAG, and file isolation boundaries.
