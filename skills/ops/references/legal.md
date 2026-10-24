# legal — Agency Legal Operations, MSAs, Subcontractor IP & Compliance

> **Operating Principle**: Strong legal frameworks preserve client relationships, prevent payment disputes, secure clean intellectual property (IP) transfers, and insulate the agency from regulatory liabilities. All agency contracts must delineate scope boundaries, payment terms, IP vesting conditions, and AI disclosure standards.

---

## Core Agency Legal Templates & Instruments

| Agreement Type | Primary Purpose | Key Invariant |
| :--- | :--- | :--- |
| **MSA (Master Services Agreement)** | Overarching legal umbrella governing terms, payment schedule, liability caps, and termination. | IP transfers ONLY upon 100% receipt of final payment. |
| **SOW (Statement of Work)** | Sub-contract under MSA defining exact deliverables, milestones, assumptions, and acceptance windows. | Scope changes require written, signed change orders. |
| **Subcontractor IP Assignment** | Binding agreement with contractors/freelancers transferring all inventions and copyright to the agency. | Broad "work-for-hire" clause with explicit assignment fallback. |
| **Mutual NDA** | Protects pre-deal disclosures, proprietary business logic, client credentials, and financial metrics. | 2–3 year term with carve-outs for publicly known information. |
| **AI Disclosure & IP Addendum** | Clarifies the use of generative AI tools (LLMs, code generation, diffusion models) in deliverables. | Warrants that AI tools do not ingest confidential client source code. |

---

## Standard MSA Essential Clauses Architecture

### 1. Intellectual Property (IP) Vesting Clause
```markdown
Upon Client’s full and final payment of all undisputed fees set forth in the applicable Statement of Work, Agency hereby assigns to Client all right, title, and interest in and to the custom deliverables specifically developed for Client ("Work Product"). Notwithstanding the foregoing, Agency retains all rights in Agency Pre-Existing Materials, core frameworks, generic utility scripts, and developer tooling. Agency grants Client a perpetual, non-exclusive, worldwide, royalty-free license to use any Pre-Existing Materials embedded within the Work Product.
```

### 2. Client Delay & Paused Project Clause
```markdown
If Client fails to provide necessary assets, feedback, or approvals within ten (10) business days of Agency’s written request, Agency reserves the right to reallocate resources to other client engagements. Resuming work will be subject to Agency’s availability and may incur a project reactivation fee.
```

### 3. Limitation of Liability & Warranty Disclaimer
```markdown
Except for breaches of confidentiality or gross negligence, neither party's total aggregate liability arising out of or related to this Agreement shall exceed the total amount paid by Client to Agency under the specific Statement of Work giving rise to liability during the preceding six (6) months. Deliverables are provided "as-is" following formal acceptance.
```

---

## Subcontractor / Freelancer IP Assignment & Non-Solicitation

Every internal contractor or fractional specialist must execute an IP assignment prior to repo access:
1. **Perpetual IP Transfer**: All code, designs, and copy authored during the engagement are assigned immediately to the agency.
2. **Confidentiality**: Zero publication of client codebases, architectures, or designs on personal portfolios without explicit written consent.
3. **Non-Solicitation**: 12-month prohibition against directly soliciting or contracting with agency clients introduced during the engagement.

---

## Privacy & AI Regulatory Compliance (GDPR, CCPA, EU AI Act)

- **Client Privacy Policies**: Ensure websites deployed have privacy policies enumerating cookie usage, tracking pixels, analytics pipelines, and data subject access request (DSAR) handling.
- **AI Tooling Safeguards**:
  - Enforce zero-retention / API-level confidentiality (e.g. OpenAI Zero Data Retention, Anthropic Commercial Terms) for sensitive client repos.
  - Never ingest client PII, confidential database credentials, or secret keys into public model prompts.
