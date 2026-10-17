# matrix — Browser and device coverage plan: test what the audience uses, nothing else.

## Intake

- Audience browser/OS split (analytics; owner estimate if none)
- Contractual support floor (what the client promised their users)
- Device targets (mobile-first if unknown)

## Deliverable

Coverage matrix: browser × OS × viewport tiers (P0 must-pass, P1 spot-check, P2 excluded with reason), plus the extremes-first pair (oldest/smallest, newest/largest).

## Procedure

1. Pull the audience split; rank browsers by real share, not global stats.
2. Set P0: top ~95% of audience sessions. P1: next tier, spot-check critical paths only. P2: explicitly excluded with a one-line reason each.
3. Name the extremes-first pair and test it before the middle.
4. Record the matrix in `.agents/artifacts/qa-matrix-<ts>.md`; hand to `functional` or `gate`.

## Quality gate

- [ ] P0 covers the audience majority with evidence, not assumption.
- [ ] Every exclusion has a written reason.
- [ ] Extremes-first pair named and tested first.

## Routing

- Failures found while testing → `functional` for evidence, fixes owned by `webdev`/`mobile`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
