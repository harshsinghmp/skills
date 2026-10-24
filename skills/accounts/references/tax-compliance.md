# tax-compliance — Cross-border digital tax, export zero-rating, and contractor compliance.

## Scope

- Statutory tax compliance for agency services and client digital products (distilling cross-border rules from `openaccountants`).
- Place of supply, export zero-rating, Letter of Undertaking (LUT), and B2B reverse charge mechanisms.
- International and domestic contractor compliance (Form W-9, Form W-8BEN, 1099-NEC, TDS).

## Deliverable

A cross-border digital service tax decision matrix, compliant export invoice disclaimer text, and contractor tax documentation checklist.

## Procedure

1. **Digital Services & Software Export Tax Classification**:
   - **Cross-Border B2B Export Rule**:
     - When an agency delivers software engineering, UI design, or digital marketing to a client located outside the domestic jurisdiction, the transaction is treated as an **Export of Services**.
     - *Zero-Rating / Exemption*: Exports are zero-rated for GST/VAT, provided:
       1. The service provider is domestic and the client is outside domestic territory.
       2. The place of supply is outside the domestic jurisdiction.
       3. Payment is received in convertible foreign currency (USD, EUR, GBP) through authorized banking channels (Wise, Stripe, SWIFT).
     - *Mandatory Invoice Disclaimer*:
       > *"Export of Services under Letter of Undertaking (LUT) / Zero-Rated without payment of IGST/VAT. Payment realized in convertible foreign exchange."*
   - **European Union / United Kingdom B2B Reverse Charge**:
     - For B2B sales of digital services to EU/UK business clients with valid VAT IDs, VAT is not collected by the seller.
     - The client accounts for VAT in their local jurisdiction under the **Reverse Charge Mechanism (RCM)**.
     - *Mandatory Invoice Disclaimer*:
       > *"Reverse Charge: VAT to be accounted for by the recipient per Article 196 of Council Directive 2006/112/EC (or UK equivalent)."*
   - **Domestic B2B Billing**:
     - Mandatory application of domestic sales tax / GST (e.g. 18% SAC 998314 for IT & Software Development). Both parties must state valid tax registration numbers for input tax credit pass-through.
   - **Foreign Inward Remittance Certificate (FIRC / FIRS)**:
     - For cross-border Stripe or bank wire settlements, download the FIRS remittance statement with Purpose Code `P0802` (Software consultancy / implementation) as mandatory statutory proof of foreign exchange realization.

2. **OpenAccountants Three-Outcome Tax Determination Protocol**:
   - **`CLASSIFIED` (Definitive)**:
     - Fact pattern satisfies statutory code with zero ambiguity.
     - *Rule*: Non-resident client + valid foreign address + foreign currency receipt (Stripe USD/EUR wire) + active LUT = Zero-Rated Export under CGST Act Section 2(6) / Section 16 IGST.
   - **`ASSUMED` (Conservative Disclosed Default)**:
     - Minor technicality pending, default to conservative compliance position with logged working paper disclosure.
     - *Rule*: Domestic client claims GST registration but portal lookup is pending; issue invoice with provisional IGST/CGST charging until verified GSTIN is confirmed.
   - **`NEEDS INPUT` (Gated Clarification Stop)**:
     - Material fact missing that determines tax rate or legal liability.
     - Agent halts processing and presents a binary clarification prompt.
     - *Example*: Domestic vs SEZ (Special Economic Zone) status unclear; ask user whether client is in DTA (taxable at 18%) or SEZ unit (zero-rated with endorsement).

3. **Contractor Tax Documentation & Withholding**:
   - **US-Based Subcontractors**:
     - Collect **Form W-9** (Request for Taxpayer Identification Number) *prior* to releasing the first payout.
     - Track cumulative payments: If aggregate compensation reaches **$600 or more** in a tax year, file **Form 1099-NEC** by January 31.
   - **Non-US International Subcontractors**:
     - Collect **Form W-8BEN** (Individual) or **Form W-8BEN-E** (Entity) certifying non-US tax residency.
     - Establishes that services are performed outside the US, exempting the agency from mandatory 30% foreign withholding tax.
   - **Domestic Contractor Withholding (e.g. India TDS)**:
     - Deduct Tax Deducted at Source (TDS) under Section 194J (10% or 2% for Technical Services) or Section 194C (1% or 2% for Contracts) when invoices exceed statutory thresholds.
     - Deposit deducted tax to the government by the 7th of the following month.

3. **Statutory Invoice Minimum Check**:
   - [ ] Consecutive serial invoice number.
   - [ ] Date of issuance and delivery date.
   - [ ] Full legal name, registered address, and Tax ID (GSTIN, VAT, EIN) of both seller and buyer.
   - [ ] Six-digit SAC code (e.g., `998314` for IT/Software Design services; `998361` for Advertising & Marketing).
   - [ ] Currency specification and exchange conversion rate noted if billing foreign currency.
   - [ ] Reverse charge / export zero-rating clause explicitly printed on the document.

## Quality gate

- [ ] Cross-border export transactions verified for convertible foreign exchange receipt.
- [ ] Appropriate statutory disclaimer printed on invoice (LUT export zero-rating or EU Reverse Charge).
- [ ] Valid contractor tax form (W-9 or W-8BEN) on file *before* paying any subcontractor.
- [ ] Tax reserve (20–25%) held in separate account to prevent year-end liquidity shock.

## Routing

- Invoice drafting and line-item formatting → `invoicing` mode.
- Chart of Accounts tax liability entries (`2030`) → `bookkeeping` mode.
- Contractor scope of work and deliverables → `ops`.

## Sources

- `openaccountants` — Multi-jurisdiction statutory tax classifications and international VAT/GST place-of-supply rules.
- Internal agency fiscal standards — Zero-rating export compliance and contractor withholding rules.
