# 📑 Document Taxonomy & Dependency Matrix

A comprehensive reference mapping repository changes to their canonical documentation targets, audiences, and dependency propagation paths.

---

## 1. Documentation Taxonomy Matrix

| Document Category | Common File Patterns | Primary Audience | Change Triggers | Canonical Source of Truth | Ownership & Permission | Drift Risk |
|:---|:---|:---|:---|:---|:---|:---|
| **README** | `README.md`, `README.*.md` | Users, Developers, Evaluators | Project scope, install commands, quickstart, CLI options, prerequisites | Root package manifest, CLI entry points, exported API | `AUTO-UPDATE`: Direct evidence-backed sync | High |
| **CHANGELOG** | `CHANGELOG.md`, `HISTORY.md`, `docs/releases/*` | Users, Maintainers, Consumers | New features, breaking changes, bug fixes, deprecations, security patches | Git diff, PR descriptions, merged commits, release tags | `NORMAL UPDATE`: Append under `## [Unreleased]` | High |
| **ARCHITECTURE** | `ARCHITECTURE.md`, `docs/architecture/*`, `docs/topology.md` | Core Developers, Maintainers | Boundary shifts, data flow changes, new subsystems, ORM/DB changes | Directory layout, route topology, component definitions | `REVIEW REQUIRED`: Module boundaries only | Critical |
| **ADR (Decisions)** | `docs/adr/*.md`, `adr/*.md`, `decisions.md` | Maintainers, Future Architects | High-tradeoff technical decisions, technology choices, deprecation rationale | Architecture reviews, consensus RFCs, commit history | `HISTORICAL`: Do not edit past records; add new ADRs | High |
| **API Documentation** | `docs/api/*.md`, `openapi.yaml`, `swagger.json`, `docs/routes.md` | API Consumers, Integration Engineers | Endpoint paths, parameters, request/response schemas, auth rules | OpenAPI schemas, route controllers, Zod/Pydantic types | `AUTO-UPDATE`: Spec over prose | Critical |
| **CONTRIBUTING** | `CONTRIBUTING.md`, `docs/contributing.md`, `.github/CONTRIBUTING.md` | External & Internal Contributors | Dev setup, lint/test commands, PR requirements, commit message rules | Root scripts in `package.json`/`Makefile`, CI workflows | `NORMAL UPDATE`: Toolchain synchronization | Medium |
| **SECURITY** | `SECURITY.md`, `docs/security.md`, `.github/SECURITY.md` | Security Researchers, Users, Auditors | Vulnerability reporting channels, encryption standards, auth requirements | Security policies, key rotation mechanisms, auth middleware | `REVIEW REQUIRED`: Private reporting preserved | Critical |
| **LICENSE** | `LICENSE`, `LICENSE.md`, `COPYING`, `NOTICE` | Legal, Users, Package Consumers | Explicit legal re-licensing requests (never edit automatically) | Authoritative license grant from repository owner | `DO NOT TOUCH`: Never modify automatically | Critical |
| **CODE OF CONDUCT** | `CODE_OF_CONDUCT.md`, `.github/CODE_OF_CONDUCT.md` | Community Contributors | Community policy changes, reporting emails | Official Contributor Covenant baseline | `REVIEW REQUIRED`: Human-curated | Low |
| **ROADMAP / STATUS** | `ROADMAP.md`, `docs/roadmap.md`, `STATUS.md`, `STATE.md` | Stakeholders, Project Managers | Milestone completion, sprint closeout, priority shifts | Verified test receipts, issue tracker, release milestones | `REVIEW REQUIRED`: Milestone tracking | Medium |
| **SESSION LOG** | `SESSION_LOG.md`, `docs/sessions/*`, `SUMMARY.md` | Active Agents, Developers | Task handoffs, daily sprint logs, rolling workstream notes | Working tree diffs, active branch changes | `NORMAL UPDATE` (conditional): append verified entries only when the project explicitly maintains a change ledger; otherwise leave untouched | Medium |
| **MEMORY** | `.memory/*` | Automatic System State | Real-time agent memory, active constraints | `musememory` system | `DO NOT TOUCH`: Owned exclusively by musememory | Critical |
| **AGENT WORKING ARTIFACTS** | `.agents/artifacts/*` | Active Agents, Sessions | Research runs, planning docs, generated reports (dated or fixed-name per owning skill) | Owning session; findings promote to `.agents/context/` via `updateagents` | `DO NOT TOUCH`: Session-owned working state — not documentation; never synced, never committed | Low |
| **DOX / AGENT ARCHITECTURE** | `.agents/*` | DOX Operational Infrastructure | Progressive disclosure standards, brand tokens, context rails | DOX engine & architecture | `EXPLICIT PERMISSION REQUIRED`: Read governance first; NEVER modify without explicit user permission | Critical |
| **ACTIVE AGENT CONTEXT** | `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md`, Cursor rules | Autonomous AI Agents | Invariants, essential commands, code conventions, boundaries | Live repository tooling, execution kernel, security rules | `GOVERNED`: Impact analysis; normally hand off to `updateagents` | Critical |
| **RUNBOOKS / OPS** | `docs/runbooks/*`, `docs/ops/*`, `RUNBOOK.md` | Site Reliability Engineers, Operators | Deployment steps, rollback procedures, incident recovery, scaling rules | Infra configs, Terraform, Kubernetes manifests, CI scripts | `REVIEW REQUIRED`: SRE verified | Critical |
| **ONBOARDING** | `docs/onboarding.md`, `docs/getting-started.md` | New Team Members | Environment prerequisites, required accounts, seed data, local setup | Local setup scripts, `.env.example`, Docker Compose | `NORMAL UPDATE`: Verified setup steps | Medium |
| **MIGRATION / UPGRADING** | `MIGRATING.md`, `UPGRADING.md`, `docs/migrations/*` | Upgrading Consumers, DB Admins | Breaking API changes, database schema migrations, config renames | Database migration files, schema diffs, deprecated APIs | `REVIEW REQUIRED`: Breaking change impact | High |
| **COMPATIBILITY** | `COMPATIBILITY.md`, `docs/compatibility.md` | Platform Engineers, End Users | Supported Node/Python/OS versions, browser support matrices | `package.json` engines, CI test matrix, runtime configs | `NORMAL UPDATE`: Platform alignment | Medium |
| **CI/CD & DEPLOYMENT** | `docs/ci-cd.md`, `docs/deployment.md`, `DEPLOYMENT.md` | DevOps, Release Engineers | Build pipelines, deployment targets, env variable changes | `.github/workflows/*`, Dockerfile, Cloudflare/Vercel configs | `NORMAL UPDATE`: Pipeline synchronization | High |
| **CONFIGURATION** | `docs/configuration.md`, `docs/env.md`, `.env.example` | Developers, Operators | Added/removed env vars, config file formats (`.toml`, `.json`) | Configuration loader source code, validation schemas | `AUTO-UPDATE`: Zero secret leakage | Critical |

