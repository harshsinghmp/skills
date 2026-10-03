# notify — Send a Telegram message to a configured chat.

Default stack: Telegram Bot API via curl + jq, no SDK. Defaults: text message to a single configured chat; optional parse_mode (Markdown/HTML) when requested; optional reply_to_message_id when threading; channel down → clear error, never silent drop.

## Intake

- The message text or a description of what to send.
- Target chat or bot+chat from config (resolved during setup or via the config routing).
- Optional: parse_mode, reply_to, or formatting.

## Deliverable

Sent confirmation: message ID (when returned), chat target, timestamp, and any error with the Telegram API reason.

## Procedure

1. Resolve the target: bot token and chat ID from config (mode-600 on the config file; token never printed).
2. Build the curl call:
   - URL: `https://api.telegram.org/bot<token>/sendMessage`
   - Body: JSON with `chat_id`, `text`, optional `parse_mode`, `reply_to_message_id`, `disable_web_page_preview`.
3. Send via curl, parse the response with jq to confirm `ok: true` and read `result.message_id` and `result.date`.
4. On failure: surface the Telegram API error reason (e.g. `chat not found`, `bot was blocked`), not a generic curl error.

## Quality gate

- [ ] Config resolved; token read from mode-600 file, not printed.
- [ ] curl to `sendMessage` returns `ok: true`; message ID and date captured.
- [ ] Failure surfaces the real Telegram error reason.
- [ ] Optional formatting and threading respected when requested.

## Routing

- Notification belongs in a CI/CD pipeline → `automation` owns the pipeline; this skill is the Telegram leg.
- Multi-skill orchestration routing the same event → `coupling-router`.
- Error alerting alongside the message → `sentry`.
- User-facing onboarding message → `user-onboarding`.

## Sources

- Telegram Bot API: sendMessage.
- When a cited source conflicts with a default above, the source wins — record the override and why.
