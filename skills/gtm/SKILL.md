---
name: gtm
aliases: ["outbound", "cold-email", "lead-gen", "prospecting", "sales-handover", "lead-scoring", "list-building"]
description: "Outbound GTM department: account and lead research, lead scoring with TAM and SAM sizing, cold email sequencing with deliverability, list building with hygiene and enrichment, and sales handover with context packets, routed through five modes. Use when asked to research target accounts, score leads, build a prospect list, run a cold outbound sequence, or hand off qualified pipeline to sales. Not for paid ads (paidads), launch strategy (growth), email copy craft (content), social outreach (smm), CRM plumbing (automation), or metrics (analytics)."
argument-hint: "[research|score|outreach|list|handover]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 37
  aliases: ["outbound", "cold-email", "lead-gen", "prospecting", "sales-handover", "lead-scoring", "list-building"]
  suggested_skills: ["growth", "content", "ops", "analytics"]
  hermes:
    tags: ["gtm", "outbound", "prospecting", "lead-generation", "account-research", "lead-scoring", "tam-sam", "cold-email", "deliverability", "list-building", "enrichment", "sales-handover", "pipeline"]
    related_skills: ["growth", "content", "ops", "analytics"]
    suggested_skills: ["growth", "content", "ops", "analytics"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["growth", "content", "ops", "analytics"]
    primary_triggers: ["research target accounts", "score leads", "TAM SAM sizing", "cold email sequence", "build a prospect list", "list hygiene", "sales handover", "outbound pipeline"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📤 gtm — Outbound GTM Department

One head skill for outbound go-to-market. Pipeline is built, not found: research the accounts, score the leads, sequence the outreach, keep the list clean, and hand over context sales can close. Every mode runs handsfree — defaults are stated inline, assumptions recorded in the deliverable, zero questions asked.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **research** | "research this account", "target accounts", "lead research", "who should we target" | Account and lead research with spine-always depth | [references/research.md](references/research.md) |
| **score** | "score these leads", "TAM SAM", "market sizing", "prioritize prospects" | Lead scoring, TAM/SAM sizing, and signal ladders | [references/score.md](references/score.md) |
| **outreach** | "cold email sequence", "outbound sequence", "follow-up emails", "breakup email" | Email sequences with deliverability, caps, and breakup | [references/outreach.md](references/outreach.md) |
| **list** | "build a prospect list", "list hygiene", "enrich this list", "verify emails" | List building with CSV hygiene and enrichment verification | [references/list.md](references/list.md) |
| **handover** | "hand off to sales", "sales handover", "qualified pipeline", "context packet" | Sales handover with a context packet, routed to ops | [references/handover.md](references/handover.md) |
| **audit** | "audit gtm", "launch audit", "launch readiness", "messaging audit" | Launch-readiness audit (assets present, channels wired, payments flow) + messaging audit | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Researching target accounts and leads before outbound.
- Scoring leads, sizing TAM/SAM, and prioritizing prospects.
- Running a cold email sequence with follow-ups and breakup.
- Building, cleaning, and enriching a prospect list.
- Handing qualified pipeline to sales with full context.

### Anti-Triggers

- Paid advertising campaigns → `paidads`.
- Launch strategy and positioning → `growth` (gtm owns outbound execution; `growth` owns launch strategy).
- Email copy craft and wording → `content` (gtm owns sequencing and timing; `content` owns the words).
- Social-channel outreach → `smm`.
- CRM setup and pipeline plumbing → `automation`.
- Measuring campaign results → `analytics`.

---

## Quick Reference

### Routing ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'Who are we going after, and what do we know about them?' | research |
| 'Which leads matter most, and how big is the market?' | score |
| 'What sequence goes out, when, and when do we stop?' | outreach |
| 'Is the list clean, verified, and enriched?' | list |
| 'What does sales need to close this?' | handover |

Order: research → score → list → outreach → handover. Know the accounts, rank them, clean the list, sequence, then hand over.

### Metrics loop (post-handover measurement)

Source: `tech-leads-club/agent-skills` `gtm-metrics` (orig `chadboyda/agent-gtm-skills`), raw SKILL.md fetched per lane-a-skillshub-remainder.md #13; enrich-only, no new skill or mode.

Run this loop on the outbound the modes above produce; deep analysis stays in `analytics`.

1. **Select 5–7 metrics max**: pipeline coverage (3–4x sales-led, 2–3x PLG), CAC payback (<8 mo), Magic Number (>0.75 efficient, >1.0 excellent, <0.5 red flag), NRR (>106% median, >120% best-in-class), TTFV (<15 min self-serve, <1 day sales-led), slippage (<15% weekly), speed-to-lead (<5 min).
2. **Dashboard in three tiers**: board (5–7 metrics, monthly) → executive (10–12, weekly) → operator (15–25, daily). Every metric from system-of-record APIs — no hand-edited slides; every metric carries benchmark, target, or trend line.
3. **Attribution**: match lookback to cycle (90d SMB, 180d mid-market, 365d enterprise); pre-revenue start first-touch, $1–5M U-shaped, $5–20M W-shaped; tag AI-SDR touches with `source=AI-SDR` so agent-led pipeline stays visible.
4. **Weekly cadence (30–45 min)**: scorecard → pipeline movements → leading indicators → deals at risk → 2–3 owned actions → one rotating deep-dive. Maintain ~60% leading / 40% lagging indicators.
5. **Data health gate**: score CRM completeness/accuracy/recency/consistency before trusting pipeline reports; below 70% = stop trusting reports, clean first (data decays ~2.1%/mo).

### Verification gate (every mode)

- The ideal customer profile is stated before any account or lead is touched.
- Every researched claim carries a source and a date; unverified fields are marked as assumptions.
- Sending volumes respect caps and deliverability rules; every sequence ends in a breakup.
- The handover packet lets sales run the first call with zero extra research.

### Suite contracts

- Positioning and launch strategy behind the outbound → `growth`.
- Email and asset wording → `content`.
- Tracking replies, meetings, and pipeline → `ops`; measuring results → `analytics`.

---

## Procedure

1. **Intake.** establish the ideal customer profile, the offer, and the outbound goal before touching any account — outbound without an ICP is spam.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → default to research, state the assumption, proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where sales expects it.

---

## Pitfalls

- Outbound without a written ICP — every list looks good and none convert.
- Researching without sources and dates — stale intel kills first calls.
- Scoring on gut instead of fit plus intent signals.
- Sending without warm-up, caps, or breakup — burned domain, no replies.
- Dirty lists: duplicates, role-based addresses, and unverified emails.
- Handover without context — sales re-researches everything, momentum dies.
- Confusing sequencing (gtm) with copy craft (`content`) — fix timing first, words second.
- Dashboard without trust — 50-metric screens, vanity metrics with no benchmark, or reports built on sub-70% data health.

---

## Verification

- [ ] Ideal customer profile stated in one paragraph.
- [ ] Researched claims sourced and dated; assumptions marked.
- [ ] Scores trace to fit plus intent signals, not gut.
- [ ] Sequence states volumes, caps, spacing, and a breakup step.
- [ ] List is deduplicated, verified, and enrichment-checked.
- [ ] Handover packet carries context, history, and suggested next step.
- [ ] Metrics loop closed: 5–7 metrics selected with targets, dashboard tiered from system-of-record data, attribution lookback stated, weekly review scheduled.
