# 🧠 `updateagents` Skill

> Project Agent Context Synchronization & DOX Architecture Maintenance.

Synchronize AI-agent instructions and project context with the **actual current state of the workspace**.

This skill is not merely an `AGENTS.md` updater. It determines what project information has changed, identifies which agent-facing instruction files are authoritative, updates only necessary content, preserves intentional human-authored material, and validates the resulting context.

---

## ⚡ Core Principles & Features

- **🎯 Agent-Relevant Knowledge**: Captures actionable commands, architecture boundaries, and sources of truth. Strictly avoids full file dumps, debug output, and transient noise.
- **🔒 HARD BOUNDARY — MuseMemory (`.memory/**`)**: The `.memory/` directory is exclusively owned and managed by MuseMemory. `updateagents` **never** reads, writes, modifies, deletes, or validates `.memory/**`.
- **🌐 Workspace-Scoped**: Operates strictly within the current working directory. Never traverses above the workspace.
- **🛠️ Smart DOX Retrofit**: If a workspace lacks the Progressive Disclosure DOX architecture, `updateagents` safely provisions the 9-folder `.agents/` container, migrates existing facts into `.agents/context/`, and archives legacy instruction files.
- **🔄 Single Source of Truth**: Houses the master DOX templates (`updateagents/templates/`), synchronizing all 19 modular rulebooks (including modern WordPress, fintech gateways, boundary governance, client reporting, motion diagrams, negative anti-patterns, and visual inspection) and brand baselines with **zero duplicate templates**.
- **📊 13-Asset AI Readiness Audit**: Evaluates repo maturity with Stage-0 Fast-Skip and CI gating (`--fail-under N`).
- **🏛️ Autonomous Secretary Dispatch**: Automatically ensures that the root `AGENTS.md` carries the Secretary Protocol router (`secretary:dispatch`), guaranteeing autonomous triage across all 46 departments on first run or session start.
- **🛡️ Synthetic Artifact Sanitization**: Strips proprietary IDE wrappers (`[[ORCA_RICH_MD]]`, Cursor markers) automatically via `--sanitize`.
- **⚖️ Global Invariant Atom Table Telemetry**: Audits active global invariant atoms against the $\le 20$ atom attention cap to prevent model instruction fatigue and context bloat.
- **📏 Compact Size Control**: Enforces concise instruction files (<5KB preferred, <10KB hard ceiling).

---

## 💻 Usage

### Agent Prompt Cues
```
"update agents.md"
"sync project agent context"
"make repo AI-ready"
"audit repository readiness"
"retrofit this project with the DOX architecture"
"refresh agent rules and standards"
```

### Direct CLI Execution
```bash
# Run context synchronization in current working directory
bun path/to/updateagents/scripts/updateagents.ts

# Audit 13 tracked assets for repository AI-readiness
bun path/to/updateagents/scripts/updateagents.ts --audit

# Gate CI on minimum readiness score (exits 1 if score < 12)
bun path/to/updateagents/scripts/updateagents.ts --audit --fail-under 12

# Scan and sanitize synthetic ADE/IDE artifacts
bun path/to/updateagents/scripts/updateagents.ts --sanitize

# Directly scaffold missing Agent Engine assets
bun path/to/updateagents/scripts/updateagents.ts --scaffold

# Explicitly confirm GitHub hosting when no remote/package metadata is set
bun path/to/updateagents/scripts/updateagents.ts --scaffold --github

# Confirm a non-GitHub host; workflow files are removed only with a second explicit confirmation
bun path/to/updateagents/scripts/updateagents.ts --scaffold --no-github --confirm-remove-github-workflows

# Remove existing GitHub workflows only after confirming a non-GitHub project
bun path/to/updateagents/scripts/updateagents.ts --scaffold --confirm-remove-github-workflows

# Context Token-Budget & Decay Health Meter
bun path/to/updateagents/scripts/updateagents.ts --budget

# Install Git Pre-Commit Hook (Stack Guard + Freshness Check)
bun path/to/updateagents/scripts/updateagents.ts --install-hook

# Provision Monorepo Sub-App Context
bun path/to/updateagents/scripts/updateagents.ts --subapp <name>

# Lint Context Markdown Links & @-imports
bun path/to/updateagents/scripts/updateagents.ts --lint-context

# Compile standards into .cursor/rules/*.mdc and .github/copilot-instructions.md
bun path/to/updateagents/scripts/updateagents.ts --sync-ide

# Validate standards against installed package.json dependencies
bun path/to/updateagents/scripts/updateagents.ts --lint-rules

# Archive completed historical milestones (>14d) into .agents/archive/milestones/
bun path/to/updateagents/scripts/updateagents.ts --archive-sprints

# Run in simulation mode without writing files
bun path/to/updateagents/scripts/updateagents.ts --dry-run
```

---

## 📋 The 17-Step Synchronization Procedure

```
Project State
      ↓
Change Detection (git diff, status)
      ↓
Impact Analysis (NEW | CHANGED | OBSOLETE)
      ↓
Source-of-Truth Resolution (package.json, configs)
      ↓
Agent Context Delta
      ↓
Scoped Synchronization & DOX Retrofit
      ↓
Validation & Size Check (<5KB, .memory untouched)
      ↓
Updated Agent Context
```

1. **Establish Workspace Context**: Verifies `cwd` and excludes `.memory/**`.
2. **Discover Agent Context**: Finds supported runtime instruction files, nested rule sets, and Markdown/text files inside generic agent/rule/instruction/prompt directories; snapshots exact originals, imports scoped rules into `.agents/context/imported-agent-instructions.md`, and installs lightweight adapters to the shared `AGENTS.md` engine.
3. **Inspect Project State**: Reads canonical sources (`package.json`, build/test configs).
4. **Context Integrations**: Utilizes `codegraph`, `rtk`, or `ponytail` if present.
5. **Build Context Delta**: Categorizes changes into `NEW`, `CHANGED`, `OBSOLETE`, `CONFLICTING`.
6. **Determine Targets**: Targets smallest correct scope.
7. **Preserve Existing Knowledge**: Protects intentional human notes and ADRs.
8. **DOX Scaffolding & Context Placement**: Scaffolds if absent; otherwise preserves every supported instruction source, migrates its complete contents with provenance, and adapts each runtime without silently losing rules.
9. **Standards Synchronization**: Syncs all 19 rulebooks from `updateagents/templates/` (including modern WordPress, fintech gateways, boundary governance, client reporting, motion diagrams, negative anti-patterns, and visual inspection) and displays the Invariant Atom Table telemetry.
10. **Capture Commands**: Verifies commands against actual package scripts.
11. **Capture Architecture**: Documents system boundaries and data flows.
12. **Capture Sources of Truth**: Explicitly records authoritative files.
13. **Capture Agent Rules**: Records operational invariants and Vibeguard policies.
14. **Downstream Synchronization**: Propagates changes affecting types or tests.
15. **Size & Noise Control**: Validates instruction file sizes (<5KB target).
16. **Validate**: Runs `validate-memory-file.sh` to confirm invariants.
17. **Report**: Generates a structured change summary.
