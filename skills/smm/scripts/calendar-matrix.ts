#!/usr/bin/env bun
/**
 * calendar-matrix.ts: Omnichannel 30-Day Content Matrix & Editorial Engine.
 *
 * Implements CAL-001 through CAL-004:
 *   - CAL-001: 30-Day Omnichannel Matrix Architecture (40/30/20/10 Pillar Ratio)
 *   - CAL-002: CORE-EEAT & 18-Token Standalone Quotability Gate
 *   - CAL-003: 1-to-5 Repurposing Multiplier
 *   - CAL-004: Anti-Fatigue Cadence & 7-Day Lead Buffer
 *
 * Usage:
 *   bun calendar-matrix.ts --scaffold-matrix [--topic <topic>] [--output <file>] [--json]
 *   bun calendar-matrix.ts --audit-schedule [--file <file>] [--json]
 *   bun calendar-matrix.ts --repurpose-cascade --pillar-title <title> [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface CalendarEntry {
  day: number;
  weekday: string;
  platform: "LinkedIn" | "X / Twitter" | "Instagram" | "Multi-Channel";
  pillar:
    | "Contrarian Authority"
    | "Technical Receipts"
    | "Tactical Playbook"
    | "Culture & Behind-The-Scenes"
    | "Reactive Slack";
  format: string;
  hook: string;
  standaloneQuotable: string;
  status: "DRAFT" | "READY" | "BUFFER";
}

export interface CalendarMatrixReport {
  topic: string;
  totalEntries: number;
  entries: CalendarEntry[];
  pillarDistribution: {
    contrarianAuthority: number; // target ~40%
    technicalReceipts: number; // target ~30%
    tacticalPlaybook: number; // target ~20%
    cultureAndSlack: number; // target ~10%
  };
}

export interface ScheduleAuditReport {
  file: string;
  totalSlots: number;
  hasSlackSlots: boolean;
  quotableCount: number;
  pillarBalanceScore: number;
  overallScore: number;
  passed: boolean;
  issues: string[];
}

export function generateCalendarMatrix(topic = "Full-Stack Agency Architecture", days = 30): CalendarMatrixReport {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const entries: CalendarEntry[] = [];

  let contrarian = 0;
  let receipts = 0;
  let tactical = 0;
  let cultureSlack = 0;

  for (let i = 1; i <= days; i++) {
    const weekdayIdx = (i - 1) % 5;
    const weekday = weekdays[weekdayIdx];

    let entry: CalendarEntry;

    if (weekday === "Monday") {
      // 40% Contrarian Authority (Slot 1)
      contrarian++;
      entry = {
        day: i,
        weekday,
        platform: "LinkedIn",
        pillar: "Contrarian Authority",
        format: "Executive Narrative + Diagram",
        hook: `Why conventional approaches to ${topic} actively drain agency profitability.`,
        standaloneQuotable: "Retainers fail when they track billable hours instead of verified economic output.",
        status: "DRAFT",
      };
    } else if (weekday === "Tuesday") {
      // 20% Tactical Playbook
      tactical++;
      entry = {
        day: i,
        weekday,
        platform: "X / Twitter",
        pillar: "Tactical Playbook",
        format: "7-Tweet Numbered Breakdown",
        hook: `The step-by-step engineering checklist we use for ${topic}.`,
        standaloneQuotable: "Eliminate special cases early to keep production architectures completely predictable.",
        status: "DRAFT",
      };
    } else if (weekday === "Wednesday") {
      // 30% Technical Receipts (Slot 1)
      receipts++;
      entry = {
        day: i,
        weekday,
        platform: "Instagram",
        pillar: "Technical Receipts",
        format: "6-Slide Visual Carousel",
        hook: `Real data: how we deployed ${topic} with zero downtime and 4x speed.`,
        standaloneQuotable: "Real performance gains require measuring production bottlenecks before writing code.",
        status: "DRAFT",
      };
    } else if (weekday === "Thursday") {
      // 40% Contrarian Authority (Slot 2)
      contrarian++;
      entry = {
        day: i,
        weekday,
        platform: "LinkedIn",
        pillar: "Contrarian Authority",
        format: "Short Insight + Evidence",
        hook: `The single biggest misconception about ${topic}.`,
        standaloneQuotable: "Simplicity in system design consistently outperforms premature optimization.",
        status: "DRAFT",
      };
    } else {
      // Friday: alternates between Reactive Slack (10%) and Technical Receipts (Slot 2 -> 30% total receipts)
      if (cultureSlack < Math.ceil(days * 0.1)) {
        cultureSlack++;
        entry = {
          day: i,
          weekday,
          platform: "Multi-Channel",
          pillar: "Reactive Slack",
          format: "Timely Analysis / Community Dialogue",
          hook: `Weekly breakdown on shifting trends in ${topic}.`,
          standaloneQuotable: "Agencies scale through repeatable systems rather than frantic manual heroics.",
          status: "BUFFER",
        };
      } else {
        receipts++;
        entry = {
          day: i,
          weekday,
          platform: "Multi-Channel",
          pillar: "Technical Receipts",
          format: "Weekly Engineering Recap & Production Metrics",
          hook: `Behind the scenes: shipping production milestones for ${topic}.`,
          standaloneQuotable: "Production metrics prove delivery value far better than speculative promises.",
          status: "DRAFT",
        };
      }
    }

    entries.push(entry);
  }

  const total = entries.length;
  return {
    topic,
    totalEntries: total,
    entries,
    pillarDistribution: {
      contrarianAuthority: Math.round((contrarian / total) * 100),
      technicalReceipts: Math.round((receipts / total) * 100),
      tacticalPlaybook: Math.round((tactical / total) * 100),
      cultureAndSlack: Math.round((cultureSlack / total) * 100),
    },
  };
}

export function auditScheduleContent(filePath: string): ScheduleAuditReport {
  const issues: string[] = [];
  if (!fs.existsSync(filePath)) {
    return {
      file: filePath,
      totalSlots: 0,
      hasSlackSlots: false,
      quotableCount: 0,
      pillarBalanceScore: 0,
      overallScore: 0,
      passed: false,
      issues: ["File not found."],
    };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const slotMatches = lines.filter((l) => /\|\s*\*\*(Mon|Tue|Wed|Thu|Fri|Day \d+)\*\*/i.test(l));
  const hasSlack = /BUFFER|Reactive Slack|Slack/i.test(content);
  if (!hasSlack) {
    issues.push("Missing weekly reactive slack buffer (CAL-004 violation).");
  }

  // Count standalone quotable statements (<= 18 tokens)
  const quotableMatches = lines.filter((l) => /"([^"]{10,120})"/g.test(l));
  let quotableCount = 0;
  for (const m of quotableMatches) {
    const rawTokens = m.split(/\s+/).length;
    if (rawTokens <= 18) quotableCount++;
  }

  if (quotableCount < Math.max(2, Math.floor(slotMatches.length * 0.4))) {
    issues.push("Quotable density below threshold: posts lack 18-token standalone anchors (CAL-002 violation).");
  }

  const pillarBalanceScore = hasSlack && slotMatches.length >= 5 ? 90 : 60;
  const overallScore = Math.max(0, pillarBalanceScore - issues.length * 20);

  return {
    file: filePath,
    totalSlots: slotMatches.length,
    hasSlackSlots: hasSlack,
    quotableCount,
    pillarBalanceScore,
    overallScore,
    passed: overallScore >= 70,
    issues,
  };
}

