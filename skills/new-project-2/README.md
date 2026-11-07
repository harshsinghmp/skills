# 🚀 `new-project` Skill

> Intent-First Autonomous Project Operating System & Progressive Disclosure DOX Scaffolder.  
> **Aliases**: `Agent Engine` | `DOX Engine`

`new-project` (also known as the **Agent Engine** or **DOX Engine**) transforms any new or existing workspace into a fully governed **AI-Native Operating Environment** following the **"Agents First, Then Intent-Driven Companions"** architecture.

---

## ⚡ Key Architectural Features

- **🛡️ Agents First (Governance Container)**: Provisions the lean root `AGENTS.md` (<50 lines) and the complete `.agents/` container *before* framework creation, establishing security boundaries and gitignore early.
- **🔒 Internal-Only Agent State**: The committed `.gitignore` is public-safe; agent/harness paths go to `.git/info/exclude` via `updateagents --install-excludes`. Anything a harness creates is consolidated under `.agents/<category>/` and the active harness is never moved mid-session.
- **📁 Complete 9-Folder `.agents/` Containment**:
  - `archive/` — Retired plans & completed scratchpads (`[title]-[timestamp].md`)
  - `artifacts/` — Active walkthroughs, specifications & diffs
  - `brand/` — Design tokens (DTCG OKLCH color palettes, typography, motion, radii) + BEM conventions + A11y checklist
  - `context/` — 7 durable context files (`index`, `product`, `architecture`, `brand`, `current`, `decisions`, `roadmap`)
  - `goals/` — Session goals & sprint verification checklists
  - `research/` — Deep research briefs & benchmark logs
  - `skills/` — Clean, isolated container for project-specific skills
  - `standards/` — 13 modular rulebooks read on-demand (Next.js, Astro, WordPress, testing, security, etc.)
  - `workflows/` — Custom project workflows & protocols
- **🎯 Intent-First Architecture**: Twelve project archetypes (static, content, e-commerce, SaaS, internal tool, native mobile, web-to-native, creative studio, OSS, growth, governance, custom) drive a tailored, pruned menu of compatible companions.
- **🏢 Client Onboarding as a First-Class Stage**: Captures identity, contacts, business model, stage/revenue, mission/vision, ICP, competitors, objections, offerings, launch KPI, scope boundaries, engagement terms (type, SLA, budget, dates, cadence), and technical access, then renders every `Client-Intake/` document plus a client-aware `start-here.md`. Re-runs accept `--intake <json|md>` or granular client flags.
- **🎨 Hybrid Styling Engine**: Combines `@unocss/preset-wind4` for utility speed with Custom Semantic BEM (`tokens.css`, `semantic.css`, `reset.css`) and OKLCH color variables.
- **🎭 High-Performance Animations**: Hardware-accelerated CSS presets (`.fade-in`, `.slide-up`, `.stagger-group`, `.reveal-on-scroll`, `.hover-lift`) alongside Motion.dev and GSAP ScrollTrigger.
- **🧠 NanoStores Cross-Island State Engine**: Sub-1KB, framework-agnostic reactive state sharing across Astro islands (React, Vue, Svelte, vanilla) and Next.js components.
- **📱 Native Mobile Conversion**: Converts Astro, Next.js, or static HTML web applications into native iOS and Android APK binaries via **Ionic Capacitor** (`@capacitor/cli`), or managed React Native via **Expo**.
- **📦 Sovereign Open-Source CMS & Commerce**: Priority support for Payload CMS (+ Puck Visual Builder), the Atomic Payload isolated official website-builder scaffold (`pro-laico`), Medusa v2, Aria Builder (`ariabuilder.io`), StudioCMS, and Git-based CMS (Tina, Keystatic).
- **🗄️ Database & Auth**: Native Drizzle ORM configuration for Neon, Supabase, Self-Hosted Postgres, and SQLite, paired with Better Auth.
- **⚡ Strict `@latest` Resolution**: All scaffolders and dependencies resolve to the latest stable release.

---

## 💻 Usage

Run via Bun:

