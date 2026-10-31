#!/usr/bin/env bun
/**
 * pricing-calculator.ts: Value-Based Pricing Architecture & Profitability Calculator.
 *
 * Implements PRC-001 through PRC-004:
 *   - PRC-001: Value-Based Pricing Triangulation (Min 5x ROI, 10-20% value capture)
 *   - PRC-002: Delivery Model Matrix (Fixed-Scope, Weekly Sprint, Performance Hybrid)
 *   - PRC-003: Guaranteed Margin Floor (>= 55% gross margin, EHR floor checks)
 *   - PRC-004: Proposal Pricing Schedule Generator
 *
 * Usage:
 *   bun pricing-calculator.ts --calc-model --cost <directCost> --upside <clientUpside> [--json]
 *   bun pricing-calculator.ts --audit-quote --quote <price> --hours <hrs> --direct-cost <cost> [--json]
 *   bun pricing-calculator.ts --scaffold-pricing-schedule --client <name> --base-fee <fee> [--output <file>] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface PricingModelAnalysis {
  directCost: number;
  clientUpside: number;
  costFloorPrice: number;
  valueAnchorPrice: number;
  clientRoiMultiplier: number;
  marginHealthy: boolean;
  tiers: {
    tier1: { name: string; price: number; margin: number; model: string };
    tier2: { name: string; price: number; margin: number; model: string };
    tier3: { name: string; price: number; margin: number; model: string };
  };
}

export interface QuoteAuditReport {
  quotedPrice: number;
  estimatedHours: number;
  directCost: number;
  effectiveHourlyRate: number;
  grossMarginPercent: number;
  marginPasses: boolean;
  ehrPasses: boolean;
  verdict: "APPROVED" | "REJECTED_LOW_MARGIN";
  issues: string[];
}

export function calculatePricingModel(
  directCost: number,
  clientUpside: number,
  targetMargin = 0.55,
): PricingModelAnalysis {
  // Cost-plus floor with 55% margin
  const costFloorPrice = Math.round(directCost / (1 - targetMargin));

  // Value anchor (12.5% of projected annual upside)
  const valueAnchorPrice = Math.round(clientUpside * 0.125);

  // Recommended Tier 2 price: higher of costFloor + 25% or value anchor
  const tier2Price = Math.max(costFloorPrice * 1.25, valueAnchorPrice);
  const tier1Price = Math.max(costFloorPrice, Math.round(tier2Price * 0.6));
  const tier3Price = Math.round(tier2Price * 1.75);

  const calcMargin = (price: number) => Math.round(((price - directCost) / price) * 100);

  const roiMultiplier = Math.round((clientUpside / tier2Price) * 10) / 10;

  return {
    directCost,
    clientUpside,
    costFloorPrice,
    valueAnchorPrice,
    clientRoiMultiplier: roiMultiplier,
    marginHealthy: calcMargin(tier1Price) >= 55,
    tiers: {
      tier1: {
        name: "Tier 1: Core Foundation (Fixed-Scope)",
        price: tier1Price,
        margin: calcMargin(tier1Price),
        model: "Fixed Milestone (50% deposit / 50% UAT sign-off)",
      },
      tier2: {
        name: "Tier 2: Growth & Velocity (Recommended)",
        price: tier2Price,
        margin: calcMargin(tier2Price),
        model: "Phased Milestone (40% deposit / 30% alpha / 30% release)",
      },
      tier3: {
        name: "Tier 3: Dedicated Sprint Pod Retainer",
        price: tier3Price,
        margin: Math.round(((tier3Price - directCost * 1.5) / tier3Price) * 100),
        model: "Bi-Weekly Sprint Retainer (Guaranteed capacity, zero roll-over)",
      },
    },
  };
}

export function auditQuote(
  quotedPrice: number,
  estimatedHours: number,
  directCost: number,
  minEhr = 125,
): QuoteAuditReport {
  const effectiveHourlyRate = Math.round(quotedPrice / Math.max(1, estimatedHours));
  const grossMarginPercent = Math.round(((quotedPrice - directCost) / quotedPrice) * 100);

  const issues: string[] = [];
  if (grossMarginPercent < 55) {
    issues.push(
      `Gross margin (${grossMarginPercent}%) is below the agency minimum threshold (55%). Increase quote or reduce direct contractor costs.`,
    );
  }
  if (effectiveHourlyRate < minEhr) {
    issues.push(
      `Effective Hourly Rate ($${effectiveHourlyRate}/hr) is below the agency floor ($${minEhr}/hr). Project will dilute agency profitability.`,
    );
  }

  const marginPasses = grossMarginPercent >= 55;
  const ehrPasses = effectiveHourlyRate >= minEhr;

  return {
    quotedPrice,
    estimatedHours,
    directCost,
    effectiveHourlyRate,
    grossMarginPercent,
    marginPasses,
    ehrPasses,
    verdict: marginPasses && ehrPasses ? "APPROVED" : "REJECTED_LOW_MARGIN",
    issues,
  };
}

export function scaffoldPricingSchedule(clientName: string, baseFee: number, outputPath?: string): string {
  const analysis = calculatePricingModel(baseFee * 0.45, baseFee * 6);

  const markdown = `# Investment & Pricing Schedule: ${clientName}

> **Document Type**: Client Proposal Pricing Schedule  
> **Prepared By**: Agency Operations & Financial Council (Crew Lead)  
> **Governance Invariant**: Guaranteed Margin Floor $\\ge 55\\%$, Stop-the-Clock Protected  

---

### Three-Option Investment Architecture

| Investment Option | Investment | Delivery Model | Payment Milestones |
|:---|:---|:---|:---|
| **${analysis.tiers.tier1.name}** | **$${analysis.tiers.tier1.price.toLocaleString()}** | Fixed-Scope Milestone | 50% upon signing, 50% upon final acceptance |
| **${analysis.tiers.tier2.name}** | **$${analysis.tiers.tier2.price.toLocaleString()}** | Value & Velocity Milestone | 40% deposit, 30% alpha demo, 30% production launch |
| **${analysis.tiers.tier3.name}** | **$${analysis.tiers.tier3.price.toLocaleString()}** | Dedicated Agile Sprint Pod | Billed bi-weekly in advance per sprint block |

---

### Contract Terms & Financial Fencing

1. **Upfront Deposit Gate**: Work begins solely upon receipt of cleared deposit funds.
2. **48h Stop-the-Clock Standard**: If client feedback, credentials, or asset approvals are delayed $> 48\\text{h}$, milestone schedules pause automatically without agency penalty.
3. **Out-of-Scope Change Orders**: Any addition to the agreed scope is quoted under a separate Change Order at our standard senior sprint rate ($175/hr).
4. **Taxes & Statutory Invoicing**: All fees quoted net of applicable GST, VAT, or digital services sales taxes.
`;

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, markdown, "utf8");
  }

  return markdown;
}

// CLI Execution Harness
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  const calcIdx = args.indexOf("--calc-model");
  if (calcIdx !== -1) {
    const costIdx = args.indexOf("--cost");
    const upsideIdx = args.indexOf("--upside");
    const cost = costIdx !== -1 ? Number(args[costIdx + 1]) : 5000;
    const upside = upsideIdx !== -1 ? Number(args[upsideIdx + 1]) : 60000;

    const report = calculatePricingModel(cost, upside);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n💰 Value-Based Pricing Model Analysis`);
      console.log(`Direct Delivery Cost:  $${report.directCost.toLocaleString()}`);
      console.log(`Client Projected ROI:  ${report.clientRoiMultiplier}x ($${report.clientUpside.toLocaleString()})`);
      console.log(`Cost-Plus Floor (55%): $${report.costFloorPrice.toLocaleString()}`);
      console.log(`Value Anchor Price:    $${report.valueAnchorPrice.toLocaleString()}\n`);

      console.log("Recommended Pricing Tiers:");
      console.log(
        `  ${report.tiers.tier1.name}: $${report.tiers.tier1.price.toLocaleString()} (${report.tiers.tier1.margin}% margin)`,
      );
      console.log(
        `  ${report.tiers.tier2.name}: $${report.tiers.tier2.price.toLocaleString()} (${report.tiers.tier2.margin}% margin)`,
      );
      console.log(
        `  ${report.tiers.tier3.name}: $${report.tiers.tier3.price.toLocaleString()} (${report.tiers.tier3.margin}% margin)\n`,
      );
    }
    process.exit(0);
  }

  const auditIdx = args.indexOf("--audit-quote");
  if (auditIdx !== -1) {
    const quoteIdx = args.indexOf("--quote");
    const hoursIdx = args.indexOf("--hours");
    const costIdx = args.indexOf("--direct-cost");
    const ehrIdx = args.indexOf("--ehr-floor");

    const quote = quoteIdx !== -1 ? Number(args[quoteIdx + 1]) : 15000;
    const hours = hoursIdx !== -1 ? Number(args[hoursIdx + 1]) : 80;
    const cost = costIdx !== -1 ? Number(args[costIdx + 1]) : 6000;
    const ehr = ehrIdx !== -1 ? Number(args[ehrIdx + 1]) : 125;

    const report = auditQuote(quote, hours, cost, ehr);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️  Agency Quote Profitability Audit`);
      console.log(`Quoted Price:          $${report.quotedPrice.toLocaleString()}`);
      console.log(`Gross Margin:          ${report.grossMarginPercent}% (Floor: 55%)`);
      console.log(`Effective Hourly Rate: $${report.effectiveHourlyRate}/hr (Floor: $${ehr}/hr)`);
      console.log(`Verdict:               ${report.verdict}\n`);

      if (report.issues.length > 0) {
        console.log("Profitability Risks:");
        for (const iss of report.issues) console.log(`  • ${iss}`);
      }
    }
    process.exit(report.verdict === "APPROVED" ? 0 : 1);
  }

  const scaffoldIdx = args.indexOf("--scaffold-pricing-schedule");
  if (scaffoldIdx !== -1) {
    const clientIdx = args.indexOf("--client");
    const feeIdx = args.indexOf("--base-fee");
    const outIdx = args.indexOf("--output");

    const client = clientIdx !== -1 ? args[clientIdx + 1] : "Client Enterprise";
    const fee = feeIdx !== -1 ? Number(args[feeIdx + 1]) : 15000;
    const outFile = outIdx !== -1 ? args[outIdx + 1] : undefined;

    const markdown = scaffoldPricingSchedule(client, fee, outFile);

    if (isJson) {
      console.log(JSON.stringify({ client, fee, outFile, length: markdown.length }, null, 2));
    } else {
      if (outFile) {
        console.log(`\n✅ Scaffolded pricing schedule for '${client}' to ${outFile}`);
      } else {
        console.log(markdown);
      }
    }
    process.exit(0);
  }

  console.log(`pricing-calculator.ts — Value-Based Pricing Architecture & Profitability Calculator

Usage:
  bun pricing-calculator.ts --calc-model --cost <directCost> --upside <clientUpside> [--json]
  bun pricing-calculator.ts --audit-quote --quote <price> --hours <hrs> --direct-cost <cost> [--json]
  bun pricing-calculator.ts --scaffold-pricing-schedule --client <name> --base-fee <fee> [--output <file>] [--json]
`);
  process.exit(0);
}
