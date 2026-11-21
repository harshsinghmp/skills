#!/usr/bin/env bun
/**
 * roas-calculator.ts: Omnichannel ROAS Attribution, Blended CAC & Ad Spend Pacing Engine.
 *
 * Implements ROAS-001 through ROAS-004:
 *   - ROAS-001: Omnichannel Blended CAC & MER Triangulation (MER >= 3.0x floor, target >= 4.5x, CAC payback <= 90d)
 *   - ROAS-002: In-Platform ROAS Haircut Discounts (Meta 25%, Google 35%, TikTok 30%, contribution margin > 20%)
 *   - ROAS-003: 4-Tier Ad Spend Pacing & Scaling Gates (Testing <= $100/d, Stabilization, Max +20%/48h, Circuit Breaker)
 *   - ROAS-004: Post-iOS 14 Server-Side Tracking & First-Party Data Hygiene (CAPI, EMQ >= 7.5/10)
 *
 * Usage:
 *   bun roas-calculator.ts --calc-mer --revenue <num> --spend <num> [--customers <num>] [--json]
 *   bun roas-calculator.ts --triangulate-roas --meta-spend <num> --meta-roas <num> --google-spend <num> --google-roas <num> --tiktok-spend <num> --tiktok-roas <num> --total-rev <num> [--json]
 *   bun roas-calculator.ts --audit-spend <file> [--json]
 *   bun roas-calculator.ts --scaffold-pacing [--budget <monthly_budget>] [--target-mer <num>] [--output <file>] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface MerReport {
  revenue: number;
  adSpend: number;
  newCustomers?: number;
  mer: number;
  blendedCac?: number;
  status: "OPTIMAL" | "ACCEPTABLE" | "SUB_FLOOR" | "CRITICAL";
  isFloorMet: boolean;
  isTargetMet: boolean;
  recommendations: string[];
}

export interface ChannelInput {
  name: string;
  reportedSpend: number;
  reportedRoas: number;
  haircutPercent?: number;
}

export interface ChannelResult {
  name: string;
  reportedSpend: number;
  reportedRoas: number;
  haircutPercent: number;
  discountedRoas: number;
  attributedRevenue: number;
}

export interface ChannelTriangulationReport {
  channels: ChannelResult[];
  totalAdSpend: number;
  totalRevenue: number;
  blendedMer: number;
  totalAttributedRevenue: number;
  netContribution: number;
  contributionMarginPercent: number;
  isContributionMarginHealthy: boolean;
  recommendations: string[];
}

export interface AdSpendConfig {
  clientName?: string;
  monthlyBudget?: number;
  dailyBudget?: number;
  targetMer?: number;
  merFloor?: number;
  haircutDiscountsApplied?:
    | boolean
    | {
        meta?: number;
        google?: number;
        tiktok?: number;
      };
  pacingLimits?: {
    tier1TestingLimit?: number;
    tier2StabilizationMin?: number;
    tier2StabilizationMax?: number;
    maxVerticalScalePercentPer48h?: number;
  };
  serverSideTracking?: {
    metaCapiActive?: boolean;
    googleEnhancedConversionsActive?: boolean;
    tiktokEventsApiActive?: boolean;
    eventMatchQualityScore?: number;
    emqScore?: number;
  };
  circuitBreaker?: {
    enabled?: boolean;
    merThreshold?: number;
    sustainedDays?: number;
    throttlePercent?: number;
  };
}

export interface AdSpendAuditReport {
  target: string;
  passed: boolean;
  healthScore: number;
  verdict: "APPROVED" | "REVISE_PACING_AND_TRACKING" | "REJECTED_HIGH_RISK";
  checks: {
    merFloorConfigured: boolean;
    haircutsApplied: boolean;
    pacingLimitsEnforced: boolean;
    circuitBreakerActive: boolean;
    capiTrackingCompliant: boolean;
    emqScoreCompliant: boolean;
  };
  issues: string[];
  strengths: string[];
}

/**
 * ROAS-001: Omnichannel Blended CAC & Marketing Efficiency Ratio (MER) Triangulation.
 */
