# audit — pua audit mode (Performance Improvement Plan audit)

## When to Use

- **Stall audit**: Task failed 2+ times — verify exhaustive options were tried
- **Process audit**: Ensure agent didn't give up early or blame environment without evidence

## Checklist

- [ ] All search strategies attempted (docs, source code, web, ask user with evidence)
- [ ] At least 3 distinct hypotheses formed and tested
- [ ] Root cause identified with evidence (not assumption)
- [ ] Receipt check: Verbatim terminal execution receipts provided for all claims
- [ ] Ghost file probe: Every referenced file/path physically exists on disk (`fs.existsSync`)
- [ ] Anti-thrashing check: Churn-to-signal ratio $\le 1.5$ (no cosmetic edits in unrelated files)
- [ ] Anti-sycophancy check: Zero groveling or boilerplate apologies; responses lead with diagnosis
- [ ] Environment issues ruled out before claiming "can't solve"
- [ ] Manual workaround offered if agent truly blocked
- [ ] Escalation question is specific (not open-ended)
- [ ] Progress logged in dead-letter checkpoint (if blocked)
- [ ] Next attempt uses fundamentally different approach (not parameter tweak)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Ghost file detected (hallucinated path) | `AUTO-REPAIR` | `pua` (PIP rating: Red; halt & re-audit) |
| Cosmetic thrashing (churn ratio > 3.0) | `PROPOSE-DIFF` | `pua` (revert cosmetic diffs; focus test) |
| Agent gave up before exhausting options | `PROPOSE-DIFF` | `pua` (re-engage with new strategy) |
| Root cause assumed without evidence | `AUTO-REPAIR` | `pua` (verify with diagnostic) |
| Specific blocker with clear question | `REPORT-ONLY` | `secretary` (route to human) |
| Environment issue unverified | `AUTO-REPAIR` | `devops` (verify env first) |

## Output

`.agents/artifacts/audit-pua-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
