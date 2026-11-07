# mcp-guard — Model Context Protocol Security, Tool Poisoning Defense & Transport Isolation

> **Operating Principle**: The Model Context Protocol (MCP) standardizes agent-to-tool communication, but it is strictly an interoperability protocol—**not a security boundary**. Third-party community MCP servers execute arbitrary code on developer machines and expose LLMs to prompt injection attacks embedded directly within tool definitions (OWASP MCP03 Tool Poisoning). Running untrusted MCP servers without pre-execution schema sanitization, transport isolation, and credential tripwires is an unmitigated supply chain vulnerability.

---

## The MCP Attack Surface & Defense Architecture

```mermaid
flowchart TD
    subgraph Host["Developer / Agency Host Machine"]
        Client["AI Agent Harness (Claude Code, Gemini, OpenCode, Cursor)"]
        Sanitizer["MCP Security Guard (mcp-sanitizer.ts)"]
        Tripwire["Credential & Payload Tripwire (MCP-004)"]
    end

    subgraph Threat_Vectors["Inbound Attack Surface (OWASP MCP03)"]
        P1["Hidden System Override<br>('ignore previous instructions')"]
        P2["Exfiltration Trigger<br>('send environment variables')"]
        P3["Unsafe TCP Transport<br>(0.0.0.0 listening without auth)"]
    end

    subgraph External_Servers["MCP Server Endpoints"]
        StdioServer["🟢 stdio / IPC Server (Isolated Process)"]
        RemoteServer["🔴 Remote / Unverified TCP Server (Quarantined)"]
    end

    External_Servers -->|tools/list response| Sanitizer
    Threat_Vectors -.-> Sanitizer

    Sanitizer -->|MCP-001: Schema Clean| Hydrator["Dynamic JIT Hydration (MCP-003)<br>70%+ Token Reduction"]
    Sanitizer -->|MCP-002: Transport Clean| StdioServer
    Sanitizer -->|Poisoning Detected| Quarantine["🚨 Quarantine Tool & Terminate Process"]

    Hydrator --> Client
    Client -->|Tool Execution Call| Tripwire
    Tripwire -->|Safe Arguments| StdioServer
    Tripwire -->|Credential Detected (sk-*, ghp-*)| Block["🛑 TRIPWIRE: Block & Revoke Token"]
```

---

## 🔒 The 4 Core MCP Security Invariants

Every MCP server, tool manifest, and runtime invocation within the agency ecosystem must satisfy four security invariants:

### 1. Schema Injection & Description Poisoning Scanner (MCP-001)
*Vulnerability: OWASP MCP03 (Tool Poisoning / Rug Pull Attacks).*  
Malicious MCP servers hide system prompt overrides, developer mode toggles, or data exfiltration commands within the `description` fields of tools or their JSON Schema properties. Because LLMs process tool descriptions alongside system prompts, they accept poisoned instructions as authoritative.

- **Mandatory Pre-Flight Manifest Inspection**: Before any tool manifest is hydrated into context, `mcp-sanitizer` scans all tool and parameter descriptions against prompt injection patterns (`ignore previous instructions`, `you are now in developer mode`, `<system>`, `disregard prompt`, `exfiltrate`).
- **Zero-Tolerance Quarantine**: Any tool exhibiting injection patterns is immediately placed into quarantine and excluded from the agent's tool set.

### 2. Transport Isolation & Network Perimeter Gate (MCP-002)
MCP supports both local process communication (`stdio`, `ipc`) and remote network transports (`http`, `sse`, `websocket`).
- **stdio / IPC Preference**: Local tools must execute strictly over `stdio` or Unix domain sockets (`ipc://`). This confines message exchange to the parent agent process with zero open network ports.
- **Strict Remote Perimeter Fencing**: Any remote network transport must:
  1. Bind exclusively to loopback (`127.0.0.1` or `localhost`), rejecting wildcard bindings (`0.0.0.0`).
  2. Enforce TLS encryption (`https://`, `wss://`) if routed outside localhost.
  3. Require explicit, scoped `Authorization` bearer token headers in server configuration headers. Unauthenticated remote endpoints fail validation.

