# updateagents Skill

Automatically discovers, reads, and updates agent memory files (AGENTS.md, CLAUDE.md, .cursorrules, etc.) in the current working directory. Integrates with cavemem, codegraph, rtk, memoryagent, and ponytail for enhanced context discovery.

## Features

- **Auto-discovery**: Finds existing memory files (AGENTS.md, CLAUDE.md, .cursorrules, etc.)
- **Workspace-scoped**: Never traverses above current directory
- **Tool integration**: Works with cavemem, codegraph, rtk, memoryagent, ponytail
- **Incremental updates**: Preserves existing content, adds only new information
- **Priority system**: Handles multiple memory files intelligently
- **Size management**: Keeps files under recommended 5KB limit

## Installation

Install via `npx skills` shorthand:

```bash
# Recommended shorthand
npx skills add harshsinghmp/muse-skills --skill updateagents
```

*(Full URL syntax `npx skills add https://github.com/harshsinghmp/muse-skills/tree/main/updateagents` is also supported).*

## Usage

### Basic usage
```bash
# Trigger by saying:
"update agents.md"
"refresh clauade.md"
"sync memory files"
"create agent guide for this workspace"
```

### With specific tools
If you have these tools installed, they'll be used automatically:
- `cavemem` - Historical session context
- `codegraph` - Code structure analysis
- `rtk` - Repository pattern extraction
- `memoryagent` - Workspace memory capture
- `ponytail` - Recent activity extraction

### Manual trigger
```bash
# You can also explicitly invoke:
"run updateagents skill"
```

## What it does

1. **Discovers** existing memory files in current directory
2. **Reads** highest-priority file if found
3. **Scans** workspace using available tools + manual inspection
4. **Synthesizes** findings into structured sections
5. **Updates** or creates memory file with proper format
6. **Reports** what changed

## Output structure

Generated files include:
- Quick Start commands (build, test, run, deploy)
- Architecture overview
- Key directories and purposes
- Naming conventions and patterns
- Testing setup and commands
- Gotchas and pitfalls
- Important dependencies

## Safety guarantees

- ✅ Never modifies parent directories
- ✅ Always reads before writing
- ✅ Preserves existing content
- ✅ Warns about large files (>5KB)
- ✅ Validates output structure

## File priorities

When multiple memory files exist:
1. AGENTS.md (preferred)
2. CLAUDE.md
3. .cursorrules
4. .github/copilot-instructions.md
5. GEMINI.md
6. CODEX.md

## Examples

See `examples/before-after.md` for detailed usage examples.

## Validation

After updating, validate the output:
```bash
./scripts/validate-memory-file.sh AGENTS.md
```

## Integration

This skill works seamlessly with:
- **cavemem**: Provides historical context from previous sessions
- **codegraph**: Maps code relationships automatically
- **rtk**: Extracts repository-level patterns
- **memoryagent**: Captures workspace-specific decisions
- **ponytail**: Extracts recent activity and logs

## Troubleshooting

**Q: No tools detected**
A: Skill falls back to manual scanning. Install tools for richer context.

**Q: File too large**
A: Skill warns at 5KB, errors at 10KB. Manually trim if needed.

**Q: Multiple files found**
A: Updates highest priority file. Consider consolidating manually.

**Q: Missing sections**
A: Run validation script to check structure completeness.

## Contributing

To improve this skill:
1. Add new discovery patterns to `references/discovery-commands.md`
2. Update priority system in `references/memory-file-priorities.md`
3. Add examples to `examples/before-after.md`
