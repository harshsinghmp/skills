# invoicing — Milestone billing, retainer schedules, and dunning cadence.

## Scope

- Agency milestone contracts, upfront deposit billing (50/25/25 or 50/50), and recurring monthly retainer invoices.
- Modern payment gateway dispatch:
  - **Stripe**: International card payments, USD/EUR/GBP cross-border retainers, SEPA/ACH direct debit.
  - **Razorpay**: Domestic cards, Netbanking, UPI, payment links, and **Smart Collect** virtual accounts.
  - **Cashfree Payments**: **AutoCollect** dynamic virtual accounts/VPAs for real-time NEFT/IMPS/UPI reconciliation and instant settlement.
  - **PayU**: Enterprise Indian payments, recurring mandates, and multi-currency checkout.
  - **Paytm Payment Gateway**: UPI intent, dynamic QR, wallet, and netbanking rails.
- Automated dunning ladder and Days Sales Outstanding (DSO) compression.
- Both agency-to-client billing and advising clients on their own customer invoicing workflows.

## Deliverable

A formatted, statutory-compliant invoice specification (Markdown/CSV), digital payment link payload (Stripe/Razorpay/Cashfree/PayU/Paytm), virtual account transfer details, and scheduled dunning reminders.

## Procedure

1. **Billing Structure Selection**:
   - *Fixed-Scope Projects*: Default to 50% deposit upfront before kickoff, 25% at milestone midpoint, 25% upon final deployment. Never commence design or coding without cleared deposit funds.
   - *Retainers*: Billed on the 1st of the service month in advance (e.g., May 1 for May service). Auto-debit via credit card / ACH required.
   - *Payment Terms*: Default to **Net 7** or **Net 14**. Any client demanding Net 30 or Net 60 must carry a 5% financing buffer.
2. **Statutory Invoice Construction**:
   - Unique sequential identifier (`INV-YYYY-XXXX`).
   - Issuance date and strict payment due date.
   - Agency legal name, business address, and Tax ID (GST/VAT/EIN).
   - Client legal name, billing contact, address, and Tax ID.
   - Clear line items: Deliverable description, quantity/hours (if T&M), unit rate, subtotal, applicable taxes (or zero-rated export notation), and total payable.
   - Clear settlement instructions:
     - **International Clients**: Stripe payment link / ACH routing / SWIFT wire instructions.
     - **Domestic B2B Clients (Auto-Reconciled)**: Cashfree AutoCollect or Razorpay Smart Collect dedicated Virtual Account (VAN) + Virtual UPI ID. Client sends wire; payment auto-matches without manual bank statement parsing.
     - **Quick Checkout**: Razorpay / Cashfree / PayU / Paytm dynamic payment link or QR code.
3. **Automated Dunning Cadence (DSO Compression Ladder)**:
   - **T-3 Days (Courtesy Heads-Up)**: *"Hi [Client], a quick note that Invoice #INV-XXXX for Milestone 2 ($X,XXX) is due on [Date]. Link: [URL]. Let us know if you need any vendor portal PO details."*
   - **Day 0 (Due Date)**: *"Hi [Client], Invoice #INV-XXXX is due today. Please settle via the link below or reply with the transfer wire receipt."*
   - **T+3 Days (Overdue Follow-up)**: *"Hi [Client], checking in to ensure you received Invoice #INV-XXXX ($X,XXX), which is now 3 days overdue. Please let us know when payment has been released."*
   - **T+7 Days (Delivery Notice)**: *"Hi [Client], Invoice #INV-XXXX is 7 days past due. Per our Master Services Agreement, active project staging deployments and sprint milestones are queued to pause if unpaid by T+10. Please settle today to keep momentum on schedule."*
   - **T+14 Days (Hard Delivery Pause)**: *"Hi [Client], work on project [Name] is temporarily suspended until outstanding Invoice #INV-XXXX is cleared. Once payment is confirmed, development resumes within 24 hours."*

4. **The Deposit-Before-Code Invariant & Deemed Acceptance Standards**:
   - **The Deposit-Before-Code Invariant**: Hard prohibition against writing or committing production code before upfront deposit settlement. If a client requests immediate kickoff before wire clearance, require instant payment via credit card or Virtual Account / UPI payment link.
   - **7-Day Deemed Acceptance Clause**: SOWs and milestone invoices must include the statutory clause: *"Upon delivery to staging, client has 7 business days to provide reproducible defect reports. In the absence of written reports within 7 business days, the deliverable is legally deemed approved and final milestone balance is due."*
   - **Automated Retainer Overage Meter**: When monthly retainer consumption reaches 80% of contracted hours or compute budget, emit an automated overage alert with approval for an additional hour block.
   - **Cross-Border Tax Zero-Rating & Withholding Shield**: Ensure all international invoices carry statutory export notation (e.g. *"Export of Services under LUT without payment of IGST"* or *"EU Reverse Charge VAT"*). Collect Tax Residency Certificate (TRC) and Form 10F/W-8BEN to block surprise foreign tax deductions at source.

## Quality gate

- [ ] Upfront deposit invoice cleared before any creative or engineering delivery starts.
- [ ] 7-day deemed acceptance clause included on all milestone invoices.
- [ ] Retainer overage meter monitored at 80% warning threshold.
- [ ] Cross-border export zero-rating notation verified (LUT / reverse charge).
- [ ] Invoice contains unique sequential ID, issuance date, due date, and full tax identifiers.
- [ ] Digital payment link provided alongside wire details.
- [ ] Payment terms set to Net 7 or Net 14 (Net 30 carries financing fee).
- [ ] Dunning ladder pre-scheduled with unambiguous stop-work enforcement at T+10/14.

## Routing

- SOW scope or milestone sign-off questions → `ops` (milestone mode).
- Client relationship concerns during overdue billing → `client-comms`.
- Churn risk detected during retainer billing → `retain` (churn-watch mode).
- Payment gateway webhook code integration → `webdev`.

## Sources

- `EveryInc/charlie-cfo-skill` — Cash velocity, upfront deposit mandates, and AR aging discipline.
- `openaccountants` — Statutory invoice requirements and B2B billing validation standards.
