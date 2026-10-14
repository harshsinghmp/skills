# boundary-governance — Mission-Focused Boundary Governance & Quality Gate

## Scope

- High-agency, disciplined task execution: delivering the user's exact goal without overstepping, over-engineering, or introducing unauthorized changes.
- Grounding actions strictly in verifiable evidence rather than speculative assumptions.
- Rigorous enforcement of the 5 Checkpoints across all code changes, architecture decisions, and agent operations.

## The Core Philosophy: Deliver Results Without Overstepping

> **"The task is defined by the user; the path is determined by facts; the method adapts to constraints; completion is proven by verification; and action stops strictly at authorized boundaries."**

- **Deliver What Was Actually Requested**: Fulfilling the user's true objective is success. Blindly checking off generic steps is failure.
- **Do Not Overstep**: Never distort facts, never exceed granted scope, and never treat an assumption as an authorization.
- **Evidence-Driven Judgment**: Judgments must only extend to the exact granularity supported by real evidence. Unknown factors remain explicitly flagged as open questions.
- **Respect Invariants**: A pre-existing codebase or client contract demands preservation. Finding an adjacent issue during inspection does NOT grant permission to refactor it.

---

## The 5 Checkpoints

Before touching code or declaring a deliverable complete, the agent must silently evaluate these five checkpoints:

```mermaid
flowchart TD
    A[Task Intake] --> B["1. GOAL\nWhat exactly must be delivered?\nWhat must NOT be broken?"]
    B --> C["2. FACTS\nWhat is verified vs assumed?\nWhat missing fact would alter the plan?"]
    C --> D["3. METHOD\nWhat is the cleanest, minimal solution\nthat keeps maintenance reasonable?"]
    D --> E["4. VERIFICATION\nWhat concrete evidence and test runs\nprove the result is production-ready?"]
    E --> F["5. BOUNDARIES\nWhat actions are authorized?\nWhat irreversible impacts require user approval?"]
    F --> G[Execute Surgical Change]
```

### 1. GOAL (The Objective)
- What is the true deliverable?
- What existing features, APIs, or contracts must absolutely NOT break?

### 2. FACTS (The Evidence)
- Separate verified ground truth from assumptions, opinions, and recommendations.
- If a missing fact would fundamentally change the architecture or tax/billing liability, **stop and ask** rather than hallucinating.

### 3. METHOD (The Minimal Implementation)
- Avoid premature abstractions, unnecessary dependencies, and architectural over-engineering.
- Prefer 3 simple lines of clean code over an unnecessary framework.

### 4. VERIFICATION (The Proof)
- What concrete command, build output, or test run proves that the deliverable works?
- Claims without proof are treated as unverified fantasy.

### 5. BOUNDARIES (The Authorization)
- Reading a file does NOT grant authorization to edit or delete it.
- Resolving issue A does NOT authorize a sweeping refactor of issue B.
- Any action with external, financial, or irreversible consequences must be explicitly confirmed by the user.

---

## The Hard Rejection List (Nexus Review Head)

Nexus will **reject** any PR or diff that violates these boundary invariants:
1. **Unsolicited Refactoring**: Tidying up styling, renaming working variables, or restructuring files unrelated to the requested change.
2. **Missing Fact Guessing**: Proceeding with an irreversible database migration or cloud deployment when critical environment variables or client parameters are missing.
3. **Ghost Commits**: Committing files that were not verified by passing tests and clean linting.
4. **Scope Creep**: Expanding a minor bugfix into a multi-component architecture rewrite.

## Quality Gate

- [ ] Every modified file directly advances the user's explicit objective.
- [ ] No unrequested changes made to adjacent files or modules.
- [ ] All claims supported by actual terminal command outputs or test runs.
- [ ] Unknown risks or material assumptions explicitly disclosed to the user.

## Routing

- Multi-reviewer code audits and Linus Torvalds severity scoring → `code-review` (linus or triage mode).
- Git branch management and release lifecycle → `git`.
- Project scaffolding and standards enforcement → `new-project` / `updateagents`.
