#!/usr/bin/env bun
/**
 * Multi-Armed Bandit Dynamic Optimization Engine (growth:programmatic-cro)
 *
 * Implements MAB-001–MAB-004 invariants:
 * - MAB-001: Bayesian Thompson Sampling (Beta prior allocation, 10% exploration floor)
 * - MAB-002: Statistical Significance Gate (P(variant > baseline) >= 95%, N >= 1,000)
 * - MAB-003: Zero-CLS Variant Hydration (contain: layout size, reserved min-height, CLS <= 0.05)
 * - MAB-004: Revenue Lift Triangulation (Delta CR * Monthly Traffic * AOV -> Delta ARR/MRR)
 */

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// =========================================================================
// Types & Interfaces
// =========================================================================

export interface VariantData {
  id: string;
  name: string;
  isBaseline: boolean;
  impressions: number;
  conversions: number;
  layoutShiftScore?: number; // CLS measured in RUM or synthetic browser
  hasReservedContainer?: boolean; // CSS contain or min-height reserved
}

export interface ThompsonSampleResult {
  variantId: string;
  name: string;
  isBaseline: boolean;
  observedCr: number; // conversions / impressions
  alpha: number;
  beta: number;
  winProbability: number; // Probability of being the optimal variant
  recommendedTrafficShare: number; // 0.0 - 1.0 (enforces >= 0.10 exploration floor)
}

export interface SignificanceEvaluation {
  variantId: string;
  name: string;
  isBaseline: boolean;
  observedCr: number;
  relativeLiftPercent: number; // (CR_v - CR_base) / CR_base * 100
  pBeatBaseline: number; // Posterior probability P(CR_v > CR_base)
  isSignificant: boolean; // pBeatBaseline >= confidence && impressions >= 1000
  sampleSizeSufficient: boolean; // impressions >= 1000
  status: "WINNER" | "LOSING" | "COLLECTING_DATA" | "BASELINE";
}

export interface ClsAuditResult {
  variantId: string;
  clsScore: number;
  compliant: boolean; // CLS <= 0.05
  hasReservedBounds: boolean;
  issues: string[];
}

export interface RevenueImpact {
  variantId: string;
  name: string;
  baselineCr: number;
  variantCr: number;
  absoluteLift: number; // CR_v - CR_base
  monthlyTraffic: number;
  averageOrderValue: number;
  projectedMonthlyRevenueLift: number;
  projectedAnnualRevenueLift: number;
}

export interface FullCroReport {
  experimentName: string;
  totalImpressions: number;
  totalConversions: number;
  confidenceThreshold: number;
  variants: VariantData[];
  thompsonSampling: ThompsonSampleResult[];
  significance: SignificanceEvaluation[];
  clsAudits: ClsAuditResult[];
  revenueTriangulation: RevenueImpact[];
  summaryMarkdown: string;
}

// =========================================================================
// Math & Statistical Helpers
// =========================================================================

/**
 * Standard Box-Muller normal random variate
 */
function randomNormal(mean = 0, stdev = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1 || 1e-10)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}

/**
 * Approximate sample from Beta(alpha, beta) using Johnk / Normal approximation
 */
export function sampleBeta(alpha: number, beta: number): number {
  if (alpha <= 0) alpha = 1;
  if (beta <= 0) beta = 1;

  // For moderate to large sample sizes, use mean and variance of Beta
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const stdev = Math.sqrt(variance);

  let sample = randomNormal(mean, stdev);
  // Clamp to [0, 1]
  if (sample < 0.0001) sample = 0.0001;
  if (sample > 0.9999) sample = 0.9999;
  return sample;
}

// =========================================================================
// Core CRO Engine
// =========================================================================

