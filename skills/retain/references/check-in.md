# check-in — Scheduled post-delivery follow-up: prove it landed.

## Scope

- The delivery+7d check-in and the monthly heartbeat after it.
- One client, one delivery, one thread — never bulk-blast check-ins.
- Feeds: whatsapp-business + gmail carry the message; the content is always delivery-specific.

## Deliverable

A short check-in message referencing the delivered work by name, one concrete question about how it performs, and a logged reply-or-silence outcome with the next touch date.

## Procedure

1. Anchor on the delivery: date, what shipped, who received it — no anchor, no send.
2. Send the delivery+7d check-in: name the deliverable, ask one concrete performance question (not "just checking in").
3. Log the outcome: replied (capture sentiment + any issue) or silent (start the silence clock for churn-watch).
4. Set the next touch: monthly heartbeat if healthy, faster follow-up if an issue surfaced.
5. Hand open issues to the owning skill (`ops` for fixes, `growth` if value is questioned) — the check-in reports, it doesn't resolve.

## Quality gate

- [ ] Deliverable named explicitly, never a generic ping.
- [ ] Exactly one concrete question asked.
- [ ] Outcome logged with a next-touch date.
- [ ] Silence starts the >14d clock; issues routed to owner.

## Routing

- Fix or scope issue surfaced → `ops`.
- Value questioned or usage dropping → churn-watch mode, then `growth` churn mode.
- Active-work status → `client-comms`.

## Sources

- lane-k-agency-stages.md §2 row 9 (retain CREATE: whatsapp-business + gmail check-in cadence) and §4.9 (cadence: delivery+7d check-in → monthly note → QBR → review-ask → referral offer).
- lane-k-agency-stages.md §3 ops stack (review-request row: ask corridor at delight peak — delivery +7d).

When a cited source conflicts with a default above, the source wins — record the override and why.
