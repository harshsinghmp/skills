# 🎨 Brand Immersion & Adaptive Asset Standard

> **The Agency Polish Invariant**: A website or application looks amateur when it retains default browser artifacts (generic blue selection boxes, default OS scrollbars, jarring rectangle focus outlines, or missing/static dark-tab favicons). A premium digital product extends brand identity into every micro-interaction.

---

## 1. Brand Selection Styling (`::selection`)

Never allow the default OS blue highlight to break a bespoke brand palette.
- Foreground and background must be specified using semantic tokens.
- Color contrast ratio between selection background and text must meet **WCAG AA (4.5:1 minimum)**.

```css
::selection {
  background-color: var(--color-brand-highlight, oklch(0.85 0.15 85));
  color: var(--color-brand-foreground, oklch(0.15 0.05 85));
}
```

---

## 2. Brand Custom Scrollbars

OS-native chunky gray scrollbars break minimalist and dark-mode web experiences.
- Use standard modern CSS (`scrollbar-width` and `scrollbar-color`).
- Keep scrollbar tracks transparent or subtle to prevent visual noise.

```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-subtle, oklch(0.7 0.02 240 / 0.5)) transparent;
}

/* WebKit Fallback */
*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background-color: var(--color-border-subtle, oklch(0.7 0.02 240 / 0.5));
  border-radius: 9999px;
}
```

---

## 3. Keyboard Focus Ring Aesthetics (`:focus-visible`)

Removing outlines (`outline: none`) destroys accessibility for keyboard users, while default browser focus rings draw misaligned squares around rounded components.
- Standard: An offset focus ring that activates **only** on keyboard navigation (`:focus-visible`).
- Inherit border-radius of the focused element to avoid square-on-pill clipping.

```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring, oklch(0.6 0.2 260));
  outline-offset: 2px;
  border-radius: inherit;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 4. Adaptive Dark/Light SVG Favicon & Web App Manifest

A single static dark favicon becomes invisible when a user switches to a dark browser tab theme, and default host favicons (Vercel, Netlify, Astro) look unmaintained.

### Adaptive SVG Favicon (`public/favicon.svg`):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    :root { fill: #111827; }
    @media (prefers-color-scheme: dark) { :root { fill: #f9fafb; } }
  </style>
  <path d="M16 2L2 9l14 7 14-7-14-7zM2 23l14 7 14-7v-6l-14 7-14-7v6z"/>
</svg>
```

### Web App Manifest (`public/site.webmanifest`):
```json
{
  "name": "Brand Name",
  "short_name": "Brand",
  "icons": [
    { "src": "/favicon.svg", "type": "image/svg+xml", "sizes": "any" },
    { "src": "/apple-touch-icon.png", "type": "image/png", "sizes": "180x180" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

---

## 5. Automated Verification Checklist

- [ ] `::selection` defined with verified WCAG AA contrast.
- [ ] Modern thin scrollbars styled via `scrollbar-width` and `scrollbar-color`.
- [ ] `:focus-visible` offset ring token configured without breaking keyboard navigation.
- [ ] Adaptive dark/light SVG favicon present in `public/favicon.svg`.
- [ ] `site.webmanifest` configured with brand `theme_color` and `background_color`.