export function calculateMer(revenue: number, adSpend: number, newCustomers?: number): MerReport {
  const safeSpend = Math.max(adSpend, 0);
  const mer = safeSpend > 0 ? Math.round((revenue / safeSpend) * 100) / 100 : 0;

  const blendedCac =
    newCustomers && newCustomers > 0 && safeSpend > 0 ? Math.round((safeSpend / newCustomers) * 100) / 100 : undefined;

  let status: MerReport["status"];
  const recommendations: string[] = [];

  const isFloorMet = mer >= 3.0;
  const isTargetMet = mer >= 4.5;

  if (mer >= 4.5) {
    status = "OPTIMAL";
    recommendations.push(
      "Blended MER exceeds 4.5x target. Account qualified for Tier 3 vertical scaling (+20% per 48h).",
    );
  } else if (mer >= 3.0) {
    status = "ACCEPTABLE";
    recommendations.push(
      "Blended MER meets the 3.0x minimum floor. Maintain Tier 2 stabilization before vertical scaling.",
    );
  } else if (mer >= 2.0) {
    status = "SUB_FLOOR";
    recommendations.push(
      "Blended MER is below 3.0x floor. Pause scaling; eliminate zero-ROAS ad sets and audit creative fatigue.",
    );
  } else {
    status = "CRITICAL";
    recommendations.push(
      "CRITICAL: MER below 2.0x threshold. Circuit breaker triggered — throttle ad spend by 50% immediately.",
    );
  }

  if (blendedCac !== undefined) {
    recommendations.push(
      `Blended CAC is $${blendedCac}. Enforce 90-day LTV payback validation against customer gross margin.`,
    );
  }

  return {
    revenue,
    adSpend: safeSpend,
    newCustomers,
    mer,
    blendedCac,
    status,
    isFloorMet,
    isTargetMet,
    recommendations,
  };
}

/**
 * ROAS-002: In-Platform ROAS Haircut Discounts & Multi-Touch Attribution Calibration.
 */
export function triangulateChannelRoas(channels: ChannelInput[], totalRevenue: number): ChannelTriangulationReport {
  const channelResults: ChannelResult[] = [];
  let totalAdSpend = 0;
  let totalAttributedRevenue = 0;

  for (const ch of channels) {
    let defaultHaircut = 0.2;
    const lowerName = ch.name.toLowerCase();

    if (
      lowerName.includes("meta") ||
      lowerName.includes("facebook") ||
      lowerName.includes("instagram") ||
      lowerName.includes("advantage")
    ) {
      defaultHaircut = 0.25; // 25% discount
    } else if (
      lowerName.includes("google") ||
      lowerName.includes("pmax") ||
      lowerName.includes("search") ||
      lowerName.includes("brand")
    ) {
      defaultHaircut = 0.35; // 35% discount
    } else if (lowerName.includes("tiktok")) {
      defaultHaircut = 0.3; // 30% discount
    }

    const rawHaircut = ch.haircutPercent !== undefined ? ch.haircutPercent : defaultHaircut;
    const normalizedHaircut = rawHaircut > 1 ? rawHaircut / 100 : rawHaircut;

    const discountedRoas = Math.round(ch.reportedRoas * (1 - normalizedHaircut) * 100) / 100;
    const attributedRevenue = Math.round(ch.reportedSpend * discountedRoas * 100) / 100;

    totalAdSpend += ch.reportedSpend;
    totalAttributedRevenue += attributedRevenue;

    channelResults.push({
      name: ch.name,
      reportedSpend: ch.reportedSpend,
      reportedRoas: ch.reportedRoas,
      haircutPercent: Math.round(normalizedHaircut * 100),
      discountedRoas,
      attributedRevenue,
    });
  }

  totalAdSpend = Math.round(totalAdSpend * 100) / 100;
  totalAttributedRevenue = Math.round(totalAttributedRevenue * 100) / 100;

  const blendedMer = totalAdSpend > 0 ? Math.round((totalRevenue / totalAdSpend) * 100) / 100 : 0;

  const netContribution = Math.round((totalRevenue - totalAdSpend) * 100) / 100;
  const contributionMarginPercent =
    totalRevenue > 0 ? Math.round(((totalRevenue - totalAdSpend) / totalRevenue) * 1000) / 10 : 0;

  const isContributionMarginHealthy = contributionMarginPercent > 20;

  const recommendations: string[] = [];
  if (isContributionMarginHealthy) {
    recommendations.push(
      `Net contribution margin after ad spend is healthy at ${contributionMarginPercent}% (> 20% floor).`,
    );
  } else {
    recommendations.push(
      `WARNING: Net contribution margin (${contributionMarginPercent}%) is below 20% floor. Media spend is burning net profitability.`,
    );
  }

  if (blendedMer >= 4.5) {
    recommendations.push(
      `Blended MER (${blendedMer}x) qualifies for vertical budget scaling across calibrated channels.`,
    );
  } else if (blendedMer >= 3.0) {
    recommendations.push(`Blended MER (${blendedMer}x) meets minimum floor (>= 3.0x). Keep current budget pacing.`);
  } else {
    recommendations.push(
      `Blended MER (${blendedMer}x) is sub-floor (< 3.0x). Reallocate spend away from lowest discounted ROAS channels.`,
    );
  }

  return {
    channels: channelResults,
    totalAdSpend,
    totalRevenue,
    blendedMer,
    totalAttributedRevenue,
    netContribution,
    contributionMarginPercent,
    isContributionMarginHealthy,
    recommendations,
  };
}

