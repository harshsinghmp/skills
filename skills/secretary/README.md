# Secretary Controller (`secretary`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /secretary](https://img.shields.io/badge/Triggers-%2Fsecretary%20%7C%20%2Fmemo-purple.svg?style=for-the-badge)](#)

Evidence-grounded staff-work controller and approval gate for high-stakes decisions, executive briefs, memos, and outbound actions. Enforces judgment over authority, Socratic adversarial stress-testing (3-prong devil's advocate challenge), explicit dissent preservation, frozen evidence snapshots, and single-use SHA-256 hash approvals before any filesystem or external mutation. Extends to delegation control: subagent dispatch with teachback confirmation and two-stage review gates, DAG wave dispatch that skips dependents on parent failure, intake triage with WIP limits, blast-radius replan protocol, orientation briefings, a persistent task ledger, and structured session handover with three-tier harvest.

---

## 🧭 What is this?

Autonomous agents often suffer from **authority leakage** (executing unreviewed mutations), **confirmation bias** (rubber-stamping user premises without considering alternatives), and **consensus smoothing** (erasing uncertainties, edge cases, and contradictions to provide a neat answer).

`secretary` provides the formal doctrine of Completed Staff Work:
- **Socratic Adversarial Gate**: Formulates 3 mandatory counter-arguments (Architectural Fragility, Operational/Rollback Burden, Hidden Assumptions) to challenge proposals before execution.
- **Preserved Dissent**: Contradictions, data gaps (`[NO-DATA]`), and dissenting views are captured in the formal Dissent Ledger rather than papered over.
- **Single-Use Cryptographic Hash Gate**: The agent halts at `NEEDS_APPROVAL` with a SHA-256 fingerprint of the proposed payload. Zero mutations occur without explicit human confirmation.
- **Delegation Control Gates**: Teachback before subagent work, two-stage review on delivery, DAG wave dispatch that marks dependents `SKIP` on parent failure, and a persistent task ledger so delegation state survives context resets.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill secretary
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/secretary
/memo

# Natural language
"Prepare an adversarial staff decision memo for migrating the database cluster"
"Challenge this architecture with a Socratic devil's advocate pass and generate an approval packet"
```

---

## 📄 Artifacts Generated

1. `DECISION_MEMO.md` — Completed staff work packet with recommendation, trade-offs, 3-prong adversarial counter-arguments, and preserved dissent ledger.
2. `APPROVAL_PACKET.md` — Cryptographic SHA-256 hash payload with single-use confirmation token.
