# Gauntlet Loop Protocol Reference

## Scoring Rubric (0.0 – 10.0 Scale)

The Fresh Critic calculates round scores using this weighted formula:

$$S_{\text{total}} = 0.40 \cdot S_{\text{correctness}} + 0.25 \cdot S_{\text{minimal\_diff}} + 0.20 \cdot S_{\text{edge\_cases}} + 0.15 \cdot S_{\text{cleanliness}}$$

1. **Correctness & Invariants (40%)**:
   - 10: Zero logic errors, API breaks, or race conditions.
   - 5: Functional but contains subtle boundary edge case.
   - 0: Automated tests fail or core invariant broken.

2. **Minimal Diff Discipline (25%)**:
   - 10: Exactly the lines needed to fix the defect; zero collateral refactoring.
   - 5: Includes minor unrelated formatting or renaming.
   - 0: Massive rewrite or unrelated architectural shift.

3. **Edge-Case Coverage (20%)**:
   - 10: Negative paths, null bounds, timeouts, and overflow conditions explicitly handled.
   - 5: Happy path and one error branch covered.
   - 0: Only happy path handled.

4. **Architectural Cleanliness (15%)**:
    - 10: Follows existing repo idioms and patterns.
    - 5: Introduces slightly redundant helper.
    - 0: Violates project structure or adds unnecessary framework dependency.

## Critic Rules (superpowers/systematic-debugging S5)

- **Root-cause-before-fix**: no fix scores above 5 on Correctness without a named root cause (Symptom→Source chain). Symptom-only patches are rejected feedback, not progress.
- **3-failed-fixes → question architecture**: three rounds failing on the same root cause stops the fix loop — the critic escalates to an architecture question instead of requesting another same-shape fix. Record the escalation in `ITERATION_LEDGER.md`.

## Named-reviewer loop (source: `trailofbits/skills` `code-improver`, raw SKILL.md fetched 2026-09-19)

When the loop runs against a reviewer the user names (any installed skill
or agent) instead of the built-in Fresh Critic:

- **Three inputs, no guessing.** Target (absolute path, verified to exist),
  reviewer (user-named — there is no default; resolve skill-vs-agent
  ambiguity before launching, never pick one silently), scope (explicit
  repo-relative globs; propose-and-confirm when absent).
- **Outcome vocabulary.** `converged` (clean review, zero critical/major —
  report rounds + residual minors) / `capped` (budget out, blockers open —
  say CAPPED, never success) / `escalation` (recurring findings,
  non-decreasing counts, relocated problems — needs a design decision, not
  more rounds) / `halted` (scope violation, dead reviewer, unregistered
  files — relay the violation paths). A fresh run after escalation reloads
  the on-disk ledger — rounds restart, re-derivation does not.
- **Guards.** The loop never commits (working tree only); scope is checked
  after every fix round; never improvise the loop inline — the ledger,
  scope guard, and escalation guarantees live in the loop, and an inline
  imitation has none of them.

## AI-debt sweep (source: `wshobson/agents` `ai-debt-detector`, raw SKILL.md fetched 2026-09-19)

After any AI-generated code (20+ lines) or before merging an AI-built PR,
run this sweep for the failure patterns agents produce that humans would
not — compilation passing is not evidence:

1. **Failure modes** — network timeout? disk full? denied permission? null
   input? Specific catches or swallowed-everything? Resources cleaned up
   on failure (streams, connections, temp files)?
2. **Orphans** — every open/create needs its close/dispose: temp files,
   listeners, intervals, subscriptions, connections. GC does not cover
   these.
3. **Edge cases** — empty, null, multi-MB, unicode, concurrent calls. The
   code assumes the happy path until proven otherwise.
4. **Hallucinated deps** — every import exists in the manifest; every API
   method is real and still exported at the pinned version.
5. **Architectural drift** — same error-handling style, same established
   utilities (not reinvented), same file-structure conventions as the repo.

Red flags (stop and fix): empty/log-only catch, missing `finally` on
opened resources, `TODO: handle error`, nonexistent import path, timeout
without abort/cleanup, unreleased pooled connection. Review what the AI
did NOT generate (missing error paths), not just the diff.

---

## 🏛️ Anti-Drift Architecture & Duplicate Utility Guard

AI coding agents optimize locally and frequently introduce "invisible agent debt": duplicate helper functions, fragmented state patterns, and collateral file mutations.

### The 3 Anti-Drift Invariants
1. **Zero Duplicate Helpers**:
   - Before writing or accepting a utility function (`cn`, `formatDate`, `slugify`, `debounce`, `truncate`, `fetchWithRetry`), check `@/lib/utils` or `src/utils/`.
   - If an existing function provides equivalent capability, the agent MUST import the existing utility. Writing parallel duplicates is an automatic Gate Blocker.
2. **Zero Parallel Abstractions**:
   - Never introduce competing architectural mechanisms (e.g. adding Axios when `fetcher.ts` exists; adding Redux/Zustand when React Context/NanoStores is established; adding a new CSS-in-JS library when UnoCSS/Tailwind is configured).
   - Inward-only dependency discipline: feature modules import core utilities; core utilities never import feature code.
3. **Refactor Scope Boundary (The Rule of 3 Files)**:
   - When resolving an assigned issue or bug, the diff must remain strictly scoped to the target component and its immediate test file.
   - Touching $>3$ unrelated files or modifying global theme/middleware files outside the task specification automatically halts the loop for Nexus review.

---

## Judge Pattern (paired-judge + ratchet)

(sources: `alchaincyf/darwin-skill` judge/ratchet legs + `bjgreenberg/senior-engineering-partner` `evals/` + `references/skill-self-improvement.md` — judge pattern only, MIT/Apache-2.0; single-supplier ENRICH, no optimizer CREATE)

