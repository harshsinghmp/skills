# approve — Pause a long-running task and wait for Telegram button approval.

Default stack: Telegram Bot API via curl + jq, inline keyboard with approve/reject buttons, callback query handling. Defaults: the task pauses and waits for the user callback (not a chat reply); timeout configurable; reject aborts with a clear message.

## Intake

- The task description (what is about to run).
- The approval question (what the user is approving).
- Timeout (default stated; configurable when needed).

## Deliverable

Approval message with approve/reject keyboard sent to the configured chat; task paused until the callback arrives; on approve, the task resumes; on reject, the task aborts with the user's message.

## Procedure

1. Send the approval message:
   - `sendMessage` with `reply_markup` containing an inline keyboard with two buttons: Approve and Reject (callback_data values e.g. `approve` / `reject`).
   - Include the task description and the question text in the message body.
2. Pause the task: do not proceed until the callback query arrives.
   - Poll or webhook for the callback; when the callback data is `approve`, resume.
   - When the callback data is `reject`, abort with the rejection message and a clear note to the operator.
3. Handle timeout (configurable): if no callback arrives before the timeout, surface a timeout note and the pending decision; do not silently proceed.

## Quality gate

- [ ] Approval message includes an inline keyboard with approve/reject buttons.
- [ ] Task does not proceed until the callback arrives (not a chat reply).
- [ ] Approve resumes; reject aborts with a clear note.
- [ ] Timeout handled: no silent default proceed; timeout surfaced to the operator.

## Routing

- The underlying task is a deploy or CI step → `automation` owns the pipeline; this skill is the approval gate.
- Multi-skill orchestration of the same workflow → `coupling-router`.
- Production safety review of the approval target → route human review before approve.

## Sources

- Telegram Bot API: sendMessage (inline keyboard), answerCallbackQuery.
- When a cited source conflicts with a default above, the source wins — record the override and why.
