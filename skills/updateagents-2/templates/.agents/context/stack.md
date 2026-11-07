# 🛡️ Approved Tech Stack & Package Allowlist (Golden Stack Fence) — {{PROJECT_NAME}}

> **Operating Invariant**: This document is the inviolable stack boundary for {{PROJECT_NAME}}. Agents are strictly prohibited from introducing unapproved frameworks, styling libraries, state managers, or utility packages without explicit human authorization in an approved plan.

---

## 🏛️ Assigned Council Lead
- **Primary Council Lead**: Sol (Product Architect & Full-Stack Automator)
- **Review & Hardening Lead**: Nexus (Technical Director & Hardening Gate)
- **Design & Growth Lead**: Jasper (Creative Technologist & Conversion-Rate Optimization)
- **Operations Lead**: Crew (Client Delivery Specialist & Infrastructure)

---

## 1. Core Toolchain & Framework
- **Runtime**: Bun `@latest` (or Node.js LTS)
- **Primary Framework**: {{FRAMEWORK_DETAILS}}
- **Build Tool**: Native framework bundler (Vite / Next.js Turbopack / Astro compiler)
- **Testing Engine**: `bun:test` or Vitest (Zero Jest)
- **Linter & Formatter**: Biome `@latest` (Zero ESLint/Prettier sprawl)

---

## 2. Approved Libraries (Allowlist)

| Domain | Approved Package / Pattern | Version Policy | Strict Rule |
| :--- | :--- | :--- | :--- |
| **Styling** | UnoCSS Wind 4 presets / OKLCH DTCG tokens | `@latest` | No raw Tailwind CLI, Emotion, or Styled Components |
| **State** | Zustand / Nano Stores | `@latest` | Pure reactive stores; no Redux, MobX, or Recoil |
| **Data Fetching** | Native `fetch` + Zod schemas | Native / `@latest` | No Axios or Request wrappers |
| **Animations** | Motion.dev (`motion`) / CSS hardware presets | `@latest` | No legacy GSAP plugins unless explicitly licensed |
| **Validation** | Zod (`zod`) | `@latest` | Single source of truth for runtime contracts |
| **Icons** | Lucide React / Iconify | `@latest` | Tree-shakable SVG icons only |

---

## 3. Forbidden Dependencies (Blacklist)

Agents must NEVER install or import the following packages:
- ❌ `axios` — Use native `fetch` with typed responses.
- ❌ `lodash` / `underscore` — Use modern ES2024 native utilities (`Array.prototype.*`, `Object.*`, `structuredClone`).
- ❌ `moment` / `moment-timezone` — Use native `Intl` or `date-fns`.
- ❌ `redux` / `@reduxjs/toolkit` / `mobx` — Violates lightweight state invariant.
- ❌ `styled-components` / `@emotion/react` — Runtime CSS-in-JS is barred due to performance degradation.

---

## 4. Zero-Drift Dependency Invariant
1. **Approval Gate**: Before running `bun add <pkg>` or `npm install <pkg>`, the agent MUST state the package name, bundle weight, and why native platform capabilities are insufficient.
2. **Version Pinning**: All allowed dependencies resolve cleanly to `@latest` without pinned SHA references.
3. **Automated Verification**: Run `bun updateagents.ts --stack-guard` to verify 100% compliance with this allowlist.
