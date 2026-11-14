# operate — Pooling, partitioning, pgvector basics, lock triage, monitoring.

Default stack: self-hosted Postgres 16+ behind PgBouncer (or Supabase pooler in transaction mode). Defaults: transaction-mode pooling; pool size `(cores * 2) + spindles`; short transactions; range partitioning by time for append-only growth; HNSW for vector search; read-only monitoring first, mutating commands flagged before delivery.

## Intake

- Symptom or goal: connection exhaustion, lock waits, table growth, vector search, ongoing monitoring.
- Topology: cores, Postgres `max_connections`, pooler presence and mode.
- The largest tables and their growth rate for partitioning calls.

## Deliverable

Pool sizing or partition plan or lock-triage findings with exact SQL run and observed output, plus a monitoring query set the operator keeps. Every mutating command flagged before handoff.

## Procedure

1. Size pooling from math, not vibes — connections cost 1–3MB RAM each:
   - Pool size = `(cpu_cores * 2) + spindle_count` (e.g. 4 cores → ~10).
   - Transaction mode default; session mode only for prepared statements or temp tables.
   - Confirm with `select count(*) from pg_stat_activity;` before and after.
2. Partition append-only giants by time range so retention is a `drop`, not a `delete`:
```sql
create table events (id bigint generated always as identity, created_at timestamptz not null, payload jsonb)
  partition by range (created_at);
create table events_2026_09 partition of events
  for values from ('2026-09-01') to ('2026-10-01');
```
Route time-ordered PK and partition-pruning index choices through `index`.
3. Stand up pgvector basics — right type, right index, measured recall:
```sql
create extension if not exists vector;
create index concurrently docs_embedding_idx on docs
  using hnsw (embedding vector_cosine_ops);
```
Defaults: HNSW for query speed, cosine for normalized embeddings; verify recall on a labeled sample before widening.
4. Triage locks with the activity view first, the lock view second:
```sql
select pid, usename, state, wait_event_type, wait_event, query_start, left(query, 120)
from pg_stat_activity where wait_event_type = 'Lock';
select locktype, relation::regclass, mode, granted from pg_locks where not granted;
```
Fixes in order: kill the blocker only with owner approval → shorten the transaction (lock-short-transactions) → `... for update skip locked` for queue tables → advisory locks for app-level mutual exclusion → deadlock-prevention ordering (consistent lock order, lowest granularity first).
5. Leave monitoring behind — stats plus autovacuum tuning for churn tables:
```sql
select relname, n_dead_tup, last_autovacuum, last_autoanalyze
from pg_stat_user_tables order by n_dead_tup desc limit 10;
alter table orders set (autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02);
```

## Quality gate

- [ ] Pool size derived from core math; mode justified (transaction default).
- [ ] Partition key matches the dominant filter and retention story.
- [ ] Vector index type justified with a recall check, not assumed.
- [ ] Lock findings name blocker and waiter PIDs with observed output.
- [ ] Mutating commands (kills, drops, alters) flagged before handoff, never snuck in.
- [ ] Operator keeps a monitoring query set after the run.

## Routing

- Slow query underneath the ops symptom → `diagnose` first.
- New indexes for partitions or vectors → `index`.
- Deep vector/hybrid search (embedding choice, IVF, payload filters, hybrid FTS+vector, RAG) → `reference: vector-search.md` alongside this mode's pgvector basics.
- Autoscaling / read replicas / zero-downtime migrations → `reference: analytical.md`.
- RLS on partitioned tables → `guard` (policies must cover the parent).
- Deploying pools, partitions, or extensions → `devops`; Supabase platform pooler settings → link out.

## Sources

- Postgres docs: PgBouncer patterns, table partitioning, pg_locks, autovacuum.
- Supabase guides: connection pooling, pgvector, deadlocks and advisory locks.
- When a cited source conflicts with a default above, the source wins — record the override and why.
