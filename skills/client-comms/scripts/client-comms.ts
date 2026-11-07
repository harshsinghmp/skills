#!/usr/bin/env bun
/**
 * client-comms CLI: Automated feedback translation matrix and non-technical client changelog generator.
 *
 * Usage:
 *   bun client-comms.ts --translate-feedback "<raw client text>" [--json]
 *   bun client-comms.ts --changelog [since-git-ref] [--staging-url <url>]
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export interface FeedbackContract {
  feedbackId: string;
  clientVerbatim: string;
  translation: {
    intent: string;
    technicalRootCause: string;
    targetScope: string;
    antiDriftBoundary: string;
    acceptanceCriteria: string[];
  };
  verdict: "ACCEPTED" | "DECLINED" | "CLARIFY";
  assignedLead: "Sol" | "Jasper" | "Crew" | "Nexus";
}

export function translateClientFeedback(rawText: string): FeedbackContract {
  const lower = rawText.toLowerCase();
  const id = `fb-${Date.now().toString(36)}`;

  let intent = "Address client aesthetic / functional adjustment";
  let rootCause = "Client-reported interface or styling friction.";
  let targetScope = "Review relevant page components and style tokens.";
  let antiDriftBoundary = "Modify only targeted UI elements. Do NOT refactor backend routes or global theme.";
  let assignedLead: "Sol" | "Jasper" | "Crew" | "Nexus" = "Jasper";
  const criteria: string[] = ["Verify change across mobile (390px) and desktop (1440px) viewports."];

  if (lower.includes("pop") || lower.includes("boring") || lower.includes("flat")) {
    intent = "Enhance visual hierarchy, typography weight, and micro-interaction contrast";
    rootCause = "Low typography weight variance, flat background surfaces, and absent hover/focus transitions.";
    targetScope = "Hero section, primary CTA buttons, and feature cards.";
    antiDriftBoundary = "Do NOT replace brand color tokens or alter typography font families.";
    criteria.push("Primary CTA button has distinct hover elevation and transition-all duration-200.");
    assignedLead = "Jasper";
  } else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("small screen")) {
    intent = "Resolve mobile viewport responsiveness and touch target compliance";
    rootCause = "Horizontal layout overflow (scrollWidth > innerWidth) or fixed pixel widths on narrow viewports.";
    targetScope = "Mobile navigation, container padding, and responsive media wrappers.";
    antiDriftBoundary = "Preserve desktop layout intact; use responsive breakpoints (md:/lg:) only.";
    criteria.push("Zero horizontal scroll on 390px viewport width.");
    criteria.push("All interactive buttons maintain >= 48px touch target height/width.");
    assignedLead = "Jasper";
  } else if (lower.includes("slow") || lower.includes("lag") || lower.includes("clunky") || lower.includes("load")) {
    intent = "Optimize client-perceived performance and eliminate Cumulative Layout Shift (CLS)";
    rootCause = "Uncompressed imagery, unthrottled event listeners, or missing image aspect-ratio placeholders.";
    targetScope = "Asset loading pipeline, hero image markup, and script deferral.";
    antiDriftBoundary = "Do NOT introduce new state libraries or rewrite existing data fetching architectures.";
    criteria.push("Ensure explicit width and height attributes on all image tags.");
    criteria.push("Lighthouse performance score >= 90 on mobile profile.");
    assignedLead = "Sol";
  } else if (
    lower.includes("read") ||
    lower.includes("contrast") ||
    lower.includes("text") ||
    lower.includes("hard to see")
  ) {
    intent = "Elevate typographic readability and WCAG 2.2 AA color contrast compliance";
    rootCause = "Insufficient foreground-to-background contrast ratio (< 4.5:1) or excessive line-length.";
    targetScope = "Body typography tokens and paragraph containers.";
    antiDriftBoundary = "Maintain brand font palette; adjust only lightness/saturation or opacity.";
    criteria.push("Contrast ratio between text and background measures >= 4.5:1.");
    criteria.push("Body text container constrained to max-w-prose (<= 75ch).");
    assignedLead = "Nexus";
  } else if (
    lower.includes("broken") ||
    lower.includes("error") ||
    lower.includes("doesn't work") ||
    lower.includes("bug")
  ) {
    intent = "Diagnose and resolve critical functional defect";
    rootCause = "Unhandled exception, failed API request, or unhandled form state.";
    targetScope = "Interactive handler, API endpoint, or form submission controller.";
    antiDriftBoundary = "Touch only the failing component logic and its direct test file.";
    criteria.push("Unit test reproduces failure and confirms fix with 0 regressions.");
    assignedLead = "Sol";
  }

  return {
    feedbackId: id,
    clientVerbatim: rawText.trim(),
    translation: {
      intent,
      technicalRootCause: rootCause,
      targetScope,
      antiDriftBoundary,
      acceptanceCriteria: criteria,
    },
    verdict: "ACCEPTED",
    assignedLead,
  };
}

export function sanitizeCommitMessage(msg: string): { title: string; category: "visual" | "fix" | "perf" } {
  const clean = msg.replace(/\(#\d+\)/g, "").trim();
  const lower = clean.toLowerCase();

  // Strip commit conventions like feat(...): or fix(...):
  let sanitized = clean.replace(/^(feat|fix|perf|refactor|chore|style|docs)(\([^)]+\))?:\s*/i, "");
  // Capitalize first letter
  sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);

  if (lower.startsWith("fix") || lower.includes("bug") || lower.includes("patch") || lower.includes("align")) {
    return { title: sanitized, category: "fix" };
  }
  if (
    lower.startsWith("perf") ||
    lower.includes("speed") ||
    lower.includes("cache") ||
    lower.includes("secure") ||
    lower.includes("db")
  ) {
    return { title: sanitized, category: "perf" };
  }
  return { title: sanitized, category: "visual" };
}

