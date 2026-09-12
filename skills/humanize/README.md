# ✍️ humanize

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Category: Quality & Review](https://img.shields.io/badge/Category-Quality%20%26%20Review-purple.svg?style=for-the-badge)](#)

**Editorial review and prose humanization system that detects and eliminates AI-generated writing artifacts, formulaic patterns, significance inflation, and robotic cadence without altering facts, claims, or the author's authentic voice.**

`humanize` is an **editorial system**, not a detector-evasion system. It equips agents with the discipline of an experienced editor: recognizing formulaic AI tells (metronomic cadence, unearned significance, forced triads, copula avoidance) as signals to inspect rather than mechanical rules, and applying surgical, minimal-diff corrections that preserve factual precision and authorial character.

---

## ⚡ Installation

```bash
# Install humanize skill directly
npx skills add harshsinghmp/muse-skills --skill humanize

# Or install the complete Muse Skills suite
npx skills add harshsinghmp/muse-skills
```

---

## 🎯 How to Use

Trigger this skill using natural language or slash commands:

```text
Humanize this documentation article and remove robotic phrasing without changing any API details.
```

```text
Audit this blog post draft for chatbot slop, formulaic contrasts, and significance inflation.
```

```text
Make this executive summary read naturally while preserving our metrics and technical voice.
```

---

## 🧭 Operating Modes

| Mode | Behavior | Best Used For |
| :--- | :--- | :--- |
| **Edit (Default)** | Surgical minimum effective diff. Preserves strong human sentences; edits only formulaic or low-signal clauses. | Pull requests, documentation updates, existing articles. |
| **Rewrite** | Reconstructs supplied prose while strictly locking claims, facts, stance, and audience. | Rough AI first drafts, transcript conversions, raw brainstorms. |
| **Detect (Audit-Only)** | Outputs a structured findings table with exact spans, pattern families, and recommended fixes without mutating text. | Content audits, editorial feedback, PR reviews. |
| **File** | Operates directly on repository files, modifying prose while strictly preserving code blocks, YAML frontmatter, tables, and URLs. | READMEs, markdown docs, technical whitepapers. |
| **Repo Audit** | Surveys a directory or docset to identify dominant anti-slop patterns without performing blind bulk rewrites. | Repo onboarding, docset health checks. |
| **Embedded** | Operates silently as a quality filter within an automated multi-skill pipeline, returning clean prose directly. | Subagent handoffs, automated release summaries. |

---

## ⚖️ Core Priority Order

When editorial goals or rules conflict, adhere to this strict non-negotiable hierarchy:

1. **Accuracy** — Zero fabricated facts, hallucinated metrics, or invented benchmarks.
2. **Meaning and claims** — Preserve the author's core thesis, boundaries, and qualifications.
3. **Authorial voice** — Protect unique tone, humor, bluntness, or intentional phrasing.
4. **Appropriate register** — Match technical, formal, or casual medium expectations.
5. **Specificity** — Concrete mechanisms over abstract benefit claims.
6. **Clarity** — Direct, unambiguous comprehension.
7. **Information density** — Every sentence carries signal; eliminate empty padding.
8. **Natural rhythm** — Varied, human cadence without artificial metronomic flow.
9. **Formatting polish** — Clean sentence-case headings, consistent lists, valid markdown.

---

## 🔍 Anti-Slop Pattern Families

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

---

## 🛡️ False-Positive Guardrail

Before changing a suspected tell, verify:
- Does it convey genuine meaning?
- Does it express the author's intentional voice (e.g. deliberate rhythm, casual fragment)?
- Is it required by technical, legal, or genre precision?

**When uncertain, leave it alone.** Plainness and technical formality are NOT evidence of AI.

---

## 📚 Disclosed Reference Guides

- [`references/patterns.md`](references/patterns.md) — Comprehensive 30+ pattern anti-slop taxonomy with before/after examples.
- [`references/style-guide.md`](references/style-guide.md) — Medium-specific voice calibrations (technical docs, marketing copy, executive briefs, blogs).
- [`references/verification.md`](references/verification.md) — Quality gates, verification checklists, and audit procedures.
