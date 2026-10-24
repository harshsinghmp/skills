# audit — periodic-retreat audit mode

## When to Use

- **Retreat-readiness audit**: before a quarterly retreat, verify the evidence it will deliberate on is complete, current, and honest.
- **Project-health spot audit**: mid-quarter, score the health signals without waiting for the retreat cadence.
- **Action-verification audit**: confirm the previous retreat's decisions actually shipped — decisions without artifacts are wishes.

## Health-signal checklist

- [ ] Shipped-state currency: `.agents/context/current.md` reflects the repository as it is TODAY (dated, verified)
- [ ] Decision ledger integrity: every entry in `.agents/context/decisions.md` has a date, a rationale, and a checkable outcome
- [ ] Decision verification: for each decision marked done — the artifact exists (commit, PR, doc, metric)
- [ ] Technical-debt register: known debt is written down with file/line pointers, not carried in heads
- [ ] Architecture-drift signals: recent changes that contradict a documented decision or ADR, listed
- [ ] Delivery metrics: test counts, gate status, release cadence — compared against the last retreat's baseline
- [ ] OKR/goal reconciliation: stated goals vs shipped evidence, divergence named plainly
- [ ] Scope honesty: anything quietly abandoned is marked abandoned, not "in progress"

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| current.md contradicts the repo | `CRITICAL` | rewrite against repository reality before the retreat |
| Decision has no verifiable artifact | `REPORT-ONLY` | mark unverifiable; re-decide or drop |
| Drift contradicting an ADR | `REPORT-ONLY` | agenda item for the retreat |
| Abandoned work marked in-progress | `AUTO-REPAIR` | reclassify honestly |

## Sources

- this skill's own multi-scale audit purpose (SKILL.md) — the retreat is the audit cadence
- `.agents/context/decisions.md` and `.agents/context/current.md` — the audited artifacts
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
