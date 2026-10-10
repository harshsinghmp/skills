# Client Intake Brief — {{PROJECT_NAME}}

> **How this works**: You (the employee/client) answer the checklist below in
> conversation with your AI agent. The agent then writes every document in this
> folder for you. Do not hand-write these docs; that is the agent's job.
> Answers already captured at scaffold time are pre-filled below — correct
> anything that is wrong, leave the rest untouched.

## Pre-Filled From Scaffold
- **Project Name**: {{PROJECT_NAME}}
- **Organization**: {{AUTHOR_NAME}}
- **One-Line Purpose**: {{PROJECT_DESC}}
- **Industry / Vertical**: {{INDUSTRY}}
- **Target Audience**: {{TARGET_AUDIENCE}}
- **Core Problem Solved**: {{PROBLEM_SOLVED}}
- **Brand Voice**: {{BRAND_VOICE}}
- **OKLCH Palette**: {{COLOR_PALETTE}}
- **Offerings**: {{OFFERINGS}}
- **Stack**: {{STACK_DETAILS}}

## Employee Checklist (answer these with your agent)
1. **Brand**: Name anything the pre-filled fields above get wrong; share logo/asset locations if they exist.
2. **Business**: Who buys, who uses, top 3 competitors, and the single goal that defines launch success.
3. **Offerings**: List every product/service/package with a one-line promise each.
4. **Technical**: Domain + DNS host, git host, deployment target, and any third-party services already in use (CRM, email, analytics, payments).
5. **Boundaries**: What is explicitly OUT of scope for launch.

## Agent Instructions (after the employee answers)
1. Compile into `.agents/brand/`: `voice.md`, `personas.md`, `positioning.md`, `messaging.md`, `visual-identity.md`, and `social-hooks.md` using `bun brand/scripts/intake-compiler.ts .` — grounded ONLY in the employee's answers, no invented filler.
2. Write `01-Brand/`: `brand-identity.md` (purpose, vision, mission, values, positioning), `visual-direction.md` (tied to the OKLCH tokens in `src/styles/tokens.css`), and `voice-and-tone.md`.
3. Write `02-Business/`: `business-model.md` and `audience-persona.md`.
4. Write `03-Offerings/`: `offerings-catalog.md` and `scope-deliverables.md` (split launch vs. later).
5. Write `04-Technical-Intake/`: `access-and-credentials.md` (placeholders only — never real secrets) and `integrations-matrix.md`.
6. Write `start-here.md` at the repo root: a short developer orientation (what this is, prerequisites, install/run commands from `package.json`, where tokens live, how to verify). Derive it from the actual scaffolded stack — do not paste generic content.
7. Sync the answers into `.agents/context/product.md` and `.agents/context/accounts.md`.

## Non-Negotiables
- Real answers only: every doc cites something the employee actually said.
- Zero secrets in any file; credential docs contain placeholder links (1Password/Bitwarden share) only.
- Modern fluid CSS only: `clamp()`, logical properties, zero `px` in fluid contexts.
