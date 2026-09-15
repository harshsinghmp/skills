# technical — Technical SEO: crawl, render, index, canonical, sitemap, robots, hreflang.

## Intake

- Domain(s) and staging vs production URLs
- Search Console (or equivalent) access/export
- Platform (server, CMS, framework) — determines fix path
- Known symptoms (pages not indexed, wrong URLs ranking)
- Default stack: Screaming Frog, open-seo tools, RustySEO, PageSpeed Insights (or proprietary equivalent).

## Deliverable

Technical findings doc: crawl report, index-coverage issues with causes, canonical/robots/sitemap corrections, redirect map, hreflang matrix (if multi-locale), and a prioritized fix list with impact × effort.

## Procedure

1. Crawl the site (crawler of choice); note redirect chains, broken links, orphan pages.
2. Check robots.txt and meta robots per template — find noindex/nofollow accidents.
3. Verify index coverage in GSC: submitted vs indexed; identify pattern (section? parameter? rendering?).
4. Canonical audit: self-referencing norms, duplicates (www/http/params), pagination handling.
5. Sitemap: complete, canonical-only URLs, submitted and fetchable.
6. Rendering check: is content server-rendered or JS-gated for crawlers? JS-gated = fix or SSR/SSG.
7. Core Web Vitals pass: LCP/INP/CLS from field data; fix only failing templates.
8. Write the fix list prioritized by impact × effort with owner-ready specs.
9. Hreflang seven-check order: valid language-region codes, self-referencing tags, return tags present, canonical alignment, one URL per locale, x-default set, no conflicting signals.
10. Sitemap health: lastmod staleness and fake-date detection, canonical-only URLs, no conflicts with robots/noindex/canonical.
11. Redirects: flatten chains to single-hop, verify each target live, log every mapping, snapshot pre-change state with rollback behind an approval gate.

## Quality gate

- [ ] Crawl and index state measured, not assumed.
- [ ] Every finding names its evidence (URL, GSC report line).
- [ ] Canonical/robots/sitemap corrections are exact (not 'review this').
- [ ] Redirects are single-hop, loop-free.
- [ ] Fix list is impact × effort ranked.
- [ ] Hreflang passes the seven-check order.
- [ ] Sitemap passes health (honest lastmod, canonical-only, no conflicts).
- [ ] Redirects flattened, verified, logged, with rollback snapshot approved.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
