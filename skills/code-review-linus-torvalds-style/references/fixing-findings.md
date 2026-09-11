# Fixing Findings — review report → verified fixes

Loaded by the `fix` mode: a review report (this skill's or any structured findings
list) exists and the findings need to become fixes.

## Protocol

1. **Parse the report into the findings ledger.** One row per finding: ID, severity,
   location, status (`open` / `fixing` / `fixed` / `skipped`). The ledger persists
   across fix rounds so repeat reviews deduplicate instead of re-fixing.
2. **Test-first where a regression test is possible.** For a bug finding, the failing
   test IS the finding made executable — write it, watch it fail, then fix. If the
   project has no test runner or the failure needs external systems, record the
   verification method instead (the same skip logic as dead-letter's repro pack).
3. **One commit per finding.** Atomic, revertable, individually verifiable. No
   bundled fix commits — they defeat the per-finding verification the ledger tracks.
4. **Skip ledger for blind-risk findings.** Findings too risky to fix without
   human/domain context (auth flows, payments, migrations, live-data transformations)
   are recorded as `skipped` with a reason and routed — never silently dropped, never
   fixed blind.
5. **Re-run the review after the fix round.** Fixed findings get verified by the same
   review that raised them; the loop converges when the re-review reports no open
   findings from the ledger. If fixes stop converging (new findings outnumber fixed
   two rounds running), stop and escalate rather than polish forever.

## Output

```
FIX ROUND — <scope>
Ledger: 7 findings — 4 fixed (1 commit each), 1 skipped (payment flow — needs owner),
       2 open (awaiting re-review)
Re-review: 2 previously-fixed findings verified; 1 new finding raised (added to ledger)
Convergence: fixing (round 2 of ≤3)
```
