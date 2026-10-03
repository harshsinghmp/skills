# backend — Backend: APIs, schemas, auth, and integrations with the project's stack.

## Intake

- API consumers and their needs (who calls this?)
- Data model and access patterns
- Auth/permission model (who may do what)
- Existing backend conventions in the repo

## Deliverable

Working API endpoints / schema changes with validation at boundaries, auth enforcement, error contracts, and tests exercising the real paths.

## Procedure

1. Model the data first: schema, constraints (DB-level, not just app-level), indexes for the real query patterns. Start with the simplest store that works; upgrade only on measured triggers (e.g. >10 concurrent writers, >100GB data, or genuine PostGIS/full-text need) — never on projected scale.
2. Design the API shape: resources, verbs, status codes; validate ALL input at the boundary.
3. AuthZ: check permission at the resource level, not just the route level.
4. Write the happy path, then the failure paths (validation, not-found, forbidden, conflict).
5. Tests against the real DB/emulator where feasible — not only mocks.
6. Run the verification gate; document the endpoint contract (request/response shapes).

## Quality gate

- [ ] Input validated at the boundary (schema or equivalent).
- [ ] DB constraints back the app-level rules.
- [ ] AuthZ enforced per resource, not per route.
- [ ] Contact/lead forms protected by 4-layer anti-spam (Honeypot + Turnstile + Zod + Rate Limiting).
- [ ] Edge runtime boundaries verified: zero Node stdlib (`node:fs`, `node:child_process`) or native C++ binaries in edge routes.
- [ ] Failure paths return proper status codes and safe errors (no internals leaked) — worded for non-technical callers (what happened, why, what to do).
- [ ] Tests exercise real paths.

## Routing

