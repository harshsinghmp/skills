# alerts — Multi-Channel Real-Time Notification & Alert Escalation Router

Real-time multi-channel notification and alert escalation router for client projects, uptime monitors, CI/CD pipelines, and agent swarms. Delivers structured alerts across Discord, Slack, Telegram, and webhooks with sliding-window deduplication, rate limiting, and 4-tier priority escalation.

---

## Alert Triggers & Inputs

- **Incident / Failure Event**: Build failures, runtime exceptions, DDL migration lock timeouts, 5xx error spikes, or database connection pool depletion.
- **Client & Delivery Milestones**: SOW signed, milestone verification receipts generated, 48-hour stop-the-clock warning, or deploy verification passed.
- **Channel Targets**: Discord webhook URL, Slack incoming webhook, Telegram bot token + chat ID, or generic HTTP webhook.
- **Priority Tier**: `P1` (Catastrophic/Immediate), `P2` (High/Degraded), `P3` (Warning/Operational), `P4` (Informational/Audit).

---

## 🔒 The 4 Alert Routing Invariants

### 1. Zero-Spam Sliding-Window Deduplication (ALT-001)
- Identical error signatures (`sha256(service + title + errorText)`) within a 5-minute sliding window must never fire duplicate notifications.
- Aggregate duplicate occurrences and append an occurrence counter: `[x8 occurrences in 5m]`.
- Enforce a strict channel rate limit: maximum 10 alerts per minute per webhook endpoint to avoid HTTP 429 rate limit bans.

### 2. 4-Tier Priority & Escalation Matrix (ALT-002)

| Tier | Urgency & Impact | Target Channels | Delivery Policy |
| :--- | :--- | :--- | :--- |
| **P1** | **Critical**: Production outage, database unreachable, security breach | Slack `#incidents`, Discord `@here`, Telegram Urgent, SMS/PagerDuty | Instant fan-out across all channels; bypasses quiet hours; loud ping |
| **P2** | **High**: Error rate > 5%, third-party API outage, webhook delivery queue blocked | Slack `#alerts`, Discord `#dev-alerts` | Immediate delivery; channel notify |
| **P3** | **Warning**: SLA 48h clock-stop trigger, stale worktree lease, disk usage > 80% | Slack `#daily-ops`, Discord `#ops` | Batched delivery (5m window); no audio ping |
| **P4** | **Info**: Clean deployment verified, test suite green, cache purge completed | Slack `#deployments`, Discord `#releases` | Silent push; structured summary embed |

### 3. Native Multi-Platform Payload Formatting (ALT-003)
- **Discord**: Uses rich embeds with tier-specific border colors (`P1: #FF0033`, `P2: #FF9900`, `P3: #FFCC00`, `P4: #00CC66`), markdown fields, and ISO-8601 footer timestamps.
- **Slack**: Uses Block Kit with bold section headers, context metadata blocks, and optional action buttons (e.g. "View Dashboard", "Inspect Logs").
- **Telegram**: Uses `parse_mode: HTML` with semantic formatting (`<b>`, `<code>`, `<pre>`), preventing malformed markdown entity crashes.

### 4. Failure-Safe Circuit Breaker & Dead-Letter Fallback (ALT-004)
- Webhook network failures (timeouts, 502 Bad Gateway, 429 Too Many Requests) trigger exponential backoff with full jitter (up to 3 retries).
- If an endpoint fails 5 consecutive times, activate a 60-second circuit breaker and route payload to local `.agents/artifacts/alerts/dead-letter.json` without crashing the host process.

---

## 💻 CLI Usage

```bash
# Dispatch high-priority alert across channels
bun alert-router.ts --dispatch --tier P1 --title "Production API 502 Surge" --message "Edge worker error rate exceeded 12% in us-east." --channels slack,discord

# Format payload for specific platform
bun alert-router.ts --format discord --tier P2 --title "Migration Lock Warning" --message "Exclusive table lock held for >500ms on users."

# Test deduplication window
bun alert-router.ts --dedup-check --signature "db-pool-timeout" --window-sec 300
```
