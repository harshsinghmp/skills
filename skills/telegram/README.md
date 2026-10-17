# Telegram — for the humans who run this skill.

This directory is the Telegram department for the agency: bot alerts, approval boards, hooks, event routing, and token setup — all pure bash + curl + jq, no pip installs.

## What you get

- **notify** — send a message to a Telegram chat (text, formatting, threading).
- **approve** — pause a long-running task and wait for an approve/reject button callback.
- **hook** — register Claude Code hooks so Telegram gets session/tool/error notices.
- **route** — route structured events to the right chat/bot/target, with ack before dispatch.
- **setup** — create a bot token config file with mode-600 and recovery docs.

## When to use it

- You want build/test/release alerts in a Telegram chat instead of Slack or email.
- You have a long-running operation (deploy, bulk run) that needs a human to confirm before it goes further.
- You want Claude Code sessions, tool use, or errors mirrored into a Telegram chat.
- You have an event stream (Kafka or anything event-shaped) and want Telegram alerts routed by event type.
- You are standing up a new Telegram bot and want the config protected and documented.

## How it fits your workflow

You run a full-service creative web marketing agency. Telegram is your internal automation channel. It fits in three places:

1. **CI/CD and release alerts.** Your `automation` pipelines (builds, tests, deploys, releases) produce events. This skill is the Telegram leg — the pipeline owns the event, Telegram carries it to the team chat. No pip, no SDK, just curl + jq from the pipeline's shell.

2. **Deployment and bulk-operation approval.** Some operations should not run unattended: a production deploy, a bulk campaign send, a database migration. The `approve` mode sends an inline keyboard to your Telegram chat, pauses the task, and resumes or aborts on the callback. This is the human-in-the-loop gate for anything risky.

3. **Claude Code visibility.** If you run Claude Code sessions that touch production or long-running tasks, the `hook` mode can register hook scripts so Telegram gets a notice on session start, session end, tool use, or errors. The hooks are fail-closed: Telegram down means the message is lost, but the Claude Code session is not blocked. You see what happened in Telegram; the session keeps going.

A fourth shape — event routing — is useful when you have multiple event types (build break, deploy success, release cut, error spike) and want each one in the right chat or with the right formatting. The `route` mode shapes each event, acks it before dispatch, and sends it to the configured target.

## What it does NOT do

- It does not post to Instagram or social platforms (that is `social-media`).
- It does not sync content to Notion (that is `content-creator`).
- It does not do Google OAuth — Telegram uses a bot token; there is no OAuth in this skill.
- It does not replace Slack, Discord, or email — if you want another channel, that is a different skill.

## Setup

Run the `setup` mode first. It creates a config file with your bot token and chat ID, sets mode-600 on the file, binds to the env-manager layer when present, and writes recovery docs (device churn, token loss, chat ID changes). The token is never printed in output or logs.

After setup, use `notify` for the first message to confirm it works.

## Tokens and permissions

- The bot token lives in the config file, not in a script.
- The config file is mode-600.
- The token is never printed in logs or output.
- If you use the env-manager layer, bind the Telegram config there and treat it as authoritative.
- Sensitive message content is caller-owned — sanitize before sending if the payload contains secrets.

## Approval gates and safety

- The `approve` mode uses an inline keyboard callback, not a chat reply — the task pauses on the callback event.
- A timeout is configurable; the default is stated in the mode.
- On reject, the task aborts with a clear note to the operator.
- No silent default proceed — if no callback arrives before the timeout, the operator is told.

## Hooks and failure mode

- Hook scripts are executable bash.
- Each hook is registered to the requested Claude Code hook event.
- Hook failures are logged but do not block Claude Code — Telegram down means the message may be lost, but the session continues.
- Do not dump full stack traces into Telegram unless the operator specifically asked; a short error summary is the default.

## Event routing

- Events are acked before dispatch so they are not re-routed or silently lost on retry.
- Target routing reads the config (event type → chat/bot/target).
- Channel down → a note is queued and the operator is informed; messages are not silently dropped.
- Sensitive payload fields are scrubbed before sending.

## Recovery

Keep the recovery docs current. Device churn, token loss, and chat ID changes are the three things that happen. The `setup` mode writes them; if your setup changes, update the docs.

## Related skills

- `automation` — owns the CI/CD and release pipelines that produce the events; Telegram is the notification leg.
- `coupling-router` — when multi-skill orchestration routes the same event stream.
- `sentry` — error observability alongside Telegram alerts.
- `user-onboarding` — user-facing onboarding messages that go out via Telegram.
