---
name: analytics
aliases: ["data-analytics", "measurement", "tracking", "dashboards", "attribution", "cro", "reporting"]
description: "Full data and analytics department: measurement tracking, dashboards, marketing attribution, performance reporting, and conversion-rate optimization — routed through five modes. Use when asked to set up analytics or event tracking, build a KPI dashboard, work out which channel drives conversions, report on marketing performance, or run a CRO audit and experiment. Not for ad platform management (paidads) or content performance alone (smm analytics)."
argument-hint: "[tracking|dashboards|attribution|reporting|cro]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 30
  aliases: ["data-analytics", "measurement", "tracking", "dashboards", "attribution", "cro", "reporting"]
  suggested_skills: ["seo", "paidads", "webdev", "growth"]
  hermes:
    tags: ["analytics", "tracking", "ga4", "events", "dashboards", "kpis", "attribution", "reporting", "cro", "experimentation", "ab-testing", "funnels", "conversion"]
    related_skills: ["seo", "paidads", "webdev", "growth"]
    suggested_skills: ["seo", "paidads", "webdev", "growth"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["seo", "paidads", "webdev", "growth"]
    primary_triggers: ["set up analytics", "event tracking", "build a dashboard", "attribution", "marketing report", "increase conversions", "cro audit", "kpi dashboard"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📊 analytics — Data & Analytics Department

One head skill for measurement. Decide the question before the tool. Every metric must map to a decision someone will actually make — untracked data is guesswork and vanity dashboards are noise. Clean tracking, then honest attribution, then experiments that raise conversion.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **tracking** | "set up tracking", "GA4 events", "GTM", "event tracking", "tag setup" | Event/tag plan, implementation, and live verification | [references/tracking.md](references/tracking.md) |
| **dashboards** | "build a dashboard", "looker studio", "kpi dashboard", "reporting view" | KPI dashboards built for a decision-making audience | [references/dashboards.md](references/dashboards.md) |
| **attribution** | "attribution", "which channel converts", "marketing mix", "hero channel" | Multi-touch attribution and channel contribution analysis | [references/attribution.md](references/attribution.md) |
| **reporting** | "marketing report", "monthly report", "performance report", "client report" | Recurring performance reports that end in decisions | [references/reporting.md](references/reporting.md) |
| **cro** | "increase conversions", "cro", "a/b test", "funnel audit", "conversion audit" | Funnel audit and conversion experiments | [references/cro.md](references/cro.md) |
| **audit** | "audit analytics", "data audit", "event audit", "definition drift" | Data audit (events firing, definitions match implementation) + reporting audit (dashboards accurate) | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Designing or auditing event/tag tracking (GA4, GTM, product events).
- Building KPI dashboards for a client or marketing team.
- Understanding which channels and touchpoints drive conversions.
- Producing recurring performance reports.
- Auditing pages/funnels and running conversion experiments.

### Anti-Triggers

- Managing paid campaigns and budgets → `paidads`.
- Keyword and indexation work → `seo`.
- Building the pages/funnels themselves → `webdev` or `design`.
- Social-only performance → `smm` (analytics mode).

---

## Quick Reference

### Measurement ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'Is the data even collected correctly?' | tracking |
| 'Can the team see performance at a glance?' | dashboards |
| 'Which channel actually earned this sale?' | attribution |
| 'What happened this month and what do we do?' | reporting |
| 'Why is this page not converting, and can we fix it?' | cro |

Order: tracking → attribution → reporting → dashboards → cro. Instrument before you interpret.

### Verification gate (every mode)

- Every metric maps to a named decision or owner.
- Tracking verified against the live site/app (not just configured).
- Attribution limits stated honestly (no false certainty).
- Reports end in decisions, not just numbers.

### Suite contracts

- Tag implementation in page code → `webdev` (frontend mode).
- Channel definitions and spend → `paidads`.
- Experiment page variants → `design` / `webdev`.

---

## Procedure

1. **Intake.** name the decision the data must inform and the metric that drives it — before installing a tag or building a chart; measurement without a question becomes junk data.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Installing tags before defining the question — unfocused data.
- Vanity dashboards nobody opens or acts on.
- Trusting last-click attribution as the whole truth.
- Duplicate or double-firing events (inflated conversion counts).
- Reports that describe numbers without recommending action.
- Running CRO experiments without enough sample or a single variable.
- No data-quality check — bot traffic and internal traffic pollute results.

---

## Verification

- [ ] Every metric maps to a decision or an owner.
- [ ] Tracking verified on the live site/app via debug/preview.
- [ ] Attribution model and its limits stated explicitly.
- [ ] Internal/bot traffic filtered.
- [ ] Reports conclude with prioritized actions.
- [ ] Experiments change one variable with a defined sample and success metric.
