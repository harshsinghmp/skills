# preview — Living Deliverables & Ephemeral Client Review Sandboxes

Architecture, workflow, and quality gates for scaffolding ephemeral client review portals, local `workerd` edge containers, token-gated review links via Cloudflare Quick Tunnels (`*.trycloudflare.com`), multi-viewport frame overlays, and automated 48-hour access expiration.

---

## Intake & Triggers

- **Review Target**: Local application port (e.g., Next.js on `3000`, Astro on `4321`, Hono on `8787`).
- **Client Identity**: Client codename or brand slug (e.g., `acme-corp`).
- **Deliverable Title**: Milestone or feature name (e.g., `Checkout Flow V1 Prototype`).
- **Access Duration**: Configurable expiration TTL (default: `48` hours).

---

## Deliverables

1. **Local Edge Worker Envelope (`.agents/deliverables/<slug>/`)**:
   - Isolated `worker.ts` proxying the local target port.
   - Declarative `wrangler.jsonc` configured for local `workerd` / Miniflare execution.
2. **Ephemeral Token-Gated Review Link**:
   - Public Cloudflare Quick Tunnel URL (`https://<hash>.trycloudflare.com/?review_token=<token>`).
   - Rejects unauthenticated traffic with HTTP 401.
3. **Interactive Client Review Overlay**:
   - Floating review banner with client codename and live countdown timer.
   - One-click multi-viewport frame switcher: Mobile (`390px`), Tablet (`820px`), and Desktop (`100%`).
   - Integrated client feedback ingestion endpoint (`POST /__deliverable/feedback`).
4. **Automated Expiry Verification**:
   - Terminal gate returning remaining hours and expiring to HTTP 410 Gone post-TTL.

---

## 🔒 The 4 Living Deliverable Invariants

### 1. Zero Cloud Overhead & Local Edge Execution (PRV-001)
- Scaffolds an edge container running directly on the host using `workerd` (via Wrangler/Miniflare).
- Eliminates premature staging branch deployments, Vercel preview seat charges, and remote infrastructure pollution.

### 2. Cryptographic Token-Gated Ingress (PRV-002)
- Generates a 32-byte cryptographically secure review token during scaffolding:
  ```json
  {
    "slug": "client-acme-v1",
    "token": "4f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    "reviewUrlPattern": "https://<tunnel-hash>.trycloudflare.com/?review_token=4f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c"
  }
  ```
- Any request without the exact matching query token or session cookie is rejected with HTTP 401 Unauthorized.

### 3. Deterministic 48-Hour TTL Expiration (PRV-003)
- Deliverable metadata records `createdAt` and `expiresAt` timestamps.
- Once elapsed, the proxy terminates active traffic with HTTP 410 Gone:
  ```http
  HTTP/1.1 410 Gone
  Content-Type: text/html

  <h2>Deliverable Review Window Expired</h2>
  <p>This ephemeral client preview link expired after 48 hours. Contact your agency project lead to refresh access.</p>
  ```

### 4. Non-Destructive Review Overlay & Viewport Switcher (PRV-004)
- Non-destructively injects an iframe wrapper and toolbar into HTML responses:
  - **Mobile Preview**: Fixed width `390px` with iOS safe area padding.
  - **Tablet Preview**: Fixed width `820px` for iPad portrait testing.
  - **Desktop Preview**: Fluid `100%` viewport width.
- Client comments submitted through the overlay banner append directly to `.agents/deliverables/<slug>/feedback.json`.

---

## 💻 CLI Integration

```bash
# Scaffold new living deliverable for client ACME pointing to port 3000
bun devops/scripts/living-deliverable.ts --scaffold "client-acme-v1" --client "ACME" --target-port 3000

# Check expiration status
bun devops/scripts/living-deliverable.ts --check-expiry "client-acme-v1"
```
