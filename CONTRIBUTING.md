# Contributing to `harshsinghmp/skills`

Downstream hub: 170+ agent skills synced from upstream repos. Most changes arrive via automation; human PRs add new upstreams or fix the engine.

## Adding skills (preferred path)

```bash
bun install
bun run add <link>      # whole repo, single skill, or shorthand — auto-syncs
bun run validate
```

Never hand-create `skills/<name>/`. Name taken → engine suffixes (`-2`, `-3`). Same path re-added → skipped. See `AGENTS.md` for the full link-only protocol.

## Manual manifest entries

Add to `skills.manifest.json` (`name`, `category`, `description`, `upstream{repo,branch,sourcePath}`), then `bun run sync` to pull with provenance stamping.

## Validation gate (required before every PR)

```bash
bun run validate
bun test
bun run typecheck
```

`bun run validate` must report 0 errors. Name-mismatch warnings on upstream-drifted skills (`agent-handoff`, `code-review-linus-torvalds-style`) are known — do not edit upstream `SKILL.md` files.

## Commits & branches

- Branch: `main`. Automated upstream syncs arrive as `automated-upstream-sync` PRs — review prompt diffs, confirm CI, merge.
- Conventional Commits: `<type>(<scope>): summary` — e.g. `feat(animation): ingest 22 web animation skills`, `fix(sync): repair stale paths`.
- PRs follow `.github/pull_request_template.md` (Why/What/Verification + anti-slop checklist). Notable changes need a `CHANGELOG.md` entry under `## [Unreleased]`.
- File bugs and feature requests with `.github/ISSUE_TEMPLATE/` — paste links and errors verbatim.
- Never commit `.env`, credentials, tokens, or `skills/*/.upstream-meta.json` (local cache, gitignored).

## What not to PR

- Edits inside synced upstream `SKILL.md` files (overwritten by next sync).
- Skill-count updates in badges/docs (volatile; manifest is truth).
- `.agents/` worktree internals or `.memory/` state.
