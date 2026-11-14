# bookkeeping — Chart of Accounts, double-entry classification, and monthly closing.

## Scope

- Double-entry ledger management and Chart of Accounts (COA) tailored for modern software development, product engineering, and digital agencies.
- Real-time payment gateway clearing across **Stripe, Razorpay, Cashfree, PayU, and Paytm** without reliance on legacy desktop suites (QuickBooks/Xero).
- The **OpenAccountants Three-Outcome Classification Protocol** (`CLASSIFIED`, `ASSUMED`, `NEEDS INPUT`).
- Distinction between Direct Project Costs (COGS) and General Overhead (OPEX), including gateway MDR and Input Tax Credit (ITC).
- Monthly close checklist, transaction reconciliation, and standardized Working Paper audit trails.

## Deliverable

A standardized Chart of Accounts taxonomy with multi-gateway sub-ledgers, double-entry journal schemas, the OpenAccountants Working Paper deliverable, and a 5-step monthly financial closing checklist.

## Procedure

1. **Agency Standard Chart of Accounts (COA)**:
   - `1000–1999 Assets`:
     - `1010` Primary Operating Checking (Operating Capital).
     - `1020` Tax Reserve Savings (Locked sub-account, 20-25% of net revenues).
     - `1030` Payment Gateway Clearing (Control Account):
       - `1031` Stripe Clearing (USD / Cross-border Card & ACH Settlement).
       - `1032` Razorpay Clearing (Domestic Cards, NetBanking, UPI).
       - `1033` Cashfree Clearing & AutoCollect Virtual Accounts (Real-time NEFT/IMPS/UPI reconciliation).
       - `1034` PayU Clearing (Domestic & Enterprise Card Settlement).
       - `1035` Paytm Gateway Clearing (UPI Intent, QR & Wallet Settlement).
     - `1100` Accounts Receivable (Invoiced client amounts awaiting payment).
     - `1200` GST / Tax Input Credit (ITC receivable on gateway fees, SaaS tools, and domestic vendor bills).
   - `2000–2999 Liabilities`:
     - `2010` Accounts Payable (Pending contractor invoices, vendor bills).
     - `2020` Deferred Revenue (Unearned client upfront deposits awaiting milestone completion).
     - `2030` Sales Tax / GST / VAT Payable (Collected taxes held in trust).
     - `2040` TDS Payable (Tax Deducted at Source on contractor/professional payouts e.g. 194J/194C).
   - `3000–3999 Equity`:
     - `3010` Principal / Partner Contributed Capital.
     - `3020` Retained Earnings (Compounded profits).
     - `3030` Principal Draws / Distributions.
   - `4000–4999 Revenue`:
     - `4010` Custom Web & Software Engineering Revenue.
     - `4020` Ongoing Retainers & Maintenance Revenue.
     - `4030` Strategic Advisory & Growth Consulting.
   - `5000–5999 Direct Cost of Goods Sold (COGS)`:
     - `5010` Subcontractor & Specialist Contractor Delivery Fees.
     - `5020` Dedicated Client Cloud & API Infrastructure (OpenAI tokens, AWS/Vercel project hosting).
     - `5030` Merchant Payment Processing Fees & Gateway MDR:
       - `5031` Stripe Processing Fees & FX Spread (~2.9% + $0.30 / 1.5% international spread).
       - `5032` Razorpay Gateway MDR (Standard 2% + 18% GST).
       - `5033` Cashfree Gateway & AutoCollect Fees (1.75%–2% / UPI MDR).
       - `5034` PayU Processing Fees.
       - `5035` Paytm Gateway Fees.
   - `6000–6999 Operating Expenses (OPEX)`:
     - `6010` Core Agency Software Subscriptions (Figma, GitHub, Linear, Google Workspace).
     - `6020` Legal, Accounting & Professional Fees.
     - `6030` Agency Growth, Brand & Paid Acquisition.
     - `6040` Bank Charges & Wire Transfer Fees.

2. **OpenAccountants Three-Outcome Classification Protocol**:
   Every transaction, invoice, or expense classification must resolve to one of three explicit epistemic outcomes:
   - **`1. CLASSIFIED` (Definitive)**:
     - All material facts present (date, counterparty, purpose, GSTIN/Tax ID, gateway trace).
     - Directly mapped to verified statutory rule and COA code.
     - *Example*: Stripe client retainer invoice with international billing address and LUT declaration mapped to `4020` (Revenue) + Zero-Rated GST.
   - **`2. ASSUMED` (Disclosed Conservative Default)**:
     - Minor edge facts ambiguous, but standard commercial practice dictates a conservative position.
     - The assumption is explicitly logged in the working paper notes.
     - *Example*: Software tool used across agency and client projects classified as `6010 OPEX` unless client contract explicitly mandates reimbursement.
   - **`3. NEEDS INPUT` (Gated Stop)**:
     - Critical material determinant is missing that alters tax liability or revenue recognition.
     - The agent **refuses to guess** and issues a precise, targeted clarification prompt with the exact two alternative consequences.
     - *Example*: Domestic client paid invoice without providing GSTIN — stop to ask whether to treat as B2B (with GST credit) or unregistered B2C.

