# 📚 `updatedocs` Skill

> Project-Wide Documentation Synchronization, Drift Detection & Governance Engine.

`updatedocs` is a change-driven, evidence-backed documentation synchronization, impact-analysis, drift-detection, and documentation-quality skill. It keeps repository documentation aligned with actual code, configuration, schemas, APIs, and workflows without unnecessary churn.

---

## ⚡ Key Architectural Features

- **🛡️ Strict `.memory/` Boundary**: Zero read, write, or modification of `.memory/` (owned exclusively by `musememory`).
- **🗂️ Working-Artifacts Boundary**: `.agents/artifacts/` is session-owned research/planning working state — never synced as documentation, never committed; durable findings are promoted to `.agents/context/` via `updateagents`.
- **🔐 Protected `.agents/` DOX Gate**: Treats `.agents/` as protected operational infrastructure; requires explicit human permission before any mutation.
- **🔍 20-Step Synchronization Pipeline**: Traces code changes through direct and second-order documentation consequences, gated by operating mode (Quick, Change, Release, Sprint, Full).
- **⚖️ Automatic Change Safety Matrix**: Classifies docs by ownership (`SOURCE-OF-TRUTH`, `DERIVED`, `PROTECTED`, `HISTORICAL`, `CLIENT-FACING`) with least-privileged actions.
- **📊 Mode-Scaled Reporting**: Full governance report for Change/Release/Sprint/Full modes; condensed report for Quick mode.
- **💡 Worked Examples**: Sample full and condensed reports in [`examples/`](examples/sample-sync-report.md).
- **✅ 14-Point Pre-Ship Audit**: Rigorous quality checklist covering internal links, commands, schemas, secret scrubbing, and prompt-injection defense.
- **🤝 Clean Companion Handoff**: Coordinates smoothly with `updateagents` for agent-context refactoring and `musememory` for cognitive state.

---

## 💻 When to Use

- User asks to *"update docs"*, *"sync documentation"*, *"refresh README"*, *"update changelog"*, or *"audit documentation"*.
- After completing a new feature, API route, database migration, or configuration change.
- Before merging a pull request or cutting a versioned release.
- When performing a sprint closeout or periodic documentation health audit.

---

## 💡 Example Reports

- [Sample Synchronization Reports](examples/sample-sync-report.md) — full (Change mode) and condensed (Quick mode) report examples.

## 📚 Reference Guides

- [Document Taxonomy & Dependency Matrix](references/DOCUMENT-MATRIX.md)
- [Document Class Operational Policies](references/DOCUMENT-POLICIES.md)
- [14-Point Audit & Verification Checklist](references/AUDIT-CHECKLIST.md)
- [Changelog & Versioning Policy](references/CHANGELOG-POLICY.md)
- [Architecture & ADR Policy](references/ARCHITECTURE-POLICY.md)
- [Agent Context & Instruction Policy](references/AGENT-CONTEXT-POLICY.md)
- [Memory & Project State Policy](references/MEMORY-POLICY.md)
- [Security, Privacy & Secret Isolation Protocol](references/SECURITY.md)
