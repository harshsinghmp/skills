# 🧭 Onboarding & Identity Interview Protocol

The **Onboarding Engine** provisions and updates the two-tier identity architecture across `muse-skills`:
1. **Global Identity Tier (`~/.agents/identity/`)**: Configured once per developer machine.
2. **Local Project Context Tier (`./.agents/context/`)**: Configured on Day 0 or first run of `updateagents` in a workspace.

---

## 1. Multi-Channel Execution

Onboarding runs seamlessly across three interfaces with identical question structures and output schemas:

| Interface | Invocation | Target Scope |
| :--- | :--- | :--- |
| **Conversational Agent** | `secretary:onboard` or `updateagents:onboard` | Global (`--global`) or Project (`--project`) |
| **Terminal CLI Wizard** | `bun run setup --onboard` or `bun updateagents.ts --interview` | Global or Project (interactive prompt) |
| **Remote One-Liner** | `curl -fsSL https://.../install.sh \| bash -s -- --onboard` | Global machine initialization |

---

## 2. Global Identity Interview (`~/.agents/identity/`)

Runs when a developer first configures their agent ecosystem or executes global onboarding.

### Question Matrix:

#### Q1: Principal Identity (`user.md`)
- **Name / Handle**: Preferred name and online handle (e.g. `Harsh / harshsinghmp`).
- **Domain Superpowers**: Core areas of technical, creative, or architectural excellence (e.g. Full-stack TypeScript, high-performance systems, growth engineering).
- **Communication Style**: Concise vs. detailed, direct vs. conversational, strict verification expectations.

#### Q2: Assistant Persona & Council Stance (`assistant.md`)
- **Default Assistant Identity**: Primary assistant name (e.g. `Muse`).
- **Operating Council Stance**: Delegation across the 4 specialized agency divisions:
  - **Sol**: Product Architecture, APIs, database modeling, and full-stack engineering.
  - **Jasper**: UI/UX design, visual hierarchy, conversion copywriting, and animations.
  - **Crew**: Client onboarding, operations, multi-client isolation, and maintenance.
  - **Nexus**: Hardening gate, security audits, and regression testing.
- **Autonomy Level**: Highly proactive (proceed with verified steps) vs. consultative (ask before every non-trivial step).

#### Q3: Strategic Vision & Trajectory (`vision.md`)
- **Current Coordinates**: Where you are today (active projects, primary business/learning bottlenecks, core focus).
- **Target Vision**: Your 1-year and 3-year vision of success.
- **90-Day Trajectory**: Top 1–3 non-negotiable milestones to achieve this quarter.
- **Operating Values**: Personal principles and non-negotiable standards (e.g. evidence before claims, zero slop, ruthless simplicity).

#### Q4: Machine Rules & Invariants (`rules.md`)
- **Toolchain Preferences**: Pinned package manager (`bun`, `pnpm`, `npm`), preferred frameworks (Astro, Next.js).
- **Security & Privacy**: Zero-secret credential leakage policies, local-only test files, private repository rules.

### Output Artifacts:
```
~/.agents/identity/
├── user.md                # Principal background & communication style
├── assistant.md           # Assistant persona & Council Lead delegation
├── vision.md              # Current Reality ➔ Target Vision ➔ 90-Day Milestones
└── rules.md               # Global machine invariants & security rules
```

---

## 3. Local Project Onboarding (`./.agents/context/`)

When `updateagents` runs in a new or existing repository, it evaluates if project context is initialized.

### Silent Auto-Inheritance Protocol:
1. **Global Identity Detected (`~/.agents/identity/`)**:
   - **Silent Auto-Inheritance (Zero Interrogation)**: Baseline principal background, assistant persona, and global invariants are inherited automatically.
   - **Optional Override Gate**: Asks only: *"Add project-specific overrides for this workspace? [y/N] (default: N)"*. If skipped, 0 questions are asked.
2. **Global Identity Absent**:
   - Logs an informative tip: *"Global identity not detected (~/.agents/identity/). Run 'updateagents --onboard --global' or 'secretary:onboard' anytime."*
   - Operates with clean project defaults.

### Project Questionnaire:
1. **Product Scope & ICP (`product.md`)**:
   - What specific problem does this repository solve?
   - Who is the ideal customer or user?
   - What is the unfair competitive wedge or defensibility?
2. **Current Shipped Reality (`current.md`)**:
   - What is verified and running right now?
   - What are the active placeholders, mock data, or blockers?
3. **Sprint Trajectory (`roadmap.md`)**:
   - What are the immediate 30-day and 90-day deliverable targets?
4. **Project Constraints (`architecture.md` & `decisions.md`)**:
   - What are the non-negotiable tech stack choices or API boundaries?
   - Is there a project-specific persona or client identity? (`./.agents/identity/project-persona.md`)

---

## 4. Draft Resumption & Non-Destructive Storage

If an interview is interrupted, answers are staged to:
- Global: `~/.agents/identity/.draft.json`
- Project: `./.agents/context/.draft.json`

When re-invoked, the engine detects the draft and prompts:
> *"Found an in-progress onboarding draft from [timestamp]. Resume where you left off? [Y/n]"*

Upon final confirmation, the draft is compiled into clean markdown files and the `.draft.json` file is removed.
