#!/usr/bin/env bun
/**
 * sku-packager.ts: Turnkey Productized Agency SKU Packager & Value Triangulation Engine
 *
 * Implements SKU-001 through SKU-004:
 *   - SKU-001: Turnkey Productized SKU Scaffolder (fixed-scope, DoD, SLA turnaround, anti-scope boundary)
 *   - SKU-002: Outcome-Based Value Triangulation (5.0x client ROI floor, 80%+ agency gross margin)
 *   - SKU-003: Automated SOW & Client Intake Brief Generator (SOW contract + intake checklist)
 *   - SKU-004: Milestone Verification Checklist & Sign-Off Packet (receipts verification, retention trigger)
 *
 * Usage:
 *   bun sku-packager.ts --scaffold-sku --name "AI Lead Engine" [--json]
 *   bun sku-packager.ts --calc-pricing --value 100000 --cost 2500 [--json]
 *   bun sku-packager.ts --generate-sow --sku <sku.json> --client "Acme Corp" [--json]
 *   bun sku-packager.ts --verify-milestone --sku <sku.json> --receipts <receipts.json> [--json]
 */

import fs from "node:fs";
import { parseArgs } from "node:util";

// =========================================================================
// Interfaces & Types
// =========================================================================

export type SkuTier = "starter" | "growth" | "enterprise";
export type SkuCategory = "engineering" | "marketing" | "design" | "operations" | "ai-automation";

export interface SkuConfig {
  name: string;
  category: SkuCategory;
  tier: SkuTier;
  turnaroundDays: number;
  deliverables: string[];
  definitionOfDone: string[];
  exclusions: string[];
  basePriceUsd: number;
}

export interface ProductizedSku {
  skuId: string;
  name: string;
  category: SkuCategory;
  tier: SkuTier;
  turnaroundDays: number;
  deliverables: string[];
  definitionOfDone: string[];
  exclusions: string[];
  basePriceUsd: number;
  slaTurnaroundHours: number;
  createdAt: string;
}

export interface SkuPricingInput {
  estimatedClientAnnualUpsideUsd: number;
  agencyDirectDeliveryCostUsd: number;
  targetClientRoiMultiple?: number; // default 5.0x
  targetGrossMarginPercent?: number; // default 80%
}

export interface SkuPricingOutput {
  recommendedPriceUsd: number;
  clientRoiMultiple: number;
  projectedGrossMarginPercent: number;
  agencyProfitUsd: number;
  maxAllowableDiscountPercent: number;
  marginFloorBreached: boolean;
  verdict: "APPROVED" | "REVISE";
  summary: string;
}

export interface ClientInfo {
  clientName: string;
  clientEmail?: string;
  billingAddress?: string;
  startDate?: string;
}

export interface SowPacket {
  skuId: string;
  clientName: string;
  statementOfWorkMd: string;
  intakeChecklistMd: string;
  milestoneSchedule: Array<{ milestone: string; dueDays: number; deliverable: string }>;
}

export interface DeliveryReceipt {
  deliverableName: string;
  completedAt: string;
  artifactUri: string;
  verifiedBy: string;
}

export interface MilestoneSignoffPacket {
  skuId: string;
  totalDeliverables: number;
  completedDeliverables: number;
  completionPercent: number;
  unfulfilledDeliverables: string[];
  allCriteriaSatisfied: boolean;
  verdict: "SIGN_OFF_READY" | "INCOMPLETE";
  signOffMemoMd: string;
  nextRetentionAction: string;
}

// =========================================================================
// SKU-001: Turnkey Productized SKU Scaffolder
// =========================================================================

