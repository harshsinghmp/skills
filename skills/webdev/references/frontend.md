# frontend — Frontend: implement components/pages per spec, project patterns first.

## Intake

- Design spec or wireframes (from `design` or client)
- Existing component library/patterns to reuse
- Data requirements and state boundaries
- Responsive and interactive expectations

## Deliverable

Implemented, tested components/pages following repo conventions, with states (loading/empty/error), responsive behavior, and the verification gate green.

## Procedure

1. Read the design spec; list components to build vs reuse — prefer a maintained component registry over restyling bespoke widgets.
2. Detect the project's styling system (Tailwind/CSS modules/styled) and component patterns; match exactly. Centralize tokens first (rename-and-centralize literals into tokens) before any styling work.
3. Build bottom-up: leaf components → composed sections → page.
4. Wire data with the project's data-fetching convention (server components, SWR, etc.).
5. Implement all states: loading, empty, error, success — no happy-path-only UI.
- Static first frame: the hero/first viewport must read complete with JS, media, and WebGL all disabled — content, hierarchy, and CTA intact (motion and canvas enhance, never carry meaning). Decorative canvases are subordinate: one responsibility each, with a static poster fallback and full teardown on unmount. Full motion/canvas discipline routes to `animate`.
6. Responsive container-first: components respond to their container (container queries); breakpoints where content breaks, not device presets; logical properties for RTL; safe-area insets.
7. Design judgments (palette, scale, hierarchy) are not decided here — route to `design`/`refactor-ui`.
8. Run the verification gate; fix everything it reports.
9. Implement Developer Homepage Component Architecture (Jakub Czakon 7-Block Standard):
When implementing developer tools, technical SaaS, or open-source homepages, construct the interface using the 7 canonical component blocks specified in `design/templates/developer.md`:
- **1. Hero (`<DeveloperHero />`)**:
  - Plain-language technical H1 (zero buzzwords).
  - Copyable 1-line installation terminal box (`npm i`, `pip install`, `brew install`) with clipboard API feedback (`navigator.clipboard.writeText`) and keyboard accessibility.
  - Dual CTAs: Primary "Read the Docs" button + Secondary "Star on GitHub" badge.
- **2. Zero-Signup Interactive Demo (`<InteractiveDemo />` / `<SandboxEmbed />`)**:
  - Client-side WebAssembly, mock runner, or SVG/Asciinema player.
  - Strict contract: Zero auth or email gate before seeing execution.
- **3. System Architecture & Data Boundary Diagram (`<ArchitectureOverview />`)**:
  - Responsive SVG or Mermaid component clarifying local vs cloud execution and network privacy.
- **4. Code-First Feature Grid (`<CodeFeatureGrid />`)**:
  - Syntax-highlighted code panels paired with technical capabilities.
  - Multi-language tab switcher with persistent active tab across the page.
- **5. Open Source & Developer Social Proof Bar (`<DeveloperProofBar />`)**:
  - Live/cached GitHub stars counter, release badge, and npm/docker download counters.
- **6. 3-Step TTFV Quickstart (`<QuickstartSection />`)**:
  - Install → Init → Execute walkthrough targeting Time to First Value in < 15 minutes.
- **7. Transparent Pricing & License Grid (`<PricingLicenseGrid />`)**:
  - Open-source tier with clear license declaration and un-gated self-serve tiers.
- **Universal Vertical Component Routing**:
  - *Developer Tools / Infrastructure*: Emits `<DeveloperHero />`, `<InteractiveDemo />`, `<ArchitectureOverview />`, `<CodeFeatureGrid />`.
  - *E-Commerce & Retail*: Emits `<ProductHero />`, `<CollectionGrid />`, `<VariantPicker />`, `<CartDrawer />`, `<ReviewMarquee />` (never terminal code boxes or API grids).
  - *Professional Services & Consulting*: Emits `<ConsultingHero />`, `<ScopeOfWorkGrid />`, `<CaseStudyProof />`, `<CalendlyBooking />`.
  - *Local Business & Healthcare*: Emits `<LocalHero />`, `<HoursLocationBar />`, `<ServiceMenu />`, `<DirectCallAction />`.
  - *General B2B SaaS*: Emits `<SaaSHero />`, `<ProblemSolutionGrid />`, `<EnterpriseLogoMarquee />`, `<TierPricingTable />`.
