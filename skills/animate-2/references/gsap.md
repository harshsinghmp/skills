# GSAP — Timelines & Scroll Choreography

> **Load only when the user explicitly asks for GSAP.** Default to Motion/CSS unless you genuinely need timeline sequencing, ScrollTrigger pinning, or SVG morphing.

## When to load

Explicit GSAP request, or a need Motion/CSS can't express: multi-step timeline choreography, scroll-triggered pinned sections, SVG path morphing, complex orchestration.

## 1. When GSAP beats Motion/CSS

| Need | GSAP |
|---|---|
| Multi-step timeline (A → B → C, staggered with precise control) | `gsap.timeline()` |
| Scroll-pinned scenes, scrubbed sequences | `ScrollTrigger` |
| SVG path morphing, attr animation (`SVGPlugin`) | `gsap.to(path, { attr: { d } })` |
| Tweening any number/object (`{ val: 0 } → { val: 100 }`) with `onUpdate` | `gsap.to` |
| Fine-grained easing (`"power3.out"`, `"back.out(1.7)"`) | built-in |

If you only need a fade/spring/layout animation, use Motion or CSS — GSAP is heavier and imperative.
**Motion v12 first for scroll.** `motion/react` ships native scroll accelerators (`useScroll`, `scroll()`, `whileInView`) that cover most scroll work plugin-free. Pull GSAP in only for what Motion can't do cheaply: pinning, multi-scrub timelines, horizontal-scroll sequences.

## 2. Core API

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.to(".el", { x: 100, duration: 1, ease: "power3.out" });
gsap.from(".el", { opacity: 0, y: 20, stagger: 0.05 });
gsap.fromTo(".el", { x: 0 }, { x: 100, duration: 0.5 });

const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.4 } });
tl.to(".a", { opacity: 1 })
  .to(".b", { y: -20 }, "-=0.2")      // overlap previous by 0.2s
  .from(".c", { opacity: 0 }, "<");    // start at same time as previous
```

## 3. Easing & defaults

```js
gsap.defaults({ ease: "power3.out", duration: 0.5 });
// Named easings: "power1.out" ... "power4.inOut", "back.out(1.7)", "elastic.out(1,0.3)", "steps(5)"
```

`power1`/`power2`/`power3`/`power4` are increasingly sharp curves; `back`/`elastic` add overshoot (use sparingly — see anti-slop).

## 4. ScrollTrigger

```js
gsap.registerPlugin(ScrollTrigger);

// Fade/slide in on scroll
gsap.to(".card", {
  opacity: 1, y: 0,
  scrollTrigger: { trigger: ".card", start: "top 80%" },
  duration: 0.6, ease: "power2.out",
});

// Scrub — tie progress to scroll position
gsap.to(".progress", {
  width: "100%",
  scrollTrigger: { trigger: ".container", start: "top top", end: "bottom bottom", scrub: true },
});

// Pin a section
ScrollTrigger.create({
  trigger: ".pinned",
  start: "top top",
  end: "+=100%",
  pin: true,
  anticipatePin: 1,   // pre-add pin spacing → no layout jump when pin engages
});

// Grouped reveal — animate elements in batches as they enter the viewport
ScrollTrigger.batch(".card", {
  start: "top 85%",
  interval: 0.1,    // seconds between batches
  batchMax: 3,      // cap elements animated per batch
  onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08 }),
});
```

- `start: "top 80%"` = when element's top hits 80% of viewport. `end: "+=100%"` = scroll distance.
- `anticipatePin: 1` pads the scroller ahead of a pin instead of injecting a spacer on pin — kills the one-frame layout jump on pin-triggering sections.
- `fastScrollEnd: true` forces a positional recalc when momentum ends — resolves the "settle" drift you see when Lenis/ScrollSmoother momentum outlives a fast flick.
- `scrub: true` (or a number = smoothing) ties animation to scroll; `toggleActions` for play/pause/restart.
- Non-scroll animations must call `ScrollTrigger.refresh()` after layout changes (fonts, images load).

## 5. React integration

```jsx
import { useGSAP } from "@gsap/react";

