#!/usr/bin/env bun
/**
 * anti-drift.ts: Duplicate utility scanner and refactor scope guard for gauntlet quality loops.
 *
 * Usage:
 *   bun anti-drift.ts --scan-duplicates [dir] [--json]
 *   bun anti-drift.ts --check-scope [since-git-ref]
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export interface DuplicateUtility {
  functionName: string;
  declarations: { file: string; line: number }[];
}

export interface AntiDriftReport {
  targetDir: string;
  isPassing: boolean;
  duplicateCount: number;
  duplicates: DuplicateUtility[];
}

const COMMON_UTILS = ["cn", "formatDate", "slugify", "truncate", "debounce", "throttle", "classNames", "fetcher"];

export function scanDuplicateUtilities(targetDir = process.cwd()): AntiDriftReport {
  const funcMap = new Map<string, { file: string; line: number }[]>();
  const textExts = [".ts", ".tsx", ".js", ".jsx", ".astro"];

  for (const u of COMMON_UTILS) {
    funcMap.set(u, []);
  }

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === "dist" || e.name === ".next") continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        scan(full);
      } else if (e.isFile() && textExts.some((ext) => e.name.endsWith(ext))) {
        try {
          const content = fs.readFileSync(full, "utf8");
          const lines = content.split("\n");
          lines.forEach((lineText, idx) => {
            for (const util of COMMON_UTILS) {
              const regex = new RegExp(
                `(?:export\\s+)?(?:function\\s+${util}\\b|const\\s+${util}\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>))`,
              );
              if (regex.test(lineText)) {
                funcMap.get(util)?.push({ file: path.relative(targetDir, full), line: idx + 1 });
              }
            }
          });
        } catch {
          // Ignore
        }
      }
    }
  }

  if (fs.existsSync(targetDir)) {
    if (fs.statSync(targetDir).isFile()) {
      // scan single file
    } else {
      scan(targetDir);
    }
  }

  const duplicates: DuplicateUtility[] = [];
  for (const [funcName, decls] of funcMap.entries()) {
    if (decls.length > 1) {
      duplicates.push({ functionName: funcName, declarations: decls });
    }
  }

  return {
    targetDir,
    isPassing: duplicates.length === 0,
    duplicateCount: duplicates.length,
    duplicates,
  };
}

export function checkRefactorScope(sinceRef = "HEAD~1"): { fileCount: number; files: string[]; exceedsLimit: boolean } {
  let files: string[] = [];
  try {
    const out = execSync(`git diff --name-only ${sinceRef}`, { encoding: "utf8" });
    files = out
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    files = [];
  }

  const fileCount = files.length;
  const exceedsLimit = fileCount > 3;

  return { fileCount, files, exceedsLimit };
}

export interface SilentCatchViolation {
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
}

export interface SilentCatchReport {
  scannedFiles: number;
  violations: SilentCatchViolation[];
}

export function scanSilentCatches(targetDir = process.cwd()): SilentCatchReport {
  let scannedFiles = 0;
  const violations: SilentCatchViolation[] = [];

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
    } else if (/\.(ts|tsx|js|jsx)$/.test(current)) {
      scannedFiles++;
      const content = fs.readFileSync(current, "utf8");

      // Regex to find catch blocks
      const catchRegex = /catch\s*(?:\([^)]*\))?\s*\{([^}]*)\}/gs;
      let match = catchRegex.exec(content);
      while (match !== null) {
        const body = match[1]
          .replace(/\/\/[^\n]*/g, "")
          .replace(/\/\*.*?\*\//gs, "")
          .trim();
        const hasLog = /console\.(?:error|warn|info)|logger\.|reportError|captureException/i.test(match[1]);
        const hasThrow = /\bthrow\b/.test(body);
        const hasReturn = /\breturn\b/.test(body);

        if (body.length === 0 || (!hasLog && !hasThrow && !hasReturn)) {
          // Calculate line number
          const prefix = content.slice(0, match.index);
          const lineNum = prefix.split("\n").length;
          violations.push({
            file: path.relative(process.cwd(), current),
            line: lineNum,
            snippet: match[0].slice(0, 60).replace(/\n/g, " "),
            recommendation: "Log error to console/telemetry, rethrow, or return an explicit fallback.",
          });
        }
        match = catchRegex.exec(content);
      }
    }
  }

  walk(targetDir);
  return { scannedFiles, violations };
}

