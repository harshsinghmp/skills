# The 17-Theme Trigger Catalog

Loaded by: `diff` and `audit` modes. `hotfix` and `contract` deliberately skip this
file — a one-liner does not need the full catalog, and an API-stability check needs
only the Quick Reference table in SKILL.md.

Findings are mapped to exact trigger IDs (`Theme N, Trigger N.M`) so reports are
comparable across reviews and rounds.

---

## Level 1: Global Invariants (Non-Negotiables — Default: Reject)

### Theme 1: Interface Stability and Compatibility
- **Trigger 1.1 (Breaking Contract)**: Modifies, removes, or alters behavior of existing public interfaces, output formats, or documented contracts. (*Severity: Reject*)
- **Trigger 1.2 (Data Layout Shift)**: Alters field offsets, alignment, padding, or struct serialization visible across boundaries. (*Severity: Reject*)
- **Trigger 1.3 (Duplicate Entrypoint)**: Adds redundant new public interface when extending an existing interface with a flag/parameter works. (*Severity: Nitpick*)
- **Trigger 1.4 (Ambiguous Returns)**: Introduces ambiguous return codes, returns 0 on write failure, or rejects common valid inputs. (*Severity: Request Changes*)

### Theme 2: Memory Safety and Object Lifetime
- **Trigger 2.1 (Uncounted Shared Object)**: Shared mutable object crosses execution contexts without reference counting governing lifetime. (*Severity: Request Changes*)
- **Trigger 2.2 (Compound Deallocation Check)**: Deallocation relies on compound condition (`ref == 0 || list_empty`) rather than atomic refcount decrement. (*Severity: Request Changes*)
- **Trigger 2.3 (Escaped Stack Pointer)**: References stack-allocated memory after function returns (in callbacks/async tasks). (*Severity: Reject*)
- **Trigger 2.4 (Memory Provenance Loss)**: Code allocates memory, forgets provenance, and guesses deallocation method at teardown. (*Severity: Reject*)
- **Trigger 2.5 (Use-After-Free / Double-Free)**: Resource freed while still reachable, or code path can free the same resource twice. (*Severity: Request Changes*)
- **Trigger 2.6 (Blind Allocation Without Size Validation)**: `malloc(size)` where `size` is derived from user input or unchecked arithmetic subject to integer overflow. (*Severity: Reject*)

### Theme 3: Concurrency Correctness
- **Trigger 3.1 (Missing Memory Barrier)**: Shared flag read/written across threads without explicit atomic ordering or locks. (*Severity: Request Changes*)
- **Trigger 3.2 (Inconsistent Lock Ordering)**: Acquires multiple locks of the same type without deterministic global ordering (e.g. address sort). (*Severity: Request Changes*)
- **Trigger 3.3 (In-Place Read Lock Upgrade)**: Attempts to atomically convert shared lock to exclusive write lock without unlock. (*Severity: Reject*)
- **Trigger 3.4 (Unlock-Before-Cleanup Violation)**: Error goto jumps to resource-freeing label while lock is still held. (*Severity: Request Changes*)
- **Trigger 3.5 (Locking Unrelated State)**: Lock acquired around code that does not touch the protected invariant. (*Severity: Reject*)
- **Trigger 3.6 (Recursive Lock / Lock Held Across Blocking Calls)**: Non-reentrant lock acquired twice in call stack, or lock held while calling into code that blocks or schedules. (*Severity: Reject*)

### Theme 4: Security Check Placement and Architecture
- **Trigger 4.1 (Wrong-Time Security Check)**: Permission checked at consumption time (I/O) rather than access-grant time (open). (*Severity: Reject*)
- **Trigger 4.2 (Uninitialized Security State)**: Untrusted callers allowed in before entropy, clocks, or security mechanisms initialize. (*Severity: Reject*)
- **Trigger 4.3 (Special-Path Exemption)**: Security check bypassed because a path is "internal", "rare", or "special". (*Severity: Request Changes*)
- **Trigger 4.4 (Information Disclosure Leak)**: Exposes uninitialized buffer padding, stack bytes, or over-allocated buffers. (*Severity: Request Changes*)
- **Trigger 4.5 (Format String & Buffer Size Mismatch)**: Calls writing to buffers without destination size guarantees or with attacker-influenced format strings. (*Severity: Reject*)
- **Trigger 4.6 (Insecure String Copy in Hardening Code)**: Using functions that truncate silently (`strlcpy`) in code claiming to harden security. (*Severity: Reject*)

---

## Level 2: Structural Patterns (Architecture-Level)

