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

Rather than cloning full repository histories, the sync engine (`src/sync.ts`) executes **shallow blob-less sparse checkouts**:

```bash
# 1. Initialize shallow blob-less clone for target upstream
git clone --depth 1 --filter=blob:none --sparse "https://github.com/<upstream-repo>.git" "<tmp-dir>" --branch "<branch>"

# 2. Extract ONLY the requested skill directory
git -C "<tmp-dir>" sparse-checkout set "<source-subpath>"

# 3. Synchronize cleanly to downstream ./skills/<skill-name>
cp -r "<tmp-dir>/<source-subpath>/." "skills/<skill-name>/"

# 4. Stamp immutable provenance metadata
git -C "<tmp-dir>" rev-parse HEAD > "skills/<skill-name>/.upstream-meta.json"
```

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
