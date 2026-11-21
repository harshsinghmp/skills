# 🏗️ refactor:architecture — Software Architecture & Modular Decoupling Playbook

> **Executive Scope**: System-level structural refactoring, module boundary enforcement, breaking circular dependencies, decoupling business logic from frameworks, and establishing clean layer architectures.

---

## 1. Architectural Smells & Anti-Patterns

1. **Circular Dependencies**: Module A imports Module B which imports Module A. Causes initialization order bugs, memory leaks, and impossible bundle splitting.
2. **Framework Leakage**: Framework-specific primitives (e.g. Next.js router, Astro request context, React hooks) leaking into core domain logic.
3. **Shotgun Surgery**: Making a small conceptual change requires editing 10+ different files scattered across the codebase.
4. **Anemic Domain vs. Sprawling Controller**: Controller / Route Handler files containing 500 lines of business logic, database queries, and third-party API calls.

---

## 2. Decoupling Patterns & Architectural Transformations

### Pattern A: Dependency Inversion (Ports & Adapters)
```
[ DOMAIN LOGIC / USE CASE ]  <─── Core pure TypeScript, zero external imports
            │
            ▼ depends on interface
    [ IPaymentGateway ]
            ▲
            │ implemented by adapter
[ StripeAdapter / PayPalAdapter ]  <─── Outer layer (infrastructure/vendor)
```
- **Action**: Domain models and services must NEVER import database clients or third-party SDKs directly. Define interfaces in the domain; implement adapters in the infrastructure layer.

### Pattern B: Breaking Circular Dependencies
- **Strategy 1: Move Shared Types/Logic Down**: Extract the shared interface or type into a dedicated lower-level `types.ts` or `contracts.ts` that both modules import.
- **Strategy 2: Dependency Injection**: Pass the dependency as a constructor argument or function parameter rather than importing the concrete instance.
- **Strategy 3: Event Emitters / Pub-Sub**: Invert the dependency by having Module A emit a domain event, while Module B listens, eliminating the direct import.

### Pattern C: Package / Directory Modernization
Standardize project directory organization to enforce unidirectional dependencies:
```
src/
├── domain/        # Pure entities, value objects, business rules (no external deps)
├── application/   # Use cases, orchestrators, command handlers
├── infrastructure/# Database, third-party API clients, HTTP clients, disk I/O
└── presentation/  # UI components, CLI commands, route handlers, middleware
```
*Rule: Outer layers may import inner layers; inner layers must NEVER import outer layers.*

---

## 3. Verification Gate

- [ ] Dependency graph is acyclic (`madge --circular src/` or similar checks pass).
- [ ] Domain layer imports zero vendor SDKs or UI libraries.
- [ ] Directory layout matches clean unidirectional layer boundaries.
- [ ] Full application build passes cleanly (`bun run build`).