```bash
# Interactive Mode (Prompts for Intent -> Framework -> Companions)
bun new-project/scripts/new-project.ts

# 1-Click Agency Preset
bun new-project/scripts/new-project.ts <targetPath> --preset=powerhouse

# Convert Astro Web App to Native iOS/APK
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
  --auth=better-auth

# Full client onboarding (interactive, generates every intake doc)
bun new-project/scripts/new-project.ts <targetPath> --onboard-client

# Client onboarding from a JSON/Markdown intake file
bun new-project/scripts/new-project.ts <targetPath> --intake=./client-answers.json --non-interactive

# Granular client flags
bun new-project/scripts/new-project.ts <targetPath> \
  --client-name="Acme Health LLC" --client-brand="Acme Health" \
  --client-contact="Dana Lee" --client-email="dana@acme.health" \
  --business-model=b2b-saas --company-stage=seed --revenue-band=1m-10m \
  --industry="Healthcare" --audience="Regional clinics" \
  --problem="Manual paper intake" --offerings="Intake Suite, EHR Sync" \
  --competitors="Epic, Cerner" --objections="Price, Migration effort" \
  --launch-goal="50 clinics onboarded" --boundaries="Native mobile app, Multi-language" \
  --domain=acme.health --dns-provider=cloudflare --git-host=github \
  --payments=stripe --integrations=hubspot,segment \
  --engagement=fixed-scope --sla-tier=priority --budget="USD 40k" \
  --comms-channel=slack --comms-cadence=weekly \
  --kickoff-date=2026-11-10 --deadline=2027-02-01 \
  --access-items="DNS, GitHub org, Stripe account" \
  --non-interactive
```

### ⚡ 1-Click Agency Presets

| Preset | Intent | Full Stack Composition |
| :--- | :--- | :--- |
| `--preset=powerhouse` | E-Commerce / Full-Stack | Next.js 16 (`@latest`) + Hybrid UnoCSS + Motion.dev + NanoStores + Payload CMS + Puck + Payload E-Commerce + Neon DB + Better Auth |
| `--preset=publisher` | Content / Publication | Astro v7 (`@latest`) + Hybrid UnoCSS + Motion.dev + NanoStores + StudioCMS (LibSQL/Turso) |
| `--preset=visual` | Visual Marketing Site | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Aria Builder (`ariabuilder.io`) + Fastrr 1-click checkout |
| `--preset=edge` | Static Edge Site | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Emdash CMS (Cloudflare D1/R2) |
| `--preset=instatic` | Pure HTML Site | Instatic SSG + Semantic BEM CSS + Hardware CSS Animations (Zero JS runtime) |
| `--preset=mobile` | Mobile Application | React Native (Expo `@latest`) + NativeWind + Supabase |
| `--preset=astro-mobile` | Web-to-APK / Mobile App | Astro v7 + Hybrid UnoCSS + Hardware CSS Animations + NanoStores + Aria Builder + **Ionic Capacitor** (iOS/APK) |
| `--preset=atomic-payload` | Website Builder (Admin-Driven) | Atomic Payload official template (`pro-laico`) — Payload 3 + Next.js 16 + Tailwind with every `@pro-laico/*` plugin, MongoDB + Vercel Blob (admin at `localhost:42100/admin`) |

### CLI Flags

