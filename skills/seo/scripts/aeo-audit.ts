#!/usr/bin/env bun
/**
 * aeo-audit.ts: Answer-Engine Optimization (AEO/GEO) Citability & AI Crawler Auditor.
 *
 * Checks content against the 18-token standalone quotability rule, answer-first density,
 * definition within the first 100 words, structured entity schemas, and robots.txt crawler segregation.
 *
 * Usage:
 *   bun aeo-audit.ts --audit <file|dir> [--extract-quotables] [--json]
 *   bun aeo-audit.ts --robots-check <robots.txt> [--json]
 */

import fs from "node:fs";
import path from "node:path";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface QuotableCandidate {
  sentence: string;
  tokens: number;
  line: number;
  isStandalone: boolean;
  score: number;
}

export interface AeoViolation {
  line: number;
  type:
    | "missing-definition-lead"
    | "dangling-pronoun"
    | "heading-answer-delay"
    | "missing-schema"
    | "missing-author"
    | "low-quotability-density";
  detail: string;
  fix: string;
}

export interface AeoFileReport {
  file: string;
  score: number;
  grade: "A" | "B" | "C" | "F";
  metrics: {
    wordCount: number;
    first100WordsHasDefinition: boolean;
    headingsCount: number;
    headingsWithDirectAnswer: number;
    quotableSentencesCount: number;
    hasStructuredSchema: boolean;
    hasAuthorAttribution: boolean;
  };
  quotables: QuotableCandidate[];
  violations: AeoViolation[];
}

export interface RobotsAeoReport {
  file: string;
  allowedSearchBots: string[];
  blockedSearchBots: string[];
  blockedTrainingBots: string[];
  warnings: string[];
  isSafeForAiSearch: boolean;
}

export interface AeoSuiteReport {
  totalFiles: number;
  averageScore: number;
  passedCount: number;
  failedCount: number;
  files: AeoFileReport[];
}

// ─── Crawler Definitions ───────────────────────────────────────────────────

export const SEARCH_RETRIEVAL_BOTS = ["OAI-SearchBot", "PerplexityBot", "Claude-Web", "Google-Extended"];

export const MODEL_TRAINING_BOTS = ["GPTBot", "CCBot", "anthropic-ai", "Bytespider"];

// ─── 18-Token Quotability Extraction & Analysis ─────────────────────────────

const DANGLING_PRONOUN_PATTERN =
  /^(?:This|These|It|They|Their|Those|He|She|We)\s+(?:is|are|was|were|means|allows|provides|works|does|can|will|should)\b/i;

const DEFINITION_MARKERS = [
  /\b(?:is defined as|refers to|is a|is an|is the|means|describes|represents)\b/i,
  /\b(?:provides a|serves as|acts as|functions as)\b/i,
];

export function tokenizeWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function extractQuotableCandidates(content: string): QuotableCandidate[] {
  const candidates: QuotableCandidate[] = [];
  const lines = content.split("\n");

  lines.forEach((lineText, lineIdx) => {
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("---")) {
      return;
    }

    // Split line into sentences
    const rawSentences = trimmed.split(/(?<=[.?!])\s+/);
    for (const raw of rawSentences) {
      const sentence = raw.replace(/^[-*•\d.]+\s+/, "").trim();
      const tokens = tokenizeWords(sentence);
      if (tokens.length >= 12 && tokens.length <= 26) {
        const hasDanglingPronoun = DANGLING_PRONOUN_PATTERN.test(sentence);
        const containsSpecificMetricOrEntity =
          /\b(?:\d+%|\$\d+|\d+\s*(?:ms|kb|mb|gb|sec|min|tokens?|users?|clients?)|[A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)*)\b/.test(
            sentence,
          );

        const isStandalone = !hasDanglingPronoun && containsSpecificMetricOrEntity;
        let score = 50;
        if (tokens.length >= 15 && tokens.length <= 21) score += 25; // 18-token sweet spot
        if (isStandalone) score += 25;

        candidates.push({
          sentence,
          tokens: tokens.length,
          line: lineIdx + 1,
          isStandalone,
          score,
        });
      }
    }
  });

  return candidates;
}

// ─── File AEO Auditor ───────────────────────────────────────────────────────

