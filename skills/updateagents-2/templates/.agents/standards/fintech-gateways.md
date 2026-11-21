# 💳 Modern Fintech Gateways & Reconciliation Standard

> **Financial Engineering Rail**: Codified standards for multi-gateway settlements, Indian domestic rails, and international payments.

---

## 1. Supported Gateway Matrix

| Gateway | Primary Rail / Market | Virtual Accounts (AutoCollect) | Settlement Cycle | Webhook Signature Header |
| :--- | :--- | :--- | :--- | :--- |
| **Stripe** | Global / Multi-Currency | Customer Balances / Wire | T+2 to T+7 days | `Stripe-Signature` |
| **Razorpay** | India / UPI / Cards / NetBanking | Smart Collect Virtual VPA/IBAN | T+2 business days | `X-Razorpay-Signature` |
| **Cashfree** | India / UPI / Payouts / AutoCollect | AutoCollect Virtual Accounts | T+1 to T+2 days | `x-webhook-signature` |
| **PayU** | India & Emerging Markets | PayU Hub / Virtual UPI | T+2 days | `signature` / SHA-512 |
| **Paytm** | India / UPI / QR / Wallet | Paytm Payouts & Sub-wallets | T+1 day | `X-PAYTM-SIGNATURE` |

---

## 2. Tax & Reconciliation Protocol

### 18% GST Input Tax Credit (ITC) Recovery
All payment processors in India deduct transaction processing fees + 18% GST before paying out gross collections:

$$\text{Gross Collection} - (\text{Gateway Fee} + \text{18% GST}) = \text{Net Bank Payout}$$

- **Mandatory ITC Ledger**: The 18% GST portion must NOT be booked as an expense. It must be booked to **Asset: GST Input Tax Credit (ITC)**.
- **Monthly Tax Recovery**: Match gateway tax invoices against GSTR-2B to offset GST collected on client invoices.

### 3-Outcome Settlement Reconciliation
Every settlement batch processed across gateways must resolve to one of three deterministic outcomes:

1. `MATCH`: Gross collection minus calculated gateway fees and GST perfectly equals the bank credit.
2. `DISCREPANCY`: Variance exists (e.g. unexpected refund clawback, disputed chargeback fee, or rounding diff). Requires manual review.
3. `MISSING_PAYOUT`: Gateway reports payout transmitted, but the bank account shows no corresponding deposit within the T+2 settlement window. Requires clearing trace.

---

## 3. Universal Currency & Ledger Interoperability

### Multi-Currency Flexibility
This standard is strictly currency-agnostic. Projects configure their primary and settlement currencies in `.agents/context/product.md` or `.env`:
- **Global Currencies**: USD, EUR, GBP, AUD, CAD, JPY, SGD, CHF, etc.
- **Domestic / Regional Currencies**: INR, BRL (Pix), IDR, AED, etc.
- **FX Settlement**: When processing cross-border payments, capture gross customer currency, processor FX rate, and net settled amount into corresponding clearing sub-accounts.

### Accounting Platform & ERP Agnostic
Reconciliation pipelines and chart of accounts structures export cleanly to any target system:
- **Global Cloud Suites**: QuickBooks Online (QBO), Xero, NetSuite, FreshBooks.
- **Regional / Specialized Platforms**: Zoho Books, TallyPrime, Busy.
- **Developer & Plain-Text Accounting**: OpenAccountants, hledger, beancount, or CSV working papers.
- **Organization-Level Choice**: Each client or repository defines its preferred accounting platform without framework lock-in. Individual developer or principal preferences never restrict the platform options of downstream users.
