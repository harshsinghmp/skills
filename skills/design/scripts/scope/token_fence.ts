#!/usr/bin/env bun
/**
 * token_fence.ts: Linter and snapping engine for arbitrary Tailwind bracket hallucinations.
 *
 * Usage:
 *   bun token_fence.ts --scan [file|dir] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface BracketViolation {
  file: string;
  line: number;
  rawClass: string;
  category: "color" | "dimension" | "radius" | "font-size";
  recommendedToken: string;
}

export function snapPixelToTailwind(px: number, prefix: string): string {
  // Standard 4pt scale (1rem = 16px, 1 unit = 4px)
  const units = Math.round(px / 4);
  if (prefix.startsWith("rounded")) {
    if (px <= 2) return "rounded-sm";
    if (px <= 6) return "rounded";
    if (px <= 8) return "rounded-md";
    if (px <= 12) return "rounded-lg";
    if (px <= 16) return "rounded-xl";
    return "rounded-2xl";
  }
  if (prefix.startsWith("text")) {
    if (px <= 12) return "text-xs";
    if (px <= 14) return "text-sm";
    if (px <= 16) return "text-base";
    if (px <= 18) return "text-lg";
    if (px <= 20) return "text-xl";
    if (px <= 24) return "text-2xl";
    return "text-3xl";
  }
  return `${prefix}-${units}`;
}

export function scanFileForBrackets(filePath: string): BracketViolation[] {
  const violations: BracketViolation[] = [];
  if (!fs.existsSync(filePath)) return violations;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const colorRegex = /((?:bg|text|border|ring|fill|stroke)-\[#[a-fA-F0-9]{3,8}\])/g;
  const pixelRegex =
    /((?:w|h|min-w|max-w|min-h|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|top|bottom|left|right|rounded|text)-\[(\d+)px\])/g;

  lines.forEach((lineText, idx) => {
    // 1. Color matches
    let colorMatch = colorRegex.exec(lineText);
    while (colorMatch !== null) {
      const raw = colorMatch[1];
      const prefix = raw.split("-[")[0];
      violations.push({
        file: filePath,
        line: idx + 1,
        rawClass: raw,
        category: "color",
        recommendedToken: `${prefix}-foreground or ${prefix}-muted (use theme token)`,
      });
      colorMatch = colorRegex.exec(lineText);
    }

    // 2. Pixel matches
    let pixelMatch = pixelRegex.exec(lineText);
    while (pixelMatch !== null) {
      const raw = pixelMatch[1];
      const prefix = raw.split("-[")[0];
      const px = parseInt(pixelMatch[2], 10);
      let cat: "dimension" | "radius" | "font-size" = "dimension";
      if (prefix.startsWith("rounded")) cat = "radius";
      else if (prefix.startsWith("text")) cat = "font-size";

      violations.push({
        file: filePath,
        line: idx + 1,
        rawClass: raw,
        category: cat,
        recommendedToken: snapPixelToTailwind(px, prefix),
      });
      pixelMatch = pixelRegex.exec(lineText);
    }
  });

  return violations;
}

export function scanDirectory(
  dir: string,
  exts = [".tsx", ".jsx", ".astro", ".html", ".vue", ".svelte", ".css"],
): BracketViolation[] {
  let results: BracketViolation[] = [];
  if (!fs.existsSync(dir)) return results;

  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    return scanFileForBrackets(dir);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".next")
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanDirectory(full, exts));
    } else if (entry.isFile() && exts.some((ext) => entry.name.endsWith(ext))) {
      results = results.concat(scanFileForBrackets(full));
    }
  }
  return results;
}

export interface MediaViolation {
  file: string;
  type: "file-size" | "format" | "cls-dimension";
  detail: string;
  recommendation: string;
}

export interface MediaAuditReport {
  totalAssetsScanned: number;
  totalCodeFilesScanned: number;
  violations: MediaViolation[];
}

export function auditMediaWeights(targetPath = process.cwd()): MediaAuditReport {
  let totalAssets = 0;
  let totalCodeFiles = 0;
  const violations: MediaViolation[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (
        current.includes("node_modules") ||
        current.includes(".git") ||
        current.includes("dist") ||
        current.includes(".next")
      )
        return;
      const files = fs.readdirSync(current);
      for (const f of files) walk(path.join(current, f));
    } else {
      const ext = path.extname(current).toLowerCase();
      // 1. Static Media Asset Checks
      if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(ext)) {
        totalAssets++;
        const sizeKb = Math.round(stat.size / 1024);
        if (sizeKb > 250) {
          violations.push({
            file: path.relative(process.cwd(), current),
            type: "file-size",
            detail: `Asset weight ${sizeKb}kB exceeds 250kB budget`,
            recommendation: "Compress using Sharp/Squoosh or resize to maximum display dimensions.",
          });
        } else if ([".png", ".jpg", ".jpeg"].includes(ext) && sizeKb > 100) {
          violations.push({
            file: path.relative(process.cwd(), current),
            type: "format",
            detail: `Legacy format (${ext}) exceeds 100kB (${sizeKb}kB)`,
            recommendation: "Convert to modern WebP or AVIF format for 30–60% byte savings.",
          });
        }
      }
      // 2. Code File CLS Checks
      else if ([".tsx", ".jsx", ".astro", ".html", ".vue", ".svelte"].includes(ext)) {
        totalCodeFiles++;
        const content = fs.readFileSync(current, "utf8");
        const imgRegex = /<img\s+([^>]+)>/gi;
        let match = imgRegex.exec(content);
        while (match !== null) {
          const attrs = match[1];
          const hasWidth = /\bwidth\s*=/i.test(attrs);
          const hasHeight = /\bheight\s*=/i.test(attrs);
          const hasAspect = /\baspect-(?:video|square|\[[^\]]+\])/i.test(attrs) || /aspectRatio/i.test(attrs);

          if ((!hasWidth || !hasHeight) && !hasAspect) {
            violations.push({
              file: path.relative(process.cwd(), current),
              type: "cls-dimension",
              detail: `<img> tag missing explicit width/height dimensions or aspect-ratio container`,
              recommendation:
                "Specify width and height attributes or CSS aspect-ratio container to prevent CLS layout shift.",
            });
          }
          match = imgRegex.exec(content);
        }
      }
    }
  }

  walk(targetPath);

  return {
    totalAssetsScanned: totalAssets,
    totalCodeFilesScanned: totalCodeFiles,
    violations,
  };
}

export interface A11yViolation {
  file: string;
  line: number;
  type: "clickable-div" | "suppressed-outline";
  snippet: string;
  recommendation: string;
}

export interface A11yAuditReport {
  totalFilesScanned: number;
  violations: A11yViolation[];
}

export function auditA11yInteractions(targetPath = process.cwd()): A11yAuditReport {
  let totalFiles = 0;
  const violations: A11yViolation[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (
        current.includes("node_modules") ||
        current.includes(".git") ||
        current.includes("dist") ||
        current.includes(".next")
      )
        return;
      const files = fs.readdirSync(current);
      for (const f of files) walk(path.join(current, f));
    } else if (/\.(tsx|jsx|astro|html|vue|svelte)$/.test(current)) {
      totalFiles++;
      const content = fs.readFileSync(current, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, idx) => {
        // 1. Clickable div or span trap
        if (/<(?:div|span)\s+[^>]*onClick/i.test(line)) {
          const hasRole = /role\s*=\s*['"]button['"]/i.test(line);
          const hasTabIndex = /tabIndex\s*=\s*[{'"]?\d+/i.test(line);
          if (!hasRole || !hasTabIndex) {
            violations.push({
              file: path.relative(process.cwd(), current),
              line: idx + 1,
              type: "clickable-div",
              snippet: line.trim().slice(0, 80),
              recommendation:
                "Replace with semantic <button> or add role='button', tabIndex={0}, and onKeyDown handler.",
            });
          }
        }

        // 2. Suppressed focus outline without ring
        if (/\b(?:focus:)?outline-none\b/.test(line)) {
          const hasRing = /\b(?:focus-visible:)?ring-/.test(line) || /\b(?:focus:)?ring-/.test(line);
          if (!hasRing) {
            violations.push({
              file: path.relative(process.cwd(), current),
              line: idx + 1,
              type: "suppressed-outline",
              snippet: line.trim().slice(0, 80),
              recommendation:
                "Pair outline-none with a visible focus indicator (e.g. focus-visible:ring-2 focus-visible:ring-primary).",
            });
          }
        }
      });
    }
  }

  walk(targetPath);

  return {
    totalFilesScanned: totalFiles,
    violations,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--audit-media")) {
    const idx = args.indexOf("--audit-media");
    const target = idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = auditMediaWeights(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n⚡ Media Weight & CLS Budget Audit: ${target}`);
      console.log(`  Scanned Assets: ${report.totalAssetsScanned} | Code Files: ${report.totalCodeFilesScanned}`);
      console.log(`  Violations: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ All media assets meet 250kB weight budget and CLS layout rules.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  [${v.type}] ${v.file}: ${v.detail} (Fix: ${v.recommendation})`);
        }
      }
    }
  } else if (args.includes("--audit-a11y")) {
    const idx = args.indexOf("--audit-a11y");
    const target = idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = auditA11yInteractions(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n♿ Accessible Interaction & Focus Audit: ${target}`);
      console.log(`  Scanned Files: ${report.totalFilesScanned}`);
      console.log(`  Violations: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! No clickable div traps or naked outline-none violations.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ❌ [${v.type}] ${v.file}:${v.line}: ${v.snippet} -> ${v.recommendation}`);
        }
      }
    }
  } else {
    // Default or --scan
    const scanIdx = args.indexOf("--scan");
    const target =
      scanIdx !== -1 && args[scanIdx + 1] && !args[scanIdx + 1].startsWith("-") ? args[scanIdx + 1] : process.cwd();

    const violations = scanDirectory(target);

    if (isJson) {
      console.log(JSON.stringify({ target, totalViolations: violations.length, violations }, null, 2));
    } else {
      console.log(`\n🛡️ Design Token Fence Scan: ${target}`);
      console.log(`  Total Arbitrary Bracket Hallucinations: ${violations.length}`);
      if (violations.length === 0) {
        console.log(`  ✅ Clean! Zero arbitrary Tailwind bracket classes detected.`);
      } else {
        console.log(`\n  Violations:`);
        for (const v of violations.slice(0, 20)) {
          console.log(`    - ${v.file}:${v.line} -> ${v.rawClass} (Recommended: ${v.recommendedToken})`);
        }
        if (violations.length > 20) {
          console.log(`    ... and ${violations.length - 20} more.`);
        }
      }
    }
  }
}
