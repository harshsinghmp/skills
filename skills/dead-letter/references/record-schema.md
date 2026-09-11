# Dead-Letter Record Schema

Loaded by: the capture procedure (Step 5) when authoring a record. This is the
canonical template — every field is required unless marked optional. A record is the
single resume point for any retry: completed steps are marked in the Recovery
Sequence, and a retry resumes from the first unchecked step.

```markdown
# Dead Letter — <ISO timestamp>

## Task
[Original task in one sentence]

## Failure Mode
[CODE]: [One-line root cause]

## Recovery Decision
- Previously seen: yes/no (count)
- Classification: transient / permanent
- Autonomy: auto / confirm / escalate
- Parent record (if re-open): [path — a repeated failure of the same root cause re-opens the parent record, never a duplicate]

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
[Path, commit, or receipt of the last-known-good state — a passing test run, a saved snapshot, prior command output. The verification loop compares retried output against this baseline: a regression fails the round even when the command exits clean. None: write "None (no last-known-good state available)".]

## What Was Attempted
- [Approach 1 and where it failed]
- [Approach 2 and where it failed]

## What Was Learned
- [Newly discovered constraint or API behavior]
- [Partial state created]

## Retry Packet (if mechanical fix exists)
**Fix required before retry:** [Exact fix]
**Verification loop:** re-run the original failing command; up to 3 verify rounds (diagnose → fix → re-run), then escalate — no partial-fix thrashing. Each round compares against the Baseline Reference; a regression fails the round even when the exit code is clean.
**Retry prompt:**
> [Revised prompt addressing root cause]

## Escalation (if human judgment required)
**Route to:** [Agent division or human]
**Decision needed:** [Specific question]
**Deadline:** [Downstream impact]

## Files Written (Partial output to preserve)
- `path/to/file` — [Status and line count]

## Repro Pack (deterministic failures only)
[Path to `.agents/artifacts/repro-<slug>-<timestamp>/REPRO.md` — omit this section for transient/blocked failures]

## Orphaned Resources
[PRs opened, branches pushed, processes spawned, temp files left behind by the failed task — each with its cleanup command. None: write "None."]

## Diagnostic Artifacts
[Paths to raw evidence — JSON dumps, full logs, stack traces — written outside the tracked tree and never committed. The record links them; it does not inline them.]
```

## Field notes

- Steps 1–3 pre-checked `[x]` is correct for records authored after classification
  happened — but an agent authoring a record for a *pre-existing* failure must
  re-verify rather than trust the pre-checks.
- The template is strictly additive: older records missing newer fields (Baseline
  Reference, Repro Pack, Orphaned Resources) remain valid; readers treat absent
  sections as "not captured", never as "checked and clean".
