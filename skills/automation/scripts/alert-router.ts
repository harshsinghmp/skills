#!/usr/bin/env bun
/**
 * alert-router.ts: Multi-channel real-time notification router and alert escalation engine.
 *
 * Usage:
 *   bun alert-router.ts --dispatch --tier P1 --title "Database Outage" --message "Pool exhausted" [--channels slack,discord] [--dry-run]
 *   bun alert-router.ts --format discord --tier P2 --title "High Latency" --message "p99 > 800ms"
 *   bun alert-router.ts --dedup-check --signature "db-pool-exhausted"
 */

import { createHash } from "node:crypto";

export type AlertTier = "P1" | "P2" | "P3" | "P4";

export interface AlertPayload {
  title: string;
  message: string;
  tier: AlertTier;
  service?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp?: string;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  footer: { text: string };
  timestamp: string;
}

export interface DiscordEmbedPayload {
  content?: string;
  embeds: DiscordEmbed[];
}

export interface SlackBlock {
  type: "header" | "section" | "context" | "divider";
  text?: { type: "plain_text" | "mrkdwn"; text: string; emoji?: boolean };
  fields?: { type: "mrkdwn"; text: string }[];
  elements?: { type: "mrkdwn" | "plain_text"; text: string }[];
}

export interface SlackBlockKitPayload {
  text: string;
  blocks: SlackBlock[];
}

export interface TelegramMessagePayload {
  chat_id?: string;
  text: string;
  parse_mode: "HTML";
  disable_notification?: boolean;
}

export interface AlertDispatchResult {
  alertId: string;
  tier: AlertTier;
  signature: string;
  dedupSuppressed: boolean;
  occurrences: number;
  channelsDispatched: string[];
  results: { channel: string; status: "SENT" | "DRY_RUN" | "SUPPRESSED" | "FAILED"; error?: string }[];
}

const TIER_COLORS = {
  P1: 0xff0033, // Vivid Red
  P2: 0xff9900, // Amber Orange
  P3: 0xffcc00, // Warning Yellow
  P4: 0x00cc66, // Green
};

// In-memory sliding-window deduplication ledger
interface DedupEntry {
  firstSeen: number;
  lastSeen: number;
  count: number;
}
const dedupLedger = new Map<string, DedupEntry>();

export function generateAlertSignature(alert: AlertPayload): string {
  const norm = `${alert.service ?? "app"}:${alert.tier}:${alert.title.toLowerCase().trim()}`;
  return createHash("sha256").update(norm).digest("hex").slice(0, 16);
}

export function checkDeduplication(signature: string, windowMs = 300000): { shouldSend: boolean; occurrences: number } {
  const now = Date.now();
  const entry = dedupLedger.get(signature);

  if (!entry) {
    dedupLedger.set(signature, { firstSeen: now, lastSeen: now, count: 1 });
    return { shouldSend: true, occurrences: 1 };
  }

  if (now - entry.firstSeen > windowMs) {
    // Window expired, reset window
    dedupLedger.set(signature, { firstSeen: now, lastSeen: now, count: 1 });
    return { shouldSend: true, occurrences: 1 };
  }

  // Still within deduplication window
  entry.count += 1;
  entry.lastSeen = now;
  return { shouldSend: false, occurrences: entry.count };
}

export function formatDiscordPayload(alert: AlertPayload, occurrences = 1): DiscordEmbedPayload {
  const ts = alert.timestamp ?? new Date().toISOString();
  const occSuffix = occurrences > 1 ? ` **[x${occurrences} in 5m]**` : "";

  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: "Severity", value: `\`${alert.tier}\``, inline: true },
    { name: "Service", value: `\`${alert.service ?? "production"}\``, inline: true },
  ];

  if (alert.metadata) {
    for (const [k, v] of Object.entries(alert.metadata)) {
      fields.push({ name: k, value: String(v), inline: true });
    }
  }

  const p1Ping = alert.tier === "P1" ? "@here " : "";

  return {
    content: alert.tier === "P1" ? `${p1Ping}🚨 **CRITICAL INCIDENT DETECTED**` : undefined,
    embeds: [
      {
        title: `[${alert.tier}] ${alert.title}${occSuffix}`,
        description: alert.message,
        color: TIER_COLORS[alert.tier] ?? 0x7289da,
        fields,
        footer: { text: "Muse Skills Alert Router • Sovereign Engine" },
        timestamp: ts,
      },
    ],
  };
}

