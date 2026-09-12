# Motion (motion.dev / Framer Motion)
The default React animation library: declarative springs, layout animations, exit animations, and gestures. Import from `motion/react` (v11+; `framer-motion` is the legacy name).

## When to load

Any React motion beyond a trivial CSS state toggle — springs, entrances/exits, layout shifts, gestures, scroll-linking.

## 1. Import & mount

```jsx
import { motion, AnimatePresence, MotionConfig } from "motion/react";
```

`<MotionConfig reducedMotion="user" transition={...}>` at the root sets global reduced-motion and default transitions.

### Bundle size (tree-shake)

`import { motion } from "motion/react"` pulls every feature (~35kb). Lazy-load the subset you need:

```jsx
import { LazyMotion, m } from "motion/react";
import { domAnimation } from "motion/react";
<LazyMotion features={domAnimation}><m.div animate={{ opacity: 1 }} /></LazyMotion>
```

- `domAnimation` = transforms + `AnimatePresence`; `domMax` adds `drag` + `layout` animations. Choosing `domAnimation` over `domMax` saves ~17kb.
- Leaf/RSC component only needs `useAnimate`: `import { useAnimate } from "framer-motion/mini"` (~5kb).
- `<LazyMotion features={...} strict>` throws at runtime if a child uses a feature you didn't load — catches accidental full-bundle usage.

## 2. Core props

| Prop | Meaning |
|---|---|
| `initial` | Style/state on mount (`{ opacity: 0 }` or `"hidden"` variant) |
| `animate` | Target (`{ opacity: 1 }` or `"visible"` variant); arrays = keyframes |
| `exit` | State when removed (requires `<AnimatePresence>` ancestor) |
| `transition` | Easing/duration/spring config |
| `whileHover` / `whileTap` / `whileDrag` / `whileFocus` | Interaction gestures |
| `whileInView` | Fires on scroll-into-view (`.viewport={{ once: true }}`) |
| `variants` | Named states reused across children (`hidden`/`visible`) |
| `layout` / `layoutId` | Animate layout changes / shared-element transitions |
| `drag` | Enable drag (`dragConstraints`, `dragElastic`, `dragSnapToOrigin`) |

```jsx
<motion.div initial={{ opacity: 0, transform: "translateY(8px)" }}
  animate={{ opacity: 1, transform: "translateY(0)" }}
  transition={{ duration: 0.25, ease: "easeOut" }} />
```

## 3. Spring vs tween

Prefer springs — they feel natural, carry velocity through interruption, settle physically.

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }          // Apple-style (recommended)
{ type: "spring", stiffness: 100, damping: 10, mass: 1 } // physics-style
{ duration: 0.2, ease: "easeOut" }                       // tween (fixed duration)
```

Easings: `"easeOut"`, `"easeInOut"`, `"ease"`, `"linear"`, or a `[a,b,c,d]` cubic-bezier array.

### Tuning bands

| Param | Range | Feel |
|---|---|---|
| `damping` | `< 10` | bouncy / overshoots |
| | `15–25` | natural, 1–2 oscillations then settle |
| | `> 30` | no visible bounce |
| `mass` | `0.5–0.8` | light, snappy |
| | `1` (default) | neutral |
| | `1.2–2` | heavy, sluggish |
Critical damping (zero overshoot): `damping = 2 * Math.sqrt(stiffness * mass)`.
**`dragElastic`**: `0` = hard stop at constraint edge; `0.1–0.2` = subtle resistance; `0.3–0.5` = playful rubber-band.

## 4. AnimatePresence — exits

```jsx
<AnimatePresence mode="wait" initial={false}>
  {open && <motion.div key="panel" exit={{ opacity: 0 }} ... />}
</AnimatePresence>
```

- `mode` enum: `"sync"` (default — exit and enter run simultaneously/overlap), `"wait"` (exit completes before enter starts), `"popLayout"` (exiting element is popped out of layout flow so siblings reflow during the exit).
- Every child needs a stable `key` or AnimatePresence can't track it.
- `initial={false}` skips the mount animation.

## 5. Keyframes

Pass arrays; `transition` configs also become arrays:

```jsx
<motion.div animate={{ opacity: [0, 1, 1, 0], x: [0, 100, 100, 0] }}
  transition={{ duration: 2, times: [0, 0.3, 0.7, 1],   // position of each stop
    ease: ["easeIn", "linear", "easeOut"],             // one easing per segment
    repeatType: "mirror" }} />                          // "loop" | "reverse" | "mirror"
