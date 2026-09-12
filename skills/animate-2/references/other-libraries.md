# Other Libraries — Anime.js, Lottie, Rive, SVG, Three.js

Recommended-when-appropriate tools beyond Motion/CSS. Each loaded only when the use case genuinely needs it.

## When to load

A need for a lightweight imperative timeline, designer-authored vector/illustration, interactive state-machine animation, hand-drawn SVG, or real 3D.

## 1. Anime.js v4 — lightweight imperative

Choose over Motion when: no React (or want framework-agnostic), or SVG-heavy timeline/stagger with a tiny footprint.

```js
import anime from "animejs";

anime({
  targets: ".el",
  translateX: 100,             // individual transform props — NEVER a `transform` string
  rotate: 45, scale: 1.2,
  opacity: [0, 1],
  duration: 600,
  easing: "steps(5)",          // or "easeOutQuad" / "spring(1, 80, 10, 0)"
  round: 1,                    // snap numeric tweens to integers
  delay: anime.stagger(50, { grid: [14, 5], from: "center" }),
});

// line-draw: setDashoffset reads the real path length then tweens to 0
strokeDashoffset: [anime.setDashoffset, 0],
// path morph (equal segment counts)
d: [{ value: "M10 80 Q 95 10 180 80" }, "M10 80 Q 95 80 180 80"],

// move along a path via anime.path() probe functions
const p = anime.path("svg path");
anime({ targets, translateX: p("x"), translateY: p("y") }); // also p("angle") for rotate

// timeline offsets: "-=500" / "+=200" are RELATIVE to the prior tween end;
//   a plain number (500) is ABSOLUTE from timeline start — common pitfall
const tl = anime.timeline({ easing: "easeOutExpo" });
tl.add({ targets: ".a", opacity: 1, duration: 300 }, "-=150");
tl.add({ targets: ".b", translateY: -20, duration: 300 }, "+=200");

// scroll-scrub: build inert, drive position by scroll
const anim = anime({ targets, autoplay: false, ... });
anim.seek((scrollTop / maxScroll) * anim.duration);
```

- Targets CSS selectors / DOM nodes / JS objects; tweens transforms, opacity, SVG attrs (`strokeDashoffset`, `d`), and any numeric prop — units are REQUIRED for non-default (`width: "200px"`).
- `anime.stagger(n, {grid,from})`; `anime.timeline()` sequencing; `anime.set/get/remove`; `anime.path()` for path-relative motion; `spring(mass, stiffness, damping, velocity)` easing; `steps(n)`, `round`.
- Gotcha: imperative — you own mount/unmount. In React, `animation.pause()` in the effect cleanup or you leak tweens/rAF into unmounted nodes.

## 2. Lottie — designer-authored animation

When a designer ships an After Effects/Bodymovin JSON and you need pixel-perfect vector motion.

```jsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react";  // .lottie (recommended)
import Lottie from "lottie-react";                               // .json
<DotLottieReact src="/anims/loader.lottie" loop autoplay />
// interactivity: mode="scroll" | "cursor" (scrub tied to scroll/pointer)
```

- `.lottie` (DotLottie) = ZIP of multi-theme/multi-state animations, ≤90% smaller than raw JSON; `.json` = legacy single animation over `lottie-web` core. React wrappers: `lottie-react`, `@lottiefiles/dotlottie-react`.
- Renderer selection: `svg` (default — crisp vector quality), `canvas` (performance for complex/heavy frames), `html` (legacy — avoid). Set via `renderer="canvas"` (lottie-react) or `lottie.loadAnimation({ renderer })`.
- Budgets: keep asset <100KB ideal, load <500ms, hold 60fps desktop / 30–60 mobile.
- Low-end devices: `DotLottieWorker` (decode in a worker) + `devicePixelRatio: 1` when `navigator.deviceMemory < 4`. Offscreen: `IntersectionObserver` → `animation.pause()`/`play()`.
- AE→Lottie export limits: no layer effects, blend modes, 3D, or partial expressions — only transform/opacity/vector paths/shapes/masks and fully-supported expressions.
- ScrollTrigger scrub: call `animation.goToAndStop(frame, true /* isFrame */)` from an `onUpdate` (true = interpret `frame` as a frame number, not 0–1 progress).
- Gotcha: heavy — lazy-load, only for meaningful illustration (loaders, onboarding, celebration), and hold a static frame under reduced motion.

## 3. Rive — interactive state-machine animation

When animation must respond to input state (hover, form, input value) via a designer-built state machine.

