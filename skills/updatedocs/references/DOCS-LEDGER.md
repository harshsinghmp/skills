# 📚 Documentation Point Ledger — Session-Proof Sync & Shipped-State Tracking

> Loaded for the `ledger` mode (`--ledger`, `--catch-up`, `--checkpoint`, `--check-points`, `--whats-new`, `--mark`, `--release`).
> Purpose: make documentation follow every code change across short, long, and forgotten sessions, with one durable point of truth for **what was last documented**, **which audience still owes docs**, and **what has shipped**.

---

## 1. The Problem It Solves

A single `.docs.hash` answers "did docs change?" but not:

- which code changes still owe documentation,
- whether the developer, user, and agent audiences each got their update,
- what shipped in a release vs. what is still unreleased,
- what happened in a session that ended before docs were written.

The ledger answers all four. It is a small, commit-worthy JSON file at the repository root:

```text
.docs-ledger.json
```

It is **not** `.memory/` and it is **not** `.agents/`. `updatedocs` owns it directly; `.memory/` stays untouched and `.agents/context/` remains governed by `updateagents`.

---

## 2. Document Point Model

Every documented-worthy commit becomes one point:

```text
DP-0007  abc1234  feat(auth)  "add SSO login flow"
        ├─ developer: documented (README.md)
        ├─ user:      documented (CHANGELOG.md)
        ├─ agent:     pending
        └─ shipped:   v1.2.0
```

| Field | Meaning |
| :--- | :--- |
| `id` | Stable sequential point id (`DP-0001`, `DP-0002`, …) |
| `point` | Numeric order used by watermarks |
| `commit` / `shortCommit` | Source commit (evidence, never fabricated) |
| `type` / `scope` / `summary` | Parsed Conventional Commit |
| `files` | Paths touched by the commit |
| `audiences` | Per-audience required flag, status, docs, evidence, manual mark |
| `shipped` / `releaseTag` | Whether the point is in a released tag |

### Audience statuses

```text
not-needed  the change has no impact on this audience
pending     this audience still owes documentation
documented  a discovery document contains an evidence phrase
verified    manually confirmed in a document (strongest state)
```

### Audience routing

| Audience | Discovery surfaces | Required when |
| :--- | :--- | :--- |
| **developer** | README, CHANGELOG, CONTRIBUTING, API/architecture docs, docs/, examples/ | code, config, CI, skills, or a public/breaking change |
| **user** | README, CHANGELOG, CLIENT_CHANGELOG, guides/, handbook/, docs/ | feat/fix/perf/security/revert, dependency/config changes, breaking changes |
| **agent** | `AGENTS.md`, `llms.txt`, `.agents/context/*` | skill/agent surface, config/CI, feat/perf/security/refactor |

`skillOnly` changes (only `skills/`, `AGENTS.md`, `llms.txt`, `skills.json`) do not require user-facing docs; they require developer and agent coverage.

### Coverage evidence

Coverage is proved by a **phrase**, not a single generic word:

- Adjacent summary phrases (`sso login`, `login flow`, `saml metadata`).
- The point id (`DP-0007`) when a managed ledger block documents it.
- Tests use `SAML metadata` vs. an older `SAML support` mention to ensure an older point cannot silently "document" a newer capability.

A miss is `pending`; `--mark` is the explicit override when the phrase heuristic is too strict.

---

## 3. Watermarks & Shipped State

```text
documentedWatermark  last point whose every required audience is complete
agentWatermark       last point consumed into .agents/context/current.md
releaseTag           latest tag the ledger observed / the tag passed to --release
```

- `--ledger` scans from `watermark.commit` (or `--since`, or the last release tag) to `HEAD`. It never advances the watermark.
- `--checkpoint` advances the watermark **only when every point is complete**; otherwise it exits 1 and leaves the watermark unchanged.
- Points are marked `shipped` when their commit is an ancestor of the latest release tag, or explicitly with `--release <tag>`.
- A forgotten session is recovered because the watermark persists in the file, not in conversation memory.

---

## 4. Commands

```bash
# Catch up every code change since the last documented point
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --ledger

# Same, machine-readable
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --catch-up --json

# CI gate: fail when points are pending or HEAD moved past the watermark
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --check-points

# Advance only when fully documented
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --checkpoint

# Mark a manual audience coverage (phrase heuristic too strict)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --mark DP-0007 --audience user --docs CHANGELOG.md

# Mark complete points as shipped in a release
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --release v1.2.0

# Human-facing what's new
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --whats-new --audience user

# Write managed blocks (surgical, idempotent, never rewrites history)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --write-changelog --write-client-changelog

# Print optional harness-memory hints (never writes .memory/)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --ledger --memory-hint

# Auto-capture every commit as a point (idempotent post-commit hook)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --install-hook
```

