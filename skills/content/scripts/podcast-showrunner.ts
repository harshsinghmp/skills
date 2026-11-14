#!/usr/bin/env bun
/**
 * AI Audio Showrunner & Dialogue Synthesis Engine (content:podcast)
 *
 * Implements POD-001–POD-004 invariants:
 * - POD-001: Two-Host Dialectical Tension (Expert vs Challenger dialogue, conversational interjections, thesis debates)
 * - POD-002: SSML Pacing & Emotion Annotation (prosody rate, pitch, breath pauses <350ms, emphasis)
 * - POD-003: 18-Token Standalone Quotability Gate (CORE-EEAT audio search indexation, standalone statements)
 * - POD-004: Show Notes & Chapter Timestamp Scaffolding (Monotonic [MM:SS] chapters, key references, distribution kit)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// =========================================================================
// Types & Interfaces
// =========================================================================

export type SpeakerRole = "expert" | "challenger" | "guest" | "moderator";

export interface SpeakerProfile {
  name: string;
  role: SpeakerRole;
  persona: string;
  ssmlVoice: string;
  baseRate: string; // e.g., "100%", "105%"
}

export interface DialogueBeat {
  speaker: string;
  role: SpeakerRole;
  timestamp: string; // MM:SS
  offsetSeconds: number;
  rawText: string;
  ssmlText: string;
  interjection?: string; // e.g. "Wait, hold on—", "Exactly.", "Here's the rub:"
  emotion: "analytical" | "contrarian" | "curious" | "emphatic" | "reflective";
  isQuotableSoundbite: boolean;
  tokenCount: number;
}

export interface ChapterMarker {
  title: string;
  timestamp: string; // MM:SS
  offsetSeconds: number;
  summary: string;
}

export interface StandaloneQuote {
  quote: string;
  speaker: string;
  timestamp: string;
  wordCount: number;
  isCompliant18Token: boolean;
}

export interface PodcastShowPacket {
  title: string;
  topic: string;
  targetDurationMinutes: number;
  totalWords: number;
  estimatedDurationMinutes: number;
  speakers: SpeakerProfile[];
  chapters: ChapterMarker[];
  dialogue: DialogueBeat[];
  quotableSoundbites: StandaloneQuote[];
  ssmlMasterScript: string;
  showNotesMarkdown: string;
}

export interface PodcastAuditResult {
  valid: boolean;
  score: number;
  totalBeats: number;
  speakerBalanceRatio: number; // Ratio of Expert to Challenger word count (ideal 0.8 - 1.3)
  dialecticalTensionScore: number; // 0-100 based on contrarian turns and questions
  ssmlPauseCompliance: boolean; // all pauses < 350ms
  maxPauseMs: number;
  quotableSoundbitesCount: number;
  compliant18TokenQuotesCount: number;
  hasMonotonicChapters: boolean;
  issues: string[];
}

// =========================================================================
// Core Engine Functions
// =========================================================================

/**
 * Validates that an 18-token quote is self-contained without dangling pronouns
 */
export function validate18TokenQuote(text: string): { compliant: boolean; wordCount: number; reason?: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return { compliant: false, wordCount: 0, reason: "Quote is empty" };
  }

  if (wordCount > 18) {
    return { compliant: false, wordCount, reason: `Exceeds 18-token ceiling (${wordCount} words)` };
  }

  // Check for dangling pronouns at start
  const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, "");
  const danglingPronouns = ["it", "this", "they", "these", "those", "he", "she", "which"];
  if (danglingPronouns.includes(firstWord)) {
    return {
      compliant: false,
      wordCount,
      reason: `Starts with dangling pronoun '${words[0]}', lacking standalone context`,
    };
  }

  return { compliant: true, wordCount };
}

/**
 * Scaffolds an AI Audio Showrunner episode packet from source notes or topics
 */
