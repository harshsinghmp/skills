# Couple Mode — whole-codebase change-coupling audit

> Loaded by the `couple` mode only. Answers one question for every pair of pieces in
> the system: **should these change together?** Where the answer is wrong, the code is
> tangled — one edit touches five files, or five unrelated reasons to change sit in
> one file. The output is a diagnosis and a refactor plan, not a verdict on a diff.
>
> Source: `caldoai/skills` `untangle-codebase` (MIT) — taxonomy, decision-log shape,
> and recon technique adapted; execution discipline NOT imported (see Boundaries).

> [!IMPORTANT]
> **On-demand only, read-only by default.** This mode has whole-codebase blast radius.
> Never run it automatically, and never let it edit code unless the user explicitly
> authorizes execution. Execution belongs to `refactor` `architecture` mode, which
> carries the safety baseline this mode deliberately omits.

## Why this exists

The payoff is economic, not aesthetic: agents and humans read less per change, break
less silently, and debug faster when a typical change lands in one place. State this
frame once at the top of the report — it is the justification for every fix that
follows.

## Preflight (before any inventory)

1. Enumerate the scope: directories, packages, and files in play. Name the exclusions
   (`node_modules`, generated code, vendored deps) and why.
2. Establish the behavior baseline: test command, current pass/fail state, and whether
   the project has a characterization-test seam for the areas a fix would touch.
   **No test seam is a finding, not a blocker** — record it as `FIX-GATE` and carry on
   with diagnosis. Execution must not start until the seam exists.
3. Recon the shape cheaply before reading code:
   - **Skeleton**: strip function bodies (script it) so the whole surface fits in
     context.
   - **Import graph**: script what imports what; it is the evidence for the
     dependency-direction questions below.
   - **Change history**: `git log --name-only` over the last N commits, co-change
     frequency per file pair. Pieces that repeatedly change in the same commit are
     coupled whether or not the imports show it.
4. Enter where leverage is highest — the module with the most inbound edges, the
   largest co-change cluster, or the area the user named.

## The inventory — three ways to get coupling wrong, plus special cases

Do not change anything while listing. Record every violation with `file:line`, the
class, and the reason it must change together (or must not).

### 1. Hidden links — must change together, but the code does not show it

| Sub-pattern | What it looks like | Why it is wrong |
| :--- | :--- | :--- |
| **Copied logic or values** | The same rule, constant, or branch repeated | Change one, the others silently diverge |
| **Cross-module read** | A module reads a global or file another module sets | Setting module changes, reader breaks invisibly |
| **Layer-split feature** | One feature spread across `routes/`, `services/`, `models/` | One change needs all of them; layout hides the set |
| **Implicit call order** | A convention callers must know ("call `init` first") | Producer changes, no caller is warned |

The fix direction is always **colocation or an explicit contract**: move the pieces
that change together next to each other, or make the dependency visible in a type, a
parameter, or a single named entry point.

### 2. Needless links — tied together, but for different reasons to change

| Sub-pattern | What it looks like | Why it is wrong |
| :--- | :--- | :--- |
| **Callers on internals** | External code reaches into private fields, helpers, or layout | Internals change for their own reasons; callers break anyway |
| **Volatile→stable import** | A stable module imports something more volatile | Stable code must change whenever the volatile code does |
| **Caller vocabulary** | A general function carries a parameter only one caller understands | The function changes whenever that one caller does |
| **Shallow module** | The interface changes whenever the internals do | Callers change in lockstep; the abstraction earns nothing |

The fix direction is **encapsulation and dependency inversion**: expose behavior,
hide structure; depend on the thing that changes less (interface, event, data) rather
than the thing that changes more (implementation, vendor SDK, screen).

### 3. Surplus — no reason of its own to change

| Sub-pattern | What it looks like | Why it is wrong |
| :--- | :--- | :--- |
| **Pass-through wrapper** | A function/class that only forwards to another | It changes exactly when the wrapped thing does |
| **Speculative generality** | Extension points, config, and abstractions nothing varies | Nothing will ever change them; they are pure carrying cost |
| **Dead code** | Unreferenced modules, exports, flags, branches | Nothing will ever need it to change |

The fix direction is **deletion**. Surplus is the cheapest class to resolve and the
one most often left in place — delete first, ask later.

### 4. Special cases — the inventory that reveals the missing requirement

Record every place the code exists for one situation instead of following from how
the system works: a one-value `if`, a parameter for a specific caller, a swallowed
exception, a retry or `sleep` compensating for ordering, a disabled test. Each one is
a requirement the design never accounted for. **Special cases are not fixed one by
one** — they are the evidence used to work out what the system needs to be.

## Redesign from first principles

Work out the fixes as if the system had known today's requirements from the start.
Look for the one fix behind several problems; it often looks nothing like any of them.
Apply the same test to every proposed fix, even one that reads better in the code:

- pieces that change together end up together,
- pieces that change for different reasons are not tied,
- everything depends on what changes less.

## Decision log

