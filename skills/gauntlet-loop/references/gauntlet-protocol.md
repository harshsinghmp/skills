# Gauntlet Loop Protocol Reference

## Scoring Rubric (0.0 – 10.0 Scale)

The Fresh Critic calculates round scores using this weighted formula:

$$S_{\text{total}} = 0.40 \cdot S_{\text{correctness}} + 0.25 \cdot S_{\text{minimal\_diff}} + 0.20 \cdot S_{\text{edge\_cases}} + 0.15 \cdot S_{\text{cleanliness}}$$

1. **Correctness & Invariants (40%)**:
   - 10: Zero logic errors, API breaks, or race conditions.
   - 5: Functional but contains subtle boundary edge case.
   - 0: Automated tests fail or core invariant broken.

2. **Minimal Diff Discipline (25%)**:
   - 10: Exactly the lines needed to fix the defect; zero collateral refactoring.
   - 5: Includes minor unrelated formatting or renaming.
   - 0: Massive rewrite or unrelated architectural shift.

3. **Edge-Case Coverage (20%)**:
   - 10: Negative paths, null bounds, timeouts, and overflow conditions explicitly handled.
   - 5: Happy path and one error branch covered.
   - 0: Only happy path handled.

4. **Architectural Cleanliness (15%)**:
   - 10: Follows existing repo idioms and patterns.
   - 5: Introduces slightly redundant helper.
   - 0: Violates project structure or adds unnecessary framework dependency.