export interface FlakyTestViolation {
  file: string;
  line: number;
  pattern: string;
  recommendation: string;
}

export interface FlakyTestReport {
  scannedTestFiles: number;
  violations: FlakyTestViolation[];
}

export function scanFlakyTestSleeps(targetDir = process.cwd()): FlakyTestReport {
  let scannedTestFiles = 0;
  const violations: FlakyTestViolation[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (current.includes("node_modules") || current.includes(".git") || current.includes("dist")) return;
      const files = fs.readdirSync(current);
      for (const f of files) walk(path.join(current, f));
    } else if (
      /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(current) ||
      current.includes("/tests/") ||
      current.includes("/test/")
    ) {
      if (/\.(ts|tsx|js|jsx)$/.test(current)) {
        scannedTestFiles++;
        const content = fs.readFileSync(current, "utf8");
        const lines = content.split("\n");

        lines.forEach((lineText, idx) => {
          if (/waitForTimeout\s*\(/.test(lineText)) {
            violations.push({
              file: path.relative(process.cwd(), current),
              line: idx + 1,
              pattern: "page.waitForTimeout()",
              recommendation: "Replace arbitrary timer wait with page.waitForSelector() or expect.poll().",
            });
          }
          if (/\b(?:await\s+)?sleep\s*\(\d+\)/.test(lineText)) {
            violations.push({
              file: path.relative(process.cwd(), current),
              line: idx + 1,
              pattern: "sleep(N)",
              recommendation: "Replace arbitrary timer sleep with deterministic polling or assertion timeout.",
            });
          }
        });
      }
    }
  }

  walk(targetDir);
  return { scannedTestFiles, violations };
}

export interface DependencyViolation {
  package: string;
  reason: string;
  replacement: string;
}

export interface DependencyDietReport {
  packageJsonPath: string;
  violations: DependencyViolation[];
}

const REDUNDANT_DEPS: Record<string, { reason: string; replacement: string }> = {
  "is-odd": { reason: "Trivial micro-package", replacement: "Native (n % 2 !== 0)" },
  "is-even": { reason: "Trivial micro-package", replacement: "Native (n % 2 === 0)" },
  "left-pad": { reason: "Trivial micro-package", replacement: "Native String.prototype.padStart()" },
  "is-number": { reason: "Trivial micro-package", replacement: "Native typeof n === 'number'" },
  axios: { reason: "Redundant HTTP client", replacement: "Standard native fetch() in Node 18+ and Bun" },
  "node-fetch": { reason: "Redundant fetch polyfill", replacement: "Standard native fetch() in Node 18+ and Bun" },
  moment: { reason: "Heavyweight legacy datetime library", replacement: "Native Intl API or lightweight date-fns" },
  querystring: { reason: "Deprecated legacy Node module", replacement: "Standard URLSearchParams" },
  rimraf: {
    reason: "Legacy filesystem helper",
    replacement: "Native fs.rmSync(path, { recursive: true, force: true })",
  },
  mkdirp: { reason: "Legacy directory helper", replacement: "Native fs.mkdirSync(path, { recursive: true })" },
};

export function auditRedundantDependencies(pkgPath: string): DependencyDietReport {
  const violations: DependencyViolation[] = [];
  if (!fs.existsSync(pkgPath)) return { packageJsonPath: pkgPath, violations };

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    for (const [name, meta] of Object.entries(REDUNDANT_DEPS)) {
      if (allDeps[name]) {
        violations.push({
          package: name,
          reason: meta.reason,
          replacement: meta.replacement,
        });
      }
    }
  } catch {
    // Ignore invalid JSON
  }

  return { packageJsonPath: pkgPath, violations };
}

export interface HydrationViolation {
  file: string;
  line: number;
  pattern: string;
  reason: string;
  fix: string;
}

export interface HydrationReport {
  scannedFiles: number;
  violations: HydrationViolation[];
}

