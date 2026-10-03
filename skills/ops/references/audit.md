# audit — ops audit mode

## When to Use

- **Process audit**: Verify proposals, SOWs, milestones resolve correctly
- **Documentation audit**: Check ops docs match actual state, cross-references resolve

## Checklist

- [ ] All active projects have a `SOW.md` or equivalent scope doc
- [ ] Milestones have due dates and owners
- [ ] Proposals include test plan + rollback plan
- [ ] Ops docs link to actual skill outputs (not stale references)
- [ ] Sprint retrospectives captured in `.agents/context/`
- [ ] Multi-client workstreams have isolated anchors (context-anchor)
- [ ] Task ledger (`secretary`) is current

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Missing SOW for active project | `PROPOSE-DIFF` | `ops` (generate scope doc) |
| Stale milestone dates | `AUTO-REPAIR` | update + notify |
| Broken cross-ref in ops docs | `AUTO-REPAIR` | `updatedocs` |
| No retrospective for closed sprint | `REPORT-ONLY` | `coach` |

## Output

`.agents/artifacts/audit-ops-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
