#!/usr/bin/env bun
/**
 * User-Generated Content (UGC) Direct-Response Video Generator & Audit Engine
 *
 * Implements UGC-001–UGC-004 invariants:
 * - UGC-001: 4-Hook Matrix (Negative Curiosity, Direct Problem, Unpopular Opinion, Contrast/Before-After)
 * - UGC-002: Jasper 5-Beat Narrative Storyboard Spine (0-3s Hook, 3-8s Problem, 8-15s Pivot, 15-25s Demo, 25-30s CTA)
 * - UGC-003: Retention & Pacing Scoring (130-160 WPM, visual cuts every 2-3s, 9:16 safe zones, anti-slop)
 * - UGC-004: Creator Brief Export (Deliverable specs, DOs and DON'Ts, shot list, native captions)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

// =========================================================================
// Types & Interfaces
// =========================================================================

export type HookArchetype = "negative_curiosity" | "direct_problem" | "unpopular_opinion" | "contrast_before_after";

export interface UgcHook {
  archetype: HookArchetype;
  name: string;
  verbalHook: string;
  visualAction: string;
  captionText: string;
}

export interface UgcHookMatrix {
  product: string;
  painPoint: string;
  hooks: UgcHook[];
}

export interface StoryboardBeat {
  beatNumber: number;
  beatName: string;
  timeRange: string;
  visualDirection: string;
  spokenAudio: string;
  estimatedSeconds: number;
}

export interface UgcAuditResult {
  valid: boolean;
  score: number;
  wordCount: number;
  targetSeconds: number;
  estimatedWpm: number;
  visualCutCount: number;
  avgCutDurationSeconds: number;
  hasHookMatrix: boolean;
  hasSafeZoneVisuals: boolean;
  detectedBeats: string[];
  buzzwordsFound: string[];
  issues: string[];
}

export interface UgcPacingReport {
  wordCount: number;
  durationSeconds: number;
  wpm: number;
  isWpmOptimal: boolean;
  visualCutCount: number;
  avgCutDurationSeconds: number;
  isVisualPacingOptimal: boolean;
  status: "OPTIMAL" | "PACING_DRIFT" | "DROPOFF_RISK";
  recommendations: string[];
}

export interface UgcBriefOptions {
  product: string;
  targetAudience: string;
  painPoint: string;
  solution: string;
  offer?: string;
  creatorName?: string;
}

// =========================================================================
// Constants & Invariants
// =========================================================================

export const BANNED_UGC_BUZZWORDS = [
  "revolutionary",
  "game-changer",
  "cutting-edge",
  "miracle",
  "synergy",
  "supercharge",
  "next-gen",
  "all-in-one",
  "groundbreaking",
  "disruptive",
  "magic bullet",
];

export const STORYBOARD_BEATS = [
  "Beat 1: The Hook (0-3s)",
  "Beat 2: Agitated Problem (3-8s)",
  "Beat 3: Discovery / Pivot (8-15s)",
  "Beat 4: Proof & Demo (15-25s)",
  "Beat 5: Frictionless CTA (25-30s)",
];

// =========================================================================
// Core Engine Functions
// =========================================================================

/**
 * UGC-001: Generate 4 distinct paid algorithm hook variations
 */
export function generateHookMatrix(product: string, painPoint: string, outcome: string): UgcHookMatrix {
  const hooks: UgcHook[] = [
    {
      archetype: "negative_curiosity",
      name: "Negative Curiosity / Stop Doing This",
      verbalHook: `Stop buying generic solutions for ${painPoint} until you see this.`,
      visualAction:
        "[Shot: Extreme Close-Up] Creator holds palm up to camera, shaking head in disbelief while pointing down.",
      captionText: "STOP DOING THIS 🛑",
    },
    {
      archetype: "direct_problem",
      name: "Direct Problem Agitation",
      verbalHook: `If your ${painPoint} still looks like this in 2026, we need to talk.`,
      visualAction: "[Shot: Point-of-View] Frustrated creator struggling with messy old process in natural lighting.",
      captionText: `Still struggling with ${painPoint}? 👀`,
    },
    {
      archetype: "unpopular_opinion",
      name: "Unpopular Opinion / Contrarian Stance",
      verbalHook: `Unpopular opinion: most advice about ${painPoint} is a total scam. Here is what actually works.`,
      visualAction: "[Shot: Selfie Walking] Creator speaking casually into camera while walking outdoors.",
      captionText: "Unpopular opinion... 🤫",
    },
    {
      archetype: "contrast_before_after",
      name: "High-Contrast Before & After / Result First",
      verbalHook: `Here is how I went from dealing with ${painPoint} to ${outcome} in less than 2 weeks.`,
      visualAction:
        "[Shot: Fast Split Screen] Side-by-side contrast showing previous frustration vs calm relief with product.",
      captionText: "From this ➡️ To this ✨",
    },
  ];

  return { product, painPoint, hooks };
}

