# 09 — Color Contrast and Accessibility

Design must be usable for all people, across varied monitors, sunlight conditions, and visual capabilities.

---

## 1. The WCAG 2.1 Contrast Standards

| Text Type | WCAG Level AA (Mandatory) | WCAG Level AAA (Enhanced) |
| :--- | :--- | :--- |
| **Normal Body Text** (<18pt / <24px normal, or <14pt / <18.5px bold) | **4.5 : 1** | **7.0 : 1** |
| **Large Text** (≥18pt / ≥24px normal, or ≥14pt / ≥18.5px bold) | **3.0 : 1** | **4.5 : 1** |
| **UI Components & Graphical Objects** (Borders, icons, input focus rings) | **3.0 : 1** | **3.0 : 1** |

---

## 2. Accessible Gray Contrast Rules

- **On Pure White (`#FFFFFF`) Background**:
  - Primary text should be `#1E293B` (Slate-800) or darker (Ratio: ~13.5:1) —  PASS AAA.
  - Secondary text should be `#475569` (Slate-600) or darker (Ratio: ~7.0:1) —  PASS AAA.
  - Tertiary / Muted metadata should be `#64748B` (Slate-500) or darker (Ratio: ~4.6:1) —  PASS AA.
  - ❌ Avoid `#94A3B8` (Slate-400) for body text (Ratio: 2.6:1 — FAILS WCAG AA).

---

## 3. Dark Mode Contrast Inversion

In dark mode:
- Background is dark (`#09090B` or `#0F172A`).
- Primary text is `#F8FAFC` or `#EDEDED` (Ratio: ~16:1).
- Secondary text is `#94A3B8` (Slate-400, Ratio: ~7.5:1).
- Tertiary metadata is `#64748B` (Slate-500, Ratio: ~4.6:1).