export function auditAeoFile(filePath: string): AeoFileReport {
  if (!fs.existsSync(filePath)) {
    return {
      file: filePath,
      score: 0,
      grade: "F",
      metrics: {
        wordCount: 0,
        first100WordsHasDefinition: false,
        headingsCount: 0,
        headingsWithDirectAnswer: 0,
        quotableSentencesCount: 0,
        hasStructuredSchema: false,
        hasAuthorAttribution: false,
      },
      quotables: [],
      violations: [
        {
          line: 0,
          type: "missing-definition-lead",
          detail: `File not found: ${filePath}`,
          fix: "Ensure valid file path.",
        },
      ],
    };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const words = tokenizeWords(content);
  const violations: AeoViolation[] = [];

  // 1. Definition in first 100 words
  const first100Words = words.slice(0, 100).join(" ");
  const first100WordsHasDefinition = DEFINITION_MARKERS.some((re) => re.test(first100Words));
  if (!first100WordsHasDefinition && words.length > 50) {
    violations.push({
      line: 1,
      type: "missing-definition-lead",
      detail: "No core definition or entity declaration found in the first 100 words.",
      fix: "Define the core subject explicitly within the opening 100 words (e.g., '<Subject> is a <category> that <benefit>').",
    });
  }

  // 2. Headings and direct answer density
  let headingsCount = 0;
  let headingsWithDirectAnswer = 0;
  let activeHeadingLine = 0;
  let inHeadingBlock = false;

  lines.forEach((lineText, idx) => {
    const trimmed = lineText.trim();
    if (/^#{1,3}\s+/.test(trimmed)) {
      headingsCount++;
      activeHeadingLine = idx + 1;
      inHeadingBlock = true;
      return;
    }

    if (inHeadingBlock && trimmed.length > 0) {
      inHeadingBlock = false;
      const leadSentence = trimmed.split(/(?<=[.?!])\s+/)[0] || "";
      const sentenceTokens = tokenizeWords(leadSentence);

      if (DANGLING_PRONOUN_PATTERN.test(leadSentence)) {
        violations.push({
          line: idx + 1,
          type: "dangling-pronoun",
          detail: `Dangling pronoun under H${activeHeadingLine}: "${leadSentence.slice(0, 60)}..."`,
          fix: "Replace ambiguous pronouns (It, This, They) with the explicit noun subject for standalone citation.",
        });
      } else if (sentenceTokens.length >= 10 && sentenceTokens.length <= 40) {
        headingsWithDirectAnswer++;
      } else if (sentenceTokens.length > 50) {
        violations.push({
          line: idx + 1,
          type: "heading-answer-delay",
          detail: `Lead answer under H${activeHeadingLine} is too long (${sentenceTokens.length} words) before reaching conclusion.`,
          fix: "Provide a direct, answer-first sentence of 15–25 words immediately following the heading.",
        });
      }
    }
  });

  // 3. Structured schema check
  const hasStructuredSchema =
    content.includes("application/ld+json") ||
    content.includes("schema.org") ||
    content.includes('"@context": "https://schema.org"');

  if (!hasStructuredSchema) {
    violations.push({
      line: 1,
      type: "missing-schema",
      detail: "No structured JSON-LD entity or FAQPage schema found.",
      fix: "Embed schema.org JSON-LD (Article, FAQPage, or Organization) with sameAs authority links.",
    });
  }

  // 4. Author / Source Attribution
  const hasAuthorAttribution =
    /\b(?:author|written by|byline|published by|sources?|references?|methodology)\b/i.test(content) ||
    /author:\s*["']?[A-Za-z\s]+["']?/.test(content);

  if (!hasAuthorAttribution && words.length > 150) {
    violations.push({
      line: 1,
      type: "missing-author",
      detail: "Missing explicit author credentials or primary source attribution (E-E-A-T signal).",
      fix: "Add named author byline, publication timestamp, and verifiable primary source references.",
    });
  }

  // 5. Quotable Candidate Extraction
  const quotables = extractQuotableCandidates(content);
  const standaloneQuotables = quotables.filter((q) => q.isStandalone);

  if (standaloneQuotables.length === 0 && words.length > 100) {
    violations.push({
      line: 1,
      type: "low-quotability-density",
      detail: "Zero 18-token standalone quotable sentences detected in body text.",
      fix: "Include 2–5 self-contained sentences (15–20 words) containing specific metrics, facts, and no dangling pronouns.",
    });
  }

  // 6. Score Calculation
  let score = 100;
  if (!first100WordsHasDefinition) score -= 20;
  if (!hasStructuredSchema) score -= 20;
  if (!hasAuthorAttribution) score -= 15;
  score -= violations.filter((v) => v.type === "dangling-pronoun").length * 10;
  score -= violations.filter((v) => v.type === "heading-answer-delay").length * 5;
  if (standaloneQuotables.length === 0) score -= 15;

  score = Math.max(0, Math.min(100, score));

  let grade: "A" | "B" | "C" | "F" = "F";
  if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 50) grade = "C";

  return {
    file: filePath,
    score,
    grade,
    metrics: {
      wordCount: words.length,
      first100WordsHasDefinition,
      headingsCount,
      headingsWithDirectAnswer,
      quotableSentencesCount: standaloneQuotables.length,
      hasStructuredSchema,
      hasAuthorAttribution,
    },
    quotables: standaloneQuotables,
    violations,
  };
}

// ─── Robots.txt AI Retrieval Crawler Auditor ───────────────────────────────

export function auditRobotsTxt(robotsContentOrPath: string): RobotsAeoReport {
  let content = robotsContentOrPath;
  let filePath = "raw-string";

  if (fs.existsSync(robotsContentOrPath)) {
    filePath = robotsContentOrPath;
    content = fs.readFileSync(robotsContentOrPath, "utf8");
  }

  const lines = content.split("\n");
  const warnings: string[] = [];
  const allowedSearchBots: string[] = [];
  const blockedSearchBots: string[] = [];
  const blockedTrainingBots: string[] = [];

  // Parse simple user-agent blocks
  let currentAgents: string[] = [];
  let lastWasDirective = false;
  let blanketDisallowAll = false;
  const agentRules = new Map<string, Array<{ directive: string; path: string }>>();

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;

    const [key, ...valParts] = line.split(":");
    const val = valParts.join(":").trim();

    if (key.toLowerCase() === "user-agent") {
      if (lastWasDirective) {
        currentAgents = [];
        lastWasDirective = false;
      }
      currentAgents.push(val);
    } else if (key.toLowerCase() === "disallow" || key.toLowerCase() === "allow") {
      lastWasDirective = true;
      for (const agent of currentAgents) {
        if (!agentRules.has(agent)) agentRules.set(agent, []);
        agentRules.get(agent)?.push({ directive: key.toLowerCase(), path: val });
      }
    }
  }

  // Check blanket User-agent: *
  const wildcardRules = agentRules.get("*") || [];
  const hasWildcardDisallowRoot = wildcardRules.some(
    (r) => r.directive === "disallow" && (r.path === "/" || r.path === "/*"),
  );

  if (hasWildcardDisallowRoot) {
    blanketDisallowAll = true;
  }

  // Evaluate Search Retrieval Bots
  for (const bot of SEARCH_RETRIEVAL_BOTS) {
    const botRules = agentRules.get(bot) || [];
    const isExplicitlyDisallowed = botRules.some(
      (r) => r.directive === "disallow" && (r.path === "/" || r.path === "/*"),
    );
    const isExplicitlyAllowed = botRules.some((r) => r.directive === "allow" && r.path === "/");

    if (isExplicitlyDisallowed) {
      blockedSearchBots.push(bot);
      warnings.push(`CRITICAL: AI Search Bot '${bot}' is explicitly blocked via Disallow: /`);
    } else if (blanketDisallowAll && !isExplicitlyAllowed) {
      blockedSearchBots.push(bot);
      warnings.push(`WARNING: AI Search Bot '${bot}' is blocked by blanket 'User-agent: * Disallow: /'`);
    } else {
      allowedSearchBots.push(bot);
    }
  }

  // Evaluate Model Training Bots
  for (const bot of MODEL_TRAINING_BOTS) {
    const botRules = agentRules.get(bot) || [];
    const isExplicitlyDisallowed = botRules.some(
      (r) => r.directive === "disallow" && (r.path === "/" || r.path === "/*"),
    );
    if (isExplicitlyDisallowed || blanketDisallowAll) {
      blockedTrainingBots.push(bot);
    }
  }

  const isSafeForAiSearch = blockedSearchBots.length === 0;

  return {
    file: filePath,
    allowedSearchBots,
    blockedSearchBots,
    blockedTrainingBots,
    warnings,
    isSafeForAiSearch,
  };
}

