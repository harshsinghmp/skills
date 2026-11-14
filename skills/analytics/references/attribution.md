# attribution — Attribution: channel contribution with honest limits, not last-click alone.

## Intake

- Conversion events to attribute and their tool
- Channels/touchpoints in play
- Tagging hygiene (UTMs, click IDs) and data available
- Decision the attribution informs (budget, channel, creative)
- Default stack: Triple Whale for ecommerce plus warehouse-first modeling; else model-first on available touchpoint data.

## Deliverable

An attribution analysis: channel/touchpoint contribution under the chosen model(s), a comparison against last-click to expose skew, stated limits, and a budget/optimization recommendation.

## Procedure

1. State the decision first (budget reallocation, channel focus); the model follows.
2. Audit tagging hygiene — UTMs and click IDs must be consistent first.
3. Choose models appropriate to the business (data-driven, position-based, linear) and run at least two.
4. Compare against last-click to reveal where top-of-funnel is under-credited.
5. Segment by new vs returning, and by device where it changes the story.
6. State the limits plainly: windows, privacy gaps, walled gardens, cross-device.
7. Recommend an action (shift budget, fix a leaking channel), not just a chart.
8. Set lookback at 1.5-2x the sales cycle with separate click and view windows; re-evaluate quarterly.
9. Validate causal impact with an incrementality holdout before locking budget shifts.
10. Triangulate with self-reported attribution ("How did you hear about us?" at conversion) — the out-of-model check for dark social and word-of-mouth tracking cannot see.
11. Fix one system as the conversion count of record (usually CRM/backend); never sum platform-reported numbers — de-dupe claimants against the record. Split branded vs non-branded search before judging top-of-funnel.
12. Harden the first-party build track (source: marketingskills `attribution` Pillar B SKILL.md; Pillar A models/MTA/MMM/incrementality already covered above): audit the identify() gap first; stitch third-party-domain journeys with a capture-phase link decorator that smuggles the anon distinct_id via metadata passthrough, then fires a $identify merge plus the conversion event on webhook; fail closed on anonymity (reject @-style IDs); hold a referrer-exclusion list (OAuth/checkout/self/localhost); keep one single-project cookie across subdomains; write source + confidence + basis back to the CRM with Paid-vs-Organic split and account roll-up.

## Quality gate

- [ ] Decision stated before model choice.
- [ ] Tagging hygiene audited.
- [ ] At least two models compared, incl. last-click.
- [ ] Limits stated honestly.
- [ ] Recommendation is actionable.
- [ ] Lookback at 1.5-2x cycle (click/view separate), re-evaluated quarterly.
- [ ] Causal claim backed by holdout, not model output alone.
 - [ ] Self-reported input collected at conversion; one count-of-record fixed, platforms de-duped against it; branded/non-branded split.
 - [ ] First-party track hardened (identify-gap audited, cross-domain stitch via decorator+$identify merge, anonymity fail-closed, exclusions + single cookie, CRM write-back with confidence).

## Routing

- Event-definition or UTM/tagging fixes → tracking mode; spend shifts → paidads audit mode.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
