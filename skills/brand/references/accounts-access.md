# 🔐 brand:accounts-access — Client Credentials & Logins Intake Workflow

> **Operating Principle**: Zero-secret leakage is non-negotiable across the entire agency ecosystem. Never accept, request, or store plaintext passwords, database root credentials, or private API keys in chat or public documents. Always enforce role-based, platform-native delegation (Partner Access, Manager Accounts, and IAM roles) with least-privilege permissions. Where direct logins are unavoidable, enforce 1Password/Bitwarden encrypted share links with temporary session handshakes.

---

## The 5-Stage Credential & Login Intake Workflow

```
[ STAGE 1: DISCOVERY & ACCESS MATRIX ]
Identify all required platforms from scope (Ads, Analytics, CMS, Hosting, Payments)
               │
               ▼
[ STAGE 2: CLIENT DISPATCH (COPY-PASTE INSTRUCTIONS) ]
Send non-technical client exact vendor delegation steps with agency IDs pre-filled
               │
               ▼
[ STAGE 3: 2FA & SESSION HANDSHAKE ]
Coordinate 10-minute live session for MFA/SMS codes or dedicated agency seat provisioning
               │
               ▼
[ STAGE 4: LEAST-PRIVILEGE AUDIT & TEST PING ]
Run silent read/write ping (API / CLI / UI) verifying access WITHOUT billing/owner rights
               │
               ▼
[ STAGE 5: VAULT ENCLAVE & ACCESS LEDGER ]
Record active delegation in `.agents/context/accounts-access-matrix.md` with expiry
```

---

### Stage 1: Credential Discovery & Access Architecture

Before contacting the client, determine the required platform tier and access model:

| Tier | Category | Preferred Access Model | Fallback Model |
|:---|:---|:---|:---|
| **Tier A** | Paid Ads (Meta, Google, TikTok, LinkedIn) | Platform-Native Partner / MCC Link | Direct login via Password Manager Share |
| **Tier B** | Analytics & Tagging (GA4, GTM, Clarity) | Property User Invitation (Editor) | Container Export / Shared GTM |
| **Tier C** | Hosting & Cloud (Cloudflare, Vercel, AWS) | Scoped Member Invitation (DNS/Deployer) | Temporary SSH Key / Deploy Hook |
| **Tier D** | CMS & E-Commerce (Shopify, WordPress) | Collaborator Account / Staff Seat | 1Password Shared Vault Login |
| **Tier E** | Payment Gateways (Stripe, Razorpay) | Developer / Analyst Invite (NEVER Owner) | Restricted Read/Webhook API Key |

---

## Zero-Credential Leak Delegation Standard

Never accept, request, or store plaintext passwords, database root credentials, or private API keys in chat or public documents.

### Stage 2: Step-by-Step Client Dispatch

Send the client's non-technical administrator exact, foolproof delegation steps:

#### 1. Meta Ads & Business Portfolio
- **Mechanism**: Partner Access via Meta Business Suite.
- **Client Action**: Go to `Business Settings > Users > Partners > Add Partner`.
- **Agency Partner Business ID**: `[AGENCY_BUSINESS_ID]`
- **Required Assets**: Ad Account (`Manage Campaigns`), Facebook Page (`Create Content`), Instagram Account, Pixel/Dataset (`Manage Dataset`).

#### 2. Google Ads & Google Marketing Platform
- **Mechanism**: Manager Account (MCC) Link Request.
- **Client Action**: Share their 10-digit Google Ads Customer ID (`XXX-XXX-XXXX`).
- **Agency Action**: Send link request from Agency MCC.
- **Client Confirmation**: Client navigates to `Tools & Settings > Access and Security > Managers > Accept`.

#### 3. Google Tag Manager (GTM) & Google Analytics 4 (GA4)
- **Google Tag Manager (GTM) Client Action**: `Admin > User Management > Add Users`. Add agency email as `Administrator` at Container level (required to publish tags).
- **Google Analytics 4 (GA4) Client Action**: `Admin > Property Access Management > Add Users` as `Editor`.

