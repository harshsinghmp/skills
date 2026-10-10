# Knowledge Hygiene Rules Reference

## Core Referential Rules

1. **Explicit Relative Paths**: Prefer relative links (`../docs/guide.md`) over absolute paths to ensure portability across different host environments.
2. **Anchor Consistency**: Section anchors (`#when-to-use`) must match GitHub header slugification (lowercase, hyphens, no special characters).
3. **Zero Orphan Invariant**: Every knowledge document in a subfolder must be reachable starting from `README.md`, `llms.txt`, or `.agents/context/index.md`.
4. **Secret Scrubbing**: Zero `sk-*`, `ghp_*`, `npm_*`, or private key tokens in any markdown file or commit message.

## Remediation Boundary Rules

5. **Evidence Before Edit**: Every `AUTO-REPAIR` edit must be reconstructable from the audit report (file:line, old value, new value). Silent repairs violate hygiene even when the fix is correct.
6. **Gate on Ownership, Not Convenience**: A document governed by another workflow (`AGENTS.md` → `updateagents`, released changelog sections → release process) receives findings, not edits. Route first; repair locally only what no companion owns.
7. **Masking Is Not Rotation**: `[REDACTED]`-ing a leaked credential without recommending rotation leaves the credential live. Secret findings are always `PROPOSE-DIFF` plus a rotation recommendation.
8. **Never Invent Frontmatter**: Fill missing frontmatter keys from verifiable repository facts (manifests, registries, existing docs) or leave the key absent and `PROPOSE-DIFF`. Fabricated values are a hygiene defect of their own.
