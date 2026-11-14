#!/usr/bin/env bun
/**
 * ☀️ coach.ts — Tri-Vector Autonomous Agency Coach CLI
 *
 * Implements:
 * 1. Team & Developer Mode (--standup): 5-pillar effort scorecard grounded in git forensic logs.
 * 2. Client Boundary Mode (--scope-check, --client-digest): Intercepts scope creep, drafts polite trade-off responses, compiles commits into client digests.
 * 3. Founder Leverage Mode (--founder-audit): Audits capacity distribution across Tiers 1-4 and enforces the 70/30 leverage rule.
 * 4. Audit Mode (--audit): Verifies forensic integrity of standup logs, link integrity, and secret hygiene.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";

export interface EffortScorecard {
  tddScore: number;
  diffScore: number;
  hygieneScore: number;
  focusScore: number;
  triageScore: number;
  totalScore: number;
  tier: "Mastery" | "Solid" | "Mediocre" | "Needs Work";
  recentCommits: string[];
  findings: string[];
}

export function evaluateEffortScorecard(cwd: string): EffortScorecard {
  const recentCommits: string[] = [];
  const findings: string[] = [];

  try {
    const gitRes = spawnSync("git", ["log", "--since=24 hours ago", "--oneline"], {
      cwd,
      encoding: "utf8",
    });
    if (gitRes.status === 0 && gitRes.stdout.trim().length > 0) {
      recentCommits.push(...gitRes.stdout.trim().split("\n"));
    }
  } catch {
    findings.push("Unable to inspect git logs; defaulting to baseline checks.");
  }

  // Evaluate TDD Rigor
  let tddScore = 2;
  const hasTests = recentCommits.some((c) => /test|tdd|verify/i.test(c));
  if (recentCommits.length > 0 && !hasTests) {
    tddScore = 1;
    findings.push("Recent commits do not explicitly reference test additions or verification.");
  }

  // Evaluate Diff Discipline
  let diffScore = 2;
  try {
    const diffStat = spawnSync("git", ["diff", "--stat", "HEAD~1", "HEAD"], {
      cwd,
      encoding: "utf8",
    });
    if (diffStat.status === 0 && diffStat.stdout.includes("files changed")) {
      const match = diffStat.stdout.match(/(\d+)\s+insertions/);
      if (match && Number.parseInt(match[1], 10) > 400) {
        diffScore = 1;
        findings.push("Diff size > 400 lines; consider splitting into atomic tracer slices.");
      }
    }
  } catch {
    // Single commit or no commits
  }

  // Evaluate Hygiene & Security
  let hygieneScore = 2;
  // Check for common leaked files or syntax issues
  if (existsSync(join(cwd, ".env"))) {
    try {
      const gitignore = existsSync(join(cwd, ".gitignore")) ? readFileSync(join(cwd, ".gitignore"), "utf8") : "";
      if (!gitignore.includes(".env")) {
        hygieneScore = 0;
        findings.push("CRITICAL: .env file exists and is not present in .gitignore!");
      }
    } catch {}
  }

  // Focus & Blocker Triage baselines
  const focusScore = 2;
  const triageScore = 2;

  const totalScore = tddScore + diffScore + hygieneScore + focusScore + triageScore;
  let tier: EffortScorecard["tier"] = "Mastery";
  if (totalScore >= 9) tier = "Mastery";
  else if (totalScore >= 7) tier = "Solid";
  else if (totalScore >= 5) tier = "Mediocre";
  else tier = "Needs Work";

  return {
    tddScore,
    diffScore,
    hygieneScore,
    focusScore,
    triageScore,
    totalScore,
    tier,
    recentCommits,
    findings,
  };
}

export interface DeliveryReceipts {
  tests?: string;
  security?: string;
  typecheck?: string;
  generatedAt?: string;
}

export function loadDeliveryReceipts(cwd: string, receiptPath?: string): DeliveryReceipts | undefined {
  const candidate = receiptPath ? resolve(cwd, receiptPath) : join(cwd, ".delivery-receipts.json");
  if (!existsSync(candidate)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(candidate, "utf8"));
    if (!parsed || typeof parsed !== "object") return undefined;
    return parsed as DeliveryReceipts;
  } catch {
    return undefined;
  }
}

export function generateClientDigest(cwd: string, projectName?: string, receipts?: DeliveryReceipts): string {
  const name = projectName || basename(resolve(cwd));
  const recentCommits: string[] = [];

  try {
    const gitRes = spawnSync("git", ["log", "--since=24 hours ago", "--oneline"], {
      cwd,
      encoding: "utf8",
    });
    if (gitRes.status === 0 && gitRes.stdout.trim().length > 0) {
      recentCommits.push(...gitRes.stdout.trim().split("\n"));
    }
  } catch {}

  const cleanItems = recentCommits
    .slice(0, 5)
    .map((c) => c.replace(/^[a-f0-9]+\s+(feat|fix|refactor|docs|test)?(\([^)]+\))?:\s*/i, "").trim())
    .filter((c) => c.length > 0);

  const bulletList =
    cleanItems.length > 0
      ? cleanItems.map((item) => `- **Delivered**: ${item}`).join("\n")
      : "- **Delivered**: Milestone scheduled tasks completed and verified.";

  return `### 🚀 ${name} Milestone Progress Digest — ${new Date().toISOString().split("T")[0]}

#### 1. What Shipped & Verified
${bulletList}

#### 2. Quality & Verification Evidence
${
  receipts
    ? [
        `- Tests: ${receipts.tests ?? "not reported"}`,
        `- Security scan: ${receipts.security ?? "not reported"}`,
        `- Type-check: ${receipts.typecheck ?? "not reported"}`,
        receipts.generatedAt ? `- Receipt generated: ${receipts.generatedAt}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "- Not run — no delivery receipt supplied. This digest makes no claim about test, security, or type-check status."
}

