---
name: code-review-linus-torvalds-style
description: "A language-agnostic code review method derived from Linus Torvalds' review corpus. Enforces correctness, eliminates special cases, and demands evidence over assertion. Trigger when: (1) reviewing PRs, diffs, patches, or commits; (2) auditing data structures, memory safety, concurrency, or API stability; (3) refactoring edge cases and special cases into clean representations; (4) demanding proof, benchmarks, or reproducer evidence for code changes; (5) user requests a Linus Torvalds style, no-nonsense, or rigorous code review."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [code-review, reviewer-method, torvalds, correctness, data-structures, concurrency, api-stability]
    related_skills: [pua, dead-letter, agent-handoff, context-anchor]
    requires_tools: [bash, view_file, grep, edit_file]
---

# 🐧 Code Review - Linus Torvalds Style

> A language-agnostic code review method synthesized from thousands of public code review decisions across a 30+ year corpus. Operates on data structures, control flow, interface contracts, and process discipline — not on syntax. Enforces correctness, eliminates special cases, and demands evidence over assertion.

---

## When to Use

### Trigger Conditions
Execute this skill when any of the following occur:
1. **Pull Request / Patch Review**: Auditing code submissions, git diffs, or merge proposals for correctness, architectural integrity, and regressions.
2. **Data Structure & API Audits**: Evaluating whether data structures represent domain problems naturally, or if code is compensating with convoluted branches.
3. **Concurrency & Memory Safety Checks**: Verifying lock ordering, atomic refcounts, race hazards, object lifetimes, and pointer validity.
4. **API Stability & Contract Review**: Checking public interfaces, ABI/API backwards compatibility, error conventions, and return value semantics.
5. **Special-Case Elimination**: Identifying conditional proliferation and refactoring to make boundary conditions disappear naturally.
6. **Explicit User Invocations**: User commands like `/torvalds`, `/linus-review`, `"review this in Linus Torvalds style"`, `"give me a brutal code review"`, or `"audit this diff for correctness"`.

### When NOT to Use
- Do NOT trigger on exploratory early-stage brainstorming where interface contracts have not yet stabilized.
- Do NOT trigger for purely cosmetic formatting or linting fixes that do not affect structure or behavior.
- Do NOT use for personal attacks or abusive communication — the review standard is technically ruthless, impersonal, and strictly focused on code quality and correctness.

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

---

## Procedure

### Step 1: Adopt the Reviewer Mindset

1. **The code is judged on whether it is right, not on who wrote it or how much effort it represents.** Effort is not a merit badge; correctness is.
2. **Data structures come first; code follows.** If the data structure is right, the code is short and has few branches. If wrong, you pay forever in special cases.
3. **Eliminate special cases — do not handle them more carefully.** The goal is a representation in which edge cases cannot occur.
4. **Show the code; talk is cheap.** Unverified claims about performance or correctness are not evidence. Show the diff, run the benchmark, provide the reproducer.
5. **Be direct — ambiguity wastes everyone's time.** State findings clearly, unambiguously, and without diplomatic hedging.
6. **Trust at scale must be structured, not assumed.** Maintainer accountability and tamper-evident history trump goodwill.
7. **Security is ordinary bug-fixing.** Security issues are almost always stupid bugs that no one thought of as security issues until exploited.

---

### Step 2: Audit Against the 15 Review Themes

Systematically review the submission against the three levels of triggers:

#### Level 1: Global Invariants (Non-Negotiables — Default: Reject)

##### Theme 1: Interface Stability and Compatibility
- **Trigger 1.1 (Breaking Contract)**: Modifies, removes, or alters behavior of existing public interfaces, output formats, or documented contracts. (*Severity: Reject*)
- **Trigger 1.2 (Data Layout Shift)**: Alters field offsets, alignment, padding, or struct serialization visible across boundaries. (*Severity: Reject*)
- **Trigger 1.3 (Duplicate Entrypoint)**: Adds redundant new public interface when extending an existing interface with a flag/parameter works. (*Severity: Nitpick*)
- **Trigger 1.4 (Ambiguous Returns)**: Introduces ambiguous return codes, returns 0 on write failure, or rejects common valid inputs. (*Severity: Request Changes*)

