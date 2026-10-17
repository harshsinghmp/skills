# audit — Brand Readiness Gate & Completeness Auditor

> **Operating Principle**: Never allow an agency delivery team (designers, engineers, copywriters, media buyers) to begin work on half-baked client assets or missing technical access. Starting prematurely creates context thrashing, conflicting assumptions, and expensive late-stage rewrites. The Brand Readiness Audit is the mandatory quality gate that certifies completeness before execution commences.

---

## The 50-Checkpoint Brand Readiness Scorecard

Evaluate client onboarding across 5 critical dimensions (10 points each, 50 points total):

### Dimension 1: Executive & Business Model (10 Points)
- [ ] 1.1 Legal entity name and registered jurisdiction documented.
- [ ] 1.2 Primary economic buyer and day-to-day point of contact identified.
- [ ] 1.3 Core business model and revenue mechanics clearly understood.
- [ ] 1.4 Target customer avatar (ICP) role, company size, and industry defined.
- [ ] 1.5 Primary customer pain point articulated in the user's authentic words.
- [ ] 1.6 Product's proprietary mechanism / unique value proposition articulated.
- [ ] 1.7 Current pricing tiers, packages, and billing terms documented.
- [ ] 1.8 Top 4 customer objections (Price, Effort, Trust, Fit) identified.
- [ ] 1.9 Direct competitors (3) and aspirational benchmarks (1) cataloged.
- [ ] 1.10 Key 90-day business metric / North Star KPI defined.

### Dimension 2: Visual Identity & Design Assets (10 Points)
- [ ] 2.1 Primary vector logo (`.svg` or `.ai`) available in light and dark variants.
- [ ] 2.2 Secondary marks, logomarks, favicons, and app icons available.
- [ ] 2.3 Primary and secondary brand color codes (HEX and OKLCH) defined.
- [ ] 2.4 Neutral surface, background, and text color tokens documented.
- [ ] 2.5 Primary display and body typography font families identified with webfont sources.
- [ ] 2.6 Photography, illustration, and graphic style guidelines established.
- [ ] 2.7 Existing brand guidelines document or design system reviewed.
- [ ] 2.8 Customer quotes, case study receipts, and logo wall assets cataloged.
- [ ] 2.9 Product screenshots or live demo recordings captured.
- [ ] 2.10 Forbidden visual cliches and competitor tropes cataloged.

### Dimension 3: Technical Architecture & Repositories (10 Points)
- [ ] 3.1 Primary production domain and staging subdomains documented.
- [ ] 3.2 DNS provider identified and nameserver management verified.
- [ ] 3.3 Core tech stack (frontend, backend, database) confirmed.
- [ ] 3.4 CMS architecture (WordPress, Payload, Shopify, or static) confirmed.
- [ ] 3.5 Code repositories (GitHub/GitLab) accessible with PR branch rules set.
- [ ] 3.6 Hosting environment (Cloudflare, Vercel, AWS) confirmed.
- [ ] 3.7 Local development setup instructions and test suite verified.
- [ ] 3.8 Third-party API integrations and webhooks inventoried.
- [ ] 3.9 Performance budgets (LCP $\le 1.8\text{s}$, CLS $\le 0.05$) approved.
- [ ] 3.10 Privacy Policy, Terms, and legal compliance disclaimers verified.

### Dimension 4: Account Access & Zero-Leak Delegation (10 Points)
- [ ] 4.1 Meta Business Portfolio Partner Access verified (Ad Account, Pixel, Page).
- [ ] 4.2 Google Ads CID linked via Agency Manager Account (MCC).
- [ ] 4.3 Google Tag Manager (GTM) Container access verified at Administrator level.
- [ ] 4.4 Google Analytics 4 (GA4) Property access verified at Editor level.
- [ ] 4.5 GitHub organization or repository Collaborator access confirmed.
- [ ] 4.6 Cloudflare account member access confirmed with DNS/Pages roles.
- [ ] 4.7 Stripe/Razorpay team member access confirmed at Developer/Analyst role (zero Owner).
- [ ] 4.8 TikTok/LinkedIn ad accounts delegated (if applicable to campaign).
- [ ] 4.9 Zero plaintext passwords or raw secret tokens received or stored.
- [ ] 4.10 Active access ledger recorded in `.agents/context/accounts-access-matrix.md`.

### Dimension 5: Cross-Department Execution Briefs (10 Points)
- [ ] 5.1 Master Brand Dossier compiled in `.agents/context/brand.md`.
- [ ] 5.2 Tailored Design Brief generated for `design` team.
- [ ] 5.3 Tailored Engineering Brief generated for `webdev` team.
- [ ] 5.4 Tailored Copywriting & Messaging Brief generated for `content` and `smm`.
- [ ] 5.5 Tailored Acquisition Brief generated for `paidads` team.
- [ ] 5.6 Viewport and browser matrix defined for `qa-launch` team.
- [ ] 5.7 Approved claims library verified (zero unverified statistics).
- [ ] 5.8 Banned vocabulary list established.
- [ ] 5.9 Target copywriting formulas assigned from `content:copy`.
- [ ] 5.10 Downstream team leads signed off on brief completeness.

---

## Readiness Scoring & Operational Verdict

Run the automated audit script:
```bash
bun brand/scripts/intake-audit.ts
```

| Score Threshold | Verdict | Action |
|:---|:---|:---|
| **45–50 Points ($\ge 90\%$)** | `READY_FOR_BUILD` | **Green Gate**: Fully certified. Unblock Agency Council and begin delivery. |
| **35–44 Points ($70–89\%$)** | `NEEDS_CLARIFICATION` | **Yellow Gate**: Pause execution. Generate targeted clarification questions for missing fields. |
| **$< 35$ Points ($< 70\%$)** | `BLOCKED_INCOMPLETE` | **Red Gate**: Critical blocker. Intake severely deficient. Require formal discovery session. |

---

## Automatic Clarification Prompt Generator

When the audit scores in the `NEEDS_CLARIFICATION` tier, the auditor automatically extracts all unchecked items, groups them by topic, and produces a ready-to-send interactive clarification request for the client:

```markdown
### ⚠️ Action Required: Missing Brand Discovery Parameters
Before our design and development teams can start production, please resolve the following missing items:
1. **Visual Assets**: Please provide the high-resolution vector logo (.svg) for dark backgrounds.
2. **Access Delegation**: Please accept the pending Google Ads MCC link request sent to CID: `123-456-7890`.
3. **Typography**: Confirm if we should license the webfont for your primary heading font or use Google Fonts equivalent.
```

---

## Quality Gate

- [ ] All 50 checkpoints evaluated against project evidence.
- [ ] Quantitative score and formal verdict (`READY_FOR_BUILD`, `NEEDS_CLARIFICATION`, or `BLOCKED`) recorded.
- [ ] Missing items mapped to concrete clarification questions.
- [ ] Audit report saved to `.agents/artifacts/brand/readiness-audit.md`.
