# client-pnl — Client profitability, project gross margins, and Effective Hourly Rate (EHR).

## Scope

- Measuring real project and client profitability across fixed-fee milestones, ongoing retainers, and T&M engagements.
- Calculating direct delivery gross margins and Effective Hourly Rate (EHR).
- Detecting scope-creep margin erosion and framing financial billing adjustments.

## Deliverable

A Client P&L Scorecard with Gross Margin percentage, EHR realization rate, and recommended billing adjustments or contract adjustments.

## Procedure

1. **Client Gross Margin Formula & Benchmarks**:
   $$\text{Client Gross Margin} = \frac{\text{Client Recognized Revenue} - \text{Direct Project Costs}}{\text{Client Recognized Revenue}} \times 100$$
   *Direct Project Costs include*: Subcontractor developer/designer fees, dedicated API tokens (OpenAI, Anthropic, ElevenLabs), project-scoped cloud compute/databases (Supabase, Neon, AWS), and payment gateway processing fees.

   | Margin Tier | Status | Action Mandate |
   |:---|:---|:---|
   | **≥ 70%** | **Optimal** | Core agency profit engine. Document operational efficiency pattern for team reuse. |
   | **60% – 69%** | **Healthy** | Target agency standard. Monitor scope adherence during sprint milestones. |
   | **50% – 59%** | **Warning Zone** | Margin compression detected. Audit meeting overhead and contractor allocations. |
   | **< 50%** | **Red Alert** | Unprofitable client account. Halt uncontracted tasks; initiate scope review or price correction. |

2. **Effective Hourly Rate (EHR) Calculation**:
   $$\text{EHR} = \frac{\text{Total Net Contract Value}}{\text{Total Delivery Hours (Internal Principal + Specialist Contractors)}}$$
   - *Benchmark*: Minimum target **$150/hr** across full-stack agency deliverables.
   - Fixed-price projects and monthly retainers must track total actual hours logged.
   - If a $10,000 fixed-price project absorbs 100 total hours, realized EHR drops to $100/hr. If it finishes in 40 hours, EHR accelerates to $250/hr.

3. **Scope-Creep Margin Erosion Detection & Pricing True-Up**:
   - Detect "invisible leakage": Endless unbilled revisions, unscheduled Slack ping storms, and out-of-scope feature requests disguised as "minor tweaks".
   - *Rule of 10%*: Any feature request exceeding 10% of the milestone delivery budget requires a formal Change-Order billing adjustment:
     $$\text{Change-Order Fee} = \text{Estimated Scope Hours} \times \text{Target EHR Floor (\$150)} \times 1.25\,(\text{Sprint Interruption Premium})$$

4. **Client Portfolio Matrix (Margin vs Friction)**:
   - **Stars (High Margin, Low Friction)**: Fast approvals, clear briefs, prompt payments. Prioritize roadmap, explore expansion upsells.
   - **Workhorses (High Margin, High Friction)**: Profitable but exhausting. Enforce strict single-point-of-contact Slack boundaries.
   - **Vulnerable (Low Margin, Low Friction)**: Friendly but underpriced. Implement 15–20% rate increase at contract renewal.
   - **Drains (Low Margin, High Friction)**: Scope creepers, late payers, emergency culture. Prepare offboarding or double pricing to create natural exit.

## Quality gate

- [ ] All direct contractor, API, and dedicated infrastructure costs assigned directly to the client ledger before calculating gross profit.
- [ ] Realized Effective Hourly Rate (EHR) compared against the $150/hr floor.
- [ ] Scope creep additions exceeding 10% routed to formal Change-Order billing.
- [ ] Unprofitable accounts (< 50% gross margin) identified with concrete remediation plan.

## Routing

- Change-order scope definition and SOW updates → `ops` (milestone mode).
- Rate increases and contract renegotiation conversations → `client-comms` / `retain`.
- Pricing tier restructuring and packaging → `growth` (pricing mode).

## Sources

- `EveryInc/charlie-cfo-skill` — Unit economics, Effective Hourly Rate realization, and margin floors.
- `indranilbanerjee/digital-marketing-pro` — Client profitability benchmarking and agency account tiering.
