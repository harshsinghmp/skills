# 🌲 AST Attention Pinning Guide — Combating Orientation Burn & Attention Loss

> **Problem**: LLMs suffer from the U-shaped attention curve ("Lost in the Middle"). In long coding sessions, models strongly attend to the system prompt (beginning) and immediate user input (end), while middle context degrades by up to 60%. When an agent executes multiple orientation commands (`grep`, `find`, reading 10 full files), the model exhausts its sharpest attention on file orientation rather than the core business logic.

---

## 1. What is an AST Attention Pin?

An **AST Attention Pin** is a minimal, verbatim structural extraction of critical code interfaces, types, schemas, or function contracts placed directly in the active anchor (`.agents/anchor.md`).

Instead of re-reading an entire 800-line service file:
- The agent extracts ONLY the contract (interfaces, method signatures, return types, invariant docstrings).
- The full implementation body is replaced with `{ /* ... */ }`.
- The pin is stored with its source file path and line numbers.

### Pinned vs. Full File Dump Comparison:

| ❌ Full File Reading (Orientation Burn) | ✅ AST Attention Pin (Sharp Attention) |
| :--- | :--- |
| Reads 850 lines of `src/auth/session-manager.ts` (~3,500 tokens). | Pins 12 lines of `SessionToken` interface & `validateSession` signature (~65 tokens). |
| Attention degrades across internal loops, helpers, and comments. | Attention remains 100% focused on type constraints and contract boundaries. |
| Model hallucinates non-existent methods when middle turns fade. | Contract is anchored verbatim in the active anchor. |

---

## 2. Pinned Extraction Standards

### TypeScript / JavaScript Standards:
Extract only `interface`, `type`, or function signatures:
```typescript
// [PIN: src/auth/types.ts#L14-L24]
export interface SessionEnvelope {
  sessionId: string;
  userId: string;
  roles: Array<"admin" | "editor" | "client">;
  expiresAt: number;
  tokenHash: string;
}

// [PIN: src/auth/service.ts#L45-L52]
export declare function verifySessionToken(
  token: string,
  options?: { requireMfa?: boolean; clientIp?: string }
): Promise<SessionEnvelope>;
```

### Python Standards:
Extract class declarations, dataclasses, Pydantic models, or function signatures with type hints:
```python
# [PIN: app/models/client.py#L12-L21]
class ClientContract(BaseModel):
    client_id: str
    monthly_allowance_usd: float
    deemed_acceptance_days: int = 7
    status: Literal["active", "frozen", "pending_deposit"]

def evaluate_spend(client_id: str, spend_usd: float) -> bool: ...
```

---

## 3. The 3 Invariants of AST Pinning

1. **Strict Line Cap ($\le 30$ lines total)**: Pinned AST snippets in `.agents/anchor.md` must not exceed 30 lines combined. Pin only the 1–3 interfaces directly relevant to the current `Next Action`.
2. **Source Grounding**: Every pin must include the relative source file path and exact line range (`// [PIN: path/to/file.ts#L10-L25]`).
3. **No Implementation Bodies**: Never include function bodies, loops, or internal conditionals. Replace all logic blocks with `{ /* ... */ }` or `...`.
