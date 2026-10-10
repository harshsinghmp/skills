# regression — Post-fix re-verification: fixed issues plus adjacent blast radius.

## Intake

- Fix list with commit per finding (from `webdev`/`mobile` fix round)
- Original `functional`/`gate` report
- Adjacent surfaces sharing the touched code

## Deliverable

Regression report: each fix Verified or Reopened, adjacent surfaces checked, convergence stated (converged or escalate).

## Procedure

1. Re-run each fixed finding on the same matrix step that failed it — same step, same evidence format.
2. Check the blast radius: surfaces sharing the touched code get a smoke pass even if they passed before.
3. Reopened items return to the owner with new evidence; if new findings outnumber fixed two rounds running, stop and escalate instead of looping.
---

## 📱 Multi-Viewport Visual Regression & Layout Overflow Protocol

Unit tests (`bun test`) cannot detect visual breakages. AI coding agents frequently introduce layout regressions: unscrollable horizontal overflow, clipped CTA buttons, and z-index collisions.

Before approving any UI release, run the **Visual Regression Audit**:

### 1. The 3-Tier Viewport Verification Standard
| Viewport Profile | Width $\times$ Height | Key Audit Surface | Failure Directives |
|:---|:---|:---|:---|
| **Mobile Standard** | `375px` / `390px` $\times$ `844px` | Navigation hamburger, hero fold, sticky footers | `scrollWidth > innerWidth` is a BLOCKING release blocker |
| **Tablet Portrait** | `768px` $\times$ `1024px` | 2-column grids, filter drawers, table wrapping | Misaligned grid collapses or clipped cards block release |
| **Desktop High-Res** | `1440px` $\times$ `900px` | Maximum container bounds (`max-w-7xl`), multi-column nav | Content stretching past readable line length (> 75ch) |

### 2. The 4 Golden Visual Invariants
1. **Zero Horizontal Layout Shift (X-Overflow)**: The page body must strictly enforce `overflow-x: clip` or `overflow-x: hidden`. No element may cause horizontal scrolling on viewport widths down to `360px`.
2. **Touch Target Accessibility**: All interactive buttons, nav links, and form inputs must measure at least `44px` by `44px` clickable surface on mobile.
3. **Z-Index Stacking Isolation**: Modals, drawer overlays, and floating headers must use explicit stacking contexts (`isolation: isolate`, `z-50`) to prevent hero backgrounds or iframe embeds from bleeding over active controls.
4. **Hero Fold Visibility**: On mobile (`390px`), the primary Value Proposition headline and at least one primary action button must be visible within the initial `650px` vertical window without scrolling.

---

## Quality gate

- [ ] Every fix re-tested on its original failing step.
- [ ] Adjacent surfaces smoke-passed.
- [ ] Convergence or escalation stated, never a silent third loop.
- [ ] Dependency upgrades staged: pin target → align deps with the vendor fixer → run diagnostics → clear caches + reinstall → walk the vendor breaking-changes checklist (removed APIs, moved imports, media/nav/auth surfaces).
- [ ] Post-patch proof (keeper: trailofbits/post-patch-validation): original failure re-run on the patched build, root-cause variants checked (same bug elsewhere), legitimate behavior preserved, no new failures introduced.
- [ ] Refinement preserves incumbent identity — concept-level drift returned as redesign, never polished in place (keeper: pbakaus/impeccable).
- [ ] Post-edit contracts resolve: every renamed/moved field, path, and cross-ref still resolves; moved content has a named home, never silent deletion (keeper: 99rebels/skill-polisher).

## Routing

- Reopened code issues → `webdev`/`mobile`; new visual drift → `refactor-ui`.
- Every fix lands with a failing-first regression test (fails without the fix, passes with it) so the same bug cannot recur silently.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
