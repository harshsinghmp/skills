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
