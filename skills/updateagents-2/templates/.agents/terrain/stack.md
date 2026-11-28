# 🗺️ Terrain Map: Pinned Stack & Runtime Toolchain

> **Purpose**: Pre-indexed technical toolchain map for agents to execute builds, tests, and scripts with zero filesystem probing.

---

## 1. Runtime Environment
- **Primary Runtime Target**: {{RUNTIME_TARGET}}
- **Node.js Version**: {{NODE_VERSION}}
- **Package Manager**: {{PACKAGE_MANAGER}}
- **Module System**: ESM (`"type": "module"`)

## 2. Core Framework & Target Architecture
- **Framework**: {{FRAMEWORK}}
- **Language**: TypeScript (`tsc --noEmit`)
- **Build Tool**: {{BUILD_TOOL}}
- **State Architecture**: {{STATE_MGMT}}
- **Database / ORM**: {{DATABASE_LAYER}}

## 3. Canonical Build Scripts
| Command | Execution String | Verification Gate |
|:---|:---|:---|
| **install** | `{{INSTALL_CMD}}` | Dependencies installed with frozen lockfile |
| **dev** | `{{DEV_CMD}}` | Local development server boots cleanly |
| **build** | `{{BUILD_CMD}}` | Production bundle builds without errors |
| **test** | `{{TEST_CMD}}` | Test suite executes and reports passes/failures |
| **lint** | `{{LINT_CMD}}` | Static analysis passes with zero violations |
| **type-check** | `{{TYPECHECK_CMD}}` | TypeScript compilation emits zero errors |
| **secret-scan** | `bun run secret-scan` | Pre-ship secret audit passes with zero leaks |
