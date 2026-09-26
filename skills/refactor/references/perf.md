# ⚡ refactor:perf — Runtime Performance & Bundle Optimization Playbook

> **Executive Scope**: Runtime execution bottlenecks, memory leak mitigation, bundle size trimming, tree-shaking, component rendering overhead, and DOM virtualization.

---

## 1. Performance Diagnostics & Measuring First

Never refactor for performance based on assumptions. Always benchmark before and after:
```bash
# Profile CPU and memory in Bun/Node:
bun --inspect ...

# Check client bundle sizes in Vite / Next.js:
npx @next/bundle-analyzer
```

---

## 2. Core Performance Refactoring Playbooks

### A. Algorithmic Complexity ($O(n^2) \rightarrow O(n)$)
- **Anti-Pattern**: Nested loops searching arrays (`array.find()` or `array.includes()` inside another loop).
- **Refactoring**: Build a `Map` or `Set` index first ($O(n)$ build, $O(1)$ lookup):
  ```typescript
  // ❌ $O(n \times m)$
  const matches = users.filter(u => bannedIds.includes(u.id));

  // ✅ $O(n + m)$
  const bannedSet = new Set(bannedIds);
  const matches = users.filter(u => bannedSet.has(u.id));
  ```

### B. Memory Leak Prevention & Event Teardowns
- **Anti-Pattern**: Unbound event listeners, polling timers, or WebSocket subscriptions in components or services.
- **Refactoring**: Always return cleanup functions in hooks and life cycles; use `AbortController` for cancellable async fetches:
  ```typescript
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  // on unmount / teardown:
  controller.abort();
  ```

### C. Bundle Size Trimming & Dynamic Imports
- **Anti-Pattern**: Importing massive libraries (Lodash, Moment.js, heavy charting/editor packages) in the initial bundle.
- **Refactoring**:
  - Replace `lodash` with native JavaScript methods or targeted subpath imports (`lodash-es/debounce`).
  - Dynamic imports for heavy below-the-fold components:
    ```typescript
    const HeavyEditor = dynamic(() => import("./HeavyEditor"), { ssr: false });
    ```

### D. Rendering Over-Execution & Virtualization
- **Anti-Pattern**: Rendering lists of 100+ DOM elements at once, causing Main Thread layout thrashing and severe input delay (INP).
- **Refactoring**: Introduce list virtualization (`@tanstack/react-virtual` or windowing) so only elements in viewport are rendered.

---

## 3. Verification Gate

- [ ] Microbenchmarks prove measurable latency / throughput improvement.
- [ ] Bundle analyzer confirms no accidental duplicate dependencies or bloated chunks.
- [ ] Memory profile confirms stable heap size without dangling references under load.
- [ ] All existing tests continue to pass without regression.
