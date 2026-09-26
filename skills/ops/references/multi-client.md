# multi-client — Multi-client: one view across engagements, capacity, and risk.

## Intake

- Active engagements and their status
- Team capacity and allocation
- Upcoming deadlines and renewals
- Risks per engagement (scope, margin, relationship)
- Default stack: NocoBase/Odoo client registry where available, else any tracker or spreadsheet.
- Solo operator: same registry, one operator — cap concurrent active clients by your own weekly hours, not team capacity.

## Deliverable

A portfolio view: per-client status (health, next milestone, margin signal), a capacity/allocation map, and a risk register with actions — kept in isolated per-client workspaces.

## Procedure

1. Maintain an isolated workspace per client; never mix contexts.
2. Roll up status into one portfolio view: health, next milestone, risk.
3. Map team allocation vs capacity; spot overload before it bites.
4. Track upcoming deadlines, renewals, and upsell windows.
5. Keep a risk register per engagement with owners and mitigations.
6. Review the portfolio on a fixed cadence; rebalance proactively.
7. Use `handoff`/`context-anchor` to switch context cleanly between clients.
8. Size capacity before selling more work: utilization = committed booked hours (delivery + retainer + admin) ÷ available hours per period; flag any client slot over ~85% as overbooked with a named rebalance before it becomes a late delivery. Use Little's law (cycle time = WIP ÷ throughput) to turn a blocked milestone into a date, not a guess.
9. Recompute sequencing when a new engagement lands: re-run utilization, reschedule the lowest-priority-at-risk milestone first, and tell the affected client before the old date passes.

## Quality gate

- [ ] Per-client workspaces isolated; no context bleed.
- [ ] Utilization ratio computed per period; >85% slots flagged and rebalanced before slippage.
- [ ] Little's-law estimate gives any unsettled milestone a WIP/throughput-backed date.
- [ ] Portfolio view covers health, next milestone, risk.
- [ ] Capacity vs allocation mapped.
- [ ] Deadlines/renewals tracked.
- [ ] Risk register maintained with owners.
- [ ] Context switched cleanly between clients.
- [ ] Parallel work split by topology: one owner per engagement with isolated context; shared specialists pulled in per-task, never all-engagements-in-one-thread.
- [ ] Every client switch leaves a five-line log: intent, files touched, decisions, risks, next steps.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
