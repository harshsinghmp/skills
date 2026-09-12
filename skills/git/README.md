# 🐙 Git Skill — Autonomous End-to-End Release & GitHub Lifecycle Engine

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey.svg)](#)

> **Autonomous, vendor-neutral Git and GitHub release orchestrator.** Replaces fragmented, manual scripts with a deterministic 11-phase pipeline: 9-tier anti-slop issue triage, strict 4-phase branching, automated doc sync, GitHub SEO tuning, production release cuts, and branch cleanup.

---

## 📑 Overview

Most AI coding assistants handle git operations naively: committing directly to `master`, creating sloppy unverified pull requests, omitting changelogs, leaving orphaned branches, and ignoring GitHub discoverability.

The **`git`** skill enforces an uncompromising engineering workflow:

```
[ 📋 Issues ] ──► [ 🌿 feat/* ] ──► [ 🧪 Test & Sync ] ──► [ 🔀 PR (dev) ] ──► [ 🚀 release/v* ] ──► [ 🏷️ Tag & Cleanup ]
```

### Key Highlights

- **Dynamic `.gitignore` Seeding**: Automatically detects missing `.gitignore` files and seeds hardened Zero-Leakage baselines (ignoring `.worktrees/`, `.env*`, and agent artifacts).
- **Worktree Parallel Lanes**: Recommended feature lanes under `.worktrees/` for concurrent multi-agent development and protecting active dev servers (`bun dev`, Vite) from branch switching churn.
- **9-Tier Anti-Slop Triage**: Automatically classify issues (`actionable-bug`, `actionable-feature`, `duplicate`, `generated-slop`, etc.) before writing code.
- **Strict 4-Phase Branch Model**: Protects `master` (production). All work stems from `dev` (`staging`), merges to `dev`, stages via `release/vX.Y.Z`, and back-merges after release.
- **Interactive Rebase & Conflict Recovery**: Clean atomic commits via `git rebase -i dev`, with emergency code extraction (`git show ... > /tmp/...`) and reflog recovery recipes.
- **Automated Doc & Changelog Sync**: Triggers `updatedocs` and bumps `CHANGELOG.md` unreleased sections prior to opening PRs.
- **GitHub SEO & Presentation Pass**: Automatically synchronizes repository topics, description, and homepage via `gh repo edit`, while polishing README visual hierarchy.
- **Pre-Release Sanitization Gate**: Sweeps scratch artifacts (`SESSION.md`, `scratch/`, `test-*.ts`) and audits repository visibility vs. licensing invariants.
- **Monorepo-Aware Tagging**: Automatically detects monorepos (`pnpm-workspace.yaml`, `packages/`, `turbo.json`, `lerna.json`) and scopes tags as `{package}-vX.Y.Z` (falling back to `vX.Y.Z`).
- **Safe Bulk Branch Pruning**: Deterministically cleans merged feature branches and stale worktrees without endangering protected branches.

---

## ⚡ Quick Start

Trigger the skill in your AI assistant:

```text
# Run end-to-end release lifecycle for an issue
"Execute git workflow for issue #5"

# Seed .gitignore and initialize worktree lane
"Prepare isolated worktree feature branch for billing engine"

# Triage incoming issues
"Triage open issues with anti-slop gate"

# Prepare and open PR
"Prepare PR against dev for current branch"

# Cut production release (with pre-release sanitization gate)
"Cut production release v1.9.0"

# Sync GitHub SEO and topics
"Sync github topics and repository description"
```

---

## 🏛️ The 11-Phase Lifecycle

0. **Workspace Gate & Dynamic `.gitignore`**: Ensure zero-leakage `.gitignore` exists (seed from template if missing).
1. **Issue Intake & Anti-Slop Triage**: Filter out ungrounded slop or duplicates; capture verifiable reproducer steps.
2. **Feature Branch Creation (Worktree or In-Place)**: Create isolated lane under `.worktrees/feat-<slug>` or branch from `dev`.
3. **Surgical Implementation, Interactive Rebase & Local Gate**: Minimal diffs, atomic rebase (`git rebase -i dev`), `bun test`, static typing, and secret scans.
4. **Documentation Synchronization**: Run `updatedocs` and update `CHANGELOG.md` under `[Unreleased]`.
5. **GitHub SEO & Presentation**: Audit topics (`gh repo edit --add-topic`), description, and Open Graph banner.
6. **PR Creation & Review Gate**: Open PR against `dev` with test receipts.
7. **Staging Integration & Conflict Playbook**: Merge to `dev`, triage any rebase/merge conflicts with emergency extraction fallbacks.
8. **Pre-Release Sanitization & Release Prep**: Sweep scratch files, verify licensing, cut `release/vX.Y.Z` from `dev`, bump version, and stamp `CHANGELOG.md`.
9. **Production Merge & Monorepo Tagging**: Merge into `master` (`--no-ff`), create annotated tag `vX.Y.Z` (or `{package}-vX.Y.Z`), and draft GitHub release.
10. **Back-Merge**: Merge `master` back into `dev` to keep staging synchronized.
11. **Safe Pruning & Teardown**: Bulk prune merged feature branches, remove worktrees, and close resolved issues.

---

## 📚 References

- 🌲 [Worktree Parallel Lanes Protocol](references/worktree-parallel-lanes.md)
- ⚔️ [Merge Conflict Resolution & Git Recovery Playbook](references/conflict-resolution-and-recovery.md)
- 📦 [Monorepo Tagging & Pre-Release Sanitization Protocol](references/monorepo-and-sanitization.md)
- 🌳 [Branching & Release Matrix](references/branching-and-release-matrix.md)
- 🛡️ [Anti-Slop Issue & PR Triage Guide](references/anti-slop-triage.md)
- 🎨 [GitHub SEO & Presentation Standards](references/github-seo-and-presentation.md)
- 📜 [Changelog Policy & High-Signal Craft Standard](../updatedocs/references/CHANGELOG-POLICY.md)

---

## 📜 License

MIT License. Free to use across all AI coding assistants and agent runtimes.
