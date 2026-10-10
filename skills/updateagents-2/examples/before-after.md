# updateagents Skill Examples

## Example 1: First-time creation in empty workspace

**User request:** "Create an AGENTS.md for this Next.js project"

**Skill execution:**
1. Scans workspace, finds no existing memory files
2. Detects `package.json` with scripts: dev, build, test, lint
3. Identifies Next.js 14 App Router structure
4. Finds Vitest for testing in `src/**/*.test.tsx`
5. Creates `AGENTS.md` with:
   - Quick Start commands
   - App Router architecture overview
   - TypeScript + Tailwind conventions
   - Testing setup details
   - Environment variable requirements

**Output:**
```
✅ Created AGENTS.md (3.2KB)
Added sections: Quick Start, Architecture, Conventions, Testing, Gotchas
Found 8 essential commands
Tools used: manual scan (cavemem/codegraph not installed)
```

## Example 2: Updating existing CLAUDE.md

**User request:** "Update the agent memory after I refactored the auth system"

**Skill execution:**
1. Finds existing `CLAUDE.md` (2.8KB)
2. Runs codegraph to detect new auth module structure
3. Scans for updated test patterns
4. Updates Architecture section with new auth flow
5. Adds new environment variables to Gotchas
6. Preserves all other sections unchanged

**Output:**
```
✅ Updated CLAUDE.md (was 2.8KB, now 3.4KB)
Modified: Architecture (auth system), Gotchas (new env vars)
Preserved: Quick Start, Conventions, Testing
Added timestamp: 2026-08-16
```

## Example 3: Integration with cavemem and codegraph

**User request:** "Sync agent docs using all available tools"

**Skill execution:**
1. Runs in parallel:
   - `cavemem extract --format markdown` → historical context
   - `codegraph analyze --format markdown` → architecture map
   - `rtk scan` → repository patterns
   - `memoryagent capture` → workspace decisions
   - `ponytail extract` → recent activity
2. Merges all outputs with manual scan
3. Creates comprehensive AGENTS.md

**Output:**
```
✅ Created AGENTS.md (4.7KB)
Tools used: cavemem, codegraph, rtk, memoryagent, ponytail
Sections added: 7 (including dependency graph from codegraph)
Historical context: 12 session memories integrated
```

## Example 4: Workspace boundary enforcement

**User request:** "Update agents.md in /home/developer/Projects/myapp"

**Skill execution:**
1. Changes to `/home/developer/Projects/myapp`
2. Confirms working directory is workspace root
3. Scans only within `/home/developer/Projects/myapp`
4. Never reads parent `/home/developer/Projects` or `/home/developer`
5. Updates file at `/home/developer/Projects/myapp/AGENTS.md`

**Safety check output:**
```
✅ Workspace root: /home/developer/Projects/myapp
✅ No parent directory traversal detected
✅ All file operations scoped to workspace
```

## Example 5: Multiple agent instruction systems detected

**User request:** "Refresh agent documentation"

**Skill execution:**
1. Discovers `AGENTS.md`, `CLAUDE.md`, and scoped runtime rules.
2. Copies each exact source to `.agents/archive/agent-instructions/` and records source paths + hashes.
3. Imports full text and scope metadata into `.agents/context/imported-agent-instructions.md`.
4. Updates the shared `AGENTS.md` router and replaces supported runtime files with adapters.
5. Leaves a visible source → archive → canonical-context map; Claude's adapter is `@AGENTS.md`.

**Output:**
```
🧭 Imported: AGENTS.md, CLAUDE.md, .cursor/rules/design.mdc
📦 Preserved exact originals under .agents/archive/agent-instructions/
✅ Shared rules active in .agents/context/imported-agent-instructions.md
🔗 Runtime adapters now route to AGENTS.md
```

## Common Trigger Phrases

- "update agents.md"
- "refresh clauade.md" 
- "sync memory files"
- "document this for agents"
- "create agent guide"
- "workspace memory update"
- "agent context refresh"
- "update claude instructions"
- "sync codex docs"