export function generateClientChangelog(commits: string[], stagingUrl = "https://staging.agencyclient.com"): string {
  const visual: string[] = [];
  const fixes: string[] = [];
  const perf: string[] = [];

  for (const c of commits) {
    if (!c.trim() || c.toLowerCase().includes("merge branch") || c.toLowerCase().includes("pull request")) continue;
    const { title, category } = sanitizeCommitMessage(c);
    if (category === "visual") visual.push(`- **${title}**`);
    else if (category === "fix") fixes.push(`- **${title}**`);
    else perf.push(`- **${title}**`);
  }

  return [
    `### 🚀 Staging Deployment Update`,
    ``,
    `**Preview URL**: ${stagingUrl}`,
    `**Generated**: ${new Date().toISOString().split("T")[0]}`,
    ``,
    `#### 🌟 New & Visual Updates`,
    visual.length > 0 ? visual.join("\n") : "- *Routine interface refinements and layout continuity.*",
    ``,
    `#### 🛠️ Polish & Fixes`,
    fixes.length > 0 ? fixes.join("\n") : "- *General edge-case handling and interaction polish.*",
    ``,
    `#### ⚡ Performance & Security`,
    perf.length > 0 ? perf.join("\n") : "- *Under-the-hood optimization and stability improvements.*",
  ].join("\n");
}

