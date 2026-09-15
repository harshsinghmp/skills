# security — Security: least privilege, headers, secrets, and dependency hygiene.

## Intake

- Assets to protect (data, systems, keys)
- Current exposure (public endpoints, roles, deps)
- Compliance requirements (GDPR/SOC2/PCI)
- Threat model: what an attacker wants

## Deliverable

A hardening plan applied: least-privilege roles, security headers (CSP, HSTS, etc.), secrets in a manager, dependency updates, network rules, and audit logging — with before/after evidence.

## Procedure

1. Model the threats: what an attacker would target and how.
2. Apply least privilege: scope IAM/roles and DB permissions to need.
3. Set security headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame rules.
4. Move all secrets to a manager; rotate anything exposed.
5. Patch dependencies; enable automated vulnerability scanning (routes to `code-review`).
6. Restrict network access (firewalls, private subnets, WAF where needed).
7. Enable audit logging and alerting on suspicious access.

## Quality gate

- [ ] Threat model stated.
- [ ] Least-privilege roles applied.
- [ ] Security headers set and verified.
- [ ] Secrets in a manager; exposed ones rotated.
- [ ] Dependencies patched + scanned.
- [ ] Audit logging enabled.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
