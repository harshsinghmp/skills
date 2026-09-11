# 🤖 Agent Guidelines — Harsh Singh's Curated Skills Hub (`harshsinghmp/skills`)

> **Repository**: `harshsinghmp/skills`  
> **GitHub User**: `harshsinghmp`  
> **Purpose**: Downstream Hub Aggregating, Standardizing, and Syndicating Agent Skills  
> **Install Command**: `npx skills add harshsinghmp/skills`  

---

## 🏛️ System Architecture Snapshot

Downstream hub: 170+ AI Agent Skills synced from multiple upstreams (Superpowers, Muse Memory, Muse Skills, community tooling).

```
skills/
├── skills/                     # Canonical skill folders containing SKILL.md
├── src/                        # TypeScript sync engine, manifest loader & validator
│   ├── index.ts
│   ├── manifest.ts
│   ├── resolve.ts              # URL resolver (GitHub tree/blob/raw, shorthand, generic git)
│   ├── discover.ts             # Upstream skill discovery (GitHub API or git clone)
│   ├── ingest.ts               # Link-based registration (bun run add <url>)
│   ├── sync.ts                 # Repo-grouped sparse sync + --discover
│   ├── types.ts
│   └── validator.ts
├── scripts/                    # CLI execution runners
│   ├── sync-skills.ts
│   ├── add-skills.ts
│   └── validate-skills.ts
├── tests/                      # Unit & integration tests
│   ├── manifest.test.ts
│   ├── resolve.test.ts
│   ├── sync.test.ts
│   ├── validator.test.ts
│   └── link-ingest.test.ts
├── docs/                       # Architectural documentation
│   └── ARCHITECTURE.md
├── .github/workflows/          # CI and automated upstream sync
│   ├── ci.yml
│   └── sync-skills.yml
├── skills.manifest.json        # Single source of truth for upstream sources
├── package.json
└── README.md
```

---

## 🔗 Link-Only Ingest Protocol (zero-context sessions)

Fresh session + skill link only → do exactly this:

```bash
bun install                                  # first time only (node_modules missing)
bun run add <link>                           # register + auto-sync
bun run validate                             # must pass before commit/PR
```

| Link shape | Behavior |
| :--- | :--- |
| `https://github.com/owner/repo` or `owner/repo` | Discover + ingest **all** skills in repo |
| `.../tree/<branch>/<path>` or `owner/repo/<path>` | Ingest that one skill |
| `.../blob/<branch>/<path>/SKILL.md` | Normalized to skill dir, ingested |
| `https://raw.githubusercontent.com/...` | Ingest that one skill |
| Any other git host URL | Clone + scan via pure git protocol |

Protocol rules:

1. Paste link as-is. Never hand-create `skills/<name>/` or hand-edit manifest — `bun run add` owns registration.
2. Read `INGEST SUMMARY`. Errors → report link + error verbatim, stop. Never copy files manually.
3. Same path re-added → `Skipped`. Name taken → suffixed `-2`, `-3`. Never rename/delete existing skill.
4. Auto-sync default. `--no-sync` only for batches, then `bun run sync` before validate.
5. `--category` fixed set only (`engineering|creative|delivery|governance|cognitive|marketing|general`).
6. `--dry-run` previews. Release/archive URLs rejected — resend as root or tree/blob link.
7. Placeholder `Skill synced from …` normal before sync; descriptions backfill after.

---

## 📋 Invariant Rules for AI Agents

1. **Frontmatter Integrity**: Every skill directory under `skills/<skill-name>/` MUST contain a `SKILL.md` file starting with valid YAML frontmatter:
   ```markdown
   ---
   name: <skill-name>
   description: <Detailed prompt guidance and description>
   ---
   ```
   Missing `name:` or `description:` = validation **error**. Description under 15 chars = **warning**.
2. **Name Consistency**: Folder `skills/<skill-name>` SHOULD match `name:` in its `SKILL.md`. Mismatch = **warning** (upstream names drift). Known: `agent-handoff`→`handoff`, `code-review-linus-torvalds-style`→`code-review`. Never edit synced upstream `SKILL.md`.
3. **Manifest Synchronization**: `skills.manifest.json` is the single committed source of truth. Canonical: `bun run add <url>` (discovers, registers, syncs). Manual manifest edits allowed; `bun run sync` must follow.
4. **Never Overwrite Collisions**: All ingest paths suffix taken names (`-2`, `-3`); same upstream path re-added skips. Never silently replace a skill folder.
5. **Provenance**: `skills/*/.upstream-meta.json` = local gitignored cache. `skills.manifest.json` = committed truth. Never commit meta, never delete manifest links.
6. **Validation Gate**: Before committing or opening PRs, always run:
   ```bash
   bun run validate
   bun test
   bun run typecheck
   ```
7. **PR & Issue Hygiene**: PRs follow `.github/pull_request_template.md`. Bugs/features use `.github/ISSUE_TEMPLATE/`. Notable changes get a `CHANGELOG.md` entry under `## [Unreleased]`.
8. **No Secrets**: Never commit `.env`, credentials, or private access tokens into git.
