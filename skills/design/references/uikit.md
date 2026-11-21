# uikit — Component libraries, headless primitives, Starwind UI / Tailwind kits, and design taste stitching.

## Intake

- Brand tokens (`brand.md`, DTCG `design-tokens.json`, or style anchors)
- Target framework and styling engine (Astro, Tailwind CSS v3/v4, React, Vue, Svelte, or native CSS)
- Component scope: Atomic primitives (Buttons, Inputs, Badges), Molecules (Cards, Form Groups, Dialogs), or Organisms (Headers, Sidebars, Data Tables)
- Visual taste & personality direction (Stitch Design Taste: minimal, technical, brutalist, luxury editorial, or friendly SaaS)

## Deliverable

A production-grade, accessible UI component kit architecture:
1. Composable component primitives (Starwind UI / Radix / Tailwind patterns).
2. Token-to-component mapping (color semantic roles, radius, typography, shadow hierarchies).
3. State machine matrix (default, hover, focus-visible, active, disabled, loading, error).
4. Clean, copy-paste or package-ready component code with zero unnecessary runtime bloat.

## Procedure

1. **Establish Design Taste & Point-of-View ("stitch-design-taste")**:
   - Never settle for generic bootstrap defaults. Infuse distinctive visual personality through deliberate styling details:
     - **Elevation & Light**: Ambient + key shadow layering (`box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08)`), subtle inset highlights (`inset 0 1px 0 rgba(255,255,255,0.1)`).
     - **Borders & Separation**: 1px borders with alpha channel transparency (`border-border/60`), subtle contrast dividers.
     - **Surface Depth**: Nuanced surface layering (`bg-surface-lowest`, `bg-surface-base`, `bg-surface-raised`, `bg-surface-overlay`).
     - **Typography Hierarchy**: Crisp tracking (`tracking-tight` on headings), proper tabular numbers (`tabular-nums`) for data/stats, strict optical contrast.

2. **Scaffold Token Bridge (DTCG to CSS / Tailwind)**:
   - Map semantic roles directly to CSS custom properties / Tailwind utility tokens:
     - `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--destructive`, `--border`, `--ring`, `--radius`.
   - Support dark mode out of the box via OKLCH semantic tokens.

3. **Construct Headless & Composable Primitives (Starwind UI pattern)**:
   - Implement core component primitives following headless conventions (similar to Starwind UI, Radix Primitives, Shadcn):
     - **Actions**: Button, IconButton, ButtonGroup, LinkButton.
     - **Inputs**: TextInput, Textarea, Select, Checkbox, RadioGroup, Switch, Slider.
     - **Display**: Badge, Card, Avatar, Tag, Accordion, Separator, Skeleton, Table.
     - **Feedback**: Alert, Toast, Progress, Spinner/Loader, EmptyState.
     - **Overlays**: Dialog/Modal, Drawer/Sheet, Popover, DropdownMenu, Tooltip, ContextMenu.
     - **Navigation**: Tabs, Breadcrumb, Pagination, NavigationMenu.

4. **Variant Architecture (Class Variance Authority / CVA)**:
   - Implement type-safe variants using `cva` or utility pattern:
     - Intent variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
     - Size variants: `sm` (compact, dense data), `md` (standard touch/desktop), `lg` (hero/emphasis), `icon` (1:1 square ratio).
   - Ensure class merging preserves custom overrides safely (e.g. `clsx` + `tailwind-merge` or native utility).

5. **State Machine & Accessibility Hardening**:
   - Every interactive component must handle the full state lifecycle:
     - `default` → resting state with compliant text contrast (WCAG 2.2 AA ≥ 4.5:1).
     - `hover` → subtle brightness/surface transition (150ms ease-out).
     - `focus-visible` → 2px high-contrast focus ring with 2px offset (`ring-2 ring-ring ring-offset-2 ring-offset-background`).
     - `active` → slight scale/compression (`active:scale-[0.98]` or darker surface).
     - `disabled` → `opacity-50 cursor-not-allowed pointer-events-none` with `aria-disabled="true"`.
     - `loading` → accessible spinner indicator with `aria-busy="true"` and label preserved for screen readers.
     - `invalid` → destructive border, `aria-invalid="true"`, and linked `aria-describedby` error text.

6. **Responsive & Ergonomic Mobile Adaptations**:
   - Minimum 44×44px touch target on mobile viewports for all buttons and interactive controls.
   - Modals transform into bottom-sheets on mobile (`max-w-md` dialog on desktop → sliding drawer on `< 640px`).

## Quality gate

- [ ] All components conform to WCAG 2.2 AA contrast standards (minimum 4.5:1 for normal text, 3:1 for large text and UI controls).
- [ ] Keyboard navigation is fully functional (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys for menus/tabs).
- [ ] Focus rings use `:focus-visible` exclusively — no focus outlines on mouse click, clear indicators on keyboard focus.
- [ ] Components are headless and composable, allowing slot/child injection without DOM hacking.
- [ ] Dark mode is supported cleanly through token inversion without manual hardcoded class overrides.
- [ ] Touch targets meet or exceed 44×44px on mobile screens.
- [ ] Zero unneeded runtime dependencies; prefer native DOM APIs, clean SVG icons, and standard CSS/Tailwind utilities.

## Routing

- Extracting tokens from an existing website → `designscope`.
- Refactoring and polishing an existing UI component → `refactor-ui`.
- Building full application pages or layouts → `design:ui` or `webdev:frontend`.
- Adding rich scroll or interactive animations → `animate`.
