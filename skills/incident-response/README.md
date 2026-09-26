# 🚨 incident-response

Live incident command: one skill, four modes — triage, mitigate, communicate, retro. Classify the severity, stop the bleeding, tell the truth on a cadence, then learn without blame. Mitigates first, diagnoses second.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill incident-response
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Production is down, help me triage severity and run the first 15 minutes.
```

```text
Draft the status page update for this SEV-1 outage.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **triage** | production down / severity / first 15 minutes | Triage: SEV classification, escalation spine, first-15-minutes checklist. |
| **mitigate** | stop the bleeding / roll back / site is down | Mitigation: class-specific playbook run (outage, breach, data-loss, perf-collapse). |
| **communicate** | status page update / incident comms | Comms: severity-linked updates and templates, internal plus external. |
| **retro** | postmortem / blameless retro | Retro: blameless postmortem with owned, dated action items. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
