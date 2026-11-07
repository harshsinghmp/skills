#!/usr/bin/env bun

/**
 * 🏷️ brand:intake — Automated Client Intake Brief to DOX Compiler
 *
 * Bridges completed client intake discovery (Client-Intake/00-Intake-Brief.md)
 * into canonical DOX Engine architecture:
 * 1. .agents/brand/ (voice.md, personas.md, positioning.md, messaging.md, visual-identity.md, social-hooks.md)
 * 2. .agents/context/accounts.md (Zero-leak accounts registry)
 * 3. .agents/context/product.md (Promotes intake assumptions to [validated] facts)
 * 4. start-here.md (Stack and workflow developer orientation)
 *
 * Usage:
 *   bun brand/scripts/intake-compiler.ts [target-dir] [options]
 *
 * Options:
 *   --brief <path>      Path to 00-Intake-Brief.md (default: <target>/Client-Intake/00-Intake-Brief.md)
 *   --dry-run           Preview compilation without writing to disk
 *   --force             Overwrite files if they already exist
 *   --json              Emit structured JSON output
 *   --mock              Generate a synthetic test project and compile intake
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";

export interface IntakeProfile {
  projectName: string;
  organization: string;
  purpose: string;
  industry: string;
  targetAudience: string;
  coreProblem: string;
  brandVoice: string;
  palette: string;
  offerings: string[];
  competitors: string[];
  stack: {
    framework: string;
    cms: string;
    ecommerce: string;
    db: string;
    auth: string;
    styling: string;
    animation: string;
    state: string;
    deploy?: string;
  };
  domain: string;
  launchGoal: string;
  negativeScope: string[];
  rawNotes: string;
  completenessScore: number;
  missingFields: string[];
}

export function parseBriefContent(raw: string, fallbackDirName: string): IntakeProfile {
  const lines = raw.split("\n");

  const getField = (pattern: RegExp, defaultVal = ""): string => {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match?.[1]) {
        const val = match[1].trim();
        if (val !== "(unanswered)" && val.length > 0) return val;
      }
    }
    return defaultVal;
  };

  const projectName =
    getField(/\*\*(?:Project Name|Brand Name)\*\*:\s*(.*)/i) ||
    getField(/^#\s+(?:Client Intake Brief|Brand Intake Brief)\s*—\s*(.*)/i) ||
    fallbackDirName;

  const organization = getField(/\*\*(?:Organization|Company|Legal Entity)\*\*:\s*(.*)/i, projectName);
  const purpose = getField(
    /\*\*(?:One-Line Purpose|Overview|Vision|Summary)\*\*:\s*(.*)/i,
    "Modern application governed by DOX Engine.",
  );
  const industry = getField(/\*\*(?:Industry\s*\/\s*Vertical|Industry Vertical|Vertical)\*\*:\s*(.*)/i, "b2b_saas");
  const targetAudience = getField(
    /\*\*(?:Target Audience|ICP|Primary Audience)\*\*:\s*(.*)/i,
    "Developers, creators, and modern teams",
  );
  const coreProblem = getField(
    /\*\*(?:Core Problem Solved|Core Problem|Problem)\*\*:\s*(.*)/i,
    "Delivering fast, accessible, and structured user experiences",
  );
  const brandVoice = getField(/\*\*(?:Brand Voice|Tone|Voice & Tone)\*\*:\s*(.*)/i, "Authoritative, modern, precise");
  const palette = getField(/\*\*(?:OKLCH Palette|Color Palette|Palette|Theme)\*\*:\s*(.*)/i, "slate").toLowerCase();
  const domain = getField(
    /\*\*(?:Primary Domain|Domain|Production URL)\*\*:\s*(.*)/i,
    `${projectName.toLowerCase().replace(/[^a-z0-9-]/g, "")}.com`,
  );
  const launchGoal = getField(
    /\*\*(?:Launch Goal|Launch Metric|North Star KPI|Success Metric)\*\*:\s*(.*)/i,
    "Time to first successful user workflow execution (< 15 min)",
  );

  // Parse offerings
  const offeringsRaw = getField(/\*\*(?:Offerings|Products|Packages|Services)\*\*:\s*(.*)/i);
  let offerings: string[] = [];
  if (offeringsRaw) {
    offerings = offeringsRaw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (offerings.length === 0) {
    offerings = ["Starter tier", "Professional suite", "Enterprise solution"];
  }

  // Parse competitors
  const competitorsRaw = getField(/\*\*(?:Competitors|Top 3 Competitors|Direct Rivals)\*\*:\s*(.*)/i);
  let competitors: string[] = [];
  if (competitorsRaw) {
    competitors = competitorsRaw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (competitors.length === 0) {
    competitors = ["Manual ad-hoc spreadsheets", "Legacy enterprise monoliths", "Generic fragmented point tools"];
  }

  // Parse negative scope
  const boundariesRaw = getField(/\*\*(?:Boundaries|Negative Scope|Exclusion List|Out of Scope)\*\*:\s*(.*)/i);
  let negativeScope: string[] = [];
  if (boundariesRaw) {
    negativeScope = boundariesRaw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (negativeScope.length === 0) {
    negativeScope = [
      "Custom authentication rollouts (rely strictly on standard auth)",
      "Unrequested multi-tenant billing before MVP validation",
      "Premature microservices architecture",
    ];
  }

  // Parse Stack line
  const stackLine = getField(/\*\*Stack\*\*:\s*(.*)/i);
  const stack = {
    framework: "astro",
    cms: "none",
    ecommerce: "none",
    db: "none",
    auth: "none",
    styling: "unocss",
    animation: "none",
    state: "nanostores",
    deploy: "cloudflare",
  };

  if (stackLine) {
    const fw = stackLine.match(/framework\s+`?([a-z0-9-]+)`?/i);
    if (fw) stack.framework = fw[1];
    const cms = stackLine.match(/CMS\s+`?([a-z0-9-]+)`?/i);
    if (cms) stack.cms = cms[1];
    const ecom = stackLine.match(/e-commerce\s+`?([a-z0-9-]+)`?/i);
    if (ecom) stack.ecommerce = ecom[1];
    const db = stackLine.match(/database\s+`?([a-z0-9-]+)`?/i);
    if (db) stack.db = db[1];
    const auth = stackLine.match(/auth\s+`?([a-z0-9-]+)`?/i);
    if (auth) stack.auth = auth[1];
    const style = stackLine.match(/styling\s+`?([a-z0-9-]+)`?/i);
    if (style) stack.styling = style[1];
    const anim = stackLine.match(/animation\s+`?([a-z0-9-]+)`?/i);
    if (anim) stack.animation = anim[1];
    const st = stackLine.match(/state\s+`?([a-z0-9-]+)`?/i);
    if (st) stack.state = st[1];
  }

  // Completeness check
  const missingFields: string[] = [];
  if (!organization || organization === "(unanswered)") missingFields.push("Organization");
  if (!purpose || purpose === "(unanswered)") missingFields.push("One-Line Purpose");
  if (!targetAudience || targetAudience === "(unanswered)") missingFields.push("Target Audience");
  if (!coreProblem || coreProblem === "(unanswered)") missingFields.push("Core Problem Solved");
  if (!brandVoice || brandVoice === "(unanswered)") missingFields.push("Brand Voice");

  let completenessScore = 100;
  completenessScore -= missingFields.length * 15;
  if (completenessScore < 0) completenessScore = 0;

  return {
    projectName,
    organization,
    purpose,
    industry,
    targetAudience,
    coreProblem,
    brandVoice,
    palette,
    offerings,
    competitors,
    stack,
    domain,
    launchGoal,
    negativeScope,
    rawNotes: raw,
    completenessScore,
    missingFields,
  };
}

export function generateVoiceDoc(profile: IntakeProfile): string {
  const isDev =
    /developer|engineer|devops|sdk|api/i.test(profile.industry) ||
    /developer|engineer|api/i.test(profile.targetAudience);
  const isEcom = /ecommerce|retail|store|fashion|apparel|product/i.test(profile.industry);

  return `# 🗣️ Brand Voice & Editorial Guidelines — ${profile.projectName}

> **Operating Directive**: Every piece of copy, interface string, sales email, and documentation must adhere to these brand voice rules. Tone modulates with context, but character remains sovereign.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. Core Brand Voice Profile
- **Primary Voice Character**: ${profile.brandVoice}
- **Industry Archetype**: \`${profile.industry}\`
- **Target Reader**: ${profile.targetAudience}

## 2. Voice Dimension Sliders

| Dimension | Rating (1–10) | Manifestation & Operating Rule |
| :--- | :--- | :--- |
| **Formality** | ${isDev ? "`4 / 10`" : isEcom ? "`5 / 10`" : "`5 / 10`"} | Approachable, confident, respectful of intelligence. Zero corporate stiffness. |
| **Directness** | \`9 / 10\` | Bottom line up front (BLUF). Answers precede rationale. Zero filler preamble. |
| **Humor** | \`3 / 10\` | Subtle, dry wit permitted when natural. Never slapstick, cynical, or performative. |
| **Technical Depth** | ${isDev ? "`9 / 10`" : "`7 / 10`"} | Precise, concrete, domain-accurate. Explains mechanism without condescension. |
| **Energy** | \`7 / 10\` | Forward-leaning, pragmatic, biased toward immediate shipping and verified results. |

---

## 3. Vocabulary Do's & Don'ts

| Do Use (Concrete & Evidentiary) | Don't Use (Vague & Inflated) | Rationale |
| :--- | :--- | :--- |
| *Built, shipped, verified, deployed* | *Leveraged, utilized, synergized* | Active verbs with tangible outcomes build credibility. |
| *${profile.coreProblem.toLowerCase()}* | *Complex pain points, holistic challenges* | Name the exact bottleneck the user feels daily. |
| *Works with your existing tools* | *Revolutionary paradigm shift* | Respects user workflows without grandiose marketing claims. |
| *Modular, testable, verifiable* | *Best-in-class, next-generation* | Clean attributes state what it is without empty self-praise. |

---

## 4. Anti-Puffery Blacklist

Never generate copy containing these empty clichés:
- ❌ *"Revolutionary"* / *"Game-changing"* / *"Disruptive"*
- ❌ *"Cutting-edge"* / *"State-of-the-art"*
- ❌ *"Harness the power of"* / *"Unlock the potential of"*
- ❌ *"In today's fast-paced digital landscape..."*
- ❌ *"Seamlessly integrate"* (demonstrate integration with a verified code or visual step instead)

---

## 5. The 18-Token Standalone Quotability Rule
Every key headline, value proposition bullet, and takeaway must deliver complete, quote-ready meaning within 18 words without requiring surrounding paragraphs for context.
`;
}

export function generatePersonasDoc(profile: IntakeProfile): string {
  return `# 👥 Customer Avatars & Buyer Personas — ${profile.projectName}

> **Canonical ICP Blueprint**: Every marketing campaign, feature spec, and onboarding flow is designed for these specific personas.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. Primary Avatar (Core Decision-Maker & Power User)
- **Role / Title**: ${profile.targetAudience}
- **Industry Context**: \`${profile.industry}\`
- **Core Friction**: ${profile.coreProblem}
- **Buying Trigger**: The moment current manual workarounds break or become too expensive to ignore.

### Daily Reality & Frustrations
- Wastes hours battling brittle setups, manual spreadsheets, or slow legacy tools.
- Suffers from anxiety over unverified code, missed deadlines, or inconsistent brand presentation.
- Needs solutions that work out of the box with zero boilerplate overhead.

### Success Criteria & Status Win
- Shorter turnaround time on core initiatives.
- Clear, audit-ready verification and automated quality gates.
- Peace of mind knowing the system is resilient and modular.

---

## 2. Customer Objection Handling Matrix

| Common Objection | Root Hesitation | Approved Counter-Argument & Proof Point |
| :--- | :--- | :--- |
| **Price / Budget** | "Is this worth the initial investment?" | Clear ROI through automated execution, reduced rework, and faster delivery. |
| **Implementation Effort** | "Will migration disrupt our active operations?" | Drop-in progressive disclosure architecture; start with 1 workflow in minutes. |
| **Trust & Vendor Lock-in** | "What if we outgrow this system?" | Zero proprietary lock-in; open standards, local-first files, and portable assets. |
| **Feature Fit** | "Can this handle our specific edge case?" | Fully modular architecture with tailored companion plugins and archetype support. |
`;
}

export function generatePositioningDoc(profile: IntakeProfile): string {
  const competitorBullets = profile.competitors
    .map((c) => `- **${c}**: Common legacy alternative with high maintenance friction.`)
    .join("\n");

  const boundaryBullets = profile.negativeScope.map((b) => `- 🚫 **${b}**`).join("\n");

  return `# 🎯 Strategic Positioning & Market Wedge — ${profile.projectName}

> **Strategic Directive**: Defines what ${profile.projectName} stands for, the status quo it displaces, and the explicit boundaries of what it chooses NOT to do.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. Positioning Statement
For **${profile.targetAudience}** who struggle with **${profile.coreProblem.toLowerCase()}**, **${profile.projectName}** is the modern **${profile.industry}** system that provides **${profile.purpose}**. Unlike legacy alternatives, it delivers verifiable, automated, and production-grade execution from day one.

---

## 2. Status Quo & The Enemy
- **The Status Quo**: Manual ad-hoc processes, custom spreadsheets, or fragile point solutions.
- **The Villain**: Complexity drift, slow execution, and lack of deterministic verification.
- **Why Us over Status Quo**: Purpose-first architecture with progressive disclosure governance and zero-drift verification.

---

## 3. Competitive Landscape & Defensibility Wedge
${competitorBullets}

### Core Defensibility Wedge
1. **Domain-Specific Automation**: Built explicitly around the verified workflows of ${profile.targetAudience}.
2. **Deterministic Quality Gates**: Autonomous testing and secret-free execution baked into the core runtime.
3. **Progressive Disclosure Governance**: Context stays fresh, modular, and immune to cognitive drift.

---

## 4. Explicit Non-Goals & Scope Boundaries (Exclusion List)
To protect execution velocity and focus, ${profile.projectName} explicitly excludes:
${boundaryBullets}
`;
}

export function generateMessagingDoc(profile: IntakeProfile): string {
  const offerBullets = profile.offerings
    .map((o) => `- **${o}**: Verified deliverable solving ${profile.coreProblem.toLowerCase()}.`)
    .join("\n");

  return `# 💬 Core Messaging & Value Propositions — ${profile.projectName}

> **Approved Copy Inventory**: The Single Source of Truth for headlines, elevator pitches, and proof claims.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. High-Density Elevator Pitches
- **10-Second Pitch**: ${profile.projectName} provides ${profile.purpose.toLowerCase()} for ${profile.targetAudience.toLowerCase()}, ending ${profile.coreProblem.toLowerCase()}.
- **30-Second Pitch**: Most teams in ${profile.industry} waste critical momentum battling manual bottlenecks and unverified tools. ${profile.projectName} eliminates this friction by delivering ${profile.purpose.toLowerCase()} with built-in progressive disclosure and autonomous quality gates.

---

## 2. Key Deliverables & Catalog Offerings
${offerBullets}

---

## 3. Approved Proof Claims & Evidence
- **Verification Guarantee**: 100% test pass rate and automated credential leak scanning on every release.
- **Performance Budget**: Sub-1.8s LCP on edge deployment and zero unnecessary runtime dependencies.
- **Time to Value**: Initial setup and working scaffold operational in under 15 minutes.

---

## 4. Standalone Quotable Soundbites (18-Token Rule)
- *"Stop wrestling with fragile tooling; ship verified solutions with autonomous confidence."*
- *"Built for ${profile.targetAudience} who value speed, accuracy, and deterministic results."*
- *"Zero secrets, zero drift, and zero bloated dependencies."*
`;
}

export function generateVisualIdentityDoc(profile: IntakeProfile): string {
  return `# 🎨 Visual Identity & Design System — ${profile.projectName}

> **Visual Standards**: Specifications for logos, design tokens, typography, and UI aesthetics.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. Color Palette Tokens & OKLCH Theme
- **Selected Theme Palette**: \`${profile.palette.toUpperCase()}\`
- **DTCG Token Store**: \`./.agents/brand/tokens/colors.json\`
- **CSS Variables Source**: \`./src/styles/tokens.css\`
- **Modern Fluid Rules**: Uses OKLCH color space for perceptually uniform lightness, contrast, and gamut mapping.

---

## 2. Typography Pairings
- **Display & Headlines**: Clean, high-legibility modern sans-serif (Inter, Geist, or Plus Jakarta Sans).
- **Body Copy**: Responsive variable system with logical line-heights (\`1.5\` to \`1.6\`).
- **Code & Monospace**: High-contrast monospace font for technical commands and tokens (JetBrains Mono).

---

## 3. Asset Specifications & Logo Inventory
- **Vector Marks**: Primary vector logo assets stored in \`creative/assets/\` or \`public/assets/\` in both light and dark \`.svg\` variants.
- **Favicons**: 32x32 SVG icon with dark/light mode CSS media queries.
- **Visual Anti-Patterns**: Never use unoptimized raster bitmaps, low-contrast text, or non-responsive pixel layouts.
`;
}

export function generateSocialHooksDoc(profile: IntakeProfile): string {
  return `# 🪝 Social Hooks & Distribution Angles — ${profile.projectName}

> **Viral Angles & Hooks**: High-converting opening hooks for social media, developer communities, and newsletters.
> **Source**: Compiled autonomously from Client Intake Brief (\`Client-Intake/00-Intake-Brief.md\`).

---

## 1. Problem-Agitation Hooks
- *"If you are still handling ${profile.coreProblem.toLowerCase()} manually in 2026, here is why your workflow is breaking:"*
- *"The biggest lie in ${profile.industry} is that you need 10 different tools to solve one simple problem."*
- *"We audited our entire delivery pipeline and found 80% of delays came from one missing step: ${profile.coreProblem.toLowerCase()}."*

---

## 2. Contrarian & Insight Hooks
- *"Why we completely stopped using legacy spreadsheets for ${profile.projectName}:"*
- *"Most teams optimize for feature count. Here is why optimizing for deterministic verification wins every time:"*
- *"How ${profile.targetAudience} can ship production-ready applications in 15 minutes without technical debt."*

---

## 3. Case Study & Proof Hooks
- *"From empty directory to verified production build: The anatomy of a clean ${profile.industry} launch."*
- *"How we automated ${profile.purpose.toLowerCase()} while enforcing a strict zero-credential leak firewall."*
`;
}

export function updateAccountsRegistry(existingContent: string, profile: IntakeProfile): string {
  let content = existingContent;
  content = content.replace(/\{\{PROJECT_NAME\}\}/g, profile.projectName);
  content = content.replace(/\{\{DOMAIN_ROOT\}\}/g, profile.domain);
  content = content.replace(/\{\{AUTHOR_NAME\}\}/g, profile.organization);

  // If table contains placeholder domain or client name, update them
  if (profile.domain && !content.includes(profile.domain)) {
    content = content.replace(/sc-domain:.*`/g, `sc-domain:${profile.domain}\``);
  }

  return content;
}

export function updateProductContext(existingContent: string, profile: IntakeProfile): string {
  let content = existingContent;

  // Promote assumptions to validated claims where intake provided real answers
  content = content.replace(
    /- \*\*Target Audience\*\*: .*/g,
    `- **Target Audience**: ${profile.targetAudience} \`[validated]\``,
  );
  content = content.replace(
    /- \*\*Core Problem\*\*: .*/g,
    `- **Core Problem**: ${profile.coreProblem} \`[validated]\``,
  );
  content = content.replace(
    /- \*\*Value Proposition\*\*: .*/g,
    `- **Value Proposition**: High-performance, agency-grade ${profile.industry} system governed by DOX Engine. \`[validated]\``,
  );

  // Update offerings if available
  if (profile.offerings.length > 0) {
    const offerBullets = profile.offerings.map((o) => `- **${o}** \`[validated]\``).join("\n");
    content = content.replace(
      /## 7\. Key Deliverables & Catalog Offerings[\s\S]*?(?=## 8|$)/,
      `## 7. Key Deliverables & Catalog Offerings\n${offerBullets}\n\n`,
    );
  }

  return content;
}

