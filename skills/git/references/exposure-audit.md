# 🛡️ git:audit — Git Secret Exposure Auditing & History Sanitization

Playbook for identifying accidentally committed credentials, private keys, tokens, `.env` files, and cleaning git commit trees before pushing.

> **Internal agent state**: add `updateagents --hygiene --check-public` to the pre-push audit. It fails when `.agents/`, `.memory/`, harness dirs, transcripts, or agent instruction files are tracked. Use `updateagents --install-excludes` to keep them in `.git/info/exclude` without exposing tool names in the public `.gitignore`.

---

## 1. Quick Audit Protocol

### A. Pre-Commit / Pre-Push Secret Check
Run before every commit and push:
```bash
# Search uncommitted tracked and untracked changes for secret patterns
git diff --cached | rg -i "sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|bearer [a-zA-Z0-9_\-\.]{20,}|password\s*[:=]|secret\s*[:=]"

# Check for accidentally staged .env or secret files
git status --porcelain | rg "\.env|\.pem|\.key|id_rsa|credentials"
```

### B. Audit Entire Commit History (Git Log Secret Scan)
Scan recent commit diffs for leaked credentials:
```bash
# Scan last 50 commits
git log -p -n 50 | rg -i "api[_-]?key|secret|token|password|sk-[a-zA-Z0-9]{20,}"
```

---

## 2. Emergency Remediation (When a Secret Was Committed)

1. **Rotate the Credential Immediately**:
   - The moment a token touches git, consider it compromised. Revoke and generate a new key immediately. Do not rely on git history rewrites alone.
2. **Remove File from Git Without Deleting Locally**:
   ```bash
   git rm --cached .env
   echo ".env" >> .gitignore
   git commit -m "fix(security): stop tracking .env file"
   ```
3. **Purge from Commit History (If Unpushed)**:
   ```bash
   # Soft undo the last commit containing the secret
   git reset --soft HEAD~1
   # Unstage the secret file
   git reset HEAD .env
   # Recommit clean files
   git commit -m "feat: clean commit without credentials"
   ```
4. **Purge from History Across Branches (If Pushed to Remote)**:
   Use `git-filter-repo` (modern standard replacing BFG / git filter-branch), then coordinate the rewrite:
   ```bash
   # 1. Announce a push freeze first; every collaborator stops pushing.
   # 2. Rewrite the history.
   git filter-repo --path .env --invert-paths
   # 3. Push only the affected branches with a lease, never --all/--tags.
   git push origin --force-with-lease main dev
   ```
   - **Rotate every credential exposed in the old history first**; a rewrite does not un-leak a key that was already reachable.
   - **Freeze shared branches** for the rewrite window and re-enable pushes only after the force-push lands.
   - **Every collaborator must re-clone.** Existing clones, forks, and cached CI checkouts still contain the secret; `filter-repo` cannot reach them.
   - Avoid `git push --force --all`: it force-updates every branch (including other people's in-flight work) and hides which refs changed.

---

## 3. Mandatory .gitignore Baseline

Ensure every project repository root contains:
```gitignore
.env
.env.*
!.env.example
*.pem
*.key
id_rsa
id_ed25519
*.pfx
*.p12
credentials.json
service-account*.json
```
