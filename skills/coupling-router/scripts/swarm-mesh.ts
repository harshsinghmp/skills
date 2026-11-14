#!/usr/bin/env bun

/**
 * swarm-mesh.ts — swarm mesh node identity, atomic task claim, lease heartbeat,
 * stale failover, and ledger reconciliation.
 *
 * `swarm-dispatcher.ts` decides which tasks may run in parallel; this script
 * decides which node runs each one, keeps claims alive, and proves afterwards
 * that every task ran exactly once.
 *
 * State layout (all under --state, default .agents/artifacts/swarm-mesh):
 *   plan.json           { planId, tasks: [{ id, name, dependsOn? }] }
 *   claims/<id>.json    TaskClaim (created with O_EXCL — atomic claim)
 *   claims/<id>.lock    transient takeover lock
 *   nodes/<id>.json     MeshNode identity + heartbeat
 *   ledger.json         last reconciled MeshLedger
 */

import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_STATE = join(".agents", "artifacts", "swarm-mesh");
const DEFAULT_TTL_SEC = 120;
const LOCK_TIMEOUT_MS = 5_000;
const LOCK_RETRY_MS = 4;
const MAX_WORKERS = 64;

export interface MeshTask {
  id: string;
  name: string;
  dependsOn?: string[];
}

export interface MeshPlan {
  planId: string;
  tasks: MeshTask[];
}

export interface ClaimHistoryEntry {
  nodeId: string;
  claimedAt: string;
  attempt: number;
  reason: "CLAIM" | "TAKEOVER" | "RECLAIM";
}

export interface TaskClaim {
  taskId: string;
  planId: string;
  planHash: string;
  nodeId: string;
  attempt: number;
  status: "CLAIMED" | "DONE" | "RELEASED";
  claimedAt: string;
  heartbeat: string;
  finishedAt?: string;
  history: ClaimHistoryEntry[];
}

export interface MeshNode {
  nodeId: string;
  pid: number;
  startedAt: string;
  heartbeat: string;
}

export type ClaimVerdict = "CLAIMED" | "ALREADY_HELD" | "STALE_TAKEOVER" | "RECLAIMED" | "NO_TASK";

export interface ClaimResult {
  verdict: ClaimVerdict;
  taskId?: string;
  attempt?: number;
  nodeId: string;
  skipped: string[];
}

export interface MeshAnomaly {
  code: "UNCLAIMED_TASK" | "ORPHAN_CLAIM" | "STALE_CLAIM" | "PLAN_DRIFT" | "UNKNOWN_NODE";
  taskId?: string;
  nodeId?: string;
  detail: string;
}