- Python path (uv default-stack): `uv init/add/sync/lock/run`, `uv python pin/install`, venv-per-project, `uv run` with no manual activate; Docker layer-cache friendly. Dist via src-layout (`src/` + `[tool.setuptools.packages.find] where=["src"]`), PEP 517/518/621/660, backend choice (setuptools/hatchling/flit); TestPyPI before PyPI. Source: `wshobson/agents` (`uv-package-manager`, `python-packaging`).
- Async gate + pitfalls: stay fully sync-or-async per call path (sync-vs-async table: asyncio vs multiprocessing vs `to_thread`); `gather(return_exceptions=True)` + filter, `wait_for` timeout, never `time.sleep` in loop, re-raise CancelledError. Source: `wshobson/agents` (`async-python-patterns`).
- Python perf ladder: profile-before-optimize (cProfile/py-spy/timeit), hot-path focus, `lru_cache`, generators for large sets, builtin-C preference. Source: `wshobson/agents` (`python-performance-optimization`).
- Copier-managed update path (source: `jlevy/simple-modern-uv`, MIT — this note only; uv core mechanics already landed above via wshobson): when the project is scaffolded from a Copier template, prefer `copier update` for template-evolution sync over hand-porting upstream changes; adoption ladder is selective → core-toolchain → full-Copier-managed, each rung only when its sync burden earns it.
- Python review checklists (source: `wshobson/agents` `python-anti-patterns` + `python-code-style`): anti-pattern gate — single-layer retry (centralized decorator, know infra retry), env-typed config (no secrets in code), DTOs at API boundary (no ORM-model leak), pure business logic via repository pattern (no embedded SQL), specific exceptions (no bare `except: pass`), batch partial-failure capture (BatchResult, never abort-on-first-error), validate at boundary, context managers for resources, async-native calls in async paths (never blocking sleep/sync HTTP in loop), typed public APIs + generic collections; style — ruff all-in-one (`E/W/F/I/B/C4/UP/SIM`, format handles line length), mypy strict (relaxed for tests/), PEP 8 naming (snake_case functions, PascalCase classes, SCREAMING constants, no abbreviated module names), absolute imports (stdlib → third-party → local), Google-style docstrings on all public APIs.
- Bounded reads: paginate every list endpoint (page/pageSize + totals); join/include instead of N+1 loops; treat third-party responses as untrusted and validate at the boundary.
- Idempotency: key from client/intent (never a per-attempt UUID/timestamp); claim via unique constraint (check-then-act is a race); reject same-key-different-payload loudly; record intent before side effects (timeout = unknown, not failure); retention outlives the longest retry chain including DLQ replays.
- Types: discriminated unions for variants, branded IDs, separate input/output shapes; extend by addition (optional fields) never modification; breaking changes route to `webdev` migrations (expand→contract).
- Hyrum's Law: every observable behavior is a de-facto contract — assume consumers depend on it; validate at boundaries only, never between typed internals. Source: `addyosmani/agent-skills` (`api-and-interface-design`).
- Architecture patterns (layering doctrine): Clean inward-only deps (domain never imports infra); Hexagonal ports/adapters (swap PG→Dynamo via adapter, in-memory adapters for tests); DDD strategic (bounded contexts, context mapping, ubiquitous language) + tactical (aggregates, value objects, repositories, domain events); use-case unit tests with zero Docker. Source: `wshobson/agents` (`architecture-patterns`).
- API versioning + GraphQL leg (delta): version via URL vs header vs query (pick one, document it); plural-noun collections; OpenAPI docs; cursor pagination (Relay cursors); `@deprecated` migration path; GraphQL schema-first, DataLoader for N+1, query-complexity monitoring. Source: `wshobson/agents` (`api-design-principles`).
- CQRS event-sourcing chain (one chain, three legs): command/query model split, projector → denormalized read model, eventual-consistency SLA, event versioning, don't-query-in-commands; store leg — append-only, per-stream/global ordering, optimistic concurrency, stream-ID `Type-{uuid}`, correlation/causation IDs, chooser (EventStoreDB vs PG vs Kafka vs DynamoDB vs Marten); read leg — live/catchup/persistent/inline projections, idempotent replay, checkpoints, lag monitoring, rebuild-by-design. Source: `wshobson/agents` (`cqrs-implementation`, `event-store-design`, `projection-patterns`).
- Saga orchestration (pairs the chain): per-step (not global) timeouts, idempotent always-succeeds compensations in reverse order, `saga_id` correlation, stuck-COMPENSATING → DLQ recovery, fail-at-each-step-index tests. Source: `wshobson/agents` (`saga-orchestration`).
- Microservices doctrine: decompose by capability/subdomain (strangler-fig for monoliths), database-per-service, sync (REST/gRPC) vs async (Kafka/RMQ/SQS), resilience (circuit-breaker, retry-backoff, bulkhead). Source: `wshobson/agents` (`microservices-patterns`).
- **In-Dev Web Security Prevention Rules (Developer Boundary)**:
  - *IDOR / BOLA Prevention*: Always enforce tenant/owner ownership predicate in database queries (`WHERE id = :id AND tenant_id = :tenant_id`), never query by raw ID alone.
  - *SSRF & Cloud Metadata Blocking*: When fetching external URLs provided by users, strictly blacklist private/internal IPv4/IPv6 ranges and cloud metadata IP (`169.254.169.254`, `127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - *SQL Injection & Sanitization*: Mandatory parameterized statements or typed ORM builders (Drizzle/Prisma/SQLAlchemy); raw string interpolation in queries is strictly prohibited.
  - *Mass Assignment Prevention*: Always validate requests against strict DTO / Zod schemas; never pass raw request bodies directly to database updates or inserts.
  - *Security Audit Escalation*: For full vulnerability assessments, CVE triage, or cloud WAF infrastructure audits, invoke the external `muse-security` skill.

---

## 🛡️ Webhook Guardian & Idempotency Architecture (Stripe, Shopify, External APIs)

External webhooks (payments, CRM leads, e-commerce orders) require an adversarial, failure-resistant pattern to eliminate duplicate charges, lost events, and timing attacks:

### 1. The 5-Pillar Webhook Contract
1. **Raw Body Preservation**: Never parse the request body with `json()` or `bodyParser` before signature verification. The raw byte Buffer must be verified against the provider's signature header (`stripe-signature`, `x-shopify-hmac-sha256`).
2. **Constant-Time Cryptographic Verification**: Validate webhook signatures using `crypto.timingSafeEqual` with the provider's official signing secret to prevent timing attacks.
3. **Atomic Idempotency De-duplication**:
   - Check if `eventId` exists in an atomic store (Postgres `webhook_events` table or Redis `SETNX webhook:{id} EX 86400`).
   - If already recorded as `PROCESSED`, immediately return `HTTP 200 OK` with `{ status: "duplicate", eventId }`. Do NOT re-execute mutations.
4. **Immediate ACK & Asynchronous Worker Offloading**:
   - Webhook providers (Stripe, Shopify) enforce strict 3-5 second timeouts. Acknowledge HTTP 200 within 1,000ms.
   - Offload heavy tasks (email sending, third-party API sync, PDF invoice generation) to a background queue or worker task.
5. **Poison Message Isolation & DLQ Routing**:
   - If payload processing fails due to non-transient errors (e.g. malformed JSON or invalid schema), record failure details and quarantine the event to prevent eternal retry storms.

```typescript
// Canonical Idempotent Webhook Pattern
export async function handleWebhook(rawBody: Buffer, signature: string, secret: string) {
  // 1. Verify cryptographic signature
  const event = verifyWebhookSignature(rawBody, signature, secret);

  // 2. Atomic claim via DB transaction or Redis lock
  const claimed = await db.transaction(async (tx) => {
    const existing = await tx.query.webhookEvents.findFirst({ where: eq(webhookEvents.id, event.id) });
    if (existing) return false;
    await tx.insert(webhookEvents).values({ id: event.id, status: "PROCESSING", createdAt: new Date() });
    return true;
  });

  if (!claimed) return { status: 200, message: "Duplicate event acknowledged" };

  // 3. Process business logic (or enqueue)
  try {
    await processEventPayload(event);
    await db.update(webhookEvents).set({ status: "COMPLETED" }).where(eq(webhookEvents.id, event.id));
    return { status: 200, message: "Processed" };
  } catch (err) {
    await db.update(webhookEvents).set({ status: "FAILED", error: String(err) }).where(eq(webhookEvents.id, event.id));
    throw err; // Trigger provider retry for transient errors
  }
}
```

---

## 🛑 Form Spam Defense & Lead Flood Protection

Agency client websites, contact forms, and lead funnels are targeted by high-frequency automated bots that burn webhook credits (Zapier/Make), pollute CRM pipelines, and trigger email blacklisting. All forms must deploy the **4-Layer Anti-Spam Barrier**:

### 1. The 4-Layer Form Defense Stack
1. **Zero-Friction Client CAPTCHA (Cloudflare Turnstile)**:
   - Embed `<Turnstile sitekey={KEY} />` on client submission.
   - Verify server-side via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` using `crypto.timingSafeEqual` or JSON validation before touching database or notifications.
2. **Invisible Honeypot Trap**:
   - Render an input with `name="website_url_hp"`, `tabIndex="-1"`, `aria-hidden="true"`, and `display: none`.
   - If populated, bots automated fill filled it. Return immediate fake success (`{ success: true }`) without processing, alerting, or storing.
3. **Strict Boundary Zod Sanitization**:
   - Enforce minimum/maximum string lengths (e.g. name 2–60 chars, message 10–2,000 chars).
   - Strip raw HTML tags, script injection patterns, and validate email syntax against known disposable temporary email providers.
4. **IP Sliding-Window Rate Limiting**:
   - Rate limit requests per IP (e.g. max 5 submissions per 15 minutes) using Redis, Cloudflare KV, or memory store to mitigate distributed volumetric floods.

---

## ⚡ Edge vs. Node Runtime Boundary Guard

Modern deployment targets (Cloudflare Workers, Vercel Edge, Fastly Compute, Netlify Edge) execute within isolated V8 JavaScript runtimes rather than standard Node.js runtime environments:

### 1. Forbidden Primitives in Edge Runtime
- **Node.js Core Modules**: Never import `node:fs`, `node:child_process`, `node:net`, `node:tls`, `node:os`, or `node:worker_threads`.
- **Native C++ Binaries**: Never depend on packages requiring Node-API / `node-gyp` native binaries (e.g. `bcrypt`, `sharp`, `canvas`, `sqlite3`).
  - *Password Hashing*: Replace `bcrypt` with `bcryptjs` or Web Crypto API (`crypto.subtle`).
  - *Image Processing*: Replace `sharp` with WebAssembly image pipelines or Cloudflare/Vercel Image Optimization APIs.
  - *Database Drivers*: Use HTTP/WebSocket edge drivers (Neon serverless `@neondatabase/serverless`, Turso `@libsql/client`, Prisma Accelerate, or Supabase `supabase-js`).

### 2. Mandatory Edge Invariant
- Any file declaring `export const runtime = 'edge'` or running on Cloudflare Workers / Fastly must rely strictly on standard WHATWG APIs: `fetch`, `Request`, `Response`, `Headers`, `URL`, `crypto.subtle`, `TextEncoder`, and Streams.

---

## 🗄️ Singleton Connection Pool & Serverless Starvation Guard

In serverless and auto-scaling container environments (Vercel, AWS Lambda, Cloudflare Workers), naive database client instantiation (`new Pool()`, `new PrismaClient()`, or `postgres()`) inside individual request handlers opens a new database connection on every incoming request or cold start. Under traffic spikes, this exhausts Postgres connection limits within seconds (`FATAL: remaining connection slots are reserved for non-replication superuser connections`).

### Mandatory Connection Invariants:
1. **Module Singleton Pattern**: Database clients MUST be instantiated once at module scope or cached on `globalThis` in development:
   ```typescript
   // lib/db.ts - Singleton Database Client
   import { PrismaClient } from "@prisma/client";

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
   export const db = globalForPrisma.prisma || new PrismaClient();
   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
   ```
2. **Serverless Connection Pooling / Proxy**: When connecting to Postgres from serverless environments, ALWAYS connect through a transaction pooler (PgBouncer, Supabase Pooler port 6543, or Neon serverless connection string with `?pgbouncer=true` or WebSockets `@neondatabase/serverless`).

---

## 🛡️ Atomic Multi-Table Transaction Invariant

When executing mutations that span across 2 or more database tables (e.g. creating an organization + creating the owner user, or creating an order + creating line items + decrementing inventory), operations MUST NOT be executed as standalone sequential queries:

### Mandatory Transaction Rule:
- All multi-table writes MUST be executed inside an explicit database transaction block (`db.transaction(async (tx) => { ... })`).
- If any operation or external verification fails, the entire transaction MUST abort and roll back automatically.
- Never perform long-running external HTTP network calls inside the open database transaction lock window; prepare payloads first, execute the DB transaction, then trigger asynchronous webhooks/emails.

---

## 📦 Hardened Direct-to-Storage Presigned Upload Standard

Never proxy large client file uploads through Node.js/SSR server memory (`multipart/form-data` parse buffers exhaust container RAM and freeze event loops). All uploads must follow the **Direct-to-Storage Presigned Standard**:

1. **Client requests presigned URL**: Client sends target filename, size, and MIME type to API endpoint.
2. **Strict MIME & Size Gate**: Server rejects any MIME type outside the explicit allowlist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and rejects files exceeding the budget ceiling (default 10MB).
3. **Sanitized UUID Storage Key**: Server generates a random UUID key (`uploads/YYYY-MM-DD/${crypto.randomUUID()}.${ext}`). Never allow user-submitted filenames to define the S3/R2 storage path.
4. **Short TTL**: Presigned PUT URL expires in 15 minutes.

---

## 🔁 Idempotent Webhook Processing Standard

Third-party webhooks (Stripe, Shopify, LemonSqueezy) retry requests on network timeouts or 5xx responses. Handlers must be strictly idempotent to prevent duplicate order fulfillment or double charging:

1. **Event Deduplication Cache**: Check incoming `event.id` against an idempotency table or Redis key with a 24-hour TTL before executing side-effects.
2. **Early 200 Ack for Duplicates**: If `event.id` was already processed, immediately return `HTTP 200 OK` with `{ received: true, duplicate: true }`.
3. **Timestamp Skew Gate**: Verify that the webhook header timestamp is within 5 minutes of current server time to block replay attacks.

---

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.


