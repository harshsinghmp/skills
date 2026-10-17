# Layout Tree Extraction Reference

> Guide for decomposing visual UI screenshots, website captures, and Figma mockups into responsive CSS Grid and Flexbox component layout trees with token-grounded hierarchy.

---

## 1. Visual-to-Code Decomposition Pipeline

Extracting a layout tree converts a 2D visual composition into a structured, responsive box-model hierarchy that frontend engineers and AI code builders (e.g. Cursor, v0, Lovable) can implement directly without guessing.

```
┌─────────────────────────────────────────────────────────────┐
│ Visual Input (Screenshot / Live Web Viewport / Figma Frame) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Semantic Container Deconstruction                  │
│ • Identify macro regions: Header, Hero, Bento, Content, Foot│
│ • Establish max-width bounds and gutter constraints         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Responsive Box-Model Specification                 │
│ • Classify layout mechanics: CSS Grid vs Flexbox            │
│ • Define flow directions, alignment, and template columns   │
│ • Map breakpoint collapse rules (Mobile → Tablet → Desktop) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Token Hierarchy Grounding                          │
│ • Bind typography scale ({typography.h1}, {typography.body})│
│ • Bind spacing scale ({spacing.4}, {spacing.8}) & radii     │
│ • Bind surfaces, borders, and elevation tiers               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1 — Semantic Container Blocks

Analyze the viewport from top to bottom and segment into five canonical macro-blocks:

### 1. Header / Navigation Bar
- **HTML Element**: `<header role="banner">`
- **Container Structure**: Full-width wrapper with inner constrained container (`max-w-[1280px] mx-auto`).
- **Layout Mechanics**: `display: flex; flex-direction: row; justify-content: space-between; align-items: center;`
- **Observed Behavior**: Sticky / fixed positioning, backdrop-blur (`backdrop-blur-md bg-white/80`), border-bottom separator.

### 2. Hero Section
- **HTML Element**: `<section aria-label="Hero">`
- **Archetype Variations**:
  - *Centered Single-Column*: Eyebrow badge $\rightarrow$ Display headline $\rightarrow$ Sub-headline paragraph $\rightarrow$ CTA button group $\rightarrow$ Product mockup / visual asset.
  - *Split 2-Column*: Left column (typography & CTAs) + Right column (interactive preview, 3D canvas, or hero image).
- **Layout Mechanics**: Flex column centered (`items-center text-center`) or 2-column Grid (`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`).
- **Min-Height**: Often `min-h-[80vh]` or `py-20 lg:py-32`.

### 3. Feature & Bento Grid Matrix
- **HTML Element**: `<section aria-label="Features">`
- **Archetype Variations**:
  - *Symmetric Grid*: 3-column equal cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - *Asymmetric Bento Box*: 12-column grid with varied column and row spans (`col-span-8`, `col-span-4`, `row-span-2`).
- **Layout Mechanics**: CSS Grid with explicit auto-fill / auto-fit or defined template tracks.
- **Card Primitives**: Surface background (`{colors.surface-elevated}`), border (`{colors.border}`), rounded corners (`{rounded.xl}`), internal flex layout.

### 4. Content Showcase / Alternating Bands
- **HTML Element**: `<section aria-label="Showcase">`
- **Archetype Variations**:
  - *Alternating Feature Rows*: Text left / Image right alternating with Text right / Image left.
  - *Stats / Social Proof Band*: Horizontal row with metric cards.
- **Layout Mechanics**: Flex row on desktop (`lg:flex-row`), flex column on mobile (`flex-col`), optional `lg:flex-row-reverse`.

### 5. Footer Matrix
- **HTML Element**: `<footer role="contentinfo">`
- **Container Structure**: Multi-column link grid with top divider and bottom legal bar.
- **Layout Mechanics**:
  - Top Tier: 4–5 column grid (`grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8`).
  - Bottom Tier: Flex row between copyright and social links (`flex flex-col sm:flex-row justify-between items-center`).

---

## 3. Phase 2 — Responsive CSS Grid & Flexbox Specs

For each identified container, document its exact CSS box-model specification across responsive tiers:

| Parameter | CSS Specification Syntax | Example Value |
| :--- | :--- | :--- |
| **Container Width** | `max-w-[N] mx-auto px-[N]` | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| **Layout Mode** | `display: grid` \| `display: flex` | `display: grid` |
| **Grid Template** | `grid-template-columns` | `repeat(12, minmax(0, 1fr))` or `repeat(3, 1fr)` |
| **Flex Direction** | `flex-direction` | `flex-col sm:flex-row` |
| **Justify / Align** | `justify-content` / `align-items` | `justify-between items-center` |
| **Gap Rhythm** | `gap: {spacing.N}` | `gap-6 lg:gap-8` (`24px` to `32px`) |
| **Breakpoint Collapse**| Breakpoint transitions | Mobile `<640px` (1-col) $\rightarrow$ Tablet `640–1023px` (2-col) $\rightarrow$ Desktop `≥1024px` (3-col) |

---

## 4. Phase 3 — Visual Hierarchy & Token Mapping

Connect each structural element directly to the extracted design tokens:

```markdown
- Container: {colors.surface} with max-w-[1280px]
  ├── Section Title: {typography.h2} ({colors.text-primary}, tracking -0.02em)
  ├── Section Subtitle: {typography.body} ({colors.text-muted}, max-w-2xl)
  └── Bento Grid: CSS Grid gap {spacing.6}
      ├── Card 1 (Span 8): {colors.surface-elevated}, radius {rounded.xl}, border {colors.border}
      │   ├── Badge: {typography.caption} with pill radius {rounded.full}
      │   └── Headline: {typography.h3}
      └── Card 2 (Span 4): {colors.surface-elevated}, radius {rounded.xl}, border {colors.border}
