# audit — designscope audit mode

## When to Use

- **Design-system audit**: score an extracted (or existing) system across its five dimensions — tokens, components, documentation, process, tooling.
- **Design↔code agreement audit**: verify the Figma component and the coded component describe the same thing, state by state.
- **Extraction fidelity audit**: a design system was reverse-engineered by `designscope` — verify nothing was invented that the source does not show.

## Checklist

- [ ] Token architecture: primitive/semantic/component layers separated; aliasing consistent; dark mode solvable via token modes; no orphaned tokens
- [ ] Tokens actually referenced: flag every raw hex/px value doing a token's job (lint: `color-no-hex` class rules)
- [ ] Component contract: default, hover, focus, disabled, loading, error, empty, overflow states present in BOTH design and code
- [ ] Design↔code agreement: side-by-side state comparison for the sampled families; flag states that exist in one and not the other
- [ ] Accessibility in the composed product: contrast ≥4.5:1 text / 3:1 components, visible focus, targets ≥24×24 CSS px, programmatic name/role/value (WCAG 2.2)
- [ ] Documentation describes the system that SHIPS, not the intended one
- [ ] Contribution/release path: versioning, changelog, migration notes; consuming products not pinned to stale versions
- [ ] Product use: copies/overrides/detachments counted — a high override rate means the system is being worked around
- [ ] Extraction fidelity: every token and scale traceable to the source site/file; invented values flagged

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| State exists in design but not code (or reverse) | `REQUEST-CHANGES` | reconcile before the family ships |
| Raw value where a token exists | `AUTO-REPAIR` | swap to token |
| Invented token during extraction | `REQUEST-CHANGES` | re-derive from source or drop |
| Composed-screen a11y failure (passes in isolation) | `REQUEST-CHANGES` | fix in context, not in the story |

## Sources

- Tcules — *How to Audit a Design System* (layer trace: tokens → Figma → code → product)
- Componiq — 50-Point Design System Audit (token/component/docs/process/tooling dimensions)
- OverlayQA — Design QA Checklist (state matrix: default/hover/focus/active/disabled/loading/error/empty)
- WCAG 2.2 — contrast 4.5:1 text / 3:1 components, targets ≥24×24 CSS px
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
