# 🛡️ git:gitignore-audit — Recursive .gitignore Wildcard Traps & Cache Auditing

This reference codifies detection and remediation of high-risk `.gitignore` patterns that cause silent leaks, ignored whitelist directives, and cache desynchronization across multi-tier repositories.

---

## 1. The 4 Canonical .gitignore Pitfalls

### Pitfall 1: Negative Wildcard Parent Directory Trap
**The Defect**:
In Git's path matching engine, if a parent directory is excluded, Git *prunes directory traversal immediately*. Git will never scan inside that directory, making any subsequent negative rule (`!`) completely ineffective.

```gitignore
# ❌ BROKEN: Git prunes 'logs/' immediately. '!logs/keep.log' is SILENTLY IGNORED!
logs/
!logs/keep.log
```

**The Solution**:
Exclude directory contents via wildcard (`*`) instead of the directory itself:
```gitignore
# ✅ WORKING: Traverses 'logs/' directory, ignores all contents except 'keep.log'
logs/*
!logs/keep.log
```

### Pitfall 2: Tracked-Ignored Index Cache Trap
**The Defect**:
`.gitignore` only prevents untracked files from being staged. If a file was *already tracked* in the Git index before the rule was added, Git continues tracking and staging changes to it. Developers falsely believe confidential files or local configs (`.env`, `config.local.json`) are ignored.

**The Solution**:
Audit tracked files matching ignore patterns:
```bash
git ls-files -i --exclude-standard
```
Untrack cached files without deleting them locally:
```bash
git rm --cached <path-to-file>
```

### Pitfall 3: Unanchored Wildcard Path Collision
**The Defect**:
Rules without leading slashes match directories anywhere in the repository hierarchy:
```gitignore
# Matches root 'build/', but also unintended source directories like 'src/components/build/'
build/
dist/
```

**The Solution**:
Anchor top-level directories with a leading slash `/` unless multi-package recursion is explicitly desired:
```gitignore
/build/
/dist/
```

### Pitfall 4: Missing Trailing Slash on Directory Targets
**The Defect**:
Omitting trailing slashes on directories (`dist` instead of `dist/` or `/dist/`) causes Git to match both directories and any files or scripts named `dist`.

---

## 2. Automated CLI Engine (`gitignore-audit.ts`)

The `gitignore-audit.ts` utility automates audit and remediation:

```bash
# 1. Audit .gitignore files for parent directory traps and syntax flaws
bun skills/core-engine/git/scripts/gitignore-audit.ts --audit

# 2. Check for tracked files that match .gitignore rules (Index Cache Trap)
bun skills/core-engine/git/scripts/gitignore-audit.ts --check-tracked

# 3. Automatically fix parent directory traps in .gitignore (converts dir/ to dir/* for negated children)
bun skills/core-engine/git/scripts/gitignore-audit.ts --fix

# 4. Safely untrack cached files from git index without deleting local files
bun skills/core-engine/git/scripts/gitignore-audit.ts --untrack-cached

# 5. Output structured JSON for CI/CD gates
bun skills/core-engine/git/scripts/gitignore-audit.ts --audit --json
```

---

## 3. Integration in Git Lifecycle Phase 0

Run `gitignore-audit.ts --audit` and `--check-tracked` during Phase 0 before staging any feature branch commits or preparing release tags to ensure zero leaked or untracked state.
