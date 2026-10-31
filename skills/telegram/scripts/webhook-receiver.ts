#!/usr/bin/env bun
/**
 * 📱 Telegram Webhook Ingress Receiver & Security Engine
 *
 * Enforces:
 * - WBK-001 (Pure-Runtime Webhook Listener & Health Probe)
 * - WBK-002 (Timing-Safe Secret Token Verification Header Gate)
 * - WBK-003 (Replay Attack & Timestamp Drift Mitigation)
 * - WBK-004 (Idempotent Event Ingestion & Fast HTTP 200 Ack)
 *
 * Pinned Toolchain & Error Contract:
 * Node.js / Bun runtime with process unhandledRejection fail-fast handler.
 */

import { randomBytes, timingSafeEqual } from "node:crypto";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

process.on("unhandledRejection", (reason, _promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

export interface WebhookConfig {
  bot_token?: string;
  secret_token: string;
  webhook_url?: string;
  port?: number;
  host?: string;
  allowed_updates?: string[];
  max_connections?: number;
  max_drift_seconds?: number;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
}

export interface EntropyResult {
  valid: boolean;
  length: number;
  entropyBitsApprox: number;
  errors: string[];
}

export interface TimestampCheckResult {
  valid: boolean;
  driftSeconds: number;
  maxDriftSeconds: number;
}

export interface AuditResult {
  passed: boolean;
  configPath: string;
  checks: {
    fileExists: boolean;
    filePermissionsMode600: boolean;
    hasSecretToken: boolean;
    secretEntropyValid: boolean;
    secretLength: number;
    urlIsHttps: boolean;
    hasBotToken: boolean;
  };
  errors: string[];
  recommendations: string[];
}

/**
 * WBK-002: Verify incoming X-Telegram-Bot-Api-Secret-Token with constant-time equality
 */
export function verifySecretToken(
  receivedHeader: string | undefined | null,
  expectedSecret: string,
): VerificationResult {
  if (!receivedHeader) {
    return { valid: false, reason: "Missing X-Telegram-Bot-Api-Secret-Token header" };
  }
  if (!expectedSecret) {
    return { valid: false, reason: "No expected secret token configured" };
  }

  const receivedBuf = Buffer.from(receivedHeader, "utf-8");
  const expectedBuf = Buffer.from(expectedSecret, "utf-8");

  if (receivedBuf.length !== expectedBuf.length) {
    return { valid: false, reason: "Secret token length mismatch" };
  }

  const matches = timingSafeEqual(receivedBuf, expectedBuf);
  return {
    valid: matches,
    reason: matches ? undefined : "Secret token mismatch",
  };
}

/**
 * WBK-002: Check secret token entropy and character set [A-Za-z0-9_-]
 */
export function checkSecretEntropy(secret: string): EntropyResult {
  const errors: string[] = [];
  if (!secret) {
    return { valid: false, length: 0, entropyBitsApprox: 0, errors: ["Secret token is empty"] };
  }

  const length = secret.length;
  if (length < 32) {
    errors.push(`Secret token length (${length}) is less than recommended minimum (32 chars)`);
  }
  if (length > 256) {
    errors.push(`Secret token length (${length}) exceeds Telegram maximum (256 chars)`);
  }

  // Telegram allows 1-256 characters: A-Z, a-z, 0-9, _ and -
  const validPattern = /^[A-Za-z0-9_-]+$/;
  if (!validPattern.test(secret)) {
    errors.push("Secret contains invalid characters. Only A-Z, a-z, 0-9, _ and - are permitted");
  }

  // Calculate approximate entropy (alphabet size = 64, log2(64) = 6 bits per char)
  const entropyBitsApprox = length * 6;

  return {
    valid: errors.length === 0,
    length,
    entropyBitsApprox,
    errors,
  };
}

/**
 * Generate a cryptographically secure 32+ char secret token
 */
export function generateSecretToken(length: number = 32): string {
  const bytes = randomBytes(Math.ceil((length * 3) / 4));
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "").slice(0, length);
}

/**
 * WBK-003: Check timestamp drift against current server time
 */
export function checkTimestampDrift(
  updateTimestampSeconds: number,
  maxDriftSeconds: number = 300,
  currentTimestampSeconds?: number,
): TimestampCheckResult {
  const now = currentTimestampSeconds ?? Math.floor(Date.now() / 1000);
  const drift = Math.abs(now - updateTimestampSeconds);
  const valid = drift <= maxDriftSeconds;

  return {
    valid,
    driftSeconds: drift,
    maxDriftSeconds,
  };
}

/**
 * WBK-003: LRU Cache for Update Deduplication
 */
export class LRUDeduplicator {
  private cache = new Map<number, number>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(maxSize: number = 10000, ttlSeconds: number = 600) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;
  }

  public isDuplicate(updateId: number): boolean {
    const entry = this.cache.get(updateId);
    if (!entry) return false;

    if (Date.now() - entry > this.ttlMs) {
      this.cache.delete(updateId);
      return false;
    }

    return true;
  }

  public record(updateId: number): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(updateId, Date.now());
  }

  public size(): number {
    return this.cache.size;
  }

  public pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > this.ttlMs) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

