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
3. Default to minimum-diff edit: keep strong human sentences, fix only formulaic clauses.
4. Sweep the pattern families: significance inflation, shallow -ing participles, brochure hype, copula avoidance, binary-contrast formulas, forced triads, synonym cycling, phantom rebuttals, aphorism pull-quotes, summary throat-clearing.
5. Vary sentence rhythm; break metronomic cadence deliberately.
6. Preserve formatting: code blocks, frontmatter, tables, and URLs untouched.
7. Re-read against the invariants — if a fact or the voice shifted, revert it.
8. Report what was changed and why in one short summary.

## Quality gate

- [ ] Facts, claims, and stance unchanged.
- [ ] Authorial voice preserved, not sanded to neutral.
- [ ] Pattern families swept, not spot-fixed.
- [ ] Code/frontmatter/tables/URLs untouched.
- [ ] Rewrites reported with rationale.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
