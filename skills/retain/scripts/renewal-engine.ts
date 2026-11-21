#!/usr/bin/env bun
/**
 * Retainer Renewal Engine & Scope Creep Auditor
 *
 * Implements RNW-001–RNW-004 invariants:
 * - RNW-001 (60-Day Proactive Timeline): Enforces T-60, T-45, T-30, and T-14 calendar milestones.
 * - RNW-002 (Cumulative Economic Impact & ROI Ledger): Computes ROI ratio (>= 3.0x threshold).
 * - RNW-003 (Three-Tier Expansion Proposal Architecture): Baseline, Velocity (+25%), and Dedicated (+75%).
 * - RNW-004 (Scope Creep Retro & Margin Calibration): Audits EHR, unbilled hours, and recalibrates pricing floor.
 */

import { writeFileSync } from "node:fs";

export interface ContractHealthResult {
  valid: boolean;
  contractMrr: number;
  deliveredHours: number;
  outOfScopeHours: number;
  effectiveHourlyRate: number;
  targetHourlyRate: number;
  unbilledScopeValue: number;
  estimatedGrossMargin: number;
  marginHealthy: boolean;
  issues: string[];
  recommendation: string;
}

export interface RoiLedgerResult {
  totalCost: number;
  valueGenerated: number;
  roiMultiplier: number;
  meetsThreshold: boolean;
  summary: string;
}

export interface ThreeTierProposal {
  tier1Baseline: { name: string; mrr: number; capacityHours: number; description: string };
  tier2Velocity: { name: string; mrr: number; capacityHours: number; description: string };
  tier3Dedicated: { name: string; mrr: number; capacityHours: number; description: string };
}

export function auditContractHealth(options: {
  contractMrr: number;
  deliveredHours: number;
  outOfScopeHours?: number;
  targetHourlyRate?: number;
  blendedCostRate?: number;
}): ContractHealthResult {
  const issues: string[] = [];
  const targetRate = options.targetHourlyRate || 150;
  const costRate = options.blendedCostRate || 65; // $65/hr internal engineering cost
  const outOfScope = options.outOfScopeHours || 0;

  const totalDelivered = Math.max(1, options.deliveredHours);
  const effectiveHourlyRate = Math.round((options.contractMrr / totalDelivered) * 100) / 100;
  const totalInternalLaborCost = totalDelivered * costRate;
  const grossProfit = options.contractMrr - totalInternalLaborCost;
  const estimatedGrossMargin = Math.round((grossProfit / options.contractMrr) * 1000) / 10;
  const unbilledScopeValue = Math.round(outOfScope * targetRate);

  if (effectiveHourlyRate < targetRate) {
    issues.push(
      `Effective Hourly Rate ($${effectiveHourlyRate}/hr) is below the target floor ($${targetRate}/hr). Scope exceeded billable capacity.`,
    );
  }

  if (estimatedGrossMargin < 55) {
    issues.push(
      `Estimated Gross Margin (${estimatedGrossMargin}%) is below the healthy agency threshold (>= 55%). Rate recalibration required.`,
    );
  }

  if (outOfScope > totalDelivered * 0.15) {
    issues.push(
      `Unbilled out-of-scope work (${outOfScope} hrs = $${unbilledScopeValue}) represents >15% of delivered capacity. Scope re-fencing required.`,
    );
  }

  const marginHealthy = estimatedGrossMargin >= 55 && effectiveHourlyRate >= targetRate;
  let recommendation = "Maintain current capacity with standard annual COLA adjustment (+5%).";
  if (!marginHealthy) {
    const recommendedMrr = Math.round(totalDelivered * targetRate);
    recommendation = `Increase renewal contract to $${recommendedMrr}/mo or reduce monthly capacity ceiling to ${Math.round(options.contractMrr / targetRate)} hrs to protect 55%+ margin.`;
  }

  return {
    valid: issues.length === 0,
    contractMrr: options.contractMrr,
    deliveredHours: totalDelivered,
    outOfScopeHours: outOfScope,
    effectiveHourlyRate,
    targetHourlyRate: targetRate,
    unbilledScopeValue,
    estimatedGrossMargin,
    marginHealthy,
    issues,
    recommendation,
  };
}

export function computeRoiLedger(totalCost: number, valueGenerated: number): RoiLedgerResult {
  const roiMultiplier = Math.round((valueGenerated / Math.max(1, totalCost)) * 10) / 10;
  const meetsThreshold = roiMultiplier >= 3.0;

  return {
    totalCost,
    valueGenerated,
    roiMultiplier,
    meetsThreshold,
    summary: meetsThreshold
      ? `✅ Strong ROI verification: Client achieved ${roiMultiplier}x return on investment (threshold: >= 3.0x).`
      : `⚠️  ROI multiplier (${roiMultiplier}x) is below the target 3.0x threshold. Quantify additional operational savings.`,
  };
}

