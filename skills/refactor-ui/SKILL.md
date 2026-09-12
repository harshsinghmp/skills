---
name: refactor-ui
aliases: ["refactoring-ui","ui-polish","ui-audit","ui-review","ui-improve","ui-sweep"]
description: "Audit, polish, and refactor user interfaces using the 10 atomic design heuristics from Refactoring UI plus modern container-query, typography, and theming techniques. Six quick modes: review (default verdict with severity table), audit (scripted anti-pattern + WCAG 2.2 AA scan with scored report), improve (5-step refactor), sweep (multi-page consistency matrix), tokens (extract-and-centralize, pixels don't move), and polish (launch readiness with drift triage). Ships zero-dependency Bun scripts: audit-ui.ts anti-pattern scanner and check-contrast.ts WCAG contrast checker. Trigger on 'review this UI', 'audit UI contrast and spacing', 'refactor this component', 'make this dashboard consistent', 'extract design tokens', 'final polish before launch', or whenever reviewing frontend templates, JSX, CSS, or Tailwind layouts."
version: 1.1.2
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: design-interface
metadata:
  skill_orchestration:
    pre: ["designscope"]
    post: ["code-review"]
    optional: ["animate", "gauntlet-loop"]
  category: design-interface
  priority: 10
  aliases: ["refactoring-ui","ui-polish","ui-audit","ui-review","ui-improve","ui-sweep"]
  suggested_skills: ["designscope","gauntlet-loop","code-review","animate"]
  hermes:
    tags: [ui-design, refactoring-ui, tailwind, typography, color-palette, visual-hierarchy, accessibility, frontend, design-systems, 5-state-gate, wcag-2.2, container-queries, mode-router, ui-sweep, token-extraction]
    related_skills: [designscope, gauntlet-loop, code-review, animate]
    suggested_skills: [designscope, gauntlet-loop, code-review, animate]
    requires_tools: [view_file, replace_file_content, write_to_file, run_command]
  openclaw:
    category: design-interface
    suggested_skills: [designscope, gauntlet-loop, code-review, animate]
    primary_triggers: ["review this UI","audit UI contrast","refactor this component","make pages consistent","extract design tokens","final polish before launch"]
    requires_tools: [view_file, replace_file_content, write_to_file, run_command]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🪄 refactor-ui — Atomic UI Design & Interface Refactoring Engine

Systematically evaluate, refine, and refactor user interfaces using the 10 atomic
heuristics of Wathan & Schoger's *Refactoring UI*, extended with modern techniques
(container queries, WCAG 2.2, theming parity, z-scale discipline) distilled from a
127-source corpus of production UI skills. Design treated as deterministic,
engineering-grade visual decisions — routed through six execution modes so the
agent loads only what the task needs.

---

## When to Use

**Triggers** (mode chosen by phrase, default `review`):
- *"Review this UI / screen / component"* — verdict + severity table, no edits.
- *"Audit this UI for contrast, spacing, anti-patterns"* — scripted scan + scored report.
- *"Refactor this UI / make it look professional / improve this design"* — the 5-step refactor.
- *"Make all pages consistent / refactor the whole dashboard"* — multi-page sweep.
- *"Extract design tokens / too many grays / set up a type scale"* — rename-and-centralize.
- *"Final pass before launch / ship-readiness"* — polish triage.

**Anti-triggers:**
- Extracting tokens from a live URL or screenshot without refactoring existing code — use [`designscope`](../designscope/SKILL.md).
- Motion choreography, easings, entrance/exit sequences — use the `animate` skill (this skill owns only the static-cue rule).
- Backend logic, state architecture, or novel branding/illustration from scratch.

---

## Quick Reference

### Mode router (full contracts in `references/modes.md`)

| Mode | Scope | Writes | Blocking gate |
|:---|:---|:---|:---|
| **review** (default) | One component; verdict | Nothing | — |
| **audit** | One surface; scripted + heuristic scan | `.agents/artifacts/ui-audit-report-<ts>.md` | WCAG 2.2 AA failure = Block |
| **improve** | One surface; 5-step refactor | Component code | 5-state + contrast gates |
| **sweep** | Multi-page system | Code + `sweep-matrix-<ts>.md` | Consistency matrix |
| **tokens** | Styling layer | Token defs + call sites | Zero literals remain |
| **polish** | Whole path, all states | Narrow fixes | Zero P1 drift |

### The Atomic Heuristics