| Flag | Type | Description |
|:---|:---|:---|
| `-n, --name <name>` | String | Project name (default: directory basename) |
| `-p, --path <path>` | String | Target directory path |
| `--author <name>` | String | Project author or organization name |
| `--tagline <desc>` | String | Project mission or summary |
| `--audience <aud>` | String | Target audience or user persona |
| `--problem <prob>` | String | Core problem solved by the project |
| `--features <list>` | String | Comma-separated core features |
| `--tone <tone>` | String | Brand voice / design aesthetic (e.g. Minimalist, High-Tech, Warm) |
| `--palette <color>` | String | Brand theme: `slate` \| `indigo` \| `emerald` \| `amber` \| `violet` |
| `--first-milestone <m>` | String | Immediate next task / initial milestone |
| `--planned-milestones <list>`| String | Comma-separated planned milestones |
| `--agent-name <name>` | String | Agent name configured for this workspace; otherwise uses the user's global assistant identity and prompts if unavailable |
| `--github` / `--no-github` | Boolean | Explicitly include or omit GitHub community files and stack-matched workflows; interactive setup asks when unknown |
| `--agent-role <role>` | String | Lead agent functional role description |
| `--constraint <text>` | String | Primary operational constraint or invariant |
| `--onboard-client` | Boolean | Run the full 5-section client onboarding interview and render every intake doc |
| `--skip-client-onboarding` | Boolean | Write only the brief; leave doc generation to a later agent pass |
| `--intake <path>` | String | Prefill onboarding from a JSON object or Markdown brief |
| `--client-name <name>` | String | Client legal entity / company name |
| `--client-brand <name>` | String | Public brand / trade name |
| `--client-slug <slug>` | String | Stable client identifier |
| `--client-contact <name>` | String | Day-to-day client contact |
| `--client-role <role>` | String | Contact role |
| `--client-email <email>` | String | Contact email |
| `--decision-maker <name>` | String | Final approval stakeholder |
| `--tech-lead <name>` | String | Client-side technical lead |
| `--business-model <model>` | String | `b2b-saas` \| `b2c-ecommerce` \| `agency-service` \| `marketplace` \| `media-publisher` \| `nonprofit` \| `local-business` \| `enterprise` \| `custom` |
| `--company-stage <stage>` | String | `idea` \| `bootstrapped` \| `seed` \| `series-a` \| `growth` \| `enterprise` \| `established` |
| `--revenue-band <band>` | String | `pre-revenue` \| `<100k` \| `100k-1m` \| `1m-10m` \| `10m-100m` \| `100m+` |
| `--mission <text>` | String | Mission statement |
| `--vision <text>` | String | Vision statement |
| `--competitors <list>` | String | Comma-separated competitors |
| `--objections <list>` | String | Comma-separated customer objections |
| `--launch-goal <text>` | String | Single measurable launch-success metric |
| `--boundaries <list>` | String | Comma-separated explicit out-of-scope items |
| `--domain <domain>` | String | Primary production domain |
| `--dns-provider <name>` | String | `cloudflare` \| `route53` \| `namecheap` \| `godaddy` \| `vercel` \| `other` |
| `--git-host <host>` | String | `github` \| `gitlab` \| `bitbucket` \| `self-hosted` \| `none` |
| `--payments <list>` | String | Comma-separated payment rails |
| `--integrations <list>` | String | Comma-separated third-party services |
| `--brand-assets <path>` | String | Brand asset location |
| `--figma <url>` | String | Figma / design file URL |
| `--sla-tier <tier>` | String | `standard` \| `priority` \| `enterprise` \| `none` |
| `--engagement <type>` | String | `fixed-scope` \| `retainer` \| `time-materials` \| `productized-sku` \| `internal` \| `oss` |
| `--comms-channel <channel>` | String | `slack` \| `email` \| `telegram` \| `whatsapp` \| `weekly-call` \| `other` |
| `--comms-cadence <cadence>` | String | `daily` \| `weekly` \| `biweekly` \| `monthly` \| `milestone` |
| `--kickoff-date <date>` | String | Kickoff date (`YYYY-MM-DD`) |
| `--deadline <date>` | String | Deadline (`YYYY-MM-DD`) |
| `--budget <text>` | String | Budget band / commercial ceiling |
| `--access-items <list>` | String | Comma-separated access items required |
| `-i, --intent <intent>` | String | `brochure` \| `content` \| `ecommerce` \| `app` \| `mobile` \| `governance` |
| `--preset <preset>` | String | `powerhouse` \| `astro-commerce` \| `publisher` \| `edge` \| `visual` \| `astro-visual` \| `plain-astro` \| `git-cms` \| `instatic` \| `pure-html` \| `mobile` \| `astro-mobile` \| `atomic-payload` |
| `-t, --type <framework>` | String | `nextjs` \| `astro` \| `instatic` \| `wordpress` \| `expo` \| `custom` \| `none` |
| `-s, --styling <styling>` | String | `hybrid` (UnoCSS Wind 4 + BEM) \| `unocss` \| `bem` \| `tailwind` \| `custom` \| `none` |
| `-a, --animation <anim>` | String | `css` (Hardware presets) \| `motion` \| `gsap` \| `webgl` \| `custom` \| `none` |
| `--state <engine>` | String | `nanostores` (Sub-1KB cross-island store) \| `custom` \| `none` |
| `-m, --mobile <target>` | String | `capacitor` (Ionic Capacitor iOS/APK wrapper) \| `expo` (React Native) \| `custom` \| `none` |
| `-c, --cms <cms>` | String | `ariabuilder` \| `atomic-payload` \| `studiocms` \| `tina` \| `keystatic` \| `emdash` \| `payload` \| `wollycms` \| `decap` \| `keystone` \| `sanity` \| `strapi` \| `custom` \| `none` |
| `--puck` | Boolean | Inject Puck Visual Builder configuration |
| `-e, --ecommerce <ecom>` | String | `payload` \| `medusa` \| `vendure` \| `fastrr` \| `razorpay` \| `stripe` \| `custom` \| `none` |
| `--db <db>` | String | `neon` \| `supabase` \| `postgres` \| `sqlite` \| `custom` \| `none` |
| `--auth <auth>` | String | `better-auth` \| `supabase` \| `authjs` \| `custom` \| `none` |
| `--deploy <deploy>` | String | `cloudflare` \| `docker` \| `vercel` \| `custom` \| `none` |
| `--skip-install` | Boolean | Skip automatic `bun install` |
| `--no-cache` | Boolean | Bypass local template caches and force upstream Git synchronization |
| `--latest` | Boolean | Pin scaffolded companion dependencies to `@latest` releases |
| `--dry-run` | Boolean | Simulate scaffolding without writing files |
| `--non-interactive` | Boolean | Run without interactive prompts |
| `-f, --force` | Boolean | Overwrite existing files |
| `-h, --help` | Boolean | Display help message |

