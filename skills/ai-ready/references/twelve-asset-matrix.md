# 📋 The 13-Asset AI-Readiness Matrix

This reference documents the 13 tracked assets required for a repository to achieve **🏆 AI-Ready** status.

---

## 1. 🤖 AI Context Assets

### Asset 1: Root Agent Router (`AGENTS.md`)
- **Location**: Repository root (`./AGENTS.md`)
- **Criteria**:
  - Strictly `<50 lines`.
  - Serves as a progressive disclosure routing table, not a monolithic rule dump.
  - Links to deeper standards in `.agents/standards/` and context in `.agents/context/`.
  - Defines the core operating identity, toolchain default, and turn invariants.

### Asset 2: Progressive Disclosure Tree (`.agents/`)
- **Location**: `./.agents/`
- **Criteria**:
  - Contains the canonical 9-folder architecture:
    1. `standards/` — Language, framework, testing, git, and security rules.
    2. `context/` — Product scope, architecture, decisions, and current state.
    3. `brand/` — Design tokens, component states, and accessibility guides.
    4. `workflows/` — Automated multi-agent playbooks.
    5. `skills/` — Project-scoped agent skills.
    6. `goals/` — Sprints, milestones, and roadmaps.
    7. `research/` — Technical investigations, benchmarks, and spikes.
    8. `artifacts/` — Generated deliverables, schemas, and diagrams.
    9. `artifacts/` — Research corpora, planning docs, and generated reports (working state, local-only, with a README contract stub; durable findings are promoted to `context/`).
    10. `archive/` — Completed work, retired plans, and historical logs.

### Asset 3: Tool & MCP Configuration (`.mcp.json` or agent tool config)
- **Location**: `./.mcp.json` or any of `.claude/`, `.cursor/`, `.gemini/`
- **Criteria**:
  - Declares authorized Model Context Protocol (MCP) servers or CLI tool permissions.
  - Limits agent blast radius by defining safe environment variables and command scopes.
  - Modern agent tool directories (`.claude/`, `.cursor/`) satisfy the asset equally; the auditor accepts the breadth rather than a single vendor path.

### Asset 4: Machine-Readable Discovery Index (`llms.txt`)
- **Location**: Repository root (`./llms.txt`)
- **Criteria**:
  - Concise markdown index following the `llms.txt` proposal.
  - Summarizes the project's purpose, key architecture concepts, and direct links to documentation.
  - Enables external agent web crawlers, search engines, and citation indexers to ingest the project efficiently.

---

## 2. 🔧 Dev Workflow Assets

### Asset 5: Continuous Integration Pipeline (`.github/workflows/ci.yml`)
- **Location**: `.github/workflows/ci.yml`
- **Criteria**:
  - Triggers on pull requests and pushes to `main`/`dev`.
  - Executes linting, type checks (`tsc --noEmit`), and automated test suite.
  - Fails loudly on regressions before code is merged.

### Asset 6: Structured Issue Templates (`.github/ISSUE_TEMPLATE/`)
- **Location**: `.github/ISSUE_TEMPLATE/`
- **Criteria**:
  - Contains templates for Bug Reports and Feature Requests.
  - Enforces reproducible examples, environment details, expected vs actual behavior, and acceptance criteria.

### Asset 7: Pull Request Review Template (`.github/pull_request_template.md`)
- **Location**: `.github/pull_request_template.md` (or `.github/PULL_REQUEST_TEMPLATE.md`)
- **Criteria**:
  - Includes:
    - **Why**: Rationale and issue reference.
    - **What**: Bulleted breakdown of code changes.
    - **Verification**: Test commands, rendered screenshots, or terminal outputs.
    - **Anti-Slop Checklist**: Zero secrets committed, tests pass locally, docs updated.

### Asset 8: Automated Dependency Maintenance (`.github/dependabot.yml`)
- **Location**: `.github/dependabot.yml`
- **Criteria**:
  - Monitors the repository's package ecosystem (e.g. `npm`, `cargo`, `pip`, `github-actions`).
  - Sets schedule (e.g. weekly) and review limits to prevent vulnerability accumulation.

---

## 3. 📖 Onboarding & Governance Assets

### Asset 13: Working Artifacts Container (`.agents/artifacts/`)
- **Location**: `./.agents/artifacts/` with a `README.md` contract stub
- **Criteria**:
  - Research corpora, planning docs, and generated reports live here under one folder per topic — never in the tracked repo tree, never in `.memory/`.
  - The stub declares the conventions: dated reports, method headers on research, local-only by default, promote-or-perish to `.agents/context/`.
  - Absence of the container or its stub fails the asset; littered research files in the tracked tree are an `audit`-skill finding.

### Asset 9: Changelog (`CHANGELOG.md`)
- **Location**: Repository root (`./CHANGELOG.md`)
- **Criteria**:
  - Follows [Keep a Changelog](https://keepachangelog.com/) standards.
  - Contains an active `## [Unreleased]` section categorized by `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

### Asset 10: Contributing Guidelines (`CONTRIBUTING.md`)
- **Location**: Repository root (`./CONTRIBUTING.md`)
- **Criteria**:
  - Documents branch lifecycle (`master`, `dev`, `feature/*`, `release/*`).
  - Codifies Conventional Commits (`<type>(<scope>): summary`).
  - Outlines local test and verification commands.

### Asset 11: Durable Domain Documentation (`docs/` or `.agents/context/`)
- **Location**: `./docs/` or `./.agents/context/`
- **Criteria**:
  - Contains foundational architecture and domain truth:
    - `product.md` — What the product does and does not do.
    - `architecture.md` — Core data models, components, and integration points.
    - `current.md` — Shipped reality, active sprint, and known limitations.

### Asset 12: Secret Hygiene & Environment Isolation (`.gitignore` + `.env.example`)
- **Location**: `./.gitignore` and `./.env.example`
- **Criteria**:
  - `.gitignore` explicitly blocks `.env`, `.env.*`, `node_modules/`, credentials, and private keys.
  - `.env.example` provides non-sensitive dummy placeholders for every required variable.