export function formatSlackPayload(alert: AlertPayload, occurrences = 1): SlackBlockKitPayload {
  const occSuffix = occurrences > 1 ? ` _(x${occurrences} occurrences in window)_` : "";
  const headerIcon = alert.tier === "P1" ? "🚨" : alert.tier === "P2" ? "⚠️" : alert.tier === "P3" ? "🟡" : "ℹ️";

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${headerIcon} [${alert.tier}] ${alert.title}`.slice(0, 150),
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${alert.message}${occSuffix}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Service:* \`${alert.service ?? "production"}\`  |  *Tier:* \`${alert.tier}\`  |  *Timestamp:* <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toISOString()}>`,
        },
      ],
    },
  ];

  return {
    text: `[${alert.tier}] ${alert.title}: ${alert.message}`,
    blocks,
  };
}

export function formatTelegramPayload(alert: AlertPayload, occurrences = 1): TelegramMessagePayload {
  const occSuffix = occurrences > 1 ? ` <b>[x${occurrences} in 5m]</b>` : "";
  const headerIcon = alert.tier === "P1" ? "🚨" : alert.tier === "P2" ? "⚠️" : alert.tier === "P3" ? "🟡" : "ℹ️";

  let metaText = "";
  if (alert.metadata && Object.keys(alert.metadata).length > 0) {
    metaText =
      "\n\n<b>Details:</b>\n" +
      Object.entries(alert.metadata)
        .map(([k, v]) => `• <b>${k}:</b> <code>${v}</code>`)
        .join("\n");
  }

  const html = `${headerIcon} <b>[${alert.tier}] ${alert.title}</b>${occSuffix}

${alert.message}

<b>Service:</b> <code>${alert.service ?? "production"}</code>${metaText}
<i>Router: Muse Automation Engine</i>`;

  return {
    text: html,
    parse_mode: "HTML",
    disable_notification: alert.tier === "P4",
  };
}

