#!/usr/bin/env bun
/**
 * 🛡️ secret-scan.ts — Sovereign Pre-Ship Secret Scanner Engine for Muse Vibeguard
 *
 * Standalone, autonomous secret scanning engine.
 * Detects OpenAI/Anthropic keys (sk-*), GitHub tokens (ghp_*), Private Keys,
 * Database connection strings, AWS keys, Stripe, Slack, and credentials with
 * native high-precision regex matching and optional TruffleHog integration.
 *
 * Standalone sovereign implementation with zero external harness dependencies.
 *
 * Usage:
 *   bun skills/quality-review/muse-security/scripts/secret-scan.ts [path]
 *   bun run secret-scan [path]
 *   bun run secret-scan . --json
 *   bun run secret-scan . --verbose
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

export interface SecretFinding {
  file: string;
  line: number;
  type: string;
  matchedPattern: string;
  redacted: string;
  severity: "critical" | "high" | "medium";
  remediation: string;
}

export interface ScanResult {
  targetDir: string;
  scanner: "trufflehog" | "native-regex";
  totalFilesScanned: number;
  findings: SecretFinding[];
  clean: boolean;
}

export const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".crush",
  ".opencode",
  ".cache",
  ".turbo",
  ".next",
  "dist",
  "build",
  ".gemini",
  "coverage",
  ".artifacts",
  "pulse-state",
]);

export const BINARY_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".wasm",
  ".tar",
  ".gz",
  ".zip",
  ".7z",
  ".pdf",
  ".lock",
  ".lockb",
  ".pyc",
  ".exe",
  ".bin",
  ".dylib",
  ".so",
  ".db",
  ".sqlite",
  ".sqlite3",
  ".db-shm",
  ".db-wal",
]);

interface PatternDef {
  type: string;
  regex: RegExp;
  severity: "critical" | "high" | "medium";
  remediation: string;
}

export const SECRET_PATTERNS: PatternDef[] = [
  {
    type: "OpenAI / AI Provider Token (sk-*)",
    regex: /\b(sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,})\b/,
    severity: "critical",
    remediation: "Revoke immediately on platform dashboard. Move to environment variable.",
  },
  {
    type: "GitHub Personal Access Token (ghp_*)",
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{30,})\b/,
    severity: "critical",
    remediation: "Revoke at github.com/settings/tokens. Use GitHub Secrets / env vars.",
  },
  {
    type: "GitHub Fine-Grained Token",
    regex: /\b(github_pat_[A-Za-z0-9_]{50,})\b/,
    severity: "critical",
    remediation: "Revoke fine-grained token at github.com/settings/tokens.",
  },
  {
    type: "GitLab Personal Access Token",
    regex: /\b(glpat-[A-Za-z0-9_-]{20,})\b/,
    severity: "critical",
    remediation: "Revoke at gitlab.com/-/user_settings/personal_access_tokens.",
  },
  {
    type: "Private Key (RSA/EC/OpenSSH/PGP)",
    regex: /-----BEGIN\s+(?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE\s+KEY-----/,
    severity: "critical",
    remediation: "Never commit private keys. Remove from git history and re-issue.",
  },
  {
    type: "Database Connection String with Credentials",
    regex:
      /\b(?:postgres|postgresql|mysql|mongodb|mongodb\+srv|redis|mssql):\/\/(?:[a-zA-Z0-9_\-.%]+):(?:[a-zA-Z0-9_\-.!@#$%^&*()+=]+)@(?:[a-zA-Z0-9_\-.]+)(?::\d+)?\/?[^\s"'`<>{}|\\]*/,
    severity: "critical",
    remediation: "Move database connection URL with credentials to .env file (ensure .env is gitignored).",
  },
  {
    type: "AWS Access Key ID",
    regex: /\b(AKIA[0-9A-Z]{16})\b/,
    severity: "high",
    remediation: "Rotate via AWS IAM immediately. Use AWS Secrets Manager or IAM roles.",
  },
  {
    type: "Stripe Live Secret Key",
    regex: /\b(sk_live_[0-9a-zA-Z]{24,})\b/,
    severity: "critical",
    remediation: "Roll key in Stripe dashboard. Use STRIPE_SECRET_KEY in server environment.",
  },
  {
    type: "Slack Token (xox*)",
    regex: /\b(xox[baprs]-[0-9a-zA-Z-]{10,})\b/,
    severity: "high",
    remediation: "Revoke at api.slack.com/apps. Use environment variables.",
  },
];

