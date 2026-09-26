# audit — Source and citation audit of a research artifact.

## When to Use

- Signing off a user-research, market-pulse, or entity-dossier artifact.
- A research claim is being reused in a proposal, pitch, or content and must be verifiable.

## Checklist

- [ ] Every material claim has a source (URL, date, source type).
- [ ] TAM/market numbers show their arithmetic: top-down AND bottoms-up.
- [ ] Insights are gated on cross-participant/cross-source recurrence, not anecdotes.
- [ ] Recency window stated and honored for time-sensitive claims.
- [ ] Dossier states and tests its hypothesis (no confirmation bias).
- [ ] Stale or unproven claims are flagged, not silently dropped or asserted.

## Severity & routing

| Finding | Action |
|:---|:---|
| Un-cited material claim | BLOCK — get a source or downgrade to UNVERIFIED |
| Single-anecdote presented as finding | REJECT — strip or regrade to observation |
| Stale source driving a live decision | PROPOSE-DIFF — refresh or mark stale |
| Arithmetic on market size missing | BLOCK — show both directions |

Output: `audit-research-<ts>.md` with a finding table and per-item routing. Log outcomes → `evidence-ledger`.

## Sources

Canonical audit-mode guidance: `skills/references/audit-mode-guidance.md`.