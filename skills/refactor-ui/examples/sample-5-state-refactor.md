# Example — `audit` mode on a client dashboard card

A run of refactor-ui v1.1.0 `audit` mode, showing the exact report shape every
mode shares (severity table + verdict + routing) and the script receipts.

---

## Invocation

> "Audit the StatCard component for contrast and spacing issues."

## Step 1 — Mechanical receipts (pasted verbatim)

```text
$ bun refactor-ui/scripts/audit-ui.ts src/components/dashboard/
src/components/dashboard/StatCard.tsx:12 [WARNING] ARBITRARY_PIXELS: Arbitrary pixel value. Use 4px/8px scale tokens instead (p-4, text-sm, gap-6).
src/components/dashboard/StatCard.tsx:19 [SUGGESTION] PURE_BLACK_TEXT: Pure black text. Prefer deep tinted neutrals (#0f172a / zinc-900) to avoid optical vibration.
src/components/dashboard/StatCard.tsx:31 [WARNING] RAW_Z_INDEX: Raw z-index value. Use a named z-scale token (z-top-nav, z-panel, z-drawer); arbitrary 9999 stacking leaks across surfaces.

audit-ui: 4 file(s) scanned, 3 finding(s)

$ bun refactor-ui/scripts/check-contrast.ts #94a3b8 #ffffff
Contrast ratio #94a3b8 vs #ffffff: 2.54:1 — FAIL (AA (normal), threshold 4.5:1)
```

## Step 2 — Proof-gated heuristic pass

Candidates from the scan are verified against the rendering path before
entering the report. One candidate ("badge looks small") was **rejected**: no
binding rule governs badge size, and the correct value is ambiguous —
candidates ≠ findings.

## Step 3 — Report

**ui-audit-report — StatCard.tsx · audit mode · 2026-09-09**

| Severity | Location | Before | After | Why |
|:---|:---|:---|:---|:---|
| HIGH | StatCard.tsx:24 | `text-slate-300` delta label | `text-muted-foreground` (≥4.5:1) | WCAG 2.2 AA failure (2.54:1 measured); delta unreadable for low-vision users |
| MEDIUM | StatCard.tsx:12 | `p-[13px]` | `p-3` token | Breaks the 4px/8px spacing ramp; drift invisible until scale mismatches |
| MEDIUM | StatCard.tsx:31 | `z-[9999]` | `z-panel-content` token | Raw stacking leaks above sticky chrome on the parent dashboard |
| LOW | StatCard.tsx:19 | `text-black` | `text-foreground` | Optical vibration; system token already defines the correct neutral |

**Verdict: Block** — one HIGH (AA failure) remains.

**Not verified**: dark-mode rendering of the delta label (no dark theme in
scope); container-query behavior (component rendered in one context only).

### Routing

| Finding class | Route to |
|:---|:---|
| Token extraction for the full dashboard (14 grays detected) | `designscope` |
| Entrance stagger for the card grid | `animate` |

*Next offer: "want `improve` to fix all four rows now?"*
