# Code Review - Linus Torvalds Style (`code-review`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /torvalds](https://img.shields.io/badge/Triggers-%2Ftorvalds%20%7C%20%2Flinus--review-purple.svg?style=for-the-badge)](#)

A language-agnostic code review method derived from Linus Torvalds' review corpus spanning 30+ years and 38,000+ public decisions. Enforces correctness, eliminates special cases, preserves interface contracts, and demands evidence over assertion.

---

## 🧭 What is this?

Most code reviews suffer from two failure modes:
1. **Shallow nitpicking**: bikeshedding formatting, indentation, and aesthetic preferences while missing critical concurrency races, memory leaks, and breaking API changes.
2. **Symptom-patching acceptance**: approving complex conditional workarounds that paper over broken data models instead of demanding clean representations.

`code-review` codifies a rigorous, language-agnostic review standard. It treats code as an engineering artifact evaluated against data structures, control flow invariants, interface stability, and empirical verification.

---

## ⚡ Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill code-review
```

*(Direct URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/code-review` is also supported).*

---

## 🚀 Usage & Triggers

Trigger this skill using slash commands or natural language:

```bash
# Slash commands
/torvalds
/linus-review

# Natural language
"review this PR in Linus Torvalds style"
"audit this diff for correctness and data structure hygiene"
"give me a brutal, no-nonsense code review on this patch"
"check this refactor for edge case proliferation"
```

---

## 🏛️ The Seven Reviewer Mindsets

1. **Correctness over Effort**: The code is judged strictly on whether it is right, not on who wrote it or how hard they worked on it. Effort is not a merit badge.
2. **Data Structures First**: *"Bad programmers worry about the code. Good programmers worry about data structures and their relationships."* Good data models make operations trivial with minimal branching.
3. **Eliminate Special Cases by Design**: Don't handle edge cases more carefully — rewrite the data representation so the special case vanishes into the general case.
4. **Evidence Over Assertion**: *"Talk is cheap. Show me the code."* Demands controlled benchmarks, reproducers, and test receipts. Unverified claims are rejected.
5. **Direct & Unambiguous**: Be technically ruthless and completely direct. Ambiguity and diplomatic hedging waste developer time.
6. **Structured Trust**: Maintainer accountability and tamper-evident history trump implicit goodwill.
7. **Security is Ordinary Bug-Fixing**: Security issues are overwhelmingly ordinary bugs that an attacker found first. No path is "too special" for security checks.

---

## 📊 The 15 Review Themes

```text
Level 1: Global Invariants (Non-Negotiables — Default: REJECT)
├── Theme 1: Interface Stability & Compatibility (Zero breaking changes, layout preservation)
├── Theme 2: Memory Safety & Object Lifetime (Atomic refcounts, no dangling stack pointers)
├── Theme 3: Concurrency Correctness (Deterministic lock ordering, explicit memory fences)
└── Theme 4: Security Check Placement (Access-grant time checks, zero uninitialized leaks)

Level 2: Structural Patterns (Architecture-Level — Default: REQUEST CHANGES / REJECT)
├── Theme 5: Special Case Elimination (Pointer-to-pointer idioms, unified representations)
├── Theme 6: Root Cause Over Symptom Treatment (Fix producers, eliminate masking workarounds)
├── Theme 7: Interface Honesty & Misuse Resistance (No fabricated data, unambiguous returns)
├── Theme 8: Abstraction Boundaries (Opaque handles, no core namespace pollution)
└── Theme 9: Trust Delegation & Review Structure (Single-concern commits, verify tool reports)

Level 3: Tactical Guidelines (Implementation-Level — Default: REQUEST CHANGES / NITPICK)
├── Theme 10: Simplicity & Complexity Discipline (Kill speculative generality & thin wrappers)
├── Theme 11: Naming, Readability & Style (Descriptive identifiers, early returns)
├── Theme 12: Documentation Precision (Mandatory commit "why", accurate comments)
├── Theme 13: Testing & Verification (Concrete reproducers, non-happy-path tests)
├── Theme 14: Performance Discipline (No dynamic dispatch in hot loops, A/B benchmarks)
└── Theme 15: Error Handling & Recovery (Graceful degradation, one-time warnings)

Level 4: Surgical Scope & Diff Minimality (Karpathy Doctrine — Default: REJECT / REQUEST CHANGES)
└── Theme 16: Surgical Diff Discipline (Zero drive-by edits, no speculative abstractions, oracle receipts)
```

