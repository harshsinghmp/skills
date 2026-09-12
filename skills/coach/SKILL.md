---
name: coach
aliases: ["daily-standup-coach","standup-coach","daily-standup"]
description: "Daily reflective check-in and effort scorecard for developers and AI agents. Evaluates controllable inputs (tests written, diffs kept minimal, invariants respected, secrets scrubbed) on a 1-10 effort rubric rather than fluctuating external outcomes. Generates daily-standup.md."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: reflection-maintenance
metadata:
  category: reflection-maintenance
  priority: 17
  aliases: ["daily-standup-coach","standup-coach","daily-standup"]
  suggested_skills: ["audit","periodic-retreat","context-anchor"]
  hermes:
    tags: [standup, daily-review, effort-scorecard, reflection, developer-productivity, habits, lifeos]
    related_skills: [audit, periodic-retreat, context-anchor]
    suggested_skills: [audit, periodic-retreat, context-anchor]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [audit, periodic-retreat, context-anchor]
    primary_triggers: ["run daily standup","evaluate effort scorecard","end of day reflection","daily standup coach"]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# ☀️ Daily Standup Coach — Reflective Check-In & Effort Scorecard

> Conducts high-signal daily standups focused on *controllable inputs* rather than noisy external outcomes. Evaluates developer and agent execution across 5 core discipline pillars (TDD compliance, minimal diffs, zero leaked secrets, deep work focus, and blocked-task triage) to produce an honest 1–10 daily effort scorecard.

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **End-of-Day Reflection**: Closing a working session and summarizing progress, friction, and next day priorities.
2. **Morning Planning**: Setting atomic 1–3 focus tasks and identifying potential dependency blockers.
3. **Effort Calibration**: Assessing whether time was spent on high-leverage controllable execution vs chaotic firefighting.
4. **LifeOS / Council Sync**: Generating daily sync artifacts for the orchestrator.

### Anti-Triggers
Do NOT use this skill when:
- Conducting long-term quarterly reviews (use [`periodic-retreat`](../periodic-retreat/SKILL.md)).
- Triaging an immediate active bug or test failure (use [`systematic-debugging`](../pua/SKILL.md)).

---

## Quick Reference

### The 5 Controllable Input Pillars

```
┌─────────────────┬────────────────────────────────────────────────────────┐
│ Pillar          │ Controllable Execution Metric                          │
├─────────────────┼────────────────────────────────────────────────────────┤
│ 1. Testing      │ Tests written first; 100% green before commits         │
│ 2. Minimal Diff │ Zero unrelated refactoring; laser-focused changes      │
│ 3. Hygiene      │ No secrets committed; valid frontmatter and docs       │
│ 4. Focus        │ Deep work hours on Top 1 priority without distraction │
│ 5. Triage       │ Blocked tasks explicitly escalated to dead-letter      │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### Daily Effort Scorecard (1–10 Scale)

| Score Tier | Definition |
| :--- | :--- |
| **9–10 (Mastery)** | All 5 pillars upheld flawlessly; high deep-work focus; zero unmanaged blockers. |
| **7–8 (Solid)** | 4 pillars upheld; minor diff creep or delayed triage caught and corrected. |
| **5–6 (Mediocre)** | Rationalized testing after code; context switching; unfocused priorities. |
| **1–4 (Needs Work)** | Untested code; leaked secrets; chaotic thrashing on uncommitted changes. |

---

## Procedure

### Step 1 — Review the Past 24 Hours
1. Inspect git commits, logs, and modified files (`git log --since="24 hours ago"`).
2. Answer:
   - What did we genuinely finish and verify with evidence?
   - Where did we stall, encounter friction, or get distracted?

### Step 2 — Grade Controllable Inputs
Score each of the 5 pillars (0–2 points each, summing to 10 points total):
- **TDD Rigor (0–2)**: Were tests written first and watched to fail?
- **Diff Discipline (0–2)**: Were PRs and diffs kept tight and atomic?
- **Security & Hygiene (0–2)**: Did secret scans and linters pass cleanly?
- **Focus Allocation (0–2)**: Was primary energy dedicated to the highest-priority goal?
- **Blocker Triage (0–2)**: Were blockers captured cleanly rather than silently abandoned?

### Step 3 — Plan the Next 24 Hours
1. Select the **Single Most Important Task (MIT)** for tomorrow.
2. Identify dependencies or missing credentials beforehand.

### Step 4 — Emit Standup Artifact (`daily-standup.md`)
Record the structured reflection and effort scorecard.

---

## Pitfalls

- **Confusing Effort with Outcome**: Grading yourself poorly because a third-party API was down, or grading yourself high because a lucky hack worked without tests. Grade the *inputs*, not the luck.
- **Laundry-List Planning**: Listing 15 goals for tomorrow instead of 1 clear MIT and 2 secondary items.
- **Ignoring Stalls**: Glossing over a 3-hour debugging dead end without logging why it happened.

---

## Verification

Before finalizing the standup:
1. [ ] Commit history from the last 24 hours is reviewed with evidence.
2. [ ] All 5 controllable input pillars are scored with concrete rationale.
3. [ ] Exactly one MIT is defined for the next work cycle.
