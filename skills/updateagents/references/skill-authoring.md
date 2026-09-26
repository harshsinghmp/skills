# 🧪 Skill Authoring Protocol — TDD for Agent Instructions

> **Executive Scope**: Authoring agent skills as deterministic, test-driven systems. Translates the `writing-skills` Red-Green-Refactor loop into rigorous engineering practice for LLM instructions, prompt architecture, and behavioral boundary enforcement.

---

## 1. The Core Philosophy: Instructions are Code

Writing agent skills is not commercial copywriting; it is **instruction engineering**. 
Natural language in an agent skill is source code compiled by an LLM at inference time. If an instruction contains ambiguity, the LLM will rationalize shortcuts, bypass verification, hallucinate ungrounded assumptions, or expand scope unprompted.

Every rule, constraint, and workflow in a `SKILL.md` must be pressure-tested against adversarial evasion before being merged into production.

---

## 2. The TDD Cycle for Agent Instructions (Red-Green-Refactor)

Agent skill authoring follows the strict Red-Green-Refactor engineering cycle:

```
                  ┌─────────────────────────────────┐
                  │ 1. RED: Baseline Pressure Test  │
                  │ Create adversarial prompt where │
                  │ an agent fails without skill.   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ 2. GREEN: Minimal Constraint     │
                  │ Write the shortest rule that    │
                  │ stops the failure behavior.     │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ 3. REFACTOR: Loophole Closure   │
                  │ Plug rationalization loopholes  │
                  │ and compress token footprint.   │
                  └─────────────────────────────────┘
```

### Phase 1: RED — The Baseline Pressure Scenario
Never write an instruction assuming agents will obey it. First observe how they fail without it:
1. **Design an Adversarial Scenario**: Create a realistic coding task with temptations to cut corners (e.g. asking for a quick bugfix on a module that has broken tests, or a prompt asking to "make it cleaner").
2. **Execute in a Bare Agent Subshell**: Run the scenario with an unassisted subagent.
3. **Capture the Evasion Fingerprint**: Record the exact failure mode:
   - Did the agent alter existing tests to match buggy output?
   - Did the agent touch files outside the task scope?
   - Did the agent assert "tests pass" without running the test command?
   - Did the agent invent parallel directory structures?

### Phase 2: GREEN — Minimal Instruction Constraint
Write the leanest instruction that forces the agent onto the correct path:
1. **Target the Root Incentive**: Don't plead with the model; change its decision boundary.
2. **Deterministic Trigger & Action**: Use structured conditionals (e.g., `If modifying tests, verify spec authority first. If tests fail, fix the implementation, NEVER the test assertion`).
3. **Re-Test**: Execute the pressure scenario again. Verify that the agent now halts, asks the required question, or performs the verification command.

### Phase 3: REFACTOR — Anti-Rationalization & Loophole Closure
LLMs are adept at rationalizing why a rule doesn't apply to the current situation. Plug the leaks:
1. **Audit for Rationalizations**: Review the agent's internal thinking. Look for phrases like *"Since this is just a quick fix...", "To be helpful, I also refactored...", "The user wanted speed, so..."*.
2. **Add Explicit Negative Constraints**: Replace polite suggestions with hard negative boundaries ("NEVER do X even if Y").
3. **Token Minimization**: Strip conversational pleasantries. Move catalogs and tables into separate `references/<mode>.md` files so the core `SKILL.md` stays lean and token-efficient.

---

## 3. Anti-Rationalization Matrix

Use this matrix to close common loopholes when authoring or reviewing skills:

| Evasion Pattern | Agent Rationalization | Hardened Constraint |
|:---|:---|:---|
| **Premature Success** | *"I edited the file; tests will pass."* | **Evidence-First Gate**: Forbid declaring completion without executing the test command and inspecting live exit codes. |
| **Scope Creep** | *"While fixing this, I also modernized the styling."* | **Blast-Radius Bound**: Forbid editing any file outside the explicit task changeset. Unprompted refactors are bugs. |
| **Silent Mock Fallback** | *"The external API failed, so I returned sample data."* | **Fail-Fast Protocol**: Throw structured error immediately. Never fake network success or substitute mock state silently. |
| **Test Weakening** | *"The assertion failed, so I updated the expected value."* | **Spec Immutability Rule**: Tests and contracts are authoritative. Implementation bends to the spec, never vice versa. |
| **Unprompted Automation** | *"I ran a codebase-wide sweep/cleanup for consistency."* | **Strictly On-Demand Gate**: Large blast-radius operations (e.g. `simplify`, `sweep`) require explicit user invocation. |
| **Secret Commits** | *"I committed the .env file so the app runs."* | **Vibeguard Zero-Leak**: Mandate `.env` in `.gitignore`. Mask all tokens as `[REDACTED]`. Pre-commit secret scanning. |

---

## 4. The 4-Gate Extraction Protocol

When extracting recurring patterns into skills via `bun scripts/extract-skill.ts`, all 4 gates must pass:

1. **Gate 1: Recurrence Gate (`checkRecurrenceGate`)**:
   - Pattern must be observed across at least **4 distinct sessions or occurrences** (proven need, not an isolated preference).
2. **Gate 2: Verification Gate (`checkVerificationGate`)**:
   - The proposed solution must have passed an automated test suite or verification command (`bun test`, `pytest`, `cargo test`).
3. **Gate 3: Generalization Gate (`checkGeneralizationGate`)**:
   - Solution must be portable across macOS, Linux, and Windows.
   - Zero hardcoded home directories (`/home/...`, `/Users/...`), machine IPs, or credentials.
4. **Gate 4: TDD Engineering Gate (`checkTddEngineeringGate`)**:
   - Must document an adversarial pressure scenario (`--tdd-scenario "<scenario>"`) proving the agent fails without the skill and complies with it.

---

## 5. Token Budgeting & Section Discipline

Every extracted skill must conform to the RFC template and respect strict size budgets:

- **Target Size**: `< 5KB` (compressed, punchy, high instruction density).
- **Warning Ceiling**: `≥ 5KB`.
- **Hard Max**: `10KB` (split into modular `references/<mode>.md` before exceeding).
- **Format**:
  - `name`: kebab-case, matching directory name.
  - `description`: trigger-rich, naming explicit user intents and anti-triggers.
  - `When to Use`: Bulleted list of positive triggers and anti-triggers.
  - `Quick Reference`: Key decisions, commands, and tables.
  - `Procedure`: Numbered, deterministic steps.
  - `Pitfalls`: Common traps and negative constraints.
  - `Verification`: Reproducible test and audit commands.
