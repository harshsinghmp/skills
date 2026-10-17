#!/usr/bin/env bun
/**
 * webdev CLI: Brownfield legacy environment scanner & idempotent webhook handler generator.
 *
 * Usage:
 *   bun webdev.ts --brownfield-scan [dir]
 *   bun webdev.ts --webhook-scaffold <stripe|shopify|generic>
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

export interface BrownfieldReport {
  isBrownfield: boolean;
  markers: string[];
  recommendedPackageManager: string;
  lockedInvariants: string[];
  riskRating: "LOW" | "MEDIUM" | "HIGH";
}

export function scanBrownfield(targetDir = process.cwd()): BrownfieldReport {
  const markers: string[] = [];
  const lockedInvariants: string[] = [];

  // 1. Check WordPress / PHP markers
  if (fs.existsSync(path.join(targetDir, "wp-content")) || fs.existsSync(path.join(targetDir, "wp-config.php"))) {
    markers.push("WordPress Core / PHP Theme");
    lockedInvariants.push("Do NOT replace PHP with Node/SSR without signed migration SOW.");
  }

  // 2. Check Package Manager
  let pm = "npm";
  if (fs.existsSync(path.join(targetDir, "yarn.lock"))) {
    pm = "yarn";
    lockedInvariants.push("Lock package manager to yarn; do not run npm/bun install.");
  } else if (fs.existsSync(path.join(targetDir, "pnpm-lock.yaml"))) {
    pm = "pnpm";
    lockedInvariants.push("Lock package manager to pnpm; do not introduce npm/bun.");
  } else if (fs.existsSync(path.join(targetDir, "package-lock.json"))) {
    pm = "npm";
    lockedInvariants.push("Lock package manager to npm; do not introduce alternative package managers.");
  }

  // 3. Inspect package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (allDeps["react-scripts"]) {
        markers.push("Create-React-App (react-scripts)");
        lockedInvariants.push("Do NOT migrate to Vite or Next.js in a feature PR.");
      }
      if (allDeps.webpack && !allDeps.next) {
        markers.push("Custom Webpack Configuration");
        lockedInvariants.push("Preserve Webpack build aliases and polyfills.");
      }
      if (allDeps.next && fs.existsSync(path.join(targetDir, "pages"))) {
        markers.push("Next.js Pages Router");
        lockedInvariants.push("Do NOT mass-migrate Pages Router to App Router.");
      }
      if (pkg.type !== "module") {
        markers.push("CommonJS Repository (type != module)");
        lockedInvariants.push("Do NOT convert CommonJS require/exports to ESM.");
      }
    } catch {
      // Ignored
    }
  }

  const isBrownfield = markers.length > 0;
  const riskRating = markers.length >= 2 ? "HIGH" : markers.length === 1 ? "MEDIUM" : "LOW";

  return {
    isBrownfield,
    markers,
    recommendedPackageManager: pm,
    lockedInvariants,
    riskRating,
  };
}

export function scaffoldWebhook(provider: "stripe" | "shopify" | "generic"): string {
  if (provider === "stripe") {
    return `// Production-Grade Idempotent Stripe Webhook Handler
import Stripe from "stripe";
import crypto from "node:crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Dedicated in-memory or Redis/DB event dedup cache (24hr TTL)
const processedEventCache = new Set<string>();

export async function handleStripeWebhook(req: Request): Promise<Response> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), { status: 400 });
  }

  // 1. Raw body capture (MUST be arrayBuffer/text, never pre-parsed JSON)
  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  // 2. Atomic Idempotency Check
  if (processedEventCache.has(event.id)) {
    console.log(\`[Stripe Webhook] Duplicate event ignored: \${event.id}\`);
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  // 3. Mark in progress & process
  processedEventCache.add(event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Offload or process business logic
        console.log(\`Payment completed for session: \${session.id}\`);
        break;
      }
      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    // Quarantine failure and remove from cache to allow legitimate retry if transient
    processedEventCache.delete(event.id);
    console.error(\`Failed to process event \${event.id}:\`, err);
    return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
  }
}
`;
  }

  if (provider === "shopify") {
    return `// Production-Grade Idempotent Shopify Webhook Handler
import crypto from "node:crypto";

const processedEventCache = new Set<string>();

export async function handleShopifyWebhook(req: Request): Promise<Response> {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const webhookId = req.headers.get("x-shopify-webhook-id");
  const topic = req.headers.get("x-shopify-topic");

  if (!hmacHeader || !webhookId) {
    return new Response("Missing required Shopify headers", { status: 400 });
  }

  const rawBody = await req.text();
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET!;
  const generatedHash = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  // Constant-time comparison
  const isValid = crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmacHeader));
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (processedEventCache.has(webhookId)) {
    return new Response(JSON.stringify({ status: "duplicate", webhookId }), { status: 200 });
  }
  processedEventCache.add(webhookId);

  console.log(\`Processed Shopify webhook [\${topic}]: \${webhookId}\`);
  return new Response("OK", { status: 200 });
}
`;
  }

  return `// Production-Grade Generic Webhook Handler with HMAC & Idempotency
import crypto from "node:crypto";

export function verifyGenericWebhook(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
`;
}

export function scaffoldFormShield(provider = "turnstile"): string {
  return `// Production-Grade Anti-Spam Form Shield (${provider.toUpperCase()} + Honeypot + Zod)
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Invalid email format").max(254),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  // 1. Honeypot field (hidden from legitimate users, auto-filled by bots)
  website_url_hp: z.string().max(0, "Bot detected").optional().or(z.literal("")),
  // 2. Cloudflare Turnstile token
  turnstileToken: z.string().min(1, "Turnstile verification required"),
});

export async function handleContactSubmission(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // 1. Validate boundary with Zod & Honeypot
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    // If honeypot failed, silently return fake 200 OK to discard bot submission
    const isBot = parsed.error.issues.some((i) => i.path.includes("website_url_hp"));
    if (isBot) {
      console.warn("[FormShield] Spam bot trapped in honeypot. Discarding silently.");
      return new Response(JSON.stringify({ success: true, message: "Thank you for reaching out!" }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten() }), { status: 400 });
  }

  const { name, email, phone, message, turnstileToken } = parsed.data;

  // 2. Cloudflare Turnstile Verification
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: turnstileToken,
      remoteip: req.headers.get("x-forwarded-for") || "",
    }),
  });

  const turnstileData = (await verifyRes.json()) as { success: boolean; "error-codes"?: string[] };
  if (!turnstileData.success) {
    console.error("[FormShield] Turnstile challenge failed:", turnstileData["error-codes"]);
    return new Response(JSON.stringify({ error: "CAPTCHA challenge failed. Please retry." }), { status: 403 });
  }

  // 3. Process Verified Lead (Database insertion, CRM webhook, or Notification)
  console.log(\`[FormShield] Verified lead from \${email} (\${name})\`);

  return new Response(
    JSON.stringify({ success: true, message: "Submission received and verified." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
`;
}

export interface MigrationSafetyReport {
  safe: boolean;
  violations: string[];
  recommendations: string[];
}

export function checkMigrationSafety(sqlOrMigrationContent: string): MigrationSafetyReport {
  const violations: string[] = [];
  const recommendations: string[] = [];

  const upper = sqlOrMigrationContent.toUpperCase();

  if (/\bDROP\s+TABLE\b/i.test(upper)) {
    violations.push("Destructive 'DROP TABLE' detected.");
    recommendations.push("Archive table to backup schema or deprecate before dropping.");
  }

  if (/\bDROP\s+COLUMN\b/i.test(upper)) {
    violations.push("Destructive 'DROP COLUMN' detected.");
    recommendations.push(
      "Follow 3-Phase Expand-Contract: Deprecate column reads, verify 0 queries in logs, then drop in separate release.",
    );
  }

  if (/\bRENAME\s+COLUMN\b/i.test(upper)) {
    violations.push("Breaking 'RENAME COLUMN' detected.");
    recommendations.push(
      "Add new column, dual-write in backend, backfill data, and switch reads rather than atomic in-place rename.",
    );
  }

  if (/\bALTER\s+COLUMN\b.*?\bTYPE\b/i.test(upper) || /\bMODIFY\s+COLUMN\b/i.test(upper)) {
    violations.push("In-place column TYPE change detected.");
    recommendations.push("Create a new typed column, dual-write, and run batched backfill off the hot path.");
  }

  if (/\bADD\s+COLUMN\b.*?\bNOT\s+NULL\b/i.test(upper) && !/\bDEFAULT\b/i.test(upper)) {
    violations.push("Adding NOT NULL column without DEFAULT value.");
    recommendations.push(
      "Add column as NULLABLE or provide DEFAULT value to prevent table lock and migration failure.",
    );
  }

  return {
    safe: violations.length === 0,
    violations,
    recommendations,
  };
}

export interface EdgeScanViolation {
  file: string;
  importName: string;
  reason: string;
  fix: string;
}

export interface EdgeScanReport {
  totalFilesScanned: number;
  edgeFilesFound: number;
  violations: EdgeScanViolation[];
}

const FORBIDDEN_EDGE_IMPORTS = [
  {
    match: /\b(?:import|require)\s*\(?['"](?:node:)?fs(?:\/promises)?['"]\)?/g,
    name: "node:fs",
    reason: "Filesystem access unsupported in V8 Edge isolates.",
    fix: "Use Cloudflare KV, R2, or remote object storage.",
  },
  {
    match: /\b(?:import|require)\s*\(?['"](?:node:)?child_process['"]\)?/g,
    name: "node:child_process",
    reason: "Process spawning unsupported in Edge isolates.",
    fix: "Offload shell/process tasks to dedicated Node workers.",
  },
  {
    match: /\b(?:import|require)\s*\(?['"](?:node:)?net['"]\)?/g,
    name: "node:net",
    reason: "Raw TCP net sockets unsupported directly in Edge isolates.",
    fix: "Use WebSocket, HTTP, or Neon/Cloudflare TCP socket bridges.",
  },
  {
    match: /\b(?:import|require)\s*\(?['"](?:node:)?tls['"]\)?/g,
    name: "node:tls",
    reason: "Native TLS module unsupported in Edge isolates.",
    fix: "Use standard fetch with HTTPS.",
  },
  {
    match: /\b(?:import|require)\s*\(?['"]bcrypt['"]\)?/g,
    name: "bcrypt",
    reason: "Native C++ bcrypt binary incompatible with Edge isolates.",
    fix: "Use 'bcryptjs' or Web Crypto API (SubtleCrypto).",
  },
  {
    match: /\b(?:import|require)\s*\(?['"]sharp['"]\)?/g,
    name: "sharp",
    reason: "Native C++ sharp binary incompatible with Edge isolates.",
    fix: "Use Cloudflare/Vercel Image Optimization or WebAssembly image encoders.",
  },
  {
    match: /\b(?:import|require)\s*\(?['"]canvas['"]\)?/g,
    name: "canvas",
    reason: "Native C++ canvas binary incompatible with Edge isolates.",
    fix: "Use Satori, SVG generation, or remote rendering service.",
  },
];

export function scanEdgeRuntimeBoundaries(targetPath = process.cwd()): EdgeScanReport {
  let totalFiles = 0;
  let edgeFiles = 0;
  const violations: EdgeScanViolation[] = [];

  function walk(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      if (currentPath.includes("node_modules") || currentPath.includes(".git") || currentPath.includes(".agents"))
        return;
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        walk(path.join(currentPath, file));
      }
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(currentPath)) {
      totalFiles++;
      const content = fs.readFileSync(currentPath, "utf8");
      // Check if designated as edge
      const isEdge =
        /runtime\s*=\s*['"]edge['"]/.test(content) ||
        /export\s+const\s+edge\s*=\s*true/.test(content) ||
        currentPath.includes("edge-runtime");

      if (isEdge) {
        edgeFiles++;
        for (const rule of FORBIDDEN_EDGE_IMPORTS) {
          if (rule.match.test(content)) {
            violations.push({
              file: path.relative(process.cwd(), currentPath),
              importName: rule.name,
              reason: rule.reason,
              fix: rule.fix,
            });
          }
        }
      }
    }
  }

  walk(targetPath);

  return {
    totalFilesScanned: totalFiles,
    edgeFilesFound: edgeFiles,
    violations,
  };
}

export interface PoolingViolation {
  file: string;
  line: number;
  pattern: string;
  message: string;
  fix: string;
}

export interface PoolingReport {
  filesScanned: number;
  violations: PoolingViolation[];
  safe: boolean;
}

export function checkConnectionPooling(targetPath = process.cwd()): PoolingReport {
  let filesScanned = 0;
  const violations: PoolingViolation[] = [];

  function walk(current: string) {
    if (!fs.existsSync(current)) return;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      if (current.includes("node_modules") || current.includes(".git") || current.includes(".agents")) return;
      for (const item of fs.readdirSync(current)) {
        walk(path.join(current, item));
      }
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(current)) {
      filesScanned++;
      const content = fs.readFileSync(current, "utf8");
      const lines = content.split("\n");

      const isRouteOrHandler =
        /(?:api|routes|handlers|endpoints)[/\\]/.test(current) ||
        /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH|handler)\b/.test(content);

      if (isRouteOrHandler) {
        lines.forEach((lineText, idx) => {
          if (/\bnew\s+(?:Pool|Client|PrismaClient)\s*\(/.test(lineText)) {
            if (!content.includes("globalThis") && !content.includes("prisma || new")) {
              violations.push({
                file: current,
                line: idx + 1,
                pattern: lineText.trim(),
                message: "Direct unpooled DB client instantiated inside route handler.",
                fix: "Use a global singleton or pooled connection proxy (e.g. PgBouncer / Neon connection string).",
              });
            }
          }
        });
      }
    }
  }

  walk(targetPath);
  return {
    filesScanned,
    violations,
    safe: violations.length === 0,
  };
}

export function scaffoldPresignedUpload(provider: "s3" | "r2" = "s3"): string {
  const service = provider === "r2" ? "Cloudflare R2" : "AWS S3";
  const envPrefix = provider === "r2" ? "R2" : "AWS";
  const bucketEnv = provider === "r2" ? "R2_BUCKET_NAME" : "S3_BUCKET_NAME";

  return `// Hardened Direct-to-Storage Presigned Upload Handler (${service})
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.${provider === "r2" ? "R2_ENDPOINT" : "S3_ENDPOINT"},
  credentials: {
    accessKeyId: process.env.${envPrefix}_ACCESS_KEY_ID!,
    secretAccessKey: process.env.${envPrefix}_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB strict ceiling

export async function generatePresignedUploadUrl(filename: string, contentType: string, sizeBytes: number) {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error(\`Forbidden MIME type: \${contentType}. Only safe documents and images are permitted.\`);
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(\`File size \${sizeBytes} exceeds maximum allowed budget (\${MAX_FILE_SIZE_BYTES} bytes).\`);
  }

  // Prevent path traversal and filename collision via sanitized UUID key
  const ext = filename.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const objectKey = \`uploads/\${new Date().toISOString().split("T")[0]}/\${crypto.randomUUID()}.\${ext}\`;

  const command = new PutObjectCommand({
    Bucket: process.env.${bucketEnv}!,
    Key: objectKey,
    ContentType: contentType,
  });

  // Short 15-minute lease
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

  return {
    uploadUrl,
    objectKey,
    publicUrl: \`\${process.env.PUBLIC_ASSET_CDN_URL}/\${objectKey}\`,
  };
}
`;
}

export function scaffoldIsolatedWidget(widgetName = "muse-client-widget"): string {
  const className = widgetName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  return `// Isolated Embeddable Web Component using Shadow DOM
// Guarantees zero style bleed into host websites (WordPress, Shopify, Webflow)
class ${className} extends HTMLElement {
  constructor() {
    super();
    // 1. Attach open Shadow DOM to isolate CSS specificity
    const shadow = this.attachShadow({ mode: "open" });

    // 2. Encapsulated Styles (zero leak to or from host page)
    const style = document.createElement("style");
    style.textContent = \`
      :host {
        all: initial;
        font-family: system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
      }
      *, *::before, *::after {
        box-sizing: inherit;
      }
      .widget-container {
        background: #ffffff;
        color: #111827;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        padding: 16px;
        max-width: 360px;
        border: 1px solid #e5e7eb;
      }
      .widget-btn {
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
      }
      .widget-btn:hover {
        background: #1d4ed8;
      }
    \`;

    // 3. Encapsulated Template
    const container = document.createElement("div");
    container.className = "widget-container";
    container.innerHTML = \`
      <div style="font-weight: 600; margin-bottom: 8px;">Agency Embedded Widget</div>
      <p style="font-size: 14px; color: #4b5563; margin-bottom: 12px;">
        Isolated Shadow DOM element immunized from host CSS rules.
      </p>
      <button class="widget-btn">Interactive Action</button>
    \`;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}

if (!customElements.get("${widgetName}")) {
  customElements.define("${widgetName}", ${className});
}
`;
}

export interface AntiFoucOptions {
  storageKey?: string;
  themeClass?: string;
  defaultTheme?: "system" | "dark" | "light";
}

export function generateAntiFoucScript(opts?: AntiFoucOptions): { inlineJs: string; htmlTag: string } {
  const storageKey = opts?.storageKey || "theme";
  const themeClass = opts?.themeClass || "dark";
  const defaultTheme = opts?.defaultTheme || "system";

  const inlineJs = `(function(){try{var k='${storageKey}',c='${themeClass}',d='${defaultTheme}';var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s===c||(!s&&d==='dark')||(!s&&d==='system'&&m)){document.documentElement.classList.add(c);}else{document.documentElement.classList.remove(c);}}catch(e){}})();`;

  const htmlTag = `<script>\n  ${inlineJs}\n</script>`;
  return { inlineJs, htmlTag };
}

export interface FontMetricOverride {
  fontFamily: string;
  fallbackFont: string;
  sizeAdjust: string;
  ascentOverride: string;
  descentOverride: string;
  lineGapOverride: string;
  css: string;
}

const PRESET_FONT_METRICS: Record<
  string,
  { sizeAdjust: string; ascentOverride: string; descentOverride: string; lineGapOverride: string; fallbackFont: string }
> = {
  inter: {
    sizeAdjust: "107.5%",
    ascentOverride: "89.6%",
    descentOverride: "22.4%",
    lineGapOverride: "0%",
    fallbackFont: "Arial",
  },
  roboto: {
    sizeAdjust: "100.0%",
    ascentOverride: "92.8%",
    descentOverride: "24.4%",
    lineGapOverride: "0%",
    fallbackFont: "Arial",
  },
  poppins: {
    sizeAdjust: "98.5%",
    ascentOverride: "105.0%",
    descentOverride: "35.0%",
    lineGapOverride: "9.8%",
    fallbackFont: "Arial",
  },
  geist: {
    sizeAdjust: "102.0%",
    ascentOverride: "94.0%",
    descentOverride: "26.0%",
    lineGapOverride: "0%",
    fallbackFont: "Arial",
  },
  playfair: {
    sizeAdjust: "108.0%",
    ascentOverride: "107.0%",
    descentOverride: "28.0%",
    lineGapOverride: "0%",
    fallbackFont: "Times New Roman",
  },
  "playfair display": {
    sizeAdjust: "108.0%",
    ascentOverride: "107.0%",
    descentOverride: "28.0%",
    lineGapOverride: "0%",
    fallbackFont: "Times New Roman",
  },
  montserrat: {
    sizeAdjust: "96.5%",
    ascentOverride: "96.8%",
    descentOverride: "25.1%",
    lineGapOverride: "0%",
    fallbackFont: "Arial",
  },
  "open sans": {
    sizeAdjust: "102.0%",
    ascentOverride: "106.9%",
    descentOverride: "29.3%",
    lineGapOverride: "0%",
    fallbackFont: "Arial",
  },
};

export function generateFontMetricOverrides(fontFamily = "Inter", fallbackChoice?: string): FontMetricOverride {
  const key = fontFamily.trim().toLowerCase();
  const preset = PRESET_FONT_METRICS[key];
  const fallbackFont = fallbackChoice || preset?.fallbackFont || (key.includes("serif") ? "Times New Roman" : "Arial");
  const sizeAdjust = preset?.sizeAdjust || "100.0%";
  const ascentOverride = preset?.ascentOverride || "95.0%";
  const descentOverride = preset?.descentOverride || "25.0%";
  const lineGapOverride = preset?.lineGapOverride || "0%";

  const css = `/* Zero-CLS Fallback Font Metric Overrides for ${fontFamily} */