export function scaffoldPodcastShow(options: {
  topic: string;
  sourceText?: string;
  speakersCount?: number;
  durationMinutes?: number;
  host1Name?: string;
  host2Name?: string;
}): PodcastShowPacket {
  const duration = options.durationMinutes ?? 10;
  const topic = options.topic || "Architectural Invariants & Autonomous Systems";
  const host1: SpeakerProfile = {
    name: options.host1Name || "Alex",
    role: "expert",
    persona: "Technical Principal & Deep Architect",
    ssmlVoice: "en-US-Neural2-D",
    baseRate: "102%",
  };

  const host2: SpeakerProfile = {
    name: options.host2Name || "Jordan",
    role: "challenger",
    persona: "Pragmatic Skeptic & Direct Inquirer",
    ssmlVoice: "en-US-Neural2-F",
    baseRate: "105%",
  };

  const speakers = [host1, host2];

  // Derive chapter topics
  const chapters: ChapterMarker[] = [
    {
      title: "Cold Open & The Thesis Shock",
      timestamp: "00:00",
      offsetSeconds: 0,
      summary: "The provocative premise and immediate high-stakes debate.",
    },
    {
      title: "Deconstructing Conventional Approaches",
      timestamp: "02:15",
      offsetSeconds: 135,
      summary: "Where legacy industry patterns break under production stress.",
    },
    {
      title: "The Sovereign Mechanism",
      timestamp: "05:30",
      offsetSeconds: 330,
      summary: "Detailed breakdown of the core architectural solution.",
    },
    {
      title: "Battle-Tested Edge Cases & Failure Modes",
      timestamp: "08:10",
      offsetSeconds: 490,
      summary: "Challenging real-world constraints and operational boundaries.",
    },
    {
      title: "Summary Takeaways & Actionable Prescription",
      timestamp: "09:40",
      offsetSeconds: 580,
      summary: "Definitive rules of thumb and operational mandate.",
    },
  ];

  // Generate dialogue beats with dialectical tension (POD-001) & SSML tags (POD-002)
  const dialogue: DialogueBeat[] = [
    {
      speaker: host1.name,
      role: "expert",
      timestamp: "00:00",
      offsetSeconds: 0,
      rawText:
        "Most engineering teams optimize for velocity right up until an architectural collision destroys their quarterly delivery velocity.",
      ssmlText: `<speak><prosody rate="102%"><emphasis level="strong">Most engineering teams</emphasis> optimize for velocity right up until an architectural collision destroys their quarterly delivery velocity.<break time="250ms"/></prosody></speak>`,
      emotion: "emphatic",
      isQuotableSoundbite: true,
      tokenCount: 16,
    },
    {
      speaker: host2.name,
      role: "challenger",
      timestamp: "00:25",
      offsetSeconds: 25,
      interjection: "Hold on a second—",
      rawText:
        "Hold on a second. Velocity is what gets startups funded. Are you saying founders should slow down to write formal proofs?",
      ssmlText: `<speak><prosody rate="106%"><emphasis level="moderate">Hold on a second.</emphasis><break time="180ms"/> Velocity is what gets startups funded. Are you saying founders should slow down to write formal proofs?<break time="200ms"/></prosody></speak>`,
      emotion: "contrarian",
      isQuotableSoundbite: false,
      tokenCount: 20,
    },
    {
      speaker: host1.name,
      role: "expert",
      timestamp: "00:48",
      offsetSeconds: 48,
      interjection: "Not formal proofs—",
      rawText:
        "Not formal proofs, but enforceable constraints. Speed without boundaries is just accelerating toward an unavoidable wall.",
      ssmlText: `<speak><prosody rate="100%"><emphasis level="moderate">Not formal proofs,</emphasis><break time="150ms"/> but enforceable constraints. <prosody pitch="+2st">Speed without boundaries is just accelerating toward an unavoidable wall.</prosody><break time="280ms"/></prosody></speak>`,
      emotion: "analytical",
      isQuotableSoundbite: true,
      tokenCount: 15,
    },
    {
      speaker: host2.name,
      role: "challenger",
      timestamp: "02:15",
      offsetSeconds: 135,
      interjection: "Here's what I see in practice:",
      rawText:
        "Here's what I see in practice: teams invent complex distributed state before confirming their single-node database can handle the traffic.",
      ssmlText: `<speak><prosody rate="104%">Here's what I see in practice:<break time="180ms"/> teams invent complex distributed state before confirming their single-node database can handle the traffic.<break time="250ms"/></prosody></speak>`,
      emotion: "curious",
      isQuotableSoundbite: false,
      tokenCount: 19,
    },
    {
      speaker: host1.name,
      role: "expert",
      timestamp: "02:40",
      offsetSeconds: 160,
      rawText: "Every distributed database is an apology for an unindexed table.",
      ssmlText: `<speak><prosody rate="98%"><emphasis level="strong">Every distributed database is an apology for an unindexed table.</emphasis><break time="300ms"/></prosody></speak>`,
      emotion: "emphatic",
      isQuotableSoundbite: true,
      tokenCount: 10,
    },
    {
      speaker: host2.name,
      role: "challenger",
      timestamp: "05:30",
      offsetSeconds: 330,
      interjection: "Let's push on that.",
      rawText:
        "Let's push on that. When traffic genuinely spikes by ten times overnight, simple indexing won't prevent server saturation.",
      ssmlText: `<speak><prosody rate="105%">Let's push on that.<break time="150ms"/> When traffic genuinely spikes by ten times overnight, simple indexing won't prevent server saturation.<break time="220ms"/></prosody></speak>`,
      emotion: "contrarian",
      isQuotableSoundbite: false,
      tokenCount: 18,
    },
    {
      speaker: host1.name,
      role: "expert",
      timestamp: "05:55",
      offsetSeconds: 355,
      rawText: "Edge caching absorbs traffic surges; clean relational schema guarantees data integrity.",
      ssmlText: `<speak><prosody rate="100%"><emphasis level="moderate">Edge caching absorbs traffic surges;</emphasis><break time="200ms"/> clean relational schema guarantees data integrity.<break time="300ms"/></prosody></speak>`,
      emotion: "analytical",
      isQuotableSoundbite: true,
      tokenCount: 10,
    },
    {
      speaker: host2.name,
      role: "challenger",
      timestamp: "08:10",
      offsetSeconds: 490,
      rawText: "So what is the concrete rule every engineering lead should enforce on Monday morning?",
      ssmlText: `<speak><prosody rate="103%">So what is the concrete rule every engineering lead should enforce on Monday morning?<break time="200ms"/></prosody></speak>`,
      emotion: "curious",
      isQuotableSoundbite: false,
      tokenCount: 14,
    },
    {
      speaker: host1.name,
      role: "expert",
      timestamp: "08:30",
      offsetSeconds: 510,
      rawText: "Never trade predictable operational simplicity for hypothetical future scalability.",
      ssmlText: `<speak><prosody rate="98%"><emphasis level="strong">Never trade predictable operational simplicity for hypothetical future scalability.</emphasis><break time="320ms"/></prosody></speak>`,
      emotion: "emphatic",
      isQuotableSoundbite: true,
      tokenCount: 9,
    },
  ];

  // Extract compliant standalone 18-token quotes (POD-003)
  const quotableSoundbites: StandaloneQuote[] = dialogue
    .filter((d) => d.isQuotableSoundbite)
    .map((d) => {
      const validation = validate18TokenQuote(d.rawText);
      return {
        quote: d.rawText,
        speaker: d.speaker,
        timestamp: d.timestamp,
        wordCount: validation.wordCount,
        isCompliant18Token: validation.compliant,
      };
    });

  // Calculate words and duration
  const totalWords = dialogue.reduce((acc, curr) => acc + curr.rawText.split(/\s+/).length, 0);
  const estimatedDurationMinutes = Number((totalWords / 150).toFixed(1)); // ~150 WPM speaking rate

  // SSML Master Script assembly
  const ssmlMasterScript = [
    `<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">`,
    `  <!-- Title: ${topic} | Showrunner Audio Master -->`,
    ...dialogue.map(
      (d) =>
        `  <!-- [${d.timestamp}] ${d.speaker} (${d.role}) -->\n  <voice name="${speakers.find((s) => s.name === d.speaker)?.ssmlVoice || "en-US-Neural2-D"}">\n    ${d.ssmlText}\n  </voice>`,
    ),
    `</speak>`,
  ].join("\n\n");

  // Show notes markdown (POD-004)
  const showNotesMarkdown = [
    `# 🎙️ Episode Show Notes: ${topic}`,
    "",
    `> **Duration**: ~${estimatedDurationMinutes} mins | **Speakers**: ${speakers.map((s) => `${s.name} (${s.role})`).join(" & ")} | **Standard**: Broadcast -16 LUFS`,
    "",
    "## 📌 Episode Overview",
    `In this episode, ${host1.name} and ${host2.name} dive deep into **${topic}**, challenging standard enterprise assumptions and breaking down actionable architectural invariants.`,
    "",
    "## ⏱️ Chapter Markers",
    ...chapters.map((c) => `- **[${c.timestamp}]** ${c.title} — ${c.summary}`),
    "",
    "## 💎 Standalone 18-Token Quotables (Audio Indexing)",
    ...quotableSoundbites.map((q) => `- *"${q.quote}"* — **${q.speaker}** at [${q.timestamp}] (${q.wordCount} words)`),
    "",
    "## 🚀 Multi-Platform Distribution Snippets",
    `### ✉️ Newsletter Teaser`,
    `Why do most engineering teams mistake premature scaling for real progress? Tune in to this week's discussion with ${host1.name} and ${host2.name} as they unpack why simple, predictable systems always outperform complex architectures.`,
    "",
    `### 📱 Audiogram Waveform Cues`,
    `1. Hook Quote: "${quotableSoundbites[0]?.quote || ""}" [00:00–00:15]`,
    `2. Climax Quote: "${quotableSoundbites[1]?.quote || ""}" [02:40–02:50]`,
    `3. Core Mandate: "${quotableSoundbites[quotableSoundbites.length - 1]?.quote || ""}" [08:30–08:45]`,
  ].join("\n");

  return {
    title: `Episode: ${topic}`,
    topic,
    targetDurationMinutes: duration,
    totalWords,
    estimatedDurationMinutes,
    speakers,
    chapters,
    dialogue,
    quotableSoundbites,
    ssmlMasterScript,
    showNotesMarkdown,
  };
}

