# deliverability — Domain Authentication, IP Warming & Deliverability Auditing

> **Operating Principle**: The highest-converting copy and most sophisticated flows are worthless if emails land in the spam folder or promotions tab. High inbox placement requires strict technical authentication (SPF, DKIM, DMARC), dedicated sending infrastructure, rigorous warming cadences, and continuous complaint/bounce monitoring below industry thresholds.

---

## 2024–2026 Google & Yahoo Sender Compliance Checklist

All bulk email senders (>5,000 emails/day) must strictly satisfy these non-negotiable requirements:
- [ ] **SPF (Sender Policy Framework)**: Explicitly authorized sending server IP/hosts in TXT record.
- [ ] **DKIM (DomainKeys Identified Mail)**: 2048-bit cryptographic key signing matching the sender `From:` domain.
- [ ] **DMARC (Domain-based Message Authentication, Reporting, and Conformance)**: Published policy at `_dmarc.<domain>` with at minimum `p=none` moving to `p=quarantine` or `p=reject`.
- [ ] **Custom Tracking Domain (CNAME)**: White-labeled click tracking matching root domain (`links.domain.com` or `click.domain.com`) to prevent shared ESP reputation flags.
- [ ] **RFC 8058 One-Click Unsubscribe**: Both `List-Unsubscribe: <url>, <mailto:...>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers present in all marketing emails.
- [ ] **Spam Complaint Rate**: Maintained below 0.10% (never exceeding 0.30% in Google Postmaster Tools).
- [ ] **Hard Bounce Rate**: Maintained below 2.0%.

---

## Technical DNS Configuration Specifications

### 1. SPF Record
```dns
v=spf1 include:_spf.google.com include:sendgrid.net include:klaviyo.com ~all
```
*(Ensure total DNS lookups across all `include:` mechanisms do not exceed the 10-lookup limit).*

### 2. DMARC Policy (Progressive Rollout)
Phase 1 (Monitoring):
```dns
_dmarc.domain.com.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc-reports@domain.com; pct=100;"
```
Phase 2 (Enforcement):
```dns
_dmarc.domain.com.  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@domain.com; pct=100;"
```
Phase 3 (Full Protection):
```dns
_dmarc.domain.com.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@domain.com; pct=100;"
```

### 3. BIMI (Brand Indicators for Message Identification)
```dns
default._bimi.domain.com.  TXT  "v=BIMI1; l=https://domain.com/assets/logo.svg; a=https://domain.com/assets/cert.pem;"
```

---

## 4-Week Progressive IP & Domain Warming Schedule

When launching a new domain or dedicated sending IP, traffic must follow a geometric ramp to establish sender reputation with Gmail, Yahoo, Microsoft, and Apple.

| Week | Daily Volume Limit | Target Audience Segment | Minimum Open Rate |
| :--- | :--- | :--- | :--- |
| **Week 1** | 200 – 500 / day | Highly engaged users (opened/clicked within last 14 days) | >45% |
| **Week 2** | 1,000 – 2,500 / day | Engaged users (last 30 days) | >35% |
| **Week 3** | 5,000 – 10,000 / day | Engaged users (last 60 days) | >25% |
| **Week 4** | 25,000+ / day | Full active opt-in list | >20% |

---

## Deliverability Audit Protocol

1. **Header Inspection**: Send test message to Google Postmaster & Mail-Tester to confirm SPF, DKIM, and DMARC alignment pass (`pass` status across all headers).
2. **Reputation Monitoring**: Check domain health on Google Postmaster Tools (Domain & IP Reputation: High), Talos Intelligence, and Barracuda Central.
3. **Blacklist Audit**: Verify sending IPs are not listed on Spamhaus (ZEN/DBL), SURBL, or Spamcop.
4. **List Hygiene Scrub**: Run stale contact databases through ZeroBounce or NeverBounce before any re-engagement campaign to purge invalid and spam-trap emails.