/**
 * UGC-002: Scaffold complete 5-beat direct response UGC script with 9:16 safe zones
 */
export function scaffoldUgc(options: {
  product: string;
  targetAudience: string;
  painPoint: string;
  solution: string;
  offer?: string;
}): string {
  const offer = options.offer || "Use code CREATOR20 for 20% off your first order";
  const hookMatrix = generateHookMatrix(options.product, options.painPoint, options.solution);

  return `# Direct-Response UGC Ad Script: ${options.product}

**Target Audience**: ${options.targetAudience}  
**Primary Pain Point**: ${options.painPoint}  
**Core Mechanism**: ${options.solution}  
**Offer / Urgency**: ${offer}  
**Target Duration**: 30–35 Seconds (75–85 Words at ~145 WPM)  
**Format**: 9:16 Vertical Video (TikTok / Reels / Shorts)  

---

## UGC-001: 4-Hook Matrix (Algorithm Split-Testing)

Test these 4 distinct opening hooks to find the winning thumb-stop rate:

### Hook 1 (Negative Curiosity)
- **Visual**: ${hookMatrix.hooks[0].visualAction}
- **Audio**: *"${hookMatrix.hooks[0].verbalHook}"*
- **On-Screen Text (Safe Zone)**: \`${hookMatrix.hooks[0].captionText}\`

### Hook 2 (Direct Problem)
- **Visual**: ${hookMatrix.hooks[1].visualAction}
- **Audio**: *"${hookMatrix.hooks[1].verbalHook}"*
- **On-Screen Text (Safe Zone)**: \`${hookMatrix.hooks[1].captionText}\`

### Hook 3 (Unpopular Opinion)
- **Visual**: ${hookMatrix.hooks[2].visualAction}
- **Audio**: *"${hookMatrix.hooks[2].verbalHook}"*
- **On-Screen Text (Safe Zone)**: \`${hookMatrix.hooks[2].captionText}\`

### Hook 4 (Before/After Result)
- **Visual**: ${hookMatrix.hooks[3].visualAction}
- **Audio**: *"${hookMatrix.hooks[3].verbalHook}"*
- **On-Screen Text (Safe Zone)**: \`${hookMatrix.hooks[3].captionText}\`

---

## UGC-002: 5-Beat Narrative Storyboard Spine

*Visual Safe Zone Rule: Keep all critical text between 15% from top and 20% from bottom.*

| Scene & Time | Visual Direction (Column 1) | Spoken Audio & Voiceover (Column 2) |
| :--- | :--- | :--- |
| **Beat 1 (0:00–0:03)**<br>The Hook | **[Shot: Front-Facing Selfie, Rapid Zoom]**<br>Creator looks shocked into camera. Holds up phone showing error screen.<br>**[OST Safe Zone: "STOP SCROLLING 🛑"]** | *"If your ${options.painPoint} is still driving you crazy in 2026, watch this right now."* |
| **Beat 2 (0:03–0:08)**<br>Agitated Problem | **[Cut to: Point-of-View Angle]**<br>Showing the chaotic, frustrating reality of dealing with ${options.painPoint}.<br>**[OST: "The worst feeling ever 😩"]** | *"I was literally spending 3 hours every single night trying to fix this and nothing worked."* |
| **Beat 3 (0:08–0:15)**<br>Discovery Pivot | **[Cut to: Creator at Desk]**<br>Unboxing or opening ${options.product} on laptop screen.<br>**[OST: "Found this life-saver ✨"]** | *"Then my friend sent me ${options.product}. Honestly, I was skeptical, but it completely changed the game."* |
| **Beat 4 (0:15–0:24)**<br>Proof & Demo | **[Cut to: Extreme Close-Up B-roll]**<br>Smooth screen recording showing ${options.solution} working in real-time.<br>**[OST: "Done in 10 seconds ⚡"]** | *"Look how simple this is. You just activate ${options.solution}, and it handles the whole thing automatically. Done in seconds."* |
| **Beat 5 (0:24–0:30)**<br>Frictionless CTA | **[Cut to: Creator smiling directly into lens]**<br>Holding product or tapping phone screen with discount badge.<br>**[OST: "${offer}"]** | *"Do not wait on this. Tap the link below right now and grab yours before the discount ends!"* |

---

## Audio & Music Direction
- **Music**: Trending low-fi upbeat background beat at -18dB (voiceover must stay crystal clear).
- **Sound Effects**: Subtle whoosh on cut transitions, snap sound on text pops.
- **Pacing**: Punchy, conversational, authentic friend-to-friend energy.
`;
}

