# backend — Backend: APIs, schemas, auth, and integrations with the project's stack.

## Intake

- API consumers and their needs (who calls this?)
- Data model and access patterns
- Auth/permission model (who may do what)
- Existing backend conventions in the repo

## Deliverable

Working API endpoints / schema changes with validation at boundaries, auth enforcement, error contracts, and tests exercising the real paths.

## Procedure

1. Model the data first: schema, constraints (DB-level, not just app-level), indexes for the real query patterns. Start with the simplest store that works; upgrade only on measured triggers (e.g. >10 concurrent writers, >100GB data, or genuine PostGIS/full-text need) — never on projected scale.
2. Design the API shape: resources, verbs, status codes; validate ALL input at the boundary.
3. AuthZ: check permission at the resource level, not just the route level.
4. Write the happy path, then the failure paths (validation, not-found, forbidden, conflict).
5. Tests against the real DB/emulator where feasible — not only mocks.
6. Run the verification gate; document the endpoint contract (request/response shapes).

## Quality gate

- [ ] Input validated at the boundary (schema or equivalent).
- [ ] DB constraints back the app-level rules.
- [ ] AuthZ enforced per resource, not per route.
- [ ] Failure paths return proper status codes and safe errors (no internals leaked) — worded for non-technical callers (what happened, why, what to do).
- [ ] Tests exercise real paths.

## Routing

- Python path (uv default-stack): `uv init/add/sync/lock/run`, `uv python pin/install`, venv-per-project, `uv run` with no manual activate; Docker layer-cache friendly. Dist via src-layout (`src/` + `[tool.setuptools.packages.find] where=["src"]`), PEP 517/518/621/660, backend choice (setuptools/hatchling/flit); TestPyPI before PyPI. Source: `wshobson/agents` (`uv-package-manager`, `python-packaging`).
- Async gate + pitfalls: stay fully sync-or-async per call path (sync-vs-async table: asyncio vs multiprocessing vs `to_thread`); `gather(return_exceptions=True)` + filter, `wait_for` timeout, never `time.sleep` in loop, re-raise CancelledError. Source: `wshobson/agents` (`async-python-patterns`).
- Python perf ladder: profile-before-optimize (cProfile/py-spy/timeit), hot-path focus, `lru_cache`, generators for large sets, builtin-C preference. Source: `wshobson/agents` (`python-performance-optimization`).
- Copier-managed update path (source: `jlevy/simple-modern-uv`, MIT — this note only; uv core mechanics already landed above via wshobson): when the project is scaffolded from a Copier template, prefer `copier update` for template-evolution sync over hand-porting upstream changes; adoption ladder is selective → core-toolchain → full-Copier-managed, each rung only when its sync burden earns it.
- Python review checklists (source: `wshobson/agents` `python-anti-patterns` + `python-code-style`): anti-pattern gate — single-layer retry (centralized decorator, know infra retry), env-typed config (no secrets in code), DTOs at API boundary (no ORM-model leak), pure business logic via repository pattern (no embedded SQL), specific exceptions (no bare `except: pass`), batch partial-failure capture (BatchResult, never abort-on-first-error), validate at boundary, context managers for resources, async-native calls in async paths (never blocking sleep/sync HTTP in loop), typed public APIs + generic collections; style — ruff all-in-one (`E/W/F/I/B/C4/UP/SIM`, format handles line length), mypy strict (relaxed for tests/), PEP 8 naming (snake_case functions, PascalCase classes, SCREAMING constants, no abbreviated module names), absolute imports (stdlib → third-party → local), Google-style docstrings on all public APIs.
- Bounded reads: paginate every list endpoint (page/pageSize + totals); join/include instead of N+1 loops; treat third-party responses as untrusted and validate at the boundary.
- Idempotency: key from client/intent (never a per-attempt UUID/timestamp); claim via unique constraint (check-then-act is a race); reject same-key-different-payload loudly; record intent before side effects (timeout = unknown, not failure); retention outlives the longest retry chain including DLQ replays.
- Types: discriminated unions for variants, branded IDs, separate input/output shapes; extend by addition (optional fields) never modification; breaking changes route to `webdev` migrations (expand→contract).
- Hyrum's Law: every observable behavior is a de-facto contract — assume consumers depend on it; validate at boundaries only, never between typed internals. Source: `addyosmani/agent-skills` (`api-and-interface-design`).
- Architecture patterns (layering doctrine): Clean inward-only deps (domain never imports infra); Hexagonal ports/adapters (swap PG→Dynamo via adapter, in-memory adapters for tests); DDD strategic (bounded contexts, context mapping, ubiquitous language) + tactical (aggregates, value objects, repositories, domain events); use-case unit tests with zero Docker. Source: `wshobson/agents` (`architecture-patterns`).
- API versioning + GraphQL leg (delta): version via URL vs header vs query (pick one, document it); plural-noun collections; OpenAPI docs; cursor pagination (Relay cursors); `@deprecated` migration path; GraphQL schema-first, DataLoader for N+1, query-complexity monitoring. Source: `wshobson/agents` (`api-design-principles`).
- CQRS event-sourcing chain (one chain, three legs): command/query model split, projector → denormalized read model, eventual-consistency SLA, event versioning, don't-query-in-commands; store leg — append-only, per-stream/global ordering, optimistic concurrency, stream-ID `Type-{uuid}`, correlation/causation IDs, chooser (EventStoreDB vs PG vs Kafka vs DynamoDB vs Marten); read leg — live/catchup/persistent/inline projections, idempotent replay, checkpoints, lag monitoring, rebuild-by-design. Source: `wshobson/agents` (`cqrs-implementation`, `event-store-design`, `projection-patterns`).
- Saga orchestration (pairs the chain): per-step (not global) timeouts, idempotent always-succeeds compensations in reverse order, `saga_id` correlation, stuck-COMPENSATING → DLQ recovery, fail-at-each-step-index tests. Source: `wshobson/agents` (`saga-orchestration`).
- Microservices doctrine: decompose by capability/subdomain (strangler-fig for monoliths), database-per-service, sync (REST/gRPC) vs async (Kafka/RMQ/SQS), resilience (circuit-breaker, retry-backoff, bulkhead). Source: `wshobson/agents` (`microservices-patterns`).
- **In-Dev Web Security Prevention Rules (Developer Boundary)**:
  - *IDOR / BOLA Prevention*: Always enforce tenant/owner ownership predicate in database queries (`WHERE id = :id AND tenant_id = :tenant_id`), never query by raw ID alone.
  - *SSRF & Cloud Metadata Blocking*: When fetching external URLs provided by users, strictly blacklist private/internal IPv4/IPv6 ranges and cloud metadata IP (`169.254.169.254`, `127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - *SQL Injection & Sanitization*: Mandatory parameterized statements or typed ORM builders (Drizzle/Prisma/SQLAlchemy); raw string interpolation in queries is strictly prohibited.
  - *Mass Assignment Prevention*: Always validate requests against strict DTO / Zod schemas; never pass raw request bodies directly to database updates or inserts.
  - *Security Audit Escalation*: For full vulnerability assessments, CVE triage, or cloud WAF infrastructure audits, invoke the external `muse-security` skill.

## Sources


Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
