---
name: smm
aliases: ["organic-social", "social-media", "social-media-marketing", "community-management", "influencer-marketing", "ugc"]
description: "Full organic social department: platform strategy, editorial calendars, post and caption writing, community management, influencer collaboration, UGC pipelines, and social analytics — routed through seven modes. Use when asked to grow an organic social presence, plan a posting calendar, write social posts, manage comments and community, run an influencer or UGC program, or report on social performance. Not for paid ads (paidads) or blog/email content (content)."
argument-hint: "[strategy|calendar|content|community|influencer|ugc|analytics]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 28
  aliases: ["organic-social", "social-media", "social-media-marketing", "community-management", "influencer-marketing", "ugc"]
  suggested_skills: ["content", "design", "analytics", "paidads"]
  hermes:
    tags: ["social-media", "organic-social", "strategy", "calendar", "content", "community", "influencer", "ugc", "instagram", "tiktok", "linkedin", "youtube", "engagement", "social-analytics"]
    related_skills: ["content", "design", "analytics", "paidads"]
    suggested_skills: ["content", "design", "analytics", "paidads"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["content", "design", "analytics", "paidads"]
    primary_triggers: ["organic social", "social media strategy", "content calendar", "social posts", "community management", "influencer program", "ugc campaign", "social analytics"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📣 smm — Organic Social Department

One head skill for organic social. Earn attention by being worth following, not by shouting louder. Every mode starts from the platform's native behavior (what the algorithm rewards) and the audience's actual reason to follow. Volume without a point of view is invisible. Consistency beats virality.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **strategy** | "social strategy", "which platforms", "grow our social" | Platform selection, positioning, content pillars, objective mapping | [references/strategy.md](references/strategy.md) |
| **calendar** | "content calendar", "posting schedule", "editorial calendar" | Editorial calendar with cadence, themes, and asset slots | [references/calendar.md](references/calendar.md) |
| **content** | "write a post", "caption", "social copy", "hook" | Platform-native posts, captions, hooks, and carousels | [references/content.md](references/content.md) |
| **community** | "community management", "reply to comments", "engage" | Comment/DM management, response playbook, community building | [references/community.md](references/community.md) |
| **influencer** | "influencer", "creator collab", "sponsored post" | Creator selection, briefs, contracts, disclosure, measurement | [references/influencer.md](references/influencer.md) |
| **ugc** | "ugc", "user generated content", "creator content pipeline" | UGC sourcing, rights, and paid/organic reuse pipeline | [references/ugc.md](references/ugc.md) |
| **analytics** | "social analytics", "social report", "engagement metrics" | Performance reporting, metric definitions, iteration loop | [references/analytics.md](references/analytics.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Designing or auditing an organic social strategy for a brand.
- Building an editorial calendar and posting cadence.
- Writing platform-native posts, captions, and hooks.
- Managing comments, DMs, and community engagement.
- Running influencer collaborations or a UGC pipeline.
- Reporting on social performance and iterating.

### Anti-Triggers

- Paid social campaigns, ad copy, and media buying → `paidads`.
- Long-form blog, email, or video scripts → `content`.
- Brand identity, social templates, and graphics → `design`.
- Attribution and cross-channel dashboards → `analytics`.

---

## Quick Reference

### Platform fit ladder (decide before any mode)

| Situation | Lead platform(s) |
|:---|:---|
| B2B, expertise, hiring, founder brand | LinkedIn (carousels, text posts), YouTube |
| Visual consumer product, storytelling | Instagram (Reels + carousels), TikTok |
| Short-form reach, fast experimentation | TikTok, Reels, YouTube Shorts |
| Niche technical/developer audience | YouTube, X, Reddit, newsletters |
| Local business, services | Instagram, Facebook, Google Business |

Rule: two platforms done natively beats six done badly. Pick where the audience already spends attention.

### Verification gate (every mode)

- Every post maps to a stated objective and audience.
- Native format respected (aspect ratio, length, hook timing, hashtag norms).
- Community responses within the SLA; no unanswered high-intent comment.
- Metrics tied to a business outcome, not vanity counts.

### Suite contracts

- Creative assets (templates, graphics) → `design`.
- Long-form source content to repurpose → `content`.
- Paid amplification of proven organic winners → `paidads`.

---

## Procedure

1. **Intake.** establish which platforms matter, who the audience is, and what business outcome social must drive — before producing a single post; an unbounded 'be everywhere' plan fails.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Cross-posting identical content everywhere — each platform punishes it.
- Chasing followers instead of the audience that buys.
- No hook in the first line/frame — the platform buries it.
- Posting volume with no point of view — forgettable and invisible.
- Ignoring comments — engagement signals drive reach and trust.
- Influencer deals without brief, disclosure, or measurement.
- Reporting vanity metrics (likes) instead of saves, shares, and traffic.

---

## Verification

- [ ] Platform focus chosen from the ladder with rationale.
- [ ] Every planned post maps to an objective and audience.
- [ ] Formats are native to each chosen platform.
- [ ] Community SLA defined and met (high-intent comments answered).
- [ ] Content repurposed from a source asset, not invented per post.
- [ ] Metrics tie to a business outcome and feed iteration.
- [ ] Disclosure present on all paid/partnered content.
