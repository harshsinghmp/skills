#!/usr/bin/env bun
/**
 * 🐙 gitignore-audit: Recursive .gitignore wildcard trap and index cache auditor.
 *
 * Audits .gitignore rules for:
 * 1. Negative wildcard parent directory traps (dir/ followed by !dir/file).
 * 2. Already tracked files in git index that match .gitignore rules (git ls-files -i --exclude-standard).
 * 3. Unanchored directory rules that cause unintended nested directory exclusion.
 * 4. Missing directory trailing slashes on common target names.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export interface GitignoreViolation {
  line: number;
  rule: string;
  type: "parent-directory-trap" | "unanchored-directory" | "missing-trailing-slash";
  severity: "error" | "warning";
  message: string;
  suggestedFix?: string;
}

export interface GitignoreAuditResult {
  filePath: string;
  violations: GitignoreViolation[];
  isValid: boolean;
}

export interface TrackedIgnoredResult {
  repoRoot: string;
  trackedFiles: string[];
  count: number;
}

const COMMON_DIRS_NEEDING_SLASH = new Set([
  "node_modules",
  "dist",
  "build",
  "vendor",
  ".venv",
  "coverage",
  "tmp",
  "temp",
]);

/**
 * Audit a single .gitignore string content.
 */
export function auditGitignoreContent(content: string, filePath = ".gitignore"): GitignoreAuditResult {
  const violations: GitignoreViolation[] = [];
  const lines = content.split("\n");

  interface ParsedRule {
    line: number;
    raw: string;
    isNegation: boolean;
    pattern: string;
  }

  const parsedRules: ParsedRule[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]?.trim() ?? "";
    if (!raw || raw.startsWith("#")) continue;

    const isNegation = raw.startsWith("!");
    const pattern = isNegation ? raw.slice(1).trim() : raw;

    parsedRules.push({
      line: i + 1,
      raw,
      isNegation,
      pattern,
    });
  }

  // 1. Check for negative pattern parent directory traps
  for (let i = 0; i < parsedRules.length; i++) {
    const current = parsedRules[i];
    if (!current.isNegation) continue;

    const negPath = current.pattern; // e.g. "logs/keep.log" or "/logs/keep.log"
    const cleanNeg = negPath.startsWith("/") ? negPath.slice(1) : negPath;
    const parts = cleanNeg.split("/");

    if (parts.length > 1) {
      const parentDir = parts[0]; // e.g. "logs"

      // Look for preceding non-negated directory rule matching parentDir
      for (let j = 0; j < i; j++) {
        const prev = parsedRules[j];
        if (prev.isNegation) continue;

        const prevPattern = prev.pattern;
        const cleanPrev = prevPattern.startsWith("/") ? prevPattern.slice(1) : prevPattern;

        // If previous rule excluded directory with trailing slash or plain name (not wildcard)
        if (cleanPrev === `${parentDir}/` || cleanPrev === parentDir || cleanPrev === `${parentDir}/**/`) {
          violations.push({
            line: current.line,
            rule: current.raw,
            type: "parent-directory-trap",
            severity: "error",
            message: `Negation '${current.raw}' is ineffective because parent directory '${prev.raw}' (line ${prev.line}) prunes traversal immediately. Git will never scan inside it.`,
            suggestedFix: `Change '${prev.raw}' on line ${prev.line} to '${prev.raw.endsWith("/") ? `${prev.raw}*` : `${prev.raw}/*`}'`,
          });
        }
      }
    }
  }

  // 2. Check for unanchored directory rules & missing trailing slashes
  for (const rule of parsedRules) {
    if (rule.isNegation) continue;

    // Missing trailing slash on standard directories
    if (COMMON_DIRS_NEEDING_SLASH.has(rule.pattern)) {
      violations.push({
        line: rule.line,
        rule: rule.raw,
        type: "missing-trailing-slash",
        severity: "warning",
        message: `Directory rule '${rule.raw}' lacks trailing slash and matches files named '${rule.raw}' as well as directories.`,
        suggestedFix: `${rule.raw}/`,
      });
    }

    // High-risk unanchored build/dist rules
    if ((rule.pattern === "build/" || rule.pattern === "dist/") && !rule.pattern.startsWith("/")) {
      violations.push({
        line: rule.line,
        rule: rule.raw,
        type: "unanchored-directory",
        severity: "warning",
        message: `Unanchored rule '${rule.raw}' recursively ignores all nested '${rule.raw}' folders in sub-packages or source code.`,
        suggestedFix: `/${rule.raw}`,
      });
    }
  }

  return {
    filePath,
    violations,
    isValid: violations.filter((v) => v.severity === "error").length === 0,
  };
}

/**
 * Automatically fix parent directory traps in .gitignore content.
 */
export function fixGitignoreContent(content: string): {
  fixed: boolean;
  content: string;
  fixedRules: string[];
} {
  const lines = content.split("\n");
  const audit = auditGitignoreContent(content);
  const fixedRules: string[] = [];

  const parentTraps = audit.violations.filter((v) => v.type === "parent-directory-trap");

  if (parentTraps.length === 0) {
    return { fixed: false, content, fixedRules: [] };
  }

  // Identify lines that need replacement
  for (const trap of parentTraps) {
    // Extract rule name from suggested fix message: "Change 'logs/' on line X to 'logs/*'"
    const match = trap.message.match(/parent directory '([^']+)' \(line (\d+)\)/);
    if (match) {
      const parentRule = match[1];
      const targetLineIdx = Number.parseInt(match[2], 10) - 1;

      if (lines[targetLineIdx] && lines[targetLineIdx].trim() === parentRule) {
        const replacement = parentRule.endsWith("/") ? `${parentRule}*` : `${parentRule}/*`;
        lines[targetLineIdx] = replacement;
        fixedRules.push(`${parentRule} -> ${replacement} (line ${targetLineIdx + 1})`);
      }
    }
  }

  return {
    fixed: fixedRules.length > 0,
    content: lines.join("\n"),
    fixedRules,
  };
}

/**
 * Check for tracked files that match .gitignore rules using git ls-files.
 */
export function auditTrackedIgnoredFiles(repoRoot: string): TrackedIgnoredResult {
  try {
    const res = spawnSync("git", ["ls-files", "-i", "--exclude-standard"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    if (res.status !== 0) {
      return { repoRoot, trackedFiles: [], count: 0 };
    }

    const trackedFiles = res.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return {
      repoRoot,
      trackedFiles,
      count: trackedFiles.length,
    };
  } catch {
    return { repoRoot, trackedFiles: [], count: 0 };
  }
}

/**
 * Remove cached tracked files from the git index without deleting working tree files.
 */
export function untrackCachedFiles(repoRoot: string, files?: string[]): { untracked: string[]; errors: string[] } {
  const targetFiles = files ?? auditTrackedIgnoredFiles(repoRoot).trackedFiles;
  const untracked: string[] = [];
  const errors: string[] = [];

  for (const file of targetFiles) {
    const res = spawnSync("git", ["rm", "--cached", file], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    if (res.status === 0) {
      untracked.push(file);
    } else {
      errors.push(`Failed to untrack ${file}: ${res.stderr.trim()}`);
    }
  }

  return { untracked, errors };
}

// CLI Execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--check-tracked")) {
    const idx = args.indexOf("--check-tracked");
    const targetDir = args[idx + 1] && !args[idx + 1].startsWith("-") ? path.resolve(args[idx + 1]) : process.cwd();
    const res = auditTrackedIgnoredFiles(targetDir);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🐙 Git Tracked-Ignored Cache Audit: ${targetDir}`);
      if (res.count === 0) {
        console.log("  ✅ No tracked files matching .gitignore found in git index.");
      } else {
        console.log(`  ⚠️ Found ${res.count} tracked file(s) matching .gitignore rules:`);
        for (const file of res.trackedFiles) {
          console.log(`    - ${file}`);
        }
        console.log("\n  💡 Run with '--untrack-cached' to remove them from index without deleting files.");
      }
    }
    process.exit(res.count === 0 ? 0 : 1);
  }

  if (args.includes("--untrack-cached")) {
    const idx = args.indexOf("--untrack-cached");
    const targetDir = args[idx + 1] && !args[idx + 1].startsWith("-") ? path.resolve(args[idx + 1]) : process.cwd();
    const res = untrackCachedFiles(targetDir);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🐙 Untracked ${res.untracked.length} file(s) from Git index:`);
      for (const f of res.untracked) {
        console.log(`  - ✅ ${f}`);
      }
      for (const e of res.errors) {
        console.log(`  - ❌ ${e}`);
      }
    }
    process.exit(res.errors.length === 0 ? 0 : 1);
  }

  if (args.includes("--fix")) {
    const idx = args.indexOf("--fix");
    const targetFile =
      args[idx + 1] && !args[idx + 1].startsWith("-")
        ? path.resolve(args[idx + 1])
        : path.resolve(process.cwd(), ".gitignore");

    if (!fs.existsSync(targetFile)) {
      console.error(`File not found: ${targetFile}`);
      process.exit(1);
    }

    const content = fs.readFileSync(targetFile, "utf8");
    const fixRes = fixGitignoreContent(content);

    if (fixRes.fixed) {
      fs.writeFileSync(targetFile, fixRes.content, "utf8");
    }

    if (isJson) {
      console.log(JSON.stringify(fixRes, null, 2));
    } else {
      console.log(`\n🐙 Gitignore Auto-Fixer: ${targetFile}`);
      if (!fixRes.fixed) {
        console.log("  ✅ No parent directory traps requiring auto-fix.");
      } else {
        console.log(`  ✅ Fixed ${fixRes.fixedRules.length} rule(s):`);
        for (const r of fixRes.fixedRules) {
          console.log(`    - ${r}`);
        }
      }
    }
    process.exit(0);
  }

  // Default: --audit or fallback
  const idx = args.indexOf("--audit");
  const targetFile =
    idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("-")
      ? path.resolve(args[idx + 1])
      : path.resolve(process.cwd(), ".gitignore");

  if (!fs.existsSync(targetFile)) {
    console.error(`File not found: ${targetFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(targetFile, "utf8");
  const res = auditGitignoreContent(content, targetFile);

  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(`\n🐙 Gitignore Rule Audit: ${targetFile}`);
    if (res.violations.length === 0) {
      console.log("  ✅ All .gitignore rules pass pattern depth and syntax checks.");
    } else {
      for (const v of res.violations) {
        const icon = v.severity === "error" ? "❌" : "⚠️";
        console.log(`  ${icon} [Line ${v.line}] ${v.type.toUpperCase()}: ${v.message}`);
        if (v.suggestedFix) {
          console.log(`     Suggested Fix: ${v.suggestedFix}`);
        }
      }
    }
  }

  process.exit(res.isValid ? 0 : 1);
}
