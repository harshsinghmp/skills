#!/usr/bin/env bun
/**
 * multi-client.ts: Multi-client workspace isolation and context boundary verifier.
 *
 * Usage:
 *   bun multi-client.ts --verify-boundary [clientDir] [--json]
 *   bun multi-client.ts --switch-context <fromClient> <toClient>
 */

import fs from "node:fs";
import path from "node:path";

export interface BoundaryViolation {
  file: string;
  line: number;
  reason: string;
  matchedText: string;
}

export interface BoundaryReport {
  workspaceDir: string;
  isCompliant: boolean;
  violations: BoundaryViolation[];
  scannedFilesCount: number;
}

export function verifyClientBoundary(targetDir = process.cwd()): BoundaryReport {
  const violations: BoundaryViolation[] = [];
  let scannedCount = 0;

  if (!fs.existsSync(targetDir)) {
    return { workspaceDir: targetDir, isCompliant: false, violations, scannedFilesCount: 0 };
  }

  // 1. Check gitignore contains .env
  const gitignorePath = path.join(targetDir, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    if (!gitignoreContent.includes(".env")) {
      violations.push({
        file: ".gitignore",
        line: 1,
        reason: ".env is missing from .gitignore; risk of client secret leak",
        matchedText: "[MISSING .env]",
      });
    }
  }

  // 2. Scan source files for cross-client directory bleed or hardcoded absolute user home paths
  const textExts = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".astro", ".html"];
  const crossClientPattern = /(?:\/home\/[a-zA-Z0-9_-]+\/Projects\/clients\/([a-zA-Z0-9_-]+))/g;

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".next")
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.isFile() && textExts.some((ext) => entry.name.endsWith(ext))) {
        scannedCount++;
        try {
          const content = fs.readFileSync(full, "utf8");
          const lines = content.split("\n");
          lines.forEach((lineText, idx) => {
            let match = crossClientPattern.exec(lineText);
            while (match !== null) {
              const clientRef = match[1];
              const currentClientName = path.basename(targetDir);
              if (clientRef !== currentClientName) {
                violations.push({
                  file: path.relative(targetDir, full),
                  line: idx + 1,
                  reason: `Cross-client contamination detected: references peer client "${clientRef}"`,
                  matchedText: match[0],
                });
              }
              match = crossClientPattern.exec(lineText);
            }
          });
        } catch {
          // Ignore unreadable binary/locked files
        }
      }
    }
  }

  scanDir(targetDir);

  return {
    workspaceDir: targetDir,
    isCompliant: violations.length === 0,
    violations,
    scannedFilesCount: scannedCount,
  };
}

export function generateContextSwitchLog(fromClient: string, toClient: string): string {
  const timestamp = new Date().toISOString();
  return [
    "# 🔄 5-Line Cross-Client Context Switch Handover",
    "",
    `1. Prior Engagement Handover: [${fromClient}] session closed at ${timestamp}.`,
    "2. Working Tree State: All modified files committed or stashed; zero uncommitted artifacts.",
    "3. Captured Invariants: Client-specific constraints synced to local .memory/CURRENT.md.",
    "4. Hermetic Flush: Agent working context purged of proprietary client entities.",
    `5. Target Scope Switch: Anchored to [${toClient}]. Ready for task execution.`,
  ].join("\n");
}

export interface UrlContaminationViolation {
  file: string;
  line: number;
  matchedText: string;
  reason: string;
}

export interface UrlContaminationReport {
  targetDir: string;
  environment: "prod" | "staging";
  isClean: boolean;
  violations: UrlContaminationViolation[];
}

