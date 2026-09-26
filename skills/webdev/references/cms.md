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
7. **WordPress Pro Architecture (`wordpress-pro`)**:
   - Structure production WordPress using Bedrock (`/web/app/`), isolating core from custom code.
   - Enforce composer-driven plugin and theme dependencies; manage environmental variables via `.env` (never commit DB credentials).
   - Use Advanced Custom Fields (ACF Pro) with typed JSON sync (`acf-json/`) or custom Gutenberg Block Patterns (FSE) instead of unstructured WYSIWYG blobs.
8. **Elementor Engineering & Performance (`wordpress-elementor`)**:
   - Custom Widgets: Extend `\Elementor\Widget_Base`, register scripts/styles with conditional enqueueing only when widget is active on page.
   - DOM Optimization: Enable Elementor performance features (Optimized DOM Output, Inline Font Icons, Improved Asset Loading) to prevent 15+ level deep `div` nesting.
   - Dynamic Data: Bind widgets to ACF fields using Elementor dynamic tags rather than hardcoding client data.
9. **Headless & Enterprise WordPress Integration**:
   - Pair WordPress backend with headless frontends (Next.js / Astro) via WPGraphQL or REST API.
   - Implement webhooks (`publish_post`, `save_post`) triggering on-demand Incremental Static Regeneration (ISR) or cache tag purges.
   - Enforce Redis Object Caching for database query transient caching.

## Quality gate

- [ ] Content types modeled for reuse (components, not one-offs).
- [ ] Frontend queries typed.
- [ ] Preview works at real routes.
- [ ] Import verified by count + spot-check.
- [ ] Editorial workflow documented.
- [ ] WordPress security: `DISALLOW_FILE_MODS` enabled, XML-RPC disabled, `.env` isolated.
- [ ] Elementor DOM depth audited (<8 levels); unused CSS/JS deregistered on non-builder templates.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
