---
name: animate
aliases: ["motion", "animation", "ui-animation", "framer-motion", "motion-design", "transitions"]
description: "Design, build, review, and improve web UI animation and motion: library selection, easing/timing, and correct code for entrances, exits, micro-interactions, scroll, page transitions, hover/press states, and layout shifts. Use when asked to animate something, add motion, build a transition, make a component feel alive, review/audit/improve existing motion, or find places that should animate. Defaults to Motion (motion.dev, formerly Framer Motion) for React and CSS for quick fixes; uses any animation library already present in the project first; GSAP, WebGL, and native-mobile (Reanimated/SwiftUI/Compose/Flutter) are loaded only on explicit request."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: design-interface
metadata:
  category: design-interface
  priority: 22
  aliases: ["motion", "animation", "ui-animation", "framer-motion", "motion-design", "transitions"]
  suggested_skills: ["refactor-ui", "designscope", "code-review", "gauntlet-loop"]
  hermes:
    tags: [animation, motion, framer-motion, motion-dev, css, transitions, easing, gsap, scroll, micro-interactions, ui, design, springs, reduced-motion, accessibility]
    related_skills: [refactor-ui, designscope, code-review, gauntlet-loop]
    suggested_skills: [refactor-ui, designscope, code-review, gauntlet-loop]
    requires_tools: [view_file, write_to_file, bash]
  openclaw:
    category: design-interface
    suggested_skills: [refactor-ui, designscope, code-review, gauntlet-loop]
    primary_triggers: ["animate this", "add motion", "add a transition", "make it feel alive", "spring", "entrance animation", "exit animation", "micro-interaction", "scroll animation", "page transition", "hover effect", "framer motion", "gsap", "reduce motion", "review animation", "audit motion", "improve animations", "what could animate here"]
    requires_tools: [view_file, write_to_file, bash]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🎬 animate — Motion & UI Animation

Build motion that would survive a strict design-engineering review, on the first pass. The skill is a **router + build sequence**: decide *whether* to animate, *why*, *which tool*, then write correct code with defensible easing and timing.

Three principles govern everything:

1. **The correct answer is sometimes zero animation.** An action fired 100×/day (keyboard shortcut, command palette, toggle) should not animate at all. Saying "this shouldn't move" is success, not a dodge.
2. **Cheapest tool that works.** Don't install a motion library for a fade; don't hand-roll a drawer that should be a component.
3. **Animate only `transform` and `opacity`** (plus sanctioned `clip-path`, and `height` for accordions). These skip layout and paint and run on the GPU.
4. **Use what's already there.** If the project already depends on a motion library (Motion, GSAP, Anime.js, Lenis, Reanimated, Three.js, …), build on it before introducing a new dependency — a new library is justified only when the present one can't express the motion. Extend existing `--ease-*` / `--duration-*` design tokens, never fork them.

---

## Modes — quick commands

Every invocation resolves to one of five modes. Route on the *verb*, not the noun:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **build** (default) | "animate", "add motion", "make X feel alive", "build a transition" | Run the 8-step build sequence and write the code | this file |
| **review** | "review the animation", "critique the motion in this diff" | Flag-by-default diff review → findings table + Block/Approve verdict | [review-checklist.md](references/review-checklist.md) |
| **improve** | "improve the animations", "make this app feel better" | Read-only recon → audit → prioritized plan (does **not** edit source) | [review-checklist.md](references/review-checklist.md) |
| **audit** | "audit the motion", "animation audit" | Same as **improve**: severity-ordered findings + self-contained remediation plans | [review-checklist.md](references/review-checklist.md) |
| **find** | "what could animate here?", "make this more alive" | Gate-driven hunt; rejects most candidates, proposes only high-leverage motion | [review-checklist.md](references/review-checklist.md) |

In **review / improve / audit / find**, load `references/review-checklist.md` and follow its workflow — do not write animation code in those modes. Only **build** edits code.

---

## When to Use

- Asked to **animate / add motion / build a transition / make something feel alive**.
- Implementing **entrances, exits, micro-interactions, hover/press states, scroll reveal, page transitions, layout changes, drag/swipe gestures, loading states**.
- **Reviewing or auditing** existing animation (use [references/review-checklist.md](references/review-checklist.md)).
- Choosing an **animation library or tool** for a feature.

### Anti-Triggers

- Building a *component* (toast, drawer, dropdown, command menu) rather than an animation → that is a UI-library decision, not motion.
- Pure **layout/visual design** without motion → [`refactor-ui`](../refactor-ui/SKILL.md).
- Extracting a **design system / design tokens** → [`designscope`](../designscope/SKILL.md).
- Native mobile animation is **explicit-ask-only**; do not reach for `references/mobile.md` unless the user names a mobile platform.

---

## Quick Reference

### Library selection — cheapest that fits (walk down, stop at first match)

