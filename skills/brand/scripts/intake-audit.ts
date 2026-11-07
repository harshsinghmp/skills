#!/usr/bin/env bun

/**
 * 🏷️ brand:audit — Brand Readiness & Intake Completeness Auditor
 *
 * Evaluates client brand onboarding dossiers against the canonical 50-checkpoint
 * readiness gate across 5 critical agency dimensions. Prevents agency delivery teams
 * from starting on half-baked client assets or missing technical access.
 *
 * Usage:
 *   bun brand/scripts/intake-audit.ts [dossier-path] [options]
 *
 * Examples:
 *   bun brand/scripts/intake-audit.ts .agents/context/brand.md
 *   bun brand/scripts/intake-audit.ts --mock
 *   bun brand/scripts/intake-audit.ts --mock --score 42
 *   bun brand/scripts/intake-audit.ts --json
 */

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

interface Checkpoint {
  id: string;
  desc: string;
  category: string;
  keywords: string[];
}

const CHECKPOINTS: Checkpoint[] = [
  // Dimension 1: Executive & Business Model
  {
    id: "1.1",
    desc: "Legal entity name and registered jurisdiction documented",
    category: "Executive & Business Model",
    keywords: ["legal", "entity", "jurisdiction", "registered", "company"],
  },
  {
    id: "1.2",
    desc: "Primary economic buyer and day-to-day point of contact identified",
    category: "Executive & Business Model",
    keywords: ["poc", "contact", "buyer", "stakeholder", "decision maker"],
  },
  {
    id: "1.3",
    desc: "Core business model and revenue mechanics clearly understood",
    category: "Executive & Business Model",
    keywords: ["business model", "revenue", "monetization", "saas", "ecommerce", "b2b"],
  },
  {
    id: "1.4",
    desc: "Target customer avatar (ICP) role, company size, and industry defined",
    category: "Executive & Business Model",
    keywords: ["icp", "avatar", "persona", "customer", "industry", "target"],
  },
  {
    id: "1.5",
    desc: "Primary customer pain point articulated in the user's authentic words",
    category: "Executive & Business Model",
    keywords: ["pain point", "frustration", "problem", "challenge"],
  },
  {
    id: "1.6",
    desc: "Product's proprietary mechanism / unique value proposition articulated",
    category: "Executive & Business Model",
    keywords: ["unique value", "value prop", "mechanism", "uvp", "usp", "differentiation"],
  },
  {
    id: "1.7",
    desc: "Current pricing tiers, packages, and billing terms documented",
    category: "Executive & Business Model",
    keywords: ["pricing", "tier", "plan", "package", "cost", "billing"],
  },
  {
    id: "1.8",
    desc: "Top 4 customer objections (Price, Effort, Trust, Fit) identified",
    category: "Executive & Business Model",
    keywords: ["objection", "price", "effort", "trust", "fit"],
  },
  {
    id: "1.9",
    desc: "Direct competitors (3) and aspirational benchmarks (1) cataloged",
    category: "Executive & Business Model",
    keywords: ["competitor", "benchmark", "rival", "competitive landscape"],
  },
  {
    id: "1.10",
    desc: "Key 90-day business metric / North Star KPI defined",
    category: "Executive & Business Model",
    keywords: ["kpi", "metric", "goal", "north star", "target", "objective"],
  },

  // Dimension 2: Visual Identity & Design Assets
  {
    id: "2.1",
    desc: "Primary vector logo (.svg or .ai) available in light and dark variants",
    category: "Visual Identity & Design Assets",
    keywords: ["logo", "vector", "svg", "dark mode", "light mode"],
  },
  {
    id: "2.2",
    desc: "Secondary marks, logomarks, favicons, and app icons available",
    category: "Visual Identity & Design Assets",
    keywords: ["favicon", "logomark", "icon", "mark", "glyph"],
  },
  {
    id: "2.3",
    desc: "Primary and secondary brand color codes (HEX and OKLCH) defined",
    category: "Visual Identity & Design Assets",
    keywords: ["color", "hex", "oklch", "primary color", "palette"],
  },
  {
    id: "2.4",
    desc: "Neutral surface, background, and text color tokens documented",
    category: "Visual Identity & Design Assets",
    keywords: ["neutral", "surface", "background", "token", "canvas"],
  },
  {
    id: "2.5",
    desc: "Primary display and body typography font families identified with webfont sources",
    category: "Visual Identity & Design Assets",
    keywords: ["typography", "font", "display font", "body font", "webfont", "google fonts"],
  },
  {
    id: "2.6",
    desc: "Photography, illustration, and graphic style guidelines established",
    category: "Visual Identity & Design Assets",
    keywords: ["photography", "illustration", "imagery", "graphic style", "visual style"],
  },
  {
    id: "2.7",
    desc: "Existing brand guidelines document or design system reviewed",
    category: "Visual Identity & Design Assets",
    keywords: ["brand guidelines", "design system", "style guide", "figma"],
  },
  {
    id: "2.8",
    desc: "Customer quotes, case study receipts, and logo wall assets cataloged",
    category: "Visual Identity & Design Assets",
    keywords: ["case study", "testimonial", "proof", "quote", "social proof", "receipts"],
  },
  {
    id: "2.9",
    desc: "Product screenshots or live demo recordings captured",
    category: "Visual Identity & Design Assets",
    keywords: ["screenshot", "demo", "recording", "product view", "ui preview"],
  },
  {
    id: "2.10",
    desc: "Forbidden visual cliches and competitor tropes cataloged",
    category: "Visual Identity & Design Assets",
    keywords: ["anti-pattern", "forbidden", "trope", "cliche", "do not use"],
  },

  // Dimension 3: Technical Architecture & Repositories
  {
    id: "3.1",
    desc: "Primary production domain and staging subdomains documented",
    category: "Technical Architecture & Repositories",
    keywords: ["domain", "url", "staging", "production", "subdomain"],
  },
  {
    id: "3.2",
    desc: "DNS provider identified and nameserver management verified",
    category: "Technical Architecture & Repositories",
    keywords: ["dns", "cloudflare", "route53", "nameserver", "godaddy", "namecheap"],
  },
  {
    id: "3.3",
    desc: "Core tech stack (frontend, backend, database) confirmed",
    category: "Technical Architecture & Repositories",
    keywords: ["tech stack", "next.js", "react", "astro", "node", "typescript", "postgres", "stack"],
  },
  {
    id: "3.4",
    desc: "CMS architecture (WordPress, Payload, Shopify, or static) confirmed",
    category: "Technical Architecture & Repositories",
    keywords: ["cms", "wordpress", "payload", "sanity", "strapi", "shopify", "content"],
  },
  {
    id: "3.5",
    desc: "Code repositories (GitHub/GitLab) accessible with PR branch rules set",
    category: "Technical Architecture & Repositories",
    keywords: ["repository", "github", "gitlab", "repo", "git"],
  },
  {
    id: "3.6",
    desc: "Hosting environment (Cloudflare, Vercel, AWS) confirmed",
    category: "Technical Architecture & Repositories",
    keywords: ["hosting", "vercel", "cloudflare pages", "aws", "deploy", "server"],
  },
  {
    id: "3.7",
    desc: "Local development setup instructions and test suite verified",
    category: "Technical Architecture & Repositories",
    keywords: ["local dev", "setup", "bun test", "npm run", "readme"],
  },
  {
    id: "3.8",
    desc: "Third-party API integrations and webhooks inventoried",
    category: "Technical Architecture & Repositories",
    keywords: ["api", "webhook", "integration", "third-party", "rest"],
  },
  {
    id: "3.9",
    desc: "Performance budgets (LCP <= 1.8s, CLS <= 0.05) approved",
    category: "Technical Architecture & Repositories",
    keywords: ["performance", "budget", "lcp", "core web vitals", "cls"],
  },
  {
    id: "3.10",
    desc: "Privacy Policy, Terms, and legal compliance disclaimers verified",
    category: "Technical Architecture & Repositories",
    keywords: ["privacy", "terms", "gdpr", "compliance", "disclaimer", "legal"],
  },

  // Dimension 4: Account Access & Zero-Leak Delegation
  {
    id: "4.1",
    desc: "Meta Business Portfolio Partner Access verified (Ad Account, Pixel, Page)",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["meta", "facebook", "business manager", "pixel", "partner access"],
  },
  {
    id: "4.2",
    desc: "Google Ads CID linked via Agency Manager Account (MCC)",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["google ads", "mcc", "cid", "manager account"],
  },
  {
    id: "4.3",
    desc: "Google Tag Manager (GTM) Container access verified at Administrator level",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["gtm", "tag manager", "container"],
  },
  {
    id: "4.4",
    desc: "Google Analytics 4 (GA4) Property access verified at Editor level",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["ga4", "analytics", "property", "measurement id"],
  },
  {
    id: "4.5",
    desc: "GitHub organization or repository Collaborator access confirmed",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["github collaborator", "org access", "repo invite"],
  },
  {
    id: "4.6",
    desc: "Cloudflare account member access confirmed with DNS/Pages roles",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["cloudflare member", "zone access", "pages access"],
  },
  {
    id: "4.7",
    desc: "Stripe/Razorpay team member access confirmed at Developer/Analyst role (zero Owner)",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["stripe", "razorpay", "developer role", "analyst role", "payment access"],
  },
  {
    id: "4.8",
    desc: "TikTok/LinkedIn ad accounts delegated (if applicable to campaign)",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["tiktok ads", "linkedin ads", "ad account delegation"],
  },
  {
    id: "4.9",
    desc: "Zero plaintext passwords or raw secret tokens received or stored",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["zero plaintext", "no raw secrets", "delegation only", "credential policy"],
  },
  {
    id: "4.10",
    desc: "Active access ledger recorded in .agents/context/accounts-access-matrix.md",
    category: "Account Access & Zero-Leak Delegation",
    keywords: ["access ledger", "matrix", "access log", "delegation verified"],
  },

  // Dimension 5: Cross-Department Execution Briefs
  {
    id: "5.1",
    desc: "Master Brand Dossier compiled in .agents/context/brand.md",
    category: "Cross-Department Execution Briefs",
    keywords: ["brand dossier", "master brief", "brand.md", "dossier"],
  },
  {
    id: "5.2",
    desc: "Tailored Design Brief generated for design team",
    category: "Cross-Department Execution Briefs",
    keywords: ["design brief", "ui brief", "ux brief", "visual direction"],
  },
  {
    id: "5.3",
    desc: "Tailored Engineering Brief generated for webdev team",
    category: "Cross-Department Execution Briefs",
    keywords: ["engineering brief", "webdev brief", "tech brief", "architecture spec"],
  },
  {
    id: "5.4",
    desc: "Tailored Copywriting & Messaging Brief generated for content and smm",
    category: "Cross-Department Execution Briefs",
    keywords: ["copywriting brief", "messaging brief", "content brief", "tone of voice"],
  },
  {
    id: "5.5",
    desc: "Tailored Acquisition Brief generated for paidads team",
    category: "Cross-Department Execution Briefs",
    keywords: ["acquisition brief", "paid ads brief", "media brief", "campaign brief"],
  },
  {
    id: "5.6",
    desc: "Viewport and browser matrix defined for qa-launch team",
    category: "Cross-Department Execution Briefs",
    keywords: ["qa matrix", "viewport", "devices", "browser matrix", "qa-launch"],
  },
  {
    id: "5.7",
    desc: "Approved claims library verified (zero unverified statistics)",
    category: "Cross-Department Execution Briefs",
    keywords: ["claims library", "proof points", "verified stats", "claims"],
  },
  {
    id: "5.8",
    desc: "Banned vocabulary list established",
    category: "Cross-Department Execution Briefs",
    keywords: ["banned vocabulary", "forbidden words", "never say", "blacklisted terms"],
  },
  {
    id: "5.9",
    desc: "Target copywriting formulas assigned from content:copy",
    category: "Cross-Department Execution Briefs",
    keywords: ["copy formula", "pas", "aida", "pastor", "content:copy"],
  },
  {
    id: "5.10",
    desc: "Downstream team leads signed off on brief completeness",
    category: "Cross-Department Execution Briefs",
    keywords: ["sign-off", "brief approval", "team sign-off", "handoff approved"],
  },
];

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    file: { type: "string", short: "f" },
    mock: { type: "boolean", short: "m", default: false },
    score: { type: "string", short: "s" },
    json: { type: "boolean", short: "j", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🏷️ brand:audit — Brand Readiness & Intake Completeness Auditor

Usage:
  bun brand/scripts/intake-audit.ts [dossier-path] [options]

Arguments:
  [dossier-path]        Path to client brand dossier markdown file (default: .agents/context/brand.md)

Options:
  -f, --file <path>     Explicit path to dossier file
  -m, --mock            Run in mock simulation mode (checks synthetic dossier)
  -s, --score <num>     Set target score for mock simulation (e.g. 48, 38, 25)
  -j, --json            Output results as structured JSON
  -h, --help            Show this help message

Scoring Gates:
  45–50 Points (>=90%)  READY_FOR_BUILD       Green Light: Agency Council unblocked
  35–44 Points (70–89%) NEEDS_CLARIFICATION   Yellow Light: Clarification prompts generated
  < 35 Points (<70%)   BLOCKED_INCOMPLETE    Red Light: Intake blocked, discovery required
`);
  process.exit(0);
}

function evaluateContent(content: string): { passed: Checkpoint[]; missing: Checkpoint[] } {
  const normalized = content.toLowerCase();
  const passed: Checkpoint[] = [];
  const missing: Checkpoint[] = [];

  for (const cp of CHECKPOINTS) {
    const hits = cp.keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      passed.push(cp);
    } else {
      missing.push(cp);
    }
  }

  return { passed, missing };
}

function runMockSimulation(targetScore?: number): { passed: Checkpoint[]; missing: Checkpoint[] } {
  const count = targetScore !== undefined ? Math.min(50, Math.max(0, targetScore)) : 48;
  const passed = CHECKPOINTS.slice(0, count);
  const missing = CHECKPOINTS.slice(count);
  return { passed, missing };
}

// Execution
const filePath = values.file || positionals[0] || ".agents/context/brand.md";
let evaluation: { passed: Checkpoint[]; missing: Checkpoint[] };

if (values.mock || (!existsSync(filePath) && !values.file && positionals.length === 0)) {
  const target = values.score ? parseInt(values.score, 10) : 48;
  evaluation = runMockSimulation(target);
  if (!values.json) {
    console.log(`\x1b[36mℹ️ Running in Mock Simulation Mode (Target Score: ${target}/50)\x1b[0m\n`);
  }
} else {
  if (!existsSync(filePath)) {
    console.error(`\x1b[31m❌ Error: Dossier file not found: ${filePath}\x1b[0m`);
    process.exit(1);
  }
  const content = readFileSync(filePath, "utf-8");
  evaluation = evaluateContent(content);
}

const totalPoints = CHECKPOINTS.length;
const earnedPoints = evaluation.passed.length;
const percentage = Math.round((earnedPoints / totalPoints) * 100);

let verdict: "READY_FOR_BUILD" | "NEEDS_CLARIFICATION" | "BLOCKED_INCOMPLETE";
let verdictColor: string;
let verdictMsg: string;

if (earnedPoints >= 45) {
  verdict = "READY_FOR_BUILD";
  verdictColor = "\x1b[32m"; // Green
  verdictMsg = "GREEN LIGHT: Intake certified. Delivery teams unblocked.";
} else if (earnedPoints >= 35) {
  verdict = "NEEDS_CLARIFICATION";
  verdictColor = "\x1b[33m"; // Yellow
  verdictMsg = "AMBER LIGHT: Conditional. Interactive clarification prompts required.";
} else {
  verdict = "BLOCKED_INCOMPLETE";
  verdictColor = "\x1b[31m"; // Red
  verdictMsg = "RED LIGHT: Intake severely deficient. Production delivery blocked.";
}

// Category breakdown
const categories = Array.from(new Set(CHECKPOINTS.map((c) => c.category)));
const categorySummary = categories.map((cat) => {
  const catTotal = CHECKPOINTS.filter((c) => c.category === cat).length;
  const catPassed = evaluation.passed.filter((c) => c.category === cat).length;
  return { category: cat, passed: catPassed, total: catTotal, score: `${catPassed}/${catTotal}` };
});

if (values.json) {
  console.log(
    JSON.stringify(
      {
        score: earnedPoints,
        total: totalPoints,
        percentage,
        verdict,
        categories: categorySummary,
        missing: evaluation.missing.map((m) => ({ id: m.id, desc: m.desc, category: m.category })),
      },
      null,
      2,
    ),
  );
  process.exit(verdict === "BLOCKED_INCOMPLETE" ? 2 : verdict === "NEEDS_CLARIFICATION" ? 1 : 0);
}

// Terminal Output
console.log(`\x1b[1m🏷️  Brand Intake Readiness Audit Report\x1b[0m`);
console.log(`=======================================================`);
console.log(`Overall Score: ${verdictColor}\x1b[1m${earnedPoints}/${totalPoints} (${percentage}%)\x1b[0m`);
console.log(`Status:        ${verdictColor}\x1b[1m${verdict}\x1b[0m — ${verdictMsg}`);
console.log(`=======================================================\n`);

console.log(`\x1b[1mDimension Breakdown:\x1b[0m`);
for (const cat of categorySummary) {
  const barFilled = "█".repeat(cat.passed);
  const barEmpty = "░".repeat(cat.total - cat.passed);
  const statusColor = cat.passed === cat.total ? "\x1b[32m" : cat.passed >= 7 ? "\x1b[33m" : "\x1b[31m";
  console.log(`  ${cat.category.padEnd(38)} [${statusColor}${barFilled}${barEmpty}\x1b[0m] ${cat.score}`);
}

if (evaluation.missing.length > 0) {
  console.log(`\n\x1b[1m\x1b[33m⚠️  Missing Items (${evaluation.missing.length}):\x1b[0m`);
  for (const m of evaluation.missing) {
    console.log(`  \x1b[90m[${m.id}]\x1b[0m \x1b[33m${m.desc}\x1b[0m \x1b[90m(${m.category})\x1b[0m`);
  }

  console.log(`\n\x1b[1m📋 Generated Clarification Request for Client:\x1b[0m`);
  console.log(`-------------------------------------------------------`);
  console.log(`### ⚠️ Action Required: Missing Brand Discovery Parameters\n`);
  console.log(
    `Before our design and development teams can start production, please resolve the following missing items:\n`,
  );

  // Group missing items by category
  const missingByCat = new Map<string, Checkpoint[]>();
  for (const m of evaluation.missing) {
    const list = missingByCat.get(m.category) || [];
    list.push(m);
    missingByCat.set(m.category, list);
  }

  let idx = 1;
  for (const [cat, items] of missingByCat.entries()) {
    console.log(`**${cat}**:`);
    for (const item of items) {
      console.log(`${idx++}. ${item.desc}`);
    }
    console.log("");
  }
  console.log(`-------------------------------------------------------`);
}

process.exit(verdict === "BLOCKED_INCOMPLETE" ? 2 : verdict === "NEEDS_CLARIFICATION" ? 1 : 0);
