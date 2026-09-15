# branding — Brand identity system: from logo+brief to tokens, assets rules, and voice guidelines.

## Intake

- Approved logo (or run `logo` mode first)
- Brand personality and positioning
- Existing assets to respect (site, deck, packaging)
- Audience and cultural context

## Deliverable

`brand.md` (identity rules) + DTCG `design-tokens.json`: color system with roles, type pairing and scale, spacing/radius/elevation, imagery direction, voice principles, and do/don't rules.

## Procedure

1. Derive the color system from the mark: primary roles, neutrals ramp, semantic set; OKLCH with hex equivalents.
2. Choose the type pairing (display + text) and scale (1.25 ratio default); state fallbacks.
3. Define spacing, radius, and elevation scales to match the brand feel (sharp = technical, rounded = friendly).
4. Set imagery direction: photography style, illustration rules, iconography weight.
5. Write voice principles in 3–5 rules with good/bad example pairs.
6. Emit brand.md + tokens.json; contrast-check every default text/background pair.

## Quality gate

- [ ] Tokens complete: color, type, space, radius — semantically named, not decoratively.
- [ ] Every default text/background pair passes AA.
- [ ] Voice rules have concrete good/bad examples.
- [ ] No invented values where an existing brand asset was provided.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
