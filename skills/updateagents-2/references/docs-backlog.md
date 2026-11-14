# 📚 docs-backlog — Consume the Documentation Point Ledger

> Mode: `docs-backlog` (`--docs-backlog`).
> Purpose: fold every agent-relevant code change since the last agent watermark into `.agents/context/current.md`, so a new or forgotten session starts from durable project truth instead of re-reading Git history.

---

## 1. Why It Exists

`updatedocs` records code changes that owe documentation as sequential points in `.docs-ledger.json`:

```text
DP-0007  abc1234  feat(auth)  "add SSO login flow"
        developer: documented
        user:      documented
        agent:     documented
        shipped:   v1.2.0
```

`updateagents` owns `.agents/context/`. This mode consumes the ledger so agents learn the same reality that developers and users were told.

It is the recovery path for **forgotten sessions**: the ledger remembers the last documented point even if the conversation that produced it is gone.

---

## 2. Command

```bash
# Consume all ready points since agentWatermark
bun skills/core-engine/updateagents/scripts/updateagents.ts . --docs-backlog

# Cap context growth on a long backlog
bun skills/core-engine/updateagents/scripts/updateagents.ts . --docs-backlog --docs-backlog-limit 20

# Preview only
bun skills/core-engine/updateagents/scripts/updateagents.ts . --docs-backlog --dry-run

# Machine-readable result
bun skills/core-engine/updateagents/scripts/updateagents.ts . --docs-backlog --json
```

| Flag | Behavior |
| :--- | :--- |
| `--docs-backlog` | Read `.docs-ledger.json`, append ready points to `.agents/context/current.md`, advance `agentWatermark` |
| `--docs-backlog-limit <n>` | Maximum points appended in one run (default 50) |
| `--dry-run` | Report without writing `.agents/context/current.md` or the ledger |
| `--json` | Machine-readable result: appended count, range, pending count, verdict |

---

## 3. Readiness Rule (No Skipping)

The backlog advances **only through points whose agent coverage is complete**:

```text
agent: documented | verified | not-needed  → ready
agent: pending                             → stop here
```

If the next point still owes agent documentation, `--docs-backlog` stops, reports the blocking point, and exits 0 without advancing. This prevents agent context from claiming a change it has not learned.

---

## 4. What Gets Written

A managed, idempotent block is inserted under `## 1. Verified Shipped Reality` in `.agents/context/current.md`:

```markdown
<!-- docs-backlog:start -->
### 📚 Documentation Points Since Last Agent Sync (DP-0001–DP-0007)

_Source: `.docs-ledger.json` (owned by `updatedocs`). These code changes are durable agent-relevant knowledge; document any remaining audience gaps before the next checkpoint._

- **DP-0001** `abc1234` **feat(auth)** — add SSO login flow — developer: documented · user: documented · agent: documented · shipped: v1.2.0
- **DP-0002** `def5678` **fix(api)** — handle expired webhook signatures — developer: documented · user: pending · agent: documented · unreleased
<!-- docs-backlog:end -->
```

- Re-running replaces only the marker region.
- Text outside the markers is preserved.
- `agentWatermark` advances to the last consumed point and the ledger is updated.
- `.context.hash` is refreshed so the context freshness gate stays armed.

---

## 5. Automatic Consumption in the Default Sync

A normal `updateagents` run (no mode flag) also consumes the backlog after standards/brand synchronization. It disables the context fast-path when the next point is ready, appends the block, and refreshes `.context.hash`. The explicit `--docs-backlog` mode remains available for a focused run, CI, or a long backlog.

## 6. Loop With `updatedocs`

```text
code change
  → updatedocs --ledger          create point + audience gaps
  → agent docs / --mark          agent coverage complete
  → updatedocs --checkpoint      documented watermark advances
  → updateagents --docs-backlog  this mode: agent context learns the point
  → updatedocs --release <tag>   shipped state + what's new
```

If `updatedocs` is not installed, the mode reports that `.docs-ledger.json` is missing and exits without modifying context.

---

## 7. Boundaries

- `.memory/**` is never read, written, or validated.
- The ledger is read; only `agentWatermark` and `updatedAt` are written back.
- `.agents/context/current.md` is the only context file mutated by this mode.
- Do not hand-edit `agentWatermark`; let the mode advance it.
- Do not use this mode to invent documentation. If a point is pending, complete the doc first.

## 8. Quality Gate

- [ ] Ledger exists and is valid JSON.
- [ ] `agentWatermark` is not edited by hand.
- [ ] No point with `agent: pending` is skipped.
- [ ] Managed block is idempotent; outside text preserved.
- [ ] `.context.hash` refreshed.
- [ ] `.memory/**` untouched.
- [ ] Report states the consumed range and any pending remainder.
