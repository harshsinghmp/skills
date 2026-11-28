# 🌪️ webdev:funnel — High-Converting Funnel & Checkout Pipeline Engineering

> **Executive Scope**: Full-stack engineering for conversion funnels, multi-step interactive lead capture wizards, friction-free checkout flows, 1-click post-purchase upsell/downsell state machines, server-side conversion tracking pixels (Meta CAPI, Google Tag Manager, PostHog), and CRM webhook pipelines.

---

## 1. Funnel Typologies & Architecture

Every funnel implementation resolves to one primary technical pattern:

| Funnel Typology | Core Components | Technical Pipeline |
|:---|:---|:---|
| **Multi-Step Lead Gen / Quiz** | Interactive wizard, conditional branching, progress bar, email capture gate | React Hook Form + Zod + URL state / SessionStorage + CRM webhook |
| **Low-Ticket Tripwire & Order Bump** | Long-form sales page, embedded checkout, 1-click order bump checkbox | Stripe Elements + Dynamic Payment Methods + Server Intent calculation |
| **SaaS Free Trial / Product Demo** | Interactive product preview, frictionless signup, team size branch, calendar booking | Auth session + Stripe customer creation + Cal.com / HubSpot embed |
| **Post-Purchase Upsell State Machine** | Pre-thank-you intermediate offers, 1-click tokenized billing | Stripe `setup_future_usage` / saved PaymentMethod + server charge + fallback downsell |
| **High-Ticket Application** | Multi-page qualifying survey, video sales letter (VSL), calendar gate | Multi-step form + Zapier/Make/n8n/HubSpot API sync + routing rules |

---

## 2. The 5 Core Engineering Modules

### Module 1: Multi-Step Form & Interactive Wizard State Machine

```
Step 1: Low Friction (e.g. Industry/Goal)
   │
   ▼
Step 2: Pain Point & Volume (Branching Logic)
   │
   ▼
Step 3: Qualification & Contact Details (Zod validation)
   │
   ▼
Step 4: Offer Gate / Payment / Booking Redirect
```

1. **Step-by-Step Schema Validation**:
   - Maintain individual Zod schemas per step (`step1Schema`, `step2Schema`) combined into a `funnelSchema`.
   - Prevent moving forward until current step passes validation:
     ```typescript
     const step1Schema = z.object({
       role: z.enum(["founder", "marketer", "developer", "agency"]),
       teamSize: z.enum(["1-5", "6-20", "21-50", "50+"]),
     });
     ```
2. **Persistent Form State (Zero-Loss Refresh)**:
   - Store answers in URL search parameters or `sessionStorage`. If the user accidentally reloads or navigates back, restore their selections immediately.
3. **Endowed Progress Effect**:
   - Pre-complete the initial progress indicator. Step 1 of 4 must show 20–25% complete to capitalize on the psychological goal-gradient effect.
4. **Conditional Branching Rules**:
   - High-value leads (e.g. `teamSize === "50+"` or enterprise budget) branch to calendar scheduling (`/book-call`).
   - Self-serve leads branch directly to self-service checkout (`/checkout`).

---

### Module 2: Frictionless Checkout & Order Bumps

1. **Stripe Elements & Dynamic Payment Methods**:
   - Mount `@stripe/react-stripe-js` with `PaymentElement` enabled for Apple Pay, Google Pay, Link, and local payment rails.
   - Automatically prefill customer email and billing country to eliminate redundant typing.
2. **Order Bump Mechanics (Checkbox Upsell)**:
   - Add a high-converting order bump (e.g. complementary template, expedited delivery, audit) directly above the submit button:
     ```typescript
     // Dynamic client-side intent update or server recalculation
     const [hasOrderBump, setHasOrderBump] = useState(false);
     const totalAmount = basePrice + (hasOrderBump ? bumpPrice : 0);
     ```
   - When toggled, update `PaymentIntent` on the server or dynamically recompute the client charge payload with server-side validation.
3. **Idempotency Keys**:
   - Always pass a client-generated UUID as an idempotency key (`Idempotency-Key: <uuid>`) in API headers to prevent duplicate charges caused by rapid user clicks or network retries.

---

### Module 3: 1-Click Post-Purchase Upsell / Downsell State Machine

