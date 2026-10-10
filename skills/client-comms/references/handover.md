# handover — Project handover: docs, credentials, training, and support terms.

## Intake

- Deliverables shipped and where they live (repo, hosting, dashboards)
- Credentials inventory (registrar, hosting, CMS, analytics, app stores)
- Support terms agreed (duration, channel, response time, what is billable)

## Deliverable

Handover pack: architecture/runbook doc, credential transfer log, training session + recording, support-terms sheet with billable boundaries.

## Procedure

1. Document the runbook: deploy, rollback, backup, common fixes — tested by following it once. For design deliverables, ship a dev-ready spec: token names (never raw hex), every component state, truncation/char limits, min/max content scenarios, and the asset inventory (named SVG icons, responsive image variants, fonts).
2. Transfer credentials via the client's password manager (assume Bitwarden; generic-manager fallback); rotate shared secrets; log every item transferred.
3. Run the training session (record it): daily tasks the client owns, what breaks if ignored, when to call support.
4. State support terms in writing: what is included, response times, what bills extra — signed before closeout.
5. Solo: training session becomes a short recorded walkthrough or annotated runbook the client can follow alone.
6. Type every runbook page before drafting: how-to per task (outcome first), troubleshooting as symptom → cause → fix → verify, reference for exact values — never mix types on one page.

## Quality gate

- [ ] Runbook tested by execution, not by reading.
- [ ] Every credential transferred and logged; shared secrets rotated.
- [ ] Support terms signed; billable boundary explicit.
- [ ] Built output verified against the spec (tokens, states, breakpoints, real content, reduced motion) before sign-off.
- [ ] Runbook pages typed (how-to/troubleshooting/reference); troubleshooting follows symptom → verify.

## Routing

- Deploy/credential mechanics → `devops`; internal closeout/retro → `ops`; visual-impl QA fails → `refactor-ui` (polish mode).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