export function redactSecret(secret: string): string {
  if (secret.length <= 8) return "[REDACTED]";
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-3);
  return `${prefix}...${suffix} [REDACTED]`;
}

export function isPlaceholderCredential(val: string): boolean {
  const upper = val.toUpperCase();
  if (
    upper.includes("EXAMPLE") ||
    upper.includes("PLACEHOLDER") ||
    upper.includes("DUMMY") ||
    upper.includes("YOUR-") ||
    upper.includes("YOUR_") ||
    upper.includes("REPLACE_WITH") ||
    upper.includes("<PASSWORD>") ||
    upper.includes("${") ||
    upper.includes("USER:PASSWORD@LOCALHOST") ||
    upper.includes("POSTGRES:POSTGRES@LOCALHOST") ||
    upper.includes("ROOT:ROOT@LOCALHOST")
  ) {
    return true;
  }
  return false;
}

function isExcludedLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.includes("[REDACTED]")) return true;
  if (/^\s*\/\*|\*\/\s*$/.test(trimmed)) return false;
  if (
    trimmed.includes("sk-[a-zA-Z0-9") ||
    trimmed.includes("ghp_[a-zA-Z0-9") ||
    trimmed.includes("`sk-*`") ||
    trimmed.includes("`ghp_*`") ||
    trimmed.includes("regex:") ||
    trimmed.includes("RegExp") ||
    trimmed.includes("PATTERN =") ||
    trimmed.includes("PATTERN=")
  ) {
    return true;
  }
  return false;
}

export function isIgnoredPath(relPath: string): boolean {
  const parts = relPath.split(/[\\/]/);
  for (const part of parts) {
    if (IGNORED_DIRS.has(part)) return true;
    if (part.startsWith(".") && part !== ".env" && part !== ".env.example" && part !== ".env.local" && part !== ".") {
      return true;
    }
  }
  const ext = extname(relPath).toLowerCase();
  if (BINARY_EXTS.has(ext)) return true;
  return false;
}

function collectFiles(dir: string, baseDir: string, collected: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return collected;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const rel = relative(baseDir, fullPath);
    if (isIgnoredPath(rel)) {
      continue;
    }

    let stat: ReturnType<typeof statSync>;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      collectFiles(fullPath, baseDir, collected);
    } else if (stat.isFile()) {
      collected.push(fullPath);
    }
  }

  return collected;
}

export function nativeRegexScan(targetDir: string, filesToScan?: string[]): ScanResult {
  const files = filesToScan || collectFiles(targetDir, targetDir);
  const findings: SecretFinding[] = [];

  for (const file of files) {
    const relPath = relative(targetDir, file);
    if (isIgnoredPath(relPath)) continue;

    let content = "";
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isExcludedLine(line)) continue;

      for (const pattern of SECRET_PATTERNS) {
        const match = line.match(pattern.regex);
        if (match) {
          const rawMatch = match[1] || match[0];
          if (isPlaceholderCredential(rawMatch)) {
            continue;
          }

          findings.push({
            file: relPath,
            line: i + 1,
            type: pattern.type,
            matchedPattern: pattern.regex.source,
            redacted: redactSecret(rawMatch),
            severity: pattern.severity,
            remediation: pattern.remediation,
          });
        }
      }
    }
  }

  return {
    targetDir,
    scanner: "native-regex",
    totalFilesScanned: files.length,
    findings,
    clean: findings.length === 0,
  };
}

