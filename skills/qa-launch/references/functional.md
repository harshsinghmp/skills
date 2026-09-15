# functional — Critical-path verification with pass/fail evidence.

## Intake

- Critical paths (signup, checkout, contact — max 5, ranked by revenue impact)
- Coverage matrix from `matrix` (or define inline for small sites)
- Staging URL + test credentials

## Deliverable

Pass/fail table per path: Path / Step / Expected / Observed / Evidence / Verdict, plus a findings list routed to owners.

## Procedure

1. Walk each critical path end to end on the P0 matrix; record observed vs expected per step.
2. Every fail gets evidence (screenshot/step/URL) and an owner (`webdev`, `mobile`, `design`, `content`).
3. Proof-gate each finding: Contract (which requirement it breaks) + Runtime (reproducible on the matrix) + Correction (one deterministic fix). Candidates without all three are notes.
4. Report at most the top failures first; unrun paths marked Not verified, never implied pass.

## Quality gate

- [ ] All P0 paths walked, none assumed.
- [ ] Every fail has evidence + owner.
- [ ] Unrun paths explicitly marked Not verified.

## Routing

- Visual/aesthetic fails → `refactor-ui`; copy fails → `content`; code fixes → `webdev`/`mobile`; re-verify via `regression`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
