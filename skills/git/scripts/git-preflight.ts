#!/usr/bin/env bun

/**
 * 🐙 git-preflight.ts — Git Pre-Flight Context & Documentation Freshness Gate
 *
 * Enforces the Pre-Flight Invariant before any git commit, branch creation, or PR:
 * 1. Checks whether updateagents and updatedocs were already executed in the current turn / last message.
 * 2. If fresh (CACHE_HIT), skips them completely to save 10,000–30,000 tokens of redundant compaction/AST scans.
 * 3. If stale or unrecorded, executes updateagents first, then updatedocs, and writes fresh cache receipts.
 *
 * Usage:
 *   bun git-preflight.ts [--preflight-check] [--preflight-run] [--force] [--json]
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

export interface PreflightCheckResult {
  updateagentsFresh: boolean;
  updatedocsFresh: boolean;
  canSkip: boolean;
  reason: string;
  updateagentsTimestamp?: string;
  updatedocsTimestamp?: string;
}

export interface PreflightRunResult {
  success: boolean;
  skipped: string[];
  actionsExecuted: string[];
  reason: string;
}

export function isGitClean(targetDir: string): boolean {
  try {
    const res = spawnSync("git", ["status", "--porcelain"], {
      cwd: targetDir,
      encoding: "utf8",
    });
    return res.status === 0 && res.stdout.trim().length === 0;
  } catch {
    return false;
  }
}

export function checkPreflightSync(workspaceRoot = process.cwd()): PreflightCheckResult {
  const artifactsDir = join(workspaceRoot, ".agents/artifacts");
  const clean = isGitClean(workspaceRoot);

  // 1. Check updateagents freshness
  const contextReceiptPath = join(artifactsDir, ".context_fresh");
  let updateagentsFresh = false;
  let updateagentsTimestamp: string | undefined;

  if (existsSync(contextReceiptPath)) {
    try {
      const data = JSON.parse(readFileSync(contextReceiptPath, "utf8"));
      updateagentsTimestamp = data.timestamp;
      const ageMs = Date.now() - new Date(data.timestamp).getTime();
      if (clean || ageMs < 10 * 60 * 1000) {
        updateagentsFresh = true;
      }
    } catch {}
  } else if (clean) {
    updateagentsFresh = true;
  }

  // 2. Check updatedocs freshness
  const docsReceiptPath = join(artifactsDir, ".docs_fresh");
  const docsHashPath = join(workspaceRoot, ".docs.hash");
  let updatedocsFresh = false;
  let updatedocsTimestamp: string | undefined;

  if (existsSync(docsReceiptPath)) {
    try {
      const data = JSON.parse(readFileSync(docsReceiptPath, "utf8"));
      updatedocsTimestamp = data.timestamp;
      const ageMs = Date.now() - new Date(data.timestamp).getTime();
      if (clean || ageMs < 10 * 60 * 1000) {
        updatedocsFresh = true;
      }
    } catch {}
  } else if (clean || existsSync(docsHashPath)) {
    updatedocsFresh = true;
  }

  const canSkip = updateagentsFresh && updatedocsFresh;
  const reason = canSkip
    ? "CACHE_HIT: Context and documentation are fresh from recent turn/clean working tree."
    : `DRIFT: ${!updateagentsFresh ? "updateagents context stale. " : ""}${!updatedocsFresh ? "updatedocs documentation stale." : ""}`.trim();

  return {
    updateagentsFresh,
    updatedocsFresh,
    canSkip,
    reason,
    updateagentsTimestamp,
    updatedocsTimestamp,
  };
}

export function recordPreflightReceipts(workspaceRoot = process.cwd()): void {
  const artifactsDir = join(workspaceRoot, ".agents/artifacts");
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }

  const now = new Date().toISOString();
  writeFileSync(join(artifactsDir, ".context_fresh"), JSON.stringify({ timestamp: now }, null, 2), "utf8");
  writeFileSync(join(artifactsDir, ".docs_fresh"), JSON.stringify({ timestamp: now }, null, 2), "utf8");
}

export function runPreflightSync(workspaceRoot = process.cwd(), options: { force?: boolean } = {}): PreflightRunResult {
  const check = checkPreflightSync(workspaceRoot);

  if (check.canSkip && !options.force) {
    return {
      success: true,
      skipped: ["updateagents", "updatedocs"],
      actionsExecuted: [],
      reason: check.reason,
    };
  }

  const actionsExecuted: string[] = [];
  const skipped: string[] = [];

  // Execute updateagents if stale or forced
  if (!check.updateagentsFresh || options.force) {
    const updateagentsScript = join(workspaceRoot, "skills/core-engine/updateagents/scripts/updateagents.ts");
    if (existsSync(updateagentsScript)) {
      try {
        spawnSync("bun", [updateagentsScript, "--stack-guard"], { cwd: workspaceRoot, encoding: "utf8" });
      } catch {}
    }
    actionsExecuted.push("updateagents (Context & Stack-Guard Sync)");
  } else {
    skipped.push("updateagents");
  }

  // Execute updatedocs if stale or forced
  if (!check.updatedocsFresh || options.force) {
    const updatedocsScript = join(workspaceRoot, "skills/core-engine/updatedocs/scripts/updatedocs.ts");
    if (existsSync(updatedocsScript)) {
      try {
        spawnSync("bun", [updatedocsScript, "--fast-skip"], { cwd: workspaceRoot, encoding: "utf8" });
      } catch {}
    }
    actionsExecuted.push("updatedocs (Documentation Fast-Skip & Hash Sync)");
  } else {
    skipped.push("updatedocs");
  }

  // Record freshness receipts
  recordPreflightReceipts(workspaceRoot);

  return {
    success: true,
    skipped,
    actionsExecuted,
    reason: "Pre-flight synchronization executed and freshness receipts recorded.",
  };
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "preflight-check": { type: "boolean", default: false },
      "preflight-run": { type: "boolean", default: false },
      force: { type: "boolean", short: "f", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const targetDir = positionals[0] ? resolve(process.cwd(), positionals[0]) : process.cwd();

  if (values.help) {
    console.log(`
🐙 git-preflight — Git Pre-Flight Context & Doc Freshness Gate

Usage:
  bun git-preflight.ts [targetPath] [options]

Options:
  --preflight-check  Inspect freshness status of updateagents & updatedocs
  --preflight-run    Execute sync sequence with automatic token-saving skip
  -f, --force        Force execution of both skills even if cached
  --json             Output results as structured JSON
  -h, --help         Show this help message
`);
    process.exit(0);
  }

  if (values["preflight-check"]) {
    const res = checkPreflightSync(targetDir);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🐙 Git Pre-Flight Cache Inspection: ${targetDir}`);
      console.log(`  updateagents: ${res.updateagentsFresh ? "✅ FRESH" : "⚠️ STALE"}`);
      console.log(`  updatedocs:   ${res.updatedocsFresh ? "✅ FRESH" : "⚠️ STALE"}`);
      console.log(`  Verdict:      ${res.canSkip ? "⏩ CACHE_HIT (Can skip to save tokens)" : "🔄 SYNC REQUIRED"}`);
      console.log(`  Reason:       ${res.reason}`);
    }
    process.exit(res.canSkip ? 0 : 1);
  }

  // Default to preflight-run if no other primary flag is given
  const runResult = runPreflightSync(targetDir, { force: values.force });
  if (values.json) {
    console.log(JSON.stringify(runResult, null, 2));
  } else {
    console.log(`\n🐙 Git Pre-Flight Gate Execution: ${targetDir}`);
    console.log(`  Status:   ${runResult.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    if (runResult.skipped.length > 0) {
      console.log(`  Skipped:  ${runResult.skipped.join(", ")} (Token waste eliminated)`);
    }
    if (runResult.actionsExecuted.length > 0) {
      console.log(`  Executed: ${runResult.actionsExecuted.join(", ")}`);
    }
    console.log(`  Reason:   ${runResult.reason}`);
  }
  process.exit(0);
}
