# vault — Multi-Client Context Vault, Asset Fencing, and Worktree Isolation

Airtight multi-client context segregation, proprietary asset fencing, shared worktree lease arbitration, and multi-tenant credential masking for agency operations. Enforces zero cross-contamination between client brands, customer databases, and LLM agent sessions.

---

## Scope

- **Directory-Level Multi-Tenant Fencing**: Strict partitioning under `~/Projects/clients/<client_brand>/` with hermetic boundaries.
- **Brand Asset & Intellectual Property Fencing**: Strict isolation preventing cross-client font licensing, brand color tokens, SVG vector leaks, and Figma design URLs.
- **Worktree Lease Arbitration**: Integrates with `.agents/context/worktree-lease.json` ensuring two parallel agent sessions or subagents never collide or corrupt git checkouts.
- **Multi-Tenant Credential Masking**: Automated token sanitization replacing live secrets with structured redactions (`[REDACTED:<CLIENT_SLUG>:<SERVICE>]`).
- **Context Switch Protocol**: Deterministic 4-step flush for agents switching between client workspaces without LLM context bleeding.

---

## 🏛️ Context Vault Architecture

```
                  ┌─────────────────────────────────────┐
                  │        Agency Host Runtime          │
                  └──────────────────┬──────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
    ┌──────────────────────────┐            ┌──────────────────────────┐
    │ ~/Projects/clients/brand-a │            │ ~/Projects/clients/brand-b │
    ├──────────────────────────┤            ├──────────────────────────┤
    │ • .memory/memory.db      │            │ • .memory/memory.db      │
    │ • .memory/CURRENT.md     │  AIRTIGHT  │ • .memory/CURRENT.md     │
    │ • .agents/brand/tokens   │ ◄────────► │ • .agents/brand/tokens   │
    │ • .agents/context/       │  BOUNDARY  │ • .agents/context/       │
    │ • worktree lease: active │            │ • worktree lease: active │
    └──────────────────────────┘            └──────────────────────────┘
                 │                                       │
                 ▼                                       ▼
       [Isolated Subagent A]                   [Isolated Subagent B]
     (Zero access to brand-b)                (Zero access to brand-a)
```

---

## 🔒 The 5 Vault Fencing Invariants

### 1. Absolute Path & Directory Fence (VLT-001)
- Client code, markdown notes, and configuration files must **never** contain hardcoded paths pointing to another client workspace (`/home/.../Projects/clients/<other_client>/...`).
- Cross-client symlinks are strictly prohibited. Every client repository must be an independent git checkout or submodule.

### 2. Brand Asset & Identity Fence (VLT-002)
- Client typography files (`.woff2`, `.ttf`), brand design tokens (`tokens.json`), SVG marks, and marketing copy must reside strictly within `./.agents/brand/`.
- Assets must follow the canonical naming convention: `<client>-<category>-<descriptor>.<ext>` (e.g. `acme-logo-primary.svg`, never `logo_final2.svg`).

### 3. Worktree Lease Arbitration (VLT-003)
- When an agent or automated worker initiates work on a client workspace, it must acquire or verify the local worktree lease:
  ```json
  {
    "holder": "opencode-session-1849",
    "client": "acme-corp",
    "branch": "feat/checkout-flow",
    "acquiredAt": "2026-10-26T21:00:00.000Z",
    "heartbeat": "2026-10-26T21:04:00.000Z",
    "expiresAt": "2026-10-26T21:34:00.000Z"
  }
  ```
- If a foreign lease is active with a heartbeat under 30 minutes, the agent **must defer execution** rather than force-checkout or clobber stashes.

### 4. Multi-Tenant Credential Masking (VLT-004)
- Client credentials (Stripe publishable/secret keys, database URLs, Resend API keys, AWS access IDs) must never appear in agent transcripts or shared logs.
- When generating reports or logs across client accounts, mask credentials with tenant-scoped tags:
  - `sk_live_...` → `[REDACTED:acme:stripe_secret]`
  - `postgres://...` → `[REDACTED:acme:database_url]`

### 5. Context Switch Flush Protocol (VLT-005)
When human operators or orchestrator agents switch tasks from Client A to Client B, execute the 4-step memory flush:
1. **Unload & Anchor**: Unload Client A's constraints and drop a working context-anchor (`/context-anchor save "client-a-milestone-2"`).
2. **Boundary Audit**: Run `bun multi-client.ts --verify-boundary` on Client B's workspace root.
3. **Hermetic Memory Load**: Load Client B's `.memory/CURRENT.md` and `.agents/context/product.md`.
4. **Tenant Verification**: Confirm zero occurrences of Client A's brand tokens or domain names in active prompt context.

---

## 🛠️ Automated Vault Audit Engine

Run the vault boundary audit across all client repositories:

```bash
# Verify workspace isolation and detect cross-client bleed
bun skills/agency-delivery/ops/scripts/multi-client.ts --verify-boundary ~/Projects/clients/acme-corp

# Audit environment URLs and staging leakage
bun skills/agency-delivery/ops/scripts/multi-client.ts --check-urls ~/Projects/clients/acme-corp --env prod

# Validate asset naming hygiene
bun skills/agency-delivery/ops/scripts/multi-client.ts --audit-assets ~/Projects/clients/acme-corp/creative
```

---

## Quality Gate

- [ ] Workspace directory isolated strictly under `~/Projects/clients/<brand>/`.
- [ ] No hardcoded foreign client paths detected in code or documentation.
- [ ] Brand assets adhere to canonical naming `<brand>-<category>-<desc>.<ext>`.
- [ ] Active worktree lease validated before initiating git branch operations.
- [ ] All client API keys masked using tenant-scoped redaction format.
- [ ] Context switch protocol executed with explicit working anchor save.

---

## Routing

- Multi-client portfolio capacity planning → `ops:multi-client`.
- Initial workspace creation and progressive DOX scaffolding → `new-project`.
- Subagent tenant security boundaries and POSIX fences → `muse-security:boundary`.
- Client task switching and reference anchoring → `context-anchor`.
