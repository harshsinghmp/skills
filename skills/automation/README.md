# 🤖 automation

The automation and AI services department head: one skill, six modes — workflow, chatbot, agents, rag, integrations, prompt. Deterministic where possible, AI where it earns its place.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill automation
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Automate our lead intake: Slack alert, CRM entry, and a follow-up email from one form submission.
```

```text
Build a support chatbot grounded in our help docs with evaluation tests.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **workflow** | workflow automation | Workflow: deterministic automation with clear triggers and failure handling. |
| **chatbot** | chatbot / assistant | Chatbot: a retrieval-grounded assistant with escalation to humans. |
| **agents** | AI agent | Agents: bounded tool-using agents with guardrails and traceability. |
| **rag** | RAG pipeline | RAG: retrieval + grounded generation with citations and evaluation. |
| **integrations** | API / webhook integration | Integrations: reliable API/webhook connections with auth and error handling. |
| **prompt** | prompt engineering / evals | Prompt: engineered, versioned, and evaluated prompts. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
