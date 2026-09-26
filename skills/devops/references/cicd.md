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

## GitOps + Argo Rollouts (enrich — source: `wshobson/agents` (`argocd-gitops`, `argo-rollouts`))

- **Install.** Argo CD via its official Helm chart, values committed; admin password + repo creds in the CI secret store, never in values.
- **Sync policy.** `automated: { prune: true, selfHeal: true }` + `syncOptions: [CreateNamespace=true]`; production Application requires manual sync (`automated: null`) behind the environment approval gate.
- **App-of-apps.** One root Application pointing at `apps/`; each env/app is a child Application YAML in git. Cluster state drifts → self-heal; intent changes → PR, never `kubectl` from a laptop.
- **Rollouts.** Progressive delivery via Argo Rollout (`strategy: canary`, `steps: [setWeight: 10, pause: {duration: 5m}, setWeight: 50]`); `inconclusiveLimit` set so no-data metrics fail forward, never hang (see Routing troubleshooting).

## Quality gate

- [ ] Stages ordered and cached.
- [ ] Secrets in the CI secret store only.
- [ ] Deploy gated on tests/scans.
- [ ] Production protected (approvals/rules).
- [ ] Rollback is one step.
- [ ] Failures notify the owner.

## Routing

- Failure loop: paste the CI error to the fixer, verify locally, repush; never skip a red gate (no rule-disable, no test-skip); a build-cop owns green main — fix or revert, never accumulate breakage.
- Speed + safety: cache deps → parallel jobs → path filters → matrix sharding → trim the critical path; every PR gets a preview deploy; flags live create→canary→rollout→remove with an owner and cleanup date.
- Pipeline troubleshooting: Argo Rollouts `inconclusiveLimit` (never hang on no-data metric), deep-readiness probes over `/ping`, additive-only migrations + versioned undo; env-protection reviewer gate, Docker manifest-first layer order. Source: `wshobson/agents` (`deployment-pipeline-design`).
- Shell discipline (CI/deploy scripts): `set -Eeuo pipefail`, quote-all, `[[`, trap+mktemp cleanup, dry-run flag, idempotent steps. Source: `wshobson/agents` (`bash-defensive-patterns`; near-miss fold into cicd/hosting).
- Gates + evidence: environment approval-gate snippet + Trivy/SARIF upload so scans block prod and findings stay queryable. Source: `wshobson/agents` (`github-actions-templates`; near-miss fold).
- Gate order + flag lifecycle: lint → type-check (tsc/doctest where the stack has them) → unit → build → integration → e2e → audit → bundlesize; flags carry owner + expiry, 2-week cleanup, test both states. Source: `addyosmani/agent-skills` (`ci-cd-and-automation`).
- Iterated agent-loop scaffold (source: `humanlayer/skills` `build-iterated-agentic-loop` + `design-control-loop`, MIT; reference templates pulled 2026-09-19 — `workflow-template.yml`, `prompt-template.md`, `memory-template.md`, `skill-template.md`, `agent-runner-templates.md`, `agent-iteration.ts`): for a repeatable agent task, ship a repo-local skill (the judgement) + a coding-agent GHA workflow (prompt + schedule/manual triggers) + an agent-memory file (standing feedback, scope exclusions) + PR bounding (default 1 open PR per loop via label check; manual dispatch bypasses) + `/iterate` support optional. Explore the repo's runners/install/validation conventions first, ask setup questions with repo-evidence defaults, validate YAML parses, dry-run via temporary `push` trigger then remove it. Sensor/controller/actuator interview shape folds into the same path when the loop needs flow control.
- Skill audit gate + machine-readable health (ADOPT-IDEA, source: skillshare, MIT — pattern only, no sync-engine adoption; propose placement here, do NOT edit tests/ or scripts/): severity threshold + profiles to block installs, custom rules file with layered merge, SARIF/JSON out for CI; `doctor`-style health check plus `--json` output on status/diff/check/sync/audit/list commands for CI scripting.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
