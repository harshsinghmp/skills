# assets — Brand Asset Fencing, Font License Isolation, and Vector Quality Auditor

Brand asset governance, font license isolation, vector SVG sanitization, and color contrast certification. Audits and packages incoming client brand assets into hermetic `.agents/brand/` containers, guaranteeing responsive rendering, zero stored XSS vulnerabilities, and WCAG AA/AAA compliance.

---

## Asset Intake & Triggers

- **Brand Assets Directory**: Ingested ZIP archives, Figma vector exports, raw logo folders, client typography kits, and token palettes.
- **Client Identity**: Client slug (e.g., `acme-corp`) for asset namespace fencing.
- **Verification Objectives**: Font license safety, SVG vector sanitization, responsive `viewBox` conformance, and OKLCH color contrast ratios.

---

## Deliverables

1. **Fenced Brand Asset Directory (`.agents/brand/<client-slug>/`)**:
   - Canonical file naming: `<client>-<category>-<descriptor>.<ext>`.
   - Clean separation of vector logos, photography, typography, and design tokens.
2. **Font Audit & `@font-face` Bundle**:
   - Modern `.woff2` font packaging with `font-display: swap`.
   - Desktop font conversion warnings and licensing hygiene report.
3. **Sanitized Vector Suite**:
   - Cleaned SVG assets stripped of inline scripts, event handlers, and bloated base64 raster embeds.
   - Guaranteed responsive `viewBox` attributes for CSS Grid and Flexbox layouts.
4. **Certified Color Palette & OKLCH Tokens (`tokens.json`)**:
   - WCAG 2.2 AA (4.5:1) and AAA (7:1) contrast scores for all text/background token pairings.
   - Perceptually uniform OKLCH values for dark/light mode balance.

---

## 🔒 The 4 Brand Asset Invariants

### 1. Brand Asset Isolation & Fencing (BAS-001)
- All client assets must reside strictly within `./.agents/brand/<client-slug>/` or `./.agents/brand/`.
- Cross-client directory references or symlinks to outside paths are strictly prohibited.
- Assets must follow the canonical naming convention:
  ```
  acme-logo-primary.svg
  acme-logo-mark.svg
  acme-font-heading.woff2
  acme-font-body.woff2
  acme-tokens.json
  ```

### 2. Modern Webfont & License Packaging Gate (BAS-002)
- **Format Standard**: `.woff2` (Brotli compression) is mandatory for production web serving.
- **Desktop Formats**: Raw `.ttf` and `.otf` files trigger conversion alerts.
- **License Hygiene**: Desktop print/installable licenses often forbid public web redistribution; fonts with OS/2 `fsType` embedding restrictions must be flagged before deployment.
- **Font Display**: Generates CSS `@font-face` blocks with `font-display: swap` to prevent Flash of Invisible Text (FOIT).

### 3. Vector SVG Sanitization & ViewBox Integrity (BAS-003)
- **Responsive ViewBox**: Every SVG mark must declare a valid `viewBox="0 0 W H"` attribute; fixed `width`/`height` without `viewBox` breaks responsive scaling in modern CSS containers.
- **Active Code Sanitization**: Strips dangerous executable nodes (`<script>`, `<foreignObject>`), event handlers (`onload`, `onclick`, `onerror`), and `javascript:` pseudo-protocols to prevent stored XSS.
- **Raster Bloat Guard**: Flags embedded raster images (`<image href="data:image/png;base64,...">`) disguised as vector art.

### 4. Color Palette & OKLCH Contrast Certification (BAS-004)
- Normalizes hex/RGB brand colors into perceptually uniform OKLCH space (`oklch(L C H)`).
- Validates text-to-background contrast ratios against WCAG 2.2 standards:
  - **Level AA**: Minimum `4.5:1` for regular text, `3:1` for large text (>= 18pt or bold >= 14pt).
  - **Level AAA**: Minimum `7:1` for regular text, `4.5:1` for large text.
- Recommends automated lightness adjustments (`L` channel shift) when brand colors fail accessibility gates.

---

## 💻 CLI Integration

```bash
# Audit an entire incoming brand assets directory
bun skills/agency-delivery/brand/scripts/asset-auditor.ts --audit-dir ./raw-assets --client acme-corp --json

# Sanitize an SVG file
bun skills/agency-delivery/brand/scripts/asset-auditor.ts --sanitize-svg logo.svg --out clean-logo.svg

# Calculate WCAG contrast between two hex colors
bun skills/agency-delivery/brand/scripts/asset-auditor.ts --contrast "#1E293B" "#F8FAFC"
```
