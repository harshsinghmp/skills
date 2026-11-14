# Web Application Security & Visual Regression Gate Reference

> Protocol for the Automated Gate role in `gauntlet-loop` when evaluating web applications, API services, and user interfaces. Enforces OWASP-aligned security headers and multi-breakpoint visual overflow checks before admitting work to the Integrator.

---

## 1. The Automated Gate Web Extension

In web application workflows, unit and integration tests passing is necessary but **not sufficient**. The Automated Gate enforces two additional non-negotiable checks:
1. **Security Headers Audit** (Network & Server Layer)
2. **Visual Breakpoint & Horizontal Overflow Audit** (Rendering & Client Layer)

Failure on either check is a **hard blocker** that zeroes the round score ($S_{\text{gate}} = 0.0$) and immediately bounces the candidate back to the Builder.

---

## 2. Mandatory Web Security Headers Audit

The Automated Gate verifies that the application or server configuration returns the 5 mandatory OWASP security headers:

| Header Name | Required Directive / Standard | Failure Condition |
| :--- | :--- | :--- |
| **`Content-Security-Policy`** (CSP) | Restricts resource origins (`default-src 'self' ...`) | Missing, allows `unsafe-eval` without nonce, or allows unrestricted wildcard `*` origins |
| **`Strict-Transport-Security`** (HSTS) | `max-age=31536000; includeSubDomains; preload` | Missing on HTTPS endpoints (loopback/localhost exempt) or `max-age < 15768000` |
| **`X-Frame-Options`** | `DENY` or `SAMEORIGIN` | Missing or allows arbitrary framing (clickjacking vulnerability) |
| **`X-Content-Type-Options`** | `nosniff` | Missing (MIME-sniffing vulnerability) |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` or `no-referrer` | Missing or set to `unsafe-url` |

### Audit Command Recipe
```bash
# Verify headers on the deployed HTTPS preview (not plain http://localhost).
curl -s -I https://preview.example.com | rg -i "(content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy)"

# Session cookie flags (HttpOnly/Secure/SameSite; no over-broad Domain).
curl -s -I https://preview.example.com/login | rg -i "^set-cookie:"
```

### Session, CORS, and CSRF Gate
These are hard blockers alongside the headers above:

| Check | Pass Condition | Failure Condition |
| :--- | :--- | :--- |
| **`Set-Cookie`** | Session/auth cookies are `HttpOnly; Secure; SameSite=Lax or Strict; Path=/` (prefer the `__Host-` prefix), with no `Domain` attribute unless cross-subdomain auth is an explicit requirement | Missing `HttpOnly`/`Secure` on an auth cookie, `SameSite=None` without `Secure`, or `Domain=.example.com` on a session cookie |
| **CORS** | Exact allowlisted origins; `Access-Control-Allow-Credentials: true` only with a specific origin | `Access-Control-Allow-Origin: *` with credentials, origin reflection, or `null` origin allowed |
| **CSRF** | State-changing browser requests require a synchronized token or strict `SameSite` + origin check; JSON-only APIs still verify `Origin`/`Sec-Fetch-Site` | No token and no origin check on cookie-authenticated mutations, or tokens accepted from the query string |
| **HSTS scope** | `Strict-Transport-Security` on deployed HTTPS hosts | Treating a missing HSTS header on `http://localhost` as a failure (loopback is not HTTPS) |

---

## 3. Visual Breakpoint & Horizontal Overflow Checks

The Automated Gate validates that the UI renders without horizontal scrollbar blowout or element clipping across 3 standard viewports:

| Viewport Tier | Width | Invariant Tested |
| :--- | :--- | :--- |
| **Mobile** | `375px` | Zero horizontal scroll (`window.innerWidth === document.documentElement.scrollWidth`); touch targets $\ge 44\times 44\text{px}$. |
| **Tablet** | `768px` | Clean navigation bar transition (hamburger or condensed); 2-up grid wrapping without card clipping. |
| **Desktop** | `1280px` | Maximum content width respected (`max-w-*` container); gutters absorb remaining space. |

### Failure Triggers:
- `document.documentElement.scrollWidth > window.innerWidth` (horizontal overflow blowout).
- Unwrapped inline text causing container expansion.
- Buttons or inputs overlapping or clipped below viewport boundaries.

---

## 4. Hard Gate Blocker Action

If either check fails:
1. **Zero Round Score**: Set round score to `0.0`.
2. **Flag in Ledger**: Mark status as `BLOCKED-SECURITY-HEADERS` or `BLOCKED-VISUAL-OVERFLOW`.
3. **Emit Actionable Directive**: Append the exact missing header directive or overflowing DOM node to `ITERATION_LEDGER.md` for the Builder to resolve in the next round.