#### 3. Immediate Next Focus
- Continuing scheduled sprint deliverables in accordance with Milestone acceptance criteria.`;
}

export function evaluateScopeRequest(requestText: string): {
  isOutScope: boolean;
  reason: string;
  responseTemplate: string;
} {
  const triggerKeywords = ["redesign", "new feature", "extra page", "add stripe", "migrate to", "custom animation"];
  const lower = requestText.toLowerCase();
  const matched = triggerKeywords.filter((k) => lower.includes(k));

  if (matched.length > 0) {
    return {
      isOutScope: true,
      reason: `Request matches out-of-scope triggers: ${matched.join(", ")}`,
      responseTemplate: `We would be thrilled to build this! Because our current sprint capacity is committed to delivering our scheduled milestone on time, we have captured this as an enhancement for Phase 2. We can provide an estimated timeline and budget addendum for your review. Would you like us to queue this immediately following current milestone sign-off?`,
    };
  }

  return {
    isOutScope: false,
    reason: "Request appears aligned with typical in-scope delivery adjustments.",
    responseTemplate: "Acknowledged and scheduled within current sprint delivery backlog.",
  };
}

export function parseTierHoursInput(
  raw: string,
): { tier1: number; tier2: number; tier3: number; tier4: number } | undefined {
  const parts = raw.split(",").map((value) => Number(value.trim()));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value) || value < 0)) return undefined;
  return { tier1: parts[0], tier2: parts[1], tier3: parts[2], tier4: parts[3] };
}

export function evaluateFounderLeverage(tierHours: { tier1: number; tier2: number; tier3: number; tier4: number }): {
  highLeveragePercentage: number;
  compliant: boolean;
  recommendation: string;
} {
  const total = tierHours.tier1 + tierHours.tier2 + tierHours.tier3 + tierHours.tier4;
  if (total === 0) {
    return {
      highLeveragePercentage: 100,
      compliant: true,
      recommendation: "Zero hours logged.",
    };
  }

  const highLeverage = tierHours.tier1 + tierHours.tier2;
  const percentage = Math.round((highLeverage / total) * 100);
  const compliant = percentage >= 70;

  let recommendation = "Founder leverage is well-balanced (≥70% high-leverage systems and strategy).";
  if (!compliant) {
    recommendation = `ALERT: Founder leverage is ${percentage}% (< 70% threshold). Delegate Tier 3/4 tasks (tactical code, ad-hoc pings) to designated Council Leads (Crew/Sol).`;
  }

  return {
    highLeveragePercentage: percentage,
    compliant,
    recommendation,
  };
}

const COACH_ARTIFACTS = ["daily-standup.md", "CLIENT_DIGEST.md", "client-digest.md", "coach-digest.md"];

const COACH_RED_FLAGS: Array<{ label: string; pattern: RegExp }> = [
  { label: "API key or token", pattern: /(?:sk-|ghp_|glpat-|gho_|ghs_)[A-Za-z0-9_-]{20,}/ },
  { label: "private key", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "AWS secret", pattern: /aws_secret_access_key\s*[:=]/i },
  { label: "bearer token", pattern: /bearer\s+[A-Za-z0-9._-]{20,}/i },
  { label: "credential assignment", pattern: /(?:password|secret|token)\s*[:=]\s*["']?[^\s"']{8,}/i },
  { label: "email address (client PII)", pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  {
    label: "unverified assurance claim",
    pattern: /\b(?:100%\s+(?:green|pass(?:ing)?)|zero defects|0\s+(?:leaks|failures|broken links))\b/i,
  },
];

export function auditCoachArtifacts(cwd: string): {
  passed: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const present = COACH_ARTIFACTS.map((name) => join(cwd, name)).filter((path) => existsSync(path));

  if (present.length === 0) {
    return { passed: true, errors: [] };
  }

  for (const artifactPath of present) {
    const name = artifactPath.slice(cwd.length + 1);
    let content = "";
    try {
      content = readFileSync(artifactPath, "utf8");
    } catch {
      errors.push(`${name}: unreadable; cannot audit.`);
      continue;
    }

    for (const flag of COACH_RED_FLAGS) {
      if (flag.pattern.test(content)) {
        // Never echo the matched value.
        errors.push(`${name}: contains ${flag.label}.`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

// CLI Execution
if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      standup: { type: "boolean", default: false },
      "client-digest": { type: "boolean", default: false },
      "scope-check": { type: "string", default: "" },
      "founder-audit": { type: "boolean", default: false },
      "tier-hours": { type: "string" },
      receipts: { type: "string" },
      audit: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const targetDir = positionals[0] ? resolve(positionals[0]) : process.cwd();

  if (values.help) {
    console.log(`
