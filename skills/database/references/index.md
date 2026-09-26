# index — Missing, composite, covering, and FK indexes plus N+1 patterns.

Default stack: self-hosted Postgres 16+, btree default. Defaults: `CREATE INDEX CONCURRENTLY` on any production table; one composite beats two singles; `INCLUDE` for select-only columns; partial index when the filter is a stable subset; GIN for jsonb and full-text, HNSW for pgvector (see `operate`).

## Intake

- Target query plus its `EXPLAIN` output (or route through `diagnose` first).
- Table sizes and write rate (indexes tax every write — state the cost).
- Data patterns: N+1 loops, bulk loads, upserts, keyset vs offset pagination.

## Deliverable

Index DDL (production-safe with `CONCURRENTLY`) with a write-cost note per index, plus the access-pattern fix (batch, upsert, or pagination rewrite) where applicable.

## Procedure

1. Cover WHERE and JOIN columns first — the 100–1000x win:
```sql
create index concurrently orders_customer_id_idx on orders (customer_id);
```
2. Find unindexed foreign keys (slow JOINs and CASCADE scans) and index every one:
```sql
select conrelid::regclass as table_name, a.attname as fk_column
from pg_constraint c join pg_attribute a
  on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f' and not exists (
  select 1 from pg_index i
  where i.indrelid = c.conrelid and a.attnum = any(i.indkey));
```
3. Multi-column filters get one composite, equality columns first, range last:
```sql
create index concurrently orders_status_created_idx on orders (status, created_at);
```
Leftmost-prefix rule: the index serves `status = ?` and `status = ? AND created_at > ?`, never a bare `created_at > ?` filter.
4. Eliminate heap fetches with covering indexes for hot select lists:
```sql
create index concurrently users_email_idx on users (email) include (name, created_at);
```
5. Shrink the index with a partial when the hot subset is stable:
```sql
create index concurrently orders_pending_idx on orders (customer_id) where status = 'pending';
```
6. Fix the access pattern, not just the index:
   - N+1 loop → single JOIN or batched `where id = any($1)`.
   - Bulk load → one multi-row `insert ... values (...), (...)` (batch-inserts).
   - Re-insert races → `insert ... on conflict (key) do update set ...` (upsert).
   - Deep pages → keyset pagination (`where id > $1 order by id limit $2`), never growing `offset`.

## Quality gate

- [ ] Every index traces to a plan node or the FK-gap query — no speculative indexes.
- [ ] Composite column order follows equality-first, range-last.
- [ ] Production DDL uses `CONCURRENTLY`; write cost stated per index.
- [ ] Partial index predicate matches a stable, proven subset.
- [ ] N+1, bulk, and pagination patterns addressed where the intake shows them.

## Routing

- Slow query with no plan yet → `diagnose` first, then return with evidence.
- RLS-wrapped access path → `guard` (policy shape changes the index choice).
- Vector similarity search → `operate` for HNSW basics, and `vector-search.md` for rendering index choice, payload filters, and hybrid search.
- App-side loop rewrites → `webdev` implements; this mode owns the SQL pattern.

## Sources

- Postgres docs: multicolumn indexes, index-only scans.
- Supabase guides: query optimization, jsonb indexing, full-text search.
- When a cited source conflicts with a default above, the source wins — record the override and why.
