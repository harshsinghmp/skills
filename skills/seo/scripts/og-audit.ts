#!/usr/bin/env bun
/**
 * og-audit.ts: OpenGraph & Social Media Share Card Auditor & Metadata Generator.
 *
 * Usage:
 *   bun og-audit.ts --audit [dir|file] [--json]
 *   bun og-audit.ts --generate-meta --title "..." --desc "..." --url "..." --image "..."
 */

import fs from "node:fs";
import path from "node:path";

export interface OgViolation {
  file: string;
  line: number;
  type: "missing-og-image" | "missing-og-title" | "missing-twitter-card" | "placeholder-image" | "missing-dimensions";
  detail: string;
  fix: string;
}

export interface OgReport {
  scannedFiles: number;
  passingFiles: number;
  violations: OgViolation[];
  safe: boolean;
}

const PLACEHOLDER_PATTERNS = [
  /example\.com/i,
  /placeholder\.(?:png|jpg|webp)/i,
  /via\.placeholder\.com/i,
  /localhost/i,
  /default-og/i,
  /dummyimage\.com/i,
];

export function auditOpenGraph(targetPath = process.cwd()): OgReport {
  let scannedFiles = 0;
  const violations: OgViolation[] = [];
  const textExts = [".html", ".tsx", ".jsx", ".astro", ".md", ".vue"];

  function checkFile(filePath: string) {
    scannedFiles++;
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    const hasOgImage =
      content.includes('property="og:image"') ||
      content.includes("property='og:image'") ||
      content.includes("og:image") ||
      content.includes("openGraph: {") ||
      content.includes("openGraph:");

    const hasOgTitle =
      content.includes('property="og:title"') ||
      content.includes("property='og:title'") ||
      content.includes("og:title") ||
      content.includes("title:");

    const hasTwitterCard =
      content.includes('name="twitter:card"') ||
      content.includes("name='twitter:card'") ||
      content.includes("twitter:card") ||
      content.includes("twitter: {");

    if (!hasOgImage) {
      violations.push({
        file: filePath,
        line: 1,
        type: "missing-og-image",
        detail: "Missing OpenGraph image tag (og:image).",
        fix: "Add an absolute og:image URL (recommended 1200x630px, <300kB).",
      });
    }

    if (!hasOgTitle) {
      violations.push({
        file: filePath,
        line: 1,
        type: "missing-og-title",
        detail: "Missing OpenGraph title tag (og:title).",
        fix: "Add og:title matching page topic or meta title.",
      });
    }

    if (!hasTwitterCard) {
      violations.push({
        file: filePath,
        line: 1,
        type: "missing-twitter-card",
        detail: "Missing twitter:card meta tag.",
        fix: 'Add <meta name="twitter:card" content="summary_large_image" />.',
      });
    }

    lines.forEach((lineText, idx) => {
      if (/og:image|twitter:image/i.test(lineText)) {
        for (const p of PLACEHOLDER_PATTERNS) {
          if (p.test(lineText)) {
            violations.push({
              file: filePath,
              line: idx + 1,
              type: "placeholder-image",
              detail: `Placeholder or unverified image URL detected: "${lineText.trim()}".`,
              fix: "Replace placeholder with production CDN or static asset URL.",
            });
          }
        }
      }
    });
  }

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
      for (const item of fs.readdirSync(current)) {
        walk(path.join(current, item));
      }
    } else if (textExts.some((ext) => current.endsWith(ext))) {
      checkFile(current);
    }
  }

  if (fs.existsSync(targetPath)) {
    if (fs.statSync(targetPath).isFile()) {
      checkFile(targetPath);
    } else {
      walk(targetPath);
    }
  }

  const failingFilesCount = new Set(violations.map((v) => v.file)).size;
  const passingFiles = Math.max(0, scannedFiles - failingFilesCount);

  return {
    scannedFiles,
    passingFiles,
    violations,
    safe: violations.length === 0,
  };
}

export function generateOgMetadata(opts: {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}): string {
  const title = opts.title || "Agency Platform";
  const desc = opts.description || "Modern digital agency software engineering and growth platform.";
  const url = opts.url || "https://example.com";
  const image = opts.image || "https://example.com/assets/og-cover.png";

  return `<!-- OpenGraph & Twitter Card Metadata -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${title}" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${image}" />`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--generate-meta")) {
    const getArg = (flag: string) => {
      const idx = args.indexOf(flag);
      return idx !== -1 ? args[idx + 1] : undefined;
    };
    console.log(
      generateOgMetadata({
        title: getArg("--title"),
        description: getArg("--desc"),
        url: getArg("--url"),
        image: getArg("--image"),
      }),
    );
  } else if (args.includes("--audit")) {
    const idx = args.indexOf("--audit");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = auditOpenGraph(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🖼️ OpenGraph & Social Share Preview Audit: ${target}`);
      console.log(`  Scanned Files: ${report.scannedFiles}`);
      console.log(`  Passing Files: ${report.passingFiles}`);
      console.log(`  Violations Found: ${report.violations.length}`);
      if (report.safe) {
        console.log(`  ✅ Clean! All pages declare valid, non-placeholder OpenGraph metadata.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  [${v.type}] ${v.file}:${v.line} -> ${v.detail} (Fix: ${v.fix})`);
        }
      }
    }
  } else {
    console.log("Usage: bun og-audit.ts [--audit [dir|file]] [--generate-meta [--title '...'] [--desc '...']]");
  }
}
