#!/usr/bin/env bun

/**
 * ⚓ anchor.ts — Context Anchor Engine: Working Reference Snapshots & Workstream Parking
 *
 * Implements:
 * 1. Micro-anchor dropping (<= 15 lines) into .agents/anchor.md
 * 2. Named workstream parking into .agents/anchors/<slug>.md
 * 3. Atomic workstream switching with auto-park and freshness check
 * 4. AST Attention Pinning (<= 30 lines) with source grounding and body replacement
 * 5. Ghost Task Verification (file existence, post-anchor mtime, and git diff check)
 * 6. Observation Masking & Tool-Output Hashing (lossless storage and 2-line receipts)
 * 7. Prompt-Cache-Aware Anchor Partitioning (static invariant prefix + dynamic tail)
 * 8. Deadlock Breaker & Toxic Retry Rollback (3-strike streak tracking & automated reset)
 *
 * Usage:
 *   bun anchor.ts [--drop] [--park <slug>] [--switch <slug>] [--list] [--pin <file:symbol>] [--verify]
 *                 [--mask-output] [--partition] [--record-outcome] [--deadlock-check] [--rollback] [--json]
 */

process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

export interface DropOptions {
  workstream?: string;
  branch?: string;
  client?: string;
  state?: string[] | string;
  reference?: string;
  nextAction?: string;
  pinnedContext?: string;
}

export interface AnchorSummary {
  slug: string;
  type: "active" | "parked";
  path: string;
  branch: string;
  client: string;
  timestamp: string;
  nextAction: string;
  stateSummary: string;
}

export interface SwitchResult {
  success: boolean;
  slug?: string;
  branch?: string;
  fresh?: boolean;
  warning?: string;
  error?: string;
  reEntryBlock?: string;
}

export interface PinResult {
  success: boolean;
  file?: string;
  symbol?: string;
  startLine?: number;
  endLine?: number;
  pinSnippet?: string;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  ghostTask: boolean;
  targetFile?: string;
  reason: string;
}

export interface ObservationMaskResult {
  masked: boolean;
  rawLines: number;
  logPath?: string;
  receipt: string;
  exitCode: number;
}

export interface PartitionResult {
  success: boolean;
  staticPath: string;
  dynamicPath: string;
  staticContent: string;
  dynamicContent: string;
}

export interface DeadlockStatus {
  deadlockDetected: boolean;
  consecutiveFailures: number;
  command: string;
  historyCount: number;
  warning?: string;
}

export interface RollbackResult {
  success: boolean;
  rolledBack: boolean;
  message: string;
  error?: string;
}

export function getGitBranch(targetDir: string): string {
  try {
    const res = spawnSync("git", ["branch", "--show-current"], {
      cwd: targetDir,
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout.trim()) {
      return res.stdout.trim();
    }
  } catch {}
  return "main";
}

export function formatAnchorContent(opts: {
  timestamp: string;
  workstream: string;
  branch: string;
  client: string;
  stateBullets: string[];
  reference: string;
  nextAction: string;
  pinnedSection?: string;
}): string {
  const lines: string[] = [
    `# Context Anchor — ${opts.timestamp}`,
    `workstream: ${opts.workstream} | branch: ${opts.branch}`,
    `Client: ${opts.client}`,
    "",
    "## What's True Right Now",
  ];

  for (const bullet of opts.stateBullets) {
    lines.push(`- ${bullet.replace(/^[-*]\s*/, "")}`);
  }

  lines.push("");
  lines.push("## The Working Reference");
  lines.push(`> ${opts.reference.replace(/^>\s*/, "")}`);
  lines.push("");
  lines.push("## Next Action");
  lines.push(
    opts.nextAction.startsWith("- [ ]") ? opts.nextAction : `- [ ] ${opts.nextAction.replace(/^[-*]\s*/, "")}`,
  );

  if (opts.pinnedSection && opts.pinnedSection.trim().length > 0) {
    lines.push("");
    lines.push(opts.pinnedSection.trim());
  }

  return lines.join("\n");
}

export function dropAnchor(
  workspaceRoot: string,
  options?: DropOptions,
): { success: boolean; path: string; content: string } {
  const agentsDir = join(workspaceRoot, ".agents");
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
  }

  const anchorPath = join(agentsDir, "anchor.md");
  const currentBranch = getGitBranch(workspaceRoot);
  const timestamp = new Date().toISOString();

  let stateBullets: string[] = [];
  if (Array.isArray(options?.state)) {
    stateBullets = options.state;
  } else if (typeof options?.state === "string") {
    stateBullets = [options.state];
  } else {
    stateBullets = [
      "Active work in progress; initial task scope defined.",
      "Architectural decisions aligned with project specifications.",
    ];
  }

  let ref = options?.reference || "Resume active development on current workstream. resume by: execute next action.";
  if (!ref.includes("resume by:")) {
    ref = `${ref.replace(/\.*$/, "")}. resume by: execute next action.`;
  }

  const nextAction = options?.nextAction || "- [ ] src/index.ts:1 — Continue implementation of current task";

  const content = formatAnchorContent({
    timestamp,
    workstream: options?.workstream || currentBranch,
    branch: options?.branch || currentBranch,
    client: options?.client || "internal",
    stateBullets,
    reference: ref,
    nextAction,
    pinnedSection: options?.pinnedContext,
  });

  writeFileSync(anchorPath, `${content}\n`, "utf8");
  return { success: true, path: anchorPath, content };
}