async function hasTruffleHog(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn("trufflehog", ["--version"]);
      proc.on("error", () => resolve(false));
      proc.on("close", (code) => resolve(code === 0));
    } catch {
      resolve(false);
    }
  });
}

export async function scanFilesystem(
  targetDir: string,
  options: { verbose?: boolean; useTruffleHog?: boolean } = {},
): Promise<ScanResult> {
  if (options.useTruffleHog && (await hasTruffleHog())) {
    return new Promise((resolve) => {
      const args = ["filesystem", targetDir, "--json", "--no-update"];
      const trufflehog = spawn("trufflehog", args);
      let output = "";

      trufflehog.stdout.on("data", (data) => {
        output += data.toString();
      });
      trufflehog.on("error", () => {
        resolve(nativeRegexScan(targetDir));
      });
      trufflehog.on("close", () => {
        const lines = output.split("\n").filter((l) => l.trim());
        const findings: SecretFinding[] = [];
        for (const l of lines) {
          try {
            const parsed = JSON.parse(l);
            const file = parsed.SourceMetadata?.Data?.Filesystem?.file;
            const line = parsed.SourceMetadata?.Data?.Filesystem?.line || 1;
            if (file) {
              const rel = relative(targetDir, file);
              if (isIgnoredPath(rel)) continue;
              const raw = parsed.Raw || parsed.Redacted || "secret";
              if (isPlaceholderCredential(raw)) continue;

              findings.push({
                file: rel,
                line,
                type: parsed.DetectorType || "Credential",
                matchedPattern: parsed.DecoderName || "TruffleHog",
                redacted: redactSecret(raw),
                severity: parsed.Verified ? "critical" : "high",
                remediation: "Remove credential from repository and rotate immediately.",
              });
            }
          } catch {}
        }
        resolve({
          targetDir,
          scanner: "trufflehog",
          totalFilesScanned: lines.length,
          findings,
          clean: findings.length === 0,
        });
      });
    });
  }

  return nativeRegexScan(targetDir);
}

export async function main() {
  const args = process.argv.slice(2);
  let targetDir = process.cwd();
  let verbose = false;
  let jsonOutput = false;
  let useTruffleHog = false;

  for (const arg of args) {
    if (arg === "--verbose") verbose = true;
    else if (arg === "--json") jsonOutput = true;
    else if (arg === "--trufflehog") useTruffleHog = true;
    else if (!arg.startsWith("-")) targetDir = arg;
  }

  if (!existsSync(targetDir)) {
    console.error(`❌ Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const result = await scanFilesystem(targetDir, { verbose, useTruffleHog });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.clean ? 0 : 1);
  }

  console.log(`\n🛡️  Muse Vibeguard — Autonomous Secret Scanner [Engine: ${result.scanner}]`);
  console.log(`📁 Scanned directory: ${result.targetDir}`);
  console.log(`📄 Files analyzed: ${result.totalFilesScanned}\n`);

  if (result.clean) {
    console.log("✅ Zero credentials or secret tokens detected! Workspace is safe to commit.");
    process.exit(0);
  }

  console.log(`🚨 Found ${result.findings.length} secret finding(s):\n`);
  console.log("─".repeat(70));

  for (const finding of result.findings) {
    console.log(`\n🔴 [${finding.severity.toUpperCase()}] ${finding.type}`);
    console.log(`   File: ${finding.file}:${finding.line}`);
    console.log(`   Matched: ${finding.redacted}`);
    console.log(`   💡 Remediation: ${finding.remediation}`);
  }

  console.log(`\n${"─".repeat(70)}`);
  console.log("❌ Pre-ship secret scan failed! Purge or mask secrets before proceeding.\n");
  process.exit(1);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("SecretScan error:", err);
    process.exit(1);
  });
}
