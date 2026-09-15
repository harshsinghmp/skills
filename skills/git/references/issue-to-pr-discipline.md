# Issue-to-PR Discipline

Ported mechanics for the `triage` and `pr` modes. Each rule is non-negotiable.

---

## 1. Full Thread Read

Issue bodies go stale; comments carry live scope. Read the full thread (`gh issue view <id> --comments`) before scoping work, and note any scope change from the body in the PR summary.

## 2. Duplicate-PR Sweep

Before writing code, sweep: `gh pr list --search "<issue-number>"` plus 2 keyword variants from the issue title, plus `git log --oneline -- <touched-files>` for overlapping work. Link any candidate duplicate; never open a second PR for the same outcome.

## 3. Design-Intent Check

Before calling behavior a bug, run `git log -p -S "<suspicious-line>" -- <file>` to find why it was written that way. If history shows deliberate intent, treat the issue as a feature request, not a defect.

## 4. Sabotage Run

Write the regression test first and watch it FAIL pre-fix (`bun test <file>`). A test that passes before the fix proves nothing — no green-pre-fix test ever counts as verification evidence.

## 5. Fix the Class

After fixing one call site, rg sibling call sites of the same function/pattern and fix every instance of the same defect. One-site fixes that leave identical bugs next door are rejected at review.

## 6. Honest CI Shepherding

Distinguish own-diff failures (fix them) from baseline/infra flakes. One rerun max for a suspected flake (`gh run rerun <id>`); comment on the PR what landed vs what was pre-existing. Never claim green without live `gh pr checks` evidence.
