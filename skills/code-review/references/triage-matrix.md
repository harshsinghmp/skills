# 5-Axis Quick-Triage Review Matrix + Review Input Gates

Optional lightweight aid, loaded on demand by any review mode (diff, audit,
security, contract) when the reviewer wants one-pass coverage over the five
classical axes before going deep. Adds nothing new to the theme catalog —
every axis here points at an existing deeper mechanism; use this to make sure
one pass did not silently skip an axis. Findings still enter the Steps 4–6
protocol (forcing-violation proof, Torvalds severity) and cite the deep
reference's IDs, not this table.

## The 5-axis matrix

| Axis | Focus | Key checks (one pass) | Default severity | Deep dive |
|:---|:---|:---|:---|:---|
| **Contract** | Interface / format / ABI stability | Signature, return, and error-semantic changes; serialized-format shifts; silent data-layout change across a boundary; break without a deprecation/migration plan | **Reject** | SKILL.md Quick Reference "API Contracts" row + Theme 1 (`diff`/`audit`) + `contract` mode |
| **Security** | Vulnerability & control pass | Injection, authz gaps, secrets, untrusted-input trust boundaries, weak/deprecated crypto, wrong-time checks, special-path bypasses | **Reject** / Request Changes | `security` mode (SEC-01..10) + [security-controls.md](security-controls.md) + Theme 4 |
| **Performance** | Measured efficiency | Hot-path abstraction/allocations, pathological algorithmic scaling, unverified perf claims with no isolated A/B delta | Request Changes | Theme 14 (`diff`/`audit`) |
| **Concurrency** | Shared-state correctness | Lock ordering, races, magic-shared flags across threads, lock held across blocking calls, upgrade/recursive deadlock paths | **Reject** | Theme 3 (`diff`/`audit`) |
| **Anti-Slop** | Machine-authored / complexity bloat | Hallucinated symbols or invented APIs, plausible-but-wrong logic, drive-by churn, speculative generality, AI-slop comments | Request Changes / Nitpick | Theme 24 (`LLM-Author`), Theme 26.3 (`AI-Slop comment`), Theme 16 (`Surgical Diff`), `simplify` mode |

**Usage**: run the five key-check columns as a rapid sweep; whichever axis
fires, resolve it through the cited deep mechanism for the full trigger set
and severity calibration. Do not file a finding from this matrix alone — it
is a radar, not a verdict.

## Review input gates (run in Preflight, Step 0)

These are inputs to scope the review, not findings. They decide where the
review's energy goes.

### Isolated Fresh-Eyes Review Protocol (`context: fork`)
(source: `saleh-alhaddad/itqan-engineering` & `GanyuanRan/Aegis`)
When reviewing changesets exceeding 300 LOC or touching mission-critical modules:
1. **Zero-Context Blind Pass**: Isolate the diff from author narratives, commit messages, or PR explanations.
2. **Self-Documentation Verification**: Evaluate whether the interfaces, variable names, and error handling self-describe their intent without external coaching.
3. **Edge-Case Triangulation**: Trace how unexpected inputs, null values, or network timeouts behave without trusting the author's stated assumptions.

### Structural-decay input (modularity decay)
While enumerating scope, if the changeset keeps extending a file or module
that is already large or is taking a disproportionate share of recent commit
churn (e.g. ⅓+ of commits in the last N land in one file, or the file exceeds
the project's stated size budget), flag the *decision* to extend it as an
explicit scope question — Request Changes if the growth lands without a
splitting proposal. Deep dive: Theme 26 (`Structural Decay`) + Theme 9.1
(`Uncurated Monolithic Changes`).

### Dependency-audit gate (diff touches a package manifest)
When the diff edits a dependency manifest or lockfile (`package.json`,
`go.mod`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, etc. — tool
names are examples, the gate is manifest-generic):
1. Confirm the added/updated dependency is actually used, not a speculative
   or orphaned addition (Theme 16.2).
2. Check it is a current, maintained, non-abandoned release — flag known
   vulnerable or deprecated versions.
3. Check it introduces no unexpected dependency edge or cycle (Theme 23.2)
   and that the version bump's rationale is stated (Theme 12.1).
4. **Strict Isolation Rule**: Enforce 1 major dependency bump per commit. Never bundle dependency updates with feature or bugfix logic.
5. **Lockfile Diff Audit**: Inspect lockfile diffs for suspicious transitive additions, mismatched checksums, or malicious postinstall lifecycle scripts.
Gate is advisory unless a change fails 1–5; a silent risky dependency
introduction is Request Changes, not a hard reject on its own.