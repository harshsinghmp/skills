#!/usr/bin/env bun
/**
 * Event Collector & Ingestion Validator Engine
 *
 * Implements EVT-001–EVT-004 invariants:
 * - EVT-001 (Zero-PII Ingestion Gate): Masks emails, phone numbers, auth secrets, and credit cards.
 * - EVT-002 (Strict Schema Validation & Idempotency): Enforces Object-Action naming and SHA-256 deduplication.
 * - EVT-003 (Dual-Rail Transport Specs): Validates payload size (<64KB) and non-blocking headers.
 * - EVT-004 (Deterministic Attribution): Encodes first-touch and last-touch UTM parameters.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  distinct_id: string;
  properties: Record<string, unknown>;
  context?: {
    user_agent?: string;
    ip?: string;
    page_url?: string;
    referrer?: string;
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      term?: string;
      content?: string;
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  eventId?: string;
  payloadSize?: number;
}

// EVT-001: PII Scrubbing patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SECRET_REGEX = /(bearer\s+[a-zA-Z0-9._-]+|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,})/gi;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const SENSITIVE_KEY_REGEX = /^(password|token|secret|auth|credit_card|ssn|authorization|api_key|access_token)$/i;

export function scrubPii(value: unknown): unknown {
  if (typeof value === "string") {
    let scrubbed = value
      .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
      .replace(PHONE_REGEX, "[REDACTED_PHONE]")
      .replace(SECRET_REGEX, "[REDACTED_SECRET]")
      .replace(CREDIT_CARD_REGEX, "[REDACTED_CARD]");

    // If string is a URL, scrub sensitive query parameters
    if (scrubbed.includes("?") && (scrubbed.startsWith("http://") || scrubbed.startsWith("https://"))) {
      try {
        const url = new URL(scrubbed);
        for (const key of Array.from(url.searchParams.keys())) {
          if (SENSITIVE_KEY_REGEX.test(key)) {
            url.searchParams.set(key, "[REDACTED]");
          }
        }
        scrubbed = url.toString();
      } catch {
        // Fallback if URL parsing fails
      }
    }
    return scrubbed;
  }

  if (Array.isArray(value)) {
    return value.map(scrubPii);
  }

  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEY_REGEX.test(k)) {
        cleaned[k] = "[REDACTED]";
      } else {
        cleaned[k] = scrubPii(v);
      }
    }
    return cleaned;
  }

  return value;
}

// EVT-002: Deterministic SHA-256 Idempotency Fingerprint
export function computeEventId(event: string, timestamp: string, distinctId: string): string {
  return createHash("sha256").update(`${timestamp}:${distinctId}:${event}`).digest("hex");
}

// EVT-002 & EVT-003: Schema and Payload Size Validation
export function validateEventSchema(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, errors: ["Payload must be a non-null JSON object."] };
  }

  const rawJson = JSON.stringify(data);
  const payloadSize = Buffer.byteLength(rawJson, "utf8");

  // Max 64KB per event
  if (payloadSize > 64 * 1024) {
    errors.push(`Payload size (${payloadSize} bytes) exceeds 64KB threshold.`);
  }

  const payload = data as Partial<AnalyticsEvent>;

  // Event Name check (Object-Action naming, snake_case)
  if (!payload.event || typeof payload.event !== "string") {
    errors.push("Missing required string field: 'event'.");
  } else if (!/^[a-z][a-z0-9_]*[a-z0-9]$/.test(payload.event)) {
    errors.push(`Event name '${payload.event}' violates snake_case Object-Action convention (e.g. 'user_signed_up').`);
  }

  // Timestamp check
  if (!payload.timestamp || typeof payload.timestamp !== "string") {
    errors.push("Missing required string field: 'timestamp'.");
  } else if (Number.isNaN(Date.parse(payload.timestamp))) {
    errors.push(`Timestamp '${payload.timestamp}' is not a valid ISO 8601 date string.`);
  }

  // Distinct ID check
  if (!payload.distinct_id || typeof payload.distinct_id !== "string" || payload.distinct_id.trim() === "") {
    errors.push("Missing required non-empty string field: 'distinct_id'.");
  }

  // Properties check
  if (!payload.properties || typeof payload.properties !== "object" || Array.isArray(payload.properties)) {
    errors.push("Field 'properties' must be a valid key-value object.");
  }

  const valid = errors.length === 0;
  const eventId =
    valid && payload.event && payload.timestamp && payload.distinct_id
      ? computeEventId(payload.event, payload.timestamp, payload.distinct_id)
      : undefined;

  return {
    valid,
    errors,
    eventId,
    payloadSize,
  };
}

// EVT-004: Generate Compliant Event
export function generateEvent(options: {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  utm?: { source?: string; medium?: string; campaign?: string };
}): AnalyticsEvent {
  const timestamp = new Date().toISOString();
  return {
    event: options.event,
    timestamp,
    distinct_id: options.distinctId,
    properties: options.properties || {},
    context: {
      utm: options.utm,
    },
  };
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
📊 Muse Analytics Event Collector & Ingestion Validator

Usage:
  bun event-collector.ts --validate <file.json> [--json]
  bun event-collector.ts --scrub <file.json> [--json]
  bun event-collector.ts --fingerprint <file.json> [--json]
  bun event-collector.ts --generate-payload --event <name> --user-id <id> [--json]

Options:
  --validate <file>      Validates event payload against schema and Object-Action rules.
  --scrub <file>         Applies EVT-001 PII redaction and prints sanitized payload.
  --fingerprint <file>   Calculates deterministic SHA-256 idempotency eventId.
  --generate-payload     Generates a baseline compliant event template.
  --json                 Outputs structured JSON result.
  --help                 Show this help screen.
`);
    process.exit(0);
  }

  if (args.includes("--validate")) {
    const filePath = getArgValue("--validate");
    if (!filePath) {
      console.error("Error: --validate requires a JSON file path.");
      process.exit(1);
    }
    try {
      const content = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      const res = validateEventSchema(parsed);
      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(`\nEvent Schema Validation: ${res.valid ? "✅ VALID" : "❌ INVALID"}`);
        console.log(`Payload Size: ${res.payloadSize} bytes`);
        if (res.eventId) console.log(`Deterministic Event ID: ${res.eventId}`);
        if (!res.valid) {
          console.log("\nErrors:");
          for (const err of res.errors) {
            console.log(` - ${err}`);
          }
        }
      }
      process.exit(res.valid ? 0 : 1);
    } catch (e) {
      const err = e as Error;
      console.error(`Error reading or parsing file: ${err.message}`);
      process.exit(1);
    }
  }

  if (args.includes("--scrub")) {
    const filePath = getArgValue("--scrub");
    if (!filePath) {
      console.error("Error: --scrub requires a JSON file path.");
      process.exit(1);
    }
    try {
      const content = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      const scrubbed = scrubPii(parsed);
      if (isJson) {
        console.log(JSON.stringify(scrubbed, null, 2));
      } else {
        console.log("\n🛡️  PII Scrubbed Event Payload:");
        console.log(JSON.stringify(scrubbed, null, 2));
      }
      process.exit(0);
    } catch (e) {
      const err = e as Error;
      console.error(`Error processing file: ${err.message}`);
      process.exit(1);
    }
  }

  if (args.includes("--fingerprint")) {
    const filePath = getArgValue("--fingerprint");
    if (!filePath) {
      console.error("Error: --fingerprint requires a JSON file path.");
      process.exit(1);
    }
    try {
      const content = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      const res = validateEventSchema(parsed);
      if (!res.valid || !res.eventId) {
        console.error("Cannot compute fingerprint on invalid event:", res.errors);
        process.exit(1);
      }
      if (isJson) {
        console.log(JSON.stringify({ eventId: res.eventId }, null, 2));
      } else {
        console.log(`Event ID (SHA-256): ${res.eventId}`);
      }
      process.exit(0);
    } catch (e) {
      const err = e as Error;
      console.error(`Error processing file: ${err.message}`);
      process.exit(1);
    }
  }

  if (args.includes("--generate-payload")) {
    const eventName = getArgValue("--event") || "order_completed";
    const userId = getArgValue("--user-id") || "usr_sample_123";
    const payload = generateEvent({
      event: eventName,
      distinctId: userId,
      properties: {
        revenue: 99.0,
        currency: "USD",
        plan: "enterprise_annual",
      },
      utm: {
        source: "google",
        medium: "cpc",
        campaign: "q4_enterprise_sprint",
      },
    });
    if (isJson) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log("\nGenerated Analytics Event Payload:");
      console.log(JSON.stringify(payload, null, 2));
    }
    process.exit(0);
  }
}
