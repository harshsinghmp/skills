# accounts

Agency and client financial operations engine: milestone invoicing, value-based pricing models, recurring retainer billing, Chart of Accounts bookkeeping, client profitability and P&L modeling, cash flow runway forecasting, automated dunning escalation ladders, and cross-border digital tax compliance — routed through eight modes.

## Modes

- `invoicing`: Milestone billing, retainer schedules, deposit terms, AutoCollect virtual accounts, payment gateway links, and upfront deposit terms.
- `pricing`: Value-based pricing triangulation (min 5x ROI), delivery model matrix (fixed milestone vs sprint retainer vs rev-share), and margin floor enforcement.
- `dunning`: Automated multi-tier escalation ladder (Day 1, 7, 14, 30), gateway smart retries, pause-on-delinquency triggers (staging freeze, sprint stop), and statutory bad debt tax credit write-offs.
- `bookkeeping`: Standard agency & client Chart of Accounts (COA), double-entry ledger classification, OpenAccountants 3-outcome protocol, and multi-gateway clearing (Stripe, Razorpay, Cashfree, PayU, Paytm).
- `client-pnl`: True client & project gross margin calculation, scope-creep margin leakage detection, and Effective Hourly Rate (EHR).
- `cashflow`: Bootstrapped CFO cash forecasting, Days Sales Outstanding (DSO) compression, and operating reserve buffers.
- `tax-compliance`: Cross-border digital services tax rules (GST/VAT zero-rating, reverse charge), 18% GST Input Tax Credit (ITC) recovery, invoice requirements, and contractor compliance.
- `audit`: Comprehensive financial hygiene audit detecting zombie subscriptions, unbilled deliverables, and gateway drag.

## Universal Currency & Ledger Interoperability

- **Multi-Currency Support**: Fully currency-agnostic — operates seamlessly in USD, EUR, GBP, AUD, CAD, INR, JPY, SGD, etc.
- **Accounting Suite Compatibility**: Compatible with QuickBooks Online, Xero, NetSuite, Zoho Books, OpenAccountants, or Plain-Text Accounting (hledger/beancount).
- **Automated Payout Reconciliation**: Built-in CLI script to reconcile multi-gateway settlement batches into 3 outcomes (`MATCH`, `DISCREPANCY`, `MISSING_PAYOUT`):

```bash
# Run multi-gateway transaction reconciliation
bun accounts/scripts/reconcile-gateways.ts
```

## Installation & Usage

```bash
# Run with npx skills
npx skills run harshsinghmp/muse-skills/accounts -- invoicing "Send milestone 2 invoice to Acme Corp"
```
