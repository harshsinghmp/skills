# Multi-Reviewer Mode — parallel dimensions, dedup, calibration

> Sources: wshobson-agents-multi-reviewer-patterns (R2). A method, not a tool.
> Use when two or more independent review passes should run in parallel over
> the same diff, then collapse into ONE calibrated report.

## When to Use
- A change touches multiple quality dimensions (correctness, security, UI,
  performance, docs) and no single review pass should judge them together.
- The same findings keep appearing across passes and need deduplication.
- Severity is inconsistently rated across passes and needs a single calibration.

## Do NOT Use
- Single-dimension diffs (hotfix). One pass is enough.
- When reviewers should be biased toward agreement — independence is the point.

## Procedure

### 0. Discovery map — learn the project's own rules first (enrich — source: `tech-leads-club-pr-review`, raw SKILL.md v1.0.0 fetched 2026-09-19)

Probe the repo once, record compactly, pass verbatim to every pass.
Prefer evidence the project states over guesses; mark absent as `none`.

```
TEST:          <command CI actually runs> | globs: <...> | unit vs e2e: <split | none> | none-found
REQS:          tracker=<Jira KEY / GH #N / Linear ID / none> ; specs=<paths | none>
CONVENTIONS:   <CONTRIBUTING / ARCHITECTURE / AGENTS.md / docs paths | none-found>
REVIEW_SKILLS: <project-local test/arch/security skill paths | none>
```

- **Test runner**: the CI workflow is authoritative; fall back to the
  manifest (`package.json` scripts, `pyproject.toml`, `go.mod`, `Makefile`).
- **Requirements**: branch-name/PR-body tracker key, or in-repo
  spec/task/PRD/ADR files (fuzzy-match on feature name). ADR
  Decision/Consequences sections count as requirements.
- **Conventions**: every stated rule becomes the evaluation matrix —
  extract each `must`/`never`/checklist item, number them, grade each
  changed file PASS / VIOLATION / N/A per rule, citing rule number +
  source. No convention docs found → say so, run the minimal generic
  boundary sweep only.
- Each pass loads **only** what the map lists; stack knowledge never
  substitutes for the project's documented rules.

### 1. Spawn independent passes
Run N concurrent review passes, each scoped to ONE dimension:
- correctness / structure → `code-review` diff or audit mode
- security / OWASP → `code-review` security mode
- UI / component → `refactor-ui`
- accessibility → `refactor-ui` (WCAG 2.2) or accessibility lens
- performance → `web-perf` or platform profiler
- docs / intent → `intended-vs-implemented` mode

Each pass reports findings with its OWN severity, before cross-pass calibration.
**No-persona-spawns** (source: `addyosmani/agent-skills` agents rule): a pass never delegates to sub-reviewers — orchestration belongs to the caller.
**Orchestrator never reviews** (source: `tech-leads-club-pr-review`): the
coordinator gathers context, launches passes, and consolidates — it writes
no finding itself. Reviewing inline "to save time" is a failure of the
protocol, no exceptions for diff size.
**Mandatory-findings**: every lens must return at least one finding or finding-free
declaration with named satisfied principles — a pass that returns nothing and names
no principles hasn't looked. A lens earning no real finding names that explicitly
rather than padding.
**Second pass (mandatory per lens)**: re-read the full diff after the first
sweep and list every file/hunk uncommented on — skip one only by stating
explicitly why it is clean under that lens. Unreviewed-by-silence is how
defects survive parallel review.
**Confidence gate**: report a finding only at ≥80% confidence; when
uncertain, stay silent. Surface at least one positive highlight per lens
before listing issues.

### 2. Deduplicate
The same root cause reported by N passes is ONE finding, not N.
- Merge by **root cause**, not by surface phrasing. Two passes flagging "unchecked
  input reaches SQL" from different angles is one issue.
- Keep the most specific evidence snippet; drop the redundant rest.

### 3. Calibrate severity onto ONE scale
- Escalate when 2+ independent passes flag the same thing (independent
  corroboration raises confidence; **concurrence promotion**: two lenses agreeing on
  a finding promote its severity one rung — Nitpick → Request Changes, Request
  Changes → Reject).
- De-escalate a single pass's Reject if it rests on a false-positive-prone pattern
  and other passes saw no issue.
- Record the pre/post severity per merged finding so calibration is auditable.

### 4. Emit one consolidated report
Single verdict + ordered findings (calibrated severity) + dedup count.
Call out where independent passes disagreed and how the disagreement resolved.

### 5. Lens coverage — two lenses beyond dimensions (enrich — source: `tech-leads-club-pr-review`)

- **Requirements & DoD.** Score each acceptance criterion against the diff:
  ✅ Implemented (cite `path:line`) / 🟡 Partial / ❌ Missing. No located
  evidence ⇒ not implemented — never award credit from the PR description.
  Behavior exercised by a test but not asserted does not count as verified.
- **Regression & hallucination.** Hunt unrelated deletions, phantom
  references (imports/symbols that don't exist), wrong-signature calls,
  weakened/deleted assertions, swallowed errors, dead code. New public or
  entry-point behavior with no test at the right level is Critical.

### 6. Posting + consolidation mechanics (enrich — source: `tech-leads-club-pr-review`)

- **Body-file posting.** Multiline bodies go to a temp file first, posted
  with `--body-file` / `-F body=@file` — never inlined. Inline comments
  anchor to added (`+`) lines only, on the head-file line number.
- **Duplicate suppression.** Skip a finding within ±3 lines of an existing
  comment; on a thread whose issue the diff now fixes, reply `[RESOLVED]`.
- **Gap detection.** After consolidation, cross-reference the changed-file
  list against commented paths — every changed logic file with zero
  comments is listed under "files with no findings" for manual verify or
  targeted re-run. Config/lock/type-only files are the only omissions.

### 7. Noise gate + weighed verdict → one `gh` review (source: `tech-leads-club-the-judge`)
- **Noise gate first**: drop findings with no demonstrating execution and
  low-confidence nits naming no defect — deterministically, before calibration.
- **Weighed verdict**: weigh the calibrated findings into one verdict —
  any Reject / Request-Changes → `REQUEST_CHANGES`; clean (3+ satisfied
  principles named) → `APPROVE`; discussion-only → `COMMENT`.
- **One consolidated post**: emit the report as a single
  `gh pr review <pr> --{approve|comment|request-changes}` with inline comments —
  never N separate reviews, one per pass.

## Output shape
```
# Consolidated review (N passes → 1 report)
## Verdict: <REJECT | REQUEST-CHANGES | APPROVE>
## Merged findings (n findings from n_raw passes)
each: evidence | original severities per pass | calibrated severity | resolution
## Disagreements resolved
## Per-dimension receipts (each pass's raw count, before dedup)
```