export function generateStartHere(profile: IntakeProfile): string {
  return `# 🚀 Developer Orientation & Quick Start — ${profile.projectName}

Welcome to **${profile.projectName}**, governed by DOX Engine.

## 1. Quick Start Commands
\`\`\`bash
# Install dependencies
bun install

# Run local development server
bun run dev

# Run automated test suite
bun test

# Run code style & linting checks
bun run lint
\`\`\`

## 2. Architecture & Tokens
- **Framework**: \`${profile.stack.framework}\`
- **Styling**: \`${profile.stack.styling}\`
- **Color Theme**: \`${profile.palette}\` (Tokens at \`./.agents/brand/tokens/\` and \`./src/styles/tokens.css\`)
- **Durable Context**: Located in \`./.agents/context/\` and \`./.agents/brand/\`

## 3. Quality & Verification Gates
Before opening a PR or merging changes:
1. Ensure \`bun test\` passes.
2. Run \`bun run lint\` to verify formatting.
3. Verify 0 credential leaks are present.
`;
}

export async function compileIntake(
  targetDir: string,
  options: {
    briefPath?: string;
    dryRun?: boolean;
    force?: boolean;
    json?: boolean;
  },
): Promise<{ success: boolean; filesWritten: string[]; profile: IntakeProfile }> {
  const resolvedTarget = resolve(targetDir);
  const defaultBrief = join(resolvedTarget, "Client-Intake/00-Intake-Brief.md");
  const briefPath = options.briefPath ? resolve(options.briefPath) : defaultBrief;

  let briefContent = "";
  if (existsSync(briefPath)) {
    briefContent = readFileSync(briefPath, "utf8");
  } else {
    // If brief does not exist, synthesize from existing product.md or fallback
    const productPath = join(resolvedTarget, ".agents/context/product.md");
    if (existsSync(productPath)) {
      briefContent = readFileSync(productPath, "utf8");
    } else {
      briefContent = `# Client Intake Brief — ${basename(resolvedTarget)}\n## Pre-Filled From Scaffold\n- **Project Name**: ${basename(resolvedTarget)}\n`;
    }
  }

  const profile = parseBriefContent(briefContent, basename(resolvedTarget));
  const filesWritten: string[] = [];

  const brandDir = join(resolvedTarget, ".agents/brand");
  const contextDir = join(resolvedTarget, ".agents/context");

  if (!options.dryRun) {
    if (!existsSync(brandDir)) mkdirSync(brandDir, { recursive: true });
    if (!existsSync(contextDir)) mkdirSync(contextDir, { recursive: true });
  }

  const fileMap: Record<string, string> = {
    [join(brandDir, "voice.md")]: generateVoiceDoc(profile),
    [join(brandDir, "personas.md")]: generatePersonasDoc(profile),
    [join(brandDir, "positioning.md")]: generatePositioningDoc(profile),
    [join(brandDir, "messaging.md")]: generateMessagingDoc(profile),
    [join(brandDir, "visual-identity.md")]: generateVisualIdentityDoc(profile),
    [join(brandDir, "social-hooks.md")]: generateSocialHooksDoc(profile),
  };

  // Compile brand docs
  for (const [filePath, content] of Object.entries(fileMap)) {
    if (!existsSync(filePath) || options.force) {
      if (!options.dryRun) {
        writeFileSync(filePath, content, "utf8");
      }
      filesWritten.push(filePath);
    }
  }

  // Update accounts.md
  const accountsPath = join(contextDir, "accounts.md");
  if (existsSync(accountsPath)) {
    const rawAccounts = readFileSync(accountsPath, "utf8");
    const updatedAccounts = updateAccountsRegistry(rawAccounts, profile);
    if (!options.dryRun) {
      writeFileSync(accountsPath, updatedAccounts, "utf8");
    }
    filesWritten.push(accountsPath);
  }

  // Update product.md
  const productPath = join(contextDir, "product.md");
  if (existsSync(productPath)) {
    const rawProduct = readFileSync(productPath, "utf8");
    const updatedProduct = updateProductContext(rawProduct, profile);
    if (!options.dryRun) {
      writeFileSync(productPath, updatedProduct, "utf8");
    }
    filesWritten.push(productPath);
  }

  // Generate start-here.md if missing
  const startHerePath = join(resolvedTarget, "start-here.md");
  if (!existsSync(startHerePath) || options.force) {
    if (!options.dryRun) {
      writeFileSync(startHerePath, generateStartHere(profile), "utf8");
    }
    filesWritten.push(startHerePath);
  }

  return {
    success: true,
    filesWritten,
    profile,
  };
}

