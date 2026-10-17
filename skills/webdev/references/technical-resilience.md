# technical-resilience — Subprocess Zombie Sanitizer, Typosquatting Shield & SSR Hydration Guard

This reference codifies three critical technical safeguards for agency web engineering:

1. **Subprocess Zombie & Port Locking Sanitizer (`EADDRINUSE`)**: Safely detects and terminates dangling child processes before launching development servers.
2. **Package Typosquatting & Hallucination Guard**: Audits requested npm/bun dependencies against hallucinated names and malicious packages before installation.
3. **SSR Hydration Boundary Guard**: Prevents build-breaking and hydration-crashing browser global access (`window is not defined`) in SSR frameworks (Next.js, Astro, Remix).

---

## 1. Subprocess Zombie & Port Locking Sanitizer

### The Defect
When AI agents or local developers terminate background dev servers (`astro dev`, `next dev`, `vite`, `remix dev`), child node processes frequently remain orphaned, holding TCP sockets open. Subsequent execution immediately crashes with `Error: listen EADDRINUSE: address already in use :::3000`.

### The Invariant
Before launching any local server or port-bound service, the agent **MUST** verify port availability. If an orphaned zombie process is occupying the port without an active IDE session, it must be cleanly signaled (`SIGTERM` → `SIGKILL`) to release the socket.

### Standard Dev Ports
- `3000`: Next.js, Node.js APIs
- `4321`: Astro
- `5173`: Vite
- `8080`: Backend proxies / Go / Python

---

## 2. Package Typosquatting & Hallucinated Dependency Guard

### The Defect
LLMs frequently hallucinate nonexistent package names when attempting to install libraries (e.g., hallucinating `drizzle-orm-pg` instead of `drizzle-orm` + `pg`, or `react-query-v5` instead of `@tanstack/react-query`). Furthermore, malicious actors publish typosquatted packages (e.g., `cross-env-js`, `lodahs`) to steal environment credentials.

### The Invariant
Every dependency to be installed via `bun add` or `npm install` **MUST** pass the Typosquatting & Hallucination Guard:
1. Verify package existence on the official registry.
2. Detect hallucinated compound names (e.g. `<pkg>-v5`, `<orm>-<driver>`).
3. Ensure no unvetted typosquat variations of tier-1 libraries (`react`, `express`, `tailwind`, `zod`, `drizzle`).

---

## 3. SSR Hydration Boundary Guard (`window is not defined`)

### The Defect
In modern SSR/SSG environments (Next.js App Router, Astro, SvelteKit), components execute on the server during pre-rendering. Calling browser-only globals (`window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `location`) in the root component body crashes the server with `ReferenceError: window is not defined` or causes hydration mismatches in the client.

### The Invariant
Browser globals **MUST NEVER** be accessed during top-level component render. They must be quarantined inside:
- React: `useEffect(() => { ... }, [])` or custom hooks with `typeof window !== 'undefined'`.
- Astro: `<script>` tags or `client:only` directives.
- Guard check: `if (typeof window !== 'undefined') { ... }`.

---

## CLI Commands (`webdev.ts`)

```bash
# 1. Check and sanitize dev ports (3000, 4321, 5173, 8080)
bun skills/agency-delivery/webdev/scripts/webdev.ts --port-check
bun skills/agency-delivery/webdev/scripts/webdev.ts --port-clean 3000

# 2. Verify package safety before install
bun skills/agency-delivery/webdev/scripts/webdev.ts --verify-package drizzle-orm
bun skills/agency-delivery/webdev/scripts/webdev.ts --verify-package drizzle-orm-pg

# 3. Scan codebase for SSR hydration boundary violations
bun skills/agency-delivery/webdev/scripts/webdev.ts --ssr-boundary-scan ./src
```
