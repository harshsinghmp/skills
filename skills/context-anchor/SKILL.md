---
name: context-anchor
aliases: ["anchor","session-anchor","working-reference","park","switch-task"]
description: "Drop a working reference anchor at any point in a session to prevent cascading context drift, and park parallel client workstreams under named anchors for instant switching. The intra-session focus layer that folds into handoff's HANDOFF.md for cross-session continuity. Use when switching tasks, parking a client workstream, or refocusing mid-session."
version: 1.1.1
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: context-orchestration
metadata:
  skill_orchestration:
    post: ["handoff"]
    optional: ["audit"]
  category: context-orchestration
  priority: 8
  aliases: ["anchor","session-anchor","working-reference","park","switch-task"]
  suggested_skills: ["handoff","updateagents","dead-letter","audit"]
  hermes:
    tags: [context, memory, state, session, focus, anchor, workstreams, reliability, confidentiality]
    related_skills: [handoff, updateagents, dead-letter, audit]
    suggested_skills: [handoff, updateagents, dead-letter, audit]
    requires_tools: [view_file, write_to_file]
  openclaw:
    category: context-orchestration
    suggested_skills: [handoff, updateagents, dead-letter, audit]
    primary_triggers: ["drop anchor","save working reference","checkpoint context","prevent context drift","park this workstream","switch workstream","list anchors"]
    requires_tools: [view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# ⚓ context-anchor — Working Reference Snapshots & Workstream Parking

Drop a compact working reference in `<project-root>/.agents/` to prevent cascading context drift, and park parallel client workstreams under named anchors so an agency can switch lanes mid-session and resume instantly.

v1.1.0 positions this skill as the **intra-session focus layer**: anchors capture working state *within* sessions and park *parallel workstreams*; cross-session continuity belongs to `handoff` (`.agents/artifacts/HANDOFF.md`). The layering contract between them is normative — see [references/layering-protocol.md](references/layering-protocol.md).

---

## When to Use

- Before switching tasks or workstreams mid-session.
- **Parking a client workstream** to work another lane ("park this workstream", *"park"*, *"switch-task"*).
- **Resuming a parked workstream** ("switch to `<slug>`", *"list anchors"*).
- Before delegating a subtask to another agent.
- At the start of a session when previous context is cold or stale (after the `handoff` entry probe).
- Whenever you catch yourself re-reading dozens of messages to recall system state.

### Anti-Triggers

- **Cross-session continuity**: the always-current boundary file is `handoff`'s `.agents/artifacts/HANDOFF.md` — do not duplicate it here. Anchor → fold → flush happens at session close (Step 6).
- Long-term quarterly reviews: use [`periodic-retreat`](../periodic-retreat/SKILL.md).

---

## Quick Reference

### Anchor Anatomy (≤15 lines, every line load-bearing)

| Field / Section | Content Requirement | Constraint |
|:---|:---|:---|
| `workstream:` header | Slug of the lane (`main`, or e.g. `client-acme-redesign`) | Exactly 1 |
| `branch:` header | Git branch at write time | Exactly 1 |
| `Client:` header (optional) | Project codename — **never legal client names under NDA** | 0–1 |
| **What's True Right Now** | Active state, key decisions made, and ruled-out paths | 2–4 bullets |
| **The Working Reference** | Single actionable sentence ending in `resume by: <how>` | Exactly 1 sentence |
| **Next Action** | Single atomic next step with file and line reference | Exactly 1 task item |

### The Layering Protocol

| Layer | File | Scope | Lifetime |
|:---|:---|:---|:---|
| **Micro-anchor** (this skill) | `.agents/anchor.md` (default focus) or `.agents/anchors/<slug>.md` (parked workstreams) | Current focus within a session | Disposable; folded forward |
| **Boundary state** (`handoff` v2.1.0) | `.agents/artifacts/HANDOFF.md` | Cross-session continuity | Always-current, overwritten |

Precedence on conflict: `HANDOFF.md` wins for cross-session truth; the active anchor wins for intra-session focus. On **workspace entry**, read `HANDOFF.md` (handoff ladder rung 1) — never resurrect state from a stale anchor alone.

### Token Budgets

| Phase | Budget |
|:---|:---|
| Anchor write | ≤15 lines |
| Re-entry block on resume | ≤3 lines (state / reference / next action) |
| Detail loading | On demand — named anchors are read only when their workstream is switched to |

---

## Procedure

### Step 1: Scan Active Session
Identify:
1. What was being built / fixed / investigated.
2. What decisions were finalized and why.
3. What was tried and ruled out.
4. The exact next concrete step.

### Step 2: Write the Anchor
Default focus anchor → `.agents/anchor.md`; parked workstream → `.agents/anchors/<slug>.md`:

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
```

### Step 3: Echo the Anchor
Display the anchor to the user for instant alignment.

### Step 4: Consume Protocol (on resume)
1. Re-entry block, ≤3 lines: state / working reference / next action. Nothing else before the first productive action.
2. **Freshness check**: header `branch:` must match the current branch and the timestamp must postdate the last commits on it. Mismatched or stale → treat as a hint, re-derive from `HANDOFF.md` or git, and overwrite the anchor with corrected state.
3. Resume work; refresh the anchor at the next focus shift.

### Step 5: Park / Switch / List (Workstream Operations)
- **Park** the current lane: write `.agents/anchors/<slug>.md` with a `resume by:` clause. If the parked workstream is blocked, also emit a `dead-letter` packet.
- **Switch** to `<slug>`: anchor the current focus first (never lose it), then read `.agents/anchors/<slug>.md` and run the Step 4 consume protocol.
- **List**: one line per anchor file — slug, timestamp, next-action summary. No file dumps.
- A workstream parked **across sessions** gets promoted into `HANDOFF.md` In-Flight at close (Step 6), so it survives even if the anchor file is never reopened.

### Step 6: Close-Out Fold
On session close, the active anchor's surviving content folds into `handoff`'s `HANDOFF.md` (Next Step / In-Flight / Decisions) — handoff owns the flush; the anchor is scratch. At **project close**, archive or wipe client workstream anchors per the confidentiality guard below.

---

## Client-Confidentiality Guard

Anchors capture raw working context and may be committed, synced, or read by contractors:

1. **Codename rule**: when an NDA applies, `Client:` carries a codename — never legal names, never contract terms, never pricing.
2. **No secrets**: tokens, credentials, and `.env` values never enter an anchor (same rule as every suite artifact).
3. **Close-out hygiene**: archive client anchors to `.agents/archive/` or delete them at project end; stale client anchors left behind are knowledge-hygiene defects the [`audit`](../audit/SKILL.md) skill will flag as orphans.

---

## Pitfalls

- **Verbosity & Noise**: Every line must be load-bearing. Delete filler.
- **Vague Next Actions**: Never write *"continue coding"*; specify the exact file, line number, and function.
- **Missing Decisions Rationale**: Always include the *"why"* for architectural decisions so future agents don't revert them.
- **Stale Anchor Trust**: Never resume from an anchor that fails the freshness check without re-derivation.
- **Confidentiality Leak**: An anchor is an artifact; write it as if the client will read it — because they might.
- **Parallel File Drift**: Two files claiming current state (`anchor.md` and `HANDOFF.md`) is a bug, not a backup — resolve via the layering protocol, never by maintaining both as truth.

---

## Verification

- Confirm the anchor file exists, is ≤15 lines, and is formatted cleanly.
- Confirm Next Action points to an exact concrete file and line number.
- Confirm the header carries `workstream:` and `branch:` for freshness checking.
- Confirm re-entry used the ≤3-line budget and the freshness check ran.
- Confirm no client-identifying or secret material under NDA scope.
