# ecommerce — E-commerce: catalog, cart, checkout, payments — failure states included.

## Intake

- Platform (existing commerce stack or headless choice)
- Catalog scale and variants model
- Payment providers and regions
- Tax/shipping rules complexity

## Deliverable

Working commerce functionality: catalog/catalog filtering, cart, checkout with payment integration, order lifecycle states, transactional emails, and the admin/refund path spec.

## Procedure

1. Model the catalog: products, variants, inventory, pricing (incl. sales) — constraints at DB level.
2. Cart: guest → authenticated merge, expiry policy, quantity/stock validation.
3. Checkout: single-purpose flow, minimal fields, address validation, explicit shipping/tax calc.
4. Payments: provider SDK per docs (reference URLs first), idempotent payment intents, decline/failure states handled.
5. Orders: lifecycle states (pending → paid → fulfilled → refunded), webhooks verified (signature checks).
6. Post-purchase: confirmation with real numbers, refund policy page, email receipts.
7. Test the money path end-to-end in sandbox; verify webhook handling with retries.

## Quality gate

- [ ] Stock/inventory races handled (constraints or locking).
- [ ] Payment idempotency (no double charges on retry).
- [ ] Webhooks signature-verified.
- [ ] Decline/failure UX exists, not just success path.
- [ ] Sandbox end-to-end money path green.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
