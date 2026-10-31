#!/usr/bin/env bun
/**
 * Autonomous C-Suite Weekly Briefing Generator (client-comms:executive-pulse)
 *
 * Implements PLS-001–PLS-004 invariants:
 * - PLS-001: Layman Impact Translation (Zero technical jargon, business value translation, anti-slop)
 * - PLS-002: Sprint Velocity & Budget Runway Tracking (Milestone completion %, burn velocity, runway weeks)
 * - PLS-003: Blocker & Risk Radar (Severity-rated blockers, named owners, 48h mitigation proposals)
 * - PLS-004: Executive One-Pager HTML/PDF Scaffolding (Print-ready HTML with KPI cards, OKLCH colors, @media print)
 */

import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// =========================================================================
// Types & Interfaces
// =========================================================================

export interface TechnicalMilestone {
  technicalName: string;
  category: "engineering" | "infrastructure" | "security" | "design" | "marketing";
  status: "COMPLETED" | "IN_PROGRESS" | "BLOCKED";
  commitsCount: number;
}

export interface LaymanImpactItem {
  headline: string;
  businessImpact: string;
  category: string;
  isJargonFree: boolean;
  flaggedJargon: string[];
}

export interface SprintVelocityMetrics {
  sprintNumber: number;
  startDate: string;
  endDate: string;
  milestonesCompleted: number;
  totalMilestones: number;
  completionPercent: number;
  totalContractValueDollars: number;
  budgetSpentDollars: number;
  budgetRemainingDollars: number;
  weeklyBurnRateDollars: number;
  runwayWeeksRemaining: number;
}

export interface ExecutiveRiskItem {
  riskId: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  namedOwner: string;
  deadlineDate: string;
  mitigationProposal48h: string;
}

export interface ExecutivePulsePacket {
  projectName: string;
  clientName: string;
  weekEndingDate: string;
  executiveSummary: string;
  metrics: SprintVelocityMetrics;
  laymanHighlights: LaymanImpactItem[];
  risksAndBlockers: ExecutiveRiskItem[];
  nextWeekPriorities: string[];
  htmlOnePager: string;
  summaryMarkdown: string;
}

// =========================================================================
// Anti-Jargon & Translation Engine
// =========================================================================

const TECHNICAL_JARGON_DICTIONARY: Record<string, string> = {
  orm: "database access layer",
  mtls: "secure encrypted inter-server connection",
  swr: "instant-load smart caching",
  dag: "structured task workflow",
  ast: "code syntax structure",
  rpc: "direct server communication",
  pr: "reviewed code update",
  commit: "verified system improvement",
  spiffe: "cryptographic server identification",
  cls: "screen layout visual jumping",
  lcp: "page load speed",
  inp: "click responsiveness",
};

export function sanitizeJargon(text: string): { sanitized: string; flaggedJargon: string[]; isClean: boolean } {
  const flaggedJargon: string[] = [];
  let sanitized = text;

  for (const [jargon, plainEnglish] of Object.entries(TECHNICAL_JARGON_DICTIONARY)) {
    const regex = new RegExp(`\\b${jargon}\\b`, "gi");
    if (regex.test(sanitized)) {
      flaggedJargon.push(jargon.toUpperCase());
      sanitized = sanitized.replace(regex, plainEnglish);
    }
  }

  return {
    sanitized,
    flaggedJargon,
    isClean: flaggedJargon.length === 0,
  };
}

// =========================================================================
// Executive Pulse Engine Class
// =========================================================================

