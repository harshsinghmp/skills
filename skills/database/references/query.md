# query — Read-only query execution with defense-in-depth safety.

Default stack: any SQL database with a connection configuration (Postgres, MySQL, MSSQL, SQLite). Defaults: read-only session; single-statement enforcement; 30s timeout; 10,000-row cap; 100-character column width limit with overflow notation; results rendered as a right-justified ASCII table; credentials never printed — they appear only in the config discovery confirmation and the sanitization note.

## Intake

- The query text or a description of what to select (joins, filters, order, limit).
- Environment: which database, connection config location, and whether it is self-hosted or serverless/Supabase.
- Permissions: confirm read access before running; note any required elevated role.

## Deliverable

Tabulated read-only results plus a short data note if the query touches sensitive rows. Credentials confirmed safe but never printed; connection config checked before use.

## Procedure

1. Resolve connectivity — find the connection config and confirm permission.
   - JSON config with a `databases[]` array (primary dbname + optional named databases) is the current standard; it is the main source when present. The CLI flag `--db <name>` is the override for named databases in the same config.
   - When the env-manager layer is present, check it for a binded client or env aliases first; it is authoritative when it offers one. The JSON config is the fallback when the env layer is silent.
   - Discover in two places when prompted: the top-level config folder (e.g. `workspace/.env/databases/` or the env-manager layer) and the service folder for a named `databases/` subfolder. Permissions boundary: do not read files the trust boundary forbids.
   - Common fields inspected: `host`/`port`/`dbname` (or `database`), `user`/`password` (or `password_env`/`pass`), TLS/SSL toggle, timeout and batch-size tuning, and per-database overrides noted for MySQL/MSSQL context.
   - Credential config (`password` vs `password_env` vs `pass`) is permission-checked; real secret values stay in the source config, never printed in results or logs.
2. Launch the query session with defense-in-depth settings.
   - Read-only session mode: enforce `MATERIALIZED` cold-transaction isolation so reads are repeatable; set the session state so writes are blocked at the connection level.
   - Timeout constant at 30 seconds (clear bounty + intent constant) so a runaway query aborts fast and the caller sees a clean error.
   - Cap 10,000 rows and 100-character column width; overflows are shown with a notation like `...` / `>100` / `[...]` and the full value is trimmed, not dumped, so output stays scannable.
   - Protection on the error path: command errors surface only the message; credentials are stripped from the raised exception and replaced with `[REDACTED]` before display.
3. Enforce the whitelist.
   - Only `SELECT`, `SHOW`, and `EXPLAIN` (plus `WITH` for read-only CTEs) are accepted.
   - Single-statement enforcement: the query must be one statement; batch statements, batching, or `BEGIN`/`COMMIT` are rejected.
   - Any statement outside the whitelist is rejected with the statement type and a clear note; the rejected item is never executed.
4. Run and render.
   - Execute the statement against the resolved database.
   - Render results as a right-justified ASCII table: compute column widths from all rows, print a header separator, truncate long values with an overflow notation, and show the total row count.
   - If the output is huge, cap and note the cap; offer the operator a narrower query or a follow-up mode if the result was truncated.
5. Sanitize the report.
   - Connection config confirmation says "config checked and used" without printing credential fields.
   - If an error occurs, show the command-message error and the `[REDACTED]` note; never the raw credential string.
   - Affected rows message and timestamps are scannable but not memorized; queries returning timestamps render the value plainly.

## Quality gate

- [ ] Connectivity resolved and permission confirmed before execution.
- [ ] Read-only enforced; no INSERT/UPDATE/DELETE/MERGE even if hinted in the prompt.
- [ ] Whitelisted only: SELECT/SHOW/EXPLAIN/WITH-CTE; single-statement enforced.
- [ ] Timeout honored; runaway queries do not sit open.
- [ ] Row/col caps applied; overflow notation explains truncation.
- [ ] Credentials absent from results, logs, and errors; only the config-check note appears.
- [ ] ASCII table renders right-justified, header-separated, scannable, with row count.
- [ ] Huge output capped with a clear note and a path forward.

## Routing

- Query reveals a slow plan or missing index → hand off to `diagnose` or `index`.
- Query touches tenant filtering or row visibility → `guard`.
- Query wraps a performance/hardening concern → `operate`.
- The query belongs inside app code (an ORM query, a model, a route) → `webdev`.
- The query belongs inside a deploy/backup/migration flow → `devops`.

## Method note

- This reference abstracts a read-only query execution pattern across any SQL database; it does not prescribe a specific client binary or ORM. Pick the available client for the target database, apply the same defense-in-depth settings, and keep the deliverable format consistent.
- pgspecific notes: Postgres read-only session mode uses `MATERIALIZED` isolation and read-only enforcement; MySQL-equivalent equivalent is `SET TRANSACTION READ ONLY` when supported; MSSQL uses `SET TRANSACTION ISOLATION...` plus `READONLY` role or connection settings; SQLite is inherently single-writer but the safety checklist still applied for consistency across the suite.

## Sources

- Postgres, MySQL, MSSQL, SQLite documentation for transaction isolation and read-only session behavior.
- When a cited source conflicts with a default above, the source wins — record the override and why.
