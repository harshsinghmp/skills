---
name: updateagents
aliases: ["sync-agents","update-memory","agent-sync"]
description: "Synchronize AI-agent instructions and project context with the actual current state of the workspace. Identifies durable agent-relevant knowledge, enforces strict MuseMemory isolation, retrofits Progressive Disclosure DOX architecture, and synchronizes standards from the single template canon."
version: 2.0.0
author: Agency Council
license: MIT
platforms: [macos, linux, windows]
category: core-engine
metadata:
  category: core-engine
  priority: 2
  aliases: ["sync-agents","update-memory","agent-sync"]
  suggested_skills: ["updatedocs","new-project","handoff","context-anchor"]
  hermes:
    tags: [memory, documentation, context, agents, workspace, synchronization, dox]
    related_skills: [updatedocs, new-project, handoff, context-anchor]
    suggested_skills: [updatedocs, new-project, handoff, context-anchor]
    requires_tools: [bash, view_file, write_to_file, grep_search]
  openclaw:
    category: core-engine
    suggested_skills: [updatedocs, new-project, handoff, context-anchor]
    primary_triggers: ["update agents","sync project context","update memory","sync AGENTS.md"]
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
AGENTS.md → CLAUDE.md → .cursorrules → .github/copilot-instructions.md → GEMINI.md → CODEX.md
```
This is a heuristic, not permission to overwrite or delete lower-priority files. Never consolidate files automatically.

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
Before performing deep inspection or delta generation, run the `ai-ready` fast-skip verification:
1. Verify `AGENTS.md` exists and is `<50 lines`.
2. Verify `.agents/standards` and `.agents/context` exist and are populated.
3. If instructions are already aligned with project reality:
   ```text
   [ai-ready] Agent instructions and DOX container verified. Skipping pass.
   ```
   Exit immediately with 0 changes and zero token waste. Proceed only when structural drift or new project requirements are detected.

### Step 1 — Establish Workspace Context
Determine current directory, repository status, project type, language/runtime, package manager, and application boundaries. Exclude parent directories and `.memory/**`.

### Step 2 — Discover Agent Context
Discover supported agent files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, etc.). Determine scope, authority, priority, and directory applicability. Read relevant files before editing them.

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

### Step 8 — Check Existing Agent Files & Scaffolding Gate
1. Check if any agent engine files exist (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.agents/`, etc.).
2. **If NONE Found**:
   - Scaffold the entire fresh Agent Engine DOX architecture directly from `ai-ready/templates/`.
   - Provision `.agents/` 9-folder tree (`archive`, `artifacts`, `brand`, `context`, `goals`, `research`, `skills`, `standards`, `workflows`).
   - Deploy lean root `AGENTS.md` router (<50 lines) and initialize `.agents/context/` files based on repository discovery.
3. **If ANY Found (Custom Content Present)**:
   - Do NOT overwrite human work. Parse and extract custom sections:
     - Project Purpose / Scope → Merge into `.agents/context/product.md`
     - Build Commands / Tech Stack / Database → Merge into `.agents/context/architecture.md`
     - Architectural Decisions / Rules / ADRs → Merge into `.agents/context/decisions.md`
     - In-flight tasks / active notes → Merge into `.agents/context/current.md`
   - Safely archive un-split legacy files to `.agents/archive/AGENTS.legacy-[timestamp].md` or `.agents/archive/CLAUDE.legacy-[timestamp].md`.
   - Deploy lean root `AGENTS.md` DOX rail (<50 lines) pointing to the newly organized `.agents/` context files.

### Step 9 — Synchronize Standards from Single Canon
Synchronize `.agents/standards/` (all 13 rulebooks, including modern WordPress) and `.agents/brand/` baseline tokens directly from `ai-ready/templates/`. Never touch or overwrite `.agents/context/*` custom facts or project source files.

### Step 10 — Capture Commands Precisely
Document commands only when verified in `package.json` or project tooling (Install, Dev, Build, Test, Typecheck, Lint). Never invent commands.

### Step 11 — Capture Architecture & Boundaries
Document relationships, data flows, and module boundaries rather than simple directory dumps.

### Step 12 — Capture Conventions & Sources of Truth
Explicitly document authority relationships (package scripts authoritative for commands, migrations authoritative for DB).

### Step 13 — Capture Agent-Specific Rules
Record operational rules (Vibeguard, test gates, token usage) supported by actual project policy.

### Step 14 — Synchronize Related Knowledge
Propagate downstream effects (e.g. API changes affecting types and tests) when future agent behavior should change.

### Step 15 — Size & Noise Control
- **Target**: `< 5KB`
- **Warning**: `≥ 5KB`
- **Hard Limit**: `≥ 10KB`
Remove duplication and move verbose reference material to dedicated documentation.

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
4. **Size Check**: Verify all instruction files remain under 5KB (hard ceiling 10KB).
5. **Completion Criteria Checklist**:
   - Relevant agent files discovered
   - Project state inspected from canonical sources
   - Durable knowledge identified and delta built
   - Valid existing content preserved
   - `.memory/**` untouched
   - Standards synced from single template canon
   - Structured change report generated
