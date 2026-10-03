# Status Sweep & Cluster Triage Protocol

Loaded by: the `dead-letter status` sweep and any scheduled sweep
(`nightly failure triage`). The capture procedure in SKILL.md is not needed for a
sweep — this file plus the taxonomy table in SKILL.md is the full context.

Scan all open dead-letter records and emit a **cluster triage report** in three passes:

## Pass 1 — Inventory
List every open record: failure code, task, retry count, age, escalation deadline. Highlight any record with **≥2 retries** (per the Recovery Decision rule, these should already be escalated — a 2+ retry open record is itself a process defect) or **past deadline**.

## Pass 2 — Cluster by Root Cause
Group open records sharing the same underlying cause. Cluster keys, strongest first:

| Key | Example cluster |
| :--- | :--- |
| **Same root cause** | Three tasks failing on the same missing env var — one systemic `BLOCKED-CRED`, not three retries |
| **Same dependency/producer** | Failures downstream of one broken build, dead MCP server, or stale schema |
| **Same precondition** | Every record's Precondition Check failing on the same query |
| **Same surface** | Same module, tool, or credential surface implicated across tasks |

Cluster on **root cause, not error-string similarity** — two tasks can share an identical stack trace and have unrelated causes, and two different messages can share one cause. Read the records' What-Was-Learned sections; those carry the causal evidence. An agent that pattern-matches error strings and blindly resets has misunderstood the sweep.

## Pass 3 — Verdict per Cluster
For each cluster of size ≥2, emit one systemic verdict instead of per-record retries:

| Verdict | When | Action |
| :--- | :--- | :--- |
| **Systemic** | One root cause explains every record in the cluster | One fix (or one escalation question) covers all members; the fix lands once, members re-run their Precondition Check and resume from their Recovery Sequence step 4. Do not retry members individually |
| **Coincidental** | Records share a code but different causes | Split the cluster; each record proceeds on its own Recovery Decision |
| **Cascade** | One root failure causes the others (downstream of a broken producer) | Fix the producer first; mark members `BLOCKED-CASCADE-<code>` referencing the source record until it resolves |
| **Escalate cluster** | Cluster size ≥3 with the same cause, or any member with ≥2 retries | Escalate once with the cluster as evidence — never a per-record escalation storm |

## Report format (inline, ≤40 lines)

```
DEAD-LETTER STATUS — <ISO date>
Open: 7 records (3 clusters ≥2)

[SYSTEMIC] BLOCKED-CRED ×3 — all missing UPSTASH_* (tasks: m1, m2, m7)
  → one fix: provision staging Redis; members resume at seq 4 after fix
[COINCIDENTAL] FAILED-TOOL ×2 — unrelated (broken CLI vs MCP timeout)
  → split: each on its own Recovery Decision
[CASCADE] BLOCKED-DATA ×2 ← FAILED-LOGIC ×1 (stale schema producer)
  → fix producer record first; members hold
Singles: PARTIAL ×2 — individual Recovery Decisions stand
Sweep action: 1 fix, 0 retries, 1 escalation (cluster evidence attached)
```

The sweep closes with a **sweep action line**: counts of fixes, retries authorized, and escalations. A sweep that ends with retry authorization for a systemic cluster has failed — the whole point is one fix, not N retries.

## Sweep findings ledger

Recurring sweeps consult the **findings ledger** — the persistent record of prior
sweep verdicts (date, cluster, verdict, action taken, outcome). Its jobs:

1. **Deduplicate**: a cluster already recorded as systemic with a fix landed is not
   re-litigated — members either recovered (close them) or the fix failed (escalate
   with the ledger as evidence of recurrence).
2. **Measure convergence**: sweeps where new clusters keep appearing while old ones
   stay open signal a systemic problem above the records — escalate the pattern, not
   another round of member verdicts.
3. **Feed the repro pack**: a systemic cluster's one fix is provable by one pack
   (see SKILL.md close-out conversion) — the ledger links cluster → pack → outcome.

Location: `.agents/artifacts/dead-letter-ledger.md` (working-artifacts rule).
