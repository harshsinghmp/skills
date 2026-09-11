# dead-letter Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /dead-letter](https://img.shields.io/badge/Triggers-%2Fdead--letter%20%7C%20%2Fdl-red.svg?style=for-the-badge)](#)

Capture a failed or blocked task before it disappears. Categorizes the failure mode, distinguishes transient from permanent failures, verifies actual state before any retry, preserves partial work and orphaned resources, and generates either a bounded autonomous retry packet with the root cause fixed or an escalation message with a specific decision question. Recovery follows a strict ordered sequence with baseline regression comparison against the last-known-good state, close-out can generate a repro test pack (exact reproduction steps, preconditions, expected-vs-actual, minimal failing test) for Dev/QA handoff, and the status sweep clusters open records by root cause so repeated failures across tasks surface as one systemic finding with one fix.

---

## What is this?

Failed tasks are high-signal information. An agent that fails or hits a blocker learned critical ground truths — what was attempted, where the environment broke, what assumptions failed, and which partial artifacts were written. 

If this context isn't preserved before the session terminates or context resets, the next agent restarts from scratch and hits the identical wall. `dead-letter` captures the failure into `.agents/dead-letter-<timestamp>.md` — with a Recovery Decision (transient vs permanent, autonomy level), a Precondition Check, a step-tracked Recovery Sequence, and a Baseline Reference — and outputs an actionable bounded retry packet or escalation decision point. At close-out, deterministic failures convert into repro test packs; scheduled sweeps (`dead-letter status`) cluster open records by root cause so systemic issues surface once, not per-task.

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

| Trigger | Action |
| :--- | :--- |
| `/dead-letter`, `/dl` | Capture the current failure into a record |
| `dead-letter status` | Sweep all open records: inventory → cluster by root cause → verdict per cluster (one fix for systemic, split for coincidental, cascade ordering, single escalation with cluster evidence) |
| `repro pack`, `reproduction steps for the bug` | Generate a repro test pack from a closed deterministic failure |

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

Saved to `.agents/dead-letter-<timestamp>.md`:

```markdown
# Dead Letter — <ISO timestamp>

## Task
[Original task, one sentence]

## Failure Mode
[CODE]: [one-line root cause]

## Recovery Decision
- Previously seen: yes/no (count)
- Classification: transient / permanent
- Autonomy: auto / confirm / escalate
- Parent record (if re-open): [path]

## Precondition Check
[Command/query verifying retryable state — run it; record the observed result]

## Recovery Sequence
1. [x] Classify failure mode
2. [x] Recovery decision (transient/permanent, autonomy level)
3. [x] Precondition check
4. [ ] Apply fix
5. [ ] Verify against baseline
6. [ ] Close out (cleanup + repro pack if deterministic + resolve/escalate)

[On retry, resume from the first unchecked step. Never skip or reorder.]

## Baseline Reference
[Last-known-good state — receipt, commit, or snapshot. The verification loop compares
retried output against this baseline; a regression fails the round even on a clean exit.]

## What was attempted
- [Step 1 tried]
- [Where it broke and why]

## What was learned
- [Constraint discovered during execution]
- [Any partial output or intermediate state that exists]

## Retry packet (if retryable)
**Fix required before retry:** [specific thing to change]
**Verification loop:** re-run the failing command; up to 3 verify rounds, then escalate.
**Retry prompt:**
> [Revised task with root cause addressed]

## Escalation (if not retryable)
**Route to:** [Agent or human who can unblock]
**Decision needed:** [Specific binary or multiple-choice question]
**Deadline:** [When this blocks downstream work]

## Files written (partial output to preserve)
- `path/to/file` — [what's in it, what's missing]

## Orphaned Resources
[PRs, branches, processes, temp files — each with its cleanup command. None: write "None."]

## Diagnostic Artifacts
[Paths to raw evidence outside the tracked tree — the record links them, never inlines them.]

## Repro Pack (deterministic failures only)
[Path to `.agents/artifacts/repro-<slug>-<timestamp>/REPRO.md` — omitted for transient/blocked failures]
```

Sweep open records any time with `dead-letter status`: inventory (open records with retry counts and ages) → cluster by **root cause, not error-string similarity** → one verdict per cluster (systemic = one fix for all members; coincidental = split; cascade = fix the producer first; escalate cluster = one escalation with the cluster as evidence). Ends with a sweep action line: counts of fixes, retries authorized, and escalations.

---

## ⚖️ Rules & Best Practices

- **Explicit Failure Code First**: Never output vague errors like "something broke". Always specify `BLOCKED-CRED`, `FAILED-LOGIC`, etc.
- **Recovery Gate Before Retry**: Classify transient vs permanent before authoring any retry packet; permanent failures (defective logic, missing capability) get escalation or re-scope, never a third silent retry.
- **Precondition Check Before Retry**: Verify the actual system state — a "failed" state can be mid-backoff, mid-poll, or half-applied.
- **Resume From the Record**: The Recovery Sequence is the single resume point for any retry — never an arbitrary step.
- **Baseline Over Exit Codes**: Verify against the last-known-good state; a clean exit that regresses the baseline fails.
- **Preserve Partial Progress**: Record all files written before failure so downstream agents don't discard valid work.
- **Close Out Leaks**: Enumerate orphaned PRs, branches, and processes with their cleanup commands.
- **Convert Deterministic Failures**: At close-out, generate a repro test pack (reproduction steps, preconditions, expected vs actual, minimal failing test observed red) so the failure becomes the regression test preventing recurrence.
- **Strict Retry vs Escalation Split**: If mechanical, construct the exact prompt for immediate retry. If strategic/judgment-based, formulate the explicit question for human or lead agent sign-off.
- **Specific Agent Routing**: Route escalations to designated roles (`NEXUS`, `SOL`, `JASPER`, `CREW`, etc.).
- **Concrete Deadlines**: State time sensitivity and what downstream work is blocked.

---

## 📄 Examples

- [examples/sample-dead-letter.md](examples/sample-dead-letter.md) — a complete record with Recovery Decision, Precondition Check, Recovery Sequence, and Baseline Reference.
- [examples/sample-repro-pack.md](examples/sample-repro-pack.md) — a worked repro test pack generated at close-out for a deterministic failure.

---

## 📁 Structure

```text
dead-letter/
├── SKILL.md                        # taxonomy, capture procedure, close-out, verification
├── README.md                       # this file — human reference (agents: load SKILL.md)
├── references/
│   ├── record-schema.md            # full record template (loaded when authoring a record)
│   └── sweep-protocol.md           # status sweep & cluster triage (loaded when sweeping)
└── examples/
    ├── sample-dead-letter.md
    └── sample-repro-pack.md
```

> **Note for agents:** the per-skill README is a human reference, not agent
> instructions — agents should load `SKILL.md` (plus the mode's reference), never
> this file.
