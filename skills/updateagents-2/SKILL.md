---
name: updateagents
aliases: ["sync-agents","update-memory","agent-sync","ai-ready","repo-ai-ready","ai-audit"]
description: "Universal agent context synchronization and repository AI-readiness engine. Audits 13 tracked assets across AI Context, Dev Workflow, and Governance with a 4-tier grading matrix and sub-100ms Stage-0 Fast-Skip Gate. Houses master Agent Engine DOX templates, sanitizes synthetic ADE artifacts, retrofits legacy instructions, preserves human-authored rules, and continuously synchronizes modular standards."
argument-hint: "[sync|audit|sanitize|scaffold]"
user-invocable: true
version: 2.3.0
author: Agency Council
license: MIT
platforms: [macos, linux, windows]
category: core-engine
metadata:
  category: core-engine
  priority: 2
  aliases: ["sync-agents","update-memory","agent-sync","ai-ready","repo-ai-ready","ai-audit"]
  suggested_skills: ["updatedocs","new-project","relay","context-anchor"]
  hermes:
    tags: [memory, documentation, context, agents, workspace, synchronization, dox, ai-ready, readiness, audit]
    related_skills: [updatedocs, new-project, relay, context-anchor]
    suggested_skills: [updatedocs, new-project, relay, context-anchor]
    requires_tools: [bash, view_file, write_to_file, grep_search]
  openclaw:
    category: core-engine
    suggested_skills: [updatedocs, new-project, relay, context-anchor]
    primary_triggers: ["update agents","sync project context","update memory","sync AGENTS.md","make repo AI-ready","audit AI readiness"]
    requires_tools: [bash, view_file, write_to_file, grep_search]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🧠 updateagents — Project Agent Context Synchronization

Synchronize AI-agent instructions and project context with the **actual current state of the workspace**.

This skill is not merely an `AGENTS.md` updater.

It determines what project information has changed, identifies which agent-facing instruction files are authoritative, updates only the necessary content, preserves intentional human-authored material, and validates the resulting context.

The goal is to keep future agents aligned with the repository as it evolves.

> **Understand project state → identify durable agent-relevant knowledge → synchronize the correct instruction scope → validate.**

---

## When to Use

Use `updateagents` when:

* The user explicitly asks to update, refresh, sync, rebuild, or audit agent instructions.
* A significant feature, refactor, architecture change, migration, or dependency change has occurred.
* New development workflows, scripts, tooling, frameworks, or infrastructure are introduced.
* Existing commands, paths, conventions, or architecture have become stale.
* A project is being handed to another agent or developer.
* An agent repeatedly makes mistakes because required project context is missing or outdated.
* A repository gains or changes agent instruction files.
* A sprint, feature, major PR, release, or migration changes project behavior.
* Periodic project-context hygiene is being performed.
* Upgrading a legacy project to the Progressive Disclosure DOX architecture.

Do **not** run merely because files changed.

Run when the change has a reasonable chance of affecting what future agents need to know.

---

## Modes

| Mode | Focus | Key Output | Reference Document |
| :--- | :--- | :--- | :--- |
| **`sync`** (Default) | Synchronize instructions with codebase reality, preserve human rules, sync 19 standards | Updated `.agents/context/*`, lean `AGENTS.md` router, standards sync | [references/memory-file-priorities.md](references/memory-file-priorities.md) |
| **`audit`** | 13-asset AI readiness scorecard, Stage-0 Fast-Skip, and `--fail-under` CI gating | Readiness report & maturity medal (🏆 AI-Ready to 🥉 Getting Started) | [references/twelve-asset-matrix.md](references/twelve-asset-matrix.md) |
| **`sanitize`** | Strip synthetic ADE/IDE markers (`ORCA_RICH_MD`, Cursor, Windsurf) | Sanitized clean codebase without proprietary token wrappers | [references/pr-review-mining.md](references/pr-review-mining.md) |
| **`scaffold`** | Direct Day-0 provisioning of agent context, AGENTS.md, .github templates, .env.example | Workspace instruction & governance templates | [references/fast-skip-protocol.md](references/fast-skip-protocol.md) |

---

## Quick Reference

### Core Principle
Maintain **agent-relevant project knowledge**, not a generic repository summary.

| Prefer (Durable Knowledge) | Avoid (Temporary Noise) |
| :--- | :--- |
| Important commands & package scripts | Full source-file dumps |
| Architecture boundaries & data flows | Temporary debugging output |
| Sources of truth & canonical files | Large logs & stack traces |
| Testing requirements & suites | Redundant explanations |
| Security boundaries & Vibeguard rules | Session transcripts & raw memory dumps |
| Conventions & operational gotchas | Credentials, tokens, or `.env` secrets |
| Durable project decisions (ADRs) | Easily derivable information |

