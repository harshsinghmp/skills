# webhook — Telegram Webhook Receiver, Ingress Security & Idempotent Event Dispatch

Operating Division: **Sol (Product Architect & Full-Stack Automator)**

Zero-dependency, production-grade Telegram webhook ingress infrastructure with timing-safe header verification, replay protection, deduplication fences, and sub-200ms asynchronous event dispatching.

---

## Architecture & Core Invariants

```
                                  TELEGRAM BOT API INGRESS
                                             │
                                             ▼ HTTPS POST /webhook
                              ┌─────────────────────────────┐
                              │  Ingress Header Gate        │
                              │  X-Telegram-Bot-Api-Secret  │
                              └──────────────┬──────────────┘
                                             │ crypto.timingSafeEqual (WBK-002)
                                             ▼
                              ┌─────────────────────────────┐
                              │  Replay & Timestamp Fence   │
                              │  max_drift <= 300s          │
                              └──────────────┬──────────────┘
                                             │ update_id LRU Dedup (WBK-003)
                                             ▼
                              ┌─────────────────────────────┐
                              │  Fast HTTP 200 OK Ack       │
                              │  Latency < 200ms            │
                              └──────────────┬──────────────┘
                                             │ Asynchronous Dispatch (WBK-004)
                                             ▼
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
              In-Memory Event Bus                            Redis / Kafka Stream
```

