# sms — SMS Marketing & Conversational Automation

> **Operating Principle**: SMS is an intimate, high-impact channel with a 98% open rate and 90% read within 3 minutes. Because of its intrusive nature, SMS must be used with precision, delivering immediate urgency, utility, and explicit opt-in compliance. A poor SMS experience creates immediate opt-outs and regulatory liabilities.

---

## TCPA & CTIA Regulatory Compliance Guardrails

Before sending any SMS message, verify strict adherence to legal standards:
- [ ] **Prior Express Written Consent**: Mandatory checkbox or explicit opt-in disclaimer at checkout/signup: *"By subscribing, you agree to receive automated marketing SMS from {{PROJECT_NAME}}. Consent is not a condition of purchase. Msg & data rates may apply. Msg freq varies. Reply HELP for help and STOP to cancel."*
- [ ] **A2P 10DLC Registration**: Brand and campaign registered with The Campaign Registry (TCR) through Twilio, Klaviyo, or carrier aggregator to avoid carrier filtering.
- [ ] **Mandatory Opt-Out Keywords**: Automated handling of `STOP`, `END`, `CANCEL`, `UNSUBSCRIBE`, and `QUIT` with instant confirmation.
- [ ] **Mandatory Help Keyword**: Response to `HELP` or `INFO` detailing company identity, support contact, and terms.
- [ ] **Quiet Hours Enforcement**: Strict suppression of all outbound messages between 9:00 PM and 8:00 AM in the recipient's local time zone.

---

## High-Converting SMS Flow Blueprints

### 1. The Abandoned Cart / Checkout Recovery SMS
- **Trigger**: Checkout abandoned with phone number captured.
- **Timing**: 45 to 60 minutes after abandonment (within the golden window).
- **Rule**: Max 1 SMS per abandonment session (do not spam).
- **Copy Pattern**:
  > *"Hey {{FIRST_NAME}}, noticed you left your items in cart at {{BRAND}}. Still interested? Grab them here before they sell out: {{DYNAMIC_CART_URL}} - Reply STOP to opt out"*

### 2. High-Urgency Flash Sale / Drop Notification
- **Trigger**: Time-limited product launch or flash discount.
- **Timing**: Sent during peak recipient hours (11:00 AM – 2:00 PM local).
- **Copy Pattern**:
  > *"⚡ {{BRAND}} FLASH SALE: The next 50 orders get 25% off with code FLASH25. Shop now: {{SHORT_LINK}} - Text STOP to opt out"*

### 3. VIP / Concierge 2-Way Conversational SMS
- **Trigger**: High-tier purchase or VIP lead inquiry.
- **Timing**: Immediate follow-up during business hours.
- **Copy Pattern**:
  > *"Hi {{FIRST_NAME}}, this is Alex from {{BRAND}}. Thank you for your order! Did you have any questions about getting started? Text back anytime, I am right here."*

---

## Technical Specifications & Character Count Optimization

| Standard | Character Limit | Encoding | Notes |
| :--- | :--- | :--- | :--- |
| **Standard SMS** | 160 characters | GSM-7 | Exceeding 160 characters splits into multi-part segments (153 chars each). |
| **Unicode SMS** | 70 characters | UCS-2 | Emojis (🔥, ⚡) and special characters force UCS-2 encoding, shrinking limits. |
| **MMS (Multimedia)** | 1600 characters + media | JPEG/PNG/GIF | Ideal for visual proof, but incurs higher per-message carrier costs (~3x). |

### Tracking & Attribution
- Always use dedicated branded shortlinks (e.g. `brand.co/xyz`) containing embedded UTM campaign, source, and medium parameters.
- Ensure link shortener does not trigger carrier spam filters.
