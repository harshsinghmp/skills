# 💬 client-comms

The client communication department head: one skill across nine modes — status, change, handover, feedback, proposal, intake, audit, inbox-triage, and factual-reporting. Pitch proposals, report progress, control scope, ingest client onboarding questionnaires, hand over cleanly, and listen well. Outward voice to the client, in plain language.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill client-comms
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Write this week's client status update from our milestone notes.
```

```text
The client wants three extra pages — triage the change request before we agree.
```

```text
Scaffold a high-converting B2B proposal for Acme Global with 48h stop-the-clock terms using PAS framework.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **status** | status update / weekly report | Status: progress, blockers, and next steps in client language. |
| **change** | change request / scope change | Change: impact, options, and scoped approval before work starts. |
| **handover** | handover / project docs / training | Handover: docs, credentials, training, and support terms. |
| **feedback** | feedback / client review | Feedback: structured intake, triage, and response plan. |
| **proposal** | client proposal / pitch deck / B2B proposal | High-converting pitch, PAS/AIDA/QUEST architecture, stop-the-clock terms, and milestone proof gates. |
| **intake** | client intake / onboarding questionnaire | Ingestion: scope boundary extraction, anti-scope fencing, and vault scaffolding. |
| **`audit`** | communication audit / SLA audit | Bidirectional SLAs, cadence integrity, channel discipline, escalations. |
| **`inbox-triage`** | inbox triage / email triage | Executive inbox triage and follow-up protocols. |

### Specialized References

- `references/factual-reporting.md`: Ribao automated daily/weekly factual progress reporting grounded strictly in Git commit SHAs, test receipts, and verified task completions (zero speculation).

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
