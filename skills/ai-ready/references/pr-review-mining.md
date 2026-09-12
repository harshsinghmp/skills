# 🔍 PR Review Mining Protocol

This reference describes how `ai-ready` mines merged Pull Requests to discover implicit conventions and codify them into explicit agent instructions.

---

## 💡 The Core Problem

Teams possess dozens of unwritten conventions:
- *"Never export default components."*
- *"Always colocate unit tests in the same directory."*
- *"Do not use `any` in TypeScript; use `unknown` with a Zod guard."*
- *"Database transactions must use `tx` context."*

These rules rarely make it into `README.md`. Instead, they are enforced repeatedly as review comments on Pull Requests. As a result, AI agents repeat the same mistakes, burning developer review time.

---

## 🛠️ Mining Procedure

When GitHub CLI (`gh`) is available and the repository has merged PRs:

### Step 1: List Merged PRs
```bash
gh pr list --state merged --limit 15 --json number,title,mergedAt
```

### Step 2: Fetch Review Comments & Changes Requested
```bash
for PR in $(gh pr list --state merged --limit 10 --json number --jq '.[].number'); do
  echo "=== PR #$PR ==="
  gh pr view "$PR" --json reviews,comments --jq '.reviews[].body, .comments[].body'
done
```

### Step 3: Pattern Clustering & Filter
Filter the mined comments for recurring feedback:
- Exclude ephemeral noise: *"LGTM"*, *"fixed typo"*, *"can you rebase"*, *"merged"*.
- Extract architectural constraints:
  - Language / Typing preferences.
  - Test requirements.
  - Error handling conventions.
  - Naming schemes.

### Step 4: Codification into `.agents/`
Once a rule is identified across ≥2 PR reviews:
1. Append it as a bullet in `.agents/standards/execution-kernel.md` or the relevant domain standard.
2. If it represents an architectural pivot, record an ADR in `.agents/context/decisions.md`.
3. Inform future agents so they never trigger the same review friction again.
