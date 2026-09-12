# Daily Standup Coach (`coach`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /standup](https://img.shields.io/badge/Triggers-%2Fstandup%20%7C%20%2Fdaily-purple.svg?style=for-the-badge)](#)

Daily reflective check-in and effort scorecard for developers and AI agents. Evaluates controllable inputs (tests written, diffs kept minimal, invariants respected, secrets scrubbed) on a 1-10 effort rubric rather than fluctuating external outcomes.

---

## 🧭 What is this?

Daily standups frequently devolve into performative status reporting or emotional rollercoasters based on external luck.

`coach` grounds daily reflection in **Stoic controllable inputs**:
- Did you write tests first?
- Did you keep diffs minimal?
- Did you protect secrets and maintain codebase hygiene?
- Did you focus deep energy on your #1 priority?

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill coach
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/standup
/daily

# Natural language
"Run evening standup and effort scorecard"
"Perform morning focus check-in and plan today's MIT"
```

---

## 📄 Artifacts Generated

1. `daily-standup.md` — Daily reflection log with 5-pillar effort score and next day focus.
