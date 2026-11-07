# audit — crm audit mode

## When to Use

- **CRM & deliverability audit**: verify the domain can actually reach inboxes and the contact database is not actively burning sender reputation.
- **Data-quality audit**: quantify decay, duplicates, and unusable records before a campaign or migration.
- **Lifecycle-flow audit**: onboarding/abandon/winback/nurture sequences wired to real data and real exits.

## Checklist — authentication (do this first; failures override everything else)

- [ ] SPF record exists, starts `v=spf1`, includes EVERY sending service (ESP, CRM, support tool, transactional) — the recently-added service is the classic miss
- [ ] SPF DNS lookups ≤10 (hard limit — authentication fails above it)
- [ ] Record ends `-all` (hard fail) or `~all` (soft fail); no deprecated `ptr`/`exists`
- [ ] DKIM enabled for all sending services; keys ≥2048-bit (1024 is weak); selectors published; signatures validating on a real send
- [ ] DMARC exists at `_dmarc.<domain>`; policy progressed past `p=none` to `p=quarantine`/`p=reject`; `rua` aggregate reports collected and actually reviewed; SPF/DKIM alignment passes against the From: header
- [ ] Google/Yahoo bulk-sender requirements met (one-click unsubscribe `List-Unsubscribe-Post`, spam-rate discipline) for >5k/day senders

## Checklist — list hygiene & data quality

- [ ] Bounce rate <2% per campaign (hard <0.5%); hard bounces suppressed immediately; soft bounces suppressed after 3–5 consecutive failures
- [ ] Spam complaints <0.1–0.3%
- [ ] List verified within 90 days; unengaged 6-month subscribers suppressed or re-verified
- [ ] Role accounts (`info@`, `sales@`) segmented or removed; disposable addresses purged; no purchased lists
- [ ] Double opt-in on signup forms; real-time validation on entry
- [ ] Duplicate records merged (exact + fuzzy: "Bob Smith" vs "Robert Smith"); B2B data decays ~30%/year — schedule re-verification every 3–6 months
- [ ] Required fields standardized; records with no consent source removed

## Checklist — flows & instrumentation

- [ ] Segmentation reflects engagement (not just firmographics); lifecycle stages map to actual behavior
- [ ] Onboarding/abandon/winback/nurture flows: entry triggers fire, exits exist, suppressed contacts are respected everywhere
- [ ] Unsubscribe processed within 2 business days; monitored reply-to address
- [ ] Metrics monitored: bounce, complaint rate, open/click trends — alerts on regression

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Authentication failing (SPF/DKIM/DMARC) | `CRITICAL` | fix before any other send activity |
| Bounce rate >2% or complaints >0.3% | `REQUEST-CHANGES` | stop the campaign; clean the list |
| Contacts with no consent record | `REQUEST-CHANGES` | remove — legal exposure, not hygiene |
| Stale duplicates / decay | `AUTO-REPAIR` | merge + schedule re-verification |
| Flow with no exit condition | `REPORT-ONLY` | `crm:nurture` redesign |

## Sources

- Kawaa / DeliverabilityChecker — Email Deliverability Audit (SPF ≤10 lookups, DKIM 2048-bit, DMARC policy progression)
- Reform — CRM Setup for Email Deliverability (Google/Yahoo bulk-sender requirements; 30%/yr B2B data decay)
- Salesforce research — contact-record completeness figures cited above
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