##### Theme 2: Memory Safety and Object Lifetime
- **Trigger 2.1 (Uncounted Shared Object)**: Shared mutable object crosses execution contexts without reference counting governing lifetime. (*Severity: Request Changes*)
- **Trigger 2.2 (Compound Deallocation Check)**: Deallocation relies on compound condition (`ref == 0 || list_empty`) rather than atomic refcount decrement. (*Severity: Request Changes*)
- **Trigger 2.3 (Escaped Stack Pointer)**: References stack-allocated memory after function returns (in callbacks/async tasks). (*Severity: Reject*)
- **Trigger 2.4 (Memory Provenance Loss)**: Code allocates memory, forgets provenance, and guesses deallocation method at teardown. (*Severity: Reject*)
- **Trigger 2.5 (Use-After-Free / Double-Free)**: Resource freed while still reachable, or code path can free the same resource twice. (*Severity: Request Changes*)
- **Trigger 2.6 (Blind Allocation Without Size Validation)**: `malloc(size)` where `size` is derived from user input or unchecked arithmetic subject to integer overflow. (*Severity: Reject*)

##### Theme 3: Concurrency Correctness
- **Trigger 3.1 (Missing Memory Barrier)**: Shared flag read/written across threads without explicit atomic ordering or locks. (*Severity: Request Changes*)
- **Trigger 3.2 (Inconsistent Lock Ordering)**: Acquires multiple locks of the same type without deterministic global ordering (e.g. address sort). (*Severity: Request Changes*)
- **Trigger 3.3 (In-Place Read Lock Upgrade)**: Attempts to atomically convert shared lock to exclusive write lock without unlock. (*Severity: Reject*)
- **Trigger 3.4 (Unlock-Before-Cleanup Violation)**: Error goto jumps to resource-freeing label while lock is still held. (*Severity: Request Changes*)
- **Trigger 3.5 (Locking Unrelated State)**: Lock acquired around code that does not touch the protected invariant. (*Severity: Reject*)
- **Trigger 3.6 (Recursive Lock / Lock Held Across Blocking Calls)**: Non-reentrant lock acquired twice in call stack, or lock held while calling into code that blocks or schedules. (*Severity: Reject*)

##### Theme 4: Security Check Placement and Architecture
- **Trigger 4.1 (Wrong-Time Security Check)**: Permission checked at consumption time (I/O) rather than access-grant time (open). (*Severity: Reject*)
- **Trigger 4.2 (Uninitialized Security State)**: Untrusted callers allowed in before entropy, clocks, or security mechanisms initialize. (*Severity: Reject*)
- **Trigger 4.3 (Special-Path Exemption)**: Security check bypassed because a path is "internal", "rare", or "special". (*Severity: Request Changes*)
- **Trigger 4.4 (Information Disclosure Leak)**: Exposes uninitialized buffer padding, stack bytes, or over-allocated buffers. (*Severity: Request Changes*)
- **Trigger 4.5 (Format String & Buffer Size Mismatch)**: Calls writing to buffers without destination size guarantees or with attacker-influenced format strings. (*Severity: Reject*)
- **Trigger 4.6 (Insecure String Copy in Hardening Code)**: Using functions that truncate silently (`strlcpy`) in code claiming to harden security. (*Severity: Reject*)

---

#### Level 2: Structural Patterns (Architecture-Level)

##### Theme 5: Special Case Elimination Through Data Representation
- **Trigger 5.1 (Boundary Conditional)**: Conditional branch exists solely for first/last element because data representation is suboptimal (e.g., pointer-to-pointer eliminates list-head special cases). (*Severity: Request Changes*)
- **Trigger 5.2 (Mode/Startup Workaround Branch)**: `if (is_special)` branching instead of unifying the model so distinctions vanish. (*Severity: Request Changes*)
- **Trigger 5.3 (Magic Constants / Invisible Assumptions)**: Numeric literals without named constants or trusting unvalidated external firmware/env data. (*Severity: Reject*)

##### Theme 6: Root Cause Over Symptom Treatment
- **Trigger 6.1 (Symptom Papering)**: Adding flags or checks at consumption sites instead of fixing the producer that emits bad data. (*Severity: Reject*)
- **Trigger 6.2 (Bug-Masking Error Path)**: Suppressing errors with fallback defaults that hide corrupted state. (*Severity: Request Changes*)
- **Trigger 6.3 (Disproportionate Fatal Panic)**: Using `panic!`, `BUG_ON()`, or `abort()` for recoverable runtime conditions. (*Severity: Reject*)
- **Trigger 6.4 (Silent Error Swallowing)**: Catching an error and silently ignoring it without logging or returning status, allowing bad state to propagate. (*Severity: Reject*)

##### Theme 7: Interface Honesty and Misuse Resistance
- **Trigger 7.1 (Fabricated Data)**: Functions returning dummy/default data rather than honest errors. (*Severity: Reject*)
- **Trigger 7.2 (Misuse-Prone API)**: Interface requires callers to memorize non-obvious sequencing or manual pointer cleanups. (*Severity: Reject*)
- **Trigger 7.3 (Redundant Return Conventions)**: Returning input value on success instead of clear status/error code. (*Severity: Request Changes*)

