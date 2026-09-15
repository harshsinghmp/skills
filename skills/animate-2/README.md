# animate Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)

Design and implement web UI motion that survives strict design-engineering review on the first pass: library selection, easing/timing, and correct code for entrances, exits, micro-interactions, scroll, page transitions, hover/press states, and layout shifts.

---

## What is this?

A **router + build sequence** for animation. It decides *whether* to animate, *why*, *which tool*, then writes defensible code. Two principles anchor it:

1. **The correct answer is sometimes zero animation.** Keyboard shortcuts and 100×/day actions should not animate.
2. **Animate only `transform` and `opacity`** (plus sanctioned `clip-path`, and `height` for accordions) — they skip layout/paint and run on the GPU.

Grounded in the Emil Kowalski design-engineering bar (animations.dev): strong custom easing tokens, sub-300ms UI durations, springs for gestures, symmetric exits, reduced-motion shipped by default.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill animate
```

---

## 🚀 Usage & Triggers

```bash
# Natural language
"animate this"
"add motion to the dropdown"
"make the card list stagger in"
"add a scroll reveal"
"build a page transition"
"this hover feels sluggish — fix the easing"
"review the animation in this diff"
```

---

## 🎯 Library Defaults

| Task | Default library | Reference |
|---|---|---|
| React motion: springs, layout, exits, gestures | **Motion** (`motion.dev`) | `references/motion-dev.md` |
| Quick fix: hover/press/color/state toggle | **CSS** transition/keyframes | `references/css-animations.md` |
| JS control without a dependency | **WAAPI** (`element.animate()`) | `references/css-animations.md` |
| Timeline choreography, scroll pinning, SVG morph | **GSAP** (explicit ask only) | `references/gsap.md` |
| Designer-authored vector / state machines | **Lottie / Rive** | `references/other-libraries.md` |
| Native mobile (Reanimated/SwiftUI/Compose/Flutter) | (explicit ask only) | `references/mobile.md` |

**Recommendation:** Motion for React motion beyond a trivial toggle; CSS for quick fixes; WAAPI when you need JS control with no dependency. GSAP only when you need timeline/ScrollTrigger that Motion/CSS can't express cleanly.

---

## 📋 The Build Sequence

1. **Should it animate?** Frequency gate — 100×/day = never; tens/day = near-imperceptible; occasional = standard; rare = delight.
2. **What's the purpose?** One word: feedback · spatial consistency · state indication · preventing jarring change · explanation · delight.
3. **Pick the tool** — cheapest that fits.
4. **Pick properties** — `transform` + `opacity` only.
5. **Easing + duration** — from the canonical tables (strong curves, sub-300ms).
6. **Interruption + exit** — transitions for rapid triggers, springs for gestures, symmetric exit.
7. **Reduced motion + pointer gating** — ships with it, every time.

---

## 📚 References (segregated — load only what's needed)

| Reference | Load when |
|---|---|
| `principles.md` | Grounding the 12 principles, easing/physics, motion vocabulary |
| `motion-dev.md` | Motion / Framer Motion implementation |
| `css-animations.md` | CSS transitions/keyframes/@property/scroll-driven/WAAPI/View Transitions |
| `performance.md` | Jank, 60fps, compositor-only properties, LCP/CLS |
| `accessibility.md` | `prefers-reduced-motion`, vestibular safety |
| `review-checklist.md` | Reviewing or auditing motion quality |
| `gsap.md` | GSAP + ScrollTrigger (explicit ask only) |
| `mobile.md` | Reanimated / SwiftUI / Compose / Flutter (explicit ask only) |
| `other-libraries.md` | Anime.js, Lottie, Rive, SVG, Three.js |

---

## 📄 Examples

- [Micro-interaction: dropdown + toast](examples/micro-interaction.md) — the full decision + code for a common request.