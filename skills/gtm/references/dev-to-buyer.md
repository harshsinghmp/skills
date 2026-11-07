# dev-to-buyer — Developer champion enablement & enterprise conversion

> Turn bottom-up developer love, open-source adoption, and free-tier usage into paid enterprise contracts. Arms the internal developer champion with executive ROI, compliance, and business packets to close the economic buyer.

---

## Intake

- Target account with existing developer adoption (free-tier accounts, GitHub stars, active CLI users, community members).
- Identified Champion (staff engineer, tech lead, DevOps practitioner using the tool).
- Identified Economic Buyer (VP Engineering, CTO, Head of Infrastructure, CISO).
- Pricing tiers and enterprise governance differentiators (SSO, audit logs, SLAs, dedicated infrastructure, compliance).

---

## Deliverable

The **Internal Champion Enablement Packet**:
1. **1-Page Executive Business Case**: Plain-English business ROI, hours saved, and risk reduction for the VP/CTO.
2. **Security & InfoSec Fact Sheet**: Architecture diagram, data storage boundaries, compliance certifications (SOC2, HIPAA, GDPR), and RBAC/SSO support.
3. **Total Cost of Ownership (TCO) Calculator**: Build-vs-buy analysis showing maintenance cost of home-grown solutions vs. licensed tool.
4. **Draft Procurement & PO Email**: A copy-paste email the champion can send directly to their manager.

---

## Procedure

### 1. Map the Account Triad
In every developer-tool or technical B2B sale, three distinct roles exist:
1. **The Champion (Developer / Architect)**: Loves the tool, feels the daily pain, but usually lacks credit card limit or budget approval authority.
2. **The Economic Buyer (VP / Director / CTO)**: Holds the budget, cares about engineering velocity, headcount efficiency, risk reduction, and uptime.
3. **The Blocker (InfoSec / Legal / Procurement)**: Ensures compliance, vendor risk assessment, data privacy, and contract terms.

### 2. Protect the Champion's Political Capital
- Never ask the developer champion to "sell" for you.
- Equip them with objective technical and business facts so advocating for the product elevates their standing inside the engineering org.
- Give the champion a concise 1-page briefing they can share in Slack or review in their weekly 1:1.

### 3. Build the TCO Build-vs-Buy Framework
When the economic buyer says *"we can just have two junior engineers build this internally"*:
- Detail the hidden ongoing maintenance costs:
  - Initial build time: 3–6 months (salary allocation: ~$150k+).
  - Ongoing maintenance: 20% engineering overhead annually (security patches, breaking upstream API changes, documentation, on-call support).
  - Opportunity cost: Engineering hours diverted from core customer-facing revenue products.
- Frame the tool not as an expense, but as buying back 500+ engineering hours.

### 4. Provide the Internal Champion Email Template
Provide a tailored email template:
```text
Subject: Proposal to standardize on [Product] for [Specific Team Function]

Hey [Manager Name],

Our team has been using [Product] on our [Project/Repo] for the past [X weeks] to handle [Problem]. 

It has cut our [specific metric: e.g., deploy time / debugging hours / incident triage] from [X] to [Y], saving roughly [Z hours/week] across our engineers.

To roll this out across the entire department and meet our compliance standards, we need their Team/Enterprise tier (which includes SAML SSO, audit logging, and dedicated SLA). 

Their pricing is [$X/month or $X/year], which is significantly less than the engineering cost of maintaining our internal scripts. I've attached their 1-page security sheet and business case. Can we put this on next week's procurement cycle?
```

### 5. Transition to the Closing Motion
- Once the champion initiates the internal thread, offer to jump on a joint 20-minute call with the Economic Buyer to answer technical architecture, security, and onboarding questions.
- Route to `gtm:founder-sales` for call execution.

---

## Quality gate

- [ ] Champion identified with confirmed daily/weekly active usage.
- [ ] Economic buyer identified with name, title, and budget ownership.
- [ ] 1-page executive summary contains hard metrics (hours saved, risk mitigation, dollar ROI).
- [ ] Security and compliance boundaries explicitly stated (zero unvetted data flow).
- [ ] Champion provided with complete, zero-friction copy-paste template.

---

## Routing

- Researching company hierarchy and economic buyer titles → `gtm:research`.
- Pricing packaging and tier structure → `growth:pricing`.
- Running the executive sales call with the VP/CTO → `gtm:founder-sales`.
- Handing off executed contract to post-sales onboarding → `gtm:handover` / `ops:onboarding`.

---

## Sources

- Jakub Czakon, *markepear.dev* ("Market to developers, sell to decision-makers").
- Adam Frankl, *The Developer-Facing Startup* (Net Developer Retention & Developer Champion Dynamics).
