# ⚔️ Merge Conflict Resolution & Git Recovery Playbook

A structured operational procedure for assessing, resolving, and recovering from Git merge and rebase conflicts without corrupting repository history or losing code.

---

## 1. Conflict Scope Assessment

When Git reports a conflict during a rebase or merge against `dev`:

```bash
# List all conflicted files immediately
git diff --name-only --diff-filter=U

# Inspect conflict markers across all files using ripgrep (with grep fallback)
rg "^<<<<<<< " . 2>/dev/null || grep -rnE "^<<<<<<< " . --exclude-dir={.git,node_modules,dist,.worktrees}
```

---

## 2. Rebase vs. Merge Decision Matrix

| Situation | Recommended Strategy | Rationale & Safety Rule |
| :--- | :--- | :--- |
| **Feature Branch against `dev`** | `git rebase dev` | Keeps feature history linear and atomic. Use `--force-with-lease` when updating remote. |
| **Shared Branch (`dev`, `master`)** | `git merge --no-ff` | **NEVER REBASE OR FORCE-PUSH SHARED BRANCHES**. History must remain immutable. |
| **Complex Divergence ($\ge 5$ commits conflicted)** | Abort & Manual Extract | Prevents repetitive manual conflict resolution across sequential commits. |

---

## 3. Resolving Conflicts Per File

For each conflicted file:
1. Open the file and locate conflict markers:
   ```text
   <<<<<<< HEAD (Current State on dev)
   const timeout = 5000;
   =======
   const timeout = 10000; // Feature edit
   >>>>>>> feat/my-feature
   ```
2. **Resolution Invariants**:
   - **Orthogonal Edits**: Keep both changes cleanly.
   - **Interface Changes**: Prefer `dev`'s structural architectural interface, and adapt feature logic to match it.
   - **Deleted vs Modified**: If `dev` deleted a deprecated utility that the feature edited, inspect whether the feature still requires it or should migrate to the replacement.
3. Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. Stage resolved file:
   ```bash
   git add <resolved-file>
   ```
5. Continue the rebase or merge:
   ```bash
   # If rebasing:
   git rebase --continue
   # If merging:
   git commit -m "Merge branch 'dev' into feat/<slug>"
   ```

---

## 4. Emergency Abort & Code Extraction Protocol

If a rebase goes wrong, gets stuck in a loop, or causes catastrophic architectural divergence:

### Step 1: Immediately Abort
```bash
# Abort cleanly to restore pre-conflict state
git rebase --abort 2>/dev/null || git merge --abort 2>/dev/null
```

### Step 2: Extract Working Code
Extract the verified feature implementation directly from the remote or local commit into a scratch path:

```bash
mkdir -p /tmp/git-recovery
git show feat/<slug>:path/to/important-file.ts > /tmp/git-recovery/important-file.ts
```

### Step 3: Fast-Forward Branch to Latest `dev`
```bash
git checkout dev
git pull origin dev
git checkout feat/<slug>
git reset --hard dev
```

### Step 4: Re-Apply Extracted Files
Copy the extracted files back into the working tree, run tests, and create a single clean commit:

```bash
cp /tmp/git-recovery/important-file.ts path/to/important-file.ts
bun test
git add -A
git commit -m "feat(<scope>): implement changes cleanly rebased on dev"
git push --force-with-lease origin feat/<slug>
```

---

## 5. Reflog Recovery Recipes

`git reflog` is the ultimate safety net. Git never loses committed objects for at least 30 days unless garbage collected.

### Recipe 1: Recover a Dropped Branch or Overwritten Commit
```bash
# View recent HEAD movements
git reflog -n 25

# Identify the commit before the accidental operation (e.g. HEAD@{3})
# Restore into a fresh recovery branch:
git checkout -b recovery-branch HEAD@{3}

# Verify files are intact:
bun test
```

### Recipe 2: Recover from an Accidental `git reset --hard`
```bash
# Find commit prior to reset
COMMIT_SHA=$(git reflog | grep "reset: moving to" -m 1 | awk '{print $1}')

# Reset safely back to that commit
git reset --hard "$COMMIT_SHA"
```

---

## 6. Safety Golden Rules

1. **Always Use `--force-with-lease`**: Never use bare `--force`. `--force-with-lease` aborts if someone else pushed commits to the remote branch while you were rebasing.
2. **Never Force-Push `master` or `dev`**: Force-pushing to production or staging destroys shared team history and triggers merge cascades.
3. **Verify Tests After Every Conflict Resolution**: Always execute `bun test` or equivalent before pushing a resolved branch.
