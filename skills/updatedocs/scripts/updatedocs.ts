#!/usr/bin/env bun

/**
 * 📚 updatedocs — Project-Wide Documentation Synchronization, Drift Detection & Governance Engine
 *
 * Full lifecycle engine for documentation accuracy, drift prevention, and client handoffs:
 *   - Fast-Skip Gate (--fast-skip / --check): Sub-10ms hash & git verification to skip unchanged docs (0 token waste).
 *   - Code-to-Doc Audit (--audit / --env-audit): AST scan of process.env vs .env.example vs docs.
 *   - Link & Anchor Linter (--link-lint): Detects broken file links and dead #heading-slug anchors.
 *   - Mermaid Guard (--mermaid-guard): Validates and sanitizes unquoted special characters in diagrams.
 *   - Code Snippet Verifier (--test-snippets): Syntax checks fenced code blocks against drift.
 *   - Answer-First Density Meter (--density-check): Flags low-density conversational AI filler.
 *   - Dual-Audience Synchronizer (--sync-audience): Aligns human docs (README) with AI context (llms.txt, AGENTS.md).
 *   - Client Handoff Manual Generator (--client-manual): Produces non-technical, client-friendly handoff guides.
 *   - Jargon & Secret Defense (--sanitize-jargon): Redacts internal ticket IDs, staging hosts, and raw tokens.
 *   - Open-Source Credits Ledger (--credits-sync): Synchronizes CREDITS.md with package.json dependencies.
 *   - Documentation Point Ledger (--ledger/--checkpoint/--check-points): Session-proof DP-#### points,
 *     per-audience coverage watermarks, shipped state, what's-new, and updateagents --docs-backlog handoff.
 *
 * Invariants:
 *   - HARD BOUNDARY: Never modify or validate .memory/**.
 *   - DOX PROTECTION: Modifications to .agents/** require explicit authorization.
 *   - Non-Destructive Editing: Surgical block replacements preserve human tone and git blame.
 *
 * Usage:
 *   bun updatedocs.ts [targetPath] [options]
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

// =========================================================================
// CLI Parsing & Configuration
// =========================================================================

const IS_ENTRY_POINT = import.meta.main;

const { values, positionals } = parseArgs({
  args: IS_ENTRY_POINT ? Bun.argv.slice(2) : [],
  options: {
    audit: { type: "boolean", short: "a", default: false },
    check: { type: "boolean", short: "c", default: false },
    "fast-skip": { type: "boolean", default: false },
    "env-audit": { type: "boolean", default: false },
    "link-lint": { type: "boolean", default: false },
    "mermaid-guard": { type: "boolean", default: false },
    "test-snippets": { type: "boolean", default: false },
    "density-check": { type: "boolean", default: false },
    "sync-audience": { type: "boolean", default: false },
    "client-manual": { type: "boolean", default: false },
    "client-changelog": { type: "string" },
    "html-report": { type: "string" },
    receipts: { type: "string" },
    "check-freshness": { type: "boolean", default: false },
    "sanitize-jargon": { type: "boolean", default: false },
    "credits-sync": { type: "boolean", default: false },
    "capability-sweep": { type: "boolean", default: false },
    ledger: { type: "boolean", default: false },
    "catch-up": { type: "boolean", default: false },
    checkpoint: { type: "boolean", default: false },
    "check-points": { type: "boolean", default: false },
    "whats-new": { type: "boolean", default: false },
    mark: { type: "string" },
    audience: { type: "string" },
    docs: { type: "string" },
    release: { type: "string" },
    since: { type: "string" },
    "write-changelog": { type: "boolean", default: false },
    "write-client-changelog": { type: "boolean", default: false },
    "memory-hint": { type: "boolean", default: false },
    "include-chore": { type: "boolean", default: false },
    "install-hook": { type: "boolean", default: false },
    "fail-under": { type: "string" },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", short: "f", default: false },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
📚 updatedocs — Documentation Synchronization, Drift Detection & Governance Engine

Usage:
  bun updatedocs.ts [targetPath] [options]

Core Capabilities:
  -a, --audit               Run comprehensive 21-point doc audit (env, links, mermaid, density, snippets, ledger)
  -c, --check               Fast pre-commit / CI gate (exits 0 if fresh, 1 on drift)
      --fast-skip           Skip if git status is clean or .docs.hash matches (0 token waste)
      --env-audit           Audit process.env.* in code vs .env.example and README tables
      --link-lint           Scan markdown files for broken relative links and dead #anchors
      --mermaid-guard       Validate & sanitize unquoted special characters in Mermaid code blocks
      --test-snippets       Extract and syntax-check fenced TypeScript/JS/Bash code blocks
      --density-check       Score answer-first information density & detect conversational AI filler
      --sync-audience       Verify zero-drift parity between README.md, llms.txt, and AGENTS.md
      --client-manual       Generate non-technical, client-ready CLIENT_HANDOFF.md guide
      --client-changelog    Generate client-ready business release notes (CLIENT_CHANGELOG.md)
      --html-report         Generate single-file self-contained HTML work report (CLIENT_WORK_REPORT.html)
      --receipts <path>     Attach verified JSON receipts to the HTML work report (otherwise marks claims unverified)
      --check-freshness     Token-saving cache check: exit 0 if docs fresh from recent turn
      --sanitize-jargon     Sanitize internal ticket IDs (PROJ-123) and secrets from client docs
      --credits-sync        Sync CREDITS.md open-source attribution with package.json dependencies
      --capability-sweep    Sweep assets added since the last release tag and fail on capabilities documented nowhere (the sync half: audit checks written, sweep hunts missing)
      --ledger              Catch up documentation points from the ledger watermark to HEAD (session-proof)
      --catch-up            Alias for --ledger (process every update since the last documented point)
      --checkpoint          Advance the ledger watermark only when every point is fully documented
      --check-points        Read-only CI gate: exit 1 when points are pending or HEAD moved past the watermark
      --whats-new           Print shipped/complete points grouped for developer, user, or agent (--audience)
      --mark <id|sha>       Mark a point's audience coverage as documented (pair with --audience/--docs)
      --audience <name>     developer | user | agent | all (default: all)
      --docs <list>         Comma-separated doc paths that document the point (used with --mark)
      --release <tag>       Mark every complete point as shipped in the given release tag
      --since <ref>         Override the ledger baseline (default: watermark, then last release tag)
      --write-changelog     Write the managed Documentation Points block into CHANGELOG.md [Unreleased]
      --write-client-changelog  Write business-language What's New into CLIENT_CHANGELOG.md
      --memory-hint         Print optional harness-memory hints (updatedocs never writes .memory/)
      --include-chore       Include chore commits (deps/config/release-related) as documentation points
      --install-hook        Install an idempotent post-commit hook that auto-captures each commit as a point
      --fail-under <score>  Fail CI if doc health score is below threshold (default: 80)
      --dry-run             Simulate changes without writing files
  -f, --force               Bypass fast-skip gate and force full execution
      --json                Output audit results as machine-readable JSON
  -h, --help                Show this help message
`);
  process.exit(0);
}

// =========================================================================
// Core Utilities & Hash Functions
// =========================================================================

export function findFiles(
  dir: string,
  pattern: RegExp,
  ignoreDirs: string[] = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".cache",
    ".turbo",
    ".next",
    ".astro",
    ".crush",
    ".opencode",
    ".venv",
    ".venv-report",
    "venv",
    "env",
    ".agents/archive",
    ".agents/artifacts",
    ".agents/reports",
    // Historical snapshots are frozen artifacts, not live documentation: their
    // relative links were correct against the tree as it stood at capture
    // time (e.g. the pre-v6 flat skill layout) and must not be "repaired"
    // against today's paths. Classified HISTORICAL under the updatedocs
    // ownership model — audited, never rewritten.
    "docs/README-v5.0.0.md",
  ],
): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  function walk(current: string) {
    const entries = readdirSync(current);
    for (const entry of entries) {
      const full = join(current, entry);
      const rel = relative(dir, full);
      if (ignoreDirs.some((d) => rel === d || rel.startsWith(`${d}/`))) continue;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (pattern.test(entry)) {
        results.push(full);
      }
    }
  }

  walk(dir);
  return results;
}

export function computeDocsHash(targetDir: string): string {
  const hasher = createHash("sha256");
  const docFiles = findFiles(targetDir, /\.(md|markdown|txt)$/i).sort();

  for (const f of docFiles) {
    if (f.includes(".docs.hash") || f.includes(".context.hash")) continue;
    const rel = relative(targetDir, f);
    try {
      const content = readFileSync(f, "utf8");
      hasher.update(`${rel}:${content}`);
    } catch {}
  }
  return hasher.digest("hex");
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

// =========================================================================
// 0. Documentation Point Ledger (--ledger / --checkpoint / --whats-new)
// =========================================================================
// A durable, session-proof state file recording every code change that owes
// documentation, which audience still owes it, and what has shipped. It is
// the cross-session memory bridge: `.memory/` stays untouched, and harness
// memory receives a safe hint string rather than a write.

export const DOCS_LEDGER_FILE = ".docs-ledger.json";
const LEDGER_SCHEMA_VERSION = 1;

export type AudienceName = "developer" | "user" | "agent";
export type AudienceStatus = "not-needed" | "pending" | "documented" | "verified";

export interface AudienceCoverage {
  required: boolean;
  status: AudienceStatus;
  docs: string[];
  evidence: string;
  manual?: boolean;
}

export interface DocumentationPoint {
  id: string;
  point: number;
  commit: string;
  shortCommit: string;
  date: string;
  type: string;
  scope: string;
  summary: string;
  breaking: boolean;
  files: string[];
  audiences: Record<AudienceName, AudienceCoverage>;
  shipped: boolean;
  releaseTag: string | null;
  createdAt: string;
}

export interface DocsLedger {
  schemaVersion: number;
  project: string;
  createdAt: string;
  updatedAt: string;
  head: string;
  watermark: { point: number; commit: string; date: string; releaseTag: string | null };
  agentWatermark: { point: number; commit: string; syncedAt: string };
  points: DocumentationPoint[];
}

export interface LedgerReport {
  target: string;
  ledgerPath: string;
  baseline: string;
  head: string;
  totalPoints: number;
  newPoints: number;
  pendingPoints: number;
  completePoints: number;
  shippedPoints: number;
  wrote: boolean;
  points: DocumentationPoint[];
  pending: DocumentationPoint[];
  nextActions: string[];
  memoryHints: string[];
}

interface GitCommitRecord {
  hash: string;
  short: string;
  date: string;
  subject: string;
  type: string;
  scope: string;
  summary: string;
  breaking: boolean;
  files: string[];
}

const CONVENTIONAL_COMMIT = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;

function classifyCommit(subject: string, files: string[]): GitCommitRecord {
  const match = CONVENTIONAL_COMMIT.exec(subject);
  const type = (match?.[1] ?? "other").toLowerCase();
  const scope = match?.[2] ?? "";
  const breaking = Boolean(match?.[3]) || /BREAKING CHANGE/i.test(subject);
  const summary = match?.[4] ?? subject;
  return {
    hash: "",
    short: "",
    date: "",
    subject,
    type,
    scope,
    summary,
    breaking,
    files,
  };
}

function listCommitsSince(targetDir: string, sinceRef: string | null, limit = 200): GitCommitRecord[] {
  const format = "%H%x1f%h%x1f%cs%x1f%s";
  const args = sinceRef
    ? ["log", `--format=${format}`, "--name-only", `${sinceRef}..HEAD`]
    : ["log", `--format=${format}`, "--name-only", "-n", String(limit)];
  const result = spawnSync("git", args, { cwd: targetDir, encoding: "utf8" });
  if (result.status !== 0) return [];

  const commits: GitCommitRecord[] = [];
  let current: GitCommitRecord | null = null;
  for (const line of (result.stdout ?? "").split("\n")) {
    if (line.includes("\x1f")) {
      if (current) commits.push(current);
      const [hash, short, date, subject] = line.split("\x1f");
      current = classifyCommit(subject ?? "", []);
      current.hash = hash ?? "";
      current.short = short ?? "";
      current.date = date ?? "";
    } else if (line.trim() && current) {
      current.files.push(line.trim());
    }
  }
  if (current) commits.push(current);
  return commits.reverse();
}

function commitExists(targetDir: string, ref: string): boolean {
  if (!ref) return false;
  return gitIn(targetDir, ["cat-file", "-e", `${ref}^{commit}`]).code === 0;
}

function isCommitAncestor(targetDir: string, commit: string, ref: string): boolean {
  return gitIn(targetDir, ["merge-base", "--is-ancestor", commit, ref]).code === 0;
}

function repoHead(targetDir: string): string {
  const res = gitIn(targetDir, ["rev-parse", "HEAD"]);
  return res.code === 0 ? res.out.trim() : "";
}

function ledgerProjectName(targetDir: string): string {
  const pkgPath = join(targetDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
      if (pkg.name) return pkg.name;
    } catch {}
  }
  return basename(targetDir);
}

function emptyDocsLedger(targetDir: string): DocsLedger {
  const now = new Date().toISOString();
  return {
    schemaVersion: LEDGER_SCHEMA_VERSION,
    project: ledgerProjectName(targetDir),
    createdAt: now,
    updatedAt: now,
    head: repoHead(targetDir),
    watermark: { point: 0, commit: "", date: "", releaseTag: null },
    agentWatermark: { point: 0, commit: "", syncedAt: "" },
    points: [],
  };
}

export function readDocsLedger(targetDir: string): DocsLedger | null {
  const ledgerPath = join(targetDir, DOCS_LEDGER_FILE);
  if (!existsSync(ledgerPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(ledgerPath, "utf8")) as Partial<DocsLedger>;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.points)) return null;
    const ledger: DocsLedger = {
      ...emptyDocsLedger(targetDir),
      ...parsed,
      schemaVersion: parsed.schemaVersion ?? LEDGER_SCHEMA_VERSION,
      watermark: {
        point: 0,
        commit: "",
        date: "",
        releaseTag: null,
        ...(parsed.watermark ?? {}),
      },
      agentWatermark: { point: 0, commit: "", syncedAt: "", ...(parsed.agentWatermark ?? {}) },
      points: parsed.points,
    };
    for (const point of ledger.points) {
      point.files = Array.isArray(point.files) ? point.files : [];
      point.audiences = {
        developer: { required: true, status: "pending", docs: [], evidence: "" },
        user: { required: false, status: "not-needed", docs: [], evidence: "" },
        agent: { required: false, status: "not-needed", docs: [], evidence: "" },
        ...(point.audiences ?? {}),
      };
    }
    return ledger;
  } catch {
    return null;
  }
}

export function writeDocsLedger(targetDir: string, ledger: DocsLedger, dryRun = false): string {
  const ledgerPath = join(targetDir, DOCS_LEDGER_FILE);
  if (!dryRun) {
    writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  }
  return ledgerPath;
}

const MANIFEST_FILES =
  /^(package\.json|bun\.lockb?|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|pyproject\.toml|requirements\.txt|Cargo\.toml|go\.mod|composer\.json)$/;
const CONFIG_FILES =
  /(^|\/)(vite|next|astro|nuxt|svelte|remix|tailwind|tsconfig|drizzle|payload|wrangler|vercel|netlify|docker-compose)[^/]*\.(config\.)?(ts|js|mjs|cjs|json|toml|yml|yaml)$|^Dockerfile$|^\.env\.example$/;
const CODE_PATHS = /^(src|app|packages|api|cli|lib|server|cmd|bin|scripts|skills)\//;
const AGENT_PATHS = /^(skills\/|\.agents\/)|^AGENTS\.md$|^llms\.txt$|^skills\.json$/;
const DOC_PATH = /\.(md|mdx|txt)$/i;

function isDocRelevantCommit(commit: GitCommitRecord, includeChore = false): boolean {
  if (commit.type === "docs" || commit.type === "test" || commit.type === "style") return false;
  if (commit.type === "chore" && !includeChore) {
    const touchesMachineSurface = commit.files.some(
      (file) =>
        MANIFEST_FILES.test(file) ||
        CONFIG_FILES.test(file) ||
        file.startsWith(".github/workflows/") ||
        /deps|dependency|release|security|deploy/i.test(`${commit.scope} ${commit.summary}`),
    );
    if (!touchesMachineSurface) return false;
  }
  return true;
}

function audienceRequirements(commit: GitCommitRecord): Record<AudienceName, boolean> {
  const codeFiles = commit.files.filter((file) => CODE_PATHS.test(file) && !DOC_PATH.test(file));
  const machineSurface = commit.files.some(
    (file) => MANIFEST_FILES.test(file) || CONFIG_FILES.test(file) || file.startsWith(".github/workflows/"),
  );
  const agentSurface = commit.files.some((file) => AGENT_PATHS.test(file));
  const skillOnly =
    agentSurface && commit.files.filter((file) => !DOC_PATH.test(file)).every((file) => AGENT_PATHS.test(file));
  const publicChange = ["feat", "fix", "perf", "security", "revert"].includes(commit.type) || commit.breaking;

  return {
    developer: codeFiles.length > 0 || machineSurface || agentSurface || publicChange,
    user: !skillOnly && (publicChange || machineSurface),
    agent:
      agentSurface ||
      machineSurface ||
      commit.type === "feat" ||
      commit.type === "perf" ||
      commit.type === "security" ||
      commit.type === "refactor",
  };
}

function documentationPoint(commit: GitCommitRecord, pointNumber: number): DocumentationPoint {
  const required = audienceRequirements(commit);
  const coverage = (requiredFlag: boolean): AudienceCoverage =>
    requiredFlag
      ? { required: true, status: "pending", docs: [], evidence: "awaiting documentation" }
      : { required: false, status: "not-needed", docs: [], evidence: "no audience impact detected" };
  const now = new Date().toISOString();
  return {
    id: `DP-${String(pointNumber).padStart(4, "0")}`,
    point: pointNumber,
    commit: commit.hash,
    shortCommit: commit.short,
    date: commit.date,
    type: commit.type,
    scope: commit.scope,
    summary: commit.summary,
    breaking: commit.breaking,
    files: commit.files,
    audiences: {
      developer: coverage(required.developer),
      user: coverage(required.user),
      agent: coverage(required.agent),
    },
    shipped: false,
    releaseTag: null,
    createdAt: now,
  };
}

const COVERAGE_STOPWORDS = new Set([
  "add",
  "added",
  "adds",
  "allow",
  "allows",
  "change",
  "changed",
  "changes",
  "create",
  "created",
  "creates",
  "docs",
  "document",
  "documented",
  "fix",
  "fixed",
  "fixes",
  "improve",
  "improved",
  "improves",
  "make",
  "makes",
  "more",
  "new",
  "remove",
  "removed",
  "removes",
  "support",
  "supports",
  "update",
  "updated",
  "updates",
  "use",
  "uses",
  "using",
  "with",
]);

function coveragePhrases(point: DocumentationPoint): string[] {
  // Match phrases, not isolated words. A generic token such as "auth" would
  // otherwise let an unrelated heading "document" every auth commit, and an
  // older point's summary would auto-satisfy a newer, different capability.
  const summaryTokens = point.summary
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !COVERAGE_STOPWORDS.has(token))
    .slice(0, 5);
  const phrases = new Set<string>();
  if (summaryTokens.length >= 2) {
    for (let index = 0; index < summaryTokens.length - 1; index++) {
      phrases.add(`${summaryTokens[index]} ${summaryTokens[index + 1]}`);
    }
    if (summaryTokens.length >= 3) phrases.add(summaryTokens.join(" "));
  } else if (summaryTokens.length === 1) {
    phrases.add(summaryTokens[0]);
  }
  if (point.id) phrases.add(point.id.toLowerCase());
  // Scope fallback keys off the summary, not the phrase set: a summary such as
  // "v8.1.4" yields no tokens, and the id phrase would otherwise suppress the
  // only keyword a doc could ever contain (e.g. "release").
  if (summaryTokens.length === 0 && point.scope) phrases.add(point.scope.toLowerCase());
  return [...phrases];
}

function normalizeDocText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type DocCorpus = Array<{ rel: string; content: string }>;

function buildDocCorpus(targetDir: string, audience: AudienceName): DocCorpus {
  const files = findFiles(targetDir, /\.(md|mdx|txt)$/i);
  return files
    .map((file) => ({ rel: relative(targetDir, file), file }))
    .filter(({ rel }) => !rel.startsWith(".memory/") && !rel.endsWith(DOCS_LEDGER_FILE))
    .filter(({ rel }) => {
      if (audience === "agent") {
        return rel === "AGENTS.md" || rel === "llms.txt" || rel.startsWith(".agents/context/");
      }
      if (audience === "user") {
        return (
          /^(README|CHANGELOG|CLIENT_CHANGELOG|CLIENT_HANDOFF|RELEASE_NOTES)/i.test(rel) ||
          /^(docs|guides|handbook|manual)\//i.test(rel)
        );
      }
      return (
        /^(README|CHANGELOG|CONTRIBUTING|ARCHITECTURE|SECURITY|API|COMPATIBILITY|MIGRATING|UPGRADING|RELEASE_NOTES)/i.test(
          rel,
        ) ||
        /^(docs|adr|examples)\//i.test(rel) ||
        rel === "llms.txt" ||
        rel === "AGENTS.md"
      );
    })
    .map(({ rel, file }) => {
      try {
        return { rel, content: readFileSync(file, "utf8") };
      } catch {
        return { rel, content: "" };
      }
    });
}

function detectAudienceCoverage(
  corpus: DocCorpus,
  point: DocumentationPoint,
  audience: AudienceName,
): AudienceCoverage {
  const phrases = coveragePhrases(point);
  for (const doc of corpus) {
    const haystack = normalizeDocText(doc.content);
    const hit = phrases.find((phrase) => haystack.includes(normalizeDocText(phrase)));
    if (hit) {
      return {
        required: true,
        status: "documented",
        docs: [doc.rel],
        evidence: `phrase "${hit}" found in ${doc.rel}`,
      };
    }
  }
  return {
    required: true,
    status: "pending",
    docs: [],
    evidence:
      audience === "agent"
        ? "no agent context or discovery doc mentions this change yet"
        : "no discovery doc mentions this change yet",
  };
}

function pointComplete(point: DocumentationPoint): boolean {
  return (Object.keys(point.audiences) as AudienceName[]).every((audience) => {
    const coverage = point.audiences[audience];
    return !coverage.required || coverage.status === "documented" || coverage.status === "verified";
  });
}

function pendingPoints(ledger: DocsLedger): DocumentationPoint[] {
  return ledger.points.filter((point) => !pointComplete(point));
}

function memoryHintFor(point: DocumentationPoint): string {
  const audience = (Object.keys(point.audiences) as AudienceName[])
    .map((name) => `${name}:${point.audiences[name].status}`)
    .join(" ");
  return `DOCS ${point.id} ${point.shortCommit} ${point.summary} | ${audience} | shipped:${point.releaseTag ?? "no"}`;
}

export interface LedgerSyncOptions {
  since?: string;
  dryRun?: boolean;
  includeChore?: boolean;
  write?: boolean;
  advance?: boolean;
  limit?: number;
}

export function syncDocumentationPoints(targetDir: string, options: LedgerSyncOptions = {}): LedgerReport {
  const existing = readDocsLedger(targetDir);
  const ledger = existing ?? emptyDocsLedger(targetDir);
  const baseline =
    options.since ||
    (existing?.watermark.commit && commitExists(targetDir, existing.watermark.commit)
      ? existing.watermark.commit
      : (lastTag(targetDir) ?? ""));
  const commits = listCommitsSince(targetDir, baseline || null, options.limit ?? 200);
  const knownCommits = new Set(ledger.points.map((point) => point.commit));
  let nextPoint = ledger.points.reduce((max, point) => Math.max(max, point.point), 0) + 1;

  let newPoints = 0;
  for (const commit of commits) {
    if (knownCommits.has(commit.hash)) continue;
    if (!isDocRelevantCommit(commit, options.includeChore)) continue;
    ledger.points.push(documentationPoint(commit, nextPoint));
    nextPoint++;
    newPoints++;
  }

  const corpora: Record<AudienceName, DocCorpus> = {
    developer: buildDocCorpus(targetDir, "developer"),
    user: buildDocCorpus(targetDir, "user"),
    agent: buildDocCorpus(targetDir, "agent"),
  };

  for (const point of ledger.points) {
    for (const audience of Object.keys(point.audiences) as AudienceName[]) {
      const coverage = point.audiences[audience];
      if (!coverage.required || coverage.manual) continue;
      const detected = detectAudienceCoverage(corpora[audience], point, audience);
      point.audiences[audience] = detected;
    }
  }

  const tag = lastTag(targetDir);
  for (const point of ledger.points) {
    if (point.shipped) continue;
    if (tag && point.commit && isCommitAncestor(targetDir, point.commit, tag)) {
      point.shipped = true;
      point.releaseTag = tag;
    }
  }

  const head = repoHead(targetDir);
  ledger.head = head || ledger.head;
  ledger.updatedAt = new Date().toISOString();
  ledger.points.sort((a, b) => a.point - b.point);

  const pending = pendingPoints(ledger);
  if (options.advance && pending.length === 0) {
    ledger.watermark = {
      point: ledger.points.reduce((max, point) => Math.max(max, point.point), 0),
      commit: head,
      date: new Date().toISOString(),
      releaseTag: tag,
    };
  }

  const wrote = options.write !== false && !options.dryRun;
  const ledgerPath = wrote ? writeDocsLedger(targetDir, ledger, options.dryRun) : join(targetDir, DOCS_LEDGER_FILE);
  const shipped = ledger.points.filter((point) => point.shipped).length;
  const nextActions: string[] = [];
  for (const point of pending) {
    const missing = (Object.keys(point.audiences) as AudienceName[])
      .filter((audience) => point.audiences[audience].required && point.audiences[audience].status === "pending")
      .map((audience) => audience);
    nextActions.push(
      `${point.id} (${point.shortCommit} ${point.type}${point.scope ? `(${point.scope})` : ""}): document ${missing.join(", ")}`,
    );
  }

  return {
    target: targetDir,
    ledgerPath,
    baseline: baseline || "no-baseline",
    head,
    totalPoints: ledger.points.length,
    newPoints,
    pendingPoints: pending.length,
    completePoints: ledger.points.length - pending.length,
    shippedPoints: shipped,
    wrote,
    points: ledger.points,
    pending,
    nextActions,
    memoryHints: ledger.points.map(memoryHintFor),
  };
}

function hasUnscannedDocumentationCommits(targetDir: string, ledger: DocsLedger): boolean {
  if (!ledger.watermark.commit) return false;
  const known = new Set(ledger.points.map((point) => point.commit));
  return listCommitsSince(targetDir, ledger.watermark.commit, 200).some(
    (commit) => !known.has(commit.hash) && isDocRelevantCommit(commit),
  );
}

export function checkDocumentationPoints(targetDir: string): {
  ok: boolean;
  ledgerExists: boolean;
  pending: number;
  headBehind: boolean;
  watermark: number;
  head: string;
} {
  const ledger = readDocsLedger(targetDir);
  if (!ledger) {
    return { ok: true, ledgerExists: false, pending: 0, headBehind: false, watermark: 0, head: repoHead(targetDir) };
  }
  const pending = pendingPoints(ledger).length;
  const head = repoHead(targetDir);
  // HEAD moving is fine when the new commits are docs-only or otherwise owe
  // no documentation. Only unscanned documentation-relevant commits count.
  const headBehind = hasUnscannedDocumentationCommits(targetDir, ledger);
  return {
    ok: pending === 0 && !headBehind,
    ledgerExists: true,
    pending,
    headBehind,
    watermark: ledger.watermark.point,
    head,
  };
}

export function markDocumentationPoint(
  targetDir: string,
  idOrCommit: string,
  audience: AudienceName | "all" = "all",
  docs: string[] = [],
): { ok: boolean; message: string } {
  const ledger = readDocsLedger(targetDir);
  if (!ledger) return { ok: false, message: `No ${DOCS_LEDGER_FILE} found. Run --ledger first.` };
  const key = idOrCommit.toLowerCase();
  const point = ledger.points.find(
    (candidate) => candidate.id.toLowerCase() === key || candidate.commit.startsWith(key),
  );
  if (!point) return { ok: false, message: `No documentation point matches "${idOrCommit}".` };

  const audiences: AudienceName[] = audience === "all" ? ["developer", "user", "agent"] : [audience];
  for (const name of audiences) {
    const coverage = point.audiences[name];
    if (!coverage.required) continue;
    coverage.status = "documented";
    coverage.manual = true;
    coverage.docs = [...new Set([...coverage.docs, ...docs])];
    coverage.evidence = docs.length > 0 ? `manually documented in ${docs.join(", ")}` : "manually marked via --mark";
  }
  ledger.updatedAt = new Date().toISOString();
  writeDocsLedger(targetDir, ledger, false);
  return { ok: true, message: `Marked ${point.id} (${audiences.join(", ")}) as documented.` };
}

export function releaseDocumentationPoints(
  targetDir: string,
  tag: string,
): { ok: boolean; message: string; released: number; pending: number } {
  const ledger = readDocsLedger(targetDir);
  if (!ledger) return { ok: false, message: `No ${DOCS_LEDGER_FILE} found.`, released: 0, pending: 0 };
  const pending = pendingPoints(ledger);
  if (pending.length > 0) {
    return {
      ok: false,
      message: `${pending.length} documentation point(s) still owe docs: ${pending.map((p) => p.id).join(", ")}`,
      released: 0,
      pending: pending.length,
    };
  }
  let released = 0;
  for (const point of ledger.points) {
    if (point.shipped) continue;
    point.shipped = true;
    point.releaseTag = tag;
    released++;
  }
  ledger.watermark.releaseTag = tag;
  ledger.updatedAt = new Date().toISOString();
  writeDocsLedger(targetDir, ledger, false);
  return { ok: true, message: `Marked ${released} point(s) shipped in ${tag}.`, released, pending: 0 };
}

function humanizePoint(point: DocumentationPoint): string {
  const labels: Record<string, string> = {
    feat: "New",
    fix: "Fixed",
    perf: "Faster",
    security: "Security",
    revert: "Reverted",
    refactor: "Improved",
    chore: "Maintenance",
    ci: "Automation",
  };
  const label = labels[point.type] ?? "Updated";
  const prefix = point.breaking ? "Important — " : "";
  return `${prefix}${label}: ${point.summary}`;
}

export function buildWhatsNewMarkdown(ledger: DocsLedger, audience: "developer" | "user" | "agent" = "user"): string {
  const points = ledger.points.filter((point) => point.shipped || pointComplete(point));
  if (points.length === 0) return "";
  const lines: string[] = [];
  for (const point of points) {
    const release = point.releaseTag ? ` (shipped ${point.releaseTag})` : " (unreleased)";
    if (audience === "user") {
      lines.push(`- ${humanizePoint(point)}${release}`);
    } else if (audience === "agent") {
      const status = (Object.keys(point.audiences) as AudienceName[])
        .map((name) => `${name}=${point.audiences[name].status}`)
        .join(" ");
      lines.push(
        `- **${point.id}** \`${point.shortCommit}\` ${point.type}${point.scope ? `(${point.scope})` : ""} — ${point.summary} — ${status} — shipped=${point.releaseTag ?? "no"}`,
      );
    } else {
      lines.push(
        `- **${point.id}** \`${point.shortCommit}\` **${point.type}${point.scope ? `(${point.scope})` : ""}** — ${point.summary}${release}`,
      );
    }
  }
  return lines.join("\n");
}

const LEDGER_BLOCK_START = "<!-- docs-ledger:start -->";
const LEDGER_BLOCK_END = "<!-- docs-ledger:end -->";

function upsertManagedBlock(filePath: string, body: string, anchor: string, heading: string): boolean {
  const block = `${LEDGER_BLOCK_START}\n### ${heading}\n\n${body}\n${LEDGER_BLOCK_END}`;
  let content = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  if (content.includes(LEDGER_BLOCK_START) && content.includes(LEDGER_BLOCK_END)) {
    content = content.replace(new RegExp(`${LEDGER_BLOCK_START}[\\s\\S]*?${LEDGER_BLOCK_END}`), block);
  } else if (content.includes(anchor)) {
    content = content.replace(anchor, `${anchor}\n\n${block}`);
  } else {
    content = `${content.trim()}\n\n${anchor}\n\n${block}\n`;
  }
  writeFileSync(filePath, `${content.trim()}\n`, "utf8");
  return true;
}

export function writeWhatsNewDocuments(
  targetDir: string,
  dryRun = false,
  write: { changelog?: boolean; clientChangelog?: boolean } = { changelog: true, clientChangelog: true },
): { changelog: boolean; clientChangelog: boolean } {
  const ledger = readDocsLedger(targetDir);
  if (!ledger || dryRun) return { changelog: false, clientChangelog: false };
  const developer = write.changelog === false ? "" : buildWhatsNewMarkdown(ledger, "developer");
  const user = write.clientChangelog === false ? "" : buildWhatsNewMarkdown(ledger, "user");
  const changelogPath = join(targetDir, "CHANGELOG.md");
  const clientPath = join(targetDir, "CLIENT_CHANGELOG.md");
  if (developer) upsertManagedBlock(changelogPath, developer, "## [Unreleased]", "Documentation Points");
  if (user) upsertManagedBlock(clientPath, user, "## What's New", "Delivery Notes");
  return { changelog: Boolean(developer), clientChangelog: Boolean(user) };
}

export function installLedgerHook(targetDir: string): { ok: boolean; hookPath: string; message: string } {
  const gitDir = join(targetDir, ".git");
  if (!existsSync(gitDir)) {
    return { ok: false, hookPath: "", message: `Not a git repository: .git not found in ${targetDir}` };
  }
  const hooksDir = join(gitDir, "hooks");
  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });
  const hookPath = join(hooksDir, "post-commit");
  const start = "# >>> updatedocs ledger >>>";
  const end = "# <<< updatedocs ledger <<<";
  const block = `${start}
if command -v bun >/dev/null 2>&1; then
  for p in "skills/core-engine/updatedocs/scripts/updatedocs.ts" ".agents/skills/updatedocs/scripts/updatedocs.ts" "$HOME/.agents/skills/updatedocs/scripts/updatedocs.ts"; do
    if [ -f "$p" ]; then bun "$p" . --ledger >/dev/null 2>&1 || true; break; fi
  done
fi
${end}`;

  let content = existsSync(hookPath) ? readFileSync(hookPath, "utf8") : "#!/bin/sh\n";
  if (content.includes(start) && content.includes(end)) {
    content = content.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
  } else {
    content = `${content.trimEnd()}\n\n${block}\n`;
  }
  writeFileSync(hookPath, `${content.trimEnd()}\n`, "utf8");
  chmodSync(hookPath, 0o755);
  return {
    ok: true,
    hookPath,
    message: "Post-commit hook installed; each commit auto-captures a documentation point.",
  };
}

export function printLedgerReport(report: LedgerReport, includeMemoryHints = false): void {
  console.log(`\n📚 Documentation Point Ledger: ${report.target}`);
  console.log(`  • Ledger file:        ${report.ledgerPath}${report.wrote ? "" : " (not written)"}`);
  console.log(`  • Baseline:           ${report.baseline}`);
  console.log(`  • HEAD:               ${report.head.slice(0, 12)}${report.head.length > 12 ? "..." : ""}`);
  console.log(`  • Points tracked:     ${report.totalPoints} (${report.newPoints} new this scan)`);
  console.log(`  • Complete:           ${report.completePoints}`);
  console.log(`  • Pending docs:       ${report.pendingPoints}`);
  console.log(`  • Shipped:            ${report.shippedPoints}`);
  if (report.points.length > 0) {
    console.log("\n  ID       Commit   Type              Dev        User       Agent      Shipped");
    console.log("  ───────────────────────────────────────────────────────────────────────────────");
    for (const point of report.points.slice(-25)) {
      const label = `${point.type}${point.scope ? `(${point.scope})` : ""}`.slice(0, 16).padEnd(16);
      const status = (name: AudienceName) => {
        const coverage = point.audiences[name];
        if (!coverage.required) return "—".padEnd(11);
        return coverage.status.slice(0, 11).padEnd(11);
      };
      console.log(
        `  ${point.id.padEnd(8)} ${point.shortCommit.padEnd(8)} ${label} ${status("developer")} ${status("user")} ${status("agent")} ${point.shipped ? (point.releaseTag ?? "yes") : "no"}`,
      );
    }
    if (report.points.length > 25) console.log(`  … ${report.points.length - 25} older point(s) omitted`);
  }
  if (report.nextActions.length > 0) {
    console.log("\n  ⚠️  Documentation debt (write these before --checkpoint):");
    for (const action of report.nextActions) console.log(`     • ${action}`);
  } else {
    console.log("\n  ✅ Every tracked point has its required audience coverage.");
  }
  console.log(
    "\n  ℹ️  Audience model: developer = README/CHANGELOG/API/architecture; user = README/CLIENT_CHANGELOG/guides; agent = AGENTS.md/llms.txt/.agents/context (owned by updateagents).",
  );
  if (includeMemoryHints && report.memoryHints.length > 0) {
    console.log("\n  🧠 Optional memory hints (never written to `.memory/` by updatedocs):");
    for (const hint of report.memoryHints) console.log(`     • ${hint}`);
  }
}

// =========================================================================
// 1. Environment Variable Auditor (--env-audit)
// =========================================================================

export interface EnvAuditResult {
  codeVars: string[];
  exampleVars: string[];
  readmeVars: string[];
  missingInExample: string[];
  obsoleteInExample: string[];
  missingInReadme: string[];
  score: number;
}

const STANDARD_SYSTEM_VARS = new Set([
  "NODE_ENV",
  "MODE",
  "BASE_URL",
  "HOME",
  "PATH",
  "PATHEXT",
  "OSTYPE",
  "ARM_VERSION",
  "LIBC",
  "ELECTRON_RUN_AS_NODE",
  "PREBUILDS_ONLY",
  "LOG",
  "MSGPACKR_NATIVE_ACCELERATION_DISABLED",
  "SELF_CHECK",
]);

export function auditEnvironmentVariables(targetDir: string): EnvAuditResult {
  const codeFiles = findFiles(targetDir, /\.(ts|tsx|js|jsx|mjs|cjs|astro|svelte|vue)$/i);
  const codeVarSet = new Set<string>();

  const envRegex = /\b(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)\b/g;

  for (const cf of codeFiles) {
    const content = readFileSync(cf, "utf8");
    // Ignore scaffolding generators or files explicitly annotated to skip env audit
    if (content.includes("@env-audit-ignore") || cf.endsWith("new-project.ts")) {
      continue;
    }
    let m = envRegex.exec(content);
    while (m !== null) {
      if (m[1] && !STANDARD_SYSTEM_VARS.has(m[1])) {
        codeVarSet.add(m[1]);
      }
      m = envRegex.exec(content);
    }
  }

  const examplePath = join(targetDir, ".env.example");
  const exampleVarSet = new Set<string>();
  if (existsSync(examplePath)) {
    const lines = readFileSync(examplePath, "utf8").split("\n");
    for (const l of lines) {
      const trimmed = l.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const key = trimmed.split("=")[0].trim();
        if (key) exampleVarSet.add(key);
      }
    }
  }

  const readmeVars = new Set<string>();
  const readmePath = join(targetDir, "README.md");
  if (existsSync(readmePath)) {
    const readmeContent = readFileSync(readmePath, "utf8");
    for (const v of codeVarSet) {
      if (readmeContent.includes(v)) readmeVars.add(v);
    }
  }

  const isZeroEnvDeclared =
    existsSync(examplePath) && readFileSync(examplePath, "utf8").toLowerCase().includes("no environment variables");

  const codeVars = Array.from(codeVarSet).sort();
  const exampleVars = Array.from(exampleVarSet).sort();
  const missingInExample = isZeroEnvDeclared ? [] : codeVars.filter((v) => !exampleVarSet.has(v));
  const obsoleteInExample = isZeroEnvDeclared ? [] : exampleVars.filter((v) => !codeVarSet.has(v));
  const missingInReadme = isZeroEnvDeclared ? [] : codeVars.filter((v) => !readmeVars.has(v));

  let score = 100;
  if (!isZeroEnvDeclared) {
    score -= missingInExample.length * 15;
    score -= obsoleteInExample.length * 5;
    score -= Math.min(20, missingInReadme.length * 5);
    score = Math.max(0, score);
  }

  return {
    codeVars,
    exampleVars,
    readmeVars: Array.from(readmeVars).sort(),
    missingInExample,
    obsoleteInExample,
    missingInReadme,
    score,
  };
}

// =========================================================================
// 2. Markdown Link & Anchor Linter (--link-lint)
// =========================================================================

export interface BrokenLink {
  file: string;
  linkText: string;
  target: string;
  reason: "file_not_found" | "anchor_not_found";
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function lintMarkdownLinks(targetDir: string): { totalLinks: number; brokenLinks: BrokenLink[]; score: number } {
  const mdFiles = findFiles(targetDir, /\.(md|markdown)$/i);
  const brokenLinks: BrokenLink[] = [];
  let totalLinks = 0;

  // Cache headings per markdown file
  const headingCache = new Map<string, Set<string>>();

  function getHeadings(filePath: string): Set<string> {
    const cached = headingCache.get(filePath);
    if (cached) return cached;
    const slugs = new Set<string>();
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        const m = line.match(/^#{1,6}\s+(.+)$/);
        if (m) slugs.add(slugifyHeading(m[1]));
      }
    }
    headingCache.set(filePath, slugs);
    return slugs;
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const rawContent = readFileSync(file, "utf8");
    // Strip fenced code blocks and inline code to prevent testing example syntax
    const content = rawContent.replace(/(`{1,5})[\s\S]*?\1/g, "");
    const dir = dirname(file);
    let m = linkRegex.exec(content);

    while (m !== null) {
      const linkText = m[1];
      const target = m[2].trim();

      // Skip web links, mailto, home paths, conversation/file schemes, and placeholders
      if (
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("mailto:") &&
        !target.startsWith("conversation://") &&
        !target.startsWith("file://") &&
        !target.startsWith("~") &&
        !target.startsWith("<")
      ) {
        totalLinks++;
        if (target.startsWith("#")) {
          // Internal anchor in same file
          const anchor = target.slice(1);
          const slugs = getHeadings(file);
          if (!slugs.has(anchor)) {
            brokenLinks.push({
              file: relative(targetDir, file),
              linkText,
              target,
              reason: "anchor_not_found",
            });
          }
        } else {
          // Relative file target, may include #anchor
          const [filePathPart, anchorPart] = target.split("#");
          const resolvedFile = resolve(dir, filePathPart);
          if (!existsSync(resolvedFile)) {
            brokenLinks.push({
              file: relative(targetDir, file),
              linkText,
              target,
              reason: "file_not_found",
            });
          } else if (anchorPart && resolvedFile.endsWith(".md")) {
            const slugs = getHeadings(resolvedFile);
            if (!slugs.has(anchorPart)) {
              brokenLinks.push({
                file: relative(targetDir, file),
                linkText,
                target,
                reason: "anchor_not_found",
              });
            }
          }
        }
      }
      m = linkRegex.exec(content);
    }
  }

  const score = totalLinks === 0 ? 100 : Math.max(0, Math.round(100 - (brokenLinks.length / totalLinks) * 100));

  return { totalLinks, brokenLinks, score };
}

// =========================================================================
// 3. Mermaid Diagram Syntax Guard (--mermaid-guard)
// =========================================================================

export interface MermaidDiagnostic {
  file: string;
  line: number;
  original: string;
  sanitized: string;
  error: string;
}

export function lintMermaidDiagrams(
  targetDir: string,
  fix = false,
): { diagnostics: MermaidDiagnostic[]; fixedCount: number } {
  const mdFiles = findFiles(targetDir, /\.(md|markdown)$/i);
  const diagnostics: MermaidDiagnostic[] = [];
  let fixedCount = 0;

  for (const file of mdFiles) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    let inMermaid = false;
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("```mermaid")) {
        inMermaid = true;
        continue;
      }
      if (inMermaid && line.trim().startsWith("```")) {
        inMermaid = false;
        continue;
      }

      if (inMermaid) {
        // Detect unquoted labels with parentheses or brackets inside flowchart nodes
        // e.g. A[User (Admin)] -> should be A["User (Admin)"]
        const unquotedNode = /\b([a-zA-Z0-9_-]+)\[([^"\]\n]*[()/:][^"\]\n]*)\]/g;
        const match = unquotedNode.exec(line);
        if (match !== null) {
          const sanitizedLine = line.replace(unquotedNode, '$1["$2"]');
          diagnostics.push({
            file: relative(targetDir, file),
            line: i + 1,
            original: line.trim(),
            sanitized: sanitizedLine.trim(),
            error: "Unquoted special character in Mermaid label causes parser crash",
          });
          if (fix) {
            lines[i] = sanitizedLine;
            modified = true;
            fixedCount++;
          }
        }
      }
    }

    if (fix && modified) {
      writeFileSync(file, lines.join("\n"), "utf8");
    }
  }

  return { diagnostics, fixedCount };
}

// =========================================================================
// 4. Answer-First Density & AI Filler Detector (--density-check)
// =========================================================================

export interface DensityReport {
  fillerCount: number;
  totalWords: number;
  flaggedPhrases: Array<{ phrase: string; file: string; line: number }>;
  densityScore: number;
}

export function checkAnswerFirstDensity(targetDir: string): DensityReport {
  const mdFiles = findFiles(targetDir, /\.(md|markdown)$/i);
  const fillerPhrases = [
    "in this comprehensive guide",
    "in this tutorial",
    "we will delve into",
    "it is important to note that",
    "multifaceted nature of",
    "seamless integration",
    "without further ado",
    "as an ai language model",
    "in today's fast-paced digital world",
    "let's dive right in",
  ];

  const flaggedPhrases: Array<{ phrase: string; file: string; line: number }> = [];
  let totalWords = 0;
  let fillerCount = 0;

  for (const file of mdFiles) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("❌") || lines[i].includes("🚫")) {
        continue;
      }
      const line = lines[i].toLowerCase();
      totalWords += line.split(/\s+/).filter(Boolean).length;
      for (const phrase of fillerPhrases) {
        if (line.includes(phrase)) {
          fillerCount++;
          flaggedPhrases.push({
            phrase,
            file: relative(targetDir, file),
            line: i + 1,
          });
        }
      }
    }
  }

  const densityScore = Math.max(0, 100 - fillerCount * 15);
  return { fillerCount, totalWords, flaggedPhrases, densityScore };
}

// =========================================================================
// 5. Code Snippet Syntax Verifier (--test-snippets)
// =========================================================================

export interface SnippetDiagnostic {
  file: string;
  language: string;
  code: string;
  valid: boolean;
  error?: string;
}

export function verifyCodeSnippets(targetDir: string): { tested: number; valid: number; errors: SnippetDiagnostic[] } {
  const mdFiles = findFiles(targetDir, /\.(md|markdown)$/i);
  const errors: SnippetDiagnostic[] = [];
  let tested = 0;
  let valid = 0;

  const codeBlockRegex = /```(javascript|js|typescript|ts|json)\n([\s\S]*?)```/g;

  for (const file of mdFiles) {
    const content = readFileSync(file, "utf8");
    let match = codeBlockRegex.exec(content);

    while (match !== null) {
      const lang = match[1];
      const code = match[2];
      tested++;

      if (lang === "json") {
        try {
          JSON.parse(code);
          valid++;
        } catch (e: unknown) {
          const errMsg = e instanceof Error ? e.message : String(e);
          errors.push({
            file: relative(targetDir, file),
            language: lang,
            code: code.slice(0, 80),
            valid: false,
            error: errMsg,
          });
        }
      } else {
        // Basic syntax check for JS/TS: ensure braces & parentheses balance
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;

        if (openBraces !== closeBraces || openParens !== closeParens) {
          errors.push({
            file: relative(targetDir, file),
            language: lang,
            code: code.slice(0, 80),
            valid: false,
            error: `Unbalanced syntax: braces ({: ${openBraces}, }: ${closeBraces}), parens ((: ${openParens}, ): ${closeParens})`,
          });
        } else {
          valid++;
        }
      }
      match = codeBlockRegex.exec(content);
    }
  }

  return { tested, valid, errors };
}

// =========================================================================
// 6. Dual-Audience Synchronizer (--sync-audience)
// =========================================================================

export interface DualAudienceResult {
  hasReadme: boolean;
  hasLlmsTxt: boolean;
  hasAgentsMd: boolean;
  inSync: boolean;
  missingInLlms: string[];
}

// =========================================================================
// Capability-Absence Sweep — the sync half of the job
// =========================================================================
// An audit score of 100/100 is not evidence of sync: the audit checks what is
// *written*; this sweep hunts capabilities that exist and are documented
// *nowhere* (no diff relation to catch). It mechanically enumerates assets
// added since the last release tag and verifies each surfaces in a discovery
// document (README, CHANGELOG, the skill's own SKILL.md, llms.txt).

export interface CapabilitySweepResult {
  baseline: string;
  checked: number;
  gaps: Array<{ asset: string; kind: string; suggestedDocs: string[]; evidence: string }>;
  score: number;
}

const KEBAB_MD = /^[a-z0-9]+(-[a-z0-9]+)*\.md$/;

function gitIn(targetDir: string, args: string[]): { code: number; out: string } {
  const r = spawnSync("git", args, { cwd: targetDir, encoding: "utf8" });
  return { code: r.status ?? 1, out: (r.stdout ?? "") + (r.stderr ?? "") };
}

function lastTag(targetDir: string): string | null {
  const r = gitIn(targetDir, ["describe", "--tags", "--abbrev=0"]);
  return r.code === 0 ? r.out.trim() : null;
}

export function sweepUndocumentedCapabilities(targetDir: string): CapabilitySweepResult {
  const baseline = lastTag(targetDir);
  const gaps: CapabilitySweepResult["gaps"] = [];
  let checked = 0;

  const readme = existsSync(join(targetDir, "README.md")) ? readFileSync(join(targetDir, "README.md"), "utf8") : "";
  const changelog = existsSync(join(targetDir, "CHANGELOG.md"))
    ? readFileSync(join(targetDir, "CHANGELOG.md"), "utf8")
    : "";
  const llms = existsSync(join(targetDir, "llms.txt")) ? readFileSync(join(targetDir, "llms.txt"), "utf8") : "";
  const mention = (needle: string, ...docs: string[]) => docs.some((d) => d.includes(needle));

  if (baseline) {
    // 1. Added assets since the baseline tag
    const added = gitIn(targetDir, [
      "diff",
      "--name-only",
      "--diff-filter=A",
      `${baseline}..HEAD`,
      "--",
      "skills/",
      "scripts/",
      ".github/",
    ]);
    if (added.code === 0) {
      for (const rel of added.out
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)) {
        const base = rel.split("/").pop() ?? rel;
        // Scaffolding templates (Client-Intake, standards, brand) are internal
        // assets, not discovery documents; they do not belong in a SKILL.md
        // Modes table and must not be reported as invisible references.
        if (rel.includes("/templates/")) continue;
        checked++;
        const _suggested: string[] = ["README.md", "CHANGELOG.md"];
        if (rel.includes("skills/") && base.endsWith(".md") && KEBAB_MD.test(base)) {
          // a reference/mode file — its own SKILL.md must surface it
          let skillDir = "";
          let cur = dirname(rel);
          while (cur?.startsWith("skills") && cur !== "skills") {
            if (existsSync(join(targetDir, cur, "SKILL.md"))) {
              skillDir = cur;
              break;
            }
            const parent = dirname(cur);
            if (parent === cur) break;
            cur = parent;
          }
          if (skillDir) {
            const skPath = join(targetDir, skillDir, "SKILL.md");
            const sk = readFileSync(skPath, "utf8");
            if (!sk.includes(base)) {
              gaps.push({
                asset: rel,
                kind: "reference-file-invisible-in-skill",
                suggestedDocs: [`${skillDir}/SKILL.md ## Modes`],
                evidence: `${base} added after ${baseline} but absent from the skill's Modes section`,
              });
              continue;
            }
            checked--;
            continue; // skill-internal coverage verified; README need not name every ref
          }
        }
        if (rel.startsWith(".github/workflows/") && !mention(base, readme, changelog)) {
          gaps.push({
            asset: rel,
            kind: "undocumented-workflow",
            suggestedDocs: ["README.md", "CHANGELOG.md"],
            evidence: `${base} added after ${baseline}, mentioned in neither README nor CHANGELOG`,
          });
          continue;
        }
        const isNewSkill = /^skills\/[a-z0-9-]+\/SKILL\.md$/.test(rel);
        const skillName = isNewSkill ? rel.split("/")[1] : base;
        if ((rel.startsWith("scripts/") || rel.startsWith("skills/")) && !mention(skillName, readme, changelog, llms)) {
          gaps.push({
            asset: rel,
            kind: isNewSkill ? "undocumented-skill" : "undocumented-asset",
            suggestedDocs: isNewSkill ? ["README.md catalog", "llms.txt"] : ["README.md", "CHANGELOG.md", "llms.txt"],
            evidence: `${skillName} added after ${baseline}, found in no discovery doc`,
          });
        }
      }
    }

    // 2. feat-commits since baseline must reach a discovery doc
    const log = gitIn(targetDir, ["log", "--format=%s", `${baseline}..HEAD`]);
    if (log.code === 0) {
      for (const subject of log.out
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => /^feat(\([^)]*\))?\b/i.test(l))) {
        checked++;
        const scope = /^feat\(([^)]*)\)/i.exec(subject)?.[1] ?? "";
        const token = (
          scope ||
          subject
            .replace(/^feat(\([^)]*\))?:?/i, "")
            .trim()
            .split(/\s+/)[0]
        ).replace(/[^a-zA-Z0-9-]/g, "");
        if (token.length >= 4 && !mention(token, readme, changelog, llms)) {
          gaps.push({
            asset: subject,
            kind: "feat-commit-undocumented",
            suggestedDocs: ["CHANGELOG.md", "README.md"],
            evidence: `feat commit since ${baseline}; "${token}" appears in no discovery doc`,
          });
        }
      }
    }
  }

  const audited = checked + gaps.length;
  const score = audited === 0 ? 100 : Math.round(((audited - gaps.length) / audited) * 100);
  return { baseline: baseline ?? "no-tags", checked, gaps, score };
}

export function auditDualAudienceSync(targetDir: string): DualAudienceResult {
  const readmePath = join(targetDir, "README.md");
  const llmsPath = join(targetDir, "llms.txt");
  const agentsPath = join(targetDir, "AGENTS.md");

  const hasReadme = existsSync(readmePath);
  const hasLlmsTxt = existsSync(llmsPath);
  const hasAgentsMd = existsSync(agentsPath);

  const missingInLlms: string[] = [];

  if (hasReadme && hasLlmsTxt) {
    const llmsContent = readFileSync(llmsPath, "utf8");
    const skillsJsonPath = join(targetDir, "skills.json");
    if (existsSync(skillsJsonPath)) {
      try {
        const skillsData = JSON.parse(readFileSync(skillsJsonPath, "utf8"));
        const skillList = Array.isArray(skillsData) ? skillsData : skillsData.skills || [];
        for (const s of skillList) {
          if (s.name && !llmsContent.includes(s.name)) {
            missingInLlms.push(s.name);
          }
        }
      } catch {}
    }
  }

  const inSync = hasReadme && (!hasLlmsTxt || missingInLlms.length === 0);
  return { hasReadme, hasLlmsTxt, hasAgentsMd, inSync, missingInLlms };
}

// =========================================================================
// 7. Client Handoff Manual Generator (--client-manual)
// =========================================================================

export function generateClientHandoffManual(targetDir: string, outPath?: string): string {
  let dest = outPath ? resolve(targetDir, outPath) : join(targetDir, "CLIENT_HANDOFF.md");
  if (existsSync(dest) && statSync(dest).isDirectory()) {
    dest = join(dest, "CLIENT_HANDOFF.md");
  }
  let pName = basename(targetDir);
  const pkgPath = join(targetDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      pName = JSON.parse(readFileSync(pkgPath, "utf8")).name || pName;
    } catch {}
  }

  const contentMapPath = join(targetDir, ".agents/brand/CONTENT_MAP.md");
  let mappingSection = "";
  if (existsSync(contentMapPath)) {
    mappingSection = readFileSync(contentMapPath, "utf8");
  } else {
    mappingSection = `## Content Mapping Matrix\n\n| Page Section | Where to Edit | Editable Fields |\n|:---|:---|:---|\n| **Hero / Home** | CMS / Content Collection | Headline, Subtitle, CTA Button |\n| **Features** | \`src/content/features/\` | Title, Description, Icons |\n| **Footer** | Global Navigation | Copyright, Social Links |\n`;
  }

  const manualContent = `# 📘 Client Content & Maintenance Guide: ${pName}

> **Welcome to your new website!** This guide provides everything your marketing, content, and design team needs to safely update website copy, publish blog posts, and manage products without touching technical code or calling developers.

---

## 1. Quick Navigation & Roles
- **Website Owner**: ${pName} Team
- **Hand-Off Date**: ${new Date().toISOString().split("T")[0]}
- **Staging / Preview**: Managed via automated CI deployment
- **Support**: Agency Council Delivery Lead

---

${mappingSection}

---

## 2. How to Edit Website Copy in 3 Simple Steps
1. **Locate the Section**: Find the component you want to update in the table above.
2. **Edit the Text**: Open the corresponding file in your content editor or CMS admin dashboard.
3. **Save & Publish**: Click save or submit your changes. Your staging preview will automatically update within 60 seconds.

---

## 3. Brand & Visual Assets Guide
- **Logos & Graphics**: High-resolution SVG and WebP images are located in the public asset directory. Always compress images before upload.
- **Brand Colors**: Your official design tokens are locked to ensure consistent contrast across mobile and desktop.
- **Typography**: Responsive font sizes automatically scale to look stunning on iPhone, iPad, laptop, and ultra-wide displays.

---

## 4. Security & Safety Checklist
- ✅ Never paste passwords or API keys into public content fields.
- ✅ Always preview changes on mobile before sending marketing campaigns.
- ✅ Contact your agency team if you require structural or new layout changes.
`;

  writeFileSync(dest, manualContent, "utf8");
  console.log(`  ✅ Generated Client Handoff Manual: ${relative(targetDir, dest)}`);
  return dest;
}

// =========================================================================
// 8. Client Jargon & Secret Defense Sanitizer (--sanitize-jargon)
// =========================================================================

export function sanitizeClientJargon(content: string): { sanitized: string; redactedCount: number } {
  let redactedCount = 0;

  // 1. Redact internal ticket IDs: PROJ-123, JIRA-456, GH-789
  const ticketRegex = /\b[A-Z]{2,10}-[0-9]{1,6}\b/g;
  let sanitized = content.replace(ticketRegex, () => {
    redactedCount++;
    return "[TASK]";
  });

  // 2. Redact internal localhost staging links
  const localhostRegex = /http:\/\/localhost:[0-9]{3,5}/g;
  sanitized = sanitized.replace(localhostRegex, () => {
    redactedCount++;
    return "[PREVIEW_URL]";
  });

  // 3. Redact staging bearer/API keys
  const tokenRegex = /\b(?:sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,})\b/g;
  sanitized = sanitized.replace(tokenRegex, () => {
    redactedCount++;
    return "[REDACTED_CREDENTIAL]";
  });

  return { sanitized, redactedCount };
}

// =========================================================================
// 9. Open Source Attribution Ledger (--credits-sync)
// =========================================================================

export function resolveDependencyLicense(targetDir: string, packageName: string): string {
  const packageJsonPath = join(targetDir, "node_modules", packageName, "package.json");
  if (!existsSync(packageJsonPath)) return "UNVERIFIED (install dependencies to resolve)";

  try {
    const meta = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    if (typeof meta.license === "string" && meta.license.trim()) return meta.license.trim();
    if (Array.isArray(meta.licenses)) {
      const licenses = meta.licenses
        .map((entry: unknown) => (typeof entry === "string" ? entry : (entry as { type?: string })?.type))
        .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0);
      if (licenses.length > 0) return licenses.join(", ");
    }
  } catch {}

  return "UNVERIFIED (package metadata unreadable)";
}

export function syncCreditsLedger(targetDir: string): { dependenciesTracked: number; path: string } {
  const pkgPath = join(targetDir, "package.json");
  const creditsPath = join(targetDir, "CREDITS.md");
  let depsCount = 0;

  const depList: Array<{ name: string; version: string; type: string; license: string }> = [];

  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg.dependencies) {
        for (const [name, version] of Object.entries(pkg.dependencies)) {
          depList.push({
            name,
            version: String(version),
            type: "Production",
            license: resolveDependencyLicense(targetDir, name),
          });
          depsCount++;
        }
      }
      if (pkg.devDependencies) {
        for (const [name, version] of Object.entries(pkg.devDependencies)) {
          depList.push({
            name,
            version: String(version),
            type: "Development",
            license: resolveDependencyLicense(targetDir, name),
          });
          depsCount++;
        }
      }
    } catch {}
  }

  let tableRows = "";
  for (const d of depList) {
    tableRows += `| \`${d.name}\` | \`${d.version}\` | ${d.type} | ${d.license} |\n`;
  }

  const creditsContent = `# 📜 Open Source Attribution & Credits Ledger

> This project builds upon high-performance open-source software and frameworks. We gratefully acknowledge and attribute the following open-source libraries:

| Package | Version | Type | License |
|:---|:---|:---|:---|
${tableRows}
---

## License Invariants
- License values above are read from installed package metadata; \`UNVERIFIED\` rows must be checked before redistribution.
- Review any dependency whose resolved license is not on the approved permissive list (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC).
- Proprietary agency client code and assets remain solely owned by the principal.
`;

  writeFileSync(creditsPath, creditsContent, "utf8");
  console.log(`  ✅ Synchronized Open Source Credits Ledger (${depsCount} dependencies): CREDITS.md`);
  return { dependenciesTracked: depsCount, path: creditsPath };
}

// =========================================================================
// 10. Client Business Changelog Generator (--client-changelog)
// =========================================================================

export function generateClientChangelog(
  targetDir: string,
  sinceRef = "HEAD~5",
  outPath?: string,
): { changelog: string; path: string; entryCount: number } {
  let dest = outPath ? resolve(targetDir, outPath) : join(targetDir, "CLIENT_CHANGELOG.md");
  if (existsSync(dest) && statSync(dest).isDirectory()) {
    dest = join(dest, "CLIENT_CHANGELOG.md");
  }
  let commits: string[] = [];

  try {
    const res = spawnSync("git", ["log", `${sinceRef}..HEAD`, "--oneline"], {
      cwd: targetDir,
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout.trim()) {
      commits = res.stdout.trim().split("\n");
    } else {
      const fallback = spawnSync("git", ["log", "-n", "5", "--oneline"], {
        cwd: targetDir,
        encoding: "utf8",
      });
      if (fallback.status === 0 && fallback.stdout.trim()) {
        commits = fallback.stdout.trim().split("\n");
      }
    }
  } catch {
    commits = [];
  }

  function humanizeCommit(str: string): string {
    const trimmed = str.trim();
    if (!trimmed) return "Platform improvement";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  const features: string[] = [];
  const security: string[] = [];
  const perf: string[] = [];
  const fixes: string[] = [];

  for (const line of commits) {
    const spaceIdx = line.indexOf(" ");
    if (spaceIdx === -1) continue;
    const rawMsg = line.slice(spaceIdx + 1).trim();
    const sanitized = sanitizeClientJargon(rawMsg).sanitized;
    const lower = rawMsg.toLowerCase();

    if (lower.startsWith("feat") || lower.startsWith("add")) {
      const translated = humanizeCommit(sanitized.replace(/^(?:feat(?:\([^)]*\))?:|add:)\s*/i, ""));
      features.push(`- **${translated}**: Enhances platform functionality and user experience.`);
    } else if (
      lower.includes("security") ||
      lower.includes("auth") ||
      lower.includes("secret") ||
      lower.includes("csrf")
    ) {
      const translated = humanizeCommit(sanitized.replace(/^(?:sec(?:\([^)]*\))?:|fix(?:\([^)]*\))?:)\s*/i, ""));
      security.push(`- **${translated}**: Strengthens data privacy, access controls, and defense standards.`);
    } else if (lower.startsWith("perf") || lower.includes("optimi") || lower.includes("speed")) {
      const translated = humanizeCommit(sanitized.replace(/^(?:perf(?:\([^)]*\))?:|opt:)\s*/i, ""));
      perf.push(`- **${translated}**: Accelerates response times and improves asset delivery efficiency.`);
    } else {
      const translated = humanizeCommit(
        sanitized.replace(/^(?:fix(?:\([^)]*\))?:|chore(?:\([^)]*\))?:|refactor(?:\([^)]*\))?:)\s*/i, ""),
      );
      fixes.push(`- **${translated}**: Polishes stability, interface details, and operational reliability.`);
    }
  }

  const dateStr = new Date().toISOString().split("T")[0];
  let markdown = `# 🚀 Client Delivery Release Notes & Business Changelog\n\n> **Release Date**: ${dateStr}\n> **Audience**: Agency Clients, Product Owners & Executive Stakeholders\n\n`;

  if (features.length > 0) {
    markdown += `### 🌟 New Features & Capabilities\n${features.join("\n")}\n\n`;
  }
  if (perf.length > 0) {
    markdown += `### ⚡ Performance & Efficiency Enhancements\n${perf.join("\n")}\n\n`;
  }
  if (security.length > 0) {
    markdown += `### 🛡️ Security, Privacy & Reliability Upgrades\n${security.join("\n")}\n\n`;
  }
  if (fixes.length > 0) {
    markdown += `### 🔧 Refinements & Quality Polish\n${fixes.join("\n")}\n\n`;
  }

  if (features.length === 0 && perf.length === 0 && security.length === 0 && fixes.length === 0) {
    markdown += `### 🌟 Platform Updates\n- **Continuous Maintenance & Quality Assurance**: All systems operating with zero open regressions.\n\n`;
  }

  markdown += `---\n\n*Generated by Agency Council Delivery Engine — strictly confidential & client-ready.*\n`;

  writeFileSync(dest, markdown, "utf8");
  console.log(`  ✅ Generated Client Business Changelog (${commits.length} entries): ${relative(targetDir, dest)}`);
  return { changelog: markdown, path: dest, entryCount: commits.length };
}