export class BanditCroEngine {
  /**
   * MAB-001: Computes Bayesian Thompson Sampling traffic allocations with 10% exploration floor
   */
  evaluateThompsonSampling(
    variants: VariantData[],
    numSimulations = 10000,
    explorationFloor = 0.1,
  ): ThompsonSampleResult[] {
    const wins: Record<string, number> = {};
    for (const v of variants) {
      wins[v.id] = 0;
    }

    const n = variants.length;
    if (n === 0) return [];

    // Run Monte Carlo draws from Beta posterior for each variant
    for (let s = 0; s < numSimulations; s++) {
      let bestId = variants[0].id;
      let highestDraw = -1;

      for (const v of variants) {
        const alpha = v.conversions + 1;
        const beta = v.impressions - v.conversions + 1;
        const draw = sampleBeta(alpha, beta);
        if (draw > highestDraw) {
          highestDraw = draw;
          bestId = v.id;
        }
      }
      wins[bestId] = (wins[bestId] || 0) + 1;
    }

    // Allocate traffic with exploration floor
    const results: ThompsonSampleResult[] = [];
    const floorBudget = explorationFloor * n; // Total reserved for floor
    const exploitableBudget = Math.max(0, 1.0 - floorBudget);

    for (const v of variants) {
      const alpha = v.conversions + 1;
      const beta = Math.max(1, v.impressions - v.conversions + 1);
      const observedCr = v.impressions > 0 ? v.conversions / v.impressions : 0;
      const winProb = wins[v.id] / numSimulations;

      // Recommended share: exploration floor + scaled win probability
      const recommendedShare = Number((explorationFloor + winProb * exploitableBudget).toFixed(4));

      results.push({
        variantId: v.id,
        name: v.name,
        isBaseline: v.isBaseline,
        observedCr: Number(observedCr.toFixed(4)),
        alpha,
        beta,
        winProbability: Number(winProb.toFixed(4)),
        recommendedTrafficShare: recommendedShare,
      });
    }

    return results;
  }

  /**
   * MAB-002: Statistical Significance Gate (P(variant > baseline) >= threshold && N >= 1,000)
   */
  evaluateSignificance(
    variants: VariantData[],
    confidenceThreshold = 0.95,
    minSample = 1000,
    numDraws = 10000,
  ): SignificanceEvaluation[] {
    const baseline = variants.find((v) => v.isBaseline) || variants[0];
    const baseAlpha = baseline.conversions + 1;
    const baseBeta = Math.max(1, baseline.impressions - baseline.conversions + 1);
    const baseCr = baseline.impressions > 0 ? baseline.conversions / baseline.impressions : 0;

    return variants.map((v) => {
      const observedCr = v.impressions > 0 ? v.conversions / v.impressions : 0;
      const sampleSizeSufficient = v.impressions >= minSample && baseline.impressions >= minSample;

      if (v.id === baseline.id) {
        return {
          variantId: v.id,
          name: v.name,
          isBaseline: true,
          observedCr: Number(observedCr.toFixed(4)),
          relativeLiftPercent: 0,
          pBeatBaseline: 0.5,
          isSignificant: false,
          sampleSizeSufficient,
          status: "BASELINE",
        };
      }

      // Monte Carlo evaluation of P(CR_v > CR_base)
      const vAlpha = v.conversions + 1;
      const vBeta = Math.max(1, v.impressions - v.conversions + 1);
      let beatsCount = 0;

      for (let i = 0; i < numDraws; i++) {
        const drawV = sampleBeta(vAlpha, vBeta);
        const drawBase = sampleBeta(baseAlpha, baseBeta);
        if (drawV > drawBase) beatsCount++;
      }

      const pBeatBaseline = Number((beatsCount / numDraws).toFixed(4));
      const relativeLiftPercent = baseCr > 0 ? Number((((observedCr - baseCr) / baseCr) * 100).toFixed(2)) : 0;
      const isSignificant = pBeatBaseline >= confidenceThreshold && sampleSizeSufficient;

      let status: "WINNER" | "LOSING" | "COLLECTING_DATA" | "BASELINE" = "COLLECTING_DATA";
      if (!sampleSizeSufficient) {
        status = "COLLECTING_DATA";
      } else if (isSignificant && relativeLiftPercent > 0) {
        status = "WINNER";
      } else if (pBeatBaseline < 0.05) {
        status = "LOSING";
      } else {
        status = "COLLECTING_DATA";
      }

      return {
        variantId: v.id,
        name: v.name,
        isBaseline: false,
        observedCr: Number(observedCr.toFixed(4)),
        relativeLiftPercent,
        pBeatBaseline,
        isSignificant,
        sampleSizeSufficient,
        status,
      };
    });
  }

