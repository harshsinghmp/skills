# Sample Evidence Ledger: Acme Corp Website Redesign

> Auto-generated summary. Do not edit above the log line.

## Dashboard (regenerated)

| Metric              | Count |
| :------------------ | ----: |
| Total entries        |     7 |
| Decisions recorded   |     2 |
| Commitments tracked  |     3 |
| Verified claims      |     1 |
| Pending/Stale        |     2 |
| Health               |  71%  |

### Recent Activity (last 5)
- [2026-09-05] STATUS: Stripe webhook not configured in prod — `[RAW]` deploy logs
- [2026-09-02] CLAIM: Core Web Vitals green — `[RAW]` Lighthouse receipt
- [2026-08-28] COMMITMENT: SEO audit report due Sep 10 — `[RAW]` proposal
- [2026-08-20] COMMITMENT: Responsive homepage by Sep 1 — `[RAW]` Slack message
- [2026-08-15] DECISION: Next.js App Router over Pages Router — `[FETCH]` migration guide

### Stale / Attention Required
- [⚠️ OVERDUE] EVD-004: Blog CMS integration — deadline 2026-09-01, no delivery evidence
- [⚠️ ACTIVE 14d] EVD-007: Stripe webhook blocker — no update in 14 days

---

## Evidence Log (append-only)

<!-- DO NOT DELETE ENTRIES. Mark superseded with [SUPERSEDED by EVD-XXX]. -->

### EVD-001 | 2026-08-15 | DECISION
**Statement**: Chose Next.js App Router over Pages Router for the redesign
**Category**: `DECISION`
**Confidence**: `[FETCH]` — Next.js migration guide + Vercel performance benchmarks
**Epistemology**: `[EMPIRICAL]`
**Options Considered**:
  1. Pages Router — simpler mental model, but no React Server Components
  2. App Router — RSC, streaming, nested layouts (chosen)
  3. Remix — excellent DX but client team unfamiliar with it
**Trade-offs**: App Router has steeper learning curve and some ecosystem libraries lag support
**Evidence**: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
**Status**: `ACTIVE`

---

### EVD-002 | 2026-08-18 | DECISION
**Statement**: Chose Supabase over Firebase for auth and database
**Category**: `DECISION`
**Confidence**: `[FETCH]` — pricing comparison + Postgres requirement from client
**Epistemology**: `[EMPIRICAL]`
**Options Considered**:
  1. Firebase — fast setup, but NoSQL only and higher cost at scale
  2. Supabase — Postgres-native, row-level security, open source (chosen)
  3. Custom auth + PlanetScale — maximum control but higher dev cost
**Evidence**: https://supabase.com/pricing, client requirement doc (internal)
**Status**: `ACTIVE`

---

### EVD-003 | 2026-08-20 | COMMITMENT
**Statement**: Deliver responsive homepage by Sep 1
**Category**: `COMMITMENT`
**Confidence**: `[RAW]` — Slack message screenshot + proposal PDF section 3.2
**Promised To**: Jane Doe (Acme Corp, VP Marketing)
**Deadline**: 2026-09-01
**Delivery Evidence**: PR #42 merged 2026-08-29, deployed to staging https://staging.acme-redesign.dev
**Status**: `FULFILLED`

---

### EVD-004 | 2026-08-22 | COMMITMENT
**Statement**: Integrate headless CMS for blog section by Sep 1
**Category**: `COMMITMENT`
**Confidence**: `[RAW]` — proposal PDF section 4.1
**Promised To**: Jane Doe (Acme Corp, VP Marketing)
**Deadline**: 2026-09-01
**Delivery Evidence**:
**Status**: `OVERDUE`

---

### EVD-005 | 2026-08-28 | COMMITMENT
**Statement**: Deliver SEO audit report for current site by Sep 10
**Category**: `COMMITMENT`
**Confidence**: `[RAW]` — email confirmation from project kickoff
**Promised To**: Tom Chen (Acme Corp, Head of Growth)
**Deadline**: 2026-09-10
**Status**: `PROMISED`

---

### EVD-006 | 2026-09-02 | CLAIM
**Statement**: Core Web Vitals all green on staging — LCP <2.5s, CLS <0.1, INP <200ms
**Category**: `CLAIM`
**Confidence**: `[RAW]`
**Verification Receipt**: `npx unlighthouse --site https://staging.acme-redesign.dev` — LCP 1.8s, CLS 0.02, INP 145ms (run 2026-09-02T14:32Z)
**Epistemology**: `[EMPIRICAL]`
**Status**: `VERIFIED`

---

### EVD-007 | 2026-09-05 | STATUS
**Statement**: Payment integration blocked — Stripe webhook endpoint not configured in production environment
**Category**: `STATUS`
**Confidence**: `[RAW]` — deployment error logs, Stripe dashboard screenshot
**Blocking**: Checkout flow launch (milestone M3)
**Status**: `ACTIVE`
