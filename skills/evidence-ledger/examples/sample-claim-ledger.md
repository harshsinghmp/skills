# Sample Claim Ledger & Missing Receipts Report

```markdown
# Claim Ledger: SQLite Vector Search Architecture Brief

| ID | Statement | Epistemological Class | Tier | Verification Receipt / Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | "Vector index queries execute under 15ms p99 at 100k items." | `[EMPIRICAL]` | `[RAW]` | `bun test tests/perf.test.ts` (Measured: 12.4ms p99) | `VERIFIED` |
| **CLM-02** | "SQLite supports virtual table extensions via `sqlite3_create_module`." | `[EMPIRICAL]` | `[FETCH]` | https://www.sqlite.org/c3ref/create_module.html | `VERIFIED` |
| **CLM-03** | "Hierarchical Navigable Small World graphs achieve logarithmic search scaling." | `[EMPIRICAL]` | `[FETCH]` | Malkov & Yashunin, 2020 (DOI: 10.1109/TPAMI.2018.2889473) | `VERIFIED` |
| **CLM-04** | "HNSW graph search uses less RAM than brute force IVF flat index." | `[SPECULATIVE]` | `[INFER]` | Premise: HNSW prunes edges; IVF requires full vector scan in memory. | `VERIFIED` |
| **CLM-05** | "Adopting this reduces overall AWS infrastructure bill by 60%." | `[SPECULATIVE]` | `[UNVERIFIED]` | No billing model or empirical cost simulation provided. | `REDACTED` |

---

# Missing Receipts Report

| Claim ID | Quarantined Statement | Missing Receipt Type | Recommended Action |
| :--- | :--- | :--- | :--- |
| `CLM-05` | "Adopting this reduces overall AWS infrastructure bill by 60%." | `[RAW]` Financial simulation | Redact statistic until AWS Cost Explorer baseline is logged. |
```
