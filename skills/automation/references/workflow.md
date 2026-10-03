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
8. Diagnose broken runs by error class first (expression/mapping, credential/auth, HTTP/API, logic/flow, platform config): state root cause, why it happened, and where to look — then fix, re-test, and log one prevention note.
9. n8n Engineering & Expression Invariants (Default Stack Protocol):
   - **Expression Syntax**: Double braces `{{ $json.field }}`; node references `{{ $node["Node Name"].json.field }}`.
   - **Webhook Scoping Trap**: Webhook trigger data is nested under `.body`: use `{{ $json.body.field }}`, NOT `{{ $json.field }}`.
   - **Code Node Return Contract**: Default to `Run Once for All Items` (95% of workflows); access via `$input.all()`; return contract strictly `[{ json: { ... } }]`. Never put `{{}}` expressions inside Code nodes (use direct JS/Python syntax).
   - **Progressive Node Discovery**: Inspect schemas via `get_node({ detail: "standard" })` first (1–2k tokens covers 95%); run runtime validation loop before publishing.
   - **Error Handling Triggers**: Configure an explicit Error Trigger node routing failed executions to alert channels with step-name, error message, and input payload snapshot.

## Quality gate

- [ ] Process measured before automating.
- [ ] Trigger, owner, and off-switch defined.
- [ ] Failure handling and retries present.
- [ ] Side effects idempotent.
- [ ] Happy and failure paths tested.
- [ ] Failures diagnosed by error class with a prevention note logged.
- [ ] n8n expressions validated: webhook references use `.body.*`, Code nodes return `[{ json: { ... } }]`.

## Routing

- Prompt-only failures (no workflow change needed) → automation prompt mode; poison-input patterns → dead-letter mode.

## Sources

- czlonkowski/n8n-expression-syntax, n8n-validation-expert, n8n-workflow-patterns
- Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.

