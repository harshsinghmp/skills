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

## Appendix A — constant-time crypto checklist (#47)

When SEC-05 touches anything operating on secrets (MACs, comparisons, hashing,
crypto endpoints), check these timing side-channels — tool-independent:

- **Secret-dependent branches** — `if (secret[i] == input[i])` style compares;
  a non-constant-time compare leaks byte position. Use a constant-time compare
  (`crypto.timingSafeEqual` / constant-time library / `memcmp`-style).
- **Variable-time division / modulo** — `%`/integer division on secret
  operands can be data-dependent on some hardware; avoid on secret scalars in
  signatures/ECDH.
- **Non-secret-independent lookups** — table lookups indexed by secret bytes
  (S-box/permutation results) leak through cache timing; use fixed access or
  constant-time alternatives.
- **Cache-line leakage** — secret-controlled code or data layout that varies
  with secret values; keep secret data out of branch and index paths.

## Appendix B — dependency + insecure-defaults pass (#48, two explicit passes)

Run as two distinct passes after (or folding into) SEC-10:

**Pass 1 — Dependency CVE cross-check.** Resolve the lockfile/manifest to
actual resolved versions and cross-check against a CVE source
(`npm audit`, `cargo audit`, OSVDB/OSV, GitHub advisory feed). Verify pinning
(lockfile committed) and that post-install scripts are from vetted publishers.
A vuln is only closed by an upgraded resolved version, never by a stale
advisory alert or a `--force`.

**Pass 2 — Insecure-defaults config scan.** Review shipped/example config for
unsafe defaults that run in production unchanged: auth disabled by default,
missing CSRF, overly permissive CORS (`*` with credentials), default/blank
admin creds, debug/verbose modes on, permissive cookie/`SameSite`/secure
flags, and framework defaults that differ from the security posture the
service needs. Each default is a finding if a single misconfiguration step
will ship it.

The `skillscan` mode (`skill-bundle-scan.md`) is the trust gate for agent-skill
bundles specifically; SEC-10 + this appendix cover application dependencies.

## Always-apply P0 gate + trust-boundary workflow (enrich — source: `HoangNguyen/common-security-standards`)

Landed here once — this is the single home (converges with the unlanded H6
Always tier; `secure-code-guardian` verified absent on disk, so no double-land).

- **Every-write P0 gate.** No hardcoded secrets, no raw SQL strings, no prod
  stacktraces to clients. Any hit is P0 regardless of finding count.
- **4-step workflow.** Boundaries (name trust crossings first) → validate
  (all crossings) → least-privilege (scope to need) → verify (SAST/DAST
  re-run on the changed code).
- **Data rules.** PII minimized + redacted in logs, data collection minimal,
  security-relevant actions audit-logged.
- **Remediation anchors.** Argon2id for passwords, parameterized queries/ORM
  for SQL, rate limiting for abuse paths, HttpOnly Secure cookies for sessions.

## OWASP triple-list signals (enrich — source: `HoangNguyen/common-owasp`)

SEC-01..10 + AppB cover web basics; these API + Mobile signals extend the pass:

- **API 2023.** BOLA (object access without owner check), BFLA (function-level
  authZ missing), mass assignment, consumption quotas, business-flow abuse,
  inventory gaps (shadow endpoints), unsafe consumption of third-party APIs.
- **Mobile 2024 (M1–M10).** Insecure credential storage (use keychain/keystore,
  never plaintext), weak auth, insecure comms (cert-pinning gaps), debuggable
  builds shipped, insufficient cryptography, IPC exposure.
- **4 always-apply rules.** Owner-filter on every object fetch, no wildcard
  CORS with credentials, DTO projection (never serialize full models),
  mobile secrets in platform stores only.
- **Marking + P0 cap.** Mark each signal ✅ (holds) / ⚠️ (partial) / 🔴 (missing);
  🔴 on authZ/data-exposure caps at P0 — at most 40 points before the verdict
  is Reject regardless of the rest.

## LLM issue-spotting note (enrich — source: `HoangNguyen/common-llm-security`)

Full LLM01–10 checklist lives in `devops` `security.md` step 9 (operator-role
posture). For this control pass: no prompt concatenation with untrusted input,
no raw model output to sinks (exec/SQL/HTML), capped agent loops. Hits route
as SEC-01/SEC-02/SEC-08 equivalents with the LLM mapping named.

## Audit bundle + deduction scoring (enrich — source: `HoangNguyen/common-security-audit`)

- **Bundle secret scope.** Scan client bundles for `REACT_APP_` /
  `NEXT_PUBLIC_` / `VITE_` prefixed secrets plus generic token patterns.
- **Log-leakage scans per language.** Credential/token/PII patterns in logging
  calls; sinks + sourcemaps reviewed for exposed internals.
- **Coverage measurement.** Injection + auth-coverage: which sinks lack
  parameterized/owner-checked paths; BOLA/JWT/mass-assignment/race/GraphQL
  checks named per endpoint.
- **Per-ecosystem CVE cmds.** `npm audit`, `go list -m all` + govulncheck,
  `flutter pub audit` / dart, gradle dependencies, `cargo audit`, pod audit —
  run the one matching the stack, record resolved versions.
- **Deduction table + P0-cap-40.** Start 100, deduct per finding weight;
  any P0 caps the score at 40. Mobile refs included where the target is a client.
