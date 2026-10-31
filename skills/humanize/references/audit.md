# audit — humanize audit mode

## When to Use

- **Pre-publish prose audit**: grade an article, landing page, docset, or newsletter for AI-writing patterns before it ships — without rewriting it (pair with `humanize:edit`/`rewrite` for fixes).
- **Editing-pass certification**: verify a humanization pass removed slop without introducing new tells or altering facts, voice, or claims.
- **False-positive discipline check**: calibrate an editorial review so human writing is not misflagged — the highest-risk failure of AI-writing audits.

## Checklist (structural-signal lens)

- [ ] **Grade structure, not vibes**: word-level detectors are brittle under rewording; the durable signal is structural — how information is presented, ordered, evidenced, and voiced
- [ ] **Self-announcing shape**: tidy symmetric section cadence; every section the same length and register; rule-of-three lists as default rhythm
- [ ] **Boilerplate openings and inflation**: "In today's fast-paced…", "isn't just X — it's Y", "game-changer", "paradigm shift", "poised to disrupt"
- [ ] **Hedging and vague connection**: disclaimers about source availability; vague association claims ("deeply connected to", "plays a role in") instead of specific ones
- [ ] **Canned emphasis**: stock attribution/media-coverage paragraphs; "Experts believe…" without a named expert
- [ ] **Rhythm uniformity**: sentence-length variance collapsed (low burstiness); transition-word openers ("Moreover/Furthermore/Additionally") as the connective tissue
- [ ] **Format tells**: markdown artifacts in non-markdown contexts; em-dash density spikes; list-everything reflex where prose serves better
- [ ] **False-positive guard**: human readers perform near chance at detecting AI text — treat borderline findings as editorial judgment calls, never as authorship accusations; report confidence, not verdicts about who wrote it
- [ ] **Preservation invariant**: the audit never edits; facts, claims, stance, and strong human sentences are read-only during the audit

## Severity & routing

| Finding | Severity | Route to |
|:---|:---|:---|
| Fabricated-sounding specifics (unnamed experts, invented statistics) | `CRITICAL` | `rewrite` with source-verification pass |
| Slop density high across a whole docset | `REQUEST-CHANGES` | `repo-audit`-style pass, then `edit` per file |
| Multiple structural tells in one piece | `REQUEST-CHANGES` | `edit` (surgical, preserve strong human sentences) |
| Isolated stylistic tells, content sound | `REPORT-ONLY` | optional `edit` pass |

## Sources

- Wikipedia — *Signs of AI writing* field guide (descriptive indicators: markdown presence, hedging disclaimers, vague connection, canned emphasis; descriptive-not-prescriptive caveat)
- SlopShape (arXiv 2609.15369) — structural-signature detection of AI-generated commercial content; 176 structural features reach ~97 macro-F1 and survive same-model rewording where word-level signals do not
- Reinhart et al., *PNAS* 2025 — "Do LLMs write like humans?" (grammatical and rhetorical style variation)
- RAID benchmark (ACL 2024) — robustness of machine-generated text detectors; false-positive economics under base-rate shift
- The Economist (2026-07-30) — "How to spot AI writing"