export function draftPushback(
  scenario:
    | "quick-tweak"
    | "ghosting-day3"
    | "ghosting-day7"
    | "ghosting-day14"
    | "contradiction"
    | "direct-ping"
    | "warranty",
  clientName = "Client",
  details = "the requested item",
): string {
  switch (scenario) {
    case "quick-tweak":
      return `Hi ${clientName}, we would love to incorporate this! Because this touches our core data flow / layout structure beyond the active milestone agreement, we’ve logged it in our backlog. We can either swap it with an existing lower-priority feature to keep our planned launch on track, or quote it as a quick Change Order ($X / +Y days). Let us know which direction you prefer!`;
    case "ghosting-day3":
      return `Hi ${clientName}, just checking in on the outstanding items (${details}). Our team is ready to proceed with the next milestone as soon as these are uploaded to our shared workspace. Let us know if you need any help with these!`;
    case "ghosting-day7":
      return `Hi ${clientName}, gentle heads-up regarding the pending assets (${details}). Because development is currently blocked, our target launch date will shift day-for-day to preserve delivery quality. We look forward to receiving these so we can re-accelerate.`;
    case "ghosting-day14":
      return `Hi ${clientName}, formal update: active development on this sprint has been paused to release dedicated engineering capacity. Once the required assets (${details}) are ready, we will schedule a new restart kickoff (typically 3–5 business days lead time).`;
    case "contradiction":
      return `Hi ${clientName}, we received conflicting directions regarding ${details}. To preserve your sprint budget and avoid throwaway work, we have temporarily frozen development on this component until you confirm the unified direction in writing.`;
    case "direct-ping":
      return `Hi ${clientName}, thanks for flagging this! To ensure your request is tracked, prioritized, and tested against our staging build, I’ve routed it to our central sprint board. Please post all requests in the main project channel so the entire team stays aligned.`;
    case "warranty":
      return `Hi ${clientName}, the 30-day post-launch warranty window concluded on schedule. We would be delighted to investigate and resolve ${details} under our ongoing monthly Maintenance & Support SLA or a dedicated sprint block.`;
    default:
      return `Hi ${clientName}, thank you for your note regarding ${details}. We have logged this with the project team.`;
  }
}

export interface ProposalContract {
  client: string;
  projectTitle: string;
  framework: "PAS" | "AIDA" | "QUEST";
  problemStatement: string;
  solutionArchitecture: string[];
  inScope: string[];
  outOfScope: string[];
  stopTheClockHours: number;
  milestones: Array<{
    name: string;
    duration: string;
    proofReceipt: string;
    paymentPercentage: number;
  }>;
  markdown: string;
}

