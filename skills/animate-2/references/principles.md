# Animation Principles

Disney's 12 principles adapted to web/UI motion: easing, duration scales, and the motion vocabulary you use to name effects.

## When to load

Whenever animating, reviewing motion, naming an effect you can feel but not name, or auditing timing/easing quality.

## 1. The 12 Principles (web/UI)

| Principle | Web/UI meaning | Do | Don't |
|---|---|---|---|
| Squash & Stretch | Deform to show force/impact; preserve apparent volume | Press `scale(0.95, 1.05)`, bounce badges on update | Distort rigid UI to cartoon proportions; lose volume silently |
| Anticipation | Wind-up before the main action | Shrink a dropdown 2-3% before expanding; lift before press | Add pause that communicates nothing |
| Staging | One clear idea, reader never lost | Dim background on modal focus; animate the important element first | Two competing motions fighting for attention |
| Straight Ahead / Pose to Pose | Frame-by-frame vs key-pose-then-fill | CSS keyframes for predictable motion; JS/GSAP for dynamic/physics | Treat both as exclusive; combine for complex shots |
| Follow Through & Overlapping | Parts stop at different times | Stagger children 50-100ms; container enters first, content lags | Let every element stop simultaneously (robotic) |
| Slow In & Slow Out | Accelerate/decelerate; spacing not mechanical | ease-out to enter, ease-in to exit | `linear` for UI motion |
| Arc | Natural motion follows curves | Combine X + Y with different easings; arc dismissals | Straight-line motion without justification |
| Secondary Action | Supporting motion that enriches primary | Shadow grows on hover, icon rotates while button scales | Let it compete with the main action |
| Timing | Duration = weight, mood, meaning | Contrast fast/slow sections; micro 100-200ms, page 300-500ms | Uniform durations everywhere |
| Exaggeration | Push past reality so it reads | Hover scale 1.05-1.1 not 1.01; error shake 3-5px | Exaggerate so much it becomes jarring |
| Solid Drawing | 3D form, consistent volume, pivot | Consistent `transform-origin`; `perspective` for depth | Conflicting transforms; drifting pivots |
| Appeal | Compelling and intentional | 60fps smoothness; personality via custom easing | Decorative motion with no purpose |

## 2. Easing

| Name | cubic-bezier | Use when | Avoid |
|---|---|---|---|
| Ease-out | `cubic-bezier(0, 0, 0.2, 1)` | Entrances, hover, anything responding to the user | Entering with ease-in |
| Ease-in | `cubic-bezier(0.4, 0, 1, 1)` | Exits, dismissals, removals | Entrances (feels sluggish) |
| Ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements already on screen moving A-to-B | Micro feedback |
| Linear | `cubic-bezier(0, 0, 1, 1)` | Spinners, marquees, constant loops | UI state changes |
| Spring / back | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot settles (pop, toggle, badge) | Large elements; reduced-motion users |
| Asymmetric | custom | Feels alive; accelerate/decelerate differently | Symmetric curve when life is wanted |

Rules: entrances are ease-out (fast start, gentle landing); exits are ease-in (gentle start, accelerating departure). Exits run 20-30% shorter than entrances. Springs are physics (stiffness/damping/mass), not fixed duration — for bouncy micro-detail only.

