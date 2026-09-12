---
name: humanize
aliases: ["anti-ai","de-ai","human-writer","prose-polish","voice-editor"]
description: "Editorial review and prose humanization system that detects and eliminates AI-generated writing artifacts, formulaic patterns, significance inflation, and robotic cadence without altering facts, claims, or the author's authentic voice. Trigger on 'humanize this text', 'make this read naturally', 'remove AI writing patterns', 'de-ai this article', 'audit this copy for chatbot slop', 'polish this prose', or whenever technical, documentation, blog, or marketing copy sounds robotic or template-driven."
version: 2.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: quality-review
metadata:
  category: quality-review
  priority: 21
  aliases: ["anti-ai","de-ai","human-writer","prose-polish","voice-editor"]
  suggested_skills: ["code-review","updatedocs","evidence-ledger","secretary"]
  hermes:
    tags: [humanize, prose, editorial, copyediting, anti-slop, natural-language, technical-writing, style-guide, voice-preservation, writing-quality]
    related_skills: [updatedocs, code-review, evidence-ledger, secretary]
    suggested_skills: [updatedocs, code-review, evidence-ledger, secretary]
    requires_tools: [view_file, write_to_file, replace_file_content]
  openclaw:
    category: quality-review
    suggested_skills: [updatedocs, code-review, evidence-ledger, secretary]
    primary_triggers: ["humanize prose","remove AI writing patterns","de-ai text","audit prose for AI slop","make writing sound natural"]
    requires_tools: [view_file, write_to_file, replace_file_content]
---

# Humanize (`humanize`)

Make writing clearer, more specific, more natural, and recognizably authored without sanding away the writer's authentic voice.

This skill is an **editorial system**, not a detector-evasion system. AI-style signals are evidence to inspect, not rules to obey mechanically.

---

## When to Use

### Primary Trigger Scenarios
* **Post-Drafting Polish**: Reviewing first-pass AI or human copy (articles, essays, blogs, executive memos, PR descriptions) to remove generic chatbot idioms and mechanical phrasing.
* **Documentation & Technical Writing**: Ensuring READMEs, architecture docs, API guides, and repo manuals read clearly with high factual density and zero marketing fluff.
* **Marketing & GTM Copy**: Eliminating empty significance inflation ("game-changing", "testament to", "unlocking the power of") while preserving verified claims and conversion intent.
* **Code & PR Reviews**: Auditing documentation PRs or changelogs for formulaic structures, binary contrasts, or placeholder text.
* **Audit & Triage**: Evaluating external submissions or community PRs to identify low-effort AI slop vs. authentic contributions.

### Operating Modes
1. **Rewrite**: Reconstruct supplied prose while strictly locking claims, facts, stance, and audience.
2. **Edit (Default)**: Surgical minimum effective diff. Preserve strong human sentences; edit only formulaic or low-signal clauses.
3. **Detect (Audit-Only)**: Pinpoint exact spans, pattern categories, and concise fixes without changing text.
4. **File**: Operate directly on repository files, altering prose only while strictly preserving code blocks, YAML frontmatter, tables, and URLs.
5. **Repo Audit**: Survey a directory or docset to identify dominant anti-slop patterns without performing blind bulk rewrites.
6. **Embedded**: Act as an internal quality filter within a multi-skill pipeline, returning clean prose directly.

