# 08 — Shadows and Elevation

Shadows simulate light and depth in a digital interface, signaling to the user what elements sit closer to them (and are often interactive).

---

## 1. The Virtual Light Source Rule

- Light in digital UI always originates from the **top** (slightly offset vertically down on the Y-axis).
- The `Y` offset should always be positive (e.g., `0 2px 4px ...` or `0 10px 15px ...`).
- Never use a symmetrical shadow (`0 0 10px rgba(0,0,0,0.5)`) unless simulating an intentional glowing neon aura.

---

## 2. Multi-Layered Natural Shadows

Single harsh shadows look muddy and fake. Combine an **ambient contact shadow** with a **directional elevation shadow**:

```css
/* Card / Small Elevation */
box-shadow: 
  0 1px 2px 0 rgba(0, 0, 0, 0.05),     /* Directional key light */
  0 1px 3px 0 rgba(0, 0, 0, 0.04);     /* Ambient occlusion */

/* Dropdown / Modal / High Elevation */
box-shadow: 
  0 10px 15px -3px rgba(0, 0, 0, 0.08), /* Directional drop */
  0 4px 6px -4px rgba(0, 0, 0, 0.04);   /* Ambient soft spread */
```

---

## 3. Elevation Levels

| Level | Component | Shadow Style |
| :--- | :--- | :--- |
| **Flat (0dp)** | Canvas background | None |
| **Raised (1dp)** | Cards, input fields | `shadow-sm` or subtle 1px border |
| **Floating (2dp)** | Dropdown menus, tooltips | `shadow-md` |
| **Overlay (3dp)** | Modals, dialogs, drawers | `shadow-xl` or `shadow-2xl` + backdrop blur |
