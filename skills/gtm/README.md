# 📤 gtm

The outbound and developer GTM department head: one skill, nine modes — research, score, outreach, list, handover, audit, discovery, dev-to-buyer, founder-sales. Build the pipeline, validate user pain, arm developer champions, and coach founder-led sales.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill gtm
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Run customer discovery interviews via TAB for our developer tool.
```

```text
Arm our developer champions with an executive ROI and compliance packet for their CTO.
```

```text
Research these ten target accounts and score the leads against our ICP.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **discovery** | customer discovery / TAB interview | Discovery: validated customer pain, status quo breakdown, and assumption updates. |
| **dev-to-buyer** | market to devs sell to buyers / champion enablement | Dev-to-buyer: internal champion ROI sheet, compliance briefing, and draft PO email. |
| **founder-sales** | founder sales / live demo / objection handling | Founder-sales: diagnostic call agenda, surgical demo plan, and objection battlecard. |
| **research** | target account / lead research | Research: sourced account and lead briefs with spine-always depth. |
| **score** | lead scoring / TAM-SAM sizing | Score: ranked leads, TAM/SAM sizing, and signal ladders. |
| **outreach** | cold email sequence | Outreach: sequenced touches with deliverability rules, caps, and breakup. |
| **list** | prospect list building | List: deduplicated, verified, enriched CSV ready to send. |
| **handover** | sales handover | Handover: context packet sales can run the first call from. |
| **audit** | launch audit / anti-puffery audit | Audit: launch readiness, developer quickstart TTFV, and anti-puffery report. |

## How it works

1. **Context Grounding** — reads `./.agents/context/product.md` and `./.agents/context/roadmap.md`.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
