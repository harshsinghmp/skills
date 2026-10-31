# list — List building with CSV hygiene and enrichment verification.

## Intake

- ICP and target count — default: 100 accounts from the ICP, state the number, proceed.
- Source for net-new records — default: manual research plus existing CRM exports; no scraped data without consent basis.
- Enrichment fields required (title, email, company size) — default: name, title, verified email, company, size.
- Default stack: spreadsheet log plus CSV export where available, else a markdown table convertible to CSV.

## Deliverable

A clean prospect CSV: deduplicated, de-role-based, email-verified, enrichment-checked, with a hygiene report.

## Procedure

1. Build to the ICP: net-new records carry source and date at row level.
2. Compliance guardrails (source: `coreyhaines31/marketingskills` `prospecting`, G3 #5): no bulk scrape / no bypass — public-contact-channels only; source-URL+date provenance per contact; no breached data; no sensitive-trait targeting. Tag each contact High/Med/Low confidence with the sourcing rule stated.
2. Deduplicate on domain plus name; drop role-based addresses (info@, sales@) unless the ICP says otherwise.
3. Verify every email (syntax, domain, mailbox check); unverified rows quarantined, never sent.
4. Enrich and spot-check 10 percent manually; enrichment mismatches flagged per row.
5. Ship the CSV plus a hygiene report: counts in, duplicates dropped, unverified quarantined, enriched.
6. Enrich batch-first (accounts before people), fill only missing fields against existing data, and group the final list per account.

## Quality gate

- [ ] Zero duplicates on domain plus name.
- [ ] Zero role-based addresses unless ICP-justified.
- [ ] Every sent row email-verified; unverified quarantined.
- [ ] Hygiene report with counts attached.

## Routing

- Positioning or launch strategy questions → `growth`.
- Wording and copy craft → `content`.
- Status tracking and milestones → `ops`; results measurement → `analytics`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
