# triage — Severity classification, escalation spine, first-15-minutes checklist.

Default stack: self-hosted status page + Docker logs + Cloudflare analytics (fallbacks: any uptime monitor, `docker logs --tail`, any traffic graph).

## Intake

- What is broken, who is affected, when it started (defaults: assume user-facing until proven otherwise; start time = first report minus 10 min, marked assumption)
- Blast radius estimate: % users, revenue paths, regions (default: worst plausible, narrow down with evidence)

## Deliverable

Triage sheet: SEV level, blast radius, incident commander, escalation spine, first-15-minutes checklist state, comms cadence.

## Procedure

1. Classify severity — SEV-1 (full outage / breach / data loss, all hands), SEV-2 (major degradation, core path broken), SEV-3 (partial, workaround exists), SEV-4 (cosmetic, track only). Default ambiguous → one level higher, state the assumption. Response-time spine (source: `BagelHole/incident-response` P1–P4): P1/SEV-1 respond 15 min → P2/SEV-2 30 min → P3/SEV-3 4h → P4/SEV-4 next business day.
2. Name the incident commander (default: you) and the escalation spine: commander → tech lead → client stakeholder. Page SEV-1/2 immediately; SEV-3 async.
3. Run the first-15-minutes checklist: confirm blast radius, freeze deploys, open the incident channel/log, snapshot logs and metrics, start the comms clock.
4. Set the comms cadence now: SEV-1 every 15 min, SEV-2 every 30 min, SEV-3 hourly, SEV-4 async. Hand the clock to `communicate`.
5. Route to `mitigate` with severity + class hypothesis; record every assumption with a timestamp.

## On-call handoff annex (enrich — source: `wshobson/agents` (`on-call-handoff`))

- **Packet.** Outgoing on-call ships: active SEVs + state, top-3 risks (flaky alert, pending deploy, expiring cert), escalation contacts that changed, link to the incident log. No packet = no handoff.
- **Readback.** Incoming acknowledges each line (ack/nack with timestamp); anything unacked stays with outgoing until acked.
- **Overlap.** 15-min overlap window on rotation day; pages during overlap go to outgoing, shadow to incoming.

## Non-destructive diagnostic gathering protocol (source: Red Hat SRE framework)

Before applying aggressive mitigations (restarting nodes, wiping state, rolling back DBs) that could destroy ephemeral evidence:
- **Capture ephemeral state**: Capture running container process trees (`ps aux`, `top`), network socket states (`ss -tulpn`), and connection counts.
- **Diagnostic bundles**: Generate system diagnostic bundles (`sosreport -k`, journalctl dumps, pod crash logs `kubectl logs --previous`) and save directly to incident scratch storage.
- **Preserve telemetry**: Snapshot live Prometheus/Grafana graphs and cloud metrics over the incident window (-30m to +now) before state mutation.

## Quality gate

- [ ] SEV stated with blast radius and start time (assumptions marked).
- [ ] Commander named, escalation spine paged per severity.
- [ ] Deploys frozen, evidence snapshotted before any fix.
- [ ] Comms cadence set and first update scheduled.

## Routing

- Stop the bleeding → `mitigate`; stakeholder voice → `communicate`; infra mechanics → `devops`.
- Downgrade only on evidence, never on hope; upgrade on new reports without debate.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