- **Component Mismatch Prohibition**: Never emit code blocks, terminal boxes, or GitHub metrics for retail, healthcare, consulting, or non-technical SaaS clients. Mismatching component archetypes is a critical P0 front-end defect.

## Quality gate

- [ ] Reused existing components/registry where they existed (no parallel re-implementations).
- [ ] Tokens centralized before styling (no new raw literals).
- [ ] All interactive states implemented.
- [ ] Responsive container-first; logical properties for RTL.
- [ ] Extremes-first tested: narrowest container, 200% zoom, RTL.
- [ ] Verification gate green.
- [ ] Markup semantic (landmarks, headings, labels) — not div soup.
- [ ] For developer tools: 7-block developer homepage architecture followed; 1-command install above the fold; zero-auth demo verified; TTFV quickstart < 15 min.
- [ ] Vertical component alignment verified: component hierarchy strictly matches client industry archetype; developer-specific components (<DeveloperHero />, CLI boxes) NEVER emitted for retail, consulting, or healthcare.

## Routing

- State ladder: local → lifted (2–3 siblings) → URL (filters/pagination) → server cache → global store; never drill props past 3 levels; split data containers from presentational renders; composition over config props.
- Composition patterns (boolean-prop ban): a third boolean prop on one component is the signal to refactor, not to add a fourth — use compound components (shared context, consumers compose exactly the pieces they need), lift shared state into a provider so siblings access it without prop drilling (never sync up via `useEffect`, never read state out of a ref on submit), create explicit variant components instead of boolean modes, and prefer `children` over `renderX` props. Source: `vercel-labs/agent-skills` (`skills/composition-patterns/SKILL.md`, `rules/architecture-compound-components.md`, `rules/state-lift-state.md`, `rules/patterns-explicit-variants.md`).
- React 19 delta (19+ ONLY — skip on 18 or earlier): `ref` is a regular prop (no `forwardRef` wrapper), `use()` replaces `useContext()` and may be called conditionally. Source: `vercel-labs/agent-skills` (`skills/composition-patterns/rules/react19-no-forwardref.md`).
- React & React Native Cross-Platform Standards (`react-native-expert`): Share business logic and state hooks between web (React / Next.js) and mobile (React Native / Expo); use platform-agnostic primitives (NativeWind / Tamagui / StyleX) with zero web-DOM leakage on native; enforce `SafeAreaView`, gesture handling (`react-native-gesture-handler`), and 60/120fps UI thread worklets (`react-native-reanimated`).
- Perceived quality: skeletons over spinners for content, optimistic updates with a rollback path, realistic content over lorem; native focusables over div-clicks, move/trap focus on content change, label icon-only controls.
- AI-aesthetic ban + split rule: no generic purple gradients, rounded-2xl-everything, stock grids, or shadow-heavy cards — spacing-scale, type hierarchy, and brand tokens instead; split files past ~200 lines. Source: `addyosmani/agent-skills` (`frontend-ui-engineering`).
- Design judgments route to `design`/`refactor-ui`; motion/canvas discipline routes to `animate`.

## 🧩 Isolated Widget Standard (Shadow DOM & CSS Scoping for Embeddables)

When developing client lead capture widgets, chat bubbles, review modals, or micro-frontends intended to be embedded on third-party host sites (WordPress, Shopify, Webflow):

1. **Shadow DOM Encapsulation**: Embeddable widgets MUST render inside a Shadow Root (`element.attachShadow({ mode: 'open' })`). This physically walls off CSS inheritance, preventing host styles from mutating widget typography or buttons, and preventing widget rules from breaking host navigation.
2. **CSS Reset Inside Shadow Root**: Include `:host { all: initial; }` at the root of the shadow stylesheet to reset any inherited properties.
3. **No Global ID or Class Collisions**: If Shadow DOM cannot be used (e.g. legacy script constraints), prefix all CSS classes with a distinct agency namespace (`.muse-embed-*` / `.agency-widget-*`) and use CSS Modules. Never target bare elements (`div`, `p`, `button`) globally.

---

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.

