# Accessibility — Motion Safety

Reduced motion is a medical preference, not a nicety. Vestibular-triggering motion can physically harm users (WCAG 2.1 SC 2.2.2, 2.3.1).

## When to load

Any animation — reduced-motion fallback ships with it, never as a follow-up.

## 1. `prefers-reduced-motion` across stacks

**CSS**
```css
@media (prefers-reduced-motion: reduce) {
  .el { animation: fade 0.2s ease; }   /* keep opacity/color, drop transform motion */
}
```

**WAAPI / JS**
```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
el.animate(reduce ? [{opacity:0},{opacity:1}] : [{opacity:0, transform:"translateY(100%)"},{opacity:1, transform:"translateY(0)"}],
  { duration: reduce ? 200 : 400, fill: "forwards" });
```

**Motion (React)**
```jsx
import { useReducedMotion, MotionConfig } from "motion/react";
const reduce = useReducedMotion();
const closedX = reduce ? 0 : "-100%";
// or global:
<MotionConfig reducedMotion="user">   // "user" auto-strips transform motion for reduced-motion users
```

## 2. Vestibular / seizure thresholds

- **Flashing**: no more than **3 flashes per second** (WCAG 2.3.1). Never animate rapid blink/flash pairs.
- **Large movement**: full-screen parallax, background translation, or zoom that fills the viewport is a top trigger — keep it small or offer a static alternative.
- **Auto-playing motion**: anything moving >5s must be pausable/stoppable/hideable (WCAG 2.2.2 Pause, Stop, Hide).
- **Rotating/spinning** elements: avoid sustained rotation; if required, keep slow (< ~2s/rev) and respect reduced motion.

## 3. Duration & scale limits

- Essential UI motion ≤ 400ms; micro-interactions 80–300ms.
- Avoid full-screen movement; keep transforms to small deltas (`translateY(8px)`, `scale(0.95–1.05)`).
- Bounce/overshoot minimal in functional UI (0.1–0.3); never on data the user reads.

## 4. Reduced-motion fallback (all three stacks)

Reduced motion = **fewer and gentler** animations, not zero:
- Keep opacity + color fades (they aid comprehension and are generally safe).
- Drop transform/position/rotation/parallax/scrolling motion.
- Replace scroll-reveal with instant-visible (no `translateY` delay).
- Disable auto-playing loops, marquees, and infinite animations.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 5. `prefers-contrast` / `forced-colors`

- High-contrast (`forced-colors: active`) users lose subtle opacity-only states — pair opacity fades with a non-color cue (border, position) or a `prefers-contrast: more` bump.
- Don't rely on color-only transitions to convey state.

## 6. Reduced-motion triage (3-way)

Not all motion is equal under `prefers-reduced-motion`. Classify first:

| Kind | Examples | Reduced-motion treatment |
|------|----------|--------------------------|
| **Decorative** | bounce, float, parallax, confetti, marquee | **Remove outright** — no fade substitute needed |
| **Functional** | scroll-reveal, slide-in panel, hover lift | **Reduce to a simple fade** — opacity 0→1, ≤200ms, no transform |
| **Informational** | spinner, progress bar, skeleton shimmer | **Keep, but simplify** — drop bounce, shrink travel distance, keep the cue visible |

Informational motion communicates state (loading, progress), so deleting it hides meaning. Strip the flourish, keep the signal:

```css
@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }                 /* static ring or dot */
  .progress-bar { animation: none; }            /* still fills — width driven by JS, not keyframes */
  .skeleton { animation: none; opacity: .6; }   /* pulse → steady shimmer */
}
```

## 7. Focus & announcements around animated content

- Move focus into a dialog/panel **before** its entrance animation ends, and move it back out **before** the exit animation completes — focus target can't disappear mid-animation or keyboard users land on a dead element.
- Content that appears **mid-animation** (or streams in) goes in a live region: `aria-live="polite"` for additions, `aria-live="assertive"` for urgent state, `aria-busy="true"` on the loading container. Wrap skeletons/placeholders in `aria-hidden="true"` so AT doesn't announce blank divs.
- Never move focus into a skeleton or placeholder; keep focus stable until real content replaces it.

## 8. Resilience — fail in the visible state

- Author the **default (un-animated) state** to be content-visible. If JS fails, is blocked, or `prefers-reduced-motion` strips transforms, hidden-by-default (`opacity:0` + `translateY`) leaves nothing on screen — animate *from* visible with CSS in a `@media (prefers-reduced-motion: no-preference)` block or JS that only hides after it confirms it can reveal.
- Stop every non-essential loop when offscreen (`IntersectionObserver`) or hidden (`document.visibilityState === "hidden"` / `visibilitychange`) — infinite marquees, shimmers, and rotating spinners burn CPU for no one.
- **Cap total stagger delay.** A 40-item list at `i * 100ms` = 4s of cumulative wait; reduced-motion users and View Transition `skipTransition()` paths must not sit through it. Sum per-item delays and clamp (e.g. `Math.min(i * 100, 600)`), or collapse stagger to 0 when reduced motion is on.

## Gotchas

- Reduced motion ≠ no motion — opacity/color are fine; movement and position change are the triggers.
- Gate `:hover` motion with `@media (hover: hover) and (pointer: fine)` — touch fires false hovers.
- Test with the OS "reduce motion" setting toggled, not just the media query.
- 3-per-second flash rule is absolute for content — not just decorative.
- Mouse-tracking/parallax on functional UI (graphs, tables) is both an a11y and a purpose failure.
- Hiding content with `opacity: 0` inline (before JS reveals it) is the #1 "broken script = blank page" bug — keep the no-JS state visible.
- `aria-live` regions announce only on *content change*; pre-populate them empty, don't swap in an already-filled node.