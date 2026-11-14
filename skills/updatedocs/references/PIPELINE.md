### Step 5 — Inventory Documentation
Discover relevant documentation surfaces:

**Ordinary Project Documentation:**
```text
README.*, CHANGELOG.*, CONTRIBUTING.*, SECURITY.*, SUPPORT.*, ROADMAP.*,
MIGRATING.*, UPGRADING.*, DEVELOPMENT.*, docs/, documentation/, guides/,
handbook/, manual/, wiki/, examples/, adr/
```

**Technical References:**
```text
API docs, CLI references, configuration references, schema docs, integration docs,
deployment docs, runbooks, troubleshooting, architecture docs, diagrams
```

**Embedded Documentation:**
```text
JSDoc, TSDoc, docstrings, CLI help text, schema descriptions, public error/help messages
```

**Protected Systems (Treat Separately):**
```text
.memory/ (DO NOT TOUCH)
.agents/ (PROTECTED DOX ARCHITECTURE)
```

---

### Step 6 — Detect Generated Documentation
Determine whether each documentation artifact is `HAND-WRITTEN`, `GENERATED`, `DERIVED`, or `MIXED`.

If generated:
```text
SOURCE ➔ GENERATOR ➔ DOCUMENT
```
Prefer updating the source or generator mechanism. Do not manually patch generated artifacts when the repository expects regeneration.

---

### Step 7 — Build Documentation Impact Map
For each meaningful repository change:
```text
[Changed Source]
      ↓
[Changed Behavior / Contract]
      ↓
[Affected Audience]
      ↓
[Potential Documents]
      ↓
[Ownership]
      ↓
[Permission Level]
      ↓
[ACTION: UPDATE | ADD | REMOVE | DEPRECATE | RENAME | RELOCATE | REGENERATE | LINK | REVIEW | NO CHANGE | BLOCKED]
```

Evaluate impact across: End Users, Developers, Contributors, Operators, API Consumers, Maintainers, AI Agents, Clients / Stakeholders.

**Capability-absence sweep (the sync half of the job — a 100/100 audit score is not evidence of sync):** changed-source tracing above only maps changes a doc *already* relates to. Also sweep for capabilities that exist and are simply **missing from docs with no diff relation to catch**: recent merged PRs since the last release tag, shipped issues, new CLI flags/subcommands, new standards and skills, generated surfaces (commands, registries). For each, ask "which document should describe this, and does it?" Run it mechanically first:

```bash
bun skills/core-engine/updatedocs/scripts/updatedocs.ts <targetPath> --capability-sweep
```

