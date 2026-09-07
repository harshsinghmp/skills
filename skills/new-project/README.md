# 🚀 `new-project` Skill

> Autonomous Project Operating System & Progressive Disclosure DOX Scaffolder.  
> **Aliases**: `Agent Engine` | `DOX Engine`

`new-project` (also known as the **Agent Engine** or **DOX Engine**) transforms any new or existing workspace into a fully governed **AI-Native Operating Environment** following the **"Agents First, Then Project Type"** architecture.

---

## ⚡ Key Architectural Features

- **🛡️ Agents First (Governance Container)**: Provisions the lean root `AGENTS.md` (~45 lines) and the complete `.agents/` container *before* framework creation, establishing security boundaries and gitignore early.
- **📁 Complete 9-Folder `.agents/` Containment**:
  - `archive/` — Retired plans & completed scratchpads (`[title]-[timestamp].md`)
  - `artifacts/` — Active walkthroughs, specifications & diffs
  - `brand/` — Design tokens (OKLCH, typography, motion, radii) + BEM conventions + A11y checklist
  - `context/` — 7 durable context files (`index`, `product`, `architecture`, `brand`, `current`, `decisions`, `roadmap`)
  - `goals/` — Session goals & sprint verification checklists
  - `research/` — Deep research briefs & benchmark logs
  - `skills/` — Clean, isolated container for project-specific skills
  - `standards/` — 13 modular rulebooks read on-demand (including modern WordPress)
  - `workflows/` — Custom project workflows & protocols
- **🧠 Cognitive Memory Hook**: Automatically initializes `.memory/` via `musememory` with active working invariants and multi-agent coordination.
- **🔒 Strict Project Isolation**: Zero cross-project bleed. Starts with clean containers and zero leaked client assets.
- **⚡ Interactive Path Picker & Framework Launcher**: Flexible folder selection anywhere in storage, launching official framework creators (Astro v7.2.x, Next.js 16, WordPress, Instatic, Hono, Vite).

---

## 💻 Usage

Run via Bun:

```bash
# Interactive Mode (Prompts for destination, name, and framework)
bun path/to/new-project/scripts/new-project.ts

# Non-Interactive Mode (Direct flags)
bun path/to/new-project/scripts/new-project.ts <targetPath> --name="MyApp" --type="astro"
```

### CLI Flags

| Flag | Description | Default |
|:---|:---|:---|
| `-n, --name <name>` | Project name | Directory basename |
| `-t, --type <type>` | `astro` \| `nextjs` \| `wordpress` \| `instatic` \| `hono` \| `vite` \| `none` | Prompted |
| `-d, --desc <desc>` | Short project description | Auto-generated |
| `-p, --path <path>` | Target directory path | Prompted |
| `--non-interactive` | Run without interactive prompts | `false` |
| `--dry-run` | Simulate scaffolding without writing files | `false` |
| `-f, --force` | Overwrite existing files | `false` |
| `-h, --help` | Display help message | |

---

## 🛠️ Supported Framework Archetypes

1. **Astro v7.2.x** *(Recommended)*: Static-first with selective `client:*` island hydration, Zod content collections, `@astrojs/cloudflare`.
2. **Next.js 16**: React 19, App Router, Server Components by default, Server Actions, TanStack Query.
3. **WordPress**: Modern Roots Bedrock (12-factor, Composer, dotenv), custom theme hierarchy, Gutenberg blocks (`@wordpress/scripts`).
4. **Instatic HTML**: Pure HTML brochure and static landing pages, zero-JS by default, sub-millisecond TTFB.
5. **Hono / Workers**: High-performance Cloudflare Workers edge API microservice.
6. **Vite + React SPA**: Client-side single page applications with TypeScript.
7. **None / Existing**: Governance container only (DOX baseline on existing repository).

---

## ⚡ Continuous Self-Improvement (Skill Extraction)

When an agent repeatedly solves recurring problems across multiple tasks ($\ge 3$ occurrences), package the pattern directly into a new RFC-compliant skill:

```bash
bun scripts/extract-skill.ts \
  --name "custom-pattern" \
  --desc "Extract and execute deterministic pattern solution" \
  --occurrences 3 \
  --verified
```

See [`references/skill-extraction.md`](references/skill-extraction.md) for the complete 3-gate lifecycle specification (Recurrence, Verification, Generalization).

