# Delegate Mode — deterministic scope, then LLM judgment

> From the "delegate execution" pattern: don't let the review scope float. Pick the
> changed-file scope deterministically, resolve the review mode from that scope, then
> run the LLM pass over that scope only. Loaded by the `delegate` mode.

## Protocol

1. **Pick the scope deterministically.** Enumerate the changed files/commits (from
   the diff, PR, or working tree). If the change is ambiguous, use the smallest
   deterministic rule: e.g. "files modified in the last commit", "files in this PR",
   "files matching `<path>`". Record the rule — scope must be reproducible, not a
   gut call. Measure what the resolved mode will actually read: diff-shaped
   targets → `CHANGED_LINES` (additions + deletions from `--numstat`) and
   `CHANGED_FILES`; path targets → full contents (file count + total lines).
   Untracked text files count whole; any binary file makes the scope non-small
   (source: `cherry-studio-gh-pr-review`, raw SKILL.md fetched 2026-09-19).
   `SMALL_SCOPE` holds only when `CHANGED_LINES <= 1000`,
   `CHANGED_FILES <= 20`, and no binary file is present.
2. **Resolve the mode** from that scope's nature:
   - single-hunk, one file → `hotfix`
   - API/signature-only → `contract`
   - security-sensitive surface → `security`
   - whole module / cross-file invariants → `audit`
   - otherwise → `diff`
   Load only the resolved mode's references.
3. **Run the LLM pass over that scope only.** Apply the resolved mode's procedure to
   the deterministic file set. Do not let analysis wander into files the scope
   picked them out of — an out-of-scope concern is logged as an aside, not padded
   into the verdict.
4. **Report scope + mode + findings** together, so the author can reproduce which
   files were judged and under which lens.

## Output

```
DELEGATED REVIEW — <mode> over <n> files (scope rule: <rule>)
Per finding: location / problem / fix / confidence
Out-of-scope asides: <list, not judged>
```