# onboard — Developer Codebase Orientation & Execution Path Tracing

One unified head reference for onboarding developers and AI agents into unfamiliar codebases fast. Explains system architecture, maps module boundaries, traces concrete execution paths, and states only facts strictly grounded in inspected source code.

---

## The Code-First Orientation Doctrine

1. **Evidence Before Claims**: Never state that a module or service owns behavior unless you can point to the concrete file(s) that implement, import, or route it.
2. **Strictly Read-Only**: This mode is purely exploratory. Do not propose refactors, edit source code, or drift into feature work.
3. **No Inference or Speculation**: If a capability or configuration is not visible in the inspected files, do not invent it. If understanding is partial, explicitly state which subsystems were inspected and which were not.

---

## Intake & Reconnaissance

Before generating an orientation map, inspect:
1. **Manifests & Pinned Versions**: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `pom.xml`, etc.
2. **Root Configuration**: Monorepo configs (`pnpm-workspace.yaml`, `turborepo.json`), build configs (`vite.config.ts`, `next.config.ts`), container specs (`Dockerfile`, `compose.yaml`).
3. **Primary Entry Points**: Discover the executable seeds (`src/index.ts`, `app/page.tsx`, `main.go`, `cmd/server/main.go`, `manage.py`).
4. **Data Schemas & Routing**: Route definitions (file-based or centralized router) and database schemas (`schema.prisma`, `drizzle/schema.ts`, migrations).

---

## Deliverable: The 3-Tier Orientation Map

Always structure the codebase orientation into three distinct altitude levels:

```markdown
# 🧭 Codebase Orientation: [Repository / Project Name]

## 1. 1-Line Summary
[A single precise sentence stating what this codebase is, its primary stack, and its core responsibility.]

---

## 2. 5-Minute Architectural Overview
- **Primary Mission**: [What business problem or system capability this codebase delivers.]
- **Primary Inputs**: [HTTP requests, WebSockets, CLI flags, background queues, cron triggers, file uploads.]
- **Primary Outputs**: [JSON APIs, SSR/Static HTML pages, database mutations, outbound webhook events, exports.]
- **Core Runtimes & Frameworks**: [e.g., Node.js 22 (Bun), Next.js 15 App Router, PostgreSQL via Drizzle ORM, UnoCSS.]
- **Key Directory Map**:
  - `src/app/` — [Routing and UI page components]
  - `src/lib/` — [Core business logic and domain entities]
  - `src/server/` — [API endpoints, DB client, and third-party integrations]

---

## 3. Deep Dive & Architectural Boundaries

### A. Runtime Entry Points & Initialization
| File Path | Role in Bootstrapping | Key Global State / Providers |
|:---|:---|:---|
| `src/server.ts` | HTTP listener bootstrap | Initializes DB pool, mounts auth middleware |
| `src/app/layout.tsx` | Root UI tree provider | Injects theme context, query client, analytics |

### B. Core System Boundaries
1. **Presentation Layer**: UI components, styling tokens, client-side state stores.
2. **Domain / Application Layer**: Business logic services, validation rules, pure domain models.
3. **Data Access & Persistence**: Database schemas, ORM queries, cache layers, external API clients.
4. **Cross-Cutting Concerns**: Authentication/Authorization guards, logging, error handling wrappers.

### C. Traced Execution Path: [Core Workflow Name]
Follow one real request end-to-end through the code:
1. **Request Ingestion**: `src/routes/api/checkout.ts#L12` receives POST payload.
2. **Validation**: Validated via Zod schema at `src/schemas/checkout.ts#L24`.
3. **Domain Processing**: Handed off to `CheckoutService.process()` at `src/services/checkout.ts#L45`.
4. **Persistence & Side Effects**: Drizzle transaction mutates `orders` table at `src/db/orders.ts#L88` and dispatches Stripe intent at `src/integrations/stripe.ts#L30`.
5. **Response**: Emits 201 Created with order payload at `src/routes/api/checkout.ts#L52`.

### D. Gotchas & Non-Obvious Patterns
- **Unconventional Conventions**: Note any legacy naming, custom wrappers around standard APIs, or implicit environment variables.
- **Dead Code / Redundant Paths**: Highlight deprecated files or competing abstractions discovered during exploration.
```

---

## Exploration Procedure & Heuristics

When asked to orient or trace an execution path:
1. **Step 1 — Topology Scan**: Run `find` / `fd` or inspect top-level tree to classify the repository architecture (Single-package web app vs. Modular Monorepo vs. CLI tool).
2. **Step 2 — Dependency Audit**: Check internal package dependencies or third-party libraries to identify the active data stores (PostgreSQL, Redis, SQLite), authentication providers (Better Auth, NextAuth, Clerk), and UI libraries.
3. **Step 3 — Entry-to-Exit Tracing**: Pick the primary user story (e.g. user login, checkout, data ingestion) and read the verbatim code files connecting the incoming input to the persisted output.
4. **Step 4 — Output Formatting**: Synthesize into the 3-Tier Orientation Map without inserting hypothetical next steps, unrequested refactors, or code critiques.

---

## Quality Gate

- [ ] 1-Line Summary identifies codebase type without buzzwords.
- [ ] Every listed entry point and key file exists and has been inspected on disk.
- [ ] Traced execution paths quote exact file paths and method names.
- [ ] Architectural boundaries clearly separate presentation from persistence.
- [ ] Output is strictly informative and descriptive (no unsolicited code edits or review judgements).
