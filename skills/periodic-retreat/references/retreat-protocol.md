# Strategic Retreat Facilitation & Debt Purge Protocol

Loaded by: `periodic-retreat` when facilitating quarterly retrospectives, architecture debt purges, founder vitality reviews, and OKR formulations.

---

## 1. Phase 1 — Forensic Retrospective & Churn Heatmaps

A strategic retreat begins with unvarnished, data-driven truth.

### Forensic Retrospective Checklist:
- [ ] **Commit & Release Audit**: Extract all shipped releases and PRs across the prior 90 days.
- [ ] **Stall & Abandonment Diagnosis**: Enumerate every ticket, branch, or draft that sat untouched for $\ge 30$ days. Classify root cause: Scope Creep, Unclear Ownership, Blocked Dependency, or Lost Value.
- [ ] **God-File & Churn Heatmap Analysis**:
  Run git churn analysis to identify files modified in $\ge 30\%$ of all PRs:
  ```bash
  git log --since="90 days ago" --name-only --format="" | sort | uniq -c | sort -nr | head -n 10
  ```
  Top churn files are primary candidates for modular decoupling.

---

## 2. Phase 2 — The Ruthless Purge Register

A quarterly retreat without code deletion is just aspirational clutter. Phase 2 mandates a net-negative line count or documented deletion PR.

### Automated 3-Tier Purge:
1. **Tier 1 (Automated Dead-Code Sweep)**:
   - Identify unused exports, dead types, and orphaned assets using AST detection tools:
     ```bash
     bunx knip --reporter compact || echo "Check unused exports"
     ```
   - Enumerate all 0-reference files, orphaned SVG/PNG assets, and unused utility functions.
2. **Tier 2 (Zombie Dependency Eviction)**:
   - Cross-reference `package.json` dependencies against repo-wide import statements (`rg "from ['\"]<pkg>"`).
   - Immediately uninstall packages with zero code imports.
3. **Tier 3 (Script & Shim Consolidation)**:
   - Purge deprecated shell shims, temporary migration scripts, and stale configuration files.
   - Record all deletions in the **Purge Register** table with exact line savings.

---

## 3. Phase 3 — Founder Vitality & Purpose Alignment

Replaces opaque abstractions with concrete founder energy and operational bandwidth auditing.

### Vitality Alignment Matrix:
1. **Energy Drain Audit**: Identify the top 3 recurring tasks, client dynamics, or operational frictions that drained the founder's cognitive bandwidth this quarter.
2. **The ADE Framework**:
   - **Automate**: Hand off mechanical tasks to AI agent sub-routines (e.g. `secretary`, `updatedocs`).
   - **Delegate**: Route operational tickets to agency Council Leads (**Sol**, **Jasper**, **Crew**, **Nexus**).
   - **Eliminate**: Kill low-margin, high-drag client offerings or non-performing initiatives.
3. **Bandwidth Guard**: Enforce hard boundaries: minimum 20% uninterrupted deep-work blocks reserved for high-leverage architectural breakthroughs.

---

## 4. Phase 4 — Binary OKRs & Monday Launchpad

Eliminates the "offsite hangover" where teams return on Monday with great vision but zero actionable tasks.

### Binary Key Result Contract:
Every Key Result must have an unambiguous, binary verification command:
- ❌ Non-Binary: *"Make testing better and improve documentation."*
- ✅ Binary Contract: *"Test suite passes 100% across all modules via `bun test` with 0 failures, and `bun run type-check` outputs 0 errors."*

### Monday Launchpad Packet:
The retreat concludes by generating the exact **Monday Sprint Backlog**:
- Exactly 3 atomic feature branches pre-scoped for Week 1.
- Pre-assigned Council Leads (**Sol** for product/code, **Jasper** for GTM/copy, **Crew** for client ops, **Nexus** for QA).
- Concrete definition of done and CLI verification command for each task.
