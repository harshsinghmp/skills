<!-- Anti-slop PR template: every section is load-bearing. Unverified PRs do not merge. -->

## Why

<!-- Rationale and motivation — the non-obvious "why", not a restatement of the diff. -->
<!-- Links: Closes #<issue-id> / Resolves #<issue-id> -->

## What

<!-- Bulleted breakdown of the changes. Touch only what is necessary. -->

- 

## Verification Evidence

<!-- Proof over assertion: paste real command output, not claims. -->

- [ ] All automated tests pass (`bun test` / project equivalent)
- [ ] Static type check passes where applicable (`tsc --noEmit`)
- [ ] Pre-ship secret scan passed (`rg -i "ghp_|sk-[a-zA-Z0-9]{20,}|PRIVATE KEY" .`)
- [ ] Documentation synchronized (`CHANGELOG.md`, affected docs)

```text
<paste verification command output here>
```

## Anti-Slop Checklist

- [ ] No secrets, tokens, or `.env` values committed
- [ ] No unrequested refactors of adjacent code (minimal-diff doctrine)
- [ ] No synthetic ADE/IDE artifacts (`[[ORCA_RICH_MD:...]]`, Cursor/Claude wrappers)
- [ ] Commit messages follow Conventional Commits (`<type>(<scope>): summary`)
- [ ] Ruled-out alternatives documented where non-obvious