@font-face {
  font-family: '${fontFamily}-Fallback';
  src: local('${fallbackFont}');
  ascent-override: ${ascentOverride};
  descent-override: ${descentOverride};
  line-gap-override: ${lineGapOverride};
  size-adjust: ${sizeAdjust};
}

:root {
  --font-${key.replace(/\s+/g, "-")}: '${fontFamily}', '${fontFamily}-Fallback', ${fallbackFont}, sans-serif;
}`;

  return {
    fontFamily,
    fallbackFont,
    sizeAdjust,
    ascentOverride,
    descentOverride,
    lineGapOverride,
    css,
  };
}

export function generatePrintStylesheet(): string {
  return `/**
 * 🖨️ Agency Clean Print-to-PDF Stylesheet
 * Strips interactive chrome, resets backgrounds to pure white, and prevents page splits on cards.
 */
@media print {
  *, *::before, *::after {
    background: transparent !important;
    color: #000000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  @page {
    margin: 1.5cm;
    size: auto;
  }

  /* 1. Eliminate Interactive Chrome */
  header, nav, footer, aside,
  [role="navigation"], [role="banner"],
  .cookie-banner, .toast, .modal, .chat-widget,
  .no-print, [aria-hidden="true"] {
    display: none !important;
  }

  /* 2. Page Break Hygiene */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }

  p, blockquote, pre, table, figure, img, .card, tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 3. Expand External URLs */
  a[href^="http"]:not([href*="javascript:"])::after {
    content: " (" attr(href) ")";
    font-size: 80%;
    color: #4b5563 !important;
    word-break: break-all;
  }

  /* 4. Table Formatting */
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  th, td {
    border: 1px solid #d1d5db !important;
    padding: 6px 10px !important;
  }
}`;
}

export function generateAnchorScrollPadding(headerHeight = "4.5rem"): string {
  return `/**
 * ⚓ Sticky/Fixed Navbar Anchor Scroll Offset
 * Prevents anchor targets (#hash) from scrolling underneath sticky headers.
 */
