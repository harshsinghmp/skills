#!/usr/bin/env bun
/**
 * 🐧 code-review: Senior Agency & Security Auditor CLI Engine.
 *
 * Implements automated gates for:
 * 1. Antivirus / EDR false-positive heuristic triggers (LotL, Base64 blobs, /tmp script execution).
 * 2. Modern runtime pitfalls (weak crypto, floating point currency math, ReDoS regexes).
 * 3. Conventional Comments standardization (blocker, security, nitpick, question).
 * 4. Lockfile supply chain and registry integrity.
 */

import fs from "node:fs";
import path from "node:path";

export interface CodeReviewFinding {
  file: string;
  line: number;
  type: string;
  severity: "error" | "warning";
  message: string;
  snippet?: string;
}

export interface EdrSafetyReport {
  scannedFiles: number;
  violations: CodeReviewFinding[];
  passed: boolean;
}

export interface RuntimePitfallsReport {
  scannedFiles: number;
  violations: CodeReviewFinding[];
  passed: boolean;
}

export interface ConventionalCommentsReport {
  totalComments: number;
  compliantComments: number;
  complianceRate: number;
  nonCompliant: string[];
  passed: boolean;
}

export interface LockfileAuditReport {
  lockfile: string;
  totalDependencies: number;
  suspiciousRegistries: string[];
  passed: boolean;
}

export interface EdgeSsrPitfallsReport {
  scannedFiles: number;
  violations: CodeReviewFinding[];
  passed: boolean;
}

export interface LifecycleScriptsReport {
  packageJson: string;
  lifecycleHooksFound: string[];
  violations: CodeReviewFinding[];
  passed: boolean;
}

export interface AllAuditsReport {
  targetPath: string;
  edr: EdrSafetyReport;
  runtimePitfalls: RuntimePitfallsReport;
  edgeSsr: EdgeSsrPitfallsReport;
  lifecycleScripts: LifecycleScriptsReport;
  lockfile: LockfileAuditReport;
  passed: boolean;
  totalViolations: number;
}

const DEFAULT_IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".venv",
  ".venv-report",
  "venv",
  "env",
  ".cache",
  ".turbo",
  ".next",
  ".astro",
  ".crush",
  ".opencode",
  "archive",
  "artifacts",
  "reports",
]);

/**
 * Scan directory recursively for matching file extensions.
 */
function walkDir(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  try {
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
      return extensions.includes(path.extname(dir).toLowerCase()) ? [dir] : [];
    }

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (DEFAULT_IGNORED_DIRS.has(entry) || entry.startsWith(".venv")) {
        continue;
      }
      const fullPath = path.join(dir, entry);
      const st = fs.statSync(fullPath);
      if (st.isDirectory()) {
        results.push(...walkDir(fullPath, extensions));
      } else if (extensions.includes(path.extname(entry).toLowerCase())) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore directory traversal read/permission errors
  }

  return results;
}

/**
 * Audit code for Antivirus and EDR heuristic triggers.
 */
