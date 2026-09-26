---
name: content
aliases: ["content-studio", "copywriting", "blogging", "email-marketing", "video-scripting", "podcast", "editorial"]
description: "Full content studio: SEO-aware blog posts, conversion and brand copy, email campaigns, video scripts, podcast episodes, customer case studies, and prose humanization — routed through eight modes. Use when asked to write a blog post or article, draft website or landing copy, build an email sequence, script a video, produce a podcast, document a customer story, or remove AI-sounding prose from a draft. Not for organic social posts (smm) or ad copy (paidads)."
argument-hint: "[blog|copy|email|video|podcast|case-study|humanize|launch]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 29
  aliases: ["content-studio", "copywriting", "blogging", "email-marketing", "video-scripting", "podcast", "editorial"]
  suggested_skills: ["seo", "design", "humanize", "smm"]
  hermes:
    tags: ["content", "blog", "copywriting", "email", "video", "podcast", "case-study", "humanize", "seo-writing", "landing-page", "newsletter", "editorial", "prose"]
    related_skills: ["seo", "design", "humanize", "smm"]
    suggested_skills: ["seo", "design", "humanize", "smm"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["seo", "design", "humanize", "smm"]
    primary_triggers: ["write a blog post", "landing page copy", "email sequence", "video script", "podcast script", "podcast episode", "case study", "humanize this", "remove AI writing", "content calendar writing"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# ✍️ content — Content Studio Department

One head skill for content. Every piece starts from a source of truth — a keyword, a customer outcome, a product fact — and ends with a specific reader taking a specific action. Generic prose ranks nowhere and converts nobody. Facts before adjectives; clarity before cleverness.

**Universal Copywriting & SEO/AEO Mandate**: All copy creation across every mode (landing pages, emails, blogs, video scripts, launches) must strictly follow an appropriate battle-tested copywriting formula from `copy.md` (e.g. AIDA, PAS, QUEST, ACCA, 4 Ps, Star-Story-Solution). All public-facing content MUST be dual-optimized for traditional Search Engine Optimization (SEO) and modern AI Engine Optimization (AEO: ChatGPT Search, Perplexity, Gemini AI Overviews, Claude) enforcing CORE-EEAT, 18-token standalone quotability, and answer-first structuring.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **blog** | "blog post", "article", "pillar page", "write an SEO article" | SEO-aware blog post from a keyword brief and search intent | [references/blog.md](references/blog.md) |
| **copy** | "landing page copy", "website copy", "product copy", "hero copy" | Conversion-focused website, landing, and product copy | [references/copy.md](references/copy.md) |
| **email** | "email sequence", "welcome email", "newsletter", "lifecycle email" | Lifecycle and campaign email sequences | [references/email.md](references/email.md) |
| **video** | "video script", "youtube script", "explainer video", "reel script", "heyframes" | Video creation & editing: short-form Reels/Shorts/TikTok, long-form YouTube essays, HeyFrames reframing/clipping, hooks, and shot direction | [references/video.md](references/video.md) |
| **podcast** | "podcast", "podcast script", "show notes", "guest interview", "podcast episode" | Full podcast lifecycle: show concept, guest prep, interview & solo scripting, audio specs (-16 LUFS), show notes, and chaptering | [references/podcast.md](references/podcast.md) |
| **case-study** | "case study", "success story", "customer story" | Customer case study: outcome, proof, and narrative | [references/case-study.md](references/case-study.md) |
| **humanize** | "humanize this", "remove AI writing", "make it sound natural", "de-slop" | Editorial pass removing AI-sounding prose without changing facts or voice | [references/humanize.md](references/humanize.md) |
| **launch** | "product launch", "launch announcement", "feature release", "launch copy" | Launch copy kit: headline, offer, key messages, and channel-ready assets | [references/launch.md](references/launch.md) |
| **audit** | "audit content", "content audit", "fact check", "slop audit", "style guide audit" | Content-quality audit (anti-slop scan, fact verification, brand voice, readability) | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Writing SEO-aware blog posts, articles, or pillar pages.
- Drafting website, landing page, or product copy.
- Building email campaigns and lifecycle sequences.
- Scripting video content for YouTube, social, or product, or editing with HeyFrames.
- Producing podcasts: guest prep, show notes, audio specs (-16 LUFS), and episode scripting.
- Documenting a customer case study or success story.
- Editing a draft to remove AI-sounding prose.
- Announcing a product or feature launch.

### Anti-Triggers

- Organic social posts, captions, and calendars → `smm`.
- Paid ad copy and hooks → `paidads`.
- Keyword research and technical SEO → `seo`.
- Visual design of the page the copy sits on → `design`.

---

## Quick Reference

### Source-first ladder (decide before any mode)

| Situation | Anchor the piece to |
|:---|:---|
| SEO/blog | A keyword cluster and the searcher's intent (`seo` provides the brief) |
| Landing/product copy | A verified product fact and the objection it removes |
| Email | A lifecycle moment and the one action it earns |
| Video | A hook and the single payoff the viewer came for |
| Case study | A named customer outcome with numbers and a quote |

Rule: no piece ships without a named reader, one action, and at least one verifiable source fact.

### Verification gate (every mode)

- Reader, action, and source facts are explicit.
- Claims are real, sourced, and not inflated.
- The mode's own quality gate passed.
- A humanize pass run on any AI-drafted prose before delivery.

### Suite contracts

- Keyword briefs and intent → `seo` (content mode).
- Layout the copy lives in → `design` (ui mode).
- Post-AI-slop editorial pass → `humanize` (or content's humanize mode).

---

## Procedure

1. **Intake.** identify the single reader, the one action the piece must drive, and the source facts available — before writing; content without a reader and a source is filler.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Writing to a topic instead of a reader — no anchor, no traction.
- Leading with the brand instead of the reader's problem.
- Unverified or inflated claims ('revolutionary', 'world-class').
- SEO keyword stuffing that destroys readability.
- Shipping AI-drafted prose with tell-tale formulaic patterns.
- One CTA too many — decide the single action per piece.
- Ignoring the format (a 2,000-word blog as an email, a skimmable page as a wall of text).

---

## Verification

- [ ] Reader, action, and source facts stated before writing.
- [ ] Every claim traceable to a fact or source.
- [ ] No inflated significance language.
- [ ] Humanize pass run on any AI-drafted text.
- [ ] One primary CTA per piece.
- [ ] Structure and length match the format.
- [ ] Internal links / references included where relevant (SEO modes).
