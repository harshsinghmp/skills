# discovery — Developer customer discovery via Technical Advisory Board (TAB)

> Validates ICP, core problem, and status quo through structured technical advisory interviews without pitching. Turns `[assumption]` tags into `[validated]` facts in `.agents/context/product.md`.

---

## Intake

- `./.agents/context/product.md`: Current ICP, core problem, status quo, and assumptions to test.
- Target technical roles to interview (e.g., Staff Engineers, DevOps Leads, Tech Leads, Engineering Directors).
- Minimum interview target: 5 non-affiliated technical practitioners (never friends or colleagues).
- Default stack: Recorded transcripts, synthesis in `.agents/artifacts/discovery-<topic>-<date>.md`, and updates to `.agents/context/product.md`.

---

## Deliverable

A structured **Technical Discovery Synthesis**:
1. **Persona & Workflow Matrix**: Real titles, stack environments, daily bottlenecks.
2. **Status Quo Breakdown**: What tools or scripts they use today, why they stick with them, and the breaking threshold.
3. **The Real Villain**: Verbatim phrases describing the root failure mode (never marketing words).
4. **Willingness-to-Pay / Switch Signals**: Actual past budget spent or time invested trying to fix the problem.
5. **Context Sync**: Pull requests or direct updates converting `[assumption]` to `[validated]` in `.agents/context/product.md`.

---

## Procedure

### 1. Frame as Advisory, Never a Pitch
- Never invite a technical practitioner to a "demo" or "sales conversation."
- Use the **Technical Advisory Board (TAB)** invitation frame:
  > *"We're doing architecture research on how engineering teams handle [specific technical bottleneck] in [tech stack]. Not selling anything—looking for 20 minutes of technical advice on how your team tackles this."*

### 2. The 4-Phase Discovery Interview Script
1. **Current Reality & Past Behavior (7 min)**:
   - *"Walk me through the last time [specific failure/event] happened on your team."*
   - *"How did you resolve it? What specific tools or scripts did you touch?"*
   - *Rule*: Focus strictly on what they *did* in the past 6 months, never what they *might do* in the future.
2. **The Status Quo & The Breaking Point (5 min)**:
   - *"What do you use today instead of an external tool?"*
   - *"What is annoying about that, and why haven't you replaced it?"*
   - *"What would have to happen for your team to abandon the current setup?"*
3. **Quantifying the Pain & Budget Precedent (5 min)**:
   - *"Have you actively looked for solutions or dedicated engineering sprints to solve this?"*
   - *"If a tool solved this completely tomorrow, whose budget does that come out of?"*
4. **Network Expansion & Referrals (3 min)**:
   - *"Who is the most opinionated engineer or architect you know dealing with this exact problem?"*

### 3. Filter Polite Fiction vs. Real Validation
- **Polite Fiction (Discard)**: *"This sounds really cool," "I would definitely use that," "You should add AI to it."*
- **Real Validation (Keep)**: *"We spent 3 weeks building an internal CLI for this last quarter," "We pay $2,000/mo for a tool that breaks every week," "Can I test this on our staging cluster today?"*

### 4. Update the Single Source of Truth
- Update `./.agents/context/product.md`:
  - Tag verified points as `[validated]` with citing notes.
  - Remove or refine invalidated assumptions.
- Log verified findings in `./.agents/context/evidence-ledger.md`.

---

## Quality gate

- [ ] Minimum 5 interviews conducted with unaffiliated practitioners (zero friends/family).
- [ ] Every validated pain point grounded in past actions (spent money, internal scripts built, hours lost).
- [ ] Verbatim quotes captured in founder's notes; no AI-polished marketing abstractions.
- [ ] Product ground truth (`./.agents/context/product.md`) updated with explicit `[validated]` tags.
- [ ] Clear Anti-ICP defined: explicitly documents who is *not* a fit and says "no".

---

## Routing

- Sourcing target candidates for discovery interviews → `gtm:research` / `gtm:list`.
- Positioning narrative and developer hero framing → `growth:positioning`.
- Converting validated developer adoption into commercial revenue → `gtm:dev-to-buyer`.
- Managing sales demos and contract closing → `gtm:founder-sales`.

---

## Sources

- Adam Frankl, *The Developer-Facing Startup* (Technical Advisory Board discovery methodology).
- Shane O'Connor, *The DevTool GTM Company* (Developer customer discovery and assumption tagging).
