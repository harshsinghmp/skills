# audit — devops audit mode

## When to Use

- **CI/CD security audit**: grade the pipeline against the OWASP Top 10 CI/CD Security Risks (CICD-SEC-1…10) before granting it production access.
- **Deployment-gate audit**: verify nothing reaches production without the intended gates actually enforcing.
- **Drift audit**: declared infrastructure state vs live state.

## Checklist (OWASP CICD-SEC lens)

- [ ] **SEC-1 Flow control**: no merge-to-default without review; no direct production deploys off a merge
- [ ] **SEC-2 Identity & access**: no stale/shared/over-privileged identities across SCM, CI, and artifact systems; MFA on accounts that can change pipelines; admin reserved for platform owners
- [ ] **SEC-3 Dependency chain**: dependency confusion/typosquatting defenses; package managers in CI don't run with pipeline-secret trust
- [ ] **SEC-4 Poisoned Pipeline Execution**: workflow-file changes require review; `pull_request_target` handled carefully; untrusted values (PR titles, branch names, issue bodies) never interpolated into `run:` scripts — pass via env
- [ ] **SEC-5 PBAC**: runners/jobs least-privilege; secrets scoped per-environment, not repo-wide
- [ ] **SEC-6 Credential hygiene**: no secrets in code or CI config (gitleaks-class scanning); secrets never printed to logs or command history; temporary credentials where possible
- [ ] **SEC-7 System configuration**: runners isolated; no `--privileged` Docker in pipelines; TLS on SCM↔CI links
- [ ] **SEC-8 Third-party services**: Actions/plugins/integrations vetted and pinned by SHA/tag
- [ ] **SEC-9 Artifact integrity**: artifacts signed/verified between build and deploy
- [ ] **SEC-10 Logging & visibility**: pipeline logs retained and actually read; SAST/DAST/IaC scanning wired into the pipeline
- [ ] Branch protection on default + release branches; stale approvals dismissed; status checks required; production environments protected by deployment approval gates
- [ ] Drift: live infrastructure matches declared IaC (plan shows zero unexplained diff)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Secrets in logs/code/config | `CRITICAL` | rotate immediately; then fix the leak path |
| Production reachable without a gate | `BLOCK` | restore the gate before any deploy |
| Untrusted input interpolated into `run:` | `REQUEST-CHANGES` | env-var indirection + review |
| Third-party action unpinned | `AUTO-REPAIR` | pin to SHA |
| Drift between IaC and live state | `REPORT-ONLY` | reconcile or codify |

## Sources

- OWASP — Top 10 CI/CD Security Risks (CICD-SEC-1…10) and CI/CD Security Cheat Sheet
- OWASP DevSecOps Guideline — CI/CD Pipeline Security (PPE, PBAC, protected pipeline definitions)
- Open Security Architecture SP-028 — Secure DevOps Pipeline Pattern (NIST 800-53 control mapping)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
