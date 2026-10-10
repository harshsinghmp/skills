# fullstack — Fullstack: full features data-to-UI with Three-Perspective Security Architecture (fullstack-guardian) and verification gate.

Consolidates all fullstack-guardian capabilities directly into the webdev department.

## Intake

- Feature spec and acceptance criteria
- Data model impact and database migrations
- UI expectations (spec, wireframe, or component contract)
- Rollout constraints (feature flag, canary, progressive rollout)
- Requirement anchor: who uses this, ≤5 core stories, actual (not projected) scale, maintaining team size — if unanswerable, that is itself a finding.

## Deliverable

A hardened, working end-to-end feature:
1. **Three-Perspective Architecture (Frontend, Backend, Security)** addressed simultaneously.
2. **Data Layer**: Schema, migrations, and parameterized queries with defense-in-depth security.
3. **API & Contract Layer**: Type-safe shared endpoints (tRPC, Zod, OpenAPI) with server-side authentication and scoped response projections.
4. **UI Layer**: Accessible components with loading/empty/error/success state matrices.
5. **Verification Proof**: Unit, integration, and critical-path tests passing; PR-ready minimal diff.

## Procedure

### 1. The Three-Perspective Architecture Checkpoint (Fullstack Guardian)
Before writing implementation code, evaluate every feature through all three lenses:
- **[Backend Perspective]**:
  - Authorize every request on the server via session/token validation (`require_auth`). Never trust client-sent user IDs or role headers.
  - Parameterize all SQL/ORM queries: zero raw string concatenation or interpolation.
  - Scope responses strictly: define explicit DTO schemas (e.g. `UserResponse`) that exclude sensitive fields (`password_hash`, `stripe_customer_id`, internal keys).
- **[Frontend Perspective]**:
  - Implement the complete state matrix: every screen × (loading / empty / error / success / partial).
  - Client-side input guards: validate form inputs before submission to provide immediate UI feedback (never as the security gate).
  - Error boundaries: handle network drops, 401 unauthenticated redirects, and 403 forbidden alerts without breaking the entire viewport.
- **[Security Perspective]**:
  - Strict input validation on the server using schema validators (Zod, Valibot, Pydantic).
  - Output encoding to prevent cross-site scripting (XSS).
  - CSRF protection for cookie-based stateful sessions; CORS restricted to explicit origin whitelists.
  - Rate limiting on public or expensive mutation endpoints.

### 2. End-to-End Type Sharing & Contracts
- Single source of truth for types: share Zod schemas or TypeScript types between frontend and backend via monorepo packages, tRPC routers, or generated OpenAPI clients.
- If the backend schema changes, the frontend build must fail at compile time, not in production.

### 3. Build in Vertical Slices
1. Split the feature into data → API → UI slices; build and verify in that exact sequence.
2. Apply the deletion test: if an abstraction or wrapper has only one implementation and nobody notices its removal, ship it deleted.
3. Write acceptance criteria as tests (unit tests for business logic, integration tests for API endpoints, component tests for critical UI states).
4. Run the full project verification gate (`test`, `lint`, `type-check`, `build`).
5. Route the finished diff through `code-review`.

## Quality gate

- [ ] Three-Perspective Architecture (Frontend, Backend, Security) verified before code merge.
- [ ] Server-side authentication and tenant-level authorization enforced on every route.
- [ ] 100% parameterized queries (zero raw SQL string interpolation).
- [ ] Response DTOs explicitly exclude sensitive internal fields and credentials.
- [ ] Shared type contracts validated across client and server boundaries.
- [ ] State matrix complete (loading, empty, error, success).
- [ ] Acceptance criteria exist as automated tests; verification gate green.
- [ ] `code-review` run on the final diff.

## Sources

- OWASP Top 10 Web Application Security Risks & Defense-in-Depth Principles.
- Fullstack Guardian Three-Perspective Architecture (Frontend / Backend / Security).
- Addy Osmani & Martin Fowler Vertical Slice Architecture & Deletion Test.