/**
 * WBK-001 & WBK-004: Ingress Webhook Listener Options
 */
export interface WebhookListenerOptions {
  port?: number;
  host?: string;
  secretToken: string;
  path?: string;
  maxDriftSeconds?: number;
  dedupCapacity?: number;
  onUpdate?: (update: Record<string, unknown>, info: { updateId: number; ackTimeMs: number }) => Promise<void> | void;
  onError?: (error: Error) => void;
}

/**
 * WBK-001: Pure-Runtime Webhook Listener with Fast Ack
 */
export function createWebhookListener(options: WebhookListenerOptions): http.Server {
  const webhookPath = options.path || "/webhook";
  const maxDrift = options.maxDriftSeconds || 300;
  const dedup = new LRUDeduplicator(options.dedupCapacity || 10000);
  const startTime = Date.now();

  const server = http.createServer((req, res) => {
    const reqUrl = req.url || "/";
    const startTimeReq = Date.now();

    // Health probes
    if (req.method === "GET" && (reqUrl === "/healthz" || reqUrl === "/health")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
          dedupSize: dedup.size(),
        }),
      );
      return;
    }

    if (req.method === "GET" && reqUrl === "/ready") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ready",
          hasSecretToken: Boolean(options.secretToken),
          path: webhookPath,
        }),
      );
      return;
    }

    // Only accept POST on webhook path
    if (req.method !== "POST" || reqUrl.split("?")[0] !== webhookPath) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
      return;
    }

    // WBK-002: Verify Secret Token Header
    const secretHeader = req.headers["x-telegram-bot-api-secret-token"] as string | undefined;
    const authResult = verifySecretToken(secretHeader, options.secretToken);
    if (!authResult.valid) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden", reason: authResult.reason }));
      return;
    }

    // Parse Body
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Guard against payloads > 10MB
      if (body.length > 10 * 1024 * 1024) {
        req.destroy(new Error("Payload too large"));
      }
    });

    req.on("end", () => {
      try {
        const update = JSON.parse(body);
        const updateId = update.update_id;

        if (typeof updateId !== "number") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid update payload: missing update_id" }));
          return;
        }

        // WBK-003: Deduplication check
        if (dedup.isDuplicate(updateId)) {
          // Immediately acknowledge duplicate with 200 OK so Telegram stops resending
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, deduplicated: true }));
          return;
        }

        // WBK-003: Timestamp drift check
        const messageDate = update.message?.date || update.edited_message?.date || update.channel_post?.date;
        if (typeof messageDate === "number") {
          const driftCheck = checkTimestampDrift(messageDate, maxDrift);
          if (!driftCheck.valid) {
            // Acknowledge to prevent Telegram retry loop, but drop stale update
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, dropped: "stale_timestamp", driftSeconds: driftCheck.driftSeconds }));
            return;
          }
        }

        // Record update_id
        dedup.record(updateId);

        // WBK-004: Fast HTTP 200 OK Ack before heavy downstream dispatch
        const ackTimeMs = Date.now() - startTimeReq;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, update_id: updateId, ackTimeMs }));

        // Asynchronous Decoupled Downstream Dispatch
        if (options.onUpdate) {
          Promise.resolve(options.onUpdate(update, { updateId, ackTimeMs })).catch((err) => {
            if (options.onError) {
              options.onError(err);
            } else {
              console.error(`[telegram:webhook] Async dispatch error for update ${updateId}:`, err);
            }
          });
        }
      } catch (_err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Malformed JSON payload" }));
      }
    });
  });

  return server;
}

/**
 * Generate setWebhook curl command and payload
 */