---

## 2. Documentation Dependency Propagation Graph

Changes in codebase primitives ripple across multiple documentation tiers. Use this propagation map to identify second-order documentation debt:

```
[Package Manager / Node / Runtime Version Change]
   │
   ├──► README.md (Prerequisites & Installation commands)
   ├──► CONTRIBUTING.md (Local setup & test commands)
   ├──► AGENTS.md / AI Context (Runtime commands & toolchain invariants)
   ├──► COMPATIBILITY.md (Supported runtime engine matrix)
   └──► CI/CD Documentation (Runner image & setup steps)

[Public API / Endpoint / Schema Change]
   │
   ├──► OpenAPI Spec / API Reference (Endpoint, params, responses, error codes)
   ├──► CHANGELOG.md (Added / Changed / Deprecated / Removed section)
   ├──► README.md (Quickstart snippet / API usage examples)
   ├──► ARCHITECTURE.md (Component data flow & route boundaries)
   └──► MIGRATING.md (Upgrade guidance for consumers)

[Environment Variable / Secret Config Change]
   │
   ├──► .env.example (Variable name & dummy placeholder)
   ├──► docs/configuration.md (Explanation, default value, validation)
   ├──► DEPLOYMENT.md (Production env requirements & secret setup)
   └──► AGENTS.md / Security Policy (Secret handling & forbidden leakage)

[Database Schema / ORM Model Change]
   │
   ├──► docs/database.md / ARCHITECTURE.md (Data models, relations, storage topology)
   ├──► docs/migrations.md (Migration rehearsal & rollback steps)
   └──► CHANGELOG.md (Changed / Added data storage capabilities)

[Security / Auth Protocol Change]
   │
   ├──► SECURITY.md (Security boundary, reporting channel, token specs)
   ├──► API Documentation (Auth header format, permission scopes)
   └──► AGENTS.md (security boundary & testing guardrails)
```

---

## 3. Audience Impact Classification

When auditing documentation changes, evaluate requirements based on the affected target audience:

1. **End Users / Consumers**: Focus on external behavior, installation, public APIs, breaking changes, and migration guides. Prose must be simple, clear, and backwards-compatibility oriented.
2. **Internal Developers**: Focus on code structure, test commands, typing rules, linting, and local environment setup.
3. **Operators / SREs**: Focus on environment variables, ports, healthcheck routes, Docker builds, rollback scripts, and log outputs.
4. **AI Agents**: Focus on concise, deterministic invariants, command whitelist, path rules, forbidden modifications, and architecture routing rails.
