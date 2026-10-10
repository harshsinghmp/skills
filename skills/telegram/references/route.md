# route — Route structured events to Telegram with ack and dispatch.

Default stack: Kafka-event routing shaped as alert → ack → dispatch, config-file target mapping, curl + jq for the Telegram send. Defaults: each event is acked before dispatch; target routing reads the config (event type → chat / bot / target); channel down → queue note, not silent drop; sensitive payloads sanitized before send.

## Intake

- The event stream or event shape (Kafka topic, event type, payload fields).
- The routing config: which event type goes to which chat/bot/target.
- Sensitivities: which payload fields must be sanitized before sending.

## Deliverable

Events routed to the correct Telegram target with ack before dispatch; sensitive fields scrubbed; channel-down events noted rather than dropped.

## Procedure

1. Shape the event into a Telegram-ready message: summarize the event, include the key fields (event type, source, summary, timestamp), scrub sensitive payload fields per the sensitivity list.
2. Ack the event before dispatch: mark the event acknowledged so it is not re-routed or lost on retry.
3. Dispatch to the target from config: read the routing map (event type → target) and send to the correct chat/bot.
4. On channel down: queue a note (do not silently drop); the operator is informed that a message did not deliver.

## Quality gate

- [ ] Event acked before dispatch (no re-route or silent loss on retry).
- [ ] Target routing reads config; correct chat/bot/target per event type.
- [ ] Sensitive payload fields scrubbed before send.
- [ ] Channel down → note queued, operator informed, not silent drop.
- [ ] Message contains the meaningful summary, not the raw sensitive payload.

## Routing

- The event source is a CI/CD pipeline → `automation` owns the pipeline; this skill routes the Telegram leg.
- Multi-skill orchestration of the same event stream → `coupling-router`.
- Error observability alongside routed alerts → `sentry`.
- User-facing event messages (onboarding, status) → `user-onboarding`.

## Sources

- Telegram Bot API: sendMessage.
- Kafka event routing patterns (ack before dispatch, consumer group, retry).
- When a cited source conflicts with a default above, the source wins — record the override and why.