export function scaffoldProductizedSku(params: Partial<SkuConfig> & { name: string }): ProductizedSku {
  const cleanId = `SKU-${params.name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .slice(0, 16)}`;
  const turnaroundDays = params.turnaroundDays && params.turnaroundDays > 0 ? params.turnaroundDays : 7;
  const category = params.category || "ai-automation";
  const tier = params.tier || "growth";
  const basePriceUsd = params.basePriceUsd && params.basePriceUsd > 0 ? params.basePriceUsd : 5000;

  const defaultDeliverables: Record<SkuCategory, string[]> = {
    "ai-automation": [
      "Production-ready AI agent workflow with automated retry fallbacks",
      "Model Context Protocol (MCP) tool integration and schema guard",
      "Multi-tenant database schema migrations and type definitions",
      "Automated unit & synthetic evaluation test suite with >=95% pass rate",
    ],
    engineering: [
      "Full-stack Next.js/Astro application repository with strict TypeScript",
      "Postgres database schema with Drizzle ORM and connection pooling",
      "Authentication and RBAC session security controls",
      "Headless CI/CD release gate and zero-downtime deployment script",
    ],
    marketing: [
      "High-converting landing page with 6-beat narrative copy spine",
      "Programmatic SEO cluster templates and dynamic XML sitemap",
      "Multi-channel social carousel graphics and scheduled post queue",
      "Conversion tracking pixels (GA4, Meta CAPI) with PII scrubbing",
    ],
    design: [
      "Awwwards-quality visual design system with fluid typography",
      "Design tokens JSON (DTCG standard) with 37 OKLCH color palettes",
      "Component library layout specs with responsive CSS Grid/Flexbox",
      "Interactive Motion/GSAP micro-interaction animation tokens",
    ],
    operations: [
      "Client onboarding intake vault with token-gated access fencing",
      "Statement of Work and Master Services Agreement legal packet",
      "Financial P&L model with DSO dunning ladder and automated invoicing",
      "Tri-vector client retention and churn early warning telemetry dashboard",
    ],
  };

  const deliverables =
    params.deliverables && params.deliverables.length > 0 ? params.deliverables : defaultDeliverables[category];

  const definitionOfDone =
    params.definitionOfDone && params.definitionOfDone.length > 0
      ? params.definitionOfDone
      : [
          "All code pushed to GitHub repository on clean branch with passing CI",
          "Zero security vulnerabilities and zero secrets exposed under Vibeguard scan",
          "Documented README with 1-click local setup and environment instructions",
          "Formal client walkthrough recording and sign-off verification receipt",
        ];

  const exclusions =
    params.exclusions && params.exclusions.length > 0
      ? params.exclusions
      : [
          "Out-of-scope custom integrations not specified in deliverables array",
          "Ongoing hosting or third-party API usage fees (paid directly by client)",
          "Major architectural redesigns after milestone 1 visual sign-off",
          "24/7 dedicated real-time on-call support outside agreed retainer SLA",
        ];

  return {
    skuId: cleanId,
    name: params.name,
    category,
    tier,
    turnaroundDays,
    deliverables,
    definitionOfDone,
    exclusions,
    basePriceUsd,
    slaTurnaroundHours: turnaroundDays * 24,
    createdAt: new Date().toISOString(),
  };
}

// =========================================================================
// SKU-002: Outcome-Based Value Triangulation Engine
// =========================================================================

export function calculateSkuPricing(input: SkuPricingInput): SkuPricingOutput {
  const targetRoi =
    input.targetClientRoiMultiple && input.targetClientRoiMultiple >= 1.0 ? input.targetClientRoiMultiple : 5.0; // 5.0x ROI floor

  const targetMargin =
    input.targetGrossMarginPercent && input.targetGrossMarginPercent > 0 ? input.targetGrossMarginPercent : 80.0; // 80% gross margin target

  // Price ceiling based on client value realization (e.g. 100k upside / 5.0 ROI = $20,000 price ceiling)
  const valueCeilingPrice = Math.round(input.estimatedClientAnnualUpsideUsd / targetRoi);

  // Price floor based on agency direct cost and target gross margin (e.g. $2,500 cost / (1 - 0.80) = $12,500 floor)
  const costFloorPrice = Math.round(input.agencyDirectDeliveryCostUsd / (1 - targetMargin / 100));

  // Optimal recommended price is max of cost floor and 85% of value ceiling
  const recommendedPrice = Math.max(costFloorPrice, Math.round(valueCeilingPrice * 0.85));

  const clientRoi =
    input.estimatedClientAnnualUpsideUsd > 0 && recommendedPrice > 0
      ? Number((input.estimatedClientAnnualUpsideUsd / recommendedPrice).toFixed(1))
      : 0;

  const agencyProfit = recommendedPrice - input.agencyDirectDeliveryCostUsd;
  const grossMargin = recommendedPrice > 0 ? Number(((agencyProfit / recommendedPrice) * 100).toFixed(1)) : 0;

  // Maximum allowable discount before gross margin drops below 70% hard agency floor
  const minAllowedPrice = Math.round(input.agencyDirectDeliveryCostUsd / 0.3);
  const maxDiscountDollars = Math.max(0, recommendedPrice - minAllowedPrice);
  const maxDiscountPercent =
    recommendedPrice > 0 ? Number(((maxDiscountDollars / recommendedPrice) * 100).toFixed(1)) : 0;

  const marginFloorBreached = grossMargin < 70.0;
  const meetsRoiFloor = clientRoi >= targetRoi;

  const verdict: "APPROVED" | "REVISE" = !marginFloorBreached && meetsRoiFloor ? "APPROVED" : "REVISE";

  const summary =
    verdict === "APPROVED"
      ? `Price APPROVED at $${recommendedPrice.toLocaleString()} (${clientRoi}x client ROI, ${grossMargin}% agency margin).`
      : `Price REVISE needed: Margin (${grossMargin}%) or ROI (${clientRoi}x) breached threshold.`;

  return {
    recommendedPriceUsd: recommendedPrice,
    clientRoiMultiple: clientRoi,
    projectedGrossMarginPercent: grossMargin,
    agencyProfitUsd: agencyProfit,
    maxAllowableDiscountPercent: maxDiscountPercent,
    marginFloorBreached,
    verdict,
    summary,
  };
}