The resulting context should be **compact, accurate, actionable, and maintainable**.

### HARD BOUNDARY — MuseMemory (`.memory/**`)
The `.memory/` directory is **exclusively owned and managed by MuseMemory**.

`updateagents` must **never** operate on `.memory/**`. This is an absolute rule.

**Forbidden Operations**: Never read, write, modify, create, delete, rename, move, reorganize, clean up, summarize, or validate `.memory/**`. Never copy raw `.memory/` contents into agent instruction files, treat `.memory/` as a source of truth, or use `.memory/` as a justification for changing agent instructions. The path `.memory/**` is always excluded.

*MuseMemory Context Rule*: External memory tools (`cavemem`, `memoryagent`, etc.) provide context, not authoritative project state. A memory-derived fact may be recorded only when it is durable and verifiable from current project code, configs, or documentation.

### Workspace Boundary
The workspace boundary is the **current working directory**:
1. Never traverse above the current workspace.
2. Never modify files outside the workspace.
3. Never search parent directories for missing agent files.
4. Never silently switch to another repository.
5. Do not assume the Git root is the workspace root unless it is the current working directory.
6. Nested repositories should be treated as separate scopes unless explicitly requested otherwise.
7. `.memory/**` remains excluded even though it may physically exist inside the workspace.

### Authority & Priority Heuristic
```text
Explicit user instruction → nearest-scope project instruction → root AGENTS.md → imported source rules → runtime adapter
```
`AGENTS.md` is the shared engine. Runtime-specific files are adapters; imported user rules stay active through `.agents/context/imported-agent-instructions.md`.

### Canonical Source Detection
Identify the project's source of truth before documenting behavior:
- Package scripts → `package.json`
- Build & test behavior → build configs, package scripts, test configs
- API contracts → schemas, OpenAPI, route definitions
- Database structure → migrations, schema definitions
- Design tokens → token definitions in `.agents/brand/tokens/`
- Agent instructions → canonical project instruction files

### Change Impact Classification

| Change Class | Examples | Default Treatment |
| :--- | :--- | :--- |
| **Context** | New directory, command, dependency | Update when agent-relevant |
| **Behavioral** | Feature, API, UI behavior | Update affected guidance |
| **Architectural** | Module boundaries, framework migration | Update architecture guidance |
| **Operational** | Build, CI, deploy, environment | Update workflow guidance |
| **Data** | Schema, migrations, seed strategy | Update source-of-truth guidance |
| **Security** | Auth, permissions, security policy | Review carefully |
| **High Risk** | Production data, infrastructure, destructive ops | Human review |

---

## Procedure

Execute the synchronization workflow via the automation CLI:

```bash
bun path/to/updateagents/scripts/updateagents.ts [options]
```

### Step 0 — Stage-0 Fast-Skip Gate (Pre-Flight)
Before performing deep inspection or delta generation, run the `updateagents` fast-skip verification:
1. Verify `AGENTS.md` exists and is `<50 lines`.
2. Verify `.agents/standards` and `.agents/context` exist and are populated.
3. If instructions are already aligned with project reality:
   ```text
   [updateagents] Agent instructions and DOX container verified. Skipping pass.
   ```
   Exit immediately with 0 changes and zero token waste. Proceed only when structural drift or new project requirements are detected.

### Step 1 — Establish Workspace Context
Determine current directory, repository status, project type, language/runtime, package manager, and application boundaries. Exclude parent directories and `.memory/**`.

### Step 2 — Discover Agent Context
Recursively discover supported instruction files inside the workspace, including nested `AGENTS.md`; Claude, Gemini, Codex and OpenCode instruction files; Cursor, Windsurf, Cline, Roo, Copilot and Continue rules; `*.instructions.md` / `CONVENTIONS.md`; and Markdown/text files inside directories named `agent(s)`, `rule(s)`, `instruction(s)` or `prompt(s)` for other runtimes. Skip `.git`, `.agents`, `.memory`, dependency/build outputs, and symlinks. Read each candidate and retain its relative path and scope metadata. Never search above the workspace.

### Step 3 — Inspect Project State
Inspect only authoritative sources (`package.json`, `tsconfig.json`, `README`, CI configs, source structure). Explicitly exclude `.memory/**`.

### Step 4 — Use Optional Context Integrations
Use available tools (`codegraph`, `rtk`, `ponytail`) when present to understand relationships, patterns, and recent activity. Missing tools are not an error.

### Step 5 — Build the Context Delta
Before editing, construct an internal delta classifying findings:
- `NEW`: Previously undocumented durable knowledge.
- `CHANGED`: Existing knowledge that is now different.
- `OBSOLETE`: Existing knowledge that no longer applies.
- `CONFLICTING`: Different sources disagree (report conflict, do not guess).
- `LOCAL`: Specific to a sub-package.
- `TEMPORARY`: Do not persist temporary debugging state.

