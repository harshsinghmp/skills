# ♿ webdev:accessibility — WCAG 2.2 AA Auditing, Engineering & Remediation

Comprehensive web engineering playbook for WCAG 2.2 Level AA compliance, accessible component architectures, keyboard focus management, screen reader navigation, semantic tables, and automated testing gates.

---

## 1. Intake

- **Pages/Templates in Scope**: Route list, critical conversion flows (checkout, onboarding, auth), modal/drawer components.
- **Compliance Target**: WCAG 2.2 Level AA (Mandatory legal and contract baseline; Level AAA where requested).
- **Assistive Technology Targets**: Screen readers (VoiceOver, NVDA, JAWS), keyboard-only users, switch devices, zoom/magnification (200%–400%), forced colors / high-contrast modes.
- **Component Inventory**: Interactive widgets, dialogs, forms, data tables, dynamic toast alerts, media players.

---

## 2. Deliverable

1. **A11y Audit Findings Table**: Line-anchored findings with WCAG criterion citations, severity (Critical/High/Medium/Low), and impacted user group.
2. **Prioritized Remediation PRs**: Zero-regression code fixes applied directly to semantic HTML, JSX/TSX, CSS tokens, and focus managers.
3. **Automated Test Guard**: CI-integrated automated tests (`@axe-core/playwright` or `jest-axe`) ensuring zero critical or serious violations.
4. **Verification Evidence**: Keyboard traversal walkthrough, screen reader announcement log, and contrast verification report.

---

## 3. Core Principles & Platform Fundamentals

### Rule #1: Platform & Native Semantics Over ARIA
> *"No ARIA is better than Bad ARIA."* — W3C First Rule of ARIA.

- **Actions vs Navigation**: Use `<button>` for actions that trigger state changes, submit forms, or open dialogs. Use `<a href="...">` for navigation that changes the URL. Never use `<div onClick>` or `<span role="button">` without keyboard handlers, roving tabindex, and accessibility attributes.
- **Real Links**: Native `<a>` with a valid `href` enables browser native features: middle-click, `Cmd`/`Ctrl` + click (new tab), right-click context menu, and screen reader link lists.
- **Landmarks**: Wrap page sections in `<header>`, `<nav>`, `<main id="main-content">`, `<aside>`, and `<footer>`. Exactly one `<main>` per page. Never nest `<main>` inside another landmark.

### Rule #2: Visible Focus Rings & Keyboard Traversal
Style `:focus-visible`, never bare `:focus`. Keyboard users get a crisp ring; mouse users don't get unwanted visual noise.

```css
/* Accessible Focus Ring Pattern */
:focus-visible {
  outline: 2px solid var(--color-focus, #3b82f6);
  outline-offset: 2px;
}

/* NEVER remove outline without an explicit replacement */
:focus {
  outline: none; /* FORBIDDEN unless accompanied by :focus-visible replacement */
}

/* Ensure visibility in Windows High Contrast / Forced Colors Mode */
@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid Highlight;
  }
}
```

- **Contrast of Focus Indicator**: The focus ring itself MUST have at least a 3:1 contrast ratio against both the element and the adjacent background (WCAG 2.4.11 / 2.4.13).
- **Tab Index Hygiene**: Only `tabindex="0"` (makes naturally unfocusable element focusable in natural tab order) or `tabindex="-1"` (programmatic focus via `.focus()`). **NEVER use positive tab indices** (`tabindex="1+"`), as they wreck natural DOM tab flow.

---

## 4. Key Implementation Patterns

### A. Modal Dialogs & Focus Trapping

When a modal opens, focus MUST move inside the dialog. While open, Tab and Shift+Tab MUST cycle strictly within the dialog (focus trap). When closed, focus MUST return to the triggering element.

```typescript
import { useEffect, useRef } from 'react';

export function useDialogFocusTrap(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save the element that triggered the modal
    triggerRef.current = document.activeElement as HTMLElement;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Find all focusable elements
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Initial focus on first element or dialog container
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original trigger
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
}
```

### B. Accessible Forms & Field Validation

Every input must have an accessible name. Form errors must be linked programmatically, not just visually colored red.

```html
<!-- Form Group Pattern -->
<div class="form-field">
  <label for="user-email" class="label">
    Work Email <span class="required" aria-hidden="true">*</span>
  </label>
  <input
    type="email"
    id="user-email"
    name="email"
    required
    autocomplete="email"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="email-error email-hint"
    class="input input-error"
  />
  <p id="email-hint" class="hint">We will never share your email.</p>
  <p id="email-error" class="error-message" role="alert">
    Please enter a valid business email address (e.g., name@company.com).
  </p>
</div>
```

- **Fieldsets for Multi-Input Groups**: Group radio buttons and checkboxes in a `<fieldset>` with a descriptive `<legend>`.
- **Error Summary**: On failed form submission, render an error summary banner at the top of the form with `role="alert"`, focus it, and link each item to its corresponding input via `#field-id`.

### C. Semantic Data Tables

Screen readers navigate data tables cell-by-cell. Without header associations, users hear raw data without context.

```html
<table class="data-table">
  <caption>Q3 2026 SaaS Subscription Metric Growth by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Active MRR</th>
      <th scope="col">Churn Rate</th>
      <th scope="col">Expansion %</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$1,240,500</td>
      <td>1.2%</td>
      <td>+18.4%</td>
    </tr>
    <tr>
      <th scope="row">Europe & UK</th>
      <td>$890,200</td>
      <td>1.8%</td>
      <td>+14.1%</td>
    </tr>
  </tbody>
</table>
```

