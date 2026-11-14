# 🛡️ Client Accounts & Asset Delegation Registry — {{PROJECT_NAME}}

> **Vibeguard Zero-Leak Protocol**: Never store passwords, API secret keys, database credentials, or private tokens in this document. 
> Only record public account IDs, organization identifiers, and access delegation links. All credentials must be granted via official partner delegation or scoped environment variables.

---

## 1. Access Delegation Status

| Platform | Asset / Account Identifier | Delegated Role | Link / Invitation Status | Verified By |
| :--- | :--- | :--- | :--- | :--- |
| **Meta Business Portfolio** | `act_[ACCOUNT_ID]` | Partner (Developer / Analyst) | `[Pending Invite / Accepted]` | `[Unverified]` |
| **Google Ads (MCC)** | `[10-DIGIT-CID]` | Standard (via Agency MCC) | `[Link Request Sent]` | `[Unverified]` |
| **Google Analytics 4** | `G-[MEASUREMENT_ID]` | Administrator / Analyst | `[Access Delegated]` | `[Unverified]` |
| **Google Tag Manager** | `GTM-[CONTAINER_ID]` | Publish / Edit | `[Container Shared]` | `[Unverified]` |
| **Google Search Console** | `sc-domain:{{DOMAIN_ROOT}}` | Full / Owner | `[DNS Record Verified]` | `[Unverified]` |
| **Cloudflare Account** | `[CLOUDFLARE_ACCOUNT_ID]` | Worker / DNS Developer | `[Account Member Added]` | `[Unverified]` |
| **Domain Registrar** | `[Registrar Name]` | DNS Management Only | `[DNS Pointed / Managed]` | `[Unverified]` |
| **Payment Gateway** | `acct_[STRIPE_ID]` | Developer Role | `[Team Member Added]` | `[Unverified]` |
| **GitHub Organization** | `{{AUTHOR_NAME}}` / Org | Member / Triage | `[Repo Access Granted]` | `[Unverified]` |

---

## 2. Onboarding Delegation Checklist

During client onboarding, the account executive and technical lead must verify each step:

- [ ] **No Plaintext Passwords Shared**: Client was guided through official invite workflows rather than emailing passwords.
- [ ] **Principle of Least Privilege**: Roles granted are scoped strictly to Developer, Partner, or Editor—never primary account ownership.
- [ ] **Two-Factor Authentication (2FA)**: Verified that all agency seats accessing client assets enforce hardware or app-based 2FA.
- [ ] **Revocation Plan**: 48-hour access revocation protocol documented for milestone completion or contract termination.
- [ ] **Telemetry & Webhooks**: Production webhook endpoints configured with signature verification secrets in `.env` (never in docs).

---

## 3. Communication & Notification Channels

- **Primary Client Channel**: `[Slack Connect / Discord / Telegram / Email]`
- **Escalation Contact**: `[Client Technical Contact Name & Email]`
- **Agency Delivery Lead**: `{{AGENT_NAME}}` (Council Orchestration)
- **Status Reporting Cadence**: Weekly automated Git evidence digests and sprint checkpoints.
