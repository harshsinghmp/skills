# intake — Comprehensive Client & Brand Intake Discovery Engine

> **Operating Principle**: High-impact agency delivery requires uncompromising clarity at the foundation. A client engagement built on vague assumptions, missing assets, or half-understood business models inevitably collapses into rework, delayed timelines, and scope creep. The intake phase extracts and verifies every critical brand truth before a single line of code or design is touched.

---

## Intake Schema & Discovery Sections

Execute this structured discovery protocol for every new brand or client onboarding.

### Section 1: Executive & Company Overview
- **Legal Entity & Brand Name**: Official company name and public brand trade name.
- **Primary Stakeholders**: Key decision-maker (Final Approval), Day-to-day point of contact, Technical lead.
- **Business Model**: B2B SaaS, B2C E-Commerce, Agency/Service, Two-Sided Marketplace, Media/Publisher.
- **Current Stage & Revenue**: Bootstrapped, Seed, Series A+, Enterprise ($ARR / Monthly GMV).
- **Core Mission & Vision**: The 10-year North Star and immediate 12-month operational objectives.

### Section 2: Product Truth & Value Proposition
- **The Core Problem Solved**: The painful, expensive bottleneck that compels customers to buy.
- **The Solution & Proprietary Mechanism**: How the product uniquely solves this pain (named mechanism, patent, proprietary algorithm, or operational speed).
- **Target Customer Avatar (ICP)**:
  - Demographics: Role/Title (e.g. VP Engineering, Solo Founder), Industry vertical, Company head count ($1M–$10M ARR, 20–100 employees).
  - Psychographics: Current daily frustrations, internal fears, status goals, primary software tools used.
- **Top 4 Customer Objections**: Specific reasons prospects hesitate to buy (Price/ROI, Implementation Effort, Trust/Security, Feature Fit).
- **Core Competitors**: 3 direct rivals, 2 indirect alternatives, and 1 aspirational brand.

### Section 3: Brand Assets & Visual Direction
- **Logo Inventory**: Vector formats (`.svg`, `.ai`, `.eps`) across light, dark, and monochrome versions; favicon; app icon.
- **Color Palette & Design Tokens**: Primary, secondary, accent, and neutral hex/OKLCH values with usage rules.
- **Typography Hierarchy**: Display/headline font, body text font, monospace code font (licensing and web font links).
- **Imagery & Voice Tone**: Approved photography styles, illustration library, tone adjectives (e.g., authoritative, witty, understated, technical).
- **Claims & Evidence Library**: Verified case study metrics, ROI statistics, compliance certifications (SOC2, ISO, HIPAA), customer quote archive.

### Section 4: Technology & Operational Infrastructure
- **Production URL & Domains**: Primary domain, subdomains (`app.`, `blog.`), DNS provider (Cloudflare, Route53, Namecheap).
- **Current Software Stack**: Frontend framework, backend/database, hosting provider, CMS (WordPress, Payload, Shopify).
- **Code Repositories**: GitHub/GitLab organizations, monorepo paths, CI/CD pipeline tooling.
- **Payment Rails**: Payment processor (Stripe, Razorpay, Cashfree, PayPal), currency options, tax configuration.

---

## 🤖 Missing-Field Detection & Clarification Loop

Whenever an intake dossier is missing critical information or contains ambiguous answers, the agent MUST pause downstream work and prompt the user with structured clarification questions.

### Automated Question Formulation Guidelines:
1. **Never ask open-ended, lazy questions** like *"Tell me more about your brand."*
2. **Formulate concrete multiple-choice options with a recommended default**, followed by a write-in field.
3. Group related ambiguities into a single focused inquiry turn (do not pepper the user with 10 separate one-sentence messages).

#### Example Clarification Prompt:
> *"During brand discovery for [BrandName], the primary visual identity assets are incomplete. Please clarify the following so our design and webdev teams can proceed:*
> 1. *What is your primary brand typography preference?*
>    - (Recommended) Modern Sans-Serif (Inter / Geist / Plus Jakarta Sans)
>    - Editorial Serif (Newsreader / Playfair Display)
>    - Technical Monospace (JetBrains Mono / Fira Code)
> 2. *Do you have existing vector SVG logos available, or should the design team vectorize your current bitmap mark?*
>    - We have production SVG/vector assets in our brand drive.
>    - Please vectorize and refine our existing PNG logo."*

---

## Deliverable

A standardized Markdown Brand Intake Document saved to:
`.agents/context/brand-intake.md`

### Schema of `brand-intake.md`:
```markdown
# Brand Intake: [Brand Name]
- **Onboarding Date**: [YYYY-MM-DD]
- **Auditor**: Muse Agency Orchestration Engine
- **Status**: [IN_PROGRESS | VERIFIED_COMPLETE]

## 1. Executive Summary
...
## 2. Product & Value Proposition
...
## 3. Brand Assets & Tokens
...
## 4. Technical Infrastructure & Access
...
## 5. Outstanding Clarification Items (if any)
```

---

## Quality Gate

- [ ] Legal entity, key stakeholders, and business model clearly defined.
- [ ] Core problem, proprietary mechanism, and target ICP documented with zero unverified claims.
- [ ] Top 4 customer objections documented with approved counter-arguments.
- [ ] Visual assets verified (SVG logos, color hexes, typography fonts).
- [ ] Technical stack and repository URLs identified.
- [ ] Missing-field detector run: all missing items prompted via structured clarification questions.
