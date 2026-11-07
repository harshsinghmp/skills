#!/usr/bin/env bun
/**
 * Client Health Telemetry & Churn Early Warning Radar Engine
 *
 * Implements HLT-001–HLT-004 invariants:
 * - HLT-001: Tri-Vector Health Scoring (Product Telemetry 40%, CSAT/Sentiment 30%, Financial Velocity 30%)
 * - HLT-002: Churn Early Warning Radar (Green >= 75, Amber 50-74, Red < 50)
 * - HLT-003: 48h Stop-the-Clock Intervention Protocol (billing/SLA pause, executive alignment, CAP generation)
 * - HLT-004: Executive Health Scorecard & Net Retention Rate (NRR) Forecasting
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

// =========================================================================
// Types & Interfaces
// =========================================================================

export type HealthTier = "GREEN" | "AMBER" | "RED";

export interface HealthScoreResult {
  productTelemetry: number; // 0-100
  sentimentScore: number; // 0-100
  financialVelocity: number; // 0-100
  compositeScore: number; // 0-100
  tier: HealthTier;
  label: string;
  isExpansionReady: boolean;
  isChurnRisk: boolean;
  requiresIntervention: boolean;
}

export interface AccountHealthInput {
  accountName: string;
  monthlyRevenue: number;
  productTelemetry: number; // 0-100 (milestones, uptime, tickets)
  sentimentScore: number; // 0-100 (response latency, CSAT, sponsor stability)
  financialVelocity: number; // 0-100 (DSO, invoice promptness, capacity burn)
  hasSponsorTurnover?: boolean;
  hasOverdueInvoice?: boolean;
  overdueDays?: number;
  slaBreachCount?: number;
}

export interface AccountHealthEvaluation {
  accountName: string;
  monthlyRevenue: number;
  health: HealthScoreResult;
  riskFactors: string[];
  recommendations: string[];
  interventionRequired: boolean;
  capPlanSuggested: boolean;
}

export interface NrrInput {
  startingArr: number;
  expansionArr: number;
  contractionArr: number;
  churnArr: number;
}

export interface NrrResult {
  startingArr: number;
  endingArr: number;
  expansionArr: number;
  contractionArr: number;
  churnArr: number;
  netRetentionRate: number; // Percentage, e.g. 118.5%
  grossRetentionRate: number; // Percentage, e.g. 92.0%
  isHealthyNrr: boolean; // >= 115% benchmark
  summary: string;
}

export interface PortfolioScorecardResult {
  totalAccounts: number;
  totalMonthlyRevenue: number;
  averageHealthScore: number;
  distribution: {
    green: { count: number; revenue: number; percentage: number };
    amber: { count: number; revenue: number; percentage: number };
    red: { count: number; revenue: number; percentage: number };
  };
  atRiskRevenue: number; // Revenue in Red tier
  expansionPotentialRevenue: number; // Revenue in Green tier
  accounts: AccountHealthEvaluation[];
}

// =========================================================================
// Core Algorithms & Invariant Enforcers
// =========================================================================

/**
 * HLT-001: Tri-Vector Health Scoring
 * Formula: H = 0.40 * Product + 0.30 * Sentiment + 0.30 * Financial
 */
export function calculateHealthScore(
  productTelemetry: number,
  sentimentScore: number,
  financialVelocity: number,
): HealthScoreResult {
  const p = Math.max(0, Math.min(100, productTelemetry));
  const s = Math.max(0, Math.min(100, sentimentScore));
  const f = Math.max(0, Math.min(100, financialVelocity));

  const composite = Math.round((0.4 * p + 0.3 * s + 0.3 * f) * 10) / 10;

  // HLT-002: Churn Early Warning Radar Tiering
  let tier: HealthTier = "GREEN";
  let label = "Stable / Expansion Ready";
  let isExpansionReady = true;
  let isChurnRisk = false;
  let requiresIntervention = false;

  if (composite < 50) {
    tier = "RED";
    label = "Critical Churn Alert";
    isExpansionReady = false;
    isChurnRisk = true;
    requiresIntervention = true;
  } else if (composite < 75) {
    tier = "AMBER";
    label = "Early Warning Radar";
    isExpansionReady = false;
    isChurnRisk = true;
    requiresIntervention = false;
  }

  return {
    productTelemetry: p,
    sentimentScore: s,
    financialVelocity: f,
    compositeScore: composite,
    tier,
    label,
    isExpansionReady,
    isChurnRisk,
    requiresIntervention,
  };
}

/**
 * HLT-002: Evaluate Single Account Health & Risk Indicators
 */