The log is the deliverable. Put each fix **above** the problems it solves so the
report shows a root cause, not a to-do list. Every problem appears under exactly one
fix or stays in the unresolved section.

```md
## Fix: Make the dialog restore focus to its opener, so the wait and the flag both go.
- `ui/LogoutDialog.tsx:30` waits 100ms after closing, hoping the input can take focus.
- `ui/SettingsDialog.tsx:61` sets a global `skipRefocus` flag to stop the nested
  logout dialog from refocusing the input.

## Fix: Give checkout and refunds one `PaymentProvider` interface.
- `checkout/submit.ts:9` imports `payments/stripe.ts` directly (volatile→stable).
- `refunds/refund.ts:22` branches on `provider === "paypal"` around Stripe calls
  (caller vocabulary + hidden link).

## Unresolved (needs a decision)
- `shortcuts/keymap.ts:18` duplicates the action list — fix depends on whether the
  action registry or the keymap should own ordering.
```

Rules for the log:

- **One fix, many problems is the goal** — a fix that resolves exactly one finding is
  usually a symptom patch; say so if it genuinely stands alone.
- **No fix without a named caller-facing effect.** "Cleaner" is not a reason.
- **Order by leverage**, not by file order.
- **Mark each entry** `READY` (behavior-preserving, test seam exists),
  `NEEDS-TEST-SEAM`, or `NEEDS-DECISION`.

## Severity calibration

Coupling debt is architectural, so it starts at **Discussion** and escalates only
with a forcing-violation proof (SKILL.md Step 4) — never on taste.

| Finding | Default | Escalates to |
| :--- | :--- | :--- |
| Hidden link already diverged (copies disagree) | **Request Changes** | Reject if it corrupts data or breaks a contract |
| Hidden link, currently consistent | **Discussion** | Request Changes when a concrete edit would silently break the other copy |
| Needless link across a shared/public contract | **Request Changes** | Reject if the volatile side is already forcing stable-side edits |
| Needless link internal-only | **Discussion** | — |
| Pass-through wrapper / dead code | **Nitpick** | Request Changes if it is the load-bearing path |
| Speculative generality | **Request Changes** (Theme 10) | Reject when it is a public extension point with no consumer |
| Special case | **Discussion** | Reject if it masks a swallowed failure or corrupt data |

A coupling finding you cannot demonstrate with a concrete change scenario is at most
a Discussion item. "This would be nicer" is not evidence.

## Execution boundary

This mode stops at the log. If the user authorizes execution:

- Hand off to `refactor` `architecture` mode, one fix-cluster per atomic change.
- Characterization test first for any cluster that touches behavior-bearing code
  (`FIX-GATE` from preflight must be closed).
- Re-run the import graph and co-change check after each cluster; a fix that creates
  a new inbound edge to a volatile module has not finished the job.
- Bugs found along the way are recorded, **not fixed**, unless the structural change
  makes the bug inseparable from the fix — and then each one is listed explicitly in
  the commit and the report.

## Report shape

```md
# 🔗 Coupling Audit — <scope>

## Baseline
Tests: <command> — <pass/fail/skip count> · Scope: <n files, m packages>
Recon: <import-graph summary> · <co-change clusters found>

## Fix 1 (READY) — <one-line root fix>
Changes together: <pieces>
Why now: <concrete change scenario this unblocks or failure it prevents>
Members: <problem list, each with file:line and class>

## Fix 2 (NEEDS-TEST-SEAM) — ...

## Unresolved (needs a decision)
- <problem> — <the decision that gates it>

## Special-case census
<n> found · <n> the redesign removes · <n> the system still needs (and why)

## Verdict
Converged | Converging (round <n>) | Blocked on <decision>
Next command: <refactor architecture | none>
```

## Termination — when the audit is done

Do not stop at the first clean pass. The audit converges when:

- **As few special cases remain as the system actually needs** — this count is the
  primary progress measure, and every survivor has a stated reason.
- A typical change lands in one place (verified against the co-change clusters).
- Every import is reasonable, and nothing imports anything more volatile than itself.
- An independent subagent sweep over the same scope returns nothing worth fixing.
- The baseline behavior test result matches the starting state, apart from bugs the
  structural fix removed — each listed.

If a second sweep keeps finding the same class of problem, the redesign is wrong at
that layer; escalate to `NEEDS-DECISION` rather than fixing instances one by one.

## Boundaries — what this mode does NOT do

- **Not a bug hunt.** Structural fixes may retire bugs incidentally; hunting them is
  `diff`/`audit` mode's job. Mixing the two inflates scope and hides the coupling work.
- **Not tests-last.** The source method sequences test cleanup after refactoring. We
  do not: the behavior baseline comes first, and test *edits* stay under Theme 17.
- **Not an auto-runner.** Never triggered by a normal review; never edits without
  explicit authorization; never applied to a dirty tree with no rollback path.
- **Not a replacement for `audit`.** `audit` judges a module against its documented
  standards and returns a verdict. `couple` maps the change-coupling graph and returns
  a plan.
