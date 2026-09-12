# Review Checklist & Quality Gate

The review/quality bar for animation code. Flag by default — approval is earned. Load before reviewing a diff, auditing existing motion, or deciding "should this animate?"

## When to load

Reviewing a motion PR, auditing existing animations, or gating whether a candidate *should* animate.

## Review checklist

| # | Check | Pass / flag |
|---|---|---|
| 1 | Purpose | Answers *why* it animates (spatial consistency, state, feedback, explanation, preventing jarring change). "Looks cool" on a frequent element = block. |
| 2 | Frequency | 100+/day (keyboard, palette) → no animation. Tens/day → remove/reduce. Occasional → standard. Rare → delight allowed. |
| 3 | Easing | Enter = `ease-out`; exit = `ease-in` (accelerates away); on-screen move = `ease-in-out`; hover = `ease`; constant = `linear`. `ease-in` on an *entrance* = block (delays the moment the user watches). Built-in easings too weak — use custom curves. |
| 4 | Duration | UI < 300ms. Press 100–160ms, tooltip/popover 125–200ms, dropdown 150–250ms, modal/drawer 200–500ms. |
| 5 | Physicality | Never `scale(0)` → `scale(0.9–0.97)` + `opacity: 0`. Popovers scale from trigger (`transform-origin: var(--transform-origin)`), not center (modals exempt). |
| 6 | Interruptibility | Rapid/gesture motion uses transitions or springs (retarget from current state), not keyframes (restart from zero). |
| 7 | Performance | `transform` + `opacity` only. No `width`/`height`/`margin`/`padding`/`top`/`left`, no `transition: all`, no `x`/`y`/`scale` shorthands under load, no CSS-var-on-parent driving child transforms. |
| 8 | Reduced motion | `prefers-reduced-motion` honored (gentler not zero — keep opacity/color, drop movement). Hover gated by `@media (hover: hover) and (pointer: fine)`. |
| 9 | Asymmetry | Deliberate phase (press/hold/confirm) slow; system response snaps. Symmetric press-and-release = flag. |
| 10 | Stagger | Group entrances stagger 30–80ms. Decorative only — never block interaction. |
| 11 | Cohesion | Motion matches component + product personality. Playful can bounce; dashboard stays crisp. |
| 12 | Remove-unnecessary | When unsure, prefer deleting the animation. |

## Aggressive escalation triggers

Flag hard on sight: `transition: all`; `scale(0)` or pure-fade with no initial transform; `ease-in` on an entrance; animation on keyboard/palette/100+/day action; >300ms UI with no reason; `transform-origin: center` on trigger-anchored popover; keyframes on toasts/toggles; animated layout properties; `x`/`y`/`scale` on busy pages; CSS-var→child-transform recalc storm; missing reduced-motion on movement; ungated `:hover`; symmetric press-release; everything-at-once entrance.

## Qualitative standards

| Standard | Rule |
|---|---|
| Meaningful | Motion earns its place: feedback, spatial story, state, or preventing jarring change. Frequency-gated; never on keyboard actions. |
| Fast | Sub-300ms UI. 180ms dropdown feels faster than 400ms. Instant tooltips after the first. |
| Subtle | Small transforms (`scale(0.95–0.98)` press, `translateY(8px)` stagger), bounce 0.1–0.3, blur < 20px. |
| Consistent | Shared easing/duration tokens; one vocabulary. No five near-identical hand-typed curves. |
| Spring-feel | `{ type: "spring", duration: 0.5, bounce: 0.2 }` for gestures/drag momentum/alive elements. Interruptible, carries velocity. |

```css
/* canonical tokens */
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* enter/exit */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen move */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS-like drawer */
```

## Finding opportunities (state-change sweep)

Hunt these seams; gate each through frequency → purpose → speed → function:

