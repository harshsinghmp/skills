# diagnose — Slow-query triage with EXPLAIN ANALYZE and pg_stat_statements.

Default stack: self-hosted Postgres 16+ with `pg_stat_statements` enabled. Defaults: read-only first — run `EXPLAIN` without `ANALYZE` on production, full `EXPLAIN (ANALYZE, BUFFERS)` on a replica or staging; never `pg_stat_statements_reset()` on shared production without owner approval.

## Intake

- The slow query text (or symptom: high CPU, timeouts, connection exhaustion).
- `EXPLAIN` output if already captured; else permission to run read-only diagnostics.
- Environment: Postgres version, self-hosted or Supabase ref, table sizes if known.

## Deliverable

Triage report: ranked culprit table (Query / Total time / Mean time / Calls / Likely cause) plus the winning plan read and the ordered fix list. Assumptions recorded inline.

## Procedure

1. Rank offenders from `pg_stat_statements` — total time first, mean time second:
```sql
create extension if not exists pg_stat_statements;
select calls, round(total_exec_time::numeric, 2) as total_ms,
       round(mean_exec_time::numeric, 2) as mean_ms, query
from pg_stat_statements order by total_exec_time desc limit 10;
select query, mean_exec_time, calls from pg_stat_statements
where mean_exec_time > 100 order by mean_exec_time desc;
```
2. Read the plan for the top culprit:
```sql
explain (analyze, buffers, format text) <query>;
```
3. Decode the plan nodes — first match wins:
   - `Seq Scan` on a large table → missing index (route to `index`).
   - High `Rows Removed by Filter` → poor selectivity or missing composite index.
   - `Buffers: read >> hit` → working set not cached; check memory before adding hardware.
   - `Nested Loop` with high loops → wrong join strategy; check join-column indexes and row estimates.
   - `Sort Method: external merge` → `work_mem` too low for the sort.
   - Estimated vs actual rows off by 10x+ → stale statistics; `ANALYZE` first, index second.
4. Check bloat and vacuum health before recommending DDL:
```sql
select relname, last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
from pg_stat_user_tables order by last_analyze nulls first;
```
5. Emit the ordered fix list: stats refresh → index → query rewrite → config → hardware. Cheapest proven fix first.

## Quality gate

- [ ] Culprit ranked from stats, not guessed from symptoms.
- [ ] Plan captured with `ANALYZE, BUFFERS` (or replica-only limitation recorded).
- [ ] Each finding names the exact plan node or stat row behind it.
- [ ] Vacuum and stats freshness checked before any index recommendation.
- [ ] Fix list ordered cheapest-first with the mechanism each fix addresses.

## Routing

- Missing or wrong index → `index` mode with the plan attached.
- RLS policy in the slow path → `guard` mode (unwrapped `auth.uid()` is the usual suspect).
- Locks, pooling, or vacuum config → `operate` mode.
- Slow because of app-side N+1 → fix pattern in `index`, implementation routes to `webdev`.

## Sources

- Postgres docs: EXPLAIN, pg_stat_statements, routine vacuuming.
- Supabase guides: query optimization, database inspect, pg_stat_statements extension.
- When a cited source conflicts with a default above, the source wins — record the override and why.
