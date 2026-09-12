# Worktree Lease Protocol

> Multi-session mutual exclusion for a shared git checkout. Two independent
> agent sessions (or an agent + a human) working in **one clone** — same branch
> pointer, same index, same stash stack — must not mutate git state
> concurrently. This protocol makes the contention visible before it becomes a
> collision. Companion reference for `coupling-router`; enforces one line of
> defense so the other session's work survives yours.

---

## 0. Scope — when a lease applies

| Situation | Lease needed? |
|:---|:---|
| You are the only session in the clone | No (acquire is trivially free; still cheap to write one) |
| Two or more sessions share **one checkout** | **Yes — mandatory before any git mutation** |
| Sessions use separate `git worktree add` directories | No — separate worktrees are the *preferred* alternative; lease is moot |
| Read-only session (grep, search, no branch/index/stash mutation) | No — but declare intent to stay read-only |

The lease is **advisory mutual exclusion, not a lock**: it works because every
session that follows this protocol probes it first. It cannot stop a session
that doesn't look — which is why the probe is Step 0 of routing, not optional
hygiene.

---

## 1. The lease file

| Property | Rule |
|:---|:---|
| Path | `.agents/artifacts/WORKTREE-LEASE.md` (fixed name — never dated) |
| Owner | Exactly one session at a time |
| Lifetime | Held for the session's mutating work; released at close |
| Git treatment | Local-only (untracked, like all of `.agents/artifacts/`); never committed |
| Size | ≤20 lines — it is a claim ticket, not a report |

```markdown
# WORKTREE LEASE
owner: <session id / agent name / task slug>
branch: <branch the lease-holder checked out>
acquired: <ISO-8601 UTC timestamp>
heartbeat: <ISO-8601 UTC timestamp of last confirmation>
scope: <paths this session will write; shared surfaces called out explicitly>
notes: <stash ops performed, backups taken, foreign WIP observed>
```

The `scope` field is the collision killer: it lets a second session tell
instantly whether its paths overlap the holder's. `notes` records anything the
next session must know (e.g. "stash@{0} is evidence-ledger WIP — do not pop").

---

## 2. Acquire — on session start, before any git mutation

1. **Probe**: does `.agents/artifacts/WORKTREE-LEASE.md` exist?
   - **No lease** → acquire: write the lease with owner/branch/scope/heartbeat. Proceed.
   - **Lease present, heartbeat fresh** (default window: ≤30 min old) → you are
     the second session. **Do not** switch branches, push/pop stashes, run
     `git checkout --` on shared files, or commit shared surfaces. Choose one:
     - Take a separate worktree: `git worktree add ../<repo>-<task> <branch>`
       (preferred — zero contention),
     - Work read-only and defer mutations,
     - Wait and re-probe.
   - **Lease present, heartbeat stale** (window exceeded, or the holder's
     branch no longer exists) → the holder is presumed dead. **Takeover**:
     append a takeover line (`took over from <owner> at <ts>, reason: stale
     heartbeat`), update owner/branch/heartbeat, and treat any WIP described
     in `notes` as foreign — preserve it, do not commit it.
2. **Re-probe before every worktree-level mutation**: branch switch, stash
   push/pop, `git checkout HEAD -- <shared file>`, force-update of a branch.
   If the lease changed hands since you acquired, stop and reassess.

## 3. Holder duties — while you own the lease

1. **Stage explicit paths only.** Never `git add .` or `git add <shared dir>`
   when foreign WIP exists in the worktree — it sweeps the other session's
   hunks into your commit. Name every file.
2. **Never pop or drop a stash you did not create.** If a stash must move,
   push it back with the same message and record it in the lease `notes`.
3. **Refresh the heartbeat** at every milestone (commit, PR, phase boundary) —
   a stale heartbeat invites takeover while you are still alive.
4. **Respect foreign WIP absolutely**: untracked directories and modified
   files outside your declared scope belong to another session. Do not commit,
   delete, rename, or "clean up" them. If they block a verification step (e.g.
   their test edit breaks the suite), park the *minimum* — a path-limited
   `git stash push -- <one file>` with a dated message — run your check, and
   `git stash pop` immediately.
5. **Shared surfaces are the high-collision zone** (`skills.json`, `llms.txt`,
   root `README.md`, `CHANGELOG.md`). Before staging any of them, re-diff and
   confirm every hunk is yours.

## 4. Release — session end or task complete

1. Fold any surviving working state into `.agents/artifacts/HANDOFF.md`
   (the handoff layering protocol owns cross-session truth; the lease is
   intra-session exclusion).
2. Delete the lease file. An absent lease is a free lease.
3. Leave a one-line residual-state note in HANDOFF.md for anything left in the
   worktree (untracked dirs, restored-but-uncommitted WIP) so the next session
   inherits facts, not mysteries.

---

## 5. Repair ladder — when a collision happens anyway

Applied in order; do not skip to force:

1. **Assess before touching anything**: `git branch --show-current`,
   `git log -1`, `git status`, `git stash list`. Identify what landed where
   and which hunks are whose.
2. **Preserve foreign WIP first**: copy contaminated shared-file states to a
   dated backup (e.g. `.agents/artifacts/<task>-wip-backup/`) before any
   reset that could destroy them.
3. **Rebuild, don't rewrite history on shared branches**: reset the misplaced
   local feature branch, re-stage *your* hunks only (explicit paths), commit.
   Never rewrite `dev`/`master` — rebuild on a feature branch instead.
4. **Corrected branch → `git push --force-with-lease`** (never bare `--force`),
   then PR as usual. `--force-with-lease` fails instead of clobbering if
   someone pushed in between.
5. **Restore foreign WIP** to the worktree exactly as found; note what you
   did in the lease `notes` and in HANDOFF.md.

## 6. Verification checklist

- [ ] Lease probed before the first git mutation of the session; file exists with fresh heartbeat if you are mutating.
- [ ] `scope` declared; every staged path in your commits is inside it.
- [ ] Zero stashes popped/dropped that you did not create.
- [ ] Shared-surface diffs audited hunk-by-hunk before staging.
- [ ] Foreign WIP (untracked dirs, out-of-scope edits) untouched and uncommitted.
- [ ] On release: lease deleted, HANDOFF.md carries the residual-state note.
