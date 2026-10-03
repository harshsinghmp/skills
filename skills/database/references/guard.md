# guard — RLS policy authoring, secure views, and schema guardrails.

Default stack: self-hosted Postgres 16+ (or Supabase Postgres with Auth schema present). Defaults: RLS enabled and forced on every tenant table; `security_invoker = true` on all views; no `SECURITY DEFINER` in public schemas; `bigint generated always as identity` PKs (UUIDv7 only for distributed or exposed IDs); lowercase snake_case identifiers; `not null`, check, and FK constraints declared, never assumed.

## Intake

- Table and tenant key (e.g. `org_id`, `owner_id`, JWT claim mapping).
- Who may read, write, and delete — stated as sentences before any SQL.
- Roles to verify against (anon, authenticated, service_role or owner).

## Deliverable

RLS policies plus secure view definitions with a passing verification test: allowed rows returned, denied rows absent, wrong-tenant rows absent. Schema DDL follows the guardrails below.

## Procedure

1. Enable and force RLS — no policy means no rows, which is the safe default:
```sql
alter table documents enable row level security;
alter table documents force row level security;
```
2. Author least-privilege policies; wrap auth calls in a scalar subquery so the planner evaluates once, not per row:
```sql
create policy tenant_isolation on documents for all to authenticated
using (org_id = (select auth.uid())) with check (org_id = (select auth.uid()));
```
Bare `auth.uid()` per row is the classic RLS full-scan penalty — the `(select ...)` form is the fix.
3. Keep views invoker-rights so they respect the querying user's policies:
```sql
create view my_documents with (security_invoker = true) as
select id, org_id, title from documents;
```
Never ship `security_invoker = false` or `SECURITY DEFINER` in a public schema — privilege escalation path; route any exception to explicit owner sign-off.
4. Apply schema guardrails on new tables: identity PKs, lowercase snake_case (unquoted identifiers fold to lowercase — quoted mixed-case breaks tools and ORMs), explicit constraints:
```sql
create table documents (
  id bigint generated always as identity primary key,
  org_id uuid not null references orgs (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200)
);
create index concurrently documents_org_id_idx on documents (org_id);
```
5. Verify as the roles, not as the owner — owner bypasses RLS and proves nothing:
```sql
set role authenticated; select count(*) from documents; -- expect only own rows
set role anon; select * from documents limit 1;         -- expect zero rows
reset role;
```

## Quality gate

- [ ] RLS enabled and forced; deny-by-default confirmed with the anon test.
- [ ] Auth calls wrapped in `(select ...)`; no per-row function penalty.
- [ ] Views carry `security_invoker = true`; no `SECURITY DEFINER` in public.
- [ ] Verification test shows allowed, denied, and wrong-tenant rows explicitly.
- [ ] New tables use identity PKs, snake_case, and declared constraints with FK indexes.

## Routing

- Slow policy in a hot path → pair with `index` (policy predicates need matching indexes).
- Connection or lock fallout from policy rewrites → `operate`.
- App-side enforcement logic → `webdev`; the database remains the authority.
- Supabase Auth service or dashboard config → link out to Supabase docs, never duplicate.
- PG delta (source: `wshobson/agents` `postgresql-table-design` — ~60% already owned above, delta-only): TIMESTAMPTZ over TIMESTAMP, NUMERIC for money, TEXT+CHECK over VARCHAR(n), identity over serial; UNIQUE NULLS NOT DISTINCT (PG15+); EXCLUDE anti-double-book; BRIN for time-series, GIN/GiST chooser; RANGE/LIST/HASH partitioning; identity gaps + MVCC hot-churn notes.

## Sources

- Postgres docs: RLS policies, security_invoker views, identity columns.
- Supabase guides: row-level security, RLS performance.
- When a cited source conflicts with a default above, the source wins — record the override and why.
