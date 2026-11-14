# dunning — Delinquency management, automated escalation ladders, pause-on-delinquency triggers, and bad debt reconciliation.

Comprehensive debt recovery, delinquent account management, and financial risk mitigation for agency retainers, fixed milestones, and client accounts. Enforces strict escalation timelines, automated gateway charge retries, environment pause triggers, and statutory bad debt tax credit write-offs.

---

## Scope

- **Delinquency Escalation Ladder**: Strict automated timeline for unpaid milestone and retainer invoices (Day 1, Day 7, Day 14, Day 30).
- **Payment Gateway Smart Retries**: Stripe, Razorpay, and Cashfree webhook event routing, automated retry curves, and customer payment portal updates.
- **Service Suspension Architecture (Pause-on-Delinquency)**:
  - Staging preview environment freezing (`402 Payment Required` gate).
  - Sprint velocity pauses and pull request merge blocking on client workstreams.
  - LLM token quota and cloud compute resource throttling for delinquent client workspaces.
- **Tax Liability Reversal & Bad Debt Compliance**:
  - Statutory credit note generation (`CN-YYYY-XXXX`) under GST/VAT rules to reclaim paid output taxes.
  - GAAP/IFRS bad debt write-off journal entries.

---

## 🏛️ The 4-Tier Automated Escalation Ladder

```
[Invoice Due Date (Day 0)] 
       │
       ▼
[Day 1: Courtesy Ping] ──► Self-serve payment portal link + statement copy
       │
       ▼
[Day 7: Formal Notice] ──► Late payment interest notice (1.5%/mo) + delivery warning
       │
       ▼
[Day 14: Sprint & Staging Pause] ──► Hard freeze on staging URLs, PR merges & dev sprints
       │
       ▼
[Day 30: Legal Notice & Tax Write-off] ──► Demand letter, contract termination, Credit Note
```

### 1. Day 1: Courtesy Friendly Reminder (Soft Touch)
- **Objective**: Assume oversight, broken card on file, or corporate accounts payable cycle lag.
- **Tone**: Helpful, supportive, zero-pressure.
- **Payload**:
  - Direct self-serve payment link or updated Stripe Billing Portal session.
  - Attached PDF invoice copy.
  - Virtual account wire transfer details.
- **Template**:
  > *"Hi [Client Name], just a quick friendly note that Invoice #[INV-XXXX] ($[Amount]) was due yesterday. If payment has already been initiated, please share the wire receipt so our accounting team can reconcile. If you need to update the card on file, here is the secure self-serve link: [Portal URL]. Thank you!"*

### 2. Day 7: Formal Notice & Late Fee Warning (Operational Notice)
- **Objective**: Clarify that non-payment impacts project scheduling and carries contractual late fees.
- **Tone**: Professional, firm, factual.
- **Payload**:
  - Account statement showing outstanding balance and days overdue.
  - Contractual late fee terms (e.g., 1.5% per month or statutory local interest rate).
  - 7-day warning before active environment and sprint delivery pauses.
- **Template**:
  > *"Hi [Client Name], Invoice #[INV-XXXX] ($[Amount]) is now 7 days past due. Per Section [X] of our Master Services Agreement, accounts past due are subject to a 1.5% monthly late finance charge. Additionally, our delivery pipeline requires accounts in good standing to maintain active sprint reservations. Please ensure payment is completed by [Date @ 5 PM] to prevent a temporary pause on active development and staging previews."*

### 3. Day 14: Pause-on-Delinquency Execution (Hard Stop)
- **Objective**: Protect agency capital by halting all uncompensated labor, token consumption, and hosting costs.
- **Tone**: Firm, unequivocal, contractual.
- **Automated Actions Executed**:
  1. Staging deployment DNS or Cloudflare Access swapped to `402 Payment Required` splash page.
  2. Active GitHub/GitLab PR merges blocked on client branch worktrees.
  3. Client subagent / LLM API key pools deactivated.
  4. Project manager / Crew issues a Stop-the-Clock notice, shifting target launch dates day-for-day.
- **Template**:
  > *"Hi [Client Name], as Invoice #[INV-XXXX] ($[Amount]) remains unpaid at 14 days overdue, active development, code reviews, and staging previews for [Project Name] have been paused in accordance with our agreement. Our engineering team has been reassigned to secondary pipelines. Once payment is confirmed cleared, services and sprint capacity will reactivate within 24 to 48 hours. Target delivery milestones will shift day-for-day based on receipt date."*

