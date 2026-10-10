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

## 🏛️ The CMS-First Cohesion Invariant (Universal Rule)

Whenever a Content Management System (CMS) or Visual Page Builder is present in the project stack, the agency adheres to the **CMS-First Cohesion Invariant**:

### 1. Zero Hardcoding & CMS Cohesion
- **Dynamic Content & Sections**: All pages, sections, marketing copy, media assets, navigation links, and configurable component options must be defined and created inside the CMS schema or visual builder fields.
- **Client Editability**: Non-technical clients must be able to edit, reorder, add, or disable sections directly through the CMS/builder interface without developer intervention or touching code.
- **Universal Builder & CMS Coverage**: Applies to any headless or coupled stack configured in the repository context (`.agents/context/stack.md`):
  - *WordPress*: Elementor, Gutenberg Block Patterns / FSE, Bricks Builder, ACF Pro flexible content.
  - *Astro*: Emdash, Aria Builder, Decap/Tina CMS, Content Collections with CMS schemas.
  - *Next.js / SolidJS*: Payload CMS, Sanity, Strapi, Storyblok, Contentful.
  - *React*: Puck Visual Builder, Builder.io, Plasmic.

### 2. Styling, Tokens & Custom Code Scoping
- **Central Design Tokens**: Global design tokens (OKLCH color palettes, fluid typography `clamp()`, spacing scales) reside in the central stylesheet (`globals.css` / `tokens.css`) or the CMS/builder's global theme style kit.
- **Builder CSS/JS Placement**: When styling custom widgets, templates, or page sections within visual builders (Elementor, Puck, Aria Builder), styles must be placed inside the page builder's designated custom CSS/JS fields or component-scoped style modules — never scattered as arbitrary inline styles or disconnected ad-hoc style sheets.
- **Token Class Reuse**: Reuse atomic utility classes and CSS variables generated from central tokens inside the builder settings rather than hardcoding arbitrary pixel values or hex codes.

### 3. Pre-Execution User Escalation Gate
- If a requested feature, layout, or capability **cannot** be implemented natively inside the CMS or visual builder:
  1. **Stop & Alert**: The agent must explicitly halt and notify the user *before* writing code.
  2. **Present Technical Trade-off**: Explain why the CMS/builder cannot accommodate the feature (e.g. lack of field primitives, severe builder DOM performance degradation, complex server-side streaming requirement).
  3. **Offer Clean Architectural Alternatives**: Present the proposed code-level bypass (custom micro-app, headless API route, or shortcode bridge) and await explicit confirmation before proceeding.

## Quality gate

- [ ] Content types modeled for reuse (components, not one-offs).
- [ ] CMS-First Cohesion verified: all editable content and sections wired to CMS fields/schemas.
- [ ] Styles and tokens adhere to global tokens or builder custom CSS sections; no hardcoded styling bypass.
- [ ] Pre-execution escalation triggered if any feature requires escaping CMS/builder boundaries.
- [ ] Frontend queries typed.
- [ ] Preview works at real routes.
- [ ] Import verified by count + spot-check.
- [ ] Editorial workflow documented.
- [ ] WordPress security: `DISALLOW_FILE_MODS` enabled, XML-RPC disabled, `.env` isolated.
- [ ] Elementor DOM depth audited (<8 levels); unused CSS/JS deregistered on non-builder templates.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
