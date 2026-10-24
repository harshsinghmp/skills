# research — Autonomous Brand Intelligence & Web Scraping

> **Operating Principle**: Clients often have a blind spot regarding how the outside world actually perceives their brand. Autonomous brand research harvests ground truth from public web pages, customer reviews, social signals, and competitor positioning. This creates a data-backed foundation for design, messaging, and marketing decisions.

---

## Autonomous Research Workflow

Execute this 5-stage web scraping and intelligence harvest upon client onboarding:

### Stage 1: Live Site Architecture & Tech Stack Scrape
1. **HTML & Semantic Structure**:
   - Fetch homepage and top 3 landing pages using `read_url_content` or `curl`.
   - Extract page `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:image`).
   - Map H1, H2, and H3 header trees to extract current messaging hierarchy.
2. **Tech Stack & Telemetry Detection**:
   - Inspect page source and script tags for:
     - Frameworks: Next.js (`__NEXT_DATA__`), React, Astro, Vue, Nuxt.
     - CMS: WordPress (`wp-content`), Shopify (`cdn.shopify.com`), Payload, Webflow.
     - Analytics & Tracking: Google Tag Manager (`GTM-`), GA4 (`G-`), Meta Pixel (`fbq`), Microsoft Clarity, Segment, PostHog, Hotjar.
     - Fonts: Google Fonts, Adobe Typekit, custom `@font-face` links.
     - CDN & Hosting: Cloudflare, Vercel, AWS CloudFront, Netlify.

### Stage 2: Social Footprint & Audience Sentiment
1. **Public Social Profiles**:
   - Inspect handles on X/Twitter, LinkedIn, YouTube, Instagram, and GitHub.
   - Note follower counts, update frequency, recent announcements, and engagement tone.
2. **Third-Party Review Analysis**:
   - Search G2, Capterra, Trustpilot, Product Hunt, Reddit, and Hacker News for unvarnished user feedback.
   - Categorize customer feedback into two lists:
     - **Praised Superpowers**: What customers love most (differentiators to amplify).
     - **Pain Points & Frustrations**: Common bugs, billing issues, or missing features (objections to neutralize).

### Stage 3: Competitive Landscape & Ad Intelligence
1. **Top 3 Direct Competitors**:
   - Analyze competitors' homepage hero headlines, pricing structures, and value propositions.
   - Note competitor positioning claims (e.g., "The simplest tool for X", "Enterprise-grade Y").
2. **Active Ad Creative Reconnaissance**:
   - Check Meta Ad Library (`facebook.com/ads/library`) and Google Ads Transparency Center for active competitor ad hooks, creative angles, and offers.
   - Identify market fatigue (angles everyone is using) vs opportunity white space.

### Stage 4: Perception Gap Analysis
Compare the client's internal claims (from `brand:intake`) against external ground truth:
- Does the public understand what the product actually does in 5 seconds?
- Are there contradictions between marketing copy and user review realities?
- Highlight the Perception Gap in the final dossier.

---

## Deliverable

Save the consolidated findings to:
`.agents/artifacts/brand/brand-intelligence.md`

### Schema:
```markdown
# Brand Intelligence Dossier: [Brand Name]
- **Date**: [YYYY-MM-DD]
- **Domain**: [https://example.com]

## 1. Technical & Infrastructure Telemetry
- **Detected Framework**: Next.js 14 / Tailwind CSS
- **CMS**: Headless Payload
- **Tracking & Tagging**: GTM, GA4, Meta Pixel
- **Hosting / CDN**: Cloudflare + Vercel

## 2. Public Messaging & Heading Structure
...

## 3. Customer Sentiment & Review Analysis
- **Top 3 Praised Features**: ...
- **Top 3 Recurring Frustrations**: ...

## 4. Competitive Matrix & White Space
...

## 5. Perception Gap & Strategic Opportunities
...
```

---

## Quality Gate

- [ ] Live site scraped: title, meta descriptions, and H1/H2 header tree extracted.
- [ ] Tech stack, analytics scripts, and CDN identified with zero hallucinations.
- [ ] Third-party reviews or social sentiment surveyed across $\ge 2$ independent platforms.
- [ ] Direct competitors analyzed for positioning and pricing.
- [ ] Perception gap explicitly documented with actionable strategic recommendations.
