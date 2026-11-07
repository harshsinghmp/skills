# 04 — Apply a Consistent Spacing Grid

Cramped, claustrophobic layouts and inconsistent spacing between elements are the most common hallmarks of developer-designed UI.

---

## 1. The 4px / 8px Spacing Ramp

Never use arbitrary margins or paddings (e.g., `margin-top: 13px; padding: 7px 11px`). Stick strictly to the standard multiplier scale:

| Token / Class | Value | Primary Use Case |
| :--- | :--- | :--- |
| `space-1` / `p-1` | 4px (0.25rem) | Micro-spacing inside badges, tight icon offsets |
| `space-1.5` / `p-1.5` | 6px (0.375rem) | Compact button vertical padding, label-to-input gap |
| `space-2` / `p-2` | 8px (0.5rem) | Standard button vertical padding, list item gaps |
| `space-3` / `p-3` | 12px (0.75rem) | Dropdown item padding, compact card padding |
| `space-4` / `p-4` | 16px (1.0rem) | Standard component padding, form field gap |
| `space-6` / `p-6` | 24px (1.5rem) | Generous card padding, modal content padding |
| `space-8` / `p-8` | 32px (2.0rem) | Section-to-section gap, dashboard widget spacing |
| `space-12` / `p-12` | 48px (3.0rem) | Page section margins, hero banner padding |

---

## 2. Give Elements Room to Breathe

When a layout feels crowded:
1. **Double the Interior Padding**: If a container has `p-3`, test `p-6`.
2. **Increase Section Gaps**: Push unrelated sections apart with `gap-8` or `mb-8`.
3. **Use Asymmetric Padding for Buttons**: Buttons need more horizontal padding than vertical padding (e.g., `px-4 py-2` or `px-5 py-2.5`) to look balanced with typography.
