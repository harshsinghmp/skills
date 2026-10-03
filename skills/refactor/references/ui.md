# 🎨 refactor:ui — User Interface & Visual Heuristics Refactoring Playbook

> **Executive Scope**: Visual hierarchy, atomic design heuristics, contrast parity, spacing scales, and typography refinement based on Wathan & Schoger's *Refactoring UI* and modern CSS container queries.

---

## 1. The 10 Atomic UI Heuristics

Every UI refactoring pass verifies these 10 invariants:

1. **Visual Hierarchy & Weight**: Primary actions stand out clearly; secondary elements are de-emphasized. Do not rely on color alone—use size, weight, contrast, and spacing.
2. **Typography Scale**: Establish a modular type scale (e.g., 12, 14, 16, 20, 24, 32, 48px). Limit weights to 2-3 (Regular, Medium/Semibold, Bold). Never arbitrarily set font sizes.
3. **Color Palette & Lightness**: Use a disciplined gray palette (5-7 tones) with a single dominant primary accent. Avoid raw `#000000` text on pure white.
4. **Spacing & Whitespace Rhythm**: All margins and paddings must snap to a strict 4px/8px scale (`4, 8, 12, 16, 24, 32, 48, 64px`). Give elements room to breathe; increase whitespace before adding borders.
5. **Button Hierarchy**: Primary action has solid high-contrast fill; secondary has subtle neutral background or border; tertiary is ghost/text-only. Only ONE primary button per viewport quadrant.
6. **Eliminating Visual Clutter**: Remove unnecessary borders, divider lines, and card containers. Use whitespace and background tone shifts to group related items.
7. **Intentional Empty States**: Empty states must inform, reassure, and provide an instant call-to-action to create the first item.
8. **Elevation & Shadows**: Shadows must be soft, diffuse, and directional (e.g. `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05)`). Dark mode uses elevation lightness rather than drop shadows.
9. **Contrast & WCAG 2.2 AA Parity**: Minimum 4.5:1 contrast for regular text; 3:1 for large text and interactive UI controls. Run `bun refactor/scripts/check-contrast.ts` to verify.
10. **Alignment & Optical Grouping**: Align labels with inputs; keep text left-aligned for scannability; group labels closer to their inputs than to the preceding field.

---

## 2. 5-Step UI Refactor Protocol

When refactoring a screen or component:
1. **Strip Color to Grayscale**: Ensure the layout, contrast, and hierarchy work without color.
2. **Standardize Spacing**: Replace ad-hoc margins/paddings with strict 8px tokens.
3. **Clean Up Borders & Boxes**: Delete redundant border lines; rely on spacing and subtle surface fills.
4. **Enforce 5-State Interactive Gate**: Check default, hover, active/pressed, focus-visible, and disabled states.
5. **Responsive & Container Query Pass**: Convert static breakpoint layouts into fluid container queries (`@container (min-width: 400px)`).

---

## 3. Automation Tools
```bash
# Scan layout anti-patterns:
bun refactor/scripts/audit-ui.ts <file_or_dir>

# Verify WCAG contrast compliance:
bun refactor/scripts/check-contrast.ts <file_or_dir>
```