### 4. Day 30: Formal Demand Letter, Access Revocation & Bad Debt Triage
- **Objective**: Formal legal escalation, offboarding, and statutory tax write-off.
- **Actions Executed**:
  1. Complete revocation of repository, staging, and shared asset access.
  2. Registered delivery of statutory Demand Letter (Notice of Breach).
  3. Escalation to collections partner or legal counsel.
  4. Generation of Statutory Credit Note to reverse output VAT/GST tax liability.

---

## ⚡ Payment Gateway Smart Retries & Webhook Engineering

For SaaS retainers and automated card billing, failed recurring payments must be recovered automatically without manual email overhead.

### 1. Stripe Smart Retries Configuration
- **Algorithm**: Leverage Stripe's machine-learning retry engine configured over a 3-week window (typically 4 retry attempts at optimal card authorization hours).
- **Webhook Handlers**:

```typescript
import type { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function handleStripeDunningWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"]!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_DUNNING_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const attemptCount = invoice.attempt_count;
      console.warn(`[Dunning] Payment failed for invoice ${invoice.id}, attempt #${attemptCount}`);

      if (attemptCount === 1) {
        // Day 1: Send automated customer portal link for card update
        await dispatchDunningPortalEmail(invoice.customer as string, invoice.hosted_invoice_url!);
      } else if (attemptCount >= 4) {
        // Final attempt failed: Trigger Day 14 pause protocol
        await executeDelinquencyPause(invoice.customer as string, invoice.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.error(`[Dunning] Subscription cancelled due to non-payment: ${subscription.id}`);
      await revokeClientAccess(subscription.customer as string);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // If client was paused, automatically reactivate environments
      await reactivateClientServices(invoice.customer as string);
      break;
    }
  }

  res.json({ received: true });
}
```

---

## 🛑 Pause-on-Delinquency Infrastructure Blueprint

When the Day 14 threshold is crossed, automated scripts freeze client infrastructure without destroying data:

1. **Cloudflare Worker Staging Interstitial**:
   - If `client_status === 'delinquent'`, intercept requests to `*.staging.agency.com` with HTTP 402:
   ```typescript
   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       const clientStatus = await env.CLIENT_KV.get("client_status:acme_corp");
       if (clientStatus === "delinquent") {
         return new Response(
           `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:50px;">
              <h2>Staging Access Temporarily Suspended</h2>
              <p>This development preview is paused pending billing reconciliation.</p>
              <p>Contact your agency accounts lead or finance@agency.com to reactivate.</p>
            </body></html>`,
           { status: 402, headers: { "Content-Type": "text/html" } }
         );
       }
       return fetch(request);
     }
   };
   ```

2. **GitHub Action PR Merge Guard**:
   - Status check runs on all PRs in client repo: verifies `ACCOUNTS_STATUS !== 'DELINQUENT'`. Fails the commit check if delinquent, blocking merges into `dev` or `main`.

---

## 📑 Statutory Tax Credit & Bad Debt Write-Off Rules

When an invoice remains uncollected after Day 30 and recovery is deemed improbable, the agency must reclaim the sales tax already remitted to tax authorities:

### 1. Statutory Credit Note Issuance (`CN-YYYY-XXXX`)
- **Reason for Issuance**: "Deficiency of payment / Uncollectible bad debt".
- **Requirements**:
  - References the original invoice number (`Original Invoice: INV-2026-0042`).
  - Reverses the net revenue and exact tax amount (GST/VAT).
  - Transmitted to the tax authority in the current monthly/quarterly tax return to offset current tax payable or claim a refund.

### 2. Double-Entry Accounting Journal for Bad Debt
```
Debit:  Bad Debt Expense (Operating Expense)            $5,000.00
Debit:  VAT / GST Output Tax Payable (Liability offset)    $900.00
Credit: Accounts Receivable (Asset write-off)           $5,900.00
```

---

## Quality Gate

- [ ] Day 1 courtesy message sent with self-serve billing portal link.
- [ ] Day 7 formal notice issued with contractual late fee rate specified.
- [ ] Day 14 pause-on-delinquency triggered: staging locked with HTTP 402, PR merges blocked, sprint clock stopped.
- [ ] Stripe Smart Retries configured over a multi-week schedule.
- [ ] Webhook listener responds to `invoice.payment_failed` and auto-reactivates upon `invoice.payment_succeeded`.
- [ ] Statutory Credit Note generated for confirmed uncollectible debt to recover remitted GST/VAT.
- [ ] Bad debt write-off journal entry balances correctly.

---

## Routing

- New invoice issuance or milestone billing → `accounts:invoicing`.
- Client dispute or scope negotiation during dunning → `client-comms:change-request`.
- Churn risk analysis and contract renewal → `retain:churn-watch`.
- Payment gateway webhook infrastructure → `webdev:backend`.