### 3. Dynamic JIT Schema Hydration & Lazy Loading (MCP-003)
Exposing 40+ MCP tools simultaneously causes severe **context window bloat** (10,000+ tokens consumed on tool definitions alone) and degrades model attention.
- **Intent-Driven Tool Clustering**: `mcp-sanitizer` dynamically analyzes the active user intent and hydrates *only* the matching tool cluster (e.g. `filesystem`, `git`, `browser`, `telephony`, `database`, `security`).
- **Token Compression**: Achieves **70%–85% token reduction** by deferring unneeded tool schemas until explicitly invoked, preserving full model reasoning capacity.

### 4. Ephemeral Token Fencing & Credential Exfiltration Tripwire (MCP-004)
Even with clean schemas, compromised tool logic could attempt to induce the agent to pass sensitive environment variables, private keys, or API tokens in its argument payload.
- **Runtime Argument Scrubbing**: Evaluates all runtime tool payloads before dispatch. If arguments contain detected credentials (e.g. `sk-ant-*`, `sk-*`, `ghp_*`, private RSA keys, or database URLs), execution is halted immediately.
- **Automated Tripwire Alert**: Emits a `BLOCKED_CREDENTIAL_EXFILTRATION` alert and revokes ephemeral tool lease permissions.

---

## 📊 MCP Server Configuration Security Rubric

| Aspect | Safe (Compliant) | Warning (Review Required) | Critical (Blocked) |
| :--- | :--- | :--- | :--- |
| **Transport** | `stdio` or local Unix socket | Localhost `http://127.0.0.1` with Auth | `0.0.0.0` or public HTTP without TLS |
| **Authentication** | Process IPC inheritance | Scoped Bearer Token in headers | No authentication header on network call |
| **Launch Args** | Environment variable references | Flag arguments with benign parameters | Hardcoded secret tokens (`sk-*`, `ghp_*`) |
| **Tool Descriptions** | Clean functional descriptions | Verbose technical specifications | Prompt overrides (`ignore instructions`) |
| **Parameter Types** | Strict types (`string`, `enum`, `number`) | Open `object` types without property schema | `any` or arbitrary string execution |

---

## 🚨 Incident Response: Tool Poisoning Triage

If `mcp-sanitizer` detects an active OWASP MCP03 violation:
1. **Kill Server Process**: Instantly terminate the child MCP process via PID kill.
2. **Quarantine Tool**: Exclude the tool from `.gemini/commands`, `.opencode/commands`, and runtime registries.
3. **Log Incident Ledger**: Record the target tool name, raw payload, and matched signature to `.agents/artifacts/SECURITY_INCIDENT_LEDGER.md`.
4. **Notify Nexus**: Escalate to Nexus Technical Director for supply-chain review.

---

## 🛠️ MCP Sanitizer CLI Tooling (`mcp-sanitizer.ts`)

```bash
# 1. Scan an MCP tools/list JSON manifest for prompt poisoning (OWASP MCP03)
bun skills/quality-review/muse-security/scripts/mcp-sanitizer.ts \
  --scan-manifest tools-manifest.json

# 2. Audit mcpServers configuration JSON for network transport isolation
bun skills/quality-review/muse-security/scripts/mcp-sanitizer.ts \
  --audit-config mcp-servers.json

# 3. Simulate dynamic JIT tool hydration against a user intent
bun skills/quality-review/muse-security/scripts/mcp-sanitizer.ts \
  --hydrate-tools \
  --intent "commit bugfix and push to remote origin"

# 4. Inspect runtime tool payload for credential exfiltration
bun skills/quality-review/muse-security/scripts/mcp-sanitizer.ts \
  --audit-payload \
  --tool "fetch_api" \
  --args '{"token": "ghp_EXAMPLE_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'
```

---

## 📊 Quality Verification Checklist

Before enabling any external MCP server:
- [ ] Tool manifest scanned for prompt injection and system prompt overrides (MCP-001).
- [ ] Server transport verified as `stdio` or authenticated loopback (MCP-002).
- [ ] No hardcoded API keys or secrets in server launch arguments (MCP-002/MCP-004).
- [ ] Dynamic JIT tool hydration verified to achieve $\ge 70\%$ token reduction (MCP-003).
- [ ] Runtime payload tripwire tested against simulated credential leaks (MCP-004).