// =========================================================================
// SKU-003: Automated SOW & Client Intake Brief Generator
// =========================================================================

export function generateSowAndIntakeBrief(sku: ProductizedSku, client: ClientInfo): SowPacket {
  const clientName = client.clientName || "Client Enterprise";
  const startDate = client.startDate || new Date().toISOString().split("T")[0];

  const milestoneSchedule = [
    {
      milestone: "M1: Architecture & Technical Kickoff",
      dueDays: Math.max(1, Math.round(sku.turnaroundDays * 0.25)),
      deliverable: "Technical specification, schema models, and baseline repository",
    },
    {
      milestone: "M2: Core Functional Build",
      dueDays: Math.max(2, Math.round(sku.turnaroundDays * 0.65)),
      deliverable: sku.deliverables.slice(0, 2).join("; "),
    },
    {
      milestone: "M3: Final Hardening & Delivery Sign-Off",
      dueDays: sku.turnaroundDays,
      deliverable: sku.deliverables.slice(2).join("; ") || "Production handoff & walkthrough",
    },
  ];

  const sowMarkdown = `# Statement of Work (SOW): ${sku.name}

**Client:** ${clientName}  
**Effective Date:** ${startDate}  
**Turnaround Commitment:** ${sku.turnaroundDays} Business Days (${sku.slaTurnaroundHours} Hours SLA)  
**Fixed Investment:** $${sku.basePriceUsd.toLocaleString()} USD  

---

## 1. Scope of Deliverables
The Agency will design, build, and deliver the following fixed-scope assets:
${sku.deliverables.map((d, i) => `${i + 1}. **${d}**`).join("\n")}

---

## 2. Definition of Done (DoD)
A deliverable is legally fulfilled only when satisfying these objective criteria:
${sku.definitionOfDone.map((dod) => `- [ ] ${dod}`).join("\n")}

---

## 3. Strict Boundary & Exclusions List
Any request outside this boundary requires an executed Change Order:
${sku.exclusions.map((ex) => `- ❌ ${ex}`).join("\n")}

---

## 4. Milestone Schedule
| Milestone | Target Delivery | Deliverables |
| :--- | :--- | :--- |
${milestoneSchedule.map((m) => `| **${m.milestone}** | Day ${m.dueDays} | ${m.deliverable} |`).join("\n")}

---

## 5. Payment Terms & Sign-Off
- **Deposit**: 50% upfront payment upon contract execution ($${Math.round(sku.basePriceUsd * 0.5).toLocaleString()}).
- **Final Balance**: 50% due upon completion of Milestone 3 and verification receipt.
- **Warranty**: 30-day post-delivery bug resolution warranty under agreed SLA.
`;

  const intakeMarkdown = `# Client Intake Brief: ${sku.name}

Welcome to the **${sku.name}** productized delivery engine. To meet our **${sku.turnaroundDays}-day turnaround guarantee**, please provide the following assets within 24 hours of kickoff:

## 📋 Required Asset Checklist
- [ ] Primary brand identity assets (SVG logo, typography files, brand guidelines)
- [ ] Technical credentials or sandbox API keys (provisioned via dedicated client context vault)
- [ ] Production domain DNS or hosting provider access
- [ ] Single designated stakeholder for milestone reviews and sign-offs

## ❓ Rapid Discovery Questions
1. What is the single primary business metric this delivery must move within 60 days?
2. Are there any existing legacy databases, APIs, or technical dependencies we must integrate?
3. What is the hard external deadline or launch event driving this timeline?
`;

  return {
    skuId: sku.skuId,
    clientName,
    statementOfWorkMd: sowMarkdown,
    intakeChecklistMd: intakeMarkdown,
    milestoneSchedule,
  };
}