Exit 1 + a gap list means a capability is documented nowhere (`[reference-file-invisible-in-skill | undocumented-workflow | undocumented-asset | feat-commit-undocumented]`, each with suggested doc targets). Then **write the missing sections** (What's New, feature lists, operational-standards lists, `llms.txt` for agent-facing capabilities) — the sweep detects; the agent authors with surgical diffs; never auto-generate prose into hand-curated docs. A capability documented nowhere and flagged by no diff is exactly the drift class a clean audit score conceals.

---

### Step 8 — Audit Documentation Before Editing
Inspect relevant documentation first. Check for:
- **Semantic drift**: Claims that no longer match implementation.
- **Missing documentation**: New public capabilities with no documentation.
- **Contradictions**: Different documents claiming different values.
- **Broken examples**: Examples using removed APIs, commands, imports, configs, or paths.
- **Stale terminology**: Old package names, modules, routes, or concepts.
- **Stale configuration**: Removed, renamed, or changed settings.
- **Stale compatibility**: Incorrect runtime, framework, or dependency support claims.
- **Architecture drift**: Outdated diagrams, boundaries, data flows, or directory trees.
- **Discoverability problems**: Important docs not linked from expected navigation.
- **Duplication**: Several documents describing the same fact independently and drifting.

---

### Step 9 — Apply Audience-Aware Documentation Rules
- **Technical Documentation**: May often be auto-updated when evidence is direct (API, CLI, config references).
- **User-Facing Documentation**: Update when user behavior changes (what changed, how to use it, prerequisites, examples).
- **Client-Facing / Business Documentation**: Treat as high-risk (client handoff, SOPs, CMS guides, analytics/SEO docs). Require human review/approval before publishing.
- **Agent Context**: Read applicable governance first (`AGENTS.md`, `.agents/`). Hand deeper context restructuring to `updateagents`.

---

### Step 10 — Explain WHY, Not Just HOW
Documentation should not become a verbose mirror of the code. Document:
```text
WHY | WHEN | WHO | CONSTRAINTS | TRADE-OFFS | BUSINESS RULES |
OPERATING PROCEDURES | MIGRATION REQUIREMENTS | PUBLIC USAGE | EXPECTED BEHAVIOR
```

---

### Step 11 — Synchronize by Documentation Class
- **README**: Review scope, installation, prerequisites, quickstart, public capabilities, CLI options. Keep concise.
- **CHANGELOG**: Use established format. Working-tree changes belong under `## [Unreleased]`. Never invent versions or rewrite history.
- **API Docs**: Verify method, path, auth, parameters, request/response schemas, error codes, defaults.
- **CLI Docs**: Check command names, subcommands, flags, defaults, env vars, examples against CLI implementation.
- **Configuration Docs**: Check variable names, required/optional state, defaults, purpose. Never expose credentials.
- **Database / Schema Docs**: Check schema changes, migrations, rollback steps, compatibility implications.
- **Architecture Docs**: Update only when subsystem boundaries, data flows, persistence, or integrations shift.
- **ADRs**: Document significant decisions with trade-offs. Approved ADRs are immutable historical records; supersede with new ADRs.
- **CONTRIBUTING / DEVELOPMENT**: Synchronize package manager, runtime version, build, test, lint, branch, and commit rules.
- **Deployment / Runbooks**: Synchronize deployment commands, environment requirements, health checks, rollback procedures.

---

### Step 12 — Detect Second-Order Documentation Impact
Trace cascading impacts beyond directly changed files:
- Runtime change ➔ `README` ➔ `CONTRIBUTING` ➔ `COMPATIBILITY` ➔ `CI/CD docs` ➔ `deployment docs`
- API change ➔ API spec ➔ `README` examples ➔ integration docs ➔ migration docs ➔ `CHANGELOG`
- Config key rename ➔ `.env.example` ➔ configuration docs ➔ deployment docs ➔ examples

---

### Step 13 — Search for Obsolete References
For renames, removals, migrations, or deprecations, search for old filenames, old modules, old commands, old routes, old API fields, old config keys, or old terminology. Address only verified obsolete references.

---

### Step 14 — Verify Examples and Commands
- **Commands**: Check against package scripts, CLI definitions, Makefiles, CI commands.
- **Code examples**: Check imports, paths, symbols, APIs, framework conventions.
- **Sample hygiene** (source: `vercel-labs/writing-guidelines`, `command.md`): every code block carries a language tag; snippets stay ≤80 columns and ≤25 lines (split longer blocks with prose); explain what each block does in prose — never drop-and-run, never close a guide with "see full `train.py`"; text placeholders use descriptive `snake_case` (`your_access_token_here`, never `<TOKEN>` / `xxx`); data sizes read `64 KB` / `200 ms` (bare `30s` for seconds); anchor text names the destination, never `here` or a bare URL.
- **API examples**: Check against schemas, routes, response definitions.
- **Config examples**: Check against loaders, schemas, defaults.
- Never claim a command was executed unless actually run. Never claim an example was tested unless actually tested.

---

### Step 15 — Cross-Document Consistency Audit
Verify shared facts across relevant documentation (package manager, runtime version, install/test commands, CLI flags, API paths, env vars, default ports). One canonical fact must not have competing values.

---

### Step 16 — Documentation Discoverability Audit
Verify docs index, navigation, README links, TOC, and related-doc references. Goal: **More useful docs, not more docs.**

---

### Step 17 — Full / Sprint Drift Audit
In `Sprint` and `Full` modes, scan for stale markers (`TODO`, `FIXME`, `deprecated`, `obsolete`, `removed`, `renamed`, `coming soon`, old URLs). Evaluate matches against repository evidence.

---

### Step 18 — Documentation Debt Classification
When something cannot be safely synchronized, classify the debt:
```text
MISSING SOURCE OF TRUTH | CONFLICTING SOURCES | UNVERIFIED |
GENERATED ARTIFACT BLOCKED | MISSING MIGRATION | STALE EXAMPLE |
STALE ARCHITECTURE | CLIENT REVIEW REQUIRED | PROTECTED PATH
```

---

### Step 19 — Git / PR / Release Awareness
Understand synchronization boundaries: `WORKTREE`, `COMMIT`, `PR`, `MERGE`, `RELEASE`, `SPRINT`. Do not automatically push, publish, tag, release, or create remote PRs.

---

### Step 20 — Final Verification
Execute the 14-point audit protocol ([references/AUDIT-CHECKLIST.md](./references/AUDIT-CHECKLIST.md)) for every modified document, and verify that all non-negotiable boundaries were respected. In Quick mode, run the audit protocol only against the documents actually edited.

### Step 21 — Verify After Bulk Edit
Any bulk editing pass — `sd`/`sed`/`awk` sweeps, scripted rewrites (python/perl), multi-file find-replace, multi-hunk `str_replace` batches, or registry-wide version bumps — triggers a mandatory verification gate **before** the next edit or commit:

1. **Diff audit**: `git diff --stat` first — a change count wildly above expectation (e.g. a whole-file reformat from an indent mismatch) is damage, not progress. Then scan the actual hunks: confirm every replacement matches intent, and hunt silent failures (regex metacharacters that matched nothing — `(12/12)`, `**bold**`, backtick patterns).
2. **Mechanical re-check**: run the cheapest executor that can falsify the edit — a test suite, a parser (`bun build` / `python -c "import json; json.load(...)")`, or a byte-compare against the intended target. Tests must run against the project's committed baseline; foreign WIP in a shared checkout is parked path-limited for the run and restored after.
3. **Revert on damage**: malformed output is `git checkout -- <file>` and a redo with a reliable method (exact-string replacement or a validated script), never a patch-on-patch.

A bulk pass without this gate is an unverified claim about N files at once — the exact failure mode Step 14 forbids for single examples.

---
