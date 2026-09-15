# CSS Animations, Transitions & Modern Motion

The cheapest tool for quick fixes: hovers, presses, state toggles, and predetermined motion. Runs off the main thread — beats JS under load.

## When to load

Hover/press/color changes, `@starting-style` entry, keyframes, `@property`, scroll-driven animations, WAAPI, View Transitions, Tailwind animation config.

## 1. Transition vs keyframe

| Need | Use |
|---|---|
| Two-state toggle (hover, open/close, class toggle) | `transition` |
| Entry on mount with no JS state | `@starting-style` |
| Multi-step / looping / predetermined motion | `@keyframes` |
| Rapidly-triggered (toasts, toggles) | `transition` (interruptible) — NOT keyframes |

Keyframes restart from zero when retriggered; transitions retarget from current value.

## 2. `@keyframes` + `animation` shorthand

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.el { animation: fadeIn 300ms cubic-bezier(0.23,1,0.32,1) forwards; }
/* animation: name duration easing delay iteration-count direction fill-mode play-state */
```

## 3. `@property` — typed custom properties

Make non-interpolable values (gradients, colors) animatable:

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
.gradient-border {
  background: conic-gradient(from var(--angle), #f00, #00f);
  transition: --angle 1s linear;
}
.gradient-border:hover { --angle: 360deg; }
```

`syntax` REQUIRES `initial-value` — omit it and registration silently drops (property stays un-animatable). Register without the at-rule: `CSS.registerProperty({ name: "--angle", syntax: "<angle>", initialValue: "0deg", inherits: false });`

## 4. Easing

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* enter/exit — strong */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen move */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS drawer */
```

- `steps(4)` — stepped/discrete (countdown, sprite). `steps(4, jump-term)` — `jump-start`/`jump-end`/`jump-none`/`jump-both` pick where the step lands.
- `linear()` — arbitrary curve, incl. an n-point spring without `cubic-bezier`:
  `--spring: linear(0, 0.14 4%, 0.94 17%, 1.15 24% 30%, 1.02 43%, 0.98 51%, 1 77%, 1);` — overshoot >1 then settle (Generated Spring-style bounce).
- Built-in `ease`/`ease-out` are too weak for deliberate UI — use the strong tokens.

Animate `translate`/`rotate`/`scale` (not `transform`) to time each independently: `transition: translate 300ms, rotate 400ms, scale 200ms`. For keyframes, `animation-composition: replace|add|accumulate` controls how overlapping animations combine (default `replace`; `add`/`accumulate` stack effects into the base value).

## 5. Scroll-driven animations (modern)

```css
@keyframes grow { from { transform: scale(1); } to { transform: scale(1.2); } }
.hero { animation: grow linear; animation-timeline: scroll(); }       /* whole scroll */
.reveal { animation: fadeIn linear; animation-timeline: view(); }     /* enters viewport */
/* range: animation-range: entry 25% cover 50%; */
```

Ties progress to scroll position — no JS, no `IntersectionObserver`. Safeguard with `@supports (animation-timeline: view())` and reduced-motion.

- `animation-range` named phases: `entry` | `exit` | `entry-crossing` | `exit-crossing` | `cover` | `contain` (view timelines). Pair with `contain` to start when the element is fully in view, or `entry 0% contain 100%` for arbitrary brackets. Set `animation-fill-mode: both` (or `forwards`) so the effect holds before/after the range instead of snapping.
- Named timelines decouple declaration from use: `.scroller { scroll-timeline: --chapter block; }` (or `view-timeline: --card block`), then any descendant reads `animation-timeline: --chapter`. For a *distant* (non-ancestor) source, hoist the name onto a shared ancestor with `timeline-scope: --chapter`.
- WAAPI equivalents: `el.animate(keyframes, { timeline: new ViewTimeline({ subject: el }) })` and `new ScrollTimeline({ source: scroller, axis: "block" })` — no CSS registration needed.

## 6. View Transitions API

Morph between two DOM states or routes:

```js
document.startViewTransition(() => updateTheDOM());
```

```css
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 0.3s; }
```

Name elements to let them travel between states: `view-transition-name: card-thumb`. Names MUST be unique per snapshot — a repeated name throws. For lists use `view-transition-name: match-element` (auto-unique per element) plus `view-transition-class: card` so `::view-transition-group(*.card)` styles them as one. Respect `prefers-reduced-motion` (fall back to opacity-only or none).

Tag direction and style per-type:

```js
document.startViewTransition({ update: () => updateTheDOM(), types: ["slide-forward"] });
const t = document.startViewTransition(() => updateTheDOM());
if (matchMedia("(prefers-reduced-motion: reduce)").matches) t.skipTransition(); // jump to end
```

```css
html:active-view-transition-type(slide-forward) ::view-transition-old(root) { animation: slide-out-left 300ms; }
html:active-view-transition { pointer-events: none; } /* block clicks mid-transition */
```

Cross-document (MPA): `@view-transition { navigation: auto; }` on BOTH pages; `window.addEventListener("pageswap"|"pagereveal", e => e.viewTransition?.types.add("forward"))` adjusts types on source/destination. Anti-pattern: giving `view-transition-name` to a large container captures it as a snapshot copied every frame — name small leaf elements only.

### Cover/overlay page transition (awwwards curtain)

A full-screen overlay that scales up/down as a curtain between routes — no JS beyond flipping a `data-active` attribute:

```css
.overlay {
  position: fixed; inset: 0;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 500ms cubic-bezier(0.76, 0, 0.24, 1); /* power4.inOut */
  pointer-events: none;
}
.overlay[data-active] { transform: scaleY(1); }
```

Toggle `data-active` in/out of `startViewTransition` to curtain the old state over the new one. A shared-element card travels via `view-transition-name: card-thumb` on both states.

```css
@media (prefers-reduced-motion: reduce) {
  .overlay { transition: opacity 300ms ease; opacity: 0; }
  .overlay[data-active] { opacity: 1; transform: none; } /* short opacity fade instead of scale */
}
```

## 7. Web Animations API (WAAPI) — JS control, CSS performance

```js
const anim = el.animate(
  [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
  { duration: 600, fill: "forwards", easing: "cubic-bezier(0.77,0,0.175,1)" }
);
anim.finished.then(cleanup);
el.getAnimations().forEach(a => a.cancel());
```

Hardware-accelerated, interruptible, no library. Respect reduced motion via `matchMedia("(prefers-reduced-motion: reduce)")`.

## 8. Tailwind

```js
// tailwind.config — extend keyframes + animation
theme: {
  extend: {
    keyframes: { fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } } },
    animation: { "fade-in": "fadeIn 300ms cubic-bezier(0.23,1,0.32,1) forwards" },
  }
}
// usage: class="animate-fade-in" (arbitrary: animate-[fade-in_300ms_ease-out])
```

## 9. Patterns

```css
/* Press feedback */
.btn { transition: transform 160ms cubic-bezier(0.23,1,0.32,1); }
.btn:active { transform: scale(0.97); }

