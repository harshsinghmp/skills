# client-pnl — Client profitability, project gross margins, and Effective Hourly Rate (EHR).

## Scope

- Measuring real project and client profitability across fixed-fee milestones, ongoing retainers, and T&M engagements.
- Calculating direct delivery gross margins and Effective Hourly Rate (EHR).
- Detecting scope-creep margin erosion and framing financial billing adjustments.

## Deliverable

A Client P&L Scorecard with Gross Margin percentage, EHR realization rate, and recommended billing adjustments or contract adjustments.

## Procedure

1. **Client Gross Margin Formula & Benchmarks**:
   $$\text{Client Gross Margin} = \frac{\text{Client Recognized Revenue} - \text{Direct Project Costs}}{\text{Client Recognized Revenue}} \times 100$$
   *Direct Project Costs include*: Subcontractor developer/designer fees, dedicated API tokens (OpenAI, Anthropic, ElevenLabs), project-scoped cloud compute/databases (Supabase, Neon, AWS), and payment gateway processing fees.

   | Margin Tier | Status | Action Mandate |
   |:---|:---|:---|
   | **≥ 70%** | **Optimal** | Core agency profit engine. Document operational efficiency pattern for team reuse. |
   | **60% – 69%** | **Healthy** | Target agency standard. Monitor scope adherence during sprint milestones. |
   | **50% – 59%** | **Warning Zone** | Margin compression detected. Audit meeting overhead and contractor allocations. |
   | **< 50%** | **Red Alert** | Unprofitable client account. Halt uncontracted tasks; initiate scope review or price correction. |

2. **Effective Hourly Rate (EHR) Calculation**:
   $$\text{EHR} = \frac{\text{Total Net Contract Value}}{\text{Total Delivery Hours (Internal Principal + Specialist Contractors)}}$$
   - *Benchmark*: Minimum target **$150/hr** across full-stack agency deliverables.
   - Fixed-price projects and monthly retainers must track total actual hours logged.
   - If a $10,000 fixed-price project absorbs 100 total hours, realized EHR drops to $100/hr. If it finishes in 40 hours, EHR accelerates to $250/hr.

3. **Scope-Creep Margin Erosion Detection & Pricing True-Up**:
   - Detect "invisible leakage": Endless unbilled revisions, unscheduled Slack ping storms, and out-of-scope feature requests disguised as "minor tweaks".
   - *Rule of 10%*: Any feature request exceeding 10% of the milestone delivery budget requires a formal Change-Order billing adjustment:
     $$\text{Change-Order Fee} = \text{Estimated Scope Hours} \times \text{Target EHR Floor (\$150)} \times 1.25\,(\text{Sprint Interruption Premium})$$

4. **Client Portfolio Matrix (Margin vs Friction)**:
   - **Stars (High Margin, Low Friction)**: Fast approvals, clear briefs, prompt payments. Prioritize roadmap, explore expansion upsells.
   - **Workhorses (High Margin, High Friction)**: Profitable but exhausting. Enforce strict single-point-of-contact Slack boundaries.
   - **Vulnerable (Low Margin, Low Friction)**: Friendly but underpriced. Implement 15–20% rate increase at contract renewal.
   - **Drains (Low Margin, High Friction)**: Scope creepers, late payers, emergency culture. Prepare offboarding or double pricing to create natural exit.

---

## 🤖 The Client AI Compute & Token Ledger Protocol

Agentic software development introduces variable, unbudgeted LLM inference costs (e.g. running continuous Claude/Sonnet, o1, or Gemini loops). Leaving AI tokens unmetered rapidly erodes fixed-price project and retainer margins:

### 1. The Per-Client Token Attribution Rule
Every autonomous agent execution, code generation spike, or verification loop must record token consumption against the designated `client_id`:
$$\text{Project Net Margin} = \text{Billed Fee} - (\text{Contractor Costs} + \text{Internal Labor} + \text{Dedicated AI Compute})$$

### 2. Standard Model Cost Basis & Management Markup
| Model Family | Blended Rate / 1M Tokens (Input / Output) | Billable Multiplier | Rationale |
|:---|:---|:---|:---|
| **Claude 3.7 / 3.5 Sonnet** | $3.00 / $15.00 | Cost + 20% | Primary coding engine; billed directly to client compute pool. |
| **Claude 3.5 Haiku / Gemini Flash** | $0.25 / $1.25 | Absorbed in Retainer | Lightweight triage, routing, and git summarization. |
| **OpenAI o1 / Claude 3 Opus** | $15.00 / $60.00 | Cost + 25% | Deep architecture reviews, complex algorithm spikes, and security proofs. |

### 3. Compute Budget Guardrails
- **Per-Task Ceiling**: No automated agent task may consume more than $20 in inference tokens without explicit human-in-the-loop approval.
- **Client Monthly Invoicing**: Output an itemized `AI_COMPUTE_BILLING.md` attached to monthly retainer invoices, itemizing tasks executed, tokens burned, and infrastructure value delivered.

### 4. Sliding Window Token Budget & Context Window Governor Standard

Autonomous multi-agent workflows and multi-turn developer sessions can rapidly cascade into exponential token burn if prompt context bloats without pruning:

#### Mandatory Invariants:
1. **Sliding Time-Window Budget & Circuit-Breaker**:
   - AI compute expenses must be evaluated against a rolling 24-hour sliding window per client.
   - **Warning Threshold (85%)**: When rolling 24h spend reaches 85% of allocated client budget, alert the principal/account lead with a projected burn-out ETA.
   - **Hard Circuit-Breaker (100%)**: At 100% budget consumption, the agent harness trips `HALT_EXCEEDED_TOKEN_BUDGET`. Autonomous subagents are suspended immediately until explicit human re-authorization or client retainer top-up.
2. **Context Window Pruning & Compaction Invariant**:
   - Agents must monitor context utilization (e.g. `[Context: ~X% used]`).
   - In long conversations, enforce FIFO sliding window message pruning: preserve the system prompt, root instructions, and durable memory anchors (`USER.md`, `CURRENT.md`), while compacting intermediate verbose tool execution logs and scratchpad tokens before context exceeds 70%.
   - Raw tool output logs older than 3 turns must be summarized or truncated to avoid quadratic token cost spikes.

---

## Quality gate

- [ ] All direct contractor, API, and dedicated infrastructure costs assigned directly to the client ledger before calculating gross profit.
- [ ] Realized Effective Hourly Rate (EHR) compared against the $150/hr floor.
- [ ] Scope creep additions exceeding 10% routed to formal Change-Order billing.
- [ ] Unprofitable accounts (< 50% gross margin) identified with concrete remediation plan.

## Routing

- Change-order scope definition and SOW updates → `ops` (milestone mode).
- Rate increases and contract renegotiation conversations → `client-comms` / `retain`.
- Pricing tier restructuring and packaging → `growth` (pricing mode).

## Sources

- `EveryInc/charlie-cfo-skill` — Unit economics, Effective Hourly Rate realization, and margin floors.
- `indranilbanerjee/digital-marketing-pro` — Client profitability benchmarking and agency account tiering.
