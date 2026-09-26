# audit — gtm audit mode

## When to Use

- **Launch-readiness audit**: Verify all GTM assets present, channels wired, pricing/payments flow works
- **Messaging audit**: Confirm positioning is consistent across all surfaces

## Checklist

- [ ] Landing page live and matches approved design
- [ ] Pricing page has Razorpay (or configured payment) integration tested
- [ ] Email sequence wired (welcome → nurture → convert)
- [ ] Social profiles updated with launch messaging
- [ ] Analytics events firing correctly (see `analytics` audit)
- [ ] SEO fundamentals in place (see `seo` audit)
- [ ] Launch checklist signed off per item

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Payment flow broken | `PROPOSE-DIFF` | `qa-launch` (block launch) |
| Landing page not live | `AUTO-REPAIR` | `webdev` |
| Email sequence not wired | `AUTO-REPAIR` | `content` |
| Analytics events not firing | `REPORT-ONLY` | `analytics` audit |
| Launch checklist incomplete | `REPORT-ONLY` | `secretary` (approval gate) |

## Output

`.agents/artifacts/audit-gtm-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