export function scaffoldProposal(options?: {
  client?: string;
  projectTitle?: string;
  framework?: "PAS" | "AIDA" | "QUEST";
}): ProposalContract {
  const client = options?.client || "Acme Global";
  const projectTitle = options?.projectTitle || "Modern Digital Platform Architecture";
  const framework = options?.framework || "PAS";

  const inScope = [
    "Custom responsive design system (Mobile 390px + Desktop 1440px)",
    "Production Astro v7 / Next.js architecture with TypeScript",
    "Headless Payload CMS collections and structured schema",
    "Stripe checkout / webhook payment integration",
    "Mobile Lighthouse performance optimization (>= 90 score)",
  ];

  const outOfScope = [
    "Native iOS/Android application builds (handled via separate SOW)",
    "Legacy database migrations exceeding 10,000 unformatted records",
    "Bespoke 3D WebGL asset modeling or video production",
    "Third-party enterprise ERP/SAP synchronization",
  ];

  const milestones = [
    {
      name: "Milestone 1: Discovery & Architecture",
      duration: "Week 1-2",
      proofReceipt: "Signed Architecture Spec + Approved Figma UI Prototype",
      paymentPercentage: 35,
    },
    {
      name: "Milestone 2: Core Engineering & CMS",
      duration: "Week 3-4",
      proofReceipt: "Staging deployment preview URL + clean bun test suite run",
      paymentPercentage: 35,
    },
    {
      name: "Milestone 3: Launch, QA & Handover",
      duration: "Week 5",
      proofReceipt: "Production DNS cutover + Lighthouse >= 90 audit report + Handover signoff",
      paymentPercentage: 30,
    },
  ];

  let problemStatement = "";
  if (framework === "PAS") {
    problemStatement = `Problem: ${client}'s current legacy platform suffers from high bounce rates and rigid content updates.\nAgitation: Every month of delay bleeds qualified pipeline to faster-moving competitors and incurs mounting maintenance overhead.\nSolution: A sovereign, ultra-fast web architecture with instant headless publishing and sub-second page loads.`;
  } else if (framework === "AIDA") {
    problemStatement = `Attention: Capture decisive market share with an Awwwards-caliber digital experience.\nInterest: Modern customers expect instant interactions and seamless mobile checkouts.\nDesire: Position ${client} as the unquestioned category leader with a bespoke design system.\nAction: Mobilize the architecture sprint to deploy within 30 days.`;
  } else {
    problemStatement = `Qualify: Validated fit for high-growth enterprise scale.\nUnderstand: Systemic analysis of ${client}'s digital customer journey.\nEducate: The commercial necessity of headless architecture and Core Web Vitals.\nStimulate: Unlocking +35% higher pipeline conversion through friction-free UI.\nTransition: Phased three-milestone deployment with zero downtime.`;
  }

  const markdown = `# Strategic Proposal: ${projectTitle}
**Client**: ${client}
**Framework**: ${framework}
**Stop-the-Clock Agreement**: 48 Hours

### 1. Executive Summary & Narrative (${framework})
${problemStatement}

### 2. Definitive Scope Boundaries
#### In-Scope Deliverables
${inScope.map((s) => `- ${s}`).join("\n")}

#### Out-of-Scope (Requires Change Order)
${outOfScope.map((s) => `- ${s}`).join("\n")}

### 3. Milestone Delivery & Acceptance Receipts
| Milestone | Timeline | Verification Receipt (DoD) | Tranche |
| :--- | :--- | :--- | :--- |
${milestones.map((m) => `| ${m.name} | ${m.duration} | ${m.proofReceipt} | ${m.paymentPercentage}% |`).join("\n")}

### 4. 48-Hour Stop-the-Clock Terms
Any client dependency unfulfilled for >48 hours automatically holds scheduled completion dates day-for-day plus a 3-business-day rescheduling buffer.
`;

  return {
    client,
    projectTitle,
    framework,
    problemStatement,
    solutionArchitecture: [
      "Astro v7 / Next.js modern frontend",
      "Tailwind / UnoCSS responsive layout",
      "Headless CMS (Payload / Contentful)",
      "Edge-deployed infrastructure",
    ],
    inScope,
    outOfScope,
    stopTheClockHours: 48,
    milestones,
    markdown,
  };
}

export interface ClientIntakeInput {
  clientId?: string;
  companyName?: string;
  rawText?: string;
  industry?: string;
  objectives?: string[];
  techPreferences?: string[];
  timelineDays?: number;
  budget?: string;
}

export interface ClientIntakeResult {
  clientId: string;
  companyName: string;
  profile: {
    clientId: string;
    companyName: string;
    industry: string;
    slaTier: "STANDARD" | "PRIORITY" | "ENTERPRISE";
    primaryChannel: "Slack" | "Discord" | "Email";
    assignedLead: "Sol" | "Jasper" | "Crew" | "Nexus";
    stopTheClockHours: 48;
    createdAt: string;
  };
  boundary: {
    inScope: string[];
    outOfScope: string[];
    changeOrderPolicy: string;
  };
  briefMarkdown: string;
  dependenciesMarkdown: string;
}

