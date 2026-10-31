# edge — Edge Runtime Architecture: Cloudflare Workers, Hono v4, D1 SQL, and sub-10ms cold start performance.

Autonomous edge computing architecture and runtime optimization for serverless web applications. Build ultra-low-latency APIs, middleware pipelines, and edge-rendered experiences using Cloudflare Workers, Hono v4, D1 relational databases, and edge KV caching.

---

## Intake

- **Edge Platform Target**: Cloudflare Workers, Cloudflare Pages Functions, Fastly Compute, or Vercel Edge Runtime.
- **Routing & Framework Core**: Hono v4 (lightweight, zero-dependency, standard Web API compliant) or Astro Edge SSR.
- **State & Storage Bindings**:
  - Relational: Cloudflare D1 (Serverless SQLite at the edge).
  - Key-Value: Cloudflare KV (Low-latency global reads).
  - Object Storage: Cloudflare R2 (S3-compatible, zero-egress fees).
  - External Database: Cloudflare Hyperdrive (Postgres connection pooling accelerator).
- **Latency & Compute Budgets**: Cold start < 10ms, total bundle size < 1MB uncompressed, memory ceiling <= 128MB.
- **Node.js Dependency Audit**: Identification of incompatible Node.js built-ins (`fs`, `child_process`, `net`, `dgram`).

---

## Deliverable

1. **Hono v4 Type-Safe Edge Router**:
   - Environment bindings typed interface (`Env` with D1, KV, and secrets).
   - Structured JSON response helper with RFC 7807 Problem Details for errors.
   - Global timing and request ID tracing middleware.
2. **Cloudflare D1 Relational Storage Pipeline**:
   - Parameterized SQL execution preventing injection (`db.prepare().bind().all()`).
   - Read-replication caching strategy via edge KV.
3. **Stale-While-Revalidate (SWR) Edge Caching Layer**:
   - Cache API integration using `caches.default`.
   - `Cache-Control` header policy: `public, max-age=60, s-maxage=300, stale-while-revalidate=86400`.
4. **Node.js Runtime Boundary Fence**:
   - Static verification confirming zero unpolyfilled Node modules enter the edge bundle.

---

## 🏛️ Edge Architecture Blueprints

### 1. Hono v4 Standard Edge Application Scaffold

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

export interface Bindings {
  DB: D1Database;
  CACHE_KV: KVNamespace;
  ENVIRONMENT: "production" | "staging" | "development";
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// 1. Global Middleware Pipeline
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: (origin) => (origin.endsWith(".agencyclient.com") ? origin : "https://agencyclient.com"),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// 2. Request Timing & Tracing
app.use("*", async (c, next) => {
  const start = performance.now();
  c.header("X-Request-Id", crypto.randomUUID());
  await next();
  const ms = (performance.now() - start).toFixed(2);
  c.header("Server-Timing", `edge;dur=${ms}`);
});

// 3. Health & Edge Diagnostics Endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    region: c.req.raw.cf?.colo || "local",
    timestamp: new Date().toISOString(),
  });
});

export default app;
```

---

### 2. Parameterized D1 Database Query Protocol

Cloudflare D1 is SQLite replicated across Cloudflare's edge network. All queries must enforce parameterized bindings:

```typescript
app.get("/api/v1/projects/:id", async (c) => {
  const id = c.req.param("id");
  const cacheKey = `project:${id}`;

  // 1. Check Edge KV Cache First
  const cached = await c.env.CACHE_KV.get(cacheKey, "json");
  if (cached) {
    c.header("X-Cache", "HIT-KV");
    return c.json(cached);
  }

  // 2. Query D1 with Parameterized Prepared Statement
  const statement = c.env.DB.prepare(
    "SELECT id, name, client_id, status, updated_at FROM projects WHERE id = ? AND deleted_at IS NULL"
  );
  const result = await statement.bind(id).first();

  if (!result) {
    return c.json(
      {
        type: "https://errors.agency.com/not-found",
        title: "Project Not Found",
        status: 404,
        detail: `Project '${id}' was not found in the active workspace registry.`,
      },
      404
    );
  }

  // 3. Populate KV Cache (TTL: 5 Minutes)
  c.executionCtx.waitUntil(
    c.env.CACHE_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 })
  );

  c.header("X-Cache", "MISS");
  return c.json(result);
});
```

---

### 3. Edge Runtime Boundary Rules (Invariants)

Edge runtimes (V8 isolates) do not run inside a full Node.js or Linux process. Follow these strict boundary rules:

| Operation | Node.js Legacy Pattern (FORBIDDEN) | Modern Edge Standard |
| :--- | :--- | :--- |
| **Filesystem Access** | `fs.readFileSync("template.html")` | Inline template strings or fetch from Cloudflare R2 / KV |
| **Process Control** | `process.exit(1)`, `child_process.exec()` | Web standard exceptions + fetch to isolated external microservices |
| **Cryptography** | `require("crypto").createHash("sha256")` | Web standard `crypto.subtle.digest("SHA-256", data)` |
| **Networking** | `net.Socket`, TCP raw connections | Standard `fetch()`, WebSockets, or Cloudflare Hyperdrive |
| **Timeouts** | `setTimeout(longTask, 60000)` | Bounded execution (< 30s) + `ctx.waitUntil()` for asynchronous tasks |

---

## Quality Gate

- [ ] Edge bundle imports zero unpolyfilled Node.js built-ins (`fs`, `child_process`, `net`).
- [ ] All D1 database queries use parameterized `.bind()` syntax (zero string interpolation).
- [ ] Responses carry `Server-Timing` headers reporting edge latency.
- [ ] Error responses follow RFC 7807 Problem Details schema with status and type URI.
- [ ] Asynchronous background operations (cache warm, logs) wrap inside `executionCtx.waitUntil()`.

---

## Routing

- **Infrastructure & Wrangler Deployments**: For `wrangler.jsonc` configuration, DNS routes, and Cloudflare custom domains, route to `devops:cloudflare`.
- **Database Migrations & Locking**: For D1 migration generation and schema integrity, route to `database:migrations`.
- **Edge Rate Limiting & Abuse Defense**: For sliding-window token buckets and DDoS shields, route to `webdev:rate-limit`.
- **E-Commerce & Stripe Webhooks**: For edge Stripe signature validation and order handling, route to `webdev:ecommerce`.