##### Theme 8: Abstraction Boundaries and Encapsulation
- **Trigger 8.1 (Leaky Internal Structs)**: Exposing internal structs directly across module boundaries instead of opaque handles. (*Severity: Request Changes*)
- **Trigger 8.2 (Duplicated Core Logic)**: Reimplementing complex logic instead of using established helpers. (*Severity: Request Changes*)
- **Trigger 8.3 (Core Namespace Pollution)**: Adding niche/single-caller helper functions to global/shared core headers. (*Severity: Reject*)

##### Theme 9: Trust Delegation and Review Structure
- **Trigger 9.1 (Uncurated Monolithic Changes)**: Massive changes bypassing subsystem owners. (*Severity: Request Changes*)
- **Trigger 9.2 (Mixed-Concern Commits)**: Bundling bug fixes with refactors or cosmetic cleanups. (*Severity: Request Changes*)
- **Trigger 9.3 (Blind Tool-Report Application)**: Applying linter/static-analysis fixes without human verification of logic. (*Severity: Request Changes*)
- **Trigger 9.4 (Out-of-Tree Dictation)**: Modifying core architecture solely to appease unsupported external/peripheral plugins. (*Severity: Reject*)
- **Trigger 9.5 (Link-Only Commit Description)**: Relying solely on external URLs in `Link:` lines without self-contained rationale in commit body. (*Severity: Request Changes*)

---

#### Level 3: Tactical Guidelines (Implementation-Level)

##### Theme 10: Simplicity and Complexity Discipline
- **Trigger 10.1 (Unnecessary Indirection)**: Complex layered solution where direct, straightforward code does the job with fewer moving parts. (*Severity: Nitpick / Request Changes*)
- **Trigger 10.2 (Speculative Generality)**: Configurable parameters, generic abstractions, or buffer sizes for hypothetical future needs. (*Severity: Reject*)
- **Trigger 10.3 (Pointless Wrapper Functions)**: Thin wrappers that do not add safety, ergonomics, or encapsulation. (*Severity: Reject*)
- **Trigger 10.4 (Dead Code & Redundant Work)**: Unreachable fallback branches, unused variables, or duplicate flush operations. (*Severity: Request Changes*)

##### Theme 11: Naming, Readability, and Style
- **Trigger 11.1 (Generic or Colliding Identifiers)**: Vague names (`param`, `data`, `tmp`) or names shadowing existing symbols. (*Severity: Request Changes*)
- **Trigger 11.2 (Obtuse Clever Arithmetic)**: Clever bit-shifts or arithmetic where plain constants (`4096`) are clearer. (*Severity: Nitpick*)
- **Trigger 11.3 (Redundant Casts / Non-Standard Constructs)**: Pointless type coercions signaling fight with type system. (*Severity: Request Changes*)
- **Trigger 11.4 (Symmetric Else with Return)**: `if (...) return; else { ... }` instead of clean early return. (*Severity: Nitpick*)

##### Theme 12: Documentation and Communication Precision
- **Trigger 12.1 (Missing Commit "Why")**: Commit message describes only what lines changed, omitting the rationale. (*Severity: Request Changes*)
- **Trigger 12.2 (Contradictory / Stale Comments)**: Comments describing behavior the code does not exhibit. (*Severity: Request Changes*)
- **Trigger 12.3 (Undocumented Synchronization Rules)**: Subtle lock invariants or memory fences without explanatory comments. (*Severity: Request Changes*)
- **Trigger 12.4 (Misleading Error Messages)**: Error message naming the wrong subsystem or operation. (*Severity: Request Changes*)

##### Theme 13: Testing and Verification
- **Trigger 13.1 (Unverified Code Submission)**: Patches submitted without build receipts, test runs, or verification logs. (*Severity: Request Changes*)
- **Trigger 13.2 (Happy-Path-Only Tests)**: Benchmarks or tests omitting unfavorable edge cases, high-concurrency loads, or non-default configs. (*Severity: Request Changes*)
- **Trigger 13.3 (Fix Without Reproducer)**: Bug-fix PR without reproduction steps, crash traces, or workload profiles. (*Severity: Request Changes*)

##### Theme 14: Performance Discipline
- **Trigger 14.1 (Heavyweight Abstraction in Hot Loop)**: Dynamic dispatch, virtual calls, or extra allocations inside hot loops. (*Severity: Reject*)
- **Trigger 14.2 (Uncontrolled Performance Claims)**: Claiming optimization without isolated A/B delta benchmarks on identical configs. (*Severity: Request Changes*)
- **Trigger 14.3 (Pathological Algorithmic Scaling)**: Using $O(n^2)$ search or unbounded allocations where $O(n)$ exists. (*Severity: Request Changes*)

