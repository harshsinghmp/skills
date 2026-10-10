---
name: telegram
aliases: ["tg", "telegram-bot", "telegram-skill", "telegram-notify"]
description: "Telegram messaging department: pure-bash bot alerts and approval boards via curl + jq, zero pip installs, config-file multi-bot/multi-target routing with mode-600 protection, Kafka-event routing for alert → ack → dispatch, and Claude Code hook integration for session start/end/tool-use/error notices. Use when asked to notify a Telegram chat, build a notification bot, dimension approval buttons for a long-running task, integrate Claude Code hooks, route events to Telegram, or stand up a bot with a config-file token. Not for Instagram/social content posting (social-media), Notion sync (content-creator), or Google passkey OAuth (use telegram bot token only)."
argument-hint: "[notify|approve|hook|route|setup]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 41
  aliases: ["tg", "telegram-bot", "telegram-skill", "telegram-notify"]
  suggested_skills: ["automation", "coupling-router", "email-notification", "user-onboarding", "sentry"]
  hermes:
    tags: ["telegram", "bot", "notification", "alert", "approval", "curl", "jq", "config-file", "mode-600", "multi-bot", "kafka-event", "claude-code-hook", "bash"]
    related_skills: ["automation", "coupling-router", "sentry"]
    suggested_skills: ["automation", "coupling-router", "sentry"]
    requires_tools: ["bash", "write_file", "read_file", "replace_file_content"]
    requires_plugins: []
    requires_toolsets: []
  openclaw:
    category: agency-delivery
    suggested_skills: ["automation", "coupling-router", "sentry"]
    primary_triggers: ["telegram alert", "notify telegram", "telegram bot", "approval button", "confirm deploy", "telegram config", "bot token", "claude code hooks telegram"]
    requires_tools: ["bash", "write_file", "read_file", "replace_file_content"]
    requires_plugins: []
    requires_toolsets: []
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📱 telegram — Telegram Messaging Department

Zero-pip Telegram department: pure-bash alerts, approval buttons, hooks, and event routing with config-file token management. Defaults are stated inline, assumptions recorded in the deliverable, zero questions asked.

Default stack: Telegram Bot API via curl + jq, no SDK, no pip. Defaults: config-file token routing with mode-600 on the config file; Kafka event routing shaped as alert → ack → dispatch; Claude Code hooks for session and tool-event notices; recovery docs for device churn.

---

## Modes — quick commands

Every invocation resolves to exactly one mode:

|| Mode | Trigger phrases | Behavior | Reference |
||:---|:---|:---|:---|
|| **notify** | "send a telegram message", "notify the chat", "push a message", "alert the team" | Send a message to a configured chat: text, optional formatting, optional target routing via config | [references/notify.md](references/notify.md) |
|| **approve** | "approve/deploy button", "confirm before continuing", "long-running task with approval", "resume after approval" | Long-running task pause: send a message with approve/reject buttons, wait for the user callback, resume or abort | [references/approve.md](references/approve.md) |
|| **hook** | "claude code hooks", "session start/end", "tool use notification", "hook telegram" | Claude Code hook integration: register hook scripts that call Telegram on session start, end, tool use, or errors | [references/hook.md](references/hook.md) |
|| **route** | "route events to telegram", "kafka events to telegram", "alert routing", "event stream" | Kafka event routing: shape structured events into Telegram messages, ack the event, dispatch to the right chat/bot/target per config | [references/route.md](references/route.md) |
|| **setup** | "create a telegram bot", "bot token", "telegram setup", "configure telegram" | Stand up a Telegram bot token config: config file layout, mode-600, env binding, recovery docs | [references/setup.md](references/setup.md) |

Only the resolved mode's reference is loaded.

## Verification

Run before reporting completion:
- [ ] Config file exists at expected path with mode-600 (`chmod 600`)
- [ ] `bot_token` and `chat_id` present in config (required fields)
- [ ] `curl` and `jq` available on PATH
- [ ] Test message sends successfully (`curl -s -X POST` returns `ok:true`)
- [ ] Hook scripts (if registered) are executable bash
- [ ] Fail-closed behavior confirmed: Telegram down → log + continue, never block

