# 📚 Sample `updatedocs` Synchronization Reports

Worked examples of the two report formats defined in `SKILL.md` → Output Format.
Content is illustrative; every claim in a real report must be evidence-backed.

---

## Example 1 — Full Report (Change mode)

Scenario: the repository renamed the environment variable `API_TOKEN` to
`AUTH_TOKEN` and bumped the required Node version to 22. Docs were audited and
synchronized against the actual diff.

```markdown
## 📚 Documentation Synchronization Report

**Mode:** Change | **Change boundary:** `src/config.ts`, `.env.example`,
`package.json` (working tree, uncommitted)

### 📝 Updated
- `README.md`
  - Reason: quickstart exported `API_TOKEN`; implementation now reads `AUTH_TOKEN`
    (verified in `src/config.ts:12`).
  - Scope: quickstart snippet, prerequisites (Node 20 → 22).
- `docs/configuration.md`
  - Reason: variable reference table listed the removed key; documented
    `AUTH_TOKEN` with required/optional status and default.
- `.env.example`
  - Reason: key renamed to match the config loader; placeholder value only.
- `CHANGELOG.md`
  - Reason: breaking rename and runtime bump are consumer-facing.
  - Scope: appended under `## [Unreleased]` → `### Changed` (rename) and
    `### Changed` (runtime requirement).

### 🔍 Reviewed — No Change Required
- `CONTRIBUTING.md`
  - Reason: already states Node 22 as the development requirement.
- `docs/api/*`
  - Reason: rename is configuration-surface only; no route or schema change.

### ⚠️ Drift / Documentation Debt
- `docs/deployment.md`
  - Issue: deployment guide still instructs operators to set `API_TOKEN`.
  - Status: unresolved — deployment docs are operator-facing; flagged for
    maintainer confirmation rather than edited during a rename that is still
    in the working tree.

### 🔐 Protected DOX Architecture Review
- `.agents/`: affected (`.agents/context/architecture.md` references `API_TOKEN`)
  but not modified.
- Governing `AGENTS.md`: `AGENTS.md`
- Permission: explicit permission required
- Modification: none — recommended change reported for `updateagents` or
  explicit user authorization.

### 🧠 Memory Boundary
- `.memory/`: untouched
- Owner: `musememory`
- Durable finding (config-surface rename policy) reported here only; not
  written to any memory store.

### ✅ Verification
- **Git Scope:** `git diff HEAD` on working tree (3 files)
- **Sources of Truth:** `src/config.ts`, `package.json` (`engines`), `.env.example`
- **Internal Links:** verified (4 relative links re-checked)
- **Commands:** verified against `package.json` scripts
- **Examples:** verified (quickstart snippet matches loader keys)
- **API / Schemas:** not applicable
- **Configuration:** verified (all `process.env.*` references documented)
- **Architecture:** not applicable
- **Generated Docs:** not applicable
- **Cross-Document Consistency:** verified (single key name across touched docs)
- **Security:** no secrets exposed (placeholders only)

### ❓ Unverified / Ambiguous
- `AUTH_TOKEN` rotation procedure
  - Uncertainty: no rotation runbook exists in the repository.
  - Evidence needed: maintainer input on whether rotation is manual or automated.

### 🤝 Recommended Companion Handoffs
- `updateagents` → agent-context references the old key name and requires
  synchronized maintenance.
```

---

## Example 2 — Condensed Report (Quick mode)

Scenario: a CLI flag `--output <dir>` was renamed to `--out <dir>` in the
working tree; only the CLI reference document needed a targeted fix.

```markdown
## 📚 Doc Sync — docs/cli.md

**Mode:** Quick | **Change inspected:** `src/cli.ts` (working tree)

- **Updated:** `docs/cli.md` — flag table and example updated
  `--output <dir>` ➔ `--out <dir>`, verified against the commander
  definition in `src/cli.ts:41`.
- **Verified:** example command `mytool --out ./build` matches the
  implementation's option name and default.
- **Boundaries:** `.memory/` untouched; `.agents/` not affected.
- **Skipped:** `README.md` (no occurrences of the old flag — checked with
  `rg --output`), `CHANGELOG.md` (rename not yet consumer-shipped; will be
  captured when the change is committed).
```

---

## Report Selection Rule of Thumb

| Situation | Report |
|:---|:---|
| One section of one document, direct evidence | Condensed |
| Multi-document impact, second-order propagation | Full |
| Any protected-path review triggered | Full |
| Mode was escalated mid-run | Full |
