# optimize — Database: query rewrites, execution plan diffing, memory parameter tuning, and deadlock elimination.

Consolidates all database-optimizer capabilities directly into the database department.

## Intake

- Slow query SQL text and current latency / execution statistics
- Target database engine and version (PostgreSQL 14–17, MySQL 8.x, SQLite, etc.)
- Current table schemas, row counts, and existing index definitions
- Execution plan: output of `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` (Postgres) or `EXPLAIN FORMAT=JSON` (MySQL)
- Memory and connection context: available server RAM, pool size, concurrent worker counts
- Default stack: PostgreSQL with `pg_stat_statements` enabled, pgAdmin / psql CLI, or MySQL with Performance Schema.

## Deliverable

A production-ready database optimization packet:
1. **Execution Plan Breakdown**: Baseline cost, actual timing, disk reads vs buffer cache hits, and exact bottleneck operator identified (Seq Scan, Hash Join spill, Nested Loop).
2. **Optimized SQL / Query Rewrite**: Drop-in replacement query eliminating non-SARGable predicates, subquery bottlenecks, or unneeded table joins.
3. **Index Strategy**: DDL statements for covering indexes (`INCLUDE`), partial indexes, or composite indexes ordered by equality-first then range.
4. **Engine & Memory Tuning Recommendations**: Calibrated `work_mem`, `shared_buffers`, `effective_cache_size`, or `innodb_buffer_pool_size` formulas.
5. **Lock Contention & Deadlock Hardening**: Concurrency patterns (`SKIP LOCKED`, lock timeouts, consistent lock ordering).
6. **Validation Proof**: Before vs. after execution time and buffer read-to-hit ratio comparison.

## Procedure

### 1. Capture & Read the Execution Plan
Always capture plans with buffer statistics enabled to measure true disk I/O:
```sql
-- PostgreSQL: expose cache hits, buffer reads, and memory spills
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
<query>;

-- MySQL: expose cost and join evaluation order
EXPLAIN FORMAT=JSON
<query>;
```

#### Key Execution Plan Diagnostic Patterns:
| Pattern Found in Plan | Root Cause Symptom | Remedy |
| :--- | :--- | :--- |
| `Seq Scan on <table_name>` | Full table scan; lack of selective index | Add B-Tree index on filtered column(s) |
| `Nested Loop` with large outer set | Inner scan executed tens of thousands of times | Add index on inner join key or rewrite to Hash Join |
| `Sort Method: external merge Disk: XkB` | Sort data exceeds allocated memory | Increase `work_mem` for the query session |
| `Buffers: hit=12 read=45000` | Cold cache or missing index forcing physical reads | Add covering index (`INCLUDE`) or tune cache |
| Rows actual=50000 est=1 | Outdated query planner statistics | Run `ANALYZE <table>;` |

### 2. Query Rewriting Patterns
1. **Eliminate Non-SARGable Predicates**:
   - *Anti-Pattern*: `WHERE DATE(created_at) = '2026-09-21'` (prevents index utilization).
   - *Remedy*: `WHERE created_at >= '2026-09-21 00:00:00' AND created_at < '2026-09-22 00:00:00'`.
2. **Correlated Subqueries to Anti-Joins**:
   - *Anti-Pattern*: `WHERE id NOT IN (SELECT user_id FROM orders)` (slow with NULL values).
   - *Remedy*: `WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)` or `LEFT JOIN ... WHERE orders.user_id IS NULL`.
3. **Avoid Offset Pagination**:
   - *Anti-Pattern*: `OFFSET 100000 LIMIT 20` (scans and discards 100,000 rows).
   - *Remedy*: Keyset pagination: `WHERE (created_at, id) < (:last_created_at, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20`.
4. **PostgreSQL CTE Optimization**:
   - Use `WITH my_cte AS MATERIALIZED (...)` when you need to prevent multiple evaluations of a complex subquery.
   - Omit `MATERIALIZED` in Postgres 12+ when you want the optimizer to push predicates into the CTE.

### 3. High-Performance Indexing Architecture
1. **Covering Indexes (`INCLUDE`)**:
   Eliminate table heap fetches entirely by indexing filter columns and including projected columns:
   ```sql
   CREATE INDEX CONCURRENTLY idx_orders_user_status_covering
       ON orders (user_id, status)
       INCLUDE (total_amount, created_at);
   ```
2. **Partial Indexes**:
   Index only the active working set (e.g., pending tasks, unpaid invoices) to keep the index compact and cached in RAM:
   ```sql
   CREATE INDEX CONCURRENTLY idx_orders_unfulfilled
       ON orders (created_at)
       WHERE status IN ('pending', 'processing');
   ```
3. **Composite Index Column Ordering**:
   Order columns: `(Equality Columns, Range/Inequality Columns)`.

### 4. Engine & Memory Parameter Tuning
- **PostgreSQL**:
  - `shared_buffers`: 25% of total system RAM for dedicated database hosts (capped at 32GB to avoid OS cache double-buffering).
  - `effective_cache_size`: 50%–75% of total system RAM (informs planner how much OS cache is available).
  - `work_mem`: `(Total RAM - shared_buffers) / (max_connections * 3)`. Set higher per session for complex reporting jobs: `SET LOCAL work_mem = '128MB';`.
  - `maintenance_work_mem`: 1GB to 2GB for fast index creation and autovacuum passes.
  - `random_page_cost`: Lower from default `4.0` down to `1.1` on modern NVMe/SSD storage.
- **MySQL / InnoDB**:
  - `innodb_buffer_pool_size`: 70%–80% of total system RAM.
  - `innodb_log_file_size`: 25% of buffer pool size for high write throughput.
  - `innodb_flush_log_at_trx_commit`: Set to `2` for non-financial high-throughput workloads.

### 5. Lock Contention & Deadlock Elimination
1. **Queue & Job Processing**:
   Always use `SKIP LOCKED` to prevent concurrent workers from blocking on the same rows:
   ```sql
   SELECT id, payload FROM task_queue
   WHERE status = 'queued'
   ORDER BY scheduled_at ASC
   FOR UPDATE SKIP LOCKED
   LIMIT 10;
   ```
2. **Consistent Lock Ordering**:
   Ensure all application transactions acquire locks on multiple rows in identical order (e.g. sorted by primary key `ORDER BY id ASC`).
3. **Lock Timeouts**:
   Never allow an unprivileged query to wait indefinitely for a lock:
   ```sql
   SET statement_timeout = '10s';
   SET lock_timeout = '2s';
   ```

## Quality gate

- [ ] Baseline execution plan captured with `BUFFERS` enabled.
- [ ] Disk-to-buffer cache read ratio identified before optimization.
- [ ] Non-SARGable expressions rewritten into range or direct comparison predicates.
- [ ] Indexes created with `CONCURRENTLY` (Postgres) or `ALGORITHM=INPLACE` (MySQL) to avoid table locks.
- [ ] Parameter tuning (`work_mem`, `shared_buffers`) grounded in actual server hardware.
- [ ] Before vs. after execution time and buffer read counts recorded in deliverable.

## Sources

- PostgreSQL Global Development Group Official Documentation (Performance Tips & EXPLAIN).
- Use The Index, Luke! (Markus Winand SQL Indexing and SARGability Standards).
- High Performance MySQL (4th Edition, Baron Schwartz).
