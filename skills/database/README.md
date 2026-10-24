# Database — for the humans who run this skill.

This directory is the database department for the agency: query read-only, diagnose slow queries, design indexes, guard rows with RLS, operate infrastructure, and tune parameters — across Postgres, MySQL, MSSQL, and SQLite, through six modes.

## What you get

- **query** — run a read-only query and get a tabulated result. Defense-in-depth safety: read-only session, single-statement enforcement, 30s timeout, 10k row cap, 100-char column cutoff, credentials scrubbed from output and errors.
- **diagnose** — find the slow query, read the plan, rank offenders from `pg_stat_statements`, check bloat and vacuum health, hand off to index/guard/operate when the fix belongs elsewhere.
- **index** — missing, composite, covering, partial, and FK indexes plus N+1 and batch-upsert patterns. Production DDL uses `CONCURRENTLY`; write cost stated per index.
- **guard** — RLS policies with verification tests, `security_invoker` views, PK and identifier rules. Auth calls wrapped in `(select ...)` to avoid per-row full scans.
- **operate** — pooling sizing, partitioning, pgvector basics, lock triage, and monitoring queries the operator keeps. Mutating commands flagged before handoff.
- **tuning** — automated semantic parameter optimization for connection pools, cache TTLs, worker concurrency, and vector quantization with controlled benchmark feedback loops.

## When to use it

- You have a query you want to run read-only and see the results.
- You have a slow query and want to know why, with the plan attached.
- You want an index designed for a query, with the write cost stated.
- You want RLS policies written and verified (allowed, denied, wrong-tenant rows).
- You want pooling sized, a table partitioned, locks triaged, or vector search stood up.
- You want production health checked: vacuum health, dead tuples, autovacuum tuning for churn tables.

## What it does NOT do

- It does not write backend app code around the database (ORM models, queries in app code) — that is `webdev`.
- It does not build infra and deploy pipelines (servers, CI/CD, backups, restores) — that is `devops`.
- It does not duplicate Supabase platform operations (dashboard, Auth service, Edge Functions) — links out to Supabase docs.
- It does not pre-launch verify the app built on the database — that is `qa-launch`.

## How it fits your workflow

You run a full-service creative web marketing agency with multiple projects, multiple databases, and multiple clients. The database skill is the single place your agents go when anything database-shaped comes up, regardless of which database it is.

1. **Query read-only results.** When a skill or a human needs data from a database — a report query, a schema inspection, a count, a join — the `query` mode runs it read-only with defense-in-depth safety. Credentials are never printed; the query is whitelisted; the output is a scannable ASCII table. This is the safe default for any agent that touches a database.

2. **Diagnose the slow query.** When performance drops — high CPU, timeouts, connection exhaustion — the `diagnose` mode ranks offenders from `pg_stat_statements`, reads the plan with `EXPLAIN (ANALYZE, BUFFERS)`, checks bloat and vacuum health, and hands off to `index`, `guard`, or `operate` when the fix belongs there. This is the triage before any tuning.

3. **Design the index.** When the plan shows a missing index, a bad join strategy, or an N+1 loop, the `index` mode designs the right index (composite, covering, partial, FK) with `CONCURRENTLY` on production and the write cost stated. This is the fix after the diagnosis.

4. **Guard the rows.** When tenant isolation, RLS, or secure views are in play, the `guard` mode writes the policies with verification tests, keeps views `security_invoker`, and applies schema guardrails (identity PKs, snake_case, declared constraints). This is the security authority for the schema.

5. **Keep production healthy.** When pooling, partitioning, pgvector, locks, or monitoring come up, the `operate` mode sizes the pool from math, partitions the growing table, stands up the vector index, triages the lock, and leaves monitoring queries behind. This is the operations layer.

6. **Tune system parameters.** When latency, throughput, or infrastructure costs require optimization, the `tuning` mode uses semantic parameter reasoning (rather than naive brute-force grid search) to tune connection pools, cache TTLs, worker concurrency, and vector quantization against controlled benchmark loops.

A single skill, six modes, four database types. The agent resolves the mode from the request, loads only that mode's reference, and follows the playbook.

### Specialized Deep-Dive References

- `references/vector-search.md`: Vector search architecture, HNSW vs IVF indexing, payload filtering, scalar/binary quantization, and RAG chunking (Qdrant & pgvector).
- `references/tuning.md`: Automated semantic parameter tuning & benchmark optimization loops.
- `references/analytical.md`: Columnar analytics routing (DuckDB/ClickHouse) vs OLTP and zero-downtime scaling.

## Setup

No special setup for the query mode beyond having a connection config. The diagnose, index, guard, and operate modes assume a self-hosted Postgres 16+ with `pg_stat_statements` enabled, or a Supabase Postgres project. When the target is MySQL, MSSQL, or SQLite, the query mode still works; the other modes note where the dialect differs.

## Tokens and permissions

- Credentials stay in the connection config and are never printed.
- The query mode is read-only by default; INSERT/UPDATE/DELETE/MERGE are rejected at the gate.
- Production DDL uses `CONCURRENTLY`; write cost is stated per index.
- Mutating commands in the operate mode are flagged before handoff, never snuck in.

## Related skills

- `webdev` — app code that uses the tuned queries, ORM models, and routes.
- `devops` — deploys, pools, partitions, extensions, and backup/restore flows.
- `qa-launch` — pre-launch verification of the app built on this database.
- `postgres-perf-tuner` — folded into this skill; the four Postgres-specific modes are here now.
