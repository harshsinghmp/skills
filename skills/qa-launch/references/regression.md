# regression — Post-fix re-verification: fixed issues plus adjacent blast radius.

## Intake

- Fix list with commit per finding (from `webdev`/`mobile` fix round)
- Original `functional`/`gate` report
- Adjacent surfaces sharing the touched code

## Deliverable

Regression report: each fix Verified or Reopened, adjacent surfaces checked, convergence stated (converged or escalate).

## Procedure

1. Re-run each fixed finding on the same matrix step that failed it — same step, same evidence format.
2. Check the blast radius: surfaces sharing the touched code get a smoke pass even if they passed before.
3. Reopened items return to the owner with new evidence; if new findings outnumber fixed two rounds running, stop and escalate instead of looping.
4. Close the round: all Verified → hand to `gate` for the Ship verdict.

## Quality gate

- [ ] Every fix re-tested on its original failing step.
- [ ] Adjacent surfaces smoke-passed.
- [ ] Convergence or escalation stated, never a silent third loop.

## Routing

- Reopened code issues → `webdev`/`mobile`; new visual drift → `refactor-ui`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
