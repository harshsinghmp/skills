# hook — Claude Code hook integration for session and tool-event Telegram notices.

Default stack: Claude Code hook scripts (bash), each calling Telegram via curl + jq, registered per Claude Code hook event. Defaults: hook scripts are executable bash; they log and fail-closed (Telegram down → the hook logs the failure and continues, never blocks Claude Code); hooks cover session start, session end, tool use, and error notices.

## Intake

- Which hook events to register: session start, session end, tool use, error.
- The Telegram target (bot token + chat from config).
- The message template per event (what Claude Code context to include).

## Deliverable

Hook scripts registered per event; each script sends a formatted Telegram message with the session ID, tool name, or error summary as appropriate; hook failures logged but not blocking.

## Procedure

1. Write a bash hook script per event:
   - Each script reads the Claude Code hook payload (environment or stdin per the hook contract), extracts the relevant fields (session ID, tool name, error message).
   - Each script calls `sendMessage` via curl + jq to the configured chat with the formatted message.
2. Register the hooks per the Claude Code hook events requested.
   - Session start / end: include session ID and a short summary.
   - Tool use: include tool name and a brief note (payload boundaries respected — not every argument, just the meaningful short summary).
   - Error: include the error summary; do not send full stack traces unless the operator asked.
3. Set hooks to fail-closed: if curl or jq fails, log the failure and exit cleanly so Claude Code is not blocked; the message may be lost but the session continues.

## Quality gate

- [ ] Hook scripts are executable bash.
- [ ] Each hook registered to the requested Claude Code event.
- [ ] Messages include the meaningful context (session ID, tool name, error summary) without dumping sensitive payloads.
- [ ] Hook failures are logged but do not block Claude Code (fail-closed).
- [ ] Telegram down → message lost but session continues; no blocked session.

## Routing

- Hook registration as part of a broader CI/automation pipeline → `automation`.
- Multi-skill orchestration of the same event stream → `coupling-router`.
- Error observability alongside the hook notice → `sentry`.

## Sources

- Claude Code hooks documentation for the hook event contract.
- Telegram Bot API: sendMessage.
- When a cited source conflicts with a default above, the source wins — record the override and why.
