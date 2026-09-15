# cicd — CI/CD: test → build → gate → deploy, with secrets and rollback.

## Intake

- Repo and target environment(s)
- Test/build/lint commands
- Deployment target and credentials model
- Required gates (tests, scans) before deploy

## Deliverable

A pipeline config: stages (install → lint → test → build → deploy) with caching, secrets via the CI secret store, environment protection for prod, and a deploy/rollback step.

## Procedure

1. Define stages in order: install → lint → test → build → deploy.
2. Add dependency/build caching for speed.
3. Store credentials in the CI secret store; never echo them.
4. Gate deployment on tests (and security scans via `code-review`) passing.
5. Protect the production environment (approvals/branch rules where warranted).
6. Make the deploy idempotent and the rollback a single step.
7. Fail the pipeline loudly; notify the owner on failure.

## Quality gate

- [ ] Stages ordered and cached.
- [ ] Secrets in the CI secret store only.
- [ ] Deploy gated on tests/scans.
- [ ] Production protected (approvals/rules).
- [ ] Rollback is one step.
- [ ] Failures notify the owner.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
