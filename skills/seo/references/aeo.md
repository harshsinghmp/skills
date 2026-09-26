# aeo — AEO/GEO: entity clarity, extractable facts, and AI-citability testing.

## Intake

- Target prompts (what users ask AI engines in this niche)
- Current AI visibility (prompt-set baseline run)
- Content authority signals (author, sources, original data)
- Schema maturity
- Default stack: OneGlance (or proprietary equivalent).

## Deliverable

AEO plan: entity definition fixes (about/schema/sameAs), fact-extraction restructure (stat-blocks, Q&A blocks, definitions), author/E-E-A-T signals, and a before/after prompt-set visibility test across ChatGPT, Perplexity, and AI Overviews.

## Procedure

1. Build the prompt set: 15–25 realistic user prompts for the niche; run and record the baseline (who gets cited?).
2. Entity clarity: consistent naming, an entity-rich about page, Organization/Person schema with sameAs to authoritative profiles.
3. Restructure content for extraction: definitions in the first 100 words, quotable stat-blocks, Q&A blocks matching real prompts. Key claims must be self-contained quotable sentences of ~15–20 words needing zero surrounding context (18-token extraction rule).
4. Cite sources inline (AI engines prefer verifiable claims) and add original data where possible. Calibrate effort to authority: challengers (low authority) go aggressive — 5–7 extraction points per page plus weekly micro-updates; established leaders stay light — 1–2 strategic points, never over-optimize.
5. E-E-A-T: named authors with credentials, dates, methodology sections. Refresh every section within 90 days — recency dominates AI citations. Start from a gap pass: list missing credentials, citations, and expertise signals per page, then fix highest-impact gaps first.
6. Implement schema: Organization, Person, Article, FAQ, and type-specific as fits.
7. Ship an llms.txt at the domain root (title, summary, key pages/endpoints) so AI engines have a clean crawl surface; verify it over plain HTTP with no JS.
8. Re-run the prompt set; compare citations won/lost; iterate on the losing prompts.
9. Track AI-citation loss quarter-over-quarter as a leading indicator of organic decline; investigate losing prompts before traffic drops.
10. Map query triggers: note which prompt variations trigger citations vs. direct answers, and log competitor citation frequency per query to prioritize gaps.
11. Run the citation tracking loop per LLM (ChatGPT, Perplexity, Claude, Gemini): record citation frequency, context, and rank per query; flag new citations, rank drops, and declining trends. Manual query-based checks suffice — no paid APIs required. Default stack: manual prompt runs + spreadsheet log.
12. Match optimization level to industry risk: conservative for healthcare/legal (minimal edits, strict citations), balanced as default, aggressive for low-authority challengers and e-commerce (max extraction points).
13. Per-LLM + multilingual pass: note which LLMs cite you vs. competitors, then re-test key prompts in each target locale/language (e.g. Mistral for European queries) and fix locale-specific authority sources and tone.
14. **Right Bot per Claim & Crawler Segregation**:
    - **Crucial Differentiation**: Never confuse *Search Retrieval Crawlers* (which cite you in live AI answers) with *Model Training Crawlers* (which harvest data for future model training).
      - **Search Retrieval Crawlers (MUST ALLOW for AI Citations)**: `OAI-SearchBot` (ChatGPT Search), `PerplexityBot` (Perplexity AI), `Claude-Web` (Claude search retrieval), `Google-Extended` / `Googlebot` (Gemini & AI Overviews).
      - **Model Training Crawlers (Optional Disallow to Protect IP)**: `GPTBot`, `CCBot` (Common Crawl), `Anthropic-ai` (training).
    - **robots.txt Protocol**: If a client disallows `GPTBot` or `CCBot` to protect intellectual property, explicitly verify that `OAI-SearchBot` and `PerplexityBot` are NOT blocked by a blanket `User-agent: * Disallow: /` directive. Blocking retrieval bots zeroes out conversational search market share overnight.