export class ExecutivePulseEngine {
  /**
   * PLS-001: Translates raw engineering achievements into executive business value
   */
  translateToLaymanImpact(milestones: TechnicalMilestone[]): LaymanImpactItem[] {
    const translationMap: Record<string, { headline: string; impact: string }> = {
      "coupling-router:swarm": {
        headline: "Parallel Autonomous Swarm Coordination",
        impact:
          "Accelerated engineering throughput by 3.5x, allowing complex multi-step delivery tasks to run simultaneously without risking system instability.",
      },
      "database:graph": {
        headline: "Cognitive Knowledge Base & Memory Protection",
        impact:
          "Connected all historical decisions into an instant relationship web, ensuring customer data remains strictly partitioned behind digital vaults.",
      },
      "brand:story-engine": {
        headline: "Founding Story & High-Converting Pitch Suite",
        impact:
          "Established a clear, memorable brand voice that eliminates corporate buzzwords and arms sales teams with 15-second and 30-second elevator pitches.",
      },
      "qa-launch:chaos": {
        headline: "Automated Outage & Traffic Resilience Testing",
        impact:
          "Proactively tested simulated server crashes and network lag, ensuring clients experience zero data loss or checkout failures during traffic spikes.",
      },
      "muse-security:zero-trust": {
        headline: "Zero-Trust Enterprise Security Perimeter",
        impact:
          "Locked down all automated tools with short-lived digital badges and modern encryption, eliminating confidential credential leakage risks.",
      },
      "analytics:attribution-graph": {
        headline: "Game-Theory Advertising Attribution & Budget Advisor",
        impact:
          "Accurately measured real customer acquisition paths across ad platforms, identifying wasted marketing spend and recommending highest-ROI channels.",
      },
    };

    return milestones.map((m) => {
      const match = translationMap[m.technicalName] || {
        headline: m.technicalName.replace(/[-_:]/g, " ").toUpperCase(),
        impact:
          "Delivered planned capability to production with complete automated verification receipts and zero regression.",
      };

      const audit = sanitizeJargon(match.impact);

      return {
        headline: match.headline,
        businessImpact: audit.sanitized,
        category: m.category,
        isJargonFree: audit.isClean,
        flaggedJargon: audit.flaggedJargon,
      };
    });
  }

  /**
   * PLS-002: Computes sprint velocity, budget burn, and runway forecasts
   */
  computeVelocityMetrics(
    completedMilestones: number,
    totalMilestones: number,
    contractValue = 120000,
    budgetSpent = 48000,
    weeklyBurn = 8000,
  ): SprintVelocityMetrics {
    const completionPercent = Number(((completedMilestones / totalMilestones) * 100).toFixed(1));
    const budgetRemaining = Math.max(0, contractValue - budgetSpent);
    const runwayWeeksRemaining = weeklyBurn > 0 ? Number((budgetRemaining / weeklyBurn).toFixed(1)) : 0;

    return {
      sprintNumber: 4,
      startDate: "2026-10-21",
      endDate: "2026-10-28",
      milestonesCompleted: completedMilestones,
      totalMilestones,
      completionPercent,
      totalContractValueDollars: contractValue,
      budgetSpentDollars: budgetSpent,
      budgetRemainingDollars: budgetRemaining,
      weeklyBurnRateDollars: weeklyBurn,
      runwayWeeksRemaining,
    };
  }

  /**
   * PLS-003: Evaluates risk radar with named owners and 48-hour mitigations
   */
  evaluateRiskRadar(risks: ExecutiveRiskItem[]): ExecutiveRiskItem[] {
    // Validate each risk has severity, owner, and actionable 48-hour mitigation
    return risks.map((r) => {
      if (!r.mitigationProposal48h || r.mitigationProposal48h.length < 15) {
        return {
          ...r,
          mitigationProposal48h: "Immediate 48h Stop-the-Clock alignment session scheduled with Principal Architect.",
        };
      }
      return r;
    });
  }

