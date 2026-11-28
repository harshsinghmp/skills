# audit — incident-response audit mode

## When to Use

- **IR-readiness audit**: verify the response capability exists BEFORE the incident — policy, playbooks, roles, exercises — per NIST SP 800-61r3 (CSF 2.0).
- **Post-incident controls audit**: after recovery, verify the lessons-learned actions actually landed (ID.IM-03), not just got written down.
- **Third-party readiness**: confirm MSSP/CSP responsibilities and authority boundaries are defined in contract, not assumed.

## Checklist

- [ ] IR policy exists with the NIST key elements: management commitment, scope, incident definitions, roles and authorities (who may disconnect/shut down), prioritization guidelines, performance measures
- [ ] Playbooks documented for the most common incident types AND the urgent edge cases (e.g. primary auth platform redeploy) — CISA playbook format
- [ ] Severity matrix is actionable: each level names the first-15-minutes actions, comms template, and decision authority
- [ ] On-call reality: rotation exists, escalation path Tier 1/2/3 has named humans with direct contacts, handoff procedure documented
- [ ] Exercises: tabletop or simulation run within the last 2 cycles (ID.IM-02) — findings tracked to closure
- [ ] Improvement loop (ID.IM-01/03): post-incident/lessons-learned actions have owners and are verified landed, not just logged
- [ ] Communication templates ready: status page, client notification, internal broadcast — pre-written, not improvised
- [ ] Evidence handling: logs and artifacts preserved with chain-of-custody intent; clocks synchronized
- [ ] Third-party boundaries: MSSP/CSP authority to act (contain, deactivate) explicitly defined in contract
- [ ] Blameless discipline: postmortems identify process/tool fixes, not people to punish
- [ ] Detection-to-declaration path timed: how long from first signal to declared incident, measured from the last real incident

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| No playbook for a known-recurring incident type | `REQUEST-CHANGES` | author it before the next on-call rotation |
| Tabletop not run in 2+ cycles | `REPORT-ONLY` | schedule one (CISA packages) |
| Improvement actions logged but unlanded | `REQUEST-CHANGES` | assign owners, verify closure |
| Authority-to-act undefined for a provider | `REPORT-ONLY` | contract review |

## Sources

- NIST SP 800-61r3 — Incident Response Recommendations (CSF 2.0 profile): policy elements, ID.IM-01/02/03 improvement loop
- CISA — Cybersecurity Incident & Vulnerability Response Playbooks (playbook format)
- NIST SP 800-84 — Test, Training, and Exercise Programs (tabletop cadence)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
