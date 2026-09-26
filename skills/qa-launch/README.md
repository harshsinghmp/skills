# 🛡️ qa-launch

The pre-launch quality gate: one skill, four modes — matrix, functional, gate, regression. Plan the coverage, verify the candidate, verdict the release, re-verify the fixes. Finds defects; routes them — never fixes inline.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill qa-launch
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Plan browser and device coverage for our launch next month.
```

```text
QA the release candidate and give me a Block-or-Ship verdict.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **matrix** | browser / device coverage | Matrix: prioritized browser × device × viewport plan from audience data. |
| **functional** | QA the site / release candidate | Functional: critical-path walkthrough with pass/fail evidence. |
| **gate** | release gate / Block-or-Ship | Gate: checklist with an explicit Ship or Block verdict. |
| **regression** | re-verify after fixes | Regression: fixed issues plus adjacent blast radius, re-verified. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