##### Theme 15: Error Handling and Recovery
- **Trigger 15.1 (Hard Crash on Unrecognized Input)**: Crashing instead of gracefully falling back to known-good general handler. (*Severity: Nitpick*)
- **Trigger 15.2 (Unusable Error Returns)**: Returning errors the caller has no programmatic way to recover from or handle. (*Severity: Reject*)
- **Trigger 15.3 (Silent Swallowing of Serious Bug)**: Silently ignoring "should never happen" bugs instead of logging a loud one-time warning. (*Severity: Request Changes*)

---

### Step 3: Cross-File Invariant Review

Triggers must be evaluated across the **entire changeset and call graph**, not in file-level isolation:

1. **Header vs Implementation Consistency**: Verify that any type, signature, macro, or struct field introduced or modified in a header/interface file is consistently updated and used across all implementation files.
2. **Caller vs Callee Contract**: Ensure every caller honors the error-return conventions of the callee (e.g. checking `-EINVAL`, handling `NULL`, checking for allocation failure).
3. **Module Boundaries & Struct Leakage**: When a module exports a type, confirm internal/private struct fields are not exposed or accessed directly by external callers. Use opaque pointers or accessors.
4. **Symbol Renames & Versioned ABI Breaks**: If a symbol is renamed or signature modified, audit all dependent modules across the entire repository to prevent silent compilation failures or ABI breakage.
5. **Lock Lifecycle Across Call Stacks**: Verify that no spinlock, critical mutex, or atomic critical section is held while calling into external functions that may block, schedule, perform I/O, or acquire secondary locks.

---

### Step 4: Execute the [REASON] → [ACT] Protocol

For every candidate issue, enforce the 6-step reasoning protocol to prevent false positives:

```text
1. Identify the Trigger       → Map candidate to exact trigger in Theme 1–15 catalog.
2. Verify Trigger Conditions  → Read 50+ lines of surrounding context. Does the defect actually occur?
3. Articulate the WHY         → Formulate the foundational design principle violated.
4. Check for False Positives  → Is there a legitimate domain reason for this pattern?
5. Calibrate Severity         → Run through the Category Practical Guidance & Decision Tree below.
6. Issue Finding with Diff    → State what is wrong, cite the principle, and provide the concrete replacement code.
```

---

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

---

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

---

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

### 📋 Invariant Verification Checklist
- [ ] Correctness: No data races, memory leaks, blind allocations, or uncounted references
- [ ] Interface Stability: Zero breaking API changes or silent data layout shifts
- [ ] Data Structures: Special cases eliminated through representation (pointer-to-pointer, unified flows)
- [ ] Root Cause: Producer fixed, not papered over at consumer; zero silent error swallowing
- [ ] Evidence: Benchmarks isolated, tests present, reproducer verified
- [ ] Cross-File: Header/implementation consistency, caller/callee contracts satisfied across repo
```

---

## Pitfalls

- **Surface-Level Pattern Matching**: Do NOT flag every `if` statement as a special-case bug. If the branch encodes a legitimate business rule, it is valid. Always verify context first.
- **Diplomatic Softening**: Never say *"Maybe consider looking into X if you have time."* State: *"This deadlocks when Y happens. Release the lock before jumping to error cleanup."*
- **Critiquing People Instead of Code**: Keep every critique strictly impersonal. Standards are merciless; insults are unprofessional. Focus 100% on the technology and data structures.
- **Vague Rejections Without Code**: Never reject a patch with *"This is messy."* Provide the concrete, cleaner diff showing how a better representation eliminates the problem.
- **Premature Abstraction Toleration**: Reject speculative helper functions that have only one caller (*"Don't create a whole new interface just to hide a single if statement"*).
- **Silent Error Toleration**: Never approve catching an error and doing nothing (*"If you catch an error and do nothing, you've just hidden a bug that will bite later"*).

---

## Verification

Before finalizing a code review, verify that:
1. **Precedence Chain Respected**: `Correctness > Performance > Complexity > Style`.
2. **Every Finding Has a WHY**: No dogmatic rules without principle grounding.
3. **Severity Calibrated**: Calibrated against the 38,303 review decision baseline (42.2% Request Changes, 23.8% Reject).
4. **Concrete Alternative Provided**: Every substantive objection includes a cleaner code proposal.
5. **Cross-File Invariants Verified**: Checked header/impl consistency, lock ordering across call trees, and caller/callee error handling.
6. **No Regressions Overlooked**: Verified that error handling, lock releasing, and API stability remain intact across all call paths.
