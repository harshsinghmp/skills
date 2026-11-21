# performance — Front-end performance checklist: clear every category under budget, extremes-first.

Launch-QA pass over the six payload categories (HTML, CSS, Fonts, Images, JavaScript, Server). It grades a release candidate against the community Front-End Performance Checklist and ends in a severity-ranked findings list the `gate` mode can turn into a Block-or-Ship verdict. It measures and reports — it never optimizes; fixes route to `webdev` (performance mode).

Source checklist: `thedaviddias/Front-End-Performance-Checklist` (MIT). Items are preserved faithfully; priority tags map to gate severity below.

## Intake

- Release candidate URL + the templates/pages in scope
- Field-data access (CrUX / RUM) or lab-only (Lighthouse, throttled)
- Existing performance budget (else use the headline budgets in this file)
- Pipeline constraints: CMS, image CDN, font host, third-party scripts

## Deliverable

Performance checklist report: the six categories each scored **pass / block**, every open item tagged by severity, the headline budgets measured on the extremes-first device, and the tool reading behind each finding.

## Severity legend (priority → gate treatment)

The source checklist tags each rule `high` / `medium` / `low`. This mode maps them to the gate:

- **[H] Block-class** — must clear before a Ship verdict.
- **[M] Ship-with-ticket** — dated owner + tracking ticket, never silently dropped.
- **[L] Note** — record and move on unless it stacks with other weight.

## Procedure

1. **Measure first.** Run Lighthouse + WebPageTest (or GTmetrix / PageSpeed Insights / DebugBear) on the extremes-first device (slowest supported CPU, throttled network). Where field data exists (CrUX/RUM), it outranks lab. Record LCP, INP, CLS, total page weight, and TTFB before touching anything.
2. **Walk the categories heavy-first** (Server → JavaScript → Images → Fonts → CSS → HTML is the usual impact order). For each item below, mark pass or open; tag every open item `[H]`/`[M]`/`[L]`.
3. **Score to the gate.** Any `[H]` open item, or any headline budget breached on the extremes-first device, = Block for `gate`. `[M]` ships only with a dated owner + ticket.
4. **Re-measure after each fix**; never stack unverifiable changes. Route every fix to `webdev` (performance mode) — this mode changes no product code.

## The checklist

### HTML
- [ ] **[M]** Production HTML minified (comments/whitespace/newlines removed).
- [ ] **[H]** CSS tags load before any JavaScript `<script>` in `<head>` (parallel download, faster render).
- [ ] **[H]** Iframes minimized — used only when there is no technical alternative.
- [ ] **[L]** Resource hints present where they help: `prefetch` / `dns-prefetch` / `prerender` for likely next navigations.

### CSS
- [ ] **[H]** All CSS minified in production.
- [ ] **[H]** Render-blocking CSS eliminated — preload critical stylesheets (`rel="preload" as="style"` + `onload` swap, with `<noscript>` fallback).
- [ ] **[H]** Critical (above-the-fold) CSS inlined, minified, between `<style>` before the main stylesheet call.
- [ ] **[H]** No embedded/inline CSS in the HTML body (separate content from design; smaller HTML).
- [ ] **[M]** Unused CSS removed (PurgeCSS / Chrome DevTools coverage); framework resets not double-shipped.
- [ ] **[M]** Stylesheet complexity analysed (CSS Stats / `analyze-css`); redundancies and duplicate selectors flagged.
- [ ] **[M]** Concatenation only where it still helps — **modern framing:** under HTTP/2+ single-file concatenation is often *slower*; test, don't assume.

### Fonts
- [ ] **[M]** WOFF2 served (WOFF 1.0 / TTF as fallback); ~30% smaller than WOFF 1.0.
- [ ] **[M]** `preconnect` to the font host before the `@font-face` load.
- [ ] **[M]** Webfont payload ≤ 300 KB across all shipped variants (subset to the glyphs used).
- [ ] **[M]** `font-display: swap` (or `optional`) set — no invisible text (FOIT) while fonts load.