For live notification testing: `test-notification` sends a verify message to the configured chat.

Full audit-mode spec: `skills/references/audit-mode-guidance.md`.

---

## When to Use

- Sending alerts, build results, or release notifications to a Telegram chat.
- Pausing a long-running task (deploy, bulk operation) and waiting for user approval via Telegram buttons.
- Integrating Claude Code hooks so Telegram gets session and tool-use notices.
- Routing structured events (Kafka or any event stream) to Telegram with ack and dispatch.
- Creating or managing a Telegram bot token with config-file protection.

### Anti-Triggers

- Instagram/social content posting → `social-media`.
- Notion sync or content creation → `content-creator`.
- Google passkey OAuth flows → not in scope; Telegram uses a bot token, no OAuth here.
- Slack, Discord, email delivery → route to the matching channel skill.

---

## Quick Reference

### Routing ladder

|| Request shape | Mode |
||:---|:---|
|| 'Send this text to chat X' | notify |
|| 'Pause and ask me before continuing' | approve |
|| 'Mirror Claude Code sessions/tools to Telegram' | hook |
|| 'Route these events to the right chat' | route |
|| 'Set up a new bot' | setup |

### Setup order

setup → notify → route → approve → hook. Token config first, messages after; approval and hooks are the advanced shapes.

### Verification gate (every mode)

- [ ] Config resolved: bot token, chat ID, and target routing all present and permission-checked.
- [ ] Config file is mode-600; token not printed in logs or output.
- [ ] curl exits cleanly or fails with a clear error; jq parses the response.
- [ ] Chat ID matches the intended recipient (single chat or routed target).
- [ ] approve mode: message includes approve/reject keyboard; callback captured; task paused until callback.
- [ ] hook mode: hook scripts are executable, registered per Claude Code hook event, and fail-closed (Telegram down → hook logs, does not block Claude Code).
- [ ] route mode: event acked before dispatch; target routing reads config; channel down → queue note, not silent drop.

### Suite contracts

- CI/CD deploy and test notifications → `automation` for the pipeline; this skill carries the Telegram leg.
- Multi-skill orchestration that routes events → `coupling-router`.
- Error alerting alongside Telegram → `sentry` for the observability side.
- User-facing onboarding messages via Telegram → `user-onboarding`.

---

## Pitfalls

- Hardcoding the bot token in a script — config file + mode-600 is the rule.
- Forgetting the approve keyboard is a callback, not a chat reply — the task must pause on the callback event.
- Assuming Telegram is always reachable in a hook — hook must fail-closed: log and continue, never block Claude Code.
- Routing every event to every chat — route config must map event type to target.
- Forgetting recovery docs — device churn, token loss, and chat ID changes need recovery steps the operator can follow.
- Broadcasting sensitive payloads via Telegram — sanitize the payload before sending; token stays in config, message content is caller-owned.

---

## Procedure

1. **Intake.** Resolve the target: which mode, which chat/bot/target, what text/event to send, and any approval or hook behavior.
2. **Resolve the mode.** Match the request to exactly one mode from the table; ambiguous → default to notify, state the assumption, proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass the verification checklist, then deliver the message (or approve callback, or hook registration, or routing result) with evidence.

---

## Verification

- [ ] Exactly one mode resolved and its reference followed end to end.
- [ ] Config present and permission-checked; mode-600 enforced.
- [ ] Token absent from output and logs; curl+jq path exercised for the actual send.
- [ ] approve mode: approve/reject keyboard, callback handling, pause behavior verified.
- [ ] hook mode: hooks registered per event, fail-closed behavior confirmed.
- [ ] route mode: event acked, target routing from config, channel-down note documented.
- [ ] CI/automation/observability cross-skills routed to `automation`, `coupling-router`, `sentry`, `user-onboarding` as appropriate.
- [ ] Sensitive payloads sanitized; token stays in config.
