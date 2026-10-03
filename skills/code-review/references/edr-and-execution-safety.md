# 🛡️ code-review:edr-and-execution-safety — Antivirus/EDR Heuristics & Runtime Execution Safety

This reference codifies detection and prevention of code patterns that trigger false-positive alerts in enterprise Endpoint Detection & Response (EDR) platforms (Windows Defender, CrowdStrike Falcon, SentinelOne) or introduce silent runtime corruption.

---

## 1. Antivirus & EDR Heuristic Guardrails

Enterprise EDR systems and cloud security monitors inspect process trees, memory allocation, and script payloads using behavioral machine learning. Developer tools and automated agents frequently trip these alarms when using naive automation techniques.

### Rule 1: Zero Dynamic Code Evaluation (`eval()` and `new Function()`)
- **Vulnerability**: EDR flags dynamic execution as a Living-off-the-Land (LotL) memory injection or dropper payload.
- **Invariant**: Strictly ban `eval()`, `new Function(...)`, and `setTimeout("string", ...)` across all production and test code.
- **Remediation**: Use deterministic abstract syntax tree parsers, JSON parsing, or strongly-typed static dispatch tables.

### Rule 2: No Inline Packed Base64 Payloads
- **Vulnerability**: Inlining large Base64 blobs (>512 bytes) inside source files mimics packed malware stages and obfuscated shellcode, triggering static signature matches (e.g. `Trojan:Win32/Wacatac.B!ml`).
- **Invariant**: Binary assets, fonts, icons, and test fixtures must be saved as standalone files under `assets/` or `fixtures/` and read via standard file I/O.

### Rule 3: No Script Dropping in Temporary Directories
- **Vulnerability**: Writing shell scripts (`.sh`, `.bat`, `.ps1`) into `/tmp` or `AppData\Local\Temp` and executing them directly is the canonical signature of dropper trojans.
- **Invariant**: Never write and execute dynamic scripts in temporary directories.
- **Remediation**: Execute operations in-process via language APIs or execute pre-existing, version-controlled scripts from the repository `scripts/` directory.

### Rule 4: Ban on Interactive Shell Spawning & LOLBins
- **Vulnerability**: Spawning interactive or encoded shells (`powershell -enc`, `bash -i`, `cmd.exe /c certutil ...`) trips process-tree behavioral alarms.
- **Invariant**: Always invoke explicit target binaries directly with structured argument arrays using `spawnSync` or `execFile` without shell wrapping (`shell: false`).

---

## 2. Runtime Execution Pitfalls

### Rule 5: Cryptographically Secure Randomness
- **Vulnerability**: Using `Math.random()` to generate authentication tokens, session identifiers, password reset nonces, or encryption keys.
- **Invariant**: `Math.random()` is strictly banned in all security-sensitive and token-generation contexts.
- **Remediation**: Use `crypto.randomBytes(n)` or `crypto.getRandomValues(new Uint8Array(n))`.

### Rule 6: Floating-Point Financial Arithmetic
- **Vulnerability**: IEEE 754 floating-point math causes precision loss (`0.1 + 0.2 === 0.30000000000000004`), corrupting billing, invoices, and token ledgers.
- **Invariant**: Never store or calculate currency using raw floating-point numbers.
- **Remediation**: Use integer minor units (e.g. cents, satoshis) or specialized decimal math libraries (`decimal.js`).

### Rule 7: Regular Expression Denial of Service (ReDoS)
- **Vulnerability**: Nested quantifiers (`(a+)+$`) cause exponential backtracking when matching adversarial inputs, freezing the Node.js event loop.
- **Invariant**: Regular expressions matching untrusted user inputs must be verified linear-time.

### Rule 8: Unhandled Floating Promises
- **Vulnerability**: Calling asynchronous functions without `await` or `.catch()` causes unhandled rejections that terminate Node.js runtime processes.
- **Invariant**: Every Promise must be explicitly awaited or bound to a rejection handler.

### Rule 9: Edge Runtime Node.js Built-In Isolation
- **Vulnerability**: Importing Node.js built-ins (`fs`, `child_process`, `net`, `tls`, `dns`, `cluster`, `v8`, `vm`) in Cloudflare Workers, Vercel Edge, or edge middleware throws fatal runtime exceptions upon initialization.
- **Invariant**: Edge runtime modules (`export const runtime = "edge"` or worker entry points) must strictly use Web Standard APIs (`fetch`, `crypto`, `Streams`).

### Rule 10: Server-Side Rendering (SSR) Browser Global Leakage
- **Vulnerability**: Direct access to browser globals (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`) during React Server Components / SSR execution crashes page rendering with `ReferenceError: window is not defined`.
- **Invariant**: Browser globals must either be confined to `"use client"` modules or guarded with `typeof window !== "undefined"`.

### Rule 11: Supply Chain Lifecycle Script Droppers
- **Vulnerability**: Malicious npm packages execute dropper commands (`curl`, `wget`, `bash -c`, `sh -c`, `powershell`, piping to shell) inside `preinstall`, `install`, or `postinstall` hooks.
- **Invariant**: Package scripts must never execute remote shell droppers or unvetted binary downloaders during installation.

---

## 3. Conventional Comments Standard

To avoid reviewer alert fatigue and communication stalls, all review findings must carry a standardized prefix:

- **`blocker:`** — Critical defect, bug, or invariant violation that MUST be resolved before merge.
- **`security:`** — Vulnerability, credential leak, or EDR/execution safety violation. Immediate reject.
- **`nitpick:`** — Non-blocking aesthetic or stylistic suggestion. Author may choose to adopt or defer.
- **`question:`** — Request for clarification on domain intent or edge-case handling.
- **`chore:`** — Mechanical cleanup, documentation sync, or version bump required before release.

---

## 4. Automated CLI Engine (`code-review.ts`)

Run the automated review analyzer:

```bash
# 1. Audit EDR & execution safety triggers across a target directory
bun skills/quality-review/code-review/scripts/code-review.ts --audit-edr-safety [path]

# 2. Audit runtime pitfalls (Math.random, floating-point math, eval, floating promises)
bun skills/quality-review/code-review/scripts/code-review.ts --audit-runtime-pitfalls [path]

# 3. Audit Edge runtime and SSR boundary violations (Node built-ins, window leakage)
bun skills/quality-review/code-review/scripts/code-review.ts --audit-edge-ssr [path]

# 4. Audit package.json lifecycle scripts for dropper / malicious command execution
bun skills/quality-review/code-review/scripts/code-review.ts --audit-lifecycle-scripts [path]

# 5. Audit Conventional Comments compliance in a review document or PR body
bun skills/quality-review/code-review/scripts/code-review.ts --audit-conventional-comments <file.md>

# 6. Audit lockfiles for poisoned or non-standard package registry URLs
bun skills/quality-review/code-review/scripts/code-review.ts --audit-lockfile [path]

# 7. Run consolidated audit across all 5 dimensions
bun skills/quality-review/code-review/scripts/code-review.ts --audit-all [path]
```

