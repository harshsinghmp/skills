# cashflow — Cash flow forecasting, runway preservation, and reserve buffers.

## Scope

- 13-week rolling cash flow forecasting and liquidity management for the agency and its clients.
- Days Sales Outstanding (DSO) measurement and AR aging compression.
- Cash runway sizing and 3-to-6 month operating reserve buffers grounded in bootstrapped CFO principles.

## Deliverable

A 13-week rolling cash flow forecast model, Runway & Burn rate scorecard, DSO calculation, and segregated capital reserve allocation rules.

## Procedure

1. **Bootstrapped CFO Cash Invariants**:
   - *Cash is Oxygen*: A business can operate for quarters with accounting losses, but it collapses the hour it cannot clear payroll or contractor invoices.
   - *Paper Profit ≠ Bank Cash*: Accounts Receivable on an accrual ledger does not pay server bills. Never spend revenue before the funds have settled into primary checking.
   - *Segregated Capital Discipline*: Enforce strict three-account segregation:
     1. **Operating Account**: Working capital for approved monthly OPEX and settled contractor fees.
     2. **Tax Reserve Sub-Account**: Non-negotiable 20%–25% sweep of net receipts; untouchable for operational spending.
     3. **Profit & Cushion Reserve**: Retained earnings accumulating 3–6 months of fixed operating expenses.

2. **13-Week Rolling Cash Flow Forecast**:
   Build an active rolling 13-week cash waterfall updated every Monday morning:
   ```
   [Week Start Cash]
     + Confirmed Client Inflows (Retainers + Cleared Milestones)
     - Fixed Overhead (SaaS, rent, accounting, internal draws)
     - Direct Delivery Payouts (Approved contractor invoices, cloud compute)
     - Tax Reserve Sweep (20% of net margin)
   = [Week Ending Cash Balance]
   ```
   *Forecasting Rule*: Never count prospective deals or un-signed proposals as cash inflows. Discount pipeline proposals by 100% until a binding SOW is executed and the upfront deposit invoice is paid.

3. **Cash Runway & Burn Rate Analysis**:
   $$\text{Gross Monthly Burn} = \text{Total Monthly Fixed OPEX} + \text{Baseline Contractor Retainers}$$
   $$\text{Net Monthly Burn} = \text{Gross Monthly Burn} - \text{Predictable Recurring Retainer Inflows}$$
   $$\text{Cash Runway (Months)} = \frac{\text{Current Unencumbered Operating Cash}}{\text{Net Monthly Burn}}$$
   - **Green Zone (≥ 6 Months)**: Secure posture. Agency can invest in internal R&D, new skill extraction, or client acquisition.
   - **Yellow Zone (3 – 5 Months)**: Caution posture. Restrict speculative tool spending; compress contractor commitments.
   - **Red Zone (< 3 Months)**: Capital preservation mode. Halt all non-essential SaaS; require 100% upfront deposits on all new projects.

4. **Days Sales Outstanding (DSO) Compression**:
   $$\text{DSO} = \frac{\text{Accounts Receivable}}{\text{Total Credit Invoiced (Last 90 Days)}} \times 90$$
   - **Target**: **≤ 14 Days**.
   - If DSO exceeds 30 days: Cash is trapped in client procurement bureaucracy. Mandate auto-debit credit card authorization (via Stripe) or ACH pre-authorization before delivering code.

## Quality gate

- [ ] Cash forecast built on confirmed deposits and signed retainers only (zero phantom pipeline).
- [ ] Tax reserve sweep (20-25%) modeled before determining free cash flow.
- [ ] Minimum 3-month operating reserve buffer maintained.
- [ ] Days Sales Outstanding (DSO) tracked and kept under 14 days.

## Routing

- Invoice drafting and dunning follow-ups → `invoicing` mode.
- Retainer contract renewals and expansion → `retain` / `growth`.
- Operational budget allocations and contractor management → `ops`.

## Sources

- `EveryInc/charlie-cfo-skill` — Bootstrapped CFO financial management, cash runway formulas, and capital allocation.