// ─── Directory Auditor ─────────────────────────────────────────────────────

export function auditAeoDirectory(dirPath: string): AeoSuiteReport {
  const reports: AeoFileReport[] = [];
  const validExts = [".md", ".html", ".tsx", ".jsx", ".astro"];

  function scan(current: string) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (!ent.name.startsWith(".") && ent.name !== "node_modules" && ent.name !== "dist") {
          scan(full);
        }
      } else if (validExts.includes(path.extname(ent.name))) {
        reports.push(auditAeoFile(full));
      }
    }
  }

  scan(dirPath);

  const totalFiles = reports.length;
  const sumScore = reports.reduce((acc, r) => acc + r.score, 0);
  const averageScore = totalFiles > 0 ? Math.round(sumScore / totalFiles) : 0;
  const passedCount = reports.filter((r) => r.score >= 70).length;
  const failedCount = totalFiles - passedCount;

  return {
    totalFiles,
    averageScore,
    passedCount,
    failedCount,
    files: reports,
  };
}

// ─── CLI Entrypoint ────────────────────────────────────────────────────────

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");
  const extractQuotablesFlag = args.includes("--extract-quotables");

  const robotsIdx = args.indexOf("--robots-check");
  if (robotsIdx !== -1 && args[robotsIdx + 1]) {
    const target = args[robotsIdx + 1];
    const report = auditRobotsTxt(target);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🤖 [AEO Robots.txt Auditor] Report for: ${target}`);
      console.log("────────────────────────────────────────────────────────────");
      console.log(`AI Search Citability Safe: ${report.isSafeForAiSearch ? "✅ YES" : "❌ NO"}`);
      console.log(`Allowed Search Bots: ${report.allowedSearchBots.join(", ") || "None"}`);
      console.log(`Blocked Search Bots: ${report.blockedSearchBots.join(", ") || "None"}`);
      console.log(`Blocked Training Bots: ${report.blockedTrainingBots.join(", ") || "None"}`);
      if (report.warnings.length > 0) {
        console.log("\n⚠️ Warnings:");
        for (const w of report.warnings) console.log(`  • ${w}`);
      }
      console.log("────────────────────────────────────────────────────────────\n");
    }
    process.exit(report.isSafeForAiSearch ? 0 : 1);
  }

  const auditIdx = args.indexOf("--audit");
  const targetPath = auditIdx !== -1 && args[auditIdx + 1] ? path.resolve(args[auditIdx + 1]) : process.cwd();

  const isDir = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();

  if (isDir) {
    const suite = auditAeoDirectory(targetPath);
    if (isJson) {
      console.log(JSON.stringify(suite, null, 2));
    } else {
      console.log(`\n🔎 [AEO Citability Suite] Directory: ${targetPath}`);
      console.log("────────────────────────────────────────────────────────────");
      console.log(`Total Files: ${suite.totalFiles} | Average Score: ${suite.averageScore}%`);
      console.log(`Passed (≥70%): ${suite.passedCount} | Failed (<70%): ${suite.failedCount}\n`);

      for (const f of suite.files) {
        const marker = f.score >= 70 ? "✅" : "⚠️";
        console.log(`${marker} [Grade: ${f.grade} | Score: ${f.score}%] ${path.relative(targetPath, f.file)}`);
        if (f.violations.length > 0) {
          for (const v of f.violations.slice(0, 2)) {
            console.log(`   └─ L${v.line} [${v.type}]: ${v.detail}`);
          }
        }
      }
      console.log("────────────────────────────────────────────────────────────\n");
    }
    process.exit(suite.failedCount === 0 ? 0 : 1);
  } else {
    const report = auditAeoFile(targetPath);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🔎 [AEO Citability Report] File: ${targetPath}`);
      console.log("────────────────────────────────────────────────────────────");
      console.log(`Score: ${report.score}% | Grade: ${report.grade}`);
      console.log(`Word Count: ${report.metrics.wordCount}`);
      console.log(`Definition in Lead 100 Words: ${report.metrics.first100WordsHasDefinition ? "✅" : "❌"}`);
      console.log(`Structured Schema Detected: ${report.metrics.hasStructuredSchema ? "✅" : "❌"}`);
      console.log(`Author / Attribution: ${report.metrics.hasAuthorAttribution ? "✅" : "❌"}`);
      console.log(`Standalone Quotable Statements: ${report.metrics.quotableSentencesCount}`);

      if (report.violations.length > 0) {
        console.log("\n⚠️ Violations & Remediations:");
        for (const v of report.violations) {
          console.log(`  • [L${v.line}] ${v.type}: ${v.detail}`);
          console.log(`    Fix: ${v.fix}`);
        }
      }

      if (extractQuotablesFlag && report.quotables.length > 0) {
        console.log("\n💡 Extracted 18-Token Quotable Statements:");
        for (const q of report.quotables) {
          console.log(`  • [L${q.line}, ${q.tokens} tokens, Score: ${q.score}] "${q.sentence}"`);
        }
      }
      console.log("────────────────────────────────────────────────────────────\n");
    }
    process.exit(report.score >= 70 ? 0 : 1);
  }
}
