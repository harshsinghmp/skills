#!/usr/bin/env bun
/**
 * swarm-dispatcher.ts: Multi-Agent Consensus & DAG Wave Dispatcher
 *
 * Implements SWM-001 through SWM-004:
 *   - SWM-001: DAG Wave Partitioning (topological execution waves, cycle detection)
 *   - SWM-002: Byzantine Consensus Quorum (>= 3 agents, > 66% agreement on critical seams)
 *   - SWM-003: Global Token Budget Arbiter (enforces session ceiling, tracks burn rate)
 *   - SWM-004: Fast-Fail Dependent Pruning (skips all downstream dependents on parent failure)
 *
 * Usage:
 *   bun swarm-dispatcher.ts --plan <task-dag.json> [--max-tokens 250000] [--quorum 3] [--json]
 *   bun swarm-dispatcher.ts --simulate --plan <task-dag.json> [--json]
 */

import fs from "node:fs";
import { parseArgs } from "node:util";
import {
  claimTask,
  completeTask,
  initMeshFromPlan,
  type MeshLedger,
  type MeshPlan,
  reconcileMesh,
  releaseTask,
} from "./swarm-mesh";

// =========================================================================
// Interfaces & Types
// =========================================================================

export interface SwarmTask {
  id: string;
  name: string;
  dependsOn?: string[];
  estimatedTokens?: number;
  criticalSeam?: boolean;
  assignedDivision?: "Sol" | "Jasper" | "Crew" | "Nexus";
}

export interface SwarmPlan {
  planId: string;
  maxTokenCeiling?: number;
  requiredQuorum?: number;
  tasks: SwarmTask[];
}

export interface TaskExecutionResult {
  taskId: string;
  name: string;
  waveIndex: number;
  status: "COMPLETED" | "FAILED" | "FAILED_CONSENSUS" | "SKIPPED_UPSTREAM_FAILURE";
  tokensBurned: number;
  consensusVote?: {
    totalVotes: number;
    approvals: number;
    passed: boolean;
    agreementRate: number;
  };
  reason?: string;
}

export interface SwarmWave {
  waveIndex: number;
  taskIds: string[];
  tasks: SwarmTask[];
  projectedTokens: number;
}

export interface SwarmExecutionLedger {
  planId: string;
  totalWaves: number;
  waves: SwarmWave[];
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  totalTokensBurned: number;
  tokenCeiling: number;
  budgetExhausted: boolean;
  results: TaskExecutionResult[];
  summary: string;
}

// =========================================================================
// SWM-001: Topological DAG Wave Partitioning & Cycle Detection
// =========================================================================

export function partitionDagIntoWaves(tasks: SwarmTask[]): {
  waves: SwarmWave[];
  isValid: boolean;
  error?: string;
} {
  const taskMap = new Map<string, SwarmTask>();
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const t of tasks) {
    taskMap.set(t.id, t);
    inDegree.set(t.id, (t.dependsOn || []).length);
    dependents.set(t.id, []);
  }

  for (const t of tasks) {
    for (const depId of t.dependsOn || []) {
      if (!taskMap.has(depId)) {
        return {
          waves: [],
          isValid: false,
          error: `Missing dependency: task '${t.id}' depends on non-existent task '${depId}'.`,
        };
      }
      dependents.get(depId)?.push(t.id);
    }
  }

  // Find initial 0 in-degree tasks
  let currentWaveTasks: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) currentWaveTasks.push(id);
  }

  const waves: SwarmWave[] = [];
  let processedCount = 0;
  let waveIndex = 1;

  while (currentWaveTasks.length > 0) {
    const waveItems: SwarmTask[] = currentWaveTasks
      .map((id) => taskMap.get(id))
      .filter((t): t is SwarmTask => Boolean(t));
    const projectedTokens = waveItems.reduce((acc, t) => acc + (t.estimatedTokens || 5000), 0);

    waves.push({
      waveIndex,
      taskIds: [...currentWaveTasks],
      tasks: waveItems,
      projectedTokens,
    });

    processedCount += currentWaveTasks.length;
    const nextWaveTasks: string[] = [];

    for (const completedId of currentWaveTasks) {
      for (const childId of dependents.get(completedId) || []) {
        const remainingInDegree = (inDegree.get(childId) ?? 1) - 1;
        inDegree.set(childId, remainingInDegree);
        if (remainingInDegree === 0) {
          nextWaveTasks.push(childId);
        }
      }
    }

    currentWaveTasks = nextWaveTasks;
    waveIndex++;
  }

  if (processedCount < tasks.length) {
    return {
      waves: [],
      isValid: false,
      error: `Cyclic dependency detected: only ${processedCount} of ${tasks.length} tasks resolved without cycle.`,
    };
  }

  return {
    waves,
    isValid: true,
  };
}

