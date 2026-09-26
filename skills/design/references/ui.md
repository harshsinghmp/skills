# ui — Design interfaces: layouts, hierarchy, tokens, and component states.

Distilled from a 127-source production-UI corpus (tool-independent mechanisms only;
evaluative audit/polish mechanics live in `refactor-ui`, routed below).

## Intake

- Page inventory and each page's single business goal
- Audience and primary device (mobile-first if unknown)
- Brand tokens or brand doc (mandatory if the client has one)
- Approved references/mood; existing stack and component library
- Visitor lens: Persuade+Experience (marketing) vs Operate+Read (product) — changes what counts as crowded
- One-line Design Read before generating: page kind + audience + vibe + system/aesthetic family; if the brief genuinely diverges, ask exactly one question — otherwise declare the read and proceed
- Subject-vernacular grounding (source: `anthropics/frontend-design`, MIT): derive palette/type/layout from the subject's own materials and vernacular (a toy brief for ages 8–11 vs an analyst dashboard obey different worlds); when the brief lacks a concrete subject/audience/job, propose one and design to it.
- Pre-flight scan (source: `Nutlope/hallmark` component-scope Step 0 + Design-flow Step 0, MIT): when project code exists, read tokens/fonts/framework/motion-stance/spacing *before asking anything* — emit a preserve/introduce block with file:line cites, cache it (reuse unless manifests changed); stomping an established palette is an uninstall-grade defect. No signals → proceed silently with the full stack.

## Deliverable

Per-screen design spec: section-by-section layout structure, applied type/color/spacing tokens, component inventory with states, responsive breakpoints, interaction notes. Plus a token set (DTCG-shaped) when the client has none.

## Taste calibration

- Set three dials from the Design Read (baseline Variance 8 / Motion 6 / Density 4; minimalist 5–6/3–4/2–3, playful 9–10/8–10/3–4, trust-first 3–4/2–3/4–5); every layout, motion, and density call below follows the dials.
- Commit to one aesthetic archetype per surface — never mix two (e.g. Swiss-print vs terminal, minimal vs maximal) inside one interface.
- Break LLM defaults deliberately: no AI-purple gradient, no centered dark-mesh hero, no three-equal-cards row, no glassmorphism on everything.
- Direction before code: write a one-line visual thesis + one-line motion narrative before generating anything — every section must serve the thesis, every animation the narrative (choreography itself routes to `animate`).
- Reject list (quality bar): generic blobs/gradients, ornamental bento grids with dead cells, blanket glassmorphism, stock layouts (three-equal-cards, centered dark-mesh hero), motion without a narrative role. Tell-catalog rejects (source: `anthropics/frontend-design`, MIT): cream `#F4F1EA` + terracotta `#D97757` pairing, black + acid-green/vermilion pairing, broadsheet hairline dividers with zero radius, SaaS-card kit (single radius + `rgba(0,0,0,.1)` shadow + gradient wash), template chrome (ALL-CAPS eyebrow, `A · B · C` meta row, `WORD — fragment` headlines, `#0B0B0B`/`#111` near-black, mono data labels, trailing `→`).
- Self-critique before build: if the plan reads like the default for any similar brief rather than a choice for this one, revise and note what changed and why; structural devices encode information (numbered markers only for real sequences).
- Diversification rotation (source: `Nutlope/hallmark` Steps 2/2.5, MIT): track recent builds (macrostructure + theme + nav/footer archetypes); each new surface must differ from the last entries — different page-shape, and theme differing on ≥1 axis (paper band / display style / accent hue). State the pick and the axes it differs on before generating. Inverted on system-managed projects: pages share the locked system instead.
- Pre-emit critique stamp (source: `Nutlope/hallmark` discipline 1, MIT): score the artifact 1–5 on Philosophy, Hierarchy, Execution, Specificity, Restraint, Variety — anything <3 forces a revision pass; stamp the six scores atop the artifact.

## Procedure

