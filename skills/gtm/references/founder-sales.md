# founder-sales — Founder-led technical sales & objection handling

> Coach and execute technical sales conversations: discovery qualification, pain-specific demos, overcoming "we'll think about it," and closing the first 10 paying customers.

---

## Intake

- Target lead / prospect attending a scheduled demo or discovery call.
- `./.agents/context/product.md`: Pricing tiers, core problem, status quo, and strongest proof point.
- Call objective: Qualify fit, demonstrate solution to their specific bottleneck, agree on next milestone.

---

## Deliverable

1. **30-Minute Call Blueprint**: Time-boxed agenda (Diagnosis → Solution Demo → Commercial Alignment → Next Steps).
2. **Objection Response Battlecard**: Concrete counters for top developer objections (*"We can build it," "Let me think about it," "Is it just an AI wrapper?"*).
3. **Mutual Action Plan (MAP)**: A lightweight milestone document tracking pilot verification, security review, and contract execution dates.

---

## Procedure

### 1. The 30-Minute Technical Sales Structure
- **00–10 min: Diagnostic Discovery (Never Pitch First)**:
  - *"Before showing the product, I want to make sure this is actually relevant to how your team works. What prompted you to set up this call today?"*
  - *"How does your team currently handle [Problem]? What breaks when volume scales?"*
  - *"Who else on the team is feeling this bottleneck right now?"*
- **10–20 min: The Surgical Demo (Solve Their One Problem)**:
  - **Golden Rule**: Never give a generic "feature tour" or show every tab in the UI.
  - Open directly to the screen that solves the exact problem they stated in minutes 0–10.
  - Show the outcome in < 3 minutes. Stop, check in: *"Does this match how your team would expect this to work?"*
- **20–25 min: Commercial Qualification**:
  - *"If this works in your staging environment as seen today, what is the process on your side to get budget approved and roll it out?"*
  - *"Who else needs to review the architecture or security before sign-off?"*
- **25–30 min: Locking the Next Step (Never Leave Vague)**:
  - Never accept: *"Send me an email and I'll think about it."*
  - Always book the next calendar step live on the call: *"Let's schedule 20 minutes next Thursday to review your staging test results. Does 2pm work?"*

### 2. Overcoming the Top 4 Technical Sales Stalls

| Objection | What They Really Mean | The Exact Counter Script |
| :--- | :--- | :--- |
| **"We can build this ourselves in a weekend."** | "I haven't considered the ongoing maintenance and edge-case burden." | *"You absolutely could build an initial prototype in a weekend. Most of our customers did. They switched to us when their senior engineers spent 15 hours a month maintaining upstream API breaks and edge-case bug fixes instead of core product. What is your team's current backlog priority?"* |
| **"Let me think about it / Send me an email."** | "You didn't uncover a painful enough problem, or I don't know how to evaluate this." | *"Totally fair. Usually when folks say that, it means either this isn't a top-3 priority right now, or something about our approach didn't feel like a fit. Which one is it for your team?"* |
| **"Isn't this just an AI wrapper?"** | "I'm worried foundation model upgrades will make this obsolete in 6 months." | *"If this was just prompt engineering over an LLM API, you shouldn't pay us. What you're paying for is our sandboxed execution pipeline, our deterministic verification harness, and our fine-tuned evaluation benchmarks that stop hallucinations in production."* |
| **"Your price is too high."** | "I haven't tied the price to quantifiable ROI or risk reduction." | *"Understood. Compared to what benchmark does it feel high? If this saves your team 10 hours a week across 5 engineers, that's ~$4,000 in saved engineering capacity for a $500 tool. Where is the gap in that math for your team?"* |

### 3. Deploying the Mutual Action Plan (MAP)
For any mid-market or enterprise deal requiring a pilot:
- Provide a simple 4-step timeline:
  1. Day 1–3: Sandbox/Staging setup & API key integration.
  2. Day 7: Check-in on initial workflow execution & latency verification.
  3. Day 10: Security & compliance sign-off.
  4. Day 14: Commercial agreement & production launch.

---

## Quality gate

- [ ] Diagnostic discovery executed before showing any product UI or demo.
- [ ] Demo customized specifically to prospect's stated bottleneck (< 10 min).
- [ ] Next calendar step booked on the call; zero vague "let me think about it" deferrals.
- [ ] Pricing stated clearly without unprompted discounts or hesitation.
- [ ] Mutual Action Plan (MAP) sent within 2 hours of call conclusion.

---

## Routing

- Arming internal developer champions prior to sales calls → `gtm:dev-to-buyer`.
- Objection handling playbook customization → `sales-enablement:objection`.
- SOW and contract formalization → `ops:contracts` / `ops:sow`.
- Client onboarding post-sale → `ops:onboarding`.

---

## Sources

- Shane O'Connor, *The DevTool GTM Company* (Founder-Led Sales & Objection Handling).
- Pete Kazanjy, *Founding Sales* (Early-stage technical founder sales execution).
