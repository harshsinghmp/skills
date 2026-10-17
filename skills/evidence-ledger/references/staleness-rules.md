# Staleness Rules

> Automatic staleness detection and flagging rules for evidence-ledger entries.

---

## Rules

| Category | Condition | Auto-Flag | Action |
| :--- | :--- | :--- | :--- |
| **COMMITMENT** | Past `Deadline` date with no `Delivery Evidence` | `OVERDUE` | Surface in dashboard "Attention Required" section. Prompt agent to ask for delivery proof or extend deadline. |
| **CLAIM** | >30 days since `Date` recorded, status still not `VERIFIED` | `STALE` | Surface in dashboard. Prompt agent to re-run verification (benchmark, URL check) or downgrade to `[SPECULATIVE]`. |
| **STATUS** (blocker) | >14 days since `Date` recorded, status still `ACTIVE` | `STALE` | Surface in dashboard. Prompt agent to check if blocker is resolved or update the entry. |
| **DECISION** | Never auto-stales | — | Decisions are superseded manually via `/evidence decide` recording a new decision that references the old one. |

---

## Health Score Calculation

```
health = (count(VERIFIED) + count(FULFILLED) + count(ACTIVE decisions)) 
         / (count(total) - count(SUPERSEDED) - count(REDACTED))
         * 100
```

**Interpretation**:
- **90–100%**: Project evidence is well-maintained. Most claims verified, commitments fulfilled, decisions active.
- **70–89%**: Acceptable. Some stale items need attention.
- **50–69%**: Warning. Significant number of unverified claims or overdue commitments.
- **<50%**: Critical. Evidence base is unreliable — prioritize verification sweep.

---

## Staleness Check Timing

Staleness is evaluated:
1. **On every `/evidence status` call** — the dashboard regeneration always re-checks dates.
2. **On every `/evidence brief` call** — stale items are surfaced in the briefing.
3. **On every write operation** — after appending a new entry, the dashboard regeneration catches any newly-stale siblings.

Staleness is **not** evaluated by a background cron or scheduled process. It is a point-in-time calculation performed when the ledger is read.