:root {
  --header-height: ${headerHeight};
}

html {
  scroll-padding-top: calc(var(--header-height, ${headerHeight}) + 0.75rem);
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}`;
}

export interface HydrationPolishAuditReport {
  score: number;
  passed: boolean;
  pass: boolean;
  checks: {
    antiFoucHeadScript: boolean;
    fontMetricOverrides: boolean;
    printStylesheet: boolean;
    anchorScrollPadding: boolean;
  };
  details: string[];
}

export function auditHydrationPolish(targetDir = process.cwd()): HydrationPolishAuditReport {
  const checks = {
    antiFoucHeadScript: false,
    fontMetricOverrides: false,
    printStylesheet: false,
    anchorScrollPadding: false,
  };
  const details: string[] = [];

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === ".agents") continue;
        const full = path.join(dir, entry);
        try {
          const st = fs.statSync(full);
          if (st.isDirectory()) {
            scan(full);
          } else {
            const ext = path.extname(entry).toLowerCase();
            if ([".html", ".astro", ".tsx", ".jsx", ".vue", ".svelte"].includes(ext)) {
              const content = fs.readFileSync(full, "utf8");
              if (
                (content.includes("localStorage.getItem") && content.includes("classList.add")) ||
                content.includes("theme-hydrator") ||
                content.includes("prefers-color-scheme")
              ) {
                checks.antiFoucHeadScript = true;
              }
            }
            if ([".css", ".scss", ".astro", ".tsx", ".jsx", ".html"].includes(ext)) {
              const content = fs.readFileSync(full, "utf8");
              if (content.includes("size-adjust") || content.includes("ascent-override")) {
                checks.fontMetricOverrides = true;
              }
              if (content.includes("@media print")) {
                checks.printStylesheet = true;
              }
              if (content.includes("scroll-padding-top") || content.includes("scroll-padding")) {
                checks.anchorScrollPadding = true;
              }
            }
          }
        } catch {
          // Ignore inaccessible files
        }
      }
    } catch {
      // Ignore inaccessible directories
    }
  }

  scan(targetDir);

  let score = 0;
  if (checks.antiFoucHeadScript) {
    score += 25;
    details.push("✅ Anti-FOUC inline blocking theme hydrator found");
  } else {
    details.push("⚠️ Missing Anti-FOUC blocking head script (risks dark/light white flash)");
  }

  if (checks.fontMetricOverrides) {
    score += 25;
    details.push("✅ Zero-CLS font metric overrides (size-adjust/ascent-override) found");
  } else {
    details.push("⚠️ Missing font metric overrides for system fallbacks (risks CLS on font swap)");
  }

  if (checks.printStylesheet) {
    score += 25;
    details.push("✅ Clean print-to-PDF (@media print) stylesheet detected");
  } else {
    details.push("⚠️ Missing @media print stylesheet (prints navbars, dark backgrounds, broken cards)");
  }

  if (checks.anchorScrollPadding) {
    score += 25;
    details.push("✅ Sticky navbar anchor scroll offset (scroll-padding-top) configured");
  } else {
    details.push("⚠️ Missing scroll-padding-top on html (anchor clicks scroll under fixed headers)");
  }

  const passed = score === 100;
  return {
    score,
    passed,
    pass: passed,
    checks,
    details,
  };
}

export function scaffoldHydrationPolishSuite(
  targetDir = process.cwd(),
  opts?: { fontFamily?: string; headerHeight?: string; storageKey?: string },
): { cssPath: string; hydratorPath: string; filesCreated: string[] } {
  let stylesDir = path.join(targetDir, "styles");
  if (fs.existsSync(path.join(targetDir, "src/styles"))) {
    stylesDir = path.join(targetDir, "src/styles");
  } else if (fs.existsSync(path.join(targetDir, "styles"))) {
    stylesDir = path.join(targetDir, "styles");
  }
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }

  const publicDir = fs.existsSync(path.join(targetDir, "public")) ? path.join(targetDir, "public") : targetDir;
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const fontOverride = generateFontMetricOverrides(opts?.fontFamily || "Inter");
  const printCss = generatePrintStylesheet();
  const anchorCss = generateAnchorScrollPadding(opts?.headerHeight || "4.5rem");

  const combinedCss = `/**
 * ⚡ Webdev Hydration & Typography Polish Suite
 * Generated by muse-skills webdev engine.
 */

