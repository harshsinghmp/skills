# abandon — Cart, Browse & Checkout Abandonment Recovery Engine

> **Operating Principle**: Over 70% of digital carts and checkout sessions are abandoned before payment. Abandonment is not necessarily lost interest—it is often friction, distraction, or price/trust hesitation. An automated recovery sequence deployed within the first 48 hours captures 15% to 28% of abandoned revenue.

---

## Trigger Architecture & Timing Intervals

Recovery sequences must execute across 3 carefully timed intervals:

| Touchpoint | Delay After Abandonment | Psychological Angle | Offer / Incentive |
| :--- | :--- | :--- | :--- |
| **Touch 1: Helpful Concierge** | **1 Hour** | Friction Buster & Item Reservation | Zero discount; offer assistance & answer questions |
| **Touch 2: Social Proof & Urgency** | **24 Hours** | Social proof, verified reviews, limited inventory | Customer quote, bestseller badge, low stock alert |
| **Touch 3: Final Call & Expiring Incentive** | **48 Hours** | Scarcity & gentle incentive | 10% off or free priority shipping expiring in 24 hours |

---

## Sequence Schemas

### 1. E-Commerce Cart Recovery Flow
- **Trigger**: `checkout_started` without `order_completed` within 60 minutes.
- **Dynamic Data Injected**: Cart product items, thumbnails, variant names, subtotal, and direct 1-click restore link (`checkout_url`).
- **Touch 1 (1 Hour)**:
  - *Subject*: *"Did something interrupt your checkout?"* or *"Your {{BRAND_NAME}} items are saved."*
  - *Body*: Keep it friendly and helpful. *"We noticed you left [Item Name] in your cart. We saved your bag so you can pick up right where you left off."*
  - *CTA*: **[Return to Checkout]**
- **Touch 2 (24 Hours)**:
  - *Subject*: *"Here is what customers say about [Product Name]"*
  - *Body*: Highlight 2 verified customer reviews highlighting durability, fit, or performance. Address the top customer objection from `.agents/brand/personas.md`.
  - *CTA*: **[Complete Your Order]**
- **Touch 3 (48 Hours)**:
  - *Subject*: *"Your cart expires tonight (+ exclusive 10% perk)"*
  - *Body*: Friendly urgency. *"We can only hold your reserved items for another 12 hours. Use code SAVE10 at checkout to finish your order."*
  - *CTA*: **[Claim Your 10% Off & Finish]**

### 2. SaaS Trial & Checkout Rescue Flow
- **Trigger**: User starts trial or enters checkout modal but does not enter payment details or activate.
- **Touch 1 (2 Hours)**: *"Quick question about your {{PROJECT_NAME}} workspace"* — Concierge note from founder/product lead asking if they hit any technical blocker.
- **Touch 2 (24 Hours)**: *"See how [Customer] deployed their first workflow in 10 minutes"* — Video walkthrough demonstrating rapid setup.
- **Touch 3 (72 Hours)**: *"Should we close out your reserved account?"* — Professional breakup trigger; asks if they'd like an extended 7-day sandbox trial.

---

## Technical Webhook & Idempotency Rules

1. **Suppression on Purchase**: As soon as `order_completed` or `subscription_created` webhook is received, cancel all pending downstream sequence steps immediately.
2. **Dynamic Cart Link Expiration**: Ensure `checkout_url` maintains items in user session across desktop and mobile devices.
3. **Discount Abuse Prevention**: Do NOT offer discounts to customers who received an abandonment discount within the last 60 days.

---

## Quality Gate

- [ ] Webhook cancellation fires instantly upon order completion.
- [ ] Cart thumbnails and item variants render correctly in mobile email clients.
- [ ] Touch 1 contains zero discounts (prevents training customers to abandon for coupons).
- [ ] All links point directly to the pre-filled checkout session, not generic homepage.
- [ ] TCPA/GDPR compliance maintained; marketing consent verified.
