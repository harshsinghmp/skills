# prompt — Prompt: engineered, versioned, and evaluated prompts.

## Intake

- Task and the exact output format required
- Model(s) and constraints (context, cost, latency)
- Available examples or ground truth
- Failure modes observed
- Default stack: run/evaluate inside self-hosted n8n flows where automation wraps the prompt (or current setup).

## Deliverable

A production prompt: role/task framing, explicit constraints and output format, few-shot examples where useful, plus a small evaluation set and a version/iteration log.

## Procedure

1. State the task, the audience, and the exact output schema in the prompt.
2. Give constraints and refusal behavior for out-of-scope inputs.
3. Add few-shot examples only where they measurably help.
4. Separate system vs user content; keep instructions out of untrusted input.
5. Build a small eval set with expected outputs and score each prompt version.
6. Iterate: change one thing at a time and re-measure.
7. Version prompts and record what each change did.

## Quality gate

- [ ] Task and output schema explicit.
- [ ] Refusal behavior defined for out-of-scope input.
- [ ] Few-shots justified by measurement.
- [ ] Prompt-injection boundary respected (instructions isolated from user data).
- [ ] Eval set exists and each version measured.
- [ ] Prompts versioned with a change log.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
