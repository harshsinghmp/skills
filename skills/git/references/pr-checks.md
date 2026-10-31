# PR Checks Reference — Git Skill

Inspect CI check results on an open pull request. Diagnose failures without implementing fixes.

Default stack: GitHub CLI (`gh`) authenticated; target repo on `origin`. Defaults: `--json` on all `gh` calls for machine readability; human-readable summary printed alongside.

## Intake

- Open PR number or branch (if branch, resolve the PR via `gh pr list --head <branch>`).
- Optional: `--json` flag to return only machine-readable output (exit code 0 on success, 1 when checks are failing or PR not found).

## What it does

1. Resolve the PR: `gh pr view <number|branch> --json number,state,baseRefName,headRefName,title`
2. Fetch check runs: `gh pr checks <number> --json name,status,conclusion,checkRunId,detailsUrl`
3. For each failing check (`conclusion != "success"` and `status == "completed"`):
   - Pull the action log via `gh run view <checkRunId> --json status,conclusion,headBranch,duration,steps`
   - Extract the failure snippet: the first step whose `conclusion` is `"failure"`; dump its `name` and the last 30 lines of its log via `gh run view <checkRunId> --log-failed` (tailored to the failed step when possible)
4. Produce two outputs:
   - **Human-readable**: PR title, state, failing check names, the failure snippet (step name + log tail), a one-line diagnosis guess, and the details URL.
   - **Machine-readable (`--json`)**: structured object with `pr`, `checks`, `failures[]`, `diagnosis`, `details_url`.

## What it does NOT do

- Does not implement any fix.
- Does not re-run checks.
- Does not open, close, or comment on the PR.
- Does not touch code.

## Quality gate

- [ ] PR resolved to a number; unknown PR exits with clear error.
- [ ] Check runs fetched for the correct PR; no cross-PR contamination.
- [ ] Failure snippet is the first failed step, with enough log to identify the error class.
- [ ] `--json` output is valid JSON when requested; human path prints to stdout when not.
- [ ] Details URL included so the operator can drill in.

## Routing

- Red CI with a clear test failure → the diagnosis points to the failing test or lint rule; the fix is implemented by the responsible dev mode or a human.
- Red CI with a flaky or infrastructure failure → flag as "likely infra/flaky"; suggest re-run before spending time on code.
- All green → report "all checks passing"; no diagnosis needed.

## Sources

- GitHub CLI: `gh pr`, `gh pr checks`, `gh run view`, `gh run view --log-failed`.
- When a cited source conflicts with a default above, the source wins — record the override and why.
