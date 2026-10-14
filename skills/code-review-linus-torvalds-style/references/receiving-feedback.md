# Receiving Feedback — rigor over compliance

Loaded by the `receive` mode: review feedback has arrived on your work and needs
acting on. The failure mode this lane exists for is **performative agreement** —
implementing feedback because it arrived, not because it is correct.

## Protocol

1. **Confirm the artifact was intact.** Before adjudicating anything, check
   the reviewer saw what you sent — findings about missing references,
   truncated sections, or mismatched numbering are usually a bad
   upload/excerpt, not defects. Adjudicating those as real breaks correct work.
2. **Verify before implementing.** Check every piece of feedback against the actual
   code. Read the lines the reviewer cites; confirm the claimed behavior exists.
2. **Classify each item** into exactly one response:
   - **Implement** — verified correct; apply it (one commit per finding when more
     than one).
   - **Rebut** — verified wrong; answer with evidence (test output, spec reference,
     line citations), never with deference. A reviewer can be wrong; the code is the
     arbiter.
   - **Ask** — genuinely ambiguous; reply with one specific question, not a restate
     of the feedback.
3. **Risk-gate before applying.** Feedback touching authentication, payments,
   migrations, or public contracts gets investigation before application — never a
   blind edit, however senior the source. Blocking feedback that you decline needs a
   stated reason and, where the call is not yours to make, a named authority to
   override — you are the executor, not the approver, on blockers.
4. **Answer every comment.** Every piece of feedback is either fixed and verified or
   answered with a reasoned why-not (with evidence), before the thread closes. No
   silent partial application.
5. **Close the loop.** After applying, re-verify the original concern is actually
   addressed (not just the literal suggestion implemented) and report what was done
   per item.

## Default to Fix — don't churn

Default to fixing the feedback. Most review comments — nitpicks included — are
correct and worth fixing, so the baseline is compliance, not scrutiny. Diverge only
for a concrete, stated reason:

- The fix changes deliberately-chosen behavior (a documented decision, an intended
  trade-off).
- The fix is outside this change's scope (orthogonal work logged separately).
- The comment is factually wrong — read the actual code to confirm before rebutting.

Read the code to decide; do not churn pointlessly, but treat "I'll just recheck every
nit rather than fix it" as the default to reject.

## Convergence trajectory — one flag over a pile of nit-fixes

If the same root cause keeps being re-raised across review rounds (rounds ≥ 2 raised the
same underlying issue) and no escalation has been answered, stop fixing nit-by-nit.
Recurrence of the same root cause is the trigger — not a score plateau. Emit **one**
approach-level flag instead: the point of disagreement needs a human decision (product,
scope, or design call), and no amount of per-item fixes will resolve it. Escalate once,
clearly, and hold there until someone answers.

## Anti-patterns

- "Great catch!" followed by an unverified edit — sycophancy is not review.
- Silent partial application (implementing 3 of 5 items, mentioning none).
- Complying with mutually contradictory feedback instead of surfacing the conflict.
- Treating the review as an approval ritual to survive rather than a correctness
  instrument.

## Adjudication gate (enrich — source: `claude-code-my-workflow-adjudicate-review`, raw SKILL.md fetched 2026-09-19)

Every incoming finding is a CANDIDATE until verified against the source —
especially when the reviewer is a model. Confident, specific, line-numbered
prose is a hypothesis, not a verdict.

- **Type each candidate**: false statement | proof/logic gap | overclaim
  (headline exceeds what is established) | scope-or-consistency |
  exposition | artifact. Severity: fatal | major | minor. Return
  CONFIRMED / REFUTED / PARTIAL with line-level evidence; a refutation
  cites the refuting text, not recollection.
- **Mechanical checks beat opinion.** If a finding is computable, compute
  it: grep the symbol, resolve the cross-reference, run the consuming code
  on an adversarial case. A two-minute check outranks reviewer confidence
  in either direction.
- **Agreement is not confirmation.** Two reviewers flagging the same thing
  is weak evidence — models share failure modes. Independent computation
  confirms; concurring prose does not. Agreement on absence is not evidence
  of absence either.
- **Check the proposed fix, not just the finding.** A reviewer can be right
  that code is confusing and wrong about why — applying its patch can
  introduce a real error (removing a load-bearing "redundant" step,
  conceding an unmade restriction, "correcting" a right cross-reference).
- **Refuted ≠ safe: treat misreads as documentation signals.** If a careful
  reviewer stumbled, a human will too — the dominant cause is remoteness
  (the license sits sentences away, imported by reference, in a distant
  note). Bring the qualifier local: a short parenthetical at the use site.
- **Report a claim record, never "review passed"**: what was fixed
  (location + evidence), what was refuted and why, what stays unresolved,
  which decisions belong to the owner (escalate those, don't decide them).
- **Convergence.** Stop when a confirmation pass returns no new confirmed
  defect — only held items and taste. The number of findings is not a
  measure of rigor.
