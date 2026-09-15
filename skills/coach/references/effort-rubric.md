# Effort Scorecard Scoring Rubric

## The 5 Pillars (2 Points Each $\implies$ Max 10 Points)

1. **TDD Rigor (0–2 pts)**:
   - 2 pts: Every feature and bugfix started with a failing test; watched fail before green.
   - 1 pt: Tests written after implementation or some edge cases untested.
   - 0 pts: Shipped unverified code without automated tests.

2. **Diff Discipline (0–2 pts)**:
   - 2 pts: Diffs strictly atomic; no scope creep or gratuitous refactoring.
   - 1 pt: Minor cosmetic formatting mixed into feature commits.
   - 0 pts: Massive kitchen-sink PRs touching unrelated modules.

3. **Hygiene & Security (0–2 pts)**:
   - 2 pts: Clean SecretScan, zero hardcoded credentials, valid frontmatter/lint.
   - 1 pt: Linter or formatting errors caught and fixed late.
   - 0 pts: Committed sensitive env values or ignored linters.

4. **Deep Work Focus (0–2 pts)**:
   - 2 pts: ≥ 4 hours uninterrupted focus dedicated to Top 1 goal.
   - 1 pt: Frequent context switching between multiple side projects.
   - 0 pts: Thrashing all day without finishing a single atomic deliverable.

5. **Blocker Triage (0–2 pts)**:
   - 2 pts: Stalls converted immediately into structured dead-letter escalations.
   - 1 pt: Stalled for > 1 hour before asking for help or logging blocker.
   - 0 pts: Silently abandoned a failed task without explanation.
