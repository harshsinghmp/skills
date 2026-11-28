# cro — Conversion-Rate Optimizer: Landing page hero audits, 5-state anti-slop copy gates, CTA contrast, and form friction reduction.

Autonomous Conversion-Rate Optimization (CRO) engine and landing page conversion auditor. Diagnose drop-off points, eliminate corporate copy slop, enforce ergonomic CTA mechanics, and streamline form workflows to maximize visitor-to-customer conversion velocity.

---

## Intake

- **Target Page Surface**: Live URL, staging preview link, Figma design file, or raw component markup (Astro/Next.js).
- **Target Audience / ICP**: Key buyer persona, pain threshold, awareness stage (Problem-Aware vs Solution-Aware), and industry vertical.
- **Primary Conversion Objective**: Target micro/macro conversion (e.g., Demo booking, free trial signup, lead magnet download, direct purchase).
- **Baseline Funnel Metrics**: Current visitor bounce rate, average time-on-page, above-the-fold exit rate, and form abandonment percentage.
- **Device Viewport Context**: Mobile (390px width) vs Desktop (1440px width) primary traffic distribution.

---

## Deliverable

1. **CRO Diagnostic Scorecard (0–100 Scale)**:
   - Weighted evaluation across Hero Value Density, Anti-Slop Copy, CTA Physics, Form Friction, and Trust Proof.
2. **Above-the-Fold Diagnostic & Visual Hierarchy Audit**:
   - Verification of the 5-Second Rule: Value proposition, primary CTA, and social proof visible without scroll.
3. **5-State Anti-Slop Copy Gate Audit**:
   - Line-by-line identification and replacement of vague marketing clichés with concrete, quantified transformation claims.
4. **CTA Contrast & Ergonomics Audit**:
   - WCAG AAA / AA contrast ratio measurement (>= 7:1 preferred, >= 4.5:1 required).
   - Mobile thumb-zone reachability and 48px touch-target compliance.
5. **Form Friction Reduction Blueprint**:
   - Field elimination analysis (enforcing the <= 4 input rule for top-of-funnel lead capture).
   - Progressive disclosure and inline validation recommendations.
6. **Core-EEAT & Modern AEO Quotability Verification**:
   - 18-token standalone quotability rule for all major section headers and hero value summaries.

---

## 🏛️ The 5 Core CRO Pillars

### Pillar 1: Hero Section Value Density (The 5-Second Test)

A first-time visitor must comprehend three fundamentals within five seconds on both mobile (390px) and desktop (1440px) viewports:
1. **What is it?** (Clear product/service category).
2. **What transformation does it deliver?** (Tangible quantified outcome).
3. **What do I do next?** (Unambiguous primary action).

```markdown
### 📐 Above-the-Fold Viewport Invariants

- **Desktop (1440x900)**: Headline, subheadline, primary CTA, and trust proof must render within the top 720px vertical space.
- **Mobile (390x844)**: Primary headline (max 3 lines), benefit subhead (max 2 lines), and primary CTA button (min 48px height) must render above 580px vertical fold.
- **The 18-Token Quotability Rule**: The hero subheadline must summarize the core transformation in <= 18 words without filler syllables.
```

---

### Pillar 2: The 5-State Anti-Slop Copy Gate

Marketing copy fails when it relies on bloated AI adjectives or corporate buzzwords that say nothing. Every sentence must pass through the **5-State Anti-Slop Gate**:

| State | Anti-Pattern (Slop) | High-Converting Translation (Jasper Standard) |
| :--- | :--- | :--- |
| **State 1: Fluff Purge** | *"Our game-changing, next-gen, all-in-one platform supercharges your workflow."* | *"Automate client reporting and invoice delivery in under 60 seconds."* |
| **State 2: Concrete Specificity** | *"Significantly boost developer efficiency and save hours each week."* | *"Cuts PR review cycles from 4.2 hours to 18 minutes with automated lint and test checks."* |
| **State 3: User Superpower** | *"Featuring advanced multi-tenant cryptographic key isolation architecture."* | *"Ship client projects with zero fear of credential leaks or cross-tenant data exposure."* |
| **State 4: Friction Pre-Emption** | *"Sign up today to begin your journey."* | *"Start free in 2 minutes. No credit card required. Cancel anytime."* |
| **State 5: Answer-First Density** | *"In today's fast-paced digital ecosystem, companies struggle with..."* | *"Stop bleeding qualified leads to slow-loading forms."* |

---

### Pillar 3: Call-To-Action (CTA) Physics & Ergonomics

Buttons are the physical bridge between attention and revenue. Sub-optimal contrast or awkward placement directly suppresses conversion:

1. **Strict Contrast Compliance**:
   - **WCAG AAA Contrast**: Primary CTA text-to-background contrast ratio must measure **>= 7:1** (or minimum WCAG AA **>= 4.5:1**).
   - Never use low-contrast pastel buttons on white backgrounds (e.g., light yellow or pale gray).
