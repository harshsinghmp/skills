# 📖 Durable Project Context Index

> **Reading Directive**: Durable project truth lives in `./.agents/context/`. Start at this index, then load **only** the specific context file your active task requires.

---

## Context Navigation Map

| File | Scope & Contents | When to Read |
| :--- | :--- | :--- |
| [`product.md`](./product.md) | Product scope, core capabilities, and skill/subproject inventory | Understanding business domain and available features |
| [`architecture.md`](./architecture.md) | Repo layout, component anatomy, registries, and verification workflows | System design, directory structure, and technical components |
| [`brand.md`](./brand.md) | Voice, naming conventions, and presentation rules (Deep brand suite in `../brand/`) | Writing documentation, UI copy, marketing, and creative assets |
| [`accounts.md`](./accounts.md) | Zero-leak client accounts, asset delegation IDs, and integration status | Managing external platform access, DNS, and telemetry |
| [`current.md`](./current.md) | Verified shipped reality, live deliverables, health oracle & known gaps | Grounding on what actually exists and works before starting tasks |
| [`stack.md`](./stack.md) | Approved frameworks, runtime, libraries & package allowlist (Golden Stack Fence) | Before installing new packages, adding libraries, or choosing APIs |
| [`decisions.md`](./decisions.md) | Locked architectural decisions (do not reopen casually) | Evaluating technical choices or refactors |
| [`roadmap.md`](./roadmap.md) | Parked future work, planned sprints, and backlog | Sprint planning and scoping new features |

---

## Global Identity Baseline (`~/.agents/identity/`)

When local files do not specify an override, agents automatically inherit baseline preferences:
- [`user.md`](~/.agents/identity/user.md) — Principal superpowers and communication style.
- [`assistant.md`](~/.agents/identity/assistant.md) — Default Council orchestration stance (Sol, Jasper, Crew, Nexus).
- [`vision.md`](~/.agents/identity/vision.md) — Strategic life/venture trajectory and core operating values.
- [`rules.md`](~/.agents/identity/rules.md) — Global machine invariants and Vibeguard zero-leak security rules.
- [`stack.md`](~/.agents/identity/stack.md) — Host machine installed tools, CLI set (`rg`, `fd`, `bat`), and runtimes.

---

## Brand & Creative Directives (`./.agents/brand/`)

For deep creative, copywriting, and marketing execution, refer to the specialized brand files:
- [`voice.md`](../brand/voice.md) — Tone of voice, vocabulary do's/don'ts, anti-puffery rules.
- [`personas.md`](../brand/personas.md) — Ideal Customer Profiles (ICP), objections, and buyer criteria.
- [`positioning.md`](../brand/positioning.md) — Unique Value Proposition, competitive moat, category anchor.
- [`messaging.md`](../brand/messaging.md) — Elevator pitches, 3 core pillars, vetted claims ledger.
- [`visual-identity.md`](../brand/visual-identity.md) — Logo clear-space, art direction, and iconography.
- [`social-hooks.md`](../brand/social-hooks.md) — 5 content pillars, 15 viral hooks, distribution rules.
- [`tokens/`](../brand/tokens/) — W3C DTCG design tokens (OKLCH colors, typography, fluid clamp).
