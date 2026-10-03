# 🛡️ git:audit — Git Secret Exposure Auditing & History Sanitization

Playbook for identifying accidentally committed credentials, private keys, tokens, `.env` files, and cleaning git commit trees before pushing.

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
   Use `git-filter-repo` (modern standard replacing BFG / git filter-branch):
   ```bash
   git filter-repo --path .env --invert-paths
   git push origin --force --all
   ```

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
