# Autonomous Agency Coach (`coach`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /standup | /coach](https://img.shields.io/badge/Triggers-%2Fstandup%20%7C%20%2Fcoach-purple.svg?style=for-the-badge)](#)

Tri-vector autonomous agency coach and reflective check-in engine for developers, delivery squads, and agency principals. Resolves the top 50 agency pain points across three operating modes: internal team optimization (git-grounded standups, TDD seam gates, 60-minute blocker escalation, atomic diff ceilings), client boundary defense (scope creep change-order interceptor, 48h stop-the-clock memos, proactive evidence digests, shared DoD), and founder leverage calibration (the 70/30 leverage rule, feast-or-famine pipeline cadence, delegation matrix). Evaluates controllable inputs on a 1-10 effort rubric. Generates daily-standup.md.

---

## 🧭 What is this?

Agencies fail when controllable engineering execution collides with chaotic external client expectations or founder bottlenecks.

`coach` operates across **Three Dedicated Agency Vectors**:

1. **`team`**: Daily reflective standups grounded in git logs (`git log --since="24 hours ago"`), 5-pillar effort scoring (TDD, diff size, security, focus, blocker triage), and 60-minute stall escalations.
2. **`client`**: Scope-creep interceptor with "Yes, And..." change orders, 48h stop-the-clock memos for missing assets, and proactive plain-English progress digests.
3. **`founder`**: Executive leverage diagnostic enforcing the 70/30 rule (≥70% bandwidth on systems/strategy vs ≤30% tactical triage) and securing a 15% non-negotiable weekly pipeline reserve.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill coach
```

---

## 🚀 Usage & Modes

| Mode | Command Trigger | Action |
| :--- | :--- | :--- |
| **`team`** | `bun coach.ts --standup` | Evaluates 5 controllable inputs, scores 1–10, emits `daily-standup.md`. |
| **`client`** | `bun coach.ts --scope-check "<text>"` | Flags out-of-scope requests and generates polite Phase 2 change orders. |
| **`client`** | `bun coach.ts --client-digest` | Compiles 24h technical commits into plain-English client progress digests. |
| **`founder`**| `bun coach.ts --founder-audit` | Evaluates weekly capacity distribution and enforces the 70/30 leverage rule. |
| **`audit`**  | `bun coach.ts --audit` | Audits forensic integrity, link health, and secret isolation of coach artifacts. |

---

## 📄 Artifacts Generated

1. `daily-standup.md` — Daily reflection log with 5-pillar effort score and next day Single Most Important Task (MIT).
2. `client-digest.md` — Client-facing progress digest translating code commits into business capability.
3. `founder-leverage-memo.md` — Weekly executive leverage audit with delegation directives.
