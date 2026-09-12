---
name: evidence-ledger
aliases: ["claim-ledger","verification-ledger","citation-gate","project-evidence","evidence-tracker"]
description: "Persistent per-project evidence tracking system and source-cited claim verification gate for multi-client agency workflows. Maintains an append-only evidence-ledger.md per project tracking decisions (with options considered and evidence trail), client commitments (with deadlines and delivery proof), verified claims (with confidence taxonomy and receipts), and status facts (with blocker tracking). Six commands: /evidence onboard, /evidence status, /evidence decide, /evidence commit, /evidence audit, /evidence brief. Enforces the doctrine: 'No source, no claim. No verification path, no release.' Uses a 4-tier confidence taxonomy ([RAW], [FETCH], [SEARCH], [INFER]), academic DOI receipts, empirical vs speculative classification, and automatic staleness detection."
version: 2.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: context-orchestration
metadata:
  category: context-orchestration
  priority: 14
  aliases: ["claim-ledger","verification-ledger","citation-gate","project-evidence","evidence-tracker"]
  suggested_skills: ["secretary","updatedocs","audit","coupling-router","context-anchor","handoff","dead-letter","updateagents","coach","periodic-retreat"]
  skill_orchestration:
    evidence_onboard:
      post: ["audit"]
      optional: ["updateagents"]
    evidence_status:
      optional: ["coach","periodic-retreat"]
    evidence_decide:
      post: ["secretary"]
      optional: ["updatedocs"]
    evidence_commit:
      optional: ["updatedocs"]
    evidence_audit:
      pre: ["context-anchor"]
      post: ["dead-letter"]
      optional: ["updatedocs","coupling-router"]
    evidence_brief:
      pre: ["context-anchor"]
      post: ["handoff"]
  hermes:
    tags: [evidence, verification, citation, fact-checking, claims, research-gate, provenance, academic-research, citation-synthesis, receipt-audit, doi, empirical-verification, project-tracking, decisions, commitments, agency-workflow, context-switch, evidence-dashboard, staleness-detection]
    related_skills: [secretary, updatedocs, audit, coupling-router, context-anchor, handoff, dead-letter, updateagents, coach, periodic-retreat]
    suggested_skills: [secretary, updatedocs, audit, coupling-router, context-anchor, handoff, dead-letter, updateagents, coach, periodic-retreat]
    requires_tools: [bash, view_file, grep, write_to_file, replace_file_content, list_dir]
  openclaw:
    category: context-orchestration
    suggested_skills: [secretary, updatedocs, audit, coupling-router, context-anchor, handoff, dead-letter, updateagents, coach, periodic-retreat]
    primary_triggers: ["verify claims","audit evidence","generate claim ledger","cite sources","missing receipts report","evidence status","project health","record decision","evidence decide","record commitment","evidence commit","evidence onboard","initialize evidence","evidence brief","brief me on this project","context switch","what's the state of this project"]
    requires_tools: [bash, view_file, grep, write_to_file, replace_file_content, list_dir]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode, antigravity]
---

# 📜 Evidence Ledger — Persistent Project Evidence Tracking & Claim Verification Gate

> Maintains a single source of truth per project: decisions, client commitments, verified claims, and status facts — all backed by receipts. Enforces the non-negotiable verification doctrine: *"No source, no claim. No verification path, no release."*

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Onboarding a Project** (`/evidence onboard`): Setting up evidence tracking on a new or existing project by mining context files for initial entries.
2. **Checking Project Health** (`/evidence status`): Getting a quick factual snapshot of any project — what's verified, what's stale, what needs attention.
3. **Recording a Technical Decision** (`/evidence decide`): Capturing what was decided, what alternatives were considered, and what evidence supported the winner.
4. **Recording a Client Commitment** (`/evidence commit`): Tracking what was promised to a client, when it's due, and whether it was delivered with proof.
5. **Auditing Technical & Statistical Claims** (`/evidence audit`): Verifying documentation, proposals, or deliverables for ungrounded assertions, hallucinated benchmarks, or missing citations.
6. **Context-Switching Between Projects** (`/evidence brief`): Generating a structured briefing to quickly understand a project's current factual state before diving in.

### Anti-Triggers
Do NOT use this skill when:
- Writing pure fictional or creative narrative copy.
- Executing internal mechanical code refactors where automated test suites provide binary feedback.
- The project has no `.agents/context/` directory and the user has not requested evidence tracking.

---

## Quick Reference

### The 4-Tier Confidence Taxonomy

