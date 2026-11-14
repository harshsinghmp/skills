# Cross-File Invariant Review

Loaded by `diff` and `audit` modes (Step 3). Triggers must be evaluated across the
**entire changeset and call graph**, not in file-level isolation:

1. **Header vs Implementation Consistency**: Verify that any type, signature, macro, or struct field introduced or modified in a header/interface file is consistently updated and used across all implementation files.
2. **Caller vs Callee Contract**: Ensure every caller honors the error-return conventions of the callee (e.g. checking error returns, handling null/allocation failure).
3. **Module Boundaries & Struct Leakage**: When a module exports a type, confirm internal/private struct fields are not exposed or accessed directly by external callers. Use opaque pointers or accessors.
4. **Symbol Renames & Versioned ABI Breaks**: If a symbol is renamed or signature modified, audit all dependent modules across the entire repository to prevent silent compilation failures or ABI breakage.
5. **Lock Lifecycle Across Call Stacks**: Verify that no spinlock, critical mutex, or atomic critical section is held while calling into external functions that may block, schedule, perform I/O, or acquire secondary locks.

---

# Two-Axis Output (standards + spec)

When the review has an originating spec, issue, or brief (from `audit` mode's
conventions discovery or explicit user input), report both axes side by side:

```
AXIS A — STANDARDS (does the code follow this repo's documented conventions?)
  [verdict + findings with trigger IDs]

AXIS B — SPEC (does the code implement what the originating issue asked?)
  [verdict + requirement-by-requirement check: implemented / partial / missing / extra]
```

A change can pass Axis A (clean code, well-structured) and fail Axis B (built the
wrong thing) — the axes are independent verdicts, never averaged into one.

---

# Consolidated Multi-Reviewer Reporting

When reviews run across parallel dimensions or reviewers, the output is ONE
consolidated report:

1. **Deduplicate** — the same defect found by two passes appears once, with both
   attributions.
2. **Severity-calibrate** — resolve disagreements by the higher calibrated severity
   after the REASON→ACT protocol, not by averaging.
3. **Accessibility** — severity is never encoded in color alone: every badge ships
   text + symbol + color.

---

# Standards fallback — Fowler 12-smell baseline (source: `mattpocock/skills` code-review, via lane D #6)

`audit` mode judges against the repo's own documented standards first. When the
repo documents no standards, fall back to this baseline — never to generic
taste. Repo standards override on conflict; the two-axis output above stays
authoritative (this baseline feeds Axis A only, never Axis B).

| Smell | What | Fix |
| :--- | :--- | :--- |
| Mysterious Name | Name hides intent | Rename to the why |
| Duplicated Code | Same logic in N places | Extract once, call N times |
| Long Function | Function exceeds one idea | Extract function per idea |
| Long Parameter List | Param list carries a struct | Introduce parameter object |
| Global Data | Mutable shared state | Encapsulate, narrow access |
| Mutable Data | Aliased mutation surprises | Limit setters, copy on share |
| Feature Envy | Method uses another object most | Move method to the envied class |
| Data Clumps | Same fields travel together | Group into one object |
| Primitive Obsession | Primitives stand in for domain | Introduce domain type |
| Large Class | Class holds unrelated duties | Split by responsibility |
| Data Class | Class holds data, no behavior | Move behavior to the data |
| Refused Bequest | Subclass ignores inherited API | Replace inheritance with delegation |

Binding is judgement-call-only: baseline smells default to Discussion/Nitpick
and escalate only with a forcing-violation proof (SKILL.md Step 4) — a smell you
cannot demonstrate is never a Reject.

---

# Change-coupling axis (audit lens; `couple` loads the full protocol)

The call-graph checks above answer "does this change break a caller?". This axis
answers a different question — **will these two pieces have to change together?** —
and it is the one that predicts maintenance cost. Evaluate it over directories and
features, not file-by-file.

| Class | Sub-patterns | Fix direction |
| :--- | :--- | :--- |
| **Hidden link** (must change together, not visible) | copied logic/values, cross-module global reads, layer-split feature, implicit call order | colocate, or make the dependency explicit in a type/parameter/entry point |
| **Needless link** (tied for different reasons to change) | callers on internals, volatile→stable import, caller-vocabulary parameter, shallow module | encapsulate; depend on the side that changes less |
| **Surplus** (no reason of its own to change) | pass-through wrappers, speculative generality, dead code | delete |
| **Special case** (one situation, not a rule) | one-value `if`, caller-specific param, swallowed exception, retry/sleep, disabled test | treat as evidence of a missing requirement, not a fix target |

Evidence sources, in order of strength:

1. **Import graph** (scripted) — shows the static edges. The edges that *aren't* there
   are the hidden links.
2. **Duplicate-content scan** — copied rules and constants no import connects.
3. **Co-change history** — `git log --name-only --pretty=format: -n 500`, then
   pair-frequency per file. Files that co-change above the noise floor with no import
   edge are hidden links; files that always co-change but belong to unrelated domains
   are needless links. Use history as evidence, never as a verdict.
4. **Convention grep** — "call `init` first" docs, retries, and sleeps compensating for
   ordering.

`audit` mode uses this as an additional lens. The full protocol — inventory tables,
decision log, severity calibration, execution boundary, termination — is
[coupling-audit.md](coupling-audit.md), loaded by `couple` mode only.
