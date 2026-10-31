# 🗺️ Terrain Map: Developer Habits & Engineering Conventions

> **Purpose**: Pre-indexed conventions, test workflows, lint policies, and git branch rules so agents follow established engineering habits.

---

## 1. Git Branch & Release Conventions
- **Trunk Branch**: `main` (production-ready, releases only)
- **Integration Branch**: `dev` (active development branch)
- **Feature Branches**: `feat/<scope>-<feature>` (cut strictly from `dev`, never direct to `main`)
- **Fix Branches**: `fix/<scope>-<description>`
- **Atomic PR Invariant**: One feature/skill per branch and PR; never batch multi-scope changes.
- **Commit Message Protocol**: Conventional Commits `<type>(<scope>): summary` with Why / What / Verification.

## 2. Test-Driven Development (TDD) Seam
- **Test Runner**: {{TEST_RUNNER}}
- **TDD Requirement**: Write a failing regression or unit test before modifying code.
- **Verification Gate**: Evidence before claims; run the exact test command before declaring completion.

## 3. Formatting, Linting & Quality Floor
- **Linter / Formatter**: {{LINT_TOOL}}
- **Strict Lint Gate**: Zero warnings and zero errors before PR submission.
- **Type Safety**: Pinned compiler checks with `noEmit` (no unverified `any` assertions).

## 4. Modern Tool Primacy
- Call installed modern CLI tools explicitly: `rg` > `grep`, `fd` > `find`, `bat` > `cat`, `eza` > `ls`, `sd` > `sed`.
- Agent subshells contain no shell aliases; always use exact binary names with legacy fallbacks.