export function generateRepurposingCascade(title: string, url = "https://example.com/blog/deep-dive") {
  return {
    pillarAsset: {
      title,
      url,
    },
    derivatives: [
      {
        channel: "LinkedIn",
        format: "Executive Narrative",
        leadHook: `Most companies tackle ${title} backwards. Here is what happened when we inverted the model.`,
        keyQuote: "True architectural leverage comes from eliminating repetitive decisions.",
      },
      {
        channel: "X / Twitter",
        format: "Numbered Thread",
        leadHook: `We completely re-architected ${title}. 7 lessons that saved our engineering team 300+ hours: 🧵👇`,
        keyQuote: "Consistency beats cleverness in every production deployment.",
      },
      {
        channel: "Instagram / TikTok",
        format: "6-Slide Carousel",
        slideArc: ["The Trap", "The Breakdown", "The Pattern", "The Shift", "The Implementation", "The Cheat Sheet"],
      },
      {
        channel: "Video Sales Letter / Short",
        format: "60-Second Vertical Script",
        hookStructure: "Pattern Interrupt (3s) -> Villain Agitation -> Mechanism Reveal -> Dual CTA",
      },
      {
        channel: "Newsletter Capsule",
        format: "150-Word Executive Memo",
        cta: `Read the full technical teardown here: ${url}`,
      },
    ],
  };
}

