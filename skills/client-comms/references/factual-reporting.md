# factual-reporting — Factual Daily, Sprint & Milestone Progress Reporting

## Scope

- Compiling fragmented development activity into comprehensive, credible, and review-ready client progress reports.
- Grounding all reporting strictly in verifiable facts (Git commit history, closed issue tickets, automated test passes, and deployment logs).
- Eliminating common agency reporting pitfalls: hallucinated working hours, unverified completion percentages, and vague buzzwords.
- Supporting daily standups, weekly sprint summaries, and formal client milestone sign-off briefs.

## Deliverable

A structured, audit-proof Markdown report detailing verified completions, active in-progress tasks, known risks, and committed next actions.

## Principles of Factual Reporting

1. **Evidence Precedes Claims**:
   - Every listed achievement must point to a tangible artifact (e.g. Git commit hash, test run result, or staging URL).
   - Never report a feature as "Done" if it hasn't passed verification tests.
2. **Strict Granular Separation**:
   - Present each substantive deliverable independently: state *what was built*, *the verified result*, and *the operational impact*.
   - Never compress 5 distinct tasks into a vague sentence like "worked on backend improvements".
3. **Transparent Risk & Blocker Disclosure**:
   - If an item is blocked by third-party API delays, missing client credentials, or unexpected technical hurdles, state it plainly with the exact decision needed to unblock it.
   - Do not sweep obstacles under the rug until the deadline.
4. **Distinguish Verified Done vs In Progress vs Proposed**:
   - Recommendations are proposals, not agreed commitments.
   - Separate verified facts from pending client approvals.

---

## Standard Client Milestone & Daily Report Template

```markdown
# 📋 Sprint Progress Report: [Project Name]
**Period**: [Start Date] to [End Date] | **Author**: Agency Delivery Team (Crew)

### 1. ✅ Completed & Verified Deliverables
- **Deliverable 1**: Integrated Cashfree AutoCollect dynamic virtual accounts.
  - *Verification*: Automated webhook integration test passed (25/25 assertions).
  - *Impact*: Client invoices now auto-reconcile in real time upon bank wire receipt.
- **Deliverable 2**: Resolved mobile navbar z-index clipping bug.
  - *Verification*: Tested on iOS Safari & Android Chrome staging builds (`commit 8a85c47`).

### 2. 🔄 Currently In Progress
- **Item 1**: Optimizing database connection pool under simulated 200 req/s load.
  - *Status*: Baseline benchmarks captured (p99: 140ms); tuning `max_connections` to target <80ms.

### 3. ⚠️ Risks & Decisions Required From Client
- **Decision Needed**: Stripe international card fees vs ACH bank transfer routing.
  - *Context*: High-value retainers (> $3,000) incur 1.5% international card fees.
  - *Recommendation*: Enable direct ACH wire routing to save an estimated $450/month in processing drag.

### 4. 🎯 Committed Next Steps (Next 48 Hours)
- Deploy Sprint 3 build to client staging environment.
- Issue Milestone 2 completion report and Net-14 deposit invoice.
```

## Quality Gate

- [ ] Every "Completed" item verified with a commit hash, test run, or deployment proof.
- [ ] No speculative hours or estimated completion percentages without empirical data.
- [ ] Known blockers and risks clearly documented with explicit unblocking steps.
- [ ] Client feedback requests formulated as concrete, decision-ready options.

## Routing

- Client contract scopes and SOW delivery tracking → `ops` (milestone mode).
- Invoice generation and payment collection → `accounts` (invoicing mode).
- Executive strategy summaries for C-level stakeholders → `support-executive-summary-generator`.
