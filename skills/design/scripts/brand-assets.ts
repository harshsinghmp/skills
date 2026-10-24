#!/usr/bin/env bun

/**
 * 🎨 brand-assets.ts — Brand Immersion & Adaptive Asset Scaffolding Engine
 *
 * Implements:
 * 1. Brand Immersion CSS scaffolding (::selection, scrollbars, :focus-visible)
 * 2. Adaptive Dark/Light SVG Favicon & site.webmanifest generation
 * 3. Pre-launch brand aesthetic audit
 *
 * Usage:
 *   bun brand-assets.ts [--scaffold-css] [--scaffold-favicon] [--audit] [--name <brand>] [--color <hex/oklch>] [--json]
 */

process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

export interface ImmersionCssOptions {
  highlightBg?: string;
  highlightText?: string;
  focusRingColor?: string;
  scrollbarColor?: string;
}

export interface FaviconOptions {
  brandName?: string;
  shortName?: string;
  lightFill?: string;
  darkFill?: string;
  themeColor?: string;
  bgColor?: string;
}

export interface BrandAuditResult {
  passed: boolean;
  pass: boolean;
  score: number;
  checks: {
    selectionStyling: boolean;
    customScrollbars: boolean;
    focusVisibleRing: boolean;
    adaptiveFaviconSvg: boolean;
    webAppManifest: boolean;
  };
  details: string[];
}

export function generateImmersionCss(opts?: ImmersionCssOptions): string {
  const bg = opts?.highlightBg || "oklch(0.85 0.15 85)";
  const text = opts?.highlightText || "oklch(0.15 0.05 85)";
  const ring = opts?.focusRingColor || "oklch(0.6 0.2 260)";
  const scrollbar = opts?.scrollbarColor || "oklch(0.7 0.02 240 / 0.5)";

  return `/**
 * 🎨 Brand Immersion Micro-Interactions
 * Invariants: selection contrast (AA+), thin custom scrollbars, :focus-visible offset ring.
 */

::selection {
  background-color: var(--color-brand-highlight, ${bg});
  color: var(--color-brand-foreground, ${text});
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-subtle, ${scrollbar}) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--color-border-subtle, ${scrollbar});
  border-radius: 9999px;
}

:focus-visible {
  outline: 2px solid var(--color-focus-ring, ${ring});
  outline-offset: 2px;
  border-radius: inherit;
}

:focus:not(:focus-visible) {
  outline: none;
}
`;
}