| # | Heuristic Domain | Core Problem Solved | Primary Tool / Technique |
| :--- | :--- | :--- | :--- |
| **01** | **Visual Hierarchy** | Everything competing for attention | Primary focal point + aggressive de-emphasis of secondary elements |
| **02** | **Typography Scale** | Inconsistent, uncalibrated font sizes | 6-tier scale with proportional line-heights and optical font weights |
| **03** | **Color Palette** | Garish, saturated, or arbitrary colors | 9-step neutrals + primary brand hue + functional status semantics |
| **04** | **Spacing Grid** | Arbitrary margins and cramped layouts | Fixed 4px/8px spacing ramp; generous component padding |
| **05** | **Button Hierarchy** | Competing CTAs of equal visual weight | Primary (Solid), Secondary (Ghost/Outline), Tertiary (Link/Minimal) |
| **06** | **Visual Clutter** | Border soup, redundant labels, noisy boxes | Surface contrast, directional spacing, removing self-evident labels |
| **07** | **Empty States** | Blank, lifeless screens that confuse users | Action-oriented onboarding, illustrative placeholder, direct CTA |
| **08** | **Shadows & Depth** | Flat cards, muddy dropshadows | Layered 2-part shadows; shadows = depth, borders = structure |
| **09** | **Color Contrast** | Low-contrast text failing accessibility | WCAG 2.2 AA (≥ 4.5:1 text, ≥ 3:1 UI/large) — blocking gate |
| **10** | **Grouping & Proximity** | Related items drifting apart | Inter-group gap ≥ 2× intra-group; space before surfaces before lines |
| **11** | **Anti-Slop 5-State Gate** | Happy-path only components break in prod | Explicit Empty, Loading, Error, Success, and Overflow state handling |

### v1.1.0 additions (details in `references/modern-techniques.md`)

Concentric radius law (`inner = outer − padding`) · optical alignment & icon-stroke
matching · container-aware responsive doctrine (components adapt to their container;
logical properties; safe areas) · modern typography mechanics (60–75ch measure,
line-height by role, size-specific tracking, tabular-nums, 16px mobile inputs) ·
named z-scale tokens (no raw 9999) · surface ladder via lightness steps in dark
mode · theme parity (verify light AND dark) · static-cue rule (motion routes to
`animate`).

---

## Procedure

