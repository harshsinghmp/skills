#!/usr/bin/env bun
/**
 * 🧠 wisdom-updater.ts — Sovereign Wisdom Compounding Engine for Muse Memory
 *
 * Absorbs legacy WisdomFrameUpdater into sovereign Muse tooling.
 * Collects observations, categorizes them across engineering & agency domains,
 * and compounds weekly retrospective insights directly into Muse Memory's
 * dual-scope architecture:
 *   - Global user truth: ~/.memory/wiki/<domain>.md & ~/.memory/USER.md
 *   - Local project constraints: ./.memory/ & CURRENT.md
 *
 * Usage:
 *   bun skills/reflection-maintenance/coach/scripts/wisdom-updater.ts --domain communication --observation "Client prefers table summaries" --type principle
 *   bun skills/reflection-maintenance/coach/scripts/wisdom-updater.ts --weekly-retrospective
 *   bun skills/reflection-maintenance/coach/scripts/wisdom-updater.ts --domain development --observation "Never mock database calls in integration tests" --type anti-pattern
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type ObservationType = "principle" | "contextual-rule" | "prediction" | "anti-pattern" | "evolution";

export interface WisdomObservation {
  id: string;
  domain: string;
  observation: string;
  type: ObservationType;
  confidence: number;
  date: string;
  sourceContext?: string;
}

export interface FrameUpdateResult {
  success: boolean;
  domain: string;
  type: ObservationType;
  message: string;
  framePath: string;
  persistedToWiki: boolean;
  persistedToUserMd: boolean;
}

export function resolveMemoryRoot(): string {
  const home = homedir();
  return join(home, ".memory");
}

export function resolveWikiDir(): string {
  const memRoot = resolveMemoryRoot();
  const wikiDir = join(memRoot, "wiki");
  if (!existsSync(wikiDir)) {
    try {
      mkdirSync(wikiDir, { recursive: true });
    } catch {}
  }
  return wikiDir;
}

export function formatObservationEntry(obs: WisdomObservation): string {
  const typeIcons: Record<ObservationType, string> = {
    principle: "💎",
    "contextual-rule": "🧭",
    prediction: "🔮",
    "anti-pattern": "⚠️",
    evolution: "🧬",
  };
  const icon = typeIcons[obs.type] || "📌";
  return `- ${icon} **[${obs.type.toUpperCase()}]** (${obs.date}): ${obs.observation} _(confidence: ${(obs.confidence * 100).toFixed(0)}%)_`;
}

export function updateWisdomFrame(
  domain: string,
  observation: string,
  type: ObservationType = "principle",
  options: {
    cwd?: string;
    dryRun?: boolean;
    confidence?: number;
    promoteToUser?: boolean;
  } = {},
): FrameUpdateResult {
  const wikiDir = resolveWikiDir();
  const framePath = join(wikiDir, `${domain.toLowerCase()}.md`);
  const dateStr = new Date().toISOString().slice(0, 10);
  const confidence = options.confidence ?? 0.85;

  const obs: WisdomObservation = {
    id: `wis-${domain}-${Date.now().toString(36)}`,
    domain: domain.toLowerCase(),
    observation: observation.trim(),
    type,
    confidence,
    date: dateStr,
    sourceContext: options.cwd || process.cwd(),
  };

  let persistedToWiki = false;
  let persistedToUserMd = false;

  if (!options.dryRun) {
    let content = "";
    if (existsSync(framePath)) {
      try {
        content = readFileSync(framePath, "utf8");
      } catch {}
    } else {
      content = `# 🧠 Domain Wisdom Frame: ${domain.toUpperCase()}\n\n> **Domain**: \`${domain}\` • Sovereign Muse Memory Frame\n\n## 1. Core Principles\n\n## 2. Contextual Rules & Invariants\n\n## 3. Anti-Patterns & Failure Modes\n\n## 4. Evolution & Observation Log\n\n`;
    }

    const entry = formatObservationEntry(obs);
    content += `${entry}\n`;
    try {
      writeFileSync(framePath, content, "utf8");
      persistedToWiki = true;
    } catch {}

    // If high confidence principle or requested, compound into ~/.memory/USER.md
    if (options.promoteToUser || confidence >= 0.9) {
      const userMdPath = join(resolveMemoryRoot(), "USER.md");
      if (existsSync(userMdPath)) {
        try {
          let userContent = readFileSync(userMdPath, "utf8");
          if (!userContent.includes(obs.observation)) {
            userContent += `\n- **${domain} (${obs.type})**: ${obs.observation} (compounded ${dateStr})\n`;
            writeFileSync(userMdPath, userContent, "utf8");
            persistedToUserMd = true;
          }
        } catch {}
      }
    }
  }

  return {
    success: true,
    domain: obs.domain,
    type: obs.type,
    message: `Recorded ${obs.type} in domain '${obs.domain}'`,
    framePath,
    persistedToWiki,
    persistedToUserMd,
  };
}

export function synthesizeWeeklyWisdom(_options: { cwd?: string; dryRun?: boolean } = {}): {
  timestamp: string;
  summary: string;
  compoundedCount: number;
} {
  const wikiDir = resolveWikiDir();
  const dateStr = new Date().toISOString().slice(0, 10);
  const observations: WisdomObservation[] = [];

  if (existsSync(wikiDir)) {
    try {
      const files = readdirSync(wikiDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const domain = file.replace(/\.md$/, "");
        const content = readFileSync(join(wikiDir, file), "utf8");
        for (const line of content.split("\n")) {
          if (line.startsWith("- ") && line.includes("**[")) {
            const match = line.match(/\*\*\[([A-Z-]+)\]\*\*\s*\(([^)]+)\):\s*(.+?)(?:_\(confidence:|$)/);
            if (match) {
              observations.push({
                id: `wis-${domain}-${observations.length}`,
                domain,
                type: match[1].toLowerCase() as ObservationType,
                date: match[2],
                observation: match[3].trim(),
                confidence: 0.9,
              });
            }
          }
        }
      }
    } catch {}
  }

  const summary = `# 🧠 Weekly Wisdom Retrospective Synthesis (${dateStr})

> **Engine**: Muse Memory Wisdom Compounding Engine • Wave 23
> **Scope**: Active Domain Frames in \`~/.memory/wiki/\`

## Compounded Insights
${
  observations.length > 0
    ? observations.map((o) => formatObservationEntry(o)).join("\n")
    : "- _Zero new observations recorded this week._"
}

## Next Evolution Focus
- Reinforce high-confidence principles in active agent prompts.
- Promote recurring contextual rules to project standards.
`;

  return {
    timestamp: dateStr,
    summary,
    compoundedCount: observations.length,
  };
}

export async function main() {
  const args = process.argv.slice(2);
  let domain = "";
  let observation = "";
  let type: ObservationType = "principle";
  let isRetrospective = false;
  let jsonOutput = false;
  let promoteToUser = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--domain" && args[i + 1]) {
      domain = args[++i];
    } else if (arg === "--observation" && args[i + 1]) {
      observation = args[++i];
    } else if (arg === "--type" && args[i + 1]) {
      type = args[++i] as ObservationType;
    } else if (arg === "--weekly-retrospective" || arg === "--synthesize") {
      isRetrospective = true;
    } else if (arg === "--promote") {
      promoteToUser = true;
    } else if (arg === "--json") {
      jsonOutput = true;
    }
  }

  if (isRetrospective) {
    const retro = synthesizeWeeklyWisdom();
    if (jsonOutput) {
      console.log(JSON.stringify(retro, null, 2));
    } else {
      console.log(retro.summary);
    }
    process.exit(0);
  }

  if (!domain || !observation) {
    console.log(
      "Usage: bun wisdom-updater.ts --domain <domain> --observation <text> [--type principle|anti-pattern|contextual-rule] [--promote]",
    );
    process.exit(1);
  }

  const result = updateWisdomFrame(domain, observation, type, { promoteToUser });
  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`✅ [WISDOM COMPOUNDED] ${result.message}`);
    console.log(`📁 Wiki frame: ${result.framePath}`);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("WisdomUpdater error:", err);
    process.exit(1);
  });
}
