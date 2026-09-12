# 🌲 Worktree Parallel Lanes Protocol

A deterministic operational guide for executing parallel agent workflows in isolated Git worktrees without context switching, lock collisions, or dev-server disruptions.

---

## 1. Why Worktrees for Multi-Agent Workflows?

When multiple AI agents or human developers collaborate on the same repository:
- **In-Place Branch Churn Collides with Running Processes**: Running `git checkout -b` inside a repo running `bun dev`, Vite, Webpack, or continuous test watchers invalidates node_modules, re-triggers hot-module reloaders, and produces phantom errors.
- **Parallel Subagents Require Isolation**: If two subagents (e.g. Frontend Architect and Backend Architect) execute concurrently on separate features, sharing one working directory causes uncommitted diff collisions.
- **Git Worktrees Guarantee True Process Isolation**: Each worktree has an independent filesystem directory pointing to its own checkout and HEAD pointer, while sharing the underlying `.git` object database and history.

---

## 2. Step 0: Detect Existing Isolation & Submodule Guards

Before creating a new worktree, verify whether you are already operating in an isolated worktree or submodule:

```bash
# Compare git dir against common dir
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)

# Verify submodule status
SUBMODULE_ROOT=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
```

### Decision Matrix:
1. **If `$SUBMODULE_ROOT` is non-empty**: You are inside a Git submodule, NOT a worktree. Treat as a normal repository checkout.
2. **If `$GIT_DIR != $GIT_COMMON` (and not a submodule)**: You are **already inside a linked worktree**.
   - Do NOT nest worktrees.
   - Work in place on the current worktree directory.
3. **If `$GIT_DIR == $GIT_COMMON`**: You are in the main repository checkout. Proceed to create a worktree lane.

---

## 3. Step 1: Directory Selection & `.gitignore` Safety Gate

Worktrees must live inside an explicitly ignored directory to prevent accidentally committing worktree files or child Git pointers into the parent repository.

### Directory Resolution Order:
1. `.worktrees/` at the repository root (Preferred canonical path).
2. `worktrees/` (Alternative if already present).

### Safety Gate:
```bash
# Verify directory is explicitly gitignored
if ! git check-ignore -q .worktrees 2>/dev/null; then
  echo "⚠️ .worktrees is not in .gitignore. Adding before proceeding..."
  echo -e "\n# Git Worktrees\n.worktrees/\nworktrees/" >> .gitignore
  git add .gitignore
  git commit -m "chore(git): ignore worktrees directory"
fi
```

---

## 4. Step 2: Creating the Worktree Lane

Cut the feature branch strictly from `dev` (staging) into the isolated worktree:

```bash
BRANCH_NAME="feat/<slug>"
WORKTREE_PATH=".worktrees/feat-<slug>"

# Ensure staging is current
git checkout dev
git pull origin dev

# Create worktree and branch from dev
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" dev
cd "$WORKTREE_PATH"
```

### Sandbox Fallback:
If `git worktree add` fails due to execution environment sandboxing or container permission restrictions:
- Log warning: `⚠️ Worktree creation blocked by sandbox environment. Falling back to in-place branch switch.`
- Fallback: `git checkout -b "$BRANCH_NAME" dev` in the primary working tree.

---

## 5. Step 3: Runtime Dependency Bootstrap

Inside the isolated worktree directory, install dependencies before running tests:

```bash
# Node.js / Bun
if [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
  bun install
elif [ -f "pnpm-lock.yaml" ]; then
  pnpm install
elif [ -f "package-lock.json" ]; then
  npm install
elif [ -f "package.json" ]; then
  bun install || npm install
fi

# Python / uv
if [ -f "pyproject.toml" ]; then
  uv sync 2>/dev/null || poetry install 2>/dev/null || true
elif [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
fi

# Rust / Cargo
if [ -f "Cargo.toml" ]; then
  cargo check
fi

# Go
if [ -f "go.mod" ]; then
  go mod download
fi
```

---

## 6. Step 4: Baseline Verification

Before writing code, verify that the clean worktree passes the test baseline:

```bash
bun test || npm test || cargo test
```

If tests fail on clean `dev`, investigate staging regression before making feature edits.

---

## 7. Step 5: Phase 11 Worktree Teardown & Housekeeping

Once the feature PR is merged into `dev`:

```bash
# Return to main repo root
cd "$MAIN_REPO_ROOT"

# Safely remove the worktree
git worktree remove "$WORKTREE_PATH"

# Delete local branch if merged
git branch -d "$BRANCH_NAME"

# Prune stale worktree references
git worktree prune
```
