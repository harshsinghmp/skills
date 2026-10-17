# Humanize verification guide

## Purpose

Verification is a quality gate, not a contest to reach zero AI signals.

## Required checks

### Claim preservation

Compare source and rewrite for:

- names
- numbers
- dates
- URLs
- citations
- quotations
- technical claims
- legal or policy scope
- uncertainty
- promises

Any unsupported addition is a defect.

Any lost qualifier that changes meaning is a defect.

### Voice preservation

Check whether:

- the author's vocabulary remains recognizable
- distinctive phrases survived where useful
- the level of formality remains appropriate
- personality was not manufactured
- the rewrite did not become generic corporate prose

### Information density

For every sentence, ask what it contributes:

- fact
- claim
- mechanism
- example
- constraint
- consequence
- argument
- necessary connective tissue

If it contributes none of these, cut or revise it.

### Structure

Check for:

- unnecessary introductions
- repeated conclusions
- heading echoes
- phantom objections
- fake alternatives
- identical section templates
- excessive list formatting
- interchangeable paragraphs

### Style

Check for:

- inflated importance claims
- vague attributions
- empty filler
- unexplained buzzwords
- synonym cycling
- forced contrasts
- manufactured punchlines
- decorative formatting

## Detection scoring

If the user asks for a score, call it a **style-signal score**.

Do not call it an authorship probability.

A useful scoring model is qualitative:

- **Low:** isolated weak signals, normal human variation
- **Moderate:** several correlated patterns that reduce specificity or density
- **High:** repeated formulaic construction, inflated language, assistant artifacts, and weak authorial grounding

Do not use a universal numeric threshold as proof that a text is AI-written.

If a repository provides a deterministic linter, treat its results as review signals. The human/editorial pass remains authoritative.

### Deterministic scorer shape (diagnostic aid, not verdict)

(source: `conorbronsdon/avoid-ai-writing` detector engine, MIT — mechanism only; no pass/fail gate imported, per buyer philosophy above)

When a zero-dependency scorer exists in the repo (or is added by the team), the
useful output shape is: numeric style-signal score + categorical labels +
`issues[]` (each with span, pattern, and suggested fix) + run stats. A CI hook
on such a scorer gates on issues-count as a *triage signal* (route the file to
an editorial pass), never as proof of authorship and never as a pass/fail
quality verdict. Detector-evasion tuning stays prohibited (`SKILL.md` Hard
Prohibitions).

## Detector-facing work

Never promise:

- undetectable text
- guaranteed human classification
- immunity from future detectors
- a permanent score

Detector outputs can change with the tool, model, corpus, and date.

Use them to identify possible stylistic problems, not to justify making text less truthful or less like the author.

## File verification

For prose files:

- preserve frontmatter
- preserve code blocks
- preserve URLs and link targets
- preserve tables when they are structured data
- preserve quotations unless explicitly editing them
- avoid touching non-prose regions

When Git is available, make the rewrite reviewable as a diff.

### Preservation checklist (mechanical pre-pass)

(source: `conorbronsdon/avoid-ai-writing` validator leg, MIT — checks only, folded into the editorial pass)

Before judging prose, run (by hand or script) these preservation checks and fail
the file back to the author when one fires — a broken fence is a defect, not a
style choice:

- fenced code blocks open/close balanced, language tags intact
- YAML frontmatter parses, keys unchanged
- blockquotes, tables, inline code, headings structurally intact
- URLs and link targets byte-identical unless explicitly editing them
- no residual growth: the edit adds no new unsupported claims while fixing style

Apply context profiles lightly (docs vs blog vs email vs casual): strictness on
formatting rules follows the venue; claim-preservation above never relaxes.

## Repo audit verification

For a documentation audit:

1. Inventory candidate prose files.
2. Score/rank by concentration of signals.
3. Identify dominant patterns.
4. Review the highest-impact files first.
5. Rewrite only selected files.
6. Re-run the audit after changes.

Do not rewrite the entire repository solely because the linter finds a signal.

## Suggested optional tools

If a repository already contains lint or benchmark tooling for this skill, use it when available.

Examples of useful checks:

- vocabulary scan
- filler scan
- structure scan
- cadence report
- preservation/semantic-drift check
- before/after diff review

Tool output is diagnostic. It does not override the editorial rules in `SKILL.md`.