### Theme 5: Special Case Elimination Through Data Representation
- **Trigger 5.1 (Boundary Conditional)**: Conditional branch exists solely for first/last element because data representation is suboptimal (e.g., pointer-to-pointer eliminates list-head special cases). (*Severity: Request Changes*)
- **Trigger 5.2 (Mode/Startup Workaround Branch)**: `if (is_special)` branching instead of unifying the model so distinctions vanish. (*Severity: Request Changes*)
- **Trigger 5.3 (Magic Constants / Invisible Assumptions)**: Numeric literals without named constants or trusting unvalidated external firmware/env data. (*Severity: Reject*)

### Theme 6: Root Cause Over Symptom Treatment
- **Trigger 6.1 (Symptom Papering)**: Adding flags or checks at consumption sites instead of fixing the producer that emits bad data. (*Severity: Reject*)
- **Trigger 6.2 (Bug-Masking Error Path)**: Suppressing errors with fallback defaults that hide corrupted state. (*Severity: Request Changes*)
- **Trigger 6.3 (Disproportionate Fatal Panic)**: Using `panic!`, `BUG_ON()`, or `abort()` for recoverable runtime conditions. (*Severity: Reject*)
- **Trigger 6.4 (Silent Error Swallowing)**: Catching an error and silently ignoring it without logging or returning status, allowing bad state to propagate. (*Severity: Reject*)

### Theme 7: Interface Honesty and Misuse Resistance
- **Trigger 7.1 (Fabricated Data)**: Functions returning dummy/default data rather than honest errors. (*Severity: Reject*)
- **Trigger 7.2 (Misuse-Prone API)**: Interface requires callers to memorize non-obvious sequencing or manual pointer cleanups. (*Severity: Reject*)
- **Trigger 7.3 (Redundant Return Conventions)**: Returning input value on success instead of clear status/error code. (*Severity: Request Changes*)

### Theme 8: Abstraction Boundaries and Encapsulation
- **Trigger 8.1 (Leaky Internal Structs)**: Exposing internal structs directly across module boundaries instead of opaque handles. (*Severity: Request Changes*)
- **Trigger 8.2 (Duplicated Core Logic)**: Reimplementing complex logic instead of using established helpers. (*Severity: Request Changes*)
- **Trigger 8.3 (Core Namespace Pollution)**: Adding niche/single-caller helper functions to global/shared core headers. (*Severity: Reject*)

### Theme 9: Trust Delegation and Review Structure
- **Trigger 9.1 (Uncurated Monolithic Changes)**: Massive changes bypassing subsystem owners. (*Severity: Request Changes*)
- **Trigger 9.2 (Mixed-Concern Commits)**: Bundling bug fixes with refactors or cosmetic cleanups. (*Severity: Request Changes*)
- **Trigger 9.3 (Blind Tool-Report Application)**: Applying linter/static-analysis fixes without human verification of logic. (*Severity: Request Changes*)
- **Trigger 9.4 (Out-of-Tree Dictation)**: Modifying core architecture solely to appease unsupported external/peripheral plugins. (*Severity: Reject*)
- **Trigger 9.5 (Link-Only Commit Description)**: Relying solely on external URLs in `Link:` lines without self-contained rationale in commit body. (*Severity: Request Changes*)

---

## Level 3: Tactical Guidelines (Implementation-Level)

### Theme 10: Simplicity and Complexity Discipline
- **Trigger 10.1 (Unnecessary Indirection)**: Complex layered solution where direct, straightforward code does the job with fewer moving parts. (*Severity: Nitpick / Request Changes*)
- **Trigger 10.2 (Speculative Generality)**: Configurable parameters, generic abstractions, or buffer sizes for hypothetical future needs. (*Severity: Reject*)
- **Trigger 10.3 (Pointless Wrapper Functions)**: Thin wrappers that do not add safety, ergonomics, or encapsulation. (*Severity: Reject*)
- **Trigger 10.4 (Dead Code & Redundant Work)**: Unreachable fallback branches, unused variables, or duplicate flush operations. (*Severity: Request Changes*)

### Theme 11: Naming, Readability, and Style
- **Trigger 11.1 (Generic or Colliding Identifiers)**: Vague names (`param`, `data`, `tmp`) or names shadowing existing symbols. (*Severity: Request Changes*)
- **Trigger 11.2 (Obtuse Clever Arithmetic)**: Clever bit-shifts or arithmetic where plain constants (`4096`) are clearer. (*Severity: Nitpick*)
- **Trigger 11.3 (Redundant Casts / Non-Standard Constructs)**: Pointless type coercions signaling fight with type system. (*Severity: Request Changes*)
- **Trigger 11.4 (Symmetric Else with Return)**: `if (...) return; else { ... }` instead of clean early return. (*Severity: Nitpick*)