function MySection() {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.to(".item", { opacity: 1, y: 0, stagger: 0.08,
      scrollTrigger: { trigger: ref.current, start: "top 80%" } });
  }, { scope: ref });   // scopes selectors + auto-cleans on unmount
  return <section ref={ref}>...</section>;
}
```

`useGSAP` auto-cleans; `gsap.context()` for manual cleanup. Branch triggers by breakpoint with `gsap.matchMedia()`:

```js
const mm = gsap.matchMedia();
mm.add("(min-width: 800px)", () => {
  gsap.to(".hero", { x: -40, scrollTrigger: { trigger: ".hero", start: "top top", pin: true, scrub: true } });
});
mm.add("(max-width: 799px)", () => {
  gsap.to(".hero", { opacity: 0.3, scrollTrigger: { trigger: ".hero", start: "top 70%" } });
});
```

Each breakpoint gets its own `context` — GSAP auto-reverts it when the query stops matching, so you get responsive branching without duplicate/leaking tweens.

## 6. Lenis smooth scroll (companion — explicit)

Lenis replaces native wheel scrolling with inertial, smoothed scroll page-wide, so `scrub`/`pin` timelines glide instead of stepping scrollbar-to-scrollbar. Premium-tier polish — keep it **explicit/gated**: only reach for it on an award-tier scroll experience, never by default.

```bash
npm i lenis
```

```js
import { ReactLenis, useLenis } from 'lenis/react';
```

**Critical ticker wiring** — Lenis drives its own `requestAnimationFrame` loop, so it must feed ScrollTrigger and share GSAP's ticker (offsetting by `x1000` because GSAP ticks in seconds, Lenis frames in ms):

```jsx
import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function LenisConnector() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    lenis.on("scroll", ScrollTrigger.update);      // sync trigger refresh
    const raf = (t) => lenis.raf(t * 1000);        // drive Lenis on GSAP ticker
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);                   // skip catch-up tween — fights Lenis
    return () => {
      gsap.ticker.remove(raf);                     // clean up ticker
      lenis.off("scroll", ScrollTrigger.update);   // clean up listener
    };
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <LenisConnector />
      {children}
    </ReactLenis>
  );
}
```

- `gsap.ticker.lagSmoothing(0)` is mandatory here — GSAP's default lag smoothing catches the ticker up after a tab-switch/tab-drop, which visually jumps against Lenis's own inertial loop.
- `lerp: 0.1` is the feel knob: lower = longer, softer glide; `duration: 1.2` caps how long inertia runs after release.
- **Never run Lenis without a `prefers-reduced-motion` static fallback** — short-circuit to plain native scroll (skip `<ReactLenis>`/the connector entirely) when the user prefers reduced motion; smooth-scroll is exactly the kind of motion that triggers vestibular discomfort.
- Requires its own CSS (Lenis adds `html.lenis` classes); see the Lenis React reference for the full stylesheet.

**ScrollSmoother — the GSAP-native Lenis alternative.** Same inertial smoothing + parallax, no external lib, and it wires its own ticker to ScrollTrigger (no `lagSmoothing(0)` juggling). Club GSAP plugin (not in the free tier). Keeps the same gating/reduced-motion rules as Lenis.

```js
import { ScrollSmoother } from "gsap/ScrollSmoother";
gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

const smoother = ScrollSmoother.create({
  smooth: 1,      // seconds of smoothing (higher = softer glide)
  effects: true,  // enable data-speed / data-lag parallax
});
```

```html
<!-- data-speed parallax: 2 = 2x scroll speed, 0.5 = half, "auto" = based on depth -->
<img data-speed="2" src="bg.jpg" />
<div data-speed="0.5" data-lag="0.2">foreground</div>
```

- Requires wrapper markup: `#smooth-wrapper` around `#smooth-content`; effect elements sit inside and carry `data-speed`/`data-lag`.
- `smoother.paused(true)` / `smoother.kill()` for reduced-motion or teardown; pin with ScrollTrigger exactly as in §4.

## 7. Text split reveals (SplitText / SplitType)

Per-char/word/line reveals need the text split into animatable units first. `SplitText` is a Club GSAP plugin; `SplitType` is the free, framework-agnostic drop-in.

```js
// SplitText (Club plugin)
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);
const split = SplitText.create(".headline", { type: "lines,words", linesClass: "line" });
gsap.from(split.lines, { opacity: 0, y: 24, stagger: 0.06, duration: 0.6 });
// SplitType (free alternative)
import SplitType from "split-type";
const st = SplitType.create(".headline", { types: "lines,words,chars" });
gsap.from(st.chars, { opacity: 0, yPercent: 120, stagger: 0.02 });
```

- Wrap each `.line`/`.word` in `overflow: hidden` so translate-based reveals don't bleed.
- Re-split on resize/font-load (line breaks change); `split.revert()` / `st.revert()` then re-create, or avoid line splits on responsive layouts.
- `yPercent`/`mask`-based reveal reads cleaner than `clip-path` for chars — see anti-slop.

## 8. Gotchas

- GSAP sets inline `transform` — don't also animate `transform` via CSS `transition` (they fight).
- GSAP's `x`/`y`/`scale` write `transform: translate(...) scale(...)`; CSS `transition: transform` will double-apply.
- `ScrollTrigger.refresh()` after images/fonts load or layout shifts; `ScrollTrigger` assumes static layout otherwise.
- `pin` creates a spacer element — account for its height in layout.
- `elastic`/`back` easing on UI reads as slop — reserve for delight-tier moments.
- Clean up all tweens/triggers on unmount (useGSAP handles this; manual `gsap.context` needs `.revert()`).
- Respect `prefers-reduced-motion` — `ScrollTrigger.matchMedia()` can branch to static/instant states.