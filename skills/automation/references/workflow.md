# workflow — Workflow: deterministic automation with clear triggers and failure handling.

## Intake

- The manual process step by step, with time/error cost
- Trigger events and systems involved
- Owner and the success metric
- Failure modes and what should happen on error
- Default stack: self-hosted n8n as orchestrator (or current automation platform); secrets in Bitwarden (or current secret store).

## Deliverable

A working automation: a trigger, the ordered steps (with mappings), failure/retry handling, an owner, and a runbook — built in the appropriate tool (n8n/Zapier/Make or code).

## Procedure

1. Document the current manual process and its cost; fix obvious waste before automating.
2. Define the trigger precisely (event, schedule, or webhook).
3. Map each step: inputs, transformation, output system, and data fields.
4. Keep deterministic logic deterministic; add an LLM only where language is required.
5. Handle failures: retries, alerts to the owner, and dead-letter for poison inputs.
6. Make side-effecting steps idempotent (no duplicate emails/records).
7. Set an owner, an off-switch, and a runbook; test the happy and failure paths.

## Quality gate

- [ ] Process measured before automating.
- [ ] Trigger, owner, and off-switch defined.
- [ ] Failure handling and retries present.
- [ ] Side effects idempotent.
- [ ] Happy and failure paths tested.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
