#!/usr/bin/env bun
/**
 * worktree-lease.ts — one-command gate for the shared-worktree lease protocol.
 *
 * Implements the decision logic of coupling-router/references/worktree-lease-protocol.md §2:
 *   probe  → ACQUIRE (write lease), DEFER (fresh heartbeat), or TAKEOVER (stale heartbeat)
 *   hold   → refresh the heartbeat (run at milestones)
 *   release→ delete the lease, leaving the worktree free
 *
 * Usage:
 *   bun worktree-lease.ts probe --owner <id> --scope "<paths>"
 *   bun worktree-lease.ts probe            # read-only verdict, no writes
 *   bun worktree-lease.ts hold             # refresh heartbeat (holder only)
 *   bun worktree-lease.ts release          # delete lease (holder only)
 *
 * Exit codes: 0 = free-to-mutate (ACQUIRE taken or already held),
 *             1 = DEFER (fresh foreign lease — do not mutate shared state),
 *             2 = usage/parse error.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";

const LEASE_PATH = join(".agents", "artifacts", "WORKTREE-LEASE.md");
const WINDOW_MIN = 30;

type Verdict = "ACQUIRE" | "HELD" | "DEFER" | "TAKEOVER";

interface LeaseInfo {
  owner: string | null;
  branch: string | null;
  heartbeat: Date | null;
  raw: string;
}

function readLease(): LeaseInfo | null {
  if (!existsSync(LEASE_PATH)) return null;
  const raw = readFileSync(LEASE_PATH, "utf8");
  const field = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, "m").exec(raw)?.[1]?.trim() ?? null;
  const hb = field("heartbeat");
  return {
    owner: field("owner"),
    branch: field("branch"),
    heartbeat: hb ? new Date(hb) : null,
    raw,
  };
}

function ageMinutes(l: LeaseInfo): number {
  if (!l.heartbeat || Number.isNaN(l.heartbeat.getTime())) return Infinity;
  return (Date.now() - l.heartbeat.getTime()) / 60_000;
}

function argValue(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** The lease dir is gitignored and may not exist on a fresh checkout or foreign project. */
function writeLease(body: string): void {
  mkdirSync(dirname(LEASE_PATH), { recursive: true });
  writeFileSync(LEASE_PATH, body);
}

function acquire(owner: string, scope: string): void {
  const branch = execGit("rev-parse --abbrev-ref HEAD") ?? "unknown";
  const body = [
    "# WORKTREE LEASE",
    `owner: ${owner}`,
    `branch: ${branch}`,
    `acquired: ${nowIso()}`,
    `heartbeat: ${nowIso()}`,
    `scope: ${scope || "unspecified"}`,
    "notes: none",
    "",
  ].join("\n");
  writeLease(body);
}

function refreshHeartbeat(): void {
  const l = readLease();
  if (!l) fail("hold: no lease to refresh");
  writeLease(l.raw.replace(/^heartbeat:.*$/m, `heartbeat: ${nowIso()}`));
}

function takeover(l: LeaseInfo, owner: string, scope: string): void {
  const branch = execGit("rev-parse --abbrev-ref HEAD") ?? "unknown";
  const body = [
    "# WORKTREE LEASE",
    `owner: ${owner}`,
    `branch: ${branch}`,
    `acquired: ${nowIso()}`,
    `heartbeat: ${nowIso()}`,
    `scope: ${scope || "unspecified"}`,
    `notes: took over from ${l.owner ?? "unknown"} (stale heartbeat >${WINDOW_MIN}m); preserve any WIP they recorded`,
    "",
  ].join("\n");
  writeLease(body);
}

function execGit(args: string): string | null {
  try {
    return Bun.spawnSync(["git", ...args.split(" ")], { stdout: "pipe" }).stdout.toString().trim() || null;
  } catch {
    return null;
  }
}

function fail(msg: string): never {
  console.error(`[worktree-lease] ${msg}`);
  process.exit(2);
}

// ── dispatch ──
const cmd = process.argv[2];
const owner = argValue("--owner") ?? "anonymous-session";
const scope = argValue("--scope") ?? "";

if (cmd === "release") {
  if (existsSync(LEASE_PATH)) unlinkSync(LEASE_PATH);
  console.log("[worktree-lease] released — lease absent, worktree free");
  process.exit(0);
}

if (cmd === "hold") {
  refreshHeartbeat();
  console.log(`[worktree-lease] heartbeat refreshed at ${nowIso()}`);
  process.exit(0);
}

if (cmd !== "probe") fail("usage: worktree-lease.ts probe|hold|release [--owner id] [--scope paths]");

const lease = readLease();
if (!lease) {
  if (process.argv.includes("--dry-run")) {
    console.log("[worktree-lease] ACQUIRE (no lease present; --dry-run: not written)");
    process.exit(0);
  }
  acquire(owner, scope);
  console.log(`[worktree-lease] ACQUIRED — owner=${owner}, scope=${scope || "unspecified"}`);
  console.log("[worktree-lease] You are clear to mutate git state. Refresh with `hold` at milestones; `release` at close.");
  process.exit(0);
}

const age = ageMinutes(lease);
if (age <= WINDOW_MIN) {
  console.log(`[worktree-lease] DEFER — held by ${lease.owner} (heartbeat ${Math.round(age)}m old ≤ ${WINDOW_MIN}m).`);
  console.log("[worktree-lease] Take a separate `git worktree add`, stay read-only, or wait. Do NOT switch branches, touch stashes, or stage shared files.");
  process.exit(1);
}

console.log(`[worktree-lease] TAKEOVER — ${lease.owner}'s heartbeat is ${Math.round(age)}m old (> ${WINDOW_MIN}m, presumed dead).`);
if (process.argv.includes("--dry-run")) process.exit(0);
takeover(lease, owner, scope);
console.log(`[worktree-lease] Lease taken over by ${owner}. Preserve any WIP recorded in the previous lease's notes.`);
process.exit(0);
