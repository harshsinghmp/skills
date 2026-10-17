---
name: muse-security
aliases: ["security", "secops", "cve", "waf", "vulnerability-audit", "sast", "clawsec"]
description: "Unified security authority and governance engine for the agency: CVE vulnerability triage, automated remediation playbooks, Cloud WAF architectures (GCP/Cloudflare 6 pillars), static application security testing (SAST), and runtime defense guardrails — routed through six modes. Trigger when asked to: 'run a security audit', 'check for CVEs', 'audit cloud WAF', 'remediate vulnerabilities', 'SAST review', 'test cloud armor', or 'harden infrastructure security'. Not for day-to-day web development coding (webdev) or routine deployment pipelines (devops)."
argument-hint: "[cve|remediate|cloud-waf|sast|runtime|audit]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: quality-review
metadata:
  category: quality-review
  priority: 44
  aliases: ["security", "secops", "cve", "waf", "vulnerability-audit", "sast", "clawsec"]
  suggested_skills: ["code-review", "devops", "webdev", "incident-response", "evidence-ledger"]
  hermes:
    tags: ["security", "cve", "waf", "vulnerability", "cloud-armor", "sast", "mitre-attack", "ansible", "patching", "zero-secret", "quality-gate"]
    related_skills: ["code-review", "devops", "webdev", "incident-response", "evidence-ledger"]
    suggested_skills: ["code-review", "devops", "webdev", "incident-response", "evidence-ledger"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: quality-review
    suggested_skills: ["code-review", "devops", "webdev", "incident-response", "evidence-ledger"]
    primary_triggers: ["security audit", "cve lookup", "cloud waf audit", "remediate vulnerability", "sast review", "cloud armor", "harden infrastructure"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🛡️ muse-security — Unified Security & Cloud Governance Authority

The single source of truth for security audits, vulnerability management, cloud WAF architectures, and runtime defense guardrails across the agency ecosystem.

While in-development code adheres to secure-by-design patterns (IDOR/SSRF/SQLi prevention inside `webdev` and `code-review`), `muse-security` is invoked as the independent quality and defense gate for audits, fleet patching, and cloud perimeter protection.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **cve** | "cve lookup", "vulnerability scan", "cvss score", "security advisory" | Enterprise CVE diagnosis, CVSS scoring, lifecycle support mapping, and non-destructive diagnostic capture | [references/cve.md](references/cve.md) |
| **remediate** | "patch vulnerability", "ansible playbook", "canary rollout", "fix cve" | Idempotent remediation playbooks, staged canary rollouts (Canary → 10% → 50% → 100%), and rollback gates | [references/remediate.md](references/remediate.md) |
| **cloud-waf** | "cloud waf", "cloud armor", "cloudflare waf", "waf pillars", "ddos rules" | GCP Cloud Armor & Cloudflare WAF architecture across all 6 Well-Architected Framework pillars | [references/cloud-waf.md](references/cloud-waf.md) |
| **sast** | "sast audit", "static analysis", "dependency audit", "mitre attack" | Source code security review, dependency vulnerability trees, and MITRE ATT&CK / ATLAS control mapping | [references/sast.md](references/sast.md) |
| **runtime** | "runtime defense", "destructive command check", "zero-secret enforcement" | AST command interception (blocking `rm -rf /`, `terraform destroy`) and process environment isolation | [references/runtime.md](references/runtime.md) |
| **audit** | "full security audit", "security posture", "compliance review" | End-to-end security posture evaluation synthesizing CVE, SAST, WAF, and runtime controls | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Conducting independent security audits on applications, APIs, or infrastructure.
- Triaging CVEs and mapping severity against product lifecycle support phases.
- Generating automated, idempotent Ansible remediation playbooks for fleet patching.
- Auditing and configuring Cloud WAF / DDoS protections (GCP Cloud Armor, Cloudflare).
- Scanning dependencies for known vulnerabilities and evaluating MITRE ATT&CK mappings.
- Enforcing runtime guardrails against destructive commands and secret leakage.

### Anti-Triggers

- Routine web development and feature coding → `webdev` (backend/frontend).
- Standard peer code reviews focused on correctness and style → `code-review`.
- Day-to-day cloud provisioning, Docker, and CI/CD hosting → `devops`.
- Emergency live service outages and on-call triage → `incident-response`.

---

## Quick Reference

### Two-Boundary Security Architecture

| Boundary | Owner Skill | Scope & Responsibilities |
|:---|:---|:---|
| **In-Dev Web Security** | `webdev` / `code-review` | Developer-side continuous prevention: tenant IDOR checks, SSRF metadata `169.254.169.254` blocking, parameterization, and Zod DTO schema validation. |
| **External Security Authority** | `muse-security` | Independent audit gate: CVE triage, CVSS scoring, Ansible patch generation, Cloud WAF 6-pillar audits, MITRE ATT&CK controls, and AST command safety. |

### Severity Impact Matrix (Red Hat Standard)

| Severity | SLA Target | Business Impact Definition | Required Action |
|:---|:---|:---|:---|
| **Critical (Sev 1)** | < 4 hours | Complete outage, active remote code execution, unauthenticated data exfiltration. | Immediate hotfix / canary deployment; executive notification. |
| **Important (Sev 2)** | < 24 hours | Compromise of sensitive data or privilege escalation without full system compromise. | Staged patch rollout within next scheduled maintenance window. |
| **Moderate (Sev 3)** | < 7 days | Specific configuration required for exploit; localized impact. | Batch remediation during sprint cycle. |
| **Low (Sev 4)** | < 30 days | Minor security consequence; hard to exploit. | Routine dependency upgrade. |

---

## Procedure

1. **Intake & Scope**: Determine the target scope (source code, container, Linux server fleet, or cloud perimeter).
2. **Resolve Mode**: Match request against the mode table (cve, remediate, cloud-waf, sast, runtime, audit).
3. **Execute Mode Playbook**: Load `references/<mode>.md` and execute its step-by-step procedure.
4. **Evidence Collection**: Capture exact CVSS scores, vulnerability IDs, scanner logs, or WAF rule states.
5. **Quality Gate & Verification**: Ensure zero secret leakage (Vibeguard Protocol) and verify that all remediation playbooks are idempotent with dry-run verification.

---

## Pitfalls

- Running destructive remediation scripts without pre-patch snapshot verification.
- Confusing developer-side input validation (`webdev`) with external perimeter WAF audits (`muse-security`).
- Hardcoding secrets or API keys into remediation playbooks or test payloads.
- Applying patches to an entire fleet simultaneously instead of using staged canary rollouts.

---

## Verification

- [ ] Target scope identified and verified against authorized systems.
- [ ] CVEs validated against official NVD / vendor advisories with CVSS scores.
- [ ] Remediation playbooks tested with `--check` / dry-run before execution.
- [ ] Cloud WAF evaluated across all 6 Well-Architected Framework pillars.
- [ ] Zero secret leaks in output logs (Vibeguard standard).
- [ ] All audit findings recorded into the evidence ledger.
