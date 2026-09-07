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
- **🔄 Single Source of Truth**: Pulls updated universal standards (`.agents/standards/`) and brand baselines directly from `ai-ready/templates/` (13 modular standards, including modern WordPress) with **zero duplicate templates**.
- **📏 Compact Size Control**: Enforces concise instruction files (<5KB preferred, <10KB hard ceiling).

---

## 💻 Usage

### Agent Prompt Cues
```
"update agents.md"
"sync project agent context"
"retrofit this project with the DOX architecture"
"refresh agent rules and standards"
```

### Direct CLI Execution
```bash
# Run in the current working directory
bun path/to/updateagents/scripts/updateagents.ts

# Run in simulation mode without writing files
bun path/to/updateagents/scripts/updateagents.ts --dry-run

# Run on a specific target project
bun path/to/updateagents/scripts/updateagents.ts /path/to/project
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
2. **Discover Agent Context**: Identifies `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, etc.
3. **Inspect Project State**: Reads canonical sources (`package.json`, build/test configs).
4. **Context Integrations**: Utilizes `codegraph`, `rtk`, or `ponytail` if present.
5. **Build Context Delta**: Categorizes changes into `NEW`, `CHANGED`, `OBSOLETE`, `CONFLICTING`.
6. **Determine Targets**: Targets smallest correct scope.
7. **Preserve Existing Knowledge**: Protects intentional human notes and ADRs.
8. **DOX Scaffolding & Context Placement**: Checks existing agent files, scaffolds if absent, and merges custom content into context files without clobbering.
9. **Standards Synchronization**: Syncs the 13 rulebooks from `ai-ready/templates/` (including WordPress).
10. **Capture Commands**: Verifies commands against actual package scripts.
11. **Capture Architecture**: Documents system boundaries and data flows.
12. **Capture Sources of Truth**: Explicitly records authoritative files.
13. **Capture Agent Rules**: Records operational invariants and Vibeguard policies.
14. **Downstream Synchronization**: Propagates changes affecting types or tests.
15. **Size & Noise Control**: Validates instruction file sizes (<5KB target).
16. **Validate**: Runs `validate-memory-file.sh` to confirm invariants.
17. **Report**: Generates a structured change summary.
