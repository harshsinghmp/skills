# Example: Repro Test Pack

Generated at dead-letter close-out for a deterministic failure. Record links the
pack path; the pack is self-sufficient — Dev/QA (or a fresh agent) runs red → fix →
green without re-deriving the failure from logs.

---

```markdown
# REPRO — redis-session-persistence 2026-08-22

Parent record: `.agents/dead-letter-2026-08-22T16:32:15Z.md`
Failure code: `FAILED-LOGIC` (session loss on concurrent refresh)
Baseline: `main` @ `a1b2c3d` — `bun test` green (51/51)

## Reproduction steps
1. Start the dev server with two browser sessions on distinct accounts:
   `bun run dev` → open `http://localhost:3000` in two browsers, sign in as
   user A in browser 1 and user B in browser 2.
2. In both browsers, refresh the page within the same second (or run:
   `bash -c 'curl -s -b cookies-a.txt http://localhost:3000/api/me & curl -s -b cookies-b.txt http://localhost:3000/api/me & wait'`).
3. Observe browser 1 is redirected to `/login` while browser 2 stays signed in.

## Preconditions
- Node/Bun: bun ≥ 1.1 (per package.json engines)
- `.env.local` with session store pointed at the in-memory fallback (no Redis):
  `SESSION_STORE=memory`
- No external services; both sessions must hit the same process.

## Expected vs actual
- **Expected:** concurrent refreshes validate sessions independently; both stay signed in.
- **Actual:** one session's refresh invalidates the other (`src/lib/session.ts:87`
  treats the in-memory store as single-slot; last write wins).

## Minimal failing test
`tests/lib/session.concurrency.test.ts` — created for this pack:

```ts
import { describe, expect, test } from "bun:test";
import { SessionStore } from "../../src/lib/session";

test("two concurrent session writes both validate", () => {
  const store = new SessionStore({ store: "memory" });
  store.set("sess-a", { userId: "a" });
  store.set("sess-b", { userId: "b" });
  // Fails pre-fix: store holds only the last write.
  expect(store.get("sess-a")).toEqual({ userId: "a" });
  expect(store.get("sess-b")).toEqual({ userId: "b" });
});
```

## Observed red (evidence)
Recorded run against the un-fixed code (`src/lib/session.ts` @ `f3e9d2c`):

```
$ bun test tests/lib/session.concurrency.test.ts
(bun) session.concurrency.test.ts:
(x) two concurrent session writes both validate [0.02ms]
error: expect(store.get("sess-a")).toEqual({ userId: "a" })
Received: null

1 pass
1 fail
```
The observed red is the pack's evidence — without it, the test's failure is only a claim.

## Spec note
The expected behavior comes from the auth spec: sessions are independent per
user; concurrent validity is required. If product later rules single-session
policy is correct, the SPEC changes and the test follows the spec — the test
never silently weakens to match broken behavior.
```

---

## Pack layout on disk

```
.agents/artifacts/repro-redis-session-persistence-2026-08-22/
├── REPRO.md                                   # this document
└── tests/lib/session.concurrency.test.ts      # minimal failing test (copied for handoff)
```