---

## 🎙️ Interactive Onboarding & Client Intake Suite

When running `new-project` interactively or through an AI agent, the onboarding engine guides users through 7 stages:
1. **Purpose-First Root Prompt**: Destination, project name, engagement mode, and twelve-archetype routing.
2. **Granular Decision Tree**: Archetype → framework → CMS → styling → animation → state → mobile → database → auth → commerce → palette → deployment, each with tradeoff notes and a `custom` escape hatch.
3. **Official Companion Auto-Wiring**: Direct configuration files (`astro.config.mjs`, `uno.config.ts`, `medusa.ts`, `db.ts`, `auth.ts`, `capacitor.config.ts`).
4. **Modern Design Tokens & Semantic BEM**: Wide-gamut OKLCH palettes (curated, Radix, or custom hue ramp) and fluid `clamp()` scales in `src/styles/tokens.css`.
5. **Client Onboarding Interview**: Five sections — identity/contacts, business/market, offerings/scope, engagement/commercial, and technical access/integrations. Runs interactively (`--onboard-client`), from `--intake`, or from individual client flags.
6. **Intake Docs & Brand Compilation**: Renders `00-Intake-Brief.md` plus the 4-pillar suite from real answers, compiles `.agents/brand/`, syncs `.agents/context/product.md` + `accounts.md`, and writes a client-aware `start-here.md`.
   - `01-Brand/`: `brand-identity.md`, `visual-direction.md`, `voice-and-tone.md`.
   - `02-Business/`: `business-model.md`, `audience-persona.md`.
   - `03-Offerings/`: `offerings-catalog.md`, `scope-deliverables.md`.
   - `04-Technical-Intake/`: `access-and-credentials.md`, `integrations-matrix.md`.
7. **Closeout**: Records shipped state, ADRs, terrain maps, and runs the health check.

`--skip-client-onboarding` preserves the older behavior: the brief is written, and the docs are left for a later agent pass. See [`references/client-onboarding.md`](references/client-onboarding.md) for the full schema and option matrix.

All gathered answers dynamically populate:
- `AGENTS.md` (project identity, mission, and agent personas)
- `.agents/context/` (`product.md`, `brand.md`, `roadmap.md`, `architecture.md`, `decisions.md`, `current.md`)
- `.agents/brand/tokens/` (`colors.json` and `base.css` with chosen OKLCH palette)
- `Client-Intake/` (4-pillar client intake and brand foundation, single canonical folder)

---

## ⚡ Continuous Self-Improvement (Skill Extraction)

When an agent repeatedly solves recurring problems across multiple tasks ($\ge 4$ occurrences), package the pattern directly into a new RFC-compliant skill:

```bash
bun scripts/extract-skill.ts \
  --name "custom-pattern" \
  --desc "Extract and execute deterministic pattern solution" \
  --occurrences 4 \
  --verified
```

See [`references/skill-extraction.md`](references/skill-extraction.md) for the complete 3-gate lifecycle specification (Recurrence, Verification, Generalization).

