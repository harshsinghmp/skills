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
```

---

## ⚖️ Rules & Best Practices

- **Zero Filler**: Every line must be load-bearing; anchors stay ≤15 lines.
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
- [Layering Protocol](references/layering-protocol.md) — the normative anchor ↔ HANDOFF.md contract.