1. State the page's one goal and the primary action it must drive.
2. Set the grid and spacing scale before any blocks (4px base). Inter-group gap ≥ 2× intra-group (e.g. 8px inside cards, 16px+ between sections). Prefer space, then surface shift, then divider lines — in that order.
3. Block the layout as sections: header → hero → proof → features → CTA → footer patterns (For SaaS landing pages, implement the canonical 9-section problem-solving layout and copywriting framework mapping in [../templates/saas.md](../templates/saas.md)). Hero H1 ≤ 3 lines in a wide container; no stats, pills, or badges inside the hero — one focal message, everything else subordinate. Bento grids interlock with no dead cells; 3–5 intentional cards beat 8 messy ones.
4. Assign the type hierarchy: display/heading/body/caption from the scale; one display + one text family. Body measure 60–75ch; line-height by role (1.1 headings, 1.5–1.6 body); negative tracking on large display, slight positive on small labels; `balance` on headings, `pretty` on descriptions; tabular numerals on changing values; sentence-case labels. Glyph correctness is silent and automatic: curly quotes/apostrophes, en dash for ranges, em dash for breaks, single ellipsis character, one space after punctuation, no underline on non-links.
5. Assign color roles (primary/action/neutral/semantic); check AA contrast for each text pair. One theme per page — no section-level inversion; semantic tokens so dark mode is a value swap, verified for logos/icons in both.
6. Radius: concentric — inner radius = outer radius − padding. Depth: shadows signal elevation, borders signal structure; name z-tokens, never raw high values; still images get a 1px neutral outline.
7. Componentize: list every component with its states (hover, focus, disabled, loading, empty, error). State priority when several apply: disabled > loading > active > focus > hover > default. In card rows, pin CTAs to a shared baseline and start feature lists at the same Y across columns. Touch inputs ≥ 16px type to avoid mobile zoom; align icons optically (nudge by eye, match icon stroke to adjacent text weight). For single-component briefs, ship an 8-state demo wrapper alongside the artifact (source: `Nutlope/hallmark` component-scope, MIT): all states (default · hover · focus-visible · active · disabled · loading · error · success) rendered side-by-side via force-classes (`.is-hover` etc.), each labelled — opened once for review, then deleted, never production code.
8. Define responsive behavior where the content breaks (not device presets) — what stacks, what truncates, what hides; test extremes first (narrowest, widest, 200% zoom).
9. Annotate interactions (what animates is decided with `animate`, but note intent).
10. Emit the spec doc + tokens; hand off to engineering or `refactor-ui` for polish later. When a visual reference governs, extract its type/spacing/color/component tokens first and anti-drift check the build against it. Give each page one signature second-read detail — restraint everywhere else.

## Detail rules

- Dark surfaces: build elevation from lighter surfaces, not shadows; desaturate bright colors 10–20%; off-white text (`#E0E0E0`-grade, never pure white); dim imagery and ship light-on-dark logo variants.
- Honest assets: no fake testimonials, invented partnerships, or logo-wall theater — every proof element must be real; photo avatars over initials/illustrations for people; keep media provenance (source/credit) with the asset, never stripped.
- Data graphics: chart by intent (bar = comparison, line = trend, donut = part-whole under ~6 slices, histogram = distribution, scatter = relationship); bars start y at zero; label directly over legends; colorblind-safe palette with redundant encoding (pattern/label/shape — never color alone).
- Isolation: one differentiated element per screen/section; audit isolation inflation (every new highlight request degrades the system); differentiation must survive grayscale.
- Specificity caution (source: `anthropics/frontend-design`, MIT): a type selector (`.section`) vs an element selector (`.cta`) can cancel out on section padding/margin — keep section spacing on one governed selector.
- Vocab cohesion (source: `anthropics/frontend-design`, MIT): an action keeps one name through the whole flow (button `Publish` → toast `Published`); errors stay direct, never apologetic; empty screens invite the action.

## Quality gate

- [ ] Hierarchy readable at arm's length — one clear primary action per screen.
- [ ] All text pairs pass AA contrast.
- [ ] Spacing/type/radius only from the stated scale (no magic numbers).
- [ ] Every component has its full state list.
- [ ] Interactive elements keyboard-operable with visible `:focus-visible` and named accessible names (icon-only buttons carry ARIA labels); touch targets ≥ 44×44px.
- [ ] Responsive behavior stated, not implied.
- [ ] Safe areas respected — no fixed UI under notch/status/gesture bars; scroll content clear of sticky bars.
- [ ] Reduced-motion honored and layout holds at largest system text size.
- [ ] Theme parity: spec holds in both light and dark without structural change.
- [ ] Drift audit before changes: locate the theme entry point first, report findings before fixing, flag hardcoded color/spacing/type outside tokens (audit against the app's own idiom, never a foreign default).
- [ ] Anti-slop passive gate run: one focal point per viewport, proximity before containers, nothing that could paste unchanged into an unrelated product (keeper: mengto/no-ai-design-slop).
- [ ] Findings classified quality-defect vs slop-pattern, each cited to a concrete location — no numeric slop scores, no speculative redesign (keeper: mengto/audit-ai-design-slop).
- [ ] Body measure 65–75ch with balanced headings; real-copy overflow checked at every breakpoint (keeper: pbakaus/impeccable).
- [ ] Browser surfaces themed from the palette — selection, caret, scrollbar, focus ring, underline offset, tabular numerals (keeper: pbakaus/impeccable).
- [ ] No identical icon+heading+text card grids as page structure; no kicker/eyebrow above headings (keeper: pbakaus/impeccable).
- [ ] Hover treatments gated to hover-capable devices — no sticky hover states left on touch (keeper: animate-ui).
- [ ] Every form input ships with label, description, and error state — never a bare input (keeper: prototyper-ui).
- [ ] New components justified against the existing inventory — reuse or variant before inventing (keeper: create-component).

## Routing (token discipline — do not duplicate)

- Existing UI needs verdict/score/polish/drift triage → `refactor-ui` (review/audit/polish modes).
- Tokens must be extracted from a live reference first → `designscope`, then return here.
- Motion choreography → `animate` (this mode notes intent only).
- Raster art, mockups, OG/share imagery beyond spec → `graphics` mode.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
