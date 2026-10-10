# audit — 360° Comprehensive Security & Governance Posture Audit.

## Intake

- Target application, cloud perimeter, infrastructure fleet, or agency repository
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
2. **Dependency & Static Code Audit**: Run SAST vulnerability scanners across all repository packages and dangerous code sinks.
3. **Host & Fleet CVE Audit**: Triage underlying OS and container base images for known vulnerabilities and support status.
4. **Runtime & Credential Audit**: Run secret scanners across repository commits and test output logs for zero-leak compliance.
5. **Synthesis & Action Plan**: Consolidate findings into a prioritized remediation plan with assigned owners and SLAs.

## Quality gate

- [ ] Perimeter, SAST, CVE, and Runtime dimensions evaluated.
- [ ] Risk matrix prioritized by business impact and exploitability.
- [ ] Actionable remediation steps provided for each finding.
- [ ] Zero secret leaks in audit report.
- [ ] Audit logged into the persistent evidence ledger.

## Routing

- Immediate vulnerability patching → `remediate` mode.
- WAF configuration → `cloud-waf` mode.