### Invariants:
- **WBK-001 (Pure-Runtime Webhook Listener & Health Probe)**: Zero-dependency Node.js/Bun HTTP listener with `/webhook` receiver, `/healthz` and `/ready` probes, supporting pure-bash / curl registration (`setWebhook`) with `secret_token` and `allowed_updates`.
- **WBK-002 (Timing-Safe Secret Token Verification)**: Strict validation of `X-Telegram-Bot-Api-Secret-Token` header using `crypto.timingSafeEqual` against configured secret. Enforces minimum 32-character high-entropy secret token (`[A-Za-z0-9_-]`). Enforces HTTPS for ingress.
- **WBK-003 (Replay Attack & Timestamp Drift Mitigation)**: Ingress event timestamp verification (`max_drift_seconds: 300` / 5 minutes) and sliding LRU deduplication cache for Telegram `update_id`s to prevent replay attacks and duplicate event execution.
- **WBK-004 (Idempotent Event Ingestion & Backpressure Queue)**: Immediate HTTP 200 OK acknowledgement back to Telegram to avoid delivery retry storms, asynchronous decoupling of event payload into memory/Redis/Kafka queue, error containment (failures don't crash receiver), and dead-letter capture.

---

## Intake

- Webhook public ingress URL (must be valid `https://` endpoint).
- Secret token: 1-256 characters (`[A-Za-z0-9_-]`), recommended $\ge 32$ characters.
- Telegram Bot Token: read strictly from a `mode 600` config file or secure environment variable.
- Allowed updates: list of event types to subscribe (`message`, `edited_message`, `callback_query`, `inline_query`, `chosen_inline_result`, `channel_post`, `my_chat_member`, `chat_member`, `chat_join_request`).
- Downstream target: In-memory handler, Redis list/stream, Kafka topic, or CLI worker.

---

## Deliverable

1. Hardened webhook receiver server supporting `/webhook`, `/healthz`, and `/ready`.
2. Constant-time secret token gate preventing timing attacks.
3. Update deduplication engine tracking recent `update_id` entries with automated TTL pruning.
4. Fast HTTP 200 OK acknowledgement before downstream dispatch.
5. Registration script / command generation for `setWebhook`, `getWebhookInfo`, and `deleteWebhook`.
6. Audit capability verifying configuration security, secret entropy, and TLS requirements.

---

## Procedure

### 1. Secret Token & Ingress URL Configuration
Generate a cryptographically secure 32+ character alphanumeric token:
```bash
# Generate 32-character URL-safe secret token
openssl rand -base64 24 | tr '+/' '-_' | tr -d '='
```
Store token in `telegram-config.json` with strict `mode 600` file permissions (`chmod 600 telegram-config.json`).

### 2. Stand Up Webhook Receiver Listener
Start the pure-runtime receiver using `webhook-receiver.ts` CLI:
```bash
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --listen-webhook --port 8080 --config telegram-config.json
```
Endpoints exposed:
- `POST /webhook`: Telegram webhook ingestion target.
- `GET /healthz`: Liveness probe (returns `{"status":"ok","uptime":...}`).
- `GET /ready`: Readiness probe verifying secret token and downstream connection.

### 3. Ingress Authentication Gate (Timing-Safe)
Verify incoming `X-Telegram-Bot-Api-Secret-Token` header:
```typescript
import { timingSafeEqual } from "node:crypto";

export function verifySecretToken(receivedHeader: string | undefined, expectedSecret: string): boolean {
  if (!receivedHeader || !expectedSecret) return false;
  const receivedBuf = Buffer.from(receivedHeader);
  const expectedBuf = Buffer.from(expectedSecret);
  if (receivedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(receivedBuf, expectedBuf);
}
```
If header verification fails, immediately respond with `403 Forbidden` and log the unauthorized attempt with IP and timestamp. Never leak secret contents.

### 4. Deduplication & Replay Prevention
Filter out duplicate `update_id`s and stale timestamps:
1. Extract `update.update_id`.
2. Check internal LRU cache (default size 10,000 entries).
3. If `update_id` already exists, immediately return `200 OK` and skip processing.
4. Extract `message.date` (or equivalent update timestamp). If older than `max_drift_seconds` (300s), reject as stale replay attempt.
5. Record `update_id` into LRU cache with current timestamp.

### 5. Immediate Ack & Asynchronous Dispatch
Telegram expects an HTTP `200 OK` response within a few seconds, otherwise it retries update delivery exponentially, causing cascade storms:
1. Return `res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: true }))`.
2. Asynchronously hand off `update` payload to downstream worker (in-memory event emitter, Redis stream `XADD`, or Kafka producer).
3. Catch any unhandled worker errors in an isolated catch block to prevent unhandled promise rejections.

### 6. Register Webhook with Telegram Bot API
Use `setWebhook` via curl:
```bash
curl -s -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.agency.com/telegram/webhook",
    "secret_token": "<SECRET_TOKEN>",
    "max_connections": 40,
    "allowed_updates": ["message", "callback_query", "channel_post"]
  }' | jq .
```
Verify registration status:
```bash
curl -s -X GET "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo" | jq .
```

---

## Quality Gate

- [ ] Ingress endpoint enforces HTTPS (`url` starts with `https://`).
- [ ] Ingress header `X-Telegram-Bot-Api-Secret-Token` verified with `crypto.timingSafeEqual`.
- [ ] Secret token satisfies minimum entropy requirement ($\ge 32$ characters, `[A-Za-z0-9_-]`).
- [ ] Replay attack mitigation active: updates older than 300 seconds dropped.
- [ ] Deduplication buffer active: duplicate `update_id`s acknowledged with 200 OK but ignored.
- [ ] Response latency under 200ms (HTTP 200 returned before heavy downstream processing).
- [ ] Health and readiness probes (`/healthz`, `/ready`) return HTTP 200 with operational metrics.
- [ ] Config files protected with `chmod 600`; zero tokens printed in logs or console output.
- [ ] Fail-closed error handling prevents unhandled exceptions from crashing the process.

---

## CLI Reference

```bash
# Start standalone webhook receiver
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --listen-webhook --port 8080 --secret-token "$TG_SECRET"

# Audit webhook configuration and secret entropy
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --audit-config --config ./telegram-config.json

# Test secret token verification
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --verify-secret --secret "$SECRET" --header "$HEADER"

# Generate setWebhook curl command and registration payload
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --register-webhook --url "https://api.agency.com/telegram/webhook" --secret "$SECRET"

# Scaffold a production webhook receiver server
bun skills/agency-delivery/telegram/scripts/webhook-receiver.ts --scaffold-receiver --output ./src/telegram-receiver
```

---

## Sources & Precedence

1. Telegram Bot API: Webhook & Update Ingress (`setWebhook`, `getWebhookInfo`, `deleteWebhook`).
2. Node.js Crypto API: `timingSafeEqual` constant-time cryptographic buffer comparison.
3. RFC 9110: HTTP Semantics (Status 200 OK fast acknowledgement, Status 403 Forbidden).
4. OWASP API Security: API3:2023 Broken Object Property Level Authorization & Timing Attack Prevention.
