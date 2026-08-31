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

**User request:** "Update agents.md in /home/harsh/Projects/myapp"

**Skill execution:**
1. Changes to `/home/harsh/Projects/myapp`
2. Confirms working directory is workspace root
3. Scans only within `/home/harsh/Projects/myapp`
4. Never reads parent `/home/harsh/Projects` or `/home/harsh`
5. Updates file at `/home/harsh/Projects/myapp/AGENTS.md`

**Safety check output:**
```
✅ Workspace root: /home/harsh/Projects/myapp
✅ No parent directory traversal detected
✅ All file operations scoped to workspace
```

## Example 5: Multiple memory files detected

**User request:** "Refresh agent documentation"

**Skill execution:**
1. Discovers both `AGENTS.md` and `CLAUDE.md` exist
2. Prioritizes AGENTS.md (higher priority)
3. Reads CLAUDE.md to check for unique content
4. Merges unique CLAUDE.md content into AGENTS.md
5. Updates AGENTS.md with combined information
6. Leaves CLAUDE.md untouched (user can delete manually if desired)

**Output:**
```
⚠️  Multiple memory files found: AGENTS.md, CLAUDE.md
✅ Updated AGENTS.md (merged unique content from CLAUDE.md)
ℹ️  CLAUDE.md preserved (consider removing if redundant)
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
