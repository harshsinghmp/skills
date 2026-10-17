# PR Context — gather the review's full evidence surface before judging

> Source: `accessibility-agents-pr-review` (skills-hub, signed SLSA L2, raw
> SKILL.md fetched 2026-09-19) — mechanism only: PR asset sweep + workspace
> review doc. MCP/GitHub tool calls generalized to `gh` CLI. Loaded by the
> `diff` mode alongside the theme catalog.

A diff without its context produces confident-but-wrong findings. Pull every
asset in one sweep before running the theme pass.

## Demand gate (run first)

Inspect what the change actually expresses, then classify — change labels are
not evidence:

- **No product impact** (internal refactor, non-user-facing fix): skip the
  gate silently, review the code.
- **Established direction** (spec, ADR, or a maintainer decision recording the
  accepted behavior): compare against the recorded decision. On conflict,
  report the mismatch and **stop** — do not run the remaining stages and do
  not report code findings.
- **Open product decision**: interactive → ask the user for the unresolved
  decision before judging; automated/CI → run record-only, summarize the
  impact and what needs human confirmation, never phrase it as approval.

## Authority model

A review authorizes analysis and reporting only — never edits, never merges:

- **Report-only (default)**: findings ship with fix guidance. No working-tree
  edits, no remote writes.
- **Fix (explicit only)**: the invocation literally says "review and fix".
  Local targets only.
- **Submit (explicit only)**: the invocation literally says "publish/submit
  the review". Approving or merging always needs its own explicit request.

## Asset sweep (one pass, `gh` CLI)

1. **Metadata** — `gh pr view <n> --json title,body,author,baseRefName,headRefName,state,mergeable` — title, description, author, branches, merge state.
2. **Changed files + full diff** — `gh pr diff <n>` — file list with patches, additions, deletions.
3. **Review comments** — `gh api repos/{owner}/{repo}/pulls/<n>/comments` — inline comments from all reviewers (avoid re-litigating settled threads).
4. **Commits** — `gh pr view <n> --json commits` — the change story, not just the final state.
5. **Linked issues** — parse `fixes #N` / `closes #N` / `resolves #N` from the PR body; `gh issue view` each. The issue is the intent the diff is judged against.
6. **Reactions** — note 👍/👎/confused counts on the description and top comments; strong negative signal on an approach is a demand-gate input, not a finding.
7. **Release context** — does the base branch target an upcoming release? A pre-release base raises the bar for risky changes (migration, contract, flag-less behavior).
8. **Check runs / CI status** — `gh pr checks <n>` — summarize "N/M checks passing". A red security/lint gate is context, not a duplicate finding.
9. **Security-sensitive paths** — flag changed files matching `**/auth/**`, `**/security/**`, `**/crypto/**`, `**/*.env*`, `**/permissions/**`, `**/tokens/**`, `**/secrets/**`, plus lockfile/dependency changes (Dependabot alerts). Flagged paths route extra scrutiny, not automatic findings.
10. **Project board context** — if linked issues sit on a project board, note the column; flag when the board needs updating after merge.

## Per-file triage (before the theme pass)

Classify each changed file — Feature / Bug fix / Refactor / Tests /
Config-Build / Docs / Dependencies — and rate risk: **high** (core logic,
auth, data handling, migrations, security paths), **medium** (API changes,
shared utils, wide-reaching type changes), **low** (tests, docs, config,
formatting). High-risk files get the full theme catalog; low-risk files get a
fast pass. Risk, not diff size, sets the depth.

When the review must leave the chat as a shareable artifact, apply
[review-render.md](review-render.md) to the gathered findings.
