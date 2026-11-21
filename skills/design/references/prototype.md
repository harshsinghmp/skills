# prototype — Riskiest-visual-unknown-first clickable mock: fast test, locked/iterate/kill verdict.

Disposable by design. Answers one visual question ("does this flow read?") before hi-fi investment. Mock never becomes production markup.

## Intake

- The single riskiest visual unknown, stated as one question (e.g. "can first-time buyers find checkout in this layout?")
- Approved structure (`wireframe`) and direction inputs (tokens, brand doc, or style tile) — prototype tests, never invents
- Real copy for the tested path; fake data flagged as fake
- Time-box in hours, agreed before building

## Deliverable

Clickable mock of the tested path only (real copy, fake data; motion only if the question is motion), plus a verdict: **locked** (log tokens/patterns to the design system) → **iterate** (named changes, new time-box) → **kill** (discard, learnings captured). Learnings captured before delete.

## Procedure

1. Name the one question. Riskiest visual unknown first — everything else stays out of scope.
2. Build the thinnest clickable mock that can answer it: real copy on the tested path, fake data clearly flagged, grayscale-or-tokens (no new visual invention). Motion only if the question is motion (choreography itself routes to `animate`).
3. Fast test with fresh eyes: 3-second gut check (what do you see? what is this for? where next?) + one task attempt on the tested path. Note what happened, not what was said.
4. Verdict:
   - **Locked** → log surviving tokens/patterns to the design system, hand the locked direction to engineering (`webdev` prototype/spec/implement rebuilds from it — the mock is never production markup).
   - **Iterate** → name the changes, set a new time-box, re-test.
   - **Kill** → capture learnings, delete the mock.
5. Disposable rules (every run): `prototype-` naming for all mock files, time-boxed in hours, learnings captured before delete, mock never merges to production.

## Quality gate

- [ ] Exactly one question stated; riskiest visual unknown tested first.
- [ ] Real copy on the tested path; fake data flagged, never presented as real.
- [ ] Tested with fresh eyes: 3-second gut check + one task attempt recorded.
- [ ] Verdict issued: locked (tokens/patterns logged) / iterate (named changes + new time-box) / kill (learnings captured, mock deleted).
- [ ] No `prototype-` artifacts in production paths; production built from the locked direction, not the mock.

## Routing

- Locked direction → `webdev` (prototype/spec/implement modes) rebuilds from the locked direction.
- Tokens must be extracted from a live reference first → `designscope`, then return here (never re-extract here).
- Structure questions → `wireframe`/`ux`; visual polish of approved UI → `ui`; motion choreography → `animate`.

## Sources

pocock prototype-UI branch (to-spec/prototype/incremental program: disposable mock before build); hallmark study-verb/direction-lock patterns (enrich, not duplicate); deepen (design-quality bar for the locked direction); designscope (token-extraction DNA — referenced, never duplicated here). When a cited source conflicts with a default above, the source wins — record the override and why.
