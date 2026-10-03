# remediate — Automated Idempotent Playbooks, Canary Fleet Rollouts, and Verification Gates.

## Intake

- Verified CVE or security finding from `cve` / `sast` mode
- Target fleet inventory or application deployment descriptors
- Rollback criteria and health check endpoints
- Default stack: Ansible Automation Platform / Idempotent Bash / Kubernetes Rolling Updates.

## Deliverable

An idempotent remediation plan and executable playbook:
- Dry-run verification (`--check` mode).
- Pre-patch snapshot / backup task.
- Staged canary rollout protocol (Canary 1 node → 10% → 50% → 100%).
- Post-patch health check and automated rollback triggers.

## Procedure

1. **Idempotent Playbook Synthesis**:
   - Write state-declarative tasks (e.g. `ansible.builtin.package: name=pkg state=latest`).
   - Prohibit raw non-idempotent shell commands (`yum update -y` in command module).

2. **Pre-Patch Safety Gate**:
   - Check available disk space (`df -h`).
   - Create system/volume snapshot before applying binary or kernel patches.
   - Run in dry-run mode: `ansible-playbook --check --diff playbook.yml`.

3. **Staged Canary Fleet Rollout**:
   - Stage 1: Deploy patch to isolated Canary node (1 node).
   - Stage 2: Run verification tests and monitor error rates for 15 minutes.
   - Stage 3: Roll out to 10% of fleet.
   - Stage 4: Roll out to 50% of fleet.
   - Stage 5: Roll out to remaining 100% of fleet.

4. **Rollback Trigger**:
   - If health check fails or error rate spikes > 1%, trigger automatic rollback to pre-patch snapshot.

## Quality gate

- [ ] Playbook is strictly idempotent.
- [ ] Dry-run (`--check`) verified clean with zero unexpected diffs.
- [ ] Pre-patch snapshot task included.
- [ ] Staged canary rollout stages explicitly configured.
- [ ] Automated health-check verification and rollback gate defined.

## Routing

- Vulnerability triage and diagnostics → `cve` mode.
- Cloud WAF / DDoS rule adjustments → `cloud-waf` mode.
