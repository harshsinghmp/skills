# audit — qa-launch audit mode

## When to Use

- **Pre-launch gate audit**: Verify all quality gates pass before release
- **Regression audit**: Confirm no feature broke after last change

## Checklist

- [ ] All functional tests pass (`bun test` equivalent)
- [ ] Regression suite green (last 10 releases)
- [ ] UAT sign-off documented (who, when, what was tested)
- [ ] Rollback plan documented and tested
- [ ], [ ] Feature flags documented (if used)
- [ ] Error boundaries tested (network fail, empty state, 4xx)
- [ ] Accessibility scan passes (axe-core zero critical)
- [ ] Performance budget met (LCP, bundle size)
- [ ] Product-hunt launch checklist complete (if applicable)
- [ ] Customer-facing docs updated (FAQ, changelog)
- [ ] Support inbox monitored and triaged

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Functional test failing | `PROPOSE-DIFF` | `qa-launch` (block launch) |
| UAT sign-off missing | `REPORT-ONLY` | `secretary` (escalation) |
| Rollback plan untested | `AUTO-REPAIR` | `devops` (test rollback) |
| Perf budget exceeded | `AUTO-REPAIR` | `webdev` (optimize) |
| Docs not updated | `AUTO-REPAIR` | `updatedocs` |

## Output

`.agents/artifacts/audit-qa-launch-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
