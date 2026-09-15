---
name: growth
aliases: ["strategy", "scaling", "positioning", "go-to-market", "gtm", "pricing-strategy", "competitive-analysis"]
description: "Full strategy and scaling department: positioning, marketing funnels, pricing, product launch, and competitor analysis — routed through five modes. Use when asked to sharpen positioning or a value proposition, map an acquisition/conversion funnel, set or test pricing, plan a product or feature launch, or analyze competitors and the market. Not for executing channels (paidads/seo/smm) or measuring results (analytics)."
argument-hint: "[positioning|funnels|pricing|launch|competitor]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 34
  aliases: ["strategy", "scaling", "positioning", "go-to-market", "gtm", "pricing-strategy", "competitive-analysis"]
  suggested_skills: ["analytics", "content", "paidads", "seo"]
  hermes:
    tags: ["growth", "strategy", "positioning", "messaging", "funnels", "pricing", "launch", "go-to-market", "competitor-analysis", "market", "scaling", "value-proposition"]
    related_skills: ["analytics", "content", "paidads", "seo"]
    suggested_skills: ["analytics", "content", "paidads", "seo"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["analytics", "content", "paidads", "seo"]
    primary_triggers: ["positioning", "value proposition", "funnel strategy", "pricing strategy", "product launch", "go to market", "competitor analysis", "market analysis"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📈 growth — Strategy & Scaling Department

One head skill for strategy and scaling. Win by choosing where to compete and who to serve, not by being slightly better everywhere. Every strategy ends in a testable bet with a metric. Positioning drives messaging, which drives funnels, pricing, and launch — get the order right.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **positioning** | "positioning", "value proposition", "messaging", "differentiation" | Positioning and value proposition from audience and competitive gap | [references/positioning.md](references/positioning.md) |
| **funnels** | "funnel", "acquisition funnel", "conversion funnel", "customer journey" | Funnel mapping and stage-by-stage improvement plan | [references/funnels.md](references/funnels.md) |
| **pricing** | "pricing", "pricing strategy", "how much to charge", "pricing tiers" | Pricing structure from value, willingness, and positioning | [references/pricing.md](references/pricing.md) |
| **launch** | "launch plan", "go to market", "gtm", "product launch" | Go-to-market launch plan with sequencing and metrics | [references/launch.md](references/launch.md) |
| **competitor** | "competitor analysis", "competitive landscape", "market analysis", "who else does this" | Competitor and market analysis with actionable gaps | [references/competitor.md](references/competitor.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Sharpening positioning, messaging, or a value proposition.
- Mapping and improving an acquisition → conversion funnel.
- Setting, testing, or restructuring pricing.
- Planning a product, feature, or market launch.
- Analyzing competitors and the competitive landscape.

### Anti-Triggers

- Running ads, SEO, or social channels → `paidads` / `seo` / `smm`.
- Measuring and reporting results → `analytics`.
- Producing the launch asset copy → `content`.
- Visual brand identity → `design`.

---

## Quick Reference

### Strategy ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'Who is this for and why choose us?' | positioning |
| 'How do we turn strangers into customers?' | funnels |
| 'What should we charge, and how?' | pricing |
| 'How do we take this to market?' | launch |
| 'What is everyone else doing?' | competitor |

Order: competitor → positioning → funnels → pricing → launch. Know the landscape, choose the position, then build the path.

### Verification gate (every mode)

- The recommendation names a specific audience and a testable bet.
- Every claim about the market or competitors is sourced and dated.
- The plan has a metric and a review point.
- Positioning is stated in the customer's words, not internal jargon.

### Suite contracts

- Executing the chosen channels → `paidads` / `seo` / `smm` / `content`.
- Measuring the bet → `analytics`.
- Launch assets → `content` + `design`.

---

## Procedure

1. **Intake.** establish the market, the buyer, and the current standing before recommending anything — strategy without a chosen audience is a wish.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Positioning that tries to appeal to everyone — resonates with no one.
- Copying competitor messaging instead of finding the gap.
- Strategy with no metric or review point — untestable.
- Skipping the funnel and going straight to campaigns.
- Pricing set by gut, cost-plus, or competitor-matching alone.
- Launch with no audience warmed beforehand.
- Competitor analysis that lists features without insight.
- Unsourced market claims presented as fact.

---

## Verification

- [ ] A specific audience is named (not 'everyone').
- [ ] Positioning stated in the customer's language.
- [ ] Market/competitor claims sourced and dated.
- [ ] The plan is a testable bet with a metric and review point.
- [ ] Pricing reflects perceived value, not cost alone.
- [ ] Launch sequences audience warming before the ask.