```
┌───────────────┬─────────────────────────────────────────────────────────────┐
│ Tier Tag      │ Definition & Verification Requirement                       │
├───────────────┼─────────────────────────────────────────────────────────────┤
│ [RAW]         │ Verbatim output from local executed command or local file   │
│ [FETCH]       │ Direct quote from authoritative primary URL, RFC, or DOI    │
│ [SEARCH]      │ Corroborated fact supported by 2+ independent search hits   │
│ [INFER]       │ Agent logical deduction; MUST state premises explicitly     │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

### Evidence Entry Categories

| Category | Purpose | Key Fields |
| :--- | :--- | :--- |
| `DECISION` | Technical choice with alternatives evaluated | Options Considered, Trade-offs, Supersedes |
| `COMMITMENT` | Client promise with deadline | Promised To, Deadline, Delivery Evidence |
| `CLAIM` | Factual assertion requiring verification | Verification Receipt |
| `STATUS` | Current state fact (blockers, environment) | Blocking |

### Status Lifecycle

| Status | Meaning |
| :--- | :--- |
| `ACTIVE` | Current and relevant (decisions, status facts) |
| `VERIFIED` | Proven with receipt (claims) |
| `FULFILLED` | Delivered with proof (commitments) |
| `PROMISED` | Deadline in the future, not yet delivered (commitments) |
| `OVERDUE` | Past deadline, no delivery evidence (commitments) |
| `STALE` | No update within staleness window (claims >30d, blockers >14d) |
| `SUPERSEDED` | Replaced by a newer entry |
| `QUARANTINED` | Failed verification, awaiting remediation |
| `REDACTED` | Removed — ungrounded and unredeemable |

### Empirical vs. Speculative Demarcation

- **`[EMPIRICAL]`**: Grounded in reproducible measurement (`[RAW]`) or primary literature (`[FETCH]`). Stated as factual observation.
- **`[SPECULATIVE]`**: Grounded in deduction, extrapolation, or forward projections (`[INFER]`). Must explicitly state hypotheses and premises.

---

## Skill Orchestration

Each command declares which sibling skills run before, after, or alongside it. See `references/skill-orchestration.md` for full integration details.

| Command | Pre-Hook (runs-before) | Post-Hook (runs-after) | Optional Companion |
| :--- | :--- | :--- | :--- |
| `/evidence onboard` | — | `audit` → verify imported entries | `updateagents` → sync AGENTS.md |
| `/evidence status` | — | — | `coach` → standup scoring · `periodic-retreat` → quarterly review |
| `/evidence decide` | — | `secretary` → hash-approval for high-stakes | `updatedocs` → sync architecture docs |
| `/evidence commit` | — | — | `updatedocs` → sync project docs |
| `/evidence audit` | `context-anchor` → park workstream | `dead-letter` → quarantine failures | `updatedocs` → remediate · `coupling-router` → multi-module |
| `/evidence brief` | `context-anchor` → park workstream | `handoff` → dispatch packet | — |

**Execution semantics**: Pre/post hooks fire when their stated condition applies. Optional companions are offered but not required. The agent decides at runtime. See `references/skill-orchestration.md` for conditions.

---

## Procedure

### Command 1 — `/evidence onboard` (Initialize a Project Ledger)

**Trigger**: First use on a project, "set up evidence tracking", "initialize evidence"

**Post-hook**: `audit` (always) · `updateagents` (optional)

#### Steps

1. **Check for existing ledger**: If `.agents/context/evidence-ledger.md` exists, report the existing entry count and offer to regenerate the dashboard only. Do not duplicate entries.
2. **Scan existing context files**: Extract factual entries from:
   - `.agents/context/decisions.md` → `DECISION` entries
   - `.agents/context/current.md` → `STATUS` entries
   - `.agents/context/product.md` → `CLAIM` entries (key product assertions)
   - `.agents/context/architecture.md` → `DECISION` entries (tech choices)
   - `README.md`, `CHANGELOG.md` → milestone `CLAIM` entries
3. **Create `evidence-ledger.md`**: Write to `.agents/context/evidence-ledger.md` with:
   - Dashboard header (regenerated from entries)
   - Each imported entry assigned a sequential `EVD-ID` and tagged with `[IMPORTED]` provenance
4. **Run `audit`** on imported entries to catch stale, contradictory, or dead-linked imports. Findings become `STATUS` entries with `QUARANTINED` status.
5. **Optionally run `updateagents`** to register the ledger in the project's `AGENTS.md`.
6. **Report**: "Initialized evidence ledger with {N} entries imported from existing context. {M} entries quarantined by audit."

---

### Command 2 — `/evidence status` (Project Health Snapshot)

**Trigger**: "What's the state of this project?", "evidence status", "project health"

**Optional**: `coach` (standup) · `periodic-retreat` (quarterly)

#### Steps

1. **Read** `.agents/context/evidence-ledger.md`.
2. **Regenerate Dashboard** from current entries:
   - Count by category: DECISION, COMMITMENT, CLAIM, STATUS
   - Count by status: ACTIVE, VERIFIED, FULFILLED, PROMISED, OVERDUE, STALE, SUPERSEDED, QUARANTINED
   - **Health score**: `(VERIFIED + FULFILLED + ACTIVE decisions) / (total − SUPERSEDED − REDACTED) × 100`
   - **Staleness check**: Flag COMMITMENT past deadline without delivery evidence → `OVERDUE`. Flag CLAIM >30 days unverified → `STALE`. Flag STATUS blocker >14 days → `STALE`. (See `references/staleness-rules.md`.)
3. **Show recent activity** (last 5 entries).
4. **List attention items**: All overdue commitments, stale claims, active blockers.
5. **Write** regenerated dashboard back to `evidence-ledger.md`.

---

### Command 3 — `/evidence decide` (Record a Technical Decision)

**Trigger**: "We decided to use X", "record decision", "why did we choose X?"

**Post-hook**: `secretary` (high-stakes) · **Optional**: `updatedocs`

#### Steps

1. **Extract or ask for**:
   - **What was decided?** (one-sentence statement)
   - **What options were considered?** (minimum 2 alternatives)
   - **What evidence supports the winner?** (must have ≥1 `[RAW]`/`[FETCH]`/`[SEARCH]` source)
   - **What trade-offs are acknowledged?**
2. **Assign** next sequential `EVD-ID`.
3. **Classify** confidence tier and epistemological class.
4. **Append** entry to the evidence log in `evidence-ledger.md`.
5. **Assess impact scope**: If the decision involves infrastructure, billing, auth, data migration, external vendor commitment, or production deployment → invoke `secretary` for Socratic stress-test and SHA-256 hash-approval before finalizing status to `ACTIVE`. If routine → status is `ACTIVE` immediately.
6. **Supersession**: If this replaces a prior decision, mark the old entry `[SUPERSEDED by EVD-{new}]`.
7. **Regenerate dashboard**.
8. **Optionally invoke `updatedocs`** if the decision changes documented architecture.

---

### Command 4 — `/evidence commit` (Record a Client Commitment)

**Trigger**: "We promised the client...", "record commitment", "track deliverable"

**Optional**: `updatedocs`

#### Steps

1. **Extract or ask for**:
   - **What was promised?** (one-sentence statement)
   - **Who was it promised to?** (client name / stakeholder)
   - **When is it due?** (deadline as ISO date)
   - **What's the proof of the promise?** (email, Slack screenshot, proposal, contract — must be `[RAW]` or `[FETCH]`)
   - **Delivery evidence** (if already fulfilled — PR link, deployment URL, client sign-off)
2. **Assign** `EVD-ID`, **append** entry to evidence log.
3. **Set status**:
   - `PROMISED` — deadline in the future, no delivery evidence yet
   - `FULFILLED` — delivery evidence exists
   - `OVERDUE` — past deadline, no delivery evidence
4. **Regenerate dashboard**.
5. **Optionally invoke `updatedocs`** to reflect the commitment in project docs.

---

### Command 5 — `/evidence audit` (Claim Verification Gate)

**Trigger**: "Verify claims in this document", "audit evidence", "citation check"

**Pre-hook**: `context-anchor` (if active workstream) · **Post-hook**: `dead-letter` (if failures) · **Optional**: `updatedocs`, `coupling-router`

This is the original v1.x claim verification procedure, enhanced to integrate with the persistent ledger.

#### Steps

1. **Park active workstream**: If an active workstream is detected, invoke `context-anchor` to drop a named anchor before the deep audit.
2. **Claim Extraction & Statistical Scanning**: Scan the target artifact (markdown, doc, proposal) and extract every discrete factual statement, numeric metric, or statistical claim into an enumerated inventory.
3. **Provenance Tagging & Academic Receipt Verification**: Assign exactly one taxonomy tag (`[RAW]`, `[FETCH]`, `[SEARCH]`, `[INFER]`) to each claim:
   - If `[RAW]`: Record execution command, timestamp, and stdout snippet.
   - If `[FETCH]`: Verify canonical DOI link or specification URL, access date, and quoted excerpt (see `references/academic-citation-protocol.md`).
   - If `[SEARCH]`: Record query string and at least 2 independent corroborating domains.
   - If `[INFER]`: Explicitly document the deduction logic: *"Premise A + Premise B ⟹ Conclusion"*.
4. **Empirical vs. Speculative Classification**: Classify each claim as `[EMPIRICAL]` or `[SPECULATIVE]`. Flag any speculative statement masquerading as an empirical fact.
5. **Missing Receipt Audit & Flagger**: Scan all statistical claims — if a statement lacks a reproducible `[RAW]` log or verified `[FETCH]` DOI/URL, flag it in `MISSING_RECEIPTS_REPORT.md`.
6. **Ledger Compilation**: Generate `claim-ledger.md` (standalone, for portability) AND append each verified/quarantined claim as a `CLAIM` entry in `evidence-ledger.md`.
7. **Artifact Remediation**: Update the target document — replace ungrounded statements with verified receipts or remove them entirely.
8. **Failure triage**: If any entries were `QUARANTINED` or `REDACTED`, invoke `dead-letter` to categorize failures and generate retry packets or escalation messages.
9. **Regenerate dashboard**.

---

### Command 6 — `/evidence brief` (Context-Switch Briefing)

**Trigger**: "Brief me on this project", "what do I need to know?", "context switch to Client X"

**Pre-hook**: `context-anchor` (if active workstream) · **Post-hook**: `handoff` (optional, if subagent dispatch)

#### Steps

1. **Park active workstream**: If an active workstream is detected, invoke `context-anchor` to park it.
2. **Read** `.agents/context/evidence-ledger.md`.
3. **Generate structured briefing** (NOT appended to the ledger):
   - **Project identity**: From `product.md` / `architecture.md`
   - **Active decisions**: Most recent 5 `DECISION` entries still `ACTIVE`
   - **Open commitments**: All `PROMISED` / `OVERDUE` entries with deadlines
   - **Verified facts**: Key `CLAIM` entries that are `VERIFIED` — the ground truth
   - **Active blockers**: `STATUS` entries marked `ACTIVE` with `Blocking` flags
   - **Stale items**: Anything flagged by staleness rules
   - **Health score**: From dashboard
4. **Output** as a concise briefing artifact. See `examples/sample-evidence-brief.md` for format.
5. **Offer handoff**: "Want me to generate a handoff packet for a subagent to continue this work?" If yes, invoke `handoff` with the briefing folded into the dispatch context.

---

## File Layout

The evidence-ledger generates and maintains these files:

| File | Location | Purpose |
| :--- | :--- | :--- |
| `evidence-ledger.md` | `.agents/context/` | Persistent per-project evidence log + dashboard |
| `claim-ledger.md` | Project root or target dir | Standalone audit report (from `/evidence audit`) |
| `MISSING_RECEIPTS_REPORT.md` | Project root or target dir | Quarantined statistical claims (from `/evidence audit`) |

---

## Entry Format

See `references/evidence-entry-schema.md` for the full canonical schema. Every entry follows:

```markdown
### EVD-{NNN} | {YYYY-MM-DD} | {CATEGORY}
**Statement**: {one-sentence factual assertion}
**Category**: `{CATEGORY}`
**Confidence**: `{TIER}` — {brief provenance note}
**Epistemology**: `{CLASS}`
{...category-specific fields...}
**Evidence**: {URL / file path / command receipt}
**Status**: `{STATUS}`
```

Entries are separated by horizontal rules (`---`). Superseded entries retain their content but append `[SUPERSEDED by EVD-{NNN}]` to the Status line. Entries are never deleted.

---

## Pitfalls

- **Unbacked Statistical Fluff**: Writing *"increases efficiency by 50%"* without raw benchmark logs or DOI citations.
- **Pseudo-Citations**: Name-dropping authors or papers (e.g. *"As Smith et al. showed..."*) without providing the exact DOI or paper link.
- **Disguising Inferences as Raw Facts**: Stating architectural hypotheses as proven truths without empirical validation.
- **Vague Citations**: Citing *"industry standards"* or *"standard benchmarks"* without canonical URLs.
- **Orphaned Commitments**: Recording a promise but never updating with delivery evidence — letting it silently go `OVERDUE`.
- **Dashboard-Only Checks**: Reading the dashboard without running staleness detection — stale entries won't auto-flag unless the dashboard is regenerated.
- **Skipping the Pre-hook**: Context-switching into a project brief without parking the current workstream — losing in-progress context.
- **Blind Entry Import**: Accepting all imported entries during onboard without running the audit post-hook — inheriting stale or contradictory facts from outdated context files.

---

## Verification

Before certifying a project's evidence state:
1. [ ] `evidence-ledger.md` exists in `.agents/context/` and accounts for all known project facts.
2. [ ] All `DECISION` entries list ≥2 options considered with evidence for the winner.
3. [ ] All `COMMITMENT` entries have a deadline and proof of promise. `FULFILLED` entries have delivery evidence.
4. [ ] All `CLAIM` entries with `VERIFIED` status contain reproducible receipts (`[RAW]` command logs or `[FETCH]` DOI/URLs).
5. [ ] Zero `OVERDUE` commitments remain unaddressed.
6. [ ] Staleness rules have been applied — no silently stale entries.
7. [ ] Dashboard health score reflects current state.
8. [ ] `MISSING_RECEIPTS_REPORT.md` (if generated by audit) is empty or fully resolved.
9. [ ] Academic and research citations include valid DOI or canonical specification URLs.
10. [ ] Empirical findings are strictly separated from speculative extrapolations.