/**
 * ROAS-001 through ROAS-004: Audit Ad Spend Configuration.
 */
export function auditAdSpendConfig(configPathOrObj: string | object): AdSpendAuditReport {
  let config: AdSpendConfig;
  let targetName = "InMemoryConfig";

  if (typeof configPathOrObj === "string") {
    targetName = configPathOrObj;
    if (!fs.existsSync(configPathOrObj)) {
      return {
        target: targetName,
        passed: false,
        healthScore: 0,
        verdict: "REJECTED_HIGH_RISK",
        checks: {
          merFloorConfigured: false,
          haircutsApplied: false,
          pacingLimitsEnforced: false,
          circuitBreakerActive: false,
          capiTrackingCompliant: false,
          emqScoreCompliant: false,
        },
        issues: [`Config file not found at path: ${configPathOrObj}`],
        strengths: [],
      };
    }
    const content = fs.readFileSync(configPathOrObj, "utf8");
    try {
      config = JSON.parse(content);
    } catch {
      return {
        target: targetName,
        passed: false,
        healthScore: 0,
        verdict: "REJECTED_HIGH_RISK",
        checks: {
          merFloorConfigured: false,
          haircutsApplied: false,
          pacingLimitsEnforced: false,
          circuitBreakerActive: false,
          capiTrackingCompliant: false,
          emqScoreCompliant: false,
        },
        issues: [`Config file failed JSON parsing at: ${configPathOrObj}`],
        strengths: [],
      };
    }
  } else {
    config = configPathOrObj as AdSpendConfig;
    if (config.clientName) {
      targetName = config.clientName;
    }
  }

  const issues: string[] = [];
  const strengths: string[] = [];

  // Check 1: MER Floor (ROAS-001)
  const merFloorValue = config.merFloor ?? config.targetMer ?? 0;
  const merFloorConfigured = merFloorValue >= 3.0;
  if (merFloorConfigured) {
    strengths.push(`MER floor configured at ${merFloorValue}x (meets >= 3.0x standard).`);
  } else {
    issues.push(`MER floor is absent or below 3.0x threshold (${merFloorValue}x). Violates ROAS-001.`);
  }

  // Check 2: Haircut Discounts Applied (ROAS-002)
  let haircutsApplied = false;
  if (typeof config.haircutDiscountsApplied === "boolean") {
    haircutsApplied = config.haircutDiscountsApplied;
  } else if (config.haircutDiscountsApplied && typeof config.haircutDiscountsApplied === "object") {
    haircutsApplied = true;
  }
  if (haircutsApplied) {
    strengths.push("In-platform ROAS haircut discounts calibrated across Meta, Google, and TikTok.");
  } else {
    issues.push("In-platform ROAS haircut discounts not applied. Violates ROAS-002.");
  }

  // Check 3: Pacing Limits (ROAS-003)
  const maxScale = config.pacingLimits?.maxVerticalScalePercentPer48h;
  const pacingLimitsEnforced = config.pacingLimits !== undefined && (maxScale === undefined || maxScale <= 20);
  if (pacingLimitsEnforced) {
    strengths.push(`Budget pacing limits enforced (max vertical scale ${maxScale ?? 20}% per 48h).`);
  } else {
    issues.push("Budget pacing limits missing or scaling exceeds +20% per 48h limit. Violates ROAS-003.");
  }

  // Check 4: Circuit Breaker (ROAS-003)
  const circuitBreakerActive = Boolean(config.circuitBreaker?.enabled);
  if (circuitBreakerActive) {
    const thresh = config.circuitBreaker?.merThreshold ?? 2.0;
    const throttle = config.circuitBreaker?.throttlePercent ?? 50;
    strengths.push(`Circuit breaker active (throttles spend ${throttle}% if MER < ${thresh}x).`);
  } else {
    issues.push("Circuit breaker guardrail is disabled. Missing 50% spend throttle safety fence. Violates ROAS-003.");
  }

  // Check 5: CAPI Tracking (ROAS-004)
  const sst = config.serverSideTracking;
  const capiTrackingCompliant = Boolean(
    sst?.metaCapiActive && sst?.googleEnhancedConversionsActive && sst?.tiktokEventsApiActive,
  );
  if (capiTrackingCompliant) {
    strengths.push("Post-iOS 14 server-side tracking active across Meta CAPI, Google Enhanced, and TikTok Events.");
  } else {
    issues.push(
      "Missing mandatory server-side tracking (Meta CAPI, Google Enhanced Conversions, or TikTok Events API). Violates ROAS-004.",
    );
  }

  // Check 6: Event Match Quality (ROAS-004)
  const emq = sst?.eventMatchQualityScore ?? sst?.emqScore ?? 0;
  const emqScoreCompliant = emq >= 7.5;
  if (emqScoreCompliant) {
    strengths.push(`Event Match Quality score (${emq}/10) satisfies >= 7.5 threshold.`);
  } else {
    issues.push(
      `Event Match Quality score (${emq}/10) is below 7.5 minimum. Incomplete hashed first-party customer keys. Violates ROAS-004.`,
    );
  }

  // Calculate Health Score
  let score = 0;
  if (merFloorConfigured) score += 20;
  if (haircutsApplied) score += 15;
  if (pacingLimitsEnforced) score += 15;
  if (circuitBreakerActive) score += 15;
  if (capiTrackingCompliant) score += 20;
  if (emqScoreCompliant) score += 15;

  let verdict: AdSpendAuditReport["verdict"];
  if (score >= 90 && issues.length === 0) {
    verdict = "APPROVED";
  } else if (score >= 50) {
    verdict = "REVISE_PACING_AND_TRACKING";
  } else {
    verdict = "REJECTED_HIGH_RISK";
  }

  const passed = verdict === "APPROVED";

  return {
    target: targetName,
    passed,
    healthScore: score,
    verdict,
    checks: {
      merFloorConfigured,
      haircutsApplied,
      pacingLimitsEnforced,
      circuitBreakerActive,
      capiTrackingCompliant,
      emqScoreCompliant,
    },
    issues,
    strengths,
  };
}