---

## ⚖️ Precedence Chain

When architectural priorities compete, apply this non-negotiable precedence:

$$\mathbf{Correctness} > \mathbf{Performance} > \mathbf{Complexity} > \mathbf{Style}$$

1. **Correctness** always wins. An incorrect program running at $10\times$ speed is $10\times$ as useless.
2. **Performance** overrides complexity and style only on verified hot paths with benchmark receipts.
3. **Complexity** overrides style. Flat, simple, readable code always trumps clever or cosmetic abstractions.
4. **Style** is lowest priority. Reserved for nitpicks unless naming/formatting actively obscures bugs.

---

## 📈 Severity Calibration (Corpus Baseline)

Calibrated against 38,303 public code review decisions:

| Severity | Corpus Share | When to Apply |
| :--- | :--- | :--- |
| **Request Changes** | **42.2%** | *Dominant default.* Flawed logic, missing reproducers, edge-case workarounds, unverified claims. |
| **Reject** | **23.8%** | Breaking API contracts, data races, deadlocks, use-after-free, speculative abstractions. |
| **Discussion** | **20.2%** | Architectural trade-offs requiring benchmark evidence or reproducer profiles. |
| **Nitpick** | **6.8%** | Purely cosmetic adjustments, early return refactoring, naming improvements. |
| **Approve** | **7.0%** | Code is provably correct, data structures are optimal, verified by test receipts. |

### Category-by-Category Review Guidance

| Category | Dominant Severity | Practical Guidance |
| :--- | :--- | :--- |
| **API / ABI Stability** | **Reject** (37.9%) | Any contract or ABI break is a hard reject unless accompanied by an explicit deprecation cycle and migration plan. |
| **Memory Safety** | **Reject** (28.3%) | Leaks, use-after-free, dangling stack pointers, and blind allocations without size validation are instant blockers. |
| **Concurrency** | **Reject** / **Request Changes** (50.2%) | Deadlocks, lock inversions, and missing memory barriers are blockers; no sleeping with locks held. |
| **Correctness & Safety** | **Request Changes** / **Reject** (28.7%) | Never paper over bad data at consumer sites; always fix the producer. Eliminate special cases through data models. |
| **Error Handling** | **Request Changes** (58.0%) | Fatal assertions on recoverable inputs escalate to Reject; zero silent error swallowing allowed. |
| **Complexity & Abstraction** | **Request Changes** (38.2%) / **Reject** (26.4%) | Kill single-use helper functions, speculative generality, and unnecessary wrapper layers. |
| **Performance** | **Request Changes** (38.1%) | Reject heavyweight abstractions in hot paths; demand isolated A/B benchmark receipts with identical configs. |
| **Style & Readability** | **Nitpick** (35.5%) | Use for naming, formatting, or minor early returns; escalate to Request Changes only if readability actively obscures bugs. |

---

## 🌐 Cross-File Invariant Auditing

Reviews must evaluate whole repository call-graphs and invariants:
1. **Header vs Implementation Consistency**: Types, signatures, and struct fields must match across interface headers and implementation files.
2. **Caller vs Callee Contract**: Every caller must check return status and handle error codes (`-EINVAL`, allocation failures, null pointers).
3. **Module Boundaries & Encapsulation**: Prevent private struct layouts from leaking directly into external caller code.
4. **Symbol Renames & Versioning**: Changing exported symbols requires updating all downstream usages to prevent broken call paths.
5. **Lock Lifecycle Across Call Stacks**: Never hold non-reentrant locks across recursive calls or functions that block, schedule, or perform I/O.

---

## 📄 Example

See [examples/sample-review.md](examples/sample-review.md) for a complete, realistic code review report generated using this skill.
