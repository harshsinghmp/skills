# agents — Agents: bounded tool-using agents with guardrails and traceability.

## Intake

- Task the agent must complete end to end
- Tools/APIs it may call and their permissions
- Guardrails: budget, scope, approval gates
- Failure and rollback expectations
- Default stack: orchestrate tool calls via self-hosted n8n where scheduling/webhooks fit (or current platform); credentials in Bitwarden (or current secret store).

## Deliverable

An agent design: a clear task contract, a minimal tool set with scoped permissions, a reasoning/loop policy (max steps, budget), approval gates for risky actions, and trace logging.

## Procedure

1. Write the task contract: input, success criteria, and explicit non-goals.
2. Give the agent the minimum tool set with least-privilege credentials.
3. Define the loop policy: max steps, token/cost budget, and stop conditions.
4. Put human-approval gates in front of irreversible or spend actions.
5. Log every tool call and decision for traceability and debugging.
6. Handle failure: timeouts, partial results, and safe abort.
7. Evaluate on a task suite; measure success rate, cost, and steps before shipping.

## Quality gate

- [ ] Task contract with success criteria and non-goals.
- [ ] Least-privilege tool permissions.
- [ ] Step/cost budget and stop conditions.
- [ ] Approval gates on risky actions.
- [ ] Full tool-call trace logging.
- [ ] Evaluated on a task suite before ship.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
