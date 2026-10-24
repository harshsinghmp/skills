# audit — refactor audit mode

## When to Use

- **Pre-refactor audit**: establish the evidence-backed case for refactoring before any code moves — what is actually wrong, measured, not felt.
- **Refactor-scope audit**: a refactor is proposed — verify its blast radius, test coverage, and rollback path before it starts.
- **Post-refactor verification**: behavior-preservation proof (tests green, diffs surgical, no scope creep).

## Checklist

- [ ] Pain is measured, not asserted: complexity hotspots (function length, nesting depth, fan-out), duplication blocks, change-magnet files (highest churn × highest defect rate)
- [ ] Every proposed extraction/simplification names the behavior that must not change
- [ ] Test coverage exists on each seam BEFORE it moves — untested code is not refactored, it is first characterized
- [ ] Blast radius enumerated: every caller of every moved/renamed symbol (grep, not memory)
- [ ] Public/API surface changes are enumerated and justified — contract breaks are rejected, not refactored
- [ ] The diff is surgical: no drive-by reformatting, no orthogonal churn (Karpathy doctrine)
- [ ] Special cases eliminated by representation, not handled more carefully (Torvalds axiom)
- [ ] Rollback path: each refactor step is independently revertable (commit granularity)
- [ ] Performance claims are benchmark-backed or absent (no "should be faster")
- [ ] Speculative generality flagged for deletion, not migration

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Refactor proposed on untested seam | `BLOCK` | characterize tests first (`test-driven-development`) |
| Contract/ABI break inside a "refactor" | `REJECT` | it is a feature change, not a refactor |
| Drive-by churn in the diff | `REJECT` | strip the hunk; separate PR |
| Measured hotspot with a clean extraction path | `PROCEED` | queue in the refactor backlog, smallest step first |

## Sources

- `code-review` skill (this suite) — Torvalds severity calibration and surgical-diff doctrine
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
