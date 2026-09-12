# Brain Audit (`audit`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /audit-brain](https://img.shields.io/badge/Triggers-%2Faudit--brain%20%7C%20%2Fhygiene-purple.svg?style=for-the-badge)](#)

Knowledge hygiene and referential integrity auditor for AI agent memory banks, documentation trees, and knowledge bases. Audits memory stores, `.memory/wiki/`, and project documentation for dead links, broken symbol references, orphaned notes, leaked credentials, and stale contradictions.

---

## 🧭 What is this?

As repositories evolve, documentation and memory banks decay:
- Links break silently.
- Old skill names and deprecated parameters linger in tutorials.
- Unintentional API keys get pasted into scratch notes.

`audit` provides an automated, rigorous sweep of your cognitive surface — and closes the loop instead of stopping at a findings list:

- **🔁 Severity-Routed Remediation**: every finding gets an action class — `AUTO-REPAIR` (with logged evidence), `PROPOSE-DIFF` (gated on your approval), `REPORT-ONLY`, or `DEFER-ROUTE` to a companion skill.
- **📶 Per-Step Progress Reporting**: one status line per pipeline step; Deep mode persists a progress log to `.agents/artifacts/` so long audits survive context loss.
- **🤝 Companion-Skill Routing**: unresolved findings are routed to the skill that owns the fix (`updatedocs`, `updateagents`, `evidence-ledger`, `dead-letter`, `ai-ready`), with fallbacks when a companion is absent.
- **✅ Re-Verification & Certification**: failed checks re-run and produce a remediation delta table; hygiene is certified only when zero critical blockers remain.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill audit
```

---

## 🚀 Usage & Triggers

```bash
# Slash commands
/audit-brain
/hygiene

# Natural language
"Audit all markdown documentation for dead links and broken references"
"Run a memory hygiene scan across .agents/context/ and docs/"
```

---

## 📄 Artifacts Generated

1. `brain-audit-report.md` — Complete audit breakdown: scope and mode, per-step ledger, findings with evidence and action classes, remediation delta table, companion-skill routing, and certification status.
2. `.agents/artifacts/audit-progress-<date>.md` — Deep-mode-only persistent progress log.

## 📚 References

- [Remediation Matrix & Routing Boundaries](references/remediation-matrix.md) — checkpoint → severity → action-class mapping and hard boundaries.
- [Knowledge Hygiene Rules](references/hygiene-rules.md) — referential rules plus remediation boundary rules.
- [Sample Brain Audit Report](examples/sample-audit-report.md) — worked Standard-mode report and condensed Quick-mode form.
