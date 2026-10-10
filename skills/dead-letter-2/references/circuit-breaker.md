# Toxic Task Circuit Breaker & Concurrency Safety

Loaded by: `dead-letter` capture and recovery procedures when handling repeated task failures, high-concurrency subagent crashes, or credentialed error traces.

---

## 1. Toxic Task Circuit Breaker Protocol

Unbounded agent retry loops burn hundreds of thousands of tokens and mask systemic infrastructure breaks. The Circuit Breaker enforces an immediate hard stop on toxic tasks.

### Tripping Conditions (Trip Immediately When):
1. **Identical Signature Repeat**: The same `(failure_code, root_cause)` signature appears **$\ge 2$ times** on the same task ID or file target.
2. **Precondition Stagnation**: An agent attempts a retry when the Precondition Delta is empty (nothing in the environment or codebase changed).
3. **Cascading Blast Radius**: $\ge 3$ distinct subagent tasks fail within a 90-second window sharing the same upstream dependency or producer.

### Circuit Breaker States:
- **CLOSED (Normal Operation)**: Retries permitted if within autonomy bounds and Precondition Delta is verified.
- **TRIPPED (Frozen)**:
  - Task execution is immediately suspended.
  - Background retry dispatch is halted for that task ID.
  - The record is marked with status `FROZEN-CIRCUIT-TRIPPED`.
  - An emergency incident packet is generated at `.agents/artifacts/incident-<task-id>-<timestamp>.md`.
- **HALF-OPEN (Canary Probe)**:
  - Permitted only after an explicit external fix is verified (e.g. human provides missing credentials or merges upstream fix).
  - Runs exactly one bounded canary attempt with full trace capture. If the canary fails, the circuit re-trips immediately.

---

## 2. Zero-Credential Stack-Trace Sanitization (Vibeguard)

Runtime crashes from databases, payment providers (Stripe), cloud APIs (AWS, Cloudflare), or LLMs routinely dump connection strings, auth headers, and tokens into stderr. Storing raw stack traces in `.agents/` violates the zero-credential leakage contract.

### Masking Rules (Apply Before Disk Write):
All dead-letter captures must run stderr and logs through these deterministic redaction filters:

| Pattern | Match | Redacted Output |
| :--- | :--- | :--- |
| **Bearer Tokens** | `Bearer\s+[A-Za-z0-9_\-\.~+/]+=*` | `Bearer [REDACTED]` |
| **API Keys** | `(sk-[a-zA-Z0-9]{20,}\|ghp_[a-zA-Z0-9]{20,}\|npm_[a-zA-Z0-9]{20,})` | `[REDACTED_API_KEY]` |
| **Database URLs** | `postgres://[^:]+:[^@]+@[^/]+/[^\s]+` | `postgres://[REDACTED]:[REDACTED]@[REDACTED]/[DB]` |
| **Private Keys** | `-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----` | `[REDACTED_PRIVATE_KEY]` |
| **Basic Auth** | `Basic\s+[A-Za-z0-9+/=]{10,}` | `Basic [REDACTED]` |

---

## 3. Concurrency Safety & Atomic Record Persistence

When multiple subagents fail simultaneously (e.g., during a cluster network partition or rate-limit throttle), concurrent writes to `.agents/dead-letter-<timestamp>.md` or `.agents/artifacts/dead-letter-ledger.md` risk file corruption or lost updates.

### Atomic Write Protocol:
1. **Write to Staging**: Write full record to a unique temporary file:
   `.agents/artifacts/.tmp-dl-<pid>-<random-hex>.md`
2. **Flush to Disk**: Ensure data is completely flushed and sync'd.
3. **Atomic Rename**: Atomically move the staged file to the final destination:
   `fs.renameSync(stagingPath, finalRecordPath)` (POSIX atomic replacement).
4. **Shared Ledger Lock**: When appending to `dead-letter-ledger.md`, use cooperative lockfiles (`.ledger.lock`) with a 5000ms TTL to prevent race-condition overwrite.
