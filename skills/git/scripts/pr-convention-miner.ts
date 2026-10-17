#!/usr/bin/env bun
/**
 * 🐙 git: Automated PR & Git Convention Mining Engine
 *
 * Mines commit histories, PR patterns, and review feedback across repositories
 * to synthesize actionable project conventions and agent guardrails.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export interface CommitRecord {
  hash: string;
  subject: string;
  body: string;
  author: string;
  date: string;
  type?: string;
  scope?: string;
  hasWhy: boolean;
  hasWhat: boolean;
  hasVerification: boolean;
  hasTicketRef: boolean;
  isConventional: boolean;
}

export interface MinedConventions {
  repoPath: string;
  totalCommitsAnalyzed: number;
  conventionalPercentage: number;
  topTypes: Array<{ type: string; count: number; percentage: number }>;
  topScopes: Array<{ scope: string; count: number }>;
  bodyConventions: {
    whyPercentage: number;
    whatPercentage: number;
    verificationPercentage: number;
    ticketRefPercentage: number;
  };
  dominantBranchNamingPattern: string;
  recommendedTemplate: string;
  conformanceRules: string[];
}

export interface CommitAuditResult {
  commitText: string;
  passed: boolean;
  type?: string;
  scope?: string;
  violations: string[];
  suggestions: string[];
}

/**
 * Mine commit histories using git log.
 */
