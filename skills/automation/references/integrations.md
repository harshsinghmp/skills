# integrations — Integrations: reliable API/webhook connections with auth and error handling.

## Intake

- Systems to connect and direction of data flow
- APIs available (REST/GraphQL/webhooks) and their limits
- Auth model (OAuth, API key) and rate limits
- Sync expectations (real-time, scheduled, batch)
- Default stack: self-hosted n8n as integration plane (or current platform); credentials in Bitwarden (or current secret store).

## Deliverable

A working integration: authenticated API calls or webhook handlers, field mappings, rate-limit and error handling, retry/backoff, and a data-sync spec — built in code or an automation platform.

## Procedure

1. Confirm both systems' APIs, auth, and rate limits before designing.
2. Define the direction and frequency of each data flow.
3. Map fields explicitly, including transformations and defaults.
4. Implement auth securely (OAuth token refresh; keys in a secret store).
5. Handle rate limits (backoff), errors (retry + alert), and duplicates (idempotency keys).
6. Verify webhook signatures; validate and sanitize inbound payloads.
7. Log sync results and provide a re-sync path for failures.

## Quality gate

- [ ] APIs, auth, and rate limits confirmed.
- [ ] Field mappings explicit.
- [ ] Secrets in a secret store; OAuth refresh handled.
- [ ] Rate-limit backoff and error retries present.
- [ ] Webhook signatures verified; inputs validated.
- [ ] Re-sync path exists.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
