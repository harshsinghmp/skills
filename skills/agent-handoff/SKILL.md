---
name: handoff
aliases: ["agent-handoff","subagent-handoff","context-packet","resume","where-were-we"]
description: "Bidirectional agent handoff and session resumption engine. Resume previous agent sessions with strict directory-boundary matching and unanswered questions leading, or generate structured outbound context packets before dispatching subagents."
version: 2.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: context-orchestration
metadata:
  category: context-orchestration
  priority: 6
  aliases: ["agent-handoff","subagent-handoff","context-packet","resume","where-were-we"]
  suggested_skills: ["context-anchor","dead-letter","coupling-router","updateagents"]
  hermes:
    tags: [subagents, handoff, resume, orchestration, context, governance, reliability]
    related_skills: [context-anchor, dead-letter, coupling-router, updateagents]
    suggested_skills: [context-anchor, dead-letter, coupling-router, updateagents]
    requires_tools: [bash, view_file, write_to_file]
  openclaw:
    category: context-orchestration
    suggested_skills: [context-anchor, dead-letter, coupling-router, updateagents]
    primary_triggers: ["where were we","resume","pick up where I left off","handoff to subagent","create context packet","dispatch worker","self-handoff"]
    requires_tools: [bash, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🤝 handoff — Bidirectional Agent Handoff & Session Resumption Engine

> **Aliases**: `agent-handoff` | `subagent-handoff` | `context-packet` | `resume` | `where-were-we`

`handoff` provides bidirectional context continuity across agent lifecycles:
1. **Inbound Resumption**: Resumes previous agent sessions with boundary-safe directory matching, leading with any unanswered open questions.
2. **Outbound Dispatch**: Generates lean, bounded context packets before dispatching subagents or stepping away.

---

## When to Use

### Mode A: Inbound Session Resumption
- User asks: *"where were we"*, *"resume"*, *"pick up where I left off"*, *"what was I doing"*, or begins a session with no fresh prompt.
- Restoring state after an interruption or machine restart.

### Mode B: Outbound Subagent Dispatch
- Before dispatching any subagent for backend, frontend, testing, or refactoring.
- Before spawning multi-agent teams or worker processes.
- Before stepping away from a long-running session (>30 minutes).
- Whenever a task prompt to another agent exceeds 3 sentences.

---

## Quick Reference

### Inbound vs Outbound Comparison

| Capability | Inbound Resumption Mode | Outbound Dispatch Mode |
|:---|:---|:---|
| **Trigger** | *"where were we"*, *"resume"* | *"dispatch worker"*, *"handoff to subagent"* |
| **Matching Rule** | Strict directory-boundary matching (`===` or `startsWith(cwd + sep)`) | Explicit destination file and line range scope |
| **First Output** | Unanswered user question (if any) | Single 1-sentence actionable objective |
| **Persistence** | Session memory / `.agents/artifacts/` | `.agents/artifacts/handoff-<timestamp>.md` |
| **Closing Token** | Concrete atomic next-step pointer | Deterministic verification command |

---

## Procedures

### 🔄 Mode A: Inbound Session Resumption Procedure

1. **Resolve Workspace Directory**:
   Normalize the current working directory. If a directory override argument is provided, resolve to an absolute path.
2. **Retrieve Prior Session**:
   Query session history (via MCP memory tools `memory_sessions` / `memory_recall` or inspect `.agents/artifacts/` and `.agents/context/current.md`).
   - **Enforce Directory-Boundary Isolation**:
     ```ts
     // Prohibit raw prefix matching to prevent sibling repo bleed:
     session.cwd === projectPath || session.cwd.startsWith(projectPath + path.sep)
     ```
3. **Surface Unanswered Questions FIRST**:
   If the prior session ended on an unanswered user question (`?`), highlight it at the very top of your response. Do not guess the answer.
4. **Format Resumption Summary**:
   ```text
   Resuming [session_id] "[session_title]".

   ❓ Open Question from Last Session:
   [Unanswered question, if present]

   📌 State Summary:
   - Key decisions & modified files
   - Active roadblocks

   👉 Immediate Next Step:
   [Single concrete atomic action]
   ```

---

### 📦 Mode B: Outbound Subagent Dispatch Procedure

1. **Extract Operational Facts**:
   - **Objective**: Exact 1-sentence goal starting with an imperative verb.
   - **Decisions Made**: Irreversible choices not to be re-litigated.
   - **Ruled-Out Paths**: Approaches tried and eliminated with failure reasons.
   - **Target Scope**: Exact files to touch.
   - **Hard Constraints**: Forbidden files, libraries, or credentials (`MUST NOT`).
   - **Deterministic Verification**: Exact test or build command.
   - **If Blocked**: Escalation fallback.
2. **Write Handoff Packet**:
   Save to `.agents/artifacts/handoff-<timestamp>.md`:

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
- [MUST NOT]: [Forbidden scope, .env, credentials, or prohibited library]

## Success Criterion
- [ ] [Verifiable command — test passes, build succeeds, HTTP 200]

## If Blocked
[Explicit fallback action — emit dead-letter record, escalate with finding.]
```

3. **Echo & Dispatch**:
   Embed packet directly into the subagent invocation prompt.

---

## Pitfalls

- **Raw Prefix Collisions**: Never match session directories using raw `startsWith(path)`; sibling directories like `/project-staging` will falsely match `/project`.
- **Hiding Open Questions**: Never bury an unanswered user question under a wall of status logs.
- **Compound Objectives**: Never combine multiple decoupled tasks into one outbound packet.
- **Omitted Ruled-Out Paths**: Subagents re-explore failed attempts unless explicitly forbidden.

---

## Verification

- [ ] Inbound resumption surfaces any unanswered question before status text.
- [ ] Session matching strictly validates directory boundaries.
- [ ] Outbound handoff packet is written to `.agents/artifacts/handoff-<timestamp>.md`.
- [ ] All 7 outbound sections are populated with zero placeholder text.
