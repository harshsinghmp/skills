# Client Intake Brief — {{PROJECT_NAME}}

> **How this works**: You (the employee/client) answer the checklist below in
> conversation with your AI agent. The agent then writes every document in this
> folder for you. Do not hand-write these docs; that is the agent's job.
> Answers already captured at scaffold time are pre-filled below — correct
> anything that is wrong, leave the rest untouched.
>
> **Onboarding date**: {{ONBOARDING_DATE}} · **Status**: {{ONBOARDING_STATUS}}

## Pre-Filled From Scaffold
- **Project Name**: {{PROJECT_NAME}}
- **Organization**: {{CLIENT_LEGAL_NAME}}
- **One-Line Purpose**: {{PROJECT_DESC}}
- **Industry / Vertical**: {{INDUSTRY}}
- **Target Audience**: {{TARGET_AUDIENCE}}
- **Core Problem Solved**: {{PROBLEM_SOLVED}}
- **Brand Voice**: {{BRAND_VOICE}}
- **OKLCH Palette**: {{COLOR_PALETTE}}
- **Offerings**: {{OFFERINGS}}
- **Stack**: {{STACK_DETAILS}}

## Client Onboarding Answers
- **Brand / Trade Name**: {{CLIENT_BRAND_NAME}}
- **Client ID**: `{{CLIENT_SLUG}}`
- **Business Model**: {{BUSINESS_MODEL}}
- **Company Stage**: {{COMPANY_STAGE}}
- **Revenue Band**: {{REVENUE_BAND}}
- **Mission**: {{MISSION}}
- **Vision**: {{VISION}}
- **Primary Domain**: {{PRIMARY_DOMAIN}}
- **DNS Provider**: {{DNS_PROVIDER}}
- **Git Host**: {{GIT_HOST}}
- **Launch Goal**: {{LAUNCH_GOAL}}
- **Competitors**: {{COMPETITORS}}
- **Customer Objections**: {{OBJECTIONS}}
- **Boundaries**: {{BOUNDARIES}}
- **Payments**: {{PAYMENTS}}
- **Integrations**: {{INTEGRATIONS}}
- **Brand Assets**: {{BRAND_ASSETS}}
- **Figma / Design File**: {{FIGMA_URL}}

## Engagement & Commercial
- **Engagement Type**: {{ENGAGEMENT_TYPE}}
- **SLA Tier**: {{SLA_TIER}}
- **Budget Band**: {{BUDGET}}
- **Kickoff Date**: {{KICKOFF_DATE}}
- **Deadline**: {{DEADLINE}}
- **Primary Channel**: {{COMMS_CHANNEL}}
- **Reporting Cadence**: {{COMMS_CADENCE}}

## Stakeholders
- **Day-to-Day Contact**: {{CLIENT_PRIMARY_CONTACT}}
- **Contact Role**: {{CLIENT_CONTACT_ROLE}}
- **Final Approval (Decision Maker)**: {{DECISION_MAKER}}
- **Client Technical Lead**: {{TECH_LEAD}}

## Access Required From Client
{{ACCESS_ITEMS}}

## Employee Checklist (answer these with your agent)
1. **Brand**: Name anything the pre-filled fields above get wrong; share logo/asset locations if they exist.
2. **Business**: Who buys, who uses, top 3 competitors, and the single goal that defines launch success.
3. **Offerings**: List every product/service/package with a one-line promise each.
4. **Technical**: Domain + DNS host, git host, deployment target, and any third-party services already in use (CRM, email, analytics, payments).
5. **Boundaries**: What is explicitly OUT of scope for launch.
6. **Commercial**: Confirm engagement type, budget band, kickoff date, deadline, SLA tier, and communication cadence.
7. **Access**: Confirm who owns each platform account and how access will be delegated (never share raw passwords).

## Agent Instructions (after the employee answers)
1. Compile into `.agents/brand/`: `voice.md`, `personas.md`, `positioning.md`, `messaging.md`, `visual-identity.md`, and `social-hooks.md` using `bun brand/scripts/intake-compiler.ts .` — grounded ONLY in the employee's answers, no invented filler.
2. Write or update `01-Brand/`: `brand-identity.md`, `visual-direction.md`, and `voice-and-tone.md`.
3. Write or update `02-Business/`: `business-model.md` and `audience-persona.md`.
4. Write or update `03-Offerings/`: `offerings-catalog.md` and `scope-deliverables.md` (split launch vs. later).
5. Write or update `04-Technical-Intake/`: `access-and-credentials.md` (placeholders only — never real secrets) and `integrations-matrix.md`.
6. Write or update `start-here.md` at the repo root: install/run commands from `package.json`, token locations (`src/styles/tokens.css` and `.agents/brand/tokens/`), and verification steps, derived from the actual scaffolded stack.
7. Sync the answers into `.agents/context/product.md` and `.agents/context/accounts.md`.

## Non-Negotiables
- Real answers only: every doc cites something the employee actually said.
- Zero secrets in any file; credential docs contain placeholder links (1Password/Bitwarden share) only.
- Modern fluid CSS only: `clamp()`, logical properties, zero `px` in fluid contexts.
- Never re-ask a field that already has a verified answer in this brief; ask only what is missing.
