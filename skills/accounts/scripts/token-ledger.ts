#!/usr/bin/env bun
/**
 * token-ledger.ts: Per-client AI token & compute billing attribution ledger.
 *
 * Usage:
 *   bun token-ledger.ts --record <clientId> <model> <inputTokens> <outputTokens> [task]
 *   bun token-ledger.ts --report <clientId> [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface TokenEntry {
  id: string;
  clientId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  billableUsd: number;
  task: string;
  timestamp: string;
}

export const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number; markupMultiplier: number }> = {
  "claude-3-7-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0, markupMultiplier: 1.2 },
  "claude-3-5-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0, markupMultiplier: 1.2 },
  "claude-3-5-haiku": { inputPer1M: 0.8, outputPer1M: 4.0, markupMultiplier: 1.15 },
  "gemini-2-0-flash": { inputPer1M: 0.1, outputPer1M: 0.4, markupMultiplier: 1.15 },
  "gemini-1-5-pro": { inputPer1M: 1.25, outputPer1M: 5.0, markupMultiplier: 1.2 },
  "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10.0, markupMultiplier: 1.2 },
  o1: { inputPer1M: 15.0, outputPer1M: 60.0, markupMultiplier: 1.25 },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number) {
  const norm = model.toLowerCase();
  const pricing = Object.entries(MODEL_PRICING).find(([k]) => norm.includes(k))?.[1] || {
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    markupMultiplier: 1.2,
  };

  const rawCost = (inputTokens / 1_000_000) * pricing.inputPer1M + (outputTokens / 1_000_000) * pricing.outputPer1M;
  const billable = rawCost * pricing.markupMultiplier;
  return { costUsd: Number(rawCost.toFixed(4)), billableUsd: Number(billable.toFixed(4)) };
}

export function recordTokenUsage(
  ledgerFile: string,
  clientId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  task = "Autonomous Task Execution",
): TokenEntry {
  const { costUsd, billableUsd } = calculateCost(model, inputTokens, outputTokens);
  const entry: TokenEntry = {
    id: `tok-${Date.now().toString(36)}`,
    clientId,
    model,
    inputTokens,
    outputTokens,
    costUsd,
    billableUsd,
    task,
    timestamp: new Date().toISOString(),
  };

  let existing: TokenEntry[] = [];
  if (fs.existsSync(ledgerFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
    } catch {
      existing = [];
    }
  }

  existing.push(entry);
  fs.mkdirSync(path.dirname(ledgerFile), { recursive: true });
  fs.writeFileSync(ledgerFile, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
  return entry;
}

export function generateClientComputeReport(ledgerFile: string, clientId: string) {
  let entries: TokenEntry[] = [];
  if (fs.existsSync(ledgerFile)) {
    try {
      const all: TokenEntry[] = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
      entries = all.filter((e) => e.clientId.toLowerCase() === clientId.toLowerCase());
    } catch {
      entries = [];
    }
  }

  const totalInput = entries.reduce((acc, e) => acc + e.inputTokens, 0);
  const totalOutput = entries.reduce((acc, e) => acc + e.outputTokens, 0);
  const totalCost = entries.reduce((acc, e) => acc + e.costUsd, 0);
  const totalBillable = entries.reduce((acc, e) => acc + e.billableUsd, 0);

  return {
    clientId,
    totalSessions: entries.length,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalRawCostUsd: Number(totalCost.toFixed(2)),
    totalBillableComputeUsd: Number(totalBillable.toFixed(2)),
    marginProfitUsd: Number((totalBillable - totalCost).toFixed(2)),
    entries,
  };
}

export interface BudgetCheckResult {
  clientId: string;
  windowHours: number;
  maxBudgetUsd: number;
  currentSpendUsd: number;
  remainingBudgetUsd: number;
  percentUsed: number;
  status: "OK" | "WARNING" | "EXCEEDED";
  circuitBreakerTripped: boolean;
  recentEntriesCount: number;
}

export function checkClientBudget(
  ledgerFile: string,
  clientId: string,
  maxBudgetUsd = 100.0,
  windowHours = 24,
): BudgetCheckResult {
  let entries: TokenEntry[] = [];
  if (fs.existsSync(ledgerFile)) {
    try {
      const all: TokenEntry[] = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
      entries = all.filter((e) => e.clientId.toLowerCase() === clientId.toLowerCase());
    } catch {
      entries = [];
    }
  }

  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const windowEntries = entries.filter((e) => e.timestamp >= windowStart);

  const currentSpendUsd = windowEntries.reduce((acc, e) => acc + (e.billableUsd || e.costUsd || 0), 0);
  const percentUsed = maxBudgetUsd > 0 ? (currentSpendUsd / maxBudgetUsd) * 100 : 0;

  let status: "OK" | "WARNING" | "EXCEEDED" = "OK";
  if (percentUsed >= 100) {
    status = "EXCEEDED";
  } else if (percentUsed >= 85) {
    status = "WARNING";
  }

  return {
    clientId,
    windowHours,
    maxBudgetUsd: Number(maxBudgetUsd.toFixed(2)),
    currentSpendUsd: Number(currentSpendUsd.toFixed(2)),
    remainingBudgetUsd: Number(Math.max(0, maxBudgetUsd - currentSpendUsd).toFixed(2)),
    percentUsed: Number(percentUsed.toFixed(1)),
    status,
    circuitBreakerTripped: status === "EXCEEDED",
    recentEntriesCount: windowEntries.length,
  };
}

export interface ContextMessage {
  role: string;
  content: string;
}

export interface PruneResult {
  prunedMessages: ContextMessage[];
  originalCount: number;
  prunedCount: number;
  estimatedTokens: number;
}

export function pruneContextHistory(messages: ContextMessage[], maxTokens = 4000): PruneResult {
  const estimateTokens = (text: string) => Math.ceil((text || "").length / 4);

  const totalTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
  if (totalTokens <= maxTokens || messages.length <= 2) {
    return {
      prunedMessages: messages,
      originalCount: messages.length,
      prunedCount: 0,
      estimatedTokens: totalTokens,
    };
  }

  const hasSystem = messages[0]?.role === "system";
  const systemMsg = hasSystem ? messages[0] : null;
  const conversationTurns = hasSystem ? messages.slice(1) : [...messages];

  let availableBudget = maxTokens;
  if (systemMsg) {
    availableBudget -= estimateTokens(systemMsg.content);
  }

  const retainedTurns: ContextMessage[] = [];
  let currentTurnTokens = 0;

  // Traverse newest to oldest
  for (let i = conversationTurns.length - 1; i >= 0; i--) {
    const msg = conversationTurns[i];
    const cost = estimateTokens(msg.content);
    if (currentTurnTokens + cost <= availableBudget || retainedTurns.length === 0) {
      retainedTurns.unshift(msg);
      currentTurnTokens += cost;
    } else {
      break;
    }
  }

  const prunedCount = conversationTurns.length - retainedTurns.length;
  const prunedMessages: ContextMessage[] = [];

  if (systemMsg) {
    prunedMessages.push(systemMsg);
  }

  if (prunedCount > 0) {
    prunedMessages.push({
      role: "system",
      content: `[Context Pruned: ${prunedCount} older conversation turns collapsed to preserve sliding window token budget. System instructions and active state preserved.]`,
    });
  }

  prunedMessages.push(...retainedTurns);

  const finalTokens = prunedMessages.reduce((acc, m) => acc + estimateTokens(m.content), 0);

  return {
    prunedMessages,
    originalCount: messages.length,
    prunedCount,
    estimatedTokens: finalTokens,
  };
}

export interface RetainerStatusResult {
  clientId: string;
  monthlyAllowanceUsd: number;
  consumedUsd: number;
  percentUsed: number;
  status: "HEALTHY" | "OVERAGE_WARNING" | "OVERAGE_EXCEEDED";
  autoNotice?: string;
}

export function checkRetainerStatus(
  ledgerFile: string,
  clientId: string,
  monthlyAllowanceUsd = 1000.0,
): RetainerStatusResult {
  let entries: TokenEntry[] = [];
  if (fs.existsSync(ledgerFile)) {
    try {
      const all: TokenEntry[] = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));
      entries = all.filter((e) => e.clientId.toLowerCase() === clientId.toLowerCase());
    } catch {
      entries = [];
    }
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const mtdEntries = entries.filter((e) => e.timestamp >= monthStart);

  const consumedUsd = mtdEntries.reduce((acc, e) => acc + (e.billableUsd || e.costUsd || 0), 0);
  const percentUsed = monthlyAllowanceUsd > 0 ? (consumedUsd / monthlyAllowanceUsd) * 100 : 0;

  let status: "HEALTHY" | "OVERAGE_WARNING" | "OVERAGE_EXCEEDED" = "HEALTHY";
  let autoNotice: string | undefined;

  if (percentUsed >= 100) {
    status = "OVERAGE_EXCEEDED";
    autoNotice = `Hi ${clientId}, your monthly retainer compute allowance ($${monthlyAllowanceUsd.toFixed(2)}) has reached 100% capacity ($${consumedUsd.toFixed(2)}). To maintain momentum on active sprint tasks, please approve an overage block or schedule a renewal true-up.`;
  } else if (percentUsed >= 80) {
    status = "OVERAGE_WARNING";
    autoNotice = `Hi ${clientId}, courtesy heads-up: your monthly retainer compute utilization is at ${percentUsed.toFixed(1)}% ($${consumedUsd.toFixed(2)} of $${monthlyAllowanceUsd.toFixed(2)}). Active development continues on track.`;
  }

  return {
    clientId,
    monthlyAllowanceUsd: Number(monthlyAllowanceUsd.toFixed(2)),
    consumedUsd: Number(consumedUsd.toFixed(2)),
    percentUsed: Number(percentUsed.toFixed(1)),
    status,
    autoNotice,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const defaultLedger = path.join(process.cwd(), ".agents/context/token-ledger.json");

  if (args.includes("--record")) {
    const idx = args.indexOf("--record");
    const clientId = args[idx + 1];
    const model = args[idx + 2] || "claude-3-7-sonnet";
    const input = parseInt(args[idx + 3] || "0", 10);
    const output = parseInt(args[idx + 4] || "0", 10);
    const task = args[idx + 5] || "Autonomous Feature Implementation";

    if (!clientId) {
      console.error("Error: --record requires <clientId> <model> <inputTokens> <outputTokens>");
      process.exit(1);
    }

    const entry = recordTokenUsage(defaultLedger, clientId, model, input, output, task);
    console.log(`\n💳 Recorded AI Compute for Client: ${clientId}`);
    console.log(`  Model: ${entry.model}`);
    console.log(`  Tokens: ${entry.inputTokens.toLocaleString()} in / ${entry.outputTokens.toLocaleString()} out`);
    console.log(`  Raw API Cost: $${entry.costUsd.toFixed(4)}`);
    console.log(`  Billable to Client (Cost + Margin): $${entry.billableUsd.toFixed(4)}`);
  } else if (args.includes("--report")) {
    const idx = args.indexOf("--report");
    const clientId = args[idx + 1];
    if (!clientId) {
      console.error("Error: --report requires <clientId>");
      process.exit(1);
    }
    const report = generateClientComputeReport(defaultLedger, clientId);
    if (args.includes("--json")) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n📊 AI Infrastructure Compute Report: ${clientId}`);
      console.log(`  Total Tasks Executed: ${report.totalSessions}`);
      console.log(`  Total Tokens: ${(report.totalInputTokens + report.totalOutputTokens).toLocaleString()}`);
      console.log(`  Raw Inference Cost: $${report.totalRawCostUsd.toFixed(2)}`);
      console.log(`  Billable to Client: $${report.totalBillableComputeUsd.toFixed(2)}`);
      console.log(`  Agency Compute Net Profit: $${report.marginProfitUsd.toFixed(2)}`);
    }
  } else if (args.includes("--check-budget")) {
    const idx = args.indexOf("--check-budget");
    const clientId = args[idx + 1];
    const maxBudget = parseFloat(args[idx + 2] || "100");
    const windowHoursIdx = args.indexOf("--window-hours");
    const windowHours = windowHoursIdx !== -1 ? parseFloat(args[windowHoursIdx + 1] || "24") : 24;

    if (!clientId) {
      console.error("Error: --check-budget requires <clientId> [maxBudgetUsd]");
      process.exit(1);
    }

    const check = checkClientBudget(defaultLedger, clientId, maxBudget, windowHours);
    if (args.includes("--json")) {
      console.log(JSON.stringify(check, null, 2));
    } else {
      console.log(`\n⏱️ Sliding Window Token Budget Check: ${clientId}`);
      console.log(`  Window: Last ${check.windowHours} hours`);
      console.log(`  Allocated Budget: $${check.maxBudgetUsd.toFixed(2)}`);
      console.log(`  Current Rolling Spend: $${check.currentSpendUsd.toFixed(2)} (${check.percentUsed}%)`);
      console.log(`  Remaining Budget: $${check.remainingBudgetUsd.toFixed(2)}`);
      console.log(`  Status: [${check.status}]`);
      if (check.circuitBreakerTripped) {
        console.log(`  🚨 CIRCUIT BREAKER TRIPPED: HALT_EXCEEDED_TOKEN_BUDGET. Autonomous tasks paused.`);
      }
    }
  } else if (args.includes("--retainer-status")) {
    const idx = args.indexOf("--retainer-status");
    const clientId = args[idx + 1];
    const allowance = parseFloat(args[idx + 2] || "1000");
    if (!clientId) {
      console.error("Error: --retainer-status requires <clientId> [monthlyAllowanceUsd]");
      process.exit(1);
    }
    const retainer = checkRetainerStatus(defaultLedger, clientId, allowance);
    if (args.includes("--json")) {
      console.log(JSON.stringify(retainer, null, 2));
    } else {
      console.log(`\n📈 Monthly Retainer Meter: ${clientId}`);
      console.log(`  Allowance: $${retainer.monthlyAllowanceUsd.toFixed(2)}`);
      console.log(`  Consumed MTD: $${retainer.consumedUsd.toFixed(2)} (${retainer.percentUsed}%)`);
      console.log(`  Status: [${retainer.status}]`);
      if (retainer.autoNotice) {
        console.log(`  📢 Notice: "${retainer.autoNotice}"`);
      }
    }
  } else if (args.includes("--prune-context")) {
    const idx = args.indexOf("--prune-context");
    const filePath = args[idx + 1];
    const maxTokensIdx = args.indexOf("--max-tokens");
    const maxTokens = maxTokensIdx !== -1 ? parseInt(args[maxTokensIdx + 1] || "4000", 10) : 4000;

    if (!filePath || !fs.existsSync(filePath)) {
      console.error("Error: --prune-context requires a valid JSON file containing messages array");
      process.exit(1);
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const messages = Array.isArray(parsed) ? parsed : parsed.messages || [];
      const result = pruneContextHistory(messages, maxTokens);
      if (args.includes("--json")) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n✂️ Context Window Governor:`);
        console.log(`  Original Turns: ${result.originalCount}`);
        console.log(`  Retained Turns: ${result.prunedMessages.length}`);
        console.log(`  Pruned Older Turns: ${result.prunedCount}`);
        console.log(`  Estimated Tokens: ~${result.estimatedTokens}`);
      }
    } catch (err) {
      console.error(`Error pruning context: ${err}`);
      process.exit(1);
    }
  } else {
    console.log(
      "Usage: bun token-ledger.ts --record <clientId> <model> <inTokens> <outTokens> [task] | --report <clientId> | --check-budget <clientId> [maxBudgetUsd] | --retainer-status <clientId> [allowanceUsd] | --prune-context <file.json> [--max-tokens <tokens>]",
    );
  }
}
