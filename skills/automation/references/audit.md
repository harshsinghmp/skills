# audit — automation audit mode

## When to Use

- **AI agent / automation security audit**: grade an agent, chatbot, RAG pipeline, or integration against the OWASP Top 10 for LLM Applications before it touches production.
- **Blast-radius audit**: an agent is gaining a new tool, credential, or retrieval source — enumerate what it could now do, worst case.
- **Evals-as-gate audit**: verify behavior-changing changes actually run evals, and that the eval results mean something.

## Checklist (OWASP LLM Top 10 lens)

- [ ] **LLM01 Prompt injection**: direct overrides AND indirect injection via retrieved docs, emails, pages, and TOOL RESULTS — plant an adversarial instruction and verify the agent does not act on it
- [ ] **LLM02 Sensitive disclosure**: no PII/secrets/other-tenant data reachable from context, memory, or retrieval
- [ ] **LLM05 Improper output handling**: model output never reaches a browser, shell, SQL engine, or template unescaped
- [ ] **LLM06 Excessive agency**: every tool/API scope/credential the agent holds is least-privilege; destructive or irreversible actions require human approval
- [ ] **LLM07 System prompt leakage**: extractable — and nothing in it is a secret or the only access control
- [ ] **LLM08 Vector/embedding weaknesses**: retrieval authorization tested; cross-tenant queries rejected; poisoning considered
- [ ] **LLM10 Unbounded consumption**: token floods, recursive agent loops, runaway tool costs bounded
- [ ] Third-party MCP/tools treated like third-party code: versions pinned, tool descriptions reviewed for hidden instructions, cross-server shadowing tested
- [ ] Sandboxing: code-execution and browsing tools isolated — no ambient credentials, no internal network reach
- [ ] Exfiltration channels enumerated: rendered markdown images/links, outbound HTTP tools, email, logs
- [ ] Evals gate by risk, not average: zero tolerance for the severe categories; run on prompt/model/tool/guardrail changes; model version + prompt hash + tool manifest recorded; confirmed bypasses join a permanent regression corpus

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| One successful data exfiltration/leak in evals | `CRITICAL` | ship-blocker regardless of pass rate |
| Destructive tool callable without human approval | `BLOCK` | add the approval gate before deployment |
| Agent follows planted indirect instructions | `REQUEST-CHANGES` | sanitize/untrust tool output, re-test |
| No evals on a behavior-changing diff | `REQUEST-CHANGES` | gate the change |
| Unbounded loop/token cost | `REPORT-ONLY` | cap and budget the run |

## Sources

- OWASP — Top 10 for LLM Applications (LLM01/02/05/06/07/08/10) and AI Agent Security Cheat Sheet
- OWASP DevSecOps Guideline — AI/LLM Application Security Testing (indirect injection, blast radius, evals-as-gate)
- OWASP secure-agent-playbook — agent-security-audit play
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
