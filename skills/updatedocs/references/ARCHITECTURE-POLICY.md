# 📐 Architecture Documentation & ADR Policy

Standards for synchronizing system topology, component models, data flows, Architectural Decision Records (ADRs), and DOX architecture boundaries.

---

## 1. When to Update Architecture Documentation

Architecture documents capture the high-level structural blueprint and non-obvious engineering invariants of a system.

### ✅ Update Architecture When:
- **System Boundaries Shift**: New microservices, edge workers, background daemons, or client-server splits.
- **Data Flow & Storage Changes**: Introducing a new database, caching layer (Redis), message queue, or ORM.
- **Auth & Security Topologies**: Changes to session handling, token validation, OAuth/OIDC providers, or CORS boundaries.
- **Technology Stack Migrations**: Upgrading to a new major framework model (e.g. Next.js Pages to App Router, Vite to Astro).
- **Core Design Patterns**: Introduction of CQRS, Event Sourcing, Domain-Driven Design aggregates, or new provider architectures.

### ❌ Do NOT Update Architecture For:
- Routine bug fixes or internal logic refinements inside an existing service.
- Adding a single utility helper function or formatting tweaks.
- Minor UI component style changes that preserve layout hierarchy.
- Adding new unit tests without architectural implications.

---

## 2. Directory Tree & Diagram Synchronization

### Directory Trees
Keep directory trees in `ARCHITECTURE.md` concise and high-signal. Do not dump every file in `src/`; capture the module boundaries:

```
project-root/
├── src/
│   ├── api/          # Route handlers & controller layer
│   ├── domain/       # Business logic & domain models
│   ├── infrastructure/ # Database, external client adapters
│   └── lib/          # Shared utilities & helpers
```

### Mermaid Diagrams
- **Verify Before Updating**: Ensure every node and edge in a Mermaid diagram corresponds to an actual verifiable component and data route.
- **Keep Diagrams Scannable**: Focus on unidirectional data flow and clear boundaries. Quote labels containing special characters.
- **No Speculative Complexities**: Never invent complex architectural layers that do not exist in the code.

---

## 3. Architectural Decision Records (ADR) Policy

ADRs document significant architectural choices, their context, and evaluated trade-offs.

### When an ADR is Required:
1. Choosing between 2+ viable architectural or technological approaches.
2. Introducing a new core framework, ORM, database, or infrastructure provider.
3. Establishing irreversible patterns or major deprecations.
4. Making performance vs. maintainability trade-offs.

### Standard ADR Schema:
```markdown
# [ADR-00X] <Title: Imperative Summary of Decision>

- **Date**: YYYY-MM-DD
- **Status**: PROPOSED | APPROVED | SUPERSEDED | DEPRECATED
- **Context**: What problem are we solving? What constraints exist?
- **Decision**: What did we choose to do?
- **Consequences**:
  - Positive outcomes and capabilities unlocked.
  - Negative trade-offs, constraints, and operational overhead.
```

### Immutability & Supersession Rules:
- **Never Rewrite History**: Once an ADR is marked `APPROVED`, its historical text must not be changed.
- **Superseding an ADR**: When a new decision replaces an older one, create a new ADR (`ADR-005`) and update the old ADR's status:
  `Status: SUPERSEDED by [ADR-005](./adr-005.md)`.
- **No Fabricated Rationale**: If code reveals a decision was made but the rationale cannot be verified from repository evidence, flag it as unverified rather than inventing false justification.

---

## 4. DOX Architecture Protection & System Boundaries

`.agents/` is considered **protected architectural infrastructure**.

Architecture documentation may identify or describe its role, but documentation synchronization does **not** authorize structural changes to `.agents/`.

```text
                    ┌──────────────────────┐
                    │    CODE / CONFIG     │
                    │ SCHEMAS / WORKFLOWS  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     updatedocs       │
                    │                      │
                    │ impact analysis      │
                    │ drift detection      │
                    │ doc synchronization  │
                    │ verification         │
                    └──────┬───────┬───────┘
                           │       │
               ┌───────────┘       └─────────────┐
               ▼                                 ▼
       ┌──────────────┐                  ┌────────────────┐
       │ Normal Docs  │                  │ Agent Context  │
       │ README/API   │                  │ AGENTS/etc.    │
       │ guides/etc.  │                  │                │
       └──────────────┘                  └───────┬────────┘
                                                 │
                                                 ▼
                                          updateagents
                                          (handoff)

                 PROTECTED SYSTEMS
                 ──────────────────

       .agents/  → DOX architecture
                   inspect with AGENTS.md governance
                   explicit permission before modification

       .memory/  → musememory
                   updatedocs NEVER touches
```

### Protocol for `.agents/`:
Changes to `.agents/` require:
1. `AGENTS.md` governance review
2. Concrete impact analysis
3. Explicit user permission
4. Appropriate agent/architecture workflow (e.g. `new-project` or `updateagents`)
