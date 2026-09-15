# cms — CMS: content modeling, integration, editor experience, previews.

## Intake

- CMS choice (or criteria for choosing)
- Content types and their fields
- Editor/author workflow (who publishes what)
- Frontend rendering stack

## Deliverable

Content model (types, fields, validation), CMS integration with typed frontend queries, editor experience (draft preview, roles), and a migration/import path for existing content.

## Procedure

1. Model content to the frontend's needs (page sections, reusable components) — model for reuse, not one-off pages.
2. Define types with required-field validation and sensible defaults for editors.
3. Integrate with typed queries (no untyped payload in components).
4. Editor experience: draft preview at real routes, role-appropriate permissions.
5. Migrate existing content: export → transform → import script, verified counts.
6. Document the editorial workflow (draft → review → publish) inside the CMS.

## Quality gate

- [ ] Content types modeled for reuse (components, not one-offs).
- [ ] Frontend queries typed.
- [ ] Preview works at real routes.
- [ ] Import verified by count + spot-check.
- [ ] Editorial workflow documented.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
