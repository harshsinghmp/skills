# Integrations Matrix — {{CLIENT_BRAND_NAME}}

## 1. Scaffolded Stack

{{STACK_DETAILS}}

## 2. Client Systems In Use

### Third-Party Integrations
{{INTEGRATIONS_LIST}}

### Payment Rails
{{PAYMENTS_LIST}}

## 3. Integration Register

| System | Purpose | Auth Method | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| _From lists above_ | _To confirm_ | API key / OAuth / webhook | _To confirm_ | `[Unverified]` |

## 4. Webhooks & Events

- Every inbound webhook requires signature verification.
- Secrets stay in `.env`; never hardcode them in route handlers.
- Log failures to the project's observability surface.

## 5. Open Technical Questions

- _To confirm: analytics, CRM, email, support desk, and any legacy migration scope._