export function evaluateAccountHealth(input: AccountHealthInput): AccountHealthEvaluation {
  const health = calculateHealthScore(input.productTelemetry, input.sentimentScore, input.financialVelocity);

  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // Telemetry vector checks
  if (input.productTelemetry < 60) {
    riskFactors.push(
      `Deliverable Telemetry Lag (${input.productTelemetry}/100): Milestone delays or elevated bug defect count detected.`,
    );
    recommendations.push("Conduct internal sprint review and prioritize outstanding P0/P1 delivery tickets.");
  }
  if ((input.slaBreachCount ?? 0) > 0) {
    riskFactors.push(`SLA Breaches (${input.slaBreachCount}): Retainer response or turnaround threshold violated.`);
    recommendations.push("Re-baseline ticket capacity and trigger 30-day warranty capacity review.");
  }

  // Sentiment vector checks
  if (input.sentimentScore < 60) {
    riskFactors.push(
      `Sentiment Drop (${input.sentimentScore}/100): Slow client communication, delayed feedback, or reduced stakeholder warmth.`,
    );
    recommendations.push("Schedule high-touch informal alignment call; review recent Slack/email interaction tone.");
  }
  if (input.hasSponsorTurnover) {
    riskFactors.push("Executive Sponsor Turnover: Key internal champion has left or changed roles.");
    recommendations.push("Trigger immediate 48h executive re-onboarding meeting with new client decision-maker.");
  }

  // Financial vector checks
  if (input.financialVelocity < 60) {
    riskFactors.push(
      `Payment Velocity Slowdown (${input.financialVelocity}/100): Extended invoice lag or payment disputes.`,
    );
    recommendations.push("Verify automated gateway retry schedules; align with finance lead before next sprint lock.");
  }
  if (input.hasOverdueInvoice || (input.overdueDays ?? 0) > 14) {
    riskFactors.push(`Overdue Invoice Alert: Payment past due by ${input.overdueDays ?? 15} days.`);
    recommendations.push("Apply dunning escalation ladder; pause out-of-scope feature development until reconciled.");
  }

  // Expansion triggers
  if (health.isExpansionReady) {
    recommendations.push("Account in peak health: Eligible for QBR 3-tier expansion proposal and case study ask.");
  }

  const interventionRequired = health.tier === "RED" || (input.hasSponsorTurnover ?? false);

  return {
    accountName: input.accountName,
    monthlyRevenue: input.monthlyRevenue,
    health,
    riskFactors,
    recommendations,
    interventionRequired,
    capPlanSuggested: interventionRequired,
  };
}

/**
 * HLT-003: 48h Stop-the-Clock Corrective Action Plan (CAP) Scaffold
 */
export function scaffoldInterventionPlan(accountData: AccountHealthInput, riskIssues: string[]): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const issuesList =
    riskIssues.length > 0
      ? riskIssues.map((issue) => `- ⚠️ ${issue}`).join("\n")
      : "- ⚠️ Composite health score dropped below 50.0 critical churn threshold.";

  return `# 🚨 48h Stop-the-Clock Intervention Plan (CAP)

**Client Account**: ${accountData.accountName}  
**Date Activated**: ${dateStr}  
**Monthly Revenue**: $${accountData.monthlyRevenue.toLocaleString()}  
**Lead Sponsor**: Crew (Operations Lead) & Nexus (Technical Director)  
**Protocol Status**: ACTIVE 48-HOUR INTERVENTION LOCK  

---

## 1. Stop-the-Clock Freeze Notice (HLT-003)
In accordance with agency retention governance:
1. **Billing Clock Frozen**: Retainer hourly burn and upcoming milestone invoice clocks are temporarily suspended for 48 hours.
2. **SLA Penalty Timers Paused**: Turnaround penalties are locked while root-cause remediation is executed.
3. **Out-of-Scope Work Halted**: All non-critical enhancements are paused to focus 100% of capacity on resolution.

---

## 2. Triggering Risk Factors
${issuesList}

---

## 3. Mandatory 48-Hour Corrective Action Sequence
| Phase | Window | Action Item | Owner | Deliverable Receipt |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Root-Cause Triage** | Hours 0–12 | Audit deliverable tickets, payment logs, and communications. Identify core friction point. | Nexus | \`INCIDENT_ROOT_CAUSE.md\` |
| **Phase 2: Sponsor Realignment** | Hours 12–24 | Executive alignment call with client C-suite / Primary Stakeholder. Acknowledge defect; present fix roadmap. | Crew | Executive Call Minutes & Alignment Memo |
| **Phase 3: Remediation Sprint** | Hours 24–40 | Dedicated patch sprint addressing all blockers without billing client hours. | Sol | Deployed & Tested Staging Fixes |
| **Phase 4: Gate & Unfreeze** | Hours 40–48 | Formal client acceptance and sign-off. Lift Stop-the-Clock freeze; resume standard billing. | Crew & Nexus | Joint Re-baselined SOW Agreement |

---

## 4. Re-baselined Milestone Commitments
- **Immediate Deliverable 1**: Resolution of open blockers within 48 hours.
- **Immediate Deliverable 2**: Bi-weekly executive sync scheduled for the next 60 days.
- **Warranty Extension**: Grant 14-day zero-cost SLA warranty extension on affected modules.

*Signed on behalf of Agency Delivery*: \`Crew, Lead Operations Specialist\`
`;
}

