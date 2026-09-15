# 📜 Document Class Operational Policies

Detailed standards, invariants, ownership rules, and synchronization boundaries for every specific category of project documentation.

---

## 1. Universal Document Ownership & Permission Framework

Every documentation surface must be classified and treated according to its fundamental ownership model before editing:

| Ownership Class | Definition | Operational Rule for `updatedocs` |
|:---|:---|:---|
| **SOURCE-OF-TRUTH** | Generated or defined directly by implementation, code schemas, manifests, or executable configurations. | Use as the verification oracle; synchronize downstream derived docs to match. |
| **DERIVED** | Summarizes, formats, or aggregates facts from another canonical source of truth. | Safe for automated synchronization when evidence from the source of truth is direct. |
| **HUMAN-CURATED** | Contains high-value human context, architectural rationale, trade-offs, engineering philosophy, or business rules. | Preserve structure and project voice; apply only minimal, surgical corrections. Never perform wholesale rewrites. |
| **PROTECTED** | Architecture infrastructure, operational contracts, or client deliverables (`.agents/*`, client SOPs). | Requires explicit user permission before any modification. Read applicable governance first. |
| **GENERATED** | Output produced by build scripts, documentation compilers (TypeDoc, Sphinx, OpenAPI generators), or automated tools. | Do not patch directly; update the underlying source or generator mechanism and trigger regeneration. |
| **HISTORICAL** | Immutable records of past states (past releases in `CHANGELOG.md`, accepted ADRs, retired plans in `.agents/archive/`). | Must never be rewritten, deleted, or altered merely because it describes an older state. |
| **CLIENT-FACING** | Business process documentation, client handoff deliverables, CMS manuals, SEO guides, or client SOPs. | High-risk; prefer human review and explicit approval before publishing changes. |

---

## 2. README Policy (`README.md`, `README.*.md`)

The README is the front door of the repository. It balances brevity with utility.

### Invariants:
- **Single Source of Entry**: Explains what the project is, why it exists, and how to get started in under 3 minutes.
- **Commands Must Work**: Every command in the README (`npm install`, `bun run dev`, `docker compose up`) must be directly verifiable against codebase manifests.
- **No Stale Flags or Options**: If CLI arguments or API parameters change in code, the README code snippets must be updated synchronously.
- **Link Integrity**: All relative links to `docs/`, `CONTRIBUTING.md`, or `LICENSE` must resolve to existing files.
- **Avoid Duplication**: Do not copy 500-line API references into the README; provide a clear quickstart example and link to canonical API docs.

### When to Update:
- Project vision, positioning, or core value proposition changes.
- Prerequisites, runtime versions, or package manager requirements change.
- Installation or quickstart commands change.
- New major feature or public interface is introduced.
- Default configuration, ports, or environment requirements change.

---

## 3. API Documentation Policy (`docs/api/*`, `openapi.yaml`)

API documentation represents a formal contract with external and internal consumers.

### Invariants:
- **Spec Over Prose**: If machine-readable schemas exist (`openapi.yaml`, Zod/Pydantic schemas, protobufs), derive prose documentation directly from the schema.
- **Complete Contract**: Every endpoint must document:
  1. HTTP Method & Path
  2. Authentication & Authorization requirements
  3. Path, query, and header parameters with data types and defaults
  4. Request body schema with field descriptions
  5. Response schemas for success (`200`/`201`) and all expected error codes (`400`, `401`, `403`, `404`, `422`, `500`)
  6. Concrete, copy-pasteable request & response JSON payloads
- **Deprecation Clarity**: Mark deprecated fields and endpoints with replacement paths and sunset milestones.

---

## 4. Contributing Guidelines Policy (`CONTRIBUTING.md`)

Documents the local workflow for internal developers and open-source contributors.

### Invariants:
- **Toolchain Alignment**: Must accurately state the required package manager (`bun`, `pnpm`, `npm`, `yarn`, `poetry`, `uv`), Node/Python version, and system dependencies.
- **Complete Test & Lint Workflow**: Detail the exact commands required before opening a PR (`bun test`, `npm run lint`, `tsc --noEmit`).
- **Branch & Commit Standards**: Specify branch naming conventions (`feature/*`, `fix/*`, `chore/*`) and commit format rules (Conventional Commits with Why/What/Verification blocks).
- **PR Lifecycle**: Document required checks, code review expectations, and sign-off gates.

---

## 5. License Policy (`LICENSE`, `NOTICE`)

### Strict Invariants:
- **Zero Automatic Modification**: Never edit, change, replace, or re-license a repository's `LICENSE` file automatically during general documentation synchronization.
- **License Consistency Auditing**: Only inspect `package.json` / `pyproject.toml` license field to verify it matches `LICENSE`.
- **Escalate Contradictions**: If a mismatch or ambiguity is found between code headers, package manifests, and `LICENSE`, flag it in the final report as an unverified issue requiring explicit human instruction.

---

## 6. Configuration & Environment Policy (`docs/configuration.md`, `.env.example`)

### Invariants:
- **Zero Raw Secrets**: `.env.example` must contain only variable keys with placeholder strings (`YOUR_API_KEY_HERE`, `http://localhost:5432/mydb`).
- **Comprehensive Variable Inventory**: Every variable referenced via `process.env.*`, `os.environ`, or config loaders must be documented with:
  - Key name
  - Required vs. Optional status
  - Default value if omitted
  - Expected format/type
  - Purpose & system consequence

---

## 7. Migration & Upgrading Policy (`MIGRATING.md`, `UPGRADING.md`)

Targeted at consumers upgrading across breaking versions.

### Invariants:
- **Step-by-Step Upgrade Path**: Provide sequential commands and code before/after diffs for breaking changes.
- **Database & State Migrations**: Detail manual migration steps, backup recommendations, and rollback instructions.
- **Deprecation Mapping**: Clearly map old method/config names to new replacements.

---

## 8. Runbooks & Operational Documentation (`docs/runbooks/*`)

Targeted at operators maintaining live systems.

### Invariants:
- **Actionable & Sequential**: Write imperative steps for triage, scaling, restarting, backup restoration, and disaster recovery.
- **Exact Thresholds & Alerts**: Include metric triggers, alert names, log filter queries, and expected nominal health values.
- **Rollback First**: Every deployment or operational runbook must include verified rollback steps.
