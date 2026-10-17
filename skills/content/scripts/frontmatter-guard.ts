#!/usr/bin/env bun
/**
 * ✍️ frontmatter-guard: Unquoted YAML frontmatter build crash linter and auto-fixer.
 *
 * Catches unquoted colons (: ), leading hashes, and illegal unescaped characters in frontmatter
 * that break Astro, Next.js Contentlayer, Docusaurus, and Gray-Matter builds.
 */

import fs from "node:fs";
import path from "node:path";

export interface FrontmatterIssue {
  line: number;
  field: string;
  rawValue: string;
  reason: string;
  suggestedValue: string;
}

export interface FrontmatterLintResult {
  filePath: string;
  hasFrontmatter: boolean;
  valid: boolean;
  issues: FrontmatterIssue[];
}

export function lintFrontmatter(content: string, filePath = "unknown"): FrontmatterLintResult {
  const issues: FrontmatterIssue[] = [];
  const lines = content.split("\n");

  if (lines[0]?.trim() !== "---") {
    return { filePath, hasFrontmatter: false, valid: true, issues: [] };
  }

  let fmEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      fmEndIndex = i;
      break;
    }
  }

  if (fmEndIndex === -1) {
    return {
      filePath,
      hasFrontmatter: true,
      valid: false,
      issues: [
        {
          line: 1,
          field: "frontmatter",
          rawValue: "---",
          reason: "Unclosed YAML frontmatter delimiter (missing closing '---')",
          suggestedValue: "---",
        },
      ],
    };
  }

  for (let i = 1; i < fmEndIndex; i++) {
    const rawLine = lines[i];
    const match = rawLine.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, field, val] = match;
    const value = val.trim();

    // Skip empty, booleans, numbers, lists, or already quoted strings
    if (
      !value ||
      value === "true" ||
      value === "false" ||
      !Number.isNaN(Number(value)) ||
      value.startsWith("[") ||
      value.startsWith("{") ||
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      continue;
    }

    // Unquoted colon followed by space (illegal mapping separator in YAML scalar)
    if (value.includes(": ")) {
      issues.push({
        line: i + 1,
        field,
        rawValue: value,
        reason: "Unquoted colon (': ') inside scalar value causes YAML mapping parser crash",
        suggestedValue: `"${value.replace(/"/g, '\\"')}"`,
      });
      continue;
    }

    // Unquoted leading hash symbol
    if (value.startsWith("#")) {
      issues.push({
        line: i + 1,
        field,
        rawValue: value,
        reason: "Unquoted leading '#' is parsed as a YAML comment",
        suggestedValue: `"${value.replace(/"/g, '\\"')}"`,
      });
      continue;
    }

    // Unquoted special punctuation (curly braces or brackets not forming a list)
    if ((value.includes("{") || value.includes("}")) && !(value.startsWith("{") && value.endsWith("}"))) {
      issues.push({
        line: i + 1,
        field,
        rawValue: value,
        reason: "Unquoted curly braces cause YAML syntax error",
        suggestedValue: `"${value.replace(/"/g, '\\"')}"`,
      });
    }
  }

  return {
    filePath,
    hasFrontmatter: true,
    valid: issues.length === 0,
    issues,
  };
}

export function fixFrontmatter(content: string): { fixed: boolean; content: string; fixedFields: string[] } {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") {
    return { fixed: false, content, fixedFields: [] };
  }

  let fmEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      fmEndIndex = i;
      break;
    }
  }

  if (fmEndIndex === -1) {
    return { fixed: false, content, fixedFields: [] };
  }

  const fixedFields: string[] = [];
  let modified = false;

  for (let i = 1; i < fmEndIndex; i++) {
    const rawLine = lines[i];
    const match = rawLine.match(/^([a-zA-Z0-9_-]+):(\s*)(.*)$/);
    if (!match) continue;

    const [, field, space, val] = match;
    const value = val.trim();

    // Skip empty, booleans, numbers, lists, or already quoted strings
    if (
      !value ||
      value === "true" ||
      value === "false" ||
      !Number.isNaN(Number(value)) ||
      value.startsWith("[") ||
      value.startsWith("{") ||
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      continue;
    }

    // Check if quotes are required
    const needsQuotes =
      value.includes(": ") ||
      value.startsWith("#") ||
      ((value.includes("{") || value.includes("}")) && !(value.startsWith("{") && value.endsWith("}")));

    if (needsQuotes) {
      const escaped = value.replace(/"/g, '\\"');
      lines[i] = `${field}:${space || " "}"${escaped}"`;
      fixedFields.push(field);
      modified = true;
    }
  }

  return {
    fixed: modified,
    content: modified ? lines.join("\n") : content,
    fixedFields,
  };
}

