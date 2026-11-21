# 🗺️ Terrain Map: Failure Patterns, Audit Signatures & Repro Commands

> **Purpose**: Pre-indexed catalog of common test failures, audit event signatures, and deterministic reproduction commands.

---

## 1. Deterministic Verification & Repro Commands
| Failure Domain | Repro Command | Expected Pass Condition |
|:---|:---|:---|
| **Full Test Suite** | `{{TEST_CMD}}` | 100% tests pass cleanly |
| **Isolated Test File** | `{{TEST_CMD}} tests/<target>.test.ts` | Target test file green |
| **Lint Violations** | `{{LINT_CMD}}` | Exit code 0, zero warnings |
| **Type Check Errors** | `{{TYPECHECK_CMD}}` | Clean compilation (`noEmit`) |
| **Secret Leaks** | `bun run secret-scan` | Zero credentials detected |

## 2. Common Failure Signatures & Cures
- **Missing Environment Variable**: Inspect `.env.example`, populate `.env` locally (never commit `.env`).
- **TypeScript Type Drift**: Run `{{TYPECHECK_CMD}}` to inspect exact line and missing interface field.
- **Port Collision**: If dev server fails on boot, run port probe or assign alternative port.
- **Dangling Test State**: Ensure tests clean up temporary files in `afterEach` or use sandbox directories.