export function processClientIntake(input: string | ClientIntakeInput, explicitClientId?: string): ClientIntakeResult {
  let rawText = "";
  let companyName = "Acme Corp";
  let industry = "General B2B / Technology";
  let clientId = explicitClientId;

  if (typeof input === "string") {
    if (fs.existsSync(input)) {
      try {
        const fileContent = fs.readFileSync(input, "utf8");
        if (input.endsWith(".json")) {
          const parsed = JSON.parse(fileContent);
          return processClientIntake(parsed, explicitClientId);
        }
        rawText = fileContent;
      } catch {
        rawText = input;
      }
    } else {
      rawText = input;
    }
  } else {
    companyName = input.companyName || companyName;
    industry = input.industry || industry;
    clientId = clientId || input.clientId;
    rawText = input.rawText || (input.objectives ? input.objectives.join(" ") : "");
  }

  const compMatch = rawText.match(/(?:company|client|brand|name)\s*[:=]\s*([^\n,.]+)/i);
  if (compMatch && (typeof input === "string" || !input.companyName)) {
    companyName = compMatch[1].trim();
  }

  if (!clientId) {
    clientId = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!clientId) clientId = "client-intake";
  }

  const lower = rawText.toLowerCase();

  let assignedLead: "Sol" | "Jasper" | "Crew" | "Nexus" = "Crew";
  let slaTier: "STANDARD" | "PRIORITY" | "ENTERPRISE" = "STANDARD";
  let primaryChannel: "Slack" | "Discord" | "Email" = "Slack";

  const inScope: string[] = [
    "Responsive design system (Mobile 390px + Desktop 1440px) with fluid typography",
    "Headless content management and schema architecture",
    "Production edge deployment and automated continuous integration pipeline",
    "SEO/AEO semantic structure, OpenGraph cards, and Core-EEAT density",
  ];

  const outOfScope: string[] = [
    "Native iOS / Android mobile application development",
    "Legacy database unindexed data migration (>5,000 records)",
    "Uncontracted third-party API integration or custom ERP synchronization",
    "Manual data entry or ad-hoc unapproved copywriting cycles",
  ];

  if (lower.includes("ecommerce") || lower.includes("shopify") || lower.includes("store") || lower.includes("cart")) {
    industry = "E-Commerce / Direct-to-Consumer";
    assignedLead = "Sol";
    inScope.push("Product catalog layout, cart interactions, and Stripe/payment gateway webhook handler");
    outOfScope.push("Physical inventory warehouse hardware integration");
  } else if (
    lower.includes("saas") ||
    lower.includes("platform") ||
    lower.includes("app") ||
    lower.includes("dashboard")
  ) {
    industry = "B2B SaaS / Software Platform";
    assignedLead = "Sol";
    inScope.push("Customer authentication flow, dashboard layout, and tenant isolation fencing");
    outOfScope.push("Multi-region active-active database sharding");
  } else if (
    lower.includes("brand") ||
    lower.includes("creative") ||
    lower.includes("animation") ||
    lower.includes("gsap")
  ) {
    industry = "Brand Creative / High-End Portfolio";
    assignedLead = "Jasper";
    inScope.push("Awwwards-quality micro-interactions, GSAP ScrollTrigger pacing, and OKLCH color token system");
    outOfScope.push("Custom 3D WebGL shader programming from scratch");
  }

  if (lower.includes("enterprise") || lower.includes("urgent") || lower.includes("sla")) {
    slaTier = "ENTERPRISE";
    primaryChannel = "Slack";
  } else if (lower.includes("priority")) {
    slaTier = "PRIORITY";
  }

  const briefMarkdown = `# Client Intake Brief: ${companyName} (${clientId})

> **Industry**: ${industry}  
> **SLA Tier**: ${slaTier} (Assigned Lead: ${assignedLead})  
> **Primary Channel**: ${primaryChannel}  
> **Intake Date**: ${new Date().toISOString().split("T")[0]}  

## Executive Summary
${companyName} engaged the agency to engineer a high-performance modern web ecosystem. The project objectives focus on quantifiable conversion lift, brand authority, and maintainable software architecture.

## Technical Architecture Baseline
- Framework target: Modern static / hybrid edge runtime (Astro v7 or Next.js)
- Styling: Hybrid UnoCSS Wind 4 + BEM with OKLCH token system
- Lead Architect: **${assignedLead}**
`;

  const dependenciesMarkdown = `# Client Dependency Register: ${companyName}

> **48-Hour Stop-The-Clock Protocol Active**: Failure to deliver these required assets within 48 hours of formal request freezes active milestone delivery schedules day-for-day without penalty.

1. **Domain Registrar & DNS Access**: Cloudflare / Route53 delegation or records configuration.
2. **Brand Assets**: Primary vector marks (.svg), typography licenses (.woff2), and approved color palette.
3. **Third-Party API Credentials**: Payment gateway (Stripe) and transactional email tokens.
4. **Content / Copywriting**: High-resolution imagery and canonical service descriptions.
`;

  return {
    clientId,
    companyName,
    profile: {
      clientId,
      companyName,
      industry,
      slaTier,
      primaryChannel,
      assignedLead,
      stopTheClockHours: 48,
      createdAt: new Date().toISOString(),
    },
    boundary: {
      inScope,
      outOfScope,
      changeOrderPolicy:
        "Any request outside explicit inScope deliverables requires a formal written Change Order with budget & timeline impact before work commences.",
    },
    briefMarkdown,
    dependenciesMarkdown,
  };
}

