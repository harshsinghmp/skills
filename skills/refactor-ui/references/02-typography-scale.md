# 02 — Apply a Stepped Typography Scale

Avoid picking arbitrary font sizes on the fly (e.g., `13px`, `15px`, `19px`, `23px`). Use a deliberate, hand-crafted typographic ramp.

---

## 1. The Standard 6-Tier Scale

| Class / Token | Size | Typical Line Height | Intended Usage |
| :--- | :--- | :--- | :--- |
| `text-xs` | 12px / 0.75rem | 16px / 1.0rem | Badges, timestamps, small metadata, microcopy |
| `text-sm` | 14px / 0.875rem | 20px / 1.25rem | Table cells, secondary body text, form field inputs |
| `text-base` | 16px / 1.0rem | 24px / 1.5rem | Default body copy, standard UI labels |
| `text-lg` | 18px / 1.125rem | 28px / 1.75rem | Emphasized subheadings, card titles, intro text |
| `text-xl` | 20px / 1.25rem | 28px / 1.75rem | Section titles, modal headers |
| `text-2xl` | 24px / 1.5rem | 32px / 2.0rem | Page headings, feature callouts |
| `text-3xl` / `text-4xl` | 30–36px / 1.875–2.25rem | 36–40px / 2.25–2.5rem | Hero titles, hero metrics / dashboard KPIs |

---

## 2. Line-Height Proportions

- **Headings need tight line-height**: Large text has naturally large spacing between lines. Set heading line heights tight (`leading-tight` or `leading-snug`, ~1.1–1.25).
- **Body copy needs relaxed line-height**: Small text requires breathing room for easy tracking. Set body line heights relaxed (`leading-relaxed` or `leading-normal`, ~1.5–1.6).

---

## 3. Letter-Spacing (Tracking) Rules

- **Tighten Large Headers**: As font size increases, the optical space between letters appears larger. Apply `tracking-tight` or `letter-spacing: -0.02em` on `text-2xl`+.
- **Widen Small Uppercase Labels**: Small uppercase text is hard to read without tracking. Apply `uppercase tracking-wider text-xs font-semibold`.
