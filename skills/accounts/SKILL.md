---
name: accounts
aliases: ["finance", "invoicing", "billing", "bookkeeping", "cfo", "agency-accounts"]
description: "Agency and client financial operations engine: milestone invoicing, recurring retainer billing, Chart of Accounts bookkeeping, client profitability and P&L modeling, cash flow runway forecasting, and cross-border digital tax compliance — routed through six modes. Use when asked to send or schedule an invoice, reconcile agency or client books, calculate client gross margins and effective hourly rates, forecast runway and cash buffers, evaluate GST/VAT digital services tax rules, or audit financial leakages. Not for general project management (ops) or payment code integration (webdev)."
argument-hint: "[invoicing|bookkeeping|client-pnl|cashflow|tax-compliance|audit]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 45
  aliases: ["finance", "invoicing", "billing", "bookkeeping", "cfo", "agency-accounts"]
  suggested_skills: ["ops", "retain", "client-comms", "growth", "gtm", "webdev"]
  hermes:
    tags: ["finance", "invoicing", "billing", "bookkeeping", "cashflow", "runway", "pnl", "client-profitability", "tax-compliance", "gst", "vat", "financial-audit"]
    related_skills: ["ops", "retain", "client-comms", "growth", "gtm", "webdev"]
    suggested_skills: ["ops", "retain", "client-comms", "growth", "gtm", "webdev"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["ops", "retain", "client-comms", "growth", "gtm", "webdev"]
    primary_triggers: ["send invoice", "retainer billing", "bookkeeping", "client profitability", "cash runway", "gst vat digital services", "financial audit"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 💰 accounts — Agency & Client Financial Operations Engine

The single source of truth for financial management, billing workflows, profitability modeling, cash runway preservation, and tax readiness across the agency and its clients.

Operates as the executive financial engine within Harsh's **LifeOS Agency Council** (supporting **Crew** on delivery operations and the principal on capital allocation). Grounded in the unit economics and cash disciplines of bootstrapped CFO principles (`charlie-cfo-skill`) and cross-border digital service taxation (`openaccountants`).

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **invoicing** | "send invoice", "retainer billing", "milestone payment", "stripe invoice", "payment reminder" | Milestone billing, retainer schedules, deposit/prepayment terms, payment gateway links, and automated dunning cadence (T-3, Day 0, T+3, T+7, T+14) | [references/invoicing.md](references/invoicing.md) |
| **bookkeeping** | "chart of accounts", "reconcile transactions", "categorize expenses", "double entry", "receipt matching" | Standard agency & client Chart of Accounts (COA), double-entry ledger classification, SaaS subscription audits, and contractor payouts | [references/bookkeeping.md](references/bookkeeping.md) |
| **client-pnl** | "client profitability", "project margin", "effective hourly rate", "scope billing adjustment" | True client & project gross margin calculation (Revenue minus direct contractor fees, dedicated API tokens, infra costs), scope-creep margin leakage detection, and EHR | [references/client-pnl.md](references/client-pnl.md) |
| **cashflow** | "cash runway", "burn rate", "cash flow forecast", "DSO", "reserve buffer", "operating capital" | Bootstrapped CFO cash forecasting, Days Sales Outstanding (DSO) compression, AR aging analysis, and 3–6 month operating reserve + tax allocation buffers | [references/cashflow.md](references/cashflow.md) |
| **tax-compliance** | "gst vat digital services", "contractor withholding", "w8ben 1099", "reverse charge", "statutory invoice" | Cross-border digital services tax rules (GST/VAT export zero-rating, reverse charge mechanism, place-of-supply), invoice statutory requirements, and contractor tax documentation | [references/tax-compliance.md](references/tax-compliance.md) |
| **audit** | "financial audit", "audit expenses", "revenue leakage", "zombie subscriptions", "fx drag" | Comprehensive financial hygiene audit for agency or client accounts: detecting zombie subscriptions, unbilled deliverables, gateway payout delays, and FX drag | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Generating structured milestone, retainer, or upfront deposit invoices for agency clients.
- Setting up or auditing the Chart of Accounts (COA) for a modern software or digital agency.
- Calculating true client gross margins, contractor cost allocations, and Effective Hourly Rates (EHR).
- Forecasting 13-week rolling cash flow, measuring Days Sales Outstanding (DSO), and sizing cash reserve buffers.
- Navigating international digital service tax compliance (cross-border GST/VAT zero-rating, reverse charge rules).
- Auditing client or agency expense ledgers for recurring leakage, unbilled work, or gateway fee drag.

### Anti-Triggers

- Routine project milestone delivery and SOW drafting → `ops` (milestone mode).
- Post-delivery client retention check-ins and review asks → `retain`.
- Client communication and status reporting → `client-comms`.
- Gateway code integration (Stripe API routes, webhook listeners) → `webdev` (backend/fullstack).
- Pricing strategy experiments and tier modeling → `growth` (pricing mode).

---

## Quick Reference

### The Agency Financial Vital Signs

| Metric | Target Benchmark | Formula / Definition | Red Flag Threshold |
|:---|:---|:---|:---|
| **Gross Margin per Client** | ≥ 65% | $\frac{\text{Client Revenue} - \text{Direct Delivery Costs}}{\text{Client Revenue}}$ | < 50% (Unprofitable / Scope Creep) |
| **Effective Hourly Rate (EHR)** | ≥ $150/hr | $\frac{\text{Total Contract Value}}{\text{Total Delivery Hours (Internal + Contractor)}}$ | < Target minimum billable floor |
| **Operating Cash Reserve** | 3 to 6 months | Fixed Monthly OPEX $\times$ Reserve Multiplier | < 2 months of operational survival |
| **Days Sales Outstanding (DSO)**| ≤ 14 days | $\frac{\text{Accounts Receivable}}{\text{Total Credit Sales}} \times \text{Days}$ | > 30 days (Collections stall) |
| **Tax Reserve Buffer** | 20%–25% of Net | Automated transfer to dedicated tax sub-account | Withholding taxes paid from operating cash |

### Dual Operating Context (Agency vs Client)

- **Agency Context**: Internal financial hygiene, partner distributions, contractor payouts, cash runway, studio profit margins.
- **Client Financial Context**: Advising clients on payment gateway configuration, e-commerce checkout fee optimization, SaaS subscription audits, and invoice templates for their end-users.

---

## Procedure

1. **Intake & Scope**: Establish context (Agency internal vs Client advisory) and identify the financial objective (invoicing, bookkeeping, margin review, cashflow modeling, tax review, or audit).
2. **Resolve Mode**: Match request against the Modes table and load exactly one reference file (`references/<mode>.md`).
3. **Execute Mode Playbook**: Follow the structured intake, procedure, quality gate, and formulas defined in the reference.
4. **Enforce Zero Credential Policy**: Never output raw banking logins, credit card numbers, or live secret keys (`sk_live_*`). Always mask as `[REDACTED]` (LifeOS Vibeguard Protocol).
5. **Output Deliverable**: Generate clear, auditable Markdown tables, CSV schemas, or step-by-step financial schedules.

---

## Pitfalls

- Committing live payment secrets, private banking details, or real customer financial data into repo files.
- Treating top-line revenue as profit without deducting direct contractor fees, dedicated API costs, and hosting.
- Permitting invoices to age past 14 days without triggering automated polite dunning sequences.
- Confusing domestic invoice requirements with cross-border digital service export tax exemptions (LUT / Reverse Charge).
- Commingling tax reserve allocations with daily working operating capital.

---

## Verification

- [ ] Target financial mode resolved and executed via dedicated reference.
- [ ] Calculations verified with explicit formulas (margins, EHR, DSO, runway).
- [ ] Zero secret leaks or credentials in output (LifeOS Vibeguard Protocol compliant).
- [ ] Invoices and financial ledgers carry statutory requirements (invoice number, date, tax ID, terms).
- [ ] Financial findings and action items documented clearly for executive decision-making.
