# vsl — Video Sales Letter: High-Converting Scripts, 6-Beat Narrative Spine, and Two-Column A/V Storyboards

Jasper Creative Division high-converting Video Sales Letter (VSL) script architecture for B2B tech, SaaS, high-ticket services, and productized agencies.

---

## The Four VSL Invariants

Every Video Sales Letter script authored under this skill must satisfy four core engineering and conversion invariants:

### VSL-001: The 3-Second Retention Law & Pattern Interrupt
- **Tri-Layer Hook**: Hook the viewer simultaneously across three distinct cognitive layers within the first 1.5–3.0 seconds:
  1. *Visual Hook*: Rapid camera movement, sudden cut, unusual physical action, high-contrast visual contrast, or pattern interrupt.
  2. *Verbal Hook*: Contrarian statement or counter-intuitive thesis (*"Why spending 40 hours a week prospecting is actually destroying your agency..."*).
  3. *Kinetic Text Hook*: Center-screen high-contrast text confirming the contrarian claim for silent/muted autoplay.
- **Cognitive Loop**: Open an unclosable open loop before second 15 that cannot be resolved without watching until the mechanism reveal.

### VSL-002: Jasper 6-Beat Narrative Spine
Every high-performing long-form VSL (5–12 minutes) follows this proven conversion sequence:

1. **Beat 1: The High-Stakes Pattern Interrupt (0:00–0:30)**: Disrupts current thinking, qualifies the exact target audience, and states the undeniable transformation.
2. **Beat 2: The Hidden Villain / Why Common Advice Fails (0:30–2:00)**: Agitates the real root cause of the viewer's pain. Identifies the "false enemy" vs the "real systemic flaw" in existing solutions.
3. **Beat 3: The Paradigm Shift (2:00–3:30)**: Introduces the new operating principle that turns conventional wisdom on its head without pitching the product yet.
4. **Beat 4: The Unique Mechanism Reveal (3:30–6:00)**: Names and explains the proprietary mechanism (e.g. *The Autonomous Terrain Engine*, *The Tri-Vector Seam Architecture*) that makes the desired outcome predictable.
5. **Beat 5: Empirical Proof & Transformation Stacking (6:00–8:30)**: Hard proof receipts — screenshots, telemetry logs, revenue graphs, before-and-after benchmarks, and client quotes.
6. **Beat 6: The No-Brainer Offer, Risk Reversal & Dual CTA (8:30–12:00)**: Presents the complete stack, quantifies total economic value vs investment, introduces a risk-free reversal guarantee, and issues explicit primary and secondary calls to action.

### VSL-003: Two-Column Audio/Visual Storyboard Standard
All script deliverables must be formatted in a strict Two-Column A/V Production Storyboard:
- **Column 1: Visual / Camera Direction**: Framing (Close Up, Wide, Medium), camera motion, B-roll footage description, on-screen text overlays (OST), animated lower-thirds, graphic callouts, and screen recordings.
- **Column 2: Audio / Voiceover & Sound Effects (SFX)**: Verbatim spoken voiceover dialogue, actor delivery notes (tone, emphasis, pauses), sound design cues (`[SFX: Subtle bass boom]`, `[SFX: Paper rip]`, `[SFX: Mouse click]`), and background music mood/tempo transitions.

### VSL-004: Anti-Slop Conversion Copy Gate & WPM Pacing
- **Conversational Pacing**: Spoken cadence must target **130–145 words per minute (WPM)**. Rapid-fire delivery (>160 WPM) destroys retention on complex topics; dragging delivery (<120 WPM) causes immediate bounce.
- **Active Voice & Quantified Claims**: Eliminate corporate passive voice and meaningless fluff adjectives ("innovative", "cutting-edge", "supercharge", "all-in-one", "game-changer"). Replace with quantified superpower capabilities ("slashes cloud cold-starts from 3.2s to 42ms").
- **18-Token Quotability**: Key punchlines and summary rules must stand alone as memorable 18-token aphorisms.

---

## Two-Column A/V Production Storyboard Template

| Scene & Time | Visual Direction (Column 1) | Spoken Audio & SFX (Column 2) |
| :--- | :--- | :--- |
| **01 (0:00–0:07)**<br>Hook | **[Shot: Extreme Close-Up]**<br>Host holds up an open laptop showing a terminal flashing red with 47 error logs.<br>**[OST: High-contrast yellow on black: "STOP BUILDING WRONG"]** | *"If you're still deploying client databases with single-step SQL migrations in 2026, you're one table lock away from taking down your entire agency."*<br>`[SFX: Sudden glitch / tape-stop]` |
| **02 (0:07–0:25)**<br>Qualification | **[Cut to: Fast B-roll montage]**<br>Rapid screenshots of Slack notifications, angry client emails, and server 504 gateway timeout alerts.<br>**[Motion Graphic: Red warning badge pulsing]** | *"Most developers blame the framework. But the real problem isn't Postgres or MySQL. It's the fact that nobody taught you the Expand/Contract deployment pattern."*<br>`[SFX: Low ambient drone swells]` |
| **03 (0:25–1:15)**<br>The Villain | **[Shot: Medium Close-Up]**<br>Host walks toward whiteboard. Writes: *"The SHARE Lock Trap"*. | *"Here is what actually happens when you alter a column in production without a lock timeout..."* |

---

## VSL Generator CLI

Generate or audit VSL production packets:
```bash
# Scaffold a new 6-beat VSL script
bun skills/agency-delivery/content/scripts/vsl-generator.ts --scaffold-vsl --product "CloudEdge D1" --target "SaaS Founders" --mechanism "Sub-15ms Edge Ingestion" --out vsl-script.md

# Audit an existing VSL script for pacing, invariants, and buzzwords
bun skills/agency-delivery/content/scripts/vsl-generator.ts --audit-script vsl-script.md --duration-seconds 300

# Compute exact scene-by-scene timing and word count
bun skills/agency-delivery/content/scripts/vsl-generator.ts --timing vsl-script.md
```
