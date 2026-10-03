# chatbot — Chatbot: a retrieval-grounded assistant with escalation to humans.

## Intake

- Purpose and scope (support, sales, internal)
- Knowledge sources to ground on
- Channels/surfaces where it lives
- Escalation rules and human handoff
- Default stack: orchestrate via self-hosted n8n where workflow glue is needed (or current platform).

## Deliverable

A chatbot: scoped persona and system prompt, retrieval over the knowledge base, guardrails (no fabrication, no off-topic), human escalation, and a conversation evaluation set.

## Procedure

1. Define the scope and what the bot must NOT do; state it in the system prompt.
2. Ground answers in retrieval over approved sources — never answer from raw model memory for facts.
3. Write the persona and rules: tone, refusal behavior, and fallback to a human.
4. Wire escalation for low-confidence, sensitive, or explicit human requests.
5. Log conversations (privacy-compliant) and define success metrics (resolution, CSAT, escalation rate).
6. Build an evaluation set of real questions; test accuracy and refusal behavior.
7. Iterate on failures; keep the knowledge base fresh.

## Quality gate

- [ ] Scope and out-of-scope defined.
- [ ] Answers grounded in retrieval, not model memory.
- [ ] Human escalation path present.
- [ ] Conversation logging privacy-compliant.
- [ ] Evaluation set tests accuracy and refusals.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
