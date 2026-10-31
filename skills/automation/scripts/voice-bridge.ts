#!/usr/bin/env bun
/**
 * voice-bridge.ts — Conversational Voice Agent & Real-Time Telephony Media Streams Bridge.
 *
 * Implements the 4 Core Voice Invariants:
 * - VOC-001: Sub-600ms Round-Trip Latency Budget & Audio Backchanneling
 * - VOC-002: Mandatory Two-Party Recording Consent & TCPA Fencing (<=5s disclosure)
 * - VOC-003: Resilient Multi-Provider Fallback Adapter (Retell -> Bland -> Sovereign)
 * - VOC-004: Real-Time Sentiment & Frustration Escalation with Warm Transfer (<Dial>)
 *
 * Usage:
 *   bun voice-bridge.ts --test-latency [--stt-ms <ms>] [--llm-ms <ms>] [--tts-ms <ms>] [--json]
 *   bun voice-bridge.ts --audit-telephony --phone <e164> --consent-disclosure <text> [--json]
 *   bun voice-bridge.ts --simulate-failover [--simulate-failure] [--json]
 *   bun voice-bridge.ts --evaluate-sentiment --transcript <text> [--transfer-phone <e164>] [--json]
 *   bun voice-bridge.ts --scaffold-twiml --stream-url <wss_url> [--consent-disclosure <text>]
 */

import { writeFileSync } from "node:fs";

export interface LatencyBudgetReport {
  sttMs: number;
  llmTtftMs: number;
  ttsFirstChunkMs: number;
  networkBufferMs: number;
  totalRttMs: number;
  isBudgetMet: boolean; // VOC-001: <= 600ms
  backchannelRequired: boolean; // TTFT > 400ms
  status: "OPTIMAL" | "ACCEPTABLE" | "LATENCY_BREACH";
  recommendations: string[];
}

export interface TelephonyComplianceReport {
  phoneNumber: string;
  consentNotice: string;
  consentTimingSeconds: number;
  isConsentTimingCompliant: boolean; // VOC-002: <= 5 seconds
  hasTwoPartyDisclosure: boolean;
  tcpaCompliant: boolean;
  dncCheckPassed: boolean;
  status: "PASSED" | "NON_COMPLIANT";
  violations: string[];
}

export interface ProviderFailoverResult {
  primaryProvider: "retell" | "bland" | "sovereign";
  fallbackProvider: "retell" | "bland" | "sovereign";
  activeProvider: string;
  primaryLatencyMs: number;
  failoverTriggered: boolean;
  failoverLatencyMs: number;
  totalHandshakeMs: number;
  isSeamless: boolean; // VOC-003: < 1200ms
  callPreserved: boolean;
}

export interface SentimentEscalationReport {
  transcript: string;
  sentimentScore: number; // -1.0 to +1.0
  frustrationKeywordsDetected: string[];
  warmTransferTriggered: boolean; // VOC-004: score < -0.6 or frustration keywords
  twimlDialPayload?: string;
  transferTargetNumber?: string;
  reason: string;
}

/**
 * VOC-001: Sub-600ms Round-Trip Conversational Latency Budget & Backchannel Gate.
 * Total RTT = STT (<=150ms) + LLM TTFT (<=250ms) + TTS First Chunk (<=150ms) + Network (<=50ms).
 */