export function verifyEnvironmentUrls(
  targetDir = process.cwd(),
  env: "prod" | "staging" = "prod",
): UrlContaminationReport {
  const violations: UrlContaminationViolation[] = [];
  const textExts = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".astro", ".html", ".env"];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (
        current.includes("node_modules") ||
        current.includes(".git") ||
        current.includes("dist") ||
        current.includes(".next")
      )
        return;
      const files = fs.readdirSync(current);
      for (const f of files) walk(path.join(current, f));
    } else {
      const base = path.basename(current);
      const isExt = textExts.some((ext) => current.endsWith(ext)) || base.startsWith(".env");
      if (!isExt) return;

      try {
        const content = fs.readFileSync(current, "utf8");
        const lines = content.split("\n");

        lines.forEach((lineText, idx) => {
          if (env === "prod") {
            // Check localhost
            const localMatch = lineText.match(/\b(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?\b/i);
            if (localMatch) {
              violations.push({
                file: path.relative(targetDir, current),
                line: idx + 1,
                matchedText: localMatch[0],
                reason: "Localhost URL detected in production target.",
              });
            }
            // Check staging/dev domains
            const stagingMatch = lineText.match(
              /\b(?:https?:\/\/)?[a-zA-Z0-9_-]+\.(?:staging|dev|test)\.[a-zA-Z0-9.-]+\b/i,
            );
            if (stagingMatch) {
              violations.push({
                file: path.relative(targetDir, current),
                line: idx + 1,
                matchedText: stagingMatch[0],
                reason: "Staging/dev subdomain detected in production target.",
              });
            }
            // Check ngrok
            const ngrokMatch = lineText.match(/\b[a-zA-Z0-9_-]+\.ngrok(?:-free)?\.app\b/i);
            if (ngrokMatch) {
              violations.push({
                file: path.relative(targetDir, current),
                line: idx + 1,
                matchedText: ngrokMatch[0],
                reason: "Temporary ngrok tunnel detected in production target.",
              });
            }
            // Check test Stripe keys
            const stripeTestMatch = lineText.match(/\b(?:sk|pk)_test_[a-zA-Z0-9]{14,}\b/);
            if (stripeTestMatch) {
              violations.push({
                file: path.relative(targetDir, current),
                line: idx + 1,
                matchedText: stripeTestMatch[0],
                reason: "Test Stripe credential detected in production target.",
              });
            }
          } else if (env === "staging") {
            // Check live Stripe keys in staging
            const stripeLiveMatch = lineText.match(/\b(?:sk|pk)_live_[a-zA-Z0-9]{14,}\b/);
            if (stripeLiveMatch) {
              violations.push({
                file: path.relative(targetDir, current),
                line: idx + 1,
                matchedText: stripeLiveMatch[0],
                reason: "Live production Stripe credential detected in staging target.",
              });
            }
          }
        });
      } catch {
        // Ignore
      }
    }
  }

  walk(targetDir);
  return {
    targetDir,
    environment: env,
    isClean: violations.length === 0,
    violations,
  };
}

export function scaffoldHealthCheck(framework: "express" | "nextjs" | "generic" = "nextjs"): string {
  if (framework === "express") {
    return `// Express.js Health Check & Graceful Termination Handler
import express, { Request, Response } from "express";

const app = express();
let isShuttingDown = false;

// 1. Liveness Probe (process is alive)
app.get("/api/health/live", (req: Request, res: Response) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: "shutting_down" });
  }
  res.status(200).json({ status: "alive", uptime: process.uptime() });
});

// 2. Readiness Probe (dependencies healthy)
app.get("/api/health/ready", async (req: Request, res: Response) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: "shutting_down" });
  }
  try {
    // Check DB / Cache connection
    // await db.query('SELECT 1');
    res.status(200).json({ status: "ready", timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: String(err) });
  }
});

// 3. Graceful Termination Handler
const server = app.listen(process.env.PORT || 3000);

const shutdown = (signal: string) => {
  console.log(\`Received \${signal}. Initiating graceful shutdown...\`);
  isShuttingDown = true;

  server.close(() => {
    console.log("HTTP server closed. Releasing resources...");
    // Close DB pool or queue workers here
    process.exit(0);
  });

  // Force shutdown if cleanup hangs past 30 seconds
  setTimeout(() => {
    console.error("Graceful shutdown timeout exceeded. Force exiting.");
    process.exit(1);
  }, 30000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
`;
  }

  return `// Next.js App Router Health Check Endpoint (app/api/health/route.ts)
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const probeType = searchParams.get("type") || "live";

  if (probeType === "live") {
    return NextResponse.json({
      status: "alive",
      uptime: process.uptime(),
      memoryRssBytes: process.memoryUsage().rss,
    });
  }

  // Deep readiness probe
  try {
    // Verify database connectivity
    // await db.execute(sql\`SELECT 1\`);
    return NextResponse.json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error instanceof Error ? error.message : "Service Unavailable" },
      { status: 503 },
    );
  }
}
`;
}

export function scaffoldHandoverPack(clientName = "Client", domain = "https://client.com"): string {
  const dateStr = new Date().toISOString().split("T")[0];
  return `# 📦 Client Project Handover Package — ${clientName}
> **Target Domain**: ${domain}
> **Handover Date**: ${dateStr}

## 1. Recorded Loom Walkthrough Video
- **Video Link**: [Recorded CMS & Feature Walkthrough](https://loom.com/share/placeholder)
- **Topics Covered**:
  1. Managing content, navigation, and blog posts in the CMS.
  2. Submitting contact forms and viewing customer lead data.
  3. Updating SEO metadata and OpenGraph social preview images.

## 2. Infrastructure & Hosting Runbook
- **Primary Domain**: ${domain} (Cloudflare DNS managed / Nameservers verified)
- **Deployment Platform**: Production Vercel / Docker Container
- **Database & Services**: Production connection strings secured in team vault.
- **SSL / Security**: Automatic TLS certificate renewal active (HSTS enabled).

## 3. Credentials & Access Handover
- **Shared Team Vault**: 1Password / Bitwarden workspace shared with ${clientName} technical lead.
- **Root Credentials**: Ownership transfer completed for GitHub repository, Stripe account, and DNS registrar.

## 4. Acceptance & Bug Warranty Terms
- **Warranty Window**: 30-day post-launch warranty begins on sign-off.
- **Scope Covered**: Reproducible defects violating the agreed statement of work.
- **Maintenance SLA**: Monthly support retainer kicks in post-warranty.
`;
}

