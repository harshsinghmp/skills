#!/usr/bin/env bun
/**
 * aeo-schema.ts: Structured JSON-LD schema generator & AI Engine Optimization (AEO) quotability auditor.
 *
 * Usage:
 *   bun aeo-schema.ts --generate-schema <faq|article|organization> [--title "..." --author "..."]
 *   bun aeo-schema.ts --audit-quotability <file.md> [--json]
 */

import fs from "node:fs";

export interface SchemaData {
  title?: string;
  description?: string;
  url?: string;
  author?: string;
  publisher?: string;
  datePublished?: string;
  faqs?: { question: string; answer: string }[];
}

export function generateSchema(type: "faq" | "article" | "organization", data: SchemaData = {}): string {
  let schemaObj: Record<string, unknown>;

  if (type === "faq") {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (
        data.faqs || [
          {
            question: data.title || "How does the platform work?",
            answer: data.description || "The platform provides automated agency orchestration and code generation.",
          },
        ]
      ).map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    };
  } else if (type === "article") {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title || "Comprehensive Technical Architecture Guide",
      description: data.description || "Technical deep-dive on modern web architecture and development standards.",
      author: {
        "@type": "Person",
        name: data.author || "Harsh Singh",
      },
      publisher: {
        "@type": "Organization",
        name: data.publisher || "Agency Ecosystem",
      },
      datePublished: data.datePublished || new Date().toISOString().split("T")[0],
      url: data.url || "https://example.com/article",
    };
  } else {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: data.publisher || data.title || "Agency Name",
      url: data.url || "https://example.com",
      description: data.description || "Full-service digital agency and software engineering consultancy.",
    };
  }

  return `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;
}

export interface QuotabilityViolation {
  line: number;
  type: "dangling-pronoun" | "missing-answer-first" | "missing-schema";
  detail: string;
  recommendation: string;
}

export interface AeoReport {
  file: string;
  hasSchema: boolean;
  score: number;
  violations: QuotabilityViolation[];
}

export function auditAeoQuotability(filePath: string): AeoReport {
  const violations: QuotabilityViolation[] = [];
  if (!fs.existsSync(filePath)) {
    return { file: filePath, hasSchema: false, score: 0, violations };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const hasSchema = content.includes("application/ld+json") || content.includes("schema.org");

  if (!hasSchema) {
    violations.push({
      line: 1,
      type: "missing-schema",
      detail: "No structured JSON-LD schema detected in document",
      recommendation: "Add Article, FAQPage, or Organization schema snippet for search bots and AI answer engines.",
    });
  }

  let inHeader = false;
  let headerLine = 0;

  lines.forEach((lineText, idx) => {
    const trimmed = lineText.trim();
    if (/^#{1,3}\s+/.test(trimmed)) {
      inHeader = true;
      headerLine = idx + 1;
      return;
    }

    if (inHeader && trimmed.length > 0) {
      inHeader = false;
      // First sentence immediately under header
      const firstSentence = trimmed.split(/[.?!]/)[0] || "";
      const wordCount = firstSentence.split(/\s+/).filter(Boolean).length;

      // Check dangling pronouns in first sentence
      if (/^(?:This|These|It|They|Their|Those)\s+(?:is|are|means|allows|provides|works)\b/i.test(firstSentence)) {
        violations.push({
          line: idx + 1,
          type: "dangling-pronoun",
          detail: `Dangling pronoun in lead sentence under H${headerLine}: "${firstSentence.slice(0, 50)}..."`,
          recommendation:
            "Use 18-token standalone quotability rule: replace dangling pronoun with the explicit subject noun.",
        });
      }

      if (wordCount > 60) {
        violations.push({
          line: idx + 1,
          type: "missing-answer-first",
          detail: `Lead sentence exceeds 60 words (${wordCount} words)`,
          recommendation: "Structure lead sentence under headers as a concise 40–60 word answer for AI quote density.",
        });
      }
    }
  });

  const baseScore = 100 - violations.length * 20;
  const score = Math.max(0, baseScore);

  return {
    file: filePath,
    hasSchema,
    score,
    violations,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--generate-schema")) {
    const idx = args.indexOf("--generate-schema");
    const type = (args[idx + 1] || "faq") as "faq" | "article" | "organization";
    const titleIdx = args.indexOf("--title");
    const title = titleIdx !== -1 ? args[titleIdx + 1] : undefined;
    const descIdx = args.indexOf("--desc");
    const desc = descIdx !== -1 ? args[descIdx + 1] : undefined;
    console.log(generateSchema(type, { title, description: desc }));
  } else if (args.includes("--audit-quotability")) {
    const idx = args.indexOf("--audit-quotability");
    const target = args[idx + 1];
    if (!target || !fs.existsSync(target)) {
      console.error("Error: Please provide a valid markdown file path.");
      process.exit(1);
    }
    const report = auditAeoQuotability(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🤖 AEO Quotability & Structured Schema Audit: ${target}`);
      console.log(`  Schema Detected: ${report.hasSchema ? "✅ YES" : "❌ NO"}`);
      console.log(`  AEO Quotability Score: ${report.score}/100`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Follows answer-first density and 18-token standalone quotability.`);
      } else {
        console.log("\n  Violations:");
        for (const v of report.violations) {
          console.log(`    - ⚠️  [${v.type}] Line ${v.line}: ${v.detail} (Fix: ${v.recommendation})`);
        }
      }
    }
  } else {
    console.log(
      "Usage: bun aeo-schema.ts [--generate-schema <faq|article|organization>] [--audit-quotability <file.md>]",
    );
  }
}
