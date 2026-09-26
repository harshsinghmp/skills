# Review Render — findings → shareable 2-column review artifact

> Source: `alirezarezvani/md-review` (MIT, raw SKILL.md fetched 2026-09-19
> from `github.com/alirezarezvani/claude-skills`) — mechanism only: 2-column
> HTML renderer + hard rules. The supplier's Python pipeline
> (`diff_parser.py` → `annotation_extractor.py` → `review_html_renderer.py`)
> is NOT imported; the rules below are tool-independent and apply to any
> markdown-or-HTML rendering of review output.

Use when a review must leave the chat as a readable artifact — a PR writeup
with diff blocks plus severity-tagged findings becomes a single review
document: unified diff on the left, severity-tagged annotation cards on the
right, top jump-nav listing every finding with severity counts
("3 BLOCKER · 2 MAJOR · 1 NIT").

## Hard rules

1. **Name the reviewer.** Every rendered review carries a named human
   reviewer in the footer. Refuse to render without one — a review with no
   owner is a draft, not a verdict.
2. **Refuse non-reviews.** No diff hunks present means it isn't a code
   review — route prose/reports to a document renderer instead.
3. **Severity is never color-only.** Every badge ships color + icon + text
   label (and `aria-label` in HTML) per WCAG 1.4.1. Color-blind reviewers
   must get the same signal.
4. **Default severity convention** is BLOCKER / MAJOR / MINOR / NIT (Google
   Code Review Developer Guide); swap only for a team-documented alternative,
   position 0 = most severe.
5. **Single-file output.** All styling inline; no external dependencies
   except fonts. General (unanchored) comments render in their own bottom
   section, never dropped.
6. **Anchor everything you can.** Each annotation attaches to its nearest
   hunk with file + line; unanchored findings go to the bottom section.

## Finding format (one card per finding)

`[SEVERITY] path:line — title` / expectation / trigger / evidence /
remedy. Findings that only restate the diff without a violated expectation
do not earn a card — the jump-nav counts findings, not observations.