// =========================================================================
// SWM-002: Byzantine Consensus Quorum Gate
// =========================================================================

export function evaluateByzantineConsensus(
  _task: SwarmTask,
  votes: Array<{ agent: string; approve: boolean }>,
  requiredQuorum = 3,
): {
  passed: boolean;
  approvals: number;
  totalVotes: number;
  agreementRate: number;
  reason?: string;
} {
  const totalVotes = votes.length;
  if (totalVotes < requiredQuorum) {
    return {
      passed: false,
      approvals: 0,
      totalVotes,
      agreementRate: 0,
      reason: `Quorum not met: received ${totalVotes} votes, required at least ${requiredQuorum}.`,
    };
  }

  const approvals = votes.filter((v) => v.approve).length;
  const agreementRate = Math.round((approvals / totalVotes) * 100);

  // Byzantine threshold: strictly > 66% (2/3 majority)
  const passed = agreementRate > 66;

  return {
    passed,
    approvals,
    totalVotes,
    agreementRate,
    reason: passed
      ? `Consensus passed with ${agreementRate}% agreement (${approvals}/${totalVotes}).`
      : `Consensus rejected: ${agreementRate}% agreement fails the 66% Byzantine threshold.`,
  };
}

// =========================================================================
// SWM-003 & SWM-004: Swarm Dispatcher Simulation & Execution Engine
// =========================================================================

/** Optional external ownership gate (the swarm mesh). */
export interface DispatchHooks {
  /** Return false when another node owns the task; it is then skipped and pruned. */
  claim?: (task: SwarmTask) => boolean;
  /** Called once the task's outcome is known, so the mesh claim can be settled. */
  complete?: (task: SwarmTask, status: TaskExecutionResult["status"]) => void;
}

