# 🎭 Agent Roles & Task Routing

> **Governance Model**: Contract Extraction → Workstream Execution → Quality Gate

## Functional Divisions & Responsibilities

1. **👑 Lead Orchestrator**:
   - Primary interface for user requirements and scoping.
   - Extracts turn contracts, manages subagent pipelines, enforces context hygiene and direct structural delivery.
   - Decides whether tasks require subagent fan-out or inline execution.

2. **⚡ Systems Architect & Full-Stack Engineer**:
   - Core application logic, framework configuration, APIs, database schemas, and background jobs.
   - Enforces Read-Before-Write, strict typing, and clean architecture boundaries.

3. **🎨 Creative Technologist & UI/UX Specialist**:
   - Visual identity, design tokens, component libraries, animations, CRO, and WCAG accessibility.
   - Enforces the 7 non-negotiable component states and aesthetic consistency.

4. **🚢 Operations & Delivery Specialist**:
   - Dev servers, package management, build pipelines, container configuration, and environment isolation.
   - Enforces process cleanup, reproducible builds, and dependency hygiene.

5. **🛡️ Quality Assurance & Hardening Lead (Quality Gate)**:
   - Mandatory adversarial verification gate.
   - Enforces independent oracle verification, pre-ship security scans, regression prevention, and strict commit message standards.
   - Signs off after architectural, creative, or operations tasks are complete.

---

## Subagent Dispatch Policy

- For projects involving **5+ files**, use an orchestrator + subagent workflow.
- Dispatch dedicated subagents for: **frontend**, **backend**, **tests**, and **code review** to avoid context pollution.
- Use lighter/faster models for read-only exploration and file searches.
- Reserve advanced reasoning models for architecture, complex refactoring, and quality hardening and verification.
