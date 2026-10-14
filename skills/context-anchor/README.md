# context-anchor Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /anchor](https://img.shields.io/badge/Triggers-%2Fanchor%20%7C%20%2Fpark-purple.svg?style=for-the-badge)](#)

Drop a working reference anchor at any point in a session to prevent cascading context drift, and park parallel client workstreams under named anchors for instant switching. The intra-session focus layer that folds into `handoff`'s HANDOFF.md for cross-session continuity.

---

## What is this?

Long agent sessions accumulate noise: outdated tool outputs, superseded hypotheses, retracted approaches, and sprawling transcripts. Over time, this causes **cascading context drift** — the model begins reasoning from stale intermediate state because the true signal is buried.

Agencies add a second failure mode: **parallel client workstreams**. Parking one client's redesign to unblock another's billing migration means holding two live contexts at once.

`context-anchor` solves both with ≤15-line snapshots:
- `.agents/anchor.md` — the current focus anchor.
- `.agents/anchors/<slug>.md` — named parked workstreams ("park this workstream", "switch to `<slug>`").
- A normative **layering protocol** with `handoff`: anchors are the scratch layer inside a session; `HANDOFF.md` is the always-current boundary file across sessions. Anchors fold into `HANDOFF.md` at session close.

---

## ⚡ Installation

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill context-anchor
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/anchor
/context-anchor
/park
/switch-task

# Natural language
"drop a context anchor"
"anchor current state before switching tasks"
"park this workstream"
"switch to client-acme-redesign"
"list anchors"
```

---

## 📋 What It Does

1. **Scans the Active Session:** current state, key decisions with rationale, ruled-out paths, exact next action.
2. **Writes the Anchor** (`.agents/anchor.md` or `.agents/anchors/<slug>.md`) with `workstream:`, `branch:`, and optional `Client:` codename headers.
3. **Echoes the Anchor** inline for immediate verification.
4. **Consumes on Resume:** ≤3-line re-entry block, freshness gate (branch + timestamp), then straight back to work.
5. **Parks / Switches / Lists** named workstreams without losing the current lane.
6. **Folds at Close:** surviving anchor content merges into `handoff`'s `HANDOFF.md` at session end; client anchors are archived or wiped at project end.

---

## 🛠️ CLI Engine (`anchor.ts`)

`context-anchor` ships with a standalone CLI engine in `scripts/anchor.ts`:

```bash
# Drop a <=15-line focus micro-anchor
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --drop \
  --workstream "feature-auth" \
  --next "src/auth/service.ts:45 — implement JWT token verification"

# Park active workstream to named anchor
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --park "client-acme-redesign"

# Switch workstreams (auto-parks active context and restores target with freshness check)
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --switch "client-acme-redesign"

# List all active and parked workstream anchors
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --list

# Pin verbatim AST interface/type contract (<=30 lines) to avoid orientation burn
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --pin "src/auth/types.ts:SessionEnvelope"

# Verify physical disk & git evidence before claiming task complete (Ghost Task Detection)
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --verify

# Observation Masking: offload verbose command outputs (>=15 lines) to disk & emit 2-line receipt
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --mask-output \
  --cmd "bun test" --raw "$OUTPUT" --exit 0

# Prompt-Cache-Aware Partitioning: split into static prefix and dynamic tail
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --partition

# Outcome streak tracking & Deadlock detection (halts on >=3 consecutive failures)
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --record-outcome \
  --cmd "bun test" --success false --summary "AssertionError on line 42"
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --deadlock-check

# Automated Rollback: revert uncommitted churn to clean anchor state
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --rollback

# Interruption Recovery: Stash active in-flight task during urgent human interrupts
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --stash-task "api-refactor" \
  --goal "Migrate user auth to JWT" --next-step "Implement token refresh route"

# Resumption: Restore stashed task state and emit structured recovery context
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --unstash-task "api-refactor"

# Context Health Gauge: Proactively detect stale anchors and stash accumulation
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --health-check
```

---

## 📦 Anchor Format

```markdown
# Context Anchor — <ISO timestamp>
workstream: <slug> | branch: <branch>
Client: <codename or "internal">

## What's True Right Now
- [1-sentence state of active work]
- [Key decision made: what and why]
- [What was tried and ruled out]

## The Working Reference
> [One actionable sentence.] resume by: [exact re-entry move]

## Next Action
- [ ] `path/to/file.ts:line` — [Exact atomic action]

## Pinned Attention Context
```typescript
// [PIN: src/auth/types.ts#L14-L24]
export interface SessionEnvelope { ... }
```
```

---

## ⚖️ Rules & Best Practices

- **Zero Filler**: Every line must be load-bearing; anchors stay ≤15 lines (excluding pinned block).
- **AST Attention Pinning**: Pin critical interfaces (`--pin`) to prevent the U-shaped attention drop; never dump full 800-line service files.
- **Ghost Task Verification**: Verify ground truth (`--verify`) via physical file existence, mtime, and git diff before claiming work is complete.
- **Task Interruption Stashing**: Before context-switching to handle urgent interrupts, stash active goals and completed steps (`--stash-task`) to ensure zero context loss.
- **Context Health Monitoring**: Regularly run `--health-check` to audit anchor age, prune task stashes, and verify context directories.
- **Concrete Over Vague**: Exact file paths and line numbers (`src/auth/jwt.ts:42`).
- **Decisions Include "Why"**: Capture rationale so future agents don't revert them.
- **Include Ruled-Out Paths**: Prevent repeating failed experiments.
- **Freshness Gate**: A branch-mismatched or stale anchor is a hint, never truth — re-derive and rewrite.
- **Client-Confidentiality Guard**: Codenames under NDA; no secrets ever; archive-or-wipe at project close.

---

## 🕒 When to Use

- Before switching focus or starting a separate task mid-session
- **Parking a client workstream** and switching lanes (`/park`, `/switch-task`)
- Before handing off context between agents
- When resuming a project after a break (after the `handoff` entry probe)
- Whenever you notice yourself scrolling back or re-reading conversation history

---

## 📄 Examples & References

- [Sample Anchor](examples/sample-anchor.md) — the default focus anchor with re-entry block.
- [Sample Workstream Anchor](examples/sample-workstream-anchor.md) — parking, switching, and listing client lanes.
- [Task Interruption & Recovery](references/task-interruption-and-recovery.md) — mid-task checkpointing, task stashes, and health gauge.
- [AST Pinning Guide](references/ast-pinning-guide.md) — combating orientation burn & attention degradation.
- [Attention Hygiene & Context Sinks](references/attention-hygiene.md) — preventing ContextEcho and ghost tasks.
- [Observation Masking Guide](references/observation-masking.md) — preventing context drowning via structured receipts.
- [Prompt-Cache Partitioning](references/prompt-cache-partitioning.md) — maximizing prefix cache hits with two-tier topology.
- [Deadlock Breaker & Toxic Retry Rollback](references/deadlock-breaker.md) — 3-strike failure limit and automated state reset.
- [Layering Protocol](references/layering-protocol.md) — the normative anchor ↔ HANDOFF.md contract.