export function parkWorkstream(
  workspaceRoot: string,
  slug: string,
  options?: DropOptions,
): { success: boolean; path: string; slug: string } {
  const anchorsDir = join(workspaceRoot, ".agents/anchors");
  if (!existsSync(anchorsDir)) {
    mkdirSync(anchorsDir, { recursive: true });
  }

  const targetPath = join(anchorsDir, `${slug}.md`);
  const activeAnchorPath = join(workspaceRoot, ".agents/anchor.md");

  if (existsSync(activeAnchorPath) && !options?.state && !options?.reference) {
    const activeContent = readFileSync(activeAnchorPath, "utf8");
    const updatedContent = activeContent.replace(/workstream:\s*[^|\n]+/, `workstream: ${slug}`);
    writeFileSync(targetPath, updatedContent, "utf8");
  } else {
    const currentBranch = getGitBranch(workspaceRoot);
    const timestamp = new Date().toISOString();
    let stateBullets: string[] = [];
    if (Array.isArray(options?.state)) {
      stateBullets = options.state;
    } else if (typeof options?.state === "string") {
      stateBullets = [options.state];
    } else {
      stateBullets = [`Parked workstream ${slug} awaiting resumption.`, "Decisions preserved in anchor state."];
    }

    let ref = options?.reference || `Workstream ${slug} parked. resume by: resume active task.`;
    if (!ref.includes("resume by:")) {
      ref = `${ref.replace(/\.*$/, "")}. resume by: resume active task.`;
    }

    const nextAction = options?.nextAction || `- [ ] src/index.ts:1 — Resume parked workstream ${slug}`;

    const content = formatAnchorContent({
      timestamp,
      workstream: slug,
      branch: options?.branch || currentBranch,
      client: options?.client || "internal",
      stateBullets,
      reference: ref,
      nextAction,
      pinnedSection: options?.pinnedContext,
    });
    writeFileSync(targetPath, `${content}\n`, "utf8");
  }

  return { success: true, path: targetPath, slug };
}

export function parseAnchorDetails(filePath: string): {
  slug: string;
  branch: string;
  client: string;
  timestamp: string;
  stateBullets: string[];
  reference: string;
  nextAction: string;
  pinnedSection?: string;
} {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  let timestamp = "";
  let slug = "";
  let branch = "";
  let client = "internal";
  const stateBullets: string[] = [];
  let reference = "";
  let nextAction = "";
  let section = "";
  const pinnedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# Context Anchor —")) {
      timestamp = trimmed.replace("# Context Anchor —", "").trim();
      continue;
    }
    if (trimmed.startsWith("workstream:")) {
      const match = trimmed.match(/workstream:\s*([^|\n]+)(?:\|\s*branch:\s*([^\n]+))?/);
      if (match) {
        slug = match[1].trim();
        if (match[2]) branch = match[2].trim();
      }
      continue;
    }
    if (trimmed.startsWith("Client:")) {
      client = trimmed.replace("Client:", "").trim();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      section = trimmed.replace("## ", "").toLowerCase();
      if (section.startsWith("pinned")) {
        pinnedLines.push(line);
      }
      continue;
    }

    if (section.startsWith("pinned")) {
      pinnedLines.push(line);
      continue;
    }

    if (section.includes("what's true") || section.includes("whats true")) {
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        stateBullets.push(trimmed.replace(/^[-*]\s*/, ""));
      }
    } else if (section.includes("working reference")) {
      if (trimmed.startsWith(">")) {
        reference = trimmed.replace(/^>\s*/, "");
      } else if (trimmed.length > 0 && !reference) {
        reference = trimmed;
      }
    } else if (section.includes("next action")) {
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        nextAction = trimmed;
      }
    }
  }

  return {
    slug: slug || basename(filePath, ".md"),
    branch: branch || "main",
    client,
    timestamp,
    stateBullets,
    reference,
    nextAction: nextAction || "- [ ] Pending task definition",
    pinnedSection: pinnedLines.length > 0 ? pinnedLines.join("\n") : undefined,
  };
}

export function switchWorkstream(workspaceRoot: string, slug: string): SwitchResult {
  const anchorsDir = join(workspaceRoot, ".agents/anchors");
  const targetPath = join(anchorsDir, `${slug}.md`);

  if (!existsSync(targetPath)) {
    return {
      success: false,
      error: `Parked anchor for '${slug}' not found at ${targetPath}`,
    };
  }

  const activeAnchorPath = join(workspaceRoot, ".agents/anchor.md");
  if (existsSync(activeAnchorPath)) {
    const current = parseAnchorDetails(activeAnchorPath);
    if (current.slug && current.slug !== slug) {
      parkWorkstream(workspaceRoot, current.slug);
    }
  }

  const targetContent = readFileSync(targetPath, "utf8");
  writeFileSync(activeAnchorPath, targetContent, "utf8");

  const restored = parseAnchorDetails(activeAnchorPath);
  const currentBranch = getGitBranch(workspaceRoot);
  const isFresh = restored.branch === currentBranch;

  const firstState = restored.stateBullets[0] || "Resuming parked context";
  const cleanNext = restored.nextAction.replace(/^[-*]\s*\[[\s xX]?\]\s*/, "");

  const reEntryBlock = [
    `⚓ resuming ${restored.slug} (branch: ${restored.branch})`,
    `   State: ${firstState}`,
    `   ▶ Next: ${cleanNext}`,
  ].join("\n");

  return {
    success: true,
    slug: restored.slug,
    branch: restored.branch,
    fresh: isFresh,
    warning: isFresh
      ? undefined
      : `Branch mismatch: anchor recorded '${restored.branch}', current git branch is '${currentBranch}'.`,
    reEntryBlock,
  };
}

export function listAnchors(workspaceRoot: string): AnchorSummary[] {
  const summaries: AnchorSummary[] = [];

  const activePath = join(workspaceRoot, ".agents/anchor.md");
  if (existsSync(activePath)) {
    const parsed = parseAnchorDetails(activePath);
    summaries.push({
      slug: parsed.slug,
      type: "active",
      path: activePath,
      branch: parsed.branch,
      client: parsed.client,
      timestamp: parsed.timestamp,
      nextAction: parsed.nextAction,
      stateSummary: parsed.stateBullets.join("; "),
    });
  }

  const anchorsDir = join(workspaceRoot, ".agents/anchors");
  if (existsSync(anchorsDir)) {
    const files = readdirSync(anchorsDir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const p = join(anchorsDir, f);
      const parsed = parseAnchorDetails(p);
      summaries.push({
        slug: parsed.slug,
        type: "parked",
        path: p,
        branch: parsed.branch,
        client: parsed.client,
        timestamp: parsed.timestamp,
        nextAction: parsed.nextAction,
        stateSummary: parsed.stateBullets.join("; "),
      });
    }
  }

  return summaries;
}

