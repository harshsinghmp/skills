# migrations — Zero-Downtime Database Migration & Locking Guard

Zero-downtime database migrations, DDL lock simulation, table rewrite prevention, and unindexed foreign key share-lock protection for high-traffic production environments.

Default stack: PostgreSQL 16+ (Supabase, Neon, AWS RDS/Aurora, self-hosted). Applicable to MySQL 8+ and SQLite (WAL mode). Every migration must execute without blocking live application traffic or holding destructive locks.

---

## Intake

- Migration SQL scripts, Drizzle schema diffs, Prisma migrate files, or raw DDL statements.
- Production database engine and version.
- Table row counts, write concurrency rates, and existing foreign key topology.
- Target deployment window and traffic constraints.

---

## Deliverable

A comprehensive Zero-Downtime Migration Verification Report:
- DDL lock-level classification matrix (Levels 1–8: `ACCESS_SHARE` to `ACCESS_EXCLUSIVE`).
- Table rewrite risk assessment (identifying full page re-allocations).
- Safe multi-step Expansion/Contraction remediation plan for schema evolutions.
- Unindexed Foreign Key Share-Lock hazard audit.
- Automated migration guard check command output.

---

## The 8 Zero-Downtime Safe DDL Invariants

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 POSTGRES DDL LOCK MATRIX & SAFETY HIERARCHY                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Level 8: ACCESS EXCLUSIVE      │ Blocks ALL reads & writes                  │
│ • ALTER TABLE, DROP, TRUNCATE  │ ❌ NEVER hold on live table without timeout │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Level 5: SHARE                 │ Allows reads, blocks writes                │
│ • CREATE INDEX (non-concurrent)│ ❌ NEVER run without CONCURRENTLY          │
├────────────────────────────────┼────────────────────────────────────────────┤
│ Level 4: SHARE UPDATE EXCLUSIVE│ Allows concurrent reads AND writes         │
│ • CREATE INDEX CONCURRENTLY    │ ✅ SAFE for zero-downtime online execution │
│ • VALIDATE CONSTRAINT          │ ✅ SAFE for online constraint validation   │
└────────────────────────────────┴────────────────────────────────────────────┘
```

1. **Lock Timeout Rule**: Every migration transaction must declare `SET lock_timeout = '2s';` and `SET statement_timeout = '30s';` before executing DDL. If a long-running read holds a conflicting lock, the migration fails fast rather than queueing and blocking all incoming traffic behind it.
2. **Concurrent Indexing Rule**: Never run `CREATE INDEX` or `DROP INDEX` without `CONCURRENTLY`. A non-concurrent index build takes a `SHARE` lock, blocking all `INSERT`, `UPDATE`, and `DELETE` queries for the entire duration of the build.
3. **Non-Blocking Constraints Rule**: Adding foreign keys or check constraints must always use `NOT VALID` (instant Level 8 lock, ~5ms). Validate in a separate subsequent transaction using `ALTER TABLE ... VALIDATE CONSTRAINT` (Level 4 `SHARE UPDATE EXCLUSIVE` lock, zero write interruption).
4. **Zero Volatile Defaults Rule**: Never add a column with a volatile default function (e.g., `DEFAULT clock_timestamp()`, `DEFAULT gen_random_uuid()`) on an existing populated table. In PostgreSQL, volatile defaults force a full table rewrite holding `ACCESS EXCLUSIVE`.
   - *Safe Path*: Add column without default -> Set default for new rows -> Backfill historical rows in non-blocking batches.
5. **Expansion/Contraction (Parallel Run) Protocol**: Never rename columns, drop active columns, or alter column data types in-place:
   - **Phase 1 (Expand)**: Add the new column/table alongside the old one.
   - **Phase 2 (Dual-Write)**: Application writes to both old and new columns.
   - **Phase 3 (Backfill)**: Backfill historical rows in indexed batches (e.g., 5,000 rows/sec).
   - **Phase 4 (Read Switch)**: Application switches primary reads to the new column.
   - **Phase 5 (Contract)**: Remove dual-write from application code, then drop the old column/table in a subsequent release.
6. **Unindexed Foreign Key Trap**: In PostgreSQL, updating or deleting rows in a parent table acquires a `SHARE` lock on the child table if the child table's foreign key column is not indexed, freezing all concurrent writes to the child table! Every foreign key column must have a supporting index.
7. **Batched DML Backfill Rule**: Never execute unbounded `UPDATE <table> SET col = 'val';` on tables with >50,000 rows. Always backfill in chunked batches (using primary key ranges) with transaction pauses to allow autovacuum to reclaim dead tuples.
8. **Short Transaction Invariant**: Never bundle DDL migrations with application DML queries in a single transaction block. Keep lock acquisition windows sub-second.

---

## Procedure

1. **Pre-Migration Safety Audit**:
   Run the autonomous migration guard against your SQL files:
   ```bash
   bun skills/agency-delivery/database/scripts/migration-guard.ts ./migrations/001_add_feature.sql
   ```
2. **Schema Foreign Key Scan**:
   Audit the entire database schema DDL for unindexed foreign key share-lock hazards:
   ```bash
   bun skills/agency-delivery/database/scripts/migration-guard.ts --schema ./schema.sql
   ```
3. **Automated CI/CD Gating**:
   Add migration validation to pre-commit or CI pull-request checks:
   ```bash
   bun skills/agency-delivery/database/scripts/migration-guard.ts ./migrations/ --fail-on-critical
   ```
4. **Expansion/Contraction Execution Steps**:
   When altering existing tables, generate the phased SQL migration scripts:
   ```sql
   -- Step 1: Add new column without blocking
   SET lock_timeout = '2s';
   ALTER TABLE orders ADD COLUMN total_amount_cents bigint;

   -- Step 2: Add validation check constraint non-blocking
   ALTER TABLE orders ADD CONSTRAINT check_total_cents CHECK (total_amount_cents >= 0) NOT VALID;
   ALTER TABLE orders VALIDATE CONSTRAINT check_total_cents;

   -- Step 3: Add supporting index concurrently
   CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders (customer_id);
   ```

---

## Quality Gate

- [ ] `SET lock_timeout = '2s'` prepended to migration script.
- [ ] All `CREATE INDEX` and `DROP INDEX` use `CONCURRENTLY`.
- [ ] Foreign keys added with `NOT VALID` and validated in a separate step.
- [ ] Zero in-place column type alterations (`ALTER COLUMN TYPE`).
- [ ] Zero volatile column defaults on existing tables.
- [ ] All foreign key columns on child tables verified indexed.
- [ ] `bun skills/agency-delivery/database/scripts/migration-guard.ts` exits with code 0.

---

## Routing

- Read-only query execution & defense-in-depth safety → `database:query`.
- Slow-query triage, EXPLAIN ANALYZE & pg_stat_statements → `database:diagnose`.
- Index design, covering indexes, and N+1 query patterns → `database:index`.
- Row-Level Security (RLS) & security invoker policies → `database:guard`.
- Connection pooling, partitioning, and vacuum tuning → `database:operate`.
