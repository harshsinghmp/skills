# 📦 Monorepo Tagging & Pre-Release Sanitization Protocol

A comprehensive reference for repository hygiene, dynamic `.gitignore` seeding, scratch artifact purging, license validation, and monorepo tag scoping.

---

## 1. Dynamic `.gitignore` Seeding

When initializing a new repository or executing the `git` skill on a project:

```bash
# Check if .gitignore exists in workspace root
if [ ! -f ".gitignore" ]; then
  echo "🛡️ .gitignore missing. Seeding hardened Zero-Leakage template..."
  
  # Copy from canonical ai-ready templates if available in ecosystem
  TEMPLATE_PATH="$(git rev-parse --show-toplevel 2>/dev/null)/ai-ready/templates/gitignore.template"
  if [ -f "$TEMPLATE_PATH" ]; then
    cp "$TEMPLATE_PATH" .gitignore
  else
    # Fallback to minimal hardened zero-leakage baseline
    cat > .gitignore << 'EOF'
# Security & Secrets
.e[n]v
.e[n]v.*
!.e[n]v.example
*.pem
*.key

# Dependencies & Build
node_modules/
dist/
build/

# Worktrees
.worktrees/
worktrees/

# AI Agents & IDE
.agents/
.gemini/
.claude/
.cursor/
.vscode/
.idea/

# OS & Logs
.DS_Store
Thumbs.db
*.log
EOF
  fi
  
  git add .gitignore
  git commit -m "chore(git): seed hardened zero-leakage .gitignore"
else
  echo "✅ .gitignore already present. Skipping initialization."
fi
```

---

## 2. Pre-Release Sanitization Gate

Run these non-negotiable sanitization checks before cutting a production release branch (`release/vX.Y.Z`):

### 1. Sweep Temporary Session & Planning Files
Check for and remove scratch files that must never leak into production releases:
- `SESSION.md` or `planning/`
- Local scratch test files (`test-*.ts`, `test-*.js`)
- Unversioned visual captures (`screenshots/`)
- Temporary agent scratchpads (`scratch/`, `.playwright/`)

```bash
# Audit for unversioned scratch files using fd (with find fallback)
fd -d 2 "^(SESSION\.md|test-.*\.ts|scratch)$" . 2>/dev/null || find . -maxdepth 2 -name "SESSION.md" -o -name "test-*.ts" -o -name "scratch" 2>/dev/null
```
*Action*: Delete them or add them to `.gitignore` before committing.

### 2. Synthetic ADE/IDE Artifact & Placeholder Sweep
Verify that no editor metadata or rich markdown artifacts have overtaken original content:
- ORCA ADE markers: `[[ORCA_RICH_MD:...]]`
- Cursor tokens: `[cursor:...]`, `<|cursor_...|>`
- Windsurf wrappers: `<<<windsurf...>>>`
- Claude Code artifacts: `<antArtifact...>`

```bash
# Audit for synthetic ADE/IDE wrappers
rg -l "\[\[ORCA_RICH_MD|<antArtifact|\[cursor:|<<<windsurf" . --exclude-dir={.git,node_modules,dist,.worktrees}
```
*Action*: If contaminated files are detected, unwrap them immediately via `bun ai-ready/scripts/ai-ready.ts . --sanitize`.

### 3. Private Repo Visibility & License Sanity Check
Before tagging and publishing release notes:

```bash
VISIBILITY=$(gh repo view --json visibility -q '.visibility' 2>/dev/null || echo "UNKNOWN")
```

| Visibility | License Invariant | `package.json` Invariant |
| :--- | :--- | :--- |
| **`PRIVATE`** (Client / Internal) | Proprietary Notice / `UNLICENSED` | `"private": true`, `"license": "UNLICENSED"` |
| **`PUBLIC`** (Open Source) | Open Source License (`MIT`, `Apache-2.0`) | Valid open source `"license"` tag |

*Action*: Stop and notify principal if a private repository contains an open-source MIT notice without proprietary protections.

---

## 3. Monorepo vs. Single-Package Tag Scoping

### Monorepo Detection:
A repository is classified as a monorepo if ANY of the following exist:
- `pnpm-workspace.yaml`
- `lerna.json`
- `turbo.json`
- Top-level `packages/` or `apps/` directory with child `package.json` files

### Tag Syntax Matrix:

```bash
# 1. Detect if workspace is a monorepo
IS_MONOREPO=false
if [ -f "pnpm-workspace.yaml" ] || [ -f "lerna.json" ] || [ -f "turbo.json" ] || [ -d "packages" ]; then
  IS_MONOREPO=true
fi

# 2. Determine Tag Format
if [ "$IS_MONOREPO" = true ]; then
  # Monorepo: Scope to specific package
  TAG_NAME="${PACKAGE_NAME}-v${VERSION}"
else
  # Standard single package: Canonical SemVer tag
  TAG_NAME="v${VERSION}"
fi
```

---

## 4. Tag Pre-Existence Gate

Never overwrite or collide with existing Git tags:

```bash
if git tag -l "$TAG_NAME" | grep -q "^${TAG_NAME}$"; then
  echo "🚨 ERROR: Tag $TAG_NAME already exists in repository!"
  echo "Cannot cut release. Bump version in package.json to next SemVer increment."
  exit 1
fi
```

---

## 5. Dynamic Changelog Delta Extraction

To view all commits between the previous release and current HEAD:

```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
  echo "📋 First Release — All Commits:"
  git log --oneline --no-merges HEAD | head -30
else
  echo "📋 Commits since $LAST_TAG:"
  git log --oneline --no-merges "${LAST_TAG}..HEAD"
fi
```
Use this log to audit [`docs/CHANGELOG.md`](../../docs/CHANGELOG.md) entries under `[Unreleased]` before cutting the release branch.
