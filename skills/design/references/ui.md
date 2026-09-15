# ui — Design interfaces: layouts, hierarchy, tokens, and component states.

Distilled from a 127-source production-UI corpus (tool-independent mechanisms only;
evaluative audit/polish mechanics live in `refactor-ui`, routed below).

## Intake

- Page inventory and each page's single business goal
- Audience and primary device (mobile-first if unknown)
- Brand tokens or brand doc (mandatory if the client has one)
- Approved references/mood; existing stack and component library
- Visitor lens: Persuade+Experience (marketing) vs Operate+Read (product) — changes what counts as crowded

## Deliverable

Per-screen design spec: section-by-section layout structure, applied type/color/spacing tokens, component inventory with states, responsive breakpoints, interaction notes. Plus a token set (DTCG-shaped) when the client has none.

## Procedure

1. State the page's one goal and the primary action it must drive.
2. Set the grid and spacing scale before any blocks (4px base). Inter-group gap ≥ 2× intra-group (e.g. 8px inside cards, 16px+ between sections). Prefer space, then surface shift, then divider lines — in that order.
3. Block the layout as sections: header → hero → proof → features → CTA → footer patterns.
4. Assign the type hierarchy: display/heading/body/caption from the scale; one display + one text family. Body measure 60–75ch; line-height by role (1.1 headings, 1.5–1.6 body); negative tracking on large display, slight positive on small labels; `balance` on headings, `pretty` on descriptions; tabular numerals on changing values; sentence-case labels.
5. Assign color roles (primary/action/neutral/semantic); check AA contrast for each text pair. One theme per page — no section-level inversion; semantic tokens so dark mode is a value swap, verified for logos/icons in both.
6. Radius: concentric — inner radius = outer radius − padding. Depth: shadows signal elevation, borders signal structure; name z-tokens, never raw high values; still images get a 1px neutral outline.
7. Componentize: list every component with its states (hover, focus, disabled, loading, empty, error). Touch inputs ≥ 16px type to avoid mobile zoom; align icons optically (nudge by eye, match icon stroke to adjacent text weight).
8. Define responsive behavior where the content breaks (not device presets) — what stacks, what truncates, what hides; test extremes first (narrowest, widest, 200% zoom).
9. Annotate interactions (what animates is decided with `animate`, but note intent).
10. Emit the spec doc + tokens; hand off to engineering or `refactor-ui` for polish later.

## Quality gate

- [ ] Hierarchy readable at arm's length — one clear primary action per screen.
- [ ] All text pairs pass AA contrast.
- [ ] Spacing/type/radius only from the stated scale (no magic numbers).
- [ ] Every component has its full state list.
- [ ] Responsive behavior stated, not implied.
- [ ] Theme parity: spec holds in both light and dark without structural change.

## Routing (token discipline — do not duplicate)

- Existing UI needs verdict/score/polish/drift triage → `refactor-ui` (review/audit/polish modes).
- Tokens must be extracted from a live reference first → `designscope`, then return here.
- Motion choreography → `animate` (this mode notes intent only).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
