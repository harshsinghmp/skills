# 🕸️ Swarm Mesh — Node Identity, Task Claim & Lease Reconciliation

> The layer between the DAG planner and real workers. `swarm-dispatcher.ts` decides **which tasks may run in parallel**; the mesh decides **which node runs each one**, how long a claim stays valid when that node dies, and how the ledger proves no task ran twice.

---

## The 5 Mesh Invariants

### MESH-001: Node Identity

Every participant registers a node record before claiming work:

```json
{ "nodeId": "worker-2", "pid": 48122, "startedAt": "2026-11-10T05:12:04Z", "heartbeat": "2026-11-10T05:14:31Z" }
```

- A node id is sanitized to `[A-Za-z0-9_.-]`; path separators and `..` are rejected before the id touches a filename.
- A claim naming a node with no node record is `UNKNOWN_NODE` in reconciliation — an audit signal, not a hard failure.

### MESH-002: Atomic Task Claim & Duplicate Suppression

A claim is a file creation, not a read-then-write:

- `claims/<taskId>.json` is created with `O_CREAT | O_EXCL`. Exactly one process wins the `EEXIST` race; every other process observes "held" and moves to the next task.
- Takeover of a released or stale claim happens under `claims/<taskId>.lock` (`O_EXCL`), and the claim is re-read **inside** the lock before rewriting — the read-modify-write is not split across the check and the write.
- A second node never holds a task another fresh node holds: it receives `NO_TASK`, never a duplicate ownership record.

### MESH-003: Lease Heartbeat & Stale Failover

- The holder refreshes `heartbeat` at milestones (`beat`). A `CLAIMED` claim whose heartbeat is older than the TTL (default `120s`) is **stale**.
- A stale claim is takeover-eligible: `attempt` increments and `history` records `{ nodeId, claimedAt, attempt, reason }`. Attempt numbers are the fence — a node resuming after a takeover must not `complete` work its attempt no longer owns.
- A `DONE` task is terminal and is never reclaimed. A `RELEASED` task is deliberately claimable again.

### MESH-004: Ledger Reconciliation

`reconcile` rebuilds the truth from `plan.json` + `claims/*` + `nodes/*` and exits non-zero when the mesh and the plan disagree:

| Anomaly | Meaning |
| :--- | :--- |
| `UNCLAIMED_TASK` | Plan task that no node ever claimed |
| `ORPHAN_CLAIM` | Claim for a task the plan does not contain (plan replaced or task renamed) |
| `STALE_CLAIM` | Still `CLAIMED` with an expired heartbeat — the node died mid-task |
| `PLAN_DRIFT` | Claim's `planHash` differs from the current plan — work was claimed against a different plan |
| `UNKNOWN_NODE` | Claim's node never registered |

An empty anomaly list is the only proof that every task ran exactly once, by a node that existed, against the plan that is actually on disk.

### MESH-005: Local Multi-Process Simulation

`simulate --workers N` spawns N real `bun` processes that claim and complete from one shared state directory. No cloud control plane, no daemon, no network:

- The outcome is deterministic even though the interleaving is not: every task ends `DONE` exactly once, and the ledger reconciles clean.
- Do not expose a network control plane until this simulation is deterministic and its tests green — the same guardrail the roadmap applies to the whole mesh.

### MESH-006: Dispatcher Ownership

`swarm-dispatcher.ts --mesh <dir> --node <id>` runs the DAG with ownership arbitrated
by the mesh instead of assumed:

- every task is claimed before it executes, so two dispatchers on one plan never run
  the same task; the loser prunes the dependents it can no longer reach and records
  `Claimed by another mesh node`;
- `COMPLETED` settles the claim as `DONE`; `FAILED`, `FAILED_CONSENSUS`, and budget
  refusals `release` it so a retry can claim it instead of finding it stuck;
- a replayed plan claims nothing — finished tasks are terminal;
- the run returns both ledgers, so the mesh's `reconcile` proves the DAG actually
  ran once.

---

## CLI

```bash
MESH=<skill-dir>/coupling-router/scripts/swarm-mesh.ts

bun $MESH init      --state .agents/artifacts/swarm-mesh --plan plan.json
bun $MESH claim     --state .agents/artifacts/swarm-mesh --node agent-a [--task <id>] [--ttl 120] [--json]
bun $MESH beat      --state .agents/artifacts/swarm-mesh --node agent-a --task <id>
bun $MESH complete  --state .agents/artifacts/swarm-mesh --node agent-a --task <id>
bun $MESH release   --state .agents/artifacts/swarm-mesh --node agent-a --task <id>
bun $MESH worker    --state .agents/artifacts/swarm-mesh --node worker-1 [--ttl 120]
bun $MESH simulate  --state .agents/artifacts/swarm-mesh --workers 3 [--json]
bun $MESH reconcile --state .agents/artifacts/swarm-mesh [--json]
bun $MESH status    --state .agents/artifacts/swarm-mesh [--json]

# DAG dispatch with mesh-arbitrated ownership (two nodes, one plan)
bun <skill-dir>/coupling-router/scripts/swarm-dispatcher.ts --plan plan.json --mesh <state> --node node-1 --json
```

Verdicts from `claim`: `CLAIMED`, `ALREADY_HELD` (idempotent re-claim by the holder), `STALE_TAKEOVER`, `RECLAIMED` (a `RELEASED` task), `NO_TASK`.

Exit codes: `0` claimed / clean reconciliation, `1` no task available or anomalies present, `2` usage error.

## State Layout

```text
<state>/
  plan.json           # { planId, tasks: [{ id, name, dependsOn? }] }
  claims/<id>.json    # one claim record per task (atomic create)
  claims/<id>.lock    # transient takeover lock
  nodes/<id>.json     # node identity + heartbeat
  ledger.json         # last reconciled ledger (written by reconcile/simulate)
```

## Failure Modes

- **Two nodes complete the same task**: impossible while attempts fence ownership; if a stale node reports completion, delete its claim and reconcile — `STALE_CLAIM` names it.
- **Node dies mid-task**: its claim goes stale after the TTL; the next claimer takes over with `attempt + 1` and records the takeover in `history`.
- **Plan swapped under live claims**: `PLAN_DRIFT` fires for every claim whose `planHash` no longer matches. Reconcile, then re-init or re-plan — do not silently reuse old claims.
- **Lock left behind by a killed process**: lock acquisition times out (5s), the stale lock is removed exactly once, and the claim is re-read inside the lock so the recovery cannot double-assign.

## Verification

1. [ ] Every plan task resolves to exactly one `DONE` claim.
2. [ ] `reconcile` exits `0` with an empty anomaly list.
3. [ ] Claim attempts are monotonic per task; a takeover has a longer `history` than the original claim.
4. [ ] `simulate --workers 3` used more than one node and produced no duplicate ownership.
