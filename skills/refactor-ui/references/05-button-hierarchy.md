# 05 — Design Button Hierarchy

Placing three identical filled buttons next to each other creates visual chaos and decision paralysis. Every action area must have a clear primary action.

---

## 1. The 3 Button Tiers

| Tier | Variant Name | Visual Style | When to Use |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Primary (Solid)** | High-contrast solid fill with white/dark text (`bg-primary text-primary-foreground`) | The single most important action on the screen ("Create Project", "Save Changes", "Publish") |
| **Tier 2** | **Secondary (Outline / Muted)** | Neutral outline or subtle muted background (`border border-input bg-background hover:bg-muted`) | Common alternative actions ("Cancel", "Export", "Preview") |
| **Tier 3** | **Tertiary (Ghost / Link)** | No border, transparent background, text-only with hover tint (`hover:bg-muted text-muted-foreground`) | Low-priority or frequent actions ("Learn more", "Skip for now", "Dismiss") |

---

## 2. Handling Destructive Actions

- **Never make a destructive action the default Primary Solid button** unless confirmation is explicit.
- Use a **Destructive Outline / Ghost** variant (`border-destructive text-destructive hover:bg-destructive/10`) for inline delete buttons.
- Reserve **Solid Red Destructive** (`bg-destructive text-destructive-foreground`) exclusively inside dedicated confirmation modals ("Delete Repository Forever").

---

## 3. Button Icon Alignment Rules

- **Leading Icons**: Put icons before text for actionable tasks (`<Plus /> New Document`).
- **Trailing Icons**: Put icons after text for directional or external links (`Learn More <ArrowRight />`).
- **Icon Sizing**: Match icon dimensions optically to font size (16px icon for 14px text; 20px icon for 16px text).
