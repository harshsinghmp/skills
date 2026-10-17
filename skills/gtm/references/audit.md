# audit — gtm audit mode

## When to Use

- **Launch-readiness audit**: Verify all GTM assets present, channels wired, pricing/payments flow works.
- **Messaging & anti-puffery audit**: Eliminate marketing fluff, enforce provable metrics, and verify consistency across all surfaces.
- **Developer quickstart audit**: Audit time-to-first-value (< 15 min), install ergonomics, and code snippets.
- **Evidence validation gate**: Verify all claims in `./.agents/context/product.md` are tagged `[validated]` or `[assumption]`.

---

## Checklist

### 1. Launch & Infrastructure Readiness
- [ ] Landing page live, responsive, and matches approved design.
- [ ] Pricing page and payment integration tested end-to-end.
- [ ] Email sequence wired and deliverability tested (welcome → nurture → convert).
- [ ] Social profiles and GitHub repository updated with launch messaging.
- [ ] Analytics events firing correctly (see `analytics` audit).
- [ ] SEO fundamentals in place (see `seo` audit).

### 2. Developer Quickstart & Time-to-First-Value (TTFV)
- [ ] Single install command or clone command visible above the fold on homepage and README.
- [ ] Quickstart verified: a clean terminal clone reaches working local execution in under 15 minutes.
- [ ] Copy-paste code snippets provided with real language syntax highlighting (no pseudo-code).
- [ ] Prerequisites (Node version, package managers, API keys) explicitly documented before step 1.

### 3. Anti-Puffery & Credibility Gate
- [ ] Zero unprovable superlatives: banned words (*"powerful"*, *"seamless"*, *"next-gen"*, *"revolutionary"*, *"best-in-class"*) replaced with concrete metrics.
- [ ] Value proposition states clear quantified delta (e.g., *"cut deploy time from 45 min to 6 min"*).
- [ ] The developer is positioned as the hero; the product is positioned as the tool/advisor.
- [ ] Em-dashes stripped from developer copy to avoid robotic cadence.

### 4. Evidence & Assumptions Audit
- [ ] `./.agents/context/product.md` audited: zero untagged claims. Every claim carries `[validated]` or `[assumption]`.
- [ ] Critical load-bearing assumptions routed to `gtm:discovery` for TAB customer validation.

---

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Payment flow broken | `PROPOSE-DIFF` | `qa-launch` (block launch) |
| Landing page not live | `AUTO-REPAIR` | `webdev` |
| Developer TTFV > 15 min | `PROPOSE-DIFF` | `webdev:docs` / `new-project` |
| Unprovable fluff / puffery detected | `AUTO-REPAIR` | `content:copy` / `humanize` |
| Email sequence not wired | `AUTO-REPAIR` | `content` |
| Analytics events not firing | `REPORT-ONLY` | `analytics` audit |
| Untagged product claims | `AUTO-REPAIR` | `gtm:discovery` |
| Launch checklist incomplete | `REPORT-ONLY` | `secretary` (approval gate) |

---

## Output

`.agents/artifacts/audit-gtm-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
