## Official Stack Setup References (Post-Scaffold Agent Procedures)

When the intake brief or a stack change requires provisioning a companion manually, follow these official procedures. `@latest` is allowed only for the initial create/install command; immediately commit the generated lockfile (`bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`) so the resolved versions are reproducible. Never leave a scaffold with floating `@latest` dependencies and no lockfile, and make CI install from the lockfile (`bun install --frozen-lockfile` / `npm ci`) so lockfile drift fails the build.

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
1. New WollyCMS project: `npx create-wolly@latest my-site && cd my-site && npm run migrate && npm run seed && npm run dev` (requires Node.js 22 LTS; API + admin at `http://localhost:4321`, default login `admin@wollycms.local` / `admin123`; **rotate this credential before any deploy**). Templates: `blog`, `marketing`, `wordpress`, `drupal`, `college` via `--template=<name>`.
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
- **Monolithic Memory Dumps**: Keep machine real-time invariants in cognitive memory (updated strictly via memory tooling/CLI; never hand-edited directly; skipped if no memory system exists) and `.agents/context/current.md` for durable shipped reality.
- **Single-Harness Assumptions**: Never default install paths, configuration files, or hooks to harness-specific locations (e.g., `~/.claude/settings.json`). Always follow the layout hierarchy: project-local standard (`.agents/`), home-level agent config (`~/.agents/`), and harness-specific paths only as explicit opt-in when that harness is actually in use. If an opt-in harness follows the `.agents` and `AGENTS.md` standard, do not create its own files; have it follow the DOX engine directly.
- **Public Agent State**: Keep the scaffolded root clean. The committed `.gitignore` is public-safe only; install internal agent/harness excludes with `updateagents --install-excludes` (`.git/info/exclude`) and consolidate any harness artifact under `.agents/<category>/`. Never commit `.agents/`, `.memory/`, harness dirs, or transcripts to a public remote.
- **Never Ship Half-Baked Companion Stubs**: Never provision an SDK or integration flag without the accompanying route handlers, client SDKs, schemas, admin UIs, or container configs needed to actually run it. Every technology must be immediately runnable from a clean checkout.
- **Isolated Official Scaffolds (Aria Builder, Atomic Payload)**: these upstreams ship complete stacks — never overlay engine extras (framework re-scaffold, companion configs, tokens, CI, package.json rewrites); the isolation gate zeroes companion selections with a printed notice and extras are added only on explicit request after scaffolding.

---

## Verification

After scaffolding, verify the project:
1. **Intake Brief**: Check that `./Client-Intake/00-Intake-Brief.md` exists with pre-filled scaffold answers and the full **Client Onboarding Answers** block.
2. **Client Onboarding Artifacts**: When `--onboard-client`, `--intake`, or any client flag was used, verify `01-Brand/`, `02-Business/`, `03-Offerings/`, `04-Technical-Intake/` each contain their generated docs and that `./start-here.md` reflects the client facts (not the generic compass template). When onboarding was skipped, verify the brief alone is written and the docs are marked for the agent pass.
3. **Design Tokens**: Check wide-gamut OKLCH tokens and fluid clamp scales in `./src/styles/tokens.css` and `.c-*` classes in `semantic.css`.
4. **Governance Container**: Check `./.agents/` tree, `./AGENTS.md`, and `./CLAUDE.md` containing only `@AGENTS.md`. Working artifacts (research corpora, planning docs, reports) live under `./.agents/artifacts/<topic>/` per its README contract stub — never the repo tree, never `./.memory`; durable findings promote to `./.agents/context/`.
5. **Database & Auth Completeness**: If database or auth is provisioned, verify `src/lib/schema.ts`, `src/lib/db.ts`, `src/lib/auth-client.ts`, and API route handlers (`/api/auth/[...all]`) exist and compile cleanly.
6. **CMS & Visual Builder Completeness**: If Payload, Keystatic, or Puck is enabled, verify config files (`payload.config.ts`, `keystatic.config.ts`), collection schemas, and admin UI pages exist.
7. **Aria Builder Isolation**: If Aria is enabled, verify the target holds the official upstream clone (`package.json` named `@ariabuilder/aria`, `astro.config.ts`, `uno.user.config.ts` with the Wind 4 preset) plus engine governance only — no `aria.config.mjs`, no `Aria*.astro` components, no `backend/`, no engine tokens/CI. Run `npm run dev` and complete first-admin setup at `http://localhost:4321/admin/setup`.
8. **Atomic Payload Isolation**: If Atomic is enabled, verify the target holds the official upstream template (`package.json` named `atomic-payload`, `src/payload.config.ts` with `buildConfig` + `mongooseAdapter`, `next.config.ts` with `withPayload`) plus engine governance only — no `src/styles/tokens.css`, no `uno.config.ts`, no Drizzle/CI/pre-commit overlays. Run `pnpm install`, `pnpm generate:types`, `pnpm dev`, open `http://localhost:42100/admin`, create the first admin, seed via the dashboard banner.
9. **Backend Engine**: If Medusa is provisioned, check `./backend/medusa-config.ts`, `./backend/docker-compose.yml`, and `./backend/package.json`. If PostgreSQL container is requested, check `./docker-compose.yml`.
10. **Day-1 Starter Dashboard**: Check that `src/app/page.tsx` (Next.js) or `src/pages/index.astro` (Astro) is provisioned with live stack badges and quick links.
11. **GitHub assets & deployment**: For a GitHub project, verify the generated changelog/community files and only the workflow(s) selected for the detected stack; verify `Dockerfile` / `wrangler.toml` / `vercel.json` against `--deploy`. Isolated official scaffolds receive no overlays.
12. **Quality Gates & Test Suite**: Run `bun test` inside the scaffolded workspace to confirm `tests/health.test.ts` passes cleanly.
13. **Day-1 Secret Defense**: Verify `scripts/pre-commit.sh` exists and is executable.
14. **Dynamic ADRs & Product DOX**: Check that `.agents/context/decisions.md` contains ADR-001 through ADR-006, and `.agents/context/product.md` reflects the interview scope.
15. **Secret Defense**: Verify no secrets or credentials appear in `.env` or git status. Run `bun run secret-scan .` to ensure compliance with the Vibeguard protocol.
