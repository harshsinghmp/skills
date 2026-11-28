# Data Invariant Review

Finds every write path that can skip a required data invariant, gives the invariant one
enforceable owner below the application layer, and proves the gap with a test that fails
before the fix.

## When to Use

- A column such as `tenant_id`, `org_id`, `status` or `deleted_at` is set in several
  handlers and a newly added path forgets it.
- Production rows violate a rule the team believes the application enforces ("the service
  always sets it").
- A query returns rows it should not: another tenant's data, soft-deleted records, orphaned
  children.
- A new writer appeared beside the existing ones — background job, queue consumer, webhook,
  import, admin tool, migration.
- A constraint is documented as "handled in the app layer" with no test proving it, or a
  review cannot say where a business rule is actually guaranteed.

## Procedure

1. State the invariant as one testable sentence with its failure mode, not as a category:
   "every `documents` row has `tenant_id` matching its author's tenant and is never null;
   violating rows leak across tenants". One invariant per review — compound rules hide which
   part is unenforced.
2. Enumerate write paths exhaustively, and only then reason about them. Collect from: ORM
   models and every caller of their create/update/upsert helpers, raw
   `INSERT`/`UPDATE`/`UPSERT`/`COPY` in migrations and database functions, background jobs
   and queue consumers, webhook handlers, seed and fixture loaders, admin or back-office
   surfaces, CSV and bulk imports, cache or materialized-view refreshes, replicas and CDC
   consumers, and the test fixtures that will bake the bug into future tests. Grep for the
   table name and for the ORM method, not just the obvious handler. Produce a table: path |
   file:line | sets the invariant? | evidence.
3. Identify the current owner by reading the schema rather than the code comments: `NOT
   NULL`/`CHECK`/foreign key, trigger, RLS `WITH CHECK`, column default, or application code
   only. Application-only enforcement is the finding, not the fix.
4. Choose the enforcement point, as deep as the semantics allow: database constraint >
   trigger (only when the rule spans rows or derives from another table) > RLS `WITH CHECK`
   (for tenant or owner isolation) > one repository/DAO write method > each handler. If you
   stop above a database constraint, write down why the deeper layer cannot express the rule.
   The application check survives only as a friendly error message; it stops being the
   guarantee.
5. Make the bypass structurally impossible rather than discouraged: `NOT NULL` plus `CHECK`,
   foreign keys with `ON DELETE RESTRICT`, composite foreign keys (`tenant_id, parent_id`) so
   a child cannot reference another tenant's parent, `WITH CHECK` on the tenant policy,
   removal of defaults that mask a missing value, and revoked insert/update grants on the
   table for roles whose writes must go through a function.
6. Prove it with a test that fails before the fix. The test must exercise the path that
   skipped the invariant — the job, import or handler — not the happy service method. Assert
   either the rejection (constraint violation, error code) or the absence of the bad row. Run
   it against the pre-fix schema, capture the output, and place that evidence in the change
   description. Cover both directions: valid writes still succeed, invalid writes are
   rejected.
7. Migrate existing bad rows without a single-shot constraint and without downtime:
   - Measure first: count offending rows grouped by write path and by age, so repair effort
     and risk are known before anyone writes SQL.
   - Repair from a real source — join to the parent, the audit log, the checkout or the event
     record. Never infer a tenant or owner from a guess; list unrecoverable rows for a human
     decision with an owner.
   - Guard while repairing: add the constraint `NOT VALID` (or the trigger) so new invalid
     writes are blocked immediately while legacy rows are still bad.
   - `VALIDATE CONSTRAINT` after the backfill. On large tables sequence index creation and
     validation as `CREATE INDEX CONCURRENTLY` or windowed batches, coordinated through
     `migrations.md`.
   - Keep the repair script in the repository, idempotent, re-runnable, with a dry-run mode
     and the count it expects to touch.
8. Lock the door for the next writer: add the new path to the enumerated list kept in the
   test or the doc, and add a mechanical check where one is possible (schema diff, lint,
   generated-type review). Route related work outward — RLS policy authoring to `guard.md`,
   multi-writer schema sequencing to `migrations.md`, duplicated write logic behind the gap
   to `../../../quality-review/code-review/references/coupling-audit.md`.

## Verification

- The invariant is written as one testable sentence with an explicit failure mode.
- The write-path table covers every path that touches the table, including jobs, imports,
  admin tools, seeds and database functions, each with file:line.
- The enforcement point is named, with a stated reason any higher layer is insufficient.
- A test through a bypass path fails on the pre-fix schema and passes after; the pre-fix
  failure output is recorded.
- A valid write through that same path still succeeds — the constraint rejects only the
  invalid case.
- Existing bad rows are counted, repaired from an identified source, and unrecoverable rows
  are listed with an owner.
- The constraint reached production without a failing deploy: `NOT VALID` → backfill →
  `VALIDATE`, with the dry-run script retained.
- The application-layer check remains only as a user-facing message; the database is the
  guarantee.

## Anti-Patterns

- Adding the missing `tenant_id = …` assignment to the fourth handler, which leaves the fifth
  path to be discovered by an incident.
- Adding the constraint in one shot against legacy rows, watching the migration fail, and
  reverting — the invariant stays unenforced a while longer.
- Treating a green happy-path test as proof when the bug exists only on the path the test
  never calls.
