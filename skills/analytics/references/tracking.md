# tracking — Tracking: a decision-driven event plan, implemented and verified live.

## Intake

- Questions the data must answer and their decisions
- Platform (GA4, GTM, product analytics) and access
- Key user actions across the funnel
- Consent/privacy requirements (GDPR/CCPA)
- Default stack: GA4 plus PostHog/Openpanel for product events, warehouse BigQuery/ClickHouse; else any event collector plus a SQL warehouse.

## Deliverable

A tracking plan: a table of events with parameters, trigger conditions, owning funnel step, and the decision each supports — plus implementation (GTM/GA4/product events) and live verification (DebugView/preview evidence).

## Procedure

1. List the questions and the decision each drives; derive the events from those, not from what's easy.
2. Write the event table: name, trigger, parameters, funnel step, decision supported.
3. Define the key conversions and mark them; avoid duplicate/mirror events.
4. Implement via GTM or the app's analytics SDK, following the existing naming convention.
5. Set consent gating and filter internal traffic before launch.
6. Verify in GA4 DebugView / GTM preview on the live site — real events, real parameters.
7. Document the plan and hand it to whoever reads the data.

## Quality gate

- [ ] Every event maps to a decision.
- [ ] Event table documents name/trigger/params/funnel step.
- [ ] No duplicate or double-firing conversions.
- [ ] Consent and internal-traffic filtering in place.
- [ ] Verified live in DebugView/preview, with evidence.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
