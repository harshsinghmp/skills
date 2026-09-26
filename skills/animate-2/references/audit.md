# audit — animate audit mode

## When to Use

- **Motion audit**: Verify animations respect reduced-motion, stay within performance budget
- **Accessibility audit**: Check for vestibular-disorder triggers

## Checklist

- [ ] All animations respect `prefers-reduced-motion: reduce`
- [ ] No animation causes layout shift (only `transform`/`opacity` animated)
- [ ] Animation durations within canonical tables (sub-300ms for UI)
- [ ] No scroll-jack or content hiding
- [ ] Tab-focus indicators visible on animated elements
- [ ] No infinite loops without user control (pause/reverse)
- [ ] Performance: jank-free at mid-range mobile (check with gauntlet-loop visual gate)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Reduced-motion ignored | `AUTO-REPAIR` | `animate` (add media query) |
| Layout-shift-inducing animation | `PROPOSE-DIFF` | `refactor-ui` |
| Duration >500ms for UI feedback | `AUTO-REPAIR` | `animate` (tighten to ≤300ms) |
| Vestibular trigger risk | `PROPOSE-DIFF` | `design` (redesign motion) |

## Output

`.agents/artifacts/audit-animate-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
