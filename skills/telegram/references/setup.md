# setup — Stand up a Telegram bot token config with mode-600 protection.

Default stack: config-file token layout, mode-600 file permissions, env binding where the env-manager layer exists, recovery docs for device churn, token loss, and chat ID changes. Defaults: bot token lives in a config file (not in a script); config file is mode-600; token never printed in logs or output; recovery docs written and kept current.

## Intake

- The bot token (from @BotFather or the operator).
- The target chat ID (from the bot's getUpdates or the operator).
- Optional: named bot targets (multiple bots/chats in the same config).

## Deliverable

Config file created with the bot token, chat ID, and optional named targets; file permissions set to mode-600; recovery notes written; token confirmed present but never printed in output.

## Procedure

1. Create the config file with the token, chat ID, and optional named targets.
   - Layout: a small JSON or env-style config holding `token`, `chat_id`, and optional `targets[]` for named routing.
   - Mode-600 on the config file so only the owner can read it.
2. Bind to the env-manager layer when present, so the config is discoverable by other skills without hardcoding.
   - When the env-manager layer is the authoritative layer, add the Telegram config there and link the file-based config to it.
   - When no env-manager layer is present, the file config is the source of truth.
3. Write recovery docs:
   - Device churn: how to recover if the phone/device changes (re-register the bot, re-confirm chat ID).
   - Token loss: how to revoke and re-create a token at @BotFather.
   - Chat ID changes: how to re-confirm the chat ID (getUpdates or the operator's manual note).
4. Confirm the setup by sending a test message (notify mode) and reading the confirmation, without printing the token.

## Quality gate

- [ ] Config file created with token + chat ID + optional targets.
- [ ] Mode-600 enforced on the config file.
- [ ] Env binding added when the env-manager layer is present.
- [ ] Recovery docs written and kept current.
- [ ] Token confirmed present but never printed in output or logs.
- [ ] Test message sent to confirm the setup works.

## Routing

- Setup as part of a broader automation onboarding → `automation`.
- Multi-skill orchestration that uses the Telegram target → `coupling-router`.
- User onboarding that includes Telegram notification → `user-onboarding`.

## Sources

- Telegram Bot API: create a bot at @BotFather, getUpdates for chat ID.
- When a cited source conflicts with a default above, the source wins — record the override and why.
