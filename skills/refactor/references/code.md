# 💻 refactor:code — Application Code & Function Refactoring Playbook

> **Executive Scope**: Method-level and file-level code refactoring, cyclomatic complexity reduction, SOLID principles, eliminating dead code, improving readability, and strengthening type safety without altering external behavior.

---

## 1. Core Principles of Code Refactoring

Code refactoring changes internal structure without changing observable behavior:
1. **Never Combine Refactoring with Feature Work**: Separate mechanical cleanup commits from behavioral changes.
2. **Test-Protected Refactoring**: Ensure tests exist and pass *before* touching code; rerun tests after every atomic transformation.
3. **Fail Fast & Return Early**: Invert nested `if-else` pyramids into guard clauses.
4. **Single Level of Abstraction (SLA)**: A function should do one thing at one level of conceptual abstraction.
5. **DRY with Discipline**: Extract duplicated logic only when the duplicate concepts represent the *same domain invariant*, not accidental similarity.

---

## 2. Common Code Smells & Transformations

### Smell A: The Arrow Anti-Pattern (Deep Nesting)
```typescript
// ❌ BAD: Deeply nested indentation
function processOrder(order: Order, user: User) {
  if (user.isActive) {
    if (order.items.length > 0) {
      if (user.hasValidPayment) {
        return chargeUser(user, order);
      } else {
        throw new Error("Invalid payment");
      }
    } else {
      throw new Error("Empty order");
    }
  } else {
    throw new Error("Inactive user");
  }
}

// ✅ REFACTORED: Guard clauses with early returns
function processOrder(order: Order, user: User) {
  if (!user.isActive) throw new Error("Inactive user");
  if (order.items.length === 0) throw new Error("Empty order");
  if (!user.hasValidPayment) throw new Error("Invalid payment");

  return chargeUser(user, order);
}
```

### Smell B: Primitive Obsession & Long Parameter Lists
```typescript
// ❌ BAD: Too many loose positional primitives
function createSubscription(userId: string, planId: string, durationMonths: number, discountCode: string, autoRenew: boolean, notifyEmail: boolean) { ... }

// ✅ REFACTORED: Typed Parameter Object
interface CreateSubscriptionParams {
  userId: string;
  planId: string;
  durationMonths: number;
  discountCode?: string;
  autoRenew: boolean;
  notifyEmail: boolean;
}
function createSubscription(params: CreateSubscriptionParams) { ... }
```

### Smell C: God Function / Feature Envy
- **Detection**: Functions > 40 lines, multiple responsibilities, high cyclomatic complexity ($V(G) > 10$).
- **Remedy**: **Extract Method**. Break into focused helper functions named after intent, not implementation details.

---

## 3. TypeScript & Type Safety Refactoring

- **Eliminate `any`**: Replace with `unknown`, discriminated unions, or generic type constraints.
- **Discriminated Unions over Loose Booleans**:
  ```typescript
  // ❌ BAD: Conflicting boolean flags
  interface State { isLoading: boolean; isError: boolean; data?: Data; error?: Error; }

  // ✅ REFACTORED: Finite State Union
  type State =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: Data }
    | { status: "error"; error: Error };
  ```
- **Immutability by Default**: Use `readonly` arrays and immutable state updates (`[...items]`, `{ ...props }`).

---

## 4. Verification Gate

- [ ] All unit tests pass with zero behavior regressions (`bun test`).
- [ ] Linter passes cleanly (`bun run lint`).
- [ ] TypeScript compiles with zero errors (`bun run type-check`).
- [ ] Cyclomatic complexity of touched functions reduced below 8.
- [ ] No `any` types introduced.
