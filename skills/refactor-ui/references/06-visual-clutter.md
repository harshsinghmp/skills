# 06 — Eliminate Visual Clutter

Visual clutter makes an interface feel overwhelming, noisy, and difficult to parse.

---

## 1. Eliminate "Border Soup"

Amateur designs put a 1px border around every card, table row, navbar, sidebar, and section header.
To eliminate border soup:
1. **Use Whitespace First**: Separate elements by increasing margin or padding (`gap-6` or `gap-8`).
2. **Use Background Surface Contrast**: Put white cards (`bg-white` / `bg-card`) on a slightly tinted gray canvas (`bg-slate-50` / `bg-muted/40`).
3. **Use Single-Edge Accents**: If separation is mandatory, use a subtle 1px bottom border on list items (`border-b border-border/50`) rather than wrapping every row in a box.

---

## 2. Remove Redundant Field Labels

When the context makes data obvious, remove the repetitive label:
- ❌ `Email: user@example.com` →  `user@example.com` (formatted under the user's name)
- ❌ `Date Created: Oct 24, 2026` →  `Oct 24, 2026` (muted secondary text)
- ❌ `Status: Active` →  A green status badge `<Badge variant="success">Active</Badge>`

---

## 3. Lighten Secondary Icons and Dividers

- Don't let icons shout louder than text. Set icon colors to `text-muted-foreground` instead of dark black.
- Soften divider lines: `border-slate-100 dark:border-zinc-800` rather than harsh solid borders.
