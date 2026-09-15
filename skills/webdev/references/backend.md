# backend — Backend: APIs, schemas, auth, and integrations with the project's stack.

## Intake

- API consumers and their needs (who calls this?)
- Data model and access patterns
- Auth/permission model (who may do what)
- Existing backend conventions in the repo

## Deliverable

Working API endpoints / schema changes with validation at boundaries, auth enforcement, error contracts, and tests exercising the real paths.

## Procedure

1. Model the data first: schema, constraints (DB-level, not just app-level), indexes for the real query patterns.
2. Design the API shape: resources, verbs, status codes; validate ALL input at the boundary.
3. AuthZ: check permission at the resource level, not just the route level.
4. Write the happy path, then the failure paths (validation, not-found, forbidden, conflict).
5. Tests against the real DB/emulator where feasible — not only mocks.
6. Run the verification gate; document the endpoint contract (request/response shapes).

## Quality gate

- [ ] Input validated at the boundary (schema or equivalent).
- [ ] DB constraints back the app-level rules.
- [ ] AuthZ enforced per resource, not per route.
- [ ] Failure paths return proper status codes and safe errors (no internals leaked).
- [ ] Tests exercise real paths.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
