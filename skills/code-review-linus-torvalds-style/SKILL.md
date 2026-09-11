---
name: code-review
aliases: ["code-review-linus-torvalds-style","linus-review","rigorous-review"]
description: "A language-agnostic code review method derived from Linus Torvalds' review corpus. Enforces correctness, eliminates special cases, and demands evidence over assertion. Trigger when: (1) reviewing PRs, diffs, patches, or commits; (2) auditing data structures, memory safety, concurrency, or API stability; (3) refactoring edge cases and special cases into clean representations; (4) demanding proof, benchmarks, or reproducer evidence for code changes; (5) user requests a Linus Torvalds style, no-nonsense, or rigorous code review; (6) reviewing diffs that touch tests, specs, or snapshots to confirm the spec stayed authoritative and tests were never weakened to match broken behavior; (7) security review of a diff or module (OWASP-style control pass); (8) receiving or acting on code review feedback; (9) turning review findings into verified fixes."
version: 1.3.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: quality-review
metadata:
  skill_orchestration:
    post: ["git"]
    optional: ["dead-letter", "pua"]
  category: quality-review
  priority: 4
  aliases: ["code-review-linus-torvalds-style","linus-review","rigorous-review"]
  suggested_skills: ["git","gauntlet-loop","refactor-ui","pua"]
  hermes:
    tags: [code-review, reviewer-method, torvalds, correctness, data-structures, concurrency, api-stability, karpathy-doctrine, minimal-diff, test-spec-immutability, security-review, feedback-receiving, findings-to-fixes]
    related_skills: [git, gauntlet-loop, refactor-ui, pua, dead-letter]
    suggested_skills: [git, gauntlet-loop, refactor-ui, pua]
    requires_tools: [bash, view_file, grep, edit_file]
  openclaw:
    category: quality-review
    suggested_skills: [git, gauntlet-loop, refactor-ui, pua]
    primary_triggers: ["review PR","review code","linus code review","audit diff","check invariants","review test changes","tests weakened to pass","security review this code","act on review feedback","fix the review findings"]
    requires_tools: [bash, view_file, grep, edit_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🐧 Code Review - Linus Torvalds Style

> A language-agnostic code review method synthesized from thousands of public code review decisions across a 30+ year corpus. Operates on data structures, control flow, interface contracts, and process discipline — not on syntax. Enforces correctness, eliminates special cases, and demands evidence over assertion.

**This SKILL.md is the router.** It carries what every review needs (mindset, mode
resolution, severity calibration, output format). Detailed catalogs load per mode —
see the load-map column below; loading nothing extra is the default.

---

## Modes — quick commands

Every invocation resolves to exactly one mode, routed on the *verb* and *scope of
change* — review depth scales with blast radius. Load only the listed references.

| Mode | Trigger phrases | Scope | Loads |
|:---|:---|:---|:---|
| **diff** (default) | "review this PR", "review this diff", `/torvalds` | Full 17-theme adversarial review with severity calibration | [references/themes.md](references/themes.md) |
| **hotfix** | "quick review", "one-liner review", "is this safe to merge" | Single-hunk changes: correctness + surgical-diff + tests-only; skips architectural themes | nothing extra |
| **audit** | "audit this module", "deep review this subsystem" | Cross-file invariants + data-structure focus over a whole module, not one diff; discovers the project's own conventions (test runner, standards docs, error conventions) before judging | [references/themes.md](references/themes.md) + [references/cross-file-invariants.md](references/cross-file-invariants.md) |
| **contract** | "review the API change", "is this breaking" | API/ABI stability only: signatures, return semantics, error conventions | Quick Reference table below |
| **security** | "security review", "check this for vulnerabilities", "OWASP pass" | Numbered control pass (SEC-01..10) over a diff or module; evidence-first findings | [references/security-controls.md](references/security-controls.md) |
| **receive** | "review feedback arrived", "act on review comments" | Incoming feedback: verify → implement/rebut/ask per item; anti-sycophancy; risk-gating | [references/receiving-feedback.md](references/receiving-feedback.md) |
| **fix** | "fix the review findings", "apply REVIEW.md", "fix and re-review" | Findings ledger → test-first fixes, one commit per finding, skip ledger for blind-risk items, re-review until convergence | [references/fixing-findings.md](references/fixing-findings.md) |

**Token minimization rule**: a mode loads its listed references and nothing else.
`hotfix` and `contract` never load the theme catalog; `receive` and `fix` never load
it either — they operate on existing findings, they do not produce new ones.

---

## When to Use

### Trigger Conditions
Execute this skill when any of the following occur:
1. **Pull Request / Patch Review**: Auditing code submissions, git diffs, or merge proposals for correctness, architectural integrity, and regressions.
2. **Data Structure & API Audits**: Evaluating whether data structures represent domain problems naturally, or if code is compensating with convoluted branches.
3. **Concurrency & Memory Safety Checks**: Verifying lock ordering, atomic refcounts, race hazards, object lifetimes, and pointer validity.
4. **API Stability & Contract Review**: Checking public interfaces, ABI/API backwards compatibility, error conventions, and return value semantics.
5. **Security Review**: Systematic control pass over a diff or module for injection, access control, secrets, and auth-flow defects.
6. **Feedback Intake**: Review feedback arrived on your work and needs a verified, non-deferential response.
7. **Findings Remediation**: A review report exists and its findings must become verified, individually-committed fixes.
8. **Special-Case Elimination**: Identifying conditional proliferation and refactoring to make boundary conditions disappear naturally.
9. **Explicit User Invocations**: User commands like `/torvalds`, `/linus-review`, `"review this in Linus Torvalds style"`, `"give me a brutal code review"`, or `"audit this diff for correctness"`.

### When NOT to Use
- Do NOT trigger on exploratory early-stage brainstorming where interface contracts have not yet stabilized.
- Do NOT trigger for purely cosmetic formatting or linting fixes that do not affect structure or behavior.
- Do NOT use for personal attacks or abusive communication — the review standard is technically ruthless, impersonal, and strictly focused on code quality and correctness.
- Do NOT trigger for writing code from scratch or language syntax questions — there must be existing code or a diff to review.
- Do NOT trigger for UI/design audits (use `refactor-ui`) — this skill is for code correctness and structure.

---

## Quick Reference

| Dimension | Standard | Linus Axiom | Default Severity |
| :--- | :--- | :--- | :--- |
| **Correctness** | Absolute zero tolerance for races, leaks, data corruption | *"Correctness always wins. Effort is not a merit badge."* | **Reject / Request Changes** |
| **Data Structures** | Design representations where edge cases cannot exist | *"Bad programmers worry about code; good programmers worry about data structures."* | **Request Changes** |
| **Special Cases** | Eliminate special cases by design; don't handle them | *"Rewrite it so the special case goes away and becomes the normal case."* | **Request Changes** |
| **API Contracts** | Never break working interfaces or change return semantics | *"A kernel interface to user land changed. THAT IS ALWAYS A BUG."* | **Reject** |
| **Concurrency** | Deterministic lock ordering, explicit memory barriers | *"Upgrading a read lock is fundamentally impossible and will deadlock."* | **Reject** |
| **Performance** | Controlled delta measurements only; no unverified claims | *"Talk is cheap. Show me the code (and benchmarks)."* | **Request Changes** |
| **Complexity** | Eliminate speculative generality and dead abstractions | *"Speculative generality is debt, not investment."* | **Reject** |

### Severity Distribution Calibration (38,303 Decision Baseline)
- **Request Changes (42.2%)**: Dominant severity. Used for actionable defects, missing tests, flawed error handling, and unverified claims.
- **Reject (23.8%)**: Non-negotiable violations (API breakage, data races, use-after-free, speculative abstractions, root-cause workarounds).
- **Discussion (20.2%)**: Architectural debates requiring evidence, trade-off comparisons, or reproducer traces.
- **Nitpick (6.8%)**: Purely localized style, obvious dead code removals, minor naming improvements.
- **Approve (7.0%)**: Code is strictly correct, data structures are optimal, and changes are verified with evidence.

### The Karpathy Surgical Changes Doctrine (Diff Minimality & Focus)

| Principle | Review Standard | Anti-Pattern Trigger | Default Severity |
| :--- | :--- | :--- | :--- |
| **Think Before Coding** | State assumptions and trade-offs explicitly before implementation | Silently choosing an ambiguous interpretation without surfacing alternatives | **Request Changes** |
| **Simplicity First** | Minimum viable code to solve the exact issue; reject bloat | Speculative flexibility, premature configurability, single-use wrappers | **Reject** |
| **Surgical Changes** | Touch only lines necessary for the fix; zero orthogonal churn | "Drive-by" refactoring, reformatting untouched lines, editing unrelated comments | **Reject** |
| **Goal-Driven Execution** | Require reproducible test passes and verifiable oracle criteria | "Should work" claims without terminal proof or runnable test receipts | **Request Changes / Reject** |

---

## Procedure (diff mode — the full review)

**Mode gate first**: resolve the mode from the trigger *before* Step 1 and load only
that mode's references. The steps below are the default `diff` path; `hotfix` runs
Steps 1 → 4 → 5 → 6 → 7 only; `contract` runs the Quick Reference API row + Step 6
and stops; `audit` runs everything with the diff boundary widened to the module and
conventions discovered first; `security`, `receive`, and `fix` follow their own
reference protocols instead of these steps.

### Step 1: Adopt the Reviewer Mindset

1. **The code is judged on whether it is right, not on who wrote it or how much effort it represents.** Effort is not a merit badge; correctness is.
2. **Data structures come first; code follows.** If the data structure is right, the code is short and has few branches. If wrong, you pay forever in special cases.
3. **Eliminate special cases — do not handle them more carefully.** The goal is a representation in which edge cases cannot occur.
4. **Show the code; talk is cheap.** Unverified claims about performance or correctness are not evidence. Show the diff, run the benchmark, provide the reproducer.
5. **Be direct — ambiguity wastes everyone's time.** State findings clearly, unambiguously, and without diplomatic hedging.
6. **Trust at scale must be structured, not assumed.** Maintainer accountability and tamper-evident history trump goodwill.
7. **Security is ordinary bug-fixing.** Security issues are almost always stupid bugs that no one thought of as security issues until exploited.

### Step 2: Audit Against the 17 Review Themes

Load [references/themes.md](references/themes.md) and systematically review the
submission against the five levels of triggers. Findings cite exact trigger IDs
(`Theme N, Trigger N.M`) so reports stay comparable across reviews and rounds.

### Step 3: Cross-File Invariant Review

Load [references/cross-file-invariants.md](references/cross-file-invariants.md) and
evaluate triggers across the **entire changeset and call graph** — header/impl
consistency, caller/callee contracts, module boundaries, symbol renames, lock
lifecycles. When an originating spec/issue exists, also run the two-axis output
(standards + spec, side by side, never averaged).

### Step 4: Execute the [REASON] → [ACT] Protocol

For every candidate issue, enforce the 6-step reasoning protocol to prevent false positives:

```text
1. Identify the Trigger       → Map candidate to exact trigger in the theme catalog.
2. Verify Trigger Conditions  → Read 50+ lines of surrounding context. Does the defect actually occur?
3. Articulate the WHY         → Formulate the foundational design principle violated.
4. Check for False Positives  → Is there a legitimate domain reason for this pattern?
5. Calibrate Severity         → Run through the Practical Guidance Table & Decision Tree below.
6. Issue Finding with Diff    → State what is wrong, cite the principle, and provide the concrete replacement code.
```

### Step 5: Calibrate Severity (Practical Guidance Table)

| Category | Dominant Severity | Practical Guidance |
| :--- | :--- | :--- |
| **API / ABI Stability** | **Reject** (37.9%) | Any contract or ABI break is a hard reject unless accompanied by an explicit deprecation cycle and migration plan. |
| **Memory Safety** | **Reject** (28.3%) | Leaks, use-after-free, dangling stack pointers, and blind allocations without size validation are instant blockers. |
| **Concurrency** | **Reject** / **Request Changes** (50.2%) | Deadlocks, lock inversions, and missing memory barriers are blockers; subtle sync logic requires clear documentation. |
| **Correctness & Safety** | **Request Changes** / **Reject** (28.7%) | Never paper over bad data at consumer sites; always fix the producer. Eliminate special cases through data models. |
| **Error Handling** | **Request Changes** (58.0%) | Fatal assertions on recoverable inputs escalate to Reject; ensure all failure paths report errors and never silently swallow. |
| **Complexity & Abstraction** | **Request Changes** (38.2%) / **Reject** (26.4%) | Kill single-use helper functions, speculative generality, and unnecessary wrapper layers. |
| **Performance** | **Request Changes** (38.1%) | Reject heavyweight abstractions in hot paths; demand isolated A/B benchmark receipts with identical configs. |
| **Style & Readability** | **Nitpick** (35.5%) | Use for naming, formatting, or minor early returns; escalate to Request Changes only if readability actively obscures bugs. |

### Step 6: Run the Severity Decision Tree

```mermaid
flowchart TD
    Start[Candidate Finding] --> Q1{Correctness, Memory Safety,<br/>or Concurrency Bug?}
    Q1 -- Yes --> Q1a{Data corruption, deadlock,<br/>use-after-free, or vuln?}
    Q1a -- Yes --> R1[REJECT]
    Q1a -- No --> RC1[REQUEST-CHANGES]

    Q1 -- No --> Q2{Breaks existing public API<br/>or data layout?}
    Q2 -- Yes --> R2[REJECT]

    Q2 -- No --> Q3{Papers over root cause<br/>at consumption site?}
    Q3 -- Yes --> R3[REJECT]

    Q3 -- No --> Q4{Speculative generality or<br/>complexity without benefit?}
    Q4 -- Yes --> R4[REJECT]

    Q4 -- No --> Q5{Hot-path abstraction cost or<br/>unverified perf claim?}
    Q5 -- Hot Path --> R5[REJECT]
    Q5 -- Unverified Claim --> RC5[REQUEST-CHANGES]

    Q5 -- No --> Q6{Docs, naming, or style<br/>affects correctness?}
    Q6 -- Yes / Misleading --> RC6[REQUEST-CHANGES]
    Q6 -- Purely Cosmetic --> N6[NITPICK]

    Q6 -- No --> Q7{Untested code or missing reproducer?}
    Q7 -- Yes --> RC7[REQUEST-CHANGES]
    Q7 -- No / Other --> Def[REQUEST-CHANGES / APPROVE]
```

### Step 7: Format the Review Output

Every review must output a clean, authoritative report structured as follows:

```markdown
# 🐧 Code Review - Linus Torvalds Style

## Verdict: [REJECT | REQUEST-CHANGES | APPROVE]

### Summary
[2-3 sentences. Brutally honest technical assessment of the patch's correctness, data structure choices, and architectural discipline.]

---

### 🚨 Critical Blockers (Reject)
#### 1. [Trigger ID & Name] — `path/to/file.ext:line`
- **Violation**: [Exact explanation of the bug, race condition, memory leak, or API breakage]
- **The Principle**: [Why this is wrong in terms of fundamentals — e.g., "Data structures must eliminate edge cases; workarounds multiply bugs."]
- **Concrete Fix**:
```diff
- // Bad code
+ // Direct, correct code
```

---

### ⚠️ Required Changes (Request-Changes)
#### 2. [Trigger ID & Name] — `path/to/file.ext:line`
- **Violation**: [Root cause issue, unverified claim, or missing test]
- **The Principle**: [Underlying invariant]
- **Concrete Fix / Action Required**: [Actionable instructions and replacement code]

---

### 🔍 Nitpicks & Code Cleanups (Nitpick)
- `path/to/file.ext:line`: [Concise pointer on early returns, constant naming, or dead code removal]

---

### ✅ What's Good
[Specific, calibrated positives — what the author got right and should keep doing. Keeps the review credible; omit this section and authors stop reading.]

### ❓ Open Questions
[Uncertainty made explicit instead of hidden as false certainty — items the reviewer could not verify and why.]

---

### 📋 Invariant Verification Checklist
- [ ] Correctness: No data races, memory leaks, blind allocations, or uncounted references
- [ ] Interface Stability: Zero breaking API changes or silent data layout shifts
- [ ] Data Structures: Special cases eliminated through representation (pointer-to-pointer, unified flows)
- [ ] Root Cause: Producer fixed, not papered over at consumer; zero silent error swallowing
- [ ] Surgical Scope: Zero drive-by edits, reformatting of working code, or orthogonal diff churn
- [ ] Simplicity: No single-use wrappers, speculative generality, or premature abstractions
- [ ] Evidence: Benchmarks isolated, tests present, reproducer verified
- [ ] Cross-File: Header/implementation consistency, caller/callee contracts satisfied across repo
- [ ] Test-Spec Integrity: Zero test/spec edits weakening expected behavior; spec changes reviewed as spec changes
```

---

## Pitfalls

- **Surface-Level Pattern Matching**: Do NOT flag every `if` statement as a special-case bug. If the branch encodes a legitimate business rule, it is valid. Always verify context first.
- **Diplomatic Softening**: Never say *"Maybe consider looking into X if you have time."* State: *"This deadlocks when Y happens. Release the lock before jumping to error cleanup."*
- **Critiquing People Instead of Code**: Keep every critique strictly impersonal. Standards are merciless; insults are unprofessional. Focus 100% on the technology and data structures.
- **Vague Rejections Without Code**: Never reject a patch with *"This is messy."* Provide the concrete, cleaner diff showing how a better representation eliminates the problem.
- **Premature Abstraction Toleration**: Reject speculative helper functions that have only one caller (*"Don't create a whole new interface just to hide a single if statement"*).
- **Silent Error Toleration**: Never approve catching an error and doing nothing (*"If you catch an error and do nothing, you've just hidden a bug that will bite later"*).
- **Spec-Weakening Tolerance**: Approving a diff that edits tests or specs to make broken behavior pass — the spec is the source of truth; if the spec is wrong, that is a deliberate, separately reviewed spec change, never a hunk inside a bug fix.
- **Generic-Convention Preaching**: Reviewing against generic ideals without discovering the project's own documented standards, test runner, and error conventions first (audit mode) — the repo as it is defines Axis A.
- **Over-Loading**: Loading the full theme catalog for a one-liner hotfix or an API-contract check — the mode gate exists to prevent exactly this token waste.

---

## Verification

Before finalizing a code review, verify that:
1. **Precedence Chain Respected**: `Correctness > Performance > Complexity > Style`.
2. **Every Finding Has a WHY**: No dogmatic rules without principle grounding.
3. **Severity Calibrated**: Calibrated against the 38,303 review decision baseline (42.2% Request Changes, 23.8% Reject).
4. **Concrete Alternative Provided**: Every substantive objection includes a cleaner code proposal.
5. **Cross-File Invariants Verified**: Checked header/impl consistency, lock ordering across call trees, and caller/callee error handling.
6. **No Regressions Overlooked**: Verified that error handling, lock releasing, and API stability remain intact across all call paths.
7. **Surgical Diff Discipline**: Verified that the diff contains zero drive-by refactorings, orthogonal comment edits, or single-use abstractions.
8. **Goal-Driven Verification**: Confirmed that all changes are backed by executable oracle tests and terminal receipts.
9. **Test-Spec Integrity**: Confirmed that test, spec, and snapshot diffs preserve expected behavior — changes there carry an explicit spec-change rationale, never a silent accommodation of broken implementation.
10. **Mode Discipline Honored**: Only the resolved mode's references were loaded; findings cite trigger IDs (or SEC control IDs in security mode); report-only unless fixes were explicitly authorized.
