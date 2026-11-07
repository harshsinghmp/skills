# 🛡️ qa-launch

The pre-launch quality gate: one skill, ten modes — matrix, functional, performance, gate, regression, e2e, vitals, evals, chaos, audit. Plan the coverage, verify the candidate, measure performance, audit Core Web Vitals, evaluate AI agent pipelines, test synthetic chaos faults and resilience, verdict the release, re-verify the fixes, and run Playwright synthetic smoke journeys. Finds defects; routes them — never fixes inline.

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
| **performance** | front-end performance checklist / perf budget | Performance: six-category (HTML/CSS/fonts/images/JS/Server) checklist with severity-ranked findings and budget readings. |
| **gate** | release gate / Block-or-Ship | Gate: checklist with an explicit Ship or Block verdict. |
| **regression** | re-verify after fixes | Regression: fixed issues plus adjacent blast radius, re-verified. |
| **e2e** | e2e tests / playwright smoke suite | E2E: Playwright synthetic user journeys, accessible role locators, and headless smoke runner. |
| **vitals** | core web vitals / inp audit / cls check | Vitals: Core Web Vitals audit (sub-200ms INP, zero-CLS fences, sub-2.5s LCP, font budgets) and Block-or-Ship production gate. |
| **evals** | ai agent evals / synthetic edge testing / repro pack | Evals: AI agent evaluation engine, synthetic edge battery generation, dual-model consensus scoring, repro packs, and regression scorecards. |
| **chaos** | chaos test / fault injection / resilience testing | Chaos: Synthetic fault injection testing (latency jitter, 502/504 drop simulation, database pool throttling, and zero data loss audit). |
| **audit** | audit the quality gate / launch audit | Audit: functional + regression + UAT sign-off, then a launch-gate audit (rollback plan, perf budget, docs). |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