The 5-step sequence below is the **improve** mode. Every other mode has its own
scoped procedure in `references/modes.md` — load only the mode you're running.

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ 1. Triage &     │ ──▶ │ 2. Structural &     │ ──▶ │ 3. Polish &      │ ──▶ │ 4. Verification &   │ ──▶ │ 5. Anti-Slop        │
│    Hierarchy    │     │    Spacing System   │     │    Visual Weight │     │    Contrast Oracle  │     │    5-State Coverage │
└─────────────────┘     └─────────────────────┘     └──────────────────┘     └─────────────────────┘     └─────────────────────┘
```

### Step 1 — Element Inventory & Hierarchy Triage
1. **Identify the Single Primary Focal Point**: the one action or data point that matters most in this viewport section.
2. **Assign Tiers (1 to 3)**: Tier 1 (key metric, main CTA, primary header) · Tier 2 (supporting text, inputs, table rows) · Tier 3 (timestamps, labels, breadcrumbs, hints).
3. **Execute De-emphasis**: tone down all Tier 3 elements before increasing the size of Tier 1.

### Step 2 — Spatial Grid & Whitespace Architecture
1. **Strip Border Soup**: delete interior 1px borders dividing cards, rows, sidebar items.
2. **Establish Proximity**: label↔input `gap-1.5` (4–6px) · between fields `gap-4` (16px) · between sections `gap-8`–`gap-12` (32–48px). Enforce the 2× grouping ratio.
3. **Increase Breathing Room**: cramped container → double inner padding (`p-3` → `p-6`).

### Step 3 — Typography, Color & Elevation Systematization
1. **Apply the stepped type scale** (page titles `text-2xl`–`text-3xl` bold/track-tight · section headers `text-lg`–`text-xl` semibold · body `text-sm`–`text-base` relaxed · metadata `text-xs` muted). Add the modern mechanics: measure cap, line-height by role, size-specific tracking.
2. **Standardize color tokens** (`text-foreground` → `text-muted-foreground` → `/70`); accent reserved for actionable targets.
3. **Natural elevation**: layered 2-part shadows, background surface shifts; concentric radius on nested elements; named z-scale.

### Step 4 — Verification & Contrast Oracle
1. Run the mechanical receipts: `bun refactor-ui/scripts/audit-ui.ts <paths>` then `bun refactor-ui/scripts/check-contrast.ts <fg> <bg>` for every rendered text pair (normal + large). Paste outputs.
2. Verify WCAG 2.2 AA (≥4.5:1 normal text, ≥3:1 large text/UI components). A failure blocks completion.
3. Theme parity: re-check the surface in light AND dark.

### Step 5 — The 5-State Anti-Slop Coverage Gate
1. **Empty**: dataset empty → soft icon, explanation, direct CTA.
2. **Loading**: pulse skeleton matching geometry (`animate-pulse bg-muted`) to kill CLS.
3. **Error**: inline non-blocking banner with human diagnosis + Retry.
4. **Success**: immediate confirmation (toast, badge, transient check).
5. **Overflow**: `min-w-0` on flex items, `truncate` + `title`, `line-clamp-2/3`, responsive wrapping.

---

## Pitfalls

- **Happy-Path Blindness**: shipping against mock data that is always present, short, and error-free.
- **Invisible Focus Rings**: `outline-none` without a `focus-visible:ring-2` alternative — keyboard navigation must stay visible.
- **Mismatched Nested Radii**: the most common "feels off" cause — apply the concentric law.
- **Viewport-Breakpoint Reflex**: reaching for `md:` when the component should adapt to its container.
- **Raw z-Index Values**: `z-[9999]` leaks stacking across surfaces; use the named scale.
- **Relying Exclusively on Font Size for Hierarchy**: weight and muted color create contrast without size bloat.
- **Centering Everything**: left-align text by default; centered body copy reads amateur.
- **Pure Black on Pure White**: harsh optical vibration — use deep slate/zinc neutrals.
- **Icons Without Optical Balance**: size icons down 1 step and match stroke to text weight.
- **Burying Actions in Low-Contrast Grays**: never fail WCAG AA for aesthetics.
- **Smuggled Redesigns**: polish mode refines; it never conceals a redesign — say "recommend redesign" instead.
- **Unsupported Findings**: search hits are candidates; without Contract + Runtime + Correction proof, discard them.

---

## Verification

Before signing off any mode:

- [ ] **Mode contract honored**: only the mode's reads/writes performed.
- [ ] **Script receipts pasted**: `audit-ui.ts` and `check-contrast.ts` outputs included when audit/improve ran.
- [ ] **WCAG 2.2 AA**: all rendered text/UI pairs pass — blocking gate.
- [ ] **5-State Anti-Slop Coverage**: Empty, Loading, Error, Success, Overflow implemented and verified.
- [ ] **Theme parity**: surface verified in light and dark mode.
- [ ] **Responsive proof**: container/smallest/largest checks (or `Not verified` declared).
- [ ] **Visible Focus Rings**: all interactive controls have `focus-visible` states.
- [ ] **Squint Test Passed**: primary action unmistakable when blurred.
- [ ] **Zero Arbitrary Values**: spacing/sizes map 1:1 to scale tokens.
- [ ] **Single Primary Action** per section; proximity law upheld; no border overload.
- [ ] **Honest verdict**: Block if any HIGH or AA failure remains; unrun checks listed as `Not verified`.

---

## 📚 Disclosed Reference Guides

Mode contracts and the research additions live in `references/` — load only
what the running mode needs:

- [modes.md](references/modes.md) — router table, per-mode procedures, report format, cross-skill routing.
- [modern-techniques.md](references/modern-techniques.md) — v1.1.0 corpus-derived rules composing with the heuristics.
- [01-visual-hierarchy.md](references/01-visual-hierarchy.md) — Sizing, optical weight, and focal points.
- [02-typography-scale.md](references/02-typography-scale.md) — Modular type scales and line-height ratios.
- [03-color-palette.md](references/03-color-palette.md) — Neutrals, primary brand, and semantic state hues.
- [04-spacing-layout.md](references/04-spacing-layout.md) — 4px/8px spatial rhythm and component layouts.
- [05-button-hierarchy.md](references/05-button-hierarchy.md) — Primary, secondary, tertiary, and destructive button patterns.
- [06-visual-clutter.md](references/06-visual-clutter.md) — Eliminating border soup, redundant labels, and visual noise.
- [07-empty-states.md](references/07-empty-states.md) — High-value empty states, onboarding patterns, and action CTAs.
- [08-shadows-elevation.md](references/08-shadows-elevation.md) — Directional lighting, layered shadows, and elevation systems.
- [09-contrast-accessibility.md](references/09-contrast-accessibility.md) — WCAG contrast formulas and accessible color pairing.
- [10-grouping-alignment.md](references/10-grouping-alignment.md) — Gestalt proximity, alignment grids, and optical balancing.
- [11-five-state-anti-slop.md](references/11-five-state-anti-slop.md) — Mandatory 5-state lifecycle coverage and anti-slop patterns.

---

## 📜 Attribution & Licensing

- **Original Principles & Methodology**: Derived from the landmark design book [*Refactoring UI*](https://refactoringui.com/) by **Adam Wathan** and **Steve Schoger** (© Tailwind Labs Inc.). All conceptual design principles belong to the original authors.
- **v1.1.0 Modern-techniques layer**: Clean-room synthesis from public agent-skill corpus research (container queries, WCAG 2.2, theming, z-scale discipline); independent formulation, no source text reproduced.
- **Skill Formulation & Architecture**: Engineered by **Harsh Singh** for the **Muse Skills** open-source ecosystem.
- **Inspiration**: Acknowledgment to **George Nurijanian** (`gnurio/refactoring-ui-plugin`) for the initial concept of packaging Refactoring UI rules for agent runtimes.
- **License**: MIT License. Compatible with all autonomous agent runtimes.
