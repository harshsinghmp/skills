# ✨ refactor:polish — Pre-Release Polish & Technical Debt Cleanup Playbook

> **Executive Scope**: Pre-merge polish triage, dead code elimination, deprecated API replacement, lint/formatting sanitization, and release readiness hardening.

---

## 1. When to Run Polish

Trigger `refactor:polish` as the final engineering pass before submitting a major PR, launching a client deliverable, or cutting a release.

---

## 2. The 5-Pillar Polish Checklist

### 1. Dead Code & Orphaned Resource Cleanup
- Remove unreferenced components, unused exports, dead CSS classes, and commented-out legacy code.
- Purge unused package dependencies:
  ```bash
  bunx depcheck
  ```

### 2. Deprecation Triage
- Identify deprecated React / Node / framework APIs (e.g. `componentWillReceiveProps`, old Next.js App Router hooks, legacy utility libraries).
- Modernize to current standard patterns.

### 3. Edge-Case & Error State Hardening
- Verify all interactive controls have loading skeletons, empty states, and fallback error boundaries.
- Ensure all async fetches catch errors gracefully with user-facing alerts instead of uncaught promise rejections.

### 4. Linting & Formatting Sanitization
```bash
# Run biome checks and auto-format
bunx biome check --write .
```

### 5. Final Behavioral Smoke Verification
- Verify the build compiles without warnings:
  ```bash
  bun run build
  bun run type-check
  bun test
  ```

---

## 3. Verdict & Reporting

Emit final readiness assessment:
- **`SHIP READY`**: Zero P1/P2 defects, all dead code cleared, tests green.
- **`BLOCK`**: Unresolved deprecation causing build warnings, unhandled error states, or contrast failures.