```

- `times` length must equal the keyframe array length.
- A `null` keyframe (`opacity: [null, 1]`) = "start from the current value" (unknown opening state).
- `repeatType`: `"loop"` restarts from the start, `"reverse"` plays backward then forward, `"mirror"` plays forward then backward (no jump at the loop point).

## 6. Layout animations & shared elements

```jsx
<motion.div layout transition={{ layout: { duration: 0.3 } }} />   // animate position/size
<motion.img layoutId="card-thumb" src={...} />   // same layoutId elsewhere = morph/travel
```

A `layout`-animated child inside a scrollable ancestor needs `layoutScroll` on the child (or `layout` on the scroll container) so scroll offsets are factored into the measured deltas.

## 7. useScroll + useTransform — scroll/values

```jsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], ["0vh", "50vh"]);
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
<motion.div style={{ y, opacity }} />
```

`useSpring(scrollYProgress, { stiffness: 100, damping: 30 })` smooths raw scroll input. `useInView(ref, { once: true, margin: "-100px" })` toggles a reveal flag.

### Motion values beat setState

For per-frame work (scroll, drag, pointer) use `useMotionValue` + `useTransform` instead of `useEffect` + `setState`: motion values mutate without triggering a React re-render, so the tree renders once while the value updates at 60fps.

```jsx
const x = useMotionValue(0);
const scale = useTransform(x, [-200, 0, 200], [1.5, 1, 1.5]);
<motion.div style={{ x, scale }} onPan={(e, i) => x.set(i.offset.x)} />;
```

Use `useMotionValueEvent(x, "change", v => …)` to subscribe imperatively (no re-render).

### v12 native scroll timelines

Motion v12 accelerates `useScroll` with native CSS `ScrollTimeline`/`ViewTimeline` (browsers clip scroll offsets before JS reads them). No API change — existing `useScroll`/`useTransform` graphs get faster for free.

## 8. Variants + stagger

```jsx
const list = { hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, transform: "translateY(8px)" },
  show: { opacity: 1, transform: "translateY(0)", transition: { duration: 0.3 } } };
<motion.ul variants={list} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i} variants={item} />)}
</motion.ul>
```

Stagger 30–80ms; never let a decorative stagger block interaction.

## 9. SVG — draw-on & morph

```jsx
<motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
  transition={{ duration: 1.5, ease: "easeInOut" }} />
```

- Set `pathLength: 1` once to normalize ANY path to `0..1`, so draw-on needs no manual `getTotalLength()`/dasharray measurement and survives viewBox/scale changes.
- Path morphing (one `d` easing into another) requires matching point/segment counts between source and target; mismatched paths jump. Normalize shapes with `flubber`, which resamples both to a shared point count.

## 10. Toast stack — depth offset

Overlapping cards that step back by depth index `n`:

```css
.notification { --lift-amount: 14px; }
/* nth card: */ translateY(calc(-1 * var(--n) * var(--lift-amount))) scale(calc(1 - 0.05 * var(--n)));
```

`translateY(-14n)` + `scale(1 - 0.05n)` lifts each older toast up and shrinks it 5% per level, keeping the top card foremost.

## 11. Recipes

```jsx
// Press feedback
<motion.button whileTap={{ transform: "scale(0.97)" }} transition={{ duration: 0.16 }} />
// Reduced motion
import { useReducedMotion } from "motion/react";
const reduce = useReducedMotion(); const closedX = reduce ? 0 : "-100%";
```

```jsx
// Image reveal — clip-path wipe + inner scale settle
<motion.div className="overflow-hidden"
  initial={{ clipPath: "inset(100% 0 0 0)" }} whileInView={{ clipPath: "inset(0 0 0 0)" }}
  viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}>
  <motion.img src={src} alt={alt}
    initial={{ transform: "scale(1.3)" }} whileInView={{ transform: "scale(1)" }}
    viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
</motion.div>
```

```jsx
// Text char reveal — per-character 3D spring stagger
const c = { hidden: { opacity: 0, transform: "translateY(50px) rotateX(-90deg)" },
  visible: { opacity: 1, transform: "translateY(0) rotateX(0)", transition: { type: "spring", damping: 12 } } };
<motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } }}
  initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {text.split("").map((ch, i) => (
    <motion.span key={i} variants={c} style={{ display: "inline-block" }}>{ch === " " ? "\u00A0" : ch}</motion.span>
  ))}
</motion.span>
```

## Canonical easing tokens

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

In Motion, convert to arrays: `ease: [0.23, 1, 0.32, 1]`.

## Gotchas

- **Import `motion/react`, not `framer-motion`** (v11 renamed it).
- **`x`/`y`/`scale` shorthands run on the main thread and drop frames under load** — use `transform: "translateX(100px)"` strings, which are hardware-accelerated.
- Animate `transform` + `opacity` only; never `width`/`height`/`top`/`left` (layout thrash). `layout` is the sanctioned way to animate size/position.
- Never animate from `scale(0)` — use `scale(0.9–0.97)` + `opacity: 0`.
- Give every `<AnimatePresence>` child a stable `key`; with `mode="wait"` a missing/failing exit can deadlock the enter.
- `whileTap` always pairs with a fast transition (`0.16s`); press feedback is instant.
- `ease: "easeIn"` on UI entrances reads as sluggish — use `easeOut`.
- Keyframe `times`/`ease` arrays must match the keyframe array lengths, or segments sample unpredictably.
