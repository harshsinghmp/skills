# browser-relay — Authenticated In-Session Browser Automation

## Scope

- Agent interaction with the user's active, logged-in Google Chrome browser via a local WebSocket relay (`127.0.0.1:18795`) and lightweight browser extension.
- Executing browser tasks without launching empty headless sandboxes or repeatedly pulling the browser window to the foreground.
- Interacting with authentication-gated environments: client SaaS consoles, Stripe/Razorpay merchant dashboards, AWS management consoles, Google Workspace SSO, and internal company staging intranets.
- Zero-credential handling: operates through the user's active cookies and existing browser state without passing raw passwords or API keys to the AI context.

## Deliverable

Automated execution scripts or CLI workflows that inspect, extract data from, or perform verified actions on authenticated browser tabs.

## When to Use Browser Relay vs Headless Automation

| Workflow Type | Recommended Tool | Rationale |
|:---|:---|:---|
| **CI/CD & Synthetic Testing** | Headless Playwright | Fresh clean slate, repeatable, no reliance on user desktop state. |
| **Public Web Scraping** | Jina Reader / `curl` | Faster, cheaper, zero browser overhead. |
| **Authenticated Client Dashboards** | **Browser Relay** | Keeps existing cookies, active 2FA/SSO, avoids captchas, zero credential storage. |
| **Background Tab Audits** | **Browser Relay** | Inspects client analytics or staging console without stealing user focus. |

## Preferred CLI Workflow

When shell execution is available, use the standard relay CLI commands:

```bash
# 1. Health check relay daemon & active extension connection
browser-relay doctor

# 2. List currently open Chrome tabs
browser-relay tabs

# 3. Take snapshot of background tab DOM
browser-relay snapshot --tab <tabId> --max-length 20000

# 4. Perform non-intrusive action on background tab
browser-relay click 'button[type=submit]' --tab <tabId>

# 5. Capture visual verification screenshot
browser-relay screenshot /tmp/dashboard-verification.png --tab <tabId>
```

## Security & Privacy Guardrails (LifeOS Vibeguard Protocol)

1. **Localhost Binding**: The relay server binds strictly to `127.0.0.1:18795`. No external public network ingress is permitted.
2. **Zero Password Ingestion**: The agent must never type or request plaintext passwords. All authentication relies on existing session cookies already held in Chrome.
3. **Redaction Gate**: Any sensitive financial figures, bank account numbers, or personal identity details extracted from pages must be masked (`[REDACTED]`) before appearing in public logs.
4. **Explicit Tab Targeting**: Always specify the exact target `--tab <tabId>` to avoid accidental interaction with the user's personal active browsing tab.

## Quality Gate

- [ ] Browser Relay verified connected via `browser-relay doctor`.
- [ ] Explicit `--tab` identifier targeted for all actions.
- [ ] Screenshots captured as proof of successful execution before asserting task completion.
- [ ] No raw passwords, auth bearer tokens, or secret cookies logged to disk.

## Routing

- Headless synthetic browser testing and Playwright test suites → `qa-launch` / `webdev`.
- Webhook integrations and API automation → `automation` (workflow mode).
- Client billing and merchant gateway reconciliation → `accounts`.
