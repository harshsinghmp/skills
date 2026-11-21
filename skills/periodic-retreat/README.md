# Periodic Retreat (`periodic-retreat`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /retreat](https://img.shields.io/badge/Triggers-%2Fretreat%20%7C%20%2Fquarterly-purple.svg?style=for-the-badge)](#)

Quarterly personal and project strategic retreat facilitator. Conducts multi-scale deep audits of project health, architecture debt, dead-code purges via automated scan, founder vitality & purpose alignment, and binary next-quarter OKRs with Monday launchpads across the agency ecosystem.

---

## 🧭 What is this?

Without recurring strategic pauses, software repositories and personal systems accumulate severe **entropy**:
- Dead scripts, zombie dependencies, and unmaintained docs pile up.
- Daily urgency crowds out high-leverage architectural refactoring, founder vitality, and long-term goals.

`periodic-retreat` provides a rigorous 4-phase framework (Retrospective → Debt Purge → Vitality Alignment → Next-Q Monday OKRs) to restore focus and strip away technical debt.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill periodic-retreat
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/retreat
/quarterly

# Natural language
"Facilitate Q3 strategic retreat and architecture debt audit"
"Conduct quarterly codebase purge, founder vitality review, and OKR planning"
```

---

## 📁 Structure

```text
periodic-retreat/
├── SKILL.md                        # 4-phase retreat procedure, pitfalls, and verification
├── README.md                       # this file — human reference (agents: load SKILL.md)
├── references/
│   ├── retreat-protocol.md         # churn heatmaps, automated knip purge, vitality ADE, Monday OKRs
│   └── retreat-framework.md        # 4 review horizons reference
└── examples/
    └── sample-quarterly-review.md
```

> **Note for agents:** the per-skill README is a human reference, not agent
> instructions — agents should load `SKILL.md` (and `references/retreat-protocol.md`
> during facilitation), never this file.

---

## 📄 Artifacts Generated

1. `quarterly-retreat.md` — Complete strategic review packet with retrospective metrics, purge list, vitality ADE matrix, and Monday launchpad OKRs.
