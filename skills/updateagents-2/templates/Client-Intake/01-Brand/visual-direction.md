# Visual Direction — {{CLIENT_BRAND_NAME}}

> Tied to the scaffolded design system. Source of truth for tokens is `./src/styles/tokens.css`.

## 1. Color System

- **OKLCH Palette**: `{{COLOR_PALETTE}}`
- **DTCG Tokens**: `./.agents/brand/tokens/colors.json`
- **CSS Tokens**: `./src/styles/tokens.css`
- **Rules**: wide-gamut OKLCH only; fluid `clamp()` typography and spacing; WCAG 2.2 AA contrast minimum.

## 2. Typography

| Role | Family | Notes |
| :--- | :--- | :--- |
| Display / Headlines | _To confirm_ | Client brand font or approved fallback |
| Body | _To confirm_ | Must support fluid sizing |
| Monospace | _To confirm_ | Code and tabular data |

## 3. Brand Assets

- **Asset Location**: {{BRAND_ASSETS}}
- **Figma / Design File**: {{FIGMA_URL}}
- **Required Formats**: SVG logo (light, dark, monochrome), favicon, app icon.

## 4. Motion & Interaction

- Scaffolded animation engine: `{{ANIMATION_DETAILS}}`
- Motion must respect `prefers-reduced-motion`.
- No scroll-jacking; no animation that blocks interaction.

## 5. Visual Guardrails

- No low-contrast text, unoptimized raster logos, or pixel-based fluid layouts.
- All copy stays in the content map (`.agents/brand/CONTENT_MAP.md`) — no hardcoded strings.
