---
name: updateagents
description: "Automatically discovers, reads, and updates agent memory files (AGENTS.md, CLAUDE.md, .cursorrules, etc.) in the current working directory. Integrates with cavemem, codegraph, rtk, memoryagent, and ponytail for enhanced context discovery. Workspace-scoped only."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [memory, documentation, context, agents, workspace, synchronization]
    related_skills: [new-project, context-anchor, agent-handoff]
    requires_tools: [bash, view_file, edit_file, grep_search]
---

# 🧠 updateagents — Memory & Context Synchronization

Automatically discovers, reads, and updates agent memory files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, etc.) in the current working directory. Scans workspace for commands, patterns, conventions, and architecture details, then merges new findings into existing memory files or creates them if missing.

---

## When to Use

- User asks to *"update agents.md"*, *"refresh clauade.md"*, or *"sync memory files"*.
- After significant codebase changes, refactors, or new library additions.
- Before handing off complex tasks to downstream subagents.
- When beginning work in a repository lacking structured AI memory documentation.
- Periodic context hygiene maintenance.

---

## Quick Reference

| Discovery Source | Scope & Capability | Output Destination |
|:---|:---|:---|
| **Discovery Tools** | `cavemem`, `codegraph`, `rtk`, `memoryagent`, `ponytail` | Synthesized in-memory |
| **Workspace Inspection** | `package.json`, `Makefile`, config files, test scripts | Architecture & commands |
| **Target Memory File** | `AGENTS.md` > `CLAUDE.md` > `.cursorrules` | Root directory |

---

## Procedure

### Step 1: Discover Existing Memory Files
Search the **current working directory only** (never traverse above root) for:
- `AGENTS.md`
- `CLAUDE.md`
- `.cursorrules`
- `.github/copilot-instructions.md`
- Priority order: `AGENTS.md` > `CLAUDE.md` > `.cursorrules` > others.

### Step 2: Read Existing Content
Read the highest-priority discovered file to preserve existing conventions, architecture decisions, and prevent redundant rewriting.

### Step 3: Scan Workspace for New Patterns
Run discovery tools and manual inspections in parallel:

```bash
# Inspection commands
find . -maxdepth 2 -name "package.json" -o -name "Makefile" -o -name "*.toml" -o -name "*.yaml" | head -10
grep -r "scripts" package.json 2>/dev/null | head -20
find . -name "*.test.*" -o -name "*.spec.*" | head -5
```

### Step 4: Synthesize Findings
Extract and categorize:
- **Essential Commands**: Build, test, typecheck, lint, deploy.
- **Architecture**: Core entry points, routing layout, runtime state.
- **Conventions**: Naming standards, styling tokens, error handling.
- **Gotchas**: Hidden environmental dependencies, non-obvious configurations.

### Step 5: Merge and Update
- Preserve existing valid sections.
- Update stale commands or obsolete dependency references.
- Maintain total file size under 10KB (under 5KB preferred).

---

## Pitfalls

- **Parent Traversal**: NEVER scan or modify directories outside the current workspace root.
- **Overwriting History**: NEVER clobber custom user notes or architectural decision records.
- **Bloat & Noise**: Avoid dumping full source files or verbose stack traces into memory files.

---

## Verification

Run validation script to ensure memory file formatting and constraints pass:

```bash
bash updateagents/scripts/validate-memory-file.sh AGENTS.md
```

Confirm that:
1. File size is within recommended range (<10KB).
2. Essential commands and required sections (`Quick Start`, `Architecture`, `Conventions`, `Testing`, `Gotchas`) are present.
3. Update timestamp is refreshed.
