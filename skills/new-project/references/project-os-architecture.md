# Project Operating System & Progressive Disclosure DOX Architecture

## Overview
The **Project OS** architecture moves beyond treating LLMs as ephemeral chatbots by embedding them directly into a stateful, governed, and progressively disclosed development environment.

---

## The 4 Core Pillars

### 1. The Progressive Disclosure DOX Rail (`AGENTS.md`)
A lean root contract (~45 lines) that enforces Core Turn Invariants and acts as a routing table. Agents load in-depth standards only when an active task touches that specific domain:
- Universal Standards: Execution kernel, Vibeguard security, System design, Workflows, Git branching, DOX hierarchy, Council roles, Memory context.
- Framework Standards: Astro v7.2.x, Next.js 16, Hono/Workers, Instatic HTML.

---

### 2. Complete Containment (`./.agents/` 9-Folder Tree)
Guarantees zero temporary file clutter at the repository root:
- `archive/`: Timestamped retired plans & scratchpads (`[title]-[timestamp].md`).
- `artifacts/`: Active specifications, walkthroughs, and UI design diffs.
- `brand/`: Visual token schemas (OKLCH, typography, motion, radii) + BEM + A11y.
- `context/`: 7 durable files (`index`, `product`, `architecture`, `brand`, `current`, `decisions`, `roadmap`).
- `goals/`: Sprint milestones and verification checklists.
- `research/`: Technical research briefs and benchmark scans.
- `skills/`: Project-isolated turnkey agent skills.
- `standards/`: Modular rulebooks read on-demand.
- `workflows/`: Custom pipeline recipes.

---

### 3. Dual-Path Cognitive Memory
Clean separation of machine runtime state from human-and-agent verified system reality:
- **`.memory/CURRENT.md` (Machine / Real-Time)**: Owned by `musememory`. Contains active hard constraints, multi-agent collision workstreams, and session handoffs.
- **`./.agents/context/current.md` (Durable Shipped Reality)**: Contains verified shipped reality, live deliverables, runtime health oracle, and known gaps/placeholders.

---

### 4. Agency Council Governance & Nexus Quality Gate
- **👑 Muse**: Chief Agency Orchestrator leading turn contract extraction and task routing.
- **⚡ Sol**: Product Architecture, backend logic, APIs, database schemas.
- **🎨 Jasper**: Creative Technology, Design Systems, Motion, WCAG 2.2 AA.
- **🚢 Crew**: Operations, staging environments, package management, deployment.
- **🛡️ Nexus**: Mandatory quality hardening gate (Typecheck, Build, SecretScan, Conventional Commit check).