#### 4. Shopify & E-Commerce
- **Mechanism**: Shopify Collaborator Request.
- **Agency Action**: Send collaborator request via Shopify Partner Dashboard.
- **Client Action**: If collaborator code is enabled, client shares 4-digit code and clicks `Settings > Users and Permissions > Collaborators > Accept`.

#### 5. WordPress / Custom CMS
- **Mechanism**: Dedicated Staff Admin Seat.
- **Client Action**: Navigate to `Users > Add New`. Create dedicated seat `agency@clientdomain.com` with `Administrator` or `Editor` role. Send temporary password via 1Password / Bitwarden share link.

#### 6. Hosting & Cloudflare
- **Cloudflare Action**: `Manage Account > Members > Invite Member`. Roles: *DNS Administrator* + *Cloudflare Pages Administrator* (Never Super Administrator).
- **Vercel Action**: `Team Settings > Members > Invite` with `Member` role.

#### 7. Stripe / Payment Gateways
- **Client Action**: `Settings > Team and Security > Team > + New Member`.
- **Assigned Role**: `Developer` (to configure webhooks and test API keys) or `Analyst`. **STRICT PROHIBITION**: NEVER `Administrator` or `Owner`.

---

### Stage 3: 2FA & Session Handshake Protocol

When direct logins or 2FA codes are required:
1. **Dedicated Account Rule**: Never use the founder's personal Gmail or phone number. Require a dedicated seat (`agency@clientdomain.com` or alias).
2. **Coordinated Handshake Window**: Schedule a 10-minute Slack/WhatsApp sync window for immediate entry of one-time SMS or TOTP passcodes during initial setup.
3. **Authenticator Transfer**: Where supported, guide the client to export a secondary TOTP QR code directly into the agency's secure 1Password shared team vault.

---

### Stage 4: Least-Privilege Permission Audit & Test Ping

Immediately after receiving access, verify functionality without escalating privilege:

```bash
# 1. Test Git repository clone
git clone git@github.com:client-org/client-repo.git /tmp/test-client-repo

# 2. Test DNS / Cloudflare API token
curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer [REDACTED]"

# 3. Test Google Ads MCC link (via gads CLI / read-only query)
# Verify account status is ACTIVE and currency/timezone match scope
```

---

### Stage 5: Vault Enclave & Access Verification Matrix

Every received access must be committed to the internal evidence ledger at:
`.agents/context/accounts-access-matrix.md`

#### Ledger Schema:
| Asset / Platform | Account Identifier | Delegation Type | Access Level | Verified Date | Offboarding Review Date | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **Meta Business Portfolio** | `act_987654321` | Partner Share | Campaign Manager | YYYY-MM-DD | YYYY-MM-DD | `ACTIVE_VERIFIED` |
| **Google Ads** | `123-456-7890` | MCC Link | Standard Access | YYYY-MM-DD | YYYY-MM-DD | `ACTIVE_VERIFIED` |
| **Google Tag Manager** | `GTM-ABC1234` | Container Invite | Administrator | YYYY-MM-DD | YYYY-MM-DD | `ACTIVE_VERIFIED` |
| **Shopify Store** | `client-store.myshopify.com`| Collaborator | Themes + Products | YYYY-MM-DD | YYYY-MM-DD | `ACTIVE_VERIFIED` |
| **Stripe** | `acct_1A2B3C4D` | Team Member | Developer | YYYY-MM-DD | YYYY-MM-DD | `ACTIVE_VERIFIED` |

---

## Quality Gate Checklist

- [ ] **Zero Credential Exposure**: No plaintext passwords or API keys stored in Slack, git, markdown, or chat.
- [ ] **Least Privilege Enforced**: No root/owner/billing access accepted where developer/partner roles suffice.
- [ ] **Dedicated Agency Seat**: Avoided using client founder personal logins.
- [ ] **Active Ping Verified**: Every platform tested with a real API or read-only CLI probe.
- [ ] **Access Matrix Documented**: Entry written to `.agents/context/accounts-access-matrix.md`.