export function generateThreeTierProposal(currentMrr: number): ThreeTierProposal {
  const tier1Mrr = Math.round(currentMrr * 1.05); // +5% standard indexation
  const tier2Mrr = Math.round(currentMrr * 1.25); // +25% feature velocity
  const tier3Mrr = Math.round(currentMrr * 1.75); // +75% embedded pod

  return {
    tier1Baseline: {
      name: "Tier 1: Baseline Retainer (Steady-State)",
      mrr: tier1Mrr,
      capacityHours: Math.round(tier1Mrr / 160),
      description: "Bug warranty, P1–P4 SLA maintenance, security updates, and steady-state maintenance.",
    },
    tier2Velocity: {
      name: "Tier 2: Feature Velocity & Growth (Recommended)",
      mrr: tier2Mrr,
      capacityHours: Math.round(tier2Mrr / 150),
      description:
        "+25% sprint capacity, bi-weekly CRO experiments, performance audits, and priority roadmap execution.",
    },
    tier3Dedicated: {
      name: "Tier 3: Dedicated Autonomous Pod",
      mrr: tier3Mrr,
      capacityHours: Math.round(tier3Mrr / 140),
      description:
        "Full-stack embedded capacity, dedicated subagent workflows, priority 1-hour on-call, and weekly executive syncs.",
    },
  };
}

export function scaffoldRenewalDocument(options: {
  clientName: string;
  currentMrr: number;
  deliveredHours: number;
  outOfScopeHours?: number;
  economicValueDelivered?: number;
}): string {
  const health = auditContractHealth({
    contractMrr: options.currentMrr,
    deliveredHours: options.deliveredHours,
    outOfScopeHours: options.outOfScopeHours || 0,
  });

  const value = options.economicValueDelivered || options.currentMrr * 12 * 3.5;
  const totalCost = options.currentMrr * 12;
  const roi = computeRoiLedger(totalCost, value);
  const tiers = generateThreeTierProposal(options.currentMrr);

  return `# Retainer Renewal Memorandum: ${options.clientName}

**Client**: ${options.clientName}  
**Current Retainer**: $${options.currentMrr.toLocaleString()}/mo  
**Audit Period**: Prior 12 Months  
**Target Renewal Effective Date**: Next Contract Cycle  

---

## 📅 RNW-001: 60-Day Proactive Timeline
- **T-60 Days (Completed)**: Internal Scope Creep & Margin Audit
- **T-45 Days**: Informal Alignment Call with Client Champion
- **T-30 Days**: Formal 3-Tier Expansion Memorandum Delivery
- **T-14 Days**: Final Contract Signature & Addendum Lock

---

## 📈 RNW-002: Cumulative Economic Impact & ROI Ledger
- **Total Agency Investment (Annual)**: $${totalCost.toLocaleString()}
- **Estimated Quantified Business Value**: $${value.toLocaleString()}
- **Delivered ROI Multiplier**: **${roi.roiMultiplier}x** (${roi.meetsThreshold ? "Exceeds >= 3.0x threshold" : "Baseline"})

### Value Receipts Breakdown:
1. **Direct Revenue Uplift**: Conversion optimizations and new checkout flows enabled.
2. **Infrastructure Cost Reduction**: Database query tuning and edge caching reduced cloud overhead.
3. **Engineering Time Saved**: Automated subagent pipelines and reusable component architecture.
4. **Downtime Avoided**: Zero-downtime database migrations and sliding-window rate limiters.

---

## 🔍 RNW-004: Scope Creep Retro & Margin Calibration
- **Total Delivered Capacity**: ${health.deliveredHours} hours
- **Out-of-Scope Requests Handled**: ${health.outOfScopeHours} hours ($${health.unbilledScopeValue.toLocaleString()} complimentary value)
- **Effective Hourly Rate**: $${health.effectiveHourlyRate}/hr (Target: $${health.targetHourlyRate}/hr)
- **Agency Gross Margin**: ${health.estimatedGrossMargin}%
- **Operational Recommendation**: ${health.recommendation}

---

## 🚀 RNW-003: Three-Tier Expansion Options

### 1. ${tiers.tier1Baseline.name} — $${tiers.tier1Baseline.mrr.toLocaleString()}/mo
- **Capacity**: ~${tiers.tier1Baseline.capacityHours} hrs/mo
- **Deliverables**: ${tiers.tier1Baseline.description}

### 2. ${tiers.tier2Velocity.name} — $${tiers.tier2Velocity.mrr.toLocaleString()}/mo ⭐ *(Recommended)*
- **Capacity**: ~${tiers.tier2Velocity.capacityHours} hrs/mo (+25% capacity)
- **Deliverables**: ${tiers.tier2Velocity.description}

### 3. ${tiers.tier3Dedicated.name} — $${tiers.tier3Dedicated.mrr.toLocaleString()}/mo
- **Capacity**: ~${tiers.tier3Dedicated.capacityHours} hrs/mo
- **Deliverables**: ${tiers.tier3Dedicated.description}

---

## Next Steps
Confirm selection by **T-14 Days** to lock team capacity and guarantee continuous sprint velocity.
`;
}

