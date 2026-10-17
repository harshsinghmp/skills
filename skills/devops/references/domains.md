# domains — Domains: DNS records, TLS, redirects, and email auth.

## Intake

- Domain registrar and DNS host
- Target service(s) (hosting, email, CDN)
- Required records (A/AAAA, CNAME, TXT)
- Redirect/canonical rules (www vs apex)

## Deliverable

A configured domain: correct DNS records, automatic TLS, canonical/redirect rules, and email authentication (SPF/DKIM/DMARC) where mail is used — with a propagation/verification check.

## Procedure

1. Map the required records: A/AAAA/CNAME to the target, TXT for verification/email.
2. Decide canonical host (apex vs www) and set the redirect.
3. Enable automatic TLS (Let's Encrypt/managed cert); verify it issues.
4. Configure email auth (SPF, DKIM, DMARC) if the domain sends mail.
5. Set TTLs sensibly for the migration; lower TTL before changes.
6. Verify propagation (dig) and that the site resolves over HTTPS.
7. Document records so the next change is fast.

## Quality gate

- [ ] DNS records correct for all targets.
- [ ] Canonical host + redirect set.
- [ ] TLS issues and resolves over HTTPS.
- [ ] Email auth configured if mail is sent.
- [ ] Propagation verified (dig/curl).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