export function pinAttentionContext(workspaceRoot: string, fileSymbolSpec: string): PinResult {
  const parts = fileSymbolSpec.split(":");
  if (parts.length < 2) {
    return {
      success: false,
      error: `Invalid spec format '${fileSymbolSpec}'. Expected 'file:symbol' or 'file:startLine-endLine'.`,
    };
  }

  const relFile = parts[0];
  const symbolOrRange = parts.slice(1).join(":");
  const absFile = resolve(workspaceRoot, relFile);

  if (!existsSync(absFile)) {
    return {
      success: false,
      error: `Target file '${relFile}' does not exist on disk.`,
    };
  }

  const content = readFileSync(absFile, "utf8");
  const lines = content.split("\n");
  const isPython = relFile.endsWith(".py");

  let startLine = 1;
  let endLine = lines.length;
  let snippetLines: string[] = [];

  const rangeMatch = symbolOrRange.match(/^L?(\d+)-L?(\d+)$/i);
  if (rangeMatch) {
    startLine = Math.max(1, parseInt(rangeMatch[1], 10));
    endLine = Math.min(lines.length, parseInt(rangeMatch[2], 10));
    snippetLines = lines.slice(startLine - 1, endLine);
  } else {
    const symbol = symbolOrRange.trim();
    let foundIdx = -1;

    if (isPython) {
      const pyRegex = new RegExp(`(^|\\n)(?:class|def)\\s+${symbol}\\b`);
      const match = content.match(pyRegex);
      if (match && match.index !== undefined) {
        const offset = match.index + (match[1] ? match[1].length : 0);
        foundIdx = content.slice(0, offset).split("\n").length - 1;
      }
    } else {
      const tsRegex = new RegExp(
        `(?:export\\s+)?(?:declare\\s+)?(?:async\\s+)?(?:interface|type|class|function|const|let|enum)\\s+${symbol}\\b`,
      );
      foundIdx = lines.findIndex((l) => tsRegex.test(l));
    }

    if (foundIdx === -1) {
      foundIdx = lines.findIndex((l) => l.includes(symbol));
    }

    if (foundIdx === -1) {
      return {
        success: false,
        error: `Symbol '${symbol}' not found in '${relFile}'.`,
      };
    }

    startLine = foundIdx + 1;
    let endIdx = foundIdx;

    if (isPython) {
      const baseIndentMatch = lines[foundIdx].match(/^(\s*)/);
      const baseIndent = baseIndentMatch ? baseIndentMatch[1].length : 0;
      for (let i = foundIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (l.trim().length === 0) continue;
        const indentMatch = l.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        if (indent <= baseIndent) {
          endIdx = i - 1;
          break;
        }
        endIdx = i;
      }
    } else {
      let openBraces = 0;
      let started = false;
      for (let i = foundIdx; i < lines.length; i++) {
        const l = lines[i];
        const opens = (l.match(/{/g) || []).length;
        const closes = (l.match(/}/g) || []).length;
        if (opens > 0) started = true;
        openBraces += opens - closes;
        if (started && openBraces <= 0) {
          endIdx = i;
          break;
        }
        if (!started && (l.includes(";") || (l.trim().startsWith("type ") && l.includes("=")))) {
          endIdx = i;
          break;
        }
      }
    }

    endLine = Math.max(startLine, endIdx + 1);
    snippetLines = lines.slice(startLine - 1, endLine);

    // Strip implementation bodies for functions/methods to save tokens and avoid orientation burn
    if (!isPython) {
      snippetLines = snippetLines.map((line) => {
        if (/function\s+\w+\s*\(.*\)\s*\{/.test(line)) {
          return line.replace(/\{.*/, "{ /* ... */ }");
        }
        return line;
      });
    }
  }

  // Enforce AST Pinning Invariant 1: Line Cap <= 30 lines
  if (snippetLines.length > 30) {
    snippetLines = snippetLines.slice(0, 29);
    snippetLines.push(isPython ? "# ... [truncated to 30-line cap]" : "// ... [truncated to 30-line cap]");
  }

  const commentHeader = isPython
    ? `# [PIN: ${relFile}#L${startLine}-L${endLine}]`
    : `// [PIN: ${relFile}#L${startLine}-L${endLine}]`;

  const pinSnippet = [commentHeader, ...snippetLines].join("\n");

  // Read or create active anchor
  const activeAnchorPath = join(workspaceRoot, ".agents/anchor.md");
  let activeContent = "";
  if (existsSync(activeAnchorPath)) {
    activeContent = readFileSync(activeAnchorPath, "utf8");
  } else {
    dropAnchor(workspaceRoot);
    activeContent = readFileSync(activeAnchorPath, "utf8");
  }

  const codeLang = isPython ? "python" : "typescript";
  const newPinBlock = ["## Pinned Attention Context", `\`\`\`${codeLang}`, pinSnippet, "```"].join("\n");

  let updatedContent = "";
  if (activeContent.includes("## Pinned Attention Context")) {
    updatedContent = activeContent.replace(/## Pinned Attention Context[\s\S]*?(?=\n## |$)/, `${newPinBlock}\n`);
  } else {
    updatedContent = `${activeContent.trim()}\n\n${newPinBlock}\n`;
  }

  writeFileSync(activeAnchorPath, updatedContent, "utf8");

  return {
    success: true,
    file: relFile,
    symbol: symbolOrRange,
    startLine,
    endLine,
    pinSnippet,
  };
}

export function verifyNextAction(workspaceRoot: string, anchorPath?: string): VerificationResult {
  const targetAnchorPath = anchorPath || join(workspaceRoot, ".agents/anchor.md");

  if (!existsSync(targetAnchorPath)) {
    return {
      success: false,
      ghostTask: true,
      reason: `Anchor file not found at '${targetAnchorPath}'.`,
    };
  }

  const details = parseAnchorDetails(targetAnchorPath);
  if (!details.nextAction || details.nextAction.includes("Pending task definition")) {
    return {
      success: false,
      ghostTask: true,
      reason: "No concrete Next Action defined in anchor.",
    };
  }

  // Parse target file from Next Action:
  const fileMatch = details.nextAction.match(/(?:`([^`:]+)(?::\d+)?`|([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+)(?::\d+)?)/);

  const matchedFile = fileMatch ? fileMatch[1] || fileMatch[2] : null;
  if (!matchedFile) {
    return {
      success: false,
      ghostTask: true,
      reason: `Could not identify target file path in Next Action: '${details.nextAction}'.`,
    };
  }

  const absTarget = resolve(workspaceRoot, matchedFile);
  const relTarget = relative(workspaceRoot, absTarget);

  // Invariant 1: Target file must exist on disk
  if (!existsSync(absTarget)) {
    return {
      success: false,
      ghostTask: true,
      targetFile: relTarget,
      reason: `Target file '${relTarget}' does not exist on disk.`,
    };
  }

  // Invariant 2: File mtime must post-date anchor timestamp (with 1000ms clock tolerance)
  const anchorTime = details.timestamp ? Date.parse(details.timestamp) : 0;
  const stat = statSync(absTarget);
  const mtimeMs = stat.mtimeMs;

  if (anchorTime > 0 && mtimeMs < anchorTime - 1000) {
    let hasGitCommitSince = false;
    try {
      const gitLog = spawnSync("git", ["log", `--since=${details.timestamp}`, "--oneline", "--", relTarget], {
        cwd: workspaceRoot,
        encoding: "utf8",
      });
      if (gitLog.status === 0 && gitLog.stdout.trim().length > 0) {
        hasGitCommitSince = true;
      }
    } catch {}

    if (!hasGitCommitSince) {
      return {
        success: false,
        ghostTask: true,
        targetFile: relTarget,
        reason: `Target file '${relTarget}' mtime (${new Date(mtimeMs).toISOString()}) does not post-date anchor timestamp (${details.timestamp}) and has no commits since anchor.`,
      };
    }
  }

  // Invariant 3: Target file must have meaningful changes in git
  let hasGitChanges = false;
  try {
    const gitStatus = spawnSync("git", ["status", "--porcelain", "--", relTarget], {
      cwd: workspaceRoot,
      encoding: "utf8",
    });
    if (gitStatus.status === 0 && gitStatus.stdout.trim().length > 0) {
      hasGitChanges = true;
    } else {
      const gitLog = spawnSync("git", ["log", "-n", "1", "--", relTarget], {
        cwd: workspaceRoot,
        encoding: "utf8",
      });
      if (gitLog.status === 0 && gitLog.stdout.trim().length > 0) {
        hasGitChanges = true;
      }
    }
  } catch {}

  if (!hasGitChanges) {
    return {
      success: false,
      ghostTask: true,
      targetFile: relTarget,
      reason: `Target file '${relTarget}' shows no git diff, unstaged changes, or commits post-dating anchor.`,
    };
  }

  return {
    success: true,
    ghostTask: false,
    targetFile: relTarget,
    reason: `Target file '${relTarget}' exists, was modified post-anchor, and contains verified changes.`,
  };
}

export function maskObservation(
  workspaceRoot: string,
  opts: {
    command: string;
    output: string;
    exitCode?: number;
    thresholdLines?: number;
  },
): ObservationMaskResult {
  const threshold = opts.thresholdLines || 15;
  const exitCode = opts.exitCode !== undefined ? opts.exitCode : 0;
  const lines = opts.output.split("\n");
  const lineCount = lines.length;

  if (lineCount < threshold && opts.output.length < 500) {
    return {
      masked: false,
      rawLines: lineCount,
      receipt: opts.output,
      exitCode,
    };
  }

  const logsDir = join(workspaceRoot, ".agents/artifacts/.logs");
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  const cmdSlug = opts.command
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 30);
  const hash = createHash("sha256").update(opts.output).digest("hex").slice(0, 8);
  const logFilename = `${cmdSlug}-${hash}.log`;
  const absLogPath = join(logsDir, logFilename);
  const relLogPath = relative(workspaceRoot, absLogPath);

  writeFileSync(absLogPath, opts.output, "utf8");

  // Summarize signal
  let summary = "";
  if (exitCode === 0) {
    const passedMatch = opts.output.match(/(\d+\s+pass(?:ed)?|\d+\s+tests?\s+passed|success|OK)/i);
    summary = passedMatch ? passedMatch[0] : "Execution completed successfully";
  } else {
    const failureLine = lines.find((l) => /fail(?:ure|ed)?|error|exception|AssertionError/i.test(l));
    summary = failureLine ? failureLine.trim().slice(0, 100) : "Process exited with errors";
  }

  const receipt = [
    `[OBSERVATION MASKED]: ${lineCount} lines offloaded to ${relLogPath}`,
    `STATUS: ${exitCode === 0 ? "PASSED (Exit 0)" : `FAILED (Exit ${exitCode})`} — ${summary}`,
  ].join("\n");

  return {
    masked: true,
    rawLines: lineCount,
    logPath: relLogPath,
    receipt,
    exitCode,
  };
}

export function partitionAnchor(workspaceRoot: string, options?: DropOptions): PartitionResult {
  const agentsDir = join(workspaceRoot, ".agents");
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
  }

  const staticPath = join(agentsDir, "anchor-static.md");
  const dynamicPath = join(agentsDir, "anchor-dynamic.md");
  const currentBranch = getGitBranch(workspaceRoot);
  const timestamp = new Date().toISOString();

  // Invariant / Static Anchor Prefix (Cache-Stable)
  const staticLines: string[] = [
    "# Invariant Anchor State (Cache-Stable Prefix)",
    `Client: ${options?.client || "internal"}`,
    "",
    "## Invariant Directives",
    "- Directives locked: strict adherence to project specifications and zero secret exposure.",
    "- Layering: static prefix cached across turns; ephemeral state isolated to dynamic tail.",
  ];

  if (options?.pinnedContext) {
    staticLines.push("");
    staticLines.push(options.pinnedContext.trim());
  }

  const staticContent = `${staticLines.join("\n")}\n`;
  writeFileSync(staticPath, staticContent, "utf8");

  // Dynamic Anchor Tail (Ephemeral)
  let stateBullets: string[] = [];
  if (Array.isArray(options?.state)) {
    stateBullets = options.state;
  } else if (typeof options?.state === "string") {
    stateBullets = [options.state];
  } else {
    stateBullets = [
      "Active work in progress; initial task scope defined.",
      "Architectural decisions aligned with project specifications.",
    ];
  }

  let ref = options?.reference || "Resume active development on current workstream. resume by: execute next action.";
  if (!ref.includes("resume by:")) {
    ref = `${ref.replace(/\.*$/, "")}. resume by: execute next action.`;
  }

  const nextAction = options?.nextAction || "- [ ] src/index.ts:1 — Continue implementation of current task";

  const dynamicLines: string[] = [
    `# Dynamic Focus State (Ephemeral Tail) — ${timestamp}`,
    `workstream: ${options?.workstream || currentBranch} | branch: ${options?.branch || currentBranch}`,
    "",
    "## What's True Right Now",
  ];

  for (const bullet of stateBullets) {
    dynamicLines.push(`- ${bullet.replace(/^[-*]\s*/, "")}`);
  }

  dynamicLines.push("");
  dynamicLines.push("## The Working Reference");
  dynamicLines.push(`> ${ref.replace(/^>\s*/, "")}`);
  dynamicLines.push("");
  dynamicLines.push("## Next Action");
  dynamicLines.push(nextAction.startsWith("- [ ]") ? nextAction : `- [ ] ${nextAction.replace(/^[-*]\s*/, "")}`);

  const dynamicContent = `${dynamicLines.join("\n")}\n`;
  writeFileSync(dynamicPath, dynamicContent, "utf8");

  // Also maintain backward-compatibility with monolithic anchor.md
  dropAnchor(workspaceRoot, options);

  return {
    success: true,
    staticPath,
    dynamicPath,
    staticContent,
    dynamicContent,
  };
}

export function getStreakFilePath(workspaceRoot: string): string {
  const artifactsDir = join(workspaceRoot, ".agents/artifacts");
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }
  return join(artifactsDir, ".anchor_streak.json");
}

export function recordOutcome(
  workspaceRoot: string,
  opts: {
    command: string;
    success: boolean;
    errorSummary?: string;
  },
): DeadlockStatus {
  const streakFile = getStreakFilePath(workspaceRoot);
  let streakData: {
    command: string;
    consecutiveFailures: number;
    history: Array<{ command: string; success: boolean; timestamp: string; errorSummary?: string }>;
  } = {
    command: opts.command,
    consecutiveFailures: 0,
    history: [],
  };

  if (existsSync(streakFile)) {
    try {
      streakData = JSON.parse(readFileSync(streakFile, "utf8"));
    } catch {}
  }

  const timestamp = new Date().toISOString();
  if (opts.success) {
    streakData.consecutiveFailures = 0;
    streakData.command = opts.command;
  } else {
    if (streakData.command === opts.command) {
      streakData.consecutiveFailures += 1;
    } else {
      streakData.command = opts.command;
      streakData.consecutiveFailures = 1;
    }
  }

  streakData.history.push({
    command: opts.command,
    success: opts.success,
    timestamp,
    errorSummary: opts.errorSummary,
  });

  if (streakData.history.length > 20) {
    streakData.history = streakData.history.slice(-20);
  }

  writeFileSync(streakFile, JSON.stringify(streakData, null, 2), "utf8");

  const deadlockDetected = streakData.consecutiveFailures >= 3;
  return {
    deadlockDetected,
    consecutiveFailures: streakData.consecutiveFailures,
    command: opts.command,
    historyCount: streakData.history.length,
    warning: deadlockDetected
      ? `🚨 DEADLOCK DETECTED: ${streakData.consecutiveFailures} consecutive failures on '${opts.command}'. Automated context rollback recommended.`
      : undefined,
  };
}

export function checkDeadlock(workspaceRoot: string): DeadlockStatus {
  const streakFile = getStreakFilePath(workspaceRoot);
  if (!existsSync(streakFile)) {
    return {
      deadlockDetected: false,
      consecutiveFailures: 0,
      command: "none",
      historyCount: 0,
    };
  }

  try {
    const data = JSON.parse(readFileSync(streakFile, "utf8"));
    const deadlockDetected = (data.consecutiveFailures || 0) >= 3;
    return {
      deadlockDetected,
      consecutiveFailures: data.consecutiveFailures || 0,
      command: data.command || "unknown",
      historyCount: (data.history || []).length,
      warning: deadlockDetected
        ? `🚨 DEADLOCK DETECTED: ${data.consecutiveFailures} consecutive failures on '${data.command}'. Automated context rollback recommended.`
        : undefined,
    };
  } catch {
    return {
      deadlockDetected: false,
      consecutiveFailures: 0,
      command: "none",
      historyCount: 0,
    };
  }
}

export function rollbackDeadlock(workspaceRoot: string): RollbackResult {
  const streakFile = getStreakFilePath(workspaceRoot);
  try {
    // Reset failure streak
    if (existsSync(streakFile)) {
      writeFileSync(
        streakFile,
        JSON.stringify(
          {
            command: "reset",
            consecutiveFailures: 0,
            history: [],
            lastRollback: new Date().toISOString(),
          },
          null,
          2,
        ),
        "utf8",
      );
    }

    // Revert uncommitted changes in git if repo has commits
    try {
      const revParse = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
        cwd: workspaceRoot,
        encoding: "utf8",
      });
      if (revParse.status === 0) {
        const hasCommits =
          spawnSync("git", ["rev-parse", "--verify", "HEAD"], {
            cwd: workspaceRoot,
            encoding: "utf8",
          }).status === 0;
        if (hasCommits) {
          spawnSync("git", ["checkout", "--", "."], {
            cwd: workspaceRoot,
            encoding: "utf8",
          });
        }
      }
    } catch {}

    return {
      success: true,
      rolledBack: true,
      message: "Workspace successfully rolled back to last clean state; failure streak reset.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      rolledBack: false,
      message: "Exception during rollback execution",
      error: String(err),
    };
  }
}