```

---

## 5. Standard Component Layout Tree Representation

In `design.md` (under Section 4.5), output the layout tree in this standardized ASCII format:

```text
[Page: Landing]
├── <header> (Sticky, h-16, flex row, justify-between, items-center, border-b {colors.border})
│   ├── Logo (w-32, flex items-center)
│   ├── NavLinks (desktop: flex row gap-8; mobile: hidden/drawer)
│   └── Actions (flex row gap-3: [SearchButton], [CTAButton])
├── <main> (flex col gap-24 py-12)
│   ├── <section: Hero> (min-h-[85vh], grid 1-col lg:grid-cols-2 gap-12, items-center)
│   │   ├── LeftColumn (flex col gap-6, text-left)
│   │   │   ├── EyebrowBadge ({typography.caption}, pill, border {colors.border})
│   │   │   ├── Title ({typography.display}, 64px/1.1, weight 600, {colors.text-primary})
│   │   │   ├── Subtitle ({typography.body}, 18px/1.6, {colors.text-muted})
│   │   │   └── ActionGroup (flex row gap-4)
│   │   │       ├── PrimaryCTA (h-12, px-6, {colors.primary}, {rounded.md})
│   │   │       └── SecondaryCTA (h-12, px-6, border {colors.border}, {rounded.md})
│   │   └── RightColumn (relative, aspect-[4/3], rounded-2xl, overflow-hidden)
│   │       └── ProductPreviewCanvas (mockup with elevation-level-2)
│   ├── <section: BentoGrid> (grid 12-cols gap-6, max-w-7xl)
│   │   ├── BentoCardA (col-span-12 lg:col-span-8, p-8, {colors.surface-elevated})
│   │   ├── BentoCardB (col-span-12 lg:col-span-4, p-8, {colors.surface-elevated})
│   │   └── BentoCardC (col-span-12 lg:col-span-12, p-8, {colors.surface-elevated})
│   └── <section: AlternatingFeatures> (flex col gap-16)
│       ├── FeatureRow1 (flex col lg:flex-row gap-12, items-center)
│       └── FeatureRow2 (flex col lg:flex-row-reverse gap-12, items-center)
└── <footer> (border-t {colors.border}, pt-16 pb-8, bg {colors.surface})
    ├── LinkMatrix (grid grid-cols-2 md:grid-cols-4 gap-8)
    └── LegalBar (mt-12 pt-6 border-t {colors.border}, flex row justify-between)
```
