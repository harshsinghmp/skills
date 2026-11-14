# muse-security

Unified security authority and governance engine for the agency: CVE vulnerability triage, automated remediation playbooks, Cloud WAF architectures (GCP/Cloudflare 6 pillars), static application security testing (SAST), subagent tenant boundary & worktree isolation auditing, runtime defense guardrails, dynamic MCP server governance & tool poisoning defense, and ephemeral mutual TLS zero-trust subagent attestation — routed through nine modes.

## Modes

- `cve`: Enterprise CVE diagnosis, CVSS scoring, and product lifecycle support mapping.
- `remediate`: Idempotent remediation playbooks, staged canary rollouts, and verification gates.
- `cloud-waf`: GCP Cloud Armor & Cloudflare WAF architecture across all 6 Well-Architected pillars.
- `sast`: Static application security testing, dependency vulnerability trees, and MITRE ATT&CK mapping.
- `runtime`: AST command interception, destructive action prevention, and zero-secret isolation.
- `boundary`: Subagent tenant boundary & worktree isolation auditing (symlink escapes, lease collisions, key permissions).
- `mcp-guard`: Dynamic MCP server governance, OWASP MCP03 tool poisoning scanner, transport isolation, and credential tripwires.
- `zero-trust`: Ephemeral mutual TLS zero-trust subagent attestation, SPIFFE SVIDs, capability scope jails, and linked cryptographic audit chains.
- `audit`: 360° comprehensive security posture audit.

## Installation & Usage

```bash
# Install
npx skills add harshsinghmp/muse-skills --skill muse-security

# Then ask: "triage CVE-<real-id>" (use a real CVE identifier)
```
