# 01 — Establish Visual Hierarchy

Visual hierarchy is the order in which a user's eye processes information on a screen. When every element shouts for attention, nothing gets heard.

---

## Core Principles

### 1. Sizing Isn't Everything
Beginners try to create hierarchy entirely through font size. This leads to massive headers and tiny metadata.
Instead, use a combination of:
- **Font Weight**: Bold headers, medium labels, normal body text.
- **Color Contrast**: Dark/high-contrast primary text, muted secondary text, faint tertiary metadata.
- **Whitespace**: Surrounding an element with empty space draws focus without increasing font size.

### 2. De-emphasize to Emphasize
When an element isn't standing out enough, do not immediately make it bigger or brighter.
First, **soften the elements around it**:
- Reduce the opacity or contrast of secondary text (`text-muted-foreground`).
- Remove borders or bounding boxes surrounding the primary element.
- Dim background colors or subtle borders on adjacent items.

### 3. The Squint Test
Step back and blur your vision (or apply `filter: blur(4px)` in DevTools).
- Does the single most important action/data point stand out immediately?
- If multiple elements scream equally, demote all but one.

---

## Hierarchy Mapping Matrix

| Hierarchy Tier | Target Elements | Visual Treatment |
| :--- | :--- | :--- |
| **Tier 1 (Primary)** | Page title, primary metric, main CTA button | Heavy font weight (`font-bold`), highest color contrast, prominent positioning |
| **Tier 2 (Secondary)** | Section headers, card titles, table row primaries, secondary buttons | Medium font weight (`font-semibold`), standard contrast, subtle background or border |
| **Tier 3 (Tertiary)** | Field labels, timestamps, metadata, helper text, breadcrumbs | Normal/medium weight, muted color (`text-muted-foreground`), smaller scale (`text-xs`/`text-sm`) |
