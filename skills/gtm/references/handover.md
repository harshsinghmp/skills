# handover — Sales handover with a context packet, routed to ops.

## Intake

- Qualified lead or meeting-ready account with research, score, and outreach history — default: compile from whatever exists, mark gaps, proceed.
- Sales owner and first-call date — default: unassigned; packet addressed to the sales queue.
- CRM destination — default: Twenty CRM records where available, else a markdown packet.
- Default stack: Twenty CRM records for the packet where available, else markdown; status tracked in ops milestones.

## Deliverable

A sales context packet: account summary, contact history, research highlights, score rationale, suggested talk track, and next step.

## Procedure

1. Compile the packet: account summary, every touch with dates, research highlights, score and why.
2. Stage the lead on the lifecycle (source: `coreyhaines31/marketingskills` `revops`, G3 #2): Subscriber → Lead → MQL → SQL → Opportunity → Customer → Evangelist, with entry/exit criteria + owner per stage. MQL = fit × engagement (neither alone suffices). MQL→SQL SLA: alert → 4h contact → 48h qualify/reject; rejects recycled with a reason code.
2. Write the suggested talk track: trigger, hypothesis, two discovery questions, the ask.
3. Name gaps explicitly — what sales should verify on the call.
4. Route the packet to sales (Twenty CRM records, else markdown) and log the handoff in `ops` milestones.
5. Set the feedback loop: call outcome returns to gtm to rescore and refine the ICP.

## Quality gate

- [ ] Sales can run the first call with zero extra research.
- [ ] Full touch history with dates included.
- [ ] Gaps named, not hidden.
- [ ] Handoff logged in ops; feedback loop set.
- [ ] Talk track names the angle, 2–3 concrete pain points, the key positive fact, and things to avoid on the call (keeper: 99rebels/web-design-lead-qualifier).

## Routing

- Positioning or launch strategy questions → `growth`.
- Wording and copy craft → `content`.
- Status tracking and milestones → `ops`; results measurement → `analytics`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
