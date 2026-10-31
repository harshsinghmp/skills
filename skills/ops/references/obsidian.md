# obsidian — Obsidian PKM Vault Workflows, Obsidian-Flavored Markdown & CLI Automation

Comprehensive operations manual for Obsidian Personal Knowledge Management (PKM) vaults. Consolidates vault filesystem operations, Obsidian Flavored Markdown (OFM) grammar, and the native `obsidian` CLI into a single production-grade agency standard.

---

## Intake

- **Vault Path**: Resolved absolute path to the Obsidian vault directory (`$OBSIDIAN_VAULT_PATH` or default `~/Documents/Obsidian Vault`).
- **Target Mode**: Filesystem-first operations (read, list, create, patch, search) vs. Running instance CLI automation (via `obsidian` CLI).
- **Document Scope**: New note creation, section embeds, wikilink network construction, frontmatter schema updates, or plugin/theme development.
- **Default Stack**: Standard Markdown tools (`view_file`, `write_to_file`, `replace_file_content`, `grep_search`), native `obsidian` CLI for active vault runtime control.

---

## Deliverables

1. **Vault Notes & Knowledge Graphs**: Fully compliant OFM notes with bidirectional wikilinks (`[[Note Name]]`), hierarchical tags (`#nested/tag`), frontmatter properties, and contextual embeds (`![[Resource]]`).
2. **Callout & Highlight Blocks**: Visual alert typography (`> [!type]`) with custom titles, foldability toggles (`-`/`+`), and nested hierarchies.
3. **CLI Task & Daily Automation**: Scripted daily note updates, property modifications, backlinks analysis, and automated search queries.
4. **Plugin / Theme Developer Verification**: Hot-reload sequences, DOM inspections, error captures, and app evaluation.

---

## Procedure

### 1. Vault Path Resolution & File Safety

Never pass unresolved environment variables like `$OBSIDIAN_VAULT_PATH` to file tools. File tools do not expand shell variables:

1. **Determine Concrete Absolute Path**:
   ```bash
   # Check environment or fallback
   VAULT_DIR="${OBSIDIAN_VAULT_PATH:-$HOME/Documents/Obsidian Vault}"
   ```
2. **Path Handling**:
   - Vault paths frequently contain spaces. Quote all paths in shell commands.
   - For listing notes, search under the vault root for `*.md`.
   - For note reading and editing, always provide absolute file paths.

---

### 2. Obsidian Flavored Markdown (OFM) Syntax

Obsidian extends CommonMark and GitHub Flavored Markdown (GFM) with specialized linking, embedding, and metadata extensions:

#### A. Internal Links (Wikilinks)
Wikilinks establish bidirectional relationships between notes in the vault. Obsidian tracks renames automatically:
```markdown
[[Note Name]]                          # Standard note link
[[Note Name|Custom Display Label]]     # Link with custom display text
[[Note Name#Section Heading]]          # Link to specific heading inside note
[[Note Name#^block-id]]                # Link to specific block/paragraph
[[#Heading in Same Note]]              # Heading anchor link within current note
```

**Defining Block IDs**:
- For paragraphs: append ` ^my-block-id` to the end of the line:
  ```markdown
  This is a critical architectural requirement that must be referenced. ^arch-req-01
  ```
- For lists or blockquotes: place `^block-id` on an empty line immediately following the block:
  ```markdown
  > Quality is not an act, it is a habit.

  ^quote-quality
  ```

#### B. Content & Asset Embeds
Prefix any link with `!` to embed the content inline rather than creating a navigable reference:
```markdown
![[Note Name]]                         # Transclude entire note
![[Note Name#Heading]]                 # Transclude specific section
![[Note Name#^block-id]]               # Transclude specific block
![[image.png]]                         # Embed image
![[image.png|400]]                     # Embed image scaled to 400px width (maintains ratio)
![[image.png|640x480]]                 # Embed image with explicit Width x Height
![[document.pdf#page=3]]               # Embed specific page of a PDF document
![[document.pdf#height=500]]           # Embed PDF viewer with custom container height
![[audio.mp3]]                         # Native embedded audio player
![[BaseFile.base#View Name]]           # Embed Obsidian Canvas / Base views
```

**Search Result Embeds**:
````markdown
```query
tag:#agency/client status:active
```
````

#### C. Visual Callout Typography
Standard syntax: `> [!type] Optional Custom Title`. Add `-` for collapsed-by-default, or `+` for expanded-by-default:

