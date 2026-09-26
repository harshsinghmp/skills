---
name: database
aliases: ["db", "database-skill", "sql-query", "db-performance", "db-tuning", "database-optimizer"]
description: "Unified database department: read-only query execution with defense-in-depth safety, schema exploration, slow-query triage with EXPLAIN ANALYZE and pg_stat_statements, missing and covering index design, RLS policy authoring with verification tests, performance optimization with memory and query tuning, and production operations with pooling partitioning and monitoring — handles Postgres, MySQL, MSSQL, and SQLite through six modes. Use when asked to run a read-only query, explore a schema, diagnose a slow query, design an index, optimize database performance, write or verify an RLS policy, tune vacuuming, size connection pooling, or operate a database. Not for backend app code (webdev), infra and deploy pipelines (devops), or platform operations."
argument-hint: "[query|diagnose|index|guard|operate|optimize]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 40
  aliases: ["db", "database-skill", "sql-query", "db-performance", "db-tuning", "database-optimizer"]
  suggested_skills: ["webdev", "devops", "qa-launch"]
  hermes:
    tags: ["database", "sql", "postgres", "mysql", "mssql", "sqlite", "performance", "slow-query", "explain-analyze", "pg-stat-statements", "indexing", "covering-index", "rls", "security-invoker", "connection-pooling", "partitioning", "vacuum", "lock-triage", "monitoring", "read-only", "query-execution", "database-optimizer", "query-optimization"]
    related_skills: ["webdev", "devops", "qa-launch"]
    suggested_skills: ["webdev", "devops", "qa-launch"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["webdev", "devops", "qa-launch"]
    primary_triggers: ["run a read-only query", "explore a schema", "slow query", "EXPLAIN this", "design an index", "missing index", "optimize database", "database-optimizer", "query tuning", "RLS policy", "security invoker", "connection pooling", "vacuum tuning", "lock triage", "partition a table", "database performance", "query database"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🗄️ database — Unified Database Department

One head skill for all database work. Query read-only, diagnose the slow query, index what matters, guard the rows, keep production healthy. Every mode runs handsfree — defaults are stated inline, assumptions recorded in the deliverable, zero questions asked.

Default stack: self-hosted Postgres 16+ with `pg_stat_statements` enabled for the diagnose/index/guard/operate modes; the query mode works with any SQL database that has a connection config. Supabase-approved references linked per mode where applicable. Supabase platform operations (dashboard, Auth service, Edge Functions) are linked out, never duplicated.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **query** | "run a query", "select from", "query the database", "read from table" | Read-only query execution with defense-in-depth safety: config discovery, credential protection, query whitelist, single-statement enforcement, timeout, row/col caps, tabular output | [references/query.md](references/query.md) |
| **diagnose** | "slow query", "why is this slow", "EXPLAIN this", "high CPU", "timeouts" | Slow-query triage: pg_stat_statements ranking, EXPLAIN ANALYZE read, bloat and vacuum checks | [references/diagnose.md](references/diagnose.md) |
| **index** | "design an index", "missing index", "covering index", "N+1", "FK is slow" | Missing, composite, covering, partial, and FK indexes plus N+1 and batch-upsert patterns | [references/index.md](references/index.md) |
| **guard** | "write an RLS policy", "verify RLS", "security invoker", "PK strategy", "row visible to wrong tenant" | RLS authoring with verification tests, security_invoker views, PK and identifier rules | [references/guard.md](references/guard.md) |
| **operate** | "pooling", "partition this table", "pgvector", "locks", "vacuum tuning", "connection exhaustion" | Pooling, partitioning, pgvector basics, lock triage, and monitoring | [references/operate.md](references/operate.md) |
| **optimize** | "optimize query", "database tuning", "slow query optimization", "work_mem", "buffer pool", "database-optimizer" | Deep performance tuning: execution plan diffing, memory tuning (shared_buffers, work_mem), query rewriting, and deadlock elimination | [references/optimize.md](references/optimize.md) |
| **audit** | "audit the database", "query audit", "performance audit", "debug slow queries" | Query audit (read-only verification, config paths) + performance audit (EXPLAIN plans, index gaps) | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

### Deep-dive references (load on topic, no separate mode)

Mode behavior is fixed; these extend a resolved mode when the request dips deeper than its playbook:

- Vector/hybrid search (embeddings, HNSW vs IVF, payload filters, hybrid FTS+vector, RAG chunking; Qdrant default, pgvector fallback) → [references/vector-search.md](references/vector-search.md)
- Analytical query modes (columnar/DuckDB vs OLTP routing, aggregation-window analysis) and Neon/Supabase autoscaling + zero-downtime migration → [references/analytical.md](references/analytical.md)

Load alongside `operate` for vector basics or `query` for aggregation routing.

## Verification

Run before reporting completion:
- [ ] Query executed read-only (`SELECT`/`SHOW`/`EXPLAIN` only — no `INSERT`/`UPDATE`/`DELETE`)
- [ ] Query config path verified — `references/query.md` config discovery resolved
- [ ] Output row/col limits respected (default 100 rows × 10 cols)
- [ ] Single-statement enforced (no `;`-chained writes)
- [ ] Connection closed after query
- [ ] For diagnosis: `pg_stat_statements` ranked before `EXPLAIN ANALYZE`

For connection testing: `verify-connection` live-checks the configured DSN, confirms read-write intent is absent.

Full audit-mode spec: `skills/references/audit-mode-guidance.md`.

---

## When to Use

- Running read-only SELECT/SHOW/EXPLAIN queries against a configured database.
- Exploring database schemas: listing tables, columns, indexes, foreign keys.
- Diagnosing a slow query, high CPU, timeouts, or connection exhaustion.
- Designing indexes: missing, composite, covering, partial, FK, or vector.
- Writing or verifying RLS policies and secure views.
- Choosing PK strategy, identifiers, and constraints for a new schema.
- Sizing connection pools, partitioning tables, triaging locks, tuning vacuum.
- Designing vector/hybrid search, routing analytical (columnar) queries, or planning Neon/Supabase autoscaling and zero-downtime migrations.

### Anti-Triggers

- Backend application code around the database (queries in app code, ORM models) → `webdev`.
- Infrastructure and deploy pipelines (servers, CI/CD, backups, restores) → `devops`.
- Supabase platform operations (dashboard settings, Auth service config, Edge Functions) → link out to Supabase docs, never duplicate here.
- Pre-launch verification of the app built on the database → `qa-launch`.

---

## Quick Reference

### Routing ladder (decide before any mode)

|| Question | Mode |
||:---|:---|
|| 'Run this query and show me the results' | query |
|| 'Which query is slow, and what does its plan say?' | diagnose |
|| 'What index makes this fast without breaking writes?' | index |
|| 'Who may see this row, and is it proven?' | guard |
|| 'Will production stay healthy under load?' | operate |

Order: query → diagnose → index → guard → operate. Get the data, find the bottleneck, fix access paths, lock down rows, then harden operations.

### Verification gate (every mode)

- The target is named: exact query, table, policy, or connection symptom — never "the database is slow".
- Every recommendation cites the mechanism (plan node, stat row, policy test) that proves it.
- Index changes state write cost and use `CONCURRENTLY` on production tables.
- RLS changes ship with a verification test showing allowed and denied rows.
- Production commands are read-only first; mutating commands are flagged before delivery.
- Query mode: credentials never appear in output; connection config is permission-checked before use.

### Suite contracts

- Application code using the tuned queries → `webdev`.
- Deploying migrations, pools, or partitions → `devops`.
- Verifying the app release built on this database → `qa-launch`.

---

## Procedure

1. **Intake.** establish the target (query text, table, policy, or symptom) and the environment (self-hosted version or Supabase project ref, which database type) before touching anything — tuning without a target optimizes noise.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → default to diagnose, state the assumption, proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver SQL plus evidence where the operator expects it.

---

## Pitfalls

- Tuning without `EXPLAIN (ANALYZE, BUFFERS)` — guessing which index helps.
- Adding indexes for every filter — write amplification and bloat; prove with the plan.
- RLS policies calling `auth.uid()` per row instead of `(select auth.uid())` — full-scan penalty on every query.
- `SECURITY DEFINER` functions or `security_invoker = false` views in public schemas — privilege escalation path.
- Pooling in session mode by default — exhausts connections; transaction mode fits most apps.
- Long transactions and missing FK indexes — lock queues and cascade scans.
- Random UUIDv4 PKs on large tables — index fragmentation; prefer identity or UUIDv7.
- Running write queries through the query mode — the query mode is read-only by default; INSERT/UPDATE/DELETE/MERGE are rejected at the gate.
- Credentials in error output — query mode sanitizes authentication errors before display.

---

## Verification

- [ ] Exactly one mode resolved and its reference playbook followed end to end.
- [ ] Target named: query, table, policy, or symptom with environment.
- [ ] Every recommendation traces to plan output, stat row, or test evidence.
- [ ] Index DDL states write cost and uses `CONCURRENTLY` for production.
- [ ] RLS work ships passing verification tests (allowed and denied rows).
- [ ] Query mode: read-only enforced, credentials sanitized, timeout/row-cap honored.
- [ ] No Supabase platform ops duplicated; links used instead.
- [ ] App-code, infra, and release work routed to `webdev`, `devops`, `qa-launch`.
