# 🖼️ Visual Identity & Art Direction — {{PROJECT_NAME}}

> **Operating Directive**: This guide establishes visual consistency across all digital interfaces, marketing graphics, pitch decks, and brand assets.

---

## 1. Logo Guidelines & Clear Space

- **Primary Mark**: High-contrast vector mark optimized for dark (`#0f172a` / `#000000`) and light backgrounds.
- **Minimum Clear Space**: Maintain clear space equal to the height of the primary emblem (`1X`) on all four sides. No UI elements, text, or page borders may encroach on this zone.
- **Minimum Dimensions**:
  - Digital Display: Minimum `24px` height for mark only; minimum `32px` height for mark + logotype.
  - Favicon / App Icon: Crisp at `16x16`, `32x32`, and `512x512` vector SVG.
- **Prohibited Modifications**:
  - ❌ Do not rotate, skew, or stretch the logo.
  - ❌ Do not apply heavy drop shadows, outer glows, or artificial bevels.
  - ❌ Do not alter the relative scale between mark and logotype.

---

## 2. Color System Integration

All colors are defined strictly in W3C DTCG format under `./.agents/brand/tokens/colors.json` and rendered via OKLCH:

- **Surface / Background**: Deep neutral dark tones or crisp stark light tones with deliberate contrast ratios.
- **Primary Brand Color**: Evaluated for minimum `4.5:1` WCAG AA contrast against default background.
- **Accent & Interactive**: High-chroma OKLCH accents for primary CTAs and active interactive states.
- **Functional States**: Success (Emerald/Green), Warning (Amber), Error (Rose/Red), Info (Sky/Blue).

---

## 3. Imagery & Art Direction

- **Photography Style**:
  - Real, authentic, and candid imagery showing real humans or architectural focus.
  - High directional contrast and natural lighting.
  - ❌ Strictly prohibit generic, smiling stock photos or cliché corporate handshake imagery.
- **Graphic Illustrations**:
  - Clean geometric SVG vectors, monoline wireframes, or high-density technical schematics.
  - Palette matches the brand tokens strictly.
- **Software Screenshots & UI Previews**:
  - Embedded inside clean browser chrome frames with crisp typography and subtle ambient shadows (`box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3)`).

---

## 4. Iconography Standards

- **Standard Library**: Lucide Icons or Tabler Icons (clean, modern open-source glyphs).
- **Stroke Width**: `1.75px` to `2.0px` consistent across all components.
- **Corner Curvature**: Softly rounded joins and line caps (`stroke-linejoin: round; stroke-linecap: round;`).
- **Sizing Grid**: Standard icon sizes restricted to `16px` (sm), `20px` (md), `24px` (lg), and `32px` (xl).
