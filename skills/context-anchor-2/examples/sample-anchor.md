# Example: Context Anchor Record

Below is a representative `.agents/anchor.md` (default focus anchor) generated
by `context-anchor` v1.1.0. For parked client workstreams, see
[sample-workstream-anchor.md](sample-workstream-anchor.md).

---

```markdown
# Context Anchor — 2026-08-22T16:35:00Z
workstream: main | branch: feat/checkout-app-router
Client: internal

## What's true right now
- Next.js 16 App Router migration for checkout flow is 80% complete; payment intent creation and cart validation routes are verified.
- Chose Server Actions over API route endpoints for checkout submission to simplify form validation and progressive enhancement.
- Ruled out client-side Stripe Elements mounting without `Elements` provider wrapper because React 19 concurrent hydration caused double-mount bugs.

## The working reference
> Finalize Stripe PaymentElement webhook confirmation in `src/app/checkout/actions.ts` and verify with Playwright E2E probe. resume by: wire `confirmPayment` redirect first.

## Next action
- [ ] Connect `confirmPayment` server action in `src/app/checkout/actions.ts:88` to redirect to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`.
```

---

## Re-entry (what the next agent emits, ≤3 lines)

```text
⚓ resuming main (branch: feat/checkout-app-router)
   State: App Router checkout ~80%; Server Actions chosen; Stripe Elements double-mount ruled out.
   ▶ Next: confirmPayment redirect in src/app/checkout/actions.ts:88.
```
