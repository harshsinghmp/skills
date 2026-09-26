# wireframe — Low-fidelity structure: grayscale blocks, content priorities, layout intent.

## Intake

- Approved UX flows / page inventory
- Content inventory (what copy/assets exist vs TBD)
- Priority per block (goal of the page)
- Device targets

## Deliverable

Wireframe set (grayscale, no styling): annotated blocks with content priority, layout intent per section, responsive notes, and a content plan per block. Explicit approval gate before hi-fi.

## Procedure

1. One page at a time; restate its single goal.
2. Place blocks in grayscale: nav, hero, content units, CTA zones, footer — boxes and labels only (For SaaS landing pages, wireframe the canonical 9 sections and framework sequence in [../templates/saas.md](../templates/saas.md)). Separate with space first (inter-group gap ≥ 2× intra-group); divider lines only where space fails.
3. Annotate each block: purpose, content plan, priority (P0/P1/P2), behavior (what click/hover yields), heading hierarchy with approximate char counts, image aspect ratios, and content source (static/CMS/API).
4. Note responsive collapse order for mobile; show breakpoint variants where order changes meaning.
5. Flag TBD content explicitly — never fake-fill with lorem on client work.
6. Cover data-driven blocks in four states (empty, loading, populated, error) — structure the skeleton to match final geometry.
7. Get approval; then route to `ui` for visual design.

## Quality gate

- [ ] Zero color, zero typography styling — structure only.
- [ ] Every block carries a content plan and priority.
- [ ] Responsive collapse order noted.
- [ ] Approved by client/stakeholder before hi-fi starts.

## Routing

- Approved structure → `ui` for visual design; data-shape questions → `analytics` (reporting mode).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
