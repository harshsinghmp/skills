# realtime — Real-time Event Streaming: WebSockets, SSE event multiplexing, reconnection backoff, and Redis Pub/Sub.

Enterprise real-time communication, event streaming, and pub/sub architecture for live dashboards, collaborative AI agents, and push notifications. Enforces structured connection lifecycles, heartbeat keep-alives, exponential reconnect backoff with jitter, and tenant-isolated channel multiplexing.

---

## Intake

- **Transport Mechanism**:
  - `WebSocket`: Bidirectional duplex streaming (AI chat tokens, live cursors, interactive telemetry).
  - `Server-Sent Events (SSE)`: Unidirectional server-to-client event stream (agent status updates, notifications, background job completion).
- **Pub/Sub Broker**: Redis Pub/Sub (ioredis/Upstash), Cloudflare Durable Objects / Hibernation API, or Kafka.
- **Authentication Handshake**: Bearer token via `Sec-WebSocket-Protocol` header or signed initial connection handshake query parameter.
- **Liveness & Latency Requirements**: Heartbeat interval (30s ping/pong), stale connection timeout (60s), target packet latency (< 50ms).
- **Client Resilience**: Reconnection backoff strategy with randomized jitter to prevent thundering herd recovery.

---

## Deliverable

1. **Production WebSocket Server / Edge Handler**:
   - Connection authentication handshake.
   - Channel subscription multiplexer (`subscribe:channel_id`, `unsubscribe:channel_id`).
   - Ping/Pong heartbeat watchdog terminating half-open sockets.
2. **Server-Sent Events (SSE) Streaming Gateway**:
   - Standard Web API `ReadableStream` responding with `Content-Type: text/event-stream`.
   - Event formatting (`event: <name>\ndata: <json>\n\n`) with keep-alive comments (`: ping\n\n`).
3. **Resilient Client Reconnect Engine with Jitter**:
   - Exponential backoff algorithm (`min(initial * 2^attempt + jitter, maxDelay)`).
4. **Tenant Channel Isolation Fence**:
   - Cryptographic verification preventing clients from subscribing to unauthorized client/tenant channels.

---

## 🏛️ Real-time Architecture Blueprints

### 1. Robust Server-Sent Events (SSE) Stream Controller

```typescript
export interface SSEEvent {
  event?: string;
  data: Record<string, unknown> | string;
  id?: string;
  retry?: number;
}

export function formatSSEMessage(msg: SSEEvent): string {
  let payload = "";
  if (msg.id) payload += `id: ${msg.id}\n`;
  if (msg.event) payload += `event: ${msg.event}\n`;
  if (msg.retry) payload += `retry: ${msg.retry}\n`;

  const dataStr = typeof msg.data === "string" ? msg.data : JSON.stringify(msg.data);
  // Multi-line data handling per SSE spec
  for (const line of dataStr.split("\n")) {
    payload += `data: ${line}\n`;
  }
  return `${payload}\n`;
}

export function createSSEStream(onConnect: (send: (event: SSEEvent) => void) => () => void): Response {
  let cleanup: (() => void) | null = null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(encoder.encode(formatSSEMessage(event)));
      };

      // Keep-alive heartbeat every 15s to prevent intermediate proxy timeout
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, 15000);

      cleanup = () => {
        clearInterval(heartbeat);
        const teardown = onConnect(send);
        teardown();
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables Nginx response buffering
    },
  });
}
```

---

### 2. Exponential Reconnection Backoff with Full Jitter

When a server restarts or network blips occur, thousands of clients reconnecting simultaneously cause a **Thundering Herd** breakdown. Implement Full Jitter:

```typescript
export interface BackoffConfig {
  baseMs: number;     // e.g. 1000ms
  maxMs: number;      // e.g. 30000ms
  factor: number;     // e.g. 2.0
}

export function calculateBackoffWithJitter(attempt: number, config: BackoffConfig = { baseMs: 1000, maxMs: 30000, factor: 2 }): number {
  const exponential = Math.min(config.maxMs, config.baseMs * Math.pow(config.factor, attempt));
  // Full Jitter: Uniform random between 0 and exponential delay
  return Math.floor(Math.random() * exponential);
}
```

---

### 3. WebSocket Channel Multiplexing & Guard Protocol

```typescript
export interface InboundWSMessage {
  action: "subscribe" | "unsubscribe" | "publish" | "ping";
  channel?: string;
  payload?: Record<string, unknown>;
}

export function validateChannelAccess(userId: string, tenantId: string, channel: string): boolean {
  // Enforce channel naming format: `tenant:{tenant_id}:{resource}`
  const prefix = `tenant:${tenantId}:`;
  if (!channel.startsWith(prefix)) {
    return false; // Unauthorized cross-tenant subscription attempt
  }
  return true;
}
```

---

## Quality Gate

- [ ] SSE streams include `: keepalive\n\n` comments every 15–30s to prevent reverse proxy dropouts.
- [ ] SSE headers enforce `X-Accel-Buffering: no` to prevent Nginx buffering chunks.
- [ ] Clients implement exponential backoff with full jitter to eliminate thundering herd spikes.
- [ ] Channel subscriptions strictly enforce tenant boundaries (clients can only subscribe to their own tenant channel).
- [ ] WebSockets include strict ping/pong watchdog terminating stale connections within 60s.

---

## Routing

- **Edge APIs & Hono Controllers**: For edge HTTP endpoints and serverless routes, route to `webdev:edge`.
- **Background Worker Automation**: For background event queue processors, route to `automation:workflow`.
- **Infrastructure & Redis**: For hosting Redis clusters or Upstash instances, route to `devops:hosting`.
