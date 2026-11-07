# deploy — App-side ship: one-command full-stack deploy, static-upload fallback, object-storage contract.

## Intake

- Deploy shape: compute + database + static frontend (what runs where)
- Build output dir (`dist` / `build` / `out` / `public`)
- Object-storage needs (uploads, user files — bodies vs metadata)

## Deliverable

Shipped build: one command covers all layers; per-layer updates for partial ships; static fallback verified; bodies in object storage, metadata in DB.

## Procedure

1. One-command full-stack deploy: a single command ships compute + database migrations + static frontend together; per-layer update commands for partial ships (frontend-only, compute-only, SQL-only).
2. Static-upload fallback: detect the build dir by priority `dist` > `build` > `out` > `public`; upload only the build output — never `src/`, `node_modules/`, `.env`, or secrets.
3. Object-storage contract: file bodies live in object storage under a server-derived owner prefix with opaque IDs; searchable metadata lives in the DB; records move `pending` → `ready` only after the body lands; never pretend cross-system atomicity (orphan-sweep or lazy-reconcile instead).
4. Serve shapes: streaming upload/download with `Range` and `HEAD` handlers so large files resume and probe cheaply.
5. Verify post-ship: hit the live URL, confirm the migrated schema version, run the verification gate.

## Quality gate

- [ ] Single command ships all layers; per-layer updates documented.
- [ ] Static fallback uploads build output only (no `src` / `node_modules` / `.env`).
- [ ] Bodies under server-derived prefix + opaque IDs; metadata in DB.
- [ ] `pending` → `ready` transition; no atomicity assumed across systems.
- [ ] Live URL + schema version verified post-ship.

## Routing

- Pipeline/infra (CI stages, secrets, env protection, rollback automation) lives in `devops` (`cicd`/`hosting`) — this mode is the app-side ship step only.
- Full-stack deploy + static-upload fallback + object-body/metadata split (source: `glitternetwork/pinme` + r2 note, MIT — this note only).
- Default-stack: where the stack is worker + SQL + static hosting, one deploy command fans out to all three; elsewhere keep the same shape with the project's own deploy tooling.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
