# 🗂️ ops

The agency operations department head: one skill, six modes — onboarding, proposal, sow, milestone, retro, multi-client. Clean intake, written scope, tracked delivery, honest retrospectives.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill ops
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Onboard a new client into an isolated workspace and write the project SOW.
```

```text
Run a retrospective on the just-finished rebrand and manage next quarter's three retainer clients.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **onboarding** | client onboarding | Onboarding: clean intake, isolated workspace, and a kickoff plan. |
| **proposal** | client proposal | Proposal: outcome-led pitch with a clear plan, price, and proof. |
| **sow** | statement of work | SOW: explicit scope, deliverables, assumptions, and a change-order process. |
| **milestone** | milestone & scope tracking | Milestones: tracked delivery, scope control, and change orders. |
| **retro** | project retrospective | Retro: blameless review producing tracked process improvements. |
| **multi-client** | multi-client portfolio | Multi-client: one view across engagements, capacity, and risk. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
