# 🔒 Durable Architectural Decisions — {{PROJECT_NAME}}

> **Invariant**: Decisions documented here are locked. Do not reopen or refactor without explicit authorization.

---

## Decision Record

### ADR-001: Intent & Framework Architecture
- **Context**: The project required a scalable foundation for {{PROJECT_INTENT}} workloads.
- **Decision**: Adopted **{{FRAMEWORK_DETAILS}}** resolving strictly to `@latest`.
- **Status**: Accepted & Implemented.

### ADR-002: Styling Architecture & Design Tokens
- **Context**: Consistent visual design system with zero runtime overhead and WCAG 2.2 AA compliance.
- **Decision**: Implemented **{{STYLING_DETAILS}}** paired with DTCG tokens in `./.agents/brand/tokens/`.
- **Status**: Accepted & Implemented.

### ADR-003: Progressive Disclosure DOX Container
- **Context**: Monolithic context files overload LLM context windows and cause instructional drift.
- **Decision**: Split rules into lean root `AGENTS.md` (<50 lines) with modular standards in `./.agents/standards/` and context maps in `./.agents/context/`.
- **Status**: Accepted & Implemented.

### ADR-004: Dual-Store Cognitive Memory Separation
- **Context**: Clear separation needed between real-time machine runtime invariants and human-verified shipped documentation.
- **Decision**: Machine-readable constraints live in `./.memory/CURRENT.md`; durable human/agent truth lives in `./.agents/context/current.md`.
- **Status**: Accepted & Implemented.
