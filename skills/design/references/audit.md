# audit — design audit mode

## When to Use

- **Design QA audit**: score a page, screen, or component against visual-hierarchy, contrast, and consistency standards before handoff.
- **Design-system adherence audit**: verify an implementation actually uses the tokens/scales the design system defines.
- **Pre-handoff review**: catch the defects a screenshot review always misses (states, spacing rhythm, overflow).

## Checklist

- [ ] Visual hierarchy: one primary action per view; eye lands on it first (size/weight/position agree)
- [ ] Color contrast: text ≥ WCAG AA (4.5:1 body, 3:1 large text); never color-alone state signaling
- [ ] Typography: type scale is stepped (no arbitrary sizes); line-length 45–75ch on body copy
- [ ] Spacing rhythm: margins/paddings from the spacing scale, no magic numbers
- [ ] Component states present: default, hover, focus-visible, active, disabled, loading, empty, error
- [ ] Responsive integrity: no horizontal scroll 320px→1920px; touch targets ≥44×44px
- [ ] Design tokens used over hard-coded hex/px values (flag every raw value)
- [ ] Iconography from one set, one stroke weight; no mixed metaphors
- [ ] Empty/error/loading states designed, not afterthoughts
- [ ] Dark mode parity: tokens resolve, no baked light-only assumptions
- [ ] Imagery: alt text, correct aspect ratios, no stretched assets

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Contrast failure on body text | `AUTO-REPAIR` | swap to the passing token |
| Missing focus-visible state | `AUTO-REPAIR` | add the standard focus ring |
| Hard-coded color where a token exists | `AUTO-REPAIR` | replace with token |
| Broken hierarchy (two primary actions) | `REPORT-ONLY` | `design:ui` rework |
| No responsive treatment | `REQUEST-CHANGES` | `design:wireframe` before code |
| Missing state designs | `REPORT-ONLY` | `design:prototype` the states |

## Sources

- OverlayQA — Design QA Checklist (60 checks / 10 categories; token-over-hard-code rule)
- Desisle — UI Design Checklist (typography scale, line length 45–75ch, semantic color conventions)
- WCAG 2.2 — contrast 4.5:1/3:1, focus visibility, target size
- Tcules — How to Audit a Design System (design↔code state agreement)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