> **Canonical strong tokens** (preferred over the built-in curves above for deliberate UI — built-ins are too weak): `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. See `SKILL.md` and `review-checklist.md` — these three are the source of truth; the built-in rows above are the conceptual baseline for exotic/scenic motion.

> **Additional tokens** (specialized, add only as used): `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — extreme-fast start, confident arrival (hero, dialog, toast); `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)` — strong deceleration for weighty entrances; `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — single slight overshoot (same as Spring/back row above, tokenized for reuse); MD3 `--ease-emphasized-decel: cubic-bezier(0.05, 0.7, 0.1, 1)` (emphasized enter) and `--ease-emphasized-accel: cubic-bezier(0.3, 0, 0.8, 0.15)` (emphasized exit) for high-emphasis component transitions.

## 3. Duration scale

| Tier | Range | Use for | Why |
|---|---|---|---|
| Micro | 80-200ms | Hover, press, focus ring, tooltip, checkbox, immediate feedback | Above ~200ms a small element feels sluggish; below 80ms it's imperceptible |
| Small | 200-400ms | Modals, cards, toasts, list items, dropdowns | Enough to read the change without stalling interaction |
| Large | 400-700ms | Hero reveals, complex sequences, dramatic transitions | Room to perceive weight, direction, and meaning |
| Page / route | 500-1000ms | Page transitions, route changes, full-screen reveals | Orientation across a context switch needs longer to process |

**Duration ladder tokens** (single source for timing vars): instant `50ms`, fast `100ms`, normal `200ms`, slow `350ms`, glacial `500ms`. Default to `normal` (200ms); `fast` for repeat/hover feedback, `slow`+`glacial` for one-time focal entrances, `instant` only for state flips that must feel immediate (checkbox, active step).

Frequency rule: the more often a user sees an animation, the shorter and subtler it should be. Respect `prefers-reduced-motion` (collapse to a short opacity fade or none).

## 3a. Spring presets

Springs are physics (`stiffness`, `damping`, `mass`), not fixed duration — use for bouncy micro-detail only.

| Name | Stiffness | Damping | Feel |
|---|---|---|---|
| Light | 300 | 30 | Subtle, quick settle (toggles, hover) |
| Bouncy | 500 | 25 | Energetic overshoot (badge, success pop) |
| Gentle | 200 | 40 | Soft, heavy settle (large panels, modals) |

Damping ratio classifies the motion: `ζ = damping / (2 · √(stiffness · mass))`. `ζ ≥ 1` = critical/overdamped (no overshoot — default for UI); `0 < ζ < 1` = underdamped (overshoots, then settles); `ζ = 0` = undamped (oscillates forever). Prefer critical for anything larger than a micro-element; reserve underdamped for bursts of delight. (Framer Motion: `type: "spring"` accepts `stiffness`/`damping`/`mass`; CSS has no true springs — the `back`-style cubic-bezier above only approximates one overshoot.)

## 4. Motion glossary (~20 terms)

| Term | Meaning |
|---|---|
| Ease-out | Starts fast, ends slow (UI default) |
| Ease-in | Starts slow, ends fast (exits) |
| Spring | Physics-driven motion via stiffness/damping/mass, not a fixed duration |
| Stagger | Items animate one after another with a delay, creating a cascade |
| Orchestration | Deliberately timing multiple animations as one coordinated motion |
| Keyframes / tween | Defined points (0/50/100%) the browser interpolates between |
| Fade in/out | Appear/disappear via opacity |
| Slide in | Enter by moving from off-screen |
| Scale in / pop in | Grow from small to full; pop adds overshoot (bounces into place) |
| Reveal | Uncover content gradually via clip-path or mask |
| Crossfade | One element fades out as another fades in, same spot |
| Morph | One shape smoothly becomes another (Dynamic Island) |
| Shared element transition | Element travels/transforms from one position into another |
| Layout animation | Element animates to a new size/position instead of snapping |
| Accordion / collapse | Section smoothly expands/collapses its height |
| Direction-aware transition | Content slides forward one way, backward the opposite way on back-nav |
| Scroll reveal | Elements fade/slide in as they enter the viewport |
| Scroll-driven animation | Progress tied directly to scroll position |
| Parallax | Foreground/background move at different speeds on scroll |
| Rubber-banding | Resistance + snap-back when dragging past a boundary (iOS overscroll) |
| Shake / wiggle | Quick side-to-side jitter signaling an error |
| Ripple | Circle expands from tap point to confirm a press |
| Line drawing | SVG path draws itself in |
| Skeleton / shimmer | Placeholder with moving sheen while content loads |

## 5. Entrance vs exit

**Entrances** — ease-out (`cubic-bezier(0, 0, 0.2, 1)`), fast start + gentle landing. Enter from user's attention (list items from top, modal from center, sidebar from its edge). Combine fade + scale/slide — never pure fade on a position change. Stagger children: `delay = index * 50ms`, cap the sequence at 500ms, never exceed 5 staggered items without user action.

```css
.entering { animation: entrance 250ms cubic-bezier(0, 0, 0.2, 1) forwards; }
@keyframes entrance {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Exits** — ease-in (`cubic-bezier(0.4, 0, 1, 1)`), gentle start + accelerating departure. Run 20-30% faster than the entrance (tooltip 100ms, modal 200ms, page 250ms). Content exits before container (text fades 50ms before the card collapses). Exit toward where the element "belongs" — deleted items fall, dismissed modals shrink to origin.

```css
.exiting { animation: exit 200ms cubic-bezier(0.4, 0, 1, 1) forwards; }
@keyframes exit {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-10px) scale(0.98); }
}
```

Remove from DOM only after the animation completes (use `animationend` or framework exit hooks). For collapse removal: fade content 150ms, collapse height 150ms starting at 100ms.

**Easing by context** — pick the curve from the *reason*, not the element: an exit is ease-in because it accelerates away from the user (they're done with it); an entrance is ease-out because it decelerates into rest. Same element can flip curves: a drawer enters ease-out (arrive) and exits with MD3 `emphasized-accel` (depart swiftly). Exit is always faster than its paired enter — never mirror durations.

## 6. Motion thesis

Before animating anything, state the thesis: *why this motion exists, what it communicates*. A thesis is one specific idea ("the card lifts off a surface to become a dialog") — not a generic effect. Generic fade-and-rise, hover-lift, and parallax are **not** theses; they're defaults applied without intent.

**Choose material by meaning** — the visual property you animate encodes the message:

| Meaning | Material | Technique |
|---|---|---|
| Continuity (that element is the same one) | Position/size | FLIP, shared-element transition, View Transitions API |
| Focus (draw the eye to one thing) | Blur/filter behind a bounded region | `backdrop-filter`, depth-of-field ring |
| Reveal (uncover new hierarchy) | Mask/clip | `clip-path`, mask, slide curtains |
| Energy (delight, momentum) | Color/gradient/shader | hue shift, gradient sweep, box-shadow bloom |

**Visitor mode** — budget motion by the visitor's intent. Persuade/Experience (marketing, onboarding): one focal sequence is allowed — a single 500–800ms entrance band that carries the whole thesis, everything else subordinate. Operate/Read (dashboards, docs, forms): fast routines only; motion is a 100–200ms instrument, and load-choreography (staggering skeleton → content reveals) never blocks a usable screen.

**No bounce/elastic by reflex** — back/elastic curves only when overshoot means something (a badge that "pops into place", a spring confirming release). Defaulting to bounce is a signal you skipped the thesis step.

## 7. Never-animate taxonomy

Some interactions are the user's *control surface*, not theater — animating them adds latency to raw input. Never animate: arrow-key navigation, keyboard shortcuts (their activation is instantaneous by definition), and tab / focus-ring movement. Frame-budget certainty beats a 100ms ease on things the keyboard drives.

## Gotchas

- Ease-in on an entrance feels broken; ease-out on an exit feels hesitant.
- Never `linear` for UI state changes — it reads mechanical/broken.
- Same easing preset on every channel kills life — vary X vs Y easing for arcs.
- Micro-interactions over 300ms feel sluggish; page transitions under 300ms feel abrupt.
- Frequent interactions must be shortest — a hero reveal gets 400ms, a hover gets 100ms.
- Follow-through requires stagger — everything stopping at once is the #1 "AI slop" tell.
- Missing `prefers-reduced-motion` breaks accessibility and can physically harm users.
- Pure opacity fades on moving elements look like errors; pair with directional motion.
- `will-change` is a hint, not a property to leave on — remove it after the animation.
- GSAP and native mobile motion are heavier tools: load them only on explicit request (see other refs).