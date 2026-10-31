# 🧠 Memory & Project State Policy

Standards defining the strict operational boundaries between documentation synchronization (`updatedocs`), cognitive memory systems (`musememory`), and DOX architecture (`.agents/`).

---

## 1. Complete Separation of Memory and Documentation

Project memory and state systems exist **completely independently** of `updatedocs`:

- **`.memory/` is Off-Limits**: `.memory/` is owned and automatically maintained by `musememory`. `updatedocs` does NOT read, write, modify, or reorganize `.memory/`.
- **`.agents/context/*` is Protected DOX Architecture**: `updatedocs` does NOT maintain `.agents/context/*`. Synchronization of DOX context is owned by designated DOX mechanisms (`new-project`, `updateagents`, or human operators).
- **Durable Fact Reporting Only**: If documentation analysis discovers a durable fact or constraint that would normally belong in project memory, `updatedocs` may report it as a recommendation in the final output. It must **never** write that fact into `.memory/` or `.agents/context/*` directly.

```
[Repository Change / Diff]
           │
           ▼
     [updatedocs] ──► Audits & synchronizes user-facing project docs (README, API, CHANGELOG)
           │
           ├──► Identifies durable constraint ──► Reports in output (DO NOT write to .memory/)
           │
           └──► Identifies agent context drift ──► Recommends `updateagents`
```

---

## 2. Independent State Systems

### 1. `.memory/` (Machine / Real-Time State)
- **Owner**: `musememory`
- **Scope**: Ephemeral working constraints, active execution invariants, multi-agent collision workstreams.
- **Rule for updatedocs**: `DO NOT TOUCH`.

### 2. `.agents/context/current.md` (Shipped Reality Oracle)
- **Owner**: Protected DOX Architecture
- **Scope**: Verified shipped capabilities, runtime oracle health, known gaps.
- **Rule for updatedocs**: Inspect under applicable `AGENTS.md` governance; `DO NOT MODIFY` without explicit user permission.

### 3. `SUMMARY.md` / `SESSION_LOG.md` (Project Change Ledgers)
- **Owner**: Project developers & active workflows
- **Scope**: Reverse-chronological rolling ledger of verified session changes.
- **Rule for updatedocs**: Append verified documentation synchronization entries only when the project explicitly maintains a change ledger.
