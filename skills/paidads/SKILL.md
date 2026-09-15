---
name: paidads
aliases: ["paid-ads", "ads", "advertising", "ppc", "sem", "google-ads", "meta-ads", "paid-media", "media-buying"]
description: "Full paid advertising department: builds and manages campaigns across Google, Meta (Facebook/Instagram), LinkedIn, Reddit, TikTok, Snapchat, YouTube, and programmatic — plus cross-channel retargeting, budget pacing, and account audits — routed through ten modes. Use when asked to create or optimize ad campaigns, write ad copy, plan budgets or bids, set up tracking pixels and conversion events, build retargeting funnels, or audit ad account performance. Not for organic social strategy (smm), SEO, or analytics dashboards (analytics)."
argument-hint: "[google|meta|linkedin|reddit|tiktok|snapchat|youtube|programmatic|retargeting|audit|extra-platforms]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 24
  aliases: ["paid-ads", "ads", "advertising", "ppc", "sem", "google-ads", "meta-ads", "paid-media", "media-buying"]
  suggested_skills: ["analytics", "content", "smm", "evidence-ledger"]
  hermes:
    tags: ["paid-advertising", "google-ads", "meta-ads", "facebook-ads", "instagram-ads", "linkedin-ads", "reddit-ads", "tiktok-ads", "snapchat-ads", "youtube-ads", "ppc", "sem", "programmatic", "retargeting", "remarketing", "budget", "bidding", "ad-copy", "conversion-tracking", "audiences"]
    related_skills: ["analytics", "content", "smm", "evidence-ledger"]
    suggested_skills: ["analytics", "content", "smm", "evidence-ledger"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "web_fetch", "run_command"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["analytics", "content", "smm", "evidence-ledger"]
    primary_triggers: ["google ads campaign", "meta ads", "facebook ad", "linkedin ad", "tiktok ad", "reddit ad", "snapchat ad", "youtube ads", "ppc", "paid campaign", "ad budget", "retargeting campaign", "audit the ad account", "ad copy"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "web_fetch", "run_command"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📣 paidads — Paid Advertising Department

One head skill for the whole paid advertising department. Channel modes share one campaign doctrine — objective before budget, audience before creative, tracking before launch, and data before opinion. Each channel mode applies the doctrine to that platform's native objects.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **google** | "google ads campaign", "search ads", "performance max", "shopping" | Search/PMax/Shopping/Display on Google Ads structure | [references/google.md](references/google.md) |
| **meta** | "meta ads", "facebook ads", "instagram ads", "advantage+" | Facebook/Instagram feed, stories, reels via Meta Ads Manager | [references/meta.md](references/meta.md) |
| **linkedin** | "linkedin ads", "b2b campaign", "sponsored content" | Sponsored content, lead gen forms, message ads for B2B | [references/linkedin.md](references/linkedin.md) |
| **reddit** | "reddit ads", "promoted post", "subreddit targeting" | Promoted posts in communities, anti-promo culture rules | [references/reddit.md](references/reddit.md) |
| **tiktok** | "tiktok ads", "spark ads", "spark ads" | In-feed, Spark ads, creative-first structure | [references/tiktok.md](references/tiktok.md) |
| **snapchat** | "snapchat ads", "ar lens", "snap ads" | Snap Ads, story ads, AR lenses for younger demos | [references/snapchat.md](references/snapchat.md) |
| **youtube** | "youtube ads", "video campaign", "skippable in-stream" | Skippable in-stream, shorts, discovery video campaigns | [references/youtube.md](references/youtube.md) |
| **programmatic** | "programmatic", "dsp", "display at scale" | DSP-based display/video buying with brand safety | [references/programmatic.md](references/programmatic.md) |
| **retargeting** | "retargeting", "remarketing", "bring back visitors" | Cross-channel remarketing from audience pools | [references/retargeting.md](references/retargeting.md) |
| **audit** | "audit the ad account", "why is CPA up", "account health check" | Structured account audit: structure → tracking → creative → budget | [references/audit.md](references/audit.md) |
| **extra-platforms** | microsoft ads, pinterest ads, retail media, audio ads, ctv | Secondary platforms: Microsoft, Pinterest, X, Apple Search, retail, native, audio, CTV, Local Services | [references/extra-platforms.md](references/extra-platforms.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Building or restructuring a paid campaign on any major ad platform.
- Planning budgets, bids, or pacing across channels.
- Writing platform-native ad copy and creative briefs.
- Setting up conversion tracking, pixels, and events before launch.
- Building retargeting/remarketing funnels from audiences.
- Auditing an underperforming ad account or scaling a working one.

### Anti-Triggers

- Organic social strategy, calendars, community → `smm`.
- SEO / AEO / organic search visibility → `seo`.
- Building the measurement layer itself (GA4, dashboards, attribution) → `analytics`.
- Ad copy as part of broader site copywriting → `content`.

---

## Quick Reference

### Universal campaign doctrine (applies to every channel mode)

1. **Objective first.** Name the business objective in one word (awareness/traffic/leads/sales/retention). No objective, no campaign.
2. **Audience before creative.** Define who sees it before deciding what they see.
3. **Tracking before launch.** Pixel installed, conversion events verified, UTM convention applied — or the campaign does not launch.
4. **Creative volume.** 3–5 variants per ad set at launch (test messaging, not colors).
5. **Data before opinion.** Decisions after the data window (typically 7 days or 50 conversions per variant), never before.
6. **Budget floor.** Per-ad-set daily budget ≥ 10× target CPA, or the algorithm can't exit learning.

### Intake gate

| Missing at intake | Consequence |
|:---|:---|
| Objective | Wrong campaign type and KPI |
| Target CPA/ROAS | No kill criteria for losers |
| Audience definition | Spray and pray |
| Verified tracking | Unmeasurable spend |

### UTM convention (suite standard)

`utm_source={platform}&utm_medium=paid&utm_campaign={campaign_slug}` — derive `utm_term`/`utm_content` per variant. Apply on every ad; `analytics` reads this contract.

### Platform table (verify current specs against platform docs before launch)

| Channel | Bid engine heart | Native strength | Watch out |
|:---|:---|:---|:---|
| Google Search | Intent capture | People already searching | Broad match burn |
| Meta | Learner | Rich targeting + formats | Learning phase resets |
| LinkedIn | Firmographics | B2B job title/company | Expensive CPC |
| Reddit | Context/interest | High-intent communities | Anti-promotional culture |
| TikTok | Spark + creative | Reach + engagement | Rapid creative fatigue |
| Snapchat | Reach younger demos | AR lenses | Narrower placement set |
| YouTube | Skippable/views | Awareness + consideration | Needs strong hooks |
| Programmatic | DSP reach | Scale across open web | Brand safety + fraud |

---

## Procedure

1. **Intake.** confirm the campaign objective (one of awareness / traffic / leads / sales / retention) — every downstream choice (channel, audience, bid, creative, KPI) is derived from it.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Launching before tracking is verified — unmeasurable spend; tracking gate comes first.
- Structuring by gut instead of the platform's native objects (ad sets, groups, lines).
- Editing budgets/creatives mid-learning-phase — resets the algorithm.
- One creative per ad set — nothing to learn from; 3–5 variants minimum.
- Broad match with no negatives (Google) — burning budget on irrelevant queries.
- Treating all channels the same — Reddit punishes promo-speak; LinkedIn needs firmographic copy.
- Optimizing to clicks when the objective is leads/sales — optimize to the business event.
- No kill criteria — a loser without a target CPA/ROAS floor runs forever.

---

## Verification

- [ ] Objective named in one word before any platform object was created.
- [ ] Tracking verified (pixel fires, events test-fire, UTM applied) before launch.
- [ ] 3–5 creative variants per ad set, differing on message not color.
- [ ] Budget floor respected: ≥ 10× target CPA per ad set.
- [ ] Kill criteria stated upfront (target CPA/ROAS, data window).
- [ ] Findings and optimizations cite the platform metric they came from.
