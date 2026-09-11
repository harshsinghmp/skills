# Security Lane — numbered control pass

Loaded by: the `security` mode. Findings use numbered control IDs so they stay
comparable across reviews, rounds, and reviewers. Every finding carries the same
five parts: **control ID, file:line, vulnerable snippet, why exploitable, concrete
remediation**. Evidence-first: a finding without a snippet and an exploitation
explanation is checklist-theater, not review.

## Control catalog

| ID | Control | What to look for |
| :--- | :--- | :--- |
| SEC-01 | Injection | Unparameterized queries, string-built commands, unsafe deserialization, template injection |
| SEC-02 | XSS / output encoding | Unescaped user data reaching HTML, URLs, or attribute contexts |
| SEC-03 | Access control / IDOR | Object access without ownership checks, horizontal privilege escalation, missing authorization on endpoints |
| SEC-04 | Authentication & session | Weak credential storage, missing expiry, algorithm confusion, flow-state defects |
| SEC-05 | Cryptographic failures | Hardcoded or weak algorithms, non-random IVs/nonces, keys in source or logs |
| SEC-06 | SSRF / outbound requests | User-controlled URLs fetched server-side, missing allowlists on redirects |
| SEC-07 | Secrets exposure | Hardcoded credentials, tokens or PII in logs, secrets in error messages or client bundles |
| SEC-08 | Rate limiting & abuse | Unthrottled expensive endpoints, missing brute-force protection |
| SEC-09 | Error handling & disclosure | Stack traces or internals leaking to clients, silent swallowing of auth failures |
| SEC-10 | Dependency & supply chain | Known-vulnerable versions, unpinned dependencies, unreviewed post-install scripts |

Placement rules still apply from the main skill: checks belong at access-grant time,
not consumption time (Theme 4). A control pass that finds nothing must say so
explicitly — "SEC-01..10: no findings" — silence is not evidence of a pass.

## Report shape

```
SECURITY REVIEW — <scope>
Controls passed: SEC-02, SEC-06, SEC-09 (no findings)
Findings: 2

[SEC-03] src/orders/routes.ts:41 — order fetched by id without ownership check.
  Any authenticated user can read any other user's order by id.
  Remediation: scope the query by the authenticated principal.

[SEC-07] src/lib/logger.ts:18 — authorization header logged verbatim.
  Remediation: redact credential headers before emit.
```