```jsx
import { useRive } from "@rive-app/react-canvas";
const { rive, RiveComponent } = useRive({
  src: "/anim.riv", stateMachines: "State Machine 1", autoplay: true,
});
const inputs = rive.stateMachineInputs("State Machine 1");
inputs[0].value = true;  // drive a boolean input
<RiveComponent />
```

- `.riv` bundles art + a state machine (inputs/bools/numbers/triggers); designer authors in Rive editor.
- Gotcha: needs `.riv` binary + a defined state machine; don't reach for it for a simple fade.

## 4. SVG animation

Hand-drawn/vector motion without a library:

```svg
<!-- draw-on via stroke-dasharray -->
<path d="M10 80 Q 95 10 180 80" fill="none" stroke="#000" stroke-width="3"
      stroke-dasharray="300" stroke-dashoffset="300">
  <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.5s" fill="freeze"/>
</path>
```

```css
/* path morphing / line drawing via CSS */
.line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 1.5s ease-out forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
```

- `stroke-dasharray`/`stroke-dashoffset` = "draw itself in" (line drawing). `path d` with matching point counts = morph.
- SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) works without CSS; CSS `@keyframes` is usually cleaner.
- Gotcha: `path` morphing needs equal segment counts; SMIL has partial support quirks on some Safari versions.

## 5. Page transitions — View Transitions API

See [css-animations.md](css-animations.md) §6. `document.startViewTransition()` + `view-transition-name` morphs between routes/pages with shared elements. Respect reduced motion.

## 6. Three.js / R3F — real 3D (heavy — minimum unless asked)

WebGL is heavy and not widely supported — treat as a last resort. Load only when 3D is explicitly asked for or already a project dependency.

When the task is genuine 3D scenes, not 2.5D UI polish.

```jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function Cube() {
  const ref = useRef();
  useFrame((state, delta) => { ref.current.rotation.x += delta; });
  return <mesh ref={ref}><boxGeometry /><meshStandardMaterial /></mesh>;
}
<Canvas><ambientLight /><Cube /></Canvas>
```

- `useFrame((state, delta) => …)` runs every frame — mutate transforms/refs, not React state.
- For 2D UI "depth" (tilt, flip), CSS `perspective` + `rotateX/Y` is cheaper — Three.js is for actual meshes/scenes.
- Gotcha: heavy bundle; only bundle when 3D is core, and gate behind reduced motion (pause loops).

## 7. Lenis — smooth scroll (heavy — explicit)

Smooth/inertial scrolling (replaces native scroll) that pairs with GSAP ScrollTrigger for premium scroll experiences. Not a default: native scroll is already good for most sites.

```bash
npm i lenis                              # current — React components at lenis/react
# legacy React wrapper: @studio-freight/lenis-react (pre-1.0)
```

```tsx
import { ReactLenis, useLenis } from "lenis/react";
const lenis = useLenis();
useEffect(() => {
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => gsap.ticker.remove(raf);
}, [lenis]);
<ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>{children}</ReactLenis>
```

- Key options: `lerp` (smoothness, ~0.1) and `duration` (ease-out time); plus `smoothWheel`, `touchMultiplier`, `syncTouch`.
- Only for premium scroll experiences; never default. Gotcha: you own cleanup (remove ticker + `lenis.off`) and must keep `data-lenis-prevent` on internal scroll containers.

## 8. Creative coding & generative (heavy — explicit)

Load only on explicit request or when already a project dependency.

- **Zdog** — pseudo-3D flat/round shapes rendered to canvas or SVG, ~2kb. `npm i zdog`. Use for playful stylized 3D illustrations, not real 3D. Gotcha: no real lighting/depth — flat, cartoon look only.
- **p5.js** — generative/algorithmic art with a `setup`/`draw` sketch loop. `npm i p5`. Use for flow fields, fractals, noise-based visuals. Gotcha: runs its own canvas + loop — use instance mode (`new p5(sketch, el)`) and manage lifecycle manually in React.
- **Matter.js** — 2D physics: gravity, collisions, constraints. `npm i matter-js`. Use for falling/stacking/colliding scenes. Gotcha: you render bodies yourself (canvas/DOM) with your own rAF loop; bodies won't draw themselves.
- **Tone.js** — audio-reactive animation via Web Audio synthesis and effects. `npm i tone`. Use when visuals respond to sound/frequency. Gotcha: `AudioContext` requires a user gesture — start `Tone.start()` on click/keydown.

## Getting answers on library choice

If the need is a fade/spring/layout/animation and the user didn't name a library, stop at Motion or CSS — none of these tools earn a dependency for that.