# meta — Meta Ads: feed/stories/reels structure, Advantage+ and manual learning discipline.

## Intake

- Objective (traffic, leads, sales, awareness, messages)
- Pixel + events verified, CAPI if scale justifies
- Creative assets or brief (video first)
- Audience seeds (customer lists, lookalikes, interests)

## Deliverable

Campaign structure doc: campaigns by objective, ad sets with audience + budget, 3–5 creatives per set with primary texts, headlines, descriptions, placements strategy, and the measurement plan (pixel events, CAPI, post-ID rules).

## Procedure

1. Choose campaign objective to match the business event (sales objective for sales — not traffic).
2. Structure: CBO for scale on proven winners, ABO for testing new audiences.
3. Define audiences: broad (let the algorithm work) + interest stacks + 1–3% lookalikes from buyers. Andromeda-era: creative-is-targeting — broad audience plus variant angles does the targeting work (source: `coreyhaines31/marketingskills` paid ads, G3 #13).
4. Brief 3–5 creatives per ad set: video-first (hook < 3s), 1:1 and 9:16 variants. Ground every creative in offer/proof/verbatim inputs — no invented claims (source: `coreyhaines31/marketingskills` paid ads, G3 #15).
5. Write primary text to the placement (feed short, story native); headline carries the offer.
6. Set placements: Advantage+ once stable; manual (feed+stories+reels) for control.
7. Learning discipline: do not touch budget/creative for ~50 conversions or 7 days.
8. Verify pixel events + Conversions API before launch; set a post-ID rule for social proof.
9. Hold out 10–20% of budget as control; graduate proven winners to an evergreen campaign and backfill new tests behind them.
10. Size tests by absolute MDE (percentage-point shift), not relative lift alone; fix sample size up front and do not peek early.
11. **Meta Cold-Start Contract (Learning Phase Ramp)**:
    - **Minimum Budget Pacing**: Set starting ad set daily budgets to at least $5 \times$ target CPA to ensure the algorithm can exit the learning phase (50 conversions/week).
    - **Funnel Step-Down Fallback**: If the terminal conversion event (e.g., `Purchase`) generates $< 15$ events/week during initial launch, step down the optimization event to `Add to Cart` or `Initiate Checkout` to build pixel attribution density before graduating to terminal purchase bidding.
    - **Creative Fatigue Defense**: Launch with maximum 3–5 active creative variations per ad set. Never launch 10+ variants simultaneously in a cold ad set, which fragments impressions and prevents any single creative from exiting the learning phase.

## Quality gate

- [ ] Objective matches the business event being optimized.
- [ ] 3–5 creatives per ad set; at least one video.
- [ ] Pixel + events verified; CAPI when spend justifies it.
- [ ] No mid-learning edits planned.
- [ ] Lookalike/audience sources ≥ 100 records or use broad.
- [ ] Holdout control reserved (10–20%); winner-graduation path to evergreen defined.
- [ ] Guardrails checked — a CTR win that tanks CVR is not a winner; absolute MDE and no-peeking rule honored.
- [ ] Meta Cold-Start Contract honored: ad set budget $\ge 5 \times$ target CPA; funnel step-down ready if terminal volume $< 15$/week.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
