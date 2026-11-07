#!/usr/bin/env bun
/**
 * 🛡️ boundary-audit.ts — Subagent Tenant Boundary & Worktree Isolation Auditor
 *
 * Verifies subagent isolation and sandboxing rules across agency workspaces:
 *   1. Symlink & Traversal Fence: Confirms zero symlinks escape the repository root.
 *   2. File Permission Fence: Audits private keys (chmod <= 600) and environment files (no execute bit).
 *   3. Shared Worktree Leases: Detects colliding leases and stale heartbeats (> 30 min).
 *   4. Process Argv Hygiene: Audits command execution invocations for exposed tokens.
 *   5. Tenant Boundary Isolation: Blocks path traversal escapes across multi-client directories.
 *
 * Usage:
 *   bun skills/quality-review/muse-security/scripts/boundary-audit.ts [options]
 *   bun skills/quality-review/muse-security/scripts/boundary-audit.ts --path ./workspace
 *   bun skills/quality-review/muse-security/scripts/boundary-audit.ts --json
 */

import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

export type BoundarySeverity = "critical" | "warning" | "info";

export interface BoundaryIssue {
  id: string;
  category: "symlink" | "permission" | "worktree" | "process" | "tenant";
  severity: BoundarySeverity;
  target: string;
  rule: string;
  message: string;
  remediation: string;
  metadata?: Record<string, unknown>;
}

export interface BoundaryAuditResult {
  rootPath: string;
  timestamp: string;
  clean: boolean;
  issues: BoundaryIssue[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    totalChecked: number;
  };
}

export interface WorktreeLease {
  holder: string;
  branch: string;
  worktreePath: string;
  acquiredAt: string;
  lastHeartbeat: string;
}

const IGNORED_DIRS = new Set([".git", "node_modules", "dist", ".cache", ".turbo"]);

const SENSITIVE_KEY_EXTENSIONS = [".pem", ".key", ".pfx", ".p12"];
const SENSITIVE_KEY_FILENAMES = ["id_rsa", "id_ed25519", "id_ecdsa", "id_dsa"];

/**
 * Check if a path resolves safely within the authorized root workspace.
 */
export function isWithinBoundary(targetPath: string, rootPath: string): boolean {
  try {
    const resolvedRoot = realpathSync(resolve(rootPath));
    const resolvedTarget = realpathSync(resolve(targetPath));
    const rel = relative(resolvedRoot, resolvedTarget);
    return !rel.startsWith("..") && !isAbsolute(rel);
  } catch {
    return false;
  }
}

/**
 * Recursively audit symlinks to ensure none escape the workspace root.
 */