/**
 * HLT-004: Calculate Net Retention Rate (NRR) and Gross Retention Rate (GRR)
 */
export function calculateNrr(
  startingArr: number,
  expansionArr: number,
  contractionArr: number,
  churnArr: number,
): NrrResult {
  if (startingArr <= 0) {
    throw new Error("startingArr must be greater than 0");
  }

  const endingArr = startingArr + expansionArr - contractionArr - churnArr;
  const netRetentionRate =
    Math.round(((startingArr + expansionArr - contractionArr - churnArr) / startingArr) * 1000) / 10;
  const grossRetentionRate = Math.round(((startingArr - contractionArr - churnArr) / startingArr) * 1000) / 10;

  const isHealthyNrr = netRetentionRate >= 115;
  const summary = isHealthyNrr
    ? `Strong NRR (${netRetentionRate}%): Expansion ($${expansionArr.toLocaleString()}) outpaces churn and contraction.`
    : `At-Risk NRR (${netRetentionRate}%): Target is >=115%. Churn ($${churnArr.toLocaleString()}) and contraction ($${contractionArr.toLocaleString()}) require retention intervention.`;

  return {
    startingArr,
    endingArr,
    expansionArr,
    contractionArr,
    churnArr,
    netRetentionRate,
    grossRetentionRate,
    isHealthyNrr,
    summary,
  };
}

/**
 * HLT-004: Generate Multi-Client Executive Portfolio Scorecard
 */
export function generatePortfolioScorecard(accounts: AccountHealthInput[]): PortfolioScorecardResult {
  const evaluated = accounts.map((acc) => evaluateAccountHealth(acc));
  const totalAccounts = accounts.length;

  let totalMonthlyRevenue = 0;
  let totalScoreSum = 0;
  let greenCount = 0;
  let greenRevenue = 0;
  let amberCount = 0;
  let amberRevenue = 0;
  let redCount = 0;
  let redRevenue = 0;

  for (const acc of evaluated) {
    totalMonthlyRevenue += acc.monthlyRevenue;
    totalScoreSum += acc.health.compositeScore;

    if (acc.health.tier === "GREEN") {
      greenCount++;
      greenRevenue += acc.monthlyRevenue;
    } else if (acc.health.tier === "AMBER") {
      amberCount++;
      amberRevenue += acc.monthlyRevenue;
    } else {
      redCount++;
      redRevenue += acc.monthlyRevenue;
    }
  }

  const averageHealthScore = totalAccounts > 0 ? Math.round((totalScoreSum / totalAccounts) * 10) / 10 : 0;

  return {
    totalAccounts,
    totalMonthlyRevenue,
    averageHealthScore,
    distribution: {
      green: {
        count: greenCount,
        revenue: greenRevenue,
        percentage: totalAccounts > 0 ? Math.round((greenCount / totalAccounts) * 100) : 0,
      },
      amber: {
        count: amberCount,
        revenue: amberRevenue,
        percentage: totalAccounts > 0 ? Math.round((amberCount / totalAccounts) * 100) : 0,
      },
      red: {
        count: redCount,
        revenue: redRevenue,
        percentage: totalAccounts > 0 ? Math.round((redCount / totalAccounts) * 100) : 0,
      },
    },
    atRiskRevenue: redRevenue,
    expansionPotentialRevenue: greenRevenue,
    accounts: evaluated,
  };
}

// =========================================================================
// CLI Runner
// =========================================================================