- **Paired same-judge**: when two candidates compete, score both with the *same* judge and prompt — absolute scores are triage-only (which advances), never proof of quality; odd-N majority settles disagreements.
- **Keep/revert ratchet**: every accepted round is a git checkpoint; a regressing round reverts to the previous checkpoint instead of patching forward — the bar only ratchets up, never drifts down to meet the candidate.
- **Evals regression suite**: persist real misses as replayable scenarios; re-run the suite per round with an LLM-judge plus per-model baselines so a fixed defect stays fixed. Self-improvement of the loop itself stays consent-gated and ledger-recorded — never silent.

---

## 🛡️ The 6 Resilience & Hygiene Quality Gates

Before any round or PR is accepted through the Gauntlet, it must pass six automated hygiene checks:

### 1. The Loud Failure Invariant (Zero Swallowed Errors)
- **Anti-Pattern**: `try { ... } catch {}` or `catch (err) { /* ignore */ }`. Silent error swallowing causes blank white screens for clients while telemetry tools (Sentry, Datadog) report zero errors.
- **Invariant**:
  - Every caught exception must either:
    1. Log structured diagnostics (`console.error('[Module] Action failed:', err)`),
    2. Be reported to error telemetry,
    3. Be re-thrown (`throw err`) for upstream boundaries, or
    4. Explicitly transition the UI to a friendly, actionable error state.

### 2. The Deterministic Testing Standard (Zero Flaky Sleeps)
- **Anti-Pattern**: Inserting arbitrary timer pauses (`await sleep(1000)`, `setTimeout(..., 2000)`, `page.waitForTimeout(3000)`) in test files to "wait for async network responses or DOM renders".
- **Invariant**:
  - Arbitrary sleeps are strictly prohibited in tests.
  - Asynchronous waits must be deterministic:
    - DOM element polling: `await page.waitForSelector('.selector')` or `waitFor(() => expect(...).toBeInTheDocument())`.
    - Polling assertions: `await expect.poll(() => fetchStatus()).toBe('READY')`.
    - Network interception: `await page.waitForResponse(url)`.

### 3. The Zero-Redundancy Dependency Diet
- **Anti-Pattern**: Introducing heavyweight third-party npm packages when native Web Standards, standard libraries, or already-installed modules provide identical functionality.
- **Invariant**:
  - Reject trivial micro-packages (`is-odd`, `is-even`, `left-pad`, `is-number`).
  - Reject obsolete HTTP clients (`axios`, `request`, `superagent`) when standard WHATWG `fetch` is native in Node 18+, Bun, and browsers.
  - Reject legacy utilities (`querystring` -> use `URLSearchParams`; `moment` -> use `Intl` or `date-fns`; `rimraf`/`mkdirp` -> use `fs.rmSync`/`fs.mkdirSync`).

### 4. The Client-Side Hydration & Timezone Desync Shield
- **Anti-Pattern**: Directly calling `new Date().toLocaleDateString()`, `new Date().toLocaleString()`, `Date.now()`, or `Math.random()` inside JSX markup rendered on server. The server renders UTC while client browser renders local timezone, causing React hydration mismatch errors, layout jumping, and broken event listeners.
- **Invariant**:
  1. Never render unsuppressed client-dependent date/time or random strings in SSR JSX.
  2. Use a two-pass mounted pattern (`const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []); if (!mounted) return <Skeleton />`).
  3. Or add `suppressHydrationWarning` on the specific HTML node containing localized timestamps.
  4. Or format timestamps on the server using an explicit UTC timezone string inside a semantic `<time dateTime={isoString}>` tag.

### 5. The CMS-Cohesion & Hardcoded Copy Linter
- **Anti-Pattern**: Hardcoding static marketing copy, headings, testimonials, pricing, or media URLs directly into frontend components (`.tsx`, `.jsx`, `.astro`, `.vue`) when a Content Management System (CMS) or visual page builder is present in the repository (e.g. WordPress + Page Builder, Payload CMS, Emdash, Aria Builder, Sanity, Strapi, Contentful, Ghost, Keystone, or Puck Visual Builder). This fractures the project architecture, locks non-technical agency clients out of their own content, and generates endless "can you change this sentence" engineering tickets.
- **Invariant**:
  1. **CMS-First Data Flow**: Whenever a CMS is present, all user-facing copy, labels, features, and assets must be modeled and sourced through CMS collections, globals, or block schemas.
  2. **Styling & Token Placement**: Custom CSS or JavaScript must use designated token systems (`globals.css`, Tailwind theme tokens, or the CMS/Page Builder's native Custom CSS/JS code injection areas). Ad-hoc inline CSS styles that bypass the design system are prohibited.
  3. **Founder Alert Gate**: If a requested feature or layout cannot be modeled cleanly inside the active CMS schema or page builder, the agent MUST notify the user/founder before writing code outside the CMS to agree on the architectural deviation.

### 6. The Verified Deploy Gate (Zero Unverified Preview Claims)
- **Anti-Pattern**: Declaring a deployment or delivery complete because a build runner exited with code 0 or a preview URL was printed in terminal logs, without verifying that the deployed endpoint actually serves HTTP 200 without runtime fatal exceptions. Many builds pass statically but immediately crash on edge functions due to missing environment variables.
- **Invariant**:
  1. **HTTP 200 Verification**: Before declaring a task or deployment complete, the agent or automated gate must ping the deployed preview or staging URL via HTTP GET/HEAD.
  2. **Runtime Exception Check**: The response must return HTTP 200 and be audited for runtime crash signatures (e.g. "Application error: a client-side exception has occurred", "500 Internal Server Error", "502 Bad Gateway").
  3. **Evidence Requirement**: The status code, verified URL, and latency receipt must be logged in the acceptance record.



