# 🧹 harness-hygiene — Clean Root, Local-Only Agent State

> Loaded for the `hygiene` mode (`--hygiene`, `--hygiene --consolidate`, `--hygiene --purge`, `--hygiene --check`, `--hygiene --check-public`, `--install-excludes`).

## 1. Invariants

1. **Clean root first**: no harness directory or instruction file at the project root unless the harness is explicitly in use and requires it.
2. **Consolidate second**: anything an agent needs to keep lives under `.agents/<category>/`; raw snapshots live under `.agents/archive/agent-instructions/`.
3. **Internal only**: `.agents/`, `.memory/`, harness dirs, transcripts, and agent instruction files are never committed to a public remote.
4. **Never break the running harness**: the active harness is detected and skipped. If detection is uncertain, all dot-harness directories are skipped.
5. **Archive before delete**: no destructive cleanup without a recoverable snapshot and a manifest.

## 2. Two-Layer Ignore Model

| Layer | Path | Visibility |
| :--- | :--- | :--- |
| Public | `.gitignore` | Safe to publish; no agent tooling names |
| Internal | `.git/info/exclude` | Local-only, never committed |
| Optional global | `core.excludesFile` | Local machine only |

```bash
# One-time per clone
updateagents --install-excludes

# Optional machine-wide
updateagents --install-excludes --global

# Verify
git check-ignore -v .agents .memory .claude
```

`--install-excludes` writes one managed block. It never edits `.gitignore`.

## 3. Detection & Classification

| Artifact | Category | Default action |
| :--- | :--- | :--- |
| `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.opencode/`, `.commandcode/`, … | harness | `CONSOLIDATE` (archive + remove) unless active → `SKIPPED_ACTIVE` |
| `CLAUDE.md`, `GEMINI.md`, `CODEX.md`, `.cursorrules`, … | instruction | `PROMOTE` to `.agents/standards` or `.agents/context` |
| `CLAUDE.md` = `@AGENTS.md` | instruction | `KEEP_ADAPTER` (one-line opt-in adapter; kept locally and ignored) |
| `transcripts/`, `*.transcript.jsonl`, `*.chat.json`, `*.scratchpad.md` | data | `ARCHIVE` to `.agents/archive/transcripts/` |
| `.codegraph/`, `.slim/`, `.jez/`, `.playwright/` | cache | `PURGE` only with explicit `--hygiene --purge --yes` |
| `.vscode/`, `.idea/`, `.zed/` | ide | `IGNORE_ONLY` |
| `.github/copilot-instructions.md` | instruction | `KEEP_ADAPTER`; regenerate via `--sync-ide`, never auto-removed |

### Active-ish signals

| Harness dir | Signals |
| :--- | :--- |
| `.claude` | `CLAUDECODE`, `CLAUDE_CODE`, `CLAUDE_CODE_ENTRYPOINT` |
| `.cursor` | `CURSOR_TRACE_ID`, `CURSOR_AGENT` |
| `.codex` | `CODEX_HOME`, `CODEX_SANDBOX` |
| `.gemini` | `GEMINI_CLI`, `GEMINI_API_KEY` |
| `.opencode` | `OPENCODE`, `OPENCODE_CONFIG` |
| `.commandcode` | `COMMANDCODE`, `COMMANDCODE_SCRATCHPAD` |
| `.windsurf` | `WINDSURF` |
| `.continue` | `CONTINUE` |
| `.cline` | `CLINE` |
| `.roo` | `ROO` |
| `.trae` | `TRAE` |
| `.hermes` | `HERMES` |
| `.crush` | `CRUSH` |
| `.antigravity` | `ANTIGRAVITY` |

If no signal matches, the engine falls back to `process.execPath`/argv. If still unknown, every dot-harness directory is treated as active and skipped. `--force-active` is an explicit dangerous override.

## 4. Consolidation Map

```text
harness instructions (rules)   → .agents/standards/<topic>.md
harness instructions (facts)   → .agents/context/imported-agent-instructions.md
working research / plans      → .agents/artifacts/<topic>/
user-supplied data / logs     → .agents/dump/<category>/
raw harness snapshot          → .agents/archive/agent-instructions/<stamp>/
transcripts / chat dumps      → .agents/archive/transcripts/
compiled IDE artifacts        → archive; regenerate with --sync-ide
```

Each archive run writes `MANIFEST.md` with source path, category, and SHA-256.

## 5. Commands

```bash
# Read-only report (default)
updateagents . --hygiene

# Consolidate non-active harness artifacts and clean the root
updateagents . --hygiene --consolidate

# Purge disposable caches/transcripts after archiving (explicit confirmation)
updateagents . --hygiene --purge --yes

# CI / pre-commit: fail on unconsolidated root artifacts
updateagents . --hygiene --check

# CI / pre-push: fail if internal paths are tracked
updateagents . --hygiene --check-public

# Local-only ignore block
updateagents . --install-excludes
```

`updateagents` default sync **reports** hygiene findings but never moves harness state; consolidation is explicit (`--hygiene --consolidate`) so an IDE/CLI configuration cannot disappear during a routine context sync. Use `--no-hygiene` to opt out in fixtures/CI.

## 6. Gates

| Gate | Command | Blocks |
| :--- | :--- | :--- |
| Session start | `harness-hygiene-session.sh` | Nothing (advisory report) |
| Pre-commit | `harness-hygiene-pre-commit.sh` | Staged/tracked `.agents/`, `.memory/`, harness dirs, transcripts |
| Pre-push | `harness-hygiene-pre-push.sh` | Any tracked internal path |
| `/git` preflight | `git-preflight.ts --preflight-run` | Public-surface violations |
| CI | `updateagents . --hygiene --check-public` | Any tracked internal path |

## 7. Public Repo Recovery

If a public repo already tracks agent paths:

```bash
git rm -r --cached .agents .memory .claude .cursor
updateagents . --install-excludes
updateagents . --hygiene --check-public
git commit -m "chore(hygiene): untrack internal agent state"
```

History still contains the old paths. Rewriting history is a separate, explicit decision; do not do it automatically.

## 8. Boundaries

- `.memory/**` is never read, written, moved, or validated.
- Symlinks are never followed.
- The active harness is never moved.
- No secret is copied into an archive or manifest.
- Consolidated content is recoverable from `.agents/archive/` + provenance.
