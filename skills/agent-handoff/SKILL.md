---
name: agent-handoff
description: "Generate a structured context packet before dispatching any subagent. Prevents context drift, hallucinated constraints, and re-exploring dead ends."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [subagents, handoff, orchestration, context, governance, reliability]
    related_skills: [dead-letter, context-anchor, pua]
    requires_tools: [bash, view_file, write_to_file]
---

# 🤝 agent-handoff — Structured Subagent Context Generator

You are preparing a handoff packet — the minimum explicit context a subagent needs to execute correctly without asking clarifying questions, re-exploring dead ends, or hallucinating constraints.

---

## When to Use

- Before dispatching any subagent for backend, frontend, testing, or refactoring.
- Before spawning multi-agent teams or worker processes.
- Before resuming a task idle for >30 minutes (self-handoff).
- Whenever your task prompt to another agent exceeds 3 sentences.

---

## Quick Reference

| Field | Purpose | Requirement |
|:---|:---|:---|
| **Objective** | Single actionable 1-sentence goal starting with a verb | Mandatory |
| **Context Needed** | Architecture, API, and runtime facts not obvious from source | Mandatory |
| **Ruled-Out Paths** | What was tried and failed (with explicit failure rationale) | Mandatory |
| **Files to Touch** | Specific files and line ranges within scope | Mandatory |
| **Hard Constraints** | Negative boundaries (`MUST NOT` touch auth, .env, etc.) | Mandatory |
| **Success Criterion** | Deterministic verification command or observable outcome | Mandatory |
| **If Blocked** | Explicit fallback action when encountering blockers | Mandatory |

---

## Procedure

### Step 1: Extract Operational Facts
Extract from the current orchestrator session:
1. **Actionable Objective**: Exact 1-sentence goal.
2. **Decisions Made**: Irreversible choices not to be re-litigated.
3. **Ruled-Out Paths**: Approaches tried and eliminated.
4. **Target Scope**: Exact files and directories.
5. **Forbidden Scope**: Restricted files, configs, and credentials.
6. **Deterministic Verification**: Tests, curl endpoints, or DOM selectors.

### Step 2: Write Handoff Packet
Save packet to `.claude/handoff-<timestamp>.md`:

```markdown
# Agent Handoff — <ISO timestamp>

## Objective
[One sentence starting with an imperative verb.]

## Context the Subagent Needs
- [Key architectural decision, API behavior, or business rule]
- [Runtime invariant not obvious from static source]

## Already Tried — Do NOT Re-Attempt
- [Approach A]: [Exact failure reason]
- [Approach B]: [Exact failure reason]

## Files to Touch
- `path/to/file.ts` — [Exact modification]

## Hard Constraints
- [MUST NOT]: [Forbidden scope or prohibited library]

## Success Criterion
- [ ] [Verifiable command — test passes, build succeeds, HTTP 200]

## If Blocked
[Explicit fallback action — emit dead-letter record, escalate with finding.]
```

### Step 3: Echo & Dispatch
Embed packet directly into subagent prompt.

---

## Pitfalls

- **Compound Objectives**: Never combine multiple decoupled tasks into one handoff packet.
- **Omitted Ruled-Out Paths**: Subagents re-explore failed attempts unless explicitly forbidden.
- **Vague Success Criteria**: Never use subjective criteria like *"make it clean"*; use concrete build or test commands.

---

## Verification

- Confirm `.claude/handoff-<timestamp>.md` is created.
- Confirm all 7 sections of the packet are populated with zero placeholder text.
