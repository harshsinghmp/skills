# Socratic Adversarial Gate & Devil's Advocate Reference

> Operational protocol for stress-testing staff memos, architecture proposals, and mutation payloads with Socratic inquiry and mandatory counter-arguments before computing single-use SHA-256 confirmation tokens.

---

## 1. The Confirmation Bias Trap in Agent Systems

LLM agents routinely suffer from **confirmation bias** and **premature consensus**:
- Uncritically accepting the user's initial hypothesis or framing.
- Generating justification for an architectural choice while ignoring structural trade-offs.
- Glossing over single points of failure (SPOF) or catastrophic rollback scenarios.

The **Socratic Adversarial Gate** forces the agent into the role of a rigorous red team before any mutation payload can be hashed or executed.

---

## 2. The 3-Prong Devil's Advocate Challenge

Before advancing to `NEEDS_APPROVAL`, the agent must formulate **at least 3 explicit counter-arguments** against the proposed recommendation:

| Counter-Argument Dimension | Probing Question | Common Failure Mode Challenged |
| :--- | :--- | :--- |
| **1. Architectural Fragility** | *"Under what realistic load spikes, data corruption, or edge cases does this architecture collapse?"* | Hidden tight coupling, unhandled distributed state, optimistic concurrency assumptions. |
| **2. Operational & Rollback Burden** | *"If this change fails midway in production, how painful and destructive is the rollback?"* | One-way database migrations, irreversible file transformations, missing dry-run paths. |
| **3. Hidden Assumption Exposure** | *"What unverified premises or optimistic assumptions is this proposal taking as gospel?"* | Unbenchmarked vendor claims, untested API rate limits, reliance on uncommitted types. |

---

## 3. Socratic Inquiry Gate

If any of the 3 counter-arguments exposes a critical unverified premise or ambiguous constraint:

1. **Pause Mutation Drafting**: Do not invent answers or generate premature diffs.
2. **Issue Socratic Questions**: Surface concise, targeted questions to the human principal or technical architect:
   - *"What is our fallback SLA if the new datastore cluster fails during cutover?"*
   - *"Has this migration been benchmarked against our actual p99 payload size?"*
3. **Classify Outcome**:
   - **Rebutted / Resolved**: Evidence provided or design adjusted $\rightarrow$ Proceed.
   - **Accepted Risk / Preserved Dissent**: Risk acknowledged but overridden by principal $\rightarrow$ Record explicitly in the **Preserved Dissent Ledger**.
   - **Invalidated**: Proposal flawed $\rightarrow$ Return to `DRAFTING` with alternative architecture.

---

## 4. Preserved Dissent Ledger Schema

Every `DECISION_MEMO.md` and `APPROVAL_PACKET.md` must incorporate the formal Dissent Ledger:

```markdown
## Preserved Dissent & Adversarial Ledger

### Counter-Argument 1: [Short Title]
- **Adversarial Critique**: [Detail the specific failure mode or risk]
- **Counter-Resolution**: [Resolved by Evidence | Overridden as Accepted Risk | Mitigated by Guardrail]
- **Receipt / Evidence**: [Link to test run, benchmark, or code path]

### Counter-Argument 2: [Short Title]
- **Adversarial Critique**: [Detail the specific failure mode or risk]
- **Counter-Resolution**: [...]
- **Receipt / Evidence**: [...]

### Counter-Argument 3: [Short Title]
- **Adversarial Critique**: [Detail the specific failure mode or risk]
- **Counter-Resolution**: [...]
- **Receipt / Evidence**: [...]
```
