# hosting — Hosting: reproducible, reversible deployment on the simplest viable target.

## Intake

- App type, runtime, and build command
- Traffic expectations and SLA
- Environment variables/secrets needed
- Budget and team ops capacity

## Deliverable

A deployed app: chosen host with rationale, build/deploy configuration as code, environment/secret setup, health checks, TLS, and a documented rollback — plus the live URL and evidence it runs.

## Procedure

1. Pick the target from the reliability ladder; justify against SLA and team capacity.
2. Define the build and deploy as configuration (Dockerfile/compose or platform config) — reproducible.
3. Configure environments (dev/staging/prod) with secrets in a secret manager.
4. Add health checks and auto-restart/zero-downtime deploy.
5. Enable TLS and a CDN where appropriate.
6. Verify the live deployment (load the URL, check logs, run a smoke test).
7. Document the rollback command and test it once.

## Quality gate

- [ ] Target chosen from the ladder with rationale.
- [ ] Build/deploy reproducible from config.
- [ ] Secrets in a secret manager, not the repo.
- [ ] Health check and TLS active.
- [ ] Live deployment verified with evidence.
- [ ] Rollback documented and tested.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
