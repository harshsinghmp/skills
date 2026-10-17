# 🧹 refactor:sweep — Multi-Page Consistency & Component Unification Playbook

> **Executive Scope**: Multi-page/multi-view consistency refactoring, eliminating parallel component duplicates, centralizing ad-hoc styling into design tokens, and aligning design system patterns across an entire codebase.

> [!IMPORTANT]
> **Strict Execution Policy (On-Demand Only)**: `sweep` mode **NEVER executes automatically** during routine refactor passes (`ui`, `code`, `architecture`, `perf`, `database`, `polish`). Sweeping rewires components across the entire codebase and has an extensive blast radius. It must be explicitly requested by user command (e.g. "run a sweep", "sweep consistency", "unify all components"). Automated agents must NEVER trigger a full-codebase sweep unprompted.

---

## 1. When to Run a Sweep

Trigger `refactor:sweep` when:
- Multiple engineers built different sections of the app using different patterns (e.g. 4 different modal components or 6 different button styles).
- Hardcoded hex colors and magic padding numbers are scattered across 20+ JSX/TSX files.
- Pages feel disjointed or lack shared visual and interaction rhythm.

---

## 2. The 4-Step Sweep Procedure

```
[ STEP 1: INVENTORY & DISCOVERY ]
Scan all views/routes to list every instance of target pattern (e.g. Buttons, Modals, Cards)
              │
              ▼
[ STEP 2: MATRIX GENERATION ]
Map differences across pages into a consistency matrix table in `.agents/artifacts/`
              │
              ▼
[ STEP 3: CANONICAL COMPONENT EXTRACTION ]
Promote the strongest implementation into `src/components/ui/` with robust props/variants
              │
              ▼
[ STEP 4: BATCH REPLACEMENT & CALL-SITE REWIRING ]
Systematically replace rogue implementations across all views with the canonical component
```

---

## 3. Consistency Matrix Template

Commit findings to `.agents/artifacts/sweep-matrix-<ts>.md`:

| Route / View | Component Used | Token Compliance | Deviations Found | Action Plan |
|:---|:---|:---|:---|:---|
| `/dashboard` | `<CustomBtn>` | ❌ Hardcoded `#3B82F6` | Custom border-radius 12px | Replace with `<Button variant="primary">` |
| `/settings` | `<Button>` | ✅ Fully compliant | None | Reference baseline |
| `/billing` | `<button className="...">`| ❌ Ad-hoc Tailwind | Missing hover & active states | Replace with `<Button variant="outline">` |

---

## 4. Verification Gate

- [ ] Zero rogue/duplicate component variants remain in audited views.
- [ ] No visual regression on touched pages.
- [ ] Central design tokens imported at 100% of replacement sites.
- [ ] Type-check passes cleanly across all rewired call-sites.
