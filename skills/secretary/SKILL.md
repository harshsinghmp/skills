---
name: secretary
aliases: ["secretary-controller","staff-controller","approval-gate"]
description: "Evidence-grounded staff-work controller and approval gate for high-stakes decisions, executive briefs, memos, and outbound actions. Enforces judgment over authority, Socratic adversarial stress-testing (3-prong devil's advocate challenge), explicit dissent preservation, frozen evidence snapshots, and single-use SHA-256 hash approvals before any filesystem or external mutation. Extends to delegation control: subagent dispatch with teachback confirmation and two-stage review gates, DAG wave dispatch that skips dependents on parent failure, intake triage with WIP limits, blast-radius replan protocol, orientation briefings, a persistent task ledger, and structured session handover with three-tier harvest."
version: 1.4.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: context-orchestration
metadata:
  category: context-orchestration
  priority: 13
  aliases: ["secretary-controller","staff-controller","approval-gate"]
  suggested_skills: ["evidence-ledger","coupling-router","gauntlet-loop","code-review"]
  hermes:
    tags: [staff-work, executive-brief, approval-gate, governance, decision-memo, evidence, hash-approval, socratic-lens, adversarial-review, dissent-preservation, teachback, two-stage-review, replan, handover, wave-dispatch, task-ledger, handoff-harvest]
    related_skills: [evidence-ledger, coupling-router, gauntlet-loop, code-review]
    suggested_skills: [evidence-ledger, coupling-router, gauntlet-loop, code-review]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  openclaw:
    category: context-orchestration
    suggested_skills: [evidence-ledger, coupling-router, gauntlet-loop, code-review]
    primary_triggers: ["prepare staff packet","executive memo","request approval hash","socratic review","dispatch subagent with teachback","review delegated work","replan invalidated plan","orient briefing","session handover","dispatch wave","task ledger status"]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📑 Secretary Controller — Evidence-Grounded Staff-Work Controller

