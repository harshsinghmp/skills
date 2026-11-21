# 🗄️ refactor:database — Database Schema & Query Refactoring Playbook

> **Executive Scope**: Zero-downtime database schema refactoring, non-breaking column migrations, query optimization, indexing strategies, and N+1 query elimination.

---

## 1. Zero-Downtime Schema Refactoring (Expand / Contract Pattern)

Never execute destructive schema changes (`ALTER TABLE ... DROP COLUMN` or renaming active columns) in a single migration on a live production database.

### The 4-Phase Migration Lifecycle:
```
[ PHASE 1: EXPAND ]
- Add new column/table alongside existing structure (nullable or with default)
- Deploy code that dual-writes to both old and new columns
               │
               ▼
[ PHASE 2: BACKFILL ]
- Asynchronously backfill historical data from old column to new column in batches
- Verify data consistency between old and new columns
               │
               ▼
[ PHASE 3: SWITCH READS ]
- Deploy code that reads from the new column and writes only to the new column
- Deprecate old column in application code
               │
               ▼
[ PHASE 4: CONTRACT ]
- Drop old column/table in a safe follow-up migration once traffic is verified
```

---

## 2. Query Refactoring & N+1 Elimination

### Anti-Pattern: N+1 ORM Queries
```typescript
// ❌ BAD: 1 query for authors + N queries for posts
const authors = await db.query.authors.findMany();
for (const author of authors) {
  const posts = await db.query.posts.findMany({ where: eq(posts.authorId, author.id) });
}

// ✅ REFACTORED: Batched lookup with single IN clause or JOIN
const authorIds = authors.map(a => a.id);
const allPosts = await db.query.posts.findMany({
  where: inArray(posts.authorId, authorIds)
});
```

---

## 3. Index Refactoring & Safe DDL Operations

- **Concurrent Index Creation**: In PostgreSQL, always use `CREATE INDEX CONCURRENTLY` to avoid taking an exclusive lock on the table.
- **Covering Indexes**: For high-frequency queries, include the selected columns in the index payload (`CREATE INDEX idx_user_status ON users(status) INCLUDE (email, created_at)`).
- **Composite Index Column Order**: Put highest-cardinality equality columns first, followed by range/sort columns.

---

## 4. Verification Gate

- [ ] Schema changes verified against production volume using staging replica.
- [ ] `EXPLAIN ANALYZE` confirms query execution plans switch from Seq Scan to Index Scan.
- [ ] Migration rollback script tested and verified.
- [ ] Zero locks held longer than 100ms.
