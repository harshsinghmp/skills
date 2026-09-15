# 03 — Build a Functional Color System

Most bad color choices come from picking colors directly with a color picker without a systematic framework.

---

## 1. The Monochrome-First Workflow

Design the entire layout, spacing, typography, and contrast using **only grayscale/neutrals** first:
1. Pure White / Dark Surface Backgrounds
2. Subtle Card Surfaces
3. Muted Borders
4. Text Hierarchy (Foreground, Muted Foreground, Subtle)

Only once the interface functions perfectly in monochrome should you introduce color.

---

## 2. The 3 Essential Color Categories

### A. Neutrals (The Foundation ~80% of the UI)
A 9-step gray ramp (`50` to `900`/`950`).
- Tint your grays slightly with your brand hue (e.g., slate/cool gray for blue brands; zinc/warm gray for earthy brands).
- Avoid pure black `#000000` for text; use `#0f172a` (slate-900) or `#18181b` (zinc-900).

### B. Primary Brand Color (The Accent ~15% of the UI)
- 1 primary brand color used for primary interactive elements (CTAs, active navigation items, progress indicators).
- Create a 5-step tint/shade ramp for hover (`hover:bg-primary/90`), active, disabled, and focus-ring states.

### C. Semantic State Colors (~5% of the UI)
- **Success / Positive**: Green / Emerald (completed, active, growth).
- **Warning / Pending**: Amber / Yellow (attention needed, expiring).
- **Danger / Destructive**: Red / Crimson (error, delete, revoke).
- **Info**: Blue / Sky (neutral notices, tips).

---

## 3. Don't Rely on Color Alone for State
Always accompany color indicators with an icon or clear text label so color-blind users can distinguish states.
