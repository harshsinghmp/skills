#!/usr/bin/env bun
/**
 * viral-engine.ts: Jasper Viral Loop Coefficient & Referral Mechanics Engine.
 *
 * Implements VIR-001 through VIR-004:
 *   - VIR-001: Mathematical K-Factor Triangulation & Multiplier Modeling
 *   - VIR-002: Viral Cycle Time (ct) Compression Fences (ct <= 72h)
 *   - VIR-003: Double-Sided Asymmetric Incentive Architecture & Fraud Defense
 *   - VIR-004: Contextual "Aha!" Trigger Placement (Zero Cold Asks)
 *
 * Usage:
 *   bun viral-engine.ts --calc-k --invites <num> --conversion <num> [--json]
 *   bun viral-engine.ts --simulate-loop --users <num> --k <num> --cycle-days <days> --horizon-days <days> [--json]
 *   bun viral-engine.ts --audit-referral <file> [--json]
 *   bun viral-engine.ts --scaffold-incentives [--model <saas|agency|ecommerce>] [--output <file>] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface KFactorReport {
  invitationRate: number;
  conversionRate: number;
  kFactor: number;
  multiplier: number | "Infinity";
  classification: "EXPONENTIAL" | "STRONG_AMPLIFIER" | "MODERATE_AMPLIFIER" | "WEAK_AMPLIFIER" | "SUB_VIABLE";
  isViable: boolean;
  organicLiftPercent: number;
  recommendations: string[];
}

export interface SimulationCohort {
  cycle: number;
  day: number;
  newUsers: number;
  cumulativeUsers: number;
}

export interface SimulationReport {
  initialUsers: number;
  kFactor: number;
  cycleDays: number;
  horizonDays: number;
  totalCycles: number;
  finalCumulativeUsers: number;
  netOrganicMultiplier: number;
  cohorts: SimulationCohort[];
}

export interface ReferralProgramConfig {
  programName?: string;
  cycleTimeHours?: number;
  invitationRate?: number;
  conversionRate?: number;
  incentiveStructure?: {
    isDoubleSided?: boolean;
    inviteeReward?: string;
    inviterReward?: string;
    inviterMilestoneGated?: boolean;
  };
  triggerPlacement?: {
    promptAtSignup?: boolean;
    promptAtAhaMoment?: boolean;
    triggerEvents?: string[];
  };
  fraudDefense?: {
    deviceFingerprinting?: boolean;
    disposableEmailBlocked?: boolean;
    velocityRateLimits?: boolean;
  };
}

export interface ReferralAuditReport {
  target: string;
  passed: boolean;
  healthScore: number; // 0 - 100
  verdict: "APPROVED" | "REVISE_INCENTIVES" | "REJECTED";
  kFactor: number;
  cycleTimeHours: number;
  issues: string[];
  strengths: string[];
}

export function calculateKFactor(invites: number, conversionRate: number): KFactorReport {
  const conv = conversionRate > 1 ? conversionRate / 100 : conversionRate;
  const k = Math.round(invites * conv * 1000) / 1000;

  let multiplier: number | "Infinity";
  let liftPercent: number;
  let classification: KFactorReport["classification"];
  const recommendations: string[] = [];

  if (k >= 1.0) {
    multiplier = "Infinity";
    liftPercent = 999;
    classification = "EXPONENTIAL";
    recommendations.push("True viral compounding achieved! Optimize onboarding capacity and infrastructure stability.");
  } else {
    const rawMult = 1 / (1 - k);
    multiplier = Math.round(rawMult * 100) / 100;
    liftPercent = Math.round((multiplier - 1) * 100);

    if (k >= 0.5) {
      classification = "STRONG_AMPLIFIER";
      recommendations.push("Strong organic multiplier. Focus on compressing cycle time under 24 hours.");
    } else if (k >= 0.25) {
      classification = "MODERATE_AMPLIFIER";
      recommendations.push(
        "Healthy baseline amplifier. Test higher-value upfront invitee rewards to lift conversion rate.",
      );
    } else if (k >= 0.15) {
      classification = "WEAK_AMPLIFIER";
      recommendations.push("Marginal viability. Shift referral prompts to post-success 'Aha!' dopamine moments.");
    } else {
      classification = "SUB_VIABLE";
      recommendations.push(
        "Sub-viable viral factor (< 0.15). Restructure incentive model to prevent negative brand drag.",
      );
    }
  }

  return {
    invitationRate: invites,
    conversionRate: conv,
    kFactor: k,
    multiplier,
    classification,
    isViable: k >= 0.15,
    organicLiftPercent: liftPercent,
    recommendations,
  };
}

export function simulateViralGrowth(
  initialUsers: number,
  kFactor: number,
  cycleDays: number,
  horizonDays: number,
): SimulationReport {
  const totalCycles = Math.floor(horizonDays / Math.max(1, cycleDays));
  const cohorts: SimulationCohort[] = [];

  let currentNew = initialUsers;
  let cumulative = initialUsers;

  cohorts.push({
    cycle: 0,
    day: 0,
    newUsers: initialUsers,
    cumulativeUsers: initialUsers,
  });

  for (let c = 1; c <= totalCycles; c++) {
    currentNew = Math.round(currentNew * kFactor);
    cumulative += currentNew;
    cohorts.push({
      cycle: c,
      day: c * cycleDays,
      newUsers: currentNew,
      cumulativeUsers: cumulative,
    });
    if (currentNew === 0) break;
  }

  const netMult = Math.round((cumulative / initialUsers) * 100) / 100;

  return {
    initialUsers,
    kFactor,
    cycleDays,
    horizonDays,
    totalCycles,
    finalCumulativeUsers: cumulative,
    netOrganicMultiplier: netMult,
    cohorts,
  };
}

export function auditReferralProgram(configInput: ReferralProgramConfig | string): ReferralAuditReport {
  let config: ReferralProgramConfig;
  let target = "Inline Configuration";

  if (typeof configInput === "string") {
    target = configInput;
    if (fs.existsSync(configInput)) {
      const raw = fs.readFileSync(configInput, "utf8");
      try {
        config = JSON.parse(raw);
      } catch {
        config = {};
      }
    } else {
      config = {};
    }
  } else {
    config = configInput;
  }

  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  // 1. K-factor viability (VIR-001)
  const i = config.invitationRate ?? 1.5;
  const c = config.conversionRate ?? 0.15;
  const kReport = calculateKFactor(i, c);

  if (!kReport.isViable) {
    issues.push(
      `K-factor (${kReport.kFactor}) below minimum viable threshold (0.15) — yields negligible organic lift.`,
    );
    score -= 25;
  } else {
    strengths.push(
      `Viable K-factor (${kReport.kFactor}) providing ~${kReport.organicLiftPercent}% organic acquisition lift.`,
    );
  }

  // 2. Cycle Time Fences (VIR-002)
  const ct = config.cycleTimeHours ?? 48;
  if (ct > 72) {
    issues.push(`Cycle time (${ct}h) exceeds the 72-hour ceiling (VIR-002 violation); slows viral compounding.`);
    score -= 20;
  } else {
    strengths.push(`Cycle time (${ct}h) safely contained within the sub-72h viral window.`);
  }

  // 3. Double-Sided & Milestone Gated (VIR-003)
  const incentives = config.incentiveStructure ?? {};
  if (!incentives.isDoubleSided) {
    issues.push("Incentive structure is single-sided; fails to motivate both inviter and invitee (VIR-003 violation).");
    score -= 20;
  } else {
    strengths.push("Double-sided incentive structure active.");
  }

  if (incentives.inviterMilestoneGated === false) {
    issues.push(
      "Inviter reward is released on unverified email signup rather than an activation milestone (fraud vulnerability).",
    );
    score -= 15;
  } else {
    strengths.push("Inviter reward correctly gated on verified activation milestone.");
  }

  // 4. Trigger Placement (VIR-004)
  const triggers = config.triggerPlacement ?? {};
  if (triggers.promptAtSignup === true) {
    issues.push("Referral ask surfaced at account signup before value delivery (cold-ask anti-pattern).");
    score -= 15;
  }

  if (triggers.promptAtAhaMoment === false && (!triggers.triggerEvents || triggers.triggerEvents.length === 0)) {
    issues.push("Missing post-success 'Aha!' contextual referral triggers (VIR-004 violation).");
    score -= 15;
  } else {
    strengths.push("Referral prompts anchored to post-success 'Aha!' milestones.");
  }

  // 5. Fraud Defense Guardrails
  const fraud = config.fraudDefense ?? {};
  if (!fraud.disposableEmailBlocked || !fraud.velocityRateLimits) {
    issues.push("Missing disposable email domain blocker or velocity rate limiter.");
    score -= 10;
  } else {
    strengths.push("Anti-sybil fraud defense rules enabled.");
  }

  score = Math.max(0, score);
  const passed = score >= 75 && issues.length <= 1;
  const verdict: ReferralAuditReport["verdict"] = passed ? "APPROVED" : score >= 50 ? "REVISE_INCENTIVES" : "REJECTED";

  return {
    target,
    passed,
    healthScore: score,
    verdict,
    kFactor: kReport.kFactor,
    cycleTimeHours: ct,
    issues,
    strengths,
  };
}

export function scaffoldIncentiveSchedule(
  model: "saas" | "agency" | "ecommerce" = "saas",
  clientName = "Acme Corp",
): string {
  if (model === "agency") {
    return `# Double-Sided Referral & Expansion Architecture: ${clientName}

> **Governing Lead**: Jasper (Agency Council Creative Technologist & Growth Mastermind)  
> **Model**: High-Ticket Agency / Professional Services Referral Schedule  
> **Standard**: VIR-001 through VIR-004  

---

## 1. Asymmetric Double-Sided Incentive Structure

| Party | Incentive Type | Value & Fulfillment Gate | Anti-Fraud Verification |
|:---|:---|:---|:---|
| **Invitee (New Client)** | Upfront Retainer Credit | **$1,500 Invoice Credit** applied to Month 1 milestone upon contract execution | Requires verified corporate domain & signed SOW |
| **Inviter (Referring Partner)** | Revenue Share / Cash Credit | **10% Recurring Commission** (or $2,000 credit) on all billings for the first 90 days | Released Net 30 after client settles invoices |

---

## 2. Contextual "Aha!" Trigger Placement

1. **Trigger A (Sprint Delivery Milestone)**: Prompt sent immediately upon successful delivery of Phase 1 milestone.
2. **Trigger B (QBR / ROI Receipt Presentation)**: Prompt delivered following formal sign-off where client ROI exceeds $ge 3.0\times$.
3. **Trigger C (Direct Executive Praise)**: Triggered within 24 hours of client leadership acknowledging standout project velocity.

---

## 3. Viral Loop Economics ($K$-Factor Baseline)

- **Target Invitation Rate ($i$)**: 0.8 introductions per satisfied client.
- **Target Referral Conversion ($c$)**: 45% (high trust peer referral).
- **Projected $K$-Factor**: $K = 0.8 \times 0.45 = 0.36$
- **Organic Amplification**: $\frac{1}{1 - 0.36} = 1.56\times$ (every 10 acquired agency clients generate 5.6 organic client referrals).
- **Cycle Time Target ($ct$)**: $le 14\text{ days}$ from milestone delivery to introduction.
`;
  }

  if (model === "ecommerce") {
    return `# Double-Sided Referral Program Specification: ${clientName}

> **Governing Lead**: Jasper (Agency Council Creative Technologist & Growth Mastermind)  
> **Model**: High-Volume Direct-to-Consumer E-Commerce Loop  
> **Standard**: VIR-001 through VIR-004  

---

## 1. Asymmetric Double-Sided Incentive Structure

| Party | Reward Structure | Value & Qualification Gate | Anti-Fraud Fences |
|:---|:---|:---|:---|
| **Invitee (Friend)** | Instant Cart Discount | **$25 OFF** first order over $75 | Unique device fingerprint, 1-per-household rule |
| **Inviter (Customer)** | Store Wallet Credit | **$25 Store Credit** unlocked upon friend's package shipment | 7-day return grace buffer before credit matures |

---

## 2. In-Product Trigger Placement & Cycle Time

- **Post-Purchase Intercept**: Surfaced on Order Confirmation Page (Zero Cold Asks).
- **Unboxing Delivery SMS**: Contextual SMS prompt triggered 2 hours after tracking indicates "Delivered".
- **Target Cycle Time ($ct$)**: $le 48\text{ hours}$ from delivery to friend share.
- **Target $K$-Factor**: $K = 2.4 \times 0.15 = 0.36$ ($1.56\times$ organic order multiplier).
`;
  }

  // Default: B2B SaaS
  return `# Double-Sided Referral & Product-Led Growth Engine: ${clientName}

> **Governing Lead**: Jasper (Agency Council Creative Technologist & Growth Mastermind)  
> **Model**: B2B SaaS Product-Led Growth (PLG) Loop  
> **Standard**: VIR-001 through VIR-004  

---

## 1. Asymmetric Double-Sided Incentive Structure

| Participant | Reward Mechanism | Trigger & Activation Gate | Anti-Fraud Defense |
|:---|:---|:---|:---|
| **Invitee (New Workspace)** | Free Extended Trial | **30-Day Pro Tier Access** + $100 API compute credits upon signup | Disposable email domains banned; phone OTP verify |
| **Inviter (Existing User)** | Usage Tier Expansion | **+5 Team Seats** or $100 monthly billing credit unlocked when invitee deploys 1st app | Milestone gated (first active production deploy) |

---

## 2. Behavioral Triggers & Viral Cycle Time

- **Trigger Moment 1 (Project First Deploy)**: Modal prompt: *"Deploy successful! Invite your team or peer founders for $100 compute credits."*
- **Trigger Moment 2 (High-Usage Upgrade)**: Alert: *"You've hit 80% quota! Invite a colleague to unlock an extra 5GB storage immediately."*
- **Target Cycle Time ($ct$)**: $le 24\text{ hours}$ (facilitated via deep-link magic invites).
- **Target $K$-Factor**: $K = 3.0 \times 0.20 = 0.60$ ($2.5\times$ organic user acquisition multiplier).
`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  // 1. Calculate K-Factor
  const calcIdx = args.indexOf("--calc-k");
  if (calcIdx !== -1) {
    const invIdx = args.indexOf("--invites");
    const convIdx = args.indexOf("--conversion");
    const invites = invIdx !== -1 && args[invIdx + 1] ? Number.parseFloat(args[invIdx + 1]) : 2.0;
    const conversion = convIdx !== -1 && args[convIdx + 1] ? Number.parseFloat(args[convIdx + 1]) : 0.2;

    const report = calculateKFactor(invites, conversion);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🚀 Jasper Viral Loop Calculator: K = i × c`);
      console.log(`Invitation Rate (i):   ${report.invitationRate} invites/user`);
      console.log(`Conversion Rate (c):   ${Math.round(report.conversionRate * 100)}%`);
      console.log(`Viral Factor (K):      ${report.kFactor}`);
      console.log(
        `Acquisition Multiplier:${report.multiplier === "Infinity" ? " ∞ (EXPONENTIAL VIRALITY)" : ` ${report.multiplier}x (+${report.organicLiftPercent}% organic lift)`}`,
      );
      console.log(`Classification:        ${report.classification}`);
      console.log(`Viability Status:      ${report.isViable ? "✅ VIABLE (GEAR ACTIVE)" : "🚫 SUB-VIABLE (< 0.15)"}\n`);
      for (const rec of report.recommendations) console.log(`  💡 ${rec}`);
    }
    process.exit(0);
  }

  // 2. Simulate Growth
  const simIdx = args.indexOf("--simulate-loop");
  if (simIdx !== -1) {
    const uIdx = args.indexOf("--users");
    const kIdx = args.indexOf("--k");
    const cdIdx = args.indexOf("--cycle-days");
    const hdIdx = args.indexOf("--horizon-days");

    const users = uIdx !== -1 ? Number.parseInt(args[uIdx + 1], 10) : 1000;
    const k = kIdx !== -1 ? Number.parseFloat(args[kIdx + 1]) : 0.45;
    const cd = cdIdx !== -1 ? Number.parseInt(args[cdIdx + 1], 10) : 3;
    const hd = hdIdx !== -1 ? Number.parseInt(args[hdIdx + 1], 10) : 90;

    const sim = simulateViralGrowth(users, k, cd, hd);
    if (isJson) {
      console.log(JSON.stringify(sim, null, 2));
    } else {
      console.log(`\n📊 Viral Loop Cohort Simulation (${hd} Days, Cycle: ${cd} Days)`);
      console.log(`Initial Cohort:      ${sim.initialUsers} users`);
      console.log(`K-Factor:            ${sim.kFactor}`);
      console.log(`Total Cycles:        ${sim.totalCycles}`);
      console.log(`Final Users:         ${sim.finalCumulativeUsers} users`);
      console.log(`Net Multiplier:      ${sim.netOrganicMultiplier}x\n`);
      console.log(`Cycle | Day | New Users | Cumulative`);
      console.log(`:---|:---|:---|:---`);
      for (const c of sim.cohorts) {
        console.log(`Cycle ${c.cycle} | Day ${c.day} | +${c.newUsers} | ${c.cumulativeUsers}`);
      }
    }
    process.exit(0);
  }

  // 3. Audit Referral
  const auditIdx = args.indexOf("--audit-referral");
  if (auditIdx !== -1) {
    const targetFile = args[auditIdx + 1];
    const report = auditReferralProgram(targetFile);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️ Referral Program Audit: ${report.target}`);
      console.log(`Health Score:  ${report.healthScore}/100`);
      console.log(`Verdict:       ${report.verdict} (${report.passed ? "PASS" : "FAIL"})`);
      console.log(`K-Factor:      ${report.kFactor}`);
      console.log(`Cycle Time:    ${report.cycleTimeHours} hours\n`);

      if (report.strengths.length > 0) {
        console.log("Strengths:");
        for (const s of report.strengths) console.log(`  ✓ ${s}`);
      }
      if (report.issues.length > 0) {
        console.log("\nDefects:");
        for (const iss of report.issues) console.log(`  ✗ ${iss}`);
      }
    }
    process.exit(report.passed ? 0 : 1);
  }

  // 4. Scaffold Incentives
  const scaffoldIdx = args.indexOf("--scaffold-incentives");
  if (scaffoldIdx !== -1) {
    const mIdx = args.indexOf("--model");
    const oIdx = args.indexOf("--output");
    const model = (mIdx !== -1 ? args[mIdx + 1] : "saas") as "saas" | "agency" | "ecommerce";
    const outFile = oIdx !== -1 ? args[oIdx + 1] : undefined;

    const spec = scaffoldIncentiveSchedule(model, "Alpha Enterprise");
    if (outFile) {
      const dir = path.dirname(outFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(outFile, spec, "utf8");
    }

    if (isJson) {
      console.log(JSON.stringify({ model, outFile, specLength: spec.length }, null, 2));
    } else {
      if (outFile) {
        console.log(`\n✅ Scaffolded ${model.toUpperCase()} incentive schedule to ${outFile}`);
      } else {
        console.log(spec);
      }
    }
    process.exit(0);
  }

  console.log(`viral-engine.ts — Jasper Viral Loop Coefficient & Referral Mechanics Engine

Usage:
  bun viral-engine.ts --calc-k --invites <num> --conversion <num> [--json]
  bun viral-engine.ts --simulate-loop --users <num> --k <num> --cycle-days <days> --horizon-days <days> [--json]
  bun viral-engine.ts --audit-referral <file> [--json]
  bun viral-engine.ts --scaffold-incentives [--model <saas|agency|ecommerce>] [--output <file>] [--json]
`);
  process.exit(0);
}