export function calculateLatencyBudget(
  sttMs = 120,
  llmTtftMs = 220,
  ttsFirstChunkMs = 110,
  networkBufferMs = 40,
): LatencyBudgetReport {
  const totalRttMs = Math.round(sttMs + llmTtftMs + ttsFirstChunkMs + networkBufferMs);
  const isBudgetMet = totalRttMs <= 600;
  const backchannelRequired = llmTtftMs > 400;

  let status: LatencyBudgetReport["status"] = "OPTIMAL";
  if (!isBudgetMet) {
    status = "LATENCY_BREACH";
  } else if (totalRttMs > 450 || backchannelRequired) {
    status = "ACCEPTABLE";
  }

  const recommendations: string[] = [];
  if (sttMs > 150) {
    recommendations.push(
      `STT endpointing latency (${sttMs}ms) exceeds the 150ms budget. Migrate to Deepgram Nova-2 streaming WebSocket.`,
    );
  }
  if (llmTtftMs > 250) {
    recommendations.push(
      `LLM TTFT (${llmTtftMs}ms) exceeds the 250ms budget. Utilize Groq / Cerebras LPUs or quantized speculative decoding.`,
    );
  }
  if (backchannelRequired) {
    recommendations.push(
      `LLM TTFT (${llmTtftMs}ms > 400ms) triggers mandatory audio backchanneling ("Got it...", "One moment...") to mask inference lag.`,
    );
  }
  if (ttsFirstChunkMs > 150) {
    recommendations.push(
      `TTS chunk latency (${ttsFirstChunkMs}ms) exceeds the 150ms budget. Enforce Cartesia Sonic or ElevenLabs Turbo streaming chunks.`,
    );
  }
  if (isBudgetMet && recommendations.length === 0) {
    recommendations.push("Conversational round-trip latency is optimal (<450ms). Natural human cadence certified.");
  }

  return {
    sttMs,
    llmTtftMs,
    ttsFirstChunkMs,
    networkBufferMs,
    totalRttMs,
    isBudgetMet,
    backchannelRequired,
    status,
    recommendations,
  };
}

/**
 * VOC-002: Mandatory Two-Party Consent Disclosure & TCPA Telephony Fencing.
 * Must play explicit recording and AI assistance disclosure within initial 5 seconds.
 */
export function auditTelephonyCompliance(
  phoneNumber: string,
  consentNotice: string,
  consentTimingSeconds = 3,
  dncRegistered = false,
): TelephonyComplianceReport {
  const violations: string[] = [];
  const cleanPhone = phoneNumber.trim();

  // 1. Phone number validation (E.164)
  if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
    violations.push(`Invalid phone format (${phoneNumber}). Must conform to international E.164 (e.g. +18005550199).`);
  }

  // 2. Consent timing verification (VOC-002: <= 5 seconds)
  const isConsentTimingCompliant = consentTimingSeconds <= 5;
  if (!isConsentTimingCompliant) {
    violations.push(
      `Consent disclosure played at ${consentTimingSeconds}s exceeds the 5-second regulatory window (VOC-002).`,
    );
  }

  // 3. Two-party disclosure wording
  const lowerNotice = consentNotice.toLowerCase();
  const hasRecording = lowerNotice.includes("record") || lowerNotice.includes("monitoring");
  const hasAi = lowerNotice.includes("ai") || lowerNotice.includes("automated") || lowerNotice.includes("assistant");
  const hasTwoPartyDisclosure = hasRecording && hasAi;

  if (!hasRecording) {
    violations.push("Missing mandatory recording notice ('recorded' or 'monitored') for two-party consent.");
  }
  if (!hasAi) {
    violations.push("Missing mandatory AI transparency disclosure ('AI' or 'automated assistant').");
  }

  // 4. TCPA & Do Not Call (DNC) check
  const tcpaCompliant = !dncRegistered;
  if (dncRegistered) {
    violations.push(
      "Phone number is flagged on National/Internal Do Not Call (DNC) registry. Outbound dialing prohibited.",
    );
  }

  const status: TelephonyComplianceReport["status"] = violations.length === 0 ? "PASSED" : "NON_COMPLIANT";

  return {
    phoneNumber: cleanPhone,
    consentNotice,
    consentTimingSeconds,
    isConsentTimingCompliant,
    hasTwoPartyDisclosure,
    tcpaCompliant,
    dncCheckPassed: !dncRegistered,
    status,
    violations,
  };
}