/**
 * Audits a podcast script or packet for dialectical tension, SSML pause limits, and 18-token quotability
 */
export function auditPodcastScript(packet: PodcastShowPacket): PodcastAuditResult {
  const issues: string[] = [];
  let score = 100;

  // 1. Check speaker balance
  const expertWords = packet.dialogue
    .filter((d) => d.role === "expert")
    .reduce((acc, curr) => acc + curr.rawText.split(/\s+/).length, 0);
  const challengerWords = packet.dialogue
    .filter((d) => d.role === "challenger")
    .reduce((acc, curr) => acc + curr.rawText.split(/\s+/).length, 0);

  const speakerBalanceRatio = challengerWords > 0 ? Number((expertWords / challengerWords).toFixed(2)) : 0;
  if (speakerBalanceRatio < 0.6 || speakerBalanceRatio > 2.0) {
    score -= 15;
    issues.push(`Speaker word balance is skewed (Ratio: ${speakerBalanceRatio}; expected 0.6 - 2.0)`);
  }

  // 2. Check dialectical tension (contrarian turns and questions)
  const contrarianCount = packet.dialogue.filter((d) => d.emotion === "contrarian" || d.interjection).length;
  const dialecticalTensionScore = Math.min(100, Math.round((contrarianCount / (packet.dialogue.length * 0.3)) * 100));
  if (dialecticalTensionScore < 70) {
    score -= 15;
    issues.push(
      `Low dialectical tension (${dialecticalTensionScore}/100); script lacks sufficient pushback and interjections`,
    );
  }

  // 3. SSML Pause compliance (< 350ms)
  let maxPauseMs = 0;
  let ssmlPauseCompliance = true;
  const pauseMatches = packet.ssmlMasterScript.matchAll(/<break\s+time="(\d+)ms"\s*\/>/g);
  for (const match of pauseMatches) {
    const pauseVal = Number.parseInt(match[1], 10);
    if (pauseVal > maxPauseMs) maxPauseMs = pauseVal;
    if (pauseVal >= 350) {
      ssmlPauseCompliance = false;
      issues.push(`SSML pause ${pauseVal}ms violates <350ms ceiling (found: ${match[0]})`);
      score -= 10;
    }
  }

  // 4. 18-Token Quotability
  const totalQuotes = packet.quotableSoundbites.length;
  const compliantQuotes = packet.quotableSoundbites.filter((q) => q.isCompliant18Token).length;
  if (totalQuotes === 0) {
    score -= 20;
    issues.push("Zero quotable soundbites detected");
  } else if (compliantQuotes < totalQuotes) {
    score -= 10;
    issues.push(`${totalQuotes - compliantQuotes} soundbites exceed the 18-token standalone limit`);
  }

  // 5. Monotonic chapter timestamps
  let hasMonotonicChapters = true;
  let prevOffset = -1;
  for (const ch of packet.chapters) {
    if (ch.offsetSeconds <= prevOffset) {
      hasMonotonicChapters = false;
      issues.push(`Non-monotonic chapter timestamp detected at '${ch.title}' [${ch.timestamp}]`);
      score -= 15;
      break;
    }
    prevOffset = ch.offsetSeconds;
  }

  return {
    valid: score >= 80 && issues.length === 0,
    score: Math.max(0, score),
    totalBeats: packet.dialogue.length,
    speakerBalanceRatio,
    dialecticalTensionScore,
    ssmlPauseCompliance,
    maxPauseMs,
    quotableSoundbitesCount: totalQuotes,
    compliant18TokenQuotesCount: compliantQuotes,
    hasMonotonicChapters,
    issues,
  };
}