  /**
   * PLS-004: Generates print-ready HTML one-pager with fluid typography & OKLCH styles
   */
  scaffoldHtmlOnePager(packet: Omit<ExecutivePulsePacket, "htmlOnePager" | "summaryMarkdown">): string {
    const { projectName, clientName, weekEndingDate, metrics, laymanHighlights, risksAndBlockers, nextWeekPriorities } =
      packet;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Pulse — ${projectName} (${weekEndingDate})</title>
  <style>
    :root {
      --bg: oklch(0.99 0.005 250);
      --card-bg: oklch(1 0 0);
      --text: oklch(0.2 0.02 250);
      --text-muted: oklch(0.45 0.02 250);
      --border: oklch(0.9 0.01 250);
      --primary: oklch(0.45 0.18 255);
      --success: oklch(0.55 0.16 145);
      --warning: oklch(0.65 0.18 65);
      --danger: oklch(0.55 0.22 25);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: oklch(0.14 0.02 250);
        --card-bg: oklch(0.18 0.02 250);
        --text: oklch(0.95 0.01 250);
        --text-muted: oklch(0.7 0.02 250);
        --border: oklch(0.25 0.02 250);
        --primary: oklch(0.65 0.18 255);
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: clamp(1rem, 3vw, 2.5rem);
      max-inline-size: 1100px;
      margin-inline: auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid var(--border);
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: clamp(1.4rem, 2.5vw, 2rem); font-weight: 800; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: color-mix(in oklch, var(--primary) 15%, transparent);
      color: var(--primary);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .kpi-val { font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .kpi-sub { font-size: 0.85rem; color: var(--text-muted); }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; }
    .highlight-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .highlight-title { font-weight: 700; color: var(--text); }
    .highlight-body { font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem; }
    .risk-badge-high { color: var(--danger); font-weight: 700; }
    .risk-badge-med { color: var(--warning); font-weight: 700; }
    @media print {
      body { padding: 0; background: white; color: black; max-inline-size: 100%; }
      .kpi-card, .highlight-card { border-color: #ccc; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <span class="badge">WEEKLY EXECUTIVE PULSE</span>
      <h1>${projectName}</h1>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Prepared for C-Suite Leadership at ${clientName}</p>
    </div>
    <div style="text-align: right;">
      <p style="font-weight: 700;">Week Ending</p>
      <p style="color: var(--text-muted);">${weekEndingDate}</p>
    </div>
  </header>

  <section class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-sub">Sprint Velocity</div>
      <div class="kpi-val">${metrics.completionPercent}%</div>
      <div class="kpi-sub">${metrics.milestonesCompleted} of ${metrics.totalMilestones} Milestones Closed</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-sub">Budget Consumed</div>
      <div class="kpi-val">$${metrics.budgetSpentDollars.toLocaleString()}</div>
      <div class="kpi-sub">of $${metrics.totalContractValueDollars.toLocaleString()} Contract Value</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-sub">Projected Runway</div>
      <div class="kpi-val">${metrics.runwayWeeksRemaining} wks</div>
      <div class="kpi-sub">at $${metrics.weeklyBurnRateDollars.toLocaleString()}/wk velocity</div>
    </div>
  </section>

  <section style="margin-bottom: 2rem;">
    <h2 class="section-title">💎 Shipped Capabilities & Business Value</h2>
    ${laymanHighlights
      .map(
        (h) => `
    <div class="highlight-card">
      <div class="highlight-title">${h.headline}</div>
      <div class="highlight-body">${h.businessImpact}</div>
    </div>`,
      )
      .join("")}
  </section>

  <section style="margin-bottom: 2rem;">
    <h2 class="section-title">🛡️ Risk & Blocker Radar (48h Action Path)</h2>
    ${risksAndBlockers
      .map(
        (r) => `
    <div class="highlight-card">
      <div style="display: flex; justify-content: space-between;">
        <span class="highlight-title">${r.description}</span>
        <span class="${r.severity === "HIGH" ? "risk-badge-high" : "risk-badge-med"}">${r.severity} PRIORITY</span>
      </div>
      <div class="highlight-body"><strong>Mitigation:</strong> ${r.mitigationProposal48h} (Owner: <em>${r.namedOwner}</em> by ${r.deadlineDate})</div>
    </div>`,
      )
      .join("")}
  </section>

  <section>
    <h2 class="section-title">🚀 Next Week Executive Horizons</h2>
    <ul style="padding-left: 1.25rem; color: var(--text-muted);">
      ${nextWeekPriorities.map((p) => `<li style="margin-bottom: 0.4rem;"><strong>${p}</strong></li>`).join("")}
    </ul>
  </section>
</body>
</html>`;
  }

  /**
   * Assembles full executive pulse report
   */
  generateExecutiveReport(projectName: string, clientName: string): ExecutivePulsePacket {
    const rawMilestones: TechnicalMilestone[] = [
      { technicalName: "coupling-router:swarm", category: "engineering", status: "COMPLETED", commitsCount: 14 },
      { technicalName: "database:graph", category: "infrastructure", status: "COMPLETED", commitsCount: 12 },
      { technicalName: "brand:story-engine", category: "marketing", status: "COMPLETED", commitsCount: 9 },
      { technicalName: "qa-launch:chaos", category: "security", status: "COMPLETED", commitsCount: 11 },
      { technicalName: "muse-security:zero-trust", category: "security", status: "COMPLETED", commitsCount: 15 },
      { technicalName: "analytics:attribution-graph", category: "marketing", status: "COMPLETED", commitsCount: 10 },
    ];

    const laymanHighlights = this.translateToLaymanImpact(rawMilestones);
    const metrics = this.computeVelocityMetrics(rawMilestones.length, 8, 150000, 60000, 10000);

    const risks: ExecutiveRiskItem[] = [
      {
        riskId: "risk-sso-approval",
        description: "Enterprise Okta SSO Client App Review Pending",
        severity: "MEDIUM",
        namedOwner: "Client Security Lead (Marcus)",
        deadlineDate: "2026-10-30",
        mitigationProposal48h:
          "Pre-configured sandbox mock tenant ready to bypass production blocker and preserve sprint velocity.",
      },
      {
        riskId: "risk-ad-spend",
        description: "Meta Ads Spend Haircut Discrepancy",
        severity: "LOW",
        namedOwner: "Jasper (Growth Lead)",
        deadlineDate: "2026-10-31",
        mitigationProposal48h:
          "Applying Shapley attribution model to reallocate 30% of budget toward organic high-intent channels.",
      },
    ];

    const risksAndBlockers = this.evaluateRiskRadar(risks);

    const nextWeekPriorities = [
      "Finalize Enterprise Okta SSO Tenant Credentials & Security Review Sign-off.",
      "Execute automated performance stress benchmark on global edge mesh routing.",
      "Deliver final productized agency SKU packages and founder executive sign-off.",
    ];

    const executiveSummary =
      "Sprint velocity remains robust with 75% of quarter milestones closed ahead of schedule. All 6 core technical capabilities landed cleanly with zero reported bugs, full automated verification, and $90,000 in remaining budget runway (9.0 weeks).";

    const basePacket = {
      projectName,
      clientName,
      weekEndingDate: "2026-10-28",
      executiveSummary,
      metrics,
      laymanHighlights,
      risksAndBlockers,
      nextWeekPriorities,
    };

    const htmlOnePager = this.scaffoldHtmlOnePager(basePacket);

    const summaryMarkdown = [
      `# 💼 C-Suite Executive Pulse: ${projectName}`,
      "",
      `> **Client**: ${clientName} | **Week Ending**: ${basePacket.weekEndingDate} | **Runway**: ${metrics.runwayWeeksRemaining} Weeks`,
      "",
      "## 📊 Executive KPI Snapshot (PLS-002)",
      `- **Sprint Velocity**: **${metrics.completionPercent}%** (${metrics.milestonesCompleted} of ${metrics.totalMilestones} Milestones Closed)`,
      `- **Contract Value**: $${metrics.totalContractValueDollars.toLocaleString()}`,
      `- **Budget Consumed**: $${metrics.budgetSpentDollars.toLocaleString()} ($${metrics.budgetRemainingDollars.toLocaleString()} remaining)`,
      `- **Burn Rate**: $${metrics.weeklyBurnRateDollars.toLocaleString()} / week`,
      "",
      "## 💎 Shipped Business Impact (PLS-001)",
      ...laymanHighlights.map((h) => `- **${h.headline}**: ${h.businessImpact}`),
      "",
      "## 🛡️ Risk & Blocker Radar (PLS-003)",
      ...risksAndBlockers.map(
        (r) =>
          `- [**${r.severity}**] ${r.description} — *Mitigation: ${r.mitigationProposal48h}* (Owner: ${r.namedOwner})`,
      ),
      "",
      "## 🚀 Next Week Priorities",
      ...nextWeekPriorities.map((p) => `- ${p}`),
    ].join("\n");

    return {
      ...basePacket,
      htmlOnePager,
      summaryMarkdown,
    };
  }
}

// =========================================================================
// CLI Implementation
// =========================================================================

export function runCli() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      project: { type: "string", default: "Project Titan" },
      client: { type: "string", default: "Acme Enterprise Corp" },
      "export-html": { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
💼 Autonomous C-Suite Weekly Briefing Generator (client-comms:executive-pulse)

Usage:
  bun client-comms/scripts/executive-pulse.ts [options]

Options:
  --project <name>       Project title (default: Project Titan)
  --client <name>        Client company name (default: Acme Enterprise Corp)
  --export-html <path>   Write print-ready executive HTML one-pager
  --json                 Output structured JSON
  --help                 Show this help message
`);
    process.exit(0);
  }

  const engine = new ExecutivePulseEngine();
  const report = engine.generateExecutiveReport(values.project as string, values.client as string);

  if (values["export-html"]) {
    writeFileSync(values["export-html"] as string, report.htmlOnePager, "utf8");
    console.log(`✅ Saved executive HTML one-pager to ${values["export-html"]}`);
  }

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(report.summaryMarkdown);
  }

  process.exit(0);
}

if (import.meta.main) {
  runCli();
}
