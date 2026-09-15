# Academic Citation & Claim Receipt Protocol

> Reference guide for conducting academic research synthesis, auditing empirical vs. speculative statements, verifying primary DOI/URL citations, and generating missing receipt reports.

---

## 1. Primary Documentation & Academic Receipt Standards

When authoring or verifying technical whitepapers, architectural proposals, or benchmark reports, citations must point directly to primary sources:

| Source Type | Acceptable Citation Format | Unacceptable Format |
| :--- | :--- | :--- |
| **Peer-Reviewed Papers** | DOI link (`https://doi.org/...`) or arXiv identifier (`arXiv:2401.xxxxx`) with lead author and year | *"A recent Stanford study found..."* |
| **Industry Specifications** | Canonical RFC/W3C/ISO URL (e.g. `https://www.rfc-editor.org/rfc/rfc9110`) | *"Per HTTP/3 standards..."* |
| **Framework / Engine Docs** | Exact versioned documentation URL with anchor | *"Bun handles this asynchronously"* |
| **Internal Benchmarks** | Reproducible shell command, commit SHA, machine specs, and raw stdout | *"Internal testing showed 3x speedup"* |

---

## 2. Empirical vs. Speculative Classification

Every technical statement must be classified into one of two epistemological categories:

### A. Empirical Statement (`[EMPIRICAL]`)
- **Definition**: A claim grounded in observable, reproducible, or primary source measurement.
- **Requirement**: Must carry either a `[RAW]` test execution receipt or a `[FETCH]` DOI/URL citation.
- **Example**: *"LSM-tree write throughput scales linearly with spindle concurrency up to 16 threads (DOI: 10.1145/3318464.3389711)."*

### B. Speculative Statement (`[SPECULATIVE]`)
- **Definition**: A theoretical projection, architectural conjecture, or extrapolated prediction.
- **Requirement**: Must be explicitly tagged with `[SPECULATIVE]` or `[INFER]`, with the underlying deductive premises declared.
- **Rule**: Never disguise speculative claims as established facts.
- **Example**: *"`[SPECULATIVE]` Migrating to an append-only WAL is projected to reduce lock contention by ~30%, based on observed mutex wait times in `db.c:L240`."*

---

## 3. Statistical Statement Audit & Missing Receipt Flagger

Statistical claims are high-risk vectors for AI hallucination. The auditor scans for:
- Percentage increases or decreases (e.g., *"+45%"*, *"99.99%"*)
- Multipliers (e.g., *"3x faster"*, *"10-fold reduction"*)
- Benchmark figures (e.g., *"<5ms p99"*, *"100k req/sec"*)

### Missing Receipt Report (`MISSING_RECEIPTS_REPORT.md`)
If a statistical claim lacks a valid `[RAW]` log or `[FETCH]` DOI/URL, it is immediately quarantined:

```markdown
# Missing Receipts Report

| Claim ID | Quarantined Statement | Missing Receipt Type | Recommended Action |
| :--- | :--- | :--- | :--- |
| `CLM-07` | "Reduces memory overhead by 40%." | `[RAW]` Benchmark log | Run `bun test --bench` or redact claim |
| `CLM-12` | "Proven to prevent Byzantine consensus stalls." | `[FETCH]` Paper DOI | Provide paper citation or downgrade to `[SPECULATIVE]` |
```
