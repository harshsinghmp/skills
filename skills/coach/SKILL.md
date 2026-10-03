---
name: coach
aliases: ["daily-standup-coach","standup-coach","daily-standup","agency-coach","executive-coach","delivery-coach"]
description: "Tri-vector autonomous agency coach and reflective check-in engine for developers, delivery squads, and agency principals. Resolves the top 50 agency pain points across three operating modes: internal team optimization (git-grounded standups, TDD seam gates, 60-minute blocker escalation, atomic diff ceilings), client boundary defense (scope creep change-order interceptor, 48h stop-the-clock memos, proactive evidence digests, shared DoD), and founder leverage calibration (the 70/30 leverage rule, feast-or-famine pipeline cadence, delegation matrix). Evaluates controllable inputs on a 1-10 effort rubric. Generates daily-standup.md."
argument-hint: "[team|client|founder|audit]"
user-invocable: true
version: 1.1.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: reflection-maintenance
metadata:
  category: reflection-maintenance
  priority: 17
  aliases: ["daily-standup-coach","standup-coach","daily-standup","agency-coach","executive-coach","delivery-coach"]
  suggested_skills: ["audit","periodic-retreat","context-anchor","dead-letter","client-comms"]
  hermes:
    tags: [standup, daily-review, effort-scorecard, reflection, developer-productivity, habits, discipline, agency-coach, client-boundaries, founder-leverage]
    related_skills: [audit, periodic-retreat, context-anchor, dead-letter, client-comms]
    suggested_skills: [audit, periodic-retreat, context-anchor, dead-letter, client-comms]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [audit, periodic-retreat, context-anchor, dead-letter, client-comms]
    primary_triggers: ["run daily standup","evaluate effort scorecard","end of day reflection","daily standup coach","agency coach","intercept scope creep","audit founder leverage"]
    requires_tools: [bash, view_file, write_to_file, replace_file_content]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# ☀️ Autonomous Agency Coach — Tri-Vector Delivery & Leverage Engine

> Tri-vector accountability and coaching engine for high-output digital agencies, dev squads, and principals. Operates across three vectors: **Team & Delivery** (TDD compliance, atomic diffs, 60m blocker escalation), **Client Boundaries** (scope-creep interception, 48h stop-the-clock memos, anxiety-reducing commit digests), and **Founder Leverage** (the 70/30 leverage rule, feast-or-famine pipeline preservation, delegation matrix). Evaluates controllable inputs on a 1–10 effort rubric to eliminate performative status theater.

---

## Operating Modes

| Mode | Purpose | Council Lead | Reference Document |
| :--- | :--- | :--- | :--- |
| **`team`** | Evaluates developer execution, TDD seam gates, atomic diffs, 60m blocker triage, and deep-work focus. Emits `daily-standup.md`. | **Crew & Nexus** | [`references/team.md`](references/team.md) |
| **`client`** | Intercepts out-of-scope requests, generates polite Phase 2 change orders, issues 48h stop-the-clock memos, and compiles 24h client evidence digests. | **Crew** | [`references/client.md`](references/client.md) |
| **`founder`** | Audits founder capacity distribution across Tiers 1–4, enforces the 70/30 leverage rule, and secures 15% weekly pipeline cadence. | **Sol & Crew** | [`references/founder.md`](references/founder.md) |
| **`audit`** | Audits standup logs, link integrity, and secret hygiene in alignment with canonical RFC audit guidance. | **Nexus** | [`references/audit.md`](references/audit.md) |

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Daily Standup & End-of-Day Check-In (`coach:team`)**: Closing or starting a work session, scoring 5 controllable inputs (TDD, diff size, secrets, focus, blockers), and setting the tomorrow's Single Most Important Task (MIT).
2. **Client Scope-Creep or Anxiety Flare (`coach:client`)**: A client asks for "just one small change", becomes anxious about progress, delays critical assets, or requires an executive progress digest.
3. **Founder Burnout & Bottleneck Review (`coach:founder`)**: The agency principal is overwhelmed with tactical code fires, revenue feast-or-famine cycles occur, or deals require founder presence to close.
4. **Hygiene & Verification Audit (`coach:audit`)**: Verifying that standup artifacts, evidence links, and effort logs remain pristine and secret-free.

### Anti-Triggers
Do NOT use this skill when:
- Conducting long-term quarterly strategy retreats (use [`periodic-retreat`](../periodic-retreat/SKILL.md)).
- Triaging an active P0 production incident or system breach (use [`incident-response`](../../agency-delivery/incident-response/SKILL.md)).
- Executing routine pull-request code reviews (use [`code-review`](../../quality-review/code-review/SKILL.md)).

---

## Quick Reference

### The 5 Controllable Input Pillars (Team Mode)

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

### The 3 Operating Vector Playbooks

| Vector | Mode Flag | Core CLI Command |
| :--- | :--- | :--- |
| **Team Mode** | `coach:team` | `bun skills/reflection-maintenance/coach/scripts/coach.ts --standup` |
| **Client Mode** | `coach:client` | `bun skills/reflection-maintenance/coach/scripts/coach.ts --scope-check "<request>" --client-digest` |
| **Founder Mode**| `coach:founder`| `bun skills/reflection-maintenance/coach/scripts/coach.ts --founder-audit` |
| **Audit Mode**  | `coach:audit`  | `bun skills/reflection-maintenance/coach/scripts/coach.ts --audit` |

---

## Procedure

### Step 1 — Select Operating Vector & Ingest Context
Match the incoming intent to `team`, `client`, `founder`, or `audit`. Load **only** the matched reference file from `references/`.

### Step 2 — Execute Vector Logic
- **If Team**: Run `coach.ts --standup`. Inspect git commits from the last 24 hours (`git log --since="24 hours ago"`). Score each pillar 0–2 points using `references/effort-rubric.md`.
- **If Client**: Compare incoming requests against active SOW. If out of scope, draft polite change-order response. If progress requested, run `coach.ts --client-digest`.
- **If Founder**: Categorize weekly hours across Tiers 1–4. Verify that Tier 1 & 2 bandwidth $\ge 70\%$. Secure 15% pipeline reserve.

### Step 3 — Triage Blockers & Enforce Boundaries
- Tasks stalled for >60 minutes must be routed to `dead-letter`.
- Unfunded client requests must be accompanied by Phase 2 budget/timeline addenda.
- Missing client assets (>48h) trigger an automated Stop-the-Clock memo.

### Step 4 — Emit Governed Artifacts
- **Team**: Emit `daily-standup.md` with 1–10 effort score and exactly 1 MIT.
- **Client**: Emit client progress digest or change-order memo.
- **Founder**: Emit weekly leverage memo and delegation assignments.

---

## Pitfalls

- **Confusing Effort with Outcome**: Grading yourself poorly because an external vendor API was down, or grading high because a lucky untested hack worked. Grade the *controllable inputs*.
- **Absorbing Scope Creep to be Polite**: Giving away hours of unbilled work that erodes agency margins. Always price the change before building it.
- **Founder Hero Complex**: Jumping in to fix tactical CSS bugs instead of delegating to team leads and protecting strategic sales.
- **Performative Chit-Chat**: Turning standups into 45-minute verbal syncs without git-backed evidence.

---

## Verification

Before finalizing any coach execution:
1. [ ] Forensic git history or SOW specifications inspected with immutable evidence.
2. [ ] Controllable inputs or leverage scores evaluated against mathematical thresholds.
3. [ ] Exactly one Single Most Important Task (MIT) or clear client boundary action declared.
4. [ ] Zero secrets or private client tokens present in emitted logs or artifacts.
