## Why

<!-- Problem, trigger, or upstream change driving this PR. Link issue if any. -->

## What

<!-- Files changed + behavior change. One line per meaningful change. -->

## Verification

<!-- Paste receipts. All three required for engine changes; validate required for skill-only changes. -->

```text
bun run validate  →
bun test          →
bun run typecheck →
```

## Anti-slop checklist

- [ ] No hand-created `skills/<name>/` folders (ingest owns registration)
- [ ] No edits inside synced upstream `SKILL.md` files
- [ ] No silent overwrites — collisions suffixed (`-2`, `-3`)
- [ ] `CHANGELOG.md` entry added under `## [Unreleased]` (skip only for automated sync PRs)
- [ ] No secrets, tokens, `.env`, or provenance meta files committed
- [ ] AGENTS.md updated if agent behavior or rules changed