export function dispatchSwarmPlan(
  plan: SwarmPlan,
  mockExecutionFails: string[] = [],
  mockConsensusRejections: string[] = [],
  hooks: DispatchHooks = {},
): SwarmExecutionLedger {
  const { waves, isValid, error } = partitionDagIntoWaves(plan.tasks);

  if (!isValid) {
    return {
      planId: plan.planId,
      totalWaves: 0,
      waves: [],
      totalTasks: plan.tasks.length,
      completedTasks: 0,
      failedTasks: plan.tasks.length,
      skippedTasks: 0,
      totalTokensBurned: 0,
      tokenCeiling: plan.maxTokenCeiling || 250000,
      budgetExhausted: false,
      results: [],
      summary: `Swarm dispatch halted: ${error}`,
    };
  }

  const tokenCeiling = plan.maxTokenCeiling || 250000;
  const requiredQuorum = plan.requiredQuorum || 3;

  let totalTokensBurned = 0;
  let budgetExhausted = false;
  const failedTaskIds = new Set<string>();
  const completedTaskIds = new Set<string>();
  const results: TaskExecutionResult[] = [];

  for (const wave of waves) {
    if (budgetExhausted) {
      for (const t of wave.tasks) {
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "SKIPPED_UPSTREAM_FAILURE",
          tokensBurned: 0,
          reason: "Skipped due to global token budget exhaustion.",
        });
      }
      continue;
    }

    for (const t of wave.tasks) {
      // SWM-004: Fast-Fail Dependent Pruning
      const upstreamFailed = (t.dependsOn || []).some((dep) => failedTaskIds.has(dep));
      if (upstreamFailed) {
        failedTaskIds.add(t.id);
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "SKIPPED_UPSTREAM_FAILURE",
          tokensBurned: 0,
          reason: "Pruned: upstream dependency failed or was skipped.",
        });
        continue;
      }

      // MESH claim gate: another node owning this task means we do not run it.
      if (hooks.claim && !hooks.claim(t)) {
        failedTaskIds.add(t.id);
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "SKIPPED_UPSTREAM_FAILURE",
          tokensBurned: 0,
          reason: "Claimed by another mesh node; dependents pruned in this process.",
        });
        continue;
      }

      // Check SWM-003: Token ceiling check
      const taskTokens = t.estimatedTokens || 5000;
      if (totalTokensBurned + taskTokens > tokenCeiling) {
        budgetExhausted = true;
        failedTaskIds.add(t.id);
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "FAILED",
          tokensBurned: 0,
          reason: `Token budget ceiling reached: requires ${taskTokens} tokens, only ${tokenCeiling - totalTokensBurned} remain.`,
        });
        hooks.complete?.(t, "FAILED");
        continue;
      }

      // SWM-002: Critical Seam Byzantine Consensus
      if (t.criticalSeam) {
        const isRejected = mockConsensusRejections.includes(t.id);
        const votes = [
          { agent: "Sol", approve: !isRejected },
          { agent: "Nexus", approve: !isRejected },
          { agent: "Crew", approve: !isRejected },
        ];
        const consensus = evaluateByzantineConsensus(t, votes, requiredQuorum);
        if (!consensus.passed) {
          failedTaskIds.add(t.id);
          totalTokensBurned += Math.round(taskTokens * 0.3); // Partial burn for consensus pass
          results.push({
            taskId: t.id,
            name: t.name,
            waveIndex: wave.waveIndex,
            status: "FAILED_CONSENSUS",
            tokensBurned: Math.round(taskTokens * 0.3),
            consensusVote: consensus,
            reason: consensus.reason,
          });
          hooks.complete?.(t, "FAILED_CONSENSUS");
          continue;
        }
      }

      // Execution outcome
      if (mockExecutionFails.includes(t.id)) {
        failedTaskIds.add(t.id);
        totalTokensBurned += Math.round(taskTokens * 0.5);
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "FAILED",
          tokensBurned: Math.round(taskTokens * 0.5),
          reason: "Task execution returned non-zero error.",
        });
        hooks.complete?.(t, "FAILED");
      } else {
        completedTaskIds.add(t.id);
        totalTokensBurned += taskTokens;
        results.push({
          taskId: t.id,
          name: t.name,
          waveIndex: wave.waveIndex,
          status: "COMPLETED",
          tokensBurned: taskTokens,
        });
      }
      hooks.complete?.(t, results[results.length - 1].status);
    }
  }

  const completedTasks = results.filter((r) => r.status === "COMPLETED").length;
  const failedTasks = results.filter((r) => r.status === "FAILED" || r.status === "FAILED_CONSENSUS").length;
  const skippedTasks = results.filter((r) => r.status === "SKIPPED_UPSTREAM_FAILURE").length;

  const summary =
    failedTasks === 0
      ? `Swarm plan '${plan.planId}' succeeded: all ${completedTasks} tasks across ${waves.length} waves finished (${totalTokensBurned}/${tokenCeiling} tokens).`
      : `Swarm plan '${plan.planId}' finished with issues: ${completedTasks} completed, ${failedTasks} failed, ${skippedTasks} skipped.`;

  return {
    planId: plan.planId,
    totalWaves: waves.length,
    waves,
    totalTasks: plan.tasks.length,
    completedTasks,
    failedTasks,
    skippedTasks,
    totalTokensBurned,
    tokenCeiling,
    budgetExhausted,
    results,
    summary,
  };
}

// =========================================================================
// MESH-005: Dispatch through the swarm mesh (multi-process ownership)
// =========================================================================

export interface MeshDispatchOptions {
  stateDir: string;
  nodeId: string;
  ttlSec?: number;
}

export interface MeshDispatchResult {
  ledger: SwarmExecutionLedger;
  mesh: MeshLedger;
}

/**
 * Dispatch a DAG where task ownership is arbitrated by the mesh instead of
 * assumed. Two dispatchers pointed at one state directory never execute the
 * same task; the loser prunes the dependents it can no longer run, and the
 * mesh ledger reconciles the whole run.
 */
