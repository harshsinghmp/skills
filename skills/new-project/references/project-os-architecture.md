# Project Operating System Architecture Reference

## Overview
The **Project OS** architecture moves beyond treating LLMs as ephemeral chatbots by embedding them directly into a stateful, governed development environment.

---

## The 4 Core Pillars

### 1. The 10 Canonical Project Sources (`/docs/`)
Durable, version-controlled Markdown files serving as the authoritative single source of truth:
1. `01_OVERVIEW.md`: Scope, business objectives, and KPIs.
2. `02_ARCHITECTURE.md`: Stack specifications, runtime topology, directory layout.
3. `03_ESCALATION_RULES.md`: Ponytail anti-overengineering hierarchy.
4. `04_DESIGN_SYSTEM.md`: Typography, HSL/OKLCH color ramps, motion guidelines.
5. `05_DECISION_LOG.md`: Architectural Decision Records (ADRs).
6. `06_ENVIRONMENTS.md`: Local, staging, and production environment configs.
7. `07_RUNTIME_STATE.md`: Real-time snapshot of active packages and migrations.
8. `08_WORKSTREAMS.md`: Active tasks mapped to council divisions.
9. `09_HARNESS_PROBES.md`: Playwright and deterministic contract probes.
10. `10_UNRESOLVED.md`: Parking lot for open questions and future ideas.

---

### 2. The 8-Stage Reality Machine (`STATE.md`)
Prevents discussion from hallucinating into implementation:

```
[PROPOSED] → [APPROVED] → [LOCAL_DEV] → [LOCAL_VERIFIED] → [STAGING_DEPLOYED] → [STAGING_VERIFIED] → [PROD_DEPLOYED] → [PROD_VERIFIED]
```

---

### 3. Agency Council Governance (`AGENTS.md`)
- **👑 Muse**: Chief Agency Orchestrator & Principal Co-Pilot.
- **⚡ Sol**: Full-Stack Architecture, APIs, AI streaming, logic.
- **🎨 Jasper**: Creative Technology, Design Systems, Motion, CRO.
- **🚢 Crew**: Operations, Environments, Deployment Pipelines.
- **🛡️ Nexus**: Hardening Gate, TypeScript, Build, Playwright Probes, SecretScan.

---

### 4. Nexus Adversarial Verification Suite
- **Deterministic Check**: 0 TypeScript errors + 0 linter errors + clean production build.
- **Visual & Runtime Probes**: Playwright headless browser runs against local/staging checking HTTP status and DOM selectors.
- **Vibeguard Protocol**: Zero secret leakage scan prior to shipping.