/* Popover from trigger (Base UI supplies --transform-origin) */
.popover { transform-origin: var(--transform-origin);
  transition: opacity 200ms, transform 200ms; }
.popover[data-starting-style], .popover[data-ending-style] { opacity: 0; transform: scale(0.95); }

/* Entry without JS */
.toast { opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); } }

/* Border beam — conic-gradient rotating angle via @property */
```

## 10. Discrete transitions (`display`/`overlay`) — popover/dialog enter-exit

`display`/`visibility`/`overlay` are discrete — they normally snap instantly. `transition-behavior: allow-discrete` (or the `allow-discrete` keyword in the shorthand) lets them flip at 0%/100% so enter/exit animate instead of popping:

```css
[popover], dialog {
  opacity: 0; transform: scale(0.95);
  transition: opacity 200ms, transform 200ms, overlay 200ms allow-discrete, display 200ms allow-discrete;
}
[popover]:popover-open, dialog[open] { opacity: 1; transform: scale(1); }
@starting-style { [popover]:popover-open, dialog[open] { opacity: 0; transform: scale(0.95); } }
```

- `display ... allow-discrete`: flips to `none` at 100% of the exit (so it stays visible through the exit), and from `none` at 0% on enter.
- `overlay ... allow-discrete`: defers top-layer removal until the exit finishes (else a popover/dialog drops behind content mid-fade). `overlay` is read-only — list it in `transition-property`, never set `overlay: auto`.
- `@starting-style` is the "from" state for the first style update — without it (or with it placed before the open rule), the entry never animates. Shorthand form: `transition-behavior: allow-discrete;` applies to every discrete property in the list.

## 11. Animating `height: auto`

```css
/* Grid track (broadest support; child must not force height) */
.acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms ease; }
.acc.open { grid-template-rows: 1fr; }
.acc > .inner { overflow: hidden; min-height: 0; }

/* calc-size() — wraps any intrinsic size */
.acc { height: 0; overflow: hidden; transition: height 300ms ease; }
.acc.open { height: calc-size(auto, size); }

/* interpolate-size — keywords become interpolable (global, affects ALL transitions) */
:root { interpolate-size: allow-keywords; }
.acc { height: 0; overflow: hidden; transition: height 300ms ease; }
.acc.open { height: auto; }
```

## Gotchas

- `transition: all` animates off-GPU properties unintentionally — name exact properties.
- Only animate `transform`/`opacity`/`filter` (and `clip-path`); `width`/`height`/`top`/`left` thrash layout.
- `translateY(100%)` = own height (not viewport) — prefer percentages over px.
- Keyframes restart from zero on retrigger; transitions retarget — use transitions for dynamic UI.
- Touch devices fire false `:hover` on tap — gate with `@media (hover: hover) and (pointer: fine)`.
- Ship `prefers-reduced-motion` alongside every animation.