export async function dispatchAlert(
  alert: AlertPayload,
  options: {
    channels?: string[];
    dryRun?: boolean;
    windowMs?: number;
    webhookUrls?: { discord?: string; slack?: string; telegram?: string };
  } = {},
): Promise<AlertDispatchResult> {
  const alertId = `alt-${Date.now().toString(36)}`;
  const signature = generateAlertSignature(alert);
  const { shouldSend, occurrences } = checkDeduplication(signature, options.windowMs);

  const channels = options.channels ?? (alert.tier === "P1" ? ["slack", "discord", "telegram"] : ["slack"]);
  const results: { channel: string; status: "SENT" | "DRY_RUN" | "SUPPRESSED" | "FAILED"; error?: string }[] = [];

  if (!shouldSend) {
    for (const ch of channels) {
      results.push({ channel: ch, status: "SUPPRESSED" });
    }
    return {
      alertId,
      tier: alert.tier,
      signature,
      dedupSuppressed: true,
      occurrences,
      channelsDispatched: [],
      results,
    };
  }

  for (const ch of channels) {
    if (options.dryRun || !options.webhookUrls?.[ch as keyof typeof options.webhookUrls]) {
      results.push({ channel: ch, status: "DRY_RUN" });
      continue;
    }

    try {
      const url = options.webhookUrls[ch as keyof typeof options.webhookUrls] as string;
      let body: unknown;
      if (ch === "discord") {
        body = formatDiscordPayload(alert, occurrences);
      } else if (ch === "slack") {
        body = formatSlackPayload(alert, occurrences);
      } else if (ch === "telegram") {
        body = formatTelegramPayload(alert, occurrences);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        results.push({ channel: ch, status: "SENT" });
      } else {
        results.push({ channel: ch, status: "FAILED", error: `HTTP ${res.status} ${res.statusText}` });
      }
    } catch (err: unknown) {
      results.push({ channel: ch, status: "FAILED", error: err instanceof Error ? err.message : String(err) });
    }
  }

  return {
    alertId,
    tier: alert.tier,
    signature,
    dedupSuppressed: false,
    occurrences,
    channelsDispatched: results.filter((r) => r.status === "SENT" || r.status === "DRY_RUN").map((r) => r.channel),
    results,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes("--dispatch")) {
    const tierIdx = args.indexOf("--tier");
    const rawTier = tierIdx !== -1 ? (args[tierIdx + 1]?.toUpperCase() as AlertTier) : "P2";
    const tier: AlertTier = ["P1", "P2", "P3", "P4"].includes(rawTier) ? rawTier : "P2";

    const titleIdx = args.indexOf("--title");
    const title = titleIdx !== -1 ? args[titleIdx + 1] : "Operational System Alert";

    const msgIdx = args.indexOf("--message");
    const message = msgIdx !== -1 ? args[msgIdx + 1] : "Automated health check status notification.";

    const srvIdx = args.indexOf("--service");
    const service = srvIdx !== -1 ? args[srvIdx + 1] : "production-api";

    const chIdx = args.indexOf("--channels");
    const rawChannels = chIdx !== -1 ? args[chIdx + 1].split(",").map((c) => c.trim()) : undefined;

    const dryRun = args.includes("--dry-run") || !process.env.ALERT_DISCORD_WEBHOOK;

    const alert: AlertPayload = {
      title,
      message,
      tier,
      service,
      timestamp: new Date().toISOString(),
    };

    dispatchAlert(alert, { channels: rawChannels, dryRun }).then((res) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log(`\n📢 Alert Dispatched [${res.tier}] (${res.alertId}):`);
        console.log(`  Signature: ${res.signature}`);
        console.log(`  Suppressed (Dedup): ${res.dedupSuppressed ? "YES" : "NO"}`);
        console.log(`  Occurrences: ${res.occurrences}`);
        console.log(`  Channels:`);
        for (const r of res.results) {
          console.log(`    - ${r.channel}: ${r.status}${r.error ? ` (${r.error})` : ""}`);
        }
      }
    });
  } else if (args.includes("--format")) {
    const idx = args.indexOf("--format");
    const platform = args[idx + 1] || "discord";
    const tierIdx = args.indexOf("--tier");
    const rawTier = tierIdx !== -1 ? (args[tierIdx + 1]?.toUpperCase() as AlertTier) : "P2";
    const tier: AlertTier = ["P1", "P2", "P3", "P4"].includes(rawTier) ? rawTier : "P2";

    const titleIdx = args.indexOf("--title");
    const title = titleIdx !== -1 ? args[titleIdx + 1] : "System Alert";

    const msgIdx = args.indexOf("--message");
    const message = msgIdx !== -1 ? args[msgIdx + 1] : "Status message.";

    const alert: AlertPayload = {
      title,
      message,
      tier,
      service: "api-gateway",
    };

    if (platform === "discord") {
      console.log(JSON.stringify(formatDiscordPayload(alert), null, 2));
    } else if (platform === "slack") {
      console.log(JSON.stringify(formatSlackPayload(alert), null, 2));
    } else if (platform === "telegram") {
      console.log(JSON.stringify(formatTelegramPayload(alert), null, 2));
    } else {
      console.error(`Unknown platform: ${platform}. Use discord, slack, or telegram.`);
    }
  } else if (args.includes("--dedup-check")) {
    const idx = args.indexOf("--signature");
    const sig = idx !== -1 ? args[idx + 1] : "test-signature";
    const winIdx = args.indexOf("--window-sec");
    const winSec = winIdx !== -1 ? Number.parseInt(args[winIdx + 1], 10) : 300;

    const r1 = checkDeduplication(sig, winSec * 1000);
    const r2 = checkDeduplication(sig, winSec * 1000);
    console.log(JSON.stringify({ signature: sig, run1: r1, run2: r2 }, null, 2));
  } else {
    console.log(
      "Usage: bun alert-router.ts [--dispatch --tier P1|P2|P3|P4 --title <title> --message <msg> [--channels slack,discord] [--dry-run]] | [--format discord|slack|telegram] | [--dedup-check --signature <sig>]",
    );
  }
}
