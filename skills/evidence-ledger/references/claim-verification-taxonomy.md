# Claim Verification Taxonomy & Epistemological Grounding

## 1. Hierarchy of Factual Grounding

1. **`[RAW]` (Direct Local Evidence)**:
   - Command stdout/stderr logs and benchmarks.
   - Local file contents and exact line ranges.
   - Automated test suite execution receipts.
   - Highest confidence ($1.0$).

2. **`[FETCH]` (Authoritative Primary Source)**:
   - Official API documentation (e.g., nodejs.org, bun.sh).
   - W3C / RFC / IETF specifications.
   - Primary peer-reviewed research papers with verifiable DOI or arXiv link.
   - Confidence: $0.95$.

3. **`[SEARCH]` (Secondary Corroborated Source)**:
   - Multiple independent engineering analyses or peer discussions.
   - Must have 2+ concordant independent domains.
   - Confidence: $0.80$.

4. **`[INFER]` (Structured Logical Deduction)**:
   - Agent extrapolation from verified empirical premises.
   - Must explicitly state the logical syllogism (`Premise A + Premise B => Conclusion`).
   - Confidence: $0.70$.

---

## 2. Epistemological Classification

- **`[EMPIRICAL]`**: Observed, measured, or primary-cited data.
- **`[SPECULATIVE]`**: Extrapolations, conjectures, or unverified forward projections.
