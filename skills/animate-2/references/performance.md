# Performance — 60fps Motion

Smooth motion is a property budget: only compositor-only properties hit 60fps under load. 60fps = 16.6ms per frame.

## When to load

Diagnosing jank, choosing animatable properties, LCP/CLS concerns, optimizing existing animation.

## 1. Compositor-only properties

| Property | Cost | Why |
|---|---|---|
| `transform` (translate/scale/rotate) | Cheap | GPU-composited; skips layout + paint |
| `opacity` | Cheap | GPU-composited |
| `filter` (small blur) | Cheap (Safari: moderate) | GPU, but keep blur < 20px |
| `clip-path` | Cheap-ish | Sanctioned 4th property |
| `width`/`height`/`margin`/`padding`/`top`/`left` | Expensive | Triggers layout → paint → composite every frame |
| `color`/`background-color` | Moderate | Triggers paint (no layout) |
| `box-shadow` | Expensive | Paint-heavy |

**Rule: animate `transform` + `opacity` only** (plus `clip-path`, and `height` for accordions).

**Transform order reads right-to-left.** `rotate(45deg) translateX(100px)` rotates first, so the translate then moves *along the rotated (diagonal) axis*; `translateX(100px) rotate(45deg)` moves straight right, then rotates in place. Reorder `translate` before `rotate`/`scale` when you want axis-independent movement.

## 2. will-change, contain, content-visibility

```css
.will-animate { will-change: transform, opacity; }
.off-screen { content-visibility: auto; contain: layout style paint; }
```

- `will-change` is a *hint to promote a layer* — apply it just before animation, **remove it after**. Leaving it on permanently pins layers in memory.
- Scope `will-change` to a transient state (`:hover`, `:active`, `.animating`) — never global, never permanent.
- `contain: paint` / `contain: layout` isolate an element's paint/layout so parent changes don't re-layout it; `contain: layout style paint` on an animated element also blocks style/layout invalidation escaping it.
- `content-visibility: auto` skips rendering off-screen content entirely (list virtualization via CSS).
- `translateZ(0)` forces a compositor layer — the fallback that fixes the sibling-content 1px-shift / blur-you-write-you-read bug.

## 3. Hover / tap triggers

- **Hover-flicker fix**: transform a *child* of the hovered element, not the hovered element itself. Animating the hovered element's bounds changes its hit area → pointer leaves → un-hover → animates back → infinite flicker loop.
- **Debounce hover ~100ms** when adjacent elements have adjacent hover targets (menu items, card stacks); kills accidental rollover jitter without feeling laggy.
- **Mobile two-tap**: first tap = hover, second tap = click. Use `:active`/pointer events with 0ms touch hover delay so the first tap does not double-fire.

## 4. Jank diagnosis

- **Main thread vs compositor**: JS/`requestAnimationFrame`-driven motion runs on the main thread; the browser can't paint while it loads/scripts. CSS animations run off the main thread and stay smooth under load.
- Chrome DevTools **Performance** panel: look for long main-thread tasks (>16.6ms) during the animation; **Animations** panel for timing drift.
- `requestAnimationFrame` loop that reads layout (`getBoundingClientRect`, `offsetHeight`) then writes style in the same frame → **layout thrashing**.

## 5. Tool tradeoffs

| Tool | Off main thread | Interruptible | When |
|---|---|---|---|
| CSS transition/animation | Yes | transition yes, keyframes no | Predetermined / two-state |
| WAAPI (`element.animate()`) | Yes | Yes | JS control, no library |
| Motion (React) springs | Varies — full `transform` string keeps it accelerated | Yes | Springs, layout, gestures |
| Motion `x`/`y`/`scale` props | **No** (rAF) | Yes | ❌ drops frames under load |
| `requestAnimationFrame` hand-rolled | No | Yes | Only when nothing else fits |

## 6. Avoid layout/paint thrash

- Batch reads then writes; never `read → write → read → write` in one frame.
- Don't drive a child transform via a CSS variable on the parent (`el.style.setProperty('--swipe', ...)`) — it recalcs styles for every child. Set `transform` on the element directly.
- Prefer `translate()` percentages (own-size relative) over `top`/`left`.

## 7. LCP / CLS

- Entrance animations can shift layout (CLS). Reserve space (`aspect-ratio`, fixed container height) so the reveal doesn't push content.
- Don't animate `font-size`, `width`, or reflow-critical properties on load — they jank LCP.
- Lazy-load + `content-visibility` big off-screen media.

## 8. Perceived performance

Real latency and felt latency are different budgets — optimize the latter directly:

- A distinctly *faster* spinner/loader makes the whole task feel faster; a fast, low-amplitude pulse reads as "working hard" where a slow one reads as "stuck".
- Ease-out (fast start) feels snappier than ease-in (slow start) at the *same* 200ms duration — identical budget, better feel.
- First tooltip is instant (no delay); subsequent tooltips may use the 100ms hover debounce. First response sets the perceived latency baseline.

## 9. Off-screen / in-viewport only

- Animate only elements in the viewport (`IntersectionObserver`, `useInView { once: true }`, `content-visibility`).
- Gate the loop: pause `requestAnimationFrame`/timeline when the tab is hidden (`document.hidden`) or the element has `.is-offscreen` / is outside the viewport — don't burn frames the user can't see.
- Measure (and animate) only the target element — avoid forced sync layouts on pseudo-elements, and batch `getBoundingClientRect`/`offsetHeight` reads.
- **Leak cleanup checklist** on unmount/pause: cancel `requestAnimationFrame` (store the id), kill in-flight tweens/`element.animate()` (`.cancel()`/`.pause()`), remove resize/scroll/keydown listeners, and strip `will-change`.

## Gotchas

- `will-change: transform` on hundreds of elements at once exhausts GPU memory — promote only what needs it.
- Heavy `filter: blur(>20px)` during a transition is expensive, especially Safari.
- `will-change` left on permanently = memory leak (layer never released).
- Keyframes restart from zero — for rapid triggers use transitions/springs (also avoids re-promotion churn).
- Don't reason about jank from code alone — measure in DevTools, test gestures on a real device.