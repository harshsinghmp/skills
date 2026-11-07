#!/usr/bin/env bun
/**
 * visual-audit.ts: Multi-viewport visual regression and layout overflow auditor.
 *
 * Usage:
 *   bun visual-audit.ts --check-markup [file|dir] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface VisualDefect {
  file: string;
  line: number;
  issue: string;
  severity: "BLOCKING" | "WARNING" | "INFO";
  recommendation: string;
}

export interface VisualAuditReport {
  target: string;
  isPassing: boolean;
  totalDefects: number;
  defects: VisualDefect[];
}

export function auditMarkupForLayoutBugs(filePath: string): VisualDefect[] {
  const defects: VisualDefect[] = [];
  if (!fs.existsSync(filePath)) return defects;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((lineText, idx) => {
    // 1. Check fixed pixel width exceeding 375px (causes mobile overflow)
    const fixedWidthMatch = /(?:width:\s*([4-9]\d{2,}|[1-9]\d{3,})px|w-\[([4-9]\d{2,}|[1-9]\d{3,})px\])/.exec(lineText);
    if (fixedWidthMatch) {
      const px = fixedWidthMatch[1] || fixedWidthMatch[2];
      defects.push({
        file: filePath,
        line: idx + 1,
        issue: `Fixed width (${px}px) exceeds mobile viewport width (375px), causing unscrollable horizontal overflow`,
        severity: "BLOCKING",
        recommendation: `Replace with fluid container: max-w-full, max-w-screen-md, or percentage width.`,
      });
    }

    // 2. Check fixed non-responsive min-width
    const minWidthMatch = /(?:min-width:\s*([4-9]\d{2,})px|min-w-\[([4-9]\d{2,})px\])/.exec(lineText);
    if (minWidthMatch) {
      const px = minWidthMatch[1] || minWidthMatch[2];
      defects.push({
        file: filePath,
        line: idx + 1,
        issue: `Fixed min-width (${px}px) breaks layout on mobile viewports`,
        severity: "BLOCKING",
        recommendation: `Use responsive breakpoint prefixes (e.g. md:min-w-[${px}px]) rather than mobile-first min-width.`,
      });
    }

    // 3. Sub-44px touch targets on mobile buttons
    if (/<(button|a)\b[^>]*\b(h-[4-8]|py-1|py-0\.5|p-1)\b[^>]*>/.test(lineText) && !lineText.includes("md:")) {
      defects.push({
        file: filePath,
        line: idx + 1,
        issue: `Interactive control appears smaller than 44px touch target guideline`,
        severity: "WARNING",
        recommendation: `Enforce minimum 44px touch target (e.g. min-h-[44px] min-w-[44px] or p-2.5).`,
      });
    }

    // 4. Extreme z-index without stacking isolation
    if (/z-\[(?:9999|99999|100000)\]/.test(lineText) && !lineText.includes("isolate")) {
      defects.push({
        file: filePath,
        line: idx + 1,
        issue: `Unbounded z-index escalation without explicit stacking isolation`,
        severity: "WARNING",
        recommendation: `Use standard z-index tokens (z-40/z-50) and wrap container in isolation: isolate.`,
      });
    }
  });

  return defects;
}

export function scanMarkupTree(targetDir: string): VisualAuditReport {
  let allDefects: VisualDefect[] = [];
  const exts = [".html", ".astro", ".tsx", ".jsx", ".vue", ".svelte"];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === "dist") continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        scan(full);
      } else if (e.isFile() && exts.some((ext) => e.name.endsWith(ext))) {
        allDefects = allDefects.concat(auditMarkupForLayoutBugs(full));
      }
    }
  }

  if (fs.existsSync(targetDir)) {
    if (fs.statSync(targetDir).isFile()) {
      allDefects = auditMarkupForLayoutBugs(targetDir);
    } else {
      scan(targetDir);
    }
  }

  const isPassing = !allDefects.some((d) => d.severity === "BLOCKING");
  return {
    target: targetDir,
    isPassing,
    totalDefects: allDefects.length,
    defects: allDefects,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const targetIdx = args.indexOf("--check-markup");
  const target =
    targetIdx !== -1 && args[targetIdx + 1] && !args[targetIdx + 1].startsWith("-")
      ? args[targetIdx + 1]
      : process.cwd();
  const isJson = args.includes("--json");

  const report = scanMarkupTree(target);

  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n📱 Visual Regression & Viewport Overflow Audit: ${target}`);
    console.log(
      `  Verdict: ${report.isPassing ? "✅ SHIP (No Blocking Breakages)" : "❌ BLOCK (Layout Regressions Detected)"}`,
    );
    console.log(`  Total Defects: ${report.totalDefects}`);
    for (const d of report.defects.slice(0, 15)) {
      console.log(`    - [${d.severity}] ${d.file}:${d.line}: ${d.issue}`);
      console.log(`      💡 Recommendation: ${d.recommendation}`);
    }
  }
}
