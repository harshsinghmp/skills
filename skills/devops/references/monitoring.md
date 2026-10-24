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

## Grafana mechanics (enrich — source: `wshobson/agents` (`grafana-dashboards`))

- **PromQL copy-paste.** Error rate: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`; p95 latency: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`; saturation: `sum(rate(container_cpu_usage_seconds_total[5m])) by (pod) / sum(kube_pod_container_resource_limits{resource="cpu"}) by (pod)`.
- **Panel JSON.** Export one panel JSON per alert-backed chart; keep `datasource` templated (`${DS_PROM}`), never hardcoded UID, so dashboards port across envs.
- **Provisioning YAML.** Commit `provisioning/dashboards/*.yaml` (provider → dashboards path) + `provisioning/datasources/*.yaml`; Grafana boots with dashboards, no click-ops.
- **Dashboards-as-code.** Dashboard JSON lives in git beside the service; change = PR → provisioned on deploy. One dashboard per SLO (status at a glance), drill-downs link from the alert, not the reverse.

## Quality gate

- [ ] SLIs/SLOs defined from user experience.
- [ ] Metrics/logs (traces where needed) instrumented.
- [ ] Alerts fire on symptoms, not noise.
- [ ] Each alert links a runbook and routes to an owner.
- [ ] Alerting tested end to end.

## Routing

- Instrument from 2–4 on-call questions per feature; metrics = that (RED per endpoint, USE per resource; histograms p50/p95/p99 never averages; labels from fixed sets only — never user IDs/URLs), traces = where, logs = why (structured events + correlation + entry-point IDs, never secrets).
- Two severities only — page (user hurt, act now) vs ticket (act this week); every alert links a ≥3-line runbook (means / first query / escalate), updated after each incident that used it; live-incident handling routes to `devops` incident.
- Burn-rate alerts: fast/slow burn pair (14.4x/6x) as PromQL recording rules with an error-budget policy ladder. Source: `wshobson/agents` (`slo-implementation`; near-miss fold).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
