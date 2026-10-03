---
name: brand
aliases: ["brand-onboarding", "client-intake", "brand-research", "brand-dossier", "sales-pipeline", "brand-lifecycle", "client-offboarding", "cross-border-ecommerce", "amazon-operations", "marketplace-operations"]
description: "Client and brand lifecycle engine: comprehensive brand intake, autonomous web research, sales pipeline qualification, ad and payment account access, cross-department brief synthesis, cross-border e-commerce operations, and offboarding — routed through eight modes. Use when onboarding a new client or brand, scraping brand assets and web signals, qualifying sales leads, gathering ad account and payment credentials, synthesizing cross-department briefs for design/webdev/content/paidads, scaling cross-border e-commerce across Amazon/Shopee/TikTok Shop, offboarding an account, or auditing brand readiness checklists. Not for designing brand marks (design) or negotiating contracts (ops)."
argument-hint: "[intake|research|pipeline|accounts-access|brief|ecommerce|offboard|audit]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 46
  aliases: ["brand-onboarding", "client-intake", "brand-research", "brand-dossier", "sales-pipeline", "brand-lifecycle", "client-offboarding", "cross-border-ecommerce", "amazon-operations", "marketplace-operations"]
  suggested_skills: ["design", "webdev", "content", "paidads", "ops", "client-comms", "accounts"]
  hermes:
    tags: ["brand", "onboarding", "intake", "client-lifecycle", "sales-pipeline", "ad-accounts", "brand-research", "briefing", "offboarding", "readiness-audit", "ecommerce", "cross-border", "amazon", "shopee", "tiktok-shop", "fba", "logistics"]
    related_skills: ["design", "webdev", "content", "paidads", "ops", "client-comms", "accounts"]
    suggested_skills: ["design", "webdev", "content", "paidads", "ops", "client-comms", "accounts"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["design", "webdev", "content", "paidads", "ops", "client-comms", "accounts"]
    primary_triggers: ["onboard new client", "brand intake", "scrape brand", "sales pipeline", "lead qualification", "ad account access", "client offboarding", "brand brief", "brand audit", "cross-border ecommerce", "amazon operations", "tiktok shop"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🏷️ brand — Client & Brand Lifecycle Department

One unified department for client and brand lifecycle management. Every agency engagement begins and ends here. It drives end-to-end sales pipeline progression, conducts comprehensive brand discovery and autonomous web intelligence, audits ad account and payment access, translates raw brand truth into tailored cross-department briefs (`design`, `webdev`, `content`, `paidads`, `qa-launch`), audits brand readiness with interactive clarification questions, and governs graceful offboarding.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **intake** | "onboard client", "brand intake", "client questionnaire", "brand discovery" | Comprehensive brand intake discovery with automatic missing-field question prompts | [references/intake.md](references/intake.md) |
| **research** | "scrape brand", "brand research", "competitor intelligence", "web audit" | Autonomous web scraping, social footprint harvesting, and competitive positioning | [references/research.md](references/research.md) |
| **pipeline** | "sales pipeline", "qualify lead", "BANT qualification", "sales discovery" | Full agency sales pipeline: Lead Gen → Discovery/Qualification → Proposal → SOW Handover | [references/pipeline.md](references/pipeline.md) |
| **accounts-access** | "account access", "client creds", "login credentials", "ad account setup", "payment credentials", "2fa setup" | 5-stage client credentials and logins intake workflow: discovery, zero-leak delegation dispatch, 2FA handshake, permission audit, and vault logging | [references/accounts-access.md](references/accounts-access.md) |
| **brief** | "brand brief", "client brief", "cross-department brief", "brand dossier" | Synthesizes master Single Source of Truth Brand Dossier for downstream delivery heads | [references/brief.md](references/brief.md) |
| **ecommerce** | "cross-border ecommerce", "amazon listing", "shopee store", "tiktok shop", "global ecommerce", "international logistics", "fba", "vat compliance" | Multi-platform cross-border e-commerce operations: Amazon, Shopee, Lazada, Temu, TikTok Shop, international logistics/warehousing, VAT/EPR compliance, multilingual listing optimization, and unit economics modeling | [references/ecommerce.md](references/ecommerce.md) |
| **offboard** | "offboard client", "client offboarding", "revoke access", "project handover" | Access revocation, asset export packaging, DNS handover, and client NPS reviews | [references/offboard.md](references/offboard.md) |
| **audit** | "brand audit", "readiness check", "intake checklist", "missing brand info" | Pre-flight brand readiness gate auditing completeness before teams begin work | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Onboarding a new agency client or launching a new internal or external brand.
- Conducting web scraping, social research, and competitive intelligence on a brand.
- Qualifying inbound and outbound sales leads using BANT / MEDDIC frameworks.
- Collecting and auditing ad account permissions (Meta, Google, TikTok), analytics (GA4, GTM), hosting, and payment gateways under strict zero-leak protocols.
- Generating tailored cross-department briefs for `design`, `webdev`, `content`, `paidads`, and `qa-launch`.
- Auditing brand readiness and automatically asking clarifying questions when critical details are missing.
- Executing a clean, professional client offboarding and asset handover.

---

## Quick Reference

| Mode | Primary Input | Primary Output | Gate / SLA |
|:---|:---|:---|:---|
| `intake` | Client questionnaire or discovery call notes | Structured Brand Intake Document (`brand-intake.md`) | Zero unverified core claims |
| `research` | Brand URL, social handles, competitor names | Web Intelligence & Market Dossier (`brand-intelligence.md`) | Primary sources cited |
| `pipeline` | Lead profile, initial budget, timeline | Qualified Opportunity Record & Proposal Blueprint | BANT / MEDDIC scored |
| `accounts-access` | Platform asset IDs, delegation requests | Verified Access Inventory & Delegation Table | Zero raw secrets exposed |
| `brief` | Completed intake & research data | Tailored Departmental Briefs (`.agents/context/brand.md`) | 100% downstream parity |
| `offboard` | Finished project SOW, termination notice | Offboarding Certificate & Revocation Log | 48h access revoking |
| `audit` | Brand dossier drafts & asset links | Readiness Scorecard (Block / Ready to Build) | $\ge 90\%$ completeness |

---

## Procedure

1. **Pipeline & Qualification (`pipeline`)**: Receive lead, assess ICP fit, run BANT/MEDDIC qualification, and draft initial scope proposal before contracts.
2. **Deep Brand Intake (`intake`)**: Conduct comprehensive intake across business model, target audience, brand pillars, core offers, and visual preferences. Detect missing fields and trigger interactive clarification questions.
3. **Autonomous Web Scraping & Research (`research`)**: Scrape public website, social profiles, customer reviews (G2/Trustpilot), meta tags, schema markup, and competitor positioning.
4. **Access & Delegation Vault (`accounts-access`)**: Send platform-native delegation guides (Partner Access on Meta Business Manager, Manager Account on Google Ads, Organization access on Stripe/GA4). Never accept raw passwords.
5. **Master Brief Synthesis (`brief`)**: Compile the canonical Brand Dossier (`.agents/context/brand.md`) and carve out specific departmental sub-briefs for `design`, `webdev`, `content`, `paidads`, and `qa-launch`.
6. **Brand Readiness Gate (`audit`)**: Run the 50-checkpoint Brand Readiness Audit. If any critical parameter is missing, generate targeted clarification questions and block unverified downstream execution.
7. **Clean Offboarding (`offboard`)**: Upon project completion, execute the access revocation protocol, export all production assets, deliver documentation, and request a structured review.

---

## Pitfalls

- **Accepting Raw Passwords / Secrets**: Never ask clients to paste passwords or API keys into chat or docs. Always use native delegation (Meta Business Manager Partner IDs, Google Ads Manager link, GTM User Invitations).
- **Assumed Brand Truth**: Don't rely solely on what the client says; scrape the actual live website and customer reviews to identify perception gaps.
- **Unclear Downstream Handoffs**: Avoid handing raw, rambling call notes to `design` or `webdev`. Always synthesize into the structured Department Brief schema.
- **Skipping the Readiness Gate**: Starting design or development with incomplete brand assets leads to costly rework and scope creep. Halt until the audit passes $\ge 90\%$.

---

## Verification

- [ ] All 7 mode reference files exist and are syntactically valid in `references/`.
- [ ] Frontmatter conforms to Hermes, OpenClaw, and RFC specifications.
- [ ] Automated intake audit script (`scripts/intake-audit.ts`) executes and scores brand completeness.
- [ ] Vibeguard zero-credential leak protocol strictly maintained across all account-access guides.
