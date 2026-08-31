# dead-letter Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /dead-letter](https://img.shields.io/badge/Triggers-%2Fdead--letter%20%7C%20%2Fdl-red.svg?style=for-the-badge)](#)

Capture a failed or blocked task before it disappears. Categorizes the failure mode, extracts what was learned, and generates either a retry packet with the root cause fixed or an escalation message with specific decision points.

---

## What is this?

Failed tasks are high-signal information. An agent that fails or hits a blocker learned critical ground truths — what was attempted, where the environment broke, what assumptions failed, and which partial artifacts were written. 

If this context isn't preserved before the session terminates or context resets, the next agent restarts from scratch and hits the identical wall. `dead-letter` captures the failure into `.claude/dead-letter-<timestamp>.md` and outputs an actionable retry packet or escalation decision point.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill dead-letter
```

*(Direct URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/dead-letter` is also supported).*

---

## 🚀 Usage & Triggers

Trigger this skill when an agent fails, errors, or gets blocked:

```bash
# Slash commands
/dead-letter
/dl

# Natural language
"process this failed subagent task"
"create a dead letter record for this blocker"
"triage the failed agent output"
```

---

## 🏷️ Failure Mode Taxonomy

Every failure is mapped to an explicit failure mode code:

| Code | Mode | Definition | Triage Action |
| :--- | :--- | :--- | :--- |
| `BLOCKED-CRED` | Missing credential | Needs API key, token, or auth | Add credential, retry same task |
| `BLOCKED-PERM` | Permission gate | Requires human approval or elevated access | Route to human/lead with approval request |
| `BLOCKED-DATA` | Missing data | Needs a file, DB record, or schema not yet present | Route to data generator or prerequisite agent |
| `BLOCKED-AMBIG` | Ambiguous objective | Task was underspecified | Rewrite task with explicit constraints & retry |
| `BLOCKED-RATE` | Rate limited | API or external platform rate limited request | Add backoff delay and retry |
| `FAILED-LOGIC` | Logic error | Output was produced but incorrect or broken | Add test/validation step & route to reviewer |
| `FAILED-TOOL` | Tool failure | Subprocess, CLI, MCP server, or library crashed | Fix dependency and document in runbook |
| `FAILED-SCOPE` | Out of scope | Requires capabilities beyond agent permissions | Re-route to specialized agent |
| `PARTIAL` | Partial completion | Some steps succeeded, broken at specific point | Checkpoint progress, hand off breakpoint |

---

## 📦 Dead Letter Record Format

Saved to `.claude/dead-letter-<timestamp>.md`:

```markdown
# Dead Letter — <ISO timestamp>

## Task
[Original task, one sentence]

## Failure Mode
[CODE]: [one-line description]

## What was attempted
- [Step 1 tried]
- [Step 2 tried]
- [Where it broke and why]

## What was learned
- [Fact that wasn't in the original brief]
- [Constraint discovered during execution]
- [Any partial output or intermediate state that exists]

## Retry packet (if retryable)
**Fix required before retry:** [specific thing to change]
**Retry prompt:**
> [Revised task with root cause addressed]

## Escalation (if not retryable)
**Route to:** [Agent or human who can unblock]
**Decision needed:** [Specific question that must be answered]
**Deadline:** [When this blocks downstream work]

## Files written (partial output to preserve)
- `path/to/file` — [what's in it, what's missing]
```

---

## ⚖️ Rules & Best Practices

- **Explicit Failure Code First**: Never output vague errors like "something broke". Always specify `BLOCKED-CRED`, `FAILED-LOGIC`, etc.
- **Preserve Partial Progress**: Record all files written before failure so downstream agents don't discard valid work.
- **Strict Retry vs Escalation Split**: If mechanical, construct the exact prompt for immediate retry. If strategic/judgment-based, formulate the explicit question for human or lead agent sign-off.
- **Specific Agent Routing**: Route escalations to designated roles (`NEXUS`, `SOL`, `JASPER`, `CREW`, etc.).
- **Concrete Deadlines**: State time sensitivity and what downstream work is blocked.

---

## 📄 Example

See [examples/sample-dead-letter.md](examples/sample-dead-letter.md) for a complete example record.
