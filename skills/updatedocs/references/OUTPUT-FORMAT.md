## Output Format

Report depth scales with mode. Use the **Full Report** for Change, Release, Sprint, and Full modes. Use the **Condensed Report** for Quick mode — a targeted single-section fix does not justify a full governance scaffolding.

### Condensed Report (Quick mode)

```markdown
## 📚 Doc Sync — <target document>

**Mode:** Quick | **Change inspected:** <files/diff scope>

- **Updated:** `<path>` — <one-line reason, evidence-backed>
- **Verified:** <command/link/claim checked against source>
- **Ledger:** <DP range caught up / no pending points / pending DP ids>
- **Boundaries:** `.memory/` untouched; `.agents/` <not affected / permission required>
- **Skipped:** <nearby docs deliberately not touched and why>
```

Omit any line that does not apply. If more than ~3 documents were touched or a second-order impact was discovered, the mode should have been escalated — note it in the report.

### Full Report (Change / Release / Sprint / Full modes)

Always provide a structured synchronization report:

```markdown
## 📚 Documentation Synchronization Report

### 📝 Updated
- `path/to/file`
  - Reason: [verified change impact]
  - Scope: [sections changed]

### ➕ Added
- `path/to/file`
  - Reason: [missing documentation identified]

### 🗑️ Removed / Deprecated
- `path/to/file`
  - Reason: [obsolete behavior / deprecation]

### 🔍 Reviewed — No Change Required
- `path/to/file`
  - Reason: [why current documentation remains accurate]

### ⚠️ Drift / Documentation Debt
- `path/to/file`
  - Issue: [verified problem]
  - Status: [resolved / unresolved / blocked]

### 🧭 Documentation Points
- **Caught up:** <DP-0001 → DP-0007 / no new commits>
- **Pending:** <DP ids + missing audiences, or none>
- **Shipped:** <DP ids + release tags, or none>
- **Memory hints:** <printed / suppressed; never written to `.memory/`>
- **Agent backlog:** <`updateagents --docs-backlog` consumed DP range / blocked on DP id>

### 🔐 Protected DOX Architecture Review
- `.agents/`: [not affected / reviewed, no change / affected but not modified]
- Governing `AGENTS.md`: `[path]`
- Permission: [not required / explicit permission required / granted]
- Modification: [none / authorized change]

### 🧠 Memory Boundary
- `.memory/`: untouched
- Owner: `musememory`
- Documentation findings requiring memory/state handling were not written by `updatedocs`.

### ✅ Verification
- **Git Scope:** [what was inspected]
- **Sources of Truth:** [what was checked]
- **Internal Links:** [verified / not checked]
- **Commands:** [verified / not checked]
- **Examples:** [verified / not checked]
- **API / Schemas:** [verified / not applicable]
- **Configuration:** [verified / not applicable]
- **Architecture:** [verified / not applicable]
- **Generated Docs:** [handled / not applicable]
- **Cross-Document Consistency:** [verified / findings]
- **Security:** [no secrets exposed]

### ❓ Unverified / Ambiguous
*(Include only when needed)*
- `topic`
  - Uncertainty: [exact issue]
  - Evidence needed: [what would resolve it]

### 🤝 Recommended Companion Handoffs
*(Include only where useful; state the fallback when a companion is not installed)*
- `updateagents` → agent-context or instruction architecture requires deeper maintenance (fallback: report the exact proposed change and leave the decision to the user)
- `musememory` → durable state may require its own automatic lifecycle (musememory is a runtime system, not a suite skill; when absent, simply report the durable fact in the output — never write it to `.memory/` yourself)
- `handoff` → concrete implementation task should be delegated
```

---
