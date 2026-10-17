# audit — seo audit mode

## When to Use

- **SERP audit**: On-page, off-page, technical SEO health
- **Content freshness audit**: Identify stale content needing update

## Checklist

- [ ] Title tags ≤60 chars, unique per page
- [ ] Meta descriptions ≤160 chars, unique
- [ ] Heading hierarchy logical (h1→h2→h3, no skips)
- [ ] All images have alt text
- [ ] Canonical URLs set for duplicate content
- [ ] Sitemap.xml present and valid
- [ ] robots.txt not blocking indexable pages
- [ ] Core Web Vitals within thresholds (LCP ≤2.5s, FID ≤100ms, CLS ≤0.1)
- [ ] Internal links use descriptive anchor text
- [ ] No broken internal links (404 detection)
 - [ ] Content refreshed within documented cadence
 - [ ] Schema verdicts never rest on static fetch alone: `web_fetch`/`curl` strip `<script>` and miss JS-injected JSON-LD — confirm "no schema" via browser DOM query, Rich Results Test, or Screaming Frog before reporting (source: marketingskills `seo-audit` SKILL.md).

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Broken internal link | `AUTO-REPAIR` | update link or add redirect |
| Missing meta description | `AUTO-REPAIR` | `content` (generate) |
| Core Web Vitals fail | `REPORT-ONLY` | `webdev` (perf fix) |
| Stale content (>12mo unupdated) | `REPORT-ONLY` | `content` (refresh) |
| Duplicate title tags | `AUTO-REPAIR` | `seo` (differentiate) |

## AI-answer prompt audit (citation-gap)

Classic SERP/technical SEO covers where you rank, not what generative engines say about you. This is the measurement layer over the aeo mode's multi-engine prompt testing — audit treatment per engine/query, then route citation gaps to `aeo`.

- [ ] Build a brand prompt set: the named-product, category, solution, and "best <x>" queries users actually run against generative engines (reuse the aeo mode prompt set).
- [ ] Capture what generative engines actually answer per query/engine — presence (do you appear at all), stake-claim accuracy (is what they say about you correct), and whether a cited source is you vs a competitor.
- [ ] Score per-query × per-engine (present/absent, correct/incorrect claim, cited self/competitor/uncited) on a consistent rubric.
- [ ] Deliver a **query-by-engine citation table**: rows = queries, columns = engines, cells = presence + citation source; gaps surfaced explicitly.
- [ ] Route uncovered/incorrect/non-cited answers to the `aeo` mode for mitigation — this audit reports the gaps; `aeo` fixes them.

## Output

`.agents/artifacts/audit-seo-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