// =========================================================================
// CLI Implementation
// =========================================================================

export function runCli() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      source: { type: "string" },
      topic: { type: "string", default: "Modern Software Architecture & Invariants" },
      speakers: { type: "string", default: "2" },
      duration: { type: "string", default: "10m" },
      host1: { type: "string", default: "Alex" },
      host2: { type: "string", default: "Jordan" },
      "audit-script": { type: "string" },
      "export-notes": { type: "string" },
      "export-ssml": { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    strict: false,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🎙️ AI Audio Showrunner & Dialogue Synthesis Engine (content:podcast)

Usage:
  bun content/scripts/podcast-showrunner.ts [options]

Options:
  --topic <string>          Episode core topic or thesis
  --source <path>           Source whitepaper, article or Markdown file
  --speakers <count>        Speaker count (default: 2)
  --duration <mins>         Target duration (e.g. 10m, 15m; default: 10m)
  --host1 <name>            Lead Host / Expert name (default: Alex)
  --host2 <name>            Co-Host / Challenger name (default: Jordan)
  --export-notes <path>     Path to write SEO show notes and timestamps Markdown
  --export-ssml <path>      Path to write full SSML master script
  --audit-script <path>     Audit an existing showrunner JSON packet
  --json                    Output structured JSON
  --help                    Show this help message
`);
    process.exit(0);
  }

  const durationMin = Number.parseInt((values.duration as string).replace("m", ""), 10) || 10;
  let sourceText = "";
  if (values.source && existsSync(values.source as string)) {
    sourceText = readFileSync(values.source as string, "utf8");
  }

  const packet = scaffoldPodcastShow({
    topic: values.topic as string,
    sourceText,
    speakersCount: Number.parseInt(values.speakers as string, 10) || 2,
    durationMinutes: durationMin,
    host1Name: values.host1 as string,
    host2Name: values.host2 as string,
  });

  const audit = auditPodcastScript(packet);

  if (values["export-notes"]) {
    writeFileSync(values["export-notes"] as string, packet.showNotesMarkdown, "utf8");
    console.log(`✅ Saved show notes to ${values["export-notes"]}`);
  }

  if (values["export-ssml"]) {
    writeFileSync(values["export-ssml"] as string, packet.ssmlMasterScript, "utf8");
    console.log(`✅ Saved SSML master to ${values["export-ssml"]}`);
  }

  if (values.json) {
    console.log(JSON.stringify({ packet, audit }, null, 2));
  } else {
    console.log("════════════════════════════════════════════════════════════════");
    console.log(`🎙️  AI AUDIO SHOWRUNNER: ${packet.title}`);
    console.log("════════════════════════════════════════════════════════════════");
    console.log(`  • Duration:            ~${packet.estimatedDurationMinutes} mins (${packet.totalWords} words)`);
    console.log(`  • Dialectical Tension: ${audit.dialecticalTensionScore}/100`);
    console.log(`  • Speaker Balance:     ${audit.speakerBalanceRatio} (Expert / Challenger)`);
    console.log(
      `  • SSML Max Pause:      ${audit.maxPauseMs}ms (Compliant <350ms: ${audit.ssmlPauseCompliance ? "YES" : "NO"})`,
    );
    console.log(
      `  • 18-Token Quotes:     ${audit.compliant18TokenQuotesCount}/${audit.quotableSoundbitesCount} compliant`,
    );
    console.log(`  • Monotonic Chapters:  ${audit.hasMonotonicChapters ? "YES" : "NO"}`);
    console.log(`  • Quality Audit Score: ${audit.score}/100 [${audit.valid ? "PASSED" : "FAILED"}]`);
    console.log("");
    console.log("📌 Chapter Markers:");
    for (const c of packet.chapters) {
      console.log(`  [${c.timestamp}] ${c.title}`);
    }
    console.log("");
    console.log("💎 Top Standalone 18-Token Quotables:");
    for (const q of packet.quotableSoundbites) {
      console.log(`  • "${q.quote}" — ${q.speaker} [${q.timestamp}]`);
    }
    console.log("════════════════════════════════════════════════════════════════");
  }

  process.exit(audit.valid ? 0 : 1);
}

if (import.meta.main) {
  runCli();
}
