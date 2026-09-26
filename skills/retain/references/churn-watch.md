# churn-watch — Churn-signal triage: catch it early, route to growth.

## Scope

- Signal triage only: usage drop or client silence >14d breaks the cadence and routes out.
- This mode detects and routes; `growth` retention mode runs the save/win-back plays.
- Never sit on a signal until next quarter — speed is the whole mode.

## Deliverable

A churn-signal triage: signal named (usage drop with numbers, or silence with days-since-contact), severity set, and a handoff to `growth` churn mode with context — or a false-alarm logged back to heartbeat.

## Procedure

1. Name the signal: usage-drop (what metric, from what to what, since when) or silence (days since last client contact, last topic).
2. Check the silence threshold: >14d silent → real signal; under → watch, don't escalate.
3. Rule out false alarms: known holiday, agreed pause, contact on leave — confirmed false alarm logs back to heartbeat.
4. Hand off real signals to `growth` retention mode with full context (signal, timeline, last value-note, open issues) — this mode does not run save plays.
5. Pause the retention cadence for flagged clients: no review-ask, no referral offer until `growth` clears them.

## Quality gate

- [ ] Signal named with numbers (metric delta or silence days).
- [ ] >14d threshold applied to silence before escalation.
- [ ] False alarms logged, not escalated.
- [ ] Real signals handed to `growth` with context; cadence paused meanwhile.

## Routing

- Save/win-back plays → `growth` retention (churn) mode — owns voluntary vs involuntary plays.
- Billing/payment root cause → `ops` (invoice) + `growth` dunning side.
- Cleared client → back to check-in heartbeat.

## Sources

- lane-k-agency-stages.md §4.9 (churn signals — usage drop, silence >14d — route to `growth` churn mode).
- lane-k-agency-stages.md §2 row 8 (growth owns churn-prevention; retain CREATE exists because growth is strategy-level, not the loop).

When a cited source conflicts with a default above, the source wins — record the override and why.
