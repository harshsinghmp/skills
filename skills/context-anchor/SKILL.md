---
name: context-anchor
description: "Drop a working reference at any point in a session to prevent cascading context drift. Use when switching tasks, resuming after a break, or handing off between agents."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [context, memory, state, session, focus, anchor, reliability]
    related_skills: [updateagents, agent-handoff, dead-letter]
    requires_tools: [view_file, write_to_file]
---

# ⚓ context-anchor — Working Reference Snapshot Generator

Drop a compact working reference snapshot in `<project-root>/.claude/anchor.md` to prevent cascading context drift across long sessions, breaks, or task switches.

---

## When to Use

- Before switching tasks or workstreams mid-session.
- Before delegating a subtask to another agent.
- At the start of a session when previous context is cold or stale.
- Whenever you catch yourself re-reading dozens of messages to recall system state.

---

## Quick Reference

| Section | Content Requirement | Length Constraint |
|:---|:---|:---|
| **What's True Right Now** | Active state, key decisions made, and ruled-out paths | 2–4 bullet points |
| **The Working Reference** | Single sentence that an agent can act upon immediately | Exactly 1 sentence |
| **Next Action** | Single atomic next step with file and line reference | Exactly 1 task item |

---

## Procedure

### Step 1: Scan Active Session
Identify:
1. What was being built / fixed / investigated.
2. What decisions were finalized and why.
3. What was tried and ruled out.
4. The exact next concrete step.

### Step 2: Write Context Anchor
Save to `<project-root>/.claude/anchor.md`:

```markdown
# Context Anchor — <ISO timestamp>

## What's True Right Now
- [1-sentence state of active work]
- [Key decision made: what and why]
- [What was tried and ruled out]

## The Working Reference
> [One sentence that a fresh agent can act on immediately without asking questions.]

## Next Action
- [ ] `path/to/file.ts:line` — [Exact atomic action]
```

### Step 3: Echo Anchor
Display the anchor to the user for instant alignment.

---

## Pitfalls

- **Verbosity & Noise**: Every line must be load-bearing. Delete filler.
- **Vague Next Actions**: Never write *"continue coding"*; specify the exact file, line number, and function.
- **Missing Decisions Rationale**: Always include the *"why"* for architectural decisions so future agents don't revert them.

---

## Verification

- Confirm `<project-root>/.claude/anchor.md` exists and is formatted cleanly.
- Confirm Next Action points to an exact concrete file and line number.
