# audit — retain audit mode

## When to Use

- **Churn audit**: answer the five questions — who is churning, when, why, what signals were missed, what changes — across the last cohort of losses.
- **Portfolio risk audit**: score every account in the book against the leading-indicator rubric before renewal season.
- **Save-play verification**: verify saves actually fixed the root cause, not just delayed the date.

## The five questions (churn audit)

1. **Who** — which segments, cohorts, profiles?
2. **When** — at what lifecycle point (onboarding cliff, renewal, feature gap)?
3. **Why** — weighted root causes, not anecdotes.
4. **What was missed** — signals visible 90 days before each churn event?
5. **What now** — prioritized actions with owners, timelines, expected impact.

## Leading-indicator checklist (look back 90 days per account)

- [ ] Usage decline >20% vs prior period (product analytics)
- [ ] Login/session frequency drop; abandoned key features
- [ ] Support ticket spike, or repeated tickets on one issue
- [ ] NPS/CSAT decline (the drop matters more than the absolute score)
- [ ] Champion left or changed roles; no executive sponsor identified
- [ ] Missed QBR / check-in; engagement slowing (reply latency, skipped trainings)
- [ ] Payment issues: invoice overdue 30+ days; seats/scope/price reduction requested
- [ ] Competitor mentioned in any thread

## Risk rubric (count the red flags)

- 0–1 → **Green**: monitor.
- 2–3 → **Yellow**: action plan this week.
- 4+ → **Red**: escalate, exec involvement, weekly review.

## Predictability bar

- **>70%** of churns had visible 90-day signals → data is good; fix monitoring/response.
- **40–70%** → instrumentation gaps; extend signal coverage.
- **<40%** → major visibility gap; invest in data infrastructure before process.

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Red-score account renewing <120 days | `REQUEST-CHANGES` | exec-involved save plan this week |
| Churn with zero prior signals | `REPORT-ONLY` | instrumentation gap — add the signal |
| Save closed without root-cause fix | `REPORT-ONLY` | re-open; delayed churn is not a save |
| Health-score weights never validated against outcomes | `REPORT-ONLY` | recalibrate against last quarter |

## Sources

- Eru — *How to Run a Churn Audit* (five questions, 90-day leading-indicator lookback, predictability thresholds)
- xpiCRM — Churn Risk Review (red-flag rubric, five signal families)
- Umbrex — Customer Retention Playbook (health-score architecture)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