export function auditFrontmatterPath(targetPath: string): {
  filesScanned: number;
  totalIssues: number;
  results: FrontmatterLintResult[];
} {
  const results: FrontmatterLintResult[] = [];
  let filesScanned = 0;

  function scan(p: string) {
    if (!fs.existsSync(p)) return;
    try {
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        const entries = fs.readdirSync(p);
        for (const e of entries) {
          if (e === "node_modules" || e === ".git" || e === "dist") continue;
          scan(path.join(p, e));
        }
      } else {
        const ext = path.extname(p).toLowerCase();
        if (ext === ".md" || ext === ".mdx") {
          filesScanned++;
          const content = fs.readFileSync(p, "utf8");
          const lint = lintFrontmatter(content, p);
          if (!lint.valid) {
            results.push(lint);
          }
        }
      }
    } catch {}
  }

  scan(targetPath);
  const totalIssues = results.reduce((acc, r) => acc + r.issues.length, 0);
  return { filesScanned, totalIssues, results };
}

export function fixFrontmatterPath(targetPath: string): {
  filesScanned: number;
  filesFixed: number;
  fixedFiles: string[];
} {
  const fixedFiles: string[] = [];
  let filesScanned = 0;

  function fix(p: string) {
    if (!fs.existsSync(p)) return;
    try {
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        const entries = fs.readdirSync(p);
        for (const e of entries) {
          if (e === "node_modules" || e === ".git" || e === "dist") continue;
          fix(path.join(p, e));
        }
      } else {
        const ext = path.extname(p).toLowerCase();
        if (ext === ".md" || ext === ".mdx") {
          filesScanned++;
          const content = fs.readFileSync(p, "utf8");
          const res = fixFrontmatter(content);
          if (res.fixed) {
            fs.writeFileSync(p, res.content, "utf8");
            fixedFiles.push(p);
          }
        }
      }
    } catch {}
  }

  fix(targetPath);
  return { filesScanned, filesFixed: fixedFiles.length, fixedFiles };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--fix")) {
    const idx = args.indexOf("--fix");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = fixFrontmatterPath(target);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n✍️ Frontmatter Guard Fixer: ${target}`);
      console.log(`  Files Scanned: ${res.filesScanned}`);
      console.log(`  Files Fixed:   ${res.filesFixed}`);
      for (const f of res.fixedFiles) {
        console.log(`    - ✅ Fixed unquoted scalars in ${f}`);
      }
    }
  } else if (args.includes("--lint")) {
    const idx = args.indexOf("--lint");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = auditFrontmatterPath(target);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n✍️ Frontmatter Guard Linter: ${target}`);
      console.log(`  Files Scanned: ${res.filesScanned}`);
      console.log(`  Total Issues:  ${res.totalIssues}`);
      for (const r of res.results) {
        console.log(`  ❌ ${r.filePath}:`);
        for (const iss of r.issues) {
          console.log(`     - [Line ${iss.line}] ${iss.field}: ${iss.reason}`);
          console.log(`       Fix: ${iss.suggestedValue}`);
        }
      }
    }
    process.exit(res.totalIssues === 0 ? 0 : 1);
  } else {
    console.log("Usage: bun frontmatter-guard.ts [--lint [path]] [--fix [path]] [--json]");
  }
}
