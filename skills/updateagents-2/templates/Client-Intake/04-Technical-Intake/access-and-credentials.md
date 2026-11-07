# Access & Credentials — {{CLIENT_BRAND_NAME}}

> **Vibeguard Zero-Leak Protocol**: this file never contains real passwords, API keys, or tokens.
> Record only account identifiers, delegation links, and access status.

## 1. Required Access

{{ACCESS_ITEMS_LIST}}

## 2. Platform Delegation

| Platform | Identifier | Role Requested | Status |
| :--- | :--- | :--- | :--- |
| Domain / DNS | {{PRIMARY_DOMAIN}} via {{DNS_PROVIDER}} | DNS management | `[Pending]` |
| Git Host | {{GIT_HOST}} | Repo member / triage | `[Pending]` |
| Payments | {{PAYMENTS}} | Developer / scoped API key | `[Pending]` |
| Integrations | {{INTEGRATIONS}} | Least-privilege service account | `[Pending]` |
| Brand Assets | {{BRAND_ASSETS}} | Read access | `[Pending]` |
| Design File | {{FIGMA_URL}} | Viewer / editor | `[Pending]` |

## 3. Delegation Rules

- Invite agency seats through official partner/team workflows; never email passwords.
- Grant least privilege: Developer, Partner, or Editor — never primary ownership.
- Enforce 2FA on every account that touches production.
- Document revocation within 48 hours of offboarding.

## 4. Environment Variables

- All secrets belong in `.env` (never committed) and are mirrored in `.env.example` with placeholders only.
- Run `bun run secret-scan` before every release.
