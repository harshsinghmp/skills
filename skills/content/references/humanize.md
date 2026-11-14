# humanize — Humanize: strip AI-sounding patterns while locking facts and voice.

## Intake

- The draft to edit (text or file)
- Stance, audience, and claims to preserve exactly
- Preferred register (technical, formal, casual)
- Rewrite vs minimum-diff edit vs audit-only

## Deliverable

Edited prose with AI-artifact patterns removed: inflated significance, shallow -ing participles, brochure hype, copula avoidance, forced triads, phantom rebuttals — facts, claims, and authorial voice preserved.

## Procedure

1. Load the standalone `humanize` skill as the engine and its pattern catalog as the checklist.
2. Lock the invariants first: facts, claims, stance, audience, and voice must not change.
3. Default to minimum-diff edit: keep strong human sentences, fix only formulaic clauses. Long drafts (>500 words): report pattern hits with locations first and confirm ambiguous cases before rewriting — never guess an author's intent.
4. Sweep the pattern families: significance inflation, shallow -ing participles, brochure hype, copula avoidance, binary-contrast formulas, forced triads, synonym cycling, phantom rebuttals, aphorism pull-quotes, summary throat-clearing.
5. Vary sentence rhythm; break metronomic cadence deliberately.
6. Preserve formatting: code blocks, frontmatter, tables, and URLs untouched.
7. Re-read against the invariants — if a fact or the voice shifted, revert it.
8. Report what was changed and why in one short summary.
9. For drafts needing more than a slop pass, run the Seven Sweeps in order, looping back to earlier sweeps after each pass (source: marketingskills `copy-editing` SKILL.md): Clarity → Voice → So What → Prove It → Specificity → Emotion → Zero Risk. One dimension per pass; a later pass that breaks an earlier one sends you back.
10. Gate ship-ready copy with an Expert Panel score (source: marketingskills `copy-editing` SKILL.md): 3–5 personas matched to the copy type, each scoring 1–10 on a stated rubric; ship bar is 7+ from every persona and 8+ average — otherwise revise and re-score.
11. When voice must hold across multiple outputs (not one piece), build a reusable VOICE PROFILE first and treat it as the canonical voice layer downstream (source: ECC `brand-voice` SKILL.md + `references/voice-profile-schema.md`): gather 5–20 recent samples in source-priority order (original posts/threads → articles/essays/memos → working outbound that earned replies → docs/changelogs/site copy), extract the 9-point set (rhythm, compression, capitalization, parentheticals, question use, claim style, preferred moves, banned moves, CTA rules + per-channel notes for X/LinkedIn/Email), emit the profile block, and reuse it instead of re-deriving voice per output. Supplier house defaults never port — only the source-derived profile ships.

## Quality gate

- [ ] Facts, claims, and stance unchanged.
- [ ] Authorial voice preserved, not sanded to neutral.
- [ ] Pattern families swept, not spot-fixed.
- [ ] Code/frontmatter/tables/URLs untouched.
 - [ ] Rewrites reported with rationale.
 - [ ] Seven Sweeps run in order with loop-backs (long/complex drafts); Expert Panel gate passed (7+ each, 8+ avg) where ship-ready quality is claimed.
 - [ ] Multi-output work reuses one source-derived VOICE PROFILE as the canonical layer; no second ad-hoc voice model.
- [ ] Final rewrite uses no em/en dashes unless the author sample does; swap for period/comma/colon/parens; code/URLs exempt.
- [ ] Vague connections fixed by naming the relationship the source gives; if unsourced, keep vague rather than inventing.
- [ ] Final sweep done: read aloud + hunted 5 surviving tells (not-X-but-Y, one-line closer, dash, triad, bold label); points restated naturally, phrases never patched.
- [ ] Sample overrides patterns: author sample dash rate wins over generic rules.
- [ ] Curly quotes normalized to straight quotes.
- [ ] No new accent installed: no added first-person, manufactured stakes, contrarian foil, performed candor, added dashes, or invented specifics (keeper: wshobson/avoid-ai-writing).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