| Need | Tool | Load |
|:---|:---|:---|
| Hover, press, color, class/attribute state toggle | **CSS transition** | inline (tables below) |
| Entry on mount, no JS state | **CSS `@starting-style`** | [css-animations.md](references/css-animations.md) |
| Predetermined motion staying smooth while page is busy | **CSS animation** (runs off main thread) | [css-animations.md](references/css-animations.md) |
| Programmatic control, no library | **WAAPI** (`element.animate()`) | [css-animations.md](references/css-animations.md) |
| Springs, layout animations, exit animations, gestures | **Motion** (`motion.dev`) — default for React | [motion-dev.md](references/motion-dev.md) |
| Timeline choreography, scroll pinning, SVG morph, complex sequencing | **GSAP** — *explicit ask only* | [gsap.md](references/gsap.md) |
| Designer-authored vector/illustration, state machines | **Lottie / Rive** | [other-libraries.md](references/other-libraries.md) |
| Lightweight imperative (non-React, SVG, timeline) | **Anime.js v4** | [other-libraries.md](references/other-libraries.md) |
| Real 3D (heavy — *minimum unless asked*) | **Three.js / R3F** | [other-libraries.md](references/other-libraries.md) |
| Native mobile (Reanimated / SwiftUI / Compose / Flutter) | — *explicit ask only* | [mobile.md](references/mobile.md) |

**Recommendation:** **Motion** for any React motion beyond a trivial state toggle; **CSS** for the quick fixes. Prefer **WAAPI** when you need JS control without a dependency. Reach for **GSAP** only when you genuinely need timeline sequencing or ScrollTrigger choreography that Motion/CSS can't express cleanly.

**Heavy libraries** (GSAP, Lenis, Three.js/WebGL, p5.js, Matter.js, Tone.js) load only when you're asked for them **or the project already depends on them**. WebGL is heavy and not widely supported — treat it as a last resort, never a default.

### Easing — in decision order (never hand-roll a curve you don't know)

| Situation | Easing |
|:---|:---|
| Entering | `ease-out` |
| Exiting | `ease-in` (accelerates away; reverse of the entrance) |
| Moving / morphing on screen | `ease-in-out` |
| Hover / color change | `ease` |
| Constant motion (marquee, progress) | `linear` |
| Default | `ease-out` |

**Never `ease-in` on an entrance** — it starts slow, delaying the exact moment the user watches. `ease-in` on an *exit* is correct: it accelerates the element away (the time-reverse of an ease-out entrance). Built-in easings are too weak; use strong tokens:

```css
--ease-out:     cubic-bezier(0.23, 1, 0.32, 1);  /* strong ease-out for UI */
--ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1); /* strong in-out for on-screen movement */
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);  /* iOS-like drawer curve */
```