export interface MeshLedger {
  planId: string;
  planHash: string;
  total: number;
  completed: number;
  claimed: number;
  released: number;
  unclaimed: number;
  stale: number;
  byNode: Record<string, { claimed: number; completed: number }>;
  anomalies: MeshAnomaly[];
  reconciledAt: string;
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function sleepSync(ms: number): void {
  const bun = Bun as unknown as { sleepSync?: (delay: number) => void };
  if (typeof bun.sleepSync === "function") {
    bun.sleepSync(ms);
    return;
  }
  const until = Date.now() + ms;
  while (Date.now() < until) {
    // bounded busy wait for non-Bun runtimes
  }
}

export function sanitizeIdentifier(raw: string, label: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${label} must not be empty.`);
  if (!/^[A-Za-z0-9_.-]+$/.test(trimmed) || trimmed.startsWith(".") || trimmed.includes("..")) {
    throw new Error(`${label} "${raw}" is not a safe identifier (use [A-Za-z0-9_.-], no leading dot, no "..").`);
  }
  return trimmed;
}

export function meshPaths(stateDir: string) {
  const state = resolve(stateDir);
  return {
    state,
    plan: join(state, "plan.json"),
    claims: join(state, "claims"),
    nodes: join(state, "nodes"),
    ledger: join(state, "ledger.json"),
  };
}

function ensureState(stateDir: string) {
  const paths = meshPaths(stateDir);
  mkdirSync(paths.claims, { recursive: true });
  mkdirSync(paths.nodes, { recursive: true });
  return paths;
}

function writeJsonAtomic(file: string, value: unknown): void {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

export function computePlanHash(plan: MeshPlan): string {
  const canonical = [...plan.tasks]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((task) => [task.id, task.name, [...(task.dependsOn ?? [])].sort()]);
  return createHash("sha256")
    .update(JSON.stringify([plan.planId, canonical]))
    .digest("hex");
}

export function validatePlan(plan: MeshPlan): string[] {
  const problems: string[] = [];
  if (!plan || typeof plan.planId !== "string" || !plan.planId.trim()) problems.push("planId is required.");
  if (!Array.isArray(plan?.tasks) || plan.tasks.length === 0) {
    problems.push("tasks must be a non-empty array.");
    return problems;
  }
  const ids = new Set<string>();
  for (const task of plan.tasks) {
    try {
      sanitizeIdentifier(task.id, "task id");
    } catch (error) {
      problems.push((error as Error).message);
      continue;
    }
    if (ids.has(task.id)) problems.push(`duplicate task id "${task.id}".`);
    ids.add(task.id);
  }
  for (const task of plan.tasks) {
    for (const dep of task.dependsOn ?? []) {
      if (!ids.has(dep)) problems.push(`task "${task.id}" depends on unknown task "${dep}".`);
    }
  }
  return problems;
}

export function readPlan(stateDir: string): MeshPlan {
  const paths = meshPaths(stateDir);
  if (!existsSync(paths.plan)) {
    throw new Error(`No plan at ${paths.plan}. Run "init --state <dir> --plan <file>" first.`);
  }
  const plan = JSON.parse(readFileSync(paths.plan, "utf8")) as MeshPlan;
  const problems = validatePlan(plan);
  if (problems.length > 0) throw new Error(`Invalid plan: ${problems.join(" ")}`);
  return plan;
}

export function initMeshFromPlan(
  stateDir: string,
  plan: MeshPlan,
): { state: string; planId: string; tasks: number; planHash: string } {
  const problems = validatePlan(plan);
  if (problems.length > 0) throw new Error(`Invalid plan: ${problems.join(" ")}`);
  const paths = ensureState(stateDir);
  writeJsonAtomic(paths.plan, plan);
  return { state: paths.state, planId: plan.planId, tasks: plan.tasks.length, planHash: computePlanHash(plan) };
}

export function initMesh(
  stateDir: string,
  planFile: string,
): { state: string; planId: string; tasks: number; planHash: string } {
  const plan = JSON.parse(readFileSync(resolve(planFile), "utf8")) as MeshPlan;
  return initMeshFromPlan(stateDir, plan);
}

function claimPath(stateDir: string, taskId: string): string {
  return join(meshPaths(stateDir).claims, `${sanitizeIdentifier(taskId, "task id")}.json`);
}

function readClaim(stateDir: string, taskId: string): TaskClaim | undefined {
  const file = claimPath(stateDir, taskId);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as TaskClaim;
  } catch {
    return undefined;
  }
}

function listClaims(stateDir: string): TaskClaim[] {
  const dir = meshPaths(stateDir).claims;
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      try {
        return JSON.parse(readFileSync(join(dir, file), "utf8")) as TaskClaim;
      } catch {
        return undefined;
      }
    })
    .filter((claim): claim is TaskClaim => Boolean(claim));
}

export function registerNode(stateDir: string, nodeId: string): MeshNode {
  const id = sanitizeIdentifier(nodeId, "node id");
  const paths = ensureState(stateDir);
  const file = join(paths.nodes, `${id}.json`);
  if (existsSync(file)) {
    try {
      const existing = JSON.parse(readFileSync(file, "utf8")) as MeshNode;
      const refreshed = { ...existing, pid: process.pid, heartbeat: nowIso() };
      writeJsonAtomic(file, refreshed);
      return refreshed;
    } catch {
      // fall through and rewrite a corrupt record
    }
  }
  const node: MeshNode = { nodeId: id, pid: process.pid, startedAt: nowIso(), heartbeat: nowIso() };
  writeJsonAtomic(file, node);
  return node;
}

function withLock<T>(lockFile: string, fn: () => T): T {
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let fd: number | undefined;
  for (;;) {
    try {
      fd = openSync(lockFile, "wx");
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() >= deadline) {
        // A killed holder leaves a lock behind; clear it exactly once and retry.
        rmSync(lockFile, { force: true });
        continue;
      }
      sleepSync(LOCK_RETRY_MS);
    }
  }
  try {
    return fn();
  } finally {
    if (fd !== undefined) closeSync(fd);
    rmSync(lockFile, { force: true });
  }
}

function heartbeatAgeSeconds(claim: TaskClaim, now = Date.now()): number {
  const beat = Date.parse(claim.heartbeat);
  if (Number.isNaN(beat)) return Number.POSITIVE_INFINITY;
  return (now - beat) / 1000;
}

export function isStale(claim: TaskClaim, ttlSec: number, now = Date.now()): boolean {
  return claim.status === "CLAIMED" && heartbeatAgeSeconds(claim, now) > ttlSec;
}

function buildClaim(
  task: MeshTask,
  plan: MeshPlan,
  planHash: string,
  nodeId: string,
  attempt: number,
  reason: ClaimHistoryEntry["reason"],
  previous?: TaskClaim,
): TaskClaim {
  const stamp = nowIso();
  const history = [...(previous?.history ?? []), { nodeId, claimedAt: stamp, attempt, reason }];
  return {
    taskId: task.id,
    planId: plan.planId,
    planHash,
    nodeId,
    attempt,
    status: "CLAIMED",
    claimedAt: stamp,
    heartbeat: stamp,
    history,
  };
}

export function claimTask(
  stateDir: string,
  nodeId: string,
  options: { taskId?: string; ttlSec?: number } = {},
): ClaimResult {
  const id = sanitizeIdentifier(nodeId, "node id");
  const ttlSec = options.ttlSec ?? DEFAULT_TTL_SEC;
  const plan = readPlan(stateDir);
  ensureState(stateDir);
  registerNode(stateDir, id);

  const planHash = computePlanHash(plan);
  const candidates = options.taskId ? plan.tasks.filter((task) => task.id === options.taskId) : plan.tasks;
  if (options.taskId && candidates.length === 0) {
    throw new Error(`Unknown task "${options.taskId}" (not in plan ${plan.planId}).`);
  }

  const skipped: string[] = [];
  for (const task of candidates) {
    const file = claimPath(stateDir, task.id);

    // Fast path: exclusive create wins the race for an unclaimed task.
    if (!existsSync(file)) {
      try {
        const fd = openSync(file, "wx");
        try {
          const claim = buildClaim(task, plan, planHash, id, 1, "CLAIM");
          writeSync(fd, `${JSON.stringify(claim, null, 2)}\n`);
        } finally {
          closeSync(fd);
        }
        return { verdict: "CLAIMED", taskId: task.id, attempt: 1, nodeId: id, skipped };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        // Another node created it between existsSync and open — fall through.
      }
    }

    const current = readClaim(stateDir, task.id);
    if (!current) {
      // Mid-creation by another process; treat as held for this pass.
      skipped.push(task.id);
      continue;
    }
    if (current.status === "DONE") continue;
    if (current.status === "CLAIMED" && current.nodeId === id) {
      return { verdict: "ALREADY_HELD", taskId: task.id, attempt: current.attempt, nodeId: id, skipped };
    }
    if (current.status === "CLAIMED" && !isStale(current, ttlSec)) {
      skipped.push(task.id);
      continue;
    }

    // Released or stale: take over under the lock, re-reading inside it.
    const lockFile = `${file.replace(/\.json$/, "")}.lock`;
    const outcome = withLock(lockFile, () => {
      const latest = readClaim(stateDir, task.id);
      if (!latest) return { verdict: "NO_TASK" as ClaimVerdict };
      if (latest.status === "DONE") return { verdict: "NO_TASK" as ClaimVerdict };
      if (latest.status === "CLAIMED" && latest.nodeId !== id && !isStale(latest, ttlSec)) {
        return { verdict: "NO_TASK" as ClaimVerdict };
      }
      const reason: ClaimHistoryEntry["reason"] = latest.status === "RELEASED" ? "RECLAIM" : "TAKEOVER";
      const claim = buildClaim(task, plan, planHash, id, latest.attempt + 1, reason, latest);
      writeJsonAtomic(file, claim);
      return {
        verdict: reason === "RECLAIM" ? ("RECLAIMED" as ClaimVerdict) : ("STALE_TAKEOVER" as ClaimVerdict),
        attempt: claim.attempt,
      };
    });

    if (outcome.verdict === "NO_TASK") {
      skipped.push(task.id);
      continue;
    }
    return {
      verdict: outcome.verdict,
      taskId: task.id,
      attempt: outcome.attempt,
      nodeId: id,
      skipped,
    };
  }

  return { verdict: "NO_TASK", nodeId: id, skipped };
}

function requireHeldBy(stateDir: string, nodeId: string, taskId: string): TaskClaim {
  const claim = readClaim(stateDir, taskId);
  if (!claim) throw new Error(`Task "${taskId}" has no claim.`);
  if (claim.nodeId !== nodeId) {
    throw new Error(`Task "${taskId}" is held by ${claim.nodeId} (attempt ${claim.attempt}), not ${nodeId}.`);
  }
  return claim;
}

export function heartbeatTask(stateDir: string, nodeId: string, taskId: string): TaskClaim {
  const id = sanitizeIdentifier(nodeId, "node id");
  const current = requireHeldBy(stateDir, id, taskId);
  if (current.status !== "CLAIMED") throw new Error(`Task "${taskId}" is ${current.status}; nothing to heartbeat.`);
  const next = { ...current, heartbeat: nowIso() };
  writeJsonAtomic(claimPath(stateDir, taskId), next);
  registerNode(stateDir, id);
  return next;
}

export function completeTask(stateDir: string, nodeId: string, taskId: string): TaskClaim {
  const id = sanitizeIdentifier(nodeId, "node id");
  const current = requireHeldBy(stateDir, id, taskId);
  if (current.status === "DONE") return current;
  const stamp = nowIso();
  const next: TaskClaim = { ...current, status: "DONE", heartbeat: stamp, finishedAt: stamp };
  writeJsonAtomic(claimPath(stateDir, taskId), next);
  return next;
}

export function releaseTask(stateDir: string, nodeId: string, taskId: string): TaskClaim {
  const id = sanitizeIdentifier(nodeId, "node id");
  const current = requireHeldBy(stateDir, id, taskId);
  if (current.status === "DONE") throw new Error(`Task "${taskId}" is already DONE; cannot release.`);
  const next: TaskClaim = { ...current, status: "RELEASED", heartbeat: nowIso() };
  writeJsonAtomic(claimPath(stateDir, taskId), next);
  return next;
}

export function reconcileMesh(stateDir: string, options: { ttlSec?: number } = {}): MeshLedger {
  const ttlSec = options.ttlSec ?? DEFAULT_TTL_SEC;
  const plan = readPlan(stateDir);
  const paths = ensureState(stateDir);
  const planHash = computePlanHash(plan);
  const claims = listClaims(stateDir);
  const byTaskId = new Map(claims.map((claim) => [claim.taskId, claim]));
  const nodes = new Set(
    existsSync(paths.nodes)
      ? readdirSync(paths.nodes)
          .filter((file) => file.endsWith(".json"))
          .map((file) => file.replace(/\.json$/, ""))
      : [],
  );

  const anomalies: MeshAnomaly[] = [];
  const byNode: MeshLedger["byNode"] = {};
  let completed = 0;
  let claimed = 0;
  let released = 0;
  let unclaimed = 0;
  let stale = 0;

  for (const task of plan.tasks) {
    const claim = byTaskId.get(task.id);
    if (!claim) {
      unclaimed += 1;
      anomalies.push({ code: "UNCLAIMED_TASK", taskId: task.id, detail: "No node ever claimed this task." });
      continue;
    }
    byTaskId.delete(task.id);
    if (claim.planHash !== planHash) {
      anomalies.push({
        code: "PLAN_DRIFT",
        taskId: task.id,
        nodeId: claim.nodeId,
        detail: `Claim was taken against plan hash ${claim.planHash.slice(0, 12)}; current plan is ${planHash.slice(0, 12)}.`,
      });
    }
    if (!nodes.has(claim.nodeId)) {
      anomalies.push({
        code: "UNKNOWN_NODE",
        taskId: task.id,
        nodeId: claim.nodeId,
        detail: "Claiming node has no node record.",
      });
    }
    const stats = byNode[claim.nodeId] ?? { claimed: 0, completed: 0 };
    stats.claimed += 1;
    if (claim.status === "DONE") {
      completed += 1;
      stats.completed += 1;
    } else if (claim.status === "RELEASED") {
      released += 1;
    } else if (isStale(claim, ttlSec)) {
      stale += 1;
      anomalies.push({
        code: "STALE_CLAIM",
        taskId: task.id,
        nodeId: claim.nodeId,
        detail: `Heartbeat expired ${Math.round(heartbeatAgeSeconds(claim))}s ago (ttl ${ttlSec}s); the node died mid-task.`,
      });
    } else {
      claimed += 1;
    }
    byNode[claim.nodeId] = stats;
  }

  for (const orphan of byTaskId.values()) {
    anomalies.push({
      code: "ORPHAN_CLAIM",
      taskId: orphan.taskId,
      nodeId: orphan.nodeId,
      detail: "Claim exists for a task absent from the current plan.",
    });
  }

  const ledger: MeshLedger = {
    planId: plan.planId,
    planHash,
    total: plan.tasks.length,
    completed,
    claimed,
    released,
    unclaimed,
    stale,
    byNode,
    anomalies,
    reconciledAt: nowIso(),
  };
  writeJsonAtomic(paths.ledger, ledger);
  return ledger;
}

export function meshStatus(
  stateDir: string,
  options: { ttlSec?: number } = {},
): {
  planId: string;
  tasks: number;
  nodes: MeshNode[];
  claims: Array<{ taskId: string; nodeId: string; attempt: number; status: TaskClaim["status"]; stale: boolean }>;
} {
  const plan = readPlan(stateDir);
  const paths = ensureState(stateDir);
  const ttlSec = options.ttlSec ?? DEFAULT_TTL_SEC;
  const nodes = readdirSync(paths.nodes)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(paths.nodes, file), "utf8")) as MeshNode);
  const claims = listClaims(stateDir).map((claim) => ({
    taskId: claim.taskId,
    nodeId: claim.nodeId,
    attempt: claim.attempt,
    status: claim.status,
    stale: isStale(claim, ttlSec),
  }));
  return { planId: plan.planId, tasks: plan.tasks.length, nodes, claims };
}

export function runWorker(
  stateDir: string,
  nodeId: string,
  ttlSec = DEFAULT_TTL_SEC,
  barrier?: { readyDir: string; goFile: string },
): string[] {
  if (barrier) {
    // Start gate: every worker announces readiness, then waits for the parent's
    // go signal, so the simulation contends on claims instead of racing boots.
    registerNode(stateDir, nodeId);
    mkdirSync(barrier.readyDir, { recursive: true });
    writeFileSync(join(barrier.readyDir, sanitizeIdentifier(nodeId, "node id")), "ready\n");
    const deadline = Date.now() + 15_000;
    while (!existsSync(barrier.goFile)) {
      if (Date.now() > deadline) throw new Error(`${nodeId} timed out waiting for the go signal.`);
      sleepSync(LOCK_RETRY_MS);
    }
  }

  const worked: string[] = [];
  for (;;) {
    const result = claimTask(stateDir, nodeId, { ttlSec });
    if (result.verdict === "NO_TASK") break;
    const taskId = result.taskId as string;
    try {
      completeTask(stateDir, nodeId, taskId);
      worked.push(taskId);
    } catch {
      // Lost the claim to a takeover between claim and complete: move on.
      break;
    }
  }
  return worked;
}

export async function runMeshSimulation(
  stateDir: string,
  workers: number,
  ttlSec = DEFAULT_TTL_SEC,
): Promise<{ exitCodes: number[]; worked: Record<string, string[]>; ledger: MeshLedger }> {
  if (!Number.isInteger(workers) || workers < 1 || workers > MAX_WORKERS) {
    throw new Error(`--workers must be an integer between 1 and ${MAX_WORKERS}.`);
  }
  const self = (import.meta as unknown as { path?: string }).path ?? process.argv[1];
  const paths = ensureState(stateDir);
  const readyDir = join(paths.state, "sim-ready");
  const goFile = join(paths.state, "sim-go");
  rmSync(readyDir, { recursive: true, force: true });
  rmSync(goFile, { force: true });
  mkdirSync(readyDir, { recursive: true });

  const processes = Array.from({ length: workers }, (_, index) =>
    Bun.spawn(
      [
        "bun",
        self,
        "worker",
        "--state",
        stateDir,
        "--node",
        `worker-${index + 1}`,
        "--ttl",
        String(ttlSec),
        "--await-ready",
        readyDir,
        "--go",
        goFile,
      ],
      { stdout: "pipe", stderr: "pipe" },
    ),
  );

  // Release the gate only once every worker has booted and registered.
  const readyDeadline = Date.now() + 20_000;
  while (readdirSync(readyDir).length < workers) {
    if (Date.now() > readyDeadline) break;
    await Bun.sleep(LOCK_RETRY_MS);
  }
  writeFileSync(goFile, "go\n");

  const exitCodes = await Promise.all(processes.map((proc) => proc.exited));
  rmSync(readyDir, { recursive: true, force: true });
  rmSync(goFile, { force: true });
  const worked: Record<string, string[]> = {};
  for (const [index, proc] of processes.entries()) {
    const text = await new Response(proc.stdout).text();
    worked[`worker-${index + 1}`] = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("work: "))
      .map((line) => line.slice(6));
  }
  return { exitCodes, worked, ledger: reconcileMesh(stateDir, { ttlSec }) };
}

function emit(value: unknown, json: boolean, human: () => void): void {
  if (json) console.log(JSON.stringify(value, null, 2));
  else human();
}

function usage(): never {
  console.error(`swarm-mesh — node identity, atomic claim, lease heartbeat, ledger reconciliation

Usage:
  swarm-mesh.ts init      --state <dir> --plan <tasks.json>
  swarm-mesh.ts claim     --state <dir> --node <id> [--task <id>] [--ttl <sec>] [--json]
  swarm-mesh.ts beat      --state <dir> --node <id> --task <id> [--json]
  swarm-mesh.ts complete  --state <dir> --node <id> --task <id> [--json]
  swarm-mesh.ts release   --state <dir> --node <id> --task <id> [--json]
  swarm-mesh.ts worker    --state <dir> --node <id> [--ttl <sec>]
  swarm-mesh.ts simulate  --state <dir> --workers <n> [--ttl <sec>] [--json]
  swarm-mesh.ts reconcile --state <dir> [--ttl <sec>] [--json]
  swarm-mesh.ts status    --state <dir> [--ttl <sec>] [--json]`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      state: { type: "string", default: DEFAULT_STATE },
      plan: { type: "string", default: "" },
      node: { type: "string", default: "" },
      task: { type: "string", default: "" },
      ttl: { type: "string", default: String(DEFAULT_TTL_SEC) },
      workers: { type: "string", default: "2" },
      "await-ready": { type: "string", default: "" },
      go: { type: "string", default: "" },
      json: { type: "boolean", default: false },
    },
    allowPositionals: true,
    strict: false,
  });
  const command = positionals[0];
  if (!command) usage();

  const stateDir = String(values.state ?? DEFAULT_STATE);
  const ttlRaw = Number(values.ttl);
  if (!Number.isFinite(ttlRaw) || ttlRaw <= 0) usage();
  const ttlSec = ttlRaw;
  const nodeId = String(values.node ?? "");
  const taskId = String(values.task ?? "");
  const json = Boolean(values.json);

  try {
    switch (command) {
      case "init": {
        if (!values.plan) usage();
        const result = initMesh(stateDir, String(values.plan));
        emit(result, json, () => {
          console.log(`✅ Initialized mesh "${result.planId}" with ${result.tasks} task(s) at ${result.state}`);
        });
        return;
      }
      case "claim": {
        if (!nodeId) usage();
        const result = claimTask(stateDir, nodeId, { taskId: taskId || undefined, ttlSec });
        emit(result, json, () => {
          if (result.verdict === "NO_TASK") {
            console.log(
              `⏸️  NO_TASK for ${result.nodeId}${result.skipped.length ? ` (held: ${result.skipped.join(", ")})` : ""}`,
            );
          } else {
            console.log(`${result.verdict} — node=${result.nodeId} task=${result.taskId} attempt=${result.attempt}`);
          }
        });
        process.exit(result.verdict === "NO_TASK" ? 1 : 0);
        return;
      }
      case "beat": {
        if (!nodeId || !taskId) usage();
        const claim = heartbeatTask(stateDir, nodeId, taskId);
        emit(claim, json, () =>
          console.log(`💓 heartbeat refreshed — task=${claim.taskId} heartbeat=${claim.heartbeat}`),
        );
        return;
      }
      case "complete": {
        if (!nodeId || !taskId) usage();
        const claim = completeTask(stateDir, nodeId, taskId);
        emit(claim, json, () =>
          console.log(`✅ DONE — task=${claim.taskId} node=${claim.nodeId} attempt=${claim.attempt}`),
        );
        return;
      }
      case "release": {
        if (!nodeId || !taskId) usage();
        const claim = releaseTask(stateDir, nodeId, taskId);
        emit(claim, json, () => console.log(`🔓 RELEASED — task=${claim.taskId} (claimable again)`));
        return;
      }
      case "worker": {
        if (!nodeId) usage();
        const readyDir = String(values["await-ready"] ?? "");
        const goFile = String(values.go ?? "");
        const barrier = readyDir && goFile ? { readyDir, goFile } : undefined;
        const worked = runWorker(stateDir, nodeId, ttlSec, barrier);
        for (const id of worked) console.log(`work: ${id}`);
        return;
      }
      case "simulate": {
        const workers = Number(values.workers);
        const result = await runMeshSimulation(stateDir, workers, ttlSec);
        emit(result, json, () => {
          console.log(`🧪 Simulation complete — workers=${workers} exits=${result.exitCodes.join(",")}`);
          for (const [node, tasks] of Object.entries(result.worked)) {
            console.log(`   • ${node}: ${tasks.length} task(s) ${tasks.join(", ")}`);
          }
          console.log(
            `   • ledger: ${result.ledger.completed}/${result.ledger.total} done, ${result.ledger.anomalies.length} anomaly(ies)`,
          );
        });
        const clean = result.exitCodes.every((code) => code === 0) && result.ledger.anomalies.length === 0;
        process.exit(clean ? 0 : 1);
        return;
      }
      case "reconcile": {
        const ledger = reconcileMesh(stateDir, { ttlSec });
        emit(ledger, json, () => {
          console.log(
            `🧾 ${ledger.planId}: ${ledger.completed}/${ledger.total} done · ${ledger.claimed} claimed · ${ledger.released} released · ${ledger.unclaimed} unclaimed · ${ledger.stale} stale`,
          );
          for (const [node, stats] of Object.entries(ledger.byNode)) {
            console.log(`   • ${node}: claimed ${stats.claimed}, completed ${stats.completed}`);
          }
          if (ledger.anomalies.length === 0) {
            console.log("✅ reconciled — every task ran exactly once");
          } else {
            for (const anomaly of ledger.anomalies) {
              console.error(
                `❌ ${anomaly.code} ${anomaly.taskId ?? ""}${anomaly.nodeId ? ` (${anomaly.nodeId})` : ""}: ${anomaly.detail}`,
              );
            }
          }
        });
        process.exit(ledger.anomalies.length === 0 ? 0 : 1);
        return;
      }
      case "status": {
        const status = meshStatus(stateDir, { ttlSec });
        emit(status, json, () => {
          console.log(`🕸️  ${status.planId}: ${status.tasks} task(s), ${status.nodes.length} node(s)`);
          for (const claim of status.claims) {
            console.log(
              `   • ${claim.taskId}: ${claim.status} by ${claim.nodeId} attempt ${claim.attempt}${claim.stale ? " (STALE)" : ""}`,
            );
          }
        });
        return;
      }
      default:
        usage();
    }
  } catch (error) {
    console.error(`❌ ${(error as Error).message || String(error)}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
