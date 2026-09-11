---
name: handoff
aliases: ["agent-handoff","subagent-handoff","context-packet","resume","where-were-we"]
description: "Bidirectional agent handoff and session resumption engine with ambient continuity. Generates lean, bounded context packets before dispatching subagents, resumes previous sessions with boundary-safe directory matching and unanswered questions leading, and maintains an always-current HANDOFF.md live-state file with a state-source ladder (live file, memory recall, project context, git forensics) probed on every workspace entry so any new conversation or agent continues prior work at lowest token cost — even after abrupt endings, with no explicit handoff requested. Dispatches embed the worktree-lease gate for shared checkouts."
version: 2.2.1
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: context-orchestration
metadata:
  skill_orchestration:
    pre: ["context-anchor"]
    optional: ["coupling-router", "dead-letter"]
  category: context-orchestration
  priority: 6
  aliases: ["agent-handoff","subagent-handoff","context-packet","resume","where-were-we"]
  suggested_skills: ["context-anchor","dead-letter","coupling-router","updateagents","ai-ready"]
  hermes:
    tags: [subagents, handoff, resume, orchestration, context, governance, reliability, ambient-continuity, session-state, git-forensics]
    related_skills: [context-anchor, dead-letter, coupling-router, updateagents, ai-ready]
    suggested_skills: [context-anchor, dead-letter, coupling-router, updateagents, ai-ready]
    requires_tools: [bash, view_file, write_to_file]
  openclaw:
    category: context-orchestration
    suggested_skills: [context-anchor, dead-letter, coupling-router, updateagents, ai-ready]
    primary_triggers: ["where were we","resume","pick up where I left off","handoff to subagent","create context packet","dispatch worker","self-handoff","continue the last session","new conversation in this workspace"]
    requires_tools: [bash, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🤝 handoff — Bidirectional Handoff, Resumption & Ambient Continuity Engine

> **Aliases**: `agent-handoff` | `subagent-handoff` | `context-packet` | `resume` | `where-were-we`

`handoff` provides context continuity across agent lifecycles in three modes:
1. **Inbound Resumption**: Resumes previous agent sessions with boundary-safe directory matching, leading with any unanswered open questions.
2. **Outbound Dispatch**: Generates lean, bounded context packets before dispatching subagents or stepping away.
3. **Ambient Continuity** (v2.1.0): Passively maintains a live state file and probes for it on every workspace entry, so work continues across conversations, agents, and runtimes — even after abrupt endings and even when no one asked for a handoff.

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

### Mode C: Ambient Continuity (Default-On)
- **Every workspace entry**: probe for prior state before doing anything else.
- **Every checkpoint**: a milestone completes, a decision is made, a correction lands, a task is abandoned mid-flight.
- **End of any working turn with work incomplete**: session ending normally, crash imminent, or user walking away — no explicit handoff request required.
- A brand-new conversation opens in a working directory where prior work happened: the agent resumes context automatically instead of starting blind.

---

## Quick Reference

### Mode Comparison

| Capability | Inbound Resumption (A) | Outbound Dispatch (B) | Ambient Continuity (C) |
|:---|:---|:---|:---|
| **Trigger** | *"where were we"*, *"resume"* | *"dispatch worker"*, *"handoff to subagent"* | Workspace entry; checkpoints; incomplete end-of-turn |
| **Matching Rule** | Strict directory-boundary matching (`===` or `startsWith(cwd + sep)`) | Explicit destination file and line range scope | Current working directory, always |
| **First Output** | Unanswered user question (if any) | Single 1-sentence actionable objective | ≤5-line resumption block, then first productive action |
| **Persistence** | Session memory / `.agents/artifacts/` | `.agents/artifacts/handoff-<timestamp>.md` | `.agents/artifacts/HANDOFF.md` (overwritten, never appended) |
| **Closing Token** | Concrete atomic next-step pointer | Deterministic verification command | Refreshed live file + optional memory write |

### Token Budgets (hard limits)

| Phase | Budget | Rule |
|:---|:---|:---|
| Entry probe | 1 command | `test -f .agents/artifacts/HANDOFF.md` — zero analysis before this |
| Resumption output | ≤5 lines | State summary + next step only; no narrative, no history retelling |
| Detail loading | On demand | Full packet, references, and memory recall load **only** when the 5-line block is insufficient or the user asks |
| Live-file write | ≤30 lines | HANDOFF.md is a pointer, not a journal |

### The State-Source Ladder (cold-start continuity)

On workspace entry, resolve prior state by climbing the ladder; stop at the first rung that yields state:

1. **Live Handoff file** — `.agents/artifacts/HANDOFF.md` exists → resume from it directly.
2. **Memory recall** — query the runtime's session-memory tool (e.g. `memory_sessions` / `memory_recall`), strictly filtered to this directory boundary.
3. **Project context** — `.agents/context/current.md` and `.agents/context/index.md` (maintained by `updateagents` conventions).
4. **Git forensics** — reconstruct from the repository itself (recipe in [references/resumption-protocol.md](references/resumption-protocol.md)); after reconstructing, **write HANDOFF.md immediately** so the next agent never digs again.
5. **Cold start** — declare honestly: `No prior session history found for this project directory.` Never invent history. Offer the `ai-ready` audit.

### The Live Handoff File (`.agents/artifacts/HANDOFF.md`)

One fixed-name file, ≤30 lines, overwritten on every state change — the bridge from any session to any future conversation:

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

Omit empty sections. Full schema and write-trigger contract: [references/ambient-handoff.md](references/ambient-handoff.md).

---

## Procedures

### 🔄 Mode A: Inbound Session Resumption Procedure

1. **Resolve Workspace Directory**:
   Normalize the current working directory. If a directory override argument is provided, resolve to an absolute path.
2. **Retrieve Prior Session** (via the State-Source Ladder above):
   Query session history (memory tools, `.agents/artifacts/`, `.agents/context/current.md`), enforcing directory-boundary isolation:
   ```ts
   // Prohibit raw prefix matching to prevent sibling repo bleed:
   session.cwd === projectPath || session.cwd.startsWith(projectPath + path.sep)
   ```
3. **Surface Unanswered Questions FIRST**:
   If the prior session ended on an unanswered user question (`?`), highlight it at the very top of your response. Do not guess the answer.
4. **Format Resumption Summary** (≤5 lines before the first productive action):
   ```text
   Resuming [session_id] "[session_title]".

   ❓ Open Question from Last Session:
   [Unanswered question, if present]

   📌 State: [key decisions & modified files · active roadblocks]

   👉 Immediate Next Step:
   [Single concrete atomic action]
   ```

### 📦 Mode B: Outbound Subagent Dispatch Procedure

1. **Extract Operational Facts**:
   - **Objective**: Exact 1-sentence goal starting with an imperative verb.
   - **Decisions Made**: Irreversible choices not to be re-litigated.
   - **Ruled-Out Paths**: Approaches tried and eliminated with failure reasons.
   - **Target Scope**: Exact files to touch.
   - **Hard Constraints**: Forbidden files, libraries, or credentials (`MUST NOT`).
   - **Deterministic Verification**: Exact test or build command.
   - **If Blocked**: Escalation fallback.
2. **Write Handoff Packet** to `.agents/artifacts/handoff-<timestamp>.md` (structure in [README](README.md#-packet-structure) and worked example in [examples/sample-handoff.md](examples/sample-handoff.md)).
3. **Lease hand-off to workers** (shared checkouts): if the packet's Target Scope includes git mutations (branch switches, stashes, commits to shared surfaces), embed the worktree-lease instruction in the dispatch prompt — the worker probes `.agents/artifacts/WORKTREE-LEASE.md` before its first git mutation and inherits or acquires per the lease protocol (`coupling-router` Step 0). Never dispatch two workers whose scopes overlap on one checkout.
4. **Echo & Dispatch**: Embed the packet directly into the subagent invocation prompt.
5. **Refresh the live file**: update HANDOFF.md to point at the dispatched task so an interrupting conversation still lands correctly.

### 🌊 Mode C: Ambient Continuity Procedure

**Write side (passive, silent — no prose, no user interruption):**

| Trigger | Action |
|:---|:---|
| Checkpoint completed (milestone, passing gate, landed change) | Overwrite HANDOFF.md with new Next Step |
| User decision or correction received | Record under Decisions; refresh timestamp |
| End of turn with work incomplete | Overwrite HANDOFF.md (Next Step = exactly what you would do next) |
| Ending signal ("close", "wrap up", session end) | Full flush: HANDOFF.md + timestamped packet if the state is rich + memory hook |
| Task blocked or abandoned | Next Step = escalation path; route the failure to `dead-letter` |

**Read side:**
- **Workspace entry always probes** for HANDOFF.md before any other work. If present and fresh (same branch, plausible timestamp), emit the ≤5-line resumption block and continue — even though nobody said "resume".
- If the user's first message is a fresh instruction, treat the resumption block as silent context: proceed with the instruction, informed by state.
- **Lease check on entry** (shared checkouts): if `.agents/artifacts/WORKTREE-LEASE.md` exists with a fresh heartbeat, another session is live — the ≤5-line resumption block notes this, and the entry session takes a separate worktree or stays read-only until the lease releases (decision rules: `coupling-router` Step 0).

**Anti-noise guardrails:**
- One file, overwritten — never append, never accumulate.
- Refresh only on real state change (checkpoint, decision, reversal); not on every tool call.
- Silent writes: ambient handoff never narrates itself.

### 🧠 Memory System Hooks

Handoff integrates with whatever memory system the runtime provides (e.g. musememory's write/recall tools), without ever touching `.memory/**` directly — that path is owned exclusively by `musememory`:

1. **On outbound handoff or full flush**: push *durable decisions only* (not the file dump) through the runtime's memory-write tool call when one exists. Ephemeral state stays in HANDOFF.md; durable rules and decisions go to memory.
2. **On workspace entry (ladder rung 2)**: memory recall is a lookup, filtered strictly to the current directory boundary.
3. **When no memory tool exists**: durable findings are reported in the output and recorded in `.agents/context/` via `updateagents` conventions — never written to `.memory/` by hand.

### Neighboring Skill Boundaries

- `context-anchor` → manual mid-session drift stop within one conversation. Ambient `handoff` → session-boundary continuity across conversations; the live file doubles as a rolling anchor.
- `coupling-router` → owns the shared-worktree lease. Handoff routes to it: dispatches embed the lease instruction (Mode B step 3) and workspace entry respects an active lease (Mode C read side). A session that died holding the lease is exactly the case handoff's ladder reconstructs — check its `notes` for preserved WIP.
- `dead-letter` → failure-path escape hatch. A blocked task lands in both: HANDOFF.md Next Step (continuity) + dead-letter packet (diagnosis).
- `updateagents` → owns durable `.agents/context/` truth; ambient handoff reads it (ladder rung 3) and routes durable changes to it rather than editing governed context directly.

---

## Pitfalls

- **Raw Prefix Collisions**: Never match session directories using raw `startsWith(path)`; sibling directories like `/project-staging` will falsely match `/project`.
- **Hiding Open Questions**: Never bury an unanswered user question under a wall of status logs.
- **Compound Objectives**: Never combine multiple decoupled tasks into one outbound packet.
- **Omitted Ruled-Out Paths**: Subagents re-explore failed attempts unless explicitly forbidden.
- **Journal Bloat**: HANDOFF.md is a pointer, not a diary. If it exceeds ~30 lines it has become a session log — prune or demote detail to a timestamped packet.
- **Ladder Skipping**: Do not run deep analysis before the entry probe; the cheapest rung that yields state wins.
- **Silent Cold Starts**: Never invent prior context when the ladder returns nothing — say "cold start" and move.

---

## Verification

- [ ] Inbound resumption surfaces any unanswered question before status text.
- [ ] Session matching strictly validates directory boundaries.
- [ ] Outbound handoff packet is written to `.agents/artifacts/handoff-<timestamp>.md`.
- [ ] Workspace entry performed the HANDOFF.md probe before other work.
- [ ] HANDOFF.md is ≤30 lines, overwritten (not appended), and carries an atomic Next Step.
- [ ] Resumption output stayed within the ≤5-line budget before the first productive action.
- [ ] Memory integration used the runtime's tool API (or reported the durable fact) — `.memory/**` never touched by hand.
- [ ] All 7 outbound packet sections are populated with zero placeholder text.
- [ ] In shared checkouts, dispatched workers carry the worktree-lease instruction, and entry respected any active lease before mutating.

---

## References

- 🔄 [Inbound Resumption & Boundary Protection Protocol](references/resumption-protocol.md)
- 🌊 [Ambient Continuity & Live Handoff File Contract](references/ambient-handoff.md)
- 📄 [Sample Handoff Packet](examples/sample-handoff.md)
- 📄 [Sample Live Handoff File](examples/sample-HANDOFF.md)