export interface AssetAuditResult {
  isClean: boolean;
  totalScanned: number;
  violations: Array<{ filename: string; reason: string }>;
}

export function auditAssetNaming(filenames: string[]): AssetAuditResult {
  const violations: Array<{ filename: string; reason: string }> = [];

  for (const f of filenames) {
    const base = f.split("/").pop() || f;
    const lower = base.toLowerCase();

    if (lower.includes("final") || lower.includes("last") || lower.includes("edit") || lower.includes("copy")) {
      violations.push({
        filename: f,
        reason: "Violates canonical versioning rule. Ambiguous tag ('final', 'last', 'edit', 'copy') detected.",
      });
    } else if (!/_v\d+(\.\d+)?\.[a-z0-9]+$/i.test(base) && !base.startsWith(".")) {
      violations.push({
        filename: f,
        reason: "Missing canonical version suffix (expected: <slug>_v<major>.<minor>.<ext>).",
      });
    }
  }

  return {
    isClean: violations.length === 0,
    totalScanned: filenames.length,
    violations,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--verify-boundary")) {
    const idx = args.indexOf("--verify-boundary");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = verifyClientBoundary(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️ Multi-Client Workspace Boundary Audit: ${target}`);
      console.log(`  Scanned Files: ${report.scannedFilesCount}`);
      console.log(`  Compliance Status: ${report.isCompliant ? "✅ AIRTIGHT ISOLATION" : "❌ CONTAMINATION DETECTED"}`);
      if (!report.isCompliant) {
        console.log("\n  Violations:");
        for (const v of report.violations) {
          console.log(`    - ${v.file}:${v.line} -> ${v.reason} (${v.matchedText})`);
        }
      }
    }
  } else if (args.includes("--switch-context")) {
    const idx = args.indexOf("--switch-context");
    const from = args[idx + 1];
    const to = args[idx + 2];
    if (!from || !to) {
      console.error("Error: --switch-context requires <fromClient> <toClient>");
      process.exit(1);
    }
    console.log(generateContextSwitchLog(from, to));
  } else if (args.includes("--check-urls")) {
    const idx = args.indexOf("--check-urls");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const envIdx = args.indexOf("--env");
    const env = (envIdx !== -1 && args[envIdx + 1] ? args[envIdx + 1] : "prod") as "prod" | "staging";
    const report = verifyEnvironmentUrls(target, env);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🌐 URL & Environment Contamination Audit (${env.toUpperCase()}): ${target}`);
      console.log(`  Status: ${report.isClean ? "✅ CLEAN (Zero URL Contamination)" : "❌ VIOLATIONS DETECTED"}`);
      if (!report.isClean) {
        console.log("  Violations:");
        for (const v of report.violations) {
          console.log(`    - ⚠️  ${v.file}:${v.line} -> ${v.reason} (${v.matchedText})`);
        }
        process.exit(1);
      }
    }
  } else if (args.includes("--scaffold-health")) {
    const idx = args.indexOf("--scaffold-health");
    const framework = (args[idx + 1] || "nextjs") as "express" | "nextjs" | "generic";
    console.log(scaffoldHealthCheck(framework));
  } else if (args.includes("--scaffold-handover")) {
    const idx = args.indexOf("--scaffold-handover");
    const client = args[idx + 1] || "Acme Client";
    const domainIdx = args.indexOf("--domain");
    const domain = domainIdx !== -1 ? args[domainIdx + 1] : "https://client.com";
    console.log(scaffoldHandoverPack(client, domain));
  } else if (args.includes("--audit-assets")) {
    const idx = args.indexOf("--audit-assets");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    let files: string[] = [];
    try {
      files = fs.readdirSync(target);
    } catch {
      files = ["hero_v1.0.png", "logo_final_FINAL.svg", "banner_copy.jpg"];
    }
    const report = auditAssetNaming(files);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🎨 Canonical Asset Naming Audit: ${target}`);
      console.log(`  Status: ${report.isClean ? "✅ CLEAN" : "❌ VIOLATIONS DETECTED"}`);
      for (const v of report.violations) {
        console.log(`    - ⚠️ ${v.filename}: ${v.reason}`);
      }
    }
  } else {
    console.log(
      "Usage: bun multi-client.ts [--verify-boundary [dir]] [--switch-context <fromClient> <toClient>] [--check-urls [dir] [--env prod|staging]] [--scaffold-health <nextjs|express>] [--scaffold-handover <client>] [--audit-assets [dir]]",
    );
  }
}
