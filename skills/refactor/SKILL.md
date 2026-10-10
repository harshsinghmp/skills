---
name: refactor
aliases: ["refactor-ui", "refactoring", "code-refactor", "ui-polish", "ui-audit", "architecture-refactor", "perf-refactor", "database-refactor", "refactor-anything"]
description: "Universal refactoring engine: systematically evaluate, modernize, and refactor user interfaces, application code, software architecture, runtime performance, database schemas, and multi-page consistency — routed through seven execution modes. Use when asked to refactor UI components or layouts, clean up code smells and reduce cyclomatic complexity, decouple architectural modules and boundaries, optimize runtime performance and bundle sizes, refactor database schemas with zero downtime, sweep consistency across an entire app, or run a pre-release polish pass. Not for novel feature creation from scratch (new-project/webdev) or full security vulnerability exploitation (muse-security)."
argument-hint: "[ui|code|architecture|perf|database|sweep|polish]"
user-invocable: true
version: 1.2.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: design-interface
metadata:
  skill_orchestration:
    pre: ["designscope"]
    post: ["code-review"]
    optional: ["animate", "gauntlet-loop"]
  category: design-interface
  priority: 10
  aliases: ["refactor-ui", "refactoring", "code-refactor", "ui-polish", "ui-audit", "architecture-refactor", "perf-refactor", "database-refactor", "refactor-anything"]
  suggested_skills: ["designscope", "gauntlet-loop", "code-review", "animate", "database"]
  hermes:
    tags: ["refactor", "refactor-ui", "code-refactoring", "architecture", "performance", "database-refactoring", "ui-design", "tailwind", "typography", "color-palette", "visual-hierarchy", "accessibility", "clean-code", "wcag-2.2", "container-queries", "ui-sweep", "polish"]
    related_skills: ["designscope", "gauntlet-loop", "code-review", "animate", "database"]
    suggested_skills: ["designscope", "gauntlet-loop", "code-review", "animate", "database"]
    requires_tools: ["view_file", "replace_file_content", "write_to_file", "run_command"]
  openclaw:
    category: design-interface
    suggested_skills: ["designscope", "gauntlet-loop", "code-review", "animate", "database"]
    primary_triggers: ["refactor this UI", "refactor this function", "clean up this code", "refactor architecture", "optimize performance", "refactor schema", "make pages consistent", "final polish before launch"]
    requires_tools: ["view_file", "replace_file_content", "write_to_file", "run_command"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🪄 refactor — Universal Refactoring Engine

One unified department for systematic software refactoring across all layers of the stack. Transforms legacy, messy, or inconsistent code and interfaces into clean, maintainable, and high-performance production assets without altering external behavior.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **ui** | "refactor this UI", "make this look professional", "improve design", "fix contrast", "refactoring-ui", "ui polish" | Visual and interface refactoring: 10 Refactoring UI atomic heuristics, spacing ladders, modern container queries, typography hierarchy, and WCAG 2.2 contrast parity | [references/ui.md](references/ui.md) |
| **code** | "refactor this function", "clean up this code", "reduce complexity", "make this DRY", "extract method" | Code-level refactoring: cyclomatic complexity reduction, SOLID principles, eliminating dead code, function extraction, and TypeScript strict typing | [references/code.md](references/code.md) |
| **architecture** | "refactor codebase structure", "decouple modules", "clean architecture", "break circular dependency", "modularize" | Structural refactoring: modular boundaries, separating business logic from UI/framework, domain-driven organization, and dependency inversion | [references/architecture.md](references/architecture.md) |
| **perf** | "optimize performance", "refactor for speed", "reduce bundle size", "fix memory leak", "perf refactor" | Runtime & build refactoring: algorithmic efficiency ($O(n^2) \rightarrow O(n)$), tree-shaking, component memoization, dynamic imports, and Core Web Vitals optimization | [references/perf.md](references/perf.md) |
| **database** | "refactor schema", "zero-downtime migration", "normalize tables", "fix N+1 queries", "db refactor" | Data layer refactoring: non-breaking column migrations, query optimization, indexing strategy, and ORM query batching | [references/database.md](references/database.md) |
| **sweep** | "sweep consistency", "unify all pages", "standardize components across app", "design consistency" | Multi-page consistency refactoring (strictly on-demand, never runs automatically): sweeping duplicate components into single sources of truth, aligning button styles, cards, and patterns across the app | [references/sweep.md](references/sweep.md) |
| **polish** | "final polish before release", "clean up deprecated code", "pre-merge polish", "ship readiness" | Pre-launch refactoring pass: dead-letter triage, deprecated API cleanup, lint/formatting sweep, and edge-case hardening | [references/polish.md](references/polish.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run. Note: `sweep` mode carries codebase-wide blast radius and is strictly on-demand; automated agents must never run it automatically without explicit user direction.

---

## When to Use

- Refactoring a UI component, screen, or dashboard using the 10 atomic *Refactoring UI* heuristics.
- Simplifying complex functions, reducing cyclomatic complexity, or cleaning up messy procedural code.
- Decoupling monolithic modules, breaking circular dependencies, or enforcing clean architecture boundaries.
- Diagnosing and refactoring performance bottlenecks, memory leaks, and oversized bundles.
- Migrating database tables or columns with zero production downtime using the expand/contract pattern.
- Sweeping duplicate UI components or hardcoded tokens across an entire multi-page application.
- Conducting a final pre-merge or pre-launch technical polish pass.

---

## Quick Reference & Atomic UI Heuristics

When executing the `ui` or `sweep` mode, adhere strictly to the 10 atomic heuristics:

| # | Heuristic Domain | Core Problem Solved | Primary Technique |
|:---|:---|:---|:---|
| **01** | **Visual Hierarchy** | Everything competing for attention | Primary focal point + aggressive de-emphasis of secondary elements |
| **02** | **Typography Scale** | Inconsistent, uncalibrated font sizes | Modular type scale (12, 14, 16, 20, 24, 32, 48px) with optical weights |
| **03** | **Color Palette** | Saturated, garish, or arbitrary colors | 9-step neutrals + primary brand hue + functional status semantics |
| **04** | **Spacing Grid** | Arbitrary margins and cramped layouts | Strict 4px/8px ramp; generous whitespace before adding borders |
| **05** | **Button Hierarchy** | Competing CTAs of equal visual weight | Solid primary, neutral secondary, ghost/link tertiary |
| **06** | **Visual Clutter** | Border soup, redundant divider lines | Surface contrast, directional spacing, removing self-evident labels |
| **07** | **Empty States** | Blank screens that confuse users | Action-oriented guidance, illustrative placeholder, instant CTA |
| **08** | **Shadows & Depth** | Flat cards, muddy drop-shadows | Layered diffuse shadows; shadows = depth, borders = structure |
| **09** | **Color Contrast** | Low-contrast text failing accessibility | WCAG 2.2 AA ($\ge 4.5:1$ text, $\ge 3:1$ UI/large) |
| **10** | **Grouping & Proximity** | Related items drifting apart | Inter-group gap $\ge 2\times$ intra-group; space before surfaces before lines |
| **11** | **Anti-Slop 5-State Gate**| Happy-path only components break in prod | Explicit Empty, Loading, Error, Success, and Overflow states |

---

## Automated Tooling

Ships zero-dependency Bun scripts under `scripts/`:
- **Anti-Pattern Scanner**: `bun refactor/scripts/audit-ui.ts <file_or_dir>`
- **WCAG Contrast Checker**: `bun refactor/scripts/check-contrast.ts <file_or_dir>`

---

## Procedure

1. **Intake & Scope**:
   - Identify the exact layer requiring refactoring (UI, code, architecture, performance, database, or cross-page sweep).
   - Resolve to exactly one execution mode.
2. **Safety Baseline**:
   - Ensure existing tests pass (`bun test`). Never refactor on broken tests.
   - For database refactoring, confirm a staging replica and rollback path exist.
3. **Execute Atomic Transformations**:
   - Make small, incremental changes. Rerun tests after each atomic step.
   - Never combine refactoring with behavioral feature additions.
4. **Verification**:
   - For `ui`: check 5-state gate and run `check-contrast.ts`.
   - For `code`: check complexity reduction and clean linting (`bun run lint`).
   - For `architecture`: verify dependency acyclicity.
   - For `perf`: confirm benchmark delta.
   - For `database`: verify zero locks held >100ms.
   - For `sweep` & `polish`: verify zero regressions and type-check passing.

---

## Pitfalls

- **Refactoring without tests**: Blindly refactoring complex logic without automated regression tests causes subtle bugs. Write a characterization test first if tests are missing.
- **Scope creep**: Adding "just one quick feature" while refactoring breaks the refactoring discipline.
- **Over-abstraction**: Introducing 5 layers of design patterns for a simple 20-line utility function. Keep it lean and pragmatic.
- **Pixel drift in tokens mode**: When centralizing design tokens, pixel values must remain visually identical.

---

## Verification

Run before reporting completion:
- [ ] Target files verified and exist.
- [ ] No secrets in output artifacts.
- [ ] WCAG 2.2 AA contrast verified for any color or typography change.
- [ ] `bun test` passes with zero behavioral regressions.
- [ ] `bun run lint` and `bun run type-check` pass cleanly.
- [ ] Release verdict emitted (`SHIP READY` or `BLOCK`).
