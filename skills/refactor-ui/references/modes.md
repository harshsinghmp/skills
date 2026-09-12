# Modes — Quick-Reference Router for refactor-ui v1.1.0

Six execution modes route the engine to a specific direction. The user names a
mode (or a trigger phrase maps to one); the agent loads only the sections below
that the mode requires — never the whole reference set. Default when no mode is
named: **review**.

## Router table

| Mode | Trigger phrases | Scope | Reads | Writes | Blocking gate |
|:---|:---|:---|:---|:---|:---|
| **review** | "review this UI", "what do you think of this screen", "is this good" | One component/section; verdict + findings, no edits | Component + its tokens | Nothing | — |
| **audit** | "audit UI contrast and spacing", "run the anti-pattern scanner", "check WCAG" | One surface; mechanical + heuristic scan, scored report | Surface + `audit-ui.ts` + `check-contrast.ts` | `ui-audit-report-<ts>.md` in `.agents/artifacts/` | WCAG 2.2 AA failures = Block |
| **improve** | "refactor this UI", "improve this design", "make it look professional" | One surface; 5-step procedure executed | Component + tokens + relevant heuristic guides | Edited component code | 5-state + contrast gates |
| **sweep** | "refactor the whole dashboard", "make all pages consistent", "system pass" | Multi-page/system; inventory → matrix → batched fixes | All routes/views + token files | Component code + `sweep-matrix-<ts>.md` | Cross-page consistency matrix |
| **tokens** | "extract design tokens", "too many grays", "set up a type scale" | Styling layer; rename-and-centralize (pixels don't move) | All style sources | Token definitions + call-site rewiring | Zero magic-number literals remain in audited files |
| **polish** | "final pass before launch", "ship-readiness", "last look" | Whole path at all sizes/states; drift triage | Full path + DESIGN.md/system docs | Narrow fixes only | Zero P1 drift remains |

## Shared rules (every mode)

1. **Anchor to the client's system first.** Before applying any heuristic value
   below, check for existing tokens, `designscope` extractions, or `.agents/brand/`
   material. When a governing system exists, its values win; heuristics fill gaps.
2. **Grayscale first when hierarchy is unclear** — size, weight, lightness, and
   spacing before hue. Color is the last resort.
3. **De-emphasize before amplifying**: quiet the surrounding noise before making
   the primary louder.
4. **Static cue rule**: every state change needs a non-motion cue (color, icon,
   label). All motion *choreography* routes to the `animate` skill — refactor-ui
   owns static polish only.
5. **No finding without proof** (audit/review/sweep): a candidate must show
   **Contract** (a binding rule or direct contradiction), **Runtime** (it reaches
   the rendered surface), and **Correction** (one deterministic change). If the
   correct choice is ambiguous, the finding is rejected — candidates ≠ findings.
6. **Honest verification**: every check not actually run is reported as
   `Not verified`. A clean scan never substitutes for visual judgment.

## Report format (audit / review / sweep)

Group findings under the principle each violates, ordered by severity, one row
per root cause listing every location it appears in:

```markdown
| Severity | Location | Before | After | Why |
|:---|:---|:---|:---|:---|
```

- Location is `path/to/file:line`. Why names the principle and the user impact.
- Severity: **HIGH** blocks an interaction, breaks accessibility, or makes a
  state unreachable. **MEDIUM** breaks the system (scale, tokens, hierarchy).
  **LOW** is isolated polish. Severity is never encoded in color alone — every
  marker ships text (HIGH/MEDIUM/LOW) + symbol; color is a redundant third channel.
  Same rule applies to rendered HTML report artifacts.
- Verdict: **Block** when any HIGH remains (or any WCAG 2.2 AA text failure);
  **Approve** otherwise, with remaining rows as tracked work.
- Close with the cross-skill routing table (below).

## Mode-specific procedure notes

### review (default)
1. Resolve the target to a concrete file path (ports drift; paths don't).
2. Squint test → identify primary/secondary/groups in order.
3. Check the 11 heuristics + concentric radius + grouping ratio.
4. Emit the severity table with **no edits**. Offer modes: "want me to
   `improve` this, or `audit` it mechanically first?"

### audit
1. Run `bun refactor-ui/scripts/audit-ui.ts <paths>` — paste output as receipt.
2. Extract fg/bg pairs the surface actually renders; verify each with
   `bun refactor-ui/scripts/check-contrast.ts <fg> <bg>` (normal + large).
3. Heuristic pass (11 heuristics + research additions) with proof gates.
4. Score: per-heuristic Pass / Partial / Fail; overall Block/Approve verdict.
5. Write `.agents/artifacts/ui-audit-report-<ts>.md`; echo ≤5-line summary.

### improve
Execute the 5-step procedure in SKILL.md (Triage → Structure → Polish →
Contrast Oracle → 5-State Gate). After the Contrast Oracle, also apply:
concentric radius (`inner = outer − padding`), grouping ratio (inter ≥ 2×
intra), named z-scale (no raw 9999), theme parity (verify in light AND dark).

### sweep
1. Inventory: enumerate routes/views touching the surface family.
2. Extract the token set actually in use; flag literals.
3. Consistency matrix: rows = components, columns = heuristics; mark drift.
4. Fix per heuristic across all pages (batch by heuristic, not by page —
   one decision applied everywhere beats N local decisions).
5. Re-run matrix; unresolved cells become tracked rows in the report.

### tokens
1. Inventory every literal color/spacing/radius/font-size in scope.
2. Cluster into scales (9-step neutrals, 6-tier type, 4/8px ramp, radius set).
3. Name semantically (`text-body-sm`, not `text-13`); emit token definitions
   in the project's native system (CSS vars / Tailwind theme / etc.).
4. Rewire call sites. **Pixels on screen must not move.**
5. Grep for remaining literals in audited files; zero is the gate.

### polish
1. Classify every drift before fixing: **missing token** (promote it) /
   **one-off** (replace with shared component) / **conceptual mismatch**
   (flag for redesign — never smuggle a redesign into polish) / **local
   defect** (fix in place).
2. Fix the cause at the narrowest correct level.
3. Walk the full path: all viewports, all 5 states, keyboard + zoom.
4. Triage order: broken tasks → missing states → drift → visual
   inconsistencies → code cleanup. Never perfect one corner while the rest
   sits below the same bar.

## Cross-skill routing (close every report with this)

| Finding class | Route to |
|:---|:---|
| Token/architecture extraction needed | `designscope` |
| Motion, easing, entrance/exit choreography | `animate` |
| Hardening the refactored surface (security headers, viewports) | `gauntlet-loop` |
| Interaction-correctness defects (not visual) | `code-review` |
| Failed/parked refactor work | `dead-letter` |
| Visual regeneration or brand exploration | Out of scope — say so |
