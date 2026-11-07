# 📄 ops:contracts — Legal Document & Contract Drafting Standards

Rigorous, zero-hallucination drafting rules for statements of work (SOW), non-disclosure agreements (NDA), proposals, and master services agreements (MSA).

---

## 1. Cardinal Drafting Rules

1. **Never Invent a Fact**: Parties, legal entity names, registered addresses, fee amounts, payment milestones, project dates, SLA targets, and governing law must be explicitly provided by the brief or left explicitly marked as `[NEEDS: …]`. Never fabricate details to make a draft look "finished".
2. **The Mandatory Legal Review Header**:
   Every draft contract or binding legal agreement MUST display this line verbatim at the very top:
   > **"This is a draft, not legal advice. Review it with a qualified legal professional before sending or signing."**
3. **Flag, Do Not Bury**: If standard boilerplate clauses are introduced that the brief did not mention (e.g. indemnity, liability caps, non-compete, exclusivity, auto-renewal, liquidated damages), explicitly call them out in an executive callout so a human can consciously decide.
4. **Label Everything a DRAFT**: All proposals, SOWs, and contracts must carry a prominent `DRAFT — v[X] — [DATE]` header until signed.

---

## 2. Statement of Work (SOW) Standard

A legally enforceable delivery schedule attached to an MSA or executed as a standalone agreement:

### Mandatory Sections:
1. **Parties & Master Agreement Reference**: Legal business names, entity types (LLC, Inc, Ltd), jurisdiction, and parent MSA date (if applicable).
2. **Background & Strategic Objective**: One paragraph stating the business problem in the client's words.
3. **In-Scope Deliverables**: Bulleted, numbered list of concrete, verifiable artifacts (e.g., "Complete Figma design system tokens", "Production Next.js application deployed to Vercel").
4. **Explicit Out-of-Scope**: Non-negotiable boundary listing what is NOT included (e.g., "Custom native mobile apps", "Third-party API subscription costs", "Content translation beyond English").
5. **Milestone Schedule & Timeline**: Table with Milestone Name, Deliverable Description, Target Date, and Dependencies.
6. **Commercial Terms & Payment Triggers**: Fee structure (Fixed fee or T&M), deposit requirement (e.g. 50% upfront), milestone release criteria, invoice payment terms (Net 15 / Net 30).
7. **Acceptance & Sign-off Criteria**: Explicit review window (typically 5–10 business days); deemed acceptance if feedback is not received in writing within window.
8. **Change-Control Protocol**: Any requested scope change requires a formal written Change Order (specifying budget and timeline impact) approved by both parties.
9. **Signatures**: Execution blocks with printed names, titles, and dates.

---

## 3. Non-Disclosure Agreement (NDA) Standard

- **One-Way vs. Mutual**: Default to Mutual (bilateral) for agency partnerships; One-Way only if explicitly instructed.
- **Definition of Confidential Information**: Includes source code, customer lists, financial data, product roadmaps, and unreleased designs; excludes information that is already public, independently developed without access, or lawfully received from a third party.
- **Permitted Purpose**: Explicitly constrain information usage solely to evaluating or executing the engagement.
- **Survival Term**: Typically 2 to 3 years from disclosure date; trade secrets survive indefinitely.
- **Return or Destruction**: Obligation to destroy or return materials upon written request within 14 days.

---

## 4. Proposal Standard

Proposals are sales pitches, not binding contracts. Still labeled DRAFT:
1. **Client's Problem**: Synthesized directly from intake interviews.
2. **Strategic Approach & Recommendation**: The solution hypothesis and why it wins.
3. **Deliverables & Phases**: Phase 1 (Discovery & Architecture), Phase 2 (Build & Integration), Phase 3 (QA & Launch).
4. **Investment Options**: 2–3 tiered options (e.g. Core Build, Growth Accelerator, Enterprise Scale).
5. **Quote Validity**: Explicit expiration date (e.g. "Pricing valid for 30 calendar days").
