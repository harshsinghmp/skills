# Skill Orchestration Map

> Defines which sibling muse-skills run before, after, or alongside each evidence-ledger command.

---

## Execution Semantics

- **Pre-hook (runs-before)**: The agent SHOULD invoke this skill first if the stated condition applies. If the condition is not met, skip.
- **Post-hook (runs-after)**: The agent SHOULD invoke this skill after the evidence command completes, if the stated condition applies.
- **Optional companion**: The agent MAY invoke this skill based on context but is not required to. These are suggestions, not mandates.

The agent decides at runtime. These are prioritized suggestions, not hard-wired pipelines.

---

## Master Orchestration Table

| Command | Pre-Hook | Post-Hook | Optional Companion |
| :--- | :--- | :--- | :--- |
| `/evidence onboard` | — | `audit` (verify imports) | `updateagents` (register ledger in AGENTS.md) |
| `/evidence status` | — | — | `coach` (standup scoring), `periodic-retreat` (quarterly review) |
| `/evidence decide` | — | `secretary` (high-stakes gate) | `updatedocs` (sync architecture docs) |
| `/evidence commit` | — | — | `updatedocs` (sync project docs) |
| `/evidence audit` | `context-anchor` (park workstream) | `dead-letter` (quarantine failures) | `updatedocs` (remediate docs), `coupling-router` (multi-module) |
| `/evidence brief` | `context-anchor` (park workstream) | `handoff` (dispatch packet) | — |

---

## Skill Integration Details

### `context-anchor` → Pre-hook for `/evidence brief`, `/evidence audit`

**Condition**: Only if an active workstream is detected in the current session (the agent is mid-task on something else). Skip if this is the first task.

**Integration**: Evidence-ledger checks for active work context. If found, invokes `context-anchor` to drop a named anchor (e.g., `@pre-evidence-audit`) so the user can resume the prior workstream afterward.

---

### `handoff` → Post-hook for `/evidence brief`

**Condition**: Only if the user or orchestrator intends to dispatch a subagent to work on the briefed project. The agent offers: *"Want me to generate a handoff packet for a subagent?"*

**Integration**: The briefing content is folded into the handoff dispatch context. The handoff packet references `evidence-ledger.md` as the factual anchor for the subagent.

---

### `secretary` → Post-hook for `/evidence decide` (high-stakes only)

**Condition**: The decision involves infrastructure, billing, auth, data migration, external vendor commitment, or production deployment. The user can force (`"this is high-stakes"`) or bypass (`"no approval needed"`).

**Integration**: Secretary runs its 3-prong Socratic adversarial challenge on the decision. If approved, the EVD entry status becomes `ACTIVE`. If rejected, entry stays `QUARANTINED` pending revision.

---

### `updatedocs` → Optional for write operations

**Condition**: Optional by default. Becomes recommended when the evidence entry modifies an architectural decision or introduces a new external dependency.

**Integration**: After evidence write, the agent offers: *"Should I run updatedocs to sync project docs?"* If yes, `updatedocs` scans for drift between the new evidence and README, architecture docs, changelogs, and proposes minimal fixes.

---

### `audit` → Post-hook for `/evidence onboard`

**Condition**: Always runs after onboard. Scope is limited to newly imported entries only.

**Integration**: Checks imported entries for dead links, contradictions, orphaned references, and credential leaks. Findings become `STATUS` entries with `QUARANTINED` status in the evidence log.

---

### `updateagents` → Optional after `/evidence onboard`

**Condition**: Only if the project has an `AGENTS.md`. The agent offers to add a reference.

**Integration**: Adds to AGENTS.md: *"Evidence tracking is active. Consult `.agents/context/evidence-ledger.md` for project facts, decisions, and commitments."*

---

### `coupling-router` → Optional for `/evidence audit` on multi-module artifacts

**Condition**: Only if the audit target spans multiple tightly-coupled modules (e.g., full-stack architecture doc covering frontend + backend + infra).

**Integration**: Coupling-router analyzes the dependency graph and splits the audit into module-scoped passes for better accuracy.

---

### `dead-letter` → Post-hook for `/evidence audit` (on failures)

**Condition**: Only if the audit produced entries with `QUARANTINED` or `REDACTED` status. Skip if all claims passed.

**Integration**: Quarantined claims are fed to `dead-letter`, which categorizes the failure mode (hallucinated stat, broken DOI, missing benchmark) and generates a retry packet or escalation message.

---

### `coach` → Optional companion for `/evidence status`

**Condition**: Fully optional. Fires if the user is doing a daily check-in or `coach` is already active in the session.

**Integration**: Coach reads the evidence dashboard and includes evidence hygiene (verified ratio, overdue commitments, stale claims) as a scoring dimension in the daily standup scorecard.

---

### `periodic-retreat` → Optional companion for `/evidence status`

**Condition**: Only relevant during quarterly retreats. Not wired into daily operations.

**Integration**: Retreat reads the evidence ledger to generate a facts-based retrospective. `SUPERSEDED` entries show decision churn. `OVERDUE` commitments show delivery gaps. `VERIFIED` claims show what held up.
