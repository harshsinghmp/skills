# Skill Compatibility & Conflict Matrix Reference

> Reference guide for auditing multi-skill stacks, detecting contradictory prompt instructions, preventing token budget exhaustion, and enforcing the Minimal Viable Skill Set (MVSS).

---

## 1. Skill Interaction Taxonomy

When multiple agent skills are present in a workspace, their interaction falls into one of three classifications:

| Interaction Type | Definition | System Impact | Resolution Action |
| :--- | :--- | :--- | :--- |
| **Synergistic (Orthogonal)** | Skills operate across disjoint domains or sequential lifecycle stages with compatible constraints. | High leverage, clean task pipelining. | Allow both; pipeline sequentially or assign to distinct task phases. |
| **Redundant (Overlapping)** | Skills share identical or nested trigger domains (e.g., generic scaffolding vs comprehensive engine). | Token waste (1,500–5,000 tokens wasted), prompt dilution. | **Suppress Subordinate**: Retain dominant skill; silence redundant secondary skill. |
| **Conflicting (Contradictory)** | Skills prescribe mutually exclusive constraints (e.g., broad refactoring vs surgical diff discipline). | Agent hallucination, oscillating edits, broken tests. | **Precedence Override**: Enforce dominant constraint; explicitly suppress conflicting rule. |

---

## 2. Skill Compatibility & Conflict Matrix

Below is the pairwise compatibility matrix across standard agent skills:

| Active Skill Candidate | Co-Active Candidate | Interaction | Conflict / Overlap Description | Deterministic Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **`ai-ready`** | `new-project` | Redundant | Both attempt repository scaffolding and root context creation. | **Suppress `new-project` Stage 0**: `ai-ready` takes precedence as the single source of repository audit and readiness. |
| **`ai-ready`** | `updateagents` | Synergistic | `ai-ready` verifies baseline readiness; `updateagents` synchronizes ongoing cognitive memory. | **Sequential**: Run `ai-ready` audit first; invoke `updateagents` only if memory drift is detected. |
| **`code-review`** | Generic Refactor Skills | Conflicting | Generic refactor prompts encourage speculative code reorganization, whereas Linus/Karpathy demands surgical, minimal diffs. | **Override with Linus**: Linus/Karpathy surgical diff rule dominates. Disallow broad refactoring outside stated task scope. |
| **`git`** | Ad-Hoc VCS Prompts | Conflicting | Ad-hoc git prompts may attempt direct commits to `master` or unstructured messages. `git` enforces strict dev-branch staging and Conventional Commits. | **Suppress Ad-Hoc**: Route all VCS actions strictly through `git` lifecycle. Silence conflicting direct-commit instructions. |
| **`refactor-ui`** | Generic CSS / Styling Skills | Conflicting / Redundant | Generic UI prompts introduce decorative border clutter and arbitrary hex colors, violating Refactoring UI heuristics. | **Suppress Generic UI**: Enforce `refactor-ui` 11 heuristics and 5-state anti-slop coverage. |
| **`gauntlet-loop`** | Single-Shot Test Prompts | Synergistic | Single-shot tests provide early unit signals; `gauntlet-loop` provides bounded regression cycling. | **Pipeline**: Run fast unit checks locally; invoke `gauntlet-loop` at milestone hardening gate. |
| **`secretary`** | Autonomous Execution Skills | Synergistic / Supervisory | Autonomous skills move fast; `secretary` holds SHA-256 evidence approvals and dissent preservation. | **Supervisor Role**: `secretary` acts as quality gatekeeper. Tasks pass through secretary approval before merging. |
| **`coupling-router`** | Any Subagent Dispatch | Synergistic (Root) | `coupling-router` audits both task coupling and active skill compatibility prior to dispatching subagents. | **Root Prerequisite**: Must execute before launching parallel or pipelined worker agents. |

---

## 3. Skill Precedence Hierarchy

When conflicting instructions arise, skills must yield according to the following 5-tier precedence hierarchy:

```
┌────────────────────────────────────────────────────────┐
│ Tier 1: Governance & Verification                      │
│ (secretary, evidence-ledger, gauntlet-loop)            │
└───────────────────────────┬────────────────────────────┘
                            │ Dominates quality & safety
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 2: Review & Correctness Doctrine                  │
│ (code-review / Karpathy)                               │
└───────────────────────────┬────────────────────────────┘
                            │ Dominates diff scope & architecture
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 3: Architecture & Context Engines                 │
│ (coupling-router, ai-ready, agent-engine)              │
└───────────────────────────┬────────────────────────────┘
                            │ Dominates task routing & scaffolding
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 4: Domain Implementation Specialists              │
│ (refactor-ui, designscope, updatedocs, git)            │
└───────────────────────────┬────────────────────────────┘
                            │ Dominates feature execution
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 5: Ad-Hoc / Generic User Prompts                  │
│ (Unverified conventions, inline overrides)             │
└────────────────────────────────────────────────────────┘
```

---

## 4. Minimal Viable Skill Set (MVSS) Selection Algorithm

Before an orchestrator spawns subagents or begins a complex task, it applies the MVSS algorithm:

1. **Intake & Scope Mapping**:
   Map user request to core requirement domains:
   - $D \in \{\text{Scaffolding}, \text{UI/Design}, \text{Backend/API}, \text{Review}, \text{Testing}, \text{VCS/Release}\}$.
2. **Candidate Filtering**:
   Select candidate skills that directly map to active domains $D$. All unrelated installed skills are marked as **INACTIVE** (zero token injection).
3. **Redundancy & Conflict Suppression**:
   For candidate skills in the same or overlapping domains:
   - Identify dominant skill via the Precedence Hierarchy.
   - Mark subordinate skills as **SUPPRESSED**.
4. **Token Budget Verification**:
   - Total skill prompt injection must not exceed **6,000 tokens** ($\le 3$ active skills per subagent context).
   - If token budget is exceeded, prune Tier 4 domain skills into sequential phases rather than concurrent co-loading.
5. **Output Specification**:
   Record the resolved skill configuration in `ROUTING_PLAN.md`:
   ```markdown
   ### Active Skill Configuration (MVSS)
   - **Task Phase 1**: `ai-ready` (Primary) [Suppressed: `new-project`]
   - **Task Phase 2**: `refactor-ui` (Primary UI) [Suppressed: generic styling]
   - **Task Phase 3**: `code-review` (Quality Gate)
   - **Task Phase 4**: `git` (VCS Lifecycle)
   ```
