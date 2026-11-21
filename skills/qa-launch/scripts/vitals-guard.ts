#!/usr/bin/env bun
/**
 * vitals-guard.ts: Nexus Core Web Vitals Auditor & Production Gate.
 *
 * Implements VIT-001 through VIT-004:
 *   - VIT-001: Sub-200ms INP Gate & Main-Thread Long Task Elimination
 *   - VIT-002: Zero-CLS Layout Shift & Aspect-Ratio Fences
 *   - VIT-003: Sub-2.5s LCP Boundary & Critical Resource Prioritization
 *   - VIT-004: Web Font FOUC/FOIT Elimination & RUM Budget Certification
 *
 * Usage:
 *   bun vitals-guard.ts --audit-vitals <dir|file> [--json]
 *   bun vitals-guard.ts --check-cls <dir|file> [--json]
 *   bun vitals-guard.ts --check-inp <dir|file> [--json]
 *   bun vitals-guard.ts --check-lcp <dir|file> [--json]
 *   bun vitals-guard.ts --check-fonts <dir|file> [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface VitalsDefect {
  file: string;
  line: number;
  category: "INP" | "CLS" | "LCP" | "FONTS";
  severity: "BLOCKING" | "WARNING" | "INFO";
  rule: string;
  issue: string;
  codeSnippet: string;
  remedy: string;
}

export interface VitalsCategoryScore {
  score: number; // 0 - 100
  passed: boolean;
  defectsCount: number;
}

export interface VitalsReport {
  target: string;
  filesScanned: number;
  overallScore: number; // 0 - 100
  verdict: "PASS" | "BLOCK";
  categories: {
    inp: VitalsCategoryScore;
    cls: VitalsCategoryScore;
    lcp: VitalsCategoryScore;
    fonts: VitalsCategoryScore;
  };
  totalDefects: number;
  blockingCount: number;
  warningCount: number;
  defects: VitalsDefect[];
}

function collectFiles(targetPath: string, extensions: string[]): string[] {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    return extensions.includes(ext) ? [targetPath] : [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") {
      continue;
    }
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

export function checkClsDefects(targetPath: string): VitalsDefect[] {
  const files = collectFiles(targetPath, [".html", ".jsx", ".tsx", ".vue", ".svelte", ".astro"]);
  const defects: VitalsDefect[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      // 1. img missing width/height and aspect-ratio
      const imgMatch = /<img\b([^>]*?)>/i.exec(lineText);
      if (imgMatch) {
        const attrs = imgMatch[1];
        const hasWidth = /\bwidth\s*=/i.test(attrs) || /w-\[?\d+/i.test(attrs);
        const hasHeight = /\bheight\s*=/i.test(attrs) || /h-\[?\d+/i.test(attrs);
        const hasAspect = /aspect-(?:ratio|video|square|\[|\d)/i.test(attrs);

        if (!((hasWidth && hasHeight) || hasAspect)) {
          defects.push({
            file,
            line: idx + 1,
            category: "CLS",
            severity: "BLOCKING",
            rule: "VIT-002: Image Missing Dimension Fences",
            issue:
              "Image tag lacks explicit width/height attributes or CSS aspect-ratio fence, triggering layout shift upon asset load.",
            codeSnippet: lineText.trim(),
            remedy:
              'Add explicit width and height attributes (e.g. width="800" height="600") or CSS aspect-ratio class.',
          });
        }
      }

      // 2. iframe / video missing explicit dimensions
      const mediaMatch = /<(?:iframe|video)\b([^>]*?)>/i.exec(lineText);
      if (mediaMatch) {
        const attrs = mediaMatch[1];
        const hasWidth = /\bwidth\s*=/i.test(attrs);
        const hasHeight = /\bheight\s*=/i.test(attrs);
        const hasAspect = /aspect-/i.test(attrs);

        if (!((hasWidth && hasHeight) || hasAspect)) {
          defects.push({
            file,
            line: idx + 1,
            category: "CLS",
            severity: "BLOCKING",
            rule: "VIT-002: Embedded Media Missing Dimensions",
            issue: "Embedded video or iframe lacks explicit dimensional bounds, destabilizing cumulative layout.",
            codeSnippet: lineText.trim(),
            remedy:
              "Wrap embedded player in an aspect-ratio container (e.g., aspect-video) or assign width/height attributes.",
          });
        }
      }
    });
  }

  return defects;
}

export function checkInpDefects(targetPath: string): VitalsDefect[] {
  const files = collectFiles(targetPath, [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte", ".astro"]);
  const defects: VitalsDefect[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      // 1. Unthrottled high frequency scroll or resize listener without passive flag
      if (/(?:window|document)\.addEventListener\s*\(\s*['"](scroll|resize|mousemove|touchmove)['"]/i.test(lineText)) {
        if (!/passive\s*:\s*true/i.test(lineText)) {
          defects.push({
            file,
            line: idx + 1,
            category: "INP",
            severity: "BLOCKING",
            rule: "VIT-001: High-Frequency Event Missing Passive Flag",
            issue:
              "High-frequency scroll/resize/touch listener registered without { passive: true }, threatening sub-200ms INP response.",
            codeSnippet: lineText.trim(),
            remedy:
              "Pass { passive: true } to addEventListener and throttle handler execution with requestAnimationFrame.",
          });
        }
      }

      // 2. Synchronous heavy parsing or blocking alert/confirm
      if (/\b(?:window\.)?(?:alert|prompt|confirm)\s*\(/i.test(lineText)) {
        defects.push({
          file,
          line: idx + 1,
          category: "INP",
          severity: "BLOCKING",
          rule: "VIT-001: Synchronous UI Thread Blocking Call",
          issue: "Synchronous modal dialog completely halts the main thread and causes severe INP degradation.",
          codeSnippet: lineText.trim(),
          remedy: "Replace synchronous alert/prompt with non-blocking accessible toast or dialog component.",
        });
      }
    });
  }

  return defects;
}

export function checkLcpDefects(targetPath: string): VitalsDefect[] {
  const files = collectFiles(targetPath, [".html", ".jsx", ".tsx", ".vue", ".svelte", ".astro", ".css"]);
  const defects: VitalsDefect[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      // 1. Hero image with loading="lazy" (LCP anti-pattern)
      if (
        /(?:hero|banner|lcp|lead)[^>]*<img\b[^>]*\bloading\s*=\s*['"]lazy['"]/i.test(lineText) ||
        /<img\b[^>]*\bloading\s*=\s*['"]lazy['"][^>]*(?:hero|banner|lcp|lead)/i.test(lineText) ||
        /<img\b[^>]*\b(?:hero|banner|featured)[^>]*\bloading\s*=\s*['"]lazy['"]/i.test(lineText)
      ) {
        defects.push({
          file,
          line: idx + 1,
          category: "LCP",
          severity: "BLOCKING",
          rule: "VIT-003: Hero LCP Image Lazy-Loaded",
          issue:
            'Critical hero/banner image is configured with loading="lazy", introducing significant delay to Largest Contentful Paint.',
          codeSnippet: lineText.trim(),
          remedy:
            'Remove loading="lazy" and add fetchpriority="high" with loading="eager" for above-the-fold hero assets.',
        });
      }

      // 2. CSS @import inside stylesheet
      if (/\.css$/i.test(file) && /^\s*@import\b/i.test(lineText)) {
        defects.push({
          file,
          line: idx + 1,
          category: "LCP",
          severity: "WARNING",
          rule: "VIT-003: Render-Blocking CSS @import Cascade",
          issue: "CSS @import introduces serialized network waterfalls that delay critical path CSS and inflate LCP.",
          codeSnippet: lineText.trim(),
          remedy: "Bundle stylesheets at build time or link critical stylesheets in parallel in <head>.",
        });
      }

      // 3. Render-blocking script tag without defer/async in HTML
      if (
        /\.html$/i.test(file) &&
        /<script\b(?![^>]*(?:defer|async|type\s*=\s*['"]module['"]))[^>]*src\s*=/i.test(lineText)
      ) {
        defects.push({
          file,
          line: idx + 1,
          category: "LCP",
          severity: "BLOCKING",
          rule: "VIT-003: Render-Blocking Script in Document",
          issue: "External script tag blocks HTML parsing and First Contentful Paint without defer or async attribute.",
          codeSnippet: lineText.trim(),
          remedy: "Add 'defer' or 'async' attribute or use type=\"module\" on external script tags.",
        });
      }
    });
  }

  return defects;
}

export function checkFontDefects(targetPath: string): VitalsDefect[] {
  const files = collectFiles(targetPath, [".css", ".scss", ".less", ".html", ".astro"]);
  const defects: VitalsDefect[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    // Check @font-face blocks
    const fontFaceRegex = /@font-face\s*\{([^}]+)\}/gi;
    let match = fontFaceRegex.exec(content);

    while (match !== null) {
      const block = match[1];
      const matchIndex = match.index;
      const lineNumber = content.substring(0, matchIndex).split("\n").length;

      // 1. Missing font-display: swap / optional
      if (!/font-display\s*:\s*(?:swap|optional)/i.test(block)) {
        defects.push({
          file,
          line: lineNumber,
          category: "FONTS",
          severity: "BLOCKING",
          rule: "VIT-004: Missing Font-Display Swap/Optional",
          issue:
            "@font-face declaration lacks font-display: swap or optional, triggering Flash of Invisible Text (FOIT).",
          codeSnippet: `@font-face { ${block.trim().replace(/\s+/g, " ").substring(0, 80)}... }`,
          remedy: "Add 'font-display: swap;' to provide immediate text display with fallback system font.",
        });
      }

      // 2. Legacy font formats (ttf, otf, eot) without woff2
      if (/url\([^)]+\.(?:ttf|otf|eot)['"]?\)/i.test(block) && !/url\([^)]+\.woff2['"]?\)/i.test(block)) {
        defects.push({
          file,
          line: lineNumber,
          category: "FONTS",
          severity: "WARNING",
          rule: "VIT-004: Legacy Uncompressed Font Format",
          issue:
            "@font-face references legacy font format (TTF/OTF/EOT) without modern WOFF2, bloating initial byte payload.",
          codeSnippet: `@font-face { ${block.trim().replace(/\s+/g, " ").substring(0, 80)}... }`,
          remedy:
            "Convert web fonts to WOFF2 format with unicode-range subsetting to stay under the 100KB font budget.",
        });
      }

      match = fontFaceRegex.exec(content);
    }
  }

  return defects;
}

export function auditVitals(targetPath: string): VitalsReport {
  const allFiles = collectFiles(targetPath, [
    ".html",
    ".jsx",
    ".tsx",
    ".vue",
    ".svelte",
    ".astro",
    ".css",
    ".ts",
    ".js",
  ]);
  const clsDefects = checkClsDefects(targetPath);
  const inpDefects = checkInpDefects(targetPath);
  const lcpDefects = checkLcpDefects(targetPath);
  const fontDefects = checkFontDefects(targetPath);

  const allDefects = [...clsDefects, ...inpDefects, ...lcpDefects, ...fontDefects];
  const blockingCount = allDefects.filter((d) => d.severity === "BLOCKING").length;
  const warningCount = allDefects.filter((d) => d.severity === "WARNING").length;

  const scoreCategory = (defects: VitalsDefect[]) => {
    const blocks = defects.filter((d) => d.severity === "BLOCKING").length;
    const warns = defects.filter((d) => d.severity === "WARNING").length;
    const score = Math.max(0, 100 - blocks * 25 - warns * 10);
    return {
      score,
      passed: blocks === 0 && score >= 70,
      defectsCount: defects.length,
    };
  };

  const inp = scoreCategory(inpDefects);
  const cls = scoreCategory(clsDefects);
  const lcp = scoreCategory(lcpDefects);
  const fonts = scoreCategory(fontDefects);

  const overallScore = Math.round((inp.score + cls.score + lcp.score + fonts.score) / 4);
  const verdict = blockingCount === 0 && overallScore >= 75 ? "PASS" : "BLOCK";

  return {
    target: targetPath,
    filesScanned: allFiles.length,
    overallScore,
    verdict,
    categories: { inp, cls, lcp, fonts },
    totalDefects: allDefects.length,
    blockingCount,
    warningCount,
    defects: allDefects,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  const auditIdx = args.indexOf("--audit-vitals");
  if (auditIdx !== -1) {
    const target = args[auditIdx + 1] || ".";
    const report = auditVitals(target);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️  Nexus Core Web Vitals Production Gate: ${report.target}`);
      console.log(`Files Scanned:    ${report.filesScanned}`);
      console.log(`Overall Score:    ${report.overallScore}/100`);
      console.log(
        `Verdict:          ${report.verdict === "PASS" ? "✅ PASS (RELEASE READY)" : "🚫 BLOCK (DEFECTS DETECTED)"}`,
      );
      console.log(`\nCategory Breakdown:`);
      console.log(
        `  • INP (Responsiveness):  ${report.categories.inp.score}/100 (${report.categories.inp.passed ? "PASS" : "FAIL"})`,
      );
      console.log(
        `  • CLS (Visual Stability): ${report.categories.cls.score}/100 (${report.categories.cls.passed ? "PASS" : "FAIL"})`,
      );
      console.log(
        `  • LCP (Loading Speed):    ${report.categories.lcp.score}/100 (${report.categories.lcp.passed ? "PASS" : "FAIL"})`,
      );
      console.log(
        `  • Fonts (FOUC & Budget):  ${report.categories.fonts.score}/100 (${report.categories.fonts.passed ? "PASS" : "FAIL"})\n`,
      );

      if (report.defects.length > 0) {
        console.log(`Detected Defects (${report.totalDefects} total, ${report.blockingCount} blocking):`);
        for (const d of report.defects) {
          console.log(`  [${d.severity}] ${d.rule} in ${path.relative(process.cwd(), d.file)}:${d.line}`);
          console.log(`    Issue:  ${d.issue}`);
          console.log(`    Snippet: ${d.codeSnippet}`);
          console.log(`    Remedy:  ${d.remedy}\n`);
        }
      }
    }
    process.exit(report.verdict === "PASS" ? 0 : 1);
  }

  const clsIdx = args.indexOf("--check-cls");
  if (clsIdx !== -1) {
    const target = args[clsIdx + 1] || ".";
    const defects = checkClsDefects(target);
    if (isJson) {
      console.log(JSON.stringify({ target, defectsCount: defects.length, defects }, null, 2));
    } else {
      console.log(`\n📐 CLS Layout Shift Audit: ${target} (${defects.length} defects)`);
      for (const d of defects) {
        console.log(`  [${d.severity}] ${d.rule} at ${d.file}:${d.line}`);
        console.log(`    ${d.issue}`);
      }
    }
    process.exit(defects.filter((d) => d.severity === "BLOCKING").length === 0 ? 0 : 1);
  }

  const inpIdx = args.indexOf("--check-inp");
  if (inpIdx !== -1) {
    const target = args[inpIdx + 1] || ".";
    const defects = checkInpDefects(target);
    if (isJson) {
      console.log(JSON.stringify({ target, defectsCount: defects.length, defects }, null, 2));
    } else {
      console.log(`\n⚡ INP Responsiveness Audit: ${target} (${defects.length} defects)`);
      for (const d of defects) {
        console.log(`  [${d.severity}] ${d.rule} at ${d.file}:${d.line}`);
        console.log(`    ${d.issue}`);
      }
    }
    process.exit(defects.filter((d) => d.severity === "BLOCKING").length === 0 ? 0 : 1);
  }

  const lcpIdx = args.indexOf("--check-lcp");
  if (lcpIdx !== -1) {
    const target = args[lcpIdx + 1] || ".";
    const defects = checkLcpDefects(target);
    if (isJson) {
      console.log(JSON.stringify({ target, defectsCount: defects.length, defects }, null, 2));
    } else {
      console.log(`\n🚀 LCP Loading Speed Audit: ${target} (${defects.length} defects)`);
      for (const d of defects) {
        console.log(`  [${d.severity}] ${d.rule} at ${d.file}:${d.line}`);
        console.log(`    ${d.issue}`);
      }
    }
    process.exit(defects.filter((d) => d.severity === "BLOCKING").length === 0 ? 0 : 1);
  }

  const fontIdx = args.indexOf("--check-fonts");
  if (fontIdx !== -1) {
    const target = args[fontIdx + 1] || ".";
    const defects = checkFontDefects(target);
    if (isJson) {
      console.log(JSON.stringify({ target, defectsCount: defects.length, defects }, null, 2));
    } else {
      console.log(`\n🔤 Web Font FOUC/FOIT Audit: ${target} (${defects.length} defects)`);
      for (const d of defects) {
        console.log(`  [${d.severity}] ${d.rule} at ${d.file}:${d.line}`);
        console.log(`    ${d.issue}`);
      }
    }
    process.exit(defects.filter((d) => d.severity === "BLOCKING").length === 0 ? 0 : 1);
  }

  console.log(`vitals-guard.ts — Nexus Core Web Vitals Auditor & Production Gate

Usage:
  bun vitals-guard.ts --audit-vitals <dir|file> [--json]
  bun vitals-guard.ts --check-cls <dir|file> [--json]
  bun vitals-guard.ts --check-inp <dir|file> [--json]
  bun vitals-guard.ts --check-lcp <dir|file> [--json]
  bun vitals-guard.ts --check-fonts <dir|file> [--json]
`);
  process.exit(0);
}