### Flags

| Flag | Behavior |
| :--- | :--- |
| `--ledger` / `--catch-up` | Scan and update `.docs-ledger.json`; watermark unchanged |
| `--checkpoint` | Scan, verify, and advance the watermark when complete |
| `--check-points` | Read-only CI gate; exit 1 on pending points or HEAD ahead of watermark |
| `--whats-new` | Print shipped/complete points for `--audience` (developer/user/agent) |
| `--mark <id|sha>` | Mark an audience as documented; pair with `--audience` and `--docs` |
| `--release <tag>` | Mark every complete point as shipped with that tag |
| `--since <ref>` | Override the baseline for backfills |
| `--write-changelog` | Write the managed `Documentation Points` block into `CHANGELOG.md` under `[Unreleased]` |
| `--write-client-changelog` | Write business-language `What's New` into `CLIENT_CHANGELOG.md` |
| `--memory-hint` | Print safe harness-memory hints; no `.memory/` write |
| `--include-chore` | Include dependency/config/release chores as points |

---

## 5. Managed Document Blocks

Both writers are idempotent and history-preserving:

```markdown
<!-- docs-ledger:start -->
### Documentation Points

- **DP-0007** `abc1234` **feat(auth)** — add SSO login flow (shipped v1.2.0)
<!-- docs-ledger:end -->
```

- Existing text outside the markers is untouched.
- Re-running replaces only the marker region.
- Released changelog sections remain immutable.
- Human-curated release notes can coexist with the managed block.

---

## 6. Memory & Agent Integration

### Memory boundary

- `.memory/` is never read, written, or reorganized.
- The ledger is the cross-session memory bridge for documentation state.
- `--memory-hint` prints a one-line hint per unshipped point, e.g.:

  ```text
  DOCS DP-0007 abc1234 add SSO login flow | developer:documented user:documented agent:pending | shipped:no
  ```

  A harness with memory can record that line through its own tooling. `updatedocs` does not execute it.

### `updateagents --docs-backlog`

`updateagents` owns `.agents/context/`. After the agent-facing docs for a point are complete, it consumes the ledger:

```bash
bun skills/core-engine/updateagents/scripts/updateagents.ts . --docs-backlog
```

- Reads `.docs-ledger.json` from `agentWatermark.point` forward.
- Stops at the first point whose **agent** coverage is still `pending` (so backlog progression never skips an undocumented agent change).
- Appends a managed `<!-- docs-backlog:start -->` block to `.agents/context/current.md`.
- Advances `agentWatermark`, refreshes `.context.hash`.
- Prints pending points when blocked.

This gives the full loop:

```text
code change
  → updatedocs --ledger          (point created, audiences pending)
  → docs written / --mark        (coverage detected)
  → updatedocs --checkpoint      (watermark advances)
  → updateagents --docs-backlog  (agent context learns the point)
  → updatedocs --release <tag>   (shipped state + what's new)
```

---

## 7. CI & Session Recovery

- **CI gate**: run `updatedocs --check-points` (or `--check`) on every PR. A cached docs hash cannot hide a pending point.
- **Forgotten session**: re-running `--ledger` backfills every commit since the watermark; no conversation context is required.
- **Long backlog**: `--ledger` processes all commits since the baseline. Use `--since <ref>` for an explicit backfill window and `updateagents --docs-backlog-limit <n>` to cap agent context growth.
- **First run**: with no ledger and no tag, the scan is capped at the last 200 commits. Prefer running after a release tag or with `--since`.

## 8. Quality Gate

- [ ] Ledger created or updated from real Git history (no fabricated points).
- [ ] Every pending point names the exact missing audiences.
- [ ] Developer, user, and agent coverage checked with phrase evidence.
- [ ] Manual marks use real doc paths.
- [ ] `--checkpoint` advances only when complete.
- [ ] Shipped points carry a real release tag or `--release` confirmation.
- [ ] Managed blocks are idempotent and outside-marker text is untouched.
- [ ] `.memory/` untouched; `.agents/` modified only by `updateagents`.
