# Agent Reference — Delivery Contract

> Machine-facing reference for agents integrating this template. Read alongside
> `AGENTS.md` and `.agents/standards/landing-gate.md`.

## Delivery contract (Landing Gate)

A commit is **not** a delivery. Work is **LANDED** only when it is
reachable from the integration branch on the remote; until then it is
**LOCAL**.

- Forbidden words until the gate passes: landed, shipped, merged, released,
  deployed, "verified on `<branch>`".
- Permitted before the gate: local, committed locally on `<branch>` at
  `<sha>`, not yet pushed, not yet reviewed, not yet landed.
- Applies to every artifact: commit messages, close-out docs, PR bodies,
  changelog entries, issue comments, and the final report.

## Verdicts

- `LANDED` / `LOCAL` — post-merge mode.
- `REVIEWABLE` / `NOT REVIEWABLE` — pre-review mode.
- Never use "NOT LANDED" (contains "LANDED").

## The gate

```bash
bun run check:landed -- --mode=post-merge --branch={{integration_branch}}   # LANDED / LOCAL
bun run check:landed -- --mode=pre-review --head=<branch> # REVIEWABLE / NOT REVIEWABLE
```

## Required "Remote state" report block

| Field | Value |
| :--- | :--- |
| Branch + sha | `<branch>` @ `<sha>` |
| Integration branch + sha | `{{integration_branch}}` @ `<sha>` |
| Landed? (yes/no + exact command + exit code) | `LANDED` / `LOCAL` |
| PR number + state | `#<n>` / `<state>` (or `none`) |
| Unpushed count | `<n>` |
| Gate result | `LANDED` / `LOCAL` / `REVIEWABLE` / `NOT REVIEWABLE` |

If you cannot push, say `LOCAL`.

## Staging (concurrent agents)

- Never `git add -A` / `git add .`; stage by explicit path.
- Run `git status --short` before staging.
- Commit message must match `git show --stat HEAD`.
- One worktree per agent when they can overlap.

## Full standard

`.agents/standards/landing-gate.md` · `CONTRIBUTING.md` (branch lifecycle).
