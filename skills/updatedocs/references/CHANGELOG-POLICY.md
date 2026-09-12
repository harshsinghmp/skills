# 📜 Changelog Policy & Versioning Standards

Rules for updating, structuring, and maintaining project changelogs without introducing historical distortion or commit noise.

---

## 1. Core Principles

- **Human-Curated Summaries**: A changelog is written for humans, not machines. It must describe the functional and consumer-facing impact of changes, not echo raw Git commit logs.
- **Strict Historical Preservation**: Never edit, rewrite, reorder, or delete past release sections. History remains immutable once tagged.
- **No Fabricated Metadata**: Never guess or invent upcoming version numbers, release dates, release tags, or GitHub release URLs without explicit evidence or confirmation.
- **Documentation Sync Boundary**: Documentation synchronization does NOT itself imply a changelog entry. Only document changes that represent meaningful project changes according to the changelog policy. Avoid changelog noise from routine documentation-only corrections unless the project explicitly tracks documentation changes.
- **Release-State Awareness**:
  - **Working Tree / Unreleased Changes**: Must always be placed under an `## [Unreleased]` header.
  - **Tagged Releases**: Only move items from `[Unreleased]` into a concrete version header (`## [1.2.0] - YYYY-MM-DD`) when executing a confirmed release.

---

## 2. Standard Changelog Categories

Categorize all notable changes using these standard Keep a Changelog categories in this exact order:

```markdown
### Added
- For new user-facing features, endpoints, components, or CLI commands.

### Changed
- For changes in existing functionality, modified API contracts, updated defaults, or upgraded dependencies.

### Deprecated
- For soon-to-be-removed features or APIs to notify consumers in advance.

### Removed
- For now-removed features, dropped configurations, or deleted legacy endpoints.

### Fixed
- For any bug fix, error resolution, or regression remediation.

### Security
- For vulnerability fixes, updated encryption, credential isolation improvements, or security boundary enhancements.
```

---

## 3. Entry Structure & Writing Rules

Every bullet in a changelog section should follow this format:

```markdown
- **<Scope / Feature Name>**: <Concise imperative summary explaining the change and why it matters to consumers>. [Optional link to issue/PR/spec].
```

### Good vs. Bad Changelog Entries:

| ❌ Anti-Pattern (Raw Git Noise) | ✅ High-Signal Entry |
|:---|:---|
| `- fix typo in utils.ts (3fa49b1)` | *(Omit entirely if internal / no consumer impact)* |
| `- update stuff` | `- **Auth Middleware**: Fixed token expiration handling to return 401 Unauthorized instead of 500.` |
| `- added new flags and refactored everything` | `- **CLI**: Added \`--dry-run\` and \`--json\` output flags for automated CI pipelines.` |
| `- bump version to 2.0.0 (unreleased)` | *(Leave under \`## [Unreleased]\` until formal release)* |
| `- Updated docs / Fixed typo in README` | *(Omit documentation-only noise unless project explicitly tracks doc changes)* |

---

## 4. High-Signal Feature Craft Standard (The v2.0.0 Rule)

To prevent flat, low-signal changelog descriptions, every released version and unreleased staging entry must adhere to the **v2.0.0 Craft Standard**:

1. **Architectural Doctrine / Thematic Naming**:
   - Every entry must lead with a bold named theme, doctrine, or concrete component (e.g., `**Karpathy Simplicity Doctrine**`, `**5-State Anti-Slop UI Gate**`, `**Active Running-Session Guards**`), never generic file names or unadorned phrases like "updated x".
2. **Strict Multi-Category Demarcation**:
   - Never dump updates into a monolithic `### Added` block.
   - Distinctly segregate into `### Added` (new capabilities/tools), `### Changed` (upgraded architectures, modified defaults, refactored logic), `### Fixed` (bugs, syntax errors, layout fixes), and `### Security` (credential isolation, secret sweeps).
3. **Mechanisms, Flags & Invariants**:
   - Entries must explicitly articulate the mechanism (e.g., CLI flags like `--audit`, process scanners `pgrep`, isolation boundaries), why the capability matters to developers/agents, and what guarantees it enforces.
4. **Nested Sub-Bullets for Transformations**:
   - Use nested arrows (`- `old-name` ➔ `new-name``) or breakdown lists for renames, migrations, or multi-part refactors.
5. **Issue & Pull Request Attribution**:
   - Every bullet must link to the corresponding PR or issue, using the target repository's canonical remote URL: `([#123](<canonical-remote>/pull/123))`. Derive the remote from the repository's actual `origin` URL — never substitute a hardcoded or assumed host.
6. **Full Changelog Compare Diff Link**:
   - Every tagged release section must conclude with the compare diff URL immediately preceding the divider, built from the repository's actual remote:
     ```markdown
     **Full Changelog**: <canonical-remote>/compare/v<PREVIOUS_TAG>...v<NEW_TAG>
     ```
   - On forges without native compare URLs (e.g. self-hosted GitLab instances with differing paths), use the forge's documented equivalent or omit the link rather than fabricating a URL.
7. **Release Divider**:
   - Terminate every released version section with a horizontal rule (`---`).
