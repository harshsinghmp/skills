---
name: periodic-retreat
aliases: ["retreat","quarterly-retreat","strategic-retreat"]
description: "Quarterly personal and project strategic retreat facilitator. Conducts multi-scale deep audits of project health, architecture debt, deprecated system purges, Wheel of Life alignment, and next-quarter OKR handoffs across the LifeOS ecosystem. Generates quarterly-retreat.md."
version: 1.0.0
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
    tags: [retreat, strategic-planning, quarterly-review, lifeos, architecture-debt, okrs, telos]
    related_skills: [coach, audit, updateagents, updatedocs]
    suggested_skills: [coach, audit, updateagents, updatedocs]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [coach, audit, updateagents, updatedocs]
    primary_triggers: ["facilitate quarterly retreat","strategic review","purge architecture debt","plan upcoming quarter"]
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
│ Truth-telling audit of  │     │ Aggressive deletion of  │
│ wins, stalls, metrics   │     │ legacy code and zombies │
└─────────────────────────┘     └─────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ Phase 4: Next-Q OKRs    │ ◀── │ Phase 3: TELOS Sync     │
│ 3 high-leverage goals   │     │ LifeOS Wheel of Life &  │
│ with binary finish lines│     │ Principal alignment     │
└─────────────────────────┘     └─────────────────────────┘
```

### Retreat Deliverable Sections

1. **Retrospective Scorecard**: Quantitative review of prior quarter commitments.
2. **The Purge Register**: List of deleted files, removed dependencies, and deprecated scripts.
3. **TELOS / Vitality Audit**: Alignment across Agency, Engineering, Health, and Personal Growth.
4. **Next-Quarter OKRs**: 3 Objectives with 3 measurable Key Results each.

---

## Procedure

### Step 1 — Retrospective Audit (Look Back)
1. Ingest previous quarter's roadmap, commits, and project files.
2. Answer bluntly:
   - What shipped to production and generated real value?
   - What languished in draft/stall state and why?
   - Which assumptions proved flat wrong?

### Step 2 — Architecture & Codebase Debt Purge
1. Audit dependencies: Identify unmaintained packages and remove unused tools.
2. Audit documentation: Delete outdated guides and update stale README tables.
3. Consolidate: Merge overlapping scripts and replace multi-step hacks with canonical tooling.

### Step 3 — TELOS & LifeOS Alignment
1. Compare actual time and commit distribution against `PRINCIPAL_TELOS.md`.
2. Score the 4 Core Agency Divisions (Sol, Jasper, Crew, Nexus) for capability balance.

### Step 4 — Next-Quarter OKR Formulation
1. Define **Objective 1 (Product/Revenue)**, **Objective 2 (Architecture/Hardening)**, and **Objective 3 (Ecosystem/Capabilities)**.
2. Ensure each Key Result has an unambiguous binary definition of done.

### Step 5 — Emit Retreat Artifact (`quarterly-retreat.md`)
Save the structured strategic retreat summary into project docs or `.memory/retreats/`.

---

## Pitfalls

- **Passive Planning**: Writing aspirational goals ("improve UI speed") instead of concrete criteria ("achieve 99/100 Lighthouse score on /pricing").
- **Skipping the Purge**: Accumulating new features without deleting obsolete code leads to cognitive decay.
- **Overcommitting**: Assigning more than 3 core objectives for a single quarter.

---

## Verification

Before concluding the retreat:
1. [ ] All legacy or zombie modules targeted for deprecation have explicit deletion plans.
2. [ ] Next-quarter OKRs contain exactly 3 objectives with verifiable Key Results.
3. [ ] `quarterly-retreat.md` is persisted with timestamped sign-off.
