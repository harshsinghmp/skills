# performance — Performance: profile first, fix the measured bottleneck, verify in field data.

## Intake

- Field data (CrUX/GA4/RUM) or lab access
- Symptom (LCP slow? INP? CLS?)
- Templates affected (all? one?)
- Constraints (CMS, third-party scripts, image pipeline)

## Deliverable

Performance report: measured baselines, bottleneck diagnosis with evidence, fixes applied in impact order, before/after lab + field verification.

## Procedure

1. Baseline from field data (CrUX/RUM); lab (Lighthouse) only as secondary — field is truth.
2. Reproduce the bottleneck: which template, which asset, which third-party — extremes first (slowest supported device, throttled network); the worst case defines the budget.
- Media provenance + posters: every heavy asset ships a lightweight poster/first-frame so LCP never waits on video/WebGL; keep asset provenance (source, license, credit) alongside the file — uncredited media is a gate failure (see `qa-launch` gate).
3. Fix in impact order: images (AVIF/WebP, dimensions, lazy), fonts (subset, swap), JS (split, defer), third-parties (delay, facade).
4. Re-measure lab after each fix; don't stack unverifiable changes.
5. Watch field data over 28 days for the real verdict.
6. Document the budget going forward (weight/size thresholds per template).

## Rule oracle + metrics-first audit

- Prefixed rule oracle (React/Next.js): 70 rules across 8 impact-ranked categories — apply critical first, never cherry-pick low-impact micro-optimizations while a waterfall or bundle problem is unmeasured. Source: `vercel-labs/agent-skills` (`skills/react-best-practices/SKILL.md`; full compiled guide in its `AGENTS.md`; each `rules/<prefix>-<name>.md` carries why + bad + good).

| Priority | Category | Impact | Prefix |
|:---|:---|:---|:---|
| 1 | Eliminating waterfalls | CRITICAL | `async-` |
| 2 | Bundle size optimization | CRITICAL | `bundle-` |
| 3 | Server-side performance | HIGH | `server-` |
| 4 | Client-side data fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render optimization | MEDIUM | `rerender-` |
| 6 | Rendering performance | MEDIUM | `rendering-` |
| 7 | JavaScript micro-optimizations | LOW-MEDIUM | `js-` |
| 8 | Advanced patterns | LOW | `advanced-` |

- Headline rules to check first: `async-` parallelize independent work (`Promise.all`), defer `await` into branches, stream with Suspense boundaries; `bundle-` import directly (no barrels), `next/dynamic` heavy components, defer third-party past hydration; `server-` dedupe per-request (`React.cache`), hoist static I/O, minimize client-bound serialization.
- Metrics-first audit (platform/hosting cost + perf): collect platform metrics FIRST (usage, route-level timings, cache-hit, function invocations — or CrUX/RUM equivalent where the platform exposes none), then investigate ONLY the flagged routes/files the metrics point to — never repo-wide grep. Deliver a ranked cost+perf report grounded in observed numbers and verified files, naming a specific cache policy per caching recommendation; keep unsafe responses dynamic unless evidence proves them cache-safe. Source: `vercel-labs/agent-skills` (`skills/vercel-optimize/SKILL.md`).

## Quality gate

- [ ] Baseline existed before fixes, including the slowest supported device/network extreme.
- [ ] Every fix traces to a measured bottleneck.
- [ ] Lab re-measured after each fix.
- [ ] Field data (not just lab) shows the verdict.
- [ ] Performance budget documented.

## Routing

- Keep-or-revert: neutral-within-noise = revert (correctness gates the metric: green suite + moved number); log every attempt including reverted ones in the PR/`PERF.md` so dead ideas stay dead.
- Cache deliberately: the key carries every input that changes the response (tenant/locale/permissions/viewer); one invalidation strategy (TTL/event/versioned keys); serve-stale or coalesce misses against stampedes; never cache correctness-critical freshness.
- Backend shape: EXPLAIN ANALYZE before any index (composite: equality columns first, then sort; partial for rare values; expression indexes for functions on columns); one pool per process with instances×max under the DB ceiling — bigger pools just move the queue somewhere less visible.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