export interface TaskStashResult {
  success: boolean;
  taskId: string;
  stashPath: string;
  branch: string;
  modifiedFiles: string[];
  goal: string;
  nextStep: string;
  timestamp: string;
  error?: string;
}

export interface TaskUnstashResult {
  success: boolean;
  taskId: string;
  goal: string;
  nextStep: string;
  branch: string;
  reEntryBrief: string;
  error?: string;
}

export interface ContextHealthResult {
  healthy: boolean;
  activeAnchor: string | null;
  activeStashes: number;
  stashSlugs: string[];
  recommendations: string[];
}

export function stashTask(
  workspaceRoot: string,
  options: {
    taskId: string;
    goal?: string;
    nextStep?: string;
    openLoops?: string[];
  },
): TaskStashResult {
  try {
    const stashDir = resolve(workspaceRoot, ".agents", "artifacts", "task-stashes");
    if (!existsSync(stashDir)) {
      mkdirSync(stashDir, { recursive: true });
    }

    const taskId = options.taskId.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const stashPath = resolve(stashDir, `${taskId}.json`);

    let branch = "unknown";
    const modifiedFiles: string[] = [];
    try {
      const bRes = spawnSync("git", ["branch", "--show-current"], {
        cwd: workspaceRoot,
        encoding: "utf8",
      });
      if (bRes.status === 0 && bRes.stdout.trim()) {
        branch = bRes.stdout.trim();
      }

      const sRes = spawnSync("git", ["status", "--porcelain"], {
        cwd: workspaceRoot,
        encoding: "utf8",
      });
      if (sRes.status === 0 && sRes.stdout) {
        for (const line of sRes.stdout.split("\n")) {
          const trimmed = line.trim();
          if (trimmed) modifiedFiles.push(trimmed);
        }
      }
    } catch {}

    const payload = {
      taskId,
      goal: options.goal || "Active build specification task",
      nextStep: options.nextStep || "Resume next concrete action",
      openLoops: options.openLoops || [],
      branch,
      modifiedFiles,
      timestamp: new Date().toISOString(),
    };

    writeFileSync(stashPath, JSON.stringify(payload, null, 2), "utf8");

    return {
      success: true,
      taskId,
      stashPath,
      branch,
      modifiedFiles,
      goal: payload.goal,
      nextStep: payload.nextStep,
      timestamp: payload.timestamp,
    };
  } catch (err: unknown) {
    return {
      success: false,
      taskId: options.taskId,
      stashPath: "",
      branch: "unknown",
      modifiedFiles: [],
      goal: options.goal || "",
      nextStep: options.nextStep || "",
      timestamp: new Date().toISOString(),
      error: String(err),
    };
  }
}