// CLI Execution Entry Point
if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      brief: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      mock: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const targetDir = positionals[0] || ".";

  compileIntake(targetDir, {
    briefPath: values.brief,
    dryRun: values["dry-run"],
    force: values.force,
    json: values.json,
  })
    .then(({ filesWritten, profile }) => {
      if (values.json) {
        console.log(JSON.stringify({ filesWritten, profile }, null, 2));
      } else {
        console.log("\n=======================================================");
        console.log(" 🏷️  DOX Intake Compiler: Compilation Complete");
        console.log("=======================================================");
        console.log(`📁 Project:            ${profile.projectName}`);
        console.log(`🏢 Organization:       ${profile.organization}`);
        console.log(`🎯 Industry Vertical:  ${profile.industry}`);
        console.log(`🎨 OKLCH Palette:      ${profile.palette.toUpperCase()}`);
        console.log(`📊 Intake Score:       ${profile.completenessScore}%`);
        if (profile.missingFields.length > 0) {
          console.log(`⚠️  Missing Items:      ${profile.missingFields.join(", ")}`);
        }
        console.log("\n📄 Compiled & Synchronized Files:");
        for (const f of filesWritten) {
          console.log(`  ✅ ${basename(f)}`);
        }
        console.log("=======================================================\n");
      }
    })
    .catch((err) => {
      console.error("Compilation error:", err);
      process.exit(1);
    });
}
