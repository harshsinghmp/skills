# 🏛️ Skills Hub — Architecture & Syndication Specification

> **Repository**: `harshsinghmp/skills`  
> **Purpose**: Autonomous Downstream Agent Skills Hub with Automated Multi-Upstream Ingestion  
> **Registry Protocol**: Compatible with `npx skills add` and MCP agent ecosystems  

---

## 🌐 The Multi-Upstream Syndication Problem

In modern AI agent ecosystems, skills are authored across dozens of specialized upstream repositories (agency divisions, core workflows, cognitive memory systems, community tooling). 

Managing them across workstations leads to three major problems:
1. **Submodule Friction**: Traditional Git submodules pull entire commit histories, break on subfolders, and suffer from pointer drift.
2. **Provenance Blindness**: Ingesting raw code loses track of which upstream commit or release authored the prompt.
3. **Distribution Fragmentation**: Developers must remember dozens of separate GitHub URLs to install individual skills.

---

## 🧩 The Downstream Hub Solution

`harshsinghmp/skills` acts as a **central downstream clearinghouse**. It aggregates, standardizes, validates, and re-exports curated skills from multiple upstreams into a single unified directory (`skills/*`) compatible with `npx skills add`.

```
┌─────────────────────────────────────────────────────────────┐
│                    Upstream Repositories                    │
│  • harshsinghmp/muse-agents  (Agency Divisions: Sol/Nexus) │
│  • obra/superpowers          (TDD, Debugging, Plans)        │
│  • harshsinghmp/musememory   (Cognitive Memory Skills)      │
│  • harshsinghmp/muse-skills   (Developer Utilities)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ GitHub Actions / Sync Engine
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             harshsinghmp/skills (Downstream Hub)            │
│                                                             │
│  ├── skills.manifest.json    # Declarative source mappings  │
│  ├── scripts/sync-skills.ts  # Shallow sparse-checkout sync │
│  ├── scripts/validate-skills # Frontmatter validation       │
│  └── skills/                 # 100+ standardized skills     │
│      ├── brand-guardian/SKILL.md                            │
│      ├── systematic-debugging/SKILL.md                      │
│      └── muse-ground/SKILL.md                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ `npx skills add harshsinghmp/skills`
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                End-User Workstations & Agents               │
│  • Local Workspaces (`<project>/.agents/skills/*`)          │
│  • Global User Agents (`~/.agents/skills/*`)                │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Shallow Sparse-Checkout Sync Mechanics

The sync engine (`src/sync.ts`) groups manifest entries **per upstream repo** and clones each repo **once** (not once per skill), then performs a **shallow blob-less sparse checkout**:

```bash
# 1. Initialize shallow blob-less clone for the target upstream
git clone --depth 1 --filter=blob:none --sparse "https://github.com/<upstream-repo>.git" "<tmp-dir>" --branch "<branch>"

# 2. Fetch ONLY the requested skill directories (one sparse-checkout add per path)
git -C "<tmp-dir>" sparse-checkout add "<source-subpath>"

# 3. Diff skill content against the local copy; skip if byte-identical
#    (ignores .upstream-meta.json so timestamps don't cause churn)

# 4. Clean-replace the target (removes files deleted upstream) and stamp provenance
git -C "<tmp-dir>" rev-parse HEAD > "skills/<skill-name>/.upstream-meta.json"
```

Reliability features:
- **Concurrency**: multiple upstream repos sync in parallel (default 4 workers).
- **Retries**: each upstream gets 2 attempts before its skills are marked failed (one bad repo never blocks the rest).
- **Branch fallback**: unspecified branches resolve via the GitHub API default branch.
- **Non-GitHub hosts**: fall back to pure git clone (no API).

## 🔍 Continuous Upstream Discovery (`--discover`)

Aggregation is not limited to what the manifest already lists. The `--discover` flag (used by the nightly workflow) re-scans **every upstream repo referenced by any manifest entry** and registers skills that appeared upstream after the initial ingest:

1. Lists each repo's full tree via the GitHub API (`git/trees/<branch>?recursive=1`), falling back to a shallow clone for other hosts or API failures.
2. Finds every directory containing a `SKILL.md` (excluding `node_modules`, `.git`, build dirs).
3. Registers unseen skills under a deduplicated name (collisions get a `-2`, `-3` suffix instead of overwriting).
4. Auto-categorizes via keyword heuristics; descriptions are backfilled from the synced `SKILL.md` frontmatter.

The same engine backs the **link-based ingest CLI** (`bun run add <url>`), which resolves GitHub tree/blob/raw URLs, bare `owner/repo` shorthands, and arbitrary git-host URLs (`src/resolve.ts`, `src/ingest.ts`). Release/archive URLs are rejected; single-skill name collisions suffix (`-2`, `-3`) exactly like whole-repo ingest.

---

## 📜 Provenance Metadata Contract (`.upstream-meta.json`)

Every synchronized skill includes an immutable provenance stamp:

```json
{
  "upstream": "https://github.com/harshsinghmp/muse-agents",
  "branch": "main",
  "sourcePath": "skills/engineering-backend-architect",
  "syncedSha": "a1b2c3d4e5f6789012345678901234567890abcd",
  "syncedAt": "2026-08-31T17:58:00.000Z"
}
```

This guarantees complete traceability and ensures downstream customizations can be audited against upstream diffs.