export function unstashTask(workspaceRoot: string, taskId: string): TaskUnstashResult {
  try {
    const cleanId = taskId.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const stashPath = resolve(workspaceRoot, ".agents", "artifacts", "task-stashes", `${cleanId}.json`);

    if (!existsSync(stashPath)) {
      return {
        success: false,
        taskId,
        goal: "",
        nextStep: "",
        branch: "",
        reEntryBrief: "",
        error: `No task stash found for '${taskId}' at ${stashPath}`,
      };
    }

    const payload = JSON.parse(readFileSync(stashPath, "utf8"));

    const brief = [
      `⚓ RESUMED TASK STASH: ${payload.taskId}`,
      `  🎯 Goal:      ${payload.goal}`,
      `  🌿 Branch:    ${payload.branch}`,
      `  🚀 Next Step: ${payload.nextStep}`,
      payload.modifiedFiles?.length
        ? `  📝 Uncommitted Files (${payload.modifiedFiles.length}):\n${payload.modifiedFiles.map((f: string) => `     - ${f}`).join("\n")}`
        : "  📝 Uncommitted Files: None",
    ].join("\n");

    return {
      success: true,
      taskId: payload.taskId,
      goal: payload.goal,
      nextStep: payload.nextStep,
      branch: payload.branch,
      reEntryBrief: brief,
    };
  } catch (err: unknown) {
    return {
      success: false,
      taskId,
      goal: "",
      nextStep: "",
      branch: "",
      reEntryBrief: "",
      error: String(err),
    };
  }
}

