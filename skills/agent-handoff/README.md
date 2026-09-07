# handoff Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /handoff](https://img.shields.io/badge/Triggers-%2Fhandoff%20%7C%20%2Fresume-purple.svg?style=for-the-badge)](#)

Bidirectional agent handoff and session resumption engine. Resume previous agent sessions with strict directory-boundary matching and unanswered questions leading, or generate structured outbound context packets before dispatching subagents.

---

## What is this?

Agent workflows lose momentum and fail in two critical transitions:
1. **Inbound Resumption**: Resuming after an interruption where agents hallucinate past context, conflate sibling repositories, or overlook critical unanswered questions.
2. **Outbound Dispatch**: Handing off work to subagents without operational boundaries, causing subagents to re-explore dead ends or touch forbidden files.

`handoff` solves both:
- **Inbound Mode**: Fast, boundary-safe session restoration that matches strictly on directory boundaries (`===` or `startsWith(cwd + sep)`) and leads with any unanswered user questions.
- **Outbound Mode**: Generates a lean 7-section context packet saved to `.agents/artifacts/handoff-<timestamp>.md` and passed directly into the subagent invocation.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill handoff
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

---

## 📋 What It Does

1. **Inbound Resumption Mode:**
   - Validates directory boundaries against session logs so sibling folders never cross-contaminate.
   - Surfaces unanswered user questions at the very top.
   - Provides an atomic next-step action.
2. **Outbound Dispatch Mode:**
   - Extracts objective, context, ruled-out paths, file scope, hard constraints, and verification commands.
   - Generates `.agents/artifacts/handoff-<timestamp>.md`.
   - Embeds context packet directly into worker prompts.
4. **Prepares the Inline Prompt** for the subagent tool call or tmux session.

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

## ⚖️ Core Rules

- **One objective per handoff**: Compound tasks cause agent confusion. Split them into discrete handoffs.
- **Ruled-out paths are mandatory**: Subagents re-explore dead ends unless explicitly warned away.
- **Constraints are non-optional**: Conversational boundaries do not propagate across agent boundaries unless written.
- **Verifiable criteria only**: "It works" is rejected; `"bun test tests/auth.test.ts passes"` is required.
- **No syntax filler**: Focus on architecture, API behavior, and runtime gotchas.
- **Load-bearing fallback**: Define an explicit escalation path so unblocked agents don't hallucinate workarounds.

---

## 🕒 When to Use

- Before every `invoke_subagent` or `Agent` tool call delegating real work
- Before dispatching a background terminal or tmux session
- When resuming an idle session after >30 minutes (self-handoff)
- Anytime your dispatch instructions exceed 3 sentences

---

## 📄 Example

See [examples/sample-handoff.md](examples/sample-handoff.md) for a complete handoff packet example.
