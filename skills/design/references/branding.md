# branding — Brand identity system: from logo+brief to tokens, assets rules, and voice guidelines.

## Intake

- Approved logo (or run `logo` mode first)
- Brand personality and positioning
- Existing assets to respect (site, deck, packaging)
- Audience and cultural context

## Deliverable

`brand.md` (identity rules) + DTCG `design-tokens.json`: color system with roles, type pairing and scale, spacing/radius/elevation, imagery direction, voice principles, and do/don't rules.

## Procedure

1. Derive strategy first: category, audience, emotional promise, core metaphor, what to avoid — one ownable idea every token must serve. For greenfield exploration: generate 3+ genuinely independent directions from subject evidence (not mutations of one layout), present them visually before any rationale, and lock exactly one with the human before systematizing — tokens record a committed language, never generate it.
2. Derive the color system from the mark: primary roles, neutrals ramp, semantic set; OKLCH with hex equivalents. One accent, saturation < 80%, a single gray family, off-black instead of pure `#000000`.
3. Choose the type pairing (display + text) and scale (1.25 ratio default); state fallbacks.
4. Define spacing, radius, and elevation scales to match the brand feel (sharp = technical, rounded = friendly).
5. Set imagery direction: photography style, illustration rules, iconography weight.
6. Write voice principles in 3–5 rules with good/bad example pairs. Ban AI-copy clichés (Elevate, Seamless, Unleash, Next-Gen, Delve), lorem placeholders, and fake-round data — plain specific copy with realistic detail.
7. Emit brand.md + tokens.json; contrast-check every default text/background pair.
8. For reference-inspired identity explores, extract hierarchy/pacing/contrast principles only — never copy identity, assets, or copy; control and disclose closeness to the reference (keeper: mengto/generate-reference-inspired-brand-worlds).

## Quality gate

- [ ] Tokens complete: color, type, space, radius — semantically named, not decoratively.
- [ ] Every default text/background pair passes AA.
- [ ] Voice rules have concrete good/bad examples.
- [ ] No invented values where an existing brand asset was provided.
- [ ] Applied-asset audit passes: palette, type/weight, logo clear space, contrast minimums, imagery style, voice match, no prohibited uses.
- [ ] Approval sign-off: correct format/resolution/naming, file size within platform limits; imagery licensed with provenance kept; no trademark/copy violations or unsupported claims.

## Routing

- Existing-site rebrand triage (audit → targeted upgrades, no rewrite) → `refactor-ui` (improve/polish modes).
- Tokens must be extracted from a live reference first → `designscope`, then return here.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
