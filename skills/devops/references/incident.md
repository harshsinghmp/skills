# incident — Incident: stabilize first, then a blameless postmortem with tracked actions.

## Intake

- Symptom, scope, and user impact
- What changed recently (deploys, config, traffic)
- Who is responding and the comms channel
- Existing dashboards/logs for the affected path

## Deliverable

Incident handling: immediate mitigation, a timeline, a blameless postmortem with root cause and contributing factors, and tracked action items with owners — plus status-comms to stakeholders.

## Procedure

1. Declare the incident; assign a lead and a comms channel.
2. Stabilize first: roll back the last change or mitigate the symptom — restore service before diagnosing deep causes.
3. Communicate status to stakeholders on a cadence.
4. Keep a running timeline of actions and timestamps.
5. After stabilization, find root cause and contributing factors (not a single 'human error').
6. Write a blameless postmortem: timeline, impact, root cause, what went well/poorly.
7. Create tracked action items with owners and due dates; verify they land.
8. Update monitoring/runbooks so the same incident is caught earlier next time.

## Quality gate

- [ ] Mitigation before deep diagnosis.
- [ ] Stakeholder comms on a cadence.
- [ ] Timeline captured with timestamps.
- [ ] Postmortem is blameless with root + contributing causes.
- [ ] Action items tracked with owners and dates.
- [ ] Monitoring/runbooks updated from the lesson.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
