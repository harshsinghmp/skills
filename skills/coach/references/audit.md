# 🔍 Coach Integrity & Reflection Audit Mode (`coach:audit`)

> **Council Lead**: **Nexus** (Technical Director & Hardening Gate)  
> **Target Scope**: Verifies forensic integrity of daily standups, effort rubrics, client comms digests, and founder leverage records.  
> **Core Objective**: Ensure zero performative claims, audit link integrity, detect orphaned artifacts, and prevent unverified self-grading.

---

## 🧭 The 5 Mandatory Audit Checkpoints

In alignment with `skills/references/audit-mode-guidance.md`, `coach:audit` executes five non-negotiable verification checks:

| Checkpoint | What is Verified | Failure Impact | Action Class |
| :--- | :--- | :--- | :--- |
| **1. Link Integrity** | Verifies all file links in `daily-standup.md`, `references/`, and examples exist. | Broken navigation, blind agents | `AUTO-REPAIR` |
| **2. Orphaned Artifacts** | Scans `.agents/archive/` and project roots for unreferenced standup logs. | Context clutter, dead files | `REPORT-ONLY` |
| **3. Stale Contradictions** | Detects version drift across `SKILL.md`, `skills.json`, `llms.txt`, and README. | Registry out of sync | `AUTO-REPAIR` |
| **4. Secret & Credential Leakage** | Audits standup notes and client update logs for exposed tokens (`sk-*`, passwords). | Security breach (Vibeguard) | `PROPOSE-DIFF` / `REDACT` |
| **5. Frontmatter & Rubric Health**| Checks that YAML frontmatter and 5-pillar effort rubrics maintain strict schema parity. | Agent discovery failure | `AUTO-REPAIR` |

---

## ⚡ Execution Procedure

```bash
# Run standalone coach audit check
bun skills/reflection-maintenance/coach/scripts/coach.ts --audit
```

### Action Severity Tiers

1. **Critical Blocker**: Leaked secrets or broken frontmatter. Auto-repaired or blocked immediately.
2. **Warning**: Missing Git commit references or ungrounded claims in standups. Flags warning.
3. **Notice**: Standup files exceeding 7 days without archival to `.agents/archive/`. Suggests cleanup.
