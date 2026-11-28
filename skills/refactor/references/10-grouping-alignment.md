# 10 — Grouping, Proximity, and Alignment

The brain naturally perceives elements that are close together as belonging to the same group (Gestalt Law of Proximity).

---

## 1. The Proximity Rule

**Spacing inside a component must always be strictly smaller than spacing between distinct components.**

Example in a form:
```
[Field Label]
     │ (4px gap: space-1)
[Input Box]
     │
     │ (24px gap: space-6)
     ▼
[Next Field Label]
     │ (4px gap: space-1)
[Next Input Box]
```
If the gap between the Input Box and the Next Field Label is only 4px or 8px, the user cannot visually tell which label belongs to which input.

---

## 2. Alignment Conventions

- **Left-Align Text**: Always left-align paragraphs, descriptions, and labels. Center alignment should only be used for small badges, hero titles, or empty states.
- **Right-Align Numerical Data**: In tables and financial lists, right-align numbers so decimals and digits align vertically for easy comparison.
- **Align Icons Optically**: Icons with uneven bounding boxes (like play triangles) need optical centering rather than geometric bounding-box centering.
