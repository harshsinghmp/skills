# muse-security

Unified security authority and governance engine for the agency: CVE vulnerability triage, automated remediation playbooks, Cloud WAF architectures (GCP/Cloudflare 6 pillars), static application security testing (SAST), and runtime defense guardrails — routed through six modes.

## Modes

- `cve`: Enterprise CVE diagnosis, CVSS scoring, and product lifecycle support mapping.
- `remediate`: Idempotent remediation playbooks, staged canary rollouts, and verification gates.
- `cloud-waf`: GCP Cloud Armor & Cloudflare WAF architecture across all 6 Well-Architected pillars.
- `sast`: Static application security testing, dependency vulnerability trees, and MITRE ATT&CK mapping.
- `runtime`: AST command interception, destructive action prevention, and zero-secret isolation.
- `audit`: 360° comprehensive security posture audit.

## Installation & Usage

```bash
# Run with npx skills
npx skills run harshsinghmp/muse-skills/muse-security -- cve "CVE-2026-1234"
```
