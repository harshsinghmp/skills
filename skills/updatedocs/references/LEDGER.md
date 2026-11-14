## 🧭 Documentation Point Ledger (Session-Proof Sync)

The ledger is the durable answer to "which code change still owes docs, to whom, and what shipped?" It lives at `.docs-ledger.json` (root, commit-worthy) — never `.memory/`, never directly in `.agents/`.

```text
code change
  → updatedocs --ledger          create DP-#### points, mark audience gaps
  → docs written / --mark        coverage detected or manually confirmed
  → updatedocs --checkpoint      advance the watermark only when complete
  → updateagents --docs-backlog  fold agent-relevant points into current.md
  → updatedocs --release <tag>   mark shipped + generate what's-new
```

Audience routing:

| Audience | Discovery surfaces | Required when |
| :--- | :--- | :--- |
| **developer** | README, CHANGELOG, CONTRIBUTING, API/architecture, docs/, examples/ | code, config, CI, skills, or public/breaking change |
| **user** | README, CHANGELOG, CLIENT_CHANGELOG, guides/, docs/ | feat/fix/perf/security/revert, dependency/config, breaking |
| **agent** | `AGENTS.md`, `llms.txt`, `.agents/context/*` | skill/agent surface, config/CI, feat/perf/security/refactor |

Core commands:

```bash
# Catch up every commit since the documented watermark (forgotten-session safe)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --ledger

# CI gate: fail on pending points or HEAD ahead of the watermark
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --check-points

# Advance only when every required audience is documented
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --checkpoint

# Manual coverage when the phrase heuristic is too strict
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --mark DP-0007 --audience user --docs CHANGELOG.md

# Shipped state + human what's-new
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --release v1.2.0
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --whats-new --audience user

# Optional: auto-capture every commit as a point (post-commit hook)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --install-hook
```

- The `.docs.hash` fast-skip cannot hide a pending point; `--check` disables the fast path when the ledger has debt.
- `.memory/` is never read or written. `--memory-hint` prints a safe one-line hint per point for the user's harness memory tooling.
- `.agents/context/` is updated only by `updateagents --docs-backlog`, never by `updatedocs`.
- Full schema, phrase-evidence rules, managed blocks, and recovery flow: [references/DOCS-LEDGER.md](./references/DOCS-LEDGER.md).