### Step 6 — Determine Synchronization Targets
Update the smallest correct scope (root instructions vs package instructions). Do not duplicate identical guidance across multiple scopes.

### Step 7 — Preserve Existing Knowledge
Preserve valid human-authored content, architectural decisions, project-specific constraints, and meaningful warnings. Remove obsolete guidance only when obsolescence is confirmed.

Glossary sparring (source: lane D #5 — pocock grill-with-docs/domain-modeling): challenge fuzzy terms inline while syncing — sharpen vague language, cross-reference each term to code, update CONTEXT.md as-you-go.
ADR offer filter — propose an ADR only when all three hold (hard-to-reverse + surprising + real-tradeoff), else skip.
Lazy file creation: never scaffold context files speculatively; create only on confirmed agent need.

### Step 8 — Check Existing Agent Files & Scaffolding Gate
1. Check if any agent engine files exist (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.agents/`, etc.).
2. **If NONE Found**:
   - Scaffold the entire fresh Agent Engine DOX architecture directly from `updateagents/templates/`.
   - Render compact `AGENTS.md` from the template with detected project purpose, repository, governance, toolchain, and installed modern CLI tools. Core standards are required; detected or selected standards become required and link to their full files.
   - Create root `CLAUDE.md` from `templates/CLAUDE.md`; it must contain only `@AGENTS.md` so Claude agents read the same project instructions.
   - Create `.agents/dump/<category>/` for user-provided URLs, data, logs, exports, or other content submitted for extraction. Keep working material under `.agents/artifacts/` or `.agents/dump/`, not the repo root or `.memory/`; never store secrets in dumps.
   - Use the agent name configured by the user in their own agent system; ask if unavailable rather than inventing a persona. Keep personal identity in the global identity directory; never copy it into the project.
   - Secretary dispatch is invoked by instructions on the first prompt and each new task; it is not a background process. Close out every completed task even if the session continues.
3. **If ANY Found (custom content present)**:
   - Before changing an instruction file, snapshot its exact bytes under `.agents/archive/agent-instructions/`; record source path and SHA-256 in `manifest.json`.
   - Import complete source contents, including rules, workflows, configuration notes, definitions and scope metadata, into `.agents/context/imported-agent-instructions.md`. Do not section-guess, truncate or silently drop content. Preserve each source’s path and keep changed versions as additional snapshots.
   - Make `AGENTS.md` the compact shared router. Replace supported runtime-specific files with small adapters only after snapshot + import succeeds; keep relevant frontmatter/scope metadata. Claude’s root `CLAUDE.md` remains exactly `@AGENTS.md`. Preserve non-instruction configuration files untouched.
   - Read imported instructions before every task, apply each within its recorded source scope, and report conflicting rules with both source paths; ask the user instead of silently choosing.
   - Report every source → archive snapshot → canonical context mapping so users can find both their active rules and exact originals. Never delete an original snapshot.
   - When refreshing a generated `AGENTS.md`, reconcile conditional-standard links with project evidence. Ask about ambiguous applicability; only unlink standards the user confirms are inapplicable, retaining their files.

### Step 9 — Synchronize Standards from Single Canon
Synchronize standards and baseline brand tokens from `updateagents/templates/` without overwriting project context or source. Core standards are always required. Detected or selected standards are required for that project. During later runs, ask about ambiguous conditional standards; unlink only standards the user confirms are inapplicable, while retaining their files.

### Step 10 — Capture Commands Precisely
Document commands only when verified in `package.json` or project tooling (Install, Dev, Build, Test, Typecheck, Lint). Never invent commands.

### Step 11 — Capture Architecture & Boundaries
Document relationships, data flows, and module boundaries rather than simple directory dumps.

### Step 12 — Capture Conventions & Sources of Truth
Explicitly document authority relationships (package scripts authoritative for commands, migrations authoritative for DB).

### Step 13 — Capture Agent-Specific Rules
Record operational rules supported by project policy. Imported rules remain verbatim and source-scoped in `.agents/context/imported-agent-instructions.md`; do not paraphrase them into oblivion or resolve conflicts without the user.

### Step 13b — Skill Authoring & Instruction Engineering (TDD Protocol)
When authoring, scaffolding, or updating agent skills or behavioral guidance, enforce the TDD Skill Engineering Protocol: Red-Green-Refactor for agent instructions, baseline adversarial pressure testing, and anti-rationalization loophole closures (see [references/skill-authoring.md](references/skill-authoring.md)). When extracting recurring patterns into reusable skills via `bun scripts/extract-skill.ts`, all 4 Extraction Gates (Recurrence, Verification, Generalization, and TDD Engineering) must pass.

### Step 13c — Keep Secretary Dispatch Explicit
Generated `AGENTS.md` instructs agents to invoke `secretary:dispatch` on the first prompt and each new task, triage the request, and read the selected skill and mode. This is prompt-driven routing, not a background process. Route Coach only when relevant; it does not replace task closeout.

### GitHub project assets
When scaffolding or synchronizing a confirmed GitHub project, render community files and `CHANGELOG.md` from the shared templates using verified project/repository metadata. Workflow templates currently cover Node/Bun scripts, Python manifests, and Composer/PHP; preserve user-edited files and do not invent workflows for other stacks. If `origin` is not GitHub and `.github/workflows/` exists, ask before removing anything; removal is limited to files in that directory and requires explicit confirmation (`--confirm-remove-github-workflows`). If the host, contact, contributor identity, or workflow choice is unknown, ask the user, record their answer, and continue without guessing. With no repository evidence, interactive scaffolding asks; non-interactive runs defer GitHub assets until confirmed with `--github` or `--no-github`. Never copy this source repository's username, slug, or credentials into the target.

### Step 14 — Synchronize Related Knowledge
Propagate downstream effects (e.g. API changes affecting types and tests) when future agent behavior should change.

### Step 15 — Size & Noise Control
- **Target**: `< 5KB`
- **Warning**: `≥ 5KB`
- **Hard Limit**: `≥ 10KB`
Remove duplication and move verbose reference material to dedicated documentation.
- **Conditional-block writing** (source: humanlayer improve-claude-md, mechanism-only — buyer archives CLAUDE.md, applies to workspace instruction sections only): wrap domain guidance in `<important if="narrow-trigger">…</important>` scoped to one workspace section (`.agents/context/*` or router); one narrow trigger per rule, never group unrelated triggers.
- **Bare-vs-wrap test**: bare (no wrapper) when rule applies to 90%+ tasks (identity, map, stack); wrap only domain guidance (testing, API, state, i18n).
- **Keep-all commands**: keep every verified command; present as a single commands table/block (Step 10 verified-only still holds — never invent).
- **Cut rules**: cut linter-enforceable patterns, code-discoverable patterns, and vague instructions; replace code snippets with path refs unless the snippet itself is the durable gotcha.
- **Apply proc (compressed)**: identity → map → stack → commands table → split rules → wrap domains → cut linter/snippets/vague → size-check → validate.
- Note (validator-later): narrow-condition lint (one trigger per block, no grouped triggers) proposed for `scripts/validate-memory-file.sh`; not implemented here.

### Step 16 — Validate
Run `validate-memory-file.sh` to confirm size, structure, command accuracy, and verify `.memory/**` was untouched.

### Step 17 — Report the Change
Output a concise change report detailing files discovered, updated, new/obsolete knowledge, and validation receipts.

---

## Pitfalls

### Mandatory Safety Rules
* **Never modify outside the workspace** or traverse above root.
* **Never read, write, create, delete, move, rename, summarize, reorganize, synchronize, or validate `.memory/**`**.
* Never expose secrets, API keys, or `.env` contents.
* Never fabricate commands or architecture.
* Never perform wholesale replacement of guidance files.
* Never clobber application source code (`src/`, `app/`) or package dependencies.
* Never claim validation succeeded when it did not run.

### Anti-Bloat Rules
Do not add entire package manifests, full dependency lists, complete directory trees, full source snippets, logs, stack traces, session transcripts, or generic tutorials. Document only what agents repeatedly need.

### Failure Handling
* **No Agent File Found**: Create canonical DOX files only when the repository clearly benefits.
* **Multiple Files Found**: Determine scopes and relationships; do not automatically consolidate.
* **`.memory/` Found**: Ignore completely. Do not read, modify, or validate.
* **Conflicting Instructions**: Preserve conflict, identify likely source of truth, and report for human review.
* **File Too Large**: Trim duplication and offload verbose reference material to `./.agents/context/`.

---

## Verification

After synchronization, execute and verify:
1. **Validation Script**:
   ```bash
   bash path/to/updateagents/scripts/validate-memory-file.sh AGENTS.md
   ```
2. **Boundary Audit**: Confirm `git status` shows zero modifications in `.memory/**` and zero changes to application source code.
3. **DOX Integrity**: If retrofitted, verify all 9 folders exist in `.agents/` and `.agents/context/current.md` lists verified live deliverables.
   - Verify root `CLAUDE.md` is present and contains only `@AGENTS.md`; it must not become a second rules source.
4. **Size Check**: Verify all instruction files remain under 5KB (hard ceiling 10KB).
5. **Completion Criteria Checklist**:
   - Relevant agent files discovered
   - Project state inspected from canonical sources
   - Durable knowledge identified and delta built
   - Valid existing content preserved
   - `.memory/**` untouched
   - Standards synced from single template canon
   - Structured change report generated
