# Changelog

All notable changes to this hub are documented here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Upstream skill-content syncs ride the automated PRs and are not listed individually.

## [Unreleased]

### Added

- Link-only ingest protocol in `AGENTS.md`: any agent with just a skill link runs `bun run add <link>` then `bun run validate`.
- Contract tests (`tests/link-ingest.test.ts`) covering collision suffixing and path re-registration skips.
- `CONTRIBUTING.md`, issue templates, and pull request template.

### Fixed

- Single-skill ingest now suffixes taken names (`-2`, `-3`) instead of erroring, matching whole-repo and `--discover` behavior.
- GitHub release/archive URLs rejected with an actionable resend-as-tree/blob error instead of surprise whole-repo ingest.
- `bun run add --category` validates against the seven manifest categories.
- `AGENTS.md` invariants corrected to match enforcement: missing frontmatter fields are errors, short descriptions and folder/name drift are warnings (known: `agent-handoff`, `code-review-linus-torvalds-style`).
