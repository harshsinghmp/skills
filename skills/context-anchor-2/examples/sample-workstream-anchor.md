# Example: Named Workstream Anchor (parked client lane)

Scenario: mid-session, the user says *"park this workstream — switch to the
billing migration."* The agent writes the anchor, then switches.

---

## 1. The parked anchor (`.agents/anchors/client-acme-redesign.md`)

```markdown
# Context Anchor — 2026-09-08T15:40:00Z
workstream: client-acme-redesign | branch: feat/acme-hero-variants
Client: PROJECT-NORTHSTAR (codename — NDA)

## What's True Right Now
- Hero variant B approved by client on the last call; variants table shipped.
- Decision: gradients resolve from `.agents/brand/tokens/` OKLCH scale, never raw hex.
- Ruled out: CSS-only parallax — janks on mid-tier Android (measured 38fps).

## The Working Reference
> Hero variant C is half-wired: tokens land but the responsive breakpoint is
> unstyled. resume by: `src/sections/hero.tsx:88` breakpoint classes.

## Next Action
- [ ] `src/sections/hero.tsx:88` — apply `md:` breakpoint classes from the
      fluid spacing scale, then re-run the visual regression lane.
```

## 2. The switch (`client-acme-redesign` → `internal-billing-migration`)

1. Anchor the current focus (never lose it) — even a 5-line anchor.
2. Read `.agents/anchors/internal-billing-migration.md`.
3. Emit the ≤3-line re-entry block:

```text
⚓ resuming internal-billing-migration (branch: chore/billing-v2)
   State: Stripe webhooks verified; local replay queue untested.
   ▶ Next: wire the replay queue in src/billing/replay.ts:41.
```

4. Proceed. Refresh the new anchor at the next focus shift.

## 3. Listing (`list anchors`)

```text
⚓ anchors:
   client-acme-redesign        15:40  hero variant C breakpoint unstyled
   internal-billing-migration  14:02  replay queue untested
   main                        11:15  changelog entry pending for v2.7.0
```

---

## What makes this load-bearing

- `resume by:` makes re-entry atomic — no reconstruction from scrollback.
- The freshness gate catches the branch that got switched underneath the anchor.
- The codename keeps the NDA scope clean if the repo is shared with contractors.
