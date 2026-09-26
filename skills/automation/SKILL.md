---
name: automation
aliases: ["ai-services", "ai-automation", "workflow-automation", "chatbots", "agents", "rag", "prompt-engineering"]
description: "Full automation and AI services department: workflow automation, chatbots, AI agents, retrieval-augmented generation, third-party integrations, and prompt engineering — routed through six modes. Use when asked to automate a manual process, build a chatbot or AI assistant, design an agent or RAG pipeline, connect systems via APIs/webhooks, or engineer and evaluate prompts. Not for hosting/CI (devops) or data tracking (analytics)."
argument-hint: "[workflow|chatbot|agents|rag|integrations|prompt]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 31
  aliases: ["ai-services", "ai-automation", "workflow-automation", "chatbots", "agents", "rag", "prompt-engineering"]
  suggested_skills: ["webdev", "analytics", "devops", "new-project"]
  hermes:
    tags: ["automation", "workflow", "chatbot", "ai-agents", "rag", "llm", "integrations", "webhooks", "api", "prompt-engineering", "evals", "n8n", "zapier"]
    related_skills: ["webdev", "analytics", "devops", "new-project"]
    suggested_skills: ["webdev", "analytics", "devops", "new-project"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["webdev", "analytics", "devops", "new-project"]
    primary_triggers: ["automate this process", "build a chatbot", "ai agent", "rag pipeline", "connect two apps", "webhook", "write a prompt", "ai assistant"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🤖 automation — Automation & AI Services Department

One head skill for automation and AI. Automate the boring, keep humans on judgment. Every automation must have a trigger, a clear owner, failure handling, and an off-switch. Every AI system must be grounded, evaluated, and bounded — a demo that works once is not a product.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **workflow** | "automate this process", "workflow automation", "zapier", "n8n", "make" | Deterministic automation of a repetitive process | [references/workflow.md](references/workflow.md) |
| **chatbot** | "chatbot", "support bot", "ai assistant", "faq bot" | Grounded conversational assistant for support/sales | [references/chatbot.md](references/chatbot.md) |
| **agents** | "ai agent", "agentic", "tool-using agent", "autonomous agent" | Tool-using AI agents with hard guardrails | [references/agents.md](references/agents.md) |
| **rag** | "rag", "retrieval augmented", "chat with my docs", "knowledge base bot" | Retrieval-augmented generation over a knowledge base | [references/rag.md](references/rag.md) |
| **integrations** | "connect two apps", "api integration", "webhook", "sync systems" | Third-party API/webhook integrations and data sync | [references/integrations.md](references/integrations.md) |
| **prompt** | "write a prompt", "prompt engineering", "improve this prompt", "eval a prompt" | Prompt design, iteration, and evaluation | [references/prompt.md](references/prompt.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Automating a repetitive or error-prone manual process.
- Building a chatbot or AI assistant for support/sales.
- Designing an AI agent that uses tools to complete work.
- Building a RAG pipeline over a document/knowledge base.
- Connecting SaaS tools via APIs, webhooks, or automation platforms.
- Engineering, testing, and evaluating prompts.

### Anti-Triggers

- Hosting, CI/CD, and infra → `devops`.
- Scaffolding a web app → `new-project`.
- Tracking and reporting on results → `analytics`.
- Writing marketing content → `content`.

---

## Quick Reference

### Automation ladder (prefer determinism)

| Need | Approach |
|:---|:---|
| Fixed, rule-based steps | Deterministic workflow (no LLM) |
| Rules plus language understanding | Workflow + one bounded LLM call |
| Conversational interface | Chatbot (retrieval-grounded) |
| Multi-step, tool-using, adaptive | Agent (with hard guardrails) |
| Answers from private docs | RAG (retrieval + generation) |

Rule: use the least autonomy that solves the problem. LLMs only where language/ambiguity requires it.

### Verification gate (every mode)

- Trigger, owner, failure handling, and off-switch defined.
- Deterministic logic kept out of the model where possible.
- AI outputs grounded and evaluated against a test set.
- Secrets kept out of code and logs.

### Suite contracts

- Deploying/hosting the service → `devops`.
- The web/API surface it runs behind → `webdev`.
- Data/telemetry on its performance → `analytics`.

---

## Procedure

1. **Intake.** identify the manual process, its trigger, and the measurable time/error it removes — before building; automation of a broken process just breaks faster.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Automating a broken process before fixing it.
- Over-using LLMs for deterministic logic — slow, costly, unreliable.
- No failure handling (silent failures and duplicate actions).
- No owner or off-switch for a running automation.
- Ungrounded chatbots that confidently hallucinate.
- No evaluation set — shipping on vibes.
- Secrets in code, prompts, or logs.

---

## Verification

- [ ] Manual process documented and measured before automation.
- [ ] Trigger, owner, failure handling, and off-switch defined.
- [ ] Deterministic logic kept out of the model.
- [ ] AI outputs evaluated against a test set with pass criteria.
- [ ] Secrets in a secret store, never in code/logs.
- [ ] Idempotency/deduplication handled for side-effecting steps.
- [ ] Monitoring and a rollback path exist.
