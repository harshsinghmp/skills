# frontend — Frontend: implement components/pages per spec, project patterns first.

## Intake

- Design spec or wireframes (from `design` or client)
- Existing component library/patterns to reuse
- Data requirements and state boundaries
- Responsive and interactive expectations

## Deliverable

Implemented, tested components/pages following repo conventions, with states (loading/empty/error), responsive behavior, and the verification gate green.

## Procedure

1. Read the design spec; list components to build vs reuse — prefer a maintained component registry over restyling bespoke widgets.
2. Detect the project's styling system (Tailwind/CSS modules/styled) and component patterns; match exactly. Centralize tokens first (rename-and-centralize literals into tokens) before any styling work.
3. Build bottom-up: leaf components → composed sections → page.
4. Wire data with the project's data-fetching convention (server components, SWR, etc.).
5. Implement all states: loading, empty, error, success — no happy-path-only UI.
6. Responsive container-first: components respond to their container (container queries); breakpoints where content breaks, not device presets; logical properties for RTL; safe-area insets.
7. Design judgments (palette, scale, hierarchy) are not decided here — route to `design`/`refactor-ui`.
8. Run the verification gate; fix everything it reports.

## Quality gate

- [ ] Reused existing components/registry where they existed (no parallel re-implementations).
- [ ] Tokens centralized before styling (no new raw literals).
- [ ] All interactive states implemented.
- [ ] Responsive container-first; logical properties for RTL.
- [ ] Extremes-first tested: narrowest container, 200% zoom, RTL.
- [ ] Verification gate green.
- [ ] Markup semantic (landmarks, headings, labels) — not div soup.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
