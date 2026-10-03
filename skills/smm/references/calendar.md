# calendar — Calendar: cadence, themes, formats, and asset slots.

## Intake

- Chosen platforms and cadence (from strategy)
- Source assets available (blogs, videos, launches, events)
- Key dates (launches, holidays, campaigns)
- Who produces each asset
- Default stack: Postiz as default scheduler across all 9 platforms. Fallback: use the client's scheduler if one is already in place.

## Deliverable

A dated editorial calendar: per-day platform, pillar, format, hook direction, CTA, asset owner, and status — plus a repurposing map from source content.

## Procedure

1. Anchor the calendar to real events and source assets, not blank-slate ideas.
2. Assign each slot a pillar, format, and objective from the strategy.
3. Tag each slot with pillar and funnel stage; hold the planned mix ratios across the week.
4. Vary formats within a week (not five identical posts).
5. Build a repurposing map: one source asset → many platform-native cuts.
6. Mark production vs publish dates so assets land ahead of schedule.
7. Leave slack (one filler slot per week) for reactive/timely content.
8. Schedule in history-ranked windows: place each format in its proven time slots first.
9. Review weekly; adjust next week from what performed.

## Quality gate

- [ ] Every slot has pillar, format, objective, and owner.
- [ ] Pillar funnel-stage tags and mix ratios hold across the week.
- [ ] Formats vary across the week.
- [ ] Repurposing map ties back to source assets.
- [ ] Production dates precede publish dates.
- [ ] Slots sit in history-ranked windows; weekly slack slot reserved.
- [ ] Reactive slack exists.
- [ ] Engagement pulled 24–48h after publish; next week adjusted from it (keeper: wshobson/social-publishing).

## Scheduler automation (Postiz, self-hosted default)

Dispatch finalized slots into the scheduler rather than publishing by hand.

- [ ] Mechanism first: dispatch via the self-checked-in **day-held** scheduler API (slots only once assets are marked final and released).
- [ ] One-time channel connections — connect each platform channel once, then drop auth; no per-post login.
- [ ] **Scheduled-posts-as-drafts gate**: nothing defaults to live. New scheduled posts land as drafts; manual review flips them to scheduling time.
- [ ] Calendar-to-scheduler mirror: scheduler state mirrors the calendar; rejected/returned posts bounce back to the calendar with a reason, not to the void.
- [ ] Quality-gate checkbox present on each scheduled draft before it is released to the queue.
- [ ] Default stack: Postiz as the self-hosted scheduler across all 9 platforms. Fallback: the client's existing scheduler if one is already in place.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