export function scanHydrationRisks(targetDir = process.cwd()): HydrationReport {
  let scannedFiles = 0;
  const violations: HydrationViolation[] = [];
  const textExts = [".tsx", ".jsx", ".astro"];

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
      scannedFiles++;
      const content = fs.readFileSync(current, "utf8");
      const lines = content.split("\n");

      lines.forEach((lineText, idx) => {
        if (
          /\bnew\s+Date\(\)\.to(?:Locale(?:Date|Time)?String|String)\(\)/.test(lineText) ||
          /\bMath\.random\(\)/.test(lineText)
        ) {
          if (!lineText.includes("suppressHydrationWarning") && !content.includes("suppressHydrationWarning")) {
            violations.push({
              file: current,
              line: idx + 1,
              pattern: lineText.trim(),
              reason: "Unsuppressed client-dependent date/random value in SSR component markup.",
              fix: "Add suppressHydrationWarning to element or use a two-pass mounted useEffect pattern.",
            });
          }
        }
      });
    }
  }

  walk(targetDir);
  return { scannedFiles, violations };
}

export interface CmsCohesionViolation {
  file: string;
  line: number;
  snippet: string;
  reason: string;
  recommendation: string;
}

export interface CmsCohesionReport {
  cmsDetected: boolean;
  cmsType?: string;
  scannedFiles: number;
  violations: CmsCohesionViolation[];
}

export function detectProjectCms(targetDir = process.cwd()): { detected: boolean; type?: string } {
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const allDeps: Record<string, string> = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (allDeps.payload || Object.keys(allDeps).some((k) => k.startsWith("@payloadcms/"))) {
        return { detected: true, type: "Payload CMS" };
      }
      if (
        allDeps["@wordpress/scripts"] ||
        allDeps.wordpress ||
        Object.keys(allDeps).some((k) => k.startsWith("@wordpress/"))
      ) {
        return { detected: true, type: "WordPress" };
      }
      if (allDeps["@measured/puck"]) {
        return { detected: true, type: "Puck Visual Builder" };
      }
      if (allDeps.sanity || Object.keys(allDeps).some((k) => k.startsWith("@sanity/"))) {
        return { detected: true, type: "Sanity" };
      }
      if (allDeps.strapi || Object.keys(allDeps).some((k) => k.startsWith("@strapi/"))) {
        return { detected: true, type: "Strapi" };
      }
      if (allDeps.emdash) {
        return { detected: true, type: "Emdash" };
      }
      if (allDeps.contentful) {
        return { detected: true, type: "Contentful" };
      }
    } catch {
      // ignore
    }
  }

  if (
    fs.existsSync(path.join(targetDir, "payload.config.ts")) ||
    fs.existsSync(path.join(targetDir, "payload.config.js"))
  ) {
    return { detected: true, type: "Payload CMS" };
  }
  if (
    fs.existsSync(path.join(targetDir, "sanity.config.ts")) ||
    fs.existsSync(path.join(targetDir, "sanity.config.js"))
  ) {
    return { detected: true, type: "Sanity" };
  }
  if (
    fs.existsSync(path.join(targetDir, "puck.config.tsx")) ||
    fs.existsSync(path.join(targetDir, "puck.config.jsx"))
  ) {
    return { detected: true, type: "Puck Visual Builder" };
  }
  if (fs.existsSync(path.join(targetDir, "wp-config.php"))) {
    return { detected: true, type: "WordPress" };
  }

  return { detected: false };
}