${fontOverride.css}

${anchorCss}

${printCss}
`;

  const cssPath = path.join(stylesDir, "hydration-polish.css");
  fs.writeFileSync(cssPath, combinedCss, "utf8");

  const { htmlTag } = generateAntiFoucScript({ storageKey: opts?.storageKey || "theme" });
  const hydratorPath = path.join(publicDir, "theme-hydrator.html");
  fs.writeFileSync(hydratorPath, htmlTag, "utf8");

  return {
    cssPath,
    hydratorPath,
    filesCreated: [cssPath, hydratorPath],
  };
}

export function checkPortAvailability(
  port: number,
): Promise<{ port: number; available: boolean; pid?: number; processName?: string }> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        let pid: number | undefined;
        let processName: string | undefined;
        try {
          const lsof = spawnSync("lsof", ["-i", `:${port}`, "-t"], { encoding: "utf8" });
          if (lsof.status === 0 && lsof.stdout.trim()) {
            pid = Number.parseInt(lsof.stdout.trim().split("\n")[0], 10);
            const ps = spawnSync("ps", ["-p", String(pid), "-o", "comm="], { encoding: "utf8" });
            if (ps.status === 0) processName = ps.stdout.trim();
          }
        } catch {
          // Ignore lsof failure
        }
        resolve({ port, available: false, pid, processName });
      } else {
        resolve({ port, available: false });
      }
    });
    server.once("listening", () => {
      server.close(() => {
        resolve({ port, available: true });
      });
    });
    server.listen(port);
  });
}

export async function releasePort(
  port: number,
): Promise<{ port: number; released: boolean; pid?: number; message: string }> {
  const status = await checkPortAvailability(port);
  if (status.available) {
    return { port, released: true, message: `Port ${port} is already free.` };
  }
  if (!status.pid) {
    return { port, released: false, message: `Port ${port} is in use, but PID could not be determined.` };
  }
  try {
    process.kill(status.pid, "SIGTERM");
    return {
      port,
      released: true,
      pid: status.pid,
      message: `Process ${status.pid} (${status.processName || "unknown"}) terminated via SIGTERM.`,
    };
  } catch (err) {
    try {
      process.kill(status.pid, "SIGKILL");
      return { port, released: true, pid: status.pid, message: `Process ${status.pid} force killed via SIGKILL.` };
    } catch {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        port,
        released: false,
        pid: status.pid,
        message: `Failed to terminate PID ${status.pid}: ${errMsg}`,
      };
    }
  }
}

export interface PackageHealthResult {
  name: string;
  valid: boolean;
  isHallucination: boolean;
  isTyposquat: boolean;
  reason?: string;
  suggestedFix?: string;
}

const HALLUCINATED_PACKAGE_MAP: Record<string, string> = {
  "drizzle-orm-pg": "drizzle-orm pg",
  "drizzle-orm-postgres": "drizzle-orm pg",
  "drizzle-orm-mysql": "drizzle-orm mysql2",
  "drizzle-orm-sqlite": "drizzle-orm better-sqlite3",
  "react-query-v5": "@tanstack/react-query",
  "tanstack-query-v5": "@tanstack/react-query",
  "prisma-client-js": "@prisma/client",
  "next-auth-v5": "next-auth@beta",
  "tailwind-css": "tailwindcss",
  "shadcn-ui": "shadcn",
  "framer-motion-v11": "motion",
  "framer-motion-v12": "motion",
};

const KNOWN_TYPOSQUATS: Record<string, string> = {
  "cross-env-js": "cross-env",
  lodahs: "lodash",
  expresss: "express",
  reactt: "react",
  zodd: "zod",
  "chalk-js": "chalk",
  axois: "axios",
};

export function verifyPackageHealth(packageName: string): PackageHealthResult {
  const clean = packageName.trim().toLowerCase();

  // 1. Hallucination probe
  if (HALLUCINATED_PACKAGE_MAP[clean]) {
    return {
      name: packageName,
      valid: false,
      isHallucination: true,
      isTyposquat: false,
      reason: `Package '${packageName}' is a known hallucinated compound package.`,
      suggestedFix: `Install '${HALLUCINATED_PACKAGE_MAP[clean]}' instead.`,
    };
  }

  // 2. Typosquat probe
  if (KNOWN_TYPOSQUATS[clean]) {
    return {
      name: packageName,
      valid: false,
      isHallucination: false,
      isTyposquat: true,
      reason: `Package '${packageName}' matches known malicious typosquat of '${KNOWN_TYPOSQUATS[clean]}'.`,
      suggestedFix: `Install genuine '${KNOWN_TYPOSQUATS[clean]}' instead.`,
    };
  }

  // 3. Regex heuristics: disallow unvetted version suffixes like pkg-v5, pkg-v4
  if (/-v\d+$/.test(clean) && !clean.startsWith("@")) {
    return {
      name: packageName,
      valid: false,
      isHallucination: true,
      isTyposquat: false,
      reason: `Package '${packageName}' appears to be a hallucinated version-suffixed name.`,
      suggestedFix: `Install '${clean.replace(/-v\d+$/, "")}' with version tag (e.g. ${clean.replace(/-v\d+$/, "")}@latest).`,
    };
  }

  return {
    name: packageName,
    valid: true,
    isHallucination: false,
    isTyposquat: false,
  };
}

export interface SsrBoundaryReport {
  filesScanned: number;
  violations: Array<{
    file: string;
    line: number;
    globalUsed: string;
    snippet: string;
    fix: string;
  }>;
}

export function scanSsrBoundaries(targetDir = process.cwd()): SsrBoundaryReport {
  const violations: SsrBoundaryReport["violations"] = [];
  let filesScanned = 0;

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === ".agents") continue;
        const full = path.join(dir, entry);
        try {
          const st = fs.statSync(full);
          if (st.isDirectory()) {
            scan(full);
          } else {
            const ext = path.extname(entry).toLowerCase();
            if ([".tsx", ".jsx", ".astro"].includes(ext)) {
              filesScanned++;
              const lines = fs.readFileSync(full, "utf8").split("\n");
              let insideClientOnlyHook = false;
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes("useEffect(") || line.includes("useLayoutEffect(")) {
                  insideClientOnlyHook = true;
                }
                if (insideClientOnlyHook && line.includes("})")) {
                  insideClientOnlyHook = false;
                }
                if (!insideClientOnlyHook) {
                  const match = line.match(/\b(window|document|localStorage|sessionStorage)\.[a-zA-Z0-9_]+/);
                  if (match && !line.includes("typeof window") && !line.includes("typeof document")) {
                    violations.push({
                      file: path.relative(targetDir, full),
                      line: i + 1,
                      globalUsed: match[1],
                      snippet: line.trim(),
                      fix: `Quarantine inside useEffect() or wrap with 'if (typeof ${match[1]} !== "undefined")'`,
                    });
                  }
                }
              }
            }
          }
        } catch {}
      }
    } catch {}
  }

  scan(targetDir);
  return { filesScanned, violations };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--brownfield-scan")) {
    const idx = args.indexOf("--brownfield-scan");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanBrownfield(target);
    console.log(`\n🛡️ Brownfield Environment Scan: ${target}`);
    console.log(`  Classification: ${report.isBrownfield ? "BROWNFIELD LEGACY" : "GREENFIELD MODERN"}`);
    console.log(`  Risk Rating: ${report.riskRating}`);
    console.log(`  Package Manager: ${report.recommendedPackageManager}`);
    console.log(`  Detected Markers: ${report.markers.length > 0 ? report.markers.join(", ") : "None (Clean Modern)"}`);
    console.log("  Locked Invariants:");
    for (const inv of report.lockedInvariants) {
      console.log(`    - 🔒 ${inv}`);
    }
  } else if (args.includes("--webhook-scaffold")) {
    const idx = args.indexOf("--webhook-scaffold");
    const provider = (args[idx + 1] || "stripe") as "stripe" | "shopify" | "generic";
    console.log(scaffoldWebhook(provider));
  } else if (args.includes("--form-shield-scaffold")) {
    const idx = args.indexOf("--form-shield-scaffold");
    const provider = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "turnstile";
    console.log(scaffoldFormShield(provider));
  } else if (args.includes("--migration-check")) {
    const idx = args.indexOf("--migration-check");
    const target = args[idx + 1];
    if (!target || !fs.existsSync(target)) {
      console.error("Error: Please provide a valid SQL migration file path.");
      process.exit(1);
    }
    const sqlContent = fs.readFileSync(target, "utf8");
    const report = checkMigrationSafety(sqlContent);
    console.log(`\n🧱 Database Migration Safety Check: ${target}`);
    console.log(
      `  Status: ${report.safe ? "✅ SAFE (Expand-Contract Compliant)" : "❌ RISKY (Destructive Operations Detected)"}`,
    );
    if (!report.safe) {
      console.log("  Violations:");
      for (const v of report.violations) {
        console.log(`    - ⚠️  ${v}`);
      }
      console.log("  Recommendations:");
      for (const r of report.recommendations) {
        console.log(`    - 💡 ${r}`);
      }
      process.exit(1);
    }
  } else if (args.includes("--edge-scan")) {
    const idx = args.indexOf("--edge-scan");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanEdgeRuntimeBoundaries(target);
    console.log(`\n⚡ Edge Runtime Boundary Scan: ${target}`);
    console.log(`  Scanned Files: ${report.totalFilesScanned}`);
    console.log(`  Edge Files Identified: ${report.edgeFilesFound}`);
    console.log(`  Violations Found: ${report.violations.length}`);
    if (report.violations.length > 0) {
      for (const v of report.violations) {
        console.log(`    - ❌ [${v.file}] Forbidden import '${v.importName}': ${v.reason} (Fix: ${v.fix})`);
      }
      process.exit(1);
    } else {
      console.log("  ✅ Zero Edge runtime boundary violations detected.");
    }
  } else if (args.includes("--check-pooling")) {
    const idx = args.indexOf("--check-pooling");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = checkConnectionPooling(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🗄️ Database Connection Pooling Check: ${target}`);
      console.log(`  Files Scanned: ${report.filesScanned}`);
      console.log(
        `  Status: ${report.safe ? "✅ SAFE (Singleton / Pooled)" : "❌ RISKY (Unpooled Instantiations Detected)"}`,
      );
      if (!report.safe) {
        for (const v of report.violations) {
          console.log(`    - ⚠️  [${v.file}:${v.line}] ${v.message} (Fix: ${v.fix})`);
        }
      }
    }
  } else if (args.includes("--presigned-upload-scaffold")) {
    const idx = args.indexOf("--presigned-upload-scaffold");
    const provider = (args[idx + 1] === "r2" ? "r2" : "s3") as "s3" | "r2";
    console.log(scaffoldPresignedUpload(provider));
  } else if (args.includes("--widget-scaffold")) {
    const idx = args.indexOf("--widget-scaffold");
    const name = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "muse-client-widget";
    console.log(scaffoldIsolatedWidget(name));
  } else if (args.includes("--anti-fouc-scaffold")) {
    const idx = args.indexOf("--anti-fouc-scaffold");
    const key = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "theme";
    const res = generateAntiFoucScript({ storageKey: key });
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(res.htmlTag);
    }
  } else if (args.includes("--font-metric-override")) {
    const idx = args.indexOf("--font-metric-override");
    const family = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "Inter";
    const fallback = args[idx + 2] && !args[idx + 2].startsWith("-") ? args[idx + 2] : undefined;
    const res = generateFontMetricOverrides(family, fallback);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(res.css);
    }
  } else if (args.includes("--print-css-scaffold")) {
    const css = generatePrintStylesheet();
    if (isJson) {
      console.log(JSON.stringify({ css }, null, 2));
    } else {
      console.log(css);
    }
  } else if (args.includes("--anchor-offset-scaffold")) {
    const idx = args.indexOf("--anchor-offset-scaffold");
    const height = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "4.5rem";
    const css = generateAnchorScrollPadding(height);
    if (isJson) {
      console.log(JSON.stringify({ css }, null, 2));
    } else {
      console.log(css);
    }
  } else if (args.includes("--polish-audit")) {
    const idx = args.indexOf("--polish-audit");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = auditHydrationPolish(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n✨ Front-End Hydration & Polish Audit: ${target}`);
      console.log(`  Score: ${report.score}/100 (${report.passed ? "PASS" : "WARN"})`);
      for (const d of report.details) {
        console.log(`  ${d}`);
      }
    }
    process.exit(report.passed ? 0 : 1);
  } else if (args.includes("--scaffold-polish-suite")) {
    const idx = args.indexOf("--scaffold-polish-suite");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const res = scaffoldHydrationPolishSuite(target);
    if (isJson) {
      console.log(JSON.stringify({ success: true, ...res }, null, 2));
    } else {
      console.log(`\n✨ Hydration & Polish Suite Scaffolded in ${target}:`);
      console.log(`  CSS:      ${res.cssPath}`);
      console.log(`  Hydrator: ${res.hydratorPath}`);
    }
  } else if (args.includes("--port-check")) {
    const defaultPorts = [3000, 4321, 5173, 8080];
    const results = await Promise.all(defaultPorts.map((p) => checkPortAvailability(p)));
    if (isJson) {
      console.log(JSON.stringify({ ports: results }, null, 2));
    } else {
      console.log("\n🔌 Development Port Status Probe:");
      for (const r of results) {
        if (r.available) {
          console.log(`  Port ${r.port}: ✅ FREE`);
        } else {
          console.log(
            `  Port ${r.port}: ❌ OCCUPIED (PID: ${r.pid || "unknown"}, Comm: ${r.processName || "unknown"})`,
          );
        }
      }
    }
  } else if (args.includes("--port-clean")) {
    const idx = args.indexOf("--port-clean");
    const portNum = Number.parseInt(args[idx + 1], 10);
    if (!portNum || Number.isNaN(portNum)) {
      console.error("Error: Please provide a valid port number (e.g. 3000)");
      process.exit(1);
    }
    const res = await releasePort(portNum);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔌 Port Release Result: ${res.message}`);
    }
  } else if (args.includes("--verify-package")) {
    const idx = args.indexOf("--verify-package");
    const pkg = args[idx + 1];
    if (!pkg) {
      console.error("Error: Please provide a package name (e.g. drizzle-orm)");
      process.exit(1);
    }
    const res = verifyPackageHealth(pkg);
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📦 Package Verification: ${pkg}`);
      console.log(`  Status: ${res.valid ? "✅ VALID" : "❌ REJECTED"}`);
      if (!res.valid) {
        console.log(`  Reason: ${res.reason}`);
        if (res.suggestedFix) console.log(`  Fix:    ${res.suggestedFix}`);
      }
    }
    process.exit(res.valid ? 0 : 1);
  } else if (args.includes("--ssr-boundary-scan")) {
    const idx = args.indexOf("--ssr-boundary-scan");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : process.cwd();
    const report = scanSsrBoundaries(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🌐 SSR Hydration Boundary Scan: ${target}`);
      console.log(`  Files Scanned: ${report.filesScanned}`);
      console.log(`  Violations Found: ${report.violations.length}`);
      for (const v of report.violations) {
        console.log(`    - ⚠️ [${v.file}:${v.line}] Accessed '${v.globalUsed}': ${v.snippet} (Fix: ${v.fix})`);
      }
    }
    process.exit(report.violations.length === 0 ? 0 : 1);
  } else {
    console.log(
      "Usage: bun webdev.ts [--brownfield-scan [dir]] [--webhook-scaffold <stripe|shopify|generic>] [--form-shield-scaffold [provider]] [--migration-check <file>] [--edge-scan [dir]] [--check-pooling [dir]] [--presigned-upload-scaffold <s3|r2>] [--widget-scaffold [name]] [--anti-fouc-scaffold [key]] [--font-metric-override [family] [fallback]] [--print-css-scaffold] [--anchor-offset-scaffold [height]] [--polish-audit [dir]] [--scaffold-polish-suite [dir]] [--port-check] [--port-clean <port>] [--verify-package <name>] [--ssr-boundary-scan [dir]]",
    );
  }
}
