# 🧠 Attention Hygiene & Context Sinks — Mitigating Drift & Hallucination

> **Context Degradation Law**: As an AI coding session progresses beyond 10–15 conversational turns, raw compiler logs, terminal outputs, and conversational filler accumulate. When models attempt to summarize this history, they experience the **ContextEcho Effect**—summarizing their own previous assertions rather than the ground-truth state of the codebase.

---

## 1. The ContextEcho Effect & How to Eliminate It

- **The Failure Mode**: In Turn 4, the agent says *"I plan to add the Stripe webhook handler in api/webhook.ts"*. In Turn 8, a compaction occurs. The summarizer notes: *"Agent implemented Stripe webhook"*. In Turn 12, the agent skips writing the code because it believes its own summary, shipping broken software.
- **The Empirical Cure**: Never trust prior conversation memory for execution status.
  - Rely on physical codebase artifacts: `git status --porcelain`, file modification timestamps (`mtime`), and test command outputs.
  - All task transitions must be recorded in an on-disk anchor (`.agents/anchor.md`), not carried in the LLM's conversational working memory.

---

## 2. Lossless Tool-Output Offloading (The Headroom Pattern)

Long tool outputs (compiler errors, bundle analyses, test suites, TruffleHog scans) flood the context window, pushing system rules out of the top attention band.

### The Rule of 50 Lines:
- Any tool or command output exceeding **50 lines** must be redirected or saved to an artifact file:
  ```bash
  bun test > .agents/artifacts/.logs/test_run.log 2>&1
  ```
- The context receives only a **2-line structured receipt**:
  ```text
  [OUTPUT OFFLOADED]: 342 lines written to .agents/artifacts/.logs/test_run.log
  STATUS: FAILED (Exit 1) — 1 failure in tests/skills.test.ts:42 (AssertionError)
  ```
- This frees up thousands of tokens of attention headroom for reasoning and editing.

---

## 3. Ghost Task Verification Standard

A **Ghost Task** occurs when an agent claims a task is complete based on an outdated plan or hallucinated status.

### Automated Verification Invariant:
When resuming an anchor or declaring an action complete:
1. **Target File Exists**: Verify that the file referenced in `Next Action` exists on disk.
2. **Post-Anchor Modification**: The target file's `mtime` must post-date the anchor's creation timestamp.
3. **Diff Verification**: `git diff -- <target_file>` must show non-zero meaningful modifications matching the requirement.
4. If any check fails, the task is flagged as **INCOMPLETE / GHOST TASK**—the agent must write the code before advancing.

---

## 4. Multi-Client Context Isolation (Cross-Client Bleed Guard)

In agency environments where an orchestrator works across multiple client repositories or client directories:
- **Never rely on shared prompt state** across client tasks.
- When switching from Client Alpha to Client Beta:
  1. **Park** Client Alpha's state into `.agents/anchors/<client-alpha-slug>.md`.
  2. **Clear** active focus anchor `.agents/anchor.md`.
  3. **Wipe** transient variables, test files, and scratch scripts.
  4. **Resume** Client Beta's parked anchor `.agents/anchors/<client-beta-slug>.md`.
  5. Check client-confidentiality invariants (codenames only, zero raw NDA client names or tokens).
