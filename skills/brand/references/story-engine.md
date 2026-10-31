# story-engine — Multimodal Agency Narrative & Brand Genesis Generator

Multimodal brand narrative genesis, founder archetype synthesis, OKLCH visual color resonance, tagline and elevator pitch matrices, and brand voice constitution linting. Transforms raw client intake and founder origin stories into a cohesive, defensible brand identity with zero AI-slop and verifiable emotional resonance.

Council Lead: **Jasper** (Creative Technologist & Growth Mastermind)  
Tooling: `skills/agency-delivery/brand/scripts/story-engine.ts`

---

## Triggers & Scope

- **Invocation Triggers**: "brand genesis", "story engine", "founder story", "brand narrative", "brand archetype", "brand voice constitution", "tagline matrix", "pitch matrix", "brand story generator".
- **Primary Inputs**:
  - Brand name, founder name, industry vertical, and target ICP.
  - Founder catalyst event (the inciting incident or systemic breakdown).
  - Selected or detected brand archetype (Hero, Creator, Rebel, Ruler, Sage, Magician, Outlaw, Everyman, Lover, Jester, Caregiver, Explorer).
- **Primary Deliverables**:
  - Structured Brand Genesis Blueprint (`.agents/brand/<client-slug>/genesis.md`).
  - OKLCH Design Tokens (`tokens.json`) mapped to emotional resonance curves.
  - 5-vector Tagline Matrix (Direct, Aspirational, Provocative, Metaphorical, Quantifiable).
  - 15s / 30s / 60s Elevator Pitch Suite.
  - Enforceable Brand Voice Constitution with automated prose linting.

---

## 🔒 The 4 Story Engine Invariants

### 1. Founder Archetype Alignment (STR-001)
- Maps the brand narrative directly to one of twelve foundational archetypes:
  - **The Hero**: Overcoming adversity; mastery through discipline.
  - **The Creator**: Innovation through subtraction; building enduring systems.
  - **The Rebel**: Heresy against lazy market defaults; sovereign freedom.
  - **The Ruler**: Sovereign stewardship; restoring order from fragmented chaos.
  - **The Sage**: Empirical truth; dispelling industry noise and hype.
  - **The Magician**: Quantum synthesis; making the impossible reproducible.
  - **The Outlaw**: Breaking monopolistic walled gardens for open commons.
  - **The Everyman**: Peer-level honesty; elevating the quiet majority.
  - **The Lover**: Fanatical craft devotion and intimate client communion.
  - **The Jester**: Satirical truth-telling; slicing pomposity with wit.
  - **The Caregiver**: Protective sanctuary; nurturing client agency.
  - **The Explorer**: Blazing uncharted trails beyond conventional boundaries.
- Identifies the founder's catalyst event, confronts their shadow trait, and articulates an ethos transformation arc.

### 2. Multimodal Palette & Visual Narrative (STR-002)
- Couples brand psychology directly with perceptually uniform OKLCH color spaces.
- Emits six semantic color roles: `primary`, `secondary`, `accent`, `neutral`, `surface`, `background`.
- Calibrates color selections against five emotional resonance curves:
  - **Trust** (0.0 - 1.0)
  - **Excitement** (0.0 - 1.0)
  - **Authority** (0.0 - 1.0)
  - **Warmth** (0.0 - 1.0)
  - **Intrigue** (0.0 - 1.0)
- Enforces strict contrast ratios (minimum 4.5:1 for body copy on surface, 7:1 for headers) verified mathematically.

### 3. Tagline & Elevator Pitch Matrix (STR-003)
- Generates 5 distinct tagline vectors to serve diverse campaign surfaces:
  1. **Direct**: Literal, category-defining value proposition.
  2. **Aspirational**: Identity and vision-driven ethos.
  3. **Provocative**: Contrarian disruption challenging industry sacred cows.
  4. **Metaphorical**: Visceral sensory imagery and architectural analogy.
  5. **Quantifiable**: Hard, metric-driven ROI or performance claims.
- Generates 3 timed elevator pitches (15 seconds, 30 seconds, 60 seconds) structured around hook, catalyst, solution, and proof.

### 4. Brand Voice Constitution & Prose Linting (STR-004)
- Establishes a zero-tolerance banned buzzword lexicon (`synergy`, `delve`, `tapestry`, `leverage`, `disruptive`, `game-changer`, etc.).
- Enforces cadence gates:
  - Opening sentence punchiness ($\le 5$ words).
  - Sentence length ceiling ($\le 24$ words per sentence).
  - Standalone 12–18 token quotability rule for high-retention snippet extraction.
- Provides a deterministic lint engine returning violation locations, token stats, and a 0–100 compliance score.

---

## Execution Workflow

1. **Intake Triage**: Ingest founder origin notes, industry context, and pain points.
2. **Archetype Extraction (`story-engine.ts`)**: Run archetype resolution to lock narrative arc and emotional priorities.
3. **Palette & Pitch Generation**: Synthesize OKLCH color tokens and the 5-vector tagline matrix.
4. **Constitution Compilation**: Generate `brand-voice-constitution.json` with forbidden words, tone spectrum, and cadence gates.
5. **Pre-Flight Copy Linting**: Validate all landing page copy, pitch decks, and ad scripts through `StoryEngine.lintProse()` before sign-off.
