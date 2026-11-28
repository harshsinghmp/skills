#!/usr/bin/env bun
/**
 * asset-auditor.ts: Brand asset fencing, font license isolation, vector SVG sanitizer, and contrast certifier.
 *
 * Usage:
 *   bun asset-auditor.ts --audit-dir <dir> [--client <slug>] [--json]
 *   bun asset-auditor.ts --sanitize-svg <file.svg> [--out <output.svg>]
 *   bun asset-auditor.ts --contrast <fgHex> <bgHex>
 *   bun asset-auditor.ts --check-font <font.woff2|font.ttf>
 */

import fs from "node:fs";
import path from "node:path";

export interface FontAuditReport {
  file: string;
  format: string;
  isWebReady: boolean;
  recommendation: string;
}

export interface SvgAuditReport {
  file: string;
  hasViewBox: boolean;
  sanitized: boolean;
  removedElements: string[];
  hasEmbeddedRaster: boolean;
}

export interface ContrastReport {
  foreground: string;
  background: string;
  ratio: number;
  aaPass: boolean;
  aaaPass: boolean;
  recommendation?: string;
}

export interface BrandAssetReport {
  targetDir: string;
  clientSlug: string;
  totalFiles: number;
  fonts: FontAuditReport[];
  svgs: SvgAuditReport[];
  namingViolations: string[];
  isPassing: boolean;
}

export function auditFontFile(filePath: string): FontAuditReport {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);

  if (ext === ".woff2") {
    return {
      file: base,
      format: "WOFF2",
      isWebReady: true,
      recommendation: "Production-ready web format with optimal Brotli compression.",
    };
  }

  if (ext === ".woff") {
    return {
      file: base,
      format: "WOFF",
      isWebReady: false,
      recommendation: "Legacy web format. Convert to WOFF2 for ~30% smaller file size and faster LCP.",
    };
  }

  if (ext === ".ttf" || ext === ".otf") {
    return {
      file: base,
      format: ext.toUpperCase().replace(".", ""),
      isWebReady: false,
      recommendation:
        "Desktop font format detected. Verify commercial webfont redistribution license and convert to WOFF2.",
    };
  }

  return {
    file: base,
    format: ext.replace(".", "").toUpperCase() || "UNKNOWN",
    isWebReady: false,
    recommendation: "Unsupported typography format. Provide WOFF2 for production web rendering.",
  };
}

