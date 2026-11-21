# rate-limit — Edge Rate Limiting & Abuse Defense: Sliding-window token buckets, DDoS mitigation, and anti-scraping fences.

Enterprise-grade rate limiting, API abuse prevention, and bot deterrence for web endpoints, authentication gateways, and AI agent routes. Enforces sliding-window counters, IETF RateLimit standards, and graceful backoff mechanisms to protect backend resources from overload.

---

## Intake

- **Protected Route Class**:
  - `auth`: Login, signup, password reset (Strict: 5 requests / 60 seconds).
  - `ai`: Agent prompts, LLM completion endpoints (Metered: 20 requests / 60 seconds).
  - `api`: General authenticated REST/GraphQL endpoints (Standard: 120 requests / 60 seconds).
  - `public`: Static landing pages, assets (Generous: 600 requests / 60 seconds).
- **Client Identity Vector**:
  - Primary: Authenticated Account ID or Bearer API Key.
  - Secondary: Hashed IP address using `cf-connecting-ip` (Cloudflare) or `x-real-ip` with salt.
- **Rate-Limiting Backend**: Cloudflare KV, Upstash Redis (REST), or in-memory LRU sliding log.
- **Enforcement Action**: HTTP 429 Too Many Requests, header warning injection, or honeypot delay tarpit.

---

## Deliverable

1. **Sliding-Window Rate Limiting Middleware**:
   - Algorithm that prevents window-boundary burst exploits common to fixed-window algorithms.
2. **IETF & RFC 6585 Standard Headers**:
   - `RateLimit-Limit`: Maximum permitted request quota in the active window.
   - `RateLimit-Remaining`: Count of remaining requests before exhaustion.
   - `RateLimit-Reset`: Seconds remaining until the quota fully resets.
   - `Retry-After`: Seconds the client must pause before retrying upon receiving a 429.
3. **Bot & Scraper Tarpit Defense**:
   - Honeypot hidden input checks for form submissions.
   - Instant IP blocklist flagging for repeated 429 violators.

---

## 🏛️ Rate Limiting Blueprints

### 1. Sliding-Window Rate Limiting Algorithm (TypeScript)

The sliding window counter algorithm blends the request count from the previous window with the current window's progression to compute an accurate rate:

```typescript
export interface RateLimitConfig {
  limit: number;      // Maximum allowed requests in window
  windowSeconds: number; // Duration of window in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function evaluateSlidingWindow(
  currentCount: number,
  previousCount: number,
  currentWindowStart: number,
  now: number,
  config: RateLimitConfig
): RateLimitResult {
  const windowMs = config.windowSeconds * 1000;
  const timeIntoCurrentWindow = now - currentWindowStart;
  const weight = Math.max(0, Math.min(1, (windowMs - timeIntoCurrentWindow) / windowMs));
  
  // Weighted estimate of requests in the sliding window
  const estimatedCount = Math.floor(previousCount * weight + currentCount);
  const allowed = estimatedCount < config.limit;
  const remaining = Math.max(0, config.limit - estimatedCount);
  const resetSeconds = Math.ceil((windowMs - timeIntoCurrentWindow) / 1000);

  return {
    allowed,
    limit: config.limit,
    remaining,
    resetSeconds: Math.max(1, resetSeconds),
  };
}
```

---

### 2. Hono v4 Rate-Limiting Middleware Integration

```typescript
import { createMiddleware } from "hono/factory";

export const rateLimiter = (tier: "auth" | "ai" | "api" = "api") => {
  const limits: Record<string, { limit: number; window: number }> = {
    auth: { limit: 5, window: 60 },
    ai: { limit: 20, window: 60 },
    api: { limit: 120, window: 60 },
  };

  const config = limits[tier] || limits.api;

  return createMiddleware(async (c, next) => {
    // 1. Resolve Client Identifier
    const authHeader = c.req.header("Authorization");
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1";
    const clientId = authHeader ? `user:${authHeader.slice(-12)}` : `ip:${ip}`;
    const cacheKey = `ratelimit:${tier}:${clientId}`;

    // 2. Fetch and Increment Counter (Cloudflare KV or Redis)
    const now = Date.now();
    const windowStart = now - (now % (config.window * 1000));
    
    // In production, execute atomic incr/eval against KV or Redis:
    const count = parseInt((await c.env?.CACHE_KV?.get(cacheKey)) || "0", 10) + 1;
    await c.env?.CACHE_KV?.put(cacheKey, count.toString(), { expirationTtl: config.window * 2 });

    const remaining = Math.max(0, config.limit - count);
    const reset = Math.ceil((windowStart + config.window * 1000 - now) / 1000);

    // 3. Inject IETF RateLimit Headers
    c.header("RateLimit-Limit", config.limit.toString());
    c.header("RateLimit-Remaining", remaining.toString());
    c.header("RateLimit-Reset", reset.toString());

    // 4. Enforce Limit
    if (count > config.limit) {
      c.header("Retry-After", reset.toString());
      return c.json(
        {
          type: "https://errors.agency.com/rate-limit-exceeded",
          title: "Too Many Requests",
          status: 429,
          detail: `Rate limit exceeded for tier '${tier}'. Retry in ${reset} seconds.`,
        },
        429
      );
    }

    await next();
  });
};
```

---

### 3. Honeypot & Bot Tarpit Defense

Bots blindly fill every field in a form. Adding a CSS-hidden honeypot catches automated spam without frustrating human users:

```html
<!-- Invisible to human users; autofilled by automated bots -->
<div style="opacity: 0; position: absolute; top: 0; left: 0; height: 0; width: 0; z-index: -1;">
  <label for="agency_website_hp">Leave this field blank</label>
  <input type="text" id="agency_website_hp" name="agency_website_hp" autocomplete="off" tabindex="-1" />
</div>
```

Server-side validation:
```typescript
const body = await c.req.parseBody();
if (body["agency_website_hp"]) {
  // Silent drop or delay tarpit: pretend success, do not record or send email
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay bot execution
  return c.json({ status: "success", message: "Submission received" }, 200);
}
```

---

## Quality Gate

- [ ] Rate limits configured per tier (`auth`: 5/min, `ai`: 20/min, `api`: 120/min).
- [ ] Responses inject `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers.
- [ ] 429 status code includes accurate `Retry-After` header in seconds.
- [ ] Sliding-window algorithm protects against boundary spike exploits.
- [ ] Honeypot tarpits trap scrapers without triggering false positives for accessibility screen readers.

---

## Routing

- **Edge Architecture & Workers**: For deploying Hono routers to Cloudflare Workers, route to `webdev:edge`.
- **Security Audit & WAF Hardening**: For Cloudflare WAF managed rules and DDoS mitigations, route to `muse-security:waf`.
- **Backend APIs & Data Layer**: For Node.js/Postgres API endpoints, route to `webdev:backend`.
