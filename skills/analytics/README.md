# 📊 analytics

The data and analytics department head: one skill, eight modes — tracking, dashboards, attribution, reporting, cro, events, attribution-graph, audit. Decide the question, instrument cleanly, then optimize on evidence.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill analytics
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Set up GA4 event tracking and a KPI dashboard for our ecommerce site.
```

```text
Audit our signup funnel, find the drop-off, and run a CRO test on the pricing page.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **tracking** | analytics/event tracking setup | Tracking: a decision-driven event plan, UTM parameter sanitizer, implemented and verified live. |
| **dashboards** | KPI dashboard | Dashboards: a KPI view designed for the decisions its audience makes. |
| **attribution** | marketing attribution | Attribution: channel contribution with honest limits, not last-click alone. |
| **reporting** | performance reporting | Reporting: recurring performance reports that end in decisions. |
| **cro** | conversion rate optimization | CRO: find the funnel leak, then fix it with a disciplined experiment. |
| **events** | server-side event ingestion | Events: server-side event collection, privacy PII scrubbing, schema validation, and multi-touch attribution. |
| **attribution-graph** | multi-touch shapley attribution / identity stitching | Attribution Graph: Cooperative game theory Shapley value attribution, cross-device identity stitching, channel haircut deduplication, and budget reallocation advisor. |
| **audit** | analytics & data audit | Audit: data integrity verification, event tracking drift checks, and dashboard accuracy. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
