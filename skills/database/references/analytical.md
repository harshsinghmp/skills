# analytical — Analytical query modes (columnar/DuckDB), autoscaling, and zero-downtime migrations (Neon/Supabase).

Default stack: DuckDB for analytical query work over local/exported data; Neon and Supabase for serverless Postgres autoscaling and replication. Defaults: route OLTP (point lookups, small writes, transactions) to transactional Postgres; route aggregation/heavy-scan analysis to a columnar mode (DuckDB); autoscaling + read replicas for read-heavy scale; expand-contract for zero-downtime schema changes. Tool-independent — mechanisms apply to any columnar engine or serverless Postgres.

## Analytical query modes

### Intake
- What the query does: point lookup / row write (OLTP) vs scanning many rows and aggregating (OLAP).
- Where the data lives, its volume per scan, and whether unknown-shaped ad-hoc analysis is expected.

### Deliverable
A routing decision (analytical vs transactional) plus the query/aggregation plan and, where relevant, the columnar export + query performed.

### Procedure
1. Route by workload first — this is the cheapest decision:
   - **Transactional (keep in Postgres/mysql):** point lookups, row-level writes, joins on indexed keys, anything under a transaction. `query`/`operate` handle it.
   - **Analytical (route to columnar):** full-table scans, group-by/histogram over large slices, window functions over the whole dataset, ad-hoc slice-and-dice. Postgres is a poor fit when these touch millions of rows repeatedly.
2. Choose the engine:
   - Default-stack DuckDB — in-process, zero-ops, columnar. Read CSV/Parquet/JSON or attach Postgres and query directly; ideal for one-off and batch analysis, and for "dump, analyze, answer" work. No server to run.
   - Managed OLAP (BigQuery/Snowflake/Redshift) only when you need shared/live team analytics at scale — overkill for single-operator analysis.
3. Run aggregation-window analysis in columnar, not OLTP:
   - Window/aggregate over the full frame (rolling totals, moving averages, percentile buckets) is columnar territory.
   - When it must run in Postgres: respect the row-budget and index discipline from `query` (row caps, `EXPLAIN` first), and consider a materialized view or a periodic export to DuckDB for the heavy shape.
4. Export-then-analyze pattern for ad-hoc questions: `SELECT` the slice into Parquet/CSV → query in DuckDB → discard. Keeps your OLTP instance untaxed and analysis repeatable.

### Quality gate
- [ ] Routing decision stated (OLTP vs OLAP) with the workload reason — aggregation over large scans does not ride the transactional pool by default.
- [ ] Analytical engine justified (DuckDB zero-ops vs managed OLAP only for shared scale).
- [ ] Ad-hoc heavy queries pointed at columnar/export path, not the hot OLTP instance.
- [ ] Row/scan budget respected when an analytical shape runs in Postgres.

## Autoscaling & zero-downtime migration (Neon / Supabase serverless Postgres)

### Intake
- Read vs write mix, connection count, maintenance-window tolerance (can the schema change stall writes?).
- Scale trigger: connection exhaustion, CPU saturation, or capacity for a migration/schema change.

### Deliverable
A scale plan (compute autoscaling, replicas, connection strategy) and a zero-downtime migration sequence with the exact steps to run.

### Procedure
1. Autoscaling — let the platform scale compute, not you:
   - **Neon:** compute autoscaling scales CPU/mem with load; autosuspend idles idle branches to zero cost. Use per-tenant project/branch isolation for dev/CI. Connection limits shrink under autoscaling — keep the pool sized to the minimum allocation, not peak (pooling basics in `operate`).
   - **Supabase:** scale via configuration + read replicas rather than bigger instances; the pooler (transaction mode) is the primary connection-saturation fix before any replica.
2. Read replicas — scale reads without touching writes:
   - Route heavy reads to the replica; add replicas when reads saturate the primary. Neon/Supabase manage replica topology.
   - Replication lag discipline: never serve a read-after-write-then-read-again acceptance check from a replica without a lag guard.
3. Zero-downtime schema changes — **expand-contract**, never in-place `ALTER` on the hot table:
   1. **Expand:** add the new column/table with a default (`ADD COLUMN` is metadata-only in Postgres); backfill lazily with a rate-limited batch (`where id > $1 order by id limit ...`), not one giant UPDATE.
   2. **Backfill** to parity (count check) — writes keep going through the old path meanwhile.
   3. **Contract:** dual-write / read-new, flip the code, then drop the old column/index once the new path is the sole writer. Each step is a small, reversible commit — never a single "migration that must succeed".
   4. For partitions, reuse `operate`'s time-range partitioning so retention stays a `drop`.

### Quality gate
- [ ] Autoscaling/replica plan named with the trigger it fixes (saturation vs connections), and pool sizing tied to minimum compute.
- [ ] Replica-lag guard present for read-after-write-read patterns.
- [ ] Schema change is expand-contract: metadata-only adds, rate-limited backfill to parity, reversible contract step.
- [ ] Migration steps are individually reversible; no all-or-nothing DDL on the hot table.

## Routing

- Pure pooling/partitioning/lock triage → `operate`.
- Slow analytical query stuck in OLTP → `diagnose` to find the cost, then re-route here.
- New indexes from the analytical/backfill work → `index`.
- Deploying migration steps, replicas, or extensions → `devops`; platform dashboard/config (Neon project, Supabase settings) → link out, never duplicated.

## Sources

- DuckDB docs: columnar execution, Parquet/JSON reads, window functions.
- Neon docs: compute autoscaling, autosuspend, branching, replicas.
- Supabase docs: read replicas, connection pooler, database migrations.
- When a cited source conflicts with a default above, the source wins — record the override and why.