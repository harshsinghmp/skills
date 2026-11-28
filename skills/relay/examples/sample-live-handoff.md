# Example: Live Handoff File (`.agents/artifacts/HANDOFF.md`)

The overwritten-every-time state pointer written by `handoff` Mode C.
This is exactly what a brand-new conversation reads (ladder rung 1) to
continue the work at lowest token cost.

---

```markdown
# HANDOFF — 2026-09-08T14:12:00Z
branch: feat/webhook-idempotency | phase: handler done, idempotency store half-wired

## Next Step
Wire `getIdempotencyRecord()` into the Stripe route handler at
`src/app/api/webhooks/stripe/route.ts:58` (guard before `constructEvent`).

## In-Flight
- Upstash-based idempotency store compiles; no integration test yet

## Ruled Out
- DB unique-constraint dedupe: fails under retry storms before the txn opens

## Decisions
- Idempotency keys stored 24h TTL, hash of event id + signature timestamp

## Verify
`bun test tests/api/stripe-webhook.test.ts`

## Open Questions
- Should replayed events return 200 with the original body or 202?
```

---

## What the next agent does with it

1. Entry probe finds the file → emit the ≤5-line resumption block:
   ```text
   Resuming feat/webhook-idempotency — handler done, idempotency store half-wired.
   ❓ Open: replayed events → 200 with original body or 202?
   👉 Next: wire getIdempotencyRecord() into route.ts:58 before constructEvent.
   ```
2. Answer the open question if the user addresses it — never guess.
3. Otherwise proceed with the Next Step; refresh the file at the next checkpoint.
