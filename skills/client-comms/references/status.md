# status — Client status report: progress, blockers, next steps, and staging changelogs.

## Intake

- What shipped since last update, what is in flight, blockers and owners
- Git log or PR summaries from the release period
- Upcoming milestones and client review dates
- Client's preferred channel (Slack, email, Loom, or Looker Studio dashboard)

## Deliverable

1. **Client Status Report**: Executive summary in client language: outcomes shipped, in-flight focus, blocked items (with single clear need), and upcoming milestone dates.
2. **Non-Technical Staging Changelog**: Developer commits translated into business outcomes, categorized by Visual Enhancements, Fixes & Polish, and Performance & Stability.

---

## 🗞️ Automated Non-Technical Client Changelog Protocol

Clients and marketing stakeholders do not understand technical git logs (e.g. `fix(checkout): adjust z-index: 50 on modal overlay and fix hydration mismatch`). All client-facing release notes must pass through the **Jargon Sanitizer**:

### Jargon Sanitizer Rules
1. **Never Show Hashes or Commit IDs**: Strip commit SHAs, PR numbers, branch names, and AST terminology.
2. **Translate Mechanism into User Benefit**:
   - `refactor(db): add index on orders.customer_id` → *"Accelerated order history loading speeds by up to 4x."*
   - `fix(a11y): add aria-expanded to mobile nav hamburger` → *"Improved mobile menu accessibility and touch responsiveness."*
   - `feat(stripe): implement webhook idempotency key cache` → *"Hardened checkout payment security to prevent any duplicate card charges."*
3. **Structured Grouping**:
   - 🌟 **New Features & Visual Updates**: Direct changes visible to end-users and marketing teams.
   - 🛠️ **Improvements & Bug Fixes**: Resolved edge cases, fixed layout bugs, and visual alignment polish.
   - ⚡ **Performance & Reliability**: Speed boosts, security protections, and uptime safeguards.

### Standard Client Changelog Format
```markdown
### 🚀 Staging Deployment Update — [Client Project Name] (Version 1.4.0)

**Preview URL**: https://staging.clientdomain.com
**Review Period**: March 30, 2026

#### 🌟 New & Visual Updates
- **Refreshed Mobile Navigation**: Updated the mobile menu with smoother open/close animations and prominent contact buttons.
- **Hero Banner Spacing**: Polished layout spacing across mobile screens so your core headline and primary CTA are immediately visible without scrolling.

#### 🛠️ Polish & Fixes
- **Contact Form Validation**: Clearer error indicators when an email address is mistyped, making it easier for leads to submit inquiries.
- **Image Display Stability**: Resolved a minor flicker issue when quickly toggling between product gallery images.

#### ⚡ Performance & Security
- **Faster Page Load**: Optimized asset delivery, reducing initial mobile load time by ~0.8s on 4G connections.
- **Secure Payment Processing**: Strengthened checkout protection against network interruptions.

**What We Need From You**:
- Please test the contact form on mobile staging and confirm headline copy before Friday 3:00 PM EST.
```

---

## Procedure

1. **Lead with Outcomes Shipped**: Start with the business needle moved, not internal activity.
2. **Sanitize Technical Commits**: Parse raw commits into the three non-technical changelog categories.
3. **State Blockers with Needs**: Every blocker must state who owns it and the single specific decision or asset needed from the client.
4. **Dates with Early Risk Flags**: Never deliver surprises; flag date adjustments at least 72 hours in advance with 2 feasible options.
5. **Verified Claims Only**: Every performance number or conversion metric must be grounded in real analytics or staging tests.

---

## Quality Gate

- [ ] Zero technical jargon, library names, or commit SHAs in client notes.
- [ ] Grouped into New/Visual, Polish/Fixes, and Performance/Security.
- [ ] Contains live staging URL and specific client action items with deadlines.
- [ ] Every blocker names an owner and a single unblocking need.
