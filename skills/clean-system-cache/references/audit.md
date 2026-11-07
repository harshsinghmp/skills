# audit — clean-system-cache audit mode

## When to Use

- **Pre-purge inventory audit**: report exactly what is reclaimable, what is protected, and what would hurt — BEFORE any deletion.
- **Recurring bloat review**: quantify cache growth per tool so the cleaning cadence is set by evidence, not by "the disk feels full".
- **Safety audit**: verify the dry-run/protect list actually shields live agent capability caches and session state.

## Checklist

- [ ] Inventory first, always: per-tool cache paths, sizes, last-access times — the audit report IS the pre-purge report
- [ ] Classify every candidate: `safe-to-purge` (rebuildable caches) / `protected` (live agent caches, session state, capability indexes) / `ask-first` (anything with uncommitted work nearby)
- [ ] Verify protected paths are on the exclusion list of every purge command this skill would run
- [ ] Dry-run is the only default: every purge command reported with its `--dry-run`/`--check` output before any real invocation
- [ ] Reclaimable space estimated per candidate (du-verified, not guessed)
- [ ] Nothing running depends on a candidate: browsers/agents/dev-servers holding the cache are flagged
- [ ] Cross-platform paths validated (Windows `%LOCALAPPDATA%`, macOS `~/Library/Caches`, Linux `~/.cache`) — no wrong-OS deletions
- [ ] No `rm -rf` on variable-rooted paths; every path expanded and printed before execution
- [ ] Recovery note per candidate: what regenerates, how long the first cold run takes afterwards

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Purge candidate overlaps a protected/agent path | `BLOCK` | remove from the plan; fix the exclusion list |
| Destructive command on unexpanded variable path | `BLOCK` | expand and re-review |
| Large reclaimable cache, zero dependencies | `PROCEED` | purge with dry-run shown first |
| Cache growth repeated across weeks | `REPORT-ONLY` | adjust cadence or fix the generating tool |

## Sources

- this skill's own protected-path and dry-run purge contract (SKILL.md)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
