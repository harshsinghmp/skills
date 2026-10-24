# audit — client-comms audit mode

## When to Use

- **Quarterly communication audit**: the 20–30 minute per-retainer pass that surfaces churn risk months before a cancellation email.
- **Onboarding contract audit**: verify the "How We Work Together" contract actually exists, is signed, and matches reality.
- **Thread quality audit**: score a live project thread against the six-point quality bar.

## Checklist

- [ ] Communication contract exists and is current: named day-to-day contact + backup, decision-makers/approvers, channel map, cadence, escalation path Tier 1/2/3
- [ ] Response SLAs are **bidirectional** and written into the SOW — agency response times AND client approval windows (an undocumented client SLA is how deliverables stall for weeks)
- [ ] Cadence integrity: every scheduled touchpoint this quarter actually happened — if not, why
- [ ] Channel discipline: nothing drifting into the wrong channel (decisions buried in Slack threads, approvals via chat instead of the written record)
- [ ] Response times measured: median agency response AND median client response — both, not one
- [ ] Unresolved threads counted: open threads with no closing message
- [ ] Reporting health: did the client actually open/receive the last reports
- [ ] Escalation signals: anything that reached Tier 2/3 — root cause, not just the event
- [ ] Approvals land in writing (email/portal), never chat-only
- [ ] Thread quality bar (sample the latest update): current stage stated · next action + timing · questions answered in context · professional tone · nothing critical split outside the thread · revision scope and deadlines defined

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Client SLA overdue with a dependent sprint | `REQUEST-CHANGES` | cite the SOW section in the next update; pause the dependent work |
| Decision made in chat, not in the record | `AUTO-REPAIR` | recap to the canonical channel the same day |
| Missed touchpoints without explanation | `REPORT-ONLY` | rebook; log the cause |
| Escalation reached Tier 2/3 | `REPORT-ONLY` | root-cause into `client-comms:feedback` |

## Sources

- AgencyPro — Client Communication Best Practices (bidirectional SLAs in SOW; quarterly 20-minute communication audit)
- Productized Services — Client Communication Playbook (10-minute thread quality audit, response-time baselines)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