- Always use `<caption>` for tables to announce purpose.
- Header cells MUST use `<th scope="col">` for column headers and `<th scope="row">` for row headers.
- Never use `<table>` for layout or presentation grids (use CSS Grid or Flexbox).

### D. Live Regions & Dynamic Notifications (Toast/Alerts)

- **`aria-live="polite"`**: For general status messages (e.g. "Draft saved", "Item added to cart"). Screen reader waits until the user finishes reading their current sentence before announcing.
- **`aria-live="assertive"` / `role="alert"`**: For critical time-sensitive errors (e.g. "Session expiring in 60 seconds", "Payment declined"). Interrupts user immediately.
- **`role="status"`**: Equivalent to `aria-live="polite"`.

---

## 5. WCAG 2.2 Level AA Compliance Checklist

### Perceptible
- [ ] **1.1.1 Non-text Content**: All informative images have descriptive `alt`. All decorative images have `alt=""` and `aria-hidden="true"`.
- [ ] **1.3.1 Info and Relationships**: Semantic markup conveys structure (headings `h1`–`h6` without skipping levels, lists `ul`/`ol`, tables `th`/`td`).
- [ ] **1.4.3 Contrast (Minimum)**: Text contrast $\ge 4.5:1$ for normal text, $\ge 3:1$ for large text ($\ge 24\text{px}$ or bold $\ge 18.5\text{px}$).
- [ ] **1.4.11 Non-text Contrast**: UI components (borders, icons, focus rings) contrast $\ge 3:1$ against adjacent colors.
- [ ] **1.4.10 Reflow**: Content reflows without loss of information and without 2D scrolling at 320px width (equivalent to 400% zoom on a 1280px screen).
- [ ] **1.4.12 Text Spacing**: No loss of content or functionality when user sets: line height 1.5x, paragraph spacing 2x, letter spacing 0.12x, word spacing 0.16x.

### Operable
- [ ] **2.1.1 Keyboard**: All functionality operable via keyboard without exception.
- [ ] **2.1.2 No Keyboard Trap**: User can Tab into and Tab out of all components without getting stuck.
- [ ] **2.4.1 Bypass Blocks**: Visible skip link at page top ("Skip to main content") targeting `#main-content`.
- [ ] **2.4.7 Focus Visible**: Any keyboard-operable interface has a visible focus indicator.
- [ ] **2.4.11 Focus Not Obscured (Minimum — WCAG 2.2 New)**: When an item receives focus, it is not completely hidden by sticky headers, footers, or overlays.
- [ ] **2.5.8 Target Size (Minimum — WCAG 2.2 New)**: Pointer targets have an area of at least $24 \times 24\text{px}$, or sufficient spacing to prevent accidental touches (agency standard: $44 \times 44\text{px}$ or $48 \times 48\text{px}$).

### Understandable
- [ ] **3.1.1 Language of Page**: Top-level `<html>` tag has valid language (`<html lang="en">`).
- [ ] **3.2.6 Consistent Help (WCAG 2.2 New)**: Help mechanisms (contact info, chat, FAQ links) appear in consistent relative order across pages.
- [ ] **3.3.1 Error Identification**: Input errors clearly identified and described in text.
- [ ] **3.3.7 Redundant Entry (WCAG 2.2 New)**: Information previously entered in the same session is auto-populated or selectable, avoiding re-typing.
- [ ] **3.3.8 Accessible Authentication (WCAG 2.2 New)**: Cognitive function tests (like memorizing complex passwords or solving puzzles) are not required for login, or an alternative (e.g. password manager paste, magic link, passkey) is provided.

### Robust
- [ ] **4.1.2 Name, Role, Value**: Every interactive component has an accessible name, a standard role, and conveys its current state (`aria-expanded`, `aria-selected`, `aria-checked`).
- [ ] **4.1.3 Status Messages**: Status messages can be programmatically determined via `role="status"` or `aria-live`.

---

## 6. Automated Testing & CI Integration

### Playwright E2E Accessibility Test Gate

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Quality Gate (WCAG 2.2 AA)', () => {
  const routes = ['/', '/pricing', '/auth/login', '/checkout'];

  for (const route of routes) {
    test(`route "${route}" passes axe-core audit with 0 critical/serious violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});
```

---

## 7. Cross-Skill Synergy & Escalation Routing

| Finding / Task | Handling Skill & Mode |
|:---|:---|
| **Design tokens & primitives (focus rings, contrast ratios, Radix/Ark)** | `design:uikit` |
| **User journey walkthroughs, screen reader UX flow, mental models** | `design:ux` |
| **Code remediation (HTML semantics, forms, ARIA, focus trapping)** | `webdev:accessibility` (this mode) |
| **Motion safety (`prefers-reduced-motion`, vestibular protection)** | `animate:audit-deep` |
| **Visual color contrast repairs & tap-target layout refactoring** | `refactor:ui` |
| **Pre-launch deployment CI gate & automated Axe report** | `qa-launch:gate` |
| **Deep assistive technology testing (NVDA, JAWS, VoiceOver testing)** | External specialist tool (`testing-accessibility-auditor`) |