// =========================================================================
// SKU-004: Milestone Verification Checklist & Sign-Off Packet
// =========================================================================

export function generateMilestoneSignoffPacket(
  sku: ProductizedSku,
  receipts: DeliveryReceipt[],
): MilestoneSignoffPacket {
  const verifiedMap = new Set<string>();
  for (const r of receipts) {
    verifiedMap.add(r.deliverableName.toLowerCase().trim());
  }

  const unfulfilled: string[] = [];
  let completed = 0;

  for (const d of sku.deliverables) {
    const isVerified = receipts.some(
      (r) =>
        r.deliverableName.toLowerCase().includes(d.toLowerCase().slice(0, 20)) ||
        d.toLowerCase().includes(r.deliverableName.toLowerCase().slice(0, 20)),
    );

    if (isVerified) {
      completed++;
    } else {
      unfulfilled.push(d);
    }
  }

  const total = sku.deliverables.length;
  const completionPercent = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 100;
  const allCriteriaSatisfied = unfulfilled.length === 0;

  const verdict: "SIGN_OFF_READY" | "INCOMPLETE" = allCriteriaSatisfied ? "SIGN_OFF_READY" : "INCOMPLETE";

  const signOffMemo = `# Milestone Delivery Sign-Off Memo

**SKU ID:** \`${sku.skuId}\` — ${sku.name}  
**Completion Status:** ${completed}/${total} Deliverables (${completionPercent}%)  
**Verdict:** **${verdict}**  

## Verification Receipts Ledger
| Deliverable | Completed At | Verified By | Artifact Receipt |
| :--- | :--- | :--- | :--- |
${receipts.map((r) => `| ${r.deliverableName} | ${r.completedAt} | ${r.verifiedBy} | \`${r.artifactUri}\` |`).join("\n")}

${unfulfilled.length > 0 ? `\n### ⚠️ Pending Unfulfilled Deliverables\n${unfulfilled.map((u) => `- ❌ ${u}`).join("\n")}` : ""}

---

