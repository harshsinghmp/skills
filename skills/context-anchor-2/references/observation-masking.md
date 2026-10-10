# 🛡️ Observation Masking & Tool-Output Hashing Guide

> **Core Insight**: Research across autonomous coding agent benchmarks indicates that raw compiler logs, terminal outputs, and test reports exceeding 15–20 lines actively degrade model reasoning ("The Context Drowning Law"). Replacing verbose raw outputs with structured observation receipts and SHA-256 artifacts maintains 100% of the reasoning signal while slashing token overhead by 80–95%.

---

## 1. The Context Drowning Law

When an agent executes `bun test`, `npm run build`, or `cargo check`:
- **The Failure Mode**: A 400-line test log is dumped directly into the conversation. The LLM's attention heads spread across hundreds of passing test names, stack frame line numbers, and ASCII spinners. Foundational architectural constraints placed earlier in the context are effectively wiped from the model's active attention window.
- **Observation Masking**: Instead of storing the full log in the prompt, the agent:
  1. Offloads the full stdout/stderr to an on-disk artifact: `.agents/artifacts/.logs/<cmd>-<hash>.log`.
  2. Masks the observation in the conversation with a **2-line structured receipt**:
     - Status: `PASSED` or `FAILED (Exit <code>)`.
     - Error anchor: Exact file, line number, and error type (if failed).
     - Storage pointer: Relative path to the full artifact for inspection if needed.

---

## 2. Structured Receipt Schema

```text
[OBSERVATION MASKED]: <line_count> lines offloaded to .agents/artifacts/.logs/<command_slug>-<short_hash>.log
STATUS: <PASSED | FAILED (Exit <code>)> — <1-sentence core signal>
```

### Passing Example:
```text
[OBSERVATION MASKED]: 342 lines offloaded to .agents/artifacts/.logs/bun-test-a8f2c19e.log
STATUS: PASSED (Exit 0) — 175 tests passed, 0 failures, duration 4.02s
```

### Failing Example:
```text
[OBSERVATION MASKED]: 580 lines offloaded to .agents/artifacts/.logs/bun-test-d3b7e41a.log
STATUS: FAILED (Exit 1) — 1 failure in tests/skills.test.ts:145 (AssertionError: expected true but got false)
```

---

## 3. The 3 Invariants of Observation Masking

1. **Threshold Trigger ($\ge 15$ lines or $\ge 500$ characters)**: Any tool output exceeding this threshold MUST be offloaded to disk and masked in the conversational prompt.
2. **Lossless Storage**: The complete raw output must remain available in `.agents/artifacts/.logs/` with deterministic hashing so the agent can read specific lines via targeted tools (`view_file` or `grep`) if debugging requires deep inspection.
3. **Deterministic Error Distillation**: A failure receipt must isolate the exact failing file and error message in $\le 2$ lines, preventing the model from re-reading the entire trace.
