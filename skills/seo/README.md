# 🔎 seo

The search department head: one skill, seven modes — technical, onpage, content, local, links, aeo, audit. Covers classic SEO and AEO/GEO for AI answer engines.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill seo
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Our organic traffic is flat — run a full SEO audit and give me a 90-day plan.
```

```text
Make our competitor comparison page citable by ChatGPT and Perplexity.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **technical** | technical crawl/index/render health | Technical SEO: crawl, render, index, canonical, sitemap, robots, hreflang. |
| **onpage** | optimize a specific page or template | On-page: titles, meta, headings, internal links, structured data, snippet quality. |
| **content** | keyword research and ranking content briefs | Content strategy: keyword universe, topic clusters, briefs handed to content. |
| **local** | local/maps visibility work | Local SEO: GBP optimization, citations, NAP consistency, local pages. |
| **links** | link profile work and acquisition | Links: profile analysis, earned-link acquisition, toxic-link triage. |
| **aeo** | AI answer engine visibility (AEO/GEO) | AEO/GEO: entity clarity, extractable facts, and AI-citability testing. |
| **audit** | full search-health audit | Full audit: technical + onpage + links + AEO synthesized into one prioritized plan. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
