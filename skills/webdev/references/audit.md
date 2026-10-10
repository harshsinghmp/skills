# audit — Web Engineering: responsive design audits (responsiveness-check), mobile viewports, touch targets, and code health.

Consolidates responsiveness-check and full-stack web engineering audit capabilities into the webdev department.

## Intake

- URL or running dev server instance (`http://localhost:3000`, `http://localhost:5173`)
- Viewport matrix to evaluate (Mobile, Tablet, Laptop, Desktop, Foldables)
- Target layout frameworks (Tailwind, CSS Modules, Styled Components, UnoCSS)
- Primary user journeys and critical touch interfaces (navbars, modals, checkout forms, tables)
- Default stack: Playwright / Chromium headless for viewport matrix testing, Chrome DevTools Device Mode.

## Deliverable

A comprehensive responsiveness and web engineering audit report:
1. **Viewport Breakdown Matrix**: Visual rendering status across 375px (iPhone SE/13 mini), 390px (iPhone 14/15), 768px (iPad Mini), 820px (iPad Air), 1280px (MacBook), and 1920px (Desktop).
2. **Horizontal Overflow & Layout Blowout Scan**: Specific DOM elements exceeding viewport width causing unwanted horizontal scrolling.
3. **Touch Target & Ergonomics Analysis**: Tap target dimensions for interactive elements (<48x48px flagged).
4. **Dynamic Viewport & Safe-Area Verification**: `dvh`/`svh` compliance and iOS `safe-area-inset` handling.
5. **Remediation Code Patches**: CSS/Tailwind patches providing fluid `clamp()`, container queries, or responsive grid fixes.

## Procedure

### 1. Viewport Matrix & Automated Overflow Scan
Run an automated DOM check in the browser console or Playwright script to find any element causing horizontal scroll:
```javascript
// Scan for elements wider than the viewport window
const docWidth = document.documentElement.offsetWidth;
const overflowing = [];
document.querySelectorAll('*').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.right > docWidth || rect.left < 0) {
    overflowing.push({ element: el, tag: el.tagName, class: el.className, right: rect.right, width: rect.width });
  }
});
console.table(overflowing);
```
- **Remedies for Horizontal Overflow**:
  - Replace fixed pixel widths (`width: 600px`) with fluid limits (`max-width: 100%` or `w-full max-w-xl`).
  - Add `min-w-0` to flex child containers (flex children default to `min-width: auto`, which prevents text truncation and blows out parent widths).
  - Ensure code blocks and tables have explicit scroll wrappers: `<div class="overflow-x-auto"><table>...</table></div>`.

### 2. Mobile Touch Targets & Ergonomic Safety
- **Minimum Tap Size**: All interactive buttons, links, inputs, and toggles must measure at least `44x44px` (iOS HIG) or `48x48px` (Android Material / WCAG 2.5.5).
- **Hit Slop Spacing**: If visual design requires smaller icons (e.g. 20px icon button), expand hit slop via negative margins or invisible padding (`p-3 -m-3` or `::before` pseudo-element expanding to 48px).
- **Finger Travel & Bottom Navigation**: Critical actions should sit within the natural thumb zone on mobile screens.

### 3. Dynamic Viewport Units (`dvh` / `svh`) & Safe Areas
- **Mobile Address Bar Layout Jumps**: Never use `height: 100vh` for full-screen hero or drawer elements on mobile (causes jumpy resizing when the mobile address bar scrolls away). Use `height: 100dvh` (or `min-h-dvh` in Tailwind).
- **Safe Area Inset Padding**: Respect notches, Dynamic Island, and home indicators:
  ```css
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  ```

### 4. Fluid Typography & Container Queries
- **Fluid Type Scaling**: Avoid abrupt breakpoint jumps (`text-base md:text-xl lg:text-3xl`). Use mathematical `clamp()`:
  ```css
  font-size: clamp(1.125rem, 1rem + 0.8vw, 1.75rem);
  ```
- **Container Queries (`@container`)**: Use container queries for modular cards that appear in both narrow sidebars and wide main feeds, decoupling component responsiveness from global window width.

### 5. Responsive Images & Media
- Use modern `<picture>` elements with `srcset` and `sizes` attributes:
  ```html
  <picture>
    <source media="(max-width: 640px)" srcset="/img/hero-mobile.webp">
    <source media="(min-width: 641px)" srcset="/img/hero-desktop.webp">
    <img src="/img/hero-desktop.webp" alt="Hero banner" class="w-full h-auto object-cover" loading="eager">
  </picture>
  ```

## Quality gate

- [ ] Zero horizontal overflow (`overflow-x`) detected across 375px, 768px, and 1280px viewports.
- [ ] Touch targets for interactive controls meet 48x48px minimum hit area.
- [ ] Mobile viewport heights use `dvh` instead of static `100vh`.
- [ ] iOS safe area insets handled for fixed navigation bars and floating buttons.
- [ ] Flex child containers contain `min-w-0` to avoid text blowout.
- [ ] Tables and data grids wrapped in horizontal scroll containers on mobile.
- [ ] Vertical component alignment verified: no developer components (terminal boxes, code grids) present on non-technical client sites.

## Sources

- W3C Mobile Accessibility Guidelines & WCAG 2.5.5 Target Size.
- Apple Human Interface Guidelines (Touch Targets & Safe Areas).
- MDN Responsive Design & CSS Container Queries Specification.
