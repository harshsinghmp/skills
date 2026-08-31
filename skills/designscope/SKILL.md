---
name: designscope
description: "Analyze any visual source — image, website URL, or Figma file — to extract its structured design system: a design.md brief plus DTCG design-tokens.json and an optional WCAG contrast report. Also handles element mode: copy one component as a rebuild spec, or turn visual art into a token-grounded generative image prompt. Trigger on 'extract the design system from X', 'what palette does this site use', 'document this design', 'convert this screenshot into tokens', 'copy this navbar', 'recreate this illustration', or whenever the user brings a screenshot, URL, Figma link, or mockup and wants it understood at a design level."
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [design, design-systems, tokens, dtcg, ui, figma, wcag]
    related_skills: [new-project, agent-handoff]
    requires_tools: [bash, view_file, write_to_file, web_fetch]
---

# 🎨 designscope — Design System Extraction & Design Documentation

Point at any visual source — a screenshot, a live URL, a Figma link — and extract its
design system into structured artifacts: a `design.md` brief another AI (or human) can
build from, a W3C DTCG `design-tokens.json` for design tooling, and an optional WCAG
accessibility report. Element mode zooms into one component and outputs either a rebuild
spec or a token-grounded image prompt. Outputs serve directly as briefs for AI builders
and as client brand documentation.

---

## When to Use

**Triggers:**

- *"Extract the design system from this site/screenshot/Figma file"*.
- *"What palette does this site use?"*, *"what font is this?"*, *"document the style of Y"*.
- *"Convert this image into tokens"*, *"help me replicate this design"*.
- Element-scoped: *"copy this navbar"*, *"just the pricing card"*, *"recreate this
  illustration"*, *"give me a prompt to regenerate this graphic"*.
- Agency workflow: producing a brand/design brief to feed AI builders (Cursor, v0,
  Lovable) or to document a client's visual system.
- Auditing whether a production site implements what a Figma design defined.

**Anti-triggers:**

- Building UI from scratch with no reference source — use your normal frontend workflow.
- Generating new designs or inventing a brand identity from nothing — this skill
  documents what exists; it does not create.
- Copying verbatim brand-identifying artwork (logos, mascots) for reuse outside
  analysis/documentation.

---

## Quick Reference

| Source | Capture flow | Primary output |
|:---|:---|:---|
| **Local image** | Direct multimodal vision | `design.md` |
| **Website URL** | Web fetch HTML → CSS variable extraction → native browser screenshots only if HTML is empty | `design.md` + `design-tokens.json` |
| **Figma link** | Figma MCP: `get_metadata` → `get_variable_defs` → `get_design_context` → `get_screenshot` | `design.md` + `design-tokens.json` |

| Mode | Scope | Output |
|:---|:---|:---|
| **Full** (default) | Whole page/file/system | `design.md`, optional `design-tokens.json`, optional `design-a11y.md` |
| **Element** | One visual component | `element.md` (rebuild spec or token-grounded image prompt) |

| Script | When to run | Dependencies |
|:---|:---|:---|
| `extract_css_vars.py` | URL with linked stylesheets — pulls `--*` custom properties as explicit tokens | stdlib only |
| `check_contrast.py` | Any time you have extracted color pairs — emits a WCAG contrast table | stdlib only |
| `lint_design_md.py` | **Always**, before delivering any `design.md` | stdlib only |
| `verify_design.py` | Audit a previously-generated `design-tokens.json` against the live URL — reports drift | stdlib only |

---

## Procedure

Always follow this order, no skipping steps.

### Step 1 — Identify source and objective

Confirm two things (only if unclear from the message):

1. **Which source is it?** Image / URL / Figma / combination.
2. **What's the emphasis?**
   - **Reconstruction** → to feed an AI builder
   - **Mood/reference** → to document style, branding, inspiration
   - **Design system** → to extract tokens and components as a system

If the user doesn't clarify, assume **reconstruction + design system** as the default combo.
The `design.md` covers all three anyway — what changes is the depth.

Also determine **mode**: full analysis vs element copy. Element-mode signals: a definite
article + single component ("the navbar", "that button"), an element-scoped verb ("copy",
"extract just", "recreate"), or any request for an image-generation prompt. When genuinely
ambiguous, default to full mode and offer element mode as the follow-up.

### Step 2 — Capture the material

Execute the flow for the source type. **Read `references/capture-flows.md` when you start
this step.**

- **Image**: view it directly. Skip to Step 3.
- **URL**: web-fetch the HTML first. If it has real content, work with it and also extract
  CSS custom properties (`python scripts/extract_css_vars.py <URL>`). If the HTML comes back
  empty (SPA without SSR), capture viewports or elements using your agent's native
  browser/screenshot tooling instead.
- **Figma**: Figma MCP tools in order — `get_metadata`, `get_variable_defs`,
  `get_design_context`, `get_screenshot`.

