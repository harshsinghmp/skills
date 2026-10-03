# content — Content strategy: keyword universe, topic clusters, briefs handed to content.

## Intake

- Business queries (what do customers ask?)
- Competitor content universe
- Existing content inventory + performance
- Capacity (how many pieces/month is realistic)
- Default stack: AlsoAsked, Ahrefs free tier (or proprietary equivalent).

## Deliverable

Content plan: keyword universe with intent and difficulty, topic clusters mapped to hub/spoke pages, a prioritized publishing schedule, and per-piece briefs (target query, intent, outline, internal links, schema) ready for `content` (blog mode) to draft.

## Procedure

1. Mine the query universe: GSC, autocomplete, PAA, competitor gaps — group by intent (informational/commercial/transactional/navigational).
2. Cluster into topics: one hub page per topic, spokes per sub-intent.
3. Prioritize by opportunity (volume × relevance × attainability) ÷ effort.
4. Build the calendar: publish cadence the client can actually sustain.
5. Brief each piece: target query, intent, SERP shape, outline, entity coverage, internal-link plan, schema.
6. Demand information gain in every brief: one unique angle, datum, or example beyond the SERP consensus — no brief ships that only rewords what ranks.
7. Hand briefs to `content` blog mode for drafting; keep the SEO review on this side.
8. Review drafts against brief + onpage gates before publish; schedule refresh for decaying pieces.
9. Map intent to format fixedly: informational to guide/FAQ/how-to, navigational to hub/brand page, commercial to comparison/review, transactional to product/landing.
10. Cluster by SERP overlap: group queries sharing URLs above the shared-URL threshold; one page per cluster, merge or canonicalize cannibals.
11. Programmatic pages must pass quality gates before scale: unique data source, template-variation minimums, standalone-value test per page, scaled-content-abuse guard; roll out in limited batches.
12. Comparison intent gets its own archetypes: X-vs-Y, alternatives-to-X, and best-category roundups with a feature matrix, ItemList/SoftwareApplication schema where fitting, and fairness-checked claims (accurate, dated, no invented weaknesses).
13. Brief every landing-intent piece with the one primary action, the offer, top-3 objections, and the proof inventory (logos, numbers, demo assets) before drafting (keeper: mengto/landing-page).
14. Hold the calendar mix at roughly 60% compounding (clusters, hubs, refreshes) / 30% timely (news, trends, seasonal) / 10% experimental (new formats, new angles) — DIRECTIONAL ratio ex marketingskills `content-strategy` SKILL.md, tune to capacity.
15. Pick programmatic plays from the 12-catalog, not from scratch (source: marketingskills `programmatic-seo` SKILL.md): templates, curation, conversions, comparisons, examples, locations, personas, integrations, glossary, translations, directory, profiles. Rank the data moat before building: proprietary > product-derived > UGC > licensed > public — thin plays on public data lose. Keep programmatic under subfolders, never subdomains.
16. Prose rules for every brief and reviewed draft: ban `easy` / `simple` / `quick` (replace with the concrete fact: "one command", "default settings") and cut filler (`very`, `just`, `really`); page headings in sentence case with descriptive subheadings (reader guesses section content from the heading alone); every page opens with a one-paragraph TL;DR and every major section with a summary sentence; keep paragraphs to 2–4 sentences on one idea.
17. Numbers over adjectives: replace weasel words (`significantly`, `many`, `often`, `typically`) with a specific cited figure; no vague quantifiers (`near-zero`, `sub-second`, `most requests`) without the figure and its source — quotable stat-blocks are what AI engines cite.
18. First-use definitions: spell out every acronym on first use and define every term the first time it appears (link to its conceptual page); active voice with direct `you` address; imperative for steps.

## Quality gate

- [ ] Every cluster has a hub and complete spokes (no orphans).
- [ ] Intent classified per query; content type matches intent.
- [ ] Schedule matches stated capacity.
- [ ] Briefs complete enough for another agent to draft.
- [ ] Refresh plan exists for existing decaying content.
- [ ] Format follows the intent-to-format map.
- [ ] No cannibalization: clusters split by SERP overlap, one page per cluster.
 - [ ] Programmatic batch passes quality gates (unique data, variation minimums, standalone value, abuse guard) with batch rollout limits.
 - [ ] Calendar mix held near 60/30/10 (compounding/timely/experimental); programmatic play picked from the 12-catalog with the data moat ranked; subfolders, not subdomains.
- [ ] Every brief names its information gain (angle/datum/example beyond SERP consensus).
- [ ] Drafts scored 1–10 on depth, E-E-A-T, readability, and keyword fit with fixes listed (keeper: wshobson/seo-content-creation).
- [ ] No banned words (`easy` / `simple` / `quick`) or filler (`very` / `just` / `really`) in briefs or reviewed drafts.
- [ ] Headings sentence case and descriptive; page opens with a TL;DR, sections with summary sentences.
- [ ] Every quantitative claim carries a specific cited figure, not a weasel word or vague quantifier.

## Routing

- Drafting from these briefs → `content` blog mode; per-page markup → onpage mode.

## Sources

- `vercel-labs/agent-skills` (`skills/writing-guidelines/SKILL.md` →
  `vercel-labs/writing-guidelines`, `command.md`) — 80+ prose rules;
  voice/structure rules above (banned words, sentence case, TL;DR open,
  concision-with-figures, first-use definitions). Code-sample limits,
  placeholder/unit formats, and AI-workflow disclosure from the same
  source enrich `updatedocs` instead (sample hygiene + audit checklist).
- Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