// CLI Execution Handler
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  function getArgValue(flag: string): string | undefined {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  }

  if (args.includes("--help") || args.length === 0) {
    console.log(`
🔁 Crew Retainer Renewal Engine & Scope Creep Auditor

Usage:
  bun renewal-engine.ts --scaffold-renewal --client <name> --current-mrr <n> --delivered-hours <n> [--out <file>]
  bun renewal-engine.ts --audit-contract --contract-mrr <n> --delivered-hours <n> [--out-of-scope-hours <n>] [--json]
  bun renewal-engine.ts --roi-ledger --cost <n> --value-generated <n> [--json]

Options:
  --scaffold-renewal         Scaffolds comprehensive renewal memo with ROI receipts and 3 tiers.
  --client <name>            Client enterprise name.
  --current-mrr <n>          Current monthly recurring revenue.
  --delivered-hours <n>      Total hours delivered in past term.
  --out-of-scope-hours <n>   Hours spent on requests beyond original SOW.
  --audit-contract           Evaluates EHR, scope creep margin drag, and pricing recommendation.
  --roi-ledger               Calculates delivered ROI multiplier against 3.0x threshold.
  --json                     Outputs structured JSON result.
  --help                     Show this help screen.
`);
    process.exit(0);
  }

  if (args.includes("--audit-contract")) {
    const mrr = Number(getArgValue("--contract-mrr")) || 5000;
    const hours = Number(getArgValue("--delivered-hours")) || 40;
    const outOfScope = Number(getArgValue("--out-of-scope-hours")) || 0;

    const res = auditContractHealth({
      contractMrr: mrr,
      deliveredHours: hours,
      outOfScopeHours: outOfScope,
    });

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔍 Contract Health Audit: ${res.marginHealthy ? "✅ HEALTHY" : "⚠️ NEEDS RECALIBRATION"}`);
      console.log(`Contract MRR: $${res.contractMrr.toLocaleString()}/mo`);
      console.log(`Delivered Hours: ${res.deliveredHours} hrs (Effective Hourly Rate: $${res.effectiveHourlyRate}/hr)`);
      console.log(
        `Out-of-Scope Hours: ${res.outOfScopeHours} hrs ($${res.unbilledScopeValue.toLocaleString()} unbilled)`,
      );
      console.log(`Estimated Gross Margin: ${res.estimatedGrossMargin}%`);
      console.log(`Recommendation: ${res.recommendation}`);
      if (res.issues.length > 0) {
        console.log("\nWarnings:");
        for (const issue of res.issues) {
          console.log(` - ${issue}`);
        }
      }
    }
    process.exit(0);
  }

  if (args.includes("--roi-ledger")) {
    const cost = Number(getArgValue("--cost")) || 60000;
    const value = Number(getArgValue("--value-generated")) || 240000;
    const res = computeRoiLedger(cost, value);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📈 ROI Receipts Ledger:`);
      console.log(`Total Investment: $${res.totalCost.toLocaleString()}`);
      console.log(`Value Generated: $${res.valueGenerated.toLocaleString()}`);
      console.log(`ROI Multiplier: ${res.roiMultiplier}x`);
      console.log(`Status: ${res.summary}`);
    }
    process.exit(0);
  }

  if (args.includes("--scaffold-renewal")) {
    const client = getArgValue("--client") || "Enterprise Partner";
    const mrr = Number(getArgValue("--current-mrr")) || 6000;
    const hours = Number(getArgValue("--delivered-hours")) || 45;
    const outOfScope = Number(getArgValue("--out-of-scope-hours")) || 8;
    const value = Number(getArgValue("--value-generated")) || mrr * 12 * 3.8;
    const outPath = getArgValue("--out");

    const doc = scaffoldRenewalDocument({
      clientName: client,
      currentMrr: mrr,
      deliveredHours: hours,
      outOfScopeHours: outOfScope,
      economicValueDelivered: value,
    });

    if (outPath) {
      writeFileSync(outPath, doc, "utf8");
      console.log(`✅ Renewal Memorandum saved to: ${outPath}`);
    } else {
      console.log(doc);
    }
    process.exit(0);
  }
}
