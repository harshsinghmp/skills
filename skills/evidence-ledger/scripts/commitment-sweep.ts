#!/usr/bin/env bun
/**
 * 📜 commitment-sweep.ts — Sovereign Commitment & Deadline Tracking Engine
 *
 * Absorbs legacy external CommitmentSweep into the evidence-ledger department.
 * Scans evidence ledgers, current state documents, intake briefs, and git issues
 * to auto-detect:
 *   1. Promised client milestones
 *   2. Agreed deliverables and due dates
 *   3. 48h clock-stop triggers with overdue warning stamps
 *
 * Usage:
 *   bun skills/context-orchestration/evidence-ledger/scripts/commitment-sweep.ts [dir]
 *   bun skills/context-orchestration/evidence-ledger/scripts/commitment-sweep.ts --json
 *   bun skills/context-orchestration/evidence-ledger/scripts/commitment-sweep.ts --dry-run
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export interface Commitment {
  id: string;
  subject: string;
  beneficiary: string;
  due: string; // YYYY-MM-DD
  daysUntilDue: number; // Negative if overdue
  bucket: "overdue" | "due_today" | "due_this_week" | "future";
  status: "PROMISED" | "FULFILLED" | "OVERDUE";
  warningStamp: string;
  clockStopTrigger?: boolean;
  clockStopStamp?: string;
  source: string;
  evidenceSnippet?: string;
}

export interface CommitmentDigest {
  timestamp: string;
  projectDir: string;
  totalCommitments: number;
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  clockStopCount: number;
  buckets: {
    overdue: Commitment[];
    due_today: Commitment[];
    due_this_week: Commitment[];
    future: Commitment[];
  };
  markdownDigest: string;
}

export function parseDate(dueStr: string, refDate: Date = new Date()): string | null {
  const clean = dueStr.trim();
  // ISO date YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return clean;

  const lower = clean.toLowerCase();
  const d = new Date(refDate);

  if (lower === "today" || lower === "eod") {
    return d.toISOString().slice(0, 10);
  }
  if (lower === "tomorrow") {
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes("48h") || lower.includes("48 hours") || lower.includes("2 days")) {
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }
  if (lower === "next week") {
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lower.includes(daysOfWeek[i])) {
      const currentDay = d.getDay();
      const targetDay = i;
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().slice(0, 10);
    }
  }

  // Try standard parse
  const parsed = new Date(clean);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

export function computeDaysUntilDue(dueDateStr: string, refDate: Date = new Date()): number {
  const [year, month, day] = dueDateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const current = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffTime = target.getTime() - current.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function evaluateCommitmentBucket(daysUntilDue: number): {
  bucket: "overdue" | "due_today" | "due_this_week" | "future";
  status: "PROMISED" | "FULFILLED" | "OVERDUE";
  warningStamp: string;
} {
  if (daysUntilDue < 0) {
    return {
      bucket: "overdue",
      status: "OVERDUE",
      warningStamp: `⚠️ OVERDUE [${Math.abs(daysUntilDue)}d overdue]`,
    };
  }
  if (daysUntilDue === 0) {
    return {
      bucket: "due_today",
      status: "PROMISED",
      warningStamp: "🔔 DUE TODAY",
    };
  }
  if (daysUntilDue <= 7) {
    return {
      bucket: "due_this_week",
      status: "PROMISED",
      warningStamp: `⏳ DUE THIS WEEK [in ${daysUntilDue}d]`,
    };
  }
  return {
    bucket: "future",
    status: "PROMISED",
    warningStamp: `📅 FUTURE [in ${daysUntilDue}d]`,
  };
}

export function detectCommitmentsFromText(text: string, source: string, refDate: Date = new Date()): Commitment[] {
  const commitments: Commitment[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isClockStop = /clock[-\s]?stop|stop[-\s]the[-\s]clock|48h clock|48-hour SLA|access revocation.*48h/i.test(
      line,
    );

    // Look for explicit commitment markers
    // Format A: commitment-due: YYYY-MM-DD
    const dueCommentMatch = line.match(/commitment-due:\s*([^\s;]+)/i);

    // Format B: Due: YYYY-MM-DD or Deadline: YYYY-MM-DD or by YYYY-MM-DD
    const dueKeywordMatch = line.match(
      /(?:due|deadline|promised\s+by|deliver\s+by|by)\s*[:=]?\s*(\d{4}-\d{2}-\d{2}|today|tomorrow|next\s+week|[0-9]+\s*(?:days|hours|h))(?:[;,.]|\s|$)/i,
    );

    // Format C: Generic date in line with promise/milestone/deliverable
    const dateInLineMatch = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);

    // Format D: Milestone / Deliverable / Commitment with beneficiary
    const deliverableMatch = line.match(
      /(?:promise|promised|committed|agree|agreed|milestone|deliverable)\s+(?:to\s+)?([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)?)\s+(?:to|that|we\s+will|deliver|ship|by|due)\s+([^.\n]+)/i,
    );

    const rawDue = dueCommentMatch
      ? dueCommentMatch[1]
      : dueKeywordMatch
        ? dueKeywordMatch[1]
        : deliverableMatch && dateInLineMatch
          ? dateInLineMatch[1]
          : isClockStop
            ? "in 48h"
            : null;

    if (rawDue || isClockStop) {
      const parsedDue = rawDue ? parseDate(rawDue, refDate) : parseDate("in 48h", refDate);
      if (parsedDue) {
        const days = computeDaysUntilDue(parsedDue, refDate);
        const evaluation = evaluateCommitmentBucket(days);

        let subject = "Agreed Client Deliverable";
        let beneficiary = "Client / Stakeholder";

        if (deliverableMatch) {
          beneficiary = deliverableMatch[1].trim();
          subject = deliverableMatch[2].trim();
        } else if (isClockStop) {
          subject = "48h Client Clarification & Scope Stop-the-Clock";
          beneficiary = "Client";
        } else {
          subject = line
            .replace(/^[#\s\-*|]+/, "")
            .trim()
            .slice(0, 80);
        }

        let clockStopStamp: string | undefined;
        if (isClockStop) {
          if (days < 0) {
            clockStopStamp = `🛑 48H CLOCK STOP EXPIRED [${Math.abs(days)}d ago — HOLD SOW WORK]`;
          } else {
            clockStopStamp = `🛑 48H CLOCK STOP ACTIVE [${days}d remaining before freeze]`;
          }
        }

        commitments.push({
          id: `CMT-${commitments.length + 1}`,
          subject,
          beneficiary,
          due: parsedDue,
          daysUntilDue: days,
          bucket: evaluation.bucket,
          status: evaluation.status,
          warningStamp: evaluation.warningStamp,
          clockStopTrigger: isClockStop,
          clockStopStamp,
          source: `${source}:${i + 1}`,
          evidenceSnippet: line.trim(),
        });
      }
    }
  }

  return commitments;
}

export async function sweepCommitments(
  projectDir: string,
  options: { refDate?: Date } = {},
): Promise<CommitmentDigest> {
  const refDate = options.refDate || new Date();
  const allCommitments: Commitment[] = [];

  // 1. Scan .agents/context/evidence-ledger.md
  const ledgerPath = join(projectDir, ".agents", "context", "evidence-ledger.md");
  if (existsSync(ledgerPath)) {
    try {
      const content = readFileSync(ledgerPath, "utf8");
      allCommitments.push(...detectCommitmentsFromText(content, relative(projectDir, ledgerPath), refDate));
    } catch {}
  }

  // 2. Scan .agents/context/current.md
  const currentPath = join(projectDir, ".agents", "context", "current.md");
  if (existsSync(currentPath)) {
    try {
      const content = readFileSync(currentPath, "utf8");
      allCommitments.push(...detectCommitmentsFromText(content, relative(projectDir, currentPath), refDate));
    } catch {}
  }

  // 3. Scan Client-Intake/
  const intakeDir = join(projectDir, "Client-Intake");
  if (existsSync(intakeDir)) {
    try {
      const files = readdirSync(intakeDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = join(intakeDir, file);
          const content = readFileSync(filePath, "utf8");
          allCommitments.push(...detectCommitmentsFromText(content, relative(projectDir, filePath), refDate));
        }
      }
    } catch {}
  }

  // 4. Query GitHub issues if available
  try {
    const ghCheck = spawnSync("which", ["gh"], { stdio: "ignore" });
    if (ghCheck.status === 0) {
      const ghRes = spawnSync(
        "gh",
        ["issue", "list", "--state", "open", "--json", "number,title,body,labels,updatedAt"],
        { cwd: projectDir, encoding: "utf8" },
      );
      if (ghRes.status === 0 && ghRes.stdout.trim()) {
        const issues = JSON.parse(ghRes.stdout) as Array<{
          number: number;
          title: string;
          body: string;
          labels: Array<{ name: string }>;
        }>;
        for (const issue of issues) {
          const combined = `# ${issue.title}\n${issue.body || ""}`;
          allCommitments.push(...detectCommitmentsFromText(combined, `gh#${issue.number}`, refDate));
        }
      }
    }
  } catch {}

  // Deduplicate by subject + due date
  const uniqueMap = new Map<string, Commitment>();
  for (const c of allCommitments) {
    const key = `${c.subject.toLowerCase()}:${c.due}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, c);
    }
  }

  const commitments = Array.from(uniqueMap.values());

  const buckets = {
    overdue: commitments.filter((c) => c.bucket === "overdue"),
    due_today: commitments.filter((c) => c.bucket === "due_today"),
    due_this_week: commitments.filter((c) => c.bucket === "due_this_week"),
    future: commitments.filter((c) => c.bucket === "future"),
  };

  const overdueCount = buckets.overdue.length;
  const dueTodayCount = buckets.due_today.length;
  const dueThisWeekCount = buckets.due_this_week.length;
  const clockStopCount = commitments.filter((c) => c.clockStopTrigger).length;

  let markdownDigest = `# 📜 Commitment & Milestone Sweep Report\n\n`;
  markdownDigest += `> **Sweep Time**: ${refDate.toISOString()} • **Active Commitments**: ${commitments.length}\n`;
  markdownDigest += `> **Alerts**: ${overdueCount} Overdue, ${dueTodayCount} Due Today, ${clockStopCount} Clock-Stop Trigger(s)\n\n`;

  if (overdueCount > 0) {
    markdownDigest += `## 🚨 OVERDUE DELIVERABLES (${overdueCount})\n\n`;
    markdownDigest += `| Due Date | Warning Stamp | Deliverable / Subject | Beneficiary | Source |\n`;
    markdownDigest += `|:---|:---|:---|:---|:---|\n`;
    for (const c of buckets.overdue) {
      markdownDigest += `| **${c.due}** | \`${c.warningStamp}\` | ${c.subject} | ${c.beneficiary} | \`${c.source}\` |\n`;
      if (c.clockStopStamp) {
        markdownDigest += `| ↳ **Clock-Stop** | \`${c.clockStopStamp}\` | - | - | - |\n`;
      }
    }
    markdownDigest += `\n`;
  }

  if (dueTodayCount > 0) {
    markdownDigest += `## 🔔 DUE TODAY (${dueTodayCount})\n\n`;
    markdownDigest += `| Due Date | Status | Deliverable / Subject | Beneficiary | Source |\n`;
    markdownDigest += `|:---|:---|:---|:---|:---|\n`;
    for (const c of buckets.due_today) {
      markdownDigest += `| **${c.due}** | \`${c.warningStamp}\` | ${c.subject} | ${c.beneficiary} | \`${c.source}\` |\n`;
    }
    markdownDigest += `\n`;
  }

  if (dueThisWeekCount > 0) {
    markdownDigest += `## ⏳ DUE THIS WEEK (${dueThisWeekCount})\n\n`;
    markdownDigest += `| Due Date | Timeline | Deliverable / Subject | Beneficiary | Source |\n`;
    markdownDigest += `|:---|:---|:---|:---|:---|\n`;
    for (const c of buckets.due_this_week) {
      markdownDigest += `| **${c.due}** | \`${c.warningStamp}\` | ${c.subject} | ${c.beneficiary} | \`${c.source}\` |\n`;
    }
    markdownDigest += `\n`;
  }

  if (buckets.future.length > 0) {
    markdownDigest += `## 📅 UPCOMING COMMITMENTS (${buckets.future.length})\n\n`;
    markdownDigest += `| Due Date | Timeline | Deliverable / Subject | Beneficiary | Source |\n`;
    markdownDigest += `|:---|:---|:---|:---|:---|\n`;
    for (const c of buckets.future) {
      markdownDigest += `| ${c.due} | \`${c.warningStamp}\` | ${c.subject} | ${c.beneficiary} | \`${c.source}\` |\n`;
    }
    markdownDigest += `\n`;
  }

  return {
    timestamp: refDate.toISOString(),
    projectDir,
    totalCommitments: commitments.length,
    overdueCount,
    dueTodayCount,
    dueThisWeekCount,
    clockStopCount,
    buckets,
    markdownDigest,
  };
}

export async function main() {
  const args = process.argv.slice(2);
  let projectDir = process.cwd();
  let jsonOutput = false;

  for (const arg of args) {
    if (arg === "--json") jsonOutput = true;
    else if (!arg.startsWith("-")) projectDir = arg;
  }

  const digest = await sweepCommitments(projectDir);

  if (jsonOutput) {
    console.log(JSON.stringify(digest, null, 2));
  } else {
    console.log(digest.markdownDigest);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("CommitmentSweep error:", err);
    process.exit(1);
  });
}
