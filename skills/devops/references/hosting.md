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
8. Provision the hosting itself as infrastructure-as-code (Terraform/CDK/CloudFormation) rather than one-off console clicks wherever the target supports it — the infra, not just the app, must be reproducible so another engineer can rebuild the environment from a PR, not a person's memory.

## Adversarial IaC self-review (enrich — source: `microsoft/azure-skills` `azure-app-onboard/scaffold`, MIT, raw SKILL.md fetched 2026-09-19; Bicep/MCP specifics generalized)

Generated IaC is guilty until the self-review acquits it. Run four layers
over every generated file before any plan/apply, and record each claim's
rating — VERIFIED (evidence confirms) / PLAUSIBLE (no counter-evidence,
unverified) / FLAGGED (contradicted or missing a critical pattern):

- **L1 Security baseline.** Secrets in a manager (never literals), least
  privilege (RBAC roles scoped, no wildcards), network exposure minimal,
  encryption at rest/transit on. FLAGGED here blocks the deploy.
- **L2 Pattern validation.** File/module structure matches the plan,
  naming follows the plan exactly (the plan is the source of truth —
  never invent names or derive them by string surgery), every referenced
  file/module exists on disk, cross-module references resolve (params
  passed match params declared, outputs referenced exist).
- **L3 Hallucination detection.** Resource names match the plan exactly,
  API versions are real and GA (no `-preview`), SKUs match the plan, no
  invented resource types. Validate mechanically (`terraform validate`,
  `az bicep build`) — FLAGGED here blocks the deploy.
- **L4 Cross-cutting trace.** Follow every variable/output/secret
  end-to-end across modules; dangling references and unwired outputs fail.

**No-deploy bridge.** Validation proves correctness without deploying:
format + syntax-validate + conformance checks first, then a plan/dry-run
whose output is reviewed — the deploy gate never opens on unreviewed
generated code. **Self-healing loop:** on validation failure, fix and
re-run, max 3 attempts; exhaustion escalates to a human with the findings
JSON, never a fourth silent retry.

## K8s manifest checklist + Helm conventions (enrich — source: `wshobson/agents` (`kubernetes-deployment`, `helm-chart`))

- **Manifest checklist.** Every Deployment ships requests/limits, `readinessProbe` + `livenessProbe`, `strategy.rollingUpdate`, `resources`, pod `labels` matching Service selector, image pinned by digest (`image:tag@sha256:…`, never `:latest`).
- **Namespace + quota.** One namespace per env; `ResourceQuota` + `LimitRange` committed beside manifests so a noisy neighbor fails closed at apply time.
- **Helm conventions.** `Chart.yaml` pinned `version` + `appVersion`; values split `values.yaml` (defaults) / `values-prod.yaml` (env delta only); secrets never in values — reference the secret manager, same rule as step 3.
- **Render-before-apply.** `helm template . -f values-prod.yaml | kubectl apply --dry-run=client -f -` in CI before any cluster write.

## Terraform skeleton + composition + Terratest (enrich — source: `wshobson/agents` (`terraform-module`, `terratest`))

Upgrades step 8 (provision hosting as code): the infra rebuilds from a PR, not memory.

- **Skeleton.** `main.tf` (providers, pinned versions) + `variables.tf` (typed, defaults) + `outputs.tf` (endpoints, IDs) + `envs/<env>.tfvars`. `terraform fmt -check` + `terraform validate` gate every PR.
- **Composition.** One root module per env composing versioned child modules (`source = "./modules/network"`); no resource blocks in root. State in remote backend with locking; never local state for shared envs.
- **Terratest.** One Go test per module: plan → apply → assert output (e.g. bucket versioning on) → destroy. Run on the smallest fixture that proves the invariant.

## Multi-cloud advisory + cost tactics (enrich — source: `wshobson/agents` (`multi-cloud-strategy`, `cost-optimization`) & Google Cloud Well-Architected Framework)

- **Advisory-only.** Default single cloud + managed services; go multi-cloud only for a named residency, latency, or exit-risk requirement — record which one. Abstraction lives in Terraform modules, never in app code branches per cloud.
- **Keyless Cloud Auth Standard.** Mandatory GitHub Actions OIDC / Workload Identity Federation for Google Cloud and AWS. Creating or downloading long-lived service account JSON keys (`.json`) into CI/CD secrets is strictly prohibited.
- **GKE Autopilot Golden Path.** When container workloads require Kubernetes, default to GKE Autopilot with Dataplane V2 (eBPF networking), private node CIDRs, and Authorized Networks on the control plane. Avoid GKE Standard unless custom kernel modules or unsupported daemonsets are strictly required.
- **FinOps Lifecycle Gates.** Right-size from actuals (requests/limits from p95 usage, not guesses); autoscale down to zero where the platform allows; automated storage lifecycle transitions: Standard → Nearline (30d) → Coldline (90d) → Archive (365d); budget auto-stoppers at 50%, 90%, and 100% of forecasted burn.
- **HCL tag block.** Every billable resource carries `env`, `owner`, `cost-center` — untagged apply fails review.

## Quality gate

- [ ] Target chosen from the ladder with rationale.
- [ ] Build/deploy reproducible from config.
- [ ] Secrets in a secret manager, not the repo.
- [ ] Health check and TLS active.
- [ ] Live deployment verified with evidence.
- [ ] Rollback documented and tested.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