/**
 * VOC-003: Resilient Multi-Provider Fallback Adapter.
 * Hot fallback from Retell AI -> Bland AI -> Sovereign Twilio Media Streams within 1200ms.
 */
export function simulateProviderFailover(
  primaryFails = false,
  primaryLatencyMs = 350,
  fallbackLatencyMs = 450,
): ProviderFailoverResult {
  const primaryProvider: ProviderFailoverResult["primaryProvider"] = "retell";
  const fallbackProvider: ProviderFailoverResult["fallbackProvider"] = "bland";

  if (!primaryFails) {
    return {
      primaryProvider,
      fallbackProvider,
      activeProvider: primaryProvider,
      primaryLatencyMs,
      failoverTriggered: false,
      failoverLatencyMs: 0,
      totalHandshakeMs: primaryLatencyMs,
      isSeamless: true,
      callPreserved: true,
    };
  }

  // Primary failed; execute hot failover to secondary adapter
  const failoverTriggered = true;
  const timeoutPenalty = 600; // Handshake timeout before triggering secondary
  const totalHandshakeMs = timeoutPenalty + fallbackLatencyMs;
  const isSeamless = totalHandshakeMs < 1200; // VOC-003: failover under 1,200ms

  return {
    primaryProvider,
    fallbackProvider,
    activeProvider: fallbackProvider,
    primaryLatencyMs,
    failoverTriggered,
    failoverLatencyMs: fallbackLatencyMs,
    totalHandshakeMs,
    isSeamless,
    callPreserved: isSeamless,
  };
}

/**
 * VOC-004: Real-Time Sentiment & Frustration Escalation with Warm Transfer (<Dial>).
 * Detects caller frustration (sentiment < -0.6 or trigger keywords) and generates warm transfer payload.
 */
export function evaluateSentimentAndEscalation(
  transcript: string,
  transferTargetNumber = "+18005550199",
): SentimentEscalationReport {
  const lower = transcript.toLowerCase();
  const frustrationKeywords = [
    "human",
    "operator",
    "agent",
    "representative",
    "supervisor",
    "manager",
    "speak to a person",
    "real person",
    "terrible",
    "awful",
    "useless",
    "hate this",
  ];

  const detectedKeywords: string[] = [];
  for (const kw of frustrationKeywords) {
    if (lower.includes(kw)) {
      detectedKeywords.push(kw);
    }
  }

  // Basic lexicon-based heuristic sentiment evaluation (-1.0 to +1.0)
  let sentiment = 0.1; // neutral baseline
  if (lower.includes("thank") || lower.includes("great") || lower.includes("awesome") || lower.includes("perfect")) {
    sentiment += 0.6;
  }
  if (
    lower.includes("not working") ||
    lower.includes("frustrated") ||
    lower.includes("annoyed") ||
    lower.includes("problem")
  ) {
    sentiment -= 0.5;
  }
  if (
    lower.includes("angry") ||
    lower.includes("demand") ||
    lower.includes("unacceptable") ||
    lower.includes("ridiculous")
  ) {
    sentiment -= 0.8;
  }
  if (detectedKeywords.length > 0) {
    sentiment -= 0.3 * detectedKeywords.length;
  }

  sentiment = Math.max(-1.0, Math.min(1.0, Math.round(sentiment * 100) / 100));
  const warmTransferTriggered = sentiment < -0.6 || detectedKeywords.length > 0;

  let twimlDialPayload: string | undefined;
  let reason = "Sentiment score is within normal operating bounds.";

  if (warmTransferTriggered) {
    reason =
      detectedKeywords.length > 0
        ? `Frustration keywords detected: [${detectedKeywords.join(", ")}]. Initiating immediate warm transfer.`
        : `Caller sentiment (${sentiment}) dropped below -0.6 threshold. Initiating immediate warm transfer.`;

    twimlDialPayload = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      '  <Say voice="Polly.Joanna-Neural">I understand your frustration. Please hold while I transfer you immediately to a senior representative.</Say>',
      `  <Dial timeout="20" action="/api/voice/transfer-status">`,
      `    <Number>${transferTargetNumber}</Number>`,
      "  </Dial>",
      "</Response>",
    ].join("\n");
  }

  return {
    transcript,
    sentimentScore: sentiment,
    frustrationKeywordsDetected: detectedKeywords,
    warmTransferTriggered,
    twimlDialPayload,
    transferTargetNumber: warmTransferTriggered ? transferTargetNumber : undefined,
    reason,
  };
}

