# 🗺️ Client Content Map: {{PROJECT_NAME}}

> **Zero-Hardcoded-Strings Invariant**: Hardcoding marketing copy, pricing, or testimonial text into UI templates is strictly prohibited. Every section below is bound to a structured file or CMS collection. Non-technical clients and copywriters edit the files listed here.

---

## 1. Content Mapping Matrix

| UI Component | Visual Location | Content File / CMS Collection | Editable Fields |
|:---|:---|:---|:---|
| **Hero** | Top fold of Landing Page | `src/content/pages/home.json` | `headline`, `subheadline`, `primaryCta.label`, `primaryCta.url` |
| **Features** | 3-Column Grid below Hero | `src/content/features/*.md` | `title`, `description`, `icon`, `badge` |
| **Pricing** | Pricing Comparison Table | `src/content/pricing.json` | `plans[].name`, `plans[].price`, `plans[].features[]` |
| **Testimonials** | Social Proof Carousel | `src/content/testimonials/*.md` | `quote`, `authorName`, `authorRole`, `avatarUrl` |
| **Footer** | Global Page Bottom | `src/data/navigation.json` | `copyrightNotice`, `legalLinks[]`, `socialHandles[]` |

---

## 2. Developer Integration Contract

1. **Schema-First Collections**: Use Astro Content Collections (`src/content/config.ts`), Payload collections (`src/collections/`), or JSON schema models.
2. **Dynamic Slots**: Never place raw strings inside `.astro`, `.tsx`, or `.html` markup. Always reference data bindings (e.g. `{hero.headline}`).
3. **Client Delivery**: When handing over to clients, provide this document alongside access to the Git repo or CMS dashboard.
