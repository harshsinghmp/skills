# events — Event Tracking: Server-Side Ingestion, PII Scrubbing, Schema Validation, and Non-Blocking Transport

Server-side event ingestion, schema validation, privacy-preserving PII redaction, and deterministic multi-touch attribution.

---

## The Four Event Tracking Invariants

Every event collection pipeline and analytics ingestion layer must satisfy four core invariants:

### EVT-001: Zero-PII Ingestion Gate
- **Strict Redaction**: Payloads must be sanitized before logging or forwarding. Passwords, authorization tokens, session cookies, plaintext emails, phone numbers, credit card numbers, and social security numbers must be stripped or hashed at the edge layer.
- **Pattern Match & Mask**: String values matching email regexes (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`) or phone numbers must be redacted to `[REDACTED_EMAIL]` or `[REDACTED_PHONE]`.
- **Query Parameter Scrubbing**: URL query strings embedded in `page_url` or `referrer` must strip sensitive parameters (`token`, `auth`, `password`, `key`, `secret`, `access_token`).

### EVT-002: Strict Schema Validation & Idempotency
- **Event Taxonomy**: Enforce Object-Action naming convention (`entity_action`, e.g., `account_created`, `workspace_invited`, `checkout_completed`, `document_exported`). Reject unstructured or arbitrary names (`click1`, `userDone`).
- **Required Metadata**:
  - `event`: String (Object-Action convention, snake_case).
  - `timestamp`: ISO 8601 string or Unix millisecond timestamp.
  - `distinct_id`: Anonymous or authenticated user/workspace identifier.
  - `properties`: Structured dictionary of event attributes.
- **Idempotency Fingerprint**: Every event calculates a deterministic deduplication hash:
  $$\text{eventId} = \text{sha256}(\text{timestamp} + \text{distinct\_id} + \text{event})$$
  Duplicate events within a 24-hour sliding window are deduplicated with HTTP 200 acknowledgment.

### EVT-003: Dual-Rail Transport & Non-Blocking Edge Ingestion
- **Browser Transport**: Primary transport uses `navigator.sendBeacon()` for page unloads and background flushes; falls back to `fetch()` with `keepalive: true`.
- **Edge Ingestion**: Cloudflare Worker or edge API receives events, validates schema, redacts PII, responds with HTTP 202 Accepted within <15ms, and offloads write operations to Cloudflare D1, ClickHouse, or PostHog via non-blocking queues.
- **Failure Resilience**: Edge worker implements a circuit breaker (trip after 5 consecutive failures, 30s cool-down) and writes unroutable payloads to a dead-letter queue rather than losing data.

### EVT-004: Deterministic Multi-Touch Attribution Binding
- **Attribution Parameters**: Ingest and preserve `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `ref`, `gclid`, `fbclid`, and `ttclid`.
- **Dual-Touch Model**:
  - `first_touch`: Captured on initial anonymous session and persisted in secure `HttpOnly` or `SameSite=Lax` cookie for 90 days.
  - `last_touch`: Updated on the current converting session.
- **Organic & Direct Handling**: Explicitly classifies direct navigation vs organic search vs paid campaigns.

---

## Standard Event Taxonomy

| Event Name | Trigger Condition | Required Properties | Optional Properties |
| :--- | :--- | :--- | :--- |
| `page_viewed` | Route or page load completed | `path`, `title`, `url` | `referrer`, `viewport_width`, `viewport_height` |
| `user_signed_up` | Account registration successful | `signup_method`, `account_id` | `invite_code`, `plan` |
| `checkout_started` | User initiates payment flow | `cart_value`, `currency`, `item_count` | `coupon_code`, `payment_method` |
| `order_completed` | Payment confirmed by gateway | `order_id`, `revenue`, `currency`, `tax` | `discount`, `shipping_method` |
| `feature_used` | Key high-value feature engagement | `feature_name`, `interaction_type` | `latency_ms`, `result_count` |

---

## Edge Ingestion & PII Scrubber Architecture

```typescript
// Edge Ingestion Filter Pattern (Hono / Cloudflare Workers)
export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  distinct_id: string;
  properties: Record<string, unknown>;
  context?: {
    user_agent?: string;
    ip?: string;
    page_url?: string;
    referrer?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };
}

export function scrubPii(value: unknown): unknown {
  if (typeof value === "string") {
    // Email regex
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value)) {
      return "[REDACTED_EMAIL]";
    }
    // Phone regex
    if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(value)) {
      return "[REDACTED_PHONE]";
    }
    // Auth tokens or passwords
    if (/bearer\s+[a-zA-Z0-9._-]+/i.test(value) || /sk-[a-zA-Z0-9]{20,}/.test(value)) {
      return "[REDACTED_SECRET]";
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(scrubPii);
  }
  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (/(password|token|secret|auth|credit_card|ssn)/i.test(k)) {
        cleaned[k] = "[REDACTED]";
      } else {
        cleaned[k] = scrubPii(v);
      }
    }
    return cleaned;
  }
  return value;
}
```

---

## CLI & Tooling

Run the event collector engine:
```bash
# Validate event schema and taxonomy
bun skills/agency-delivery/analytics/scripts/event-collector.ts --validate event.json

# Test PII scrubbing against payload
bun skills/agency-delivery/analytics/scripts/event-collector.ts --scrub payload.json

# Generate compliant event template with deterministic ID
bun skills/agency-delivery/analytics/scripts/event-collector.ts --generate-payload --event user_signed_up --user-id usr_123
```
