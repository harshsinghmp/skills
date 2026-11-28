# Example — dropdown + toast micro-interaction

**Request:** "Add a dropdown to the account menu and animate it nicely."

## Step 1 — Should it animate?

Dropdowns are opened *occasionally* (not 100×/day) → **standard animation**. Purpose: **spatial consistency** (it should grow out of the trigger) + **state indication**.

## Step 2 — Tool

Two-state toggle triggered by a class/attribute → **CSS transition** (cheapest that fits). No React state → `@starting-style` for entry.

## Step 3 — Properties

`transform` + `opacity` only. Scale from the trigger's origin (`--transform-origin`), never `scale(0)`.

## Step 4 — Code

```css
.dropdown {
  transform-origin: var(--transform-origin); /* supply via JS: the trigger's position */
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
}
.dropdown[data-starting-style],
.dropdown[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

## Step 5 — Reduced motion + pointer gating (ships with it)

```css
@media (prefers-reduced-motion: reduce) {
  .dropdown { transition-duration: 0.01ms; }  /* keep the state change, drop the motion */
}
```

## Step 6 — Reasoning (the ≤3-line report)

- **Gate:** occasional · spatial consistency / state indication
- **Ingredients:** CSS transition · `transform` + `opacity` · `cubic-bezier(0.23,1,0.32,1)` · 200ms
- **Feel-check:** play at 2–5× duration; confirm it reads as growing from the menu button, not the center.

---

## Same request in Motion (React)

If the dropdown has an exit animation or needs a spring, escalate to Motion:

```jsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {open && (
    <motion.div
      key="dropdown"
      initial={{ opacity: 0, transform: "scale(0.95)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      exit={{ opacity: 0, transform: "scale(0.95)" }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: "var(--transform-origin)" }}
    />
  )}
</AnimatePresence>
```

## When to reach for GSAP instead

Only if the dropdown is part of a **multi-step timeline** or **scroll-pinned sequence** the user asked to choreograph — otherwise Motion/CSS is the cheaper, correct tool.