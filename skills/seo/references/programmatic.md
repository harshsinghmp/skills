# programmatic — Programmatic SEO Engine: Dataset-driven Landing Pages, Dynamic Schema, and Indexation Scaling

Large-scale, dataset-driven search landing page generation, programmatic schema automation, and crawl budget preservation for directories, SaaS comparisons, location hubs, and integration catalogs. Enforces strict anti-thin content invariants, Google Search Quality Rater Guidelines (QRG) defense, and hub-and-spoke internal linking.

---

## Scope

- **Programmatic Page Archetypes**:
  - *Comparison & Alternatives*: `[Tool A] vs [Tool B]`, `[Tool A] Alternatives for [Persona]`.
  - *Directory & Marketplace*: `Best [Service] in [City]`, `Top [Category] for [Platform]`.
  - *Integration & API Hubs*: `How to connect [App X] with [App Y]`, `[Platform] Webhook Guides`.
  - *Data & Calculators*: `[Industry] Salary Benchmark`, `[Metric] ROI Calculator`.
- **The 4 Anti-Thin Content Invariants**:
  - Minimum 30% unique, non-templated data density per page (benchmarks, verified reviews, pricing matrices).
  - Search intent differentiation (blocking keyword cannibalization across near-identical queries).
  - Dynamic FAQ generation tailored to dataset attributes.
  - Zero filler prose or repetitive AI fluff.
- **Dynamic Structured Data**:
  - Automated `BreadcrumbList`, `FAQPage`, `SoftwareApplication`, `Product`, and `Table` JSON-LD schema generation.
- **Internal Linking & Crawl Architecture**:
  - Hierarchical hub-and-spoke clustering with contextual sibling cross-links.
  - Sitemap partitioning (`<sitemapindex>` with ≤ 10,000 URLs per file) and phased indexation pacing.

---

## 🏛️ Programmatic Architecture & Page Blueprint

```
                      ┌──────────────────────────┐
                      │ Structured Dataset (JSON/│
                      │ CSV / Postgres / Supabase│
                      └─────────────┬────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │ Intent & Entity Validator│
                      │ (Filters thin/empty rows)│
                      └─────────────┬────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│ Dynamic Page Component    │                   │ Dynamic Metadata & Schema │
│ (Astro / Next.js SSR/SSG) │                   │ (JSON-LD Structured Data) │
├───────────────────────────┤                   ├───────────────────────────┤
│ • Canonical Hero & Verdict│                   │ • BreadcrumbList          │
│ • Real Benchmark Matrix   │                   │ • SoftwareApplication     │
│ • Feature Comparison Grid │                   │ • FAQPage with Schema     │
│ • Sibling Links Cluster   │                   │ • Canonical OpenGraph Tag │
└───────────────────────────┘                   └───────────────────────────┘
```

---

## 🛡️ The 4 Anti-Thin Content Invariants

Google's Helpful Content System penalizes mass-generated pages with repetitive copy. All programmatic pipelines must enforce these 4 invariants:

### 1. The 30% Unique Data Density Rule (PSE-001)
At least 30% of rendered DOM content must derive from unique data fields specific to that record (e.g. actual pricing tiers, benchmark latencies, verified user ratings, API endpoints). If a row in the dataset lacks unique metrics, **do not generate or index the page**.

### 2. Search Intent Differentiation (PSE-002)
Never generate distinct URLs for keywords that share identical search intent (e.g., `/best-crm-for-real-estate/` vs `/top-crm-for-realtors/`). Merge synonymous queries into a single authoritative entity page with canonical tags.

### 3. Dynamic Contextual FAQ Engine (PSE-003)
Every programmatic page must include 3–5 programmatic FAQ items generated from underlying entity metrics, marked up with `FAQPage` schema:
- *"Does [Tool A] support native SSO?"* → Answer dynamically populated from `record.features.sso`.
- *"What is the starting price for [Tool A] vs [Tool B]?"* → Direct numerical comparison table.

### 4. Intent-First Layout Hierarchy (PSE-004)
Place the primary answer, comparison table, or calculator above the fold (within 600px vertical). Never force the user to scroll through 400 words of background history before answering the core search query.

---

## 📦 Dynamic Schema.org Generator Blueprint

```typescript
export interface ProgrammaticPageData {
  slug: string;
  title: string;
  description: string;
  category: string;
  itemA: { name: string; price: number; rating: number };
  itemB?: { name: string; price: number; rating: number };
  faqs: Array<{ question: string; answer: string }>;
}

export function generateProgrammaticSchema(data: ProgrammaticPageData, canonicalUrl: string): string {
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://agency.com" },
        { "@type": "ListItem", position: 2, name: data.category, item: `https://agency.com/${data.category.toLowerCase()}` },
        { "@type": "ListItem", position: 3, name: data.title, item: canonicalUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    },
  ];

  if (data.itemA) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: data.itemA.name,
      applicationCategory: data.category,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.itemA.rating,
        bestRating: 5,
        ratingCount: 120,
      },
      offers: {
        "@type": "Offer",
        price: data.itemA.price,
        priceCurrency: "USD",
      },
    });
  }

  return JSON.stringify(schemas);
}
```

---

## 🔗 Hub-and-Spoke Internal Linking Cluster

Programmatic pages must never exist as orphaned leaves:
1. **Hub Page**: Categorical parent index (`/alternatives/email-marketing/`) linking to all child comparison pages.
2. **Sibling Cross-Links**: Each page includes a dynamic `"Similar Comparisons"` grid linking to 4–6 related siblings sharing the same sub-category.
3. **Breadcrumb Trail**: Standard semantic `<nav aria-label="Breadcrumb">` markup on every page reflecting the taxonomy tree.

---

## 🗺️ Sitemap Partitioning & Indexation Strategy

- **Sitemap Limits**: Split large programmatic catalogs into segmented XML files with ≤ 10,000 URLs each (`sitemap-comparisons-1.xml`, `sitemap-comparisons-2.xml`).
- **Phased Indexation Pacing**:
  - *Phase 1 (Proof of Indexation)*: Publish initial 100 pages. Monitor Google Search Console for crawl velocity and index status for 14 days.
  - *Phase 2 (Cohort Scaling)*: Once indexation rate > 80% without "Crawled - currently not indexed" warnings, release subsequent 500-page cohorts weekly.

---

## Quality Gate

- [ ] Every generated page satisfies the 30% unique data density threshold (PSE-001).
- [ ] No duplicate search intents or cannibalizing URLs generated (PSE-002).
- [ ] Dynamic FAQ block generated with valid `FAQPage` JSON-LD schema (PSE-003).
- [ ] Primary comparison or data table rendered above the fold (PSE-004).
- [ ] Hub-and-spoke breadcrumbs and sibling links render cleanly.
- [ ] Sitemap partitioned into clean ≤ 10k URL segments with valid `<lastmod>` timestamps.

---

## Routing

- Traditional on-page optimization for single landing pages → `seo:onpage`.
- Technical crawlability, robots.txt, and canonical header audit → `seo:technical`.
- Long-form manual SEO content and editorial briefs → `seo:content` / `content:seo`.
- Answer-engine citability and LLM visibility → `seo:aeo`.
