# 🛠️ devops

The infrastructure and reliability department head: one skill, six modes — hosting, cicd, domains, security, monitoring, incident. Reproducible deploys, then observability, then learning from failure.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill devops
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Deploy our Next.js app to production with a CI/CD pipeline and monitoring.
```

```text
Configure our domain with TLS, add uptime alerts, and run an incident postmortem.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **hosting** | deploy / hosting | Hosting: reproducible, reversible deployment on the simplest viable target. |
| **cicd** | CI/CD pipeline | CI/CD: test → build → gate → deploy, with secrets and rollback. |
| **domains** | domain / DNS setup | Domains: DNS records, TLS, redirects, and email auth. |
| **security** | security hardening | Security: least privilege, headers, secrets, and dependency hygiene. |
| **monitoring** | monitoring & alerting | Monitoring: metrics, logs, traces, and alerts that are actionable. |
| **incident** | incident response / postmortem | Incident: stabilize first, then a blameless postmortem with tracked actions. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