```markdown
> [!note]
> Standard informative note callout.

> [!important] Mandatory Delivery Milestone
> This deliverable is non-negotiable for phase sign-off.

> [!faq]- Collapsible Architecture Rationale
> Content inside is hidden until the user clicks to expand.
```

**Supported Standard Callout Types**:
| Type | Semantic Meaning | Recognized Aliases | Visual Color / Accent |
|:---|:---|:---|:---|
| `note` | General contextual note | - | Blue |
| `abstract` | Executive summary, TL;DR | `summary`, `tldr` | Teal / Cyan |
| `info` | Additional technical info | - | Blue |
| `todo` | Outstanding action item | - | Blue |
| `tip` | Actionable best practice | `hint`, `important` | Cyan / Flame |
| `success` | Passed verification / gate | `check`, `done` | Green |
| `question` | Clarification prompt | `help`, `faq` | Yellow |
| `warning` | Risk, deviation, caution | `caution`, `attention` | Orange |
| `failure` | Failed test or contract | `fail`, `missing` | Red |
| `danger` | High-risk hazard or data loss | `error` | Red |
| `bug` | Known defect or regression | - | Red |
| `example` | Implementation sample | - | Purple |
| `quote` | Verbatim quote or citation | `cite` | Gray |

**Nested Callouts**:
```markdown
> [!warning] Root Risk
> > [!tip] Recommended Mitigation
> > Apply defensive retry loops before failing.
```

#### D. Properties (YAML Frontmatter)
Every structured note should carry standardized frontmatter properties at line 1:
```yaml
---
title: Project Orion Master SOW
date: 2026-09-22
tags:
  - agency/client/orion
  - ops/sow
aliases:
  - Orion SOW
  - Master Scope Orion
status: in-progress
rating: 5.0
completed: false
due: 2026-10-15T18:00:00
cssclasses:
  - wide-page
  - agency-theme
---
```

**Property Data Types**:
- Text: `title: String value`
- Number: `rating: 4.8` or `version: 2`
- Checkbox: `completed: true`
- Date: `date: 2026-09-22`
- Date & Time: `due: 2026-10-15T18:00:00`
- List: `tags: [item1, item2]` or multiline YAML list
- Internal Link: `client_ref: "[[Client Dossier - Orion]]"`

#### E. Native Diagrams & LaTeX Math
- **Inline & Block Math**:
  ```markdown
  The realization rate formula is $\text{Realization} = \frac{\text{Collected Revenue}}{\text{Billable Hours} \times \text{Standard Rate}}$.
  
  $$
  \text{EHR} = \frac{\text{Total Net Retainer Fees}}{\text{Actual Team Hours Spent}}
  $$
  ```
- **Mermaid Diagrams with Internal Links**:
  ````markdown
  ```mermaid
  graph TD
      A[Intake Brief] --> B[SOW Scope]
      B --> C[Milestone Delivery]
      class B internal-link;
  ```
  ````

---

### 3. Obsidian CLI Automation Reference

When an Obsidian desktop instance is running, execute programmatic queries and mutations via the `obsidian` CLI:

#### Syntax Conventions
- **Parameters**: `key=value` (quote values containing spaces):
  ```bash
  obsidian create name="Q4 Strategy" content="# Q4 Strategic Roadmap\n\n- Key objectives..."
  ```
- **Flags**: Boolean switches without values (`silent`, `overwrite`, `total`):
  ```bash
  obsidian create name="Meeting Notes" content="Notes..." silent overwrite
  ```
- **File Targeting**:
  - `file="Note Name"`: Resolves by note name like a wikilink (extension and path optional).
  - `path="folder/note.md"`: Resolves by exact relative path from vault root.
  - Omitted: Defaults to currently focused active note.
- **Vault Targeting**:
  - `vault="Vault Name"`: Targets specific vault when multiple are configured.

#### Command Playbook
```bash
# Read note contents
obsidian read file="Client Orion Scope"

# Create new note with template silently in background
obsidian create name="2026-09-22 Meeting" content="# Standup Notes" template="Daily-Template" silent

# Append content or task to note
obsidian append file="Task Backlog" content="- [ ] Review milestone 2 invoice\n"

# Search vault contents (limit results)
obsidian search query="path:Projects/Orion status:active" limit=15

# Daily note interaction
obsidian daily:read
obsidian daily:append content="- [x] Finalized SOW change order #2\n"

# Property mutation
obsidian property:set name="status" value="signed" file="Client Orion Scope"

# Tasks & backlinks audit
obsidian tasks daily todo
obsidian backlinks file="Client Orion Scope"
obsidian tags sort=count counts
```

