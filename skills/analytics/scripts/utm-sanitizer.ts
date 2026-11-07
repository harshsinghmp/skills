#!/usr/bin/env bun

/**
 * 🏷️ UTM Tag Sanitizer & Campaign URL Builder — analytics:tracking & analytics:attribution
 *
 * Capabilities:
 *   - Canonical UTM campaign link builder enforcing GA4 default channel groupings
 *   - Aggressive UTM sanitizer preventing channel fragmentation (e.g. Email vs email -> (Other))
 *   - PII scrubber (removes accidental emails, passwords, auth tokens from query params)
 *   - Internal link auditor (flags internal links bearing UTMs which corrupt session attribution)
 *
 * Usage:
 *   bun analytics/scripts/utm-sanitizer.ts [options]
 *
 * Examples:
 *   bun analytics/scripts/utm-sanitizer.ts --build --url "https://agency.com/services" --source "LinkedIn" --medium "Organic-Social" --campaign "Q4 Growth"
 *   bun analytics/scripts/utm-sanitizer.ts --sanitize "https://agency.com/page?utm_source=Twitter &utm_medium=Social_Post&email=ceo@client.com"
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export interface SanitizeResult {
  originalUrl: string;
  sanitizedUrl: string;
  cleanUtms: Record<string, string>;
  strippedPii: string[];
  warnings: string[];
}

export interface UtmAuditReport {
  total: number;
  valid: number;
  invalid: number;
  piiLeaks: number;
  internalUtmTraps: number;
  details: Array<{ url: string; issues: string[]; sanitized: string }>;
}

const GA4_STANDARD_MEDIUMS = new Set([
  "cpc",
  "ppc",
  "paidsearch",
  "organic",
  "social",
  "organic-social",
  "paidsocial",
  "email",
  "affiliate",
  "referral",
  "audio",
  "sms",
  "push",
  "display",
  "banner",
]);

export function cleanSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-") // Convert underscores and spaces to hyphens
    .replace(/[^a-z0-9-]/g, "") // Strip invalid characters
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-|-$/g, ""); // Trim edge hyphens
}

export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  const url = new URL(baseUrl);

  const cleanSource = cleanSlug(params.source);
  const cleanMedium = cleanSlug(params.medium);
  const cleanCampaign = cleanSlug(params.campaign);

  if (!cleanSource) throw new Error("utm_source is required");
  if (!cleanMedium) throw new Error("utm_medium is required");
  if (!cleanCampaign) throw new Error("utm_campaign is required");

  url.searchParams.set("utm_source", cleanSource);
  url.searchParams.set("utm_medium", cleanMedium);
  url.searchParams.set("utm_campaign", cleanCampaign);

  if (params.term) {
    const cleanTerm = cleanSlug(params.term);
    if (cleanTerm) url.searchParams.set("utm_term", cleanTerm);
  }

  if (params.content) {
    const cleanContent = cleanSlug(params.content);
    if (cleanContent) url.searchParams.set("utm_content", cleanContent);
  }

  return url.toString();
}

export function sanitizeUtmUrl(rawUrl: string, siteHost?: string): SanitizeResult {
  const warnings: string[] = [];
  const strippedPii: string[] = [];
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    url = new URL(`https://${rawUrl}`);
  }

  // Check for internal UTM link trap
  if (siteHost && (url.host === siteHost || url.host.endsWith(`.${siteHost}`))) {
    warnings.push(
      "Internal UTM Link Trap: Using UTM tags on internal navigation resets the GA4 session and overwrites origin attribution.",
    );
  }

  const cleanUtms: Record<string, string> = {};
  const paramsToKeep: Array<[string, string]> = [];

  for (const [key, value] of url.searchParams.entries()) {
    const lowerKey = key.toLowerCase();

    // 1. Detect and scrub PII query parameters
    const isPiiParam = ["email", "user_email", "mail", "phone", "tel", "token", "auth", "secret"].includes(lowerKey);
    const containsEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value);

    if (isPiiParam || containsEmailPattern) {
      strippedPii.push(`${key}=${value}`);
      warnings.push(
        `PII Scrubber: Removed sensitive parameter '${key}' to prevent privacy violation and analytics pollution.`,
      );
      continue;
    }

    // 2. Canonicalize UTM parameters
    if (lowerKey.startsWith("utm_")) {
      const canonicalSlug = cleanSlug(value);
      cleanUtms[lowerKey] = canonicalSlug;
      paramsToKeep.push([lowerKey, canonicalSlug]);

      if (value !== canonicalSlug) {
        warnings.push(`Case & Format Normalizer: Changed ${key}='${value}' → ${lowerKey}='${canonicalSlug}'.`);
      }

      if (lowerKey === "utm_medium" && !GA4_STANDARD_MEDIUMS.has(canonicalSlug)) {
        warnings.push(
          `Non-Standard Medium: '${canonicalSlug}' is not in GA4 default channel groupings and may land in '(Other)'.`,
        );
      }
    } else {
      paramsToKeep.push([key, value]);
    }
  }

  // Rebuild query search params
  url.search = "";
  for (const [k, v] of paramsToKeep) {
    url.searchParams.append(k, v);
  }

  return {
    originalUrl: rawUrl,
    sanitizedUrl: url.toString(),
    cleanUtms,
    strippedPii,
    warnings,
  };
}

export function auditUtmLinks(links: string[], siteHost?: string): UtmAuditReport {
  let valid = 0;
  let invalid = 0;
  let piiLeaks = 0;
  let internalUtmTraps = 0;
  const details = [];

  for (const link of links) {
    const trimmed = link.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const res = sanitizeUtmUrl(trimmed, siteHost);
    const isInvalid = res.warnings.length > 0;

    if (res.strippedPii.length > 0) piiLeaks++;
    if (res.warnings.some((w) => w.includes("Internal UTM Link Trap"))) internalUtmTraps++;

    if (isInvalid) {
      invalid++;
      details.push({ url: trimmed, issues: res.warnings, sanitized: res.sanitizedUrl });
    } else {
      valid++;
    }
  }

  return {
    total: valid + invalid,
    valid,
    invalid,
    piiLeaks,
    internalUtmTraps,
    details,
  };
}

if (import.meta.main) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      build: { type: "boolean", default: false },
      sanitize: { type: "string" },
      audit: { type: "string" },
      url: { type: "string" },
      source: { type: "string" },
      medium: { type: "string" },
      campaign: { type: "string" },
      term: { type: "string" },
      content: { type: "string" },
      "site-host": { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🏷️ utm-sanitizer.ts — UTM Tag Sanitizer & Campaign Link Builder (analytics)

Usage:
  bun utm-sanitizer.ts [options]

Commands:
  --build                 Build a canonical, clean campaign URL
  --sanitize <url>        Sanitize raw URL, fix casing/formatting, and scrub PII
  --audit <file>          Audit link list or markdown file for malformed UTMs and PII leaks

Options for --build:
  --url <url>             Base destination URL
  --source <source>       utm_source (e.g. google, linkedin, newsletter)
  --medium <medium>       utm_medium (e.g. cpc, email, organic-social)
  --campaign <campaign>   utm_campaign (e.g. spring-promo-2026)
  --term <term>           utm_term (optional keyword/audience)
  --content <content>     utm_content (optional ad variant/button)

General Options:
  --site-host <domain>    Hostname of the site (to detect internal UTM link traps)
  --json                  Output machine-readable JSON
  -h, --help              Show this help message
`);
    process.exit(0);
  }

  if (values.build) {
    if (!values.url || !values.source || !values.medium || !values.campaign) {
      console.error("❌ --build requires --url, --source, --medium, and --campaign");
      process.exit(1);
    }
    try {
      const built = buildUtmUrl(values.url, {
        source: values.source,
        medium: values.medium,
        campaign: values.campaign,
        term: values.term,
        content: values.content,
      });
      if (values.json) {
        console.log(JSON.stringify({ url: built }, null, 2));
      } else {
        console.log(`\n✅ Canonical Campaign URL:`);
        console.log(`  ${built}`);
      }
      process.exit(0);
    } catch (e: unknown) {
      console.error(`❌ Build error: ${String(e)}`);
      process.exit(1);
    }
  }

  if (values.sanitize) {
    const res = sanitizeUtmUrl(values.sanitize, values["site-host"]);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🏷️ UTM Sanitization Result:`);
      console.log(`  Original:  ${res.originalUrl}`);
      console.log(`  Sanitized: ${res.sanitizedUrl}`);
      if (res.warnings.length > 0) {
        console.log(`\n  Warnings (${res.warnings.length}):`);
        for (const w of res.warnings) {
          console.log(`    ⚠️ ${w}`);
        }
      }
    }
    process.exit(0);
  }

  if (values.audit) {
    const p = resolve(process.cwd(), values.audit);
    if (!existsSync(p)) {
      console.error(`❌ File not found: ${p}`);
      process.exit(1);
    }
    const lines = readFileSync(p, "utf8").split("\n");
    const rep = auditUtmLinks(lines, values["site-host"]);
    if (values.json) {
      console.log(JSON.stringify(rep, null, 2));
    } else {
      console.log(`\n📊 UTM Link Audit (${rep.total} URLs):`);
      console.log(`  Valid:             ${rep.valid}`);
      console.log(`  Invalid/Warnings:  ${rep.invalid}`);
      console.log(`  PII Leaks:         ${rep.piiLeaks}`);
      console.log(`  Internal Traps:    ${rep.internalUtmTraps}`);
      if (rep.details.length > 0) {
        console.log(`\n  Issues Found:`);
        for (const d of rep.details.slice(0, 10)) {
          console.log(`    - ${d.url}`);
          for (const iss of d.issues) console.log(`        ${iss}`);
        }
      }
    }
    process.exit(rep.invalid > 0 ? 1 : 0);
  }

  console.log("No command passed. Pass --help for options.");
  process.exit(0);
}
