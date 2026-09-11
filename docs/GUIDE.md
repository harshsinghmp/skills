# Skills Hub — User Guide

Personal reference for operating `harshsinghmp/skills`. Agent rules live in `AGENTS.md`; this is the human companion.

## What this repo is

Downstream hub of 170+ agent skills. Upstreams (Superpowers, Muse Memory, Muse Skills, community repos) are the source of truth for skill content; this repo aggregates, validates, and publishes them via `npx skills add harshsinghmp/skills`. `skills.manifest.json` maps every skill to its upstream.

## Add a skill

**Remote (preferred, zero local disk):**

```bash
gh workflow run add-skill.yml -R harshsinghmp/skills -f urls="https://github.com/owner/repo"
# -R pins the hub repo, so this works from any folder with no local clone
# preview: -f dry_run=true | force category: -f category=engineering
```

Runner registers, syncs, validates, opens a PR. Merge after CI passes.

**Local (engine debugging only):**

```bash
bun install
bun run add <link>
bun run validate
```

Link shapes: repo root or `owner/repo` → all skills; `tree/<branch>/<path>` or `owner/repo/<path>` → one skill; `blob/.../SKILL.md` and `raw.githubusercontent` URLs auto-normalize. Release/archive URLs are rejected. Same path re-added → skipped; taken names → suffixed `-2`, `-3`.

## Keep it synced

- Daily GitHub Action syncs all upstreams and opens a review PR automatically. Nothing to do unless the PR needs eyes.
- Manual: `bun run sync`, `bun run sync -- --discover` (register newly added upstream skills), `bun run sync -- --filter <name>`, preview with `--dry-run`.

## Before any PR

```bash
bun run validate
bun test
bun run typecheck
```

PRs follow `.github/pull_request_template.md`. Bugs/features go through `.github/ISSUE_TEMPLATE/`. Notable changes get a `CHANGELOG.md` entry under `## [Unreleased]`.

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| `INGEST SUMMARY` shows errors | Read error verbatim; usually bad URL shape or unreachable upstream. Never hand-copy files. |
| Name collision | Expected — engine suffixes. Never rename existing skills to force a name. |
| `Invalid category` | Use one of the seven manifest categories. |
| Sync failures on one repo | Retried twice automatically; others unaffected. Re-run `bun run sync -- --filter <name>`. |
| Validator name warnings (`agent-handoff`, `code-review-…`) | Known upstream drift. Leave alone. |

## Disk & layout

Local clone is optional. `skills/` is ~6M; bulk lives in `node_modules` and `.agents/worktrees`. To reclaim: delete worktrees (`git worktree list` to check), or drop the clone entirely — runners own ingest, sync, and validation.

## Command cheatsheet

```bash
bun run add <url> [--category X] [--no-sync] [--dry-run]
bun run sync [-- --discover] [-- --filter name] [-- --dry-run]
bun run validate && bun test && bun run typecheck
gh workflow run add-skill.yml -R harshsinghmp/skills -f urls="<link>"
```
