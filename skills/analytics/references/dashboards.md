# dashboards — Dashboards: a KPI view designed for the decisions its audience makes.

## Intake

- Audience and the decisions they make with it
- North-star and 3–6 supporting KPIs
- Data sources and refresh cadence
- Tooling (Looker Studio, Metabase, BI tool)
- Default stack: Looker Studio on the warehouse; else any BI tool on available sources.

## Deliverable

A live dashboard: a scorecard of the north-star + supporting KPIs, trend vs prior period, one segmented breakdown, and annotation of key events — with a documented metric dictionary.

## Procedure

1. Start from the audience's decisions; include only KPIs that inform one.
2. Pick one north-star and 3–6 supporting KPIs; resist adding more.
3. Show each KPI as value + trend vs prior period (context, not a bare number).
4. Add one segmentation view that answers the most common follow-up question.
5. Annotate launches/campaigns so spikes have a cause on the chart.
6. Set refresh cadence and data-source reliability; document the metric dictionary.
7. Keep it to one screen where possible; a dashboard nobody opens is dead weight.
8. Construct Developer Adoption & Net Developer Retention (NDR) Dashboards:
When visualizing developer platforms, open-source tools, or APIs, build the 4-panel Developer Health Dashboard:
- **Panel 1: DREAM Funnel Waterfall**:
  - Funnel visual tracking volume and conversion rate across Discover → Research → Evaluate → Adopt → Monetize.
  - Highlights drop-off velocity: pinpointing where developers bounce (e.g. docs vs. install vs. first run).
- **Panel 2: Time to First Value (TTFV) & Evaluation Friction**:
  - Median TTFV histogram (seconds from quickstart view to successful execution).
  - Top 5 CLI/SDK exit error codes during evaluation (surfacing environmental roadblocks).
- **Panel 3: Net Developer Retention (NDR) Cohort Heatmap**:
  - Cohort rows (month of first evaluation) tracking weekly/monthly retained consumption (API requests, CLI runs, active project workflows).
  - Benchmark: NDR > 100% indicates organic expansion (developer usage grows faster than churn).
- **Panel 4: Developer Onboarding Ratio (DOR) & Expansion Signals**:
  - DOR = (Adopted Developers at Day 14 / Evaluated Developers) × 100%.
  - Multi-contributor team adoption flags (multiple engineers using the tool in the same git organization).

## Quality gate

- [ ] Every KPI maps to an audience decision.
- [ ] North-star + 3–6 supporting KPIs, no more.
- [ ] Trend vs prior period shown for each KPI.
- [ ] Metric definitions documented.
- [ ] Annotations explain known spikes.
- [ ] Fits a single view where feasible.
- [ ] For developer platforms: DREAM Funnel waterfall and conversion drop-offs visualized.
- [ ] Net Developer Retention (NDR) cohort heatmap tracks consumption retention over time.
- [ ] Median TTFV and evaluation error categories surfaced.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
