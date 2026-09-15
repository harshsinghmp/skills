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

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