| Seam | Candidate | Recipe |
|---|---|---|
| Feedback gap | Pressable with no `:active` | `:active { transform: scale(0.97) }`, `transition: transform 160ms ease-out` |
| Teleporting state | Conditional render / swap / accordion snap | fade + `scale(0.95–0.97)` + `opacity:0`, `ease-out`, `@starting-style` for entry |
| List additions/deletions | `.map()` enter/exit with no bridge (not high-freq) | CSS transitions (not keyframes) so rapid triggers retarget |
| Missing spatial story | Popover/menu with no trigger link | scale + `transform-origin: var(--transform-origin)` |
| Dismissable surfaces | Toast/sheet exits differently than it entered | symmetric entry/exit path, `translateY(100%)` percentages |
| Group entrance | Grid pops in all at once (occasional view) | 30–80ms stagger |
| Gesture seam | Drag snaps with no physics | spring, velocity dismissal (`Math.abs(distance)/elapsedMs > ~0.11`), boundary rubber-banding |
| Delight budget | Rare first-run/success/celebration rendered flat | bounce / longer beat / generous stagger, *only* at rare tier |

## Improve/AUDIT loop

1. **Recon** — stack, motion libs, where motion lives (tokens/Tailwind/keyframes/`animate=`/gestures), conventions, personality, frequency map.
2. **Audit** — 8 categories: purpose+frequency, easing+duration, physicality+origin, interruptibility, performance, accessibility, cohesion+tokens, missed opportunities.
3. **Vet** — re-read every finding at `file:line`; reject by-design, mis-attributed, duplicated, exempt (modal centered-origin is correct). Never present an unconfirmed finding.
4. **Prioritize** — table ordered by leverage (impact ÷ effort). Severity: HIGH = feel-breaking; MEDIUM = noticeably off; LOW = polish. List 2–4 missed opportunities separately (additive, not corrective).
5. **Plan** — one self-contained plan per selected finding: exact paths, verbatim current code, exact target values, executor steps, boundaries, feel-check verification.
6. **Remedial hierarchy** — prefer earlier: delete → reduce → fix easing → fix origin → make interruptible → move to GPU → asymmetric timing → polish → a11y/cohesion.

## AI-slop anti-patterns

The default-to-boring signals to kill:

- **Uniform 300ms ease** on everything — no easing decision, one flat duration, built-in `ease` everywhere. Fix: per-element curve + duration from the tables.
- **Everything bounces** — springs with `bounce: 0.6+` or overshoot on dropdowns, buttons, modals. Fix: bounce 0.1–0.3, reserve visible bounce for drag-to-dismiss / delight tier.
- **Overshoot everywhere** — scale past 1.0 then settle (`scale(1.05)`→`1`) on mundane UI. Fix: settle directly; no rubber-band on non-gesture motion.
- **No exits** — enter animated, exit instant (or keyframe restart that teleports). Fix: symmetric `@starting-style`/transition exit path; transitions not keyframes.
- **Everything-at-once** — group entrances and exits in a single beat with no stagger. Fix: 30–80ms stagger.
- **Decorative motion on functional UI** — mouse-tracking, parallax, or animated charts on data the user reads. Fix: delete; decoration only on marketing/rare surfaces.

## Output format

Table of findings (`Before | After | Why`), then verdict tiers (feel-breaking → simplifications → performance → interruptibility/timing → origin/cohesion → a11y), then explicit **Block** / **Approve** with `file:line` citations. When feel can't be judged from code, put a slow-motion / frame-by-frame / real-device feel-check in the plan instead of guessing.

## Gotchas

- `ease-in` *feels* slower than `ease-out` at the same 200ms — the user watches the fast phase.
- Framer Motion `x`/`y`/`scale` run on the main thread (rAF) and drop frames under load — use `animate={{ transform: "translateX(100px)" }}`.
- Keyframes restart from zero on retrigger; transitions/springs retarget from current state.
- `scale()` scales children (font/icons) — a feature for press feedback, a bug if unintended.
- Reduced motion = fewer/gentler, *not* zero — keep opacity/color, drop movement.
- Heavy `filter: blur()` (> 20px) during a transition is expensive, especially Safari.
- Touch devices fire false `:hover` on tap — always gate hover motion.