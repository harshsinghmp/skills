# Sample Routing Plan

```markdown
# Routing Plan: User Authentication & Profile Redesign

- **Overall Coupling Score**: `0.45` (Medium Coupling)
- **Selected Concurrency Strategy**: `STAGED_PIPELINE`
- **Skill Token Budget Footprint**: `4,200 / 6,000 tokens` (PASS)

---

## Skill Stack Configuration (MVSS)

| Execution Phase | Active Primary Skill | Suppressed / Subordinate Skills | Rationale |
| :--- | :--- | :--- | :--- |
| **Phase 1 (Precursor)** | `ai-ready` | `new-project` (Stage 0) | `ai-ready` validates workspace invariants; redundant scaffolding suppressed. |
| **Phase 2a (Backend)** | Baseline Engineering | Ad-hoc fast-path commits | VCS handled strictly by downstream phase. |
| **Phase 2b (Frontend)** | `refactor-ui` | Generic CSS rules | Enforces 11 Refactoring UI heuristics and 5-state anti-slop coverage. |
| **Phase 3 (Integrate)** | `code-review` | Speculative refactor prompts | Enforces Karpathy surgical diffs and Linus taste gate before commit. |
| **Phase 4 (Ship)** | `git` | Direct-to-master push scripts | Enforces Conventional Commits and dev-branch staging PR lifecycle. |

---

## Execution DAG

```mermaid
flowchart TD
    Phase1[Phase 1 (Sequential): Database Schema & Shared Types]
    Phase1 --> Phase2a[Phase 2a (Parallel Subagent A): Auth Controller & Token API]
    Phase1 --> Phase2b[Phase 2b (Parallel Subagent B): Profile UI Components]
    Phase2a --> Phase3[Phase 3 (Sequential): Code Review & Integration Tests]
    Phase2b --> Phase3
    Phase3 --> Phase4[Phase 4 (Sequential): Git Staging & PR Release]
```

---

## Phase Breakdown
1. **Phase 1 (Single Builder)**:
   - Skills: `ai-ready`
   - Target: `src/db/schema.ts`, `src/types/user.ts`
   - Gate: `bun test tests/schema.test.ts` passes.
2. **Phase 2 (Concurrent Fan-Out)**:
   - **Subagent A (Backend)**: `src/api/auth.ts`, `tests/api/auth.test.ts`
   - **Subagent B (Frontend - with `refactor-ui`)**: `src/components/ProfileCard.tsx`
3. **Phase 3 (Integrator & Reviewer)**:
   - Skills: `code-review`
   - Target: Review full diff for surgical scope, run `tests/e2e/auth-flow.test.ts`.
4. **Phase 4 (VCS Lifecycle)**:
   - Skills: `git`
   - Target: Cut branch from `dev`, commit with Conventional Commits, open PR.
```
