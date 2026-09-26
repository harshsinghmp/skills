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

## 7. Visual Reviewer Outline

(source: `humanlayer/skills` `visual-pr` + `show-me`, MIT — outline conventions only)

Write the PR body for the reviewer's comprehension, not as a changelog:

- **Why the change**: exactly one sentence.
- **Special things to note**: 1–3 bullets — reviewer warnings, migrations, compatibility constraints, deliberate omissions, surprising decisions; `- None.` when empty.
- **Change outline**: a compact structural view (`/show-me`-inspired), not prose — include only the views that changed: endpoint/SQL contract + business-logic pseudocode, key type/data-structure changes, shallow file tree of changed responsibilities, component tree (hooks/state/package boundaries), call-tree/control-flow/data-flow diffs. Prefer `diff` blocks on existing shapes; show the full target shape when most is new.
- Keep it human: one human talking to another, simple concise language, no jargon padding.

## 8. PR-Autofix Pre-Check (run before opening the PR)

Before `gh pr create`, re-read the staged diff like a hostile reviewer — not the author — and catch obvious defects first:

- Read `git diff <base>...HEAD` top to bottom. Does every hunk do what its commit message and the issue claim — and nothing else?
- Dead/leftover code: commented-out blocks, debug `console.log`/prints, scratch files that leaked into the diff.
- TODO/FIXME markers, hardcoded magic values, or local-only paths (`/Users/...`, `/tmp/...`, absolute paths) that break for any other machine.
- Destructive changes (deletes, renames, contract/API breaks) are called out in the PR body's "special things to note".
- Changed symbols use the issue's vocabulary — no stray renames or typos.
- Any unrequested orthogonal changes (refactors, formatting-only swings) that review will block — revert them now, not after a round-trip.

Fix everything you catch, re-run the verification gate (tests, type-check, secret scan), then open the PR. A self-checked diff ships for review once; a sloppy diff ships twice.

## 9. Pre-PR Adversarial Grilling Checklist

(source: `VoDaiLocz/kilo-kit-mcp` C4 Gate & Adversarial Red-Teaming)

Before executing `gh pr create` or requesting review, subject the changeset to an explicit adversarial grill across three catastrophic failure lenses:

1. **Inversion & Catastrophic Failure**:
   - *Question*: "If a malicious or chaotic actor wanted to bring down this service using only this change, what payload or timing sequence would they use?"
   - *Check*: Trace unhandled nulls, missing validation on request boundaries, malformed JSON, and external API timeouts or HTTP 5xx cascades.
2. **Blast Radius & Shared State**:
   - *Question*: "What other systems, background queues, scheduled cron jobs, or database tables could be destabilized by this change?"
   - *Check*: Verify that modifications to shared schemas, utility helpers, or ORM models do not inadvertently alter behavior for consumers outside the immediate diff.
3. **Async Race Conditions & Ordering**:
   - *Question*: "What happens when two concurrent requests hit this logic within 5 milliseconds of each other?"
   - *Check*: Audit database transaction isolation, optimistic locking, idempotent webhook keys, and eliminate check-then-act race windows.
