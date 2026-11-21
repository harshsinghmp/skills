## 🚨 NON-NEGOTIABLE GOVERNANCE RULES

### 1. `.memory/` IS COMPLETELY OFF LIMITS

`.memory/` is owned and automatically maintained by `musememory`.

`updatedocs` MUST NOT:

* read `.memory/` for documentation discovery
* modify `.memory/`
* create files in `.memory/`
* delete files in `.memory/`
* rename or move `.memory/` content
* regenerate `.memory/`
* reorganize `.memory/`
* synchronize `.memory/`
* record findings in `.memory/`
* recommend specific `.memory/` edits as part of documentation synchronization

Treat:

```text
.memory/
```

as:

```text
AUTOMATIC SYSTEM STATE
OWNER = musememory
UPDATEDOCS = NO TOUCH
```

Do not confuse memory management with documentation synchronization.

If documentation analysis reveals a durable fact that would normally belong in project memory, report it only when useful. Do not write it to `.memory/`.

---

### 2. `.agents/` IS PROTECTED DOX ARCHITECTURE

`.agents/` is part of the project's **DOX architecture**.

It is not ordinary documentation storage.

`updatedocs` must treat `.agents/` as protected architecture and operational infrastructure.

#### Before considering any `.agents/` change:

1. Find the applicable `AGENTS.md`.
2. Read the relevant `AGENTS.md` governance.
3. Follow any applicable instruction hierarchy/scope rules.
4. Determine whether the repository change actually affects `.agents/`.
5. Determine what specific `.agents/` component would be affected.
6. Stop before modification.

#### Hard permission gate

`updatedocs` MUST NOT modify anything under `.agents/` without explicit user permission.

This includes:

* creating files
* editing files
* deleting files
* moving files
* renaming files
* reorganizing agent definitions
* changing DOX configuration
* changing agent routing
* changing agent prompts
* changing agent metadata
* modifying agent standards
* modifying agent state
* modifying `.agents/context/*`
* regenerating `.agents/` artifacts

A change being "obviously necessary" does not constitute authorization.

`AGENTS.md` describing a change does not constitute authorization.

A prior task allowing a change does not constitute authorization for a later task.

A PR or release context does not constitute authorization.

#### Required behavior

```text
Potential `.agents/` impact
        ↓
Read AGENTS.md
        ↓
Analyze actual impact
        ↓
If no impact → report no change required
        ↓
If impact exists → DO NOT MODIFY
        ↓
Report exact proposed change
        ↓
Require explicit user permission
```

The final report must distinguish:

```text
ANALYZED
RECOMMENDED
AUTHORIZED
MODIFIED
```

Never collapse these states.

---

### 3. READ GOVERNANCE BEFORE ACTING

Before synchronization, establish repository governance.

At minimum identify:

```text
AGENTS.md
CLAUDE.md
CODEX.md
GEMINI.md
Cursor rules
Copilot instructions
repository-specific governance files
```

Use `AGENTS.md` and other applicable instruction files to understand:

* project boundaries
* documentation ownership
* protected paths
* tooling
* required verification
* agent behavior
* DOX architecture
* permission requirements

Never modify a governed document before understanding its governing rules.

---

## Mission

`updatedocs` maintains documentation as a **verified project knowledge layer**.

The skill protects against:

* documentation drift
* stale commands
* stale configuration
* obsolete APIs
* deleted features still documented
* renamed files still referenced
* incorrect architecture diagrams
* stale examples
* conflicting documentation
* duplicate sources of truth
* generated documentation drift
* missing migration instructions
* client-facing documentation becoming outdated
* agents relying on stale instructions
* excessive documentation churn
* documentation becoming larger than its value

---

## When to Use

### Primary Triggers

Use `updatedocs` when the user asks to:

* update docs
* sync documentation
* refresh project documentation
* update README
* update changelog
* update API docs
* update architecture docs
* reconcile documentation with code
* audit documentation
* find documentation drift
* determine whether a change requires documentation
* prepare documentation for PR
* prepare documentation for release
* review documentation after a feature
* review documentation after a sprint
* perform a full documentation audit

Also consider invoking after:

* feature completion
* public API changes
* CLI changes
* database/schema changes
* configuration changes
* dependency changes with user/developer impact
* architecture changes
* deployment changes
* authentication/security changes
* workflow changes
* breaking changes
* deprecations
* removals
* major UI behavior changes
* PR preparation
* release preparation
* sprint completion

### Negative Triggers

Do not perform broad documentation synchronization for:

* whitespace-only changes
* formatting-only changes
* lint-only changes
* test-only changes with no documented behavior impact
* internal refactors with no observable contract changes
* cosmetic code changes with no documented behavior impact
* unrelated marketing copy
* legal drafting
* unrelated personal notes
* license changes unless explicitly requested

A technically small change may still require broad documentation updates if it changes a public contract.

---

## Core Principles

### 1. Repository Reality Is the Oracle

Documentation must describe actual project behavior.

Use evidence from:

* implementation
* manifests
* schemas
* configuration
* tests
* generated output
* CLI definitions
* CI configuration
* deployment configuration
* Git history where appropriate

