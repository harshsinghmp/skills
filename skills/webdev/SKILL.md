---
name: webdev
aliases: ["web-development", "web-engineering", "frontend", "backend", "fullstack", "fullstack-guardian", "ecommerce", "cms", "spec-miner", "responsiveness-check", "cli-developer", "cache-component", "wordpress-pro", "wordpress-elementor", "react-native-expert", "wordpress"]
description: "Full web engineering department: frontend, backend, fullstack builds with layered security, e-commerce, CMS integration, web performance, accessibility, migrations, developer onboarding, high-converting funnel pipelines, deploy, and responsive audits — routed through fifteen modes. Use when asked to build or refactor web features or apps, design APIs or data models, implement e-commerce or CMS functionality, build interactive funnel and checkout flows, fix performance or accessibility issues, audit mobile responsiveness, migrate sites and stacks, reverse-engineer legacy codebases into specs, orient developers on unfamiliar repositories, or ship builds. Not for design (design, refactor-ui, designscope), animation (animate), or mobile apps (mobile)."
argument-hint: "[frontend|backend|fullstack|ecommerce|cms|performance|accessibility|migrations|prototype|spec|implement|onboard|funnel|deploy|audit]"
user-invocable: true
version: 1.1.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 26
  aliases: ["web-development", "web-engineering", "frontend", "backend", "fullstack", "fullstack-guardian", "ecommerce", "cms", "spec-miner", "responsiveness-check", "cli-developer", "cache-component", "wordpress-pro", "wordpress-elementor", "react-native-expert", "wordpress"]
  suggested_skills: ["new-project", "code-review", "gauntlet-loop", "relay"]
  hermes:
    tags: ["web-development", "frontend", "backend", "fullstack", "fullstack-guardian", "spec-miner", "responsiveness-check", "cli-developer", "cache-component", "wordpress-pro", "wordpress-elementor", "react-native-expert", "wordpress", "api", "rest", "graphql", "database", "orm", "ecommerce", "cms", "performance", "core-web-vitals", "accessibility", "wcag", "migrations", "nextjs", "react", "astro", "nodejs", "typescript"]
    related_skills: ["new-project", "code-review", "gauntlet-loop", "relay"]
    suggested_skills: ["new-project", "code-review", "gauntlet-loop", "relay"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "find_by_name", "run_command"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["new-project", "code-review", "gauntlet-loop", "relay"]
    primary_triggers: ["build a web app", "frontend work", "backend api", "fullstack", "fullstack-guardian", "spec-miner", "reverse engineer", "responsiveness-check", "audit mobile responsiveness", "ecommerce site", "cms integration", "web performance", "accessibility fix", "site migration", "lighthouse", "wordpress pro", "elementor", "react native expert"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "find_by_name", "run_command"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🛠️ webdev — Web Engineering Department

One head skill for web engineering. The stack is whatever the project already uses — detect first, build second; never introduce a new dependency for what a few lines or an installed one covers. Every mode ends with the repo's verification gate (build, tests, lint) actually passing.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **frontend** | "build this page/component", "frontend work", "react/astro/vue work", "popular-web-design", "imagegen-frontend-mobile", "userinterface-wiki" | Component/page implementation against design spec with responsive image assets and UI wiki patterns | [references/frontend.md](references/frontend.md) |
| **backend** | "api design", "endpoint", "database schema", "auth flow", "cli-developer" | APIs, data models, integrations, auth, and CLI developer tooling | [references/backend.md](references/backend.md) |
| **fullstack** | "fullstack feature", "end-to-end build", "ship the feature", "fullstack-guardian" | Full-feature build with Three-Perspective Security Architecture (Frontend, Backend, Security): data → API → UI → verified | [references/fullstack.md](references/fullstack.md) |
| **ecommerce** | "ecommerce", "checkout", "product catalog", "cart", "payment gateway" | Catalog, cart, checkout, payments, post-purchase flows | [references/ecommerce.md](references/ecommerce.md) |
| **cms** | "cms integration", "content model", "payload", "sanity", "headless cms" | Content modeling + CMS integration + preview/editor experience | [references/cms.md](references/cms.md) |
| **performance** | "site is slow", "core web vitals", "lighthouse", "lcp/cls/inp", "cache-component" | Measure-first optimization: profile → fix → verify in field data with component caching | [references/performance.md](references/performance.md) |
| **accessibility** | "accessibility", "wcag", "screen reader", "keyboard nav", "a11y" | WCAG 2.2 AA audit and fixes: keyboard, contrast, semantics, forms | [references/accessibility.md](references/accessibility.md) |
| **migrations** | "migrate the site", "platform migration", "react 18 to 19", "major version upgrade" | Planned migrations: audit → map → execute → verify with rollback | [references/migrations.md](references/migrations.md) |
| **prototype** | "spike this", "is this approach feasible", "riskiest unknown first", "throwaway probe" | Riskiest-technical-unknown-first throwaway tracer → proven/disproven/needs-probe verdict; code never ships | [references/prototype.md](references/prototype.md) |
| **spec** | "write the spec", "spec this feature", "ready-for-agent", "scope this build", "spec-miner", "reverse engineer" | Build-ready spec packet and legacy code reverse-engineering (EARS format, Arch Hat vs QA Hat, deep seams); human gate per phase | [references/spec.md](references/spec.md) |
| **implement** | "implement the spec", "build from spec", "tracer slices", "ship this story" | Spec-to-shipped tracer slices (one test → one impl); Simplicity-First; review chain before done | [references/implement.md](references/implement.md) |
| **onboard** | "onboard", "oinboard", "codebase onboarding", "orient", "explain this repo", "explore codebase" | Rapid codebase orientation, execution path tracing, mental models, and repository exploration without speculation | [references/onboard.md](references/onboard.md) |
| **funnel** | "build funnel", "sales funnel", "checkout flow", "multi-step form", "upsell flow", "funnel engineering", "conversion tracking" | Full-stack funnel engineering: multi-step form state machines, 1-click upsells/downsells, Stripe checkout, server-side tracking pixels (CAPI), and CRM webhooks | [references/funnel.md](references/funnel.md) |
| **deploy** | "ship the build", "static upload", "one-command deploy", "deploy the frontend" | App-side ship: one-command full-stack deploy, static-upload fallback, object-storage contract (pipelines live in `devops`) | [references/deploy.md](references/deploy.md) |
| **audit** | "audit responsiveness", "responsiveness-check", "mobile responsiveness", "viewport audit", "touch targets", "overflow check" | Responsive design audits (responsiveness-check), mobile viewports (375px–1920px), touch targets, and code health | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

### Chain order

`prototype` → `spec` → `implement` → `qa-launch` gate. Prototype answers the riskiest technical unknown (throwaway); spec turns the verdict into a labeled packet; implement rebuilds slice by slice (prototype code never merges); `qa-launch` verifies the shipped result. Design-side (visual/clickable) prototyping lives in `design` prototype — referenced, never duplicated here.

---

## When to Use

- Building or refactoring web features, pages, or full apps.
- Designing or implementing APIs, data models, and integrations.
- Implementing e-commerce functionality (catalog, cart, checkout).
- CMS integration and content modeling.
- Fixing web performance or accessibility issues.
- Migrating sites, platforms, or major versions.

### Anti-Triggers

- Visual design of new interfaces → `design` (ui mode).
- Polishing/refactoring existing UI → `refactor-ui`; motion → `animate`.
- Scaffolding a brand-new project from scratch → `new-project`.
- Native mobile apps → `mobile`.

---

## Quick Reference

### Stack-detection ladder (run before any mode)

1. Read `package.json` / `pyproject.toml` / `go.mod` / `composer.json` — framework, scripts, deps.
2. Read the router and directory structure — conventions beat guesses.
3. Read 2–3 representative components/endpoints — match their patterns exactly.
4. Only then plan. The existing pattern wins over personal preference. Always.

### Verification gate (every mode)

| Stage | Command (use the project's own) |
|:---|:---|
| Install | the project's lockfile manager, nothing new |
| Type/lint | the project's configured toolchain |
| Build | the production build |
| Tests | the project's test runner |

A change is not done until the gate is green. If no gate exists, say so and add the minimal one.

### Sourcing rule

When the user provides reference URLs (docs, examples, prior art) — fetch, read, and follow them as the
primary source; defaults here are fallbacks. Record which URLs were used.

### Suite contracts

- New projects: scaffold with `new-project` first; `webdev` builds on top.
- PR-quality bar: route the diff through `code-review` before merge.
- Programmatic video delivery (note only — build lives elsewhere): route assembly/export to `animate` (other-libraries §9) and scripting/production families to `content` (video mode).

---

## Procedure

1. **Intake.** detect the existing stack from the manifest and imports before proposing anything — the repo wins over preference every time.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Introducing a new dependency where an installed one or a few lines suffice.
- Ignoring the repo's existing patterns — inconsistency is technical debt at delivery speed.
- Skipping the verification gate because 'it's just a small change'.
- Optimizing performance before measuring — profile first.
- A11y as a final coat — build accessible markup from the start; retrofitting costs 5×.
- Migrations without a rollback plan and content freeze strategy.
- Checkout flows without handling failure states (payment declines, inventory races).

---

## Verification

- [ ] Stack detected and confirmed before any code was written.
- [ ] No new dependencies added unless justified against installed alternatives.
- [ ] The project's own verification gate (build/test/lint) ran green.
- [ ] All changes follow existing repo patterns (imports, naming, structure).
- [ ] Interactive elements keyboard-navigable and labeled (default, not afterthought).
- [ ] Mode-specific gate in the loaded reference passed.
