# accessibility — Accessibility: WCAG 2.2 AA audit, keyboard/contrast/semantics fixes.

## Intake

- Pages/templates in scope
- Compliance target (AA default)
- Known user reports (screen readers, keyboard users)
- Component inventory (interactive elements)

## Deliverable

A11y audit findings with WCAG criterion citations, prioritized fixes applied (keyboard traps, contrast, labels, landmarks, focus management), and a verification pass (keyboard traversal + automated scan).

## Procedure

1. Automated scan first (axe or equivalent) for the mechanical findings.
2. Manual keyboard pass: Tab order, visible focus, no traps, skip link works — a complete keyboard path is a blocking gate, not advisory.
3. Semantics: landmarks, heading hierarchy, labels on ALL inputs, alt text audit (decorative vs informative).
4. Contrast: verify pairs (4.5:1 body, 3:1 large/UI) with the project's tokens.
5. Reflow + scaling (blocking): no horizontal scroll at 320px width / 400% zoom (reflow); text readable scaled to 200% without loss of content or function.
6. Dynamic UI: focus management on route/modal changes, aria-live for async updates, reduced-motion respected (coordinate with `animate`).
7. Re-run scan + keyboard traversal; document remaining known issues with owners. Ship only with WCAG 2.2 AA clean — AA is the blocking gate.

## Quality gate

- [ ] Keyboard traversal clean (order, visible focus, no traps) — blocking.
- [ ] All inputs labeled; all informative images alt'd.
- [ ] Contrast verified against project tokens.
- [ ] Reflow holds (320px / 400% zoom, no h-scroll); 200% text scaling lossless — blocking.
- [ ] Extremes-first covered: keyboard-only, screen reader, 200% zoom.
- [ ] Focus managed on dynamic changes.
- [ ] Automated scan clean or residuals documented with owners.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
