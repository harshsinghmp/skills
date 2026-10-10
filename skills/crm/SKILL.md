---
name: crm
aliases: ["flows", "customer-flows", "lifecycle-flows", "email-flows", "retention-flows", "customer-journeys"]
description: "Customer relationship management and event-driven marketing flow engine: audience segmentation, RFM scoring, welcome and activation onboarding drips, cart and checkout recovery flows, lead nurture journeys, churn winback sequences, bulk deliverability infrastructure (SPF, DKIM, DMARC, BIMI, warming curves), and transactional SMS triggers — routed through seven modes. Use when managing client customer databases, building automated email/SMS flows in Klaviyo, Customer.io, Resend, or Postmark, rescuing abandoned carts, setting up DNS deliverability records, or segmenting user cohorts. Not for writing standalone editorial blog content (content) or agency-to-client retention QBRs (retain)."
argument-hint: "[onboard|abandon|nurture|winback|deliverability|sms|contacts]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 47
  aliases: ["flows", "customer-flows", "lifecycle-flows", "email-flows", "retention-flows", "customer-journeys"]
  suggested_skills: ["content", "webdev", "brand", "analytics", "growth", "accounts"]
  hermes:
    tags: ["crm", "flows", "email", "sms", "lifecycle", "customer-journey", "klaviyo", "resend", "customer-io", "deliverability", "abandoned-cart", "drip-campaign", "onboarding", "winback", "segmentation"]
    related_skills: ["content", "webdev", "brand", "analytics", "growth", "accounts"]
    suggested_skills: ["content", "webdev", "brand", "analytics", "growth", "accounts"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["content", "webdev", "brand", "analytics", "growth", "accounts"]
    primary_triggers: ["manage crm", "build flow", "welcome sequence", "abandoned cart flow", "email flows", "customer journeys", "deliverability audit", "spf dkim setup", "sms triggers", "audience segmentation"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📬 crm — Customer Relationship & Event-Driven Marketing Flows

One unified department for client customer management and automated behavioral flows. Unifies the customer database (contacts, properties, RFM tiers, segments) with automated event-driven journeys (welcome onboarding, abandoned cart rescue, educational nurture, churn win-back, DNS deliverability infrastructure, and SMS notifications). Governed jointly by **Sol** (event triggers, webhook payloads, deliverability DNS) and **Jasper** (journey pacing, sequence psychology, high-converting copy).

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **onboard** | "welcome flow", "onboarding drip", "signup sequence", "activation flow" | Welcome sequence, product activation milestones, and new user onboarding drips | [references/onboard.md](references/onboard.md) |
| **abandon** | "abandoned cart", "browse abandonment", "checkout rescue", "trial expiry flow" | High-urgency cart recovery, browse abandonment, and expiring trial checkout rescue | [references/abandon.md](references/abandon.md) |
| **nurture** | "nurture sequence", "lead magnet drip", "educational sequence", "value drip" | Multi-part educational nurture campaigns and product-led value delivery | [references/nurture.md](references/nurture.md) |
| **winback** | "winback flow", "re-engagement", "churn recovery", "sunset unengaged" | Behavioral churn prevention, dormant re-engagement offers, and sunset cleanups | [references/winback.md](references/winback.md) |
| **deliverability** | "deliverability audit", "spf dkim setup", "dmarc policy", "domain warming", "spam score" | Bulk sender DNS authentication, IP/domain warming curves, and bounce webhooks | [references/deliverability.md](references/deliverability.md) |
| **sms** | "sms marketing", "whatsapp notifications", "sms triggers", "text broadcast" | Transactional order alerts and high-conversion broadcast SMS/WhatsApp campaigns | [references/sms.md](references/sms.md) |
| **contacts** | "customer segments", "rfm scoring", "custom properties", "list hygiene" | Audience segmentation, RFM customer tiers, custom properties, and list cleaning | [references/contacts.md](references/contacts.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Building automated email or SMS flows in Klaviyo, Resend, Customer.io, Postmark, or HubSpot.
- Setting up abandoned cart, browse abandonment, and checkout recovery funnels.
- Configuring SPF, DKIM, DMARC, and BIMI DNS records to guarantee inbox placement.
- Creating onboarding and product activation drip sequences.
- Segmenting customers into high-value VIPs, recent buyers, and at-risk churn cohorts.
- Implementing behavioral webhook events between the application database and ESP.

---

## Quick Reference

| Mode | Primary Input | Primary Output | Gate / SLA |
|:---|:---|:---|:---|
| `onboard` | Signup event, activation milestones | 5–7 send onboarding sequence w/ triggers & CTAs | 1 action per send |
| `abandon` | Cart/Checkout abandonment event | 3-part recovery sequence (1h, 24h, 48h) w/ incentives | Zero fake discounts |
| `nurture` | Lead magnet opt-in, trial start | 5-part educational value journey (String of Pearls) | 100% evidentiary |
| `winback` | Inactivity trigger (30d/60d/90d) | 3-touch re-engagement offer + sunset clean rule | Unsub honored instant |
| `deliverability` | Sending domain, DNS host, ESP | DNS records (SPF, DKIM, DMARC) + warming schedule | `dig TXT` verified |
| `sms` | Opt-in consent, transactional trigger | SMS message body, compliance footer, webhook hook | TCPA compliant |
| `contacts` | Customer database export, purchase logs | Segment criteria, RFM matrix, custom properties | Zero plain PII leak |

---

## Procedure

1. **Context Discovery**: Read `.agents/brand/voice.md` for tone, `.agents/brand/messaging.md` for core claims, and `.agents/context/accounts.md` for ESP delegation access IDs.
2. **Architecture & Deliverability (`deliverability`)**: Verify domain DNS records (`dig TXT` on SPF, DKIM, DMARC) and ensure purpose-split subdomains (`t.` for transactional, `m.` for marketing).
3. **Segmentation & RFM Modeling (`contacts`)**: Define dynamic customer cohorts based on Recency, Frequency, and Monetary metrics before drafting messages.
4. **Flow Trigger Engineering**: Map entry triggers, conditional delay intervals, filter criteria, and exit conditions.
5. **Message Copycraft**: Shape each send around one single clear action, 18-token standalone quotable value points, and anti-puffery standards.
6. **Verification & Launch**: Test webhooks with synthetic payloads, verify mobile rendering across email clients, and confirm unsubscribe compliance.

---

## Pitfalls

- **Mixing Transactional and Marketing Mail**: Never send bulk marketing emails from the primary root domain without a dedicated sending subdomain (`m.domain.com`).
- **Missing Domain DNS Authentication**: Sending without SPF, DKIM, and DMARC will cause Gmail, Yahoo, and Microsoft to reject or junk messages.
- **Ignoring TCPA / GDPR Consent**: Never trigger SMS or promotional emails without explicit, verifiable opt-in consent and one-click opt-out.
- **Vague, Multi-Action Messages**: Every email in an automated flow must have exactly ONE job. Multiple competing buttons destroy conversion rates.

---

## Verification

- [ ] All 7 mode reference files exist and are syntactically valid in `references/`.
- [ ] Frontmatter conforms to Hermes, OpenClaw, and RFC specifications with valid argument-hint and priority.
- [ ] Deliverability mode confirms SPF, DKIM, DMARC, and RFC 8058 one-click unsubscribe compliance.
- [ ] RFM segmentation and customer database traits conform to strict data-privacy standards with zero plaintext credential leak.
