# monitoring — Monitoring: metrics, logs, traces, and alerts that are actionable.

## Intake

- SLOs/SLIs that matter to users
- Components to observe (app, DB, infra)
- Existing tooling and budget
- Who is on-call and how they are reached

## Deliverable

An observability setup: SLIs/SLOs, metrics, structured logs, traces where useful, dashboards, and alerts tied to symptoms (with runbook links) — tested by firing a synthetic alert.

## Procedure

1. Define SLIs/SLOs from the user's experience (latency, errors, availability).
2. Instrument metrics for the critical paths; add structured logs.
3. Add tracing for request flows where multi-service debugging is needed.
4. Build a dashboard showing SLO status at a glance.
5. Write alerts on symptoms (user-visible impact), not every internal blip.
6. Attach a runbook link to each alert and route it to the on-call owner.
7. Test alerting end to end (fire a synthetic alert) and tune noise.

## Quality gate

- [ ] SLIs/SLOs defined from user experience.
- [ ] Metrics/logs (traces where needed) instrumented.
- [ ] Alerts fire on symptoms, not noise.
- [ ] Each alert links a runbook and routes to an owner.
- [ ] Alerting tested end to end.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