export function dispatchSwarmPlanOnMesh(
  plan: SwarmPlan,
  options: MeshDispatchOptions,
  mockExecutionFails: string[] = [],
  mockConsensusRejections: string[] = [],
): MeshDispatchResult {
  const meshPlan: MeshPlan = {
    planId: plan.planId,
    tasks: plan.tasks.map((task) => ({ id: task.id, name: task.name, dependsOn: task.dependsOn })),
  };
  const ttlSec = options.ttlSec ?? 120;
  initMeshFromPlan(options.stateDir, meshPlan);

  const ledger = dispatchSwarmPlan(plan, mockExecutionFails, mockConsensusRejections, {
    claim: (task) => claimTask(options.stateDir, options.nodeId, { taskId: task.id, ttlSec }).verdict !== "NO_TASK",
    complete: (task, status) => {
      try {
        if (status === "COMPLETED") completeTask(options.stateDir, options.nodeId, task.id);
        else releaseTask(options.stateDir, options.nodeId, task.id);
      } catch {
        // Another node took the claim over while this task ran; the mesh
        // ledger reports the stale claim rather than hiding it.
      }
    },
  });

  return { ledger, mesh: reconcileMesh(options.stateDir, { ttlSec }) };
}

// =========================================================================
// Standalone CLI Runner
// =========================================================================

export async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      plan: { type: "string" },
      "max-tokens": { type: "string" },
      quorum: { type: "string" },
      simulate: { type: "boolean" },
      mesh: { type: "string" },
      node: { type: "string", default: "dispatcher" },
      ttl: { type: "string" },
      json: { type: "boolean" },
    },
    strict: false,
  });

  if (!values.plan || !fs.existsSync(values.plan)) {
    console.error("Usage: bun swarm-dispatcher.ts --plan <task-dag.json> [--max-tokens 250000] [--quorum 3] [--json]");
    process.exit(1);
  }

  const rawPlan: SwarmPlan = JSON.parse(fs.readFileSync(values.plan, "utf8"));
  if (values["max-tokens"]) {
    const ceiling = Number.parseInt(values["max-tokens"], 10);
    if (!Number.isInteger(ceiling) || ceiling <= 0) {
      console.error("--max-tokens must be a positive integer");
      process.exit(2);
    }
    rawPlan.maxTokenCeiling = ceiling;
  }
  if (values.quorum) {
    const quorum = Number.parseInt(values.quorum, 10);
    if (!Number.isInteger(quorum) || quorum < 1) {
      console.error("--quorum must be a positive integer");
      process.exit(2);
    }
    rawPlan.requiredQuorum = quorum;
  }

  const ttlSec = values.ttl ? Number(values.ttl) : undefined;
  if (ttlSec !== undefined && (!Number.isFinite(ttlSec) || ttlSec <= 0)) {
    console.error("--ttl must be a positive number of seconds");
    process.exit(2);
  }

  const meshResult = values.mesh
    ? dispatchSwarmPlanOnMesh(rawPlan, { stateDir: values.mesh, nodeId: values.node, ttlSec })
    : undefined;
  const ledger = meshResult ? meshResult.ledger : dispatchSwarmPlan(rawPlan);

  if (values.json) {
    console.log(JSON.stringify(meshResult ?? ledger, null, 2));
  } else {
    console.log(`\n🐝 Swarm Execution Ledger: [${ledger.planId}]`);
    console.log(`Waves: ${ledger.totalWaves} | Tokens: ${ledger.totalTokensBurned}/${ledger.tokenCeiling}`);
    console.log(
      `Tasks: ${ledger.completedTasks} completed, ${ledger.failedTasks} failed, ${ledger.skippedTasks} skipped\n`,
    );
    for (const r of ledger.results) {
      const badge = r.status === "COMPLETED" ? "✅" : r.status === "SKIPPED_UPSTREAM_FAILURE" ? "⏭️" : "❌";
      console.log(
        `  ${badge} [Wave ${r.waveIndex}] ${r.taskId}: ${r.name} (${r.tokensBurned} tokens) ${r.reason ? `— ${r.reason}` : ""}`,
      );
    }
    console.log(`\n${ledger.summary}`);
    if (meshResult) {
      console.log(
        `\n🕸️  Mesh: ${meshResult.mesh.completed}/${meshResult.mesh.total} done · ${meshResult.mesh.anomalies.length} anomaly(ies)`,
      );
    }
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("SwarmDispatcher Fatal:", err);
    process.exit(1);
  });
}