/**
 * UGC-003: Audit UGC script against retention, buzzword, hook, and pacing gates
 */
export function auditUgcScript(scriptContent: string, targetDurationSeconds = 30): UgcAuditResult {
  const issues: string[] = [];
  const detectedBeats: string[] = [];
  const buzzwordsFound: string[] = [];

  // Parse duration if specified in markdown
  let effectiveDuration = targetDurationSeconds;
  const durationMatch = scriptContent.match(/Target Duration.*?(\d+)[–-](\d+)\s*Seconds/i);
  if (durationMatch) {
    const avg = Math.round((Number(durationMatch[1]) + Number(durationMatch[2])) / 2);
    if (avg > 0) effectiveDuration = avg;
  }

  // Check Hook Matrix (UGC-001)
  const hasHookMatrix = /4-hook matrix|hook 1|negative curiosity|unpopular opinion/i.test(scriptContent);
  if (!hasHookMatrix) {
    issues.push("UGC-001 Violation: Missing 4-Hook Matrix for algorithmic split-testing.");
  }

  // Check 5-Beat Storyboard Spine (UGC-002)
  for (const beat of STORYBOARD_BEATS) {
    const key = beat.split(":")[0].replace("Beat ", "Beat ").trim();
    if (new RegExp(key, "i").test(scriptContent)) {
      detectedBeats.push(beat);
    }
  }
  if (detectedBeats.length < 4) {
    issues.push(
      `UGC-002 Violation: Found only ${detectedBeats.length}/5 storyboard beats. Required: Hook, Problem, Pivot, Demo, CTA.`,
    );
  }

  // Check 9:16 Safe Zone visual cues (UGC-003)
  const hasSafeZoneVisuals = /safe zone|OST Safe Zone|vertical/i.test(scriptContent);
  if (!hasSafeZoneVisuals) {
    issues.push("UGC-003 Warning: Visual cues lack explicit 9:16 vertical safe zone framing.");
  }

  // Detect Banned Corporate Buzzwords
  for (const word of BANNED_UGC_BUZZWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(scriptContent)) {
      buzzwordsFound.push(word);
      issues.push(`UGC-003 Violation: Banned buzzword '${word}' detected. UGC must sound raw and authentic.`);
    }
  }

  // Parse spoken dialogue specifically from storyboard table rows or quoted voiceover
  let cleanSpokenText = "";
  const tableRows = scriptContent
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---") && !/Scene & Time/i.test(line));

  if (tableRows.length > 0) {
    for (const row of tableRows) {
      const parts = row.split("|").map((p) => p.trim());
      // In | Scene | Visual | Audio |, Audio is parts[3]
      if (parts.length >= 4) {
        cleanSpokenText += ` ${parts[3]}`;
      }
    }
  } else {
    // Fallback: extract text between quotes *"..."* or general clean text
    const quotes = scriptContent.match(/\*"([^"]+)"\*/g);
    if (quotes && quotes.length > 0) {
      cleanSpokenText = quotes.join(" ");
    } else {
      cleanSpokenText = scriptContent
        .replace(/^#+.*$/gm, "")
        .replace(/\[(?:Shot|Cut|Visual|OST|SFX|B-roll)[^\]]*\]/gi, "")
        .replace(/\|/g, " ")
        .replace(/`[^`]*`/g, "")
        .replace(/[*_~]/g, "");
    }
  }

  cleanSpokenText = cleanSpokenText
    .replace(/\[(?:Shot|Cut|Visual|OST|SFX|B-roll)[^\]]*\]/gi, "")
    .replace(/`[^`]*`/g, "")
    .replace(/[*_~"]/g, "");

  const words = cleanSpokenText.trim().split(/\s+/).filter(Boolean).length;
  const targetMinutes = effectiveDuration / 60;
  const estimatedWpm = targetMinutes > 0 ? Math.round(words / targetMinutes) : 0;

  // Visual cut frequency analysis (cuts happen on [Cut to:, [Shot:, or table rows)
  const cuts = (scriptContent.match(/\[(?:Cut to|Shot):/gi) || []).length;
  const visualCutCount = Math.max(cuts, 4);
  const avgCutDurationSeconds =
    visualCutCount > 0 ? Math.round((effectiveDuration / visualCutCount) * 10) / 10 : effectiveDuration;

  if (estimatedWpm > 175) {
    issues.push(`UGC-003 Violation: Delivery pace (${estimatedWpm} WPM) is too fast for viewer retention (>175 WPM).`);
  } else if (estimatedWpm < 115 && words > 20) {
    issues.push(`UGC-003 Violation: Delivery pace (${estimatedWpm} WPM) is sluggish (<115 WPM).`);
  }

  if (avgCutDurationSeconds > 4.5) {
    issues.push(
      `UGC-003 Violation: Average visual cut (${avgCutDurationSeconds}s) is too slow. Cuts must occur every 2.0–3.5s.`,
    );
  }

  // Calculate Quality Score
  let score = 100;
  if (!hasHookMatrix) score -= 25;
  if (detectedBeats.length < 5) score -= (5 - detectedBeats.length) * 8;
  if (!hasSafeZoneVisuals) score -= 10;
  score -= buzzwordsFound.length * 10;
  if (estimatedWpm > 175 || estimatedWpm < 115) score -= 15;
  if (avgCutDurationSeconds > 4.5) score -= 10;
  score = Math.max(0, score);

  return {
    valid: issues.length === 0,
    score,
    wordCount: words,
    targetSeconds: effectiveDuration,
    estimatedWpm,
    visualCutCount,
    avgCutDurationSeconds,
    hasHookMatrix,
    hasSafeZoneVisuals,
    detectedBeats,
    buzzwordsFound,
    issues,
  };
}

/**
 * UGC-003: Retention & Pacing Scoring Engine
 */
export function scorePacingAndRetention(scriptContent: string, durationSeconds = 30): UgcPacingReport {
  const audit = auditUgcScript(scriptContent, durationSeconds);
  const isWpmOptimal = audit.estimatedWpm >= 130 && audit.estimatedWpm <= 165;
  const isVisualPacingOptimal = audit.avgCutDurationSeconds >= 1.8 && audit.avgCutDurationSeconds <= 3.8;

  const recommendations: string[] = [];
  if (!isWpmOptimal) {
    if (audit.estimatedWpm > 165) {
      recommendations.push(
        `Trim approximately ${Math.round((audit.estimatedWpm - 150) * (durationSeconds / 60))} words to hit the 130–160 WPM conversational sweet spot.`,
      );
    } else {
      recommendations.push("Expand script dialogue or emphasize punchy explanatory pauses to prevent rushed delivery.");
    }
  }

  if (!isVisualPacingOptimal) {
    if (audit.avgCutDurationSeconds > 3.8) {
      recommendations.push(
        "Inject micro-cuts, zoom-ins, or B-roll switches every 2–3 seconds to reset visual attention.",
      );
    }
  }

  let status: UgcPacingReport["status"] = "OPTIMAL";
  if (!isWpmOptimal && !isVisualPacingOptimal) {
    status = "DROPOFF_RISK";
  } else if (!isWpmOptimal || !isVisualPacingOptimal) {
    status = "PACING_DRIFT";
  }

  return {
    wordCount: audit.wordCount,
    durationSeconds,
    wpm: audit.estimatedWpm,
    isWpmOptimal,
    visualCutCount: audit.visualCutCount,
    avgCutDurationSeconds: audit.avgCutDurationSeconds,
    isVisualPacingOptimal,
    status,
    recommendations,
  };
}

/**
 * UGC-004: Export complete production brief for external creators
 */
export function exportCreatorBrief(options: UgcBriefOptions): string {
  const creator = options.creatorName || "Creator";
  const hookMatrix = generateHookMatrix(options.product, options.painPoint, options.solution);

  return `# UGC Creator Production Brief: ${options.product}

**Deliverable**: 1x Finished 9:16 Video (30–35s) + 4 Separate Opening Hook Takes  
**Creator**: ${creator}  
**Brand**: ${options.product}  
**Campaign**: Paid Acquisition (TikTok Spark Ads / Meta Reels)  

---

## 📐 Technical Specifications
- **Aspect Ratio**: 9:16 Vertical Video (1080 x 1920 minimum, 4K preferred).
- **Frame Rate**: 60 FPS (or 30 FPS clean).
- **Lighting**: Bright natural face lighting (face toward window or ring light at 45°). Zero backlighting shadows.
- **Audio**: Clean, high-gain vocal audio with minimal room echo. Clip-on wireless mic or wired earbuds preferred.
- **Delivery Assets**:
  1. \`${options.product.toLowerCase().replace(/\s+/g, "-")}_master_final.mp4\` (with baked-in native captions & safe-zone text)
  2. \`raw_hooks/\` folder containing 4 raw video takes of each hook variation (no text, no music)
  3. \`raw_broll/\` folder containing 3–5 clean product demo clips (5–8s each)

---

## 🚫 DOs and DON'Ts

### DO:
- **Speak like a friend**: Speak directly to the lens as if you are Facetiming your best friend.
- **Hold attention early**: Start talking within 0.2s of the video starting. No silent head-nods.
- **Show product in action**: Show the product solving the problem within the first 8 seconds.
- **Respect safe zones**: Keep captions away from the edges so platform icons do not cover your words.

### DON'T:
- **Do NOT sound like a TV commercial**: Avoid robotic, scripted infomercial inflection.
- **Do NOT use corporate buzzwords**: Never say "revolutionary", "all-in-one", or "game-changer".
- **Do NOT cover your mouth**: Keep facial expressions visible and animated.
- **Do NOT add copyrighted music**: Deliver with no background music or royalty-free trending track.

---

## 🎣 The 4 Opening Hook Takes (Shoot all 4)
*Please record separate, high-energy takes for each of the following:*
1. **Take A (Negative Curiosity)**: *"${hookMatrix.hooks[0].verbalHook}"*
2. **Take B (Direct Problem)**: *"${hookMatrix.hooks[1].verbalHook}"*
3. **Take C (Unpopular Opinion)**: *"${hookMatrix.hooks[2].verbalHook}"*
4. **Take D (Before/After)**: *"${hookMatrix.hooks[3].verbalHook}"*

---

## 📝 Native Platform Captions & Hashtags
**Caption**:  
"Still dealing with ${options.painPoint}? 🤦‍♂️ Tried ${options.product} and honestly it completely solved it. Link in bio for the discount code! 👇"  

**Hashtags**:  
\`#${options.product.toLowerCase().replace(/\s+/g, "")} #problemSolved #lifehack #productivity #reels #tiktokmademebuyit\`
`;
}

// =========================================================================
// CLI Runner
// =========================================================================

function runCli(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "scaffold-ugc": { type: "boolean", default: false },
      "score-pacing": { type: "boolean", default: false },
      "export-brief": { type: "boolean", default: false },
      "audit-script": { type: "string" },
      product: { type: "string", default: "SaaS Product" },
      target: { type: "string", default: "Busy Founders" },
      pain: { type: "string", default: "slow manual client onboarding" },
      solution: { type: "string", default: "automated 1-click workspace setup" },
      offer: { type: "string", default: "Get 20% off with code LAUNCH20" },
      creator: { type: "string", default: "Creator" },
      out: { type: "string" },
      "duration-seconds": { type: "string", default: "30" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🎬 ugc-generator — Direct-Response UGC Video Script & Creator Brief Engine

Usage:
  bun ugc-generator.ts [options]

Commands:
  --scaffold-ugc       Scaffold complete 5-beat UGC script with 4-hook matrix
  --score-pacing       Score script cadence, cut frequency, and retention risk
  --export-brief       Export creator production brief with technical specs & DOs/DON'Ts
  --audit-script <path> Audit script against UGC-001–UGC-004 invariants

Options:
  --product <name>     Product name
  --target <audience>  Target persona
  --pain <painPoint>   Core problem
  --solution <solution> Unique mechanism/solution
  --offer <text>       Incentive/CTA offer
  --creator <name>     Creator name for production brief
  --out <file>         Output path to write markdown deliverable
  --duration-seconds <sec> Target video duration in seconds (default: 30)
  --json               Output machine-readable JSON
`);
    process.exit(0);
  }

  const durationSec = Number(values["duration-seconds"]) || 30;

  if (values["scaffold-ugc"]) {
    const script = scaffoldUgc({
      product: values.product as string,
      targetAudience: values.target as string,
      painPoint: values.pain as string,
      solution: values.solution as string,
      offer: values.offer as string,
    });

    if (values.out) {
      writeFileSync(values.out, script, "utf8");
      console.log(`✅ UGC script generated: ${values.out}`);
    } else {
      console.log(script);
    }
    return;
  }

  if (values["export-brief"]) {
    const brief = exportCreatorBrief({
      product: values.product as string,
      targetAudience: values.target as string,
      painPoint: values.pain as string,
      solution: values.solution as string,
      offer: values.offer as string,
      creatorName: values.creator as string,
    });

    if (values.out) {
      writeFileSync(values.out, brief, "utf8");
      console.log(`✅ Creator brief generated: ${values.out}`);
    } else {
      console.log(brief);
    }
    return;
  }

  if (values["audit-script"]) {
    const scriptPath = values["audit-script"] as string;
    if (!existsSync(scriptPath)) {
      console.error(`❌ Script file not found: ${scriptPath}`);
      process.exit(1);
    }
    const content = readFileSync(scriptPath, "utf8");
    const result = auditUgcScript(content, durationSec);

    if (values.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("🎬 UGC Script Audit Report:");
      console.log(`  • Valid:              ${result.valid ? "YES" : "NO"}`);
      console.log(`  • Quality Score:      ${result.score}/100`);
      console.log(`  • Word Count:         ${result.wordCount} words`);
      console.log(`  • Estimated Pacing:   ${result.estimatedWpm} WPM`);
      console.log(`  • Visual Cuts:        ${result.visualCutCount} cuts (~${result.avgCutDurationSeconds}s/cut)`);
      console.log(`  • Hook Matrix:        ${result.hasHookMatrix ? "Passed" : "Missing"}`);
      console.log(`  • 9:16 Safe Zones:    ${result.hasSafeZoneVisuals ? "Passed" : "Missing"}`);
      console.log(`  • Beats Detected:     ${result.detectedBeats.length}/5`);
      if (result.issues.length > 0) {
        console.log("  ⚠️  Audit Issues:");
        for (const issue of result.issues) {
          console.log(`    - ${issue}`);
        }
      }
    }
    process.exit(result.valid ? 0 : 1);
  }

  if (values["score-pacing"]) {
    const script = scaffoldUgc({
      product: values.product as string,
      targetAudience: values.target as string,
      painPoint: values.pain as string,
      solution: values.solution as string,
      offer: values.offer as string,
    });
    const pacing = scorePacingAndRetention(script, durationSec);
    if (values.json) {
      console.log(JSON.stringify(pacing, null, 2));
    } else {
      console.log("⏱️ UGC Pacing & Retention Report:");
      console.log(`  • Status:           ${pacing.status}`);
      console.log(`  • Words:            ${pacing.wordCount}`);
      console.log(`  • Cadence:          ${pacing.wpm} WPM (Optimal: ${pacing.isWpmOptimal ? "YES" : "NO"})`);
      console.log(`  • Visual Cuts:      ${pacing.visualCutCount} (~${pacing.avgCutDurationSeconds}s/cut)`);
      if (pacing.recommendations.length > 0) {
        console.log("  💡 Recommendations:");
        for (const rec of pacing.recommendations) {
          console.log(`    - ${rec}`);
        }
      }
    }
  }
}

// Auto-run when executed directly
if (import.meta.main) {
  runCli();
}