/**
 * ROAS-003: Scaffold Omnichannel Pacing Schedule Markdown.
 */
export function scaffoldPacingSchedule(monthlyBudget: number, targetMer: number, clientName = "Alpha Client"): string {
  const safeBudget = monthlyBudget > 0 ? monthlyBudget : 15000;
  const safeMer = targetMer >= 3.0 ? targetMer : 4.5;
  const dailySpend = Math.round((safeBudget / 30.4) * 100) / 100;
  const monthlyRevenueTarget = Math.round(safeBudget * safeMer);
  const dailyRevenueTarget = Math.round(dailySpend * safeMer);

  // Channel allocations: Meta 45%, Google 35%, TikTok 10%, Contingency 10%
  const metaMonthly = Math.round(safeBudget * 0.45);
  const metaDaily = Math.round((metaMonthly / 30.4) * 100) / 100;
  const googleMonthly = Math.round(safeBudget * 0.35);
  const googleDaily = Math.round((googleMonthly / 30.4) * 100) / 100;
  const tiktokMonthly = Math.round(safeBudget * 0.1);
  const tiktokDaily = Math.round((tiktokMonthly / 30.4) * 100) / 100;
  const reserveMonthly = Math.round(safeBudget * 0.1);

  return `# Omnichannel Ad Budget Pacing & ROAS Scaling Schedule: ${clientName}

> **Operating Role**: Crew (Agency Council Operations Lead & Client Delivery Specialist)  
> **Model**: Omnichannel Triangulation & 4-Tier Scaling Gates  
> **Standard**: ROAS-001 through ROAS-004  

---

## 1. Executive Budget & Performance Targets

| Financial Metric | Monthly Target | Daily Baseline | Standard Invariant |
|:---|:---|:---|:---|
| **Omnichannel Ad Spend** | $${safeBudget.toLocaleString()} | $${dailySpend.toLocaleString()} / day | Bounded by 4-Tier Pacing Gates |
| **Topline Revenue Target** | $${monthlyRevenueTarget.toLocaleString()} | $${dailyRevenueTarget.toLocaleString()} / day | Verified against ERP/Stripe records |
| **Target Blended MER** | **${safeMer.toFixed(1)}x** | **${safeMer.toFixed(1)}x** | Floor >= 3.0x (ROAS-001) |
| **Minimum Contribution Margin** | > 20% Net | > 20% Net | Net profit floor after ad spend (ROAS-002) |
| **Blended CAC Payback Window** | <= 90 Days | <= 90 Days | LTV horizon verification (ROAS-001) |

---

## 2. 4-Tier Scaling & Circuit Breaker Gates (ROAS-003)

| Scaling Tier | Daily Budget Window | Milestone Qualification Gate | Scaling & Throttle Rules |
|:---|:---|:---|:---|
| **Tier 1: Testing & Exploration** | <= $100 / day | Creative & hook angle validation | 3-5 creative variants; CPC & CTR baseline discovery |
| **Tier 2: Stabilization** | $100 - $500 / day | >= 50 conversions / week per ad set | Exit algorithmic learning phase; steady CPA baseline |
| **Tier 3: Vertical Scaling** | > $500 / day | Rolling 7d MER >= ${safeMer.toFixed(1)}x target | Max **+20% spend increase per 48 hours** |
| **Tier 4: Circuit Breaker** | N/A (Safety Fence) | 3-day rolling MER < 2.0x OR CAC > 1.5x target | **Throttle ad spend by 50% immediately** across bottom ad sets |

---

## 3. Calibrated Channel Allocation & In-Platform Haircuts (ROAS-002)

| Channel / Mechanism | Monthly Budget | Daily Spend | In-Platform Haircut | Target In-Platform ROAS | Effective Discounted ROAS |
|:---|:---|:---|:---|:---|:---|
| **Meta Ads (Advantage+)** | $${metaMonthly.toLocaleString()} (45%) | $${metaDaily.toLocaleString()} | 25% Discount | ${(safeMer / 0.75).toFixed(2)}x reported | ${safeMer.toFixed(1)}x calibrated |
| **Google Ads (PMax & Search)** | $${googleMonthly.toLocaleString()} (35%) | $${googleDaily.toLocaleString()} | 35% Discount | ${(safeMer / 0.65).toFixed(2)}x reported | ${safeMer.toFixed(1)}x calibrated |
| **TikTok Ads (Spark)** | $${tiktokMonthly.toLocaleString()} (10%) | $${tiktokDaily.toLocaleString()} | 30% Discount | ${(safeMer / 0.7).toFixed(2)}x reported | ${safeMer.toFixed(1)}x calibrated |
| **Contingency Reserve** | $${reserveMonthly.toLocaleString()} (10%) | On-Trigger | N/A | Deployed only on proven winners | Dynamic Allocation |

---

## 4. Post-iOS 14 Server-Side Tracking Gate (ROAS-004)

- **Meta Conversions API (CAPI)**: Active with deduplicated \`event_id\` and \`event_name\`.
- **Google Enhanced Conversions**: SHA-256 hashed first-party user identifiers enabled.
- **TikTok Events API**: Server-to-server payload dispatching active.
- **Event Match Quality (EMQ)**: Strict mandate of **EMQ >= 7.5 / 10** across all purchase events.
`;
}

