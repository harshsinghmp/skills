# zero-trust — Ephemeral Mutual TLS & Subagent Identity Attestation

> **Operating Role**: Nexus (Technical Director) & Sol (Product Architect)  
> **Direct Triggers**: "zero trust", "spiffe", "spire", "subagent attestation", "mtls", "capability scope", "least privilege", "tamper evident audit"  
> **Core Directives**: ZTR-001 through ZTR-004  
> **Primary Tooling**: `skills/quality-review/muse-security/scripts/zero-trust.ts`

The `zero-trust` mode establishes cryptographic identity attestation, fine-grained capability isolation, and mutual TLS (mTLS) for all autonomous AI subagents operating within the agency ecosystem. Under zero-trust architecture, no subagent or process is trusted by default—every invocation requires a verifiable SPIFFE Verifiable Identity Document (SVID), scoped permission limits, and cryptographic audit logging.

---

## The 4 Core Invariants (ZTR-001 – ZTR-004)

```mermaid
flowchart TD
    SubagentLaunch["Autonomous Subagent Spawn"] --> Attest["ZTR-001: SPIFFE/SPIRE Attestation Engine"]
    
    Attest --> SVID["Ephemeral SVID Token (TTL <= 60 min)"]
    SVID --> Handshake["ZTR-003: Mutual TLS Handshake Gate"]
    
    Handshake -->|mTLS Verified| CapGate["ZTR-002: Least-Privilege Capability Scope Gate"]
    Handshake -->|Certificate Mismatch| Reject["REJECT: Terminate Connection"]
    
    CapGate --> ToolAllow["Tool Whitelist Validation"]
    CapGate --> PathJail["Directory Traversal / Root Escape Jail"]
    CapGate --> TableFence["Database Row & Table Fence"]
    
    ToolAllow & PathJail & TableFence --> Audit["ZTR-004: Cryptographic SHA-256 Linked Audit Ledger"]
    Audit --> Ledger["Tamper-Evident Security Journal"]
```

---

### ZTR-001: SPIFFE/SPIRE Identity Attestation
- **Identity Standard**: Every executing subagent is issued an ephemeral SPIFFE ID structured as:
  ```text
  spiffe://agency.muse/subagent/<role>-<random-id>
  ```
- **Validity Ceiling**: Token time-to-live (TTL) is strictly bounded ($\le 60\text{ minutes}$). Expired tokens are immediately rejected by all API endpoints and inter-agent buses.
- **Cryptographic Fingerprinting**: Tokens carry a SHA-256 payload digest and an HMAC signature derived from the root attestation key.

### ZTR-002: Least-Privilege Capability Scope Gate
- **Tool Allowlisting**: Subagents receive explicit tool allowances (e.g., `read_file`, `git`, `run_command`). Any call to an unauthorized tool fails closed immediately.
- **Filesystem Jail**: Path boundaries prohibit relative directory traversal (`../`) and escape into privileged host roots (`/etc`, `/root`, `~/.ssh`). All file mutations must resolve within designated project folders.
- **Database Table Fencing**: Restricts data access strictly to approved database tables, preventing cross-tenant leakage or administrative schema tampering.

### ZTR-003: Mutual TLS (mTLS) Enforcement
- **Scope**: The `ZeroTrustEngine` performs an **in-process SVID pair check**, not a live TLS socket handshake. Results carry `simulated: true`; the reported cipher and protocol are the pinning policy, not a negotiated session. Enforce real mTLS in the transport layer (SPIRE agent + TLS listener) before claiming wire-level identity.
- **Inter-Agent Verification**: All network and RPC communication between subagents, orchestrators, and tool brokers mandates mutual TLS (TLS 1.3).
- **Dual Verification**: Both client and server validate peer SVID certificates against the root trust domain before payload transmission.
- **Cipher Pinning**: Restricts cryptographic negotiation strictly to approved modern cipher suites (`TLS_AES_256_GCM_SHA384` / `TLS_CHACHA20_POLY1305_SHA256`).

### ZTR-004: Continuous Security Audit Trail
- **Blockchain-Style Linked Ledger**: Every capability verification, tool invocation, and privilege denial is recorded in an append-only, SHA-256 linked cryptographic audit ledger.
- **Tamper Evidence**: Each entry embeds the hash of the preceding entry ($H_n = \text{SHA256}(n, \text{action}, \text{timestamp}, H_{n-1})$) signed with an HMAC. Any manual tampering, deletion, or reordering breaks the chain verification.
- **Zero-Secret Logging**: Audit entries scrub all tokens, keys, and PII, retaining only action descriptors and status verdicts.
- **Lifetime**: The ledger is held in process memory. Persist and reload it from a mode-600 file with an externally managed signing key before relying on it across restarts; `--audit-chain` on a fresh engine validates only the entries created in that process.
- **Key custody**: The HMAC signing secret lives in the same engine that writes entries. A writer with key access can recompute a valid chain, so this proves accidental corruption, not adversarial tampering. Anchor the head hash in an external append-only store (transparency log, WORM bucket) before claiming tamper evidence.

---

## Execution Workflow

1. **Issue SVID Token**:
   ```bash
   bun skills/quality-review/muse-security/scripts/zero-trust.ts --attest --role sol
   ```
2. **Execute Capability Check**: Pass requested tool or file path through `ZeroTrustEngine.validateCapability()`.
3. **Verify Inter-Agent mTLS**: Authenticate client and server SVIDs prior to executing RPC requests.
4. **Audit Chain Verification**:
   ```bash
   bun skills/quality-review/muse-security/scripts/zero-trust.ts --audit-chain
   ```

All commands accept `--json` for machine-readable output. `--verify-mtls --role sol --peer-role nexus` runs the mutual-TLS handshake check, and `--demo` replays the built-in walkthrough. `--attest` and `--verify-mtls` exit non-zero when the role is missing; `--ttl` is capped at 60 minutes.
