# 📊 Evidence-Based Client Reporting Standard

> **Crew Delivery Rail**: Standardized protocol for client progress reporting derived directly from verified Git commits and automated test runs.

---

## 1. Core Principle: Evidence Over Narrative

Never submit vague, subjective status reports to agency clients (e.g. *"Worked on authentication and made good progress"*). Every claim must be grounded in immutable verification evidence:

1. **Commit Identifiers**: Link exact short commit SHAs (`feat(auth): ...`).
2. **Verified Test Outputs**: State pass/fail counts from test runner executions.
3. **Working Surfaces**: Provide direct staging/preview URLs or artifact file paths.

---

## 2. Standard Client Status Format

```markdown
### 🚀 [Project Name] Milestone Progress Report — [Date]

#### 1. Delivered Capabilities & Completed Tasks
- [Feature 1 Description] (Verified in commit `abc1234` | Test suite: 12 passing)
- [Feature 2 Description] (Verified in commit `def5678` | Preview: `https://...`)

#### 2. Verification & Quality Evidence
- **Automated Tests**: X pass, 0 fail (Execution time: Y seconds)
- **Lint & Type Safety**: 0 errors, strict compiler validation clean
- **Security Check**: Secret scan passed, zero credentials committed

#### 3. Next Sprint Priorities
- [Next Deliverable A]
- [Next Deliverable B]
```