15. Weight GEO edits by ranked lift — DIRECTIONAL ex Princeton study via marketingskills `ai-seo` SKILL.md (single study, never canon): cite sources ~+40%, add statistics ~+37%, add quotations ~+30%; keyword stuffing hurts (~−10%). Ship extractable 40–60-word answer blocks at content starts, keep pricing parseable for buying agents (agent-readable pricing files), and run the presence playbook: Wikipedia, Reddit, reviews, YouTube text layer, podcasts.
16. Teardown pricing pages on two axes (source: marketingskills `pricing` SKILL.md): human-buyer clarity plus AI-agent readiness — run the "paste test" (ask Perplexity/ChatGPT "what are the plans and prices?" and fix what it gets wrong); route schema fixes to onpage mode and citability fixes here.
17. Fuel citations monthly (source: marketingskills `directory-submissions` SKILL.md): single-H1 pages, FAQPage schema, Reddit/HN presence, Crunchbase/Wikidata/MCP-registry claims, and a monthly manual citation check across the prompt set.
18. Citlyze Citation Gap Algorithm & 4-Quadrant Triage:
    - **Citation Share of Voice ($Citation\,SoV$) Formula**:
      $$\text{Citation SoV} = \frac{\sum (\text{Rank Weight} \times \text{Direct Domain Links})}{\text{Total Citations Across Golden Prompt Set}} \times 100$$
    - **4-Quadrant Gap Triage**:
      - **Critical Gap** (Zero Citations / High Search Volume): Deploy targeted entity schema, 18-token extractable answers, and top-of-funnel definition pages.
      - **Rank Gap** (Competitor Cited Ahead): Optimize content recency (<90 days), inline primary data sources, and author credential blocks.
      - **Fidelity Gap** (Cited with Hallucinated/Outdated Facts): Fix contradictory site copy, update `llms.txt`, and disavow scrapers.
      - **Opportunity Gap** (Cited in Perplexity but Missing in ChatGPT Search): Optimize for specific crawler formats (Markdown tables for Perplexity vs clean semantic paragraphs for ChatGPT).
19. 6-Platform AEO/GEO Monitoring Loop:
    - Track prompt results across: Perplexity, ChatGPT Search, Google Gemini/AI Overviews, Microsoft Copilot, Claude, and Grok.
    - Inspect server access logs to confirm crawl hits by `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`.

## Quality gate

- [ ] Baseline prompt set exists and is repeatable across the 6-platform matrix.
- [ ] 4-quadrant citation gap triage completed ($Citation\,SoV$ benchmarked).
- [ ] Definitions extractable in first 100 words of key pages (18-token rule).

- [ ] Entity schema with sameAs present and valid.
- [ ] Named authors with credentials on money pages.
- [ ] Before/after citation comparison recorded.
- [ ] Citation loss tracked quarter-over-quarter as a leading indicator.
- [ ] llms.txt live at root and readable with no JS.
- [ ] Query-trigger map exists (which variations cite sources + competitor frequency).
- [ ] Citation frequency/context/rank logged per LLM with trend alerts; runnable manually with no paid APIs.
- [ ] Optimization level chosen matches industry risk (conservative/balanced/aggressive).
- [ ] Per-LLM + locale gaps noted with fixes.
 - [ ] Snippet blocks typed: paragraph answers 40–60 words, lists 5–8 steps, tables for comparisons, answers at content start (keeper: wshobson/seo-technical-optimization).
 - [ ] GEO edits weighted by ranked lift (directional, source-labeled); pricing parseable by agents; presence playbook running; pricing pages pass the paste test; monthly citation fuel logged.

## Routing

- Page-level schema work → onpage mode; crawl/index blockers → technical mode.
- Competitor citation gaps → research loop, not a one-off audit; per-LLM and locale variants → re-run the same prompt set per LLM/locale.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
