# contacts — Audience Segmentation, RFM Scoring & Identity Resolution

> **Operating Principle**: Customer relationship management begins with clean, unified contact records. Static email lists are obsolete; high-performance retention engines rely on event-driven profiles, dynamic RFM segmentation (Recency, Frequency, Monetary), custom trait schemas, and strict privacy/compliance controls.

---

## The Unified Contact Schema

Every contact record in the customer database must expose standard and custom behavioral attributes:

```json
{
  "id": "usr_948f2a1b",
  "email": "customer@example.com",
  "phone": "+14155552671",
  "first_name": "Jordan",
  "last_name": "Taylor",
  "created_at": "2026-01-15T08:30:00Z",
  "last_active_at": "2026-09-20T14:22:10Z",
  "traits": {
    "account_tier": "pro_annual",
    "industry": "fintech",
    "team_seats": 12,
    "primary_use_case": "api_integration"
  },
  "metrics": {
    "lifetime_value": 4800.00,
    "order_count": 4,
    "average_order_value": 1200.00,
    "days_since_last_purchase": 18,
    "rfm_segment": "Champions"
  },
  "consent": {
    "email_marketing": true,
    "sms_marketing": true,
    "gdpr_consent_timestamp": "2026-01-15T08:30:00Z",
    "opt_in_ip": "198.51.100.42"
  }
}
```

---

## Dynamic RFM Segmentation Matrix

Segment contacts automatically into actionable clusters based on Recency, Frequency, and Monetary scores (1–5 scale):

| Segment | RFM Score Range | Customer Behavior | Actionable Strategy |
| :--- | :--- | :--- | :--- |
| **Champions / VIPs** | R: 4–5, F: 4–5, M: 4–5 | Bought recently, buys often, spends the most. | Early feature access, VIP events, testimonial & referral requests. |
| **Loyal Customers** | R: 3–5, F: 3–4, M: 3–5 | Consistent buyers, responsive to campaigns. | Upsell higher tiers, cross-sell complementary services. |
| **Potential Loyalists** | R: 4–5, F: 1–2, M: 2–4 | Recent first-time or second-time buyers. | Onboarding nurture, review request, loyalty program invitation. |
| **At Risk / Churn Risk** | R: 1–2, F: 3–5, M: 3–5 | Past high spenders who haven't engaged in 60+ days. | Personalized founder outreach, dedicated reactivation offers. |
| **Hibernating / Dormant** | R: 1–2, F: 1–2, M: 1–2 | Low engagement, unread emails over 90+ days. | Winback flow; sunset if unengaged after 4 attempts. |

---

## Identity Resolution & Deduplication Rules

1. **Deterministic Matching**: Match primarily on verified email address; secondarily on E.164 formatted phone number (`+1...`).
2. **Anonymous-to-Identified Merging**: When an anonymous visitor (tracked via cookie `_session_id`) logs in or enters an email at checkout, immediately merge pageviews, cart additions, and browse events into the permanent profile.
3. **Conflict Resolution**: Never overwrite non-empty fields with empty values during webhook ingestion.

---

## Privacy, GDPR & CCPA Compliance Operations

- **Right to Access / Data Export**: Generate machine-readable JSON exports containing all traits, purchase history, and interaction logs within 48 hours of request.
- **Right to Erasure (Forget Me)**: Anonymize or permanently delete PII from the CRM, ESP, and analytics pipelines while retaining anonymized transactional rows for tax and financial auditing.
- **Suppression Registry**: Synchronize unsubscribed and bounced profiles across all connected agency tools (CRM, ESP, SMS gateway, ad custom audiences) to prevent accidental reactivation.
