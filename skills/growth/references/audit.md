# audit — growth audit mode

## When to Use

- **Experiment audit**: Verify growth experiments have clear hypotheses, end dates, and recorded results
- **Channel audit**: Check each growth channel has documented strategy + ROI

## Checklist

- [ ] Each active experiment has a documented hypothesis
- [ ] Experiments have end dates (no open-ended "let's see")
- [ ] Results recorded (win/loss/neutral) with data
> [ ] Each growth channel has documented strategy and target metric
- [ ] CAC (customer acquisition cost) calculated per channel
- [ ] LTV (lifetime value) estimated per cohort
- [ ] Churn tracked and action plan documented
- [ ] Next action defined after each experiment (scale, pivot, kill)
 - [ ] All analytics events firing correctly (see `analytics` audit)
 - [ ] Recurring ops run as loops, not reminders (source: marketingskills `marketing-loops` SKILL.md): each loop states 9 parts (cadence / acts-when / purpose / skills / body / self-check / state-idempotency / stop-bailout / output); most runs end "checked, nothing to do" by design; cadence follows signal (rankings weekly … churn daily); send/spend/publish steps hold a human checkpoint; every loop carries a kill-switch plus a banned-vocabulary honesty bar.
- [ ] AI product defensibility evaluated against the 4-layer moat framework (Workflow State, Proprietary Data, Deterministic Evals, Integration Surface); N+1 frontier model resilience confirmed.

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Experiment without end date | `AUTO-REPAIR` | set 2-week max deadline |
| No hypothesis documented | `PROPOSE-DIFF` | pause experiment until defined |
| Results not recorded after end date | `AUTO-REPAIR` | `analytics` (pull data now) |
| Channel strategy missing | `REPORT-ONLY` | `growth` (document strategy) |
| LTV > CAC assumed unverified | `AUTO-REPAIR` | `analytics` (run cohort analysis) |
| AI wrapper vulnerability / no moat | `PROPOSE-DIFF` | `growth:positioning` (architect 4-layer defensibility) |

## Output

`.agents/artifacts/audit-growth-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