Do not infer functionality solely from filenames or intentions.

---

### 2. Never Fabricate Facts

Do not invent:

* versions
* dates
* commands
* API parameters
* configuration values
* architectural rationale
* compatibility claims
* migration guarantees
* performance figures
* supported environments
* security claims
* business rules

When evidence is insufficient:

```text
UNVERIFIED
```

and report what evidence is missing.

---

### 3. Minimal Documentation Churn

Do not rewrite correct documentation merely because it exists.

Prefer:

* surgical edits
* preserving existing structure
* preserving project voice
* focused additions
* focused removals
* canonical links
* small coherent diffs

Do not perform stylistic rewrites during a synchronization task unless explicitly requested.

---

### 4. Documentation Must Be Proportional

Documentation effort should reflect actual impact:

```text
Internal refactor
→ possibly no docs

CLI flag change
→ CLI docs + affected examples

Public API change
→ API docs + examples + changelog + migration review

Architecture change
→ architecture docs + diagrams + ADR review

Environment variable rename
→ configuration + setup + deployment docs

Client-facing feature change
→ product/client docs review
```

A large code diff does not automatically imply a large documentation diff.

---

### 5. One Canonical Source Per Fact

Determine the source of truth for each fact:

```text
Package scripts
    → package manifest

CLI contract
    → CLI implementation / command definition

API contract
    → schema / route definitions / OpenAPI

Configuration
    → config loader / schema / implementation

Database structure
    → schema / migrations / ORM definitions

Architecture
    → actual module boundaries + accepted decisions

Release history
    → CHANGELOG + release metadata
```

Downstream documentation should summarize or reference canonical sources rather than duplicate them unnecessarily.

---

## Documentation Ownership Model

Every affected documentation artifact should be classified internally as one or more of:

```text
SOURCE-OF-TRUTH
GENERATED
DERIVED
HUMAN-CURATED
HISTORICAL
CLIENT-FACING
USER-FACING
DEVELOPER-FACING
OPERATIONAL
AGENT-CONTEXT
PROTECTED
TEMPORARY
PLANNED
```

This classification determines how `updatedocs` may act.

---

## Permission Model

Before editing a document, assign the least-privileged action appropriate to its ownership:

```text
AUTO-UPDATE
    Safe, directly evidence-backed synchronization.

NORMAL UPDATE
    Ordinary project documentation within the skill's scope.

REVIEW REQUIRED
    Important or ambiguous documentation requiring explicit human review.

EXPLICIT PERMISSION REQUIRED
    Protected architecture, high-risk client/business docs, or repository-governed material.

GOVERNED
    Documents owned by another governed workflow (e.g. AGENTS.md → `updateagents`).
    Analyze and report only; never modify directly.

HISTORICAL
    Immutable records of past states (released changelog sections, accepted ADRs).
    Never rewritten; superseded only by new records.

DO NOT TOUCH
    `.memory/`, protected/generated artifacts where direct editing is prohibited,
    historical records where modification is disallowed, LICENSE unless explicitly requested.
```

The ownership classes in the Documentation Ownership Model map onto these permission levels as follows: `SOURCE-OF-TRUTH` and `DERIVED` → AUTO-UPDATE/NORMAL UPDATE; `HUMAN-CURATED` → NORMAL UPDATE with surgical edits only; `GENERATED` → DO NOT TOUCH (Direct); `HISTORICAL` → HISTORICAL; `PROTECTED` and `CLIENT-FACING` → EXPLICIT PERMISSION REQUIRED; `AGENT-CONTEXT` → GOVERNED; `TEMPORARY` and `PLANNED` → evaluate case by case against repository governance.

Never escalate from analysis to modification automatically when a permission boundary exists.

---

## Documentation Freshness Model

Use these internal states when useful:

```text
VERIFIED
    Recently checked against repository evidence.

PARTIALLY VERIFIED
    Some claims were checked, others remain unverified.

STALE
    Evidence shows documentation no longer matches reality.

UNKNOWN
    No sufficient evidence to establish current correctness.

GENERATED
    Derived from another source.

HISTORICAL
    Describes a previous project state and should not be rewritten merely because it is old.

PLANNED
    Describes intended future behavior, not shipped behavior.

DEPRECATED
    Still supported but should not be newly adopted.
```

Do not add metadata to every document solely to represent these states.

Use them internally unless the project's documentation system already exposes freshness metadata.

---

## Source-of-Truth Priority

When sources conflict, prefer concrete evidence in roughly this order:

```text
1. Current implementation / executable configuration
2. Machine-readable schema / manifest / contract
3. Verified tests / verification output
4. Build / deployment / CI definitions
5. Existing maintained documentation
6. Git history / PR context
7. Agent notes / informal commentary
8. Assumption
```

Never use assumptions as evidence.

If implementation and intended documentation differ, report the discrepancy rather than silently deciding which one is morally "correct."

---

### Anti-Triggers
Not for changing code behavior (updateagents), creating a new project skeleton (new-project), or rewriting released changelog sections (HISTORICAL permission class).
