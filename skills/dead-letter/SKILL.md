---
name: dead-letter
aliases: ["failure-triage","blocked-task","dead-letter-queue"]
description: "Capture a failed or blocked task before it disappears. Categorizes the failure mode, extracts what was learned, and generates either a retry packet with the root cause fixed or an escalation message with specific decision points."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: quality-review
metadata:
  category: quality-review
  priority: 15
  aliases: ["failure-triage","blocked-task","dead-letter-queue"]
  suggested_skills: ["handoff","pua","context-anchor","secretary"]
  hermes:
    tags: [triage, error-handling, debugging, subagents, escalation, reliability]
    related_skills: [handoff, pua, context-anchor, secretary]
    suggested_skills: [handoff, pua, context-anchor, secretary]
    requires_tools: [bash, view_file, write_to_file]
  openclaw:
    category: quality-review
    suggested_skills: [handoff, pua, context-anchor, secretary]
    primary_triggers: ["task failed","blocked on error","dead letter capture","escalate failure"]
    requires_tools: [bash, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📮 dead-letter — Failed Task Triage & Capture

Capture a failed or blocked task before context clears. Categorizes failure modes into a 9-part taxonomy, extracts what was learned, and generates either a mechanical retry prompt or an escalation decision point.

---

## When to Use

- An agent returns *"I can't proceed"*, *"blocked on"*, *"error:"*, or a partial result.
- After a long-running subagent batch or background command fails.
- Before reporting an unresolvable failure to the user or orchestrator.
- When an in-progress task must be abandoned and resumed later.

---

## Quick Reference

| Code | Failure Mode | Resolution Path |
|:---|:---|:---|
| `BLOCKED-CRED` | Missing credential / API key | Request credential securely → Retry |
| `BLOCKED-PERM` | Permission or human approval gate | Route to human / orchestrator with approval question |
| `BLOCKED-DATA` | Missing file, schema, or mock data | Identify producer → Generate missing prerequisite |
| `BLOCKED-AMBIG` | Underspecified goal / ambiguity | Rewrite handoff packet with explicit constraints |
| `BLOCKED-RATE` | Rate limited / temporary outage | Apply exponential backoff delay → Retry |
| `FAILED-LOGIC` | Defective algorithm or broken logic | Route to code reviewer / PIP debugging |
| `FAILED-TOOL` | CLI, dependency, or MCP tool crash | Fix dependency / provide isolated workaround |
| `FAILED-SCOPE` | Missing required agent capability | Re-route to specialized division |
| `PARTIAL` | Partial completion with clean breakpoint | Checkpoint written files → Handoff remaining steps |

---

## Procedure

### Step 1: Ingest Failure Signals
Read full error logs, terminal stderr, or subagent exit messages.

### Step 2: Classify Failure Mode
Assign exact code from the 9-part taxonomy.

### Step 3: Write Dead-Letter Record
Save record to `.claude/dead-letter-<timestamp>.md`:

```markdown
# Dead Letter — <ISO timestamp>

## Task
[Original task in one sentence]

## Failure Mode
[CODE]: [One-line root cause]

## What Was Attempted
- [Approach 1 and where it failed]
- [Approach 2 and where it failed]

## What Was Learned
- [Newly discovered constraint or API behavior]
- [Partial state created]

## Retry Packet (if mechanical fix exists)
**Fix required before retry:** [Exact fix]
**Retry prompt:**
> [Revised prompt addressing root cause]

## Escalation (if human judgment required)
**Route to:** [Agent division or human]
**Decision needed:** [Specific question]
**Deadline:** [Downstream impact]

## Files Written (Partial output to preserve)
- `path/to/file` — [Status and line count]
```

### Step 4: Emit Inline Summary
Output failure code and immediate next step to terminal.

---

## Pitfalls

- **Generic Error Codes**: Never classify as *"Unknown Error"*; pinpoint the exact blocker code.
- **Discarding Partial Work**: Always list and preserve partial code files created before failure.
- **Open-Ended Escalations**: Every escalation must include a clear, binary or multiple-choice decision question.

---

## Verification

- Confirm `.claude/dead-letter-<timestamp>.md` exists.
- Confirm either a concrete retry prompt OR a routed escalation question is fully specified.
