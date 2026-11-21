#!/usr/bin/env bun
/**
 * Video Sales Letter (VSL) Generator & Audit Engine
 *
 * Implements VSL-001–VSL-004 invariants:
 * - VSL-001: 3-Second Retention Law & Tri-Layer Hook (visual, verbal, text)
 * - VSL-002: Jasper 6-Beat Narrative Spine (Hook, Villain, Shift, Mechanism, Proof, Offer/CTA)
 * - VSL-003: Two-Column A/V Storyboard Standard
 * - VSL-004: Anti-Slop Conversion Copy Gate & WPM Pacing (130-145 WPM)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface VslAuditResult {
  valid: boolean;
  score: number;
  wordCount: number;
  targetSeconds: number;
  estimatedWpm: number;
  hasHook: boolean;
  hasTwoColumnTable: boolean;
  detectedBeats: string[];
  buzzwordsFound: string[];
  issues: string[];
}

export interface SceneTiming {
  scene: string;
  words: number;
  estimatedSeconds: number;
}

const BANNED_BUZZWORDS = [
  "cutting-edge",
  "game-changer",
  "revolutionary",
  "supercharge",
  "all-in-one",
  "next-gen",
  "disruptive",
  "magic bullet",
  "groundbreaking",
];

const BEATS = [
  "Beat 1: Pattern Interrupt & Hook",
  "Beat 2: The Villain / Common Pitfall",
  "Beat 3: The Paradigm Shift",
  "Beat 4: Unique Mechanism Reveal",
  "Beat 5: Empirical Proof & Stacking",
  "Beat 6: Offer, Risk Reversal & CTA",
];

export function auditVslScript(scriptContent: string, targetDurationSeconds = 300): VslAuditResult {
  const issues: string[] = [];
  const detectedBeats: string[] = [];
  const buzzwordsFound: string[] = [];

  // Parse duration from script header if declared
  let effectiveDuration = targetDurationSeconds;
  const durationMatch = scriptContent.match(/Target Duration.*?\((\d+)\s*Seconds\)/i);
  if (durationMatch) {
    const parsed = Number(durationMatch[1]);
    if (parsed > 0) effectiveDuration = parsed;
  }

  // Check Two-Column Table
  const hasTwoColumnTable =
    /\|.*(visual|direction).*\|.*(audio|voiceover|dialogue|sfx).*\|/i.test(scriptContent) ||
    /\|.*Scene.*\|.*Visual.*\|.*Audio.*\|/i.test(scriptContent);
  if (!hasTwoColumnTable) {
    issues.push("Script is missing the mandatory Two-Column A/V Storyboard table.");
  }

  // Check 3-Second Hook
  const hasHook =
    /3-second|first 3|hook/i.test(scriptContent) &&
    (/visual/i.test(scriptContent) || /cut/i.test(scriptContent) || /shot/i.test(scriptContent));
  if (!hasHook) {
    issues.push("Missing clear 3-second visual and spoken retention hook.");
  }

  // Check Narrative Beats
  for (const beat of BEATS) {
    const keyword = beat.split(":")[1].trim().split(" ")[0].toLowerCase();
    if (new RegExp(keyword, "i").test(scriptContent)) {
      detectedBeats.push(beat);
    }
  }

  // Check Anti-Slop Buzzwords
  for (const word of BANNED_BUZZWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(scriptContent)) {
      buzzwordsFound.push(word);
      issues.push(`Detected banned AI buzzword: '${word}'. Replace with concrete capability.`);
    }
  }

  // Calculate Word Count of spoken dialogue (stripping markdown tables, headers, and metadata)
  const cleanSpokenText = scriptContent
    .replace(/^#+.*$/gm, "")
    .replace(/\[(?:Shot|Cut|Visual|OST|SFX|B-roll)[^\]]*\]/gi, "")
    .replace(/\|/g, " ")
    .replace(/`[^`]*`/g, "")
    .replace(/[*_~]/g, "");

  const words = cleanSpokenText.trim().split(/\s+/).filter(Boolean).length;
  const targetMinutes = effectiveDuration / 60;
  const estimatedWpm = targetMinutes > 0 ? Math.round(words / targetMinutes) : 0;

  if (estimatedWpm > 155) {
    issues.push(`Estimated WPM (${estimatedWpm}) is too fast (>155 WPM). Risk of high drop-off.`);
  } else if (estimatedWpm < 110 && words > 50) {
    issues.push(`Estimated WPM (${estimatedWpm}) is too slow (<110 WPM). Pace may feel sluggish.`);
  }

  // Scoring
  let score = 100;
  if (!hasTwoColumnTable) score -= 30;
  if (!hasHook) score -= 20;
  score -= buzzwordsFound.length * 10;
  if (detectedBeats.length < 4) score -= 20;
  if (estimatedWpm > 155 || (estimatedWpm < 110 && words > 50)) score -= 15;
  score = Math.max(0, score);

  return {
    valid: issues.length === 0,
    score,
    wordCount: words,
    targetSeconds: effectiveDuration,
    estimatedWpm,
    hasHook,
    hasTwoColumnTable,
    detectedBeats,
    buzzwordsFound,
    issues,
  };
}

export function computeSceneTimings(scriptContent: string, baseWpm = 135): SceneTiming[] {
  const lines = scriptContent.split("\n");
  const timings: SceneTiming[] = [];

  for (const line of lines) {
    if (line.startsWith("|") && !line.includes("---") && !/\|\s*Scene\s*\|/i.test(line)) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 4) {
        const sceneName = parts[1];
        const audioText = parts[3]
          .replace(/\[(?:SFX|Shot|Visual|OST)[^\]]*\]/gi, "")
          .replace(/`[^`]*`/g, "")
          .replace(/[*_~]/g, "");

        const words = audioText.split(/\s+/).filter(Boolean).length;
        if (words > 0) {
          const estimatedSeconds = Math.round((words / (baseWpm / 60)) * 10) / 10;
          timings.push({
            scene: sceneName,
            words,
            estimatedSeconds,
          });
        }
      }
    }
  }

  return timings;
}

export function scaffoldVsl(options: { product: string; targetAudience: string; mechanism: string }): string {
  return `# Video Sales Letter (VSL) Production Script: ${options.product}

**Target Audience**: ${options.targetAudience}  
**Unique Mechanism**: ${options.mechanism}  
**Pacing Target**: 135 Words Per Minute (Conversational)  
**Target Duration**: 2.3 Minutes (140 Seconds)  

---

## Jasper 6-Beat Narrative Spine
- **Beat 1 (0:00–0:30)**: Pattern Interrupt & High-Stakes Retention Hook
- **Beat 2 (0:30–1:15)**: The Hidden Villain / Why Common Solutions Fail
- **Beat 3 (1:15–2:00)**: The Paradigm Shift
- **Beat 4 (2:00–3:15)**: The Unique Mechanism (${options.mechanism})
- **Beat 5 (3:15–4:15)**: Empirical Proof Stacking & Case Studies
- **Beat 6 (4:15–5:00)**: The No-Brainer Offer, Risk Reversal & Dual Call-to-Action

---

## Two-Column A/V Production Storyboard

| Scene & Time | Visual Direction (Column 1) | Spoken Audio & SFX (Column 2) |
| :--- | :--- | :--- |
| **01 (0:00–0:07)**<br>Hook | **[Shot: Extreme Close-Up]**<br>Host looks directly into camera. Holds up an iPad displaying live metrics.<br>**[OST: High-contrast yellow text: "STOP WASTING TIME"]** | *"If you're still relying on manual workflows for ${options.targetAudience} in 2026, you're bleeding 15 hours every single week."*<br>\`[SFX: Sudden glitch cut]\` |
| **02 (0:07–0:30)**<br>Qualification | **[Cut to: B-roll Screen Recording]**<br>Overwhelmed desktop with 20 browser tabs open, failing spreadsheets, and missed deadlines. | *"Most teams assume they need to hire three more people. But the problem isn't your headcount. It's the friction in your delivery loop."*<br>\`[SFX: Low drone swells]\` |
| **03 (0:30–1:15)**<br>The Villain | **[Shot: Medium Close-Up]**<br>Host walks to whiteboard. Draws the breakdown bottleneck. | *"Here is why the standard agency playbook fails under load. When a client requests changes, everyone context-switches, creating massive project delays."* |
| **04 (1:15–2:00)**<br>The Shift | **[Shot: Clean Split Screen]**<br>Left: Old way (manual chaos). Right: New way (automated velocity). | *"What if instead of fighting fires, your entire pipeline operated with verified mathematical guarantees?"* |
| **05 (2:00–3:15)**<br>The Mechanism | **[Shot: Screen Demo]**<br>Walkthrough of ${options.product} powered by ${options.mechanism}. | *"This is why we engineered ${options.mechanism}. It intercepts errors at the boundary, ensuring zero downtime and sub-second execution."* |
| **06 (3:15–4:15)**<br>Proof Stacking | **[Cut to: Customer Metrics]**<br>Before-and-after conversion charts, client testimonials, and verified revenue receipts. | *"In the last 90 days alone, teams using this exact system cut turnaround time by 64% while doubling client retention."* |
| **07 (4:15–5:00)**<br>Offer & CTA | **[Shot: Host Direct to Camera]**<br>Summary badge of the complete system and guarantee badge.<br>**[OST: Link to Book Call / Sign Up]** | *"Click the link below right now to test ${options.product} completely risk-free for 30 days. Let's build your competitive edge today."*<br>\`[SFX: Clean chime / CTA pulse]\` |
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
🎬 Jasper VSL Script Generator & Storyboard Auditor

Usage:
  bun vsl-generator.ts --scaffold-vsl --product <name> --target <audience> --mechanism <name> [--out <file>]
  bun vsl-generator.ts --audit-script <file.md> [--duration-seconds <sec>] [--json]
  bun vsl-generator.ts --timing <file.md> [--json]

Options:
  --scaffold-vsl         Generates a complete 6-beat VSL production script with Two-Column storyboard.
  --product <name>       Product or service name.
  --target <audience>    Target audience description.
  --mechanism <name>     Unique mechanism or proprietary feature.
  --audit-script <file>  Audits script against 3-second hook, WPM pacing, buzzwords, and storyboard layout.
  --duration-seconds <n> Target duration for WPM calculation (default: 300s).
  --timing <file>        Breaks down scene-by-scene timing and word count.
  --json                 Outputs structured JSON result.
  --help                 Show this help screen.
`);
    process.exit(0);
  }

  if (args.includes("--scaffold-vsl")) {
    const product = getArgValue("--product") || "Autonomous Agent Cloud";
    const target = getArgValue("--target") || "High-Growth Agencies";
    const mechanism = getArgValue("--mechanism") || "Zero-Latency Edge Execution";
    const outPath = getArgValue("--out");

    const script = scaffoldVsl({
      product,
      targetAudience: target,
      mechanism,
    });

    if (outPath) {
      writeFileSync(outPath, script, "utf8");
      console.log(`✅ Generated VSL Script saved to: ${outPath}`);
    } else {
      console.log(script);
    }
    process.exit(0);
  }

  if (args.includes("--audit-script")) {
    const filePath = getArgValue("--audit-script");
    if (!filePath || !existsSync(filePath)) {
      console.error("Error: --audit-script requires a valid markdown file path.");
      process.exit(1);
    }
    const duration = Number(getArgValue("--duration-seconds")) || 300;
    const content = readFileSync(filePath, "utf8");
    const res = auditVslScript(content, duration);

    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🎬 VSL Script Audit: ${res.valid ? "✅ PASS" : "❌ NEEDS WORK"} (Score: ${res.score}/100)`);
      console.log(`Word Count: ${res.wordCount} words`);
      console.log(`Pacing: ~${res.estimatedWpm} WPM (Target: 130–145 WPM for ${res.targetSeconds}s)`);
      console.log(`3-Second Hook: ${res.hasHook ? "✅ Present" : "❌ Missing"}`);
      console.log(`Two-Column Storyboard: ${res.hasTwoColumnTable ? "✅ Formatted" : "❌ Missing"}`);
      console.log(`Detected Narrative Beats: ${res.detectedBeats.length} / 6`);
      if (res.buzzwordsFound.length > 0) {
        console.log(`Banned AI Buzzwords: ${res.buzzwordsFound.join(", ")}`);
      }
      if (res.issues.length > 0) {
        console.log("\nIssues & Improvement Suggestions:");
        for (const issue of res.issues) {
          console.log(` - ${issue}`);
        }
      }
    }
    process.exit(res.valid ? 0 : 1);
  }

  if (args.includes("--timing")) {
    const filePath = getArgValue("--timing");
    if (!filePath || !existsSync(filePath)) {
      console.error("Error: --timing requires a valid markdown file path.");
      process.exit(1);
    }
    const content = readFileSync(filePath, "utf8");
    const timings = computeSceneTimings(content);
    if (isJson) {
      console.log(JSON.stringify(timings, null, 2));
    } else {
      console.log("\n⏱️ Scene-by-Scene Timing Breakdown (135 WPM Baseline):");
      let totalSeconds = 0;
      for (const t of timings) {
        console.log(` • Scene ${t.scene}: ${t.words} words (~${t.estimatedSeconds}s)`);
        totalSeconds += t.estimatedSeconds;
      }
      console.log(`\nTotal Estimated Duration: ~${Math.round(totalSeconds)}s (${(totalSeconds / 60).toFixed(1)} min)`);
    }
    process.exit(0);
  }
}