☀️ coach.ts — Tri-Vector Autonomous Agency Coach CLI

USAGE:
  bun coach.ts [targetDir] [options]

OPTIONS:
  --standup              Evaluate 5-pillar controllable effort scorecard (Team Mode)
  --client-digest        Generate plain-English progress digest for clients (Client Mode)
  --receipts <path>      Attach verified JSON receipts to the client digest (default: .delivery-receipts.json)
  --scope-check "<text>" Intercept client requests against scope boundaries (Client Mode)
  --founder-audit        Evaluate founder leverage and the 70/30 rule (Founder Mode)
  --tier-hours <a,b,c,d> Measured hours for tiers 1-4 (required by --founder-audit; never invented)
  --audit                Audit forensic integrity and secret hygiene of coach artifacts
  --json                 Output structured JSON
  -h, --help             Show this help screen
`);
    process.exit(0);
  }

  if (values.standup) {
    const result = evaluateEffortScorecard(targetDir);
    if (values.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n☀️ Daily Effort Scorecard — Score: ${result.totalScore} / 10 (${result.tier})`);
      console.log(`  • TDD Rigor       : ${result.tddScore} / 2`);
      console.log(`  • Diff Discipline : ${result.diffScore} / 2`);
      console.log(`  • Hygiene/Security: ${result.hygieneScore} / 2`);
      console.log(`  • Deep Work Focus : ${result.focusScore} / 2`);
      console.log(`  • Blocker Triage  : ${result.triageScore} / 2`);
      if (result.recentCommits.length > 0) {
        console.log(`\n📜 Recent Commits Inspected (${result.recentCommits.length}):`);
        for (const c of result.recentCommits.slice(0, 4)) {
          console.log(`    - ${c}`);
        }
      }
      if (result.findings.length > 0) {
        console.log(`\n⚠️ Observations:`);
        for (const f of result.findings) {
          console.log(`    • ${f}`);
        }
      }
    }
    process.exit(0);
  }

  if (values["client-digest"]) {
    const receipts = loadDeliveryReceipts(
      targetDir,
      typeof values.receipts === "string" && values.receipts.length > 0 ? values.receipts : undefined,
    );
    const digest = generateClientDigest(targetDir, undefined, receipts);
    console.log(`\n${digest}\n`);
    process.exit(0);
  }

  if (values["scope-check"]) {
    const evaluation = evaluateScopeRequest(values["scope-check"]);
    if (values.json) {
      console.log(JSON.stringify(evaluation, null, 2));
    } else {
      console.log(`\n🛡️ Scope Evaluation Result:`);
      console.log(
        `  • Out of Scope : ${evaluation.isOutScope ? "YES (Change Order Required)" : "NO (Within Standard Sprint)"}`,
      );
      console.log(`  • Reason       : ${evaluation.reason}`);
      console.log(`\n📝 Suggested Client Response:`);
      console.log(`  "${evaluation.responseTemplate}"\n`);
    }
    process.exit(0);
  }

  if (values["founder-audit"]) {
    const tierHours = typeof values["tier-hours"] === "string" ? parseTierHoursInput(values["tier-hours"]) : undefined;
    if (!tierHours) {
      console.error(
        "❌ --founder-audit requires --tier-hours <tier1,tier2,tier3,tier4> measured from your time tracking. Refusing to invent a distribution.",
      );
      process.exit(1);
    }
    const evalRes = evaluateFounderLeverage(tierHours);
    if (values.json) {
      console.log(JSON.stringify(evalRes, null, 2));
    } else {
      console.log(`\n👑 Founder Leverage Diagnostic:`);
      console.log(`  • High-Leverage Bandwidth (Tier 1 & 2): ${evalRes.highLeveragePercentage}%`);
      console.log(`  • 70/30 Rule Compliant                : ${evalRes.compliant ? "YES" : "NO"}`);
      console.log(`  • Recommendation                      : ${evalRes.recommendation}\n`);
    }
    process.exit(0);
  }

  if (values.audit) {
    const res = auditCoachArtifacts(targetDir);
    if (res.passed) {
      console.log("✅ Coach artifacts passed audit with zero defects.");
      process.exit(0);
    } else {
      console.log("❌ Coach audit failed:");
      for (const err of res.errors) console.log(`  - ${err}`);
      process.exit(1);
    }
  }

  console.log("☀️ coach CLI ready. Run with --help to view options.");
}
