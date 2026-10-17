---
name: periodic-retreat
aliases: ["retreat","quarterly-retreat","strategic-retreat"]
description: "Quarterly personal and project strategic retreat facilitator. Conducts multi-scale deep audits of project health, architecture debt, dead-code purges via automated scan, founder vitality & purpose alignment, and binary next-quarter OKRs with Monday launchpads across the agency ecosystem. Generates quarterly-retreat.md."
argument-hint: "quarterly retreat, purge debt, vitality, next-quarter OKRs"
user-invocable: true
version: 1.1.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: reflection-maintenance
metadata:
  category: reflection-maintenance
  priority: 19
  aliases: ["retreat","quarterly-retreat","strategic-retreat"]
  suggested_skills: ["coach","audit","updateagents","updatedocs"]
  hermes:
    tags: [retreat, strategic-planning, quarterly-review, strategic-alignment, architecture-debt, okrs, vitality, purpose-alignment, debt-purge]
    related_skills: [coach, audit, updateagents, updatedocs]
    suggested_skills: [coach, audit, updateagents, updatedocs]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [coach, audit, updateagents, updatedocs]
    primary_triggers: ["facilitate quarterly retreat","strategic review","purge architecture debt","plan upcoming quarter","vitality audit"]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🏔️ Periodic Retreat — Quarterly Strategic Review & Architecture Purge

> Facilitates a structured, multi-scale quarterly strategic retreat for developers, architects, and agency principals. Audits project vitality, systematically identifies and purges architectural debt, evaluates alignment against TELOS and the Wheel of Life, and crafts high-leverage OKRs for the upcoming quarter.

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Quarterly / Milestone Transition**: Ending Q1/Q2/Q3/Q4 or wrapping up a major agency project milestone.
2. **Architecture Debt Accumulation**: Subsystems have become bloated with legacy shims, unused dependencies, or obsolete documentation.
3. **Strategic Re-alignment**: Re-evaluating current operating state against the principal's ideal TELOS state.
4. **Deprecation & Purge Cycles**: Systematically sunsetting zombie repos, dead configs, or outdated agent rules.

### Anti-Triggers
Do NOT use this skill when:
- Conducting daily or weekly standup reflections (use [`coach`](../coach/SKILL.md)).
- Debugging a localized performance bottleneck or test failure.

---

## Quick Reference

### The 4 Retreat Phases

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ Phase 1: Retrospective  │ ──▶ │ Phase 2: Debt Purge     │
│ Truth-telling audit,    │     │ Automated knip scan &   │
│ wins, stalls, churn map │     │ zombie dependency purge │
└─────────────────────────┘     └─────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ Phase 4: Monday OKRs    │ ◀── │ Phase 3: Vitality Sync  │
│ 3 binary OKRs & Week 1  │     │ Founder energy, ADE     │
│ sprint launchpad        │     │ framework & boundaries  │
└─────────────────────────┘     └─────────────────────────┘
```

### Retreat Deliverable Sections

1. **Retrospective Scorecard**: Quantitative review of prior quarter commitments + git churn heatmap.
2. **The Purge Register**: List of deleted files, removed dependencies, and deprecated scripts.
3. **Founder Vitality & Purpose Audit**: Energy drain audit, ADE triage (Automate/Delegate/Eliminate), and bandwidth boundaries.
4. **Next-Quarter Binary OKRs**: 3 Objectives with 3 verifiable Key Results each + Monday Launchpad sprint tickets.

---

## Procedure

Load and follow [references/retreat-protocol.md](references/retreat-protocol.md) during facilitation:

### Step 1 — Retrospective Audit (Look Back & Churn Map)
1. Ingest previous quarter's roadmap, commits, and project files.
2. Run git churn heatmap to detect god-file hotspots:
   `git log --since="90 days ago" --name-only --format="" | sort | uniq -c | sort -nr | head -n 10`
3. Answer bluntly:
   - What shipped to production and generated real value?
   - What languished in draft/stall state for $\ge 30$ days and why?
   - Which assumptions proved flat wrong?

### Step 2 — Architecture & Codebase Debt Purge
1. **Automated Sweep**: Run AST dead-code detector (`knip` or unused export scan) to surface 0-reference files, unused types, and dead assets.
2. **Zombie Eviction**: Cross-reference `package.json` against repo imports; remove unimported packages.
3. **Purge Register**: Document all deleted files and net line savings in the Purge Register table. A retreat cannot conclude without code deletion or documented deprecation PR.

### Step 3 — Founder Vitality & Purpose Alignment
1. Conduct **Energy Drain Audit**: Identify the top 3 recurring operational frictions draining cognitive bandwidth.
2. Apply the **ADE Framework**: Automate with subagents, Delegate to agency Council Leads (Sol, Jasper, Crew, Nexus), or Eliminate low-margin offerings.
3. Lock deep-work boundaries: Ensure minimum 20% reserved for architecture breakthroughs.

### Step 4 — Next-Quarter Binary OKRs & Monday Launchpad
1. Define **Objective 1 (Product/Revenue)**, **Objective 2 (Architecture/Hardening)**, and **Objective 3 (Ecosystem/Capabilities)**.
2. Enforce the **Binary Key Result Contract**: Every result must have an executable CLI verification command (e.g. `bun test`, `bun run lint`).
3. Generate the **Monday Launchpad Packet**: 3 pre-scoped Week 1 sprint tickets with assigned Council Leads.

### Step 5 — Emit Retreat Artifact (`quarterly-retreat.md`)
Save the structured strategic retreat summary into project docs or `.memory/retreats/quarterly-retreat-<timestamp>.md`.

---

## Pitfalls

- **Passive Planning**: Writing aspirational goals ("improve UI speed") instead of concrete criteria ("achieve 99/100 Lighthouse score on /pricing").
- **Skipping the Purge**: Accumulating new features without deleting obsolete code leads to cognitive decay.
- **Overcommitting**: Assigning more than 3 core objectives for a single quarter.
- **Monday Morning Inertia**: Leaving the retreat with great philosophy but no concrete tickets for Monday morning.

---

## Verification

Before concluding the retreat:
1. [ ] Git churn heatmap generated and reviewed for modular decoupling.
2. [ ] All legacy or zombie modules targeted for deprecation have explicit deletion actions in the Purge Register.
3. [ ] Founder Vitality Audit completed with ADE (Automate/Delegate/Eliminate) assignments.
4. [ ] Next-quarter OKRs contain exactly 3 objectives with binary, CLI-testable Key Results.
5. [ ] Monday Launchpad packet contains 3 ready-to-run sprint tickets with assigned Council Leads.
6. [ ] `quarterly-retreat.md` is persisted with timestamped sign-off.
