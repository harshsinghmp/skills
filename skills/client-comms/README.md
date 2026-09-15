# 💬 client-comms

The client communication department head: one skill, four modes — status, change, handover, feedback. Report progress, control scope, hand over cleanly, listen well. Outward voice to the client, in plain language.

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

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **status** | status update / weekly report | Status: progress, blockers, and next steps in client language. |
| **change** | change request / scope change | Change: impact, options, and scoped approval before work starts. |
| **handover** | handover / project docs / training | Handover: docs, credentials, training, and support terms. |
| **feedback** | feedback / client review | Feedback: structured intake, triage, and response plan. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
