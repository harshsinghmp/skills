---
name: dead-letter
aliases: ["failure-triage","blocked-task","dead-letter-queue"]
description: "Capture a failed or blocked task before it disappears. Categorizes the failure mode, distinguishes transient from permanent failures, verifies actual state before any retry, preserves partial work and orphaned resources, and generates either a bounded autonomous retry packet with the root cause fixed or an escalation message with a specific decision question. Recovery follows a strict ordered sequence with baseline regression comparison against the last-known-good state, close-out can generate a repro test pack (exact reproduction steps, preconditions, expected-vs-actual, minimal failing test) for Dev/QA handoff, and the status sweep clusters open records by root cause so repeated failures across tasks surface as one systemic finding with one fix — with a findings ledger that deduplicates recurring sweeps and measures convergence."
version: 1.5.0
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
    tags: [triage, error-handling, debugging, subagents, escalation, reliability, retry-gate, state-verification, orphan-cleanup, recovery-sequence, baseline-regression, repro-pack, cluster-triage]
    related_skills: [handoff, pua, context-anchor, secretary]
    suggested_skills: [handoff, pua, context-anchor, secretary]
    requires_tools: [bash, view_file, write_to_file]
  openclaw:
    category: quality-review
    suggested_skills: [handoff, pua, context-anchor, secretary]
    primary_triggers: ["task failed","blocked on error","dead letter capture","escalate failure","retry failed task","dead letter status","repro pack","reproduction steps for the bug","triage open failures","nightly failure triage"]
    requires_tools: [bash, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📮 dead-letter — Failed Task Triage & Capture

Capture a failed or blocked task before context clears. Categorizes failure modes into a 9-part taxonomy, distinguishes transient from permanent failures, verifies actual state before any retry, preserves partial work and orphaned resources, and generates either a bounded autonomous retry prompt or an escalation decision point. Recovery follows a strict ordered sequence — classify → decide → precondition → fix → verify-against-baseline → close — tracked step-by-step in the record so a retry resumes exactly where recovery stopped. At close-out, deterministic failures can be converted into a repro test pack: the capture that documents a failure becomes the regression test that prevents its recurrence. The status sweep clusters open records by root cause — repeated failures across different tasks surface as one systemic finding with one fix, not a storm of individual retries.

---

## When to Use

- An agent returns *"I can't proceed"*, *"blocked on"*, *"error:"*, or a partial result.
- After a long-running subagent batch or background command fails.
- Before reporting an unresolvable failure to the user or orchestrator.
- When an in-progress task must be abandoned and resumable later.
- When sweeping open dead-letter records (`dead-letter status`) — past-SLA or high-retry records need triage.
- When a bug or blocker is worth handing to Dev/QA as a reproduction case (`repro pack`).
- On a scheduled sweep (`nightly failure triage`) — open records get clustered by root cause so systemic issues surface once, not per-task.

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

### Step 3: Recovery Decision (transient vs permanent)
Before authoring any retry packet, answer three questions in the record:
1. **Seen before?** A failure with the same code + root cause appearing **2+ times** escalates automatically — never a third silent retry.
2. **Transient or permanent?** Transient (crash, network blip, rate limit): retry is legitimate. Permanent (defective logic, missing capability): a retry packet is forbidden — escalate or re-scope.
3. **Autonomy level:** `auto` (mechanical fix — diagnose → fix → re-run up to 3 verification rounds without asking), `confirm` (recovery path obvious but non-mechanical — one approval question), `escalate` (ambiguous root cause or repeated failure — specific decision question, never open-ended).

### Step 4: State Verification (Precondition Check)
Never retry blindly. A "failed" state can be mid-backoff, mid-poll, or already partially applied. Emit one **Precondition Check** — a command or query that confirms the system is in the retryable state — and only emit a retry prompt when it passes.

### Step 5: Write Dead-Letter Record
Save record to `.agents/dead-letter-<timestamp>.md` using the canonical template in [references/record-schema.md](references/record-schema.md). The record carries a **Recovery Sequence** — the ordered checklist (classify → decide → precondition → fix → verify-against-baseline → close) is the single resume point for any retry: completed steps are marked, and a retry resumes from the first unchecked step, never from an arbitrary point. Load the schema reference only when authoring a record; a sweep or a resume-from-record does not need it.

### Step 6: Emit Inline Summary
Output failure code and immediate next step to terminal.

---

## Status Sweep & Cluster Triage (`dead-letter status`)

On request (or on a scheduled sweep — `nightly failure triage`), run the three-pass sweep (inventory → cluster by root cause → verdict per cluster) per [references/sweep-protocol.md](references/sweep-protocol.md). Load that reference only when sweeping — capture and retry do not need it. Invariant: clusters form on **root cause, not error-string similarity**; verdicts are systemic / coincidental / cascade / escalate-cluster; a sweep that ends with retry authorization for a systemic cluster has failed. Recurring sweeps consult the findings ledger (`.agents/artifacts/dead-letter-ledger.md`) to deduplicate verdicts and measure convergence.

---

## Repro Test Pack (close-out conversion)

A dead letter is high-signal evidence; a closed deterministic failure shouldn't just be archived — it should be converted into the regression test that prevents recurrence. At close-out (Recovery Sequence step 6), when the failure is **deterministic** (permanent-class: `FAILED-LOGIC`, `FAILED-TOOL`, or a `BLOCKED-*` with a stable local trigger) and the environment permits writing test files, generate a repro pack.

**When NOT to generate** (skip the pack, close the record plainly):
- Transient or environment-dependent failures (network blips, rate limits) — a flaky repro is worse than none.
- The fix is already verified against the Baseline Reference and shipped — the test suite already covers it.
- The project has no test runner or the failure needs external systems (real APIs, prod data) — record the manual steps instead.

**Where:** `.agents/artifacts/repro-<slug>-<timestamp>/` (working-artifacts rule: never the tracked tree; the record links the pack path).

**What the pack contains** (`REPRO.md` + one failing test when feasible):

| Component | Requirement |
| :--- | :--- |
| **Reproduction steps** | Exact, numbered, deterministic — each step observable, no "try again" ambiguity |
| **Preconditions** | Data, environment, config, versions — everything a stranger needs to reach the failing state |
| **Expected vs actual** | The assertion pair from the original failure — what the system should do vs what it did |
| **Minimal failing test** | One test, smallest surface, red on the un-fixed code — when the project has a test runner. The observed red is evidence; a red you have not seen is a claim |
| **Spec note** | The expected behavior is the specification — if the behavior is actually correct, the spec is wrong: fix the spec, never the test to match broken behavior |

The pack is a handoff artifact: Dev/QA (or a fresh agent) runs the test red → fixes → runs green, without re-deriving the failure from logs. The dead-letter record links the pack; on recurrence of the same root cause, the pack is the parent record's evidence attachment — the regression test makes the parent record's retry packet verifiable.

---

## Pitfalls

- **Generic Error Codes**: Never classify as *"Unknown Error"*; pinpoint the exact blocker code.
- **Discarding Partial Work**: Always list and preserve partial code files created before failure.
- **Open-Ended Escalations**: Every escalation must include a clear, binary or multiple-choice decision question.
- **Blind Retries**: Retrying without the precondition check — a mid-backoff or half-applied state turns a clean failure into a corrupt one.
- **Permanent-Failure Retry Loops**: Permanent-class failures (logic, capability gaps) get no retry packet; the third occurrence of the same root cause is always an escalation.
- **Leaked Resources**: Closing a record without enumerating orphaned PRs, branches, or processes — cleanup commands go in the record, not in memory.
- **Improvised Recovery Order**: Resuming a failed recovery from an arbitrary step — the record's Recovery Sequence is the single resume point; skip nothing, reorder nothing.
- **Clean-Exit Regression**: Declaring success on a green exit code without comparing against the Baseline Reference — a fix that reintroduces old breakage must fail the verification round.
- **Unseen Red**: Shipping a repro pack whose test was never observed failing — a red you have not seen is a claim; run the test against the un-fixed state and record the observed failure output in the pack.
- **String-Match Clustering**: Grouping records by similar error text instead of root cause — identical stack traces can hide different causes, and different messages can share one. Read What-Was-Learned for the causal evidence before clustering.
- **Retry Storm on Systemic Clusters**: Authorizing per-record retries for records sharing one root cause — the sweep's purpose is one fix covering all members; retrying members individually is the failure the sweep exists to prevent.

---

## Verification

- Confirm `.agents/dead-letter-<timestamp>.md` exists.
- Confirm either a concrete retry prompt OR a routed escalation question is fully specified.
- Confirm the Recovery Decision is filled (seen-before count, transient/permanent, autonomy level).
- Confirm the Precondition Check ran and its observed result is recorded.
- Confirm Orphaned Resources is enumerated (or "None.") — no silent leaks.
- Confirm the Recovery Sequence tracks completed steps and a retry resumes from the first unchecked one.
- Confirm a Baseline Reference exists when last-known-good state is available, and the verification loop compares against it — not just exit codes.
- For deterministic failures closed with a pack: confirm `REPRO.md` exists at the linked path, the test was observed red (output recorded), and the spec note states which document is the source of truth.
- For a status sweep: confirm clusters were derived from root-cause evidence (What-Was-Learned, precondition results) — not error-string similarity — and the report ends with a sweep action line; systemic clusters carry one fix/escalation, not per-record retries.
