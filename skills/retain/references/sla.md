# sla — Client Retainer SLAs, 30-Day Bug Warranty Governance, and Capacity Burn-Down

Airtight client service level agreement (SLA) management, post-launch 30-day warranty defense, bug vs enhancement triage gating, and monthly retainer capacity burn-down accounting. Enforces contractual boundaries so agency margins are never eroded by out-of-scope requests disguised as defects.

---

## Scope

- **30-Day Post-Launch Bug Warranty vs Retainer SLA**:
  - *Warranty (Complimentary)*: 30 calendar days from production launch. Covers only regressions and non-conformances with the approved SOW acceptance criteria.
  - *Monthly Retainer (Paid)*: Ongoing priority SLA, proactive maintenance, dependency updates, and feature enhancements.
- **The Bug vs Enhancement Triage Gate**:
  - Deterministic evaluation protocol: does the reported issue represent code failing its original specification, or a change in requirements?
- **Tiered Retainer Response & Resolution SLAs**:
  - P1 (Critical Outage): < 1h initial response, continuous remediation until resolved.
  - P2 (Degraded Core Flow): < 4h response, workaround within 8h.
  - P3 (Minor Defect / Task): < 24h response, scheduled in current or next sprint.
  - P4 (Cosmetic / Advisory): < 48h response, backlog refinement.
- **Retainer Capacity Burn-Down & Roll-Over Governance**:
  - Pacing meter: automated warnings at 50%, 80%, and 100% capacity consumption.
  - Roll-over hour cap: strictly limited to a maximum of 20% unused hours, expiring within 60 days (prevents sudden resource starvation).

---

## 🏛️ The Bug vs Enhancement Triage Gate

```
                     [Client Request Received]
                                │
                                ▼
           Did the system ever perform this behavior 
             according to signed acceptance criteria?
                                │
              ┌─────────────────┴─────────────────┐
              ▼ YES                               ▼ NO
   Did external conditions change?     Is this a defect or a new desire?
   (Third-party API, DNS, user error)             │
              │                                   ▼
        ┌─────┴─────┐                     [ENHANCEMENT / SCOPE CHANGE]
        ▼ YES       ▼ NO                          │
    [BILLABLE]    [WARRANTY BUG]                  ├── Paid Retainer Hour Burn
  Third-party    Fixed at Agency Expense          └── Change Order Quote
  triage fee      (If within 30 days)
```

### 1. Defect Invariant (Warranty Qualified)
An issue is classified as a warranty bug **only** if all 3 criteria are satisfied:
1. **Verifiable Non-Conformance**: The application behavior demonstrably violates the agreed SOW specification, Figma design, or accepted test suite.
2. **Deterministic Reproducibility**: The bug can be reliably reproduced in the staging or production environment with documented reproduction steps.
3. **Zero Environment Modification**: The defect is not caused by unauthorized client code modifications, third-party platform API breaking changes (e.g. Meta Graph API update), or hosting environment misconfiguration outside agency control.

### 2. Enhancement Invariant (Billable Scope)
Requests are immediately routed to billable retainer capacity if they involve:
- Alterations to accepted copy, layouts, typography, or styling after client sign-off.
- Support for browser versions or devices excluded in the original SOW.
- New integrations, schema changes, or additional analytical event tracking.
- Performance optimization beyond agreed Lighthouse benchmarks (e.g., chasing 100 from 92).

---

## ⏱️ Tiered Retainer Service Level Agreement (SLA) Matrix

| Priority Level | Classification Criteria | First Response SLA | Target Workaround / Fix | Retainer Burn Rate |
| :--- | :--- | :--- | :--- | :--- |
| **P1 — Critical** | Complete service outage, revenue funnel blocked (checkout down), data corruption | **< 1 hour** (24/7) | < 4 hours (Continuous until resolved) | 1.5x Multiplier |
| **P2 — Urgent** | Major feature impaired with no easy workaround (e.g., search broken), significant user impact | **< 4 hours** (Biz hours) | < 12 hours | 1.0x (Standard) |
| **P3 — Normal** | Minor functional bug, non-critical workflow glitch, routine content update | **< 24 hours** (Biz hours) | Next scheduled sprint release | 1.0x (Standard) |
| **P4 — Low** | Cosmetic flaw, copy polish, exploratory advisory, general inquiry | **< 48 hours** (Biz hours) | Backlog triage | 1.0x (Standard) |

---

## 📊 Monthly Retainer Capacity & Roll-Over Rules

To maintain predictable agency staffing and prevent end-of-year capacity spikes:

1. **The 20% Roll-Over Ceiling**:
   - A maximum of 20% of unused monthly retainer hours may roll over to the subsequent billing month.
   - *Example*: On a 40-hour/month retainer with 10 unused hours, exactly 8 hours roll over. The remaining 2 hours expire.
2. **60-Day Expiration Clock**:
   - Rolled-over hours must be consumed within 60 calendar days or they permanently lapse.
3. **Consumption Hierarchy**:
   - Current month contracted hours are burned first; rolled-over hours are consumed second.
4. **Capacity Warning Thresholds**:
   - **50% Burn**: Informational status in bi-weekly sync.
   - **80% Burn**: Formal notice sent to client sponsor alerting that remaining hours are reserved for P1/P2 incidents.
   - **100% Burn**: All non-critical work pauses until client approves an add-on hour pack at standard agency overage rate (+15%).

---

## 💬 Client Redirection Scripts

### Warranty Rejection (Redirect to Retainer / Change Order)
> *"Hi [Client Name], thank you for flagging this request regarding [Feature/Behavior]. We reviewed the signed milestone specification for Phase 1. The original acceptance criteria specified [Agreed Behavior], which is operating as designed. Adding [Requested Behavior] represents a functional enhancement. We would love to implement this for you! We can apply [X] hours from your active monthly retainer, or provide a standalone change order for $[Amount]. Let us know which approach you prefer!"*

### 80% Retainer Capacity Warning
> *"Hi [Client Name], heads-up that [Project Name]'s monthly retainer has reached 80% capacity ([X] of [Y] hours utilized) with [Z] days remaining in the billing cycle. To ensure adequate buffer remains for any high-priority P1/P2 needs, we recommend holding non-critical backlog tasks until [Date of Next Cycle]. If you'd like to accelerate additional features this month, we can activate an additional 10-hour pack. Let us know how you'd like to proceed!"*

---

## Quality Gate

- [ ] 30-day post-launch warranty timeline strictly tracked against production release date.
- [ ] Bug reports vetted against original signed SOW specification and acceptance criteria.
- [ ] P1–P4 severity correctly classified with matching response time commitments.
- [ ] Retainer burn-down tracked in real-time with 80% warning alerts fired.
- [ ] Unused hours capped at 20% roll-over with 60-day expiration policy applied.
- [ ] Out-of-scope requests diplomatically redirected to retainer hours or change orders.

---

## Routing

- Client dispute over scope or change request quotation → `client-comms:change-request`.
- Monthly retainer invoice generation and overage billing → `accounts:invoicing`.
- Quarterly value demonstration and retainer contract renewals → `retain:qbr`.
- Churn risk detected from low retainer utilization → `retain:churn-watch`.
