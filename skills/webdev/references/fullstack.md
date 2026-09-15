# fullstack — Fullstack: full features data-to-UI with the verification gate.

## Intake

- Feature spec and acceptance criteria
- Data model impact
- UI expectations (spec or wireframe)
- Rollout constraints (feature flag? gradual?)

## Deliverable

A working end-to-end feature: schema, API, UI, states, and tests; verification gate green; PR-ready diff.

## Procedure

1. Split the feature into data → API → UI slices; build in that order.
2. Data first (backend mode procedure), then API, then UI (frontend mode procedure).
3. Add the state matrix: every screen × loading/empty/error/success.
4. Write the acceptance criteria as tests before polish.
5. Run the full verification gate.
6. Route the diff through `code-review` before the PR.

## Quality gate

- [ ] Slices built and verified in order.
- [ ] State matrix complete.
- [ ] Acceptance criteria exist as tests.
- [ ] Verification gate green.
- [ ] `code-review` run on the diff.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
