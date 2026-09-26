# Modern Techniques — v1.1.0 additions from corpus research

Distilled from 127 deduplicated agent-skill sources (2026-09); the parts the
classic Refactoring UI baseline doesn't cover. These compose with, never
replace, the 11 atomic heuristics in SKILL.md.

## 1. Concentric radius law

`inner radius = outer radius − padding`

Mismatched nested radii is the single most-cited "feels off" cause in the
research corpus. A card with `rounded-xl` (12px) and `p-4` (16px) padding
should contain `rounded` (4px) children — not `rounded-xl` buttons.

## 2. Grouping ratio

Space groups first, surface shifts second, separator lines last — and only
where space alone can't carry the structure.

**The ratio: inter-group gap ≥ 2 × intra-group gap** (e.g. 8px inside a
group → ≥16px between groups). If the ratio collapses, grouping reads as
noise no matter how many boxes you draw.

## 3. Optical alignment & icon stroke

- Geometric centering is wrong for asymmetric glyphs. Nudge play triangles,
  icons beside text, and visually-heavy shapes by eye.
- Icon stroke carries the adjacent text's optical weight: **1.5px stroke
  beside regular (400) text, 2px beside semibold (600)**. One stroke weight
  per icon set; outline variant by default, fill for active state.
- Icons recolor via `currentColor` — never per-state asset variants.

## 4. Container-aware responsive doctrine

- **Components respond to the space they're in, not the viewport.** Default
  to container queries (`@container` variants in Tailwind v4) for anything
  reused in different layouts (cards, sidebars, panels). Viewport
  breakpoints are the exception — for page-level structure only.
- **Breakpoints come from content, not device presets.** Collapse late;
  test smallest and largest containers first.
- **Logical properties for anything localizable**: `padding-inline-start`
  not `padding-left`; `margin-inline-end` not `margin-right`. Reserve
  physical directions for genuinely physical geometry.
- **Content bleeds, controls float**: media/backgrounds may touch edges;
  interactive controls stay inside layout margins and safe-area insets
  (`env(safe-area-inset-*)`).
- Verify at 200% zoom and the RTL mirror, or report the check `Not verified`.

## 5. Modern typography mechanics

| Rule | Value |
|:---|:---|
| Measure (long-form) | 60–75 characters per line, capped |
| Line-height by role | ~1.1 headings · 1.5–1.6 body · **≥1.4 on anything wrapping to 3+ lines** |
| Tracking by size | Negative on large display text; slightly positive on small uppercase labels; ~0 on body |
| Weight floor | ≥400 below 18px; sub-300 weights are display-only at 28px+ |
| Mobile inputs | 16px — smaller triggers iOS Safari page zoom |
| Changing values | `font-variant-numeric: tabular-nums` on timers, counters, prices |
| Wrapping | `text-wrap: balance` on headings · `pretty` on descriptions · `overflow-wrap: break-word` where IDs/URLs could escape |
| Properties first | `font-weight: 650` not `font-variation-settings`; raw feature tags only for custom axes |
| Copy | Natural case in source + `text-transform` for presentation; sentence case for UI labels |
| Truncation | `truncate`/`line-clamp` when space is tight; truncated content that matters stays reachable (tooltip/expand) |

## 6. Depth & layering system

- **Shadows show depth; borders show structure.** A border that exists only
  for depth should be a layered transparent shadow instead.
- **Named z-scale tokens, never raw values** (`z-top-nav`, `z-panel-content`,
  `z-drawer-content`). No `z-[9999]`. Wrap internally-layered widgets in
  `isolation: isolate` so their stacking doesn't leak into the page.
- **Surface ladder**: in dark mode, raise surfaces with small lightness steps
  (+7% → +9% → +12% per level); in light mode, keep surfaces light and add
  shadow. One consistent method per theme.
- **Image outline**: 1px neutral at low opacity for consistent depth —
  pure black in light (`oklch(0 0 0 / 0.1)`), pure white in dark. Never a
  tinted near-neutral; it reads as dirt on the image edge.

## 7. Theme parity

- The page has **one theme**; sections never invert.
- Verify logos, icons, charts, and focus rings in **both light and dark** —
  each needs a rendering strategy that survives the other mode.
- Prefer semantic tokens (`text-foreground`, `bg-muted`) over literal values
  so parity is structural, not per-rule. OKLCH is the preferred space for
  new palettes (perceptual steps, gamut-safe interpolation).

## 8. Motion boundary (static cue rule)

