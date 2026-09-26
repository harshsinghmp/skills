# Companion Integration & Scaffolding Blueprints

> **Purpose**: Reference blueprints for scaffolding automation/social-publishing companions
> alongside the app (Stage 3 companion wiring) and the poka-yoke rule that governs every
> config/template file the engine emits. Read on-demand when a project selects automation,
> social scheduling, or when validating emitted templates.
>
> **Poka-yoke rule (applies to ALL references below and every template the engine emits)**:
> make misuse *unrepresentable* at the template level — fail fast on the first run, never
> silently default. A template that falls back to a hardcoded value hides a misconfiguration
> until production. Everything below defaults to fail-fast; there is no lazy fallback branch.

---

## 1. Poka-Yoke Architectural Templates (fail-fast guardrail)

Engine-agnostic mechanism — a generated config/template must reject misuse at startup, not
silently degrade:

- **Missing env = hard fail.** Any token/URL the file reads from `process.env` must be
  validated up front and the process must exit non-zero when absent. Do **not** emit
  `process.env.VAR || 'default'` for a required value (secret/URL); that pattern is reserved
  for display-only defaults (local CORS, dev ports).
  ```ts
  // emit this — fails fast on the first `bun run dev`
  function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env ${name}. Copy .env.example → .env and set it.`);
    return v;
  }
  export const DATABASE_URL = requireEnv("DATABASE_URL");
  ```
- **Invalid enum option = hard fail.** A `--flag` or config field accepts a closed set
  (db: neon|supabase|postgres|sqlite). Reject unknown values with the accepted list in the
  error, never fall through to a default. The interactive tree prunes options but the
  non-interactive CLI still receives arbitrary strings — validate against the enum, not the prompt.
- **Schema over prose.** Drizzle `schema.ts` is the single source of truth; `db.ts` is the only
  client. Never hand-roll a duplicate type that can drift.
- **One upstream, byte-identical.** Isolated official scaffolds (Aria, Atomic Payload) are
  cloned untouched — no overlay, no token injection. Appling the fail-fast rule here means:
  if the upstream requires a `.env` secret and none ships, the engine copies `.env.example`
  verbatim and the first run errors until real values are set.
- **Verify the failure path.** The quality gate tests the happy path AND the fail path: a
  `tests/health.test.ts` assertion that `requireEnv("BOGUS")` throws.

**Default-stack practice** (engine-generated `src/lib/db.ts`, `src/lib/auth.ts`, Drizzle
config): always `requireEnv` for connection strings and auth secrets; never emit
`DATABASE_URL || 'postgres://postgres:***@…'` fallbacks in the committed template.

---

## 2. n8n Workflow Scaffolding Blueprint

Tool-independent mechanism: scaffold an automation service alongside the app as a
webhook-driven pipeline — the **app emits webhooks**, the **automation service receives
them** via an HTTP webhook node, and its sub-workflows fan out. Keep the app
automation-agnostic; the payload contract is a plain JSON body with `webhookId`.

Engine wiring when **automation = n8n** (Default stack, user's OSS suite):

1. **Webhook service in the app** — a generic route handler that authenticates and forwards
   an event to n8n:
   - `src/app/api/webhooks/automation/[webhookId]/route.ts` (Next.js) or
     `src/pages/api/automation/[webhookId].ts` (Astro).
   - Reads `N8N_WEBHOOK_URL` (base) + `AUTOMATION_WEBHOOK_SECRET` (shared HMAC token) via
     `requireEnv`. Signs the body with the secret (`HMAC-SHA256`) so n8n can trust the caller;
     reject unmatching signatures in n8n (Crypto node comparison) — never plaintext trust.
   - `.env.example` gets `N8N_WEBHOOK_URL` and `AUTOMATION_WEBHOOK_SECRET` placeholders.
2. **n8n workflow config** — a `.n8n-workflows/<name>.json` export committed to the repo
   (anchored where the app can version it, e.g. `workflows/n8n/`) containing:
   - **Webhook node** (`webhook`) as trigger; route regex `webhookId` → the workflow's job.
   - **Crypto / Code node** verifying the HMAC before any side effect.
   - A retry/error branch (n8n `errorWorkflow` or an explicit `onError` sub-workflow) so a
     failed run never silently drops.
   - Output writes back to the app via a webhook node (status update) or to the DB through the
     same Drizzle connection the app uses — keep the binding in the workflow, secret via env.
3. **Runbook**: `bun run dev` app + `n8n start`; import the JSON; set `N8N_WEBHOOK_URL` to the
   n8n public/PROXY URL and pair both sides with the same `AUTOMATION_WEBHOOK_SECRET`.
4. **Fail-fast**: importing a workflow with an unresolved credential name or missing
   `webhookId` route must error at import time, surfaced in the runbook's verification step.

---

## 3. Postiz Integration Blueprint (multi-platform social scheduling)

Tool-independent mechanism: a publish-once API that fans out to N social channels. The app
owns authoring + scheduling, the scheduler owns channel delivery.

1. **App-side scheduler client** — `src/lib/postiz.ts`: a typed client hitting
   `POSTIZ_API_URL` (default `http://localhost:5000/api/v1`) with the `AUTH_TOKEN` or
   API-key header. Methods: `createPost` (content + scheduledAt ISO), `listChannels`,
   `listPosts`.
2. **Route handler** `src/app/api/social/posts/route.ts` — validates the incoming post, pulls
   `POSTIZ_API_URL` and the token via `requireEnv`, forwards to Postiz. Never fall back to a
   stub channel.
3. **Postiz provisioning (Default stack)**:
   - Self-hosted, run on the same `docker-compose` plane as Postgres when present
     (Postiz needs its own Postgres/Mailpit); pin the channel/provider credentials in Postiz
     env, not in the app `.env`.
   - Seed `POSTIZ_API_URL` + `AUTH_TOKEN` into `.env.example`; the app connects only on the
     D2C demand — a real social schedule request is user-invokable, wiring is always present.
4. **Fail-fast**: a scheduled post must fail fast if the channel list is empty or the token is
   invalid (Postiz returns 401/403) — surface it, don't silently queue. `POSTIZ_API_URL` and
   `AUTH_TOKEN` are `requireEnv`-hard in `postiz.ts`.

---

## 4. Cross-Reference Inventory (already covered elsewhere — don't duplicate)

| Concern | Where it lives |
| :--- | :--- |
| Better Auth + Drizzle adapter, `auth.ts`/`auth-client.ts`, API route handlers | `SKILL.md` Stage 3 (Authentication) — already wired |
| Stripe / Razorpay / Medusa webhooks (signed verify) | `SKILL.md` Stage 3 — the HMAC-signing pattern above mirrors these |
| Docker compose for Postgres/Redis | `SKILL.md` Stage 3 / `scripts/new-project.ts` (`--db=postgres`, Medusa) |
| Vibeguard pre-commit secret defense | `SKILL.md` Stage 3 — keep in `.env.example`, never commit raw tokens |