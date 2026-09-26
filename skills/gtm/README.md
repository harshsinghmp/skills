# 📤 gtm

The outbound GTM department head: one skill, five modes — research, score, outreach, list, handover. Build the pipeline, then hand sales a close-ready packet.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill gtm
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Research these ten target accounts and score the leads against our ICP.
```

```text
Build a verified prospect list and draft the outbound sequence with follow-ups.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **research** | target account / lead research | Research: sourced account and lead briefs with spine-always depth. |
| **score** | lead scoring / TAM-SAM sizing | Score: ranked leads, TAM/SAM sizing, and signal ladders. |
| **outreach** | cold email sequence | Outreach: sequenced touches with deliverability rules, caps, and breakup. |
| **list** | prospect list building | List: deduplicated, verified, enriched CSV ready to send. |
| **handover** | sales handover | Handover: context packet sales can run the first call from. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
