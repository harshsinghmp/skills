# 🐙 git:convention-mining — Automated PR & Commit Convention Mining Engine

This reference codifies automated extraction and synthesis of repository git conventions, commit formats, and PR review standards directly from historical repository data.

---

## 1. Why Automated Convention Mining Matters

Every engineering team develops implicit conventions:
1. **Commit Message Anatomy**: Conventional Commits prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`), component scoping (`feat(webdev):`), and imperative grammar.
2. **Body Invariants**: Structured rationale (`Why:`), change lists (`What:`), and test receipts (`Verification:`).
3. **Branch Topologies**: Standard branch naming formats (`feat/<name>`, `fix/<name>`, `chore/<name>`).
4. **Issue Linkage**: Automatic issue closing patterns (`Fixes #123`, `Closes #456`).

When autonomous coding agents work across multiple client codebases, hardcoding a single static convention causes friction. Convention Mining dynamically discovers the team's historical habits and synthesizes an authoritative guideline.

---

## 2. The 3 Mining Operations

### Operation 1: Commit History Mining (`--mine`)
Analyzes the last N commits using structured delimiters:
- Computes team Conventional Commits compliance percentage.
- Discovers top commit types and scopes.
- Measures presence of `Why:`, `What:`, and `Verification:` sections.
- Emits structured JSON or human-readable statistics.

```bash
bun skills/core-engine/git/scripts/pr-convention-miner.ts --mine [path] [--limit 100]
```

### Operation 2: Guideline Synthesis (`--synthesize`)
Generates actionable documentation (e.g. for `AGENTS.md`, `CONTRIBUTING.md`, or `.agents/context/`):
- Formats recommended templates based on observed frequencies.
- Generates team-specific rules for autonomous agents.

```bash
bun skills/core-engine/git/scripts/pr-convention-miner.ts --synthesize [path] [--output conventions.md]
```

### Operation 3: Commit Message Auditing (`--audit-commit`)
Validates a candidate commit message before staging or committing:
- Flags missing Conventional Commit prefixes.
- Flags trailing periods or subject lines exceeding 72 characters.
- Emits actionable suggestions for fixing non-conforming messages.

```bash
bun skills/core-engine/git/scripts/pr-convention-miner.ts --audit-commit "feat(git): add convention miner"
```