### Core Priority Order
When editorial goals or rules conflict, adhere to this strict hierarchy:
1. **Accuracy** (zero fabricated facts or hallucinated metrics)
2. **Meaning and claims** (preserve author's core thesis and boundary constraints)
3. **Authorial voice** (protect unique tone, humor, bluntness, or deliberate phrasing)
4. **Appropriate register** (match technical, formal, or casual medium expectations)
5. **Specificity** (concrete mechanisms over abstract benefit claims)
6. **Clarity** (direct, unambiguous comprehension)
7. **Information density** (every sentence carries signal; eliminate empty padding)
8. **Natural rhythm** (varied, human cadence without artificial metronomic flow)
9. **Formatting polish** (appropriate sentence-case headings, clean markdown)

---

## Quick Reference

### Anti-Slop Pattern Cheat Sheet (Inspect & Fix)
| Pattern Family | Tell / Symptom | Real Problem | Editorial Fix |
| :--- | :--- | :--- | :--- |
| **Significance Inflation** | *"A testament to"*, *"pivotal milestone"*, *"game-changing"* | Unearned melodrama | State the exact mechanism or result plainly. |
| **Shallow -ing Participles** | *"highlighting the need"*, *"ensuring success"* | Lazy causal connection | Split into active sentence or state exact consequence. |
| **Brochure / Hype Language** | *"seamlessly integrates"*, *"unlock unprecedented"* | Generic marketing fluff | Name the API, latency, or concrete workflow step. |
| **Copula Avoidance** | *"serves as"*, *"stands as"*, *"boasts"* | Stilted verb avoidance | Use plain direct verbs: *"is"*, *"has"*, *"contains"*. |
| **Binary Contrast Formula** | *"Not just X, but Y"*, *"It's not about A, it's B"* | Cheap rhetorical trick | State the actual distinction directly without the formula. |
| **Forced Triads** | Every list, adjective set, or sentence has exactly 3 items | Metronomic cadence | Use 2, 4, 1, or natural count matching real items. |
| **Synonym Cycling** | Switching between 4 words for the same database | Fear of repeating nouns | Repeat the clearest noun consistently. |
| **Phantom Rebuttals** | *"While critics argue..."*, *"It is easy to assume..."* | Invented counterarguments | Address real constraints or delete the strawman. |
| **Aphorism Pull-Quotes** | *"In the world of X, Y is king."* | Cliché greeting-card wisdom | Delete the platitude; start with the concrete observation. |
| **Summary Throat-Clearing** | *"In conclusion"*, *"Ultimately"*, *"As we look ahead"* | Redundant wind-down | Conclude on the final substantive point or next action. |

### The Portability Test
> *"Could this sentence be pasted into another company, project, or article without anyone noticing?"*
> If yes, it lacks specific mechanisms, concrete data, or true voice—rewrite or eliminate it.

### False-Positive Guardrail (When to Leave It Alone)
Before changing a suspected tell, verify:
* Does it convey genuine meaning?
* Does it express the author's intentional voice (e.g. deliberate rhythm, casual fragment)?
* Is it required by technical, legal, or genre precision?
* When uncertain, **preserve it**. Plainness and technical formality are NOT evidence of AI.

---

## Procedure

### Step 1: Pre-Flight & Voice Calibration
1. Read the complete text before making edits.
2. Determine audience, target venue, intended register, and domain constraints.
3. If genuine writing samples from the author are available, treat them as the ground truth voice standard.
4. Separate editor instructions from deliverable content (e.g., *"keep this punchy"* is guidance, not prose).

### Step 2: Source Lock & Evidence Boundary
Lock the following invariants—**never alter or fabricate**:
* Numerical data, dates, metrics, percentages, and benchmarks.
* Proper nouns, package names, file paths, and citations.
* Technical behaviors, APIs, protocols, and architectural claims.
* Legal, security, or compliance constraints and uncertainty qualifiers.
* If a concrete detail is missing, state the supported claim plainly or flag the evidence gap—**never invent anecdotes or data to simulate humanity**.

### Step 3: Candidate Pattern Collection & Filtering
1. Scan prose against the pattern catalog in `references/patterns.md`.
2. Inspect for clustering: isolated stylistic choices (e.g. a single em dash or passive verb) are benign; clusters of hype + vague attribution + metronomic triads indicate slop.
3. Filter candidates through the False-Positive Guardrail. Discard cosmetic nitpicks.

### Step 4: Surgical Editing & Natural Cadence
1. Apply minimum effective changes. Prefer surgical sentence repairs over blanket rewrites.
2. Swap abstract verbs for direct actions (*"conducts an analysis"* → *"analyzes"*).
3. Replace vague benefit claims with specific mechanisms.
4. Restore natural variety to sentence lengths and structures without manufacturing artificial variance.
5. Format headings in clean sentence case. Ensure list items are genuinely parallel and scannable.

### Step 5: File & Markdown Safety Protocol
When operating on files:
* Strictly preserve YAML frontmatter, markdown tables, URLs, and code fences.
* Never convert code, configuration, or structured data into prose.
* Generate reviewable, minimal diffs.

---

## Pitfalls

### Hard Prohibitions (Never Do This)
* **Never Promise Detector Evasion**: Do not optimize text to game probabilistic AI detectors at the cost of clarity or factual correctness.
* **Never Fabricate Reality**: Never invent quotes, statistics, benchmarks, customer anecdotes, or historical events to make writing feel "authentic".
* **Never Introduce Deliberate Errors**: Never introduce artificial typos, fake grammatical slips, or forced slang to simulate human imperfection.
* **Never Clobber Technical Vocabulary**: Never dumb down or replace correct technical terms (e.g. *"idempotency"*, *"monorepo"*, *"cache coherence"*) with vague colloquialisms.
* **Never Sand Down Authorial Voice**: Never replace blunt, humorous, or opinionated prose with bland corporate neutrality.

---

## Verification

### Final Quality Gate Checklist
Before marking work complete, verify every dimension:
* [ ] **Factual Fidelity**: All metrics, names, citations, and causal relationships match the source exactly.
* [ ] **Voice Retention**: The author's unique stance, perspective, and tone are intact.
* [ ] **Information Density**: Every sentence delivers substantive information; generic filler is gone.
* [ ] **Structural Cleanliness**: No redundant summary conclusions, phantom debates, or repetitive introductory throat-clearing.
* [ ] **Portability Passed**: Sentences describe this exact project, feature, or topic, not generic platitudes.
* [ ] **Diff Minimality**: Only sentences requiring editorial intervention were changed; strong human prose was untouched.

### Audit Reporting Format (Detect Mode)
When called in audit mode, output a structured findings table:
| Pattern Family | Exact Span | Why It Reads Formulaic | Recommended Fix |
| :--- | :--- | :--- | :--- |
| *Significance Inflation* | *"A testament to our dedication"* | Empty cliché; lacks operational proof | *"Built across 6 months of weekly stress-testing"* |
| *Binary Contrast* | *"It's not just a tool, it's a movement"* | Formulaic framing device | State the actual product capability directly |

### References & Deeper Context
* [`references/patterns.md`](references/patterns.md) — Comprehensive 30+ pattern anti-slop taxonomy with before/after examples.
* [`references/style-guide.md`](references/style-guide.md) — Medium-specific voice calibrations (docs, marketing, scientific, social).
* [`references/verification.md`](references/verification.md) — Quality gates, optional scoring, and file/repository verification practices.
