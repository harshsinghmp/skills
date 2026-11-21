# intake — Client Intake Pipeline: Questionnaire Ingestion, Scope Boundary Extraction, and Vault Auto-Scaffolding

Automated client intake form ingestion and onboarding synthesis. Transform unstructured client questionnaires, intake calls, and onboarding submissions into structured scope boundaries, technical briefs, and auto-scaffolded client context vaults in `.agents/vault/`.

---

## Intake Inputs

- **Client Questionnaire / Brief**: Raw form submission, Notion export, Markdown brief, or JSON payload containing client answers.
- **Client Identity**: Company name, domain slug, industry vertical, primary decision-maker, and billing contact.
- **Project Goals & Metrics**: Core business objective, target audience, and measurable success criteria (e.g., +30% leads, <1.2s page load, automated billing).
- **Technical & Brand Assets**: Existing tech stack, CMS preference, design files (Figma URL), brand guides, domain registrar, and cloud accounts.
- **Commercial Bounds**: Target delivery deadline, budget ceiling, and SLA tier.

---

## Deliverables

1. **Normalized Client Brief (`brief.md`)**:
   - Executive overview, core value proposition, target user persona, and primary conversion metrics.
2. **Bilateral Scope Boundary Matrix (`boundary.json`)**:
   - Explicit `inScope` deliverables vs `outOfScope` exclusions (Anti-Scope Fence) with change-order thresholds.
3. **Client Profile & Vault Scaffold (`profile.json`)**:
   - Structured metadata for `.agents/vault/<client-id>/` or `.agents/context/` including communications channel, SLA tier, and Council Lead assignments.
4. **48-Hour Stop-The-Clock Dependency Register**:
   - Explicit client-side prerequisites (DNS access, API tokens, brand assets, copywriting sign-off) tied to delivery timeline freeze triggers.

---

## 🔒 The 4 Intake Invariants

### 1. Zero-Jargon Intake Normalization (INT-001)
- Ingest unstructured or conversational client statements ("we want something clean and fast like Stripe") and normalize them into objective technical requirements (sub-second LCP, Tailwind/UnoCSS fluid design system, OKLCH neutral palette, minimal third-party scripts).
- Never send internal engineering jargon back to the client during onboarding.

### 2. Bilateral Scope Fencing (INT-002)
- Every intake run must emit an unambiguous Anti-Scope Fence:
  ```json
  {
    "inScope": [
      "Responsive marketing website (Mobile 390px + Desktop 1440px)",
      "Headless CMS integration (Payload 3.0 / StudioCMS)",
      "Automated lead capture form with honeypot spam protection"
    ],
    "outOfScope": [
      "Custom native mobile applications (iOS/Android)",
      "Multi-language i18n translation services",
      "Historical CRM data migration (>5,000 records)"
    ],
    "changeOrderThreshold": "Any feature requiring new API schemas or external SaaS subscriptions"
  }
  ```

### 3. Vault Auto-Scaffold Contract (INT-003)
- When invoked with `--scaffold-dir <dir>` or `--scaffold-vault`, the intake pipeline provisions:
  ```
  .agents/vault/<client-slug>/
  ├── profile.json       # Company, contacts, SLA tier, assigned leads
  ├── boundary.json      # In-scope, out-of-scope, change order policy
  ├── brief.md           # Business context, target personas, delivery milestones
  └── dependencies.md    # Required client assets, credentials, and sign-offs
  ```

### 4. 48-Hour Stop-The-Clock Protocol (INT-004)
- Onboarded clients are bound to the 48-hour dependency protocol: if a critical asset or review sign-off is pending client response for >48 hours, active milestone clocks are frozen, preventing unfair delivery penalties.

---

## 💻 CLI Integration

```bash
# Ingest raw questionnaire text or JSON file and output structured analysis
bun client-comms.ts --intake intake-form.json --json

# Ingest and auto-scaffold vault directory for client 'acme-corp'
bun client-comms.ts --intake intake-form.md --client-id acme-corp --scaffold-dir .agents/vault

# Interactive dry-run
bun client-comms.ts --intake "Company: Acme Corp. Goal: Modernize shopify store and add custom lead funnel."
```