2. **Mobile Thumb-Zone Reachability**:
   - On mobile devices (390px), interactive touch targets must reside within the natural sweep of the right and left thumb (the lower 40% of the viewport).
   - For high-intent landing pages, utilize a sticky mobile bottom CTA bar (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; padding: 12px 16px;`) with a minimum 48px touch height.
3. **Singular Visual Hierarchy**:
   - Exactly **one** primary CTA per viewport.
   - Secondary actions (e.g., "Watch 2-Min Demo", "View Documentation") must be styled as subtle ghost buttons or text links with lower visual weight.

---

### Pillar 4: Form Friction Reduction & Conversion Architecture

Every additional form field acts as a conversion tax. Research across B2B funnels proves that adding non-essential fields degrades submission rates:

- **The Field Penalty Law**: For top-of-funnel lead generation, cap total input fields at **<= 4** (e.g., *Work Email*, *First Name*, *Company Website*, *Project Budget*).
- **Progressive Disclosure**: For multi-step onboarding or complex inquiries, segment inputs into 2–3 low-friction micro-steps:
  - Step 1: Low-friction intent selection (single-click radio pills, 0 typing).
  - Step 2: Essential contact detail (*Work Email*).
  - Step 3: Confirmation and instant calendar schedule.
- **Inline Validation**: Provide instant, non-jarring feedback on field blur. Never wait until the user clicks "Submit" to flash red error messages across the screen.

---

### Pillar 5: Social Proof & Trust Architecture

Unsubstantiated claims trigger buyer skepticism. Position trust proof immediately adjacent to decision points:

- **CTA Trust Halo**: Place social proof within 24px of the primary CTA button:
  - *"★★★★★ 4.9/5 from 320+ agency founders"*
  - *"SOC-2 Type II Certified & GDPR Compliant"*
  - *"Zero credit card required • Instant 14-day access"*
- **Specific Customer Receipts**: Customer testimonials must name the author, their verified company, their title, and a specific metric outcome (e.g., *"Lifted our checkout conversion by 34% in 3 weeks"*). Generic quotes like *"Great platform!"* are classified as slop.

---

## 📊 CRO Quantitative Heuristic Scorecard (0–100 Scale)

Evaluate the target landing page across 5 core dimensions:

```markdown
### 🏆 CRO Evaluation Rubric

| Dimension | Weight | Evaluation Criteria |
| :--- | :--- | :--- |
| **1. Hero Value Density** | 25 pts | - Value proposition understood in <= 5 seconds<br>- Core transformation stated in <= 18 tokens<br>- Hero elements fully visible above 720px (desktop) / 580px (mobile) |
| **2. Anti-Slop Copy** | 20 pts | - Zero buzzwords ("all-in-one", "game-changing", "supercharge")<br>- Metrics and specific numbers used for outcomes<br>- Active user benefits prioritized over technical specs |
| **3. CTA Physics & A11y** | 20 pts | - Primary CTA contrast >= 7:1 (AAA) or >= 4.5:1 (AA)<br>- Button touch target height >= 48px on mobile<br>- Sticky mobile bottom bar or natural thumb-zone placement<br>- Single primary action per viewport |
| **4. Form & Friction** | 20 pts | - Form inputs capped at <= 4 fields for initial lead capture<br>- Inline validation on blur without disruptive layout shift<br>- Friction reducers present ("No credit card required", "Instant access") |
| **5. Trust & Social Proof**| 15 pts | - Trust halo present within 24px of primary CTA<br>- Quantified case proof with real names and metrics<br>- Security/compliance badges visible where financial data entered |

**Scoring Tiers**:
- **90–100**: Exceptional Conversion Architecture (Ready to scale paid traffic).
- **75–89**: Moderate Conversion Friction (Minor copy adjustments and CTA tuning needed).
- **< 75**: High Conversion Leakage (Immediate restructuring required before spending ad budget).
```

---

## Quality Gate

- [ ] Hero section passes the 5-Second Test with value proposition stated in <= 18 tokens.
- [ ] Copy passes the 5-State Anti-Slop Gate with zero unsubstantiated marketing adjectives.
- [ ] Primary CTA button achieves at least WCAG AA (>= 4.5:1) contrast, with AAA (>= 7:1) prioritized.
- [ ] Mobile touch target height measures >= 48px with thumb-zone ergonomics verified.
- [ ] Lead capture forms enforce <= 4 input fields or implement progressive disclosure.
- [ ] Social proof trust halo is positioned within 24px of primary conversion buttons.

---

## Routing

- **UI Layout & Design Token Implementation**: For implementing responsive layouts and OKLCH color palettes, route to `design:layout` or `design:tokens`.
- **High-Converting Sales Funnels & Checkout Architecture**: For multi-step funnel routing and checkout optimization, route to `webdev:funnel` or `growth:funnels`.
- **Copywriting & Headline Variants**: For generating AIDA/PAS headline variants, route to `content:copy`.
- **Micro-Delight & CTA Interactions**: For spring button physics and hover feedback, route to `animate:delight` or `animate:gsap`.
- **Analytics & Conversion Tracking**: For setting up Google Tag Manager, PostHog, or custom conversion event pipelines, route to `analytics:tracking`.
