---
name: devops
aliases: ["infrastructure", "reliability", "sre", "deployment", "hosting", "cicd", "platform", "cloudflare", "devops-engineer", "wrangler"]
description: "Full infrastructure and reliability department: hosting and deployment, CI/CD pipelines, domains and DNS, Cloudflare edge and Workers, security hardening, monitoring and alerting, and incident response — routed through seven modes. Use when asked to deploy or host an app, set up a CI/CD pipeline, configure a domain or DNS, deploy to Cloudflare Workers or Pages, harden security, add monitoring and alerts, or respond to and learn from an outage. Not for writing application code (webdev) or release/versioning workflows (git)."
argument-hint: "[hosting|cicd|domains|security|monitoring|incident|cloudflare]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 32
  aliases: ["infrastructure", "reliability", "sre", "deployment", "hosting", "cicd", "platform", "cloudflare", "devops-engineer", "wrangler"]
  suggested_skills: ["git", "webdev", "automation", "code-review"]
  hermes:
    tags: ["devops", "hosting", "deployment", "cicd", "github-actions", "domains", "dns", "cloudflare", "workers", "pages", "security", "monitoring", "alerting", "incident-response", "uptime", "infrastructure-as-code", "devops-engineer", "wrangler"]
    related_skills: ["git", "webdev", "automation", "code-review"]
    suggested_skills: ["git", "webdev", "automation", "code-review"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["git", "webdev", "automation", "code-review"]
    primary_triggers: ["deploy this", "set up hosting", "ci/cd pipeline", "configure domain", "dns", "cloudflare", "cloudflare workers", "devops engineer", "harden security", "add monitoring", "incident postmortem", "wrangler"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🛠️ devops — Infrastructure & Reliability Department

One head skill for infrastructure. Make deploys boring: reproducible, reversible, observable. Every environment is code, every change is reviewable, every outage teaches. Reliability is a budget, not a slogan — measure it, spend it deliberately, and protect the user's trust above all.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **hosting** | "deploy", "hosting", "publish this app", "server setup" | Deploy and host an app with a reproducible, reversible setup | [references/hosting.md](references/hosting.md) |
| **cicd** | "ci/cd", "github actions", "pipeline", "automate tests and deploy" | CI/CD pipeline: test, build, gate, deploy | [references/cicd.md](references/cicd.md) |
| **domains** | "domain", "dns", "point the domain", "ssl certificate", "subdomain" | Domain, DNS, and TLS configuration | [references/domains.md](references/domains.md) |
| **cloudflare** | "cloudflare", "workers", "pages", "cloudflare dns", "cloudflared", "turnstile", "edge routing", "wrangler" | Cloudflare edge ecosystem: Workers, Pages, Full (Strict) SSL, WAF rules, caching, Zero Trust tunnels, and Wrangler CLI | [references/cloudflare.md](references/cloudflare.md) |
| **security** | "harden security", "security headers", "infrastructure security", "least privilege" | Infrastructure and application security hardening | [references/security.md](references/security.md) |
| **monitoring** | "monitoring", "alerts", "observability", "uptime", "logging" | Monitoring, logging, and actionable alerting | [references/monitoring.md](references/monitoring.md) |
| **incident** | "incident", "outage", "postmortem", "site is down", "production issue" | Incident response and blameless postmortem | [references/incident.md](references/incident.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Deploying or hosting an app/service.
- Building or fixing a CI/CD pipeline.
- Configuring domains, DNS, and TLS.
- Hardening an application or infrastructure's security.
- Adding monitoring, logging, and alerts.
- Managing or post-morteming an incident.

### Anti-Triggers

- Writing the application code itself → `webdev`.
- Versioning, releases, and changelog workflows → `git`.
- Automating business processes → `automation`.
- Application-level code review → `code-review`.

---

## Quick Reference

### Reliability ladder (decide before any mode)

| Situation | Target |
|:---|:---|
| Static/marketing site, low stakes | Managed host, CDN, auto-TLS |
| Web app + API, moderate traffic | PaaS/containers with health checks |
| High traffic or strict SLAs | Orchestrated infra + autoscaling + HA |
| Regulated/private data | Hardened network, least privilege, audit logs |

Rule: the simplest target that meets the SLA. Cargo-culting Kubernetes for a brochure site is a failure, not ambition.

### Verification gate (every mode)

- Change is reproducible from code (infrastructure as code or a documented runbook).
- Rollback path exists and was tested.
- Secrets in a secret manager; least privilege enforced.
- The change is observable (metrics/logs) before it is 'done'.

### Suite contracts

- Release/versioning/tag workflow → `git` (its release lifecycle).
- Secrets-scanning and SAST in the pipeline → `code-review`.
- Deploy step automation inside an existing system → `automation`.

---

## Procedure

1. **Intake.** establish the environment (targets, constraints, traffic, budget) and the rollback path before changing production — a deploy you cannot reverse is a gamble.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Manual production changes with no record — irreproducible.
- No rollback plan — every deploy is a gamble.
- Secrets in env files committed to git.
- Over-engineering (k8s for a static site).
- Alerting on everything — everyone mutes the channel.
- Single point of failure for critical services.
- Incidents without a blameless postmortem — the same outage repeats.

---

## Verification

- [ ] Change is reproducible from code or a runbook.
- [ ] Rollback path defined and tested.
- [ ] Secrets in a secret manager, not in the repo.
- [ ] Least-privilege permissions applied.
- [ ] Metrics/logs exist for the changed component.
- [ ] Alerts actionable with a runbook link.
- [ ] Postmortems are blameless and produce tracked actions.
