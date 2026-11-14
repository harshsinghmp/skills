# ⚓ context-anchor:task-interruption-and-recovery — Mid-Task Checkpointing & Resumption Protocol

This reference codifies stateful task interruption handling, context compaction survival, and cognitive resumption protocols for autonomous developer agents.

---

## 1. The Interruption Tax & Context Degradation

In modern agent workflows (2025–2026), developers and orchestrators frequently interrupt long-running coding agents to inject hotfixes, clarify requirements, or prioritize urgent client requests.

Without deterministic state checkpointing, interruptions cause:
1. **Lost-in-the-Middle Amnesia**: Summarization or compaction prunes partial implementation details, causing the agent to restart or hallucinate previously solved steps.
2. **Ghost WIP Churn**: Unstashed working tree edits collide with the new interruption task.
3. **Cognitive Restart Penalty**: The human developer spends 10–20 minutes re-explaining the original task context upon return.

---

## 2. The Mid-Task Stash Protocol (`--stash-task` & `--unstash-task`)

Whenever an active task is interrupted:

### A. Checkpointing (Stashing)
Before switching focus to an interruption or subtask, snapshot the active state into `.agents/artifacts/task-stashes/<task-id>.json`:
```bash
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --stash-task <task-id> --goal "Implement auth flow" --next-step "Add JWT verification test"
```
The task stash records:
- `taskId`: Unique slug or identifier.
- `goal`: High-level build specification.
- `completedSteps`: Array of verified milestones.
- `openLoops`: Known pending blockers or edge cases.
- `nextStep`: Immediate next command or edit to execute upon resume.
- `gitSnapshot`: Active branch name and list of modified uncommitted files.

### B. Resumption (Unstashing)
When returning to the primary task:
```bash
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --unstash-task <task-id>
```
The anchor engine prints an instant, high-bandwidth resumption brief and re-verifies git state consistency.

---

## 3. Context Health & Compaction Gauge (`--health-check`)

To avoid blind context compaction or sudden out-of-context crashes, run the context health gauge:
```bash
bun skills/context-orchestration/context-anchor/scripts/anchor.ts --health-check
```
The health check verifies:
1. Active task anchor exists and is not stale (>2 hours without touch).
2. Critical architectural invariants are pinned (`--pin`).
3. Pending task stashes are tracked without dangling lockfiles.
4. Alerts if turn count or token utilization suggests compaction is required.

---

## 4. Verification Checklist

- [ ] Interrupted tasks stashed via `--stash-task` with explicit `nextStep` recorded.
- [ ] Active branch and dirty files reconciled before context switch.
- [ ] `--health-check` executed to confirm zero dangling stashes.
- [ ] Pinned invariants preserved across session compaction boundaries.
