# Troubleshooting

Symptom → one-command fix → deeper link. Try the fix first; follow the link only if it persists.

---

## 1. `gh` auth expired or missing

**Symptom:** `gh: Not authenticated` / `Bad credentials`.
**Fix:** `gh auth login`
**Deeper:** [Branching & Release Matrix](branching-and-release-matrix.md) · `gh` CLI setup

## 2. Detached worktree / wrong lane

**Symptom:** `HEAD detached` inside `.worktrees/`, or commands run in the wrong lane.
**Fix:** `git rev-parse --git-common-dir && git worktree list && cd` to the correct lane
**Deeper:** [Worktree Parallel Lanes](worktree-parallel-lanes.md)

## 3. Rebase loop / diverging rebase

**Symptom:** `git rebase dev` replays the same conflicts on every `--continue`.
**Fix:** `git rebase --abort && git merge dev` (merge instead; never force shared history clean)
**Deeper:** [Conflict Resolution & Recovery](conflict-resolution-and-recovery.md)

## 4. Tag already exists

**Symptom:** `tag 'vX.Y.Z' already exists` on release.
**Fix:** bump `version` in `package.json` by hand, then re-run the Phase 8 gate (bump, never move a published tag)
**Deeper:** [Monorepo & Sanitization](monorepo-and-sanitization.md)

## 5. Push lease held (`--force-with-lease` rejected)

**Symptom:** `stale info` / lease rejection on force-push.
**Fix:** `git fetch origin && git rebase origin/<branch>` then push again
**Deeper:** [Conflict Resolution & Recovery](conflict-resolution-and-recovery.md)

## 6. CI red but unrelated to your diff

**Symptom:** `gh pr checks` fails on checks your diff cannot affect.
**Fix:** `gh run rerun <run-id> --failed` (once; then compare against base-branch baseline)
**Deeper:** [Issue-to-PR Discipline](issue-to-pr-discipline.md) § Honest CI Shepherding

## 7. Push rejected (non-fast-forward)

**Symptom:** `! [rejected] <branch> -> <branch> (non-fast-forward)`.
**Fix:** `git pull --rebase origin <branch>` (feature branches only; never rebase `dev`/`master`)
**Deeper:** [Branching & Release Matrix](branching-and-release-matrix.md)

## 8. Git LFS objects failing

**Symptom:** `LFS: object missing` / smudge filter errors on checkout.
**Fix:** `git lfs pull && git lfs fsck`
**Deeper:** [Monorepo & Sanitization](monorepo-and-sanitization.md)