function runCli(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "calc-health": { type: "boolean", default: false },
      "audit-account": { type: "boolean", default: false },
      scorecard: { type: "boolean", default: false },
      "scaffold-cap": { type: "boolean", default: false },
      "calc-nrr": { type: "boolean", default: false },
      telemetry: { type: "string", default: "85" },
      sentiment: { type: "string", default: "80" },
      financial: { type: "string", default: "90" },
      account: { type: "string", default: "Client Enterprise" },
      revenue: { type: "string", default: "15000" },
      "sponsor-turnover": { type: "boolean", default: false },
      "overdue-days": { type: "string", default: "0" },
      "sla-breaches": { type: "string", default: "0" },
      "starting-arr": { type: "string", default: "500000" },
      "expansion-arr": { type: "string", default: "90000" },
      "contraction-arr": { type: "string", default: "15000" },
      "churn-arr": { type: "string", default: "20000" },
      in: { type: "string" },
      out: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
📊 client-health-telemetry — Client Retention Health Scoring & Churn Early Warning Radar

Usage:
  bun client-health-telemetry.ts [options]

Commands:
  --calc-health        Calculate tri-vector health score (Product 40%, Sentiment 30%, Financial 30%)
  --audit-account      Audit a single client account with risk and intervention checks
  --scorecard          Generate executive health scorecard across a portfolio JSON input
  --scaffold-cap       Generate a 48h Stop-the-Clock Corrective Action Plan (CAP)
  --calc-nrr           Calculate Net Retention Rate (NRR) and Gross Retention Rate (GRR)

Options:
  --telemetry <0-100>  Product & deliverable telemetry score (default: 85)
  --sentiment <0-100>  CSAT & relationship sentiment score (default: 80)
  --financial <0-100>  Financial & payment velocity score (default: 90)
  --account <name>     Client account name (default: "Client Enterprise")
  --revenue <dollars>  Monthly retainer revenue in USD (default: 15000)
  --sponsor-turnover   Flag indicating executive sponsor left client organization
  --overdue-days <num> Invoice overdue days past terms (default: 0)
  --sla-breaches <num> Retainer SLA breach count (default: 0)
  --starting-arr <num> Starting ARR in USD for NRR calculation (default: 500000)
  --expansion-arr <n>  Expansion ARR in USD (default: 90000)
  --contraction-arr<n> Contraction ARR in USD (default: 15000)
  --churn-arr <num>    Churned ARR in USD (default: 20000)
  --in <file.json>     Input portfolio JSON file
  --out <file.md>      Output file path for generated plans
  --json               Output machine-readable JSON
`);
    process.exit(0);
  }

  const tel = Number(values.telemetry);
  const sent = Number(values.sentiment);
  const fin = Number(values.financial);

  if (values["calc-health"]) {
    const res = calculateHealthScore(tel, sent, fin);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log("📊 Client Health Scorecard (HLT-001):");
      console.log(`  • Composite Score:    ${res.compositeScore}/100`);
      console.log(`  • Health Tier:        ${res.tier} (${res.label})`);
      console.log(`  • Product Telemetry:  ${res.productTelemetry}/100 (Weight: 40%)`);
      console.log(`  • Sentiment Score:    ${res.sentimentScore}/100 (Weight: 30%)`);
      console.log(`  • Financial Velocity: ${res.financialVelocity}/100 (Weight: 30%)`);
      console.log(`  • Expansion Ready:    ${res.isExpansionReady ? "YES" : "NO"}`);
      console.log(`  • Churn Risk:         ${res.isChurnRisk ? "YES" : "NO"}`);
    }
    return;
  }

  if (values["audit-account"]) {
    const evaluation = evaluateAccountHealth({
      accountName: values.account as string,
      monthlyRevenue: Number(values.revenue),
      productTelemetry: tel,
      sentimentScore: sent,
      financialVelocity: fin,
      hasSponsorTurnover: values["sponsor-turnover"] as boolean,
      overdueDays: Number(values["overdue-days"]),
      hasOverdueInvoice: Number(values["overdue-days"]) > 0,
      slaBreachCount: Number(values["sla-breaches"]),
    });

    if (values.json) {
      console.log(JSON.stringify(evaluation, null, 2));
    } else {
      console.log(`🔍 Account Audit: ${evaluation.accountName}`);
      console.log(`  • Monthly MRR:        $${evaluation.monthlyRevenue.toLocaleString()}`);
      console.log(`  • Composite Score:    ${evaluation.health.compositeScore}/100 [${evaluation.health.tier}]`);
      console.log(
        `  • Intervention Alert: ${evaluation.interventionRequired ? "CRITICAL (HLT-003 TRIGGERED)" : "NONE"}`,
      );
      if (evaluation.riskFactors.length > 0) {
        console.log("  ⚠️  Risk Factors:");
        for (const rf of evaluation.riskFactors) console.log(`    - ${rf}`);
      }
      if (evaluation.recommendations.length > 0) {
        console.log("  💡 Recommendations:");
        for (const rec of evaluation.recommendations) console.log(`    - ${rec}`);
      }
    }
    return;
  }

  if (values["scaffold-cap"]) {
    const input: AccountHealthInput = {
      accountName: values.account as string,
      monthlyRevenue: Number(values.revenue),
      productTelemetry: tel,
      sentimentScore: sent,
      financialVelocity: fin,
      hasSponsorTurnover: values["sponsor-turnover"] as boolean,
      overdueDays: Number(values["overdue-days"]),
    };
    const evalResult = evaluateAccountHealth(input);
    const plan = scaffoldInterventionPlan(input, evalResult.riskFactors);

    if (values.out) {
      writeFileSync(values.out, plan, "utf8");
      console.log(`✅ 48h Intervention Plan written to ${values.out}`);
    } else {
      console.log(plan);
    }
    return;
  }

  if (values["calc-nrr"]) {
    const nrr = calculateNrr(
      Number(values["starting-arr"]),
      Number(values["expansion-arr"]),
      Number(values["contraction-arr"]),
      Number(values["churn-arr"]),
    );
    if (values.json) {
      console.log(JSON.stringify(nrr, null, 2));
    } else {
      console.log("📈 Net Retention Rate (NRR) Modeling (HLT-004):");
      console.log(`  • Net Retention Rate (NRR):   ${nrr.netRetentionRate}% (Target: >=115%)`);
      console.log(`  • Gross Retention Rate (GRR): ${nrr.grossRetentionRate}%`);
      console.log(`  • Starting ARR:               $${nrr.startingArr.toLocaleString()}`);
      console.log(`  • Ending ARR:                 $${nrr.endingArr.toLocaleString()}`);
      console.log(`  • Expansion ARR:              +$${nrr.expansionArr.toLocaleString()}`);
      console.log(`  • Churn & Contraction ARR:    -$${(nrr.churnArr + nrr.contractionArr).toLocaleString()}`);
      console.log(`  • Benchmark Status:           ${nrr.isHealthyNrr ? "HEALTHY" : "BELOW BENCHMARK"}`);
    }
    return;
  }

  if (values.scorecard) {
    let accounts: AccountHealthInput[] = [];
    if (values.in && existsSync(values.in)) {
      accounts = JSON.parse(readFileSync(values.in, "utf8"));
    } else {
      // Default demo portfolio
      accounts = [
        {
          accountName: "Apex SaaS Solutions",
          monthlyRevenue: 24000,
          productTelemetry: 92,
          sentimentScore: 88,
          financialVelocity: 95,
        },
        {
          accountName: "Beacon Logistics",
          monthlyRevenue: 15000,
          productTelemetry: 68,
          sentimentScore: 62,
          financialVelocity: 70,
        },
        {
          accountName: "Cascade E-Commerce",
          monthlyRevenue: 18000,
          productTelemetry: 42,
          sentimentScore: 40,
          financialVelocity: 45,
          hasSponsorTurnover: true,
          overdueDays: 21,
        },
      ];
    }

    const scorecard = generatePortfolioScorecard(accounts);
    if (values.json) {
      console.log(JSON.stringify(scorecard, null, 2));
    } else {
      console.log("📋 Executive Portfolio Health Scorecard (HLT-004):");
      console.log(`  • Total Accounts:        ${scorecard.totalAccounts}`);
      console.log(`  • Total Monthly Revenue: $${scorecard.totalMonthlyRevenue.toLocaleString()}`);
      console.log(`  • Average Health Score:  ${scorecard.averageHealthScore}/100`);
      console.log(
        `  • Green Accounts:        ${scorecard.distribution.green.count} ($${scorecard.distribution.green.revenue.toLocaleString()}, ${scorecard.distribution.green.percentage}%)`,
      );
      console.log(
        `  • Amber Accounts:        ${scorecard.distribution.amber.count} ($${scorecard.distribution.amber.revenue.toLocaleString()}, ${scorecard.distribution.amber.percentage}%)`,
      );
      console.log(
        `  • Red Accounts (At Risk): ${scorecard.distribution.red.count} ($${scorecard.distribution.red.revenue.toLocaleString()}, ${scorecard.distribution.red.percentage}%)`,
      );
      console.log(`  • Total At-Risk Revenue: $${scorecard.atRiskRevenue.toLocaleString()}`);
    }
  }
}

if (import.meta.main) {
  runCli();
}
