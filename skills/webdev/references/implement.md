# implement — Spec-to-shipped: vertical tracer slices, TDD at seams, review chain.

Consumes a `spec` packet. No spec → run `spec` first (or `prototype` if the unknown is technical, not textual). Code ships only through the review chain.

## Intake

- Spec packet with ready-for-agent label (Problem / Solution / Stories / Seams / Assumptions)
- Existing stack detected (package.json, router, 2–3 representative files) — repo patterns win
- Scope boundary from the spec's non-goals; anything outside is a new spec, not scope creep

## Deliverable

Working, gated code: one vertical tracer slice per story (test → impl, data → API → UI), Simplicity-First throughout, verification gate green, diff routed through `code-review`.

## Procedure

1. Order slices by the spec's stories; build one vertical tracer at a time — one test, one implementation, demoable each. No horizontal bulk (all tests then all code), no slice started before the previous one is green.
2. Simplicity-First (Rule 0): fewest files, shortest diff, installed deps only. Justify every abstraction with the deletion test — one implementation behind an interface is indirection, not abstraction.
3. TDD at pre-agreed seams only: write the failing test at the seam the spec named; no test at an unconfirmed seam (confirm the seam first, then test). Repro test before any bugfix.
4. Scope discipline: the spec's non-goals are rejections, not suggestions. New need mid-build → park it as a named follow-up, keep building.
5. State matrix for UI slices: every screen × loading/empty/error/success before polish.
6. Finish chain, in order: typecheck → full verification gate → `code-review` on the diff → address findings → done. Skipping a link fails the gate.

## Quality gate

- [ ] Built from a labeled spec; slices vertical and demoable each.
- [ ] TDD at seams; no implementation-coupled or tautological tests; no horizontal slicing.
- [ ] Simplicity-First held: no new deps without justification, deletion test passed.
- [ ] Non-goals respected; follow-ups parked by name, none smuggled in.
- [ ] Typecheck + verification gate green + `code-review` run with findings addressed.

## Routing

- Spec missing or unlabeled → `spec` first.
- Technical unknown blocks a slice → `prototype` (LOGIC) to answer it, then resume; prototype code never merges — rebuild the slice here.
- Shipped work verifies through → `qa-launch` gate.

## Sources

pocock implement (TDD at seams + typecheck + code-review chain; lane-d-abubakar.md near-miss); pocock TDD seam-gate + vertical tracers + 3 anti-patterns (lane-d-abubakar.md #3); addyosmani incremental-implementation (Rule 0 Simplicity First, scope discipline, increment checklist; lane-d-abubakar.md:36). When a cited source conflicts with a default above, the source wins — record the override and why.
