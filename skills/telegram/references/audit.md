# audit — telegram audit mode

## When to Use

- **Bot security audit**: verify zero secret exposure and correct file permissions across every bot configuration.
- **Delivery reliability audit**: confirm routing, approvals, and hook wiring actually fire end-to-end.
- **Multi-bot fleet review**: one pass over every configured bot/target for drift and dead routes.

## Checklist

- [ ] Bot tokens exist only in config files with `mode 600` — never in shell history, scripts, or env dumps
- [ ] No token ever echoed, logged, or committed (`rg -n "[0-9]{8,10}:AA" --hidden` across the workspace)
- [ ] Every configured `chat_id` verified reachable (send a no-op ping; flag unreachable targets)
- [ ] Config routing: every event type maps to an existing chat/bot/target — no orphan routes
- [ ] Approval boards: approve/reject callbacks resolve to a live handler; expired approvals time out cleanly
- [ ] Claude Code hooks: session start/end/tool-use/error hooks registered and idempotent (no double-send)
- [ ] Message formatting: `parse_mode` set explicitly per send; HTML/Markdown entities escaped
- [ ] Rate limits respected: no send loop without spacing (429 handling present)
- [ ] Kafka routing: ack → dispatch ordering intact; poison messages don't silently drop
- [ ] Logs: delivery failures surfaced (not swallowed); retry policy documented

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Token found outside a `mode 600` config | `CRITICAL` | rotate the token immediately, then re-secure |
| Unreachable chat_id | `AUTO-REPAIR` | prune the dead route, report the removal |
| Hook registered twice (double-send) | `AUTO-REPAIR` | dedupe the hook registration |
| Missing 429 backoff | `REPORT-ONLY` | `telegram:setup` hardening |
| Silent send failure | `REPORT-ONLY` | route failures to the error hook |

## Sources

- OWASP — Secrets Management guidance (no secrets in logs/history; encrypted at rest)
- this skill's own mode-600 config and zero-secret delivery contract (SKILL.md, setup mode)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