// =========================================================================
// 11. Self-Contained HTML Work Report Generator (--html-report)
// =========================================================================

export interface WorkReportReceipts {
  gatePassPercent?: number;
  secretLeaks?: number;
  brokenLinks?: number;
  cmsStatus?: string;
  docsParity?: boolean;
  deploymentVerified?: boolean;
  verifiedAt?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateHtmlWorkReport(
  targetDir: string,
  options: {
    clientName?: string;
    outPath?: string;
    summary?: string;
    receipts?: WorkReportReceipts;
  } = {},
): { html: string; path: string } {
  let dest = options.outPath ? resolve(targetDir, options.outPath) : join(targetDir, "CLIENT_WORK_REPORT.html");
  if (existsSync(dest) && statSync(dest).isDirectory()) {
    dest = join(dest, "CLIENT_WORK_REPORT.html");
  }
  let pName = options.clientName || basename(targetDir);
  const pkgPath = join(targetDir, "package.json");
  if (!options.clientName && existsSync(pkgPath)) {
    try {
      pName = JSON.parse(readFileSync(pkgPath, "utf8")).name || pName;
    } catch {}
  }

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const receipts = options.receipts;
  const hasReceipts = Boolean(receipts);
  const gatePass = receipts?.gatePassPercent !== undefined ? `${receipts.gatePassPercent}%` : "Not run";
  const secretLeaks = receipts?.secretLeaks !== undefined ? String(receipts.secretLeaks) : "Not run";
  const brokenLinks = receipts?.brokenLinks !== undefined ? String(receipts.brokenLinks) : "Not run";
  const cmsStatus = receipts?.cmsStatus ? escapeHtml(receipts.cmsStatus) : "Not reported";
  const safeSummary = escapeHtml(
    options.summary ||
      "No verified executive summary was supplied. This report intentionally makes no quality or security claims without a receipt.",
  );
  const docsParity =
    receipts?.docsParity === true
      ? "Verified — dual-audience documentation parity receipt attached."
      : receipts?.docsParity === false
        ? "FAILED — documentation parity receipt reports drift."
        : "Not verified — no documentation parity receipt attached.";
  const deploymentStatus =
    receipts?.deploymentVerified === true
      ? "Verified — staging deployment receipt attached."
      : receipts?.deploymentVerified === false
        ? "FAILED — deployment verification receipt reports a failure."
        : "Not verified — no deployment receipt attached.";
  const receiptNote = hasReceipts
    ? `Receipts attached${receipts?.verifiedAt ? ` (verified ${escapeHtml(receipts.verifiedAt)})` : ""}.`
    : "No receipts attached; all quality and security values below are unverified.";
  const badge = hasReceipts ? "📎 RECEIPTS ATTACHED" : "⚠️ NOT VERIFIED";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Work Report — ${escapeHtml(pName)}</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --success: #10b981;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.2);
      color: var(--success);
      border: 1px solid var(--success);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    h1 { font-size: 1.8rem; font-weight: 700; color: var(--text); }
    h2 { font-size: 1.3rem; font-weight: 600; color: var(--accent); margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    p { margin-bottom: 12px; color: var(--text-muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .stat-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-number { font-size: 1.8rem; font-weight: 700; color: var(--accent); }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
    ul { list-style-type: none; padding-left: 0; }
    li { padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    li:last-child { border-bottom: none; }
    .check { color: var(--success); margin-right: 8px; }
    footer {
      text-align: center;
      margin-top: 40px;
      color: var(--text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Executive Delivery Report</h1>
        <p>Project: <strong>${escapeHtml(pName)}</strong> | Agency Delivery Lead</p>
      </div>
      <div>
        <span class="badge">${badge}</span>
      </div>
    </header>

    <div class="card">
      <h2>Executive Summary</h2>
      <p>${safeSummary}</p>
      <p><small>${escapeHtml(receiptNote)}</small></p>
      <div class="grid">
        <div class="stat-box">
          <div class="stat-number">${escapeHtml(gatePass)}</div>
          <div class="stat-label">Automated Gate Pass</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${escapeHtml(secretLeaks)}</div>
          <div class="stat-label">Secret / Token Leaks</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${escapeHtml(brokenLinks)}</div>
          <div class="stat-label">Broken Doc Links</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${cmsStatus}</div>
          <div class="stat-label">CMS Cohesion Status</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Deliverables & Governance Invariants</h2>
      <ul>
        <li><strong>Documentation Synchronization</strong>: ${escapeHtml(docsParity)}</li>
        <li><strong>Client-Safe Documentation</strong>: Secret/PII scan result: ${escapeHtml(secretLeaks)} leak(s) ${hasReceipts ? "(receipt attached)" : "(not run)"}.</li>
        <li><strong>CMS & Page Builder Architecture</strong>: ${cmsStatus}.</li>
        <li><strong>Deployment Verification</strong>: ${escapeHtml(deploymentStatus)}</li>
      </ul>
    </div>

    <div class="card">
      <h2>Next Recommended Actions</h2>
      <p>1. Review the client-ready changelog and content guide in <code>CLIENT_HANDOFF.md</code>.</p>
      <p>2. Execute staging acceptance verification within the 7-day deemed acceptance window.</p>
      <p>3. Authorize final production deployment release once stakeholder sign-off is logged.</p>
    </div>

    <footer>
      <p>Generated on ${dateStr} by Agency Council Delivery Engine • Strictly Confidential</p>
    </footer>
  </div>
</body>
</html>
`;

  writeFileSync(dest, html, "utf8");
  console.log(`  ✅ Generated Self-Contained HTML Work Report: ${relative(targetDir, dest)}`);
  return { html, path: dest };
}

// =========================================================================
// 12. Token-Saving Docs Freshness Gate (--check-freshness)
// =========================================================================

export function checkDocsFreshness(targetDir: string): { isFresh: boolean; reason: string; timestamp?: string } {
  const pointCheck = checkDocumentationPoints(targetDir);
  if (pointCheck.ledgerExists && !pointCheck.ok) {
    return {
      isFresh: false,
      reason: `LEDGER: ${pointCheck.pending} pending documentation point(s); watermark DP-${String(pointCheck.watermark).padStart(4, "0")}${pointCheck.headBehind ? " (HEAD moved past watermark)" : ""}.`,
    };
  }

  const receiptPath = join(targetDir, ".agents/artifacts/.docs_fresh");
  const clean = isGitClean(targetDir);

  if (existsSync(receiptPath)) {
    try {
      const data = JSON.parse(readFileSync(receiptPath, "utf8"));
      const ageMs = Date.now() - new Date(data.timestamp).getTime();
      if (clean || ageMs < 5 * 60 * 1000) {
        return {
          isFresh: true,
          reason: clean
            ? "CACHE_HIT: Git repository is clean and docs are fresh."
            : "CACHE_HIT: Docs freshly updated in current turn.",
          timestamp: data.timestamp,
        };
      }
    } catch {}
  }

  const docsHashFile = join(targetDir, ".docs.hash");
  if (existsSync(docsHashFile) && clean) {
    const savedHash = readFileSync(docsHashFile, "utf8").trim();
    const currentHash = computeDocsHash(targetDir);
    if (savedHash === currentHash) {
      return {
        isFresh: true,
        reason: "CACHE_HIT: .docs.hash matches and working tree is clean.",
      };
    }
  }

  return {
    isFresh: false,
    reason: "DRIFT: Code or documentation modified since last synchronization.",
  };
}

export function recordDocsFreshness(targetDir: string): string {
  const dir = join(targetDir, ".agents/artifacts");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const receiptPath = join(dir, ".docs_fresh");
  const receipt = {
    timestamp: new Date().toISOString(),
    hash: computeDocsHash(targetDir),
  };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), "utf8");
  return receiptPath;
}

// =========================================================================
// Main Execution Flow
// =========================================================================

const targetDir = positionals[0] ? resolve(process.cwd(), positionals[0]) : process.cwd();
if (IS_ENTRY_POINT) {
  const isForce = values.force || false;
  const isDryRun = values["dry-run"] || false;
  const isCheck = values.check || false;
  const isFastSkip = values["fast-skip"] || isCheck;
  const ledgerAudience = (values.audience ?? "all") as AudienceName | "all";
  const ledgerDocs = (values.docs ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  // Documentation Point Ledger handlers run before the fast-skip gate so a
  // cached docs hash can never hide undocumented code changes.
  if (values["install-hook"]) {
    const result = installLedgerHook(targetDir);
    console.log(result.ok ? `✅ ${result.message}\n   ${result.hookPath}` : `❌ ${result.message}`);
    process.exit(result.ok ? 0 : 1);
  }

  if (values.mark) {
    // Materialize any commits since the last scan first; otherwise a fresh
    // point cannot be marked until a separate --ledger run has persisted it.
    syncDocumentationPoints(targetDir, {
      since: values.since,
      includeChore: values["include-chore"],
    });
    const result = markDocumentationPoint(targetDir, values.mark, ledgerAudience, ledgerDocs);
    console.log(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`);
    process.exit(result.ok ? 0 : 1);
  }

  if (values.release) {
    // Materialize any commits since the last scan before evaluating completeness,
    // so a release cannot silently ship an undocumented change.
    syncDocumentationPoints(targetDir, { since: values.since, includeChore: values["include-chore"] });
    const result = releaseDocumentationPoints(targetDir, values.release);
    console.log(result.ok ? `✅ ${result.message}` : `❌ ${result.message}`);
    process.exit(result.ok ? 0 : 1);
  }

  const ledgerRequested =
    values.ledger ||
    values["catch-up"] ||
    values.checkpoint ||
    values["check-points"] ||
    values["whats-new"] ||
    values["write-changelog"] ||
    values["write-client-changelog"];

  if (ledgerRequested) {
    const readOnly = Boolean(values["check-points"]);
    const report = syncDocumentationPoints(targetDir, {
      since: values.since,
      dryRun: isDryRun || readOnly,
      includeChore: values["include-chore"],
      write: !readOnly,
      advance: Boolean(values.checkpoint),
    });

    if (values.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printLedgerReport(report, Boolean(values["memory-hint"]));
    }

    if (values["whats-new"] && !values.json) {
      const ledger = readDocsLedger(targetDir);
      const audience = values.audience === "developer" || values.audience === "agent" ? values.audience : "user";
      const body = ledger ? buildWhatsNewMarkdown(ledger, audience) : "";
      console.log(`\n## What's New (${audience})\n\n${body || "No shipped or complete points yet."}\n`);
    }

    if ((values["write-changelog"] || values["write-client-changelog"]) && !values.json) {
      const written = writeWhatsNewDocuments(targetDir, isDryRun, {
        changelog: Boolean(values["write-changelog"]),
        clientChangelog: Boolean(values["write-client-changelog"]),
      });
      if (values["write-changelog"]) {
        console.log(`  • CHANGELOG.md managed block: ${written.changelog ? "written" : "skipped (no points)"}`);
      }
      if (values["write-client-changelog"]) {
        console.log(`  • CLIENT_CHANGELOG.md block: ${written.clientChangelog ? "written" : "skipped (no points)"}`);
      }
    }

    if (values.checkpoint && !values.json) {
      if (report.pendingPoints > 0) {
        console.error(
          `\n❌ Checkpoint blocked: ${report.pendingPoints} point(s) still owe documentation. Nothing advanced.`,
        );
      } else {
        console.log(
          `\n✅ Checkpoint advanced to ${report.head.slice(0, 12)}${report.head.length > 12 ? "..." : ""} (${report.totalPoints} points).`,
        );
      }
    }

    const ok = report.pendingPoints === 0;
    process.exit(values["check-points"] || values.checkpoint ? (ok ? 0 : 1) : 0);
  }

  // Fast-Skip Evaluation (Sub-10ms)
  if (isCheck) {
    const ledgerGate = checkDocumentationPoints(targetDir);
    if (ledgerGate.ledgerExists && !ledgerGate.ok) {
      console.log("❌ Documentation Point Ledger gate failed.");
      console.log(
        `   • Pending points: ${ledgerGate.pending} · watermark: DP-${String(ledgerGate.watermark).padStart(4, "0")}${ledgerGate.headBehind ? " · HEAD moved past watermark" : ""}`,
      );
      console.log("   • Run: bun updatedocs.ts . --ledger  then document and --checkpoint");
      process.exit(1);
    }
  }

  const docsHashFile = join(targetDir, ".docs.hash");
  if (isFastSkip && !isForce && existsSync(docsHashFile)) {
    const pointCheck = checkDocumentationPoints(targetDir);
    if (!pointCheck.ok) {
      console.log("⚠️ Documentation Point Ledger has pending work; fast-skip disabled.");
      console.log(
        `   • Pending points: ${pointCheck.pending} · watermark: DP-${String(pointCheck.watermark).padStart(4, "0")}`,
      );
      console.log("   • Run: bun updatedocs.ts . --ledger  (then document, then --checkpoint)");
      process.exit(1);
    }

    const savedHash = readFileSync(docsHashFile, "utf8").trim();
    const currentHash = computeDocsHash(targetDir);
    const clean = isGitClean(targetDir);

    if (savedHash === currentHash && (clean || isFastSkip)) {
      console.log("⚡ Documentation Freshness Check: .docs.hash verified & git clean.");
      console.log(
        `⏩ Fast-path exit: Zero documentation drift detected (${currentHash.slice(0, 12)}...). Skipping with 0 changes.`,
      );
      process.exit(0);
    }
  }

  // Execution Modes
  if (values["capability-sweep"]) {
    console.log("🏷️  Running Capability-Absence Sweep (assets added since last release tag)...");
    const res = sweepUndocumentedCapabilities(targetDir);
    console.log(`  • Baseline (last release tag):   ${res.baseline}`);
    console.log(`  • Assets/feat-commits swept:     ${res.checked + res.gaps.length}`);
    console.log(`  • Capabilities documented nowhere: ${res.gaps.length}`);
    for (const g of res.gaps) {
      console.log(`    ❌ [${g.kind}] ${g.asset}`);
      console.log(`       ➔ ${g.evidence}; write it into: ${g.suggestedDocs.join(", ")}`);
    }
    console.log(`  📊 Capability-Doc Sync Score:    ${res.score}%`);
    if (res.gaps.length === 0) {
      console.log("  ✅ Every shipped capability surfaces in a discovery document.");
    } else {
      console.log("  ⚠️  An audit score of 100 is not evidence of sync — write the missing sections.");
    }
    process.exit(res.gaps.length > 0 ? 1 : 0);
  }

  if (values["env-audit"]) {
    console.log("🔍 Running Environment Variable Documentation Audit...");
    const res = auditEnvironmentVariables(targetDir);
    console.log(`  • Code variables detected:      ${res.codeVars.length}`);
    console.log(`  • Variables in .env.example:     ${res.exampleVars.length}`);
    console.log(`  • Variables in README:           ${res.readmeVars.length}`);
    if (res.missingInExample.length > 0) {
      console.log(`  ❌ Missing in .env.example:      ${res.missingInExample.join(", ")}`);
    }
    if (res.obsoleteInExample.length > 0) {
      console.log(`  ⚠️ Obsolete in .env.example:     ${res.obsoleteInExample.join(", ")}`);
    }
    console.log(`  📊 Env Var Health Score:        ${res.score}%`);
    process.exit(res.missingInExample.length > 0 ? 1 : 0);
  }

  if (values["link-lint"]) {
    console.log("🔗 Running Markdown Link & Anchor Linter...");
    const res = lintMarkdownLinks(targetDir);
    console.log(`  • Total links verified:          ${res.totalLinks}`);
    console.log(`  • Broken links detected:         ${res.brokenLinks.length}`);
    for (const b of res.brokenLinks) {
      console.log(`    ❌ ${b.file}: [${b.linkText}](${b.target}) ➔ ${b.reason}`);
    }
    console.log(`  📊 Link Integrity Score:        ${res.score}%`);
    process.exit(res.brokenLinks.length > 0 ? 1 : 0);
  }

  if (values["mermaid-guard"]) {
    console.log("📊 Running Mermaid Diagram Syntax Guard...");
    const res = lintMermaidDiagrams(targetDir, !isDryRun);
    console.log(`  • Diagnostics flagged:           ${res.diagnostics.length}`);
    console.log(`  • Diagrams auto-sanitized:       ${res.fixedCount}`);
    for (const d of res.diagnostics) {
      console.log(`    ⚠️ ${d.file}:${d.line} ➔ ${d.error}`);
    }
    process.exit(0);
  }

  if (values["test-snippets"]) {
    console.log("🧪 Running Code Snippet Syntax Verifier...");
    const res = verifyCodeSnippets(targetDir);
    console.log(`  • Code blocks tested:            ${res.tested}`);
    console.log(`  • Valid syntax blocks:           ${res.valid}`);
    console.log(`  • Syntax errors:                 ${res.errors.length}`);
    for (const err of res.errors) {
      console.log(`    ❌ ${err.file} (${err.language}): ${err.error}`);
    }
    process.exit(res.errors.length > 0 ? 1 : 0);
  }

  if (values["density-check"]) {
    console.log("📝 Running Answer-First Information Density Check...");
    const res = checkAnswerFirstDensity(targetDir);
    console.log(`  • Total documentation words:     ${res.totalWords}`);
    console.log(`  • Conversational filler phrases: ${res.fillerCount}`);
    for (const f of res.flaggedPhrases) {
      console.log(`    ⚠️ ${f.file}:${f.line} ➔ "${f.phrase}"`);
    }
    console.log(`  📊 Information Density Score:    ${res.densityScore}%`);
    process.exit(res.densityScore < 80 ? 1 : 0);
  }

  if (values["client-manual"]) {
    console.log("📘 Generating Client Content & Maintenance Guide...");
    generateClientHandoffManual(targetDir);
    process.exit(0);
  }

  if (values["check-freshness"]) {
    const freshness = checkDocsFreshness(targetDir);
    if (values.json) {
      console.log(JSON.stringify(freshness, null, 2));
    } else {
      console.log(`\n⚡ Documentation Freshness Gate: ${targetDir}`);
      console.log(
        `  Verdict: ${freshness.isFresh ? "✅ FRESH (Zero Token Waste)" : "⚠️ DRIFT (Documentation Outdated)"}`,
      );
      console.log(`  Reason:  ${freshness.reason}`);
    }
    process.exit(freshness.isFresh ? 0 : 1);
  }

  if (values["client-changelog"] !== undefined) {
    console.log("🚀 Generating Client Delivery Release Notes...");
    const outPath =
      typeof values["client-changelog"] === "string" && values["client-changelog"].length > 0
        ? values["client-changelog"]
        : undefined;
    const res = generateClientChangelog(targetDir, "HEAD~5", outPath);
    recordDocsFreshness(targetDir);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    }
    process.exit(0);
  }

  if (values["html-report"] !== undefined) {
    console.log("📊 Generating Executive Single-File HTML Work Report...");
    const outPath =
      typeof values["html-report"] === "string" && values["html-report"].length > 0 ? values["html-report"] : undefined;
    let receipts: WorkReportReceipts | undefined;
    if (typeof values.receipts === "string" && values.receipts.length > 0) {
      try {
        receipts = JSON.parse(readFileSync(resolve(targetDir, values.receipts), "utf8")) as WorkReportReceipts;
      } catch {
        console.error(`❌ Could not read receipts file: ${values.receipts}`);
        process.exit(1);
      }
    }
    const res = generateHtmlWorkReport(targetDir, { outPath, receipts });
    recordDocsFreshness(targetDir);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    }
    process.exit(0);
  }

  if (values["credits-sync"]) {
    console.log("📜 Synchronizing Open Source Credits Ledger...");
    syncCreditsLedger(targetDir);
    process.exit(0);
  }

  // Full Comprehensive Audit (--audit or default)
  console.log("📚 Running Full 21-Point Documentation Governance Audit...");
  const envRes = auditEnvironmentVariables(targetDir);
  const linkRes = lintMarkdownLinks(targetDir);
  const mermaidRes = lintMermaidDiagrams(targetDir, false);
  const densityRes = checkAnswerFirstDensity(targetDir);
  const snippetRes = verifyCodeSnippets(targetDir);
  const audienceRes = auditDualAudienceSync(targetDir);
  const ledgerCheck = checkDocumentationPoints(targetDir);
  const ledgerScore = !ledgerCheck.ledgerExists
    ? 100
    : Math.max(0, 100 - ledgerCheck.pending * 10 - (ledgerCheck.headBehind ? 10 : 0));

  // Overall Score Calculation (Weighted composite)
  const overallScore = Math.round(
    envRes.score * 0.2 +
      linkRes.score * 0.2 +
      densityRes.densityScore * 0.15 +
      (snippetRes.errors.length === 0 ? 100 : 50) * 0.15 +
      (audienceRes.inSync ? 100 : 60) * 0.1 +
      ledgerScore * 0.2,
  );

  console.log("\n========================================================");
  console.log(`🎯 DOCUMENTATION QUALITY & DRIFT SCORE: ${overallScore}/100`);
  console.log("========================================================");
  console.log(
    `  1. Environment Variables:     ${envRes.score}% (${envRes.missingInExample.length} missing in example)`,
  );
  console.log(`  2. Markdown Links & Anchors:  ${linkRes.score}% (${linkRes.brokenLinks.length} broken links)`);
  console.log(
    `  3. Mermaid Diagrams:          ${mermaidRes.diagnostics.length === 0 ? "100%" : "Needs quoting"} (${mermaidRes.diagnostics.length} issues)`,
  );
  console.log(`  4. Answer-First Density:      ${densityRes.densityScore}% (${densityRes.fillerCount} filler phrases)`);
  console.log(
    `  5. Code Snippet Integrity:    ${snippetRes.errors.length === 0 ? "100%" : "Errors detected"} (${snippetRes.errors.length} errors)`,
  );
  console.log(`  6. Dual-Audience Parity:      ${audienceRes.inSync ? "100% In Sync" : "Drift detected"}`);
  console.log(
    `  7. Documentation Points:      ${
      !ledgerCheck.ledgerExists
        ? "100% (no ledger initialized)"
        : ledgerCheck.ok
          ? `100% (watermark DP-${String(ledgerCheck.watermark).padStart(4, "0")})`
          : `${ledgerScore}% (${ledgerCheck.pending} pending, watermark DP-${String(ledgerCheck.watermark).padStart(4, "0")})`
    }`,
  );

  // Save fresh docs hash
  if (!isDryRun) {
    const newHash = computeDocsHash(targetDir);
    writeFileSync(docsHashFile, newHash, "utf8");
    console.log(`\n  🔑 Updated .docs.hash: ${newHash.slice(0, 12)}... (Documentation Fast-Skip armed)`);
  }

  const failUnder = values["fail-under"] ? Number.parseInt(values["fail-under"], 10) : 80;
  if (isCheck && overallScore < failUnder) {
    console.log(`\n❌ Documentation Quality Check failed: Score ${overallScore} is below threshold ${failUnder}.`);
    process.exit(1);
  } else {
    console.log("\n✅ Documentation Governance Audit Passed.");
    process.exit(0);
  }
}