// CLI Execution Harness
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  const scaffoldIdx = args.indexOf("--scaffold-matrix");
  if (scaffoldIdx !== -1) {
    const topicIdx = args.indexOf("--topic");
    const outIdx = args.indexOf("--output");
    const daysIdx = args.indexOf("--days");

    const topic = topicIdx !== -1 ? args[topicIdx + 1] : "Agency Engineering & Growth Architecture";
    const days = daysIdx !== -1 ? Number(args[daysIdx + 1]) : 30;
    const outFile = outIdx !== -1 ? args[outIdx + 1] : undefined;

    const report = generateCalendarMatrix(topic, days);

    let mdOutput = `# 30-Day Omnichannel Editorial Matrix: ${report.topic}\n\n`;
    mdOutput += `> **Pillar Distribution**: Contrarian Authority ${report.pillarDistribution.contrarianAuthority}% | Technical Receipts ${report.pillarDistribution.technicalReceipts}% | Tactical Playbooks ${report.pillarDistribution.tacticalPlaybook}% | Reactive Slack ${report.pillarDistribution.cultureAndSlack}%\n\n`;
    mdOutput += `| Day | Weekday | Platform | Content Pillar | Format | Hook Direction | Standalone Quotable Anchor | Status |\n`;
    mdOutput += `|:---|:---|:---|:---|:---|:---|:---|:---|\n`;

    for (const e of report.entries) {
      mdOutput += `| **Day ${e.day}** | ${e.weekday} | ${e.platform} | ${e.pillar} | ${e.format} | "${e.hook}" | "${e.standaloneQuotable}" | ${e.status} |\n`;
    }

    if (outFile) {
      const dir = path.dirname(outFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outFile, mdOutput, "utf8");
    }

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      if (outFile) {
        console.log(`\n✅ Scaffolded 30-day matrix for '${topic}' to ${outFile}`);
      } else {
        console.log(mdOutput);
      }
    }
    process.exit(0);
  }

  const auditIdx = args.indexOf("--audit-schedule");
  if (auditIdx !== -1 && args[auditIdx + 1]) {
    const targetFile = args[auditIdx + 1];
    const report = auditScheduleContent(targetFile);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n📣 Social Editorial Schedule Audit: ${report.file}`);
      console.log(`Total Slots Analyzed:  ${report.totalSlots}`);
      console.log(`Has Slack Buffer:      ${report.hasSlackSlots ? "YES" : "NO"}`);
      console.log(`Quotable Anchors:      ${report.quotableCount}`);
      console.log(`Schedule Health Score: ${report.overallScore}/100`);
      console.log(`Verdict:               ${report.passed ? "PASS (PUBLISH READY)" : "FAIL (DEFECTS DETECTED)"}\n`);

      if (report.issues.length > 0) {
        console.log("Defects:");
        for (const iss of report.issues) console.log(`  • ${iss}`);
      }
    }
    process.exit(report.passed ? 0 : 1);
  }

  const repurposeIdx = args.indexOf("--repurpose-cascade");
  if (repurposeIdx !== -1) {
    const titleIdx = args.indexOf("--pillar-title");
    const title = titleIdx !== -1 ? args[titleIdx + 1] : "Zero-Downtime Database Migrations";
    const cascade = generateRepurposingCascade(title);

    if (isJson) {
      console.log(JSON.stringify(cascade, null, 2));
    } else {
      console.log(`\n🔄 1-to-5 Pillar Asset Repurposing Cascade: ${title}`);
      for (const d of cascade.derivatives) {
        console.log(`\n[${d.channel}] (${d.format})`);
        if ("leadHook" in d) console.log(`  Hook:  ${d.leadHook}`);
        if ("keyQuote" in d) console.log(`  Quote: ${d.keyQuote}`);
        if ("slideArc" in d) console.log(`  Arc:   ${d.slideArc?.join(" -> ")}`);
      }
    }
    process.exit(0);
  }

  console.log(`calendar-matrix.ts — Omnichannel 30-Day Content Matrix & Editorial Engine

Usage:
  bun calendar-matrix.ts --scaffold-matrix [--topic <topic>] [--output <file>] [--json]
  bun calendar-matrix.ts --audit-schedule <file> [--json]
  bun calendar-matrix.ts --repurpose-cascade --pillar-title <title> [--json]
`);
  process.exit(0);
}
