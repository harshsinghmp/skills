# audit — 360° Comprehensive Security & Governance Posture Audit.

## Intake

- Target application, cloud perimeter, infrastructure fleet, or agency repository
- Agent-era targets: AI agents, chatbots, RAG pipelines, MCP/tool ecosystems, and the repos whose CI runs them
- Compliance requirements and baseline security policies
- Default stack: Comprehensive synthesis across CVE, SAST, Cloud WAF, and Runtime gates.

## Deliverable

A senior security audit assessment synthesizing:
- Overall security posture score and executive SCQA briefing.
- Categorized risk matrix: Critical, High, Medium, Low findings.
- Prioritized remediation roadmap with effort vs impact scoring.
- Evidence ledger registration for audit trail.

## Procedure

1. **Perimeter & WAF Audit**: Check Cloud Armor / Cloudflare WAF configuration against the 6 Well-Architected Framework pillars.
2. **Dependency & Static Code Audit**: Run SAST vulnerability scanners across all repository packages and dangerous code sinks. Include the CI supply chain: every third-party GitHub Action must be pinned to a **full commit SHA** (with a version comment), not a mutable tag — movable tags are the vector a real 2025 attack used when `tj-actions/changed-files` was hijacked (CVE-2025-30066, 23,000+ repos) and is GitHub's own standing recommendation. Also verify least-privilege `permissions:` blocks and zero `pull_request_target` on untrusted PRs.
3. **Host & Fleet CVE Audit**: Triage underlying OS and container base images for known vulnerabilities and support status.
4. **Runtime & Credential Audit**: Run secret scanners across repository commits and test output logs for zero-leak compliance. For agent-era targets, grade against the OWASP LLM Top 10 (2026 edition: Prompt Injection, Sensitive Information Disclosure, Excessive Agency, Unbounded Consumption dominate the reordered list) and the OWASP Top 10 for Agentic Applications; for every high finding, state **which control fires inline during the attack** vs. which is only a build-time or policy control — the 2026 reordering draws exactly that line.
5. **Synthesis & Action Plan**: Consolidate findings into a prioritized remediation plan with assigned owners and SLAs.

## Quality gate

- [ ] Perimeter, SAST, CVE, and Runtime dimensions evaluated.
- [ ] Agent-era targets graded against the OWASP LLM Top 10 (2026) / Agentic Applications (2026) taxonomies, with runtime-vs-build-time control attribution per high finding.
- [ ] Risk matrix prioritized by business impact and exploitability.
- [ ] Actionable remediation steps provided for each finding.
- [ ] Zero secret leaks in audit report.
- [ ] Audit logged into the persistent evidence ledger.

## Routing

- Immediate vulnerability patching → `remediate` mode.
- WAF configuration → `cloud-waf` mode.

## Sources

- OWASP GenAI Security Project — Top 10 for LLM Applications, **2026 edition** (published 2026-08-03; eight entries re-ranked, Excessive Agency → LLM03, Unbounded Consumption → LLM06, System Prompt Leakage renamed and expanded to **Hidden Context Exposure**) and **Top 10 for Agentic Applications** (released 2025-12-09)
- GitHub Security Lab / CISA — Supply Chain Compromise of `tj-actions/changed-files`, CVE-2025-30066 (2025-03): SHA-pin every third-party Action; least-privilege `permissions:`; no `pull_request_target` on untrusted PRs
- `muse-security/SKILL.md` — the department contract this audit verifies
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
