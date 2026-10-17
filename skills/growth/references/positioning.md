# positioning — Positioning: a differentiated value proposition in the customer's words.

## Intake

- Target audience segments and their jobs-to-be-done
- Competitors and how they position
- Your genuine differentiators (product, model, service)
- Current messaging and its performance

## Deliverable

A positioning statement: target segment, category frame, key differentiator, and proof — plus a messaging house (value prop, pillars, proof points) and before/after messaging examples.

## Procedure

1. Pick the primary segment; narrowing is the whole game.
2. Map how competitors position (their claims, category, and gap).
3. Find the defensible differentiator — something real and hard to copy.
4. Write the positioning statement: for [segment], we are the [category] that [differentiator], because [proof].
5. Build the messaging house: one value prop, 3 pillars, proof per pillar.
6. Translate into headline/messaging examples in the customer's words.
7. Define the test: where it will be validated and what success looks like.
8. Validate problem-solution fit with the Sean Ellis PMF test ("how would you feel if you could no longer use this?") — under 40% "very disappointed" means fix the product/segment before refining messaging.
9. Generate ICP/persona hypotheses (3–5), score them on pain intensity × reachability × willingness-to-pay, keep full cards for the top 2 only; each must pass the narrowness test (nameable buyer, findable whereabouts, fundable pain) or be cut.
10. Expand each kept persona into exactly 3 differentiated campaign angles (different pain, trigger, or emotional driver — never three wordings of one idea); recommend one starter and what the A/B test measures.
11. Write proof points with observed numbers only — never invent metrics, savings, or percentages; ban hype adjectives (seamless, robust, cutting-edge, world-class) in favor of plain words.
12. Capture customer language before drafting: short interview (who they are, offer, proof) plus 3–5 of their own writing samples — positioning in their words, not yours.
13. Elicit before drafting: ask clarifying questions one at a time — purpose, constraints, success criteria — and stop at the answers that matter; no draft line until the segment's success metric is named.
14. Research in 3 modes before writing (source: marketingskills `customer-research` SKILL.md): analyze assets → mine signal (watering-hole sources with per-source extract targets) → go-ask; synthesize themes ranked by frequency × intensity; use the no-review persona fallback when reviews are thin; ship personas with anti-patterns checked and deliverables in the format the decision needs.
15. Borrow pressure-tested psychology deliberately (source: marketingskills `marketing-psychology` SKILL.md, 60+ models in 6 groups, each with an ethical note): route the challenge to the model — low conversion → Hick/Fogg/friction; price resistance → anchoring/framing; urgency → scarcity/Zeigarnik; retention → endowment/switching-costs; onboarding → goal-gradient/IKEA/commitment — and state the ethical line for each use.
16. Hold shared context in one versioned doc (source: marketingskills `product-marketing` SKILL.md; SEAM-3 closure candidate): 12-section capture (JTBD four-forces, verbatim customer language, anti-persona), auto-draftable from the codebase, version bump + changelog entry per substantive edit — every downstream mode reads it before drafting.
17. Architect AI Defensibility Moats ("Beyond the Wrapper"):
When evaluating or positioning an AI-first or developer product, audit against the **4-Layer Defensibility Moat Architecture** to verify the product is not vulnerable to foundation model commoditization:
- **Layer 1: Workflow State & System of Record**:
  - The tool cannot be a stateless API proxy or single-prompt completion feature.
  - It must capture persistent context, project invariants, decision history, execution artifacts, and multi-user workflow state.
  - Switching costs arise from the accumulated data and deep workflow integration, not from the model invocation.
- **Layer 2: Proprietary Data Pipeline & Compound Feedback Loops**:
  - Grounded domain context: AST / CodeGraph indexes, private schema representations, internal operational telemetry, or local environment awareness that public models cannot train on.
  - Compound learning loop: User edits, explicit corrections, and accepted suggestions feed directly into local project memory, evals, and prompt calibration so performance compounds over time.
- **Layer 3: Deterministic Evals & Enterprise Reliability Harness**:
  - Commodity vs. Defensible: Prompts and raw completions are commodities; deterministic verification harnesses, automated regression test suites, syntax/schema validators, and safety gates (e.g. Vibeguard secret scanning, zero-leak boundary enforcement) are defensible.
  - Multi-model routing: Dynamic routing across heterogeneous models (local SLM vs. frontier cloud) optimizing for cost, latency, and context window.
- **Layer 4: Deep Integration Surface & Tool Ecosystem**:
  - Ecosystem hooks: Native IDE plugins, git hooks, CI/CD pipeline actions, local daemon sidecars, and terminal tools.
  - Extensibility platform: Support for modular plugins, custom skills, or MCP servers that turn the product into a platform with multi-sided network effects.
18. Formulate the "Beyond the Wrapper" Positioning Narrative:
- Contrast the fragile point-solution wrapper (*"just another prompt wrapper that breaks on the next model release"*) against the deep system (*"the deterministic orchestration engine with verified workflows and private context"*).
- Frame the differentiator around **reliability, control, latency, and private context**, not raw model intelligence.
- Answer the existential buyer question: *"What happens to your product when OpenAI/Google/Anthropic releases model version N+1?"* (The answer must be: *"Our product becomes faster, cheaper, and more accurate because model advances strengthen our orchestration rather than replacing our integration surface."*)

## Quality gate

- [ ] One primary segment named.
- [ ] Competitor positioning mapped.
- [ ] Differentiator is real and defensible.
- [ ] Messaging stated in customer language.
- [ ] Validation test and metric defined.
- [ ] PMF bar cleared (≥40% very-disappointed) before messaging refinement.
- [ ] Top-2 personas narrowness-tested; 3 differentiated angles per persona with a starter pick.
- [ ] Proof points carry observed numbers; no hype adjectives.
- [ ] Research run in 3 modes with frequency×intensity synthesis; psych models routed by challenge with ethical lines; shared context doc versioned and read before drafting.
- [ ] Success metric named before any draft line written.
- [ ] For AI/agentic products: 4-layer defensibility moat audited (Workflow State, Proprietary Data, Deterministic Evals, Integration Surface).
- [ ] "Beyond the Wrapper" resilience question answered against frontier model updates (N+1 resilience).

## Routing

- Willingness-to-pay evidence → growth pricing mode.
- Angle execution (sends, sequences) → content email mode.
- Proof measurement behind a claim → smm analytics mode.
- Voice-profile drafting in the customer's own words → content humanize mode.
- Segment ambiguity that survives elicitation → growth competitor mode for the gap check.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
