# 🤖 Agent Guidelines — Harsh Singh's Curated Skills Hub (`harshsinghmp/skills`)

> **Repository**: `harshsinghmp/skills`  
> **GitHub User**: `harshsinghmp`  
> **Purpose**: Downstream Hub Aggregating, Standardizing, and Syndicating Agent Skills  
> **Install Command**: `npx skills add harshsinghmp/skills`  

---

## 🏛️ System Architecture Snapshot

This repository maintains a curated downstream collection of 100+ AI Agent Skills synchronized from multiple upstreams (Agency Council, Superpowers, Muse Cognitive Memory, Core Engineering Tooling).

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
│   ├── sync.test.ts
│   └── validator.test.ts
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

## 📋 Invariant Rules for AI Agents

1. **Frontmatter Integrity**: Every skill directory under `skills/<skill-name>/` MUST contain a `SKILL.md` file starting with valid YAML frontmatter:
   ```markdown
   ---
   name: <skill-name>
   description: <Detailed prompt guidance and description>
   ---
   ```
2. **Name Consistency**: The folder name `skills/<skill-name>` MUST match the `name:` declared in its `SKILL.md` frontmatter.
3. **Manifest Synchronization**: New upstreams are registered either by `bun run add <url>` (preferred — auto-discovers skills and registers them) or by editing `skills.manifest.json` directly. Follow up with `bun run sync`.
4. **Never Overwrite Collisions**: When a discovered or ingested skill name collides with an existing entry, the engine suffixes the new name (`-2`, `-3`) or skips — it must never silently replace an existing skill folder.
5. **Validation Gate**: Before committing or opening PRs, always run:
   ```bash
   bun run validate
   bun test
   bun run typecheck
   ```
6. **No Secrets**: Never commit `.env`, credentials, or private access tokens into git.