  /**
   * MAB-003: Zero-CLS Layout Shift Containment Audit (CLS <= 0.05, reserved CSS bounding box)
   */
  auditLayoutShift(variants: VariantData[]): ClsAuditResult[] {
    return variants.map((v) => {
      const clsScore = v.layoutShiftScore ?? 0.01;
      const hasReservedBounds = v.hasReservedContainer ?? true;
      const issues: string[] = [];

      if (clsScore > 0.05) {
        issues.push(`CLS score ${clsScore} exceeds 0.05 ceiling; risk of visual jarring and search penalty`);
      }
      if (!hasReservedBounds) {
        issues.push("Missing reserved layout bounding box (contain: layout size or min-height fence)");
      }

      return {
        variantId: v.id,
        clsScore,
        compliant: clsScore <= 0.05 && hasReservedBounds,
        hasReservedBounds,
        issues,
      };
    });
  }

  /**
   * MAB-004: Revenue Lift Triangulation
   */
  triangulateRevenue(variants: VariantData[], monthlyTraffic: number, aov: number): RevenueImpact[] {
    const baseline = variants.find((v) => v.isBaseline) || variants[0];
    const baseCr = baseline.impressions > 0 ? baseline.conversions / baseline.impressions : 0;

    return variants
      .filter((v) => !v.isBaseline)
      .map((v) => {
        const vCr = v.impressions > 0 ? v.conversions / v.impressions : 0;
        const absoluteLift = vCr - baseCr;
        const projectedMonthlyRevenueLift = Math.max(0, Math.round(monthlyTraffic * absoluteLift * aov));
        const projectedAnnualRevenueLift = projectedMonthlyRevenueLift * 12;

        return {
          variantId: v.id,
          name: v.name,
          baselineCr: Number(baseCr.toFixed(4)),
          variantCr: Number(vCr.toFixed(4)),
          absoluteLift: Number(absoluteLift.toFixed(4)),
          monthlyTraffic,
          averageOrderValue: aov,
          projectedMonthlyRevenueLift,
          projectedAnnualRevenueLift,
        };
      });
  }