#### Plugin & Theme Developer Verification Loop
When developing, modifying, or debugging Obsidian plugins and themes:
1. **Reload Plugin**:
   ```bash
   obsidian plugin:reload id="my-agency-plugin"
   ```
2. **Inspect Error Console**:
   ```bash
   obsidian dev:errors
   obsidian dev:console level=error
   ```
3. **Visual DOM & Screenshot Verification**:
   ```bash
   obsidian dev:screenshot path="/tmp/obsidian-view.png"
   obsidian dev:dom selector=".workspace-leaf.mod-active" text
   ```
4. **App Context Evaluation**:
   ```bash
   obsidian eval code="app.vault.getMarkdownFiles().length"
   ```
5. **Mobile Viewport Emulation**:
   ```bash
   obsidian dev:mobile on
   # Run tests on mobile layout
   obsidian dev:mobile off
   ```

---

### 4. JSON Canvas (.canvas) Specification & Visual Spatial Graphs

Obsidian native infinite canvases use the open [JSON Canvas 1.0](https://jsoncanvas.org/) specification (`.canvas` files). Use this format to programmatically build architecture maps, mind maps, concept clusters, and client onboarding roadmaps.

#### Core JSON Structure
```json
{
  "nodes": [
    {
      "id": "node-root",
      "type": "text",
      "text": "# Client Architecture\nCore system topology",
      "x": 0,
      "y": 0,
      "width": 320,
      "height": 180,
      "color": "1"
    },
    {
      "id": "node-scope-file",
      "type": "file",
      "file": "Projects/Orion/Scope.md",
      "x": 420,
      "y": -50,
      "width": 300,
      "height": 220
    },
    {
      "id": "node-live-url",
      "type": "link",
      "url": "https://client-demo.vercel.app",
      "x": 420,
      "y": 200,
      "width": 300,
      "height": 220
    },
    {
      "id": "group-backend",
      "type": "group",
      "label": "Data Tier",
      "x": -40,
      "y": 360,
      "width": 780,
      "height": 340,
      "color": "4"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "fromNode": "node-root",
      "fromSide": "right",
      "toNode": "node-scope-file",
      "toSide": "left",
      "toEnd": "arrow",
      "label": "governed by"
    },
    {
      "id": "edge-2",
      "fromNode": "node-root",
      "fromSide": "bottom",
      "toNode": "group-backend",
      "toSide": "top",
      "toEnd": "arrow"
    }
  ]
}
```

#### Node Schema Reference
| Type | Required Properties | Optional Properties | Purpose |
|:---|:---|:---|:---|
| `text` | `id`, `type: "text"`, `text`, `x`, `y`, `width`, `height` | `color` | Markdown-rendered card containing headings, checklists, code blocks. |
| `file` | `id`, `type: "file"`, `file`, `x`, `y`, `width`, `height` | `subpath` (e.g. `#Heading`), `color` | Embedded vault file (`.md`, `.png`, `.pdf`). |
| `link` | `id`, `type: "link"`, `url`, `x`, `y`, `width`, `height` | `color` | Web bookmark card with preview. |
| `group` | `id`, `type: "group"`, `x`, `y`, `width`, `height` | `label`, `background`, `backgroundStyle` (`cover`\|`ratio`\|`repeat`), `color` | Visual bounding box clustering related nodes. |

#### Edge Schema & Canvas Colors
- **Sides**: `"top"`, `"right"`, `"bottom"`, `"left"`.
- **End Shapes**: `"none"`, `"arrow"` (applied to `fromEnd` or `toEnd`).
- **Standard Canvas Palette**:
  - `"1"`: Red (`#e93535`)
  - `"2"`: Orange (`#ec7500`)
  - `"3"`: Yellow (`#e0ac00`)
  - `"4"`: Green (`#08b94e`)
  - `"5"`: Cyan / Teal (`#00bfbc`)
  - `"6"`: Purple (`#7852ee`)
  - Custom: Valid hex color (e.g. `"#4338ca"`).

---

## Quality Gate Checklist

Before completing an Obsidian documentation or vault task, verify:
- [ ] Frontmatter properties follow YAML standards with no unquoted special characters.
- [ ] All internal cross-references use double-bracket wikilinks (`[[Note Name]]`).
- [ ] Callouts adhere to standard types (`note`, `tip`, `warning`, `important`, `faq`).
- [ ] Embedded media specifies responsive dimensions or block identifiers where appropriate.
- [ ] Canvas files (`.canvas`) parse as strictly valid JSON matching the JSON Canvas 1.0 schema (valid `nodes` and `edges`).
- [ ] CLI executions utilize `silent` when run by background agent scripts.
