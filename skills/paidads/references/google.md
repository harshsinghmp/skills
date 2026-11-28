# google — Google Ads: Search, Performance Max, Shopping, Display — intent capture structure.

## Intake

- Objective and target CPA/ROAS
- Keyword universe or product feed
- Landing pages (one per ad group theme, not one for all)
- Negative keyword seeds (brand-irrelevant, competitor terms decision)

## Deliverable

Campaign structure doc: campaigns (by objective/budget), ad groups (one theme each), keywords with match types, negatives list, RSA assets (headlines/descriptions per character limits), extensions, and conversion actions mapping.

## Procedure

1. Pick campaign type from objective: Search (intent), Shopping (products), PMax (multi-surface scale), Display (cheap reach).
2. Segment campaigns by budget ownership or geography — never one giant campaign.
3. Build ad groups as tight themes (5–20 keywords each); one landing page per theme.
4. Set match types: phrase as default, exact for proven converters; broad only with negative hygiene.
5. Write RSA assets: 15 headlines / 4 descriptions max per limits; 3+ headlines carry the offer.
6. Seed negatives: irrelevant intents, competitor terms (unless targeted deliberately), previous brand burn.
7. Set bidding by conversion volume: < 15 conv/mo → manual CPC for control; 15–30 → Max Conversions (uncapped, gather signal); 30–50 → Max Conversions with soft cap; ≥ 50 → tCPA/tROAS (caps only once volume sustains them).
8. Learning-phase stability: after any bid/budget/audience change, freeze edits for 7 days or 30 conversions; relaunching learning resets the clock — batch changes, never drip them.
9. Launch BLOCKER gates (dependency-ordered, checkpoint each): tracking verified firing → billing/budget caps set → negatives seeded → RSA assets within limits → extensions attached. No step starts until the prior checkpoint passes.
10. Define conversion actions and mirror them exactly in site tracking (analytics contract).
11. Attach extensions: sitelinks, callouts, structured snippets, lead form if qualified.
12. **Search Overlap Controls (G96 & G97 Hygiene)**:
    - **Control G96 (Cross-Campaign Query Cannibalization & Exact Isolation)**: When running Exact match alongside Broad/Phrase or Performance Max, add exact match target keywords as negative exact matches to Broad/PMax campaigns. Prevents internal bidding competition, high-intent query cannibalization, and CPC inflation.
    - **Control G97 (Negative Conflict & Shared Budget Isolation)**: Audit shared negative lists before activating campaigns to ensure converting search queries are not unintentionally blocked. Isolate high-converting brand/core search campaigns onto dedicated budgets—never pool brand with unproven generic discovery campaigns under a shared budget cap.

## Quality gate

- [ ] Every ad group has one theme and one landing page.
- [ ] Negatives seeded before launch — not after the burn.
- [ ] RSA assets within limits, offer in 3+ headlines.
- [ ] Bidding stage matches conversion volume (no tCPA at 10 conv/mo).
- [ ] Conversion actions verified firing before spend.
- [ ] Search Overlap Controls (G96 exact-match isolation & G97 negative conflict checks) passed.
- [ ] Brand and generic discovery budgets strictly segregated (no shared budget cannibalization).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