  /**
   * Generates a comprehensive programmatic CRO report
   */
  generateFullReport(
    experimentName: string,
    variants: VariantData[],
    monthlyTraffic = 50000,
    aov = 150,
    confidenceThreshold = 0.95,
  ): FullCroReport {
    const thompsonSampling = this.evaluateThompsonSampling(variants);
    const significance = this.evaluateSignificance(variants, confidenceThreshold);
    const clsAudits = this.auditLayoutShift(variants);
    const revenueTriangulation = this.triangulateRevenue(variants, monthlyTraffic, aov);

    const totalImpressions = variants.reduce((acc, v) => acc + v.impressions, 0);
    const totalConversions = variants.reduce((acc, v) => acc + v.conversions, 0);

    const summaryMarkdown = [
      `# 🎯 Programmatic CRO & Multi-Armed Bandit Report: ${experimentName}`,
      "",
      `> **Total Traffic**: ${totalImpressions.toLocaleString()} impressions | **Conversions**: ${totalConversions.toLocaleString()} | **Confidence Gate**: ${(confidenceThreshold * 100).toFixed(0)}%`,
      "",
      "## 🎰 Bayesian Thompson Sampling Allocations (MAB-001)",
      "| Variant | Observed CR | Posterior Win % | Recommended Traffic Share |",
      "|:---|:---|:---|:---|",
      ...thompsonSampling.map(
        (t) =>
          `| **${t.name}** ${t.isBaseline ? "(Baseline)" : ""} | ${(t.observedCr * 100).toFixed(2)}% | ${(t.winProbability * 100).toFixed(1)}% | **${(t.recommendedTrafficShare * 100).toFixed(1)}%** |`,
      ),
      "",
      "## 📊 Statistical Significance & Winning Variants (MAB-002)",
      "| Variant | Relative Lift | P(Variant > Baseline) | Sample Size | Status |",
      "|:---|:---|:---|:---|:---|",
      ...significance.map(
        (s) =>
          `| **${s.name}** | ${s.relativeLiftPercent > 0 ? "+" : ""}${s.relativeLiftPercent}% | ${(s.pBeatBaseline * 100).toFixed(1)}% | ${s.sampleSizeSufficient ? "✅ Sufficient" : "⚠️ Collecting"} | \`${s.status}\` |`,
      ),
      "",
      "## 🛡️ Zero-CLS Layout Shift Containment Audit (MAB-003)",
      ...clsAudits.map(
        (c) =>
          `- **${variants.find((v) => v.id === c.variantId)?.name}**: CLS \`${c.clsScore}\` [${c.compliant ? "✅ COMPLIANT" : "❌ HAZARD"}] ${c.issues.length ? `(${c.issues.join(", ")})` : ""}`,
      ),
      "",
      "## 💰 Revenue Lift Triangulation (MAB-004)",
      `*Assumptions: ${monthlyTraffic.toLocaleString()} Monthly Unique Visitors | $${aov} Average Order Value (AOV)*`,
      "",
      "| Variant | Absolute CR Lift | Monthly MRR Lift | Annual ARR Lift |",
      "|:---|:---|:---|:---|",
      ...revenueTriangulation.map(
        (r) =>
          `| **${r.name}** | +${(r.absoluteLift * 100).toFixed(2)}% | **+$${r.projectedMonthlyRevenueLift.toLocaleString()}** | **+$${r.projectedAnnualRevenueLift.toLocaleString()}** |`,
      ),
    ].join("\n");

    return {
      experimentName,
      totalImpressions,
      totalConversions,
      confidenceThreshold,
      variants,
      thompsonSampling,
      significance,
      clsAudits,
      revenueTriangulation,
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
      "evaluate-variants": { type: "string" },
      confidence: { type: "string", default: "0.95" },
      traffic: { type: "string", default: "50000" },
      aov: { type: "string", default: "150" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🎯 Multi-Armed Bandit Dynamic Optimization Engine (growth:programmatic-cro)

Usage:
  bun growth/scripts/bandit-cro.ts [options]

Options:
  --evaluate-variants <path>   JSON file containing experiment variants
  --confidence <float>         Significance threshold (default: 0.95)
  --traffic <number>           Monthly unique visitors for revenue triangulation (default: 50000)
  --aov <number>               Average order value in dollars (default: 150)
  --json                       Output structured JSON
  --help                       Show this help message
`);
    process.exit(0);
  }

  const confidence = Number.parseFloat(values.confidence as string) || 0.95;
  const traffic = Number.parseInt(values.traffic as string, 10) || 50000;
  const aov = Number.parseFloat(values.aov as string) || 150;

  let variants: VariantData[] = [];
  let expName = "SaaS Hero Headline & Value Proposition Optimization";

  if (values["evaluate-variants"] && existsSync(values["evaluate-variants"] as string)) {
    const raw = JSON.parse(readFileSync(values["evaluate-variants"] as string, "utf8"));
    variants = raw.variants || raw;
    if (raw.experimentName) expName = raw.experimentName;
  } else {
    // Default production benchmark scenario
    variants = [
      {
        id: "var-control",
        name: "Control (Generic Feature Copy)",
        isBaseline: true,
        impressions: 4200,
        conversions: 105, // 2.50%
        layoutShiftScore: 0.01,
        hasReservedContainer: true,
      },
      {
        id: "var-pain",
        name: "Variant A (Direct Pain & Quantified ROI)",
        isBaseline: false,
        impressions: 4150,
        conversions: 182, // 4.38%
        layoutShiftScore: 0.02,
        hasReservedContainer: true,
      },
      {
        id: "var-contrarian",
        name: "Variant B (Contrarian Stance Hook)",
        isBaseline: false,
        impressions: 3980,
        conversions: 139, // 3.49%
        layoutShiftScore: 0.015,
        hasReservedContainer: true,
      },
    ];
  }

  const engine = new BanditCroEngine();
  const report = engine.generateFullReport(expName, variants, traffic, aov, confidence);

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(report.summaryMarkdown);
  }

  // Check if all variants meet CLS and if an active winner is identified
  const hasClsHazard = report.clsAudits.some((c) => !c.compliant);
  process.exit(hasClsHazard ? 1 : 0);
}

if (import.meta.main) {
  runCli();
}
