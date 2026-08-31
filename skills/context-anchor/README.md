# context-anchor Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /anchor](https://img.shields.io/badge/Triggers-%2Fanchor%20%7C%20%2Fcontext--anchor-green.svg?style=for-the-badge)](#)

Drop a working reference at any point in a session to prevent cascading context drift. Use when switching tasks, resuming after a break, or handing off between agents.

---

## What is this?

Long agent sessions accumulate noise: outdated tool outputs, superseded hypotheses, retracted approaches, and sprawling transcripts. Over time, this causes **cascading context drift** — the model begins reasoning from stale intermediate state because the true signal is buried.

`context-anchor` halts drift by creating a minimal, load-bearing working snapshot in `.claude/anchor.md`. It captures what is true *right now*, why key decisions were made, what was ruled out, and the exact next line of execution.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill context-anchor
```

*(Direct URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/context-anchor` is also supported).*

---

## 🚀 Usage & Triggers

Trigger this skill anytime you need to anchor session context:

```bash
# Slash commands
/anchor
/context-anchor

# Natural language
"drop a context anchor"
"anchor current state before switching tasks"
"create working reference snapshot"
```

---

## 📋 What It Does

1. **Scans the Active Session:**
   - Current state of the work (1 concise sentence)
   - Key decisions and their underlying rationale
   - Ruled-out paths and failed attempts
   - Exact next concrete action (with file and line references)
2. **Writes to `<project-root>/.claude/anchor.md`** using the standardized anchor schema.
3. **Echoes the Anchor Inline** for immediate developer verification.

---

## 📦 Anchor Format

```markdown
# Context Anchor — <ISO timestamp>

## What's true right now
- [1-sentence state of the work]
- [Key decision made: what and why]
- [What was tried and didn't work, if anything]

## The working reference
> [One sentence that a new agent could act on immediately]

## Next action
- [ ] <exact next step, file:line if applicable>
```

---

## ⚖️ Rules & Best Practices

- **Zero Filler**: Every line must be load-bearing. Delete any sentence that doesn't convey essential technical signal.
- **Concrete Over Vague**: Specify exact file paths and line numbers (e.g. `src/auth/jwt.ts:42`), not generic statements.
- **Decisions Include "Why"**: Capture rationale (e.g. `Chose SQLite for zero-config embedded storage; client requirements forbid external DB`).
- **Include Ruled-Out Paths**: Prevent future iterations or subagents from repeating failed experiments.

---

## 🕒 When to Use

- Before switching focus or starting a separate task mid-session
- Before handing off context between agents
- When resuming a project after a break or when context is stale
- Whenever you notice yourself scrolling back or re-reading conversation history

---

## 📄 Example

See [examples/sample-anchor.md](examples/sample-anchor.md) for a sample anchor file.
