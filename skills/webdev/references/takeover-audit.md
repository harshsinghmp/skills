# Site Takeover Defect Inventory

Produces one ordered, evidence-backed list of what is actually broken on an inherited site
or app, so the first week of work is chosen from facts instead of impressions.

## When to Use

- You inherit a live site or app with no handover: agency change, departed contractor,
  acquisition, or an abandoned internal project.
- The new owner asks "what's wrong with it?" or "where do we start?" without naming a
  domain.
- Several audits already exist in isolation (SEO, performance, accessibility) and nobody
  can say which fix comes first.
- A redesign or feature roadmap is proposed before the current baseline is measured.
- A pre-launch, migration or re-platform decision depends on how bad the existing surface
  really is.

## Procedure

1. Freeze the audit frame before touching anything: list the URLs and environments in
   scope, what access you hold (repo, CMS, analytics, search console, hosting logs), the
   audit date, and the viewports and devices that count. Record what you could not access —
   that becomes an appendix, not a silent omission.
2. Build the surface inventory from both directions. From outside: `robots.txt`,
   `sitemap.xml`, an internal-link crawl, and analytics top-entry and top-exit pages. From
   inside: the router config, CMS content types, and template files. Reconcile the two
   lists and record counts per template and per locale. A page that exists in code but is
   unreachable from the crawl (orphan route, no internal links, a `noindex` typo) is
   already a finding.
3. Sweep each lens once, with one tool per lens, and archive raw output to files so the
   result is re-checkable without re-running the sweep:
   - SEO: titles, descriptions, canonicals, redirect chains, structured data, indexability.
   - Performance: LCP/CLS/INP, image and bundle weight, request count, third-party scripts.
   - Accessibility: keyboard path, focus order, contrast, labels, alt text, heading order,
     form error association.
   - Security: headers, TLS, exposed secrets or endpoints, outdated dependencies, cookie
     flags.
   - Links: 4xx/5xx, chains longer than one hop, cross-locale leaks, links to staging.
   - Content staleness: copyright year, expired offers, dead phone or address, lorem ipsum,
     prices that contradict checkout.
4. Deduplicate into atomic findings. One finding equals one fix: if two URLs need the same
   template change, that is one finding with a URL list; if one page has two independent
   defects, that is two findings. Collapse by "same fix", never by "same page".
5. Grade each finding on two axes only. Severity by real impact, in this order: the user
   cannot buy, read or apply; legal or accessibility exposure; data exposure; silent
   revenue loss; everything cosmetic. Effort by touch surface: config or content (S), one
   component or template (M), cross-cutting change or data migration (L).
6. Order deterministically: severity descending, effort ascending within severity. Wave 1
   is blockers with small effort, wave 2 blockers with large effort (start those early,
   they run long), wave 3 everything else. State the rule in the deliverable so a reader
   can reproduce the order with their own judgement.
7. Attach evidence to every finding: id, lens, URL plus exact reproduction steps, expected
   vs actual with a quoted string or number, the archived raw output or screenshot path,
   the severity rationale in one line, the effort estimate, and the suggested fix described
   but not implemented.
8. Deliver a single table ordered as in step 6, plus three short appendices: not verifiable
   without access, monitored but not defects, and explicitly out of scope.
9. Hand off without re-auditing. Execution of the fixes belongs to `audit.md`,
   `performance.md`, `accessibility.md`, `security-headers.md` and `cms.md`. Structural
   debt that explains a cluster of findings goes to
   `../../../quality-review/code-review/references/coupling-audit.md`. Any fix that
   changes a vendor or product choice goes to
   `../../../core-engine/updatedocs/references/decision-record.md`.

## Verification

- Inventory counts reconcile: routes in the router and CMS match crawled URLs plus the
  explained differences, with no unexplained gap in either direction.
- Every finding carries a URL or file path, reproduction steps, and expected vs actual — no
  finding rests on a tool score alone.
- Severity and effort are both recorded, and re-sorting by the stated rule reproduces the
  delivered order.
- No defect appears twice under two lenses; each duplicate is merged with a combined URL
  list.
- Raw tool output is archived and linked for every finding.
- Out-of-scope items live in their own appendix, not interspersed in the ordered list.
- The audit changed no production behaviour; anything fixed along the way is listed
  separately with its own evidence and its own verification.

## Anti-Patterns

- Delivering three audits (SEO report, Lighthouse report, axe report) instead of one
  ordered list — the ordering is the deliverable, not a by-product.
- Grading severity by tool default, a Lighthouse score or a raw violation count, rather than
  by what breaks for a user or for the business.
- Padding the list with redesigns, new features, framework migrations and taste preferences;
  those are proposals, not defects, and they bury the real blockers.
