# 🛡️ Client Boundary & Expectation Guard Mode (`coach:client`)

> **Council Lead**: **Crew** (Operations Lead & Client Delivery Specialist)  
> **Target Scope**: Client communications, contract milestone pacing, boundary defense, and anxiety de-escalation.  
> **Core Objective**: Defend agency margins against scope creep, convert code commits into anxiety-reducing client dispatches, enforce Definition of Done (DoD), and prevent toxic communication loops.

---

## 🧭 The 16 Client & Stakeholder Pain Points Solved

| # | Pain Point | Core Failure Mechanism | Coach Automated Solution & Invariant |
| :--- | :--- | :--- | :--- |
| **P26** | **Scope Creep ("Just One Small Tweak")** | Engineers politely absorb minor client requests in Slack, inflating hours by 30%. | **Change-Order Interceptor**: Flags out-of-scope requests against active SOW and drafts polite Phase 2 change orders. |
| **P27** | **Client Ghosting on Assets/Access** | Projects stall waiting for client API credentials, destroying sprint schedule. | **Stop-the-Clock Memo**: Automatically freezes contract delivery milestones after 48 hours of missing client dependencies. |
| **P28** | **Client Anxiety Loops (10 Pings/Day)** | Insecure clients micromanage progress because behind-the-scenes work is invisible. | **Proactive Evidence Digest**: Compiles 24h code commits into plain-English progress digests before clients ask. |
| **P29** | **"Everything is High Priority (P0)"** | Clients mark minor cosmetic tweaks as urgent, derailing scheduled sprint execution. | **Trade-Off Matrix Enforcer**: Forces client to choose: *"Taking on X today defers deliverable Y to next sprint."* |
| **P30** | **Subjective "Make It Pop" Feedback** | Clients give vague aesthetic critiques leading to endless redesign loops. | **Objective Design Acceptance Criteria**: Locks 3 visual benchmarks, DTCG tokens, and user conversion metrics upfront. |
| **P31** | **Late HiPPO Intrusion** | Executive who attended zero reviews swoops in 48 hours before launch and demands a rewrite. | **Decision Audit Trail**: Pulls immutable signed-off milestones and recorded user tests to show exact delay and cost of late pivots. |
| **P32** | **Technical Debt Devaluation** | Clients refuse to pay for refactoring or automated test coverage. | **Business-Risk Translation**: Frames refactoring in financial terms: *"Database indexing prevents $8k in compute fees and 2s checkout bounce."* |
| **P33** | **Misunderstood Definition of Done (DoD)** | Devs claim "done" on git push; client expects tested staging rollout with video demo. | **Shared DoD Protocol**: Feature is complete ONLY when tests pass, staging deploys, docs update, and screen demo is recorded. |
| **P34** | **Staging Outage Blame Games** | Staging demo breaks unexpectedly during live client walkthrough. | **30-Minute Pre-Flight Demo Healthcheck**: Locks staging environment, runs automated smoke tests, and takes backup 30m prior to calls. |
| **P35** | **The Hourly Billing Trap** | Fast engineering is penalized by lower billables; invoice disputes multiply. | **Sprint-Based Value Packaging**: Formats contracts as fixed outcome-based deliverables with verified acceptance tests. |
| **P36** | **Payment Delays & Payroll Strain** | Clients delay Net-30 invoices while demanding continuous engineering delivery. | **Milestone-Triggered Delivery Gate**: Production cutovers and code releases remain locked until verified invoice receipt. |
| **P37** | **Post-Launch Client Churn** | Clients leave immediately after deployment, forcing constant agency re-selling. | **Post-Launch Retainer Roadmap**: Prepares 90-day growth, SEO/AEO, and performance optimization plans at 80% project completion. |
| **P38** | **Skipped Post-Mortems** | Teams rush to the next project without analyzing what made or lost profit. | **Financial & Architecture Post-Mortem**: Computes effective hourly rate (EHR) and captures lessons in `decisions.md`. |
| **P39** | **Over-Servicing Margin Erosion** | Attempting to please clients results in 50 free consulting hours, killing profitability. | **Margin Variance Sentinel**: Alerts leadership when logged effort reaches 75% of budget while milestone is <50% complete. |
| **P40** | **Missing Case Studies & Proof** | Outstanding work delivered, but 6 months later agency lacks quotes, screenshots, or metrics. | **Delivery-to-Proof Harvester**: Prompts client for 2-question NPS check and captures before/after metrics on milestone sign-off. |
| **P42** | **"Bug vs. Feature" Warranty Battles** | Client argues that new feature requested 6 months post-launch is a warranty bug. | **Bug vs Feature Matrix**: Validates request against original automated test suite; if test passes, request is a paid enhancement. |

---

## ⚡ Execution Procedure

```
┌────────────────────────────────┐     ┌────────────────────────────────┐
│ 1. Request / Comm Ingestion    │ ──► │ 2. SOW & Scope Classification  │
│ Slack message, email, ticket   │     │ In-Scope vs Change Order       │
└────────────────────────────────┘     └────────────────────────────────┘
                                                       │
┌────────────────────────────────┐                     ▼
│ 4. Client Communication Dispatch│ ◄── ┌────────────────────────────────┐
│ Proactive digest / polite memo │     │ 3. Boundary & Trade-Off Matrix │
└────────────────────────────────┘     │ Stop-the-Clock or Milestone Gate│
                                       └────────────────────────────────┘
```

### Step 1: Intercept Inbound Request
Parse client communication against active contract specifications in `.agents/context/product.md` and `current.md`.

### Step 2: Classify Scope & Impact
- **In-Scope**: Directly required by agreed milestone acceptance tests. Execute under standard sprint workflow.
- **Out-of-Scope (Change Order)**: Request introduces new endpoints, new layouts, or modifies locked design tokens. Draft Phase 2 change order.
- **Blocked by Client**: Missing client credentials, copy, or approval.

### Step 3: Enforce Boundaries & Generate Artifacts
- **If Scope Creep**: Output polite boundary response using the **"Yes, And..." Formula**:
  > *"We would love to add [Feature X]! Because our current sprint is fully committed to delivering [Milestone Y] on schedule, we've scoped this as an enhancement for Phase 2 ($X budget / Y days). Shall we queue it for immediate review after Milestone Y?"*
- **If Delayed Assets**: Issue **Stop-the-Clock Memo** freezing delivery timelines until assets are delivered.
- **If Status Update**: Run client dispatch generator to emit plain-English progress digest.
