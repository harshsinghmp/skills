---
name: git
aliases: ["git-flow","git-lifecycle","github-workflow","git-workflow","github-release"]
description: "Autonomous end-to-end Git & GitHub release engine: 9-tier anti-slop issue triage, strict 4-phase branching (dev/master/release/feat), surgical test gating, automated doc sync, PR review gates, GitHub SEO & Open Graph asset tuning, production release cuts with semver tagging, and branch cleanup. Trigger when asked to: 'manage git workflow', 'triage issues', 'create PR', 'release project', 'cut release', 'run git', 'sync github seo', or 'execute release lifecycle'."
version: 1.0.1
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: core-engine
metadata:
  skill_orchestration:
    pre: ["updatedocs", "code-review"]
    optional: ["gauntlet-loop"]
  category: core-engine
  priority: 3
  aliases: ["git-flow","git-lifecycle","github-workflow","git-workflow","github-release"]
  suggested_skills: ["code-review","updatedocs","ai-ready","gauntlet-loop"]
  hermes:
    tags: [git, github, release, pr, triage, branching, semver, workflow, devops, seo]
    related_skills: [code-review, updatedocs, ai-ready, gauntlet-loop]
    suggested_skills: [code-review, updatedocs, ai-ready, gauntlet-loop]
    requires_tools: [bash, run_command, view_file, write_to_file]
  openclaw:
    category: core-engine
    suggested_skills: [code-review, updatedocs, ai-ready, gauntlet-loop]
    primary_triggers: ["manage git workflow","triage issues","create PR","release project","cut release","run git","sync github seo","execute release lifecycle"]
    requires_tools: [bash, run_command, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🐙 Git — Autonomous End-to-End Release & GitHub Lifecycle Engine

> **Aliases**: `git-flow` | `git-lifecycle` | `github-workflow` | `git-workflow` | `github-release`

Autonomous, vendor-neutral Git and GitHub release orchestrator. Enforces the strict **4-Phase Branch Model** (`master` production, `dev` staging, `release/vX.Y.Z` cuts, `feature/*` lanes), 9-tier anti-slop issue triage, automated documentation synchronization, GitHub SEO/metadata tuning, semantic release tagging, and post-release cleanup.

---

## When to Use

Execute this skill when:
- Triage and classify incoming GitHub issues or bug reports before writing code.
- Starting feature or bugfix development that requires a clean branch from `dev`.
- Preparing a pull request with verified test evidence, secret scanning, and automated doc updates.
- Optimizing GitHub repository SEO, topics, tags, descriptions, and README visual hierarchy.
- Cutting a production release: staging on `release/vX.Y.Z`, merging into protected `master`, tagging with SemVer (`vX.Y.Z`), back-merging to `dev`, and publishing GitHub release notes.
- Cleaning up merged local and remote branches safely after a sprint or milestone.

Do **NOT** use this skill for:
- One-line scratch edits in untracked local exploration workspaces.
- Committing directly to `master` (commits to `master` are strictly prohibited).

---

## Quick Reference

### The 11-Phase Lifecycle Protocol

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       11-PHASE LIFECYCLE PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Issue Intake & 9-Tier Anti-Slop Triage                                   │
│ 2. Feature Branch Creation from dev (feat/*, fix/*)                         │
│ 3. Surgical Code Edits & Local Gate (bun test, tsc, secret scan)             │
│ 4. Documentation & Changelog Sync (updatedocs)                              │
│ 5. GitHub SEO, Open Graph & README Copywriting Pass                         │
│ 6. PR Creation Against dev with Evidence Receipt                            │
│ 7. Staging Integration & Merge into dev                                     │
│ 8. Cut release/vX.Y.Z from dev & Bump package.json                          │
│ 9. Production Merge into master (no-ff) + Tag vX.Y.Z + GitHub Release       │
│ 10. Back-Merge master into dev                                              │
│ 11. Branch Cleanup & Linked Issue Closure                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9-Tier Anti-Slop Classification Matrix

| Classification | Meaning | Action |
| :--- | :--- | :--- |
| `actionable-bug` | Reproducible defect with clear error trace | Create `fix/*` branch from `dev` |
| `actionable-feature` | Scoped request matching product roadmap | Create `feat/*` branch from `dev` |
| `actionable-docs` | Missing, stale, or conflicting documentation | Run `updatedocs` or `docs/*` branch |
| `duplicate` | Another issue/PR covers identical outcome | Link canonical ticket; close duplicate |
| `spam-or-promotion` | Irrelevant marketing or malicious content | Close immediately with summary note |
| `generated-slop` | Mechanically generated or ungrounded diffs | Reject or demand narrow reproducer |
| `unsafe-or-secret` | Exposes tokens, keys, or exploit payloads | Move to private path; redact secrets |
| `not-reproducible` | Lacks runtime environment or steps | Request reproducer before writing code |
| `externally-blocked`| Blocked on external API or credential | Defer with explicit unblock condition |

### Branching Rules & Permissions

| Branch | State | Protection | Allowed Source | Allowed Target |
| :--- | :--- | :--- | :--- | :--- |
| `master` | Production | Protected | `release/*`, `hotfix/*` | Deployment |
| `dev` | Staging | Active Target | `feat/*`, `fix/*`, `master` | `release/*` |
| `feat/*` | Working | Working branch | `dev` | `dev` |
| `fix/*` | Working | Working branch | `dev` | `dev` |
| `release/*` | Staging | Release branch | `dev` | `master` & `dev` |
| `hotfix/*` | Urgent | Hotfix branch | `master` | `master` & `dev` |

---

## Procedure

### Phase 0: Workspace Security & Dynamic `.gitignore` Initialization
Before executing any Git operations or staging commits, verify workspace repository hygiene:
1. **Dynamic `.gitignore` Seeding**:
   ```bash
   if [ ! -f ".gitignore" ]; then
     echo "🛡️ .gitignore missing. Seeding hardened Zero-Leakage template from ai-ready..."
     TEMPLATE_PATH="$(git rev-parse --show-toplevel 2>/dev/null)/ai-ready/templates/gitignore.template"
     if [ -f "$TEMPLATE_PATH" ]; then
       cp "$TEMPLATE_PATH" .gitignore
     else
       cat > .gitignore << 'EOF'
.e[n]v
.e[n]v.*
!.e[n]v.example
node_modules/
dist/
build/
.worktrees/
worktrees/
.agents/
.gemini/
.claude/
.cursor/
.DS_Store
*.log
EOF
     fi
     git add .gitignore
     git commit -m "chore(git): seed hardened zero-leakage .gitignore"
   else
     # Ensure worktrees directory is ignored
     if ! git check-ignore -q .worktrees 2>/dev/null; then
       echo -e "\n# Git Worktrees\n.worktrees/\nworktrees/" >> .gitignore
     fi
   fi
   ```

### Phase 1: Issue Intake & Anti-Slop Triage
1. View issue details using GitHub CLI:
   ```bash
   gh issue view <issue-id>
   ```
2. Classify against the 9-tier taxonomy.
3. If non-actionable, comment with clear evidence and close or defer.
4. If actionable, note the exact minimal scope and proceed to Phase 2.

### Phase 2: Feature Branch Creation & Worktree Parallel Lanes
Choose the execution lane appropriate for your environment:

#### Option A: Worktree Parallel Lane (Recommended for Multi-Agent Workflows & Active Watchers)
Protects running dev servers (`bun dev`), file watchers, and parallel subagents from branch-switching churn:
1. **Detect Existing Isolation & Submodule Guard**:
   ```bash
   GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
   GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
   SUBMODULE=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
   # If GIT_DIR != GIT_COMMON and no SUBMODULE, already in a worktree—work in place!
   ```
2. **Create Worktree Lane**:
   ```bash
   git checkout dev && git pull origin dev
   git worktree add .worktrees/feat-<slug> -b feat/<issue-id>-<slug> dev
   cd .worktrees/feat-<slug>
   ```
3. **Bootstrap & Verify Clean Baseline**:
   ```bash
   bun install || npm install || cargo check || true
   bun test || npm test || cargo test
   ```
*(For detailed worktree mechanics, see [Worktree Parallel Lanes](references/worktree-parallel-lanes.md)).*

#### Option B: In-Place Working Tree Lane (Standard Single-Agent Fallback)
Used when sandboxing restricts worktrees or for simple isolated edits:
1. Ensure working tree is clean and `dev` is up to date:
   ```bash
   git checkout dev && git pull origin dev
   git checkout -b feat/<issue-id>-<slug> dev
   ```

### Phase 3: Surgical Implementation, Interactive Rebase & Local Verification Gate
1. Implement the requested changes following the **Surgical Changes Doctrine** (touch only what is necessary; no unrequested refactors of adjacent code).
2. **Interactive Rebase & Atomic Commits**:
   - Keep commits atomic and self-contained.
   - Clean up intermediate checkpoint commits before pushing:
     ```bash
     git rebase -i dev  # Squash fixups, clean up commit messages
     ```
   - When updating a remote feature branch, always use `--force-with-lease` (never bare `--force` and never on shared branches).
3. Execute the verification suite:
   ```bash
   # Run tests
   bun test
   # Run type checks
   tsc --noEmit
   # Run pre-ship secret scan
   bun ~/.config/LIFEOS/runtime/TOOLS/SecretScan.ts . 2>/dev/null || rg -i "ghp_|sk-[a-zA-Z0-9]{20,}|PRIVATE KEY" . || grep -riE "ghp_|sk-[a-zA-Z0-9]{20,}|PRIVATE KEY" . --exclude-dir={.git,node_modules,dist}
   ```
4. Commit using Conventional Commits format:
   ```bash
   git add -A
   git commit -m "feat(<scope>): <imperative summary> (Closes #<issue-id>)"
   ```

### Phase 4: Documentation Synchronization (`updatedocs`)
1. Invoke `updatedocs` to synchronize project context with new code behavior:
   ```bash
   # Update CHANGELOG.md under [Unreleased] following the High-Signal Feature Craft Standard
   # (Section 4 in updatedocs/references/CHANGELOG-POLICY.md: thematic naming, multi-category, PR links)
   # Synchronize .agents/context/current.md
   ```
2. If docs were updated, commit:
   ```bash
   git add CHANGELOG.md .agents/context/
   git commit -m "docs(<scope>): update documentation and changelog"
   ```

### Phase 5: GitHub SEO, Open Graph & Presentation Polish
1. Audit and sync repository topics, description, and homepage:
   ```bash
   gh repo edit --add-topic "ai-agents,developer-tools,agent-skills,devops,release-automation"
   gh repo edit --description "Autonomous end-to-end Git release engine with anti-slop issue triage and automated doc sync."
   ```
2. Verify social preview card exists in `assets/banner.svg` or `assets/banner.png`.
3. Check README visual layout against Refactoring UI standards (clean badges, scannable tables, crisp typography, copy-paste quickstart).

### Phase 6: Pull Request Creation & Review Gate
1. Push the branch to remote:
   ```bash
   git push -u origin feat/<issue-id>-<slug>
   ```
2. Open PR against `dev`:
   ```bash
   gh pr create --base dev --title "feat(<scope>): <summary>" --body "$(cat << 'EOF'
   ### Summary
   - Concise summary of changes.

   ### Verification Evidence
   - [x] All automated tests pass (`bun test`).
   - [x] Static type check passes (`tsc --noEmit`).
   - [x] Pre-ship secret scan passed.
   - [x] Documentation synchronized.

   Closes #<issue-id>
   EOF
   )"
   ```

### Phase 7: Staging Integration & Conflict Resolution Playbook (`dev`)
1. Verify CI workflow passes:
   ```bash
   gh pr checks
   ```
2. **Merge Conflict Resolution (If conflicts occur during staging)**:
   - **Scope Assessment**:
     ```bash
     git diff --name-only --diff-filter=U
     ```
   - **Rebase vs. Merge Decision**: Rebase feature branches (`git rebase dev`); never rebase or force-push shared branches (`dev`, `master`). Use `--force-with-lease` on feature branches.
   - **Emergency Abort & Code Extraction**: If rebase loops or diverges catastrophically:
     ```bash
     git rebase --abort 2>/dev/null || git merge --abort 2>/dev/null
     git show feat/<slug>:path/to/file > /tmp/recovered-file
     # Reset branch to latest dev, re-apply extracted files, test, and commit cleanly
     ```
   - **Reflog Safety Net**: Recover lost states with `git reflog -n 25` and `git checkout -b recovery-branch HEAD@{n}`.
   *(For full details, see [Conflict Resolution & Recovery Playbook](references/conflict-resolution-and-recovery.md)).*
3. Merge PR into `dev` using squash or linear rebase:
   ```bash
   gh pr merge --squash --delete-branch=false
   git checkout dev && git pull origin dev
   ```

### Phase 8: Cut Production Release Branch & Pre-Release Sanitization Gate
1. **Pre-Release Sanitization Gate**:
   - Sweep and purge uncommitted scratch files (`SESSION.md`, `planning/`, `screenshots/`, `test-*.ts`, `scratch/`).
   - Audit repository visibility and licensing:
     ```bash
     VISIBILITY=$(gh repo view --json visibility -q '.visibility' 2>/dev/null || echo "UNKNOWN")
     # Ensure private client repos carry proprietary notices and package.json has "private": true
     ```
   - **Synthetic ADE/IDE Artifact Sweep**: Audit for and unwrap any synthetic ADE/IDE placeholders before release:
     ```bash
     if rg "\[\[ORCA_RICH_MD|<antArtifact|\[cursor:|<<<windsurf" . --exclude-dir={.git,node_modules,dist,.worktrees}; then
       echo "🚨 Synthetic ADE/IDE artifacts detected! Run 'bun ai-ready/scripts/ai-ready.ts . --sanitize' before release."
       exit 1
     fi
     ```
2. **Determine SemVer Version & Monorepo Tag Scoping**:
   - Auto-detect monorepo (`pnpm-workspace.yaml`, `packages/`, `lerna.json`, `turbo.json`):
     - Monorepo format: `{package-name}-v{semver}`
     - Standard single package: `v{semver}`
   - **Tag Pre-Existence Gate**:
     ```bash
     if git tag -l "$TAG_NAME" | (rg -q "^${TAG_NAME}$" 2>/dev/null || grep -q "^${TAG_NAME}$"); then
       echo "🚨 Tag $TAG_NAME already exists! Bump version in package.json."
       exit 1
     fi
     ```
   *(For sanitization & monorepo rules, see [Monorepo & Sanitization Protocol](references/monorepo-and-sanitization.md)).*
3. Cut release branch from updated `dev`:
   ```bash
   git checkout -b release/vX.Y.Z dev
   ```
4. Bump version in `package.json` and stamp `CHANGELOG.md` with version and release date:
   - Audit `CHANGELOG.md` against the High-Signal Feature Craft Standard (`updatedocs/references/CHANGELOG-POLICY.md`).
   - Append the comparison diff URL before the release divider:
     `**Full Changelog**: https://github.com/<owner>/<repo>/compare/v<PREV>...v<NEW>`
5. Commit release preparation:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore(release): vX.Y.Z"
   ```

### Phase 9: Production Merge & Semantic Tagging
1. Switch to `master` and merge the release branch with `--no-ff`:
   ```bash
   git checkout master
   git pull origin master
   git merge --no-ff release/vX.Y.Z -m "Release: vX.Y.Z"
   git push origin master
   ```
2. Create annotated tag and push:
   ```bash
   git tag -a vX.Y.Z -m "release: vX.Y.Z"
   git push origin vX.Y.Z
   ```
3. Create GitHub release with release notes:
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file RELEASE_NOTES.md || gh release create vX.Y.Z --generate-notes
   ```

### Phase 10: Back-Merge to `dev`
1. Merge `master` back into `dev` to keep staging strictly synchronized:
   ```bash
   git checkout dev
   git merge master
   git push origin dev
   ```

### Phase 11: Safe Branch Pruning, Worktree Teardown & Issue Closure
1. Delete local and remote feature/release branches safely:
   ```bash
   git branch -d feat/<issue-id>-<slug>
   git push origin --delete feat/<issue-id>-<slug> 2>/dev/null || true
   git branch -d release/vX.Y.Z
   git push origin --delete release/vX.Y.Z 2>/dev/null || true
   ```
2. **Safe Bulk Branch Pruning** (Sweeps merged branches while protecting `dev`, `master`, and `main`):
   ```bash
   git branch --merged dev | (rg -v '^\*|main|master|dev|develop' 2>/dev/null || grep -vE '^\*|main|master|dev|develop') | xargs -r git branch -d
   git fetch --prune
   ```
3. **Worktree Teardown** (If feature lane was executed in a worktree):
   ```bash
   cd "$MAIN_REPO_ROOT"
   git worktree remove .worktrees/feat-<slug> 2>/dev/null || true
   git worktree prune
   ```
4. Close linked issues with release receipts:
   ```bash
   gh issue close <issue-id> --comment "Resolved and released in vX.Y.Z."
   ```

---

## Pitfalls

- **Never Commit Directly to `master`**: Direct commits to `master` violate production protection invariants. All changes must arrive via `dev` and `release/*`.
- **Never Skip the Verification Gate**: Merging unverified PRs introduces regressions and breaks staging pipelines. Always run tests and secret scans before opening or merging PRs.
- **Never Leave Stale Branches**: Unmerged or orphaned branches create cognitive clutter and trigger spurious merge conflicts. Clean up immediately after release.
- **Never Include Unredacted Credentials**: Scan diffs for `.env` files, API keys (`sk-*`, `ghp_*`), and private tokens before pushing.
- **No Vague Commit Messages**: Messages like "fixes bug" or "updates" are strictly forbidden. Always use Conventional Commits with scope and rationale.
- **Never Force-Push Shared Branches**: `--force-with-lease` is permissible only on isolated feature branches; force-pushing `dev` or `master` is catastrophic.

---

## Verification

Before marking this skill complete, verify:
1. `git status` shows a clean working tree.
2. `master` and `dev` branch pointers are properly synchronized.
3. Feature branch is cut strictly from `dev` (in-place or via `.worktrees/`).
4. Tests and secret scans pass cleanly.
5. GitHub release is published with valid tag `vX.Y.Z` (or `{package}-vX.Y.Z` in monorepos).
6. Obsolete feature branches and worktrees have been deleted locally and remotely.

---

## References

- 🌲 [Worktree Parallel Lanes Protocol](references/worktree-parallel-lanes.md)
- ⚔️ [Merge Conflict Resolution & Git Recovery Playbook](references/conflict-resolution-and-recovery.md)
- 📦 [Monorepo Tagging & Pre-Release Sanitization Protocol](references/monorepo-and-sanitization.md)
- 🌳 [Branching, Commits & Release Matrix](references/branching-and-release-matrix.md)
- 🛡️ [Anti-Slop Issue Intake Matrix](references/anti-slop-triage.md)
- 🎨 [GitHub SEO & Open Graph Presentation Guide](references/github-seo-and-presentation.md)
- 📜 [Changelog Policy & High-Signal Craft Standard](../updatedocs/references/CHANGELOG-POLICY.md)