### Theme 12: Documentation and Communication Precision
- **Trigger 12.1 (Missing Commit "Why")**: Commit message describes only what lines changed, omitting the rationale. (*Severity: Request Changes*)
- **Trigger 12.2 (Contradictory / Stale Comments)**: Comments describing behavior the code does not exhibit. (*Severity: Request Changes*)
- **Trigger 12.3 (Undocumented Synchronization Rules)**: Subtle lock invariants or memory fences without explanatory comments. (*Severity: Request Changes*)
- **Trigger 12.4 (Misleading Error Messages)**: Error message naming the wrong subsystem or operation. (*Severity: Request Changes*)

### Theme 13: Testing and Verification
- **Trigger 13.1 (Unverified Code Submission)**: Patches submitted without build receipts, test runs, or verification logs. (*Severity: Request Changes*)
- **Trigger 13.2 (Happy-Path-Only Tests)**: Benchmarks or tests omitting unfavorable edge cases, high-concurrency loads, or non-default configs. (*Severity: Request Changes*)
- **Trigger 13.3 (Fix Without Reproducer)**: Bug-fix PR without reproduction steps, crash traces, or workload profiles. (*Severity: Request Changes*)
- **Trigger 13.4 (Quality-Bar Regression)**: The diff weakens the project's quality bar to reach green — new suppression directives, skipped or deleted tests, weakened assertions, thresholds edited down. A build that passes because the bar was lowered is a regression, not a pass. (*Severity: Reject*)

### Theme 14: Performance Discipline
- **Trigger 14.1 (Heavyweight Abstraction in Hot Loop)**: Dynamic dispatch, virtual calls, or extra allocations inside hot loops. (*Severity: Reject*)
- **Trigger 14.2 (Uncontrolled Performance Claims)**: Claiming optimization without isolated A/B delta benchmarks on identical configs. (*Severity: Request Changes*)
- **Trigger 14.3 (Pathological Algorithmic Scaling)**: Using $O(n^2)$ search or unbounded allocations where $O(n)$ exists. (*Severity: Request Changes*)

### Theme 15: Error Handling and Recovery
- **Trigger 15.1 (Hard Crash on Unrecognized Input)**: Crashing instead of gracefully falling back to known-good general handler. (*Severity: Nitpick*)
- **Trigger 15.2 (Unusable Error Returns)**: Returning errors the caller has no programmatic way to recover from or handle. (*Severity: Reject*)
- **Trigger 15.3 (Silent Swallowing of Serious Bug)**: Silently ignoring "should never happen" bugs instead of logging a loud one-time warning. (*Severity: Request Changes*)

---

## Level 4: Surgical Scope & Diff Minimality (Karpathy Doctrine)

### Theme 16: Surgical Diff Discipline & Simplicity
- **Trigger 16.1 (Drive-By Edits & Diff Bloat)**: PR modifies lines, comments, formatting, or imports outside the stated issue scope. (*Severity: Reject*)
- **Trigger 16.2 (Speculative Abstraction)**: Introduces single-caller helpers, generic factory wrappers, or premature interfaces for hypothetical future use. (*Severity: Reject*)
- **Trigger 16.3 (Silent Assumption Trap)**: Author guessed an ambiguous requirement without documenting alternatives or surfacing trade-offs. (*Severity: Request Changes*)
- **Trigger 16.4 (Evidence-Free Claim)**: Patch claims performance gain or bug fix without providing concrete test execution output or reproducer trace. (*Severity: Request Changes*)
- **Trigger 16.5 (Half-Applied Refactor Debris)**: Old and new implementations coexist (orphaned helpers written then abandoned, debug scaffolding left behind, the same logic reimplemented across files or sessions). Each file is internally consistent; the changeset is not. (*Severity: Request Changes*)

---

## Level 5: Verification Integrity (Spec–Test Relationship)

### Theme 17: Test-Spec Immutability
- **Trigger 17.1 (Test Weakened to Match Broken Behavior)**: A diff relaxes, deletes, or skips test assertions so failing behavior passes instead of fixing the implementation. (*Severity: Reject*)
- **Trigger 17.2 (Spec Edit Hidden in a Fix)**: A bug-fix commit modifies spec files (test specs, E2E specs, golden files) alongside implementation changes without an explicit, separately-reviewable spec-change rationale. (*Severity: Reject*)
- **Trigger 17.3 (Unexplained Test Modification)**: Test files change in the diff without the author stating whether behavior legitimately changed; if the test itself is wrong, that claim requires evidence and is reviewed as its own change — never silently. (*Severity: Request Changes*)
- **Trigger 17.4 (Snapshot Regenerated Blind)**: Snapshots or golden outputs regenerated without a line-by-line diff review of what changed. (*Severity: Request Changes*)

**The principle**: The test defines correct behavior. Fix the implementation to match the spec — never the spec to match the implementation. If the spec is genuinely wrong, changing it is a deliberate spec decision reviewed as its own change, not a convenience smuggled into a bug fix.