## Sign-Off Protocol
${
  allCriteriaSatisfied
    ? "✅ All agreed deliverables and DoD criteria verified. Project cleared for final invoice and transition to post-delivery retention loop."
    : "❌ Delivery incomplete. Outstanding items must be fulfilled before client sign-off."
}
`;

  const nextRetentionAction = allCriteriaSatisfied
    ? "Trigger retain:check-in at delivery+7d and schedule 30-day value note"
    : "Resolve outstanding deliverables before triggering retention loop";

  return {
    skuId: sku.skuId,
    totalDeliverables: total,
    completedDeliverables: completed,
    completionPercent,
    unfulfilledDeliverables: unfulfilled,
    allCriteriaSatisfied,
    verdict,
    signOffMemoMd: signOffMemo,
    nextRetentionAction,
  };
}

// =========================================================================
// Report Formatter
// =========================================================================

export function formatSkuReport(data: {
  sku?: ProductizedSku;
  pricing?: SkuPricingOutput;
  sow?: SowPacket;
  signoff?: MilestoneSignoffPacket;
}): string {
  const lines: string[] = [
    "================================================================================",
    "  📦 MUSE OPS — PRODUCTIZED AGENCY SKU PACKAGER REPORT",
    "================================================================================",
  ];

  if (data.sku) {
    lines.push(
      `SKU: [${data.sku.skuId}] ${data.sku.name} (${data.sku.tier.toUpperCase()})`,
      `Category: ${data.sku.category} | Turnaround: ${data.sku.turnaroundDays} Days (${data.sku.slaTurnaroundHours}h SLA)`,
      `Base Price: $${data.sku.basePriceUsd.toLocaleString()} USD`,
      `Deliverables: ${data.sku.deliverables.length} items | Exclusions: ${data.sku.exclusions.length} fences`,
      "--------------------------------------------------------------------------------",
    );
  }

  if (data.pricing) {
    lines.push(
      `Pricing Triangulation:`,
      `Recommended Price: $${data.pricing.recommendedPriceUsd.toLocaleString()} USD`,
      `Client ROI: ${data.pricing.clientRoiMultiple}x | Agency Gross Margin: ${data.pricing.projectedGrossMarginPercent}%`,
      `Agency Net Profit: $${data.pricing.agencyProfitUsd.toLocaleString()} USD`,
      `Max Haircut Discount: ${data.pricing.maxAllowableDiscountPercent}%`,
      `Verdict: ${data.pricing.verdict} — ${data.pricing.summary}`,
      "--------------------------------------------------------------------------------",
    );
  }

  if (data.signoff) {
    lines.push(
      `Milestone Sign-Off:`,
      `Completion: ${data.signoff.completedDeliverables}/${data.signoff.totalDeliverables} (${data.signoff.completionPercent}%)`,
      `Verdict: ${data.signoff.verdict}`,
      `Retention Pipeline: ${data.signoff.nextRetentionAction}`,
    );
  }

  lines.push("================================================================================");
  return lines.join("\n");
}

// =========================================================================
// Standalone CLI Runner
// =========================================================================

export async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "scaffold-sku": { type: "boolean" },
      "calc-pricing": { type: "boolean" },
      "generate-sow": { type: "boolean" },
      "verify-milestone": { type: "boolean" },
      name: { type: "string" },
      category: { type: "string" },
      tier: { type: "string" },
      turnaround: { type: "string" },
      price: { type: "string" },
      value: { type: "string" },
      cost: { type: "string" },
      sku: { type: "string" },
      client: { type: "string" },
      receipts: { type: "string" },
      json: { type: "boolean" },
    },
    strict: false,
  });

  if (values["scaffold-sku"]) {
    const skuName = values.name || "Custom Delivery Engine";
    const sku = scaffoldProductizedSku({
      name: skuName,
      category: (values.category as SkuCategory) || "ai-automation",
      tier: (values.tier as SkuTier) || "growth",
      turnaroundDays: values.turnaround ? Number(values.turnaround) : 7,
      basePriceUsd: values.price ? Number(values.price) : 5000,
    });

    if (values.json) {
      console.log(JSON.stringify(sku, null, 2));
    } else {
      console.log(formatSkuReport({ sku }));
    }
    return;
  }

  if (values["calc-pricing"]) {
    const upside = values.value ? Number(values.value) : 100000;
    const directCost = values.cost ? Number(values.cost) : 2500;
    const pricing = calculateSkuPricing({
      estimatedClientAnnualUpsideUsd: upside,
      agencyDirectDeliveryCostUsd: directCost,
    });

    if (values.json) {
      console.log(JSON.stringify(pricing, null, 2));
    } else {
      console.log(formatSkuReport({ pricing }));
    }
    return;
  }

  if (values["generate-sow"]) {
    let sku: ProductizedSku;
    if (values.sku && fs.existsSync(values.sku)) {
      sku = JSON.parse(fs.readFileSync(values.sku, "utf8"));
    } else {
      sku = scaffoldProductizedSku({ name: values.name || "Production Engine" });
    }
    const sow = generateSowAndIntakeBrief(sku, { clientName: values.client || "Client Enterprise" });

    if (values.json) {
      console.log(JSON.stringify(sow, null, 2));
    } else {
      console.log(sow.statementOfWorkMd);
    }
    return;
  }

  if (values["verify-milestone"]) {
    if (!values.sku || !fs.existsSync(values.sku) || !values.receipts || !fs.existsSync(values.receipts)) {
      console.error("Error: --sku <sku.json> and --receipts <receipts.json> are required for --verify-milestone.");
      process.exit(1);
    }
    const sku: ProductizedSku = JSON.parse(fs.readFileSync(values.sku, "utf8"));
    const receipts: DeliveryReceipt[] = JSON.parse(fs.readFileSync(values.receipts, "utf8"));
    const signoff = generateMilestoneSignoffPacket(sku, receipts);

    if (values.json) {
      console.log(JSON.stringify(signoff, null, 2));
    } else {
      console.log(formatSkuReport({ sku, signoff }));
    }
    return;
  }

  console.log("Usage: sku-packager.ts [--scaffold-sku|--calc-pricing|--generate-sow|--verify-milestone] [options]");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("SkuPackager Fatal:", err);
    process.exit(1);
  });
}