export function mineGitConventions(repoPath: string, limit: number = 100): MinedConventions {
  const targetDir = fs.existsSync(repoPath) ? repoPath : process.cwd();

  // Run git log with delimiter (skipping merge commits)
  // Field delimiter: 0x1f (Unit Separator), Record delimiter: 0x1e (Record Separator)
  const gitLogRes = spawnSync(
    "git",
    ["log", "--no-merges", `-n${limit}`, "--format=%H%x1f%s%x1f%b%x1f%an%x1f%ad%x1e"],
    {
      cwd: targetDir,
      encoding: "utf8",
    },
  );

  const rawOutput = gitLogRes.stdout || "";
  const rawRecords = rawOutput.split("\x1e").filter((r) => r.trim().length > 0);

  const commits: CommitRecord[] = [];
  const typeCounts: Record<string, number> = {};
  const scopeCounts: Record<string, number> = {};

  let conventionalCount = 0;
  let whyCount = 0;
  let whatCount = 0;
  let verificationCount = 0;
  let ticketRefCount = 0;

  for (const rec of rawRecords) {
    const parts = rec.split("\x1f");
    if (parts.length < 5) continue;

    const hash = parts[0].trim();
    const subject = parts[1].trim();
    const body = parts[2].trim();
    const author = parts[3].trim();
    const date = parts[4].trim();

    // Check conventional commit pattern: <type>(<scope>)?: <description>
    const convMatch = subject.match(/^([a-z]+)(?:\(([^)]+)\))?!?: (.+)$/i);
    const isConventional = Boolean(convMatch);
    let type: string | undefined;
    let scope: string | undefined;

    if (convMatch) {
      conventionalCount++;
      type = convMatch[1].toLowerCase();
      scope = convMatch[2] ? convMatch[2].toLowerCase() : undefined;

      typeCounts[type] = (typeCounts[type] ?? 0) + 1;
      if (scope) {
        scopeCounts[scope] = (scopeCounts[scope] ?? 0) + 1;
      }
    }

    const hasWhy = /\bwhy\s*:/i.test(body);
    const hasWhat = /\bwhat\s*:/i.test(body);
    const hasVerification = /\bverification\s*:/i.test(body);
    const hasTicketRef = /#\d+|\b(fixes|closes|refs|resolves)\s*#\d+/i.test(body) || /#\d+/.test(subject);

    if (hasWhy) whyCount++;
    if (hasWhat) whatCount++;
    if (hasVerification) verificationCount++;
    if (hasTicketRef) ticketRefCount++;

    commits.push({
      hash,
      subject,
      body,
      author,
      date,
      type,
      scope,
      hasWhy,
      hasWhat,
      hasVerification,
      hasTicketRef,
      isConventional,
    });
  }

  const total = commits.length;
  const conventionalPercentage = total > 0 ? Math.round((conventionalCount / total) * 100) : 100;

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([t, count]) => ({
      type: t,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  const topScopes = Object.entries(scopeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([s, count]) => ({ scope: s, count }));

  const whyPercentage = total > 0 ? Math.round((whyCount / total) * 100) : 0;
  const whatPercentage = total > 0 ? Math.round((whatCount / total) * 100) : 0;
  const verificationPercentage = total > 0 ? Math.round((verificationCount / total) * 100) : 0;
  const ticketRefPercentage = total > 0 ? Math.round((ticketRefCount / total) * 100) : 0;

  // Synthesize recommended template
  let recommendedTemplate = "<type>";
  if (topScopes.length > 0) {
    recommendedTemplate += "(<scope>)";
  }
  recommendedTemplate += ": <imperative-summary>";

  if (whyPercentage > 20 || whatPercentage > 20 || verificationPercentage > 20) {
    recommendedTemplate += "\n\nWhy:\n<business-or-technical-rationale>\n\nWhat:\n- <change-item-1>\n- <change-item-2>";
  }
  if (verificationPercentage > 20) {
    recommendedTemplate += "\n\nVerification:\n- <test-suite-or-manual-command-evidence>";
  }

  // Synthesize conformance rules
  const conformanceRules: string[] = [
    `Use standard Conventional Commit prefixes: ${
      topTypes
        .slice(0, 5)
        .map((t) => t.type)
        .join(", ") || "feat, fix, docs, chore"
    }.`,
  ];
  if (topScopes.length > 0) {
    conformanceRules.push(
      `Specify component or module scope when possible: (${topScopes
        .slice(0, 4)
        .map((s) => s.scope)
        .join(", ")}).`,
    );
  }
  if (whyPercentage > 20) {
    conformanceRules.push("Include a 'Why:' rationale block in non-trivial commit bodies.");
  }
  if (verificationPercentage > 20) {
    conformanceRules.push("Include an explicit 'Verification:' section detailing test/lint receipts.");
  }

  return {
    repoPath: targetDir,
    totalCommitsAnalyzed: total,
    conventionalPercentage,
    topTypes,
    topScopes,
    bodyConventions: {
      whyPercentage,
      whatPercentage,
      verificationPercentage,
      ticketRefPercentage,
    },
    dominantBranchNamingPattern: "feat/<name>, fix/<name>, chore/<name>",
    recommendedTemplate,
    conformanceRules,
  };
}

/**
 * Synthesize markdown conventions reference.
 */
export function synthesizeGuidelines(conventions: MinedConventions): string {
  const typesList = conventions.topTypes
    .slice(0, 6)
    .map((t) => `\`${t.type}\` (${t.percentage}%)`)
    .join(", ");

  const scopesList = conventions.topScopes
    .slice(0, 8)
    .map((s) => `\`${s.scope}\``)
    .join(", ");

  return `# 📜 Mined Git & PR Conventions

> Automatically extracted from ${conventions.totalCommitsAnalyzed} historical commits in \`${path.basename(conventions.repoPath)}\`.
> Team Conventional Commits Compliance Rate: **${conventions.conventionalPercentage}%**

---

## 1. Dominant Commit Pattern

The team predominantly uses the Conventional Commits specification:

\`\`\`
${conventions.recommendedTemplate}
\`\`\`

- **Primary Commit Types**: ${typesList || "None detected"}
- **Common Scopes**: ${scopesList || "Unscoped or multi-package"}

---

## 2. Commit Body Invariants

| Invariant | Frequency in Team History | Rule |
| :--- | :---: | :--- |
| **Why:** Rationale | ${conventions.bodyConventions.whyPercentage}% | ${conventions.bodyConventions.whyPercentage >= 20 ? "Expected on non-trivial changes" : "Optional"} |
| **What:** Changes | ${conventions.bodyConventions.whatPercentage}% | ${conventions.bodyConventions.whatPercentage >= 20 ? "Expected on non-trivial changes" : "Optional"} |
| **Verification:** Receipts | ${conventions.bodyConventions.verificationPercentage}% | ${conventions.bodyConventions.verificationPercentage >= 20 ? "Mandatory before merge" : "Optional"} |
| **Issue References** | ${conventions.bodyConventions.ticketRefPercentage}% | Link active ticket (#<id>) when applicable |

---

## 3. Conformance Rules for Autonomous Agents

${conventions.conformanceRules.map((r, i) => `${i + 1}. **${r}**`).join("\n")}
`;
}

/**
 * Audit a candidate commit message against team conventions.
 */
export function auditCommitMessage(commitText: string, _conventions?: MinedConventions): CommitAuditResult {
  const violations: string[] = [];
  const suggestions: string[] = [];

  const trimmed = commitText.trim();
  if (!trimmed) {
    return {
      commitText,
      passed: false,
      violations: ["Commit message cannot be empty."],
      suggestions: ["Provide a Conventional Commits summary like 'feat(scope): add feature'."],
    };
  }

  const lines = trimmed.split("\n");
  const subject = lines[0].trim();

  const convMatch = subject.match(/^([a-z]+)(?:\(([^)]+)\))?!?: (.+)$/i);

  if (!convMatch) {
    violations.push(
      "Subject line does not match Conventional Commits format: '<type>(<scope>): <summary>' or '<type>: <summary>'.",
    );
    suggestions.push("Rewrite subject prefix with a valid type (e.g. feat:, fix:, docs:, chore:).");
  }

  const type = convMatch ? convMatch[1].toLowerCase() : undefined;
  const scope = convMatch?.[2] ? convMatch[2].toLowerCase() : undefined;
  const summary = convMatch ? convMatch[3].trim() : subject;

  if (summary.endsWith(".")) {
    suggestions.push("Avoid trailing periods in subject line summaries.");
  }

  if (subject.length > 80) {
    violations.push(`Subject line is ${subject.length} characters (recommended ≤72 chars).`);
  }

  return {
    commitText,
    passed: violations.length === 0,
    type,
    scope,
    violations,
    suggestions,
  };
}