If something fails (URL down, no Figma access, broken image), tell the user clearly and
propose alternatives instead of inventing content.

### Step 3 — Layered analysis + Art Direction QA pass

Analyze the material in **6 layers**, general to specific. **Read
`references/analysis-framework.md` when you start this step.**

| Layer | What to identify |
|:---|:---|
| **1. Identity** | Personality, mood, references + Brand voice/atmosphere + the "ONE brand thing" |
| **2. System** | Tokens: colors, typography, spacing, radii, elevation + decorative depth, borders, accessibility |
| **3. Components** | Generic components + Signature components |
| **4. Layout** | Grid & containers, composition patterns, responsive behavior, image behavior |
| **5. Reconstruction** | Suggested stack, quick wins, tricky bits, confidence map |
| **6. Brand rules** | Do's and Don'ts — explicit, brand-specific usage rules |

After Layers 1-6, run the **Art Direction Patterns QA pass** at the end of
`references/analysis-framework.md`. It surfaces patterns shallow analysis routinely misses.
The QA pass is non-negotiable.

For token rigor ("green-500 = #16A34A", not "green"), consult
`references/token-extraction.md`. For accessibility checks on extracted color pairs, run
`python scripts/check_contrast.py --pair "#111827,#FFFFFF"`.

### Step 4 — Generate the output artifacts

Use the template in `references/output-template.md` as the output contract (**read it when
you reach this step**). For element mode, follow `references/element-copy.md` instead.

Non-negotiable honesty rules:

1. **Honesty over confidence.** Every important inference carries a confidence level
   (✅ high / ⚠️ medium / ❓ low). Inventing tokens is worse than saying "not enough info".
2. **Real hex codes, not literary approximations.** No "sky blue" — `#3B82F6` with its
   semantic role.
3. **Mandatory "Open Questions" section.** What you couldn't determine and what needs human
   input. If none, justify why.
4. **Mandatory "Do's and Don'ts" section.** Brand-specific usage rules grounded in
   observation. If you can't generate at least 3 of each, say so explicitly — never pad
   with generic UX advice.
5. **Dual output when applicable.** Besides `design.md`, generate `design-tokens.json` in
   W3C DTCG format (`$value`/`$type`) — only if you extracted concrete tokens.
6. **Accessibility report (optional).** With at least two color pairs, generate a brief
   `design-a11y.md` with WCAG ratios via `scripts/check_contrast.py`.

### Step 5 — Lint gate, then deliver

**ALWAYS run the lint script before delivering any `design.md`:**

```bash
python scripts/lint_design_md.py <generated-design.md>
```

Fix every reported failure before delivering (unresolved token refs, missing mandatory
sections, empty Do's/Don'ts without abstain justification).

Then present the generated files and offer next steps based on the Step 1 emphasis:

1. **Refine the analysis** if something felt weak or the user sees something you didn't.
2. **Convert the `design.md` into a build prompt** for any AI code agent (Cursor, opencode,
   Copilot, v0, Lovable).
3. **Analyze another source** to compare.

Don't close with "anything else?". Proactively suggest the logical next step.

---

## Pitfalls

- ❌ **Never invent tokens you didn't observe.** A short honest system beats a long invented
  one.
- ❌ **Never write "modern and clean design"** without concrete observations backing it.
  Every claim traces to something seen.
- ✅ **Prefer extracted CSS variables over inferred values** — they carry ✅ high confidence
  by default. Inference is the fallback, not the default.
- ❌ **Don't assume a framework without class evidence.** No `bg-blue-500` classes → don't
  say "this is Tailwind".
- ❌ **Don't invent variants.** Saw one button → "1 variant observed", not "primary,
  secondary, tertiary".
- ❌ **Don't fabricate responsive behavior** from desktop-only material — flag it in Open
  Questions and recommend multi-viewport captures.
- ❌ **Don't skip the Art Direction QA pass** or the lint gate. Both are non-negotiable.
- ❌ **Don't generate images in element mode.** Deliver the prompt; rendering is the user's
  step.
- ❌ **Don't analyze in a vacuum.** If the user gave context ("this is for X brand"), the
  analysis must connect with that hint.

---

## Verification

Before declaring the task complete:

1. **Lint gate passes**: `python scripts/lint_design_md.py <output>` reports zero failures.
2. **Hex format check**: every color token is a real hex code (`#[0-9A-Fa-f]{6}`), not a
   prose approximation.
3. **DTCG validity**: `design-tokens.json` parses as JSON, uses `$value`/`$type`, and every
   `$extensions.designscope.confidence` marker matches the confidence stated in `design.md`.
4. **Grep-audit your own output** for invented tokens: pick 3 random tokens from the output
   and confirm each traces to something in the captured material (HTML, screenshot, Figma
   data). If one doesn't trace, remove it or downgrade to ❓ low with justification.
5. **Mandatory sections present**: Open Questions and Do's/Don'ts exist — or carry explicit
   justifications for their absence.