/**
 * Scaffolds an production TwiML XML response for Twilio Media Streams integration.
 */
export function scaffoldTwimlMediaStream(
  streamUrl: string,
  consentNotice = "This call is recorded and assisted by an AI voice agent for quality assurance.",
): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<Response>",
    `  <Say voice="Polly.Joanna-Neural">${consentNotice}</Say>`,
    "  <Connect>",
    `    <Stream url="${streamUrl}">`,
    '      <Parameter name="sampleRate" value="8000" />',
    '      <Parameter name="codec" value="audio/x-mulaw" />',
    "    </Stream>",
    "  </Connect>",
    "</Response>",
  ].join("\n");
}

// CLI Execution Interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--test-latency")) {
    const sttIdx = args.indexOf("--stt-ms");
    const llmIdx = args.indexOf("--llm-ms");
    const ttsIdx = args.indexOf("--tts-ms");
    const netIdx = args.indexOf("--net-ms");

    const stt = sttIdx !== -1 ? Number.parseFloat(args[sttIdx + 1]) : 120;
    const llm = llmIdx !== -1 ? Number.parseFloat(args[llmIdx + 1]) : 220;
    const tts = ttsIdx !== -1 ? Number.parseFloat(args[ttsIdx + 1]) : 110;
    const net = netIdx !== -1 ? Number.parseFloat(args[netIdx + 1]) : 40;

    const rep = calculateLatencyBudget(stt, llm, tts, net);
    if (isJson) {
      console.log(JSON.stringify(rep, null, 2));
    } else {
      console.log("\n⚡ Conversational Voice Latency Budget (VOC-001):");
      console.log(`  STT Endpointing:   ${rep.sttMs}ms`);
      console.log(`  LLM TTFT:          ${rep.llmTtftMs}ms`);
      console.log(`  TTS First Chunk:   ${rep.ttsFirstChunkMs}ms`);
      console.log(`  Network Buffer:    ${rep.networkBufferMs}ms`);
      console.log(`  Total RTT:         ${rep.totalRttMs}ms [${rep.status}]`);
      console.log(`  Budget Met:        ${rep.isBudgetMet ? "YES (<=600ms)" : "FAIL (>600ms)"}`);
      console.log(`  Backchannel Gate:  ${rep.backchannelRequired ? "TRIGGERED (TTFT > 400ms)" : "NOT REQUIRED"}`);
      for (const rec of rep.recommendations) console.log(`  💡 ${rec}`);
    }
  } else if (args.includes("--audit-telephony")) {
    const phoneIdx = args.indexOf("--phone");
    const noticeIdx = args.indexOf("--consent-disclosure");
    const timeIdx = args.indexOf("--timing");
    const dnc = args.includes("--dnc");

    const phone = phoneIdx !== -1 ? args[phoneIdx + 1] : "+18005550199";
    const notice =
      noticeIdx !== -1
        ? args[noticeIdx + 1]
        : "Hi, thanks for calling Acme. This call is recorded and assisted by an AI agent for quality assurance.";
    const timing = timeIdx !== -1 ? Number.parseFloat(args[timeIdx + 1]) : 3;

    const rep = auditTelephonyCompliance(phone, notice, timing, dnc);
    if (isJson) {
      console.log(JSON.stringify(rep, null, 2));
    } else {
      console.log("\n🛡️ Telephony Compliance & TCPA Audit (VOC-002):");
      console.log(`  Phone Number:    ${rep.phoneNumber}`);
      console.log(
        `  Consent Timing:  ${rep.consentTimingSeconds}s [${rep.isConsentTimingCompliant ? "COMPLIANT <=5s" : "FAIL >5s"}]`,
      );
      console.log(`  Two-Party Notice:${rep.hasTwoPartyDisclosure ? "PRESENT" : "MISSING"}`);
      console.log(`  DNC Status:      ${rep.dncCheckPassed ? "CLEAN" : "FLAGGED ON DNC"}`);
      console.log(`  Overall Status:  ${rep.status}`);
      if (rep.violations.length > 0) {
        console.log("  Violations:");
        for (const v of rep.violations) console.log(`    ❌ ${v}`);
      }
    }
  } else if (args.includes("--simulate-failover")) {
    const primaryFails = args.includes("--simulate-failure");
    const rep = simulateProviderFailover(primaryFails);
    if (isJson) {
      console.log(JSON.stringify(rep, null, 2));
    } else {
      console.log("\n🔄 Multi-Provider Voice Fallback Engine (VOC-003):");
      console.log(`  Primary Provider:  ${rep.primaryProvider}`);
      console.log(`  Fallback Provider: ${rep.fallbackProvider}`);
      console.log(`  Active Provider:   ${rep.activeProvider}`);
      console.log(`  Failover Occurred: ${rep.failoverTriggered ? "YES" : "NO"}`);
      console.log(`  Total Handshake:   ${rep.totalHandshakeMs}ms`);
      console.log(`  Call Preserved:    ${rep.callPreserved ? "YES (Seamless <1200ms)" : "NO (Dropped)"}`);
    }
  } else if (args.includes("--evaluate-sentiment")) {
    const textIdx = args.indexOf("--transcript");
    const phoneIdx = args.indexOf("--transfer-phone");
    const text = textIdx !== -1 ? args[textIdx + 1] : "I want to speak with a human representative right now!";
    const transferPhone = phoneIdx !== -1 ? args[phoneIdx + 1] : "+18005550199";

    const rep = evaluateSentimentAndEscalation(text, transferPhone);
    if (isJson) {
      console.log(JSON.stringify(rep, null, 2));
    } else {
      console.log("\n🚨 Real-Time Sentiment & Warm-Transfer Engine (VOC-004):");
      console.log(`  Transcript:        "${rep.transcript}"`);
      console.log(`  Sentiment Score:   ${rep.sentimentScore}`);
      console.log(`  Keywords Detected: [${rep.frustrationKeywordsDetected.join(", ")}]`);
      console.log(`  Warm Transfer:     ${rep.warmTransferTriggered ? "TRIGGERED" : "OFF"}`);
      console.log(`  Reason:            ${rep.reason}`);
      if (rep.twimlDialPayload) {
        console.log("\n  Generated TwiML <Dial> Transfer Payload:");
        console.log(rep.twimlDialPayload);
      }
    }
  } else if (args.includes("--scaffold-twiml")) {
    const urlIdx = args.indexOf("--stream-url");
    const noticeIdx = args.indexOf("--consent-disclosure");
    const outIdx = args.indexOf("--out");

    const streamUrl = urlIdx !== -1 ? args[urlIdx + 1] : "wss://voice.agency.internal/media-stream";
    const notice = noticeIdx !== -1 ? args[noticeIdx + 1] : undefined;

    const twiml = scaffoldTwimlMediaStream(streamUrl, notice);
    if (outIdx !== -1) {
      writeFileSync(args[outIdx + 1], twiml, "utf8");
      console.log(`✅ TwiML scaffolded to ${args[outIdx + 1]}`);
    } else {
      console.log(twiml);
    }
  } else {
    console.log(
      "Usage: bun voice-bridge.ts [--test-latency|--audit-telephony|--simulate-failover|--evaluate-sentiment|--scaffold-twiml] [--json]",
    );
  }
}
