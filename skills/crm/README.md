# crm

Customer relationship management and event-driven marketing flow engine: audience segmentation, RFM scoring, welcome and activation onboarding drips, cart and checkout recovery flows, lead nurture journeys, churn winback sequences, bulk deliverability infrastructure (SPF, DKIM, DMARC, BIMI, warming curves), and transactional SMS triggers — routed through eight modes.

## Modes

- `onboard`: Welcome sequence, product activation milestones, and new user onboarding drips.
- `abandon`: High-urgency cart recovery, browse abandonment, and expiring trial checkout rescue.
- `nurture`: Multi-part educational nurture campaigns and product-led value delivery.
- `winback`: Behavioral churn prevention, dormant re-engagement offers, and sunset cleanups.
- `deliverability`: Bulk sender DNS authentication, IP/domain warming curves, and bounce webhooks.
- `sms`: Transactional order alerts and high-conversion broadcast SMS/WhatsApp campaigns.
- `contacts`: Audience segmentation, RFM customer tiers, custom properties, and list cleaning.
- `audit`: Authentication-first deliverability audit (SPF/DKIM/DMARC), list hygiene, data decay, and lifecycle-flow checks.

## Installation & Usage

```bash
# Install
npx skills add harshsinghmp/muse-skills --skill crm

# Then ask: onboard "Build 5-day welcome sequence for SaaS signups"
# Then ask: abandon "Create 3-step abandoned cart recovery flow"
```