1. **Payment Method Tokenization**:
   - On initial checkout, set `setup_future_usage: 'off_session'` on the `PaymentIntent` or attach the `PaymentMethod` to a newly created `Stripe.Customer`.
2. **The Intermediate Post-Purchase Intercept**:
   - Do **NOT** redirect straight to `/thank-you`.
   - Redirect to `/upsell-1?session_id={CHECKOUT_SESSION_ID}`.
3. **1-Click Charging**:
   - Present the complementary high-ticket offer. The CTA button ("Yes, Add to My Order for $97") triggers an API call that creates and confirms a new `PaymentIntent` using the saved `customer` and `payment_method`:
     ```typescript
     const paymentIntent = await stripe.paymentIntents.create({
       amount: 9700,
       currency: 'usd',
       customer: customerId,
       payment_method: paymentMethodId,
       off_session: true,
       confirm: true,
     });
     ```
4. **Downsell Routing**:
   - If the user clicks "No thanks, decline this offer", transition to `/downsell-1` (e.g. offering payment plans or a lighter version) before proceeding to final confirmation.

---

### Module 4: Server-Side Conversion Tracking (Meta CAPI, GTM, PostHog)

Client-side ad blockers (uBlock, Brave, iOS Safari ITP) drop 20–40% of browser conversion pixels. Funnels must deploy dual-rail tracking:

1. **Event Deduplication via `event_id`**:
   - Generate a unique `eventId` (UUID or hash of timestamp + email) on user interaction.
   - Send `eventId` via both client-side pixel and server-side Conversion API (CAPI).
2. **Meta Conversions API (CAPI) Server Route**:
   ```typescript
   // POST /api/analytics/conversion
   export async function trackServerConversion({
     eventName,
     eventId,
     email,
     value,
     currency = "USD",
     clientIp,
     userAgent,
   }: ConversionPayload) {
     const hashedEmail = sha256(email.trim().toLowerCase());
     
     await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         data: [{
           event_name: eventName,
           event_time: Math.floor(Date.now() / 1000),
           event_id: eventId,
           user_data: { em: hashedEmail, client_ip_address: clientIp, client_user_agent: userAgent },
           custom_data: { value, currency },
         }],
       }),
     });
   }
   ```
3. **PII Safety & Zero-Leak Protocol**:
   - Never send plain-text customer emails or phone numbers to external endpoints.
   - Hash all sensitive parameters client-side or in secure edge runtimes using SHA-256.

---

### Module 5: CRM Sync & Webhook Resilience

1. **Asynchronous Webhook Ingestion**:
   - Webhook endpoints (`/api/webhooks/stripe`) must acknowledge receipt immediately (`200 OK`) and queue background processing (e.g. BullMQ, Inngest, or Cloudflare Queues).
2. **Signature Verification**:
   - Verify raw webhook signatures (`stripe.webhooks.constructEvent(rawBody, sig, secret)`). Never accept unverified payloads.
3. **CRM Dispatch**:
   - Dispatch customer records and custom funnel tags (`funnel:web-design-intake`, `tier:enterprise`, `lead-score:85`) to HubSpot, Airtable, or ConvertKit.

---

## 3. Quality Gate & Production Verification

Before launching a funnel to live traffic:

- [ ] **Form Validation**: Multi-step form enforces strict Zod rules per step; back navigation retains input state.
- [ ] **Endowed Progress**: Progress indicator begins at 20%+ on step 1.
- [ ] **Idempotency**: All payment API endpoints mandate and pass idempotency keys.
- [ ] **1-Click Upsell**: Post-purchase upsell executes via saved customer token without re-entering payment credentials.
- [ ] **Dual-Rail Tracking**: Client pixel and server-side CAPI both emit matching `event_id`s; verified in Meta Events Manager test mode.
- [ ] **PII Redaction**: All customer identifiers transmitted to analytics endpoints are hashed with SHA-256.
- [ ] **Webhook Signature**: Stripe and payment webhooks strictly verify cryptographic signatures and handle duplicate event delivery idempotently.
- [ ] **Mobile Responsiveness**: Form inputs use 16px font size minimum to prevent iOS automatic zoom on focus.
