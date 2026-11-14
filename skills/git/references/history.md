# Session-Linked Commit History

Procedure for the `history` mode. There is no `memory_commits` MCP tool in this environment — linkage uses `git log` plus the `session_search` tool. Never invent a `memory_commits` dependency.

---

## Intake

Accept scope (path, file, or keyword), plus optional author and date-range filters. Default scope is the current repo; default range is the last 30 commits.

## Procedure

1. Collect commits with filters:
   ```bash
   git log --pretty='%H|%D|%ad|%s' --date=short -n 30 --author="<author>" --since="<date>" -- <scope>
   ```
2. For each distinct scope keyword, call `session_search` to find past Hermes sessions touching that scope.
3. Attach the best-matching session to each commit; when nothing matches, record `no linked session found` — never fabricate a link.

## Deliverable

Render newest-first, one row per commit:

| sha (short) | branch | date | message | linked session |
| :--- | :--- | :--- | :--- | :--- |

## Quality Gate

- Newest-first ordering holds; every row has all five columns.
- Empty result: state `No commits found for <scope> in range` and suggest widening scope or range — never return a blank report.

## Routing

REST fallback (e.g. GitHub commits API): URL-encode all query values (`%20`, `%23`, `%2F`) before interpolating owner, repo, path, or author.
