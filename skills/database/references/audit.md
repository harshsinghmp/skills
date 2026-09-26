# audit — database audit mode

## When to Use

- **Query audit**: Verify all executed queries were read-only, config paths resolved correctly, no credential leakage in output
- **Performance audit**: Review EXPLAIN plans, identify Seq Scans, missing indexes, lock contention

## Checklist

- [ ] All queries executed read-only (`SELECT`/`SHOW`/`EXPLAIN` only)
- [ ] Config discovery resolved to expected path (see `references/query.md`)
- [ ] Output row/col limits respected (default 100 rows × 10 cols)
- [ ] Single-statement enforced (no `;`-chained writes)
- [ ] No credentials printed in logs or output
- [ ] Connection closed after each query batch

### Performance tier

- [ ] `pg_stat_statements` ranked before `EXPLAIN ANALYZE`
- [ ] Sequential scans on large tables flagged
- [ ] Missing indexes on JOIN columns identified
- [ ] Lock wait time quantified
- [ ] Vacuum/autovacuum lag checked (Postgres)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Credential in output | `PROPOSE-DIFF` | `secretary` (approval gate) |
| Write query in read-only mode | `AUTO-REPAIR` | log + re-run |
| Missing index on FK | `AUTO-REPAIR` | `index` mode |
| Config path broken | `REPORT-ONLY` | `coupling-router` |

## Output

`.agents/artifacts/audit-database-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
