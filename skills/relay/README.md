# handoff Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /handoff](https://img.shields.io/badge/Triggers-%2Fhandoff%20%7C%20%2Fresume-purple.svg?style=for-the-badge)](#)

Bidirectional agent handoff, session resumption, and ambient continuity engine. Resume previous agent sessions with strict directory-boundary matching and unanswered questions leading, generate structured outbound context packets before dispatching subagents, and keep an always-current live-state file so any new conversation continues prior work — even after abrupt endings, with no explicit handoff requested.

---

## What is this?

Agent workflows lose momentum in three transitions:

1. **Inbound Resumption**: Resuming after an interruption where agents hallucinate past context, conflate sibling repositories, or overlook critical unanswered questions.
2. **Outbound Dispatch**: Handing off work to subagents without operational boundaries, causing subagents to re-explore dead ends or touch forbidden files.
3. **Ambient Continuity**: A session ends abruptly — crash, context window, user walks away — and the next conversation starts from zero because nobody wrote a handoff.

`handoff` solves all three:

- **Inbound Mode**: Fast, boundary-safe session restoration that matches strictly on directory boundaries (`===` or `startsWith(cwd + sep)`) and leads with any unanswered user questions.
- **Outbound Mode**: Generates a lean 7-section context packet saved to `.agents/artifacts/handoff-<timestamp>.md` and passed directly into the subagent invocation.
- **Ambient Mode (v2.1.0)**: Maintains `.agents/artifacts/HANDOFF.md` — a ≤30-line live state file, overwritten on every real state change — and probes for it on every workspace entry, so continuation is the default, not a request.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill relay
```

---

## 🚀 Usage & Triggers

### 1. Inbound Session Resumption
```bash
"where were we"
"resume"
"pick up where I left off"
"/resume"
```

### 2. Outbound Subagent Dispatch
```bash
/handoff
"prepare a handoff for the subagent"
"generate a handoff packet for backend auth refactor"
"handoff this task to worker agent"
```

### 3. Ambient Continuity (no explicit request needed)
```bash
# These just happen:
# - entering a workspace          → probe HANDOFF.md, resume if fresh
# - completing a checkpoint       → live file overwritten with new Next Step
# - a decision or correction      → recorded under Decisions
# - ending a turn mid-task        → live file carries the exact next action
# - "close" / "wrap up"           → full flush + memory hook for durable decisions
```

---

## 📋 What It Does

1. **Inbound Resumption Mode:**
   - Validates directory boundaries against session logs so sibling folders never cross-contaminate.
   - Surfaces unanswered user questions at the very top.
   - Provides an atomic next-step action within a ≤5-line budget.
2. **Outbound Dispatch Mode:**
   - Extracts objective, context, ruled-out paths, file scope, hard constraints, and verification commands.
   - Generates `.agents/artifacts/handoff-<timestamp>.md`.
   - Embeds the context packet directly into worker prompts and refreshes the live file to point at the dispatched task.
3. **Ambient Continuity Mode:**
   - Resolves prior state via the **state-source ladder**: live file → memory recall → project context (`.agents/context/current.md`) → git forensics (`git status` / `git log` reconstruction, then write the live file) → honest cold start.
   - Integrates with the runtime's memory system by tool API: durable decisions pushed on flush, recall filtered to the directory boundary. Never touches `.memory/**` by hand.
   - Enforces token budgets: one-command entry probe, ≤5-line resumption block, detail loaded on demand, ≤30-line live file.

---

## 📦 Packet Structure

```markdown
# Agent Handoff — <ISO timestamp>

## Objective
[One sentence. Starts with a verb. Specific enough that no clarifying question is needed.]

## Context the subagent needs
- [Key fact 1 — architectural decision, API behavior, business rule]
- [Key fact 2]
- [Add only what would not be obvious from reading the files]

## Already tried — do not re-attempt
- [Approach]: [Why it failed or was ruled out]
- [Approach]: [Why it failed or was ruled out]

## Files to touch
- `path/to/file.ts` — [what to do here, optionally line number]
- `path/to/other.ts` — [what to do here]

## Hard constraints
- [MUST NOT]: [What the subagent must not change, call, or assume]
- [MUST NOT]: [...]

## Success criterion
- [ ] [Concrete, verifiable output — test passes, file exists, API returns X]
- [ ] [Second criterion if needed]

## If blocked
[What the subagent should do if it hits an unexpected blocker — escalate, write a findings file, skip and note, etc.]
```

---

## 🌊 Live Handoff File

```markdown
# HANDOFF — <ISO timestamp>
branch: <branch> | phase: <one-line state>

## Next Step
<Single atomic action: file + what to do>

## In-Flight
- <Unfinished item, if any>

## Ruled Out
- <Approach>: <why it failed — one line>

## Decisions
- <Durable choice made, not to be re-litigated>

## Verify
`<exact command>`

## Open Questions
- <Unanswered user question, if any — leads resumption>
```

---

## ⚖️ Core Rules

- **One objective per handoff**: Compound tasks cause agent confusion. Split them into discrete handoffs.
- **Ruled-out paths are mandatory**: Subagents re-explore dead ends unless explicitly warned away.
- **Constraints are non-optional**: Conversational boundaries do not propagate across agent boundaries unless written.
- **Verifiable criteria only**: "It works" is rejected; `"bun test tests/auth.test.ts passes"` is required.
- **No syntax filler**: Focus on architecture, API behavior, and runtime gotchas.
- **Load-bearing fallback**: Define an explicit escalation path so unblocked agents don't hallucinate workarounds.
- **Ambient writes are silent**: The live file updates without narration, never appends, and only on real state change.

---

## 🕒 When to Use

- Before every `invoke_subagent` or `Agent` tool call delegating real work
- Before dispatching a background terminal or tmux session
- When resuming an idle session after >30 minutes (self-handoff)
- Anytime your dispatch instructions exceed 3 sentences
- Automatically, at every workspace entry and session boundary (ambient mode)

---

## 📄 Examples

- [Sample Handoff Packet](examples/sample-handoff.md) — complete outbound packet example.
- [Sample Live Handoff File](examples/sample-HANDOFF.md) — the ambient state pointer and how the next agent consumes it.

## 📚 References

- [Inbound Resumption & Boundary Protection Protocol](references/resumption-protocol.md)
- [Ambient Continuity & Live Handoff File Contract](references/ambient-handoff.md)

## 🔒 Shared checkouts

Dispatches that include git mutations embed the worktree-lease gate (`coupling-router`): workers probe `.agents/artifacts/WORKTREE-LEASE.md` before their first git mutation, and workspace entry respects an active lease. Two sessions, one checkout, zero collisions.
