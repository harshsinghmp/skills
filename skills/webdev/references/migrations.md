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
- [ ] Rollback plan executable.
- [ ] 301s live and verified at cutover.
- [ ] Post-cutover crawl clean.

## Routing

- Schema: expand→migrate→contract — additive first, dual-write + batched backfill off the hot path, switch reads, destructive drops alone in a later deploy with a tested down path; large indexes without blocking writes.
- Code: strangler (parallel run, shift traffic 0→canary→50→100→remove) or adapter (old interface, new impl), flag-decoupled when risky; the owner migrates users (churn rule); zombie code gets an owner or a deprecation plan — never limbo.
- Deprecation contract: label every deprecation advisory (recommended move, nothing breaks) vs compulsory (removal date + migration path); design-for-removal (name an expiry owner + date at introduction). Source: `addyosmani/agent-skills` (`deprecation-and-migration`).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
