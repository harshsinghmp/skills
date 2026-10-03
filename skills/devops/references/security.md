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
8. Run a static analysis (SAST) pass plus dependency SCA and a secret-scan sweep as a client-ready audit deliverable (severity-ordered findings + evidence, never a compliance verdict); emit it as a dated report the client can act on directly.
9. For AI-exposing systems: identify the operator's role (provider vs deployer — duties differ), review read-only against official sources with exact citations, and report issue-spotting only — never a compliance verdict, score, or legal conclusion. Detection table (source: `HoangNguyen/common-llm-security`): LLM01 prompt injection → LLM02 insecure output → LLM03 training-data poisoning → LLM04 model DoS → LLM05 supply-chain → LLM06 permission bypass → LLM07 insecure plugin → LLM08 excessive agency → LLM09 overreliance → LLM10 unbounded consumption. Anti-patterns: no prompt concat with untrusted input, no raw-output sinks, capped agent loops. Hits carry P0 caps per the `code-review` LLM note.

## SAST language legs + gate (enrich — source: `BagelHole/sast-scanning`)

Extends the Routing SAST enrich (chooser, p/rulesets, pre-commit, baseline→incremental, jwt rule, quality-gate, FP tuning, SARIF):

- **Legs.** Bandit YAML (Python), eslint-plugin-security (JS/TS), Brakeman
  (Rails) — run the leg matching the stack, record which legs were skipped
  and why.
- **Custom CodeQL.** One path-problem `.ql` example checked in beside the
  workflow; new sources/sinks extend it, never a second query file per rule.
- **SonarQube.** `docker-compose` service + `sonar-project.properties`
  scanner props committed; quality gate enforced in CI, not in the dashboard.
- **Gate script.** `critical > 0` fail, `high > 5` fail — run post-scan,
  verdict in the report.
- **FP trio.** Exclude test fixtures by path, confirm sink reachability
  before filing, record version-pinned suppressions with expiry dates.

## Composed security pipeline + SOAR + Checkov (enrich — source: `BagelHole/security-automation`)

- **One pipeline.** trufflehog (secrets) → semgrep (SAST) → `npm audit`
  (SCA) → trivy (image/fs) → checkov (IaC). Fail-fast on secrets, report-all
  on the rest.
- **Auto-remediation snippet.** S3 public-block: detect public ACL/policy →
  apply block → notify owner. Remediation without notify is a finding.
- **SOAR playbook YAML.** enrich (attach asset + severity) → condition
  (match class) → block/disable/notify/ticket. Each action logged with actor
  + timestamp.
- **Checkov custom check.** S3-encryption-required example checked in;
  new bucket policies extend it.

## K8s security block (enrich — source: `wshobson/agents` (`kubernetes-security`))

- **PSS.** Enforce `restricted` (`pod-security.kubernetes.io/enforce: restricted`) per namespace; `baseline` only with a recorded exception + expiry.
- **Deny-all.** Default-deny `NetworkPolicy` (all ingress + egress) first, then allowlist per workload port-by-port. No policy = no traffic.
- **RBAC.** Least-privilege `Role` + `RoleBinding` per workload service account; no `cluster-admin` bindings outside break-glass, each with expiry + audit note.
- **Restricted context.** `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `seccompProfile: {type: RuntimeDefault}`, drop `ALL` capabilities, add back only the named one the binary needs.
- **Admission.** Gate deploys on image signature + known-bad scan verdict (policy engine allowlist); unsigned or critical-finding images never schedule.
- **STRICT mTLS (thin).** Peer-authentication `STRICT` mode for in-mesh traffic; mesh install/operation itself stays parked (see scope note below) — this line only states the required posture.

## Quality gate

- [ ] Threat model stated.
- [ ] Least-privilege roles applied.
- [ ] Security headers set and verified.
- [ ] Secrets in a manager; exposed ones rotated.
- [ ] Dependencies patched + scanned.
- [ ] Audit logging enabled.

## Routing

- Outbound URLs: https-only, allowlisted host, resolve-all-DNS rejecting non-unicast (incl. cloud metadata 169.254.169.254), no silent redirects; note the check-then-fetch TOCTOU — pin the IP or filter egress on high-risk surfaces. Rate limits count in a shared store past one process (in-memory × instances).
- Destructive paths: target must resolve under an allowlisted root (post-symlink), below the root, with ownership evidence read before teardown; on refusal log-and-stop, never fall back broader. Dependency triage: reachable + critical/high = fix now, else backlog with a review date; never blind `--force` remediation. Control-level detail routes to `code-review` security mode.
- SAST enrich: Semgrep/SonarQube/CodeQL chooser, `p/security-audit + p/owasp-top-ten` CI gate, pre-commit `--config=auto --error`, baseline→incremental adoption; custom-rule example (e.g. hardcoded-jwt-secret), quality-gate + false-positive allow-list tuning, SARIF upload. Source: `wshobson/agents` (`sast-configuration`).
- Secrets (k8s): External Secrets Operator `ExternalSecret` block for cluster secrets plus a rotation runbook (Vault/AWS provider, TruffleHog pre-commit + CI scan). Source: `wshobson/agents` (`secrets-management`; near-miss fold).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
