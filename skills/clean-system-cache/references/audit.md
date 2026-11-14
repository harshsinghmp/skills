# audit — clean-system-cache audit mode

## When to Use

- **Pre-purge inventory audit**: report exactly what is reclaimable, what is protected, and what would hurt — BEFORE any deletion.
- **Recurring bloat review**: quantify cache growth per tool so the cleaning cadence is set by evidence, not by "the disk feels full".
- **Safety audit**: verify the dry-run/protect list actually shields live agent capability caches and session state.

## Checklist

- [ ] Inventory first, always: per-tool cache paths, sizes, last-access times — the audit report IS the pre-purge report
- [ ] Classify every candidate: `safe-to-purge` (`T1`, `SAFE` discoveries) / `protected` (live agent caches, session state, capability indexes) / `ask-first` (`ASK` expensive-or-sudo, `ASK!` irreversible) / anything with uncommitted work nearby
- [ ] Run `clean-cache.sh --discover` and attach it: SAFE items, and ASK/ASK! items grouped per app and per project, are the audit's evidence, not prose
- [ ] For each `ASK`/`ASK!` row, attach `--browse <key>` output so the reader sees the actual files, not a directory name
- [ ] Verify protected paths are on the exclusion list of every purge command this skill would run
- [ ] Dry-run is the only default: every purge command reported with its `--dry-run`/`--check` output before any real invocation
- [ ] Reclaimable space estimated per candidate (du-verified, not guessed)
- [ ] Nothing running depends on a candidate: browsers/agents/dev-servers/Flatpak apps holding the cache are flagged
- [ ] Cross-platform paths validated (Windows `%LOCALAPPDATA%`, macOS `~/Library/Caches`, Linux `~/.cache`) — no wrong-OS deletions
- [ ] No `rm -rf` on variable-rooted paths; every path expanded and printed before execution
- [ ] Sudo-backed candidates either run with passwordless sudo or are reported as a command to run — never a prompt
- [ ] profile-sync-daemon lowerdirs (`~/.config/*-backup*`, `*-ovfs*`) flagged as "stop psd first", never deleted live
- [ ] Learned decisions reviewed (`--learned`): `allow` must only cover regenerable `ASK` items; any `allow` on `ASK!` is a bug
- [ ] Recovery note per candidate: what regenerates, how long the first cold run takes afterwards

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Purge candidate overlaps a protected/agent path | `BLOCK` | remove from the plan; fix the exclusion list |
| Destructive command on unexpanded variable path | `BLOCK` | expand and re-review |
| `ASK!` candidate proposed without explicit user selection | `BLOCK` | re-present via `--list` + `--browse`, require typed confirmation |
| Large reclaimable cache, zero dependencies | `PROCEED` | purge with dry-run shown first |
| Sudo-backed archive cleanup (pacman/apt/dnf) | `ASK` | show `paccache -r -k3` / `apt-get clean` plan; apply with `--only <id> --yes` |
| Cache growth repeated across weeks | `REPORT-ONLY` | adjust cadence or fix the generating tool |

## Sources

- this skill's own protected-path and dry-run purge contract (SKILL.md)
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
