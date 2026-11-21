# client-onboarding — New-Project Client Onboarding Reference

> Loaded when `new-project` is invoked with `client-onboarding`, `--onboard-client`, `--intake`, or any `--client-*` flag.
> Purpose: capture real client answers so the scaffold, `Client-Intake/` templates, `.agents/brand/`, and `start-here.md` update in tandem instead of leaving generic placeholders.

---

## 1. When Onboarding Runs

| Invocation | Behavior |
| :--- | :--- |
| Interactive run, no `--skip-client-onboarding` | Asks "Run the full client onboarding interview now?" (default `yes`), then walks the five sections |
| `--onboard-client` | Runs the five sections without the confirmation prompt |
| `--intake <json|md>` | Pre-fills from the file; flags override; missing values stay marked |
| Any individual `--client-*` / onboarding flag | Enables onboarding in non-interactive mode and renders docs from the provided answers |
| `--skip-client-onboarding` | Writes only `00-Intake-Brief.md`; docs are left for a later agent pass |
| No onboarding signal | Legacy behavior: brief only, no generated docs, no `start-here.md` |

Precedence: **CLI flags** > **`--intake` file** > **scaffold answers** > **empty marker**.

---

## 2. Five-Section Interview Order

### Section 1 — Identity & Contacts
1. Legal entity / company name
2. Public brand / trade name
3. Client slug (default: slugged brand)
4. Day-to-day contact name
5. Contact role
6. Contact email
7. Final approval stakeholder (decision maker)
8. Client technical lead

### Section 2 — Business & Market
1. **Business model**: `b2b-saas` | `b2c-ecommerce` | `agency-service` | `marketplace` | `media-publisher` | `nonprofit` | `local-business` | `enterprise` | `custom`
2. **Company stage**: `idea` | `bootstrapped` | `seed` | `series-a` | `growth` | `enterprise` | `established`
3. **Revenue band**: `pre-revenue` | `<100k` | `100k-1m` | `1m-10m` | `10m-100m` | `100m+`
4. Industry / market vertical
5. Mission (what the client does every day)
6. Vision (10-year north star)
7. Target customer / ICP
8. Core problem solved
9. Top competitors (comma-separated)
10. Top customer objections (comma-separated)
11. Single launch-success metric (North Star KPI)

### Section 3 — Offerings & Scope
1. Offerings / products / packages (comma-separated, keep client naming)
2. Explicitly OUT of scope (comma-separated negative scope)

### Section 4 — Engagement & Commercial
1. **Engagement type**: `fixed-scope` | `retainer` | `time-materials` | `productized-sku` | `internal` | `oss`
2. **SLA tier**: `standard` | `priority` | `enterprise` | `none`
3. Budget band / commercial ceiling
4. Kickoff date (`YYYY-MM-DD`)
5. Hard delivery deadline (`YYYY-MM-DD`)
6. **Primary communication channel**: `slack` | `email` | `telegram` | `whatsapp` | `weekly-call` | `other`
7. **Reporting cadence**: `daily` | `weekly` | `biweekly` | `monthly` | `milestone`

### Section 5 — Technical Access & Integrations
1. Primary production domain
2. **DNS provider**: `cloudflare` | `route53` | `namecheap` | `godaddy` | `vercel` | `other`
3. **Git host**: `github` | `gitlab` | `bitbucket` | `self-hosted` | `none`
4. **Payment rails** (multi-select): `stripe` | `razorpay` | `paypal` | `cashfree` | `lemonsqueezy` | `paddle` | `square` | `none`
5. **Integrations** (multi-select): `hubspot` | `salesforce` | `mailchimp` | `resend` | `postmark` | `segment` | `ga4` | `plausible` | `mixpanel` | `sentry` | `intercom` | `zendesk` | `slack` | `notion` | `airtable` + free-text extras
6. Brand assets location (drive/folder/URL)
7. Figma / design file URL
8. **Access items required** (multi-select): domain/DNS, git org, hosting/cloud, payment gateway, CMS/admin, analytics, ad accounts, email sender, brand asset folder, Figma, database/API credentials

---

## 3. JSON Intake Shape

`--intake=/path/to/client.json`. Keys are normalized (case and punctuation ignored), so camelCase, snake_case, and kebab-case all work.