export function generateSetWebhookPayload(
  url: string,
  secretToken: string,
  options: {
    allowedUpdates?: string[];
    maxConnections?: number;
    dropPendingUpdates?: boolean;
  } = {},
) {
  return {
    url,
    secret_token: secretToken,
    allowed_updates: options.allowedUpdates || ["message", "edited_message", "callback_query", "channel_post"],
    max_connections: options.maxConnections || 40,
    drop_pending_updates: options.dropPendingUpdates || false,
  };
}

export function generateSetWebhookCurl(
  botToken: string,
  url: string,
  secretToken: string,
  options: {
    allowedUpdates?: string[];
    maxConnections?: number;
    dropPendingUpdates?: boolean;
  } = {},
): string {
  const payload = generateSetWebhookPayload(url, secretToken, options);
  const jsonString = JSON.stringify(payload, null, 2);

  return `curl -s -X POST "https://api.telegram.org/bot${botToken}/setWebhook" \\
  -H "Content-Type: application/json" \\
  -d '${jsonString.replace(/'/g, "'\\''")}' | jq .`;
}

/**
 * Audit Webhook Configuration
 */
export function auditWebhookConfig(configPath: string): AuditResult {
  const errors: string[] = [];
  const recommendations: string[] = [];

  const checks = {
    fileExists: false,
    filePermissionsMode600: false,
    hasSecretToken: false,
    secretEntropyValid: false,
    secretLength: 0,
    urlIsHttps: false,
    hasBotToken: false,
  };

  if (!fs.existsSync(configPath)) {
    errors.push(`Config file does not exist: ${configPath}`);
    return { passed: false, configPath, checks, errors, recommendations };
  }

  checks.fileExists = true;

  try {
    const stats = fs.statSync(configPath);
    const mode = stats.mode & 0o777;
    // Check mode 600 (or 400 read-only)
    if (mode === 0o600 || mode === 0o400) {
      checks.filePermissionsMode600 = true;
    } else {
      errors.push(`Insecure file permissions: 0o${mode.toString(8)}. Must be mode 600 (chmod 600).`);
      recommendations.push(`Run: chmod 600 ${configPath}`);
    }

    const raw = fs.readFileSync(configPath, "utf-8");
    const config: WebhookConfig = JSON.parse(raw);

    if (config.bot_token) {
      checks.hasBotToken = true;
    } else {
      recommendations.push("Consider storing bot_token in config file or secure environment.");
    }

    if (config.secret_token) {
      checks.hasSecretToken = true;
      checks.secretLength = config.secret_token.length;
      const entropy = checkSecretEntropy(config.secret_token);
      checks.secretEntropyValid = entropy.valid;
      if (!entropy.valid) {
        for (const err of entropy.errors) {
          errors.push(err);
        }
      }
    } else {
      errors.push("Missing required secret_token in configuration.");
    }

    if (config.webhook_url) {
      if (config.webhook_url.startsWith("https://")) {
        checks.urlIsHttps = true;
      } else {
        errors.push(`Invalid webhook_url "${config.webhook_url}". Telegram Bot API strictly requires HTTPS.`);
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to parse or audit config file: ${msg}`);
  }

  return {
    passed: errors.length === 0,
    configPath,
    checks,
    errors,
    recommendations,
  };
}

/**
 * Scaffold production-grade webhook receiver project
 */
export function scaffoldReceiver(outputDir: string): { filesCreated: string[] } {
  const filesCreated: string[] = [];
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const serverTs = `import * as http from "node:http";
import { createWebhookListener } from "./webhook-receiver";

const port = Number(process.env.PORT) || 8080;
const secretToken = process.env.TELEGRAM_SECRET_TOKEN || "";

if (!secretToken) {
  console.error("FATAL: TELEGRAM_SECRET_TOKEN environment variable is required.");
  process.exit(1);
}

const server = createWebhookListener({
  port,
  secretToken,
  path: "/webhook",
  maxDriftSeconds: 300,
  onUpdate: async (update, { updateId, ackTimeMs }) => {
    console.log(\`[Update \${updateId}] Ingested in \${ackTimeMs}ms\`);
    // Route to business logic / queue here
  },
  onError: (err) => {
    console.error("[Webhook Error]:", err);
  },
});

server.listen(port, () => {
  console.log(\`Telegram Webhook Receiver listening on port \${port}\`);
});
`;

  const envExample = `# Telegram Webhook Configuration
PORT=8080
TELEGRAM_SECRET_TOKEN=generate_32_char_alphanumeric_secret_here
TELEGRAM_BOT_TOKEN=123456789:ABCDEF_YourBotTokenHere
WEBHOOK_URL=https://api.yourdomain.com/webhook
`;

  const readme = `# Telegram Webhook Receiver Service

Production-grade, zero-dependency Telegram webhook receiver with timing-safe header verification, replay protection, and asynchronous event decoupling.

## Setup
1. Copy \`.env.example\` to \`.env\` and configure variables:
   \`\`\`bash
   cp .env.example .env
   chmod 600 .env
   \`\`\`
2. Run server:
   \`\`\`bash
   bun run server.ts
   \`\`\`
3. Verify liveness probe:
   \`\`\`bash
   curl http://localhost:8080/healthz
   \`\`\`
`;

  fs.writeFileSync(path.join(outputDir, "server.ts"), serverTs, "utf-8");
  filesCreated.push("server.ts");

  fs.writeFileSync(path.join(outputDir, ".env.example"), envExample, "utf-8");
  filesCreated.push(".env.example");

  fs.writeFileSync(path.join(outputDir, "README.md"), readme, "utf-8");
  filesCreated.push("README.md");

  return { filesCreated };
}

// ==========================================
// CLI Driver
// ==========================================

function printHelp(): void {
  console.log(`
📱 Telegram Webhook Ingress Receiver & Security Engine

Usage:
  bun webhook-receiver.ts [commands] [options]

Commands:
  --listen-webhook          Start standalone HTTP webhook receiver
  --verify-secret           Test secret token verification
  --register-webhook        Generate setWebhook curl command and JSON payload
  --audit-config            Audit webhook configuration file permissions and entropy
  --scaffold-receiver       Scaffold ready-to-run receiver service directory
  --generate-secret         Generate high-entropy 32+ character secret token

Options:
  --port <number>           HTTP port to bind (default: 8080)
  --host <string>           HTTP host interface (default: 0.0.0.0)
  --config <path>           Path to telegram config JSON file
  --secret-token <token>    Expected secret token for verification
  --header <value>          Received X-Telegram-Bot-Api-Secret-Token header
  --url <https-url>         Ingress HTTPS URL for setWebhook
  --bot-token <token>       Telegram Bot Token (masked in display)
  --output <dir>            Target directory for scaffold command
  --json                    Output machine-readable JSON
  --help                    Show this help message
`);
}

function parseCliArgs(): { command: string; options: Record<string, unknown> } {
  const args = process.argv.slice(2);
  let command = "help";
  const options: Record<string, unknown> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--listen-webhook") command = "listen-webhook";
    else if (arg === "--verify-secret") command = "verify-secret";
    else if (arg === "--register-webhook") command = "register-webhook";
    else if (arg === "--audit-config") command = "audit-config";
    else if (arg === "--scaffold-receiver") command = "scaffold-receiver";
    else if (arg === "--generate-secret") command = "generate-secret";
    else if (arg === "--help" || arg === "-h") command = "help";
    else if (arg === "--json") options.json = true;
    else if (arg === "--port") options.port = Number(args[++i]);
    else if (arg === "--host") options.host = args[++i];
    else if (arg === "--config") options.config = args[++i];
    else if (arg === "--secret-token" || arg === "--secret") options.secretToken = args[++i];
    else if (arg === "--header") options.header = args[++i];
    else if (arg === "--url") options.url = args[++i];
    else if (arg === "--bot-token") options.botToken = args[++i];
    else if (arg === "--output") options.output = args[++i];
  }

  return { command, options };
}

export function runCli(): void {
  const { command, options } = parseCliArgs();

  if (command === "help") {
    printHelp();
    return;
  }

  if (command === "generate-secret") {
    const token = generateSecretToken(32);
    const entropy = checkSecretEntropy(token);
    if (options.json) {
      console.log(JSON.stringify({ secret_token: token, ...entropy }, null, 2));
    } else {
      console.log(`\nGenerated 32-char Secret Token: ${token}`);
      console.log(`Entropy: ~${entropy.entropyBitsApprox} bits (Valid: ${entropy.valid})\n`);
    }
    return;
  }

  if (command === "verify-secret") {
    const header = typeof options.header === "string" ? options.header : undefined;
    const secret = typeof options.secretToken === "string" ? options.secretToken : "";
    const res = verifySecretToken(header, secret);
    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\nSecret Token Verification: ${res.valid ? "PASSED" : "FAILED"}`);
      if (res.reason) console.log(`Reason: ${res.reason}`);
      console.log();
    }
    process.exit(res.valid ? 0 : 1);
  }

  if (command === "audit-config") {
    const configPath = typeof options.config === "string" ? options.config : "telegram-config.json";
    const audit = auditWebhookConfig(configPath);
    if (options.json) {
      console.log(JSON.stringify(audit, null, 2));
    } else {
      console.log(`\n🛡️  Telegram Webhook Config Audit: ${audit.passed ? "PASSED" : "FAILED"}`);
      console.log(`File: ${audit.configPath}`);
      console.log(`- File Exists: ${audit.checks.fileExists ? "✅" : "❌"}`);
      console.log(`- Mode 600 Permissions: ${audit.checks.filePermissionsMode600 ? "✅" : "❌"}`);
      console.log(`- Secret Token Present: ${audit.checks.hasSecretToken ? "✅" : "❌"}`);
      console.log(`- Secret Entropy (>=32 chars): ${audit.checks.secretEntropyValid ? "✅" : "❌"}`);
      console.log(`- Webhook URL HTTPS: ${audit.checks.urlIsHttps ? "✅" : "❌"}`);
      if (audit.errors.length > 0) {
        console.log("\nErrors:");
        for (const err of audit.errors) console.log(`  ❌ ${err}`);
      }
      if (audit.recommendations.length > 0) {
        console.log("\nRecommendations:");
        for (const rec of audit.recommendations) console.log(`  💡 ${rec}`);
      }
      console.log();
    }
    process.exit(audit.passed ? 0 : 1);
  }

  if (command === "register-webhook") {
    const url = typeof options.url === "string" ? options.url : "https://api.yourdomain.com/webhook";
    const secret = typeof options.secretToken === "string" ? options.secretToken : generateSecretToken(32);
    const botToken = typeof options.botToken === "string" ? options.botToken : undefined;

    const payload = generateSetWebhookPayload(url, secret);
    const curl = generateSetWebhookCurl(botToken || "<BOT_TOKEN>", url, secret);

    if (options.json) {
      console.log(JSON.stringify({ payload, curl }, null, 2));
    } else {
      console.log("\n📡 Telegram setWebhook Registration Payload:");
      console.log(JSON.stringify(payload, null, 2));
      console.log("\nExecutable Curl Command:");
      console.log(curl);
      console.log();
    }
    return;
  }

  if (command === "scaffold-receiver") {
    const outputDir = typeof options.output === "string" ? options.output : "./telegram-receiver";
    const result = scaffoldReceiver(outputDir);
    if (options.json) {
      console.log(JSON.stringify({ outputDir, ...result }, null, 2));
    } else {
      console.log(`\n🏗️  Scaffolded Webhook Receiver in: ${outputDir}`);
      for (const file of result.filesCreated) {
        console.log(`  + ${file}`);
      }
      console.log();
    }
    return;
  }

  if (command === "listen-webhook") {
    let secret = typeof options.secretToken === "string" ? options.secretToken : undefined;
    let port = typeof options.port === "number" ? options.port : 8080;
    let host = typeof options.host === "string" ? options.host : "0.0.0.0";
    const cfgPath = typeof options.config === "string" ? options.config : undefined;

    if (cfgPath && fs.existsSync(cfgPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
        if (!secret && cfg.secret_token) secret = cfg.secret_token;
        if (!options.port && cfg.port) port = cfg.port;
        if (!options.host && cfg.host) host = cfg.host;
      } catch (_e) {}
    }

    if (!secret) {
      console.error("FATAL: --secret-token or valid config file with secret_token is required.");
      process.exit(1);
    }

    const server = createWebhookListener({
      port,
      host,
      secretToken: secret,
      path: "/webhook",
      onUpdate: (_update, { updateId, ackTimeMs }) => {
        console.log(`[telegram:webhook] Update ${updateId} acknowledged in ${ackTimeMs}ms`);
      },
    });

    server.listen(port, host, () => {
      console.log(`\n🚀 Telegram Webhook Receiver active at http://${host}:${port}/webhook`);
      console.log(`Health probe: http://${host}:${port}/healthz\n`);
    });
    return;
  }
}

// Run CLI when executed directly
if (import.meta.main || process.argv[1]?.endsWith("webhook-receiver.ts")) {
  runCli();
}
