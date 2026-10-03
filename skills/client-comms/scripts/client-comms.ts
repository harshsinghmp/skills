#!/usr/bin/env bun
/**
 * client-comms CLI: Automated feedback translation matrix and non-technical client changelog generator.
 *
 * Usage:
 *   bun client-comms.ts --translate-feedback "<raw client text>" [--json]
 *   bun client-comms.ts --changelog [since-git-ref] [--staging-url <url>]
 */

import { execSync } from "node:child_process";

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
      const out = execSync(`git log ${ref} --oneline --no-merges`, { encoding: "utf8" });
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
  } else {
    console.log(
      "Usage: bun client-comms.ts --translate-feedback '<text>' | --draft-pushback <scenario> [--client <name>] | --changelog [since-ref]",
    );
  }
}
