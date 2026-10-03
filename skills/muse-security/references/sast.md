# sast — Static Application Security Testing, Dependency Graphs, and MITRE Controls.

## Intake

- Application repository source code and lockfiles (`package-lock.json`, `bun.lockb`, `poetry.lock`, `go.sum`)
- Framework definitions and trust boundaries
- Default stack: Biome / Semgrep / OSV-Scanner / Trivy / MITRE ATT&CK & ATLAS frameworks.

## Deliverable

A static security assessment report detailing:
- Identified AST security violations (hardcoded secrets, insecure deserialization, dangerous sinks).
- Dependency vulnerability tree with direct vs transitive CVE mapping.
- Threat control mapping against MITRE ATT&CK (Enterprise) and MITRE ATLAS (AI/ML attacks).

## Procedure

1. **Dependency Vulnerability Scan**:
   - Run lockfile scanner across dependencies (`bun pm audit` / `osv-scanner`).
   - Categorize findings into Direct vs Transitive dependencies.
   - Propose minimal semver bump to fix vulnerabilities without introducing breaking changes.

2. **AST & Source Code Analysis**:
   - Audit for dangerous sinks (e.g. `eval()`, unescaped template literals, direct shell execution).
   - Verify that all cryptographic operations use modern primitives (AES-256-GCM, Argon2id).

3. **MITRE ATT&CK / ATLAS Control Mapping**:
   - Map findings to specific adversarial tactics (e.g. T1190 Exploit Public-Facing Application, T1059 Command and Scripting Interpreter, AML.T0043 LLM Prompt Injection).

## Quality gate

- [ ] Lockfiles scanned for known CVEs.
- [ ] Direct vs transitive vulnerabilities separated.
- [ ] Dangerous sinks checked across source tree.
- [ ] Findings mapped to MITRE ATT&CK / ATLAS framework IDs.
- [ ] Safe upgrade path identified without breaking API contracts.

## Routing

- Fleet-level server remediation → `remediate` mode.
- In-dev developer fixes → `webdev` (backend/frontend).
