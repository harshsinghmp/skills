#!/usr/bin/env bun

/**
 * 🧭 SEO Breadcrumb Schema & Trailing-Slash Normalizer — seo:technical & seo:onpage
 *
 * Capabilities:
 *   - Hierarchical Schema.org BreadcrumbList JSON-LD generator from URL paths
 *   - Trailing-slash policy normalizer (prevents split link equity and duplicate content)
 *   - URL audit suite detecting slash inconsistencies and path duplication
 *
 * Usage:
 *   bun seo/scripts/breadcrumb-schema.ts [options]
 *
 * Examples:
 *   bun seo/scripts/breadcrumb-schema.ts --breadcrumb "https://agency.com/services/web-design/ecommerce/"
 *   bun seo/scripts/breadcrumb-schema.ts --normalize "http://AGENCY.com/services//web-design" --trailing-slash
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

export interface BreadcrumbItem {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
}

export interface NormalizerOptions {
  trailingSlash?: boolean;
  stripQuery?: boolean;
  forceHttps?: boolean;
}

export interface TrailingSlashAuditResult {
  total: number;
  consistent: boolean;
  policy: "always" | "never";
  violations: Array<{ url: string; expected: string; reason: string }>;
}

function titleCase(segment: string): string {
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function normalizeUrl(urlStr: string, options: NormalizerOptions = {}): string {
  const trailingSlash = options.trailingSlash ?? true;
  const stripQuery = options.stripQuery ?? false;
  const forceHttps = options.forceHttps ?? false;

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    // If protocol missing, assume https://
    parsed = new URL(`https://${urlStr}`);
  }

  if (forceHttps && parsed.protocol === "http:") {
    parsed.protocol = "https:";
  }

  parsed.hostname = parsed.hostname.toLowerCase();

  // Deduplicate redundant slashes in pathname
  let cleanPath = parsed.pathname.replace(/\/+/g, "/");

  // Determine if URL ends with a file extension like .html, .xml, .png
  const hasFileExtension = /\.[a-zA-Z0-9]{2,5}$/.test(cleanPath);

  if (!hasFileExtension) {
    if (trailingSlash) {
      if (!cleanPath.endsWith("/")) {
        cleanPath = `${cleanPath}/`;
      }
    } else {
      if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
        cleanPath = cleanPath.slice(0, -1);
      }
    }
  }

  parsed.pathname = cleanPath;

  if (stripQuery) {
    parsed.search = "";
  }

  return parsed.toString();
}

export function generateBreadcrumbJsonLd(
  targetUrl: string,
  options: { homeName?: string; trailingSlash?: boolean } = {},
): BreadcrumbListSchema {
  const trailingSlash = options.trailingSlash ?? true;
  const homeName = options.homeName || "Home";

  const normalized = normalizeUrl(targetUrl, { trailingSlash });
  const parsed = new URL(normalized);

  const segments = parsed.pathname
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  const baseUrl = `${parsed.protocol}//${parsed.host}`;
  const rootItemUrl = trailingSlash ? `${baseUrl}/` : baseUrl;

  const items: BreadcrumbItem[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: homeName,
      item: rootItemUrl,
    },
  ];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentPath += `/${seg}`;
    const segmentUrl = `${baseUrl}${currentPath}${trailingSlash ? "/" : ""}`;
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: titleCase(seg),
      item: segmentUrl,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function auditTrailingSlashes(urls: string[], policy: "always" | "never" = "always"): TrailingSlashAuditResult {
  const violations: Array<{ url: string; expected: string; reason: string }> = [];

  for (const rawUrl of urls) {
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    try {
      const parsed = new URL(trimmed);
      const isFile = /\.[a-zA-Z0-9]{2,5}$/.test(parsed.pathname);
      if (isFile) continue; // Static asset or extension file excluded

      const isRoot = parsed.pathname === "/" || parsed.pathname === "";
      if (isRoot) continue;

      if (policy === "always" && !parsed.pathname.endsWith("/")) {
        const expected = normalizeUrl(trimmed, { trailingSlash: true });
        violations.push({
          url: trimmed,
          expected,
          reason: "Missing mandatory trailing slash on directory URL",
        });
      } else if (policy === "never" && parsed.pathname.endsWith("/")) {
        const expected = normalizeUrl(trimmed, { trailingSlash: false });
        violations.push({
          url: trimmed,
          expected,
          reason: "Forbidden trailing slash detected on directory URL",
        });
      }
    } catch {
      // Skip unparseable URLs
    }
  }

  return {
    total: urls.length,
    consistent: violations.length === 0,
    policy,
    violations,
  };
}

if (import.meta.main) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      breadcrumb: { type: "string" },
      normalize: { type: "string" },
      audit: { type: "string" },
      "home-name": { type: "string", default: "Home" },
      "trailing-slash": { type: "boolean", default: true },
      "no-trailing-slash": { type: "boolean", default: false },
      "strip-query": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🧭 breadcrumb-schema.ts — Breadcrumb JSON-LD & Trailing-Slash Normalizer (seo)

Usage:
  bun breadcrumb-schema.ts [options]

Commands:
  --breadcrumb <url>        Generate Schema.org BreadcrumbList JSON-LD
  --normalize <url>         Normalize URL trailing-slash and protocol
  --audit <file>            Audit URLs from file (sitemap or list) for trailing-slash policy

Options:
  --home-name <text>        Name for root breadcrumb (default: Home)
  --trailing-slash          Enforce trailing slash on directories (default: true)
  --no-trailing-slash       Enforce NO trailing slash on directories
  --strip-query             Strip query parameters during normalization
  --json                    Output machine-readable JSON
  -h, --help                Show this help message
`);
    process.exit(0);
  }

  const enforceTrailingSlash = !values["no-trailing-slash"];

  if (values.breadcrumb) {
    const schema = generateBreadcrumbJsonLd(values.breadcrumb, {
      homeName: values["home-name"],
      trailingSlash: enforceTrailingSlash,
    });
    if (values.json) {
      console.log(JSON.stringify(schema, null, 2));
    } else {
      console.log(`\n🧭 BreadcrumbList JSON-LD for ${values.breadcrumb}:`);
      console.log(`<script type="application/ld+json">`);
      console.log(JSON.stringify(schema, null, 2));
      console.log(`</script>`);
    }
    process.exit(0);
  }

  if (values.normalize) {
    const normalized = normalizeUrl(values.normalize, {
      trailingSlash: enforceTrailingSlash,
      stripQuery: values["strip-query"],
      forceHttps: true,
    });
    if (values.json) {
      console.log(JSON.stringify({ original: values.normalize, normalized }, null, 2));
    } else {
      console.log(`\n🔗 Normalized URL:`);
      console.log(`  Original:   ${values.normalize}`);
      console.log(`  Normalized: ${normalized}`);
    }
    process.exit(0);
  }

  if (values.audit) {
    const filePath = resolve(process.cwd(), values.audit);
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    const lines = readFileSync(filePath, "utf8").split("\n");
    const policy = enforceTrailingSlash ? "always" : "never";
    const res = auditTrailingSlashes(lines, policy);

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🧭 Trailing-Slash Policy Audit (${policy}):`);
      console.log(`  Scanned URLs: ${res.total}`);
      console.log(`  Status:       ${res.consistent ? "✅ 100% CONSISTENT" : "⚠️ POLICY VIOLATIONS FOUND"}`);
      if (res.violations.length > 0) {
        console.log(`  Violations (${res.violations.length}):`);
        for (const v of res.violations.slice(0, 10)) {
          console.log(`    - ${v.url} → Expected: ${v.expected} (${v.reason})`);
        }
        if (res.violations.length > 10) {
          console.log(`    ... and ${res.violations.length - 10} more`);
        }
      }
    }
    process.exit(res.consistent ? 0 : 1);
  }

  console.log("No command passed. Run with --help for available options.");
  process.exit(0);
}
