# hydration-polish — Anti-FOUC, Zero-CLS Typography, Print Styles & Anchor Offsets

This reference codifies four critical front-end polish standards that distinguish production-grade web applications from unfinished prototypes:

1. **Anti-FOUC Blocking Head Script**: Eliminates theme flickering on initial paint.
2. **Zero-CLS Font Metric Fallback Overrides**: Eliminates Cumulative Layout Shift when web fonts swap in.
3. **Clean Print-to-PDF Media Stylesheet**: Provides clean, professional document printing for invoices, case studies, and reports.
4. **Sticky Navbar Anchor Scroll Offset**: Prevents anchor links (`#hash`) from scrolling underneath fixed navigation headers.

---

## 1. Anti-FOUC (Flash of Unstyled Content) Theme Hydrator

### The Defect
When dark mode or theme preference is resolved via client-side React/Vue/Svelte hydration or asynchronous scripts, the browser renders the initial DOM using the default light background, resulting in a blinding white flash before switching to dark mode milliseconds later.

### The Invariant
Theme resolution **MUST** occur synchronously inside `<head>` via an inline blocking script before the browser renders the first byte of `<body>`.

### Implementation Standard

```html
<!-- Place as the first child of <head> before any CSS stylesheets or deferred scripts -->
<script>
  (function() {
    try {
      var key = 'theme';
      var stored = localStorage.getItem(key);
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
</script>
```

### Framework Integrations
- **Next.js App Router (`app/layout.tsx`)**: Place inline script in `<head>` with `dangerouslySetInnerHTML` and `suppressHydrationWarning` on `<html>`.
- **Astro (`src/layouts/Layout.astro`)**: Add `<script is:inline>...</script>` directly in `<head>`.
- **Vite / Plain HTML (`index.html`)**: Add `<script>...</script>` at the top of `<head>`.

---

## 2. Zero-CLS Font Metric & Fallback Overrides

### The Defect
When custom web fonts (Inter, Poppins, Geist, Roboto) load asynchronously, the browser displays a system fallback font (Arial, Times New Roman). Because system fonts have different x-heights, ascenders, descenders, and bounding boxes, swapping the web font in causes Cumulative Layout Shift (CLS), knocking headings and body copy into new positions.

### The Invariant
Every custom `@font-face` definition **MUST** declare a companion fallback font with `@font-face` metric overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) to match the bounding box of the web font.

### Standard Metric Overrides

```css
/* Custom Web Font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

/* Zero-CLS Fallback Overriding Local Arial */
@font-face {
  font-family: 'Inter-Fallback';
  src: local('Arial');
  ascent-override: 89.6%;
  descent-override: 22.4%;
  line-gap-override: 0%;
  size-adjust: 107.5%;
}

/* Component Typography Binding */
body {
  font-family: 'Inter', 'Inter-Fallback', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Metric Override Cheat-Sheet

| Custom Font | Fallback Base | `size-adjust` | `ascent-override` | `descent-override` | `line-gap-override` |
|:---|:---|:---|:---|:---|:---|
| **Inter** | `Arial` | `107.5%` | `89.6%` | `22.4%` | `0%` |
| **Geist** | `Arial` | `102.0%` | `94.0%` | `26.0%` | `0%` |
| **Roboto** | `Arial` | `100.0%` | `92.8%` | `24.4%` | `0%` |
| **Poppins** | `Arial` | `98.5%` | `105.0%` | `35.0%` | `9.8%` |
| **Playfair Display** | `Times New Roman` | `108.0%` | `107.0%` | `28.0%` | `0%` |

---

## 3. Clean Print-to-PDF Media Stylesheet (`@media print`)

### The Defect
Saving or printing web pages as PDFs (invoices, client proposals, documentation, case studies) outputs sticky headers, mobile navbars, dark ink-heavy backgrounds, cut-off tables, and broken page splits.

### The Invariant
Every client-facing application **MUST** include a dedicated `@media print` stylesheet that strips interactive chrome, resets background colors to white, and enforces clean page breaks.

### Production Print Stylesheet

```css
@media print {
  *, *::before, *::after {
    background: transparent !important;
    color: #000000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  @page {
    margin: 1.5cm;
    size: auto;
  }

  /* 1. Eliminate Interactive Chrome */
  header, nav, footer, aside,
  [role="navigation"], [role="banner"],
  .cookie-banner, .toast, .modal, .chat-widget,
  .no-print, [aria-hidden="true"] {
    display: none !important;
  }

  /* 2. Page Break Hygiene */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }

  p, blockquote, pre, table, figure, img, .card, tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 3. Expand External URLs */
  a[href^="http"]:not([href*="javascript:"])::after {
    content: " (" attr(href) ")";
    font-size: 80%;
    color: #4b5563 !important;
    word-break: break-all;
  }

  /* 4. Table Formatting */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  th, td {
    border: 1px solid #d1d5db !important;
    padding: 6px 10px !important;
  }
}
```

---

## 4. Sticky Navbar Anchor Scroll Offset (`scroll-padding-top`)

### The Defect
When users click an anchor link (e.g. `<a href="#pricing">Pricing</a>`), the browser scrolls the element to the exact top edge of the viewport (`y = 0`). If the site has a fixed or sticky navigation header (typically 60px–80px high), the header completely obscures the section title and first lines of content.

### The Invariant
Declare `scroll-padding-top` on the root `<html>` element matching the height of the fixed/sticky navigation header plus breathing room.

### Production Offset Rule

```css
:root {
  --header-height: 4.5rem; /* Match site navigation height */
}

html {
  scroll-padding-top: calc(var(--header-height, 4.5rem) + 1rem);
  scroll-behavior: smooth;
}

/* Accessibility: Honor reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

---

## CLI Scaffolding & Audit Commands

The `webdev` CLI includes automated generators and auditors for the hydration polish suite:

```bash
# Generate anti-FOUC blocking script tag
bun skills/agency-delivery/webdev/scripts/webdev.ts --anti-fouc-scaffold

# Generate zero-CLS font metric override for custom font
bun skills/agency-delivery/webdev/scripts/webdev.ts --font-metric-override Inter Arial

# Generate clean print stylesheet
bun skills/agency-delivery/webdev/scripts/webdev.ts --print-css-scaffold

# Generate sticky anchor offset rule
bun skills/agency-delivery/webdev/scripts/webdev.ts --anchor-offset-scaffold 5rem

# Audit target project directory for hydration and polish standards (0-100 score)
bun skills/agency-delivery/webdev/scripts/webdev.ts --polish-audit ./my-app
```
