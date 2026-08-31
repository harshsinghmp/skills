# agent-handoff Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /handoff](https://img.shields.io/badge/Triggers-%2Fhandoff%20%7C%20%2Fagent--handoff-purple.svg?style=for-the-badge)](#)

Generate a structured context packet before dispatching any subagent. Prevents context drift, hallucinated constraints, and re-exploring dead ends.

---

## What is this?

Subagents fail for one primary reason: **they receive a high-level goal but not its operational shape**. They don't know what you've already tried, what constraints are non-negotiable, what "done" actually looks like, or which specific files matter. 

`agent-handoff` externalizes the orchestrator's implicit working model into an explicit, verifiable context packet written directly to `.claude/handoff-<timestamp>.md` and copied inline into the subagent invocation.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill agent-handoff
```

*(Direct URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/agent-handoff` is also supported).*

---

## 🚀 Usage & Triggers

Trigger this skill using slash commands or natural language:

```bash
# Slash commands
/handoff
/agent-handoff

# Natural language
"prepare a handoff for the subagent"
"generate a handoff packet for backend auth refactor"
"handoff this task to worker agent"
```

---

## 📋 What It Does

1. **Extracts Session Context:**
   - **Actionable Objective**: Single-sentence goal starting with an active verb.
   - **Architectural & Business Context**: Decisions that cannot be re-litigated.
   - **Ruled-Out Paths**: Approaches tried and why they failed.
   - **File Scope**: Specific files and line numbers to touch.
   - **Hard Constraints**: Non-negotiable rules and boundaries.
   - **Verifiable Success Criteria**: Deterministic validation checks.
   - **Blocker Escalation**: Clear fallback if blocked.
2. **Generates `.claude/handoff-<timestamp>.md`** with the structured template.
3. **Echoes the Packet** to the orchestrator for verification.
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
