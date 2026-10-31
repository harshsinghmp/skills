# cve — Enterprise CVE Vulnerability Discovery, CVSS Scoring, and Support Lifecycle Mapping.

## Intake

- Target package names, container images, CVE IDs, or system diagnostic bundles
- Operating system release and architecture (RHEL, Debian, Alpine, Ubuntu, macOS)
- Current support lifecycle phase (Full Support, Maintenance, Extended Life Phase / ELS)
- Default stack: Red Hat Security Advisories (RHSA) / NIST NVD feeds.

## Deliverable

A structured CVE vulnerability evaluation report detailing:
- Vulnerability description, CVSS v3.1/v4 vector and base score.
- Exploitability assessment (EPSS score, public exploit availability).
- Product lifecycle phase impact and vendor patch availability status.
- Non-destructive diagnostic command plan (`sosreport -k`, package versions).

## Procedure

1. **Identifier & Advisory Lookup**:
   - Query CVE database / Red Hat Security Advisories for the target vulnerability.
   - Verify CVSS v3.1/v4 score, attack vector (Network, Adjacent, Local, Physical), and privileges required.

2. **Support Lifecycle Phase Mapping**:
   - Determine if the affected OS/software version is under active maintenance or requires Extended Life Support (ELS) patches.
   - Flag out-of-support components requiring immediate architecture modernization.

3. **Non-Destructive Diagnostic Capture**:
   - Prior to any remediation, gather system diagnostic context:
     - Check installed version: `rpm -qa <package>` or `dpkg -l <package>`.
     - Check process state: `systemctl status <service>`.
     - Capture system snapshot: `sosreport -k <plugin>` (or relevant log bundle).

4. **Severity & SLA Assignment**:
   - Map against the 4-tier severity matrix (Critical / Important / Moderate / Low) and assign SLA clock.

## Quality gate

- [ ] CVE ID verified against official NVD / vendor advisories.
- [ ] CVSS score and attack vector documented.
- [ ] Product lifecycle support phase mapped.
- [ ] Non-destructive diagnostic capture planned before any fix.
- [ ] Severity tier and remediation SLA assigned.

## Routing

- Automated playbook synthesis & fleet patching → `remediate` mode.
- Source code level static analysis → `sast` mode.
