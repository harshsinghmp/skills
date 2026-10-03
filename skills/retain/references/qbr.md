# qbr — Quarterly business review from transcript: prove it strategically.

## Scope

- The quarterly review run from a call transcript, not from memory.
- Feed: fathom transcript (speaker attribution + summary) is the input; no transcript means reschedule, not improvise.
- Decisions are the output — a QBR with no logged decisions didn't happen.

## Deliverable

A QBR pack: transcript-grounded review of the quarter (shipped, outcomes, misses), agreed next-quarter priorities, and every decision logged to `ops` / `evidence-ledger`.

## Procedure

1. Require the transcript: fathom recording with speaker attribution + summary. None → reschedule.
2. Extract the quarter: shipped items, outcome evidence, misses and their causes — all grounded in transcript quotes.
3. Draft priorities for next quarter from what the client actually said, not what you wish they'd said.
4. Run the review to decisions: each priority gets owner + date or it stays a wish.
5. Log every decision to `ops` / `evidence-ledger` and close at the delight peak with a review-ask if earned.

## Quality gate

- [ ] Transcript exists and is cited (quotes, not vibes).
- [ ] Misses named with causes, not buried.
- [ ] Every next-quarter priority has owner + date.
- [ ] Decisions logged to `ops` / `evidence-ledger`.

## Routing

- Transcript capture → fathom pipe; decisions → `ops` + `evidence-ledger`.
- QBR close at delight peak → review-ask mode.
- Churn risk surfaced in QBR → churn-watch mode.

## Sources

- lane-k-agency-stages.md §2 row 9 (retain CREATE feeds: fathom-api QBR transcripts) and §3 ops stack (meeting-memory row: every QBR transcribed, decisions → evidence-ledger).
- lane-m1-agency-track.md finding 11 (fathom-api transcript as the pipe buyer ops intake wants).

When a cited source conflicts with a default above, the source wins — record the override and why.
