# ux — UX structure: flows, information architecture, journey maps, friction audits.

## Intake

- Users, jobs-to-be-done, entry points (ads, organic, direct)
- Current IA or site map if one exists
- Analytics/heatmaps or known friction points
- Business constraints (what can't change)

## Deliverable

Flow diagrams (entry → steps → decision points → exits including error paths), a sitemap/IA with labels in user language, a journey map with friction flags, and a prioritized friction-fix list.

## Procedure

1. List user segments and each one's job-to-be-done.
2. Map each critical flow: entry, steps, decisions, exits — include error and abandonment paths.
3. Derive the IA: group by user mental model, label in their words, not internal jargon.
4. Overlay the journey: actions, thoughts, emotions, obstacles per stage.
5. Run a heuristic pass (findability, feedback, consistency, error recovery, cognitive load).
6. Proof-gate every finding before reporting: Contract (which binding rule it breaks) + Runtime (it reaches a real rendered surface, not a hypothetical) + Correction (one deterministic change fixes it). Candidates without all three are notes, not findings — report at most 3, prioritized; anything unrun is marked Not verified, never implied.
7. Rank friction fixes by impact ÷ effort; hand the top ones to `wireframe` or `ui`. Report one row per root cause: Severity / Location / Before / After / Why.

## Quality gate

- [ ] Every flow has entry, exit, and error paths — no happy-path-only maps.
- [ ] Labels validated against user language, not company jargon.
- [ ] Step count minimized — every step justified or deleted.
- [ ] Keyboard/no-mouse path exists for every interaction.
- [ ] Each friction finding names where it was observed.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