export function scaffoldClientVault(
  result: ClientIntakeResult,
  baseDir = ".agents/vault",
): { createdFiles: string[]; targetDir: string } {
  const targetDir = path.join(baseDir, result.clientId);
  fs.mkdirSync(targetDir, { recursive: true });

  const profilePath = path.join(targetDir, "profile.json");
  const boundaryPath = path.join(targetDir, "boundary.json");
  const briefPath = path.join(targetDir, "brief.md");
  const depPath = path.join(targetDir, "dependencies.md");

  fs.writeFileSync(profilePath, JSON.stringify(result.profile, null, 2), "utf8");
  fs.writeFileSync(boundaryPath, JSON.stringify(result.boundary, null, 2), "utf8");
  fs.writeFileSync(briefPath, result.briefMarkdown, "utf8");
  fs.writeFileSync(depPath, result.dependenciesMarkdown, "utf8");

  return {
    targetDir,
    createdFiles: [profilePath, boundaryPath, briefPath, depPath],
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.includes("--translate-feedback")) {
    const idx = args.indexOf("--translate-feedback");
    const raw = args[idx + 1] || "";
    if (!raw) {
      console.error("Error: --translate-feedback requires feedback text.");
      process.exit(1);
    }
    const contract = translateClientFeedback(raw);
    if (args.includes("--json")) {
      console.log(JSON.stringify(contract, null, 2));
    } else {
      console.log(`\n📋 Client Feedback Translation Contract (${contract.feedbackId}):`);
      console.log(`  Verbatim: "${contract.clientVerbatim}"`);
      console.log(`  Intent: ${contract.translation.intent}`);
      console.log(`  Root Cause: ${contract.translation.technicalRootCause}`);
      console.log(`  Target Scope: ${contract.translation.targetScope}`);
      console.log(`  🛡️ Anti-Drift Boundary: ${contract.translation.antiDriftBoundary}`);
      console.log(`  Assigned Lead: ${contract.assignedLead}`);
      console.log(`  Acceptance Criteria:`);
      for (const ac of contract.translation.acceptanceCriteria) {
        console.log(`    - ${ac}`);
      }
    }
  } else if (args.includes("--draft-pushback")) {
    const idx = args.indexOf("--draft-pushback");
    const scenario = (args[idx + 1] || "quick-tweak") as
      | "quick-tweak"
      | "ghosting-day3"
      | "ghosting-day7"
      | "ghosting-day14"
      | "contradiction"
      | "direct-ping"
      | "warranty";
    const clientIdx = args.indexOf("--client");
    const client = clientIdx !== -1 ? args[clientIdx + 1] : "Acme Corp";
    const detailsIdx = args.indexOf("--details");
    const details = detailsIdx !== -1 ? args[detailsIdx + 1] : "requested revisions";
    console.log(draftPushback(scenario, client, details));
  } else if (args.includes("--changelog")) {
    const idx = args.indexOf("--changelog");
    const ref = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "HEAD~5..HEAD";
    const stagingIdx = args.indexOf("--staging-url");
    const stagingUrl = stagingIdx !== -1 ? args[stagingIdx + 1] : "https://staging.agencyclient.com";

    let commits: string[] = [];
    try {
      const out = execFileSync("git", ["log", ref, "--oneline", "--no-merges"], { encoding: "utf8" });
      commits = out
        .split("\n")
        .map((l) => l.replace(/^[a-f0-9]+\s+/, "").trim())
        .filter(Boolean);
    } catch {
      commits = [
        "feat(ui): refine hero banner padding",
        "fix(nav): prevent mobile menu clipping",
        "perf(assets): optimize webp image compression",
      ];
    }
    console.log(generateClientChangelog(commits, stagingUrl));
  } else if (args.includes("--proposal") || args.includes("--scaffold-proposal")) {
    const clientIdx = args.indexOf("--client");
    const client = clientIdx !== -1 ? args[clientIdx + 1] : "Acme Global";
    const projectIdx = args.indexOf("--project");
    const projectTitle = projectIdx !== -1 ? args[projectIdx + 1] : "Modern Digital Platform Architecture";
    const frameworkIdx = args.indexOf("--framework");
    const rawFw = (frameworkIdx !== -1 ? args[frameworkIdx + 1] : "PAS").toUpperCase();
    const framework = (rawFw === "AIDA" || rawFw === "QUEST" ? rawFw : "PAS") as "PAS" | "AIDA" | "QUEST";

    const proposal = scaffoldProposal({ client, projectTitle, framework });
    if (args.includes("--json")) {
      console.log(JSON.stringify(proposal, null, 2));
    } else {
      console.log(proposal.markdown);
    }
  } else if (args.includes("--intake")) {
    const idx = args.indexOf("--intake");
    const rawInput = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "";
    const clientIdx = args.indexOf("--client-id") !== -1 ? args.indexOf("--client-id") : args.indexOf("--client");
    const explicitClientId = clientIdx !== -1 ? args[clientIdx + 1] : undefined;
    const scaffoldIdx = args.indexOf("--scaffold-dir");
    const scaffoldDir =
      scaffoldIdx !== -1 ? args[scaffoldIdx + 1] : args.includes("--scaffold-vault") ? ".agents/vault" : undefined;

    const result = processClientIntake(rawInput, explicitClientId);

    if (scaffoldDir) {
      const scaffoldRes = scaffoldClientVault(result, scaffoldDir);
      if (args.includes("--json")) {
        console.log(JSON.stringify({ ...result, scaffold: scaffoldRes }, null, 2));
      } else {
        console.log(`\n🏛️ Client Intake & Vault Scaffolded: ${result.companyName} (${result.clientId})`);
        console.log(`  Directory: ${scaffoldRes.targetDir}`);
        console.log(`  Created Files:`);
        for (const f of scaffoldRes.createdFiles) {
          console.log(`    - ${f}`);
        }
      }
    } else {
      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n📋 Client Intake Ingestion: ${result.companyName} (${result.clientId})`);
        console.log(`  Industry: ${result.profile.industry}`);
        console.log(`  Assigned Lead: ${result.profile.assignedLead} | SLA: ${result.profile.slaTier}`);
        console.log(`  Channel: ${result.profile.primaryChannel} | 48h Clock-Stop: Active`);
        console.log(`\n🎯 In-Scope (${result.boundary.inScope.length} items):`);
        for (const s of result.boundary.inScope) {
          console.log(`  - ✅ ${s}`);
        }
        console.log(`\n🛡️ Out-Of-Scope / Anti-Scope Fence (${result.boundary.outOfScope.length} items):`);
        for (const s of result.boundary.outOfScope) {
          console.log(`  - ❌ ${s}`);
        }
      }
    }
  } else {
    console.log(
      "Usage: bun client-comms.ts --translate-feedback '<text>' | --draft-pushback <scenario> [--client <name>] | --changelog [since-ref] | --proposal [--client <name>] [--project <title>] [--framework <pas|aida|quest>] | --intake <form-or-text> [--client-id <id>] [--scaffold-dir <dir>]",
    );
  }
}
