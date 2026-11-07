# 🔄 Deadlock Breaker & Toxic Retry Rollback Guide

> **Core Insight**: When an autonomous agent fails a test or build three consecutive times, each subsequent attempt has an exponentially higher likelihood of hallucinating. The model becomes trapped in a **Toxic Retry Loop**, anchored to its own prior failed assumptions rather than the project specification. Breaking the deadlock requires an immediate context reset and workspace rollback.

---

## 1. The Anatomy of a Toxic Retry Loop

```
Turn 1: Test fails on auth error. Agent adds temporary workaround in service.ts.
Turn 2: Build fails on type error. Agent adds @ts-ignore and modifies types.ts.
Turn 3: Test fails on runtime null pointer. Agent rewrites auth logic completely.
Turn 4: MODEL AMNESIA / DEADLOCK. The context is now 10,000 tokens of self-generated
        broken code and conflicting error messages. The agent cannot recover.
```

In academic and industry evaluations (e.g., SWE-bench, HumanEval), agent performance plummets after 3 consecutive failures on the same task. The model begins:
- Doubling down on invalid architecture.
- Weakening tests to pass broken code.
- Hallucinating third-party dependencies or non-existent flags.

---

## 2. The 3-Strike Deadlock Protocol

`context-anchor` enforces the **3-Strike Invariant**:

1. **Streak Tracking**: Every command execution outcome is recorded in `.agents/artifacts/.anchor_streak.json`.
2. **Threshold Halt**: If `consecutiveFailures >= 3`:
   - Execution is immediately halted with `DEADLOCK_DETECTED`.
   - The agent is forbidden from continuing along the failed trajectory.
3. **Automated Workspace Rollback (`--rollback`)**:
   - Reverts uncommitted workspace edits back to the last clean anchor commit or checkpoint (`git checkout -- .` and clean).
   - Prunes the intermediate debugging noise from conversational working memory.
   - Re-loads the clean baseline `.agents/anchor.md`.
4. **Strategic Pivoting**:
   - The agent must consult `.agents/context/decisions.md` or re-read the original spec before initiating a completely new hypothesis.

---

## 3. Receipt & Warning Standard

When a deadlock is detected, the engine emits:

```text
🚨 DEADLOCK DETECTED: 3 consecutive failures on 'bun test'.
CONTEXT RESET TRIGGERED: Discarded toxic retry history; reverted workspace to last verified anchor state.
ACTION REQUIRED: Re-read specification in .agents/context/product.md and choose an alternative architectural approach.
```
