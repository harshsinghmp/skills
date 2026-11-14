# spec — Build-ready spec: problem/solution/stories/seams-first, legacy reverse-engineering (spec-miner), and EARS syntax.

Consolidates all spec-miner reverse-engineering capabilities directly into the webdev department.

No code. Produces the packet `implement` consumes. Every phase ends at a human gate — no silent progression.

## Intake

- Problem statement (who hurts, what breaks, why now) OR legacy codebase target to reverse-engineer
- Solution sketch and non-goals (explicit Out-of-scope line)
- ≤5 user stories with acceptance criteria OR undocumented system boundaries
- External claims grounded: reference URLs fetched and cited, not asserted
- Requirement anchor: actual (not projected) scale, maintaining team size — if unanswerable, that is itself a finding

## Deliverable

A comprehensive spec packet:
1. **New Features**: Problem / Solution / User stories / Seams-first module split / Assumptions / Ready-for-agent label.
2. **Legacy Codebases (Spec-Miner)**: Reverse-engineered specification (`specs/{project_name}_reverse_spec.md`) mapping architecture, entry points, undocumented business rules, and EARS-formatted requirements.

## Procedure

### Track A: Forward Specification (New Features & Scopes)
1. Write Problem first, one paragraph. If it needs two, the scope is two specs — split.
2. Write Solution + non-goals. Every non-goal is a scope rejection with a reason.
3. Write user stories (≤5), each with acceptance criteria testable later.
4. Split seams-first: name modules, interfaces, and seams using the deep-module vocabulary (Module / Interface / Seam / Adapter) — exact terms, no synonyms. One adapter hypothetical is enough; two real callers earn the abstraction.
5. Surface the Assumptions block: load, team capability, direction, unknowns. Unwritten assumptions are the spec's biggest defect — write them before the plan.
6. Apply the ready-for-agent label only when: stories are testable, seams are named, assumptions are written, external claims carry citations.
7. Human gate per phase: Problem → Solution → Stories → Seams → Label. Each gate needs an explicit yes.

---

### Track B: Reverse-Engineering & Code Archaeology (Spec-Miner)
When working with legacy, undocumented systems or inherited codebases:
1. **Operate with Dual Hats**:
   - **Arch Hat**: Focus on system architecture, data models, router definitions, and module boundaries.
   - **QA Hat**: Focus on observable runtime behaviors, edge cases, error codes, and validation rules.
2. **Execute Exploration Discovery Patterns**:
   ```bash
   # 1. Discover entry points and public interfaces (exclude vendor/build noise)
   fd -e ts -e tsx -e py -e go --exclude node_modules --exclude dist --exclude tests

   # 2. Extract configuration, feature flags, and environment variables
   rg -n 'process\.env|os\.environ|config\[|settings\.'

   # 3. Locate technical debt and undocumented hacks
   rg -n 'TODO|FIXME|HACK|XXX|WORKAROUND'

   # 4. Map API route definitions and endpoint handlers
   rg -n '@router|app\.(get|post|put|delete)|route\.ts'
   ```
3. **Trace Data & Request Flows**: Follow the request from HTTP entry point through middleware, controller/handler, service layer, and database query.
4. **Format Requirements in EARS Syntax**:
   Translate all reverse-engineered logic into EARS (Easy Approach to Requirements Syntax):
   | EARS Type | Pattern | Example |
   | :--- | :--- | :--- |
   | **Ubiquitous** | The `<system>` shall `<action>`. | The API shall return JSON responses with standard error envelopes. |
   | **Event-driven** | When `<trigger>`, the `<system>` shall `<action>`. | When a request lacks an Authorization header, the system shall return HTTP 401. |
   | **State-driven** | While `<state>`, the `<system>` shall `<action>`. | While a tenant is suspended, the system shall reject all write operations. |
   | **Optional** | Where `<feature>` is supported, the `<system>` shall `<action>`. | Where MFA is enabled, the system shall require a TOTP token before issuing JWTs. |
5. **Output Specification**: Save the reverse-engineered document to `specs/{project_name}_reverse_spec.md`.

## Quality gate

- [ ] Problem fits one paragraph; non-goals listed with reasons.
- [ ] ≤5 stories, each with testable acceptance criteria (or EARS syntax for legacy codebases).
- [ ] Exploration patterns grounded in real codebase evidence (file paths and line numbers cited).
- [ ] Seams named in deep-module terms; deletion test applied to every abstraction.
- [ ] Assumptions block written; external claims cited to fetched sources.
- [ ] Ready-for-agent label earned, or missing items named.
- [ ] Human gate passed at each phase.

## Routing

- Needs a technical unknown answered first → `prototype` (LOGIC), then return here.
- Spec consumed by → `implement` (vertical tracer slices, one story at a time).
- Done work ships through → `qa-launch` gate.
- Visual questions belong to → `design` prototype (sibling lane); reference it, never duplicate it here.

## Sources

- pocock to-spec (Problem/Solution/stories/seams-first/ready-for-agent label; lane-d-abubakar.md:31).
- addyosmani spec-driven assumptions-first + human gate per phase.
- Spec-Miner EARS Requirements Extraction & Code Archaeology Protocol (Alistair Mavin EARS Standards).
