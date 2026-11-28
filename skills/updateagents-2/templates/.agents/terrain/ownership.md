# 🗺️ Terrain Map: Directory Boundaries & Ownership Contracts

> **Purpose**: Pre-indexed boundaries separating public docs, internal agent working state, and protected read-only zones.

---

## 1. Directory Ownership & Boundaries
| Directory | Classification | Owner / Agent Access Contract |
|:---|:---|:---|
| `src/` | Production Code | Feature builders (Sol). Production deliverables only. |
| `tests/` | Test Suites | Verification gate. Must pass 100% green before merge. |
| `docs/` | Public Documentation | Strictly external user documentation (`CHANGELOG.md`, `ARCHITECTURE.md`). |
| `.agents/` | Agent Container | Internal agent governance, standards, brand tokens, and terrain maps. |
| `.agents/artifacts/` | Working State | Ephemeral agent reports, corpora, and audit trails (never in repo root). |
| `.agents/terrain/` | Workspace Terrain | Pre-indexed navigation maps (read-first before filesystem probing). |
| `.memory/` | Cognitive Memory | Sovereign Muse Memory container (managed by memory tools, never edited by hand). |

## 2. Read-Only Protected Zones
- **Core Governance Invariants**: Root `AGENTS.md` and `.agents/standards/` carry binding contracts.
- **Environment Secrets**: `.env` and `.env.local` are strictly read-protected and gitignored.
- **Dependency Trees**: `node_modules/`, `dist/`, `.next/` are build targets—never manually edited.