export function scanCmsCohesion(targetDir = process.cwd(), forceCmsCheck = false): CmsCohesionReport {
  const cmsInfo = detectProjectCms(targetDir);
  const cmsDetected = forceCmsCheck || cmsInfo.detected;
  let scannedFiles = 0;
  const violations: CmsCohesionViolation[] = [];

  if (!cmsDetected) {
    return { cmsDetected: false, scannedFiles: 0, violations: [] };
  }

  const textExts = [".tsx", ".jsx", ".astro", ".vue"];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (
        current.includes("node_modules") ||
        current.includes(".git") ||
        current.includes("dist") ||
        current.includes(".next") ||
        current.includes("tests") ||
        current.includes("__tests__")
      )
        return;
      for (const item of fs.readdirSync(current)) {
        walk(path.join(current, item));
      }
    } else if (textExts.some((ext) => current.endsWith(ext))) {
      scannedFiles++;
      const content = fs.readFileSync(current, "utf8");
      const lines = content.split("\n");

      lines.forEach((lineText, idx) => {
        // Inline style check
        if (/style=\{\{\s*[^}]*(?:#[0-9a-fA-F]{3,8}|\b\d+px\b)[^}]*\}\}/.test(lineText)) {
          violations.push({
            file: path.relative(process.cwd(), current),
            line: idx + 1,
            snippet: lineText.trim(),
            reason: "Inline style bypasses CMS styling fields and globals.css tokens.",
            recommendation: "Move style to CMS design tokens, globals.css, or CMS custom CSS field.",
          });
        }

        // Hardcoded long copy in JSX
        const tagTextMatch = />([^<{][^<]{60,})</.exec(lineText);
        if (tagTextMatch && !lineText.includes("http://") && !lineText.includes("https://")) {
          violations.push({
            file: path.relative(process.cwd(), current),
            line: idx + 1,
            snippet: tagTextMatch[1].trim().slice(0, 70),
            reason: `Hardcoded user-facing copy (>60 chars) detected when ${cmsInfo.type || "CMS"} is active.`,
            recommendation: "Extract static text to CMS collection field, global schema, or page builder block.",
          });
        }
      });
    }
  }

  walk(targetDir);
  return {
    cmsDetected: true,
    cmsType: cmsInfo.type,
    scannedFiles,
    violations,
  };
}

export interface DeployVerificationReport {
  url: string;
  status: number;
  statusText: string;
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export async function verifyDeployUrl(
  url: string,
  options: { timeoutMs?: number; expectedStatus?: number } = {},
): Promise<DeployVerificationReport> {
  const timeoutMs = options.timeoutMs ?? 10000;
  const expectedStatus = options.expectedStatus ?? 200;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Muse-Skills-Gauntlet-Deploy-Verifier/1.0",
      },
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - startTime;
    const text = await res.text();

    const crashSignatures = [
      "Application error: a client-side exception has occurred",
      "Internal Server Error",
      "502 Bad Gateway",
      "Unhandled Runtime Error",
    ];

    let ok = res.status === expectedStatus;
    let error: string | undefined;

    if (ok) {
      for (const sig of crashSignatures) {
        if (text.includes(sig)) {
          ok = false;
          error = `Page returned HTTP ${res.status} but body contains crash signature: "${sig}"`;
          break;
        }
      }
    } else {
      error = `Expected HTTP ${expectedStatus} but received HTTP ${res.status} (${res.statusText})`;
    }

    return {
      url,
      status: res.status,
      statusText: res.statusText,
      ok,
      latencyMs,
      error,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      url,
      status: 0,
      statusText: "Connection Failed",
      ok: false,
      latencyMs,
      error: isAbort ? `Request timed out after ${timeoutMs}ms` : err instanceof Error ? err.message : String(err),
    };
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--scan-duplicates")) {
    const idx = args.indexOf("--scan-duplicates");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanDuplicateUtilities(target);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🏛️ Anti-Drift Duplicate Utility Scan: ${target}`);
      console.log(
        `  Verdict: ${report.isPassing ? "✅ CLEAN (Zero Duplicate Utilities)" : "❌ FAILED (Duplicates Detected)"}`,
      );
      console.log(`  Duplicate Utilities Found: ${report.duplicateCount}`);
      for (const d of report.duplicates) {
        console.log(`\n  Function "${d.functionName}" duplicated in ${d.declarations.length} places:`);
        for (const loc of d.declarations) {
          console.log(`    - ${loc.file}:${loc.line}`);
        }
      }
    }
  } else if (args.includes("--check-scope")) {
    const idx = args.indexOf("--check-scope");
    const ref = args[idx + 1] || "HEAD~1";
    const res = checkRefactorScope(ref);
    console.log(`\n📐 Refactor Scope Check (${ref}):`);
    console.log(`  Files Modified: ${res.fileCount}`);
    console.log(
      `  Limit Exceeded (>3 files): ${res.exceedsLimit ? "⚠️ YES (Escalate to Nexus)" : "✅ NO (Within Scope)"}`,
    );
  } else if (args.includes("--scan-silent-catches")) {
    const idx = args.indexOf("--scan-silent-catches");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanSilentCatches(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n📢 Loud Failure & Silent Catch Audit: ${target}`);
      console.log(`  Scanned Files: ${report.scannedFiles}`);
      console.log(`  Silent Catches: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Zero silent error-swallowing catch blocks.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ❌ ${v.file}:${v.line} -> ${v.snippet} (Fix: ${v.recommendation})`);
        }
      }
    }
  } else if (args.includes("--scan-flaky-tests")) {
    const idx = args.indexOf("--scan-flaky-tests");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanFlakyTestSleeps(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n⏱️ Deterministic Test Sleep Audit: ${target}`);
      console.log(`  Scanned Test Files: ${report.scannedTestFiles}`);
      console.log(`  Flaky Sleeps: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Zero arbitrary sleeps detected in test files.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  ${v.file}:${v.line} -> ${v.pattern} (Fix: ${v.recommendation})`);
        }
      }
    }
  } else if (args.includes("--audit-deps")) {
    const idx = args.indexOf("--audit-deps");
    const target =
      args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : path.join(process.cwd(), "package.json");
    const report = auditRedundantDependencies(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n📦 Dependency Diet Audit: ${target}`);
      console.log(`  Redundant Packages: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Zero redundant platform-duplicating dependencies detected.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  Package '${v.package}': ${v.reason} (Replace with: ${v.replacement})`);
        }
      }
    }
  } else if (args.includes("--scan-hydration-risks")) {
    const idx = args.indexOf("--scan-hydration-risks");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanHydrationRisks(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n💧 Client-Side Hydration Risk Audit: ${target}`);
      console.log(`  Scanned Files: ${report.scannedFiles}`);
      console.log(`  Hydration Risks: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Zero unsuppressed hydration risks detected.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  ${v.file}:${v.line} -> ${v.pattern} (Fix: ${v.fix})`);
        }
      }
    }
  } else if (args.includes("--scan-cms-cohesion")) {
    const idx = args.indexOf("--scan-cms-cohesion");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const force = args.includes("--force");
    const report = scanCmsCohesion(target, force);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🧩 CMS-Cohesion & Hardcoded Copy Audit: ${target}`);
      console.log(
        `  CMS Active: ${report.cmsDetected ? `✅ YES (${report.cmsType ?? "Detected"})` : "ℹ️  NO (No CMS detected)"}`,
      );
      console.log(`  Scanned Files: ${report.scannedFiles}`);
      console.log(`  Cohesion Violations: ${report.violations.length}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Zero hardcoded copy or inline styling violations.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - ⚠️  ${v.file}:${v.line} -> ${v.snippet} (${v.reason})`);
          console.log(`         Fix: ${v.recommendation}`);
        }
      }
    }
  } else if (args.includes("--verify-deploy")) {
    const idx = args.indexOf("--verify-deploy");
    const url = args[idx + 1];
    if (!url) {
      console.error("Error: --verify-deploy requires a URL argument");
      process.exit(1);
    }
    const statusIdx = args.indexOf("--expected-status");
    const expectedStatus = statusIdx !== -1 && args[statusIdx + 1] ? Number.parseInt(args[statusIdx + 1], 10) : 200;
    const timeoutIdx = args.indexOf("--timeout");
    const timeoutMs = timeoutIdx !== -1 && args[timeoutIdx + 1] ? Number.parseInt(args[timeoutIdx + 1], 10) : 10000;

    const report = await verifyDeployUrl(url, { expectedStatus, timeoutMs });
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🚀 Verified Deploy Gate Audit: ${url}`);
      console.log(`  Status: ${report.status} (${report.statusText})`);
      console.log(`  Latency: ${report.latencyMs}ms`);
      console.log(
        `  Verdict: ${report.ok ? "✅ VERIFIED (Preview Healthy & Accessible)" : `❌ FAILED (${report.error})`}`,
      );
    }
  } else {
    console.log(
      "Usage: bun anti-drift.ts [--scan-duplicates [dir]] [--check-scope [since-ref]] [--scan-silent-catches [dir]] [--scan-flaky-tests [dir]] [--audit-deps [package.json]] [--scan-hydration-risks [dir]] [--scan-cms-cohesion [dir] [--force]] [--verify-deploy <url> [--expected-status <status>]]",
    );
  }
}
