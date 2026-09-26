# prototype — Riskiest-technical-unknown-first throwaway tracer: prove/disprove fast.

LOGIC branch only. Answers one technical question ("can this approach work?") before spec/implement investment. Code never ships — `implement` rebuilds from the verdict.

## Intake

- The single riskiest technical unknown, stated as one question (e.g. "can the edge runtime hold this websocket fan-out?")
- Time-box in hours, agreed before building; throwaway branch name agreed (`prototype-` prefix)
- What "proven" and "disproven" look like — decided before building, not after

## Deliverable

The thinnest tracer that answers the question, on a throwaway-marked branch, plus a verdict: **proven** (approach + notes feed `spec`) → **disproven** (learnings captured, branch deleted) → **needs-probe** (named follow-up question, new time-box). Notes captured as the primary source before delete.

## Procedure

1. Name the one question. Riskiest technical unknown first — everything else stays out of scope.
2. Build the thinnest tracer that can answer it: real integration on the questioned path, stubs everywhere else. No polish, no edge cases beyond the question.
3. Throwaway rules (every run): `prototype-` branch/files, time-boxed in hours, never merged to production paths.
4. Verdict against the pre-agreed criteria:
   - **Proven** → capture notes (approach, numbers, traps) as the primary source; `spec`/`implement` rebuild from the notes, never from the branch.
   - **Disproven** → capture learnings, delete the branch.
   - **Needs-probe** → name the follow-up question, set a new time-box, re-run.
5. Capture before delete: no verdict without written notes; notes live outside the throwaway branch.

## Quality gate

- [ ] Exactly one question stated; riskiest technical unknown tested first.
- [ ] Thinnest tracer built; stubs outside the questioned path; no polish.
- [ ] `prototype-` marking on all artifacts; nothing in production paths.
- [ ] Verdict issued against pre-agreed criteria: proven (notes feed spec) / disproven (learnings captured, deleted) / needs-probe (named question + new time-box).
- [ ] Notes captured outside the branch before delete; `implement` rebuilds, never merges.

## Routing

- Proven → `spec` (notes become grounded input), then `implement` rebuilds.
- Visual/clickable questions → `design` prototype (sibling lane); referenced, never duplicated here.
- Shipped work verifies through → `qa-launch` gate.

## Sources

pocock prototype LOGIC branch (throwaway-marked, capture-as-primary-source on throwaway branch; lane-d-abubakar.md:32); design prototype (sibling-lane visual counterpart — referenced, not duplicated). When a cited source conflicts with a default above, the source wins — record the override and why.
