# 🔁 retain

The post-delivery retention department head: one skill, ten modes — check-in, value-note, qbr, review-ask, referral-rebuy, churn-watch, sla, renewal, health, audit. Delivery wins the project; the loop wins the next one.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill retain
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Follow up with the client a week after launch and prove the value.
```

```text
Run the QBR from this transcript and ask for a review at the close.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **check-in** | post-delivery follow-up | Check-in: delivery+7d message naming the work, one concrete question, logged outcome. |
| **value-note** | monthly value proof | Value note: shipped → outcome → source per item, monthly heartbeat. |
| **qbr** | quarterly business review | QBR: transcript-grounded review, next-quarter priorities with owners, decisions logged. |
| **review-ask** | review / testimonial ask | Review ask: timed at the delight peak, one direct link, outcome logged. |
| **referral-rebuy** | referral / repurchase offer | One timed offer after value proven; won deals hand to `ops` as new SOW. |
| **churn-watch** | churn risk / client gone quiet | Triage: signal named with numbers, >14d silence escalates to `growth`. |
| **sla** | retainer SLAs & warranty governance | Retainer SLAs: 30-day bug warranty defense, bug vs enhancement triage, and capacity burn-down. |
| **renewal** | retainer contract renewal | Renewal: proactive 60-day renewal timeline, ROI receipts ledger, scope creep retro, and 3-tier proposals. |
| **health** | client health telemetry & churn radar | Health: tri-vector health scoring (Product 40%, Sentiment 30%, Financial 30%), early warning radar, and 48h stop-the-clock interventions. |
| **`audit`** | churn audit / portfolio risk audit | Five-question churn audit + 90-day leading-indicator rubric. |

## How it works

1. **Intake** — delivery date, client, last contact before anything sends.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
