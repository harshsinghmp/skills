# audit — Audit sales-enablement assets for buyer truth and consistency.

## When to Use

- Reviewing an existing demo, objection handbook, one-pager, or playbook.
- Reps are inconsistent, losing on air, or the assets contradict each other.

## Checklist

- [ ] Objections sourced from real buyer language (calls, win/loss, reviews), not invented.
- [ ] Every proof point verifiable; no unsupported claims or fabricated testimonials/partnerships.
- [ ] Demo opens on the buyer's problem, not the feature list.
- [ ] Assets consistent with each other and with `growth` positioning/pricing.
- [ ] One-pager lands one outcome in a scan; playbook has disqualify rules and per-stage asks.
- [ ] Voice is the buyer's, not internal jargon.

## Severity & routing

| Finding | Action |
|:---|:---|
| Invented objection or proof point | BLOCK — replace with sourced reality |
| Assets contradict positioning/pricing | PROPOSE-DIFF — align to `growth` |
| Vanilla "we're different" objection answer | REJECT — rewrite honestly with proof |
| Out-of-date buyer intelligence | REPORT-ONLY — refresh from win/loss |

Output: `audit-sales-enablement-<ts>.md` with a finding table and per-item routing.

## Sources

Canonical audit-mode guidance: `skills/references/audit-mode-guidance.md`.