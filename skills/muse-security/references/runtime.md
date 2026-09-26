# runtime — AST Command Interception, Destructive Prevention, and Zero-Secret Isolation.

## Intake

- Agent command payloads, shell scripts, or CI/CD workflow steps
- Target host or container execution context
- Environment variable schemas (`.env.schema`)
- Default stack: LifeOS Vibeguard Protocol / ClawSec runtime AST interceptor.

## Deliverable

A runtime defense verification report detailing:
- Destructive command interception status.
- Zero-secret context compliance verification.
- Output log masking telemetry (confirming zero credentials in stdout/stderr).

## Procedure

1. **Destructive Command Interception (ClawSec Gate)**:
   - Intercept and block high-risk destructive commands before execution:
     - Root disk wipe: `rm -rf /` or `rm -rf /*`.
     - Infrastructure teardown without prompt: `terraform destroy -auto-approve`.
     - Unhedged database purge: `DROP DATABASE`, `DROP TABLE` without explicit backup flag.
     - Dangerous network exfiltration: `curl ... | bash` or piping sensitive files to public endpoints.

2. **Zero-Secret Isolation (Varlock & Vibeguard Standard)**:
   - Ensure the LLM inspects environment keys and schema types only (`.env.schema`).
   - Secrets are injected out-of-band at runtime process spawn time, never written in plaintext to repo files.
   - Filter all stdout, stderr, and debug transcripts with automated regex masking (`[REDACTED]`).

3. **Session Spend & Blast Radius Limits**:
   - Enforce hard session budget caps to prevent runaway execution loops.

## Quality gate

- [ ] High-risk destructive commands blocked by pre-execution AST analyzer.
- [ ] No raw credentials (`sk-*`, `ghp_*`, passwords, private keys) committed or printed.
- [ ] Secrets injected out-of-band at process spawn time.
- [ ] Output logs verified clean with zero secrets.

## Routing

- Security scanning of static codebase → `sast` mode.
- Vulnerability patching → `remediate` mode.
