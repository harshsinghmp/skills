---
name: seo
aliases: ["search-engine-optimization", "seo-department", "aeo", "geo", "organic-search", "link-building", "local-seo"]
description: "Full SEO and AEO department: technical SEO, on-page optimization, content strategy, local SEO, link building, answer-engine optimization (AEO/GEO for AI search), and full audits — routed through seven modes. Use when asked to improve organic search visibility, fix crawlability or indexing issues, optimize pages or content for search, build or disavow links, optimize for local/maps visibility, or make a site citable by AI answer engines (ChatGPT, Perplexity, AI Overviews). Not for paid ads (paidads) or analytics setup (analytics)."
argument-hint: "[technical|onpage|content|local|links|aeo|audit]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 25
  aliases: ["search-engine-optimization", "seo-department", "aeo", "geo", "organic-search", "link-building", "local-seo"]
  suggested_skills: ["content", "analytics", "webdev", "evidence-ledger"]
  hermes:
    tags: ["seo", "aeo", "geo", "answer-engine-optimization", "organic-search", "technical-seo", "on-page", "local-seo", "link-building", "backlinks", "crawlability", "indexing", "sitemap", "robots", "structured-data", "schema-org", "ai-search", "llm-citations", "e-e-a-t", "serp"]
    related_skills: ["content", "analytics", "webdev", "evidence-ledger"]
    suggested_skills: ["content", "analytics", "webdev", "evidence-ledger"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "web_fetch"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["content", "analytics", "webdev", "evidence-ledger"]
    primary_triggers: ["improve seo", "technical seo", "on-page optimization", "local seo", "link building", "answer engine optimization", "aeo", "geo", "rank on google", "site audit", "indexing issues", "ai overviews", "chatgpt visibility", "perplexity"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "web_fetch"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🔎 seo — Search & Answer Engine Optimization Department

One head skill for the search department. Organic visibility is earned through a crawlable, fast, indexable site (technical), pages structured for relevance (on-page), content worth citing (content + AEO), and authority (links + local). Every mode outputs prioritized, evidence-cited work.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **technical** | "technical seo", "crawlability", "indexing issues", "site architecture" | Crawl, render, index, canonical, sitemap, robots, hreflang | [references/technical.md](references/technical.md) |
| **onpage** | "on-page seo", "optimize this page", "title tags", "internal linking" | Title/meta/H-structure, internal links, schema, snippet optimization | [references/onpage.md](references/onpage.md) |
| **content** | "seo content strategy", "keyword research", "topic clusters", "content brief" | Keyword/topic universe → clusters → briefs (content writes them) | [references/content.md](references/content.md) |
| **local** | "local seo", "google business profile", "maps ranking", "nap consistency" | GBP, local citations, NAP, local landing pages | [references/local.md](references/local.md) |
| **links** | "link building", "backlinks", "disavow", "digital pr" | Link profile analysis, acquisition (earned), toxic-link handling | [references/links.md](references/links.md) |
| **aeo** | "aeo", "geo", "ai overviews", "chatgpt visibility", "perplexity citations", "llm seo" | Answer-engine citability: entities, extractable facts, schema, prompt-set testing | [references/aeo.md](references/aeo.md) |
| **audit** | "full seo audit", "site audit", "why did traffic drop", "search health check" | Full search-health audit: all modes synthesized | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Improving organic rankings or visibility for a site or page.
- Diagnosing crawlability, indexing, or canonicalization issues.
- Optimizing existing pages (titles, structure, internal linking, schema).
- Planning content that should rank or be cited by AI engines.
- Local/maps visibility, GBP, and NAP consistency work.
- Building, evaluating, or disavowing links.
- Running a full search-health audit (SEO + AEO together).

### Anti-Triggers

- Paid search or shopping → `paidads` (google mode).
- GA4/GTM/dashboards setup → `analytics`.
- Site speed as a build task → `webdev` (performance mode); `seo` technical mode verifies the result.
- Writing the actual long-form article → `content` (blog mode); `seo` content mode defines the brief.

---

## Quick Reference

### Baseline-first doctrine

Every mode starts from measured state, not assumed state:

| Input | Source |
|:---|:---|
| Index coverage / crawl state | Search Console (or equivalent) |
| Query & page performance | Search Console + GA4 |
| Current SERP shape | live SERP check per target query |
| AI engine visibility | manual/automated prompt set across ChatGPT, Perplexity, AI Overviews |

No baseline → gather it first. Proposing changes without one is guessing.

### Priority order (multi-problem sites)

1. Indexability (can it be crawled and indexed at all?) — nothing else matters until this is true.
2. Rendering & speed (Core Web Vitals as threshold, not trophy).
3. Relevance (on-page, internal links, titles).
4. Authority (links, local).
5. AEO/answer-engine citability.

### Entity-first AEO principle

AI engines cite what they can parse as entities and facts: clear entity definitions (about-page, schema, consistent naming), extractable claims with sources, and quotable stat-blocks beat keyword density every time.

### Suite contracts

- UTM/organic segmentation: follow the `analytics` measurement contract.
- Content briefs for ranking pages: hand to `content` (blog mode) for drafting; `seo` defines the brief.

---

## Procedure

1. **Intake.** pull the Search Console / analytics baseline before proposing changes — no baseline, no diagnosis.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Proposing changes without a Search Console/analytics baseline — guessing.
- Fixing relevance when the page isn't even indexed — indexability first.
- Chasing Core Web Vitals as a trophy when it's only a tie-breaker threshold.
- Keyword-stuffing titles/H1s — write for the SERP snippet and the user, not the crawler.
- Buying links without vetting — one PBN penalty outweighs a year of white-hat work.
- Treating AEO as magic prompts — it's entity clarity + extractable facts + structured data.
- NAP inconsistency across local citations — silently kills maps rankings.
- Disavowing without a manual action or clear toxicity evidence — usually unnecessary and risky.

---

## Verification

- [ ] Baseline captured before recommendations; every finding cites measured evidence.
- [ ] Priority order respected (indexability before relevance before authority).
- [ ] Every recommendation is prioritized with impact × effort.
- [ ] Structured-data changes validate against the schema.org type being used.
- [ ] Local work includes NAP consistency check across the citation set.
- [ ] AEO claims are testable (prompt-set visibility check before/after).