### Images
- [ ] **[H]** Images compressed/optimized with no visible quality loss (TinyJPG, Compressor.io, Cloudinary, SVGOMG).
- [ ] **[H]** Format chosen deliberately; next-gen formats (WebP / AVIF) served where supported, detected via Lighthouse.
- [ ] **[M]** Vector (SVG) preferred over raster for logos, icons, and simple graphics.
- [ ] **[M]** `width`/`height` (or `aspect-ratio`) set on `<img>` to prevent layout shift (CLS).
- [ ] **[M]** Offscreen images lazy-loaded (`loading="lazy"`) with a `<noscript>` fallback.
- [ ] **[M]** Responsive images via `srcset` / `<picture>` so devices get near-display-size assets.
- [ ] **[M]** Base64-embedded images avoided (keep them as real requests unless truly tiny).

### JavaScript
- [ ] **[H]** All JavaScript minified in production.
- [ ] **[H]** Scripts non-blocking — `async` or `defer` on every external script; order-sensitive ones use `defer`.
- [ ] **[M]** No large inline JS scattered through the body (regroup into external files).
- [ ] **[M]** Libraries necessary, current, and lean — prefer vanilla where trivial; unused methods dropped.
- [ ] **[M]** JS profiling done (Chrome DevTools timeline/heap) so hot paths are measured, not guessed.
- [ ] **[M]** Service workers cache heavy/repeat assets in PWAs without blocking first paint.
- [ ] **[L]** Dependency weight budgeted (`size-limit`, bundle analyzer); pick the lightest adequate library.

### Server
- [ ] **[H]** HTTPS enforced site-wide (required for geolocation, notifications, service workers).
- [ ] **[H]** Minimizing HTTP requests — every requested file is essential.
- [ ] **[H]** Mixed-content avoided — no HTTP assets served from an HTTPS page.
- [ ] **[H]** No unreachable files (404s) requested by the page.
- [ ] **[H]** HTTP cache headers set (long-lived + immutable for hashed assets).
- [ ] **[H]** GZIP and/or Brotli compression enabled on text assets.
- [ ] **[H]** Same-protocol serving (no cross-protocol round trips).
- [ ] **[M]** CDN fronting static assets for global delivery.
- [ ] **[M]** Cookies small (≤ 4096 B each, few per domain) and not sent on every static request.

## Headline budgets (block if breached on the extremes-first device)

| Budget | Target | Ideal |
|:---|:---|:---|
| Total page weight | < 1500 KB | < 500 KB |
| Page load (throttled mobile) | < 3 s | lower |
| Time To First Byte | < 1.3 s | lower |

Anchor these against Core Web Vitals where field data exists (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) — the modern successor to the checklist's load-time numbers. Source budgets: `thedaviddias/Front-End-Performance-Checklist`.

## Tooling

Lighthouse, WebPageTest, GTmetrix, PageSpeed Insights, Web.dev Measure, DebugBear, SpeedCurve, Dareboost, Yellow Lab Tools, `sitespeed.io`, Calibre, Chrome DevTools (Lighthouse + coverage + performance timeline). Field truth: CrUX / RUM.

## Modern-framing notes (2026 lens over a 2018 checklist)

Preserve every item above; read these as the current interpretation where the source predates a standard:

- **Concatenation** is HTTP/2-era-optional — ship many small hashed files behind HTTP/2/3, not one giant bundle, unless a test says otherwise.
- **Next-gen image formats** are now WebP/AVIF with `<picture>` fallback, not JPEG 2000/XR.
- **Load-time targets** are better expressed as Core Web Vitals (above) once field data is available; the KB/load/TTFB numbers stay as lab fallbacks.
- **Minification/concatenation** are almost always handled by the bundler (Vite, webpack, esbuild) — verify the *output*, don't hand-minify.

## Quality gate

- [ ] All six categories scored pass/block, every open item severity-tagged.
- [ ] Headline budgets measured on the extremes-first device, not a fast desktop.
- [ ] Field data consulted before lab where the platform exposes it.
- [ ] No `[H]` item open without a Block; `[M]` items carry a dated owner + ticket.
- [ ] Every fix routed to `webdev` (performance); no product code changed here.

## Routing

- Optimization / fixes → `webdev` (performance mode); visual shift from a perf change → `refactor-ui`.
- Feeds the `gate` verdict (budget breach or any `[H]` = Block) and the `audit` perf-budget line.
- Re-verify after fixes via `regression` on the same extremes-first device.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.

- Front-End Performance Checklist — `thedaviddias/Front-End-Performance-Checklist` (MIT). Categories, items, and priority tags preserved; severity mapping and modern-framing notes are this skill's layer.
- Performance tools and budget references listed above (Lighthouse, WebPageTest, CrUX, Addy Osmani's Essential Image Optimization, High Performance Browser Networking).
