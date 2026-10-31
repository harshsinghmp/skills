# value-note — Monthly value note: prove it keeps paying.

## Scope

- The monthly note tying shipped work to client outcomes.
- Outcomes, not activity: revenue, time saved, risk removed — never hours logged.
- Every claim traces to shipped work, a metric, or a transcript.

## Deliverable

A monthly value note: what shipped since last note, the outcome each item drove (with source), and one forward-looking line on what's next.

## Procedure

1. Collect what shipped since the last note (deliverables, fixes, improvements).
2. Convert each item to an outcome: what changed for the client's business, with the source (metric, transcript quote, ticket).
3. Drop anything with no outcome — activity without impact stays out.
4. Draft the note: shipped → outcome → source per item, then one line on what's next.
5. Send on the monthly heartbeat and log it; staleness check every claim before send.

## Quality gate

- [ ] Every claim sourced (metric, transcript, or shipped artifact).
- [ ] Outcomes stated, not activity listed.
- [ ] Items with no outcome dropped, not padded.
- [ ] Logged with date; next note scheduled.

## Routing

- Metrics and dashboards behind the claims → `analytics`.
- Active-work detail → `client-comms` status mode.
- Value questioned after the note → churn-watch mode.

## Sources

- lane-k-agency-stages.md §4.9 (retain cadence: monthly value note between check-in and QBR) and §4.10 (no source, no claim — evidence-ledger doctrine).
- lane-m2-client-track.md (analytics/tracking pipes behind outcome claims).

When a cited source conflicts with a default above, the source wins — record the override and why.