```json
{
  "clientName": "Acme Health LLC",
  "brandName": "Acme Health",
  "slug": "acme-health",
  "contactName": "Dana Lee",
  "contactRole": "COO",
  "contactEmail": "dana@acme.health",
  "decisionMaker": "Dana Lee",
  "techLead": "Sam Patel",
  "businessModel": "b2b-saas",
  "companyStage": "seed",
  "revenueBand": "1m-10m",
  "industry": "Healthcare",
  "mission": "Streamline patient intake",
  "vision": "Every clinic paperless",
  "icp": "Regional clinics",
  "coreProblem": "Manual paper intake",
  "competitors": ["Epic", "Cerner"],
  "objections": ["Price", "Migration effort"],
  "offerings": ["Intake Suite", "EHR Sync"],
  "launchGoal": "50 clinics onboarded",
  "boundaries": ["Native mobile app", "Multi-language"],
  "domain": "acme.health",
  "dnsProvider": "cloudflare",
  "gitHost": "github",
  "payments": ["stripe"],
  "integrations": ["hubspot", "segment"],
  "brandAssets": "Drive:/Acme/Brand",
  "figma": "https://figma.com/file/…",
  "slaTier": "priority",
  "engagement": "fixed-scope",
  "commsChannel": "slack",
  "commsCadence": "weekly",
  "kickoffDate": "2026-11-10",
  "deadline": "2027-02-01",
  "budget": "USD 40k",
  "accessItems": ["DNS", "GitHub org", "Stripe account"]
}
```

Markdown intake works too: any `- **Label**: value` line is parsed with label aliases (`Organization`, `Industry / Vertical`, `Target Audience`, `Core Problem Solved`, `Brand Voice`, `OKLCH Palette`, `Offerings`, `Competitors`, `Boundaries`, `Primary Domain`, `Launch Goal`, …).

---

## 4. Output Map

| Output | When | Source |
| :--- | :--- | :--- |
| `Client-Intake/00-Intake-Brief.md` | Always | Brief template + token map |
| `Client-Intake/01-Brand/brand-identity.md` | Onboarding enabled | `client-identity` template |
| `Client-Intake/01-Brand/visual-direction.md` | Onboarding enabled | palette + assets + Figma |
| `Client-Intake/01-Brand/voice-and-tone.md` | Onboarding enabled | brand voice + problem |
| `Client-Intake/02-Business/business-model.md` | Onboarding enabled | model, stage, revenue, terms |
| `Client-Intake/02-Business/audience-persona.md` | Onboarding enabled | ICP, objections, exclusions |
| `Client-Intake/03-Offerings/offerings-catalog.md` | Onboarding enabled | offerings + budget |
| `Client-Intake/03-Offerings/scope-deliverables.md` | Onboarding enabled | stack + boundaries + KPI |
| `Client-Intake/04-Technical-Intake/access-and-credentials.md` | Onboarding enabled | access, DNS, git, payments |
| `Client-Intake/04-Technical-Intake/integrations-matrix.md` | Onboarding enabled | integrations + stack |
| `start-here.md` | Onboarding enabled | client facts + actual scaffold |
| `.agents/brand/{voice,personas,positioning,messaging,visual-identity,social-hooks}.md` | Onboarding enabled | `brand/scripts/intake-compiler.ts` |
| `.agents/context/product.md`, `.agents/context/accounts.md` | Onboarding enabled | intake compiler sync |

Missing answers render as `_(to confirm with client)_`; the engine never invents client identity, proof claims, or access details.

---

## 5. Discipline & Completion

1. **One question at a time.** Each field is pre-filled; Enter accepts the verified default.
2. **Client naming is immutable.** Offerings keep the client's own names unless the client approves a rename.
3. **No invented filler.** Unknowns stay marked. Values the client gave are copied verbatim.
4. **No secrets.** Access docs record platform identifiers and delegation status only; credentials live in `.env` / a vault.
5. **Explicit completion.** Interactive runs end at `VERIFIED_COMPLETE`; flag/file runs end at `IN_PROGRESS` until the client confirms the brief.
6. **Idempotent re-runs.** Passing the same flags or intake file refreshes the brief and docs; unrelated scaffold files are not rewritten unless `--force`.

## 6. Quality Gate

- [ ] Legal entity, brand, and decision maker captured.
- [ ] Business model, stage, revenue band, and launch KPI captured.
- [ ] ICP, core problem, competitors, and objections captured.
- [ ] Offerings and explicit out-of-scope items captured.
- [ ] Engagement type, SLA, budget, dates, channel, and cadence captured.
- [ ] Domain, DNS, git host, payments, integrations, and access items captured.
- [ ] Every generated doc cites only real answers; unknowns marked.
- [ ] `start-here.md` matches the scaffolded stack, not the generic template.
- [ ] `.agents/brand/` and `.agents/context/` compiled from the brief.