export function auditSymlinks(rootPath: string): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const resolvedRoot = realpathSync(resolve(rootPath));

  function walk(currentDir: string) {
    if (!existsSync(currentDir)) return;

    let entries: string[] = [];
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;

      const fullPath = join(currentDir, entry);
      let lstat: ReturnType<typeof lstatSync>;
      try {
        lstat = lstatSync(fullPath);
      } catch {
        continue;
      }

      if (lstat.isSymbolicLink()) {
        try {
          const target = realpathSync(fullPath);
          const rel = relative(resolvedRoot, target);
          if (rel.startsWith("..") || isAbsolute(rel)) {
            issues.push({
              id: "BND-001",
              category: "symlink",
              severity: "critical",
              target: relative(resolvedRoot, fullPath),
              rule: "Symlink Workspace Escape",
              message: `Symlink '${entry}' points to target outside workspace root: '${target}'`,
              remediation: "Remove the escaping symlink or replace it with a contained local file/directory.",
              metadata: { target, resolvedRoot },
            });
          }
        } catch {
          issues.push({
            id: "BND-001",
            category: "symlink",
            severity: "critical",
            target: relative(resolvedRoot, fullPath),
            rule: "Broken or Dangling Symlink",
            message: `Symlink '${entry}' fails to resolve to a valid path.`,
            remediation: "Remove or repair the dangling symlink.",
          });
        }
      } else if (lstat.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(resolvedRoot);
  return issues;
}

/**
 * Audits filesystem permissions for private keys and environment files.
 */
export function auditPermissions(rootPath: string): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const resolvedRoot = realpathSync(resolve(rootPath));

  function walk(currentDir: string) {
    if (!existsSync(currentDir)) return;

    let entries: string[] = [];
    try {
      entries = readdirSync(currentDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;

      const fullPath = join(currentDir, entry);
      let stat: ReturnType<typeof lstatSync>;
      try {
        stat = lstatSync(fullPath);
      } catch {
        continue;
      }

      // Never follow symlinks while scanning permissions: the symlink audit
      // reports escapes separately, and following a link can walk outside the
      // workspace (a link to /tmp turns a fast audit into a full-disk scan).
      if (stat.isSymbolicLink()) continue;

      if (stat.isFile()) {
        const mode = stat.mode & 0o777;
        const lowerName = entry.toLowerCase();

        // 1. Private Key Permissions Check (must be <= 0600)
        const isPrivateKey =
          SENSITIVE_KEY_EXTENSIONS.some((ext) => lowerName.endsWith(ext)) ||
          SENSITIVE_KEY_FILENAMES.includes(lowerName);

        if (isPrivateKey) {
          const isGroupReadable = (mode & 0o040) !== 0;
          const isWorldReadable = (mode & 0o004) !== 0;

          if (isGroupReadable || isWorldReadable) {
            issues.push({
              id: "BND-003",
              category: "permission",
              severity: "critical",
              target: relative(resolvedRoot, fullPath),
              rule: "Insecure Private Key File Permissions",
              message: `Private key has overly permissive file mode 0${mode.toString(8)} (group/world readable).`,
              remediation: `Run 'chmod 600 ${relative(resolvedRoot, fullPath)}' to restrict access strictly to file owner.`,
              metadata: { mode: `0${mode.toString(8)}` },
            });
          }
        }

        // 2. Environment File Check (.env should never be executable)
        if (lowerName === ".env" || lowerName.startsWith(".env.")) {
          const isExecutable = (mode & 0o111) !== 0;
          if (isExecutable) {
            issues.push({
              id: "BND-004",
              category: "permission",
              severity: "warning",
              target: relative(resolvedRoot, fullPath),
              rule: "Executable Environment Configuration",
              message: `Environment configuration has execute permissions: 0${mode.toString(8)}.`,
              remediation: `Run 'chmod -x ${relative(resolvedRoot, fullPath)}' to strip executable bits.`,
              metadata: { mode: `0${mode.toString(8)}` },
            });
          }

          const isWorldReadable = (mode & 0o004) !== 0;
          if (isWorldReadable) {
            issues.push({
              id: "BND-004",
              category: "permission",
              severity: "warning",
              target: relative(resolvedRoot, fullPath),
              rule: "World-Readable Environment File",
              message: `Environment file is readable by all system users: 0${mode.toString(8)}.`,
              remediation: `Run 'chmod 600 ${relative(resolvedRoot, fullPath)}' or 'chmod 640' to restrict access.`,
              metadata: { mode: `0${mode.toString(8)}` },
            });
          }
        }
      } else if (stat.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(resolvedRoot);
  return issues;
}

/**
 * Audits shared git worktree leases for state collisions and stale heartbeats.
 */
export function auditWorktreeLeases(rootPath: string): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const leasesDir = join(rootPath, ".agents", "worktree-leases");
  if (!existsSync(leasesDir)) return issues;

  const now = Date.now();
  const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
  const activeBranchLeases: Record<string, WorktreeLease[]> = {};

  let files: string[] = [];
  try {
    files = readdirSync(leasesDir).filter((f) => f.endsWith(".json"));
  } catch {
    return issues;
  }

  for (const file of files) {
    const filePath = join(leasesDir, file);
    try {
      const content = readFileSync(filePath, "utf8");
      const lease: WorktreeLease = JSON.parse(content);

      if (!lease.branch || !lease.lastHeartbeat) continue;

      const heartbeatTime = new Date(lease.lastHeartbeat).getTime();
      const ageMs = now - heartbeatTime;

      if (ageMs > STALE_THRESHOLD_MS) {
        issues.push({
          id: "BND-002",
          category: "worktree",
          severity: "warning",
          target: file,
          rule: "Stale Worktree Lease",
          message: `Worktree lease held by '${lease.holder}' on branch '${lease.branch}' has stale heartbeat (${Math.round(ageMs / 60000)}m ago).`,
          remediation: `Release expired lease with 'bun coupling-router/scripts/worktree-lease.ts release --branch ${lease.branch}' or reclaim.`,
          metadata: { ageMinutes: Math.round(ageMs / 60000), lease },
        });
      } else {
        if (!activeBranchLeases[lease.branch]) {
          activeBranchLeases[lease.branch] = [];
        }
        activeBranchLeases[lease.branch].push(lease);
      }
    } catch {
      // Ignore unparseable lease file
    }
  }

  // Detect concurrent collisions on the same branch
  for (const [branch, leases] of Object.entries(activeBranchLeases)) {
    if (leases.length > 1) {
      issues.push({
        id: "BND-002",
        category: "worktree",
        severity: "critical",
        target: branch,
        rule: "Conflicting Concurrent Worktree Lease",
        message: `Branch '${branch}' has ${leases.length} active conflicting subagent leases: ${leases.map((l) => l.holder).join(", ")}.`,
        remediation: "Ensure only one subagent writes to a branch at any given time. Release conflicting leases.",
        metadata: { holders: leases.map((l) => l.holder) },
      });
    }
  }

  return issues;
}

/**
 * Scans subagent process command strings or arguments for leaked credentials.
 */
export function auditProcessArgv(commandOrArgs: string | string[]): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const text = Array.isArray(commandOrArgs) ? commandOrArgs.join(" ") : commandOrArgs;

  // Pattern detection for credentials in command argv
  const patterns: Array<{ regex: RegExp; name: string }> = [
    { regex: /(?:sk-[a-zA-Z0-9_-]{20,})/i, name: "API Secret Key" },
    { regex: /(?:ghp_[a-zA-Z0-9]{36})/i, name: "GitHub Personal Access Token" },
    { regex: /(?:postgres|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@/i, name: "Database URL with Password" },
    { regex: /--token=['"]?[a-zA-Z0-9_-]{20,}['"]?/i, name: "CLI Token Flag" },
    { regex: /--password=['"]?[^'"\s]{6,}['"]?/i, name: "CLI Password Flag" },
  ];

  for (const p of patterns) {
    if (p.regex.test(text)) {
      issues.push({
        id: "BND-005",
        category: "process",
        severity: "critical",
        target: text.slice(0, 80) + (text.length > 80 ? "..." : ""),
        rule: "Credential Exposed in Process Argv",
        message: `Command invocation leaks ${p.name} directly in process argument list.`,
        remediation:
          "Pass credentials via environment variables (e.g. process.env.API_KEY) instead of command-line flags.",
        metadata: { detector: p.name },
      });
    }
  }

  return issues;
}

/**
 * Audits workspace path parameter to prevent cross-client directory traversal.
 */
export function auditTenantBoundary(workspaceRoot: string, targetPath: string): BoundaryIssue[] {
  const issues: BoundaryIssue[] = [];
  const normalizedRoot = normalize(resolve(workspaceRoot));
  const normalizedTarget = normalize(resolve(targetPath));

  const rel = relative(normalizedRoot, normalizedTarget);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    issues.push({
      id: "BND-006",
      category: "tenant",
      severity: "critical",
      target: targetPath,
      rule: "Cross-Tenant Directory Traversal",
      message: `Subagent target path '${targetPath}' escapes workspace root '${workspaceRoot}'.`,
      remediation: "Restrict subagent filesystem operations strictly within the client's assigned workspace boundary.",
      metadata: { normalizedRoot, normalizedTarget },
    });
  }

  return issues;
}

/**
 * Runs full subagent boundary audit suite on a directory.
 */
export function runBoundaryAudit(rootPath: string): BoundaryAuditResult {
  const resolvedRoot = resolve(rootPath);
  const issues: BoundaryIssue[] = [];

  // 1. Symlink audit
  issues.push(...auditSymlinks(resolvedRoot));

  // 2. Permission audit
  issues.push(...auditPermissions(resolvedRoot));

  // 3. Worktree lease audit
  issues.push(...auditWorktreeLeases(resolvedRoot));

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  return {
    rootPath: resolvedRoot,
    timestamp: new Date().toISOString(),
    clean: criticalCount === 0,
    issues,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
      totalChecked: issues.length,
    },
  };
}

/**
 * Formats boundary audit result into human-readable terminal markdown.
 */
export function formatBoundaryReport(result: BoundaryAuditResult): string {
  const lines: string[] = [];

  lines.push("\n======================================================================");
  lines.push(" 🛡️  MUSE SUBAGENT TENANT BOUNDARY & WORKTREE ISOLATION AUDITOR");
  lines.push("======================================================================");
  lines.push(`📁 Workspace Root: ${result.rootPath}`);
  lines.push(`🕒 Timestamp:      ${result.timestamp}`);
  lines.push(
    `📊 Summary:        ${result.summary.criticalCount} Critical | ${result.summary.warningCount} Warning | ${result.summary.infoCount} Info`,
  );

  if (result.issues.length === 0) {
    lines.push("\n✅ All subagent boundary invariants verified! Zero symlink escapes or permission leaks.");
  } else {
    for (const issue of result.issues) {
      const badge =
        issue.severity === "critical" ? "🔴 [CRITICAL]" : issue.severity === "warning" ? "🟡 [WARNING]" : "ℹ️ [INFO]";
      lines.push(`\n${badge} [${issue.id}] ${issue.rule}`);
      lines.push(`   Target:      ${issue.target}`);
      lines.push(`   Category:    ${issue.category}`);
      lines.push(`   Problem:     ${issue.message}`);
      lines.push(`   💡 Fix:      ${issue.remediation}`);
    }
  }

  lines.push("\n======================================================================");
  if (result.summary.criticalCount > 0) {
    lines.push(`❌ Boundary Audit Failed: ${result.summary.criticalCount} critical isolation violation(s) found!`);
  } else if (result.summary.warningCount > 0) {
    lines.push(`⚠️ Boundary Audit Passed with ${result.summary.warningCount} warning(s). Review recommended.`);
  } else {
    lines.push("✅ Workspace boundary fully hardened for autonomous subagent execution.");
  }
  lines.push("======================================================================\n");

  return lines.join("\n");
}

export async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      path: { type: "string", short: "p", default: "." },
      json: { type: "boolean", default: false },
      "fail-on-critical": { type: "boolean", default: true },
      "no-fail-on-critical": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const failOnCritical = !values["no-fail-on-critical"] && values["fail-on-critical"];

  if (values.help) {
    console.log(`
🛡️ boundary-audit.ts — Subagent Tenant Boundary & Worktree Isolation Auditor

Usage:
  bun boundary-audit.ts [options]

Options:
  -p, --path <dir>       Path to workspace root to audit (default: ".")
  --json                 Output machine-readable JSON format
  --fail-on-critical     Exit code 1 if critical violations found (default: true)
  -h, --help             Display this help message
    `);
    process.exit(0);
  }

  const targetPath = positionals[0] ?? values.path;
  const result = runBoundaryAudit(targetPath);

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.criticalCount > 0 && failOnCritical ? 1 : 0);
  }

  const report = formatBoundaryReport(result);
  console.log(report);

  if (result.summary.criticalCount > 0 && failOnCritical) {
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("BoundaryAudit error:", err);
    process.exit(1);
  });
}
