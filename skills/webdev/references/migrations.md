# migrations — Migrations: inventory, URL map, staged execution, rollback plan.

## Intake

- From → to (platforms/versions)
- Content inventory and URL count
- SEO equity at stake (traffic, rankings)
- Downtime tolerance and freeze windows

## Deliverable

Migration plan: full inventory, URL/redirect map, execution stages with go/no-go gates, SEO equity preservation (canonicals, sitemaps, GSC actions), and the rollback plan.

## Procedure

1. Inventory everything: URLs, content types, integrations, redirects needed.
2. Build the URL map old→new; every URL resolves (200 or 301), zero 404s tolerated.
3. Stage execution: content → templates → integrations → cutover, each verified before the next.
4. SEO preservation: 301s live at cutover, sitemaps resubmitted, GSC monitored for coverage shifts.
5. Freeze content during cutover; communicate the window.
6. Go/no-go gate at each stage; rollback plan executable within one command/script.
7. Post-cutover: crawl the new site fully; diff key pages (titles, canonicals, rendered content).

## Quality gate

- [ ] URL map complete — every URL accounted for.
- [ ] Staged execution with go/no-go gates.
- [ ] Non-destructive schema migration verified: zero immediate column/table drops or in-place breaking type renames in single PRs.
- [ ] Safe Expand-Contract phase planned (Additive column → Dual-write / backfill → Switch reads → Deferred contract drop).
- [ ] Rollback plan executable.
- [ ] 301s live and verified at cutover.
- [ ] Post-cutover crawl clean.

## 🧱 The Non-Destructive Database Migration Protocol (Zero-Downtime Rule)

Destructive schema migrations (dropping columns, changing data types, dropping tables) instantly crash running backend servers executing older queries during rolling zero-downtime deployments. All database modifications must strictly follow the **Expand-Contract Pattern**:

### 1. The 3-Phase Expand-Contract Cycle
1. **Phase 1: Expand (Additive Only)**:
   - Add new columns as `NULLABLE` or with safe default values.
   - Deploy backend code that reads from old column but *dual-writes* to both old and new columns.
   - *Never* drop the old column or rename it in Phase 1.
2. **Phase 2: Backfill (Batched Off-Peak)**:
   - Run an asynchronous worker/script to backfill historical rows from old column to new column in chunks (e.g. 1,000 rows/batch with pacing) to avoid database table locks.
   - Verify 100% data parity between old and new columns.
3. **Phase 3: Contract (Deprecate & Drop)**:
   - Switch application reads entirely to the new column.
   - Verify zero queries touch the old column in telemetry/logs.
   - Drop the deprecated column in a separate, isolated migration deploy scheduled at least 24–48 hours after application cutover.

### 2. Forbidden Migration Operations in Feature PRs
- `DROP TABLE` or `DROP COLUMN` without a prior deprecation release.
- `RENAME COLUMN` (always add new column, sync data, then drop old column).
- `ALTER TABLE ... ALTER COLUMN ... TYPE ...` without an intermediate transition column.
- Adding non-null constraints without a default value on existing populated tables.

## Routing

- Schema: expand→migrate→contract — additive first, dual-write + batched backfill off the hot path, switch reads, destructive drops alone in a later deploy with a tested down path; large indexes without blocking writes.
- Code: strangler (parallel run, shift traffic 0→canary→50→100→remove) or adapter (old interface, new impl), flag-decoupled when risky; the owner migrates users (churn rule); zombie code gets an owner or a deprecation plan — never limbo.
- Deprecation contract: label every deprecation advisory (recommended move, nothing breaks) vs compulsory (removal date + migration path); design-for-removal (name an expiry owner + date at introduction). Source: `addyosmani/agent-skills` (`deprecation-and-migration`).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.

