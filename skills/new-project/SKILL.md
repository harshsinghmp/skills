---
name: new-project
aliases: ["Agent Engine","DOX Engine","agent-engine","dox-engine"]
description: "Purpose-First interactive project creator, companion configurator, DOX Engine, and Agent Engine provisioner. Implements a 6-stage sequential execution pipeline: Stage 1 (Purpose-First Root Prompt), Stage 2 (Hierarchical Decision Tree with Tradeoff Engine), Stage 3 (Official Package Installation & Full End-to-End Companion Wiring), Stage 4 (Modern OKLCH Tokens & Fluid BEM System), Stage 5 (Client Intake Brief with post-scaffold agent onboarding), and Stage 6 (Closeout). Bootstraps the Agents-First architecture (AGENTS.md, 9-folder .agents/ container, 13 modular standards, brand tokens, and cognitive memory) before interactively composing project intent, framework (Next.js 16, Astro v7, Instatic HTML, Roots Bedrock, Expo), styling (Hybrid UnoCSS Wind 4 + BEM), animations (CSS presets, Motion.dev, GSAP), state management (NanoStores cross-island store), mobile conversion (Ionic Capacitor for Astro/Next.js to iOS/APK, Expo for React), CMS (Payload 3.0 + Puck, Atomic Payload website builder, Keystatic, StudioCMS, Git-based CMS), e-commerce (Medusa v2 sovereign backend, Payload E-Commerce, Stripe, Razorpay, Vendure), and database (Drizzle ORM with typed schema, Neon, Supabase, Postgres Docker, SQLite). Trigger whenever the user asks for 'new-project', 'Agent Engine', 'DOX Engine', 'scaffold Project OS', or to initialize an agent-governed workspace."
version: 2.6.0
author: DOX Engine Provisioner
license: MIT
platforms: [macos, linux, windows]
category: core-engine
metadata:
  category: core-engine
  priority: 5
  aliases: ["Agent Engine","DOX Engine","agent-engine","dox-engine"]
  suggested_skills: ["ai-ready","updateagents","updatedocs","git"]
  hermes:
    tags: [scaffolding, governance, project-os, architecture, nextjs, astro, instatic, expo, capacitor, nanostores, wordpress, dox, agent-engine, dox-engine]
    related_skills: [ai-ready, updateagents, updatedocs, git]
    suggested_skills: [ai-ready, updateagents, updatedocs, git]
    requires_tools: [bash, view_file, write_to_file]
  openclaw:
    category: core-engine
    suggested_skills: [ai-ready, updateagents, updatedocs, git]
    primary_triggers: ["new-project","Agent Engine","DOX Engine","scaffold Project OS","initialize agent workspace"]
    requires_tools: [bash, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🚀 new-project — Purpose-First Project OS & DOX Scaffolder

> **Aliases**: `Agent Engine` | `DOX Engine` | `agent-engine` | `dox-engine`

Interactive project creator and Project Operating System provisioner. Implements the **Purpose-First Hierarchical Decision Engine** across **6 Sequential Execution Stages**:

```
[ 🎯 Stage 1: Purpose-First Prompt ] ──► [ ⚡ Stage 2: Hierarchical Decision Tree ]
                                                      │
[ 🎨 Stage 4: Modern OKLCH / BEM ]   ◄── [ 🔌 Stage 3: Official Package Wiring ]
         │
         ▼
[ 📖 Stage 5: Client Intake Brief ] ──► [ ✅ Stage 6: Closeout ]
```

0. **Stage 0: AI-Ready Pre-Flight Gate**: Audits if root `AGENTS.md` and `.agents/` container already exist and pass `ai-ready` audit.
1. **Stage 1: Purpose-First Root Prompt & Project Identity**: Initiates interactively by querying the foundational domain purpose before prompting for identity, mission, and scope.
2. **Stage 2: Hierarchical Decision Tree**: Prunes irrelevant questions based on selected purpose across 6 branches (Static, Content, Ecommerce, WebApp, Mobile, Custom).
3. **Stage 3: Official Package Installation & Config Auto-Wiring**: Automatically wires framework configs (`astro.config.mjs`, `uno.config.ts`, `postcss.config.mjs`, `src/lib/medusa.ts`, `db.ts`, `auth.ts`, `capacitor.config.ts`, `.env.example`) and synchronizes official dependencies in `package.json` with self-verification.
4. **Stage 4: Modern Tokens & BEM Architecture Injection**: Injects wide-gamut OKLCH tokens, fluid `clamp()` typography & spacing scales (`src/styles/tokens.css`), and reusable semantic BEM classes (`.c-card`, `.c-button`, `.c-product-grid`, `.c-cart-drawer`).
5. **Stage 5: Client Intake Brief**: Writes `Client-Intake/00-Intake-Brief.md` (employee checklist pre-filled from scaffold answers + agent instructions). Intake docs and `start-here.md` are written by the AI agent AFTER scaffolding, from real employee answers.
6. **Stage 6: Closeout**: Synchronizes `.agents/context/` (decisions ADRs, product, current, architecture) and runs the health check.

---

## When to Use

- User invokes or references *"Agent Engine"*, *"DOX Engine"*, *"new-project"*, *"scaffold a workspace"*, or *"initialize Project OS"*.
- Provisioning a new client web application, headless storefront, digital publication, SaaS, or mobile app.
- Equipping an existing repository with the Agent Engine / Progressive Disclosure DOX architecture.
- Scaffolding a full-stack Next.js, Astro, Instatic, WordPress, or Expo project with companion integrations.
- Converting an Astro or Next.js web application to native iOS and Android APK via Ionic Capacitor.

---

## Quick Reference & Presets

### ⚡ 1-Click Agency Golden Presets

| Preset Flag | Target Intent | Core Stack & Companions |
| :--- | :--- | :--- |
| `--preset=powerhouse` / `next-commerce` | E-Commerce / Full-Stack | Next.js 16 (`@latest`) + Hybrid UnoCSS Wind 4 + Motion.dev + NanoStores + Payload CMS + Puck Visual Builder + Payload E-Commerce + Neon DB + Better Auth |
| `--preset=astro-commerce` | E-Commerce / High-Performance | Astro v7 (`@latest`) + Hybrid UnoCSS + NanoStores + Aria Builder (`ariabuilder.io`) + Medusa 2.0 Sovereign Backend (Postgres/Redis Docker) |
| `--preset=publisher` / `astro-blog` | Content / Publication | Astro v7 (`@latest`, zero-JS baseline) + Hybrid UnoCSS + Motion.dev + NanoStores + StudioCMS (LibSQL/Turso native) |
| `--preset=edge` / `astro-emdash` | Static Edge Publication | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Emdash CMS (Cloudflare D1/R2) |
| `--preset=plain-astro` / `astro-plain` | Pure Content Baseline | Astro v7 (Zero-JS, zero React) + Hybrid UnoCSS Wind 4 + Hardware CSS Animations |
| `--preset=git-cms` / `astro-git` | Git-backed Content Site | Astro v7 + Native Content Collections + Markdown/MDX + RSS Feed + Hybrid UnoCSS |
| `--preset=visual` | Brochure & Visual Sites | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Aria Builder (`ariabuilder.io`) + Fastrr 1-click checkout |
| `--preset=astro-visual` | Visual Marketing Site | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Aria Builder (`ariabuilder.io`) |
| `--preset=instatic` | Pure HTML Sites | Instatic SSG + Semantic BEM CSS + Hardware CSS Animations (Zero Node/JS runtime) |
| `--preset=pure-html` | Standalone Static Site | Pure HTML5 + Semantic BEM CSS + Fluid OKLCH Tokens (Zero build step, instant load) |
| `--preset=mobile` | Cross-Platform App | React Native (Expo `@latest`) + NativeWind + Supabase Backend |
| `--preset=astro-mobile` | Web-to-APK / Mobile App | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Aria Builder + **Ionic Capacitor** (iOS/APK) |
| `--preset=atomic-payload` | Website Builder (Admin-Driven) | Atomic Payload official template (`pro-laico`) — Payload 3 + Next.js 16 + Tailwind with every `@pro-laico/*` plugin, MongoDB + Vercel Blob (admin at `localhost:42100/admin`) |

**Isolated official scaffold rule**: any preset or flag set selecting `ariabuilder` OR `atomic-payload` provisions the official isolated scaffold only (Aria Builder ships its own Astro + UnoCSS with Wind 4 preset + CMS + SQLite; Atomic Payload ships its own Payload 3 + Next.js 16 + Tailwind with every `@pro-laico/*` plugin). Every other companion in the preset is skipped with a printed notice and added only on explicit request.

---

## Supported Framework Archetypes (`@latest`)

| Framework | Mental Model & Directives | Scaffolder |
| :--- | :--- | :--- |
| **Next.js 16** | React 19 + App Router + Server Actions | `bun create next-app@latest .` |
| **Astro v7** | Static-first (0kB JS baseline). React strictly for dynamic islands | `bun create astro@latest .` |
| **Instatic HTML** | Pure HTML brochure, zero compute overhead | Instatic SSG starter |
| **Roots Bedrock** | Modern WordPress 6.x (12-factor, Composer, dotenv, Gutenberg) | `composer create-project roots/bedrock .` |
| **React Native (Expo)** | Cross-platform iOS/Android mobile apps | `bun create expo-app@latest .` |
| **None / Existing** | Governance container only (DOX baseline on existing repo) | Agents First only |

---

## Procedure

### 🎯 6 Sequential Execution Stages

### Stage 1: Purpose-First Root Prompt & Project Identity
The provisioner never guesses the project domain from ambient files. It prompts:
```text
🎯 What is the primary purpose of this project?
  [1] Static Website          (Brochure, portfolio, landing page, minimal or zero compute)
  [2] Dynamic Content Website (Blog, publication, documentation, agency editorial)
  [3] Ecommerce Storefront    (Catalog, shopping cart, checkout, payments, inventory)
  [4] Full-Stack Web App      (SaaS, dashboard, auth, multi-tenant DB, background jobs)
  [5] Mobile Application      (Native iOS/Android, Expo React Native, or web-to-APK)
  [6] Custom / Infrastructure (Library, monorepo package, agent workspace, custom stack)
```
Gathers project name, tagline, author/organization, target audience, core problem, features, industry vertical, and catalog offerings.

### Stage 2: Hierarchical Decision Tree & Interactive Tradeoff Engine
Each selection prunes irrelevant downstream choices while explicitly surfacing architectural tradeoffs (Lightweight vs. Full-Stack, Serverless vs. Local Container, Git-based vs. Embedded DB) so the user is in full control without opaque defaults or mystery breaks:
- **Branch A (Static Website / Landing Page)**: Pure HTML/CSS (Zero build step, semantic BEM, OKLCH fluid design tokens) vs Instatic SSG vs Astro v7 vs Next.js SSG ➔ Hybrid UnoCSS Wind 4 vs Semantic BEM ➔ Hardware CSS animations vs Motion.dev. (Aria Builder is not an Astro add-on — selecting it provisions the isolated official scaffold instead of this branch's companions.)
- **Branch B (Dynamic Content Website)**:
  - *Astro v7 (Zero-JS baseline, islands)*:
    - **StudioCMS** (Astro DB / Turso native persistence) — Recommended for content blogs.
    - **Emdash CMS** (Cloudflare Workers, D1 database, and R2 storage) — Recommended for edge publications.
    - **Aria Builder** (`ariabuilder.io`) — Visual drag-and-drop page builder for marketing sites. Isolated official clone (ships its own Astro + UnoCSS + CMS + SQLite); all other companions are skipped unless explicitly requested.
    - **WollyCMS** — Self-hosted headless CMS for Astro (pages, blocks, media, revisions, Content/Admin/GraphQL APIs). Official Astro integration `@wollycms/astro` wired with local endpoint; run the CMS via `npx create-wolly@latest` per its quick start.
    - **Keystatic** — Zero DB overhead, Git-committed Markdown/MDX collections.
  - *Next.js 16 (React 19 App Router)*:
    - **Payload CMS 3.0 + Puck Visual Builder** — Full-stack database collections with interactive visual block editing.
    - **Payload CMS 3.0 Standard** — Lexical rich text editor and typed collections.
    - **Atomic Payload** (`pro-laico`) — official website-builder template: Payload + Next.js + Tailwind with every `@pro-laico/*` plugin (site, atomic, styles, fonts, icons, images, mux-video, tracking, seed, richtext, zap, core); pages composed in the admin render immediately. Isolated official scaffold — all other companions are skipped. Not an e-commerce engine: add commerce later via the Payload E-Commerce plugin.
    - **Keystatic** — Flat-file Git collections.
  - *Roots Bedrock*: Modern 12-factor WordPress with Composer and Gutenberg blocks.
- **Branch C (Ecommerce Storefront)**: E-Commerce Tradeoff Questionnaire (Aria Builder never pairs here — it provisions as the isolated official scaffold; pair Medusa with plain Astro or Next.js instead):
  - **Astro + MedusaJS**: High-performance zero-JS storefront with Medusa v2 Sovereign Engine (Recommended for Speed).
  - **Next.js + Payload CMS + Puck + Payload E-Commerce**: All-in-one unified Next.js App Router application with Puck visual builder and native Product/Order/Customer/Stripe collections (Recommended for Fullstack All-in-One).
  - **Next.js + Medusa v2 Sovereign Engine**: Next.js App Router frontend with Medusa sovereign backend.
  - **Stripe Direct Checkout**: Lightweight zero-backend payments with hosted checkout and webhook routes.
  - **Fastrr 1-Click / Razorpay**: Accelerated mobile checkout for D2C brands.
  - **Vendure**: Scalable enterprise TypeScript GraphQL backend.
- **Branch D (Full-Stack Web App)**: Next.js 16 App Router vs Astro SSR ➔ Database & Auth Tradeoffs:
  - *Database*: Neon Serverless Postgres (zero local infrastructure) vs Supabase (managed BaaS) vs Local Docker Postgres 16 (isolated local dev container) vs SQLite/Turso.
  - *Authentication*: Better Auth (Drizzle ORM adapter, full local control, typed client SDK) vs Supabase Auth (managed BaaS) vs NextAuth/Auth.js.
  - *State Management*: NanoStores (sub-1KB cross-framework reactive store) vs Zustand (React-only).
- **Branch E (Mobile Application)**: React Native with Expo vs Astro + Ionic Capacitor (web-to-APK) vs Next.js + Capacitor.
- **Branch F (Custom / Infrastructure)**: Custom architecture or governance-only workspace.

### Stage 3: Official Package Installation & Full End-to-End Companion Wiring
The provisioner enforces **Zero Half-Baked Stubs**. Every selected technology is provisioned with its complete working ecosystem—schemas, route handlers, client SDKs, admin UIs, and Docker container services:
- **Pure HTML/CSS Framework Option (`--type=html` / `pure-html`)**:
  - Standalone `index.html` with semantic BEM classes, linking wide-gamut OKLCH design tokens, reset, and hardware-accelerated animations with zero build step.
  - Pinned `package.json` scripts (`bun x serve .`, `bun test`, `biome check src`).
- **Database & Drizzle ORM**:
  - `src/lib/schema.ts`: Fully-typed starter schema defining relational `users` and `posts` tables.
  - `src/lib/db.ts`: Connection pool client exporting both `db` and re-exporting `* from './schema'`.
  - `drizzle.config.ts`: Configured pointing to `./src/lib/schema.ts` with output to `./drizzle`.
  - `docker-compose.yml`: For containerized Postgres (`--db=postgres`), provisions a local PostgreSQL 16 container with healthchecks and persistent volumes.
- **Authentication (Better Auth & Supabase)**:
  - `src/lib/auth.ts`: Server-side Better Auth initialization configured with the Drizzle ORM adapter and database schema.
  - `src/lib/auth-client.ts`: Client-side React SDK (`createAuthClient`) exporting `signIn`, `signUp`, `signOut`, and `useSession` for immediate UI consumption.
  - Route Handlers: `src/app/api/auth/[...all]/route.ts` (Next.js App Router) or `src/pages/api/auth/[...all].ts` (Astro) wrapping `auth.handler`.
  - `src/lib/supabase-server.ts`: Server-side Supabase client with cookie storage adapters for SSR.
- **Aria Builder (isolated official scaffold)**: Aria ships its own Astro + UnoCSS + CMS + SQLite, so selecting it clones the official repo untouched and adds nothing else unless explicitly requested:
  - `git clone https://github.com/ariabuilder/aria.git` into the target, `npm install` (skipped with `--skip-install`), `npm run dev`.
  - Open `http://localhost:4321/admin`; first visit completes setup at `http://localhost:4321/admin/setup` to create the first administrator.
  - Engine ensures the UnoCSS **Wind 4 preset** in `./uno.user.config.ts` (upstream ships Wind3) and leaves everything else byte-identical to upstream. No `bun create astro`, no companion overlays, no token injection, no package.json rewrite.
- **Atomic Payload (isolated official scaffold)**: upstream ships a complete Payload 3 + Next.js 16 + Tailwind stack with every `@pro-laico/*` plugin, so selecting it provisions the official published template untouched and adds nothing else unless explicitly requested:
  - Extracts the official published template via `npm pack @pro-laico/create-atomic-payload` (the official CLI cannot run in-place once engine governance files exist), merges it in with skip-if-exists so engine files are never overwritten, copies `.env.example` → `.env` (only if absent, per the official CLI's own behavior), merges the upstream gitignore under an `# Atomic Payload Upstream Defaults` header, and runs `pnpm install` (the official package manager) unless `--skip-install`.
  - Never: re-scaffolds the framework, overlays companion configs, injects engine tokens, or rewrites the upstream package.json.
  - Run `pnpm generate:types && pnpm generate:importmap`, `pnpm dev`, open `http://localhost:42100/admin` (create the first admin user; seed via the 'Seed database' dashboard banner).
- **Content Management Systems (CMS)**:
  - *Payload CMS 3.0 & E-Commerce Module*: `payload.config.ts`, strongly-typed collections (`Users.ts`, `Media.ts`, `Pages.ts`, `Products.ts`, `Orders.ts`, `Customers.ts`), Next.js App Router admin UI (`src/app/(payload)/admin/page.tsx`), REST API route handler (`src/app/(payload)/api/[...slug]/route.ts`), Stripe checkout endpoint (`src/app/api/payload-checkout/route.ts`), and `importMap.js`.
  - *StudioCMS*: `studiocms.config.mjs`, Astro DB integration, and `astro.config.mjs` integration wiring (`studioCMS()`).
  - *Emdash CMS*: `emdash.config.ts`, Cloudflare D1/R2 routing, starter markdown article in `src/content/blog/welcome.md`, and blog listing at `src/pages/blog/index.astro`.
  - *Keystatic*: `keystatic.config.ts`, initial post in `src/content/posts/welcome.mdoc`, Next.js App Router and Astro admin pages (`/keystatic`) and API route handlers (`/api/keystatic`).
  - *Puck Visual Builder*: Strongly-typed component schema in `src/lib/puck.config.tsx` and Next.js App Router editor (`src/app/puck/[...puckPath]/client.tsx` and `page.tsx`).
- **E-Commerce Engines**:
  - *Medusa 2.0 Sovereign Backend*: Fully scaffolded `backend/` directory with `medusa-config.ts`, `docker-compose.yml` (PostgreSQL 16 + Redis 7), `package.json`, `tsconfig.json`, `.env.example`, and custom route `/src/api/store/custom/route.ts`, alongside the frontend client SDK in `src/lib/medusa.ts`.
  - *Stripe*: Server client in `src/lib/stripe.ts`, Checkout session creation route handler in `src/app/api/checkout/route.ts`, and webhook signature verification route in `src/app/api/webhooks/stripe/route.ts`.
  - *Razorpay*: Server client and order creation endpoint in `src/lib/razorpay.ts`.
  - *Vendure*: Typed GraphQL client for catalog queries and mutations in `src/lib/vendure.ts`.
- **Mobile & Styling Integrations**:
  - `capacitor.config.ts`: Cross-platform mobile configuration for Ionic Capacitor (`@capacitor/cli`, `@capacitor/core`).
  - `uno.config.ts` & `postcss.config.mjs`: UnoCSS Wind 4 presets, icon collections, and fluid typography tokens.
  - `src/stores/app.ts`: NanoStores sub-1KB reactive store for cross-framework state.
- **Day-1 Proof-of-Life Starter Dashboard UI**:
  - `src/app/page.tsx` & `src/app/layout.tsx` (Next.js), `src/pages/index.astro` (Astro), or `index.html` (Pure HTML): Generates an interactive live dashboard that immediately exercises the selected stack upon startup.
  - `src/app/page.tsx` & `src/app/layout.tsx` (Next.js) or `src/pages/index.astro` (Astro): Generates an interactive live dashboard that immediately exercises the selected stack upon `bun run dev` (Drizzle DB status, Better Auth client SDK status, Stripe checkout trigger, and quick-launch links to `/admin`, `/keystatic`, or `/puck`).
- **Production Deployment Artifacts & CI/CD**:
  - `.github/workflows/ci.yml`: Automated CI pipeline running dependencies installation, TypeScript checking, test runner, and Vibeguard secret audits.
  - `Dockerfile` & `.dockerignore`: Multi-stage production container for Node/Bun with unprivileged non-root user (`--deploy=docker`).
  - `wrangler.toml`: Cloudflare Workers / Pages configuration with node compatibility and binding placeholders (`--deploy=cloudflare`).
  - `vercel.json`: Production headers, function rules, and security policies (`--deploy=vercel`).
- **Automated Quality Gates & Test Suite**:
  - `tests/health.test.ts`: Out-of-the-box health check asserting environment configuration, AI governance container, and design tokens baseline.
  - `biome.json`: High-speed zero-config linter and formatter.
- **Day-1 Secret Defense (Vibeguard Pre-Commit Hook)**:
  - `scripts/pre-commit.sh` & `.git/hooks/pre-commit`: Executable pre-commit hook that automatically blocks commits containing staged `.env` files or high-entropy credentials.
- **Package Scripts & Secrets Injection**:
  - Injects `setup` (one-command bootstrap handling dependencies, Docker container startup, and Drizzle migrations), `test` (`bun test`), `lint` (`biome check src`), `format` (`biome format --write src`), and `precommit` (`bash scripts/pre-commit.sh`).
  - Automatically provisions `db:generate`, `db:push`, `docker:up`, `docker:down`, `payload`, `dev:backend`, and `backend:migrate` into `package.json`.
  - Automatically populates all required connection strings, database URLs, and API secret keys into `.env.example`.
  - Synchronizes official dependencies in `package.json` with self-verification gate.

### Stage 4: Modern Tokens & BEM Architecture Injection
- `src/styles/tokens.css`: Wide-gamut OKLCH colors (choice of 37 official palettes from `oklch.fyi`: 16 Radix scales + 21 curated designer themes like `sunset-vibes`, `deep-sea`, `forest`, `neon-nights`, etc.), fluid typography scale via `clamp()`, fluid spacing scale via `clamp()`, and 12-step numeric scales (`--color-scale-1` through `12`).
- `.agents/skills/oklch-skill/`: Automatically provisions project-scoped `oklch-skill` (strictly project-only, zero global pollution) with full color conversion, APCA/WCAG contrast guidelines, gamut clamping, and UnoCSS Wind 4 `@theme` mappings.
- `src/styles/semantic.css`: Reusable semantic BEM classes (`.c-card`, `.c-button`, `.c-product-grid`, `.c-product-card`, `.c-cart-drawer`).
- `src/styles/animations.css`: Hardware-accelerated GPU animations with `prefers-reduced-motion` compliance.

### Stage 5: Client Intake Brief (Instructions, Not Documents)
The engine writes ONE file: `Client-Intake/00-Intake-Brief.md` — pre-filled with scaffold-time answers (name, purpose, audience, palette, etc.) plus an employee checklist and agent instructions. It does NOT pre-generate the intake documents; those are produced by the AI agent AFTER scaffolding, grounded in real employee answers:

**Post-scaffold onboarding flow (agent-driven)**:
1. Read `./Client-Intake/00-Intake-Brief.md` with the employee and collect answers to the checklist (brand corrections, business context, offerings, technical access, scope boundaries).
2. Write `01-Brand/`, `02-Business/`, `03-Offerings/`, and `04-Technical-Intake/` documents from those answers — real content only, no invented filler.
3. Write `./start-here.md`: a short developer orientation derived from the actual scaffolded stack (install/run commands from `package.json`, token locations, verification steps).
4. Sync answers into `.agents/context/product.md` and `.memory/CURRENT.md`.

**Durable DOX Closeout (engine-run at scaffold)**:
- Populates `.agents/context/decisions.md` with dynamic Architectural Decision Records (ADR-001 through ADR-006).
- Populates `.agents/context/product.md` with dynamic project vision, target audience, problem statement, and catalog offerings.
- Records initial shipped state in `.agents/context/current.md` and `.agents/context/architecture.md`.

---

## CLI Usage & Flags Reference

```bash
# Interactive Mode (Prompts for Purpose -> Hierarchical Tree -> Stack)
bun new-project/scripts/new-project.ts

# 1-Click Agency Golden Presets
bun new-project/scripts/new-project.ts <targetPath> --preset=powerhouse
bun new-project/scripts/new-project.ts <targetPath> --preset=astro-mobile

# Granular Non-Interactive Mode
bun new-project/scripts/new-project.ts <targetPath> \
  --intent=ecommerce \
  --type=nextjs \
  --styling=hybrid \
  --animation=motion \
  --state=nanostores \
  --mobile=capacitor \
  --cms=payload \
  --puck \
  --ecommerce=medusa \
  --db=postgres \
  --auth=better-auth \
  --non-interactive
```

| Flag | Type | Description |
| :--- | :--- | :--- |
| `-n, --name <name>` | String | Project name (default: directory basename) |
| `-p, --path <path>` | String | Target directory path |
| `--author <name>` | String | Project author or organization name |
| `--tagline <desc>` | String | Project mission or summary |
| `--audience <aud>` | String | Target audience or user persona |
| `--problem <prob>` | String | Core problem solved by the project |
| `--features <list>` | String | Comma-separated core features |
| `--industry <niche>`| String | Industry or vertical |
| `--offerings <items>`| String | Core catalog items or services |
| `--tone <tone>` | String | Brand voice / design aesthetic |
| `--palette <color>` | String | Brand theme: `slate` \| `indigo` \| `emerald` \| `amber` \| `violet` |
| `--first-milestone <m>` | String | Immediate next task / initial milestone |
| `--planned-milestones <l>`| String | Comma-separated planned milestones |
| `--agent-name <name>` | String | Lead autonomous agent persona (default: `Orchestrator`) |
| `--agent-role <role>` | String | Lead agent functional role description |
| `--constraint <text>` | String | Primary operational constraint or invariant |
| `-i, --intent <intent>` | String | `brochure` \| `content` \| `ecommerce` \| `app` \| `mobile` \| `governance` |
| `--preset <preset>` | String | `powerhouse` \| `astro-commerce` \| `publisher` \| `edge` \| `visual` \| `astro-visual` \| `plain-astro` \| `git-cms` \| `instatic` \| `pure-html` \| `mobile` \| `astro-mobile` \| `atomic-payload` |
| `-t, --type <framework>` | String | `nextjs` \| `astro` \| `instatic` \| `wordpress` \| `expo` \| `custom` \| `none` |
| `-s, --styling <styling>` | String | `hybrid` (UnoCSS Wind 4 + BEM) \| `unocss` \| `bem` \| `tailwind` \| `custom` \| `none` |
| `-a, --animation <anim>` | String | `css` (Hardware presets) \| `motion` \| `gsap` \| `webgl` \| `custom` \| `none` |
| `--state <engine>` | String | `nanostores` (Sub-1KB cross-island store) \| `custom` \| `none` |
| `-m, --mobile <target>` | String | `capacitor` (Ionic Capacitor iOS/APK wrapper) \| `expo` (React Native) \| `custom` \| `none` |
| `-c, --cms <cms>` | String | `ariabuilder` \| `atomic-payload` \| `studiocms` \| `tina` \| `keystatic` \| `emdash` \| `payload` \| `wollycms` \| `decap` \| `keystone` \| `sanity` \| `strapi` \| `custom` \| `none` |
| `--puck` | Boolean | Enable Puck Visual Builder (for Payload CMS) |
| `-e, --ecommerce <ecom>` | String | `payload` \| `medusa` \| `vendure` \| `fastrr` \| `razorpay` \| `stripe` \| `custom` \| `none` |
| `--db <db>` | String | `neon` \| `supabase` \| `postgres` \| `sqlite` \| `custom` \| `none` |
| `--auth <auth>` | String | `better-auth` \| `supabase` \| `authjs` \| `custom` \| `none` |
| `--deploy <deploy>` | String | `cloudflare` \| `docker` \| `vercel` \| `custom` \| `none` |
| `--skip-install` | Boolean | Skip running bun install |
| `--dry-run` | Boolean | Simulate without writing files |
| `--non-interactive` | Boolean | Run without interactive prompts |
| `-f, --force` | Boolean | Overwrite existing files |

---

## Official Stack Setup References (Post-Scaffold Agent Procedures)

When the intake brief or a stack change requires provisioning a companion manually, follow these official procedures. Always use `@latest` resolution (`bun add <pkg>` / `npm i <pkg>`), never pinned versions.

### Payload CMS 3.0
Official docs: **Astro** → https://docs.astro.build/en/guides/cms/payload/ · **All other frameworks** → https://payloadcms.com/docs/getting-started/installation
1. Next.js App Router: install `payload`, `@payloadcms/next`, `@payloadcms/db-sqlite` (or `@payloadcms/db-postgres`), `@payloadcms/richtext-lexical`, `@payloadcms/translations`, `sharp`.
2. Copy the `(payload)` route group into `src/app/(payload)/` from `node_modules/@payloadcms/templates` (or generate `payload.config.ts` with collections, Lexical editor, `secret: process.env.PAYLOAD_SECRET`, and the chosen `db` adapter).
3. Wire `next.config.mjs` with `withPayload` and add `"@payload-config": ["./src/payload.config.ts"]` to `tsconfig.json` paths.
4. Add `PAYLOAD_SECRET` to `.env`, then `npm run dev` and open `/admin` to create the first user.

### Payload E-Commerce Module
Follow the official overview: https://payloadcms.com/docs/ecommerce/overview

### Aria Builder (isolated official scaffold — Astro + UnoCSS + CMS + SQLite included)
1. `git clone https://github.com/ariabuilder/aria.git`
2. `cd aria && npm install`
3. `npm run dev`
4. Open `http://localhost:4321/admin`. On first visit, complete setup at `http://localhost:4321/admin/setup` to create the first administrator.
5. The engine additionally ensures the UnoCSS **Wind 4 preset** in `./uno.user.config.ts` (upstream ships Wind3). Nothing else is added or overlaid — no framework re-scaffold, no companion wiring, no token injection. Request extra features after scaffolding and they will be layered on explicitly.

### Atomic Payload (isolated official scaffold — Payload + Next.js + Tailwind website builder)
1. `npx @pro-laico/create-atomic-payload my-site` (or `.` for the current directory; `--template atomic-payload` skips the prompt; minimal examples `fonts-only` / `icons-only` / `images-only` / `styles-only`). Project names must be lowercase/hyphens; the CLI exits 1 on an existing non-empty target.
2. The CLI copies the official template, installs with pnpm, rebuilds sharp, and copies `.env.example` to `.env`.
3. Fill `.env`: `MONGODB_URI` (MongoDB Atlas), `BLOB_READ_WRITE_TOKEN` (Vercel Blob), `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL` (plus `FONT_DOWNLOAD_URL` when using the fonts plugin).
4. `pnpm generate:types && pnpm generate:importmap && pnpm generate:icons` (the icon-usage manifest runs automatically in `prebuild`), then `pnpm dev`.
5. Open `http://localhost:42100/admin` (dev server port is 42100, NOT 3000): create the first admin user on first visit, then seed via the 'Seed database' dashboard banner; per upstream docs, afterwards pass `enabled: false` to `seedPlugin()` in `src/plugins/index.ts` to drop the seed endpoint. Not an e-commerce engine — commerce is added later via the Payload E-Commerce plugin (payloadcms.com/docs/ecommerce/overview).
6. Engine path note: the engine extracts the official published template untouched — no overlays, no companion wiring, no token injection. Full docs at atomicpayload.com (upstream is not affiliated with Payload CMS).

### WollyCMS (self-hosted headless CMS for Astro)
1. New WollyCMS project: `npx create-wolly@latest my-site && cd my-site && npm run migrate && npm run seed && npm run dev` (requires Node.js 22 LTS; API + admin at `http://localhost:4321`, default login `admin@wollycms.local` / `admin123`). Templates: `blog`, `marketing`, `wordpress`, `drupal`, `college` via `--template=<name>`.
2. In the scaffolded Astro project the engine wires the official integration: `npm install @wollycms/astro` + `wollycms({ endpoint: 'http://localhost:4321' })` in `astro.config.mjs`.
3. Docker/self-host: `ghcr.io/wollycms/wollycms:latest` with `JWT_SECRET` set and `/app/data` persisted. Full docs at `https://docs.wollycms.com/` — always refer to the latest upstream docs before changing this flow.

### Emdash CMS (Astro edge CMS)
1. Create a new project: `npm create emdash@latest`, then follow the prompts to name the project and set your preferences.
2. Move in and start the dev server: `cd my-emdash-site && npm install && npm run dev`, then open http://localhost:4321.
3. Complete the Setup Wizard: visit http://localhost:4321/_emdash/admin — you are redirected to the wizard. Enter **Site Title**, **Tagline**, and **Admin Email**, then click **Create Site** to register your passkey (Touch ID, Face ID, Windows Hello, or a security key). Once registered you are logged in and redirected to the admin dashboard.
4. Content lives as `_emdash` live collections; edit via `/admin`, consume via `getLiveCollection`/`getLiveEntry`.
5. For production on Cloudflare Workers, provision D1/R2 bindings (this is what the engine's `preset=edge` path generates with `wrangler.jsonc` and `src/worker.ts`; the engine also wires `adminRoute: '/_emdash/admin'` to match the official wizard URL).

### Tina CMS
- **Interactive TinaCMS starter site locally**: `npx create-tina-app@latest`
- **Scaffold the Astro starter directly**: `npx create-tina-app@latest --template tina-astro-starter`

### Keystatic CMS
- Starting a new Astro + Keystatic project from scratch: `npm create @keystatic@latest` (generates a ready-to-run project in seconds). In an existing scaffold, the engine wires `keystatic.config.ts` plus `/keystatic` admin pages and `/api/keystatic` handlers.

### Decap CMS (Astro)
Two options for adding Decap to Astro:
1. Install Decap via a package manager: `npm install decap-cms-app`, then import the package into a `<script>` tag in your page `<body>` (e.g. `/admin`).
2. Or include the CDN bundle directly in the `/admin` page body: `<script src="https://unpkg.com/decap-cms@^3.1.2/dist/decap-cms.js"></script>`

### Keystone CMS
Follow the official walkthrough: https://keystonejs.com/docs/walkthroughs/lesson-1

### Sanity CMS
- **Astro**: official integration at https://www.sanity.io/plugins/sanity-astro — install with `npx astro add @sanity/astro @astrojs/react` (note: `@astrojs/react` is only needed if you plan to embed a Sanity Studio in the project). Manual dependency install: `npm install @astrojs/react @sanity/astro @sanity/client sanity @types/react-dom @types/react-is @types/react react-dom react-is react styled-components`. Starter template: https://www.sanity.io/templates/astro-sanity-clean
- **Next.js**: follow the Studio quickstart at https://www.sanity.io/docs/next-js-quickstart/setting-up-your-studio

### Strapi CMS
- **Astro**: https://docs.astro.build/en/guides/cms/strapi/
- **Other frameworks**: `npx create-strapi-app@latest`

### Custom CMS
Bring your own: wire the CMS strictly per its official documentation, keep credentials in `.env` (never committed), and record the integration as an ADR in `.agents/context/decisions.md`.

### Puck Visual Editor
1. Install `@puckeditor/core` (the official package — renamed from `@measured/puck`): `npm i @puckeditor/core --save`.
2. Or generate a Puck application using a recipe: `npx create-puck-app my-app`.
3. Full getting-started detail (rendering the editor): https://puckeditor.com/docs/getting-started#render-the-editor — render pages with `<Puck>` (edit route) / `<Render>` (public route).

### Medusa JS (Sovereign Commerce Backend)
1. **Prerequisites**: Node.js v20.19.0+ or v22.12.0+ (LTS versions only; use Node v24 LTS or lower if installing the Next.js Starter Storefront), the Git CLI, and PostgreSQL installed and running.
2. Create the application: `npx create-medusa-app@latest my-medusa-store` (tip: yarn/pnpm install faster than npm — `yarn dlx create-medusa-app@latest my-medusa-store` or add `--use-yarn`). The PostgreSQL database created is named `medusa-my-medusa-store`; you are asked whether to install the Next.js Starter Storefront.
3. The command installs a monorepo: backend + admin dashboard in `apps/backend`, and (if chosen) the storefront in `apps/storefront`.
4. On success the Medusa app runs at http://localhost:9000 and the Admin dashboard at http://localhost:9000/app (the installer opens it to create the first user). The Next.js Starter Storefront runs at http://localhost:8000.
5. Engine path: when provisioned by the engine, `./backend/` ships `medusa-config.ts`, `docker-compose.yml` (PostgreSQL 16 + Redis 7), and the frontend SDK in `src/lib/medusa.ts` — always defer to the official `create-medusa-app` flow above for a fresh backend.

### Vendure
1. `npx @vendure/create my-shop` (replace `my-shop` with your project name), then choose the **Quick Start** option — the fastest path, handling all configuration.
2. With Docker Desktop installed it creates and configures a Postgres database; otherwise it uses SQLite.
3. Official docs: https://docs.vendure.io/current/core/getting-started/installation

### Neon Serverless Postgres
- **Next.js**: https://neon.com/docs/guides/nextjs
- **Astro**: https://neon.com/docs/guides/astro
- **Medusa**: https://neon.com/docs/guides/medusajs

### Supabase
- **Next.js**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **Astro**: https://supabase.com/docs/guides/getting-started/quickstarts/astrojs
- **Expo React Native**: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native

### Instatic (zero-runtime SSG)
1. `npx create-instatic@latest` (or wire `instatic` into an existing Astro/HTML project) to generate `instatic.json`, content collections, and layout templates.
2. Author Markdown/MDX under the configured content directory; the compiler emits fully static pages at build time with zero client runtime.

---

## Pitfalls

- **Skipping Agents First**: Never run framework generation before AI governance is initialized, or framework defaults may overwrite or conflict with agent boundaries.
- **Cross-Project Bleed**: Never copy client-specific skills, assets, or memory files from sibling projects. Every project starts with a clean isolated container.
- **Committing Secrets**: Ensure `.env` is listed in `.gitignore` and `.env.example` exists. Follow the Vibeguard protocol.
- **Monolithic Memory Dumps**: Keep `.memory/CURRENT.md` for machine real-time invariants and `.agents/context/current.md` for durable shipped reality.
- **Never Ship Half-Baked Companion Stubs**: Never provision an SDK or integration flag without the accompanying route handlers, client SDKs, schemas, admin UIs, or container configs needed to actually run it. Every technology must be immediately runnable from a clean checkout.
- **Isolated Official Scaffolds (Aria Builder, Atomic Payload)**: these upstreams ship complete stacks — never overlay engine extras (framework re-scaffold, companion configs, tokens, CI, package.json rewrites); the isolation gate zeroes companion selections with a printed notice and extras are added only on explicit request after scaffolding.

---

## Verification

After scaffolding, verify the project:
1. **Intake Brief**: Check that `./Client-Intake/00-Intake-Brief.md` exists with pre-filled scaffold answers.
2. **Post-Scaffold Onboarding**: Walk the employee through the brief with your agent, then write the intake docs and `./start-here.md` it prescribes.
3. **Design Tokens**: Check wide-gamut OKLCH tokens and fluid clamp scales in `./src/styles/tokens.css` and `.c-*` classes in `semantic.css`.
4. **Governance Container**: Check `./.agents/` 9-folder tree and `./AGENTS.md`. Working artifacts (research corpora, planning docs, reports) live under `./.agents/artifacts/<topic>/` per its README contract stub — never the repo tree, never `./.memory`; durable findings promote to `./.agents/context/`.
5. **Database & Auth Completeness**: If database or auth is provisioned, verify `src/lib/schema.ts`, `src/lib/db.ts`, `src/lib/auth-client.ts`, and API route handlers (`/api/auth/[...all]`) exist and compile cleanly.
6. **CMS & Visual Builder Completeness**: If Payload, Keystatic, or Puck is enabled, verify config files (`payload.config.ts`, `keystatic.config.ts`), collection schemas, and admin UI pages exist.
7. **Aria Builder Isolation**: If Aria is enabled, verify the target holds the official upstream clone (`package.json` named `@ariabuilder/aria`, `astro.config.ts`, `uno.user.config.ts` with the Wind 4 preset) plus engine governance only — no `aria.config.mjs`, no `Aria*.astro` components, no `backend/`, no engine tokens/CI. Run `npm run dev` and complete first-admin setup at `http://localhost:4321/admin/setup`.
8. **Atomic Payload Isolation**: If Atomic is enabled, verify the target holds the official upstream template (`package.json` named `atomic-payload`, `src/payload.config.ts` with `buildConfig` + `mongooseAdapter`, `next.config.ts` with `withPayload`) plus engine governance only — no `src/styles/tokens.css`, no `uno.config.ts`, no Drizzle/CI/pre-commit overlays. Run `pnpm install`, `pnpm generate:types`, `pnpm dev`, open `http://localhost:42100/admin`, create the first admin, seed via the dashboard banner.
9. **Backend Engine**: If Medusa is provisioned, check `./backend/medusa-config.ts`, `./backend/docker-compose.yml`, and `./backend/package.json`. If PostgreSQL container is requested, check `./docker-compose.yml`.
10. **Day-1 Starter Dashboard**: Check that `src/app/page.tsx` (Next.js) or `src/pages/index.astro` (Astro) is provisioned with live stack badges and quick links.
11. **Deployment & CI/CD**: Verify `.github/workflows/ci.yml` is present, alongside `Dockerfile` / `wrangler.toml` / `vercel.json` matching `--deploy`.
12. **Quality Gates & Test Suite**: Run `bun test` inside the scaffolded workspace to confirm `tests/health.test.ts` passes cleanly.
13. **Day-1 Secret Defense**: Verify `scripts/pre-commit.sh` exists and is executable.
14. **Dynamic ADRs & Product DOX**: Check that `.agents/context/decisions.md` contains ADR-001 through ADR-006, and `.agents/context/product.md` reflects the interview scope.
15. **Secret Defense**: Verify no secrets or credentials appear in `.env` or git status. Run `bun ~/.config/LIFEOS/runtime/TOOLS/SecretScan.ts .` to ensure compliance with the Vibeguard protocol.