3. **OpenAccountants Standardized Working Paper Schema**:
   All reconciliation deliverables must adhere to this structured working paper format:
   ```markdown
   | Field | Value |
   |:---|:---|
   | **Working Paper Ref** | `WP-YYYYMM-XXXX` |
   | **Transaction Date** | `YYYY-MM-DD` |
   | **Payment Gateway / Rail**| Stripe / Razorpay / Cashfree / PayU / Paytm / Wire |
   | **Gateway Reference ID** | `ch_...` / `pay_...` / `cf_...` / `payu_...` / `order_...` |
   | **Counterparty** | Client / Vendor Legal Name |
   | **Gross Amount** | Cur $XX,XXX.XX |
   | **Gateway MDR / Fee** | Cur $XX.XX (Account `5030`) |
   | **Taxes on Fee (GST/ITC)**| Cur $XX.XX (Account `1200` ITC) |
   | **Net Bank Deposit** | Cur $XX,XXX.XX (Account `1010`) |
   | **Classification Code** | COA Code (e.g. `2020 Deferred Revenue` or `4010 Revenue`) |
   | **Statutory Scope** | Domestic GST / Export of Services (LUT) / Reverse Charge |
   | **Epistemic Outcome** | `CLASSIFIED` / `ASSUMED` / `NEEDS INPUT` |
   | **Audit Notes / Assumptions**| Explicit disclosures or regulatory citation |
   ```

4. **Core Double-Entry Transactions**:
   - *Client Pays 50% Deposit ($10,000 via Cashfree AutoCollect / Razorpay Smart Collect)*:
     - `DEBIT` 1033 Cashfree Clearing / 1032 Razorpay Clearing: +$9,800
     - `DEBIT` 5033 Cashfree Fees (COGS): +$169.50
     - `DEBIT` 1200 GST Input Tax Credit (ITC on fee @ 18%): +$30.50
     - `CREDIT` 2020 Deferred Revenue: +$10,000 *(Never recognize revenue before work is delivered)*.
   - *Milestone Delivered & Approved by Client*:
     - `DEBIT` 2020 Deferred Revenue: -$10,000
     - `CREDIT` 4010 Custom Engineering Revenue: +$10,000 *(Earned revenue recognized)*.
   - *Subcontractor Developer Bills Agency for Milestone ($3,000 disbursed via Cashfree Payouts / RazorpayX)*:
     - `DEBIT` 5010 Subcontractor Fees (COGS): +$3,000
     - `CREDIT` 2040 TDS Payable (e.g. 10% under 194J): +$300
     - `CREDIT` 1010 Operating Checking: -$2,700.

5. **5-Step Monthly Financial Close Protocol**:
   - **Step 1 (Gateway Zero-Out)**: Reconcile Stripe, Razorpay, Cashfree, PayU, and Paytm settlement reports against primary bank deposits (`1010`). Zero out clearing accounts (`1031–1035`) and book MDR fees to `5031–5035` and ITC to `1200`.
   - **Step 2 (AR Aging Audit)**: Verify open Accounts Receivable (`1100`); trigger dunning for anything >14 days past due.
   - **Step 3 (Deferred Revenue True-Up)**: Shift completed project deposits from `2020 Deferred Revenue` to `4000 Revenue`.
   - **Step 4 (Contractor Payouts)**: Settle approved AP (`2010`) via Cashfree Payouts / RazorpayX, confirm TDS deductions (`2040`), and log corresponding tax reporting files (W-9/W-8BEN/Form 16A).
   - **Step 5 (Tax Reserve Lock)**: Calculate month's Net Operating Profit and sweep 20–25% from `1010 Operating Cash` into `1020 Tax Reserve`.

## Quality gate

- [ ] All direct delivery costs (contractors, project APIs, payment fees) classified under COGS (`5000`), not OPEX (`6000`).
- [ ] Upfront deposits held in Deferred Revenue until client deliverable is approved.
- [ ] Tax reserve sweep executed into isolated sub-account (`1020`).
- [ ] Gateway clearing balance reconciled to zero monthly across Stripe, Razorpay, Cashfree, PayU, and Paytm.
- [ ] Input Tax Credit (ITC) captured on all payment gateway merchant fees.
- [ ] Every transaction carries an OpenAccountants working paper entry with explicit outcome (`CLASSIFIED`, `ASSUMED`, or `NEEDS INPUT`).

## Routing

- Client profitability calculations → `client-pnl` mode.
- Cash reserve sizing and runway questions → `cashflow` mode.
- Contractor tax compliance and 1099/W-8BEN/TDS files → `tax-compliance` mode.

## Sources

- `openaccountants` — Three-outcome classification engine, working paper schema, and dual-entry double-ledger verification standards.
- `EveryInc/charlie-cfo-skill` — Deferred revenue discipline and direct project cost separation.
