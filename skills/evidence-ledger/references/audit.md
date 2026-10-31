# audit — evidence-ledger audit mode

## When to Use

- **Ledger integrity audit**: verify every entry in the evidence ledger is sourced, dated, and still true.
- **Claim verification sweep**: a document or PR is about to ship — trace its factual claims back to ledger entries or flag them unsourced.
- **Stale-evidence review**: evidence ages; confirm the sources a decision rested on have not been retracted, superseded, or moved.

## Checklist

- [ ] Every ledger entry carries: claim, source (URL/path), date captured, verifier, and confidence
- [ ] Every claim in shipped docs traces to a ledger entry — list unsourced claims explicitly
- [ ] Every cited source resolves (URL returns 200 or the repo path exists)
- [ ] Every source is checked against its CURRENT state, not the state at capture time
- [ ] Contradictions between two entries are flagged, not averaged — one must be wrong
- [ ] Superseded entries are marked superseded (with the successor entry id), never silently deleted
- [ ] Confidence ratings match the evidence class: primary source > derived > asserted
- [ ] No entry contains secrets, client-confidential data, or personal environment values
- [ ] Decisions in `.agents/context/decisions.md` cite their ledger evidence
- [ ] The verification method is recorded (command run, output captured) — not just "verified ✓"

## Procedure

1. Inventory the ledger: entry count, date span, source classes.
2. Sample or sweep claims (full sweep for release-facing docs, sample otherwise).
3. For each claim: resolve the source NOW, compare against the claim, mark `verified` / `stale` / `contradicted` / `unsourced`.
4. Emit the delta table and route repairs.

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Claim contradicted by its own cited source | `CRITICAL` | correct the claim and everything downstream |
| Unsupourced claim in shipped docs | `REQUEST-CHANGES` | source it or cut it |
| Stale evidence backing an active decision | `REPORT-ONLY` | re-verify, then update the entry |
| Missing verification method | `REPORT-ONLY` | re-verify with a recorded command |

## Sources

- `references/claim-verification-taxonomy.md` — grounding hierarchy used for confidence classes
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