Every state change needs a **static cue** — color, icon, or label. Motion is
never the only feedback channel. refactor-ui owns this rule and static press
feedback (`scale(0.96)` on `:active`); all easing curves, entrance/exit
choreography, and stagger decisions belong to the `animate` skill. Route,
don't improvise.

## 9. Card & micro-UI restraint

- A card must earn its container: background color **or** border **or**
  spacing — not all three at once. No cards inside cards inside cards.
- Strip micro-chrome that carries no decision: pill tags, stub badges,
  system-marker labels. If removing it changes nothing the user can act
  on, it ships removed.

## 10. Interaction & platform gap-fill (review oracle)

Checklist items the 11 heuristics don't cover. Flag in `audit`/`review`
with the same Contract + Runtime + Correction proof gate — no new modes,
no new scripts.

- **Forms**: inputs carry `autocomplete` + meaningful `name`; correct
  `type` (`email`, `tel`, `url`, `number`) and `inputmode`; never block
  paste (`onPaste` + `preventDefault`); labels clickable (`htmlFor` or
  wrapping); `spellCheck={false}` on emails, codes, usernames; checkbox /
  radio label + control share one hit target (no dead zones); submit
  stays enabled until the request starts with a spinner during it;
  errors inline next to fields with focus moved to the first error on
  submit; placeholders end with `…` and show an example pattern;
  `autocomplete="off"` on non-auth fields; warn before navigation with
  unsaved changes (`beforeunload` or router guard).
- **Touch**: `touch-action: manipulation`; `-webkit-tap-highlight-color`
  set intentionally; `overscroll-behavior: contain` in modals / drawers /
  sheets; during drag disable text selection and set `inert` on dragged
  elements; every drag / swipe / pinch / path gesture ships a tap-or-click
  plus keyboard alternative unless the gesture is essential; `autoFocus`
  sparingly — desktop only, single primary input, never on mobile.
- **Navigation & state**: URL reflects state (filters, tabs, pagination,
  expanded panels in query params); stateful UI is deep-linkable (a
  `useState` that matters syncs to URL via nuqs or similar); destructive
  actions need a confirmation modal or an undo window — never immediate.
- **Locale & i18n**: dates via `Intl.DateTimeFormat`, numbers / currency
  via `Intl.NumberFormat` — never hardcoded formats; language from
  `Accept-Language` / `navigator.languages`, not IP; brand names, code
  tokens, identifiers wrapped with `translate="no"`.
- **Hydration safety**: inputs with `value` need `onChange` (else
  `defaultValue`); date / time rendering guards server-vs-client
  mismatch; `suppressHydrationWarning` only where truly needed.
- **Images**: explicit `width` + `height` (no CLS); below-fold
  `loading="lazy"`; above-fold critical images `priority` /
  `fetchpriority="high"`.
- **Dark-mode concrete checks**: `color-scheme: dark` on `<html>` for
  dark themes; `<meta name="theme-color">` matching page background;
  native `<select>` gets explicit `background-color` + `color`.
- **Focus extras**: `:focus-visible` over `:focus`; `:focus-within` for
  compound-control groups; sticky headers / footers / overlays must not
  cover the focused element.
- **Typography extras**: non-breaking spaces in `10&nbsp;MB`,
  `⌘&nbsp;K`, brand names; loading states end with `…` (`Loading…`).
- **Copy specifics**: numerals for counts (`8 deployments`); button
  labels name the action (`Save API Key`, not `Continue`); second
  person, `&` only where space-constrained.
- **Blocking bans**: never `user-scalable=no` / `maximum-scale=1`
  (kills zoom); never `transition: all` (list properties); never
  `<div>` / `<span>` with click handlers (use `<button>`); never inline
  `onClick` navigation without `<a>` / `<Link>`.
- **Perf flags (route the fix to `webdev`)**: lists >50 items
  virtualized (`virtua`, `content-visibility: auto`); no layout reads
  (`getBoundingClientRect`, `offsetHeight`, `scrollTop`) in render —
  batch reads / writes; `<link rel="preconnect">` for CDN domains,
  critical fonts preloaded with `font-display: swap`; compressed video
  over animated GIF with a still alternative.

## Sources

- `vercel-labs/agent-skills` (`skills/web-design-guidelines/SKILL.md` →
  `vercel-labs/web-interface-guidelines`, `command.md`) — 100+ rule
  review oracle, 11 categories. Imported above are the checklist items
  the buyer baseline (11 heuristics + §§1–9 + scripted audit + WCAG
  blocking gate) does not already cover; hierarchy, spacing, buttons,
  clutter, empty / overflow states, shadows, contrast, grouping, theme
  parity, safe areas, truncation, and animation routing stay as-is.