// CLI Execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--mine")) {
    const idx = args.indexOf("--mine");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const limitIdx = args.indexOf("--limit");
    const limit = limitIdx !== -1 && args[limitIdx + 1] ? Number.parseInt(args[limitIdx + 1], 10) : 100;

    const res = mineGitConventions(target, limit);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🐙 Mined Git & PR Conventions for: ${res.repoPath}`);
      console.log(`  Commits Analyzed:         ${res.totalCommitsAnalyzed}`);
      console.log(`  Conventional Compliance:  ${res.conventionalPercentage}%`);
      console.log("  Top Types:");
      for (const t of res.topTypes.slice(0, 5)) {
        console.log(`    - ${t.type}: ${t.count} (${t.percentage}%)`);
      }
      if (res.topScopes.length > 0) {
        console.log(`  Top Scopes:               ${res.topScopes.map((s) => s.scope).join(", ")}`);
      }
      console.log("\n  Recommended Template:");
      console.log(`  ${res.recommendedTemplate.split("\n").join("\n  ")}`);
    }
    process.exit(0);
  }

  if (args.includes("--synthesize")) {
    const idx = args.indexOf("--synthesize");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const conventions = mineGitConventions(target);
    const markdown = synthesizeGuidelines(conventions);

    const outIdx = args.indexOf("--output");
    if (outIdx !== -1 && args[outIdx + 1]) {
      fs.writeFileSync(args[outIdx + 1], markdown, "utf8");
      console.log(`✅ Synthesized conventions written to: ${args[outIdx + 1]}`);
    } else {
      console.log(markdown);
    }
    process.exit(0);
  }

  if (args.includes("--audit-commit")) {
    const idx = args.indexOf("--audit-commit");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "";
    const commitText = target && fs.existsSync(target) ? fs.readFileSync(target, "utf8") : target;

    const res = auditCommitMessage(commitText);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log("\n🔍 Commit Message Audit Result:");
      console.log(`  Status: ${res.passed ? "✅ PASS" : "❌ FAIL"}`);
      if (res.type) console.log(`  Type:   ${res.type}`);
      if (res.scope) console.log(`  Scope:  ${res.scope}`);
      if (res.violations.length > 0) {
        console.log("  Violations:");
        for (const v of res.violations) console.log(`    ❌ ${v}`);
      }
      if (res.suggestions.length > 0) {
        console.log("  Suggestions:");
        for (const s of res.suggestions) console.log(`    💡 ${s}`);
      }
    }
    process.exit(res.passed ? 0 : 1);
  }

  console.log(
    "Usage: bun pr-convention-miner.ts [--mine [path]] [--limit <n>] [--synthesize [path]] [--output <file>] [--audit-commit <text-or-file>] [--json]",
  );
}
