# audit — Comprehensive financial hygiene, revenue leakage detection, and cost optimization.

## Scope

- Financial hygiene audits across internal agency books and client commercial accounts.
- Detection of recurring revenue leakage, zombie SaaS subscriptions, unbilled deliverables, and FX spread drag.
- Financial audit report with prioritized corrective actions and dollar impact projections.

## Deliverable

A Financial Hygiene Audit Scorecard identifying leakage vectors, gross margin corrections, and an immediate cost-cutting action matrix.

## Procedure

1. **The 5 Financial Leakage Vectors**:
   - **Vector 1: Zombie SaaS & Cloud Tooling**:
     - Enumerate all active subscriptions: Figma, GitHub, Linear, OpenAI, Anthropic, Vercel, Supabase, Google Workspace, AWS.
     - Audit seat utilization: Unassign inactive licenses and remove ex-contractor seats.
     - Eliminate feature overlap (e.g. paying for both Linear and ClickUp, or multiple AI writing tools).
   - **Vector 2: Unbilled Work & Creeping Milestones**:
     - Cross-examine completed Git commit logs against paid milestone invoices.
     - Identify features built and deployed that were never invoiced.
     - Calculate unbilled scope leakage: $\text{Unbilled Hours} \times \$150/\text{hr}$.
   - **Vector 3: Stalled AR & Bureaucratic Aging**:
     - Scan open Accounts Receivable for invoices older than 14 days.
     - Audit why payments are delayed (missing vendor form, wrong PO, forgotten follow-up).
     - Calculate the cost of delayed capital: every $10,000 stalled for 60 days strains operating runway.
   - **Vector 4: Payment Gateway & FX Spread Drag**:
     - Audit merchant fees and settlement lags across **Stripe, Razorpay, Cashfree, PayU, and Paytm**.
     - *Unclaimed Gateway GST/ITC*: Domestic gateways (Razorpay, Cashfree, PayU, Paytm) levy 18% GST on top of their 1.75%–2% processing fees. If monthly GST invoices from gateways are not downloaded and filed, the agency forfeits valuable Input Tax Credits (`1200 ITC`).
     - *Rail Optimization*: Route large domestic B2B client transfers through Cashfree AutoCollect or Razorpay Smart Collect virtual bank accounts (zero or negligible flat fee) instead of card payment gateways (2% MDR + 18% GST).
     - *Cross-Border Card Drag*: Stripe charges up to 1.5% extra for international cards + 2% FX conversion markup. High-value international retainers (> $3,000) should be settled via direct ACH / SWIFT wire or Wise into multi-currency accounts.
   - **Vector 5: Contractor Margin Distortion**:
     - Check whether contractor payouts are assigned to specific client accounts or dumped into generic overhead.
     - Fix misallocated costs to reveal the true profitability of every client engagement.

2. **Audit Scorecard & Priority Action Matrix**:

   | Leakage Vector | Monthly Waste | Annualized Drag | Immediate Remedy (24h) |
   |:---|:---|:---|:---|
   | **Zombie SaaS Subscriptions** | $250 – $1,000 | $3,000 – $12,000 | Cancel unused seats; consolidate duplicate tool stacks. |
   | **Unbilled Milestone Scope** | $1,000 – $5,000 | $12,000 – $60,000 | Issue retroactive Change-Order true-up invoice before deployment. |
   | **Payment Gateway & FX Drag** | $300 – $1,500 | $3,600 – $18,000 | Shift domestic B2B to AutoCollect; switch international >$3K to ACH/Wire; claim gateway GST ITC. |
   | **Aging Invoices (>14d)** | Variable | Liquidity Risk | Deploy automated T+7 and T+14 stop-work dunning ladder. |

3. **Remediation Execution Protocol**:
   - **Day 1 (Immediate Cuts)**: Cancel all unassigned software seats; issue overdue dunning notices with one-click payment links.
   - **Day 7 (Structural Fixes)**: Update all active SOWs to enforce 50% upfront deposits and Net 14 terms.
   - **Day 30 (Portfolio Realignment)**: Review client gross margins via `client-pnl`; schedule 15-20% rate adjustments for accounts under 50% margin.

## Quality gate

- [ ] All 5 leakage vectors systematically reviewed with evidence.
- [ ] Dollar drag quantified across monthly and annualized run rates.
- [ ] Immediate 24-hour cost reduction actions defined.
- [ ] Overdue invoices queued for dunning sequence escalation.

## Routing

- Out-of-scope work billing → `invoicing` / `client-pnl` mode.
- Cash reserve sizing and runway preservation → `cashflow` mode.
- Contractor cost categorization → `bookkeeping` mode.

## Sources

- `EveryInc/charlie-cfo-skill` — Bootstrapped CFO cost containment and capital efficiency.
- `indranilbanerjee/digital-marketing-pro` — Agency operational audit and revenue leakage frameworks.