export function generateAdaptiveFaviconSvg(opts?: FaviconOptions): string {
  const lightFill = opts?.lightFill || "#111827";
  const darkFill = opts?.darkFill || "#f9fafb";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    :root { fill: ${lightFill}; }
    @media (prefers-color-scheme: dark) { :root { fill: ${darkFill}; } }
  </style>
  <path d="M16 2L2 9l14 7 14-7-14-7zM2 23l14 7 14-7v-6l-14 7-14-7v6z"/>
</svg>
`;
}

export function generateWebManifest(opts?: FaviconOptions): string {
  const name = opts?.brandName || "Brand Name";
  const shortName = opts?.shortName || name.split(" ")[0] || "Brand";
  const themeColor = opts?.themeColor || "#ffffff";
  const bgColor = opts?.bgColor || "#ffffff";

  return JSON.stringify(
    {
      name,
      short_name: shortName,
      icons: [
        { src: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
        { src: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
      ],
      theme_color: themeColor,
      background_color: bgColor,
      display: "standalone",
    },
    null,
    2,
  );
}

export function scaffoldBrandAssets(
  targetDir: string,
  opts?: {
    css?: ImmersionCssOptions;
    favicon?: FaviconOptions;
  },
): { success: boolean; cssPath: string; faviconPath: string; manifestPath: string; filesCreated: string[] } {
  const publicDir = existsSync(join(targetDir, "public")) ? join(targetDir, "public") : join(targetDir, "public");

  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  let cssDir = join(targetDir, "styles");
  if (existsSync(join(targetDir, "src/styles"))) {
    cssDir = join(targetDir, "src/styles");
  } else if (existsSync(join(targetDir, "styles"))) {
    cssDir = join(targetDir, "styles");
  }

  if (!existsSync(cssDir)) {
    mkdirSync(cssDir, { recursive: true });
  }

  const cssPath = join(cssDir, "brand-immersion.css");
  const faviconPath = join(publicDir, "favicon.svg");
  const manifestPath = join(publicDir, "site.webmanifest");

  writeFileSync(cssPath, generateImmersionCss(opts?.css), "utf8");
  writeFileSync(faviconPath, generateAdaptiveFaviconSvg(opts?.favicon), "utf8");
  writeFileSync(manifestPath, generateWebManifest(opts?.favicon), "utf8");

  return {
    success: true,
    cssPath,
    faviconPath,
    manifestPath,
    filesCreated: [cssPath, faviconPath, manifestPath],
  };
}

export function auditBrandAesthetics(targetDir: string): BrandAuditResult {
  const checks = {
    selectionStyling: false,
    customScrollbars: false,
    focusVisibleRing: false,
    adaptiveFaviconSvg: false,
    webAppManifest: false,
  };
  const details: string[] = [];

  // 1. Audit CSS files
  function scanCss(dir: string) {
    if (!existsSync(dir)) return;
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === ".agents") continue;
        const full = join(dir, entry);
        try {
          const st = statSync(full);
          if (st.isDirectory()) {
            scanCss(full);
          } else if (entry.endsWith(".css") || entry.endsWith(".scss")) {
            const content = readFileSync(full, "utf8");
            if (content.includes("::selection")) checks.selectionStyling = true;
            if (content.includes("scrollbar-width") || content.includes("scrollbar-color"))
              checks.customScrollbars = true;
            if (content.includes(":focus-visible")) checks.focusVisibleRing = true;
          }
        } catch {
          // Skip inaccessible or broken symlinks
        }
      }
    } catch {
      // Skip inaccessible directory
    }
  }

  scanCss(targetDir);

  if (checks.selectionStyling) {
    details.push("✅ ::selection brand styling found");
  } else {
    details.push("⚠️ Missing ::selection brand styling (defaults to OS blue)");
  }

  if (checks.customScrollbars) {
    details.push("✅ Custom thin scrollbars configured");
  } else {
    details.push("⚠️ Missing scrollbar-color/scrollbar-width tokenization");
  }

  if (checks.focusVisibleRing) {
    details.push("✅ :focus-visible keyboard focus ring configured");
  } else {
    details.push("⚠️ Missing :focus-visible offset ring standard");
  }

  // 2. Audit Favicon & Webmanifest
  const publicDir = existsSync(join(targetDir, "public")) ? join(targetDir, "public") : targetDir;

  const faviconPath = join(publicDir, "favicon.svg");
  if (existsSync(faviconPath)) {
    const svg = readFileSync(faviconPath, "utf8");
    if (svg.includes("prefers-color-scheme") || svg.includes("@media")) {
      checks.adaptiveFaviconSvg = true;
      details.push("✅ Adaptive dark/light SVG favicon detected");
    } else {
      details.push("⚠️ favicon.svg exists but lacks prefers-color-scheme media query");
    }
  } else {
    details.push("⚠️ Missing public/favicon.svg");
  }

  const manifestPath = join(publicDir, "site.webmanifest");
  if (existsSync(manifestPath)) {
    checks.webAppManifest = true;
    details.push("✅ site.webmanifest present with brand metadata");
  } else {
    details.push("⚠️ Missing public/site.webmanifest");
  }

  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedCount / 5) * 100);
  const passed = score >= 80;

  return {
    passed,
    pass: passed,
    score,
    checks,
    details,
  };
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "scaffold-css": { type: "boolean", default: false },
      "scaffold-favicon": { type: "boolean", default: false },
      scaffold: { type: "boolean", default: false },
      audit: { type: "boolean", default: false },
      name: { type: "string" },
      "short-name": { type: "string" },
      color: { type: "string" },
      "primary-color": { type: "string" },
      "theme-color": { type: "string" },
      "bg-color": { type: "string" },
      "project-dir": { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const rawDir = values["project-dir"] || positionals[0];
  const targetDir = rawDir ? resolve(process.cwd(), rawDir) : process.cwd();

  const primaryColor = values["primary-color"] || values.color;
  const brandName = values.name;
  const shortName = values["short-name"];
  const themeColor = values["theme-color"];
  const bgColor = values["bg-color"];

  if (values.help) {
    console.log(`
🎨 brand-assets.ts — Brand Immersion & Adaptive Asset Scaffolding Engine

Usage:
  bun brand-assets.ts [targetDir] [options]

Commands:
  --scaffold         Scaffold full brand asset suite (CSS, adaptive favicon, webmanifest)
  --scaffold-css     Scaffold brand-immersion.css (::selection, scrollbars, :focus-visible)
  --scaffold-favicon Scaffold adaptive SVG favicon and site.webmanifest
  --audit            Audit project directory for brand immersion and asset standards

Options:
  --project-dir <path>  Target directory (alternative to positional argument)
  --name <brand>        Brand name for metadata and manifests
  --short-name <short>  Short brand name for manifest
  --color <hex/oklch>   Primary accent color
  --primary-color <val> Primary brand color
  --theme-color <val>   Theme color for browser chrome
  --bg-color <val>      Background color for webmanifest
  --json                Output machine-readable JSON
  -h, --help            Show this help message
`);
    process.exit(0);
  }

  if (values.audit) {
    const res = auditBrandAesthetics(targetDir);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🎨 Brand Aesthetics Audit Score: ${res.score}/100 (${res.passed ? "PASS" : "WARN"})`);
      for (const d of res.details) {
        console.log(`  ${d}`);
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (values.scaffold || (values["scaffold-css"] && values["scaffold-favicon"])) {
    const res = scaffoldBrandAssets(targetDir, {
      favicon: { brandName, shortName, themeColor, bgColor, lightFill: primaryColor },
      css: { highlightBg: primaryColor, focusRingColor: primaryColor },
    });
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🎨 Brand Assets Scaffolding Complete:`);
      console.log(`  CSS:      ${res.cssPath}`);
      console.log(`  Favicon:  ${res.faviconPath}`);
      console.log(`  Manifest: ${res.manifestPath}`);
    }
    process.exit(0);
  }

  if (values["scaffold-css"]) {
    const css = generateImmersionCss({ highlightBg: primaryColor, focusRingColor: primaryColor });
    const outPath = join(targetDir, "brand-immersion.css");
    writeFileSync(outPath, css, "utf8");
    if (values.json) {
      console.log(JSON.stringify({ success: true, path: outPath }, null, 2));
    } else {
      console.log(`\n🎨 Brand Immersion CSS written to ${outPath}`);
    }
    process.exit(0);
  }

  if (values["scaffold-favicon"]) {
    const svg = generateAdaptiveFaviconSvg({ lightFill: primaryColor });
    const manifest = generateWebManifest({ brandName, shortName, themeColor, bgColor });
    const svgPath = join(targetDir, "favicon.svg");
    const manifestPath = join(targetDir, "site.webmanifest");
    writeFileSync(svgPath, svg, "utf8");
    writeFileSync(manifestPath, manifest, "utf8");
    if (values.json) {
      console.log(JSON.stringify({ success: true, svgPath, manifestPath }, null, 2));
    } else {
      console.log(`\n🎨 Adaptive Favicon written to ${svgPath}`);
      console.log(`🎨 Web Manifest written to ${manifestPath}`);
    }
    process.exit(0);
  }

  // Default: run audit
  const res = auditBrandAesthetics(targetDir);
  if (values.json) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(`\n🎨 Brand Aesthetics Audit Score: ${res.score}/100 (${res.passed ? "PASS" : "WARN"})`);
    for (const d of res.details) {
      console.log(`  ${d}`);
    }
  }
  process.exit(res.passed ? 0 : 1);
}