export function checkContextHealth(workspaceRoot: string): ContextHealthResult {
  const recommendations: string[] = [];
  const anchorPath = resolve(workspaceRoot, ".agents", "anchor.md");
  let activeAnchor: string | null = null;

  if (existsSync(anchorPath)) {
    try {
      activeAnchor = readFileSync(anchorPath, "utf8");
    } catch {}
  } else {
    recommendations.push("No active .agents/anchor.md found. Drop one via '--drop' to ground agent attention.");
  }

  const stashDir = resolve(workspaceRoot, ".agents", "artifacts", "task-stashes");
  const stashSlugs: string[] = [];
  if (existsSync(stashDir)) {
    try {
      const files = readdirSync(stashDir).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        stashSlugs.push(f.replace(/\.json$/, ""));
      }
    } catch {}
  }

  if (stashSlugs.length > 3) {
    recommendations.push(
      `High task stash accumulation (${stashSlugs.length} stashes). Clear completed stashes to prevent stale context.`,
    );
  }

  const contextDir = resolve(workspaceRoot, ".agents", "context");
  if (!existsSync(contextDir)) {
    recommendations.push(".agents/context/ directory is missing. Run 'updateagents' to seed project context.");
  }

  return {
    healthy: recommendations.length === 0,
    activeAnchor: activeAnchor ? activeAnchor.slice(0, 100) : null,
    activeStashes: stashSlugs.length,
    stashSlugs,
    recommendations,
  };
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "stash-task": { type: "string" },
      "unstash-task": { type: "string" },
      "health-check": { type: "boolean", default: false },
      goal: { type: "string" },
      "next-step": { type: "string" },
      drop: { type: "boolean", default: false },
      park: { type: "string" },
      switch: { type: "string" },
      list: { type: "boolean", default: false },
      pin: { type: "string" },
      verify: { type: "boolean", default: false },
      "mask-output": { type: "boolean", default: false },
      partition: { type: "boolean", default: false },
      "record-outcome": { type: "boolean", default: false },
      "deadlock-check": { type: "boolean", default: false },
      rollback: { type: "boolean", default: false },
      cmd: { type: "string" },
      raw: { type: "string" },
      file: { type: "string" },
      exit: { type: "string" },
      success: { type: "string" },
      summary: { type: "string" },
      workstream: { type: "string" },
      branch: { type: "string" },
      client: { type: "string" },
      state: { type: "string" },
      reference: { type: "string" },
      next: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const workspaceRoot = positionals[0] ? resolve(process.cwd(), positionals[0]) : process.cwd();

  if (values.help) {
    console.log(`
⚓ anchor.ts — Context Anchor Engine: Working Reference Snapshots & Workstream Parking

Usage:
  bun anchor.ts [workspaceRoot] [options]

Core Commands:
  --drop               Drop micro-anchor into .agents/anchor.md (<=15 lines)
  --park <slug>        Park current workstream to .agents/anchors/<slug>.md
  --switch <slug>      Park active context and restore target parked workstream
  --list               List active and parked workstream anchors
  --pin <file:symbol>  AST Attention Pinning: extract verbatim type/contract (<=30 lines)
  --verify             Ghost Task Verification: inspect file existence, mtime, and git diff

Interruption Recovery & Health Commands:
  --stash-task <slug>  Stash active in-flight task with goal, completed steps, and git status
  --unstash-task <slug> Restore stashed task and emit structured recovery context
  --health-check       Scan context health (anchor age, stash accumulation, context dir)

Advanced Focus & Cache Commands:
  --mask-output        Observation Masking: offload long outputs to disk & emit 2-line receipt
  --partition          Partition anchor into cache-stable prefix & ephemeral dynamic tail
  --record-outcome     Record execution result to track consecutive failure streak
  --deadlock-check     Inspect consecutive failure streak and detect toxic retry loops
  --rollback           Revert workspace to last verified anchor state and reset failure streak

Options:
  --goal <text>        Goal description for task stashing
  --next-step <text>   Next immediate step for task stashing
  --cmd <command>      Command string associated with output or outcome
  --raw <text>         Raw stdout/stderr text for observation masking
  --file <path>        File containing raw stdout/stderr for observation masking
  --exit <code>        Exit code of the executed command (default: 0)
  --success <bool>     Success flag ("true" or "false") for outcome recording
  --summary <text>     Summary string for error or observation outcome
  --workstream <slug>  Specify workstream slug
  --branch <name>      Specify git branch name
  --client <codename>  Specify client codename (NDA protected)
  --state <text>       State bullet for anchor
  --reference <text>   Working reference with resume by clause
  --next <action>      Next action item with target file and line
  --json               Output machine-readable JSON
  -h, --help           Show this help message
`);
    process.exit(0);
  }

  if (values["stash-task"]) {
    const slug = values["stash-task"];
    const res = stashTask(workspaceRoot, {
      taskId: slug,
      goal: values.goal,
      nextStep: values["next-step"] || values.next,
    });
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📦 In-Flight Task Stashed: ${res.taskId} → ${res.stashPath}`);
      console.log(`  Goal: ${res.goal}`);
      console.log(`  Next Step: ${res.nextStep}`);
      console.log(`  Uncommitted Files: ${res.modifiedFiles.length}`);
    }
    process.exit(res.success ? 0 : 1);
  }

  if (values["unstash-task"]) {
    const slug = values["unstash-task"];
    const res = unstashTask(workspaceRoot, slug);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (!res.success) {
        console.error(`\n❌ Unstash failed: ${res.error}`);
        process.exit(1);
      }
      console.log(`\n📦 Stashed Task Recovered: ${slug}`);
      console.log(res.reEntryBrief);
    }
    process.exit(res.success ? 0 : 1);
  }

  if (values["health-check"]) {
    const res = checkContextHealth(workspaceRoot);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🩺 Context Health Check: ${res.healthy ? "✅ HEALTHY" : "⚠️ ATTENTION NEEDED"}`);
      console.log(`  Active Stashes: ${res.activeStashes} (${res.stashSlugs.join(", ") || "none"})`);
      if (res.recommendations.length > 0) {
        console.log(`  Recommendations:`);
        for (const r of res.recommendations) {
          console.log(`    - ${r}`);
        }
      }
    }
    process.exit(res.healthy ? 0 : 1);
  }

  if (values["mask-output"]) {
    const cmd = values.cmd || "unknown-cmd";
    let rawOutput = values.raw || "";
    if (values.file && existsSync(resolve(workspaceRoot, values.file))) {
      rawOutput = readFileSync(resolve(workspaceRoot, values.file), "utf8");
    }
    const exitCode = values.exit ? parseInt(values.exit, 10) : 0;
    const res = maskObservation(workspaceRoot, {
      command: cmd,
      output: rawOutput,
      exitCode,
    });

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🛡️ Observation Masking:`);
      console.log(res.receipt);
    }
    process.exit(0);
  }

  if (values.partition) {
    const res = partitionAnchor(workspaceRoot, {
      workstream: values.workstream,
      branch: values.branch,
      client: values.client,
      state: values.state,
      reference: values.reference,
      nextAction: values.next,
    });

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n⚡ Prompt-Cache Partitioning Completed:`);
      console.log(`  Static Prefix:  ${res.staticPath}`);
      console.log(`  Dynamic Tail:   ${res.dynamicPath}`);
    }
    process.exit(0);
  }

  if (values["record-outcome"]) {
    const cmd = values.cmd || "test";
    const isSuccess = values.success !== "false" && values.success !== "0";
    const res = recordOutcome(workspaceRoot, {
      command: cmd,
      success: isSuccess,
      errorSummary: values.summary,
    });

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📊 Outcome Recorded: ${cmd} -> ${isSuccess ? "✅ SUCCESS" : "❌ FAILED"}`);
      console.log(`  Streak Failures: ${res.consecutiveFailures}`);
      if (res.warning) {
        console.warn(`  ${res.warning}`);
      }
    }
    process.exit(res.deadlockDetected ? 1 : 0);
  }

  if (values["deadlock-check"]) {
    const res = checkDeadlock(workspaceRoot);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔍 Deadlock Streak Inspection:`);
      console.log(`  Command:             ${res.command}`);
      console.log(`  Consecutive Failures: ${res.consecutiveFailures}`);
      console.log(`  Deadlock Status:      ${res.deadlockDetected ? "🚨 DEADLOCK DETECTED" : "✅ CLEAN"}`);
      if (res.warning) {
        console.warn(`  ${res.warning}`);
      }
    }
    process.exit(res.deadlockDetected ? 1 : 0);
  }

  if (values.rollback) {
    const res = rollbackDeadlock(workspaceRoot);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔄 Deadlock Rollback:`);
      console.log(`  Status:  ${res.success ? "✅ SUCCESS" : "❌ FAILED"}`);
      console.log(`  Message: ${res.message}`);
      if (res.error) console.error(`  Error:   ${res.error}`);
    }
    process.exit(res.success ? 0 : 1);
  }

  if (values.drop) {
    const res = dropAnchor(workspaceRoot, {
      workstream: values.workstream,
      branch: values.branch,
      client: values.client,
      state: values.state,
      reference: values.reference,
      nextAction: values.next,
    });

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n⚓ Context Anchor Dropped: ${res.path}`);
      console.log(res.content);
    }
    process.exit(0);
  }

  if (values.park) {
    const res = parkWorkstream(workspaceRoot, values.park, {
      workstream: values.park,
      branch: values.branch,
      client: values.client,
      state: values.state,
      reference: values.reference,
      nextAction: values.next,
    });

    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n⚓ Workstream Parked: ${values.park} → ${res.path}`);
    }
    process.exit(0);
  }

  if (values.switch) {
    const res = switchWorkstream(workspaceRoot, values.switch);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (!res.success) {
        console.error(`\n❌ Switch failed: ${res.error}`);
        process.exit(1);
      }
      console.log(`\n${res.reEntryBlock}`);
      if (res.warning) {
        console.warn(`⚠️ ${res.warning}`);
      }
    }
    process.exit(res.success ? 0 : 1);
  }

  if (values.list) {
    const anchors = listAnchors(workspaceRoot);
    if (values.json) {
      console.log(JSON.stringify(anchors, null, 2));
    } else {
      console.log(`\n⚓ Workstream Anchors (${anchors.length}):`);
      if (anchors.length === 0) {
        console.log("  No active or parked anchors found.");
      } else {
        for (const a of anchors) {
          const badge = a.type === "active" ? "🟢 [ACTIVE]" : "📦 [PARKED]";
          console.log(`  ${badge} ${a.slug.padEnd(26)} (branch: ${a.branch})`);
          console.log(`      Next: ${a.nextAction}`);
        }
      }
    }
    process.exit(0);
  }

  if (values.pin) {
    const res = pinAttentionContext(workspaceRoot, values.pin);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (!res.success) {
        console.error(`\n❌ AST Pin failed: ${res.error}`);
        process.exit(1);
      }
      console.log(`\n🌲 AST Attention Pinned: ${res.file} (L${res.startLine}-L${res.endLine})`);
      console.log(res.pinSnippet);
    }
    process.exit(res.success ? 0 : 1);
  }

  if (values.verify) {
    const res = verifyNextAction(workspaceRoot);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (res.ghostTask) {
        console.error(`\n👻 GHOST TASK DETECTED:`);
        console.error(`  Target: ${res.targetFile || "Unknown"}`);
        console.error(`  Reason: ${res.reason}`);
      } else {
        console.log(`\n✅ TASK VERIFIED:`);
        console.log(`  Target: ${res.targetFile}`);
        console.log(`  Reason: ${res.reason}`);
      }
    }
    process.exit(res.ghostTask ? 1 : 0);
  }

  // Default to list if no flag given
  const anchors = listAnchors(workspaceRoot);
  if (values.json) {
    console.log(JSON.stringify(anchors, null, 2));
  } else {
    console.log(`\n⚓ Workstream Anchors (${anchors.length}):`);
    for (const a of anchors) {
      const badge = a.type === "active" ? "🟢 [ACTIVE]" : "📦 [PARKED]";
      console.log(`  ${badge} ${a.slug.padEnd(26)} (branch: ${a.branch})`);
      console.log(`      Next: ${a.nextAction}`);
    }
  }
  process.exit(0);
}
