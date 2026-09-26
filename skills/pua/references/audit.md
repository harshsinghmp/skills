# audit — pua audit mode (Performance Improvement Plan audit)

## When to Use

- **Stall audit**: Task failed 2+ times — verify exhaustive options were tried
- **Process audit**: Ensure agent didn't give up early or blame environment without evidence

## Checklist

- [ ] All search strategies attempted (docs, source code, web, ask user with evidence)
- [ ] At least 3 distinct hypotheses formed and tested
- [ ] Root cause identified with evidence (not assumption)
- [ ] Environment issues ruled out before claiming "can't solve"
- [ ] Manual workaround offered if agent truly blocked
- [ ] Escalation question is specific (not open-ended)
- [ ] Progress logged in dead-letter checkpoint (if blocked)
- [ ] Next attempt uses fundamentally different approach (not parameter tweak)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Agent gave up before exhausting options | `PROPOSE-DIFF` | `pua` (re-engage with new strategy) |
| Root cause assumed without evidence | `AUTO-REPAIR` | `pua` (verify with diagnostic) |
| Specific blocker with clear question | `REPORT-ONLY` | `secretary` (route to human) |
| Environment issue unverified | `AUTO-REPAIR` | `devops` (verify env first) |

## Output

`.agents/artifacts/audit-pua-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
