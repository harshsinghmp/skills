# Fixing Findings — review report → verified fixes

Loaded by the `fix` mode: a review report (this skill's or any structured findings
list) exists and the findings need to become fixes.

## Protocol

1. **Parse the report into the findings ledger.** One row per finding: ID, severity,
   location, status (`open` / `fixing` / `fixed` / `skipped` / `skipped-risky`), and
   confidence. The ledger persists across fix rounds so repeat reviews deduplicate
   instead of re-fixing.
2. **Test-first where a regression test is possible.** For a bug finding, the failing
   test IS the finding made executable — write it, watch it fail, then fix. If the
   project has no test runner or the failure needs external systems, record the
   verification method instead (the same skip logic as dead-letter's repro pack).
   **Goal-driven execution** (source: `tech-leads-club-coding-guidelines`, raw
   SKILL.md fetched 2026-09-19): restate each finding as a verifiable goal
   ("add validation" → "tests for invalid inputs pass"; "fix the bug" →
   "a reproducing test passes"; "refactor X" → "tests green before and
   after") and loop per finding until its goal verifies — weak goals
   ("make it work") need clarification before fixing starts.
3. **One commit per finding.** Atomic, revertable, individually verifiable. No
   bundled fix commits — they defeat the per-finding verification the ledger tracks.
   **Surgical changes** (source: `tech-leads-club-coding-guidelines`): touch
   only what the finding requires — no adjacent "improvements", no unrelated
   refactors; match existing style even when you'd write it differently.
   Every changed line traces to its finding; unrelated dead code spotted
   en route is mentioned, not deleted. Remove only the orphans your own
   fix created (imports/variables it made unused).
4. **Skip ledger carries a disposition, not a shrug.** Every finding resolves to
   `fixed`, `skipped-risky` (needs human/domain context: auth, payments, migrations,
   live-data transforms) or `skipped` — each with a stated reason. `skipped-risky`
   items are never silently dropped and never fixed blind.
5. **Block → unblock.** Every Reject / Request-Changes in the report must already
   name its unblock condition (the exact fix, test, or evidence that clears it). If a
   finding says "this is wrong" but not what makes it pass, stop and get the
   condition from the original review — a finding without an exit path is not done.
6. **Every comment is answered.** Each review comment is either fixed and verified,
   or answered with a reasoned why-not (referencing the code). No silent partial
   application.
7. **Human sign-off gate.** A blocker does not self-close: any finding closed as
   `skipped-risky`, and any Reject waived rather than fixed, requires a named human
   authority clearing it or an explicitly recorded waiver. You are the executor, not
   the decision-maker, on blocking findings.
8. **Re-run the review after the fix round.** Fixed findings get verified by the same
   review that raised them; the loop converges when the re-review reports no open
   findings from the ledger. If fixes stop converging (new findings outnumber fixed
   two rounds running), stop and escalate rather than polish forever.
   **3-failed-fixes rule** (source: `obra/superpowers` systematic-debugging): three
   failed fix attempts on the same finding → stop fixing, question the architecture
   (wrong layer, wrong representation, wrong assumption). No further same-level
   attempts until the architectural question is answered — the bug is no longer in
   the code, it is in the design the code assumes.

## Unapplied review findings checklist

When a review leaves findings unfixed (deferred or blocked), record them as a tickable
markdown inventory in the PR body or the review report:

```markdown
## Unapplied review findings
- [ ] CR-03 — retry loop drops error context (blocked on #142)
- [ ] TH-07 — move route guard to shared middleware (deferred to auth-refactor)
- [x] NT-02 — rename `tmp` → `scratch` (closed with commit 4f2c1a)
```

Rules: one line per open finding, tick each line as a committed fix closes it, and keep
it faithful to the ledger — never add to, reorder, or rebuild the inventory arbitrarily.
Its job is visible traceability of what remains open and why.

## Output

```
FIX ROUND — <scope>
Ledger: 7 findings — 4 fixed (1 commit each), 1 skipped (payment flow — needs owner),
       2 open (awaiting re-review)
Re-review: 2 previously-fixed findings verified; 1 new finding raised (added to ledger)
Convergence: fixing (round 2 of ≤3)
```