// CLI Execution Block
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  // 1. Calculate MER
  const calcMerIdx = args.indexOf("--calc-mer");
  if (calcMerIdx !== -1) {
    const revIdx = args.indexOf("--revenue");
    const spendIdx = args.indexOf("--spend");
    const custIdx = args.indexOf("--customers");

    const revenue = revIdx !== -1 && args[revIdx + 1] ? Number.parseFloat(args[revIdx + 1]) : 0;
    const spend = spendIdx !== -1 && args[spendIdx + 1] ? Number.parseFloat(args[spendIdx + 1]) : 0;
    const customers = custIdx !== -1 && args[custIdx + 1] ? Number.parseInt(args[custIdx + 1], 10) : undefined;

    const report = calculateMer(revenue, spend, customers);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("\n📊 Crew ROAS Attribution: Blended MER & CAC Triangulation");
      console.log(`Topline Revenue:     $${report.revenue.toLocaleString()}`);
      console.log(`Total Ad Spend:      $${report.adSpend.toLocaleString()}`);
      console.log(`Blended MER:         ${report.mer}x`);
      if (report.blendedCac !== undefined) {
        console.log(`Blended CAC:         $${report.blendedCac}`);
      }
      console.log(`Status:              ${report.status}`);
      console.log(`Floor Satisfied:     ${report.isFloorMet ? "✅ YES (>= 3.0x)" : "❌ NO (< 3.0x)"}`);
      console.log(`Target Satisfied:    ${report.isTargetMet ? "✅ YES (>= 4.5x)" : "⚠️ NO (< 4.5x)"}\n`);
      for (const rec of report.recommendations) {
        console.log(`  💡 ${rec}`);
      }
    }
    process.exit(0);
  }

  // 2. Triangulate Channel ROAS
  const triIdx = args.indexOf("--triangulate-roas");
  if (triIdx !== -1) {
    const metaSpendIdx = args.indexOf("--meta-spend");
    const metaRoasIdx = args.indexOf("--meta-roas");
    const googleSpendIdx = args.indexOf("--google-spend");
    const googleRoasIdx = args.indexOf("--google-roas");
    const tiktokSpendIdx = args.indexOf("--tiktok-spend");
    const tiktokRoasIdx = args.indexOf("--tiktok-roas");

    let revIdx = args.indexOf("--total-rev");
    if (revIdx === -1) {
      revIdx = args.indexOf("--total-revenue");
    }

    const metaSpend = metaSpendIdx !== -1 && args[metaSpendIdx + 1] ? Number.parseFloat(args[metaSpendIdx + 1]) : 0;
    const metaRoas = metaRoasIdx !== -1 && args[metaRoasIdx + 1] ? Number.parseFloat(args[metaRoasIdx + 1]) : 0;
    const googleSpend =
      googleSpendIdx !== -1 && args[googleSpendIdx + 1] ? Number.parseFloat(args[googleSpendIdx + 1]) : 0;
    const googleRoas = googleRoasIdx !== -1 && args[googleRoasIdx + 1] ? Number.parseFloat(args[googleRoasIdx + 1]) : 0;
    const tiktokSpend =
      tiktokSpendIdx !== -1 && args[tiktokSpendIdx + 1] ? Number.parseFloat(args[tiktokSpendIdx + 1]) : 0;
    const tiktokRoas = tiktokRoasIdx !== -1 && args[tiktokRoasIdx + 1] ? Number.parseFloat(args[tiktokRoasIdx + 1]) : 0;
    const totalRev = revIdx !== -1 && args[revIdx + 1] ? Number.parseFloat(args[revIdx + 1]) : 0;

    const channels: ChannelInput[] = [
      {
        name: "Meta Advantage+",
        reportedSpend: metaSpend,
        reportedRoas: metaRoas,
        haircutPercent: 25,
      },
      {
        name: "Google PMax & Search",
        reportedSpend: googleSpend,
        reportedRoas: googleRoas,
        haircutPercent: 35,
      },
      {
        name: "TikTok Ads",
        reportedSpend: tiktokSpend,
        reportedRoas: tiktokRoas,
        haircutPercent: 30,
      },
    ].filter((c) => c.reportedSpend > 0 || c.reportedRoas > 0);

    const report = triangulateChannelRoas(channels, totalRev);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("\n🎯 Multi-Channel ROAS Triangulation (In-Platform Haircuts)");
      console.log(`Total Topline Revenue: $${report.totalRevenue.toLocaleString()}`);
      console.log(`Total Ad Spend:        $${report.totalAdSpend.toLocaleString()}`);
      console.log(`Blended MER:           ${report.blendedMer}x`);
      console.log(`Net Contribution:      $${report.netContribution.toLocaleString()}`);
      console.log(
        `Contribution Margin:   ${report.contributionMarginPercent}% (${report.isContributionMarginHealthy ? "✅ HEALTHY > 20%" : "❌ DEFICIT < 20%"})\n`,
      );
      console.log("Channel Breakdown:");
      for (const ch of report.channels) {
        console.log(
          `  • ${ch.name}: Spend $${ch.reportedSpend} | Reported ROAS ${ch.reportedRoas}x | Haircut ${ch.haircutPercent}% | Discounted ROAS ${ch.discountedRoas}x | Attributed Rev $${ch.attributedRevenue}`,
        );
      }
      console.log("\nRecommendations:");
      for (const rec of report.recommendations) {
        console.log(`  💡 ${rec}`);
      }
    }
    process.exit(0);
  }

  // 3. Audit Ad Spend Config
  const auditIdx = args.indexOf("--audit-spend");
  if (auditIdx !== -1) {
    const targetFile = args[auditIdx + 1];
    if (!targetFile) {
      console.error("Error: --audit-spend requires a configuration file path.");
      process.exit(1);
    }
    const report = auditAdSpendConfig(targetFile);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️ Ad Spend & Tracking Hygiene Audit: ${report.target}`);
      console.log(`Health Score:  ${report.healthScore}/100`);
      console.log(`Verdict:       ${report.verdict} (${report.passed ? "PASS" : "FAIL"})`);
      console.log("\nChecks:");
      console.log(`  • MER Floor (>= 3.0x):       ${report.checks.merFloorConfigured ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  • Haircut Discounts Applied: ${report.checks.haircutsApplied ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  • Pacing Limits Enforced:    ${report.checks.pacingLimitsEnforced ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  • Circuit Breaker Active:    ${report.checks.circuitBreakerActive ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  • Server-Side CAPI Tracking: ${report.checks.capiTrackingCompliant ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`  • Event Match Quality (>=7.5):${report.checks.emqScoreCompliant ? "✅ PASS" : "❌ FAIL"}`);

      if (report.strengths.length > 0) {
        console.log("\nStrengths:");
        for (const s of report.strengths) {
          console.log(`  ✓ ${s}`);
        }
      }
      if (report.issues.length > 0) {
        console.log("\nDefects:");
        for (const iss of report.issues) {
          console.log(`  ✗ ${iss}`);
        }
      }
    }
    process.exit(report.passed ? 0 : 1);
  }

  // 4. Scaffold Pacing Schedule
  const scaffoldIdx = args.indexOf("--scaffold-pacing");
  if (scaffoldIdx !== -1) {
    const bIdx = args.indexOf("--budget");
    const mIdx = args.indexOf("--target-mer");
    const cIdx = args.indexOf("--client");
    const oIdx = args.indexOf("--output");

    const budget = bIdx !== -1 && args[bIdx + 1] ? Number.parseFloat(args[bIdx + 1]) : 15000;
    const targetMer = mIdx !== -1 && args[mIdx + 1] ? Number.parseFloat(args[mIdx + 1]) : 4.5;
    const clientName = cIdx !== -1 && args[cIdx + 1] ? args[cIdx + 1] : "Alpha Client";
    const outFile = oIdx !== -1 ? args[oIdx + 1] : undefined;

    const schedule = scaffoldPacingSchedule(budget, targetMer, clientName);

    if (outFile) {
      const dir = path.dirname(outFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outFile, schedule, "utf8");
    }

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            clientName,
            monthlyBudget: budget,
            targetMer,
            outFile,
            length: schedule.length,
          },
          null,
          2,
        ),
      );
    } else {
      if (outFile) {
        console.log(`\n✅ Scaffolded ad pacing schedule for ${clientName} to ${outFile}`);
      } else {
        console.log(schedule);
      }
    }
    process.exit(0);
  }

  // Default Help
  console.log(`roas-calculator.ts — Omnichannel ROAS Attribution, Blended CAC & Ad Spend Pacing Engine

Usage:
  bun roas-calculator.ts --calc-mer --revenue <num> --spend <num> [--customers <num>] [--json]
  bun roas-calculator.ts --triangulate-roas --meta-spend <num> --meta-roas <num> --google-spend <num> --google-roas <num> --tiktok-spend <num> --tiktok-roas <num> --total-rev <num> [--json]
  bun roas-calculator.ts --audit-spend <file> [--json]
  bun roas-calculator.ts --scaffold-pacing [--budget <monthly_budget>] [--target-mer <num>] [--output <file>] [--json]
`);
  process.exit(0);
}
