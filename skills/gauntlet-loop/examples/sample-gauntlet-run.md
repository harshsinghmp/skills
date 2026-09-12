# Sample Gauntlet Loop Run (Web Application Hardening)

## GAUNTLET_JOB_CONTRACT.md

```markdown
# Gauntlet Job Contract: Next.js Auth Portal Hardening

- **Goal**: Refactor authentication portal with strict session expiration, security headers, and responsive layouts.
- **Criteria**:
  - [x] Session tokens expire after 15 minutes of inactivity.
  - [x] OWASP security headers verified (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - [x] Responsive layout verified at 375px, 768px, and 1280px with zero horizontal scroll overflow.
- **Proof Commands**:
  - `bun test tests/auth.test.ts`
  - `curl -s -I http://localhost:3000 | grep -Ei "(content-security-policy|strict-transport-security|x-frame-options)"`
- **Max Iterations**: 3
```

---

## ITERATION_LEDGER.md

```markdown
### Round 1
- **Candidate**: Implemented session expiration in `src/auth.ts`.
- **Automated Gate**:
  - Unit tests: PASS (14/14 tests).
  - Security Headers: FAIL (Missing `Content-Security-Policy` and `X-Frame-Options`).
  - Viewports: FAIL (Horizontal blowout at 375px due to wide table).
- **Critic Score**: 0.0 / 10.0 (BLOCKED by Automated Gate).
- **Action**: Proceed to Round 2. Prompt: Add CSP/X-Frame-Options to middleware, wrap table in responsive overflow container.

### Round 2
- **Candidate**: Added security headers to `middleware.ts`, added `overflow-x-auto` to table container.
- **Automated Gate**:
  - Unit tests: PASS (16/16 tests).
  - Security Headers: PASS (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy present).
  - Viewports: PASS (375px: 0px overflow, 768px: clean 2-col wrap, 1280px: max-w respected).
- **Critic Score**: 9.5 / 10.0
  - Correctness: 9.8
  - Minimal Diff: 9.4
  - Edge Cases: 9.5
  - Cleanliness: 9.3
- **Action**: Score >= 9.0 -> TERMINATE (SUCCESS).
```

---

## ACCEPTANCE_PACKET.md

```markdown
# Acceptance Packet: Next.js Auth Portal Hardening

- **Verdict**: ACCEPTED (Round 2 Score: 9.5/10.0)
- **Rounds Executed**: 2 / 3
- **Receipts**:
  - `bun test tests/auth.test.ts` exited 0 (16 tests passed).
  - Security headers verified via curl receipt (`CSP: default-src 'self'`).
  - Mobile viewport `375px` confirmed zero horizontal scroll (`scrollWidth === innerWidth`).
- **Diff Summary**: +34 lines, -6 lines in `src/auth.ts` and `middleware.ts`.
```