export function auditEdrSafety(targetPath: string): EdrSafetyReport {
  const violations: CodeReviewFinding[] = [];
  const files = walkDir(targetPath, [".ts", ".js", ".mjs", ".sh", ".py", ".bat"]);

  for (const file of files) {
    // Skip test files from runtime EDR dropper heuristics
    if (file.includes(".test.") || file.includes(".spec.") || file.includes("/tests/")) {
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;

      // Ignore pure comment lines
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("#")) {
        continue;
      }

      // 1. Dynamic evaluation (LotL injection signature)
      if (/\beval\s*\(/.test(line) || /new\s+Function\s*\(/.test(line)) {
        violations.push({
          file,
          line: lineNum,
          type: "dynamic-code-eval",
          severity: "error",
          message:
            "Dynamic code execution (eval / new Function) trips EDR Living-off-the-Land memory injection heuristics.",
          snippet: line.trim(),
        });
      }

      // 2. Large inline Base64 literals (>512 chars)
      const b64Match = line.match(/['"][A-Za-z0-9+/=]{512,}['"]/);
      if (b64Match) {
        violations.push({
          file,
          line: lineNum,
          type: "inline-base64-payload",
          severity: "warning",
          message:
            "Inline Base64 string (>512 chars) mimics packed malware/dropper payloads and triggers antivirus heuristic flags.",
          snippet: `${line.trim().slice(0, 60)}...`,
        });
      }

      // 3. Dropping and executing scripts in temporary directories
      if (/(\/tmp|os\.tmpdir\(\)|AppData[\\/]Local[\\/]Temp).*?\.(sh|bat|ps1|exe)/i.test(line)) {
        violations.push({
          file,
          line: lineNum,
          type: "tmp-script-drop",
          severity: "error",
          message:
            "Writing or executing scripts inside temporary directories matches dropper trojan behavioral signatures.",
          snippet: line.trim(),
        });
      }

      // 4. Interactive or encoded shell invocation
      if (/spawn(Sync)?\s*\(\s*['"](powershell|bash|sh|cmd)['"]\s*,\s*\[.*?-(i|enc|EncodedCommand)/i.test(line)) {
        violations.push({
          file,
          line: lineNum,
          type: "interactive-shell-spawn",
          severity: "error",
          message:
            "Spawning interactive or encoded shell processes trips automated process-tree behavioral EDR alarms.",
          snippet: line.trim(),
        });
      }
    }
  }

  return {
    scannedFiles: files.length,
    violations,
    passed: violations.filter((v) => v.severity === "error").length === 0,
  };
}

/**
 * Audit code for modern runtime pitfalls (weak crypto, float financial math, ReDoS).
 */
export function auditRuntimePitfalls(targetPath: string): RuntimePitfallsReport {
  const violations: CodeReviewFinding[] = [];
  const files = walkDir(targetPath, [".ts", ".js", ".mjs"]);

  for (const file of files) {
    // Skip test files from runtime pitfalls heuristics
    if (file.includes(".test.") || file.includes(".spec.") || file.includes("/tests/")) {
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    const isSecuritySensitiveFile = /token|auth|secret|session|crypto|billing|payment|invoice/i.test(file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;

      // Ignore pure comment lines or scanner definition literals
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith('"') ||
        trimmed.startsWith("'") ||
        trimmed.startsWith("`") ||
        trimmed.includes("message:") ||
        trimmed.includes('"message":') ||
        trimmed.includes('type: "weak-pseudo-random"') ||
        trimmed.includes('type: "potential-redos-regex"')
      ) {
        continue;
      }

      // 1. Math.random() in sensitive files or token contexts (must not be inside string quote)
      if (
        /(?:^|[^"'\w$])Math\.random\s*\(\s*\)/.test(line) &&
        (isSecuritySensitiveFile || /token|secret|key|id|session|nonce/i.test(line))
      ) {
        violations.push({
          file,
          line: lineNum,
          type: "weak-pseudo-random",
          severity: "error",
          message:
            "Math.random() is cryptographically insecure for tokens/IDs; use crypto.randomBytes() or crypto.getRandomValues().",
          snippet: line.trim(),
        });
      }

      // 2. Floating point operations on currency fields
      if (/(price|amount|balance|cost|fee)\s*[+\-*/]\s*(0\.\d+|\d+\.\d+)/i.test(line)) {
        violations.push({
          file,
          line: lineNum,
          type: "float-currency-math",
          severity: "warning",
          message:
            "Floating point math on financial fields causes IEEE 754 precision corruption; use integer minor units or decimal libraries.",
          snippet: line.trim(),
        });
      }

      // 3. Obvious ReDoS nested quantifiers: (a+)+ or (x*)*
      if (/\([^)]*[+*]\)[+*]/.test(line) && !line.includes("RegExp")) {
        violations.push({
          file,
          line: lineNum,
          type: "potential-redos-regex",
          severity: "warning",
          message:
            "Nested quantifier in regular expression detected; potential catastrophic polynomial/exponential backtracking (ReDoS).",
          snippet: line.trim(),
        });
      }
    }
  }

  return {
    scannedFiles: files.length,
    violations,
    passed: violations.filter((v) => v.severity === "error").length === 0,
  };
}

/**
 * Audit text or markdown for Conventional Comments compliance.
 */
export function auditConventionalComments(content: string): ConventionalCommentsReport {
  const lines = content.split("\n");
  const commentPrefixes = /^\s*[-*]?\s*\*{0,2}(blocker|security|nitpick|question|chore|suggestion|thought|issue):/i;

  const candidateCommentLines: string[] = [];
  const compliantComments: string[] = [];
  const nonCompliant: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```")) continue;

    // Detect actionable review comment lines (starting with a bullet or strong indicator)
    if (/^[-*]\s+/.test(trimmed) || /^(please|can you|should we|fix|change|remove|update|consider)\b/i.test(trimmed)) {
      candidateCommentLines.push(trimmed);
      if (commentPrefixes.test(trimmed)) {
        compliantComments.push(trimmed);
      } else {
        nonCompliant.push(trimmed);
      }
    }
  }

  const total = candidateCommentLines.length;
  const compliantCount = compliantComments.length;
  const rate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

  return {
    totalComments: total,
    compliantComments: compliantCount,
    complianceRate: rate,
    nonCompliant,
    passed: total === 0 || rate >= 80,
  };
}

/**
 * Audit lockfiles for untrusted or insecure package registry endpoints.
 */
export function auditLockfile(lockfilePath: string): LockfileAuditReport {
  const suspiciousRegistries: string[] = [];
  let totalDependencies = 0;

  if (!fs.existsSync(lockfilePath)) {
    return { lockfile: lockfilePath, totalDependencies: 0, suspiciousRegistries: [], passed: true };
  }

  try {
    const content = fs.readFileSync(lockfilePath, "utf8");
    const resolvedUrls = content.match(/https?:\/\/[^\s"')]+/g) ?? [];
    totalDependencies = resolvedUrls.length;

    const trustedDomains = [
      "registry.npmjs.org",
      "registry.yarnpkg.com",
      "npm.pkg.github.com",
      "github.com",
      "gitlab.com",
      "bitbucket.org",
    ];

    for (const urlStr of resolvedUrls) {
      if (urlStr.startsWith("http://")) {
        suspiciousRegistries.push(`Insecure HTTP registry endpoint: ${urlStr}`);
        continue;
      }

      try {
        const parsed = new URL(urlStr);
        const host = parsed.hostname.toLowerCase();
        const isTrusted = trustedDomains.some((d) => host === d || host.endsWith(`.${d}`));
        if (!isTrusted) {
          suspiciousRegistries.push(`Untrusted third-party registry host: ${urlStr}`);
        }
      } catch {
        // Ignore unparseable registry URL format
      }
    }
  } catch {
    // Ignore lockfile read/parse errors
  }

  return {
    lockfile: lockfilePath,
    totalDependencies: totalDependencies,
    suspiciousRegistries,
    passed: suspiciousRegistries.length === 0,
  };
}

/**
 * Audit code for Edge runtime and SSR boundary pitfalls.
 */
export function auditEdgeSsrPitfalls(targetPath: string): EdgeSsrPitfallsReport {
  const violations: CodeReviewFinding[] = [];
  const files = walkDir(targetPath, [".ts", ".tsx", ".js", ".jsx", ".mjs"]);

  const unsupportedEdgeModules = new Set([
    "fs",
    "node:fs",
    "child_process",
    "node:child_process",
    "net",
    "node:net",
    "tls",
    "node:tls",
    "dns",
    "node:dns",
    "dgram",
    "node:dgram",
    "cluster",
    "node:cluster",
    "v8",
    "node:v8",
    "vm",
    "node:vm",
  ]);

  for (const file of files) {
    if (file.includes(".test.") || file.includes(".spec.") || file.includes("/tests/")) {
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    const isClientFile = /['"]use client['"]/.test(content);
    const isEdgeFile =
      /export\s+const\s+runtime\s*=\s*['"]edge['"]/.test(content) ||
      /runtime:\s*['"]edge['"]/.test(content) ||
      /\/edge\//i.test(file) ||
      /\/workers?\//i.test(file) ||
      /(^|[/\\])(worker|middleware)\.[jt]sx?$/i.test(file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;

      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("#")) {
        continue;
      }

      // 1. Edge runtime unsupported Node built-in imports
      if (isEdgeFile) {
        const importMatch = line.match(/(?:import\s+.*?from\s+['"]|require\s*\(\s*['"])(node:[a-z_]+|[a-z_]+)['"]/);
        if (importMatch && unsupportedEdgeModules.has(importMatch[1])) {
          violations.push({
            file,
            line: lineNum,
            type: "edge-unsupported-node-builtin",
            severity: "error",
            message: `Node.js built-in module '${importMatch[1]}' is not supported in the Edge Runtime (Cloudflare Workers / Vercel Edge).`,
            snippet: line.trim(),
          });
        }
      }

      // 2. SSR browser global leakage (window, document, localStorage, sessionStorage, navigator)
      if (!isClientFile) {
        const browserGlobalMatch = line.match(/\b(window|document|localStorage|sessionStorage|navigator)\./);
        if (browserGlobalMatch) {
          const matchedGlobal = browserGlobalMatch[1];
          const hasGuardOnLine =
            /typeof\s+(window|document)\s*!==\s*['"]undefined['"]/.test(line) || /typeof\s+globalThis\b/.test(line);
          const prevLine = i > 0 ? lines[i - 1].trim() : "";
          const hasGuardOnPrevLine = /if\s*\(\s*typeof\s+(window|document)\s*!==\s*['"]undefined['"]\s*\)/.test(
            prevLine,
          );

          if (!hasGuardOnLine && !hasGuardOnPrevLine) {
            violations.push({
              file,
              line: lineNum,
              type: "ssr-window-leakage",
              severity: "warning",
              message: `Direct access to browser global '${matchedGlobal}' without typeof window !== 'undefined' guard will crash during Server-Side Rendering (SSR).`,
              snippet: line.trim(),
            });
          }
        }
      }

      // 3. Raw unescaped HTML injection
      if (
        /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:/.test(line) ||
        /\.innerHTML\s*=/.test(line) ||
        /v-html\s*=/.test(line)
      ) {
        if (!line.includes("DOMPurify") && !line.includes("sanitize")) {
          violations.push({
            file,
            line: lineNum,
            type: "raw-html-injection",
            severity: "warning",
            message:
              "Unescaped HTML injection via dangerouslySetInnerHTML / innerHTML introduces Cross-Site Scripting (XSS) risks unless sanitized with DOMPurify.",
            snippet: line.trim(),
          });
        }
      }
    }
  }

  return {
    scannedFiles: files.length,
    violations,
    passed: violations.filter((v) => v.severity === "error").length === 0,
  };
}

/**
 * Audit package.json lifecycle scripts for dropper / malicious command execution.
 */
export function auditLifecycleScripts(targetPath: string): LifecycleScriptsReport {
  let pkgPath = targetPath;
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    pkgPath = path.join(targetPath, "package.json");
  }

  const violations: CodeReviewFinding[] = [];
  const hooksFound: string[] = [];

  if (!fs.existsSync(pkgPath)) {
    return {
      packageJson: pkgPath,
      lifecycleHooksFound: [],
      violations: [],
      passed: true,
    };
  }

  try {
    const raw = fs.readFileSync(pkgPath, "utf8");
    const json = JSON.parse(raw) as { scripts?: Record<string, string> };
    const scripts = json.scripts ?? {};

    const riskyHooks = new Set(["preinstall", "install", "postinstall", "prepublish", "prepublishOnly", "prepare"]);

    for (const [hook, cmd] of Object.entries(scripts)) {
      if (!riskyHooks.has(hook)) continue;
      hooksFound.push(hook);

      const isSuspicious =
        /\b(curl|wget)\b/i.test(cmd) ||
        /\|\s*(ba)?sh\b/i.test(cmd) ||
        /\|\s*powershell\b/i.test(cmd) ||
        /\bbash\s+-c\b/i.test(cmd) ||
        /\bsh\s+-c\b/i.test(cmd) ||
        /\beval\b/i.test(cmd) ||
        /\bpowershell\b.*?-(enc|EncodedCommand)/i.test(cmd) ||
        /\bcertutil\b/i.test(cmd);

      if (isSuspicious) {
        violations.push({
          file: pkgPath,
          line: 1,
          type: "suspicious-lifecycle-script",
          severity: "error",
          message: `Lifecycle hook '${hook}' executes shell dropper command (${cmd}); high-risk supply-chain attack vector.`,
          snippet: `"${hook}": "${cmd}"`,
        });
      }
    }
  } catch {
    // Ignore JSON parsing or read errors
  }

  return {
    packageJson: pkgPath,
    lifecycleHooksFound: hooksFound,
    violations,
    passed: violations.filter((v) => v.severity === "error").length === 0,
  };
}

/**
 * Run consolidated audit across all dimensions.
 */
export function auditAll(targetPath: string): AllAuditsReport {
  const edr = auditEdrSafety(targetPath);
  const runtimePitfalls = auditRuntimePitfalls(targetPath);
  const edgeSsr = auditEdgeSsrPitfalls(targetPath);
  const lifecycleScripts = auditLifecycleScripts(targetPath);
  const lockfilePath = fs.existsSync(path.join(targetPath, "package-lock.json"))
    ? path.join(targetPath, "package-lock.json")
    : path.join(targetPath, "package.json");
  const lockfile = auditLockfile(lockfilePath);

  const totalViolations =
    edr.violations.length +
    runtimePitfalls.violations.length +
    edgeSsr.violations.length +
    lifecycleScripts.violations.length +
    lockfile.suspiciousRegistries.length;

  const passed = edr.passed && runtimePitfalls.passed && edgeSsr.passed && lifecycleScripts.passed && lockfile.passed;

  return {
    targetPath,
    edr,
    runtimePitfalls,
    edgeSsr,
    lifecycleScripts,
    lockfile,
    passed,
    totalViolations,
  };
}

// CLI Execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--audit-edr-safety")) {
    const idx = args.indexOf("--audit-edr-safety");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = auditEdrSafety(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🛡️ Antivirus & EDR Heuristic Safety Audit: ${target}`);
      console.log(`  Scanned Files: ${res.scannedFiles}`);
      if (res.violations.length === 0) {
        console.log("  ✅ Zero EDR/Antivirus heuristic triggers detected.");
      } else {
        for (const v of res.violations) {
          const icon = v.severity === "error" ? "❌" : "⚠️";
          console.log(`  ${icon} [${v.type}] ${v.file}:${v.line} — ${v.message}`);
          if (v.snippet) console.log(`     Snippet: ${v.snippet}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-runtime-pitfalls")) {
    const idx = args.indexOf("--audit-runtime-pitfalls");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = auditRuntimePitfalls(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🐛 Runtime Pitfalls & Bug Detection Audit: ${target}`);
      console.log(`  Scanned Files: ${res.scannedFiles}`);
      if (res.violations.length === 0) {
        console.log("  ✅ Zero runtime pitfalls detected.");
      } else {
        for (const v of res.violations) {
          const icon = v.severity === "error" ? "❌" : "⚠️";
          console.log(`  ${icon} [${v.type}] ${v.file}:${v.line} — ${v.message}`);
          if (v.snippet) console.log(`     Snippet: ${v.snippet}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-edge-ssr")) {
    const idx = args.indexOf("--audit-edge-ssr");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = auditEdgeSsrPitfalls(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🌐 Edge Runtime & SSR Pitfalls Audit: ${target}`);
      console.log(`  Scanned Files: ${res.scannedFiles}`);
      if (res.violations.length === 0) {
        console.log("  ✅ Zero Edge/SSR runtime pitfalls detected.");
      } else {
        for (const v of res.violations) {
          const icon = v.severity === "error" ? "❌" : "⚠️";
          console.log(`  ${icon} [${v.type}] ${v.file}:${v.line} — ${v.message}`);
          if (v.snippet) console.log(`     Snippet: ${v.snippet}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-lifecycle-scripts")) {
    const idx = args.indexOf("--audit-lifecycle-scripts");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "package.json";
    const res = auditLifecycleScripts(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📦 Package Lifecycle Scripts Audit: ${res.packageJson}`);
      console.log(`  Hooks Inspected: ${res.lifecycleHooksFound.join(", ") || "none"}`);
      if (res.violations.length === 0) {
        console.log("  ✅ Zero suspicious dropper lifecycle scripts detected.");
      } else {
        for (const v of res.violations) {
          console.log(`  ❌ [${v.type}] ${v.message}`);
          if (v.snippet) console.log(`     Snippet: ${v.snippet}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-conventional-comments")) {
    const idx = args.indexOf("--audit-conventional-comments");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "";
    const content = target && fs.existsSync(target) ? fs.readFileSync(target, "utf8") : target;
    const res = auditConventionalComments(content);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log("\n💬 Conventional Comments Compliance Audit:");
      console.log(`  Total Comments:      ${res.totalComments}`);
      console.log(`  Compliant Comments:  ${res.compliantComments}`);
      console.log(`  Compliance Rate:     ${res.complianceRate}%`);
      if (res.nonCompliant.length > 0) {
        console.log("  ⚠️ Non-compliant comments lacking prefix (blocker:, security:, nitpick:, question:):");
        for (const nc of res.nonCompliant) {
          console.log(`    - ${nc}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-lockfile")) {
    const idx = args.indexOf("--audit-lockfile");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "package-lock.json";
    const res = auditLockfile(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔒 Lockfile Registry & Supply Chain Audit: ${target}`);
      console.log(`  Resolved Dependencies: ${res.totalDependencies}`);
      if (res.suspiciousRegistries.length === 0) {
        console.log("  ✅ All package registries are verified HTTPS official mirrors.");
      } else {
        console.log(`  ❌ Found ${res.suspiciousRegistries.length} untrusted or unencrypted registry endpoints:`);
        for (const r of res.suspiciousRegistries) {
          console.log(`    - ${r}`);
        }
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  if (args.includes("--audit-all")) {
    const idx = args.indexOf("--audit-all");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = auditAll(target);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔍 Consolidated Senior Auditor Suite: ${target}`);
      console.log(`  EDR Safety:         ${res.edr.passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  Runtime Pitfalls:   ${res.runtimePitfalls.passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  Edge/SSR Pitfalls:  ${res.edgeSsr.passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  Lifecycle Scripts:  ${res.lifecycleScripts.passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  Lockfile Audit:     ${res.lockfile.passed ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  Total Violations:   ${res.totalViolations}`);
    }
    process.exit(res.passed ? 0 : 1);
  }

  console.log(
    "Usage: bun code-review.ts [--audit-edr-safety [path]] [--audit-runtime-pitfalls [path]] [--audit-edge-ssr [path]] [--audit-lifecycle-scripts [path]] [--audit-conventional-comments <file>] [--audit-lockfile [path]] [--audit-all [path]] [--json]",
  );
}
