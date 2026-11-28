# Landing Gate — Delivery Is Not Commitment

> **Scope:** every agent working in this repository, and every project scaffolded from this template.
> **Authority:** this standard is mandatory, not optional background reading. Routed from `AGENTS.md` (Working rules → Landing Gate).

## The failure this rule exists to prevent

An agent committed two complete waves of work locally, ran the full test
suite green, wrote a close-out document headed *"Recently Landed Waves
(Verified on {{integration_branch}})"* — and never pushed. The remote never had the work.
Every test passed; the delivery claim was false. The root cause is that
"the work is done" and "the work is delivered" were the same sentence, and
nothing mechanical checked the second one. This standard makes the second
one a separate, verified, mechanical gate.

## The vocabulary contract

A commit is **not** a delivery. Work is **LANDED** only when it is
reachable from the integration branch **on the remote**; until then it is
**LOCAL**. The following words may be used **only** after the gate command
has exited 0 in the same session:

> landed, shipped, merged, released, deployed, "verified on `<branch>`"

Before that, the only permitted words are:

> local, committed locally on `<branch>` at `<sha>`, not yet pushed,
> not yet reviewed, not yet landed.

This applies to **every artifact**: commit messages, close-out docs, PR
bodies, changelog entries, issue comments, and the final report. A single
forbidden word in any of those makes the whole claim false.

## Verdict names (cannot be confused)

Do **not** use "NOT LANDED" — it contains "LANDED" and a grep or a quoted
output will read failure as success. Use exactly:

- `LANDED` / `LOCAL` — post-merge mode (is the work on the integration branch?).
- `REVIEWABLE` / `NOT REVIEWABLE` — pre-review mode (is the branch pushed with an open, green PR?).

## The gate

The gate is `bun run check:landed` (or this repo's equivalent). It has
two modes.

**Post-merge mode** — "is it on the integration branch?"

```bash
bun run check:landed -- --mode=post-merge --branch={{integration_branch}}
# equivalent:
git fetch origin {{integration_branch}}
git merge-base --is-ancestor HEAD origin/{{integration_branch}}   # exit 0 => LANDED
```

**Pre-review mode** — "is the branch pushed with an open, green PR?"

```bash
bun run check:landed -- --mode=pre-review --head=<branch>
# equivalent:
git ls-remote --heads origin <branch>            # non-empty => pushed
gh pr view <branch> --json state,statusCheckRollup  # OPEN + all checks green
```

The integration branch for this repository is **`{{integration_branch}}`** (see
`CONTRIBUTING.md`). Do not invent a different name; if a downstream
project uses another branch, set it via `--branch` / `INTEGRATION_BRANCH`.

## Staging rule for concurrent agents in one checkout

- Never `git add -A` / `git add .` — stage by explicit path only.
- Run `git status --short` immediately before staging; review every line.
- A commit message must match `git show --stat HEAD` (the files listed in
  the message must be the files actually in the commit).
- Use **one worktree per agent** when agents can overlap; never let two
  agents stage in the same working tree.

## Required "Remote state" report block

Every task close-out and every final report must include this block:

| Field | Value |
| :--- | :--- |
| Branch + sha | `<branch>` @ `<sha>` |
| Integration branch + sha | `{{integration_branch}}` @ `<sha>` |
| Landed? (yes/no + exact command + exit code) | `LANDED` / `LOCAL` — `<command>` (exit `<n>`) |
| PR number + state | `#<n>` / `<state>` (or `none`) |
| Unpushed count | `<n>` |
| Gate result | `LANDED` / `LOCAL` / `REVIEWABLE` / `NOT REVIEWABLE` |

If you cannot push, say `LOCAL` — never say "landed".

## Exceptions

- **Offline:** say "local", and give the exact push command the user must
  run. Do not claim delivery.
- **Draft PRs:** use pre-review mode and report "ready for review" (not
  "landed").
- **Local-only work requested by the user:** still run the gate and report
  the truth (`LOCAL`).

## Enforcement by GitHub

A rule only GitHub can enforce cannot be forgotten. Repositories using
this template should:

1. Add the gate to the PR template checklist (see
   `.github/pull_request_template.md`).
2. Run the pre-review gate on `pull_request` (against `github.head_ref`)
   and the post-merge gate on `push` to the integration branch (against
   `github.ref_name`) in CI — see `.github/workflows/ci.yml`. Both CI
   steps require `fetch-depth: 0` (a depth-1 checkout lacks the remote
   branch refs the gate looks for) and the pull-request step requires
   `GH_TOKEN: ${{ github.token }}` (the gate reads the PR and its check
   rollup through `gh`).
3. Make the delivery gate a **REQUIRED status check** in the
   branch-protection ruleset, so a PR cannot merge while the branch is
   unpushed or its checks are red.

## See also

- `AGENTS.md` — Working rules (Landing Gate entry).
- `docs/agent-reference.md` — delivery contract for agents integrating
  this template.
- `CONTRIBUTING.md` — branch and release lifecycle ({{integration_branch}} → {{production_branch}}).
