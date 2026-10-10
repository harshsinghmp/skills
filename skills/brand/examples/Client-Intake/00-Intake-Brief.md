# Client Intake Brief — Acme Storefront

> **How this works**: You (the employee/client) answer the checklist below in
> conversation with your AI agent. The agent then writes every document in this
> folder for you. Do not hand-write these docs; that is the agent's job.
> Answers already captured at scaffold time are pre-filled below — correct
> anything that is wrong, leave the rest untouched.

## Pre-Filled From Scaffold
- **Project Name**: Acme Storefront
- **Organization**: Acme Retail Co
- **One-Line Purpose**: Ultra-fast headless e-commerce storefront for curated minimalist apparel.
- **Industry / Vertical**: ecommerce_retail
- **Target Audience**: Discerning urban professionals seeking timeless wardrobe essentials
- **Core Problem Solved**: Slow, bloated shopping experiences with confusing checkouts on legacy platforms
- **Brand Voice**: Minimalist, confident, editorial
- **OKLCH Palette**: emerald
- **Offerings**: Essential Heavyweight Tee, Tailored Wool Trouser, Structured Overshirt
- **Stack**: framework `astro`, CMS `none`, e-commerce `medusa`, database `postgres`, auth `better-auth`, styling `unocss`, animation `none`, state `nanostores`

## Employee Checklist (answer these with your agent)
1. **Brand**: Verified vector logos in `creative/assets/` (SVG dark/light).
2. **Business**: Top 3 Competitors: Everlane, Norse Projects, COS. Launch Goal: $50,000 GMV in Month 1.
3. **Offerings**: Initial 12-SKU core collection launch with Stripe global checkout.
4. **Technical**: Primary domain `acmestore.example.com`, Cloudflare DNS, Medusa v2 backend.
5. **Boundaries**: No custom subscription/loyalty engine in MVP; strictly single-purchase checkout.

## Agent Instructions (after the employee answers)
1. Compile into `.agents/brand/`: `voice.md`, `personas.md`, `positioning.md`, `messaging.md`, `visual-identity.md`, and `social-hooks.md` using `bun brand/scripts/intake-compiler.ts .` — grounded ONLY in the employee's answers, no invented filler.
2. Write `01-Brand/`: `brand-identity.md`, `visual-direction.md`, and `voice-and-tone.md`.
3. Write `02-Business/`: `business-model.md` and `audience-persona.md`.
4. Write `03-Offerings/`: `offerings-catalog.md` and `scope-deliverables.md`.
5. Write `04-Technical-Intake/`: `access-and-credentials.md` and `integrations-matrix.md`.
6. Write `start-here.md` at the repo root: developer orientation with verified commands.
7. Sync answers into `.agents/context/product.md` and `.agents/context/accounts.md`.

## Non-Negotiables
- Real answers only: every doc cites something the employee actually said.
- Zero secrets in any file; credential docs contain placeholder links (1Password/Bitwarden share) only.
- Modern fluid CSS only: `clamp()`, logical properties, zero `px` in fluid contexts.