Need another curve? Take it from [easing.dev](https://easing.dev/) / [easings.co](https://easings.co/) — don't invent `cubic-bezier(0.4, 0, 0.2, 1)` from memory.

### Duration — UI stays under 300ms

| Element | Duration |
|:---|:---|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | can be longer |

Reach for a **spring** for drag-with-momentum, "alive" elements, interruptible gestures, decorative mouse-tracking:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }            // Apple-style, easy to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }  // traditional physics, more control
```

Keep bounce in 0.1–0.3, and avoid it in most UI — reserve for drag-to-dismiss and playful interactions.

### Reference map

| Reference | When to load |
|:---|:---|
| [principles.md](references/principles.md) | Grounding the 12 principles, easing/physics, motion vocabulary |
| [motion-dev.md](references/motion-dev.md) | Any Motion / Framer Motion implementation |
| [css-animations.md](references/css-animations.md) | CSS transitions/keyframes/@property/scroll-driven/WAAPI/View Transitions |
| [performance.md](references/performance.md) | Jank, 60fps, compositor-only properties, LCP/CLS |
| [accessibility.md](references/accessibility.md) | `prefers-reduced-motion`, vestibular safety |
| [review-checklist.md](references/review-checklist.md) | Reviewing or auditing motion quality |
| [gsap.md](references/gsap.md) | GSAP + ScrollTrigger (explicit ask only) |
| [mobile.md](references/mobile.md) | Reanimated / SwiftUI / Compose / Flutter (explicit ask only) |
| [other-libraries.md](references/other-libraries.md) | Anime.js, Lottie, Rive, SVG, Three.js |

---

## Procedure

Run the sequence in order; step 0 resolves the stack, steps 1–2 gate everything.

### Step 0: Detect the project's existing motion stack

Scan `package.json` (`dependencies` + `devDependencies`), `import`/`require` statements, lockfiles, Tailwind config, and existing `--ease-*` / `--duration-*` tokens. If a library is already present, **use it first** — propose a new dependency only when the present tool can't express the motion. Respect existing easing/duration tokens (extend, never fork).

### Step 1: Should this animate at all?

| Frequency | Decision |
|:---|:---|
| 100+×/day (keyboard shortcuts, command palette) | **No animation. Ever.** Stop. |
| Tens of ×/day (hover, list navigation) | Near-imperceptible, or nothing |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebration) | The delight budget lives here |

**Keyboard-initiated actions are a disqualifier, not a judgment call.** If the request fails this gate, say so plainly and offer the non-motion alternative (instant state change, static affordance).

### Step 2: Name the purpose

One word: **feedback** · **spatial consistency** · **state indication** · **preventing a jarring change** · **explanation** (marketing only) · **delight** (*only* at the rare tier). Can't name it → don't build it. "It looks cool" on a frequently-seen element is a reason to stop. Data the user reads or acts on must not move for style.

### Step 3: Pick the tool

Walk the selection table above; stop at the first that fits. If the task needs a *component* (toast/drawer/dropdown), use a UI library, not hand-rolled motion.

### Step 4: Pick properties

- **`transform` + `opacity` only** (`clip-path` sanctioned 4th; `height` tolerated for accordions).
- **Never `scale(0)`** — start from `scale(0.9–0.97)` + `opacity: 0`.
- **`transform-origin` at the trigger** for popovers/dropdowns/menus (`var(--transform-origin)`); **modals exempt** (stay centered).
- **Percentage `translate()`** is relative to element size — `translateY(100%)` = own height. Prefer over px.
- **Motion: use the full transform string.** `x`/`y`/`scale` shorthands are not hardware-accelerated and drop frames under load:
  ```jsx
  <motion.div animate={{ transform: "translateX(100px)" }} /> // accelerated
  <motion.div animate={{ x: 100 }} />                          // drops frames under load
  ```

### Step 5: Easing and duration — or a spring

Apply the easing + duration tables above. **No approximated values** — every curve/duration comes from the tables or a known source.

### Step 6: Interruption and exit

- **Transitions, not keyframes,** for anything triggered rapidly (toasts, toggles) — transitions retarget from current value; keyframes restart from zero.
- **Springs for gestures** (carry velocity through interruption).
- **Exit the way it entered** (a toast that slides up from the bottom leaves through the bottom).
- **Asymmetric timing** where the user decides: slow on the deliberate phase, snappy on the system response.

### Step 7: Reduced motion + pointer gating ships with it

```css
@media (prefers-reduced-motion: reduce) {
  .el { animation: fade 0.2s ease; }           /* keep opacity/color, drop transform motion */
}
@media (hover: hover) and (pointer: fine) {
  .el:hover { transform: scale(1.05); }        /* touch fires false hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

Reduced motion = **fewer and gentler** animations, not zero. See [accessibility.md](references/accessibility.md).

### Step 8: Write the code, then state the reasoning

Emit the code. Then in ≤3 lines: the **gate result** (frequency tier + named purpose), the **ingredients** (tool / properties / curve / duration, one line each), and what to **feel-check** that code can't settle (play at 2–5× duration, step frame-by-frame, test gestures on a real device, re-check next day).

---

## Pitfalls

- **Animating `width`/`height`/`margin`/`padding`/`top`/`left`** instead of `transform`/`opacity` — triggers layout + paint + composite.
- **`transition: all`** — name the exact properties.
- **`transform: scale(0)`** entrance — nothing appears from nothing; use `scale(0.95)` + `opacity: 0`.
- **`ease-in` on a UI element** — starts slow, feels unresponsive.
- **Built-in `ease-out` on a deliberate animation** — too weak; use `cubic-bezier(0.23, 1, 0.32, 1)`.
- **UI duration over 300ms** without a reason.
- **Keyframes on toasts/toggles** — restart from zero; use transitions.
- **Motion `x`/`y`/`scale` shorthands under load** — use the full `transform` string.
- **Ungated `:hover` motion** — wrap in `@media (hover: hover) and (pointer: fine)`.
- **Missing `prefers-reduced-motion`** — ships with the animation, not as a follow-up.
- **Everything entering at once** — 30–80ms stagger.
- **Driving a child transform via a CSS variable on the parent** — recalcs styles for every child; set `transform` directly.
- **Reaching for GSAP or a mobile platform without an explicit ask** — those references are gated; pulling them in burns tokens for the wrong problem.

---

## Verification

- Run the gate: can you name the frequency tier and the purpose in one word each? If the answer was "no animation," stop there — that *is* the deliverable.
- Confirm only `transform`/`opacity` (or sanctioned `clip-path`/`height`) are animated.
- Confirm the easing and duration come from the tables (not invented), and UI durations are < 300ms (or justified).
- Confirm `prefers-reduced-motion` and (for hover) pointer gating are present.
- Confirm exit symmetry and interruption behavior (transitions or springs for rapidly-triggered elements).
- For a **review/audit** task, confirm [references/review-checklist.md](references/review-checklist.md) was applied and every finding cites a specific rule/value.