> Controls high-stakes staff work (executive briefs, decision memos, architecture governance, outbound comms). Enforces the iron doctrine of *Judgment, not authority*: agents synthesize evidence, stress-test proposals through a mandatory Socratic adversarial challenge (3-prong devil's advocate), preserve contradictions and uncertainties, and halt at an unyielding cryptographic single-use SHA-256 hash approval gate before committing any real-world changes.

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Preparing High-Stakes Staff Work**: Drafting executive summaries, investment/architecture decision memos, RFCs, or principal briefs.
2. **Conducting Socratic Adversarial Review**: Subjecting architectural or operational decisions to an uncompromising devil's advocate stress test.
3. **Mandatory Approval Gates**: Any operation involving irreversible filesystem writes, production deployments, database migrations, or outbound communications.
4. **Preserving Critical Dissent**: Complex problem spaces where contradictory data, uncertainty, or "no data" gaps must be preserved rather than smoothed over.
5. **Frozen Evidence Verification**: Decisions must rely strictly on declared, manifested evidence with zero hallucinated facts.
6. **Delegating High-Stakes Work**: Routing subagent dispatches that touch governed surfaces — dispatch requires teachback, delivery passes two-stage review.
7. **Plans Invalidated by Reality**: An assumption, dependency, or scope premise broke and the active plan must be re-scoped, not silently patched.
8. **Session Boundaries**: A long-running session is ending with in-flight governed state that must survive a context reset.

### Anti-Triggers
Do NOT use this skill when:
- Performing routine code refactoring covered by automated test suites.
- Executing minor documentation typo fixes.
- Running sandbox experiments where fast autonomous exploration is desired.

---

## Quick Reference

### The 4 Core Doctrines of Staff Work

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ 1. Judgment, Not Power  │     │ 2. Socratic Dissent     │
│ Recommends with rigor;  │     │ 3-prong devil's advocate│
│ halts at approval gate  │     │ challenges all premises │
└─────────────────────────┘     └─────────────────────────┘
             │                               │
             ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 3. Frozen Evidence      │     │ 4. Single-Use Hash Gate │
│ Zero extrapolation;     │     │ SHA-256 confirmation    │
│ cited primary sources   │     │ required for execution  │
└─────────────────────────┘     └─────────────────────────┘
```

### The Socratic Adversarial Triad

Every proposal must withstand 3 mandatory challenge angles before hashing:

| Angle | Probing Question | Focus Area |
| :--- | :--- | :--- |
| **1. Architectural Fragility** | *"Under what realistic load, edge case, or corruption does this design break?"* | SPOFs, concurrency, distributed state |
| **2. Rollback Burden** | *"If execution aborts at 50%, how catastrophic and manual is recovery?"* | Irreversible writes, missing dry-runs |
| **3. Hidden Assumptions** | *"What unverified optimistic claims is this plan treating as fact?"* | Unbenchmarked claims, API limits |

### Approval State Machine

| State | Meaning | Allowed Actions |
| :--- | :--- | :--- |
| `DRAFTING` | Compiling facts and surfacing uncertainties | Read-only tools, evidence collection |
| `ADVERSARIAL_CHALLENGE` | Formulating 3 counter-arguments & Socratic inquiry | Stress-test proposal; query principal on ambiguities |
| `NEEDS_APPROVAL` | Recommendation frozen with payload SHA-256 | Output `APPROVAL_PACKET.md`, wait for user hash confirmation |
| `APPROVED` | User matches exact SHA-256 hash token | Execute proposed mutation |
| `REJECTED` | User rejects or requests modifications | Record feedback, return to `DRAFTING` |

### Delegation Control Gates (subagent dispatch)

When the secretary routes work to subagents on governed surfaces:

| Gate | Rule | Failure Handling |
| :--- | :--- | :--- |
| **Teachback** | Dispatched agent must restate task scope, acceptance criteria, and upstream dependencies in its own words **before doing any work**; lead stores the agent id for resume-on-blocker | Wrong/missing teachback → re-dispatch with sharpened instructions, never let work start on a misread |
| **Two-Stage Review** | Delivery passes two reviewer agents: (1) **spec-compliance** — acceptance criteria met, (2) **quality** — maintainability, security, minimal-diff discipline | Failed review → iterative fix cycle, max 3 retries, then escalate to the principal with the review findings |
| **Aggregation** | Subagent outputs consolidated into one structured summary for the principal; raw agent output never surfaced | N/A |
| **Wave Dispatch (DAG)** | Independent tasks in the same dependency wave dispatch in parallel; a wave completes and its results are validated before the next wave launches | Parent failure → dependents are marked `SKIP` (never dispatched), not left dangling; the failure routes to `dead-letter` |
| **Feedback Reception** | Review feedback returning from delegations or reviewers is verified against the code before implementation; each item is classified implement / rebut (with evidence, never deference) / ask (one specific question); items touching auth, payments, or migrations get investigation before application | Performative agreement or blind application → the gate failed; re-verify every item before any further edit |

### Blast-Radius Replan Ladder

When an approved plan is invalidated (failed assumption, broken dependency, new constraint), classify before re-proposing:

| Radius | Meaning | Action |
| :--- | :--- | :--- |
| `NEXT_ACTION` | One step is wrong | Patch the step; plan intact |
| `MILESTONE` | A phase outcome unreachable | Re-scope the phase; downstream milestones re-validated |
| `OUTCOME` | The end-state itself is questioned | Full Socratic re-run on the new proposal |
| `KILL` | No path to the outcome | Recommend abandonment with lessons logged; return unused budget |

State the invalidation cause → classify radius → propose the patch → obtain approval → append the decision to the project log. A `done_when` change is always at least `MILESTONE` radius and is logged before it is applied.

### Orient Briefing (on entry)
When the principal asks for status (or on resume), emit a read-only briefing before any new work:

- **Active items**: id, priority, state-machine position, next action.
- **Blocked / overdue**: what is waiting on whom, past-deadline approvals.
- **In-flight delegations**: subagent, teachback status, review state.
- **One recommendation**: the single highest-leverage next action.

Read-only by default; writes only on explicit request.

### Task Ledger (persistent delegation state)
Delegation state lives in files, not conversation. Maintain `.agents/secretary-tasks.json` — one entry per delegated item: `id`, `status` (`PLANNING` → `IN_PROGRESS` → `REVIEW` → `DONE`/`FAILED`/`SKIP`), `assignee` (agent id from teachback), `dependencies`, `result` (verification receipt). Operations are idempotent: `next` (first actionable item), `set-status`, `verify` (receipt required before `DONE`). One foreground task at a time, each with explicit completion criteria. On any context reset, reconstruct state from the ledger + `HANDOFF.md` + git history — never from memory of the conversation; premature "completion" without a ledger receipt is the #1 recovery failure.

### Handoff Harvest (three tiers)
Processing received handoffs/HANDOFF.md files is a harvest with three modes, chosen by situation:

| Tier | When | Protocol |
| :--- | :--- | :--- |
| **Standard** | After a phase completes | Discover all pending handoffs → review each → save durable learnings |
| **Incremental** | After remediation of a known issue | Delta-only: process what changed since the last harvest |
| **Consolidation** | Session end / before `/clear` | Read ALL pending HANDOFFs before saving any — deduplicate and consolidate across them into one coherent state, then write the handover file (Step 6) |

Harvest rule: never persist a learning that a later handoff in the same batch contradicts or supersedes — read everything first, then write once.

---

## Procedure

### Step 0 — Intake Triage & WIP Gate
Raw input enters an intake state verbatim — never act on it mid-conversation without classification. Triage: classify (decision / delegation / brief / routine-reject), assign priority, and only then promote to active work. Active governed work must carry an explicit **done_when** (verifiable end-state) and a **next_action**; items missing either stay in triage. Respect the WIP limit — promoting new active work past the limit requires retiring or parking an existing item first.

### Step 1 — Evidence Ingestion & Snapshot Freezing
1. Declare all factual sources (file paths, test logs, URL citations).
2. Construct the **Evidence Register**—every claim in the memo must link to a specific line range or test receipt.
3. Mark any unknown, missing, or contradictory data points as `[NO-DATA]` or `[CONTRADICTION]`.

### Step 2 — Socratic Adversarial Challenge & Devil's Advocate Gate
Prior to generating mutations or computing hashes, conduct the adversarial review (see `references/socratic-adversarial-gate.md`):
1. **Formulate 3 Counter-Arguments**:
   - Challenge Architectural Fragility (SPOFs, edge case failures).
   - Challenge Operational & Rollback Burden (recovery complexity).
   - Expose Hidden Assumptions (unverified claims).
2. **Socratic Inquiry**:
   - If critical assumptions lack grounding, ask clarifying questions before continuing.
3. **Record Dissent**:
   - Document all counter-arguments, mitigations, and accepted risks in the **Preserved Dissent Ledger**.

### Step 3 — Construct the Completed Staff Work Packet
Synthesize the decision artifact (`DECISION_MEMO.md`) containing:
- **Core Recommendation**: Unambiguous 1-sentence action proposal.
- **Context & Strategic Trade-offs**: Why this approach beats alternatives.
- **Preserved Dissent & Adversarial Ledger**: 3 counter-arguments with mitigations or accepted risks.
- **Payload Manifest**: Exact files to be created/modified or shell commands to run.

### Step 4 — Compute Payload Hash & Emit Approval Gate
1. Calculate the SHA-256 checksum of the proposed diff or execution payload:
   ```bash
   echo "<payload_content>" | sha256sum | cut -d' ' -f1
   ```
2. Generate `APPROVAL_PACKET.md` with:
   - State: `NEEDS_APPROVAL`
   - Payload SHA-256: `SHA256:<hash>`
   - Prompt: *"To execute, approve with token `APPROVE:<hash>`."*
3. **HALT**. Do NOT execute payload without matching user confirmation.

### Step 5 — Verification & Single-Use Execution
Upon receiving user approval:
1. Validate token matches computed SHA-256 hash.
2. Execute the approved mutations.
3. Stamp the artifact as `EXECUTED` with execution timestamp.

### Step 6 — Session Handover
Before a session boundary (context reset, `/clear`, handoff to another agent), run the **Consolidation harvest** (see Handoff Harvest) — read all pending handoffs before writing anything — then write `.agents/secretary-handover.md`:
- **Structured state**: active decisions and their state-machine position, pending approvals with payload hashes, task-ledger status (in-flight delegations with agent ids and receipts), WIP items with next actions.
- **Temperature notes**: unstructured judgments in flight — human-side agreements, hesitations, open objections that are not yet formal dissent entries.
On resume, load this file first and restore minimum awareness before accepting new work.

---

## Pitfalls

- **Confirmation Bias & Rubber-Stamping**: Accepting user premises uncritically without running the 3-prong devil's advocate challenge.
- **Hallucinating Authority**: Executing mutations or external sends under the assumption that "the user would want this". Always stop at `NEEDS_APPROVAL`.
- **Smoothing Over Dissent**: Hiding trade-offs, risks, or negative benchmark findings to make a memo appear neat.
- **Floating Approvals**: Re-running execution on a modified payload without computing a fresh SHA-256 hash.
- **Unverified Assumptions**: Estimating metrics instead of writing `[NO DATA AVAILABLE]`.
- **Skipping Teachback**: Letting a subagent start on an unconfirmed reading of the task — the cheapest failure to prevent and the most expensive to discover late.
- **Silent Plan Decay**: Patching an invalidated plan without classifying blast radius — the decision log loses the why, and the next session inherits a plan that no longer matches reality.
- **Triage Bypass**: Acting on raw input before classification — urgency theater beats the WIP limit and quality gates.
- **Dangling Dependents**: Launching the next wave while a parent task is still `FAILED` — dependents get marked `SKIP` and routed, not silently inherited by a wave that assumes upstream success.
- **Conversation-State Recovery**: Reconstructing delegation state from remembered chat instead of the task ledger and handover file — a context reset wipes memory, files survive.

---

## Verification

Before issuing an approval packet, verify:
1. [ ] Every factual claim links to verified evidence in the register.
2. [ ] Socratic Adversarial Gate completed with at least 3 formulated counter-arguments.
3. [ ] Dissent, alternative approaches, and failure modes are explicitly documented in the ledger.
4. [ ] Proposed diff/payload has a valid SHA-256 checksum computed.
5. [ ] Execution stops completely until explicit cryptographic or user approval is received.
6. [ ] Delegated work: teachback confirmed before work began; two-stage review passed (or retries exhausted and escalated).
7. [ ] Any invalidated plan was re-scoped through the blast-radius ladder and logged.
8. [ ] Session ended on a boundary: consolidation harvest run, handover file written with structured state + temperature notes.
9. [ ] Task ledger current: every `DONE` item carries a verification receipt; no wave launched with an unresolved parent failure.
