# audit — git audit mode

## When to Use

- **History audit**: Review branch hygiene, commit-message compliance, merge-state
- **Workflow audit**: Verify doc-sync followed every feature, CHANGELOG updated, no direct commits to master

## Checklist

- [ ] Current branch ≠ `master` (commits to master forbidden)
- [ ] All feature branches created from `dev`
- [ ] Commit messages follow Conventional Commits (`<type>(<scope>): <subject>`)
- [ ] No commits without updated test file (for code changes)
- [ ] CHANGELOG has entry under `## [Unreleased]` for each PR
- [ ] `.agents/artifacts/WORKTREE-LEASE.md` released (if held)
- [ ] No merge commits on `dev` (rebase used instead)
- [ ] PR descriptions include test-evidence refs and deploy notes

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Direct commit to master | `PROPOSE-DIFF` | `git` (revert + redo via PR) |
| Non-conventional commit msg | `REPORT-ONLY` | `git` |
| Missing CHANGELOG entry | `AUTO-REPAIR` | `updatedocs` |
| Stale lease | `AUTO-REPAIR` | `coupling-router` (release lease) |

## Output

`.agents/artifacts/audit-git-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
