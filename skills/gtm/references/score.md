# score — Lead scoring, TAM/SAM sizing, and signal ladders.

## Intake

- Lead or account list with available fields — default: score on fit signals present, mark missing fields as unscored, proceed.
- ICP and the conversion event being optimized (reply, meeting, close).
- Any historical conversion data — default: none; use equal-weighted fit plus intent, state it.
- Default stack: spreadsheet log for the scored list where available, else a markdown table.

## Deliverable

A ranked lead list with scores, the scoring rubric, TAM/SAM sizing, and signal ladders showing what moves a lead up.

## Procedure

1. Size TAM/SAM top-down from the ICP before scoring — bounds the list.
2. Define fit signals (firmographic match) and intent signals (trigger events, engagement) with weights.
3. Score every lead; leads missing key fields get a capped score plus a data gap flag.
4. Build signal ladders: which observable signal promotes a lead a tier.
5. Cut the list: A-tier goes to outreach now, B-tier to nurture, C-tier parked with a revisit date.
6. Score through one pain lens: ask what pain the offer solves and read all signals through it; signals are evidence, not customer-facing knobs.
7. Surface the coverage gap (key accounts with no signal data) as an import shortlist, and rescore tiers as new signals land.
8. Close the loop with win/loss: for every lost or stalled deal, capture the reason in the buyer's words (price, timing, competitor, no-fit, ghosting) and feed it back to scoring weights, messaging, and pricing — a pipeline that never learns why deals die keeps scoring the same wrong profile.
9. Size TAM/SAM/SOM both directions and reconcile: top-down (addressable × ICP reach) AND bottoms-up (segment counts × average deal value × capture rate); a single un-sourced number is a claim, not a size. State the arithmetic and populations behind each direction and flag where they diverge before committing a number.
10. Feed the battlecard comparison table (Us/Them/Winner per capability) into fit-signal weights, and use the Moore positioning statement as the tiebreak when two leads score level — the one closer to the stated differentiator ranks up (sources: `phuryn/pm-skills` `competitive-battlecard`; ECC `brand-discovery` 20_positioning).

## Gooseworks 4-Tier Fit-Intent Matrix & Real-World Signal Harvesters

Segment accounts across both fit (firmographic compatibility) and intent (active market signals) before assigning SDR bandwidth (source: `gooseworks-ai/goose-skills`):

| Tier | Fit / Intent | Channel Action & SLA | Routing & Resource Allocation |
|:---|:---|:---|:---|
| **Tier 1** | High Fit + High Intent | Immediate multi-channel outbound (<4h SLA) | Bespoke video/executive memo, dedicated account rep |
| **Tier 2** | High Fit + Low Intent | Programmatic thought-leadership warm-up | Trigger-event monitoring, retargeting, peer case studies |
| **Tier 3** | Low Fit + High Intent | Self-service & automated qualification | Product-led onboarding / qualification bot (protect sales time) |
| **Tier 4** | Low Fit + Low Intent | Disqualified / suppression list | Zero outbound spend, purge from active pipeline |

### Real-World Intent Signal Harvesters:
1. **Hiring / Job Posting Deltas**: Specific job postings (e.g. "Head of Security", "Founding AI Engineer", "VP Sales") indicate unlocked budget and active mandate changes before public product launches.
2. **Tech Stack & Infrastructure Shifts**: DNS records, job requirements, or API client telemetry showing migrations away from legacy competitors.
3. **Capital & Corporate Events**: Growth funding rounds (Series A/B), PE acquisitions, or C-suite executive appointments triggering 90-day vendor evaluation windows.

## Quality gate

- [ ] TAM/SAM sized and dated before scoring.
- [ ] Market size triangulated top-down AND bottoms-up, arithmetic stated, divergence flagged.
- [ ] Rubric stated with fit plus intent weights.
- [ ] Accounts prioritized using 4-Tier Fit-Intent Matrix with appropriate SLA and routing.
- [ ] Every score traces to signals, none to gut.
- [ ] Tiers mapped to a next action with owners.
- [ ] Unscorable leads get NULL or a capped score with a data-gap flag — never inflated; nuance lives in the report, not the number (keeper: 99rebels/web-design-lead-qualifier).
- [ ] No lead disqualified on assumptions alone — enterprise, micro-budget, or location concerns noted, report still produced, human decides (keeper: 99rebels/web-design-lead-qualifier).

## Routing

- Positioning or launch strategy questions → `growth`.
- Wording and copy craft → `content`.
- Status tracking and milestones → `ops`; results measurement → `analytics`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