export function sanitizeSvg(svgContent: string): {
  sanitized: string;
  violations: string[];
  hasViewBox: boolean;
  hasEmbeddedRaster: boolean;
} {
  const violations: string[] = [];
  let sanitized = svgContent;

  const hasViewBox = /viewBox\s*=\s*["'][^"']+["']/i.test(svgContent);
  if (!hasViewBox) {
    violations.push("Missing viewBox attribute; SVG will not scale responsively in CSS containers.");
  }

  const hasEmbeddedRaster = /<image\b[^>]*\b(?:href|xlink:href)\s*=\s*["']data:image\//i.test(svgContent);
  if (hasEmbeddedRaster) {
    violations.push("Contains embedded base64 raster image. Replace with native vector paths to eliminate bloat.");
  }

  // Active code stripping (Stored XSS mitigation)
  if (/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(sanitized)) {
    violations.push("Removed active <script> tag.");
    sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  }

  if (/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi.test(sanitized)) {
    violations.push("Removed <foreignObject> container.");
    sanitized = sanitized.replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, "");
  }

  const eventHandlerRegex = /\bon[a-z]+\s*=\s*["'][^"']*["']/gi;
  if (eventHandlerRegex.test(sanitized)) {
    violations.push("Stripped inline DOM event handlers (e.g. onload, onclick, onerror).");
    sanitized = sanitized.replace(eventHandlerRegex, "");
  }

  const jsProtocolRegex = /(?:href|xlink:href)\s*=\s*["']javascript:[^"']*["']/gi;
  if (jsProtocolRegex.test(sanitized)) {
    violations.push("Stripped javascript: pseudo-protocol URIs.");
    sanitized = sanitized.replace(jsProtocolRegex, "");
  }

  return {
    sanitized,
    violations,
    hasViewBox,
    hasEmbeddedRaster,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  let r = 0;
  let g = 0;
  let b = 0;
  if (clean.length === 3) {
    r = Number.parseInt(clean[0] + clean[0], 16);
    g = Number.parseInt(clean[1] + clean[1], 16);
    b = Number.parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = Number.parseInt(clean.slice(0, 2), 16);
    g = Number.parseInt(clean.slice(2, 4), 16);
    b = Number.parseInt(clean.slice(4, 6), 16);
  }
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrast(fgHex: string, bgHex: string): ContrastReport {
  const [r1, g1, b1] = hexToRgb(fgHex);
  const [r2, g2, b2] = hexToRgb(bgHex);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const rawRatio = (brightest + 0.05) / (darkest + 0.05);
  const ratio = Math.round(rawRatio * 100) / 100;

  const aaPass = ratio >= 4.5;
  const aaaPass = ratio >= 7.0;

  let recommendation: string | undefined;
  if (!aaPass) {
    recommendation = `Contrast ratio ${ratio}:1 fails WCAG 2.2 AA (min 4.5:1). Shift lightness in OKLCH palette.`;
  }

  return {
    foreground: fgHex,
    background: bgHex,
    ratio,
    aaPass,
    aaaPass,
    recommendation,
  };
}

export function auditBrandAssets(dir: string, clientSlug = "client"): BrandAssetReport {
  const fonts: FontAuditReport[] = [];
  const svgs: SvgAuditReport[] = [];
  const namingViolations: string[] = [];

  let totalFiles = 0;

  if (!fs.existsSync(dir)) {
    return {
      targetDir: dir,
      clientSlug,
      totalFiles: 0,
      fonts: [],
      svgs: [],
      namingViolations: [],
      isPassing: false,
    };
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    totalFiles += 1;
    const fullPath = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();

    // Check naming convention: <client>-<category>-<desc>.<ext>
    if (!entry.name.startsWith(`${clientSlug}-`) && !entry.name.startsWith("brand-")) {
      namingViolations.push(
        `File "${entry.name}" does not follow canonical naming convention: ${clientSlug}-<category>-<descriptor>${ext}`,
      );
    }

    if ([".woff2", ".woff", ".ttf", ".otf"].includes(ext)) {
      fonts.push(auditFontFile(fullPath));
    } else if (ext === ".svg") {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const res = sanitizeSvg(content);
        svgs.push({
          file: entry.name,
          hasViewBox: res.hasViewBox,
          sanitized: res.violations.length > 0,
          removedElements: res.violations,
          hasEmbeddedRaster: res.hasEmbeddedRaster,
        });
      } catch {
        // file read error
      }
    }
  }

  const isPassing =
    namingViolations.length === 0 &&
    fonts.every((f) => f.isWebReady) &&
    svgs.every((s) => s.hasViewBox && !s.hasEmbeddedRaster && s.removedElements.length === 0);

  return {
    targetDir: dir,
    clientSlug,
    totalFiles,
    fonts,
    svgs,
    namingViolations,
    isPassing,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes("--audit-dir")) {
    const idx = args.indexOf("--audit-dir");
    const targetDir = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const clientIdx = args.indexOf("--client");
    const clientSlug = clientIdx !== -1 ? args[clientIdx + 1] : "client";

    const report = auditBrandAssets(targetDir, clientSlug);

    if (args.includes("--json")) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🎨 Brand Asset Audit: ${targetDir} (Client: ${clientSlug})`);
      console.log(`  Verdict: ${report.isPassing ? "✅ PASS" : "⚠️ ISSUES DETECTED"}`);
      console.log(`  Total Files: ${report.totalFiles}`);
      console.log(`  Fonts Analyzed: ${report.fonts.length}`);
      for (const f of report.fonts) {
        console.log(`    - [${f.format}] ${f.file}: ${f.isWebReady ? "✅ Web-ready" : `⚠️ ${f.recommendation}`}`);
      }
      console.log(`  SVGs Analyzed: ${report.svgs.length}`);
      for (const s of report.svgs) {
        console.log(
          `    - ${s.file}: ${s.hasViewBox ? "✅ Valid viewBox" : "❌ Missing viewBox"} | ${s.hasEmbeddedRaster ? "⚠️ Embedded raster" : "✅ Pure vector"}`,
        );
        for (const v of s.removedElements) {
          console.log(`        • ${v}`);
        }
      }
      if (report.namingViolations.length > 0) {
        console.log(`  Naming Fence Violations:`);
        for (const nv of report.namingViolations) {
          console.log(`    - ⚠️ ${nv}`);
        }
      }
    }
  } else if (args.includes("--sanitize-svg")) {
    const idx = args.indexOf("--sanitize-svg");
    const file = args[idx + 1];
    if (!file || !fs.existsSync(file)) {
      console.error("Error: --sanitize-svg requires an existing SVG file.");
      process.exit(1);
    }
    const raw = fs.readFileSync(file, "utf8");
    const res = sanitizeSvg(raw);

    const outIdx = args.indexOf("--out");
    if (outIdx !== -1 && args[outIdx + 1]) {
      fs.writeFileSync(args[outIdx + 1], res.sanitized, "utf8");
      console.log(`✅ Sanitized SVG written to ${args[outIdx + 1]}`);
    } else if (args.includes("--json")) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🧹 SVG Sanitization Report for ${file}:`);
      console.log(`  viewBox: ${res.hasViewBox ? "✅ Present" : "❌ Missing"}`);
      console.log(`  Embedded Raster: ${res.hasEmbeddedRaster ? "⚠️ Detected" : "✅ None"}`);
      console.log(`  Modifications (${res.violations.length}):`);
      for (const v of res.violations) {
        console.log(`    - ${v}`);
      }
    }
  } else if (args.includes("--contrast")) {
    const idx = args.indexOf("--contrast");
    const fg = args[idx + 1];
    const bg = args[idx + 2];
    if (!fg || !bg) {
      console.error("Error: --contrast requires <foreground-hex> <background-hex>");
      process.exit(1);
    }
    const res = calculateContrast(fg, bg);
    if (args.includes("--json")) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n👁️ WCAG Contrast Analysis: ${fg} on ${bg}`);
      console.log(`  Ratio: ${res.ratio}:1`);
      console.log(`  WCAG 2.2 AA (4.5:1): ${res.aaPass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  WCAG 2.2 AAA (7.0:1): ${res.aaaPass ? "✅ PASS" : "❌ FAIL"}`);
      if (res.recommendation) {
        console.log(`  💡 ${res.recommendation}`);
      }
    }
  } else if (args.includes("--check-font")) {
    const idx = args.indexOf("--check-font");
    const font = args[idx + 1];
    if (!font) {
      console.error("Error: --check-font requires a font file path.");
      process.exit(1);
    }
    const res = auditFontFile(font);
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(
      "Usage: bun asset-auditor.ts [--audit-dir <dir> [--client <slug>]] | [--sanitize-svg <file> [--out <dest>]] | [--contrast <fg> <bg>] | [--check-font <file>]",
    );
  }
}
