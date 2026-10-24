#!/usr/bin/env bun
/**
 * docker-audit.ts: Dockerfile layer cache optimization & container hygiene auditor.
 *
 * Usage:
 *   bun docker-audit.ts --audit [Dockerfile|dir] [--json]
 *   bun docker-audit.ts --scaffold <nextjs|node|bun>
 */

import fs from "node:fs";
import path from "node:path";

export interface DockerViolation {
  file: string;
  line: number;
  severity: "BLOCKING" | "WARNING";
  type: "cache-invalidation" | "missing-multistage" | "missing-dockerignore" | "root-user" | "secret-in-env";
  detail: string;
  recommendation: string;
}

export interface DockerAuditReport {
  dockerfilePath: string;
  isMultiStage: boolean;
  hasDockerignore: boolean;
  score: number;
  violations: DockerViolation[];
  safe: boolean;
}

export function auditDockerfile(targetPath = "Dockerfile"): DockerAuditReport {
  const violations: DockerViolation[] = [];
  let resolvedPath = targetPath;

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    resolvedPath = path.join(targetPath, "Dockerfile");
  }

  if (!fs.existsSync(resolvedPath)) {
    return {
      dockerfilePath: resolvedPath,
      isMultiStage: false,
      hasDockerignore: false,
      score: 0,
      violations: [
        {
          file: resolvedPath,
          line: 1,
          severity: "BLOCKING",
          type: "missing-multistage",
          detail: `Dockerfile not found at ${resolvedPath}`,
          recommendation: "Generate a production Dockerfile using --scaffold <nextjs|node|bun>.",
        },
      ],
      safe: false,
    };
  }

  const content = fs.readFileSync(resolvedPath, "utf8");
  const lines = content.split("\n");
  const dir = path.dirname(resolvedPath);
  const dockerignore = path.join(dir, ".dockerignore");
  const hasDockerignore = fs.existsSync(dockerignore);

  if (!hasDockerignore) {
    violations.push({
      file: resolvedPath,
      line: 1,
      severity: "BLOCKING",
      type: "missing-dockerignore",
      detail: ".dockerignore is missing in build context directory.",
      recommendation: "Create .dockerignore excluding node_modules, .git, .env, and dist.",
    });
  }

  const fromMatches = content.match(/^FROM\s+.+?\s+AS\s+/gim);
  const isMultiStage = (fromMatches?.length || 0) >= 2;

  if (!isMultiStage) {
    violations.push({
      file: resolvedPath,
      line: 1,
      severity: "WARNING",
      type: "missing-multistage",
      detail: "Single-stage Dockerfile detected. Development tools may leak into production image.",
      recommendation: "Adopt multi-stage build (builder stage for compilation, runner stage for runtime).",
    });
  }

  let copyAllLine = -1;
  let hasUserInstruction = false;

  lines.forEach((lineText, idx) => {
    const trimmed = lineText.trim();

    // Check layer cache order: COPY . . before install
    if (/^COPY\s+(?:\.\s+\.|\.\/\s+\.\/)\s*$/i.test(trimmed)) {
      copyAllLine = idx + 1;
    }

    if (/^RUN\s+(?:npm|bun|pnpm|yarn)\s+(?:install|i|ci)\b/i.test(trimmed)) {
      if (copyAllLine !== -1) {
        violations.push({
          file: resolvedPath,
          line: idx + 1,
          severity: "BLOCKING",
          type: "cache-invalidation",
          detail: `Dependencies installed on line ${idx + 1} after 'COPY . .' on line ${copyAllLine}.`,
          recommendation: "Copy package.json and lockfile FIRST, run install, then copy source files.",
        });
      }
    }

    if (/^USER\s+(?!root\b)\w+/i.test(trimmed)) {
      hasUserInstruction = true;
    }

    // Check secret in ENV
    if (/^ENV\s+(?:.*(?:KEY|SECRET|PASSWORD|TOKEN|AUTH)\s*=\s*['"]?[a-zA-Z0-9_-]{8,})/i.test(trimmed)) {
      violations.push({
        file: resolvedPath,
        line: idx + 1,
        severity: "BLOCKING",
        type: "secret-in-env",
        detail: "Hardcoded secret or credential detected in ENV instruction.",
        fix: "Inject credentials via runtime environment or secret manager mount.",
        recommendation: "Never bake secrets into container image layers.",
      });
    }
  });

  if (!hasUserInstruction) {
    violations.push({
      file: resolvedPath,
      line: lines.length,
      severity: "WARNING",
      type: "root-user",
      detail: "No non-root USER instruction specified in final stage.",
      recommendation: "Add 'USER node' or 'USER nonroot' before EXPOSE/CMD.",
    });
  }

  const blockingCount = violations.filter((v) => v.severity === "BLOCKING").length;
  const score = Math.max(0, 100 - blockingCount * 30 - (violations.length - blockingCount) * 15);

  return {
    dockerfilePath: resolvedPath,
    isMultiStage,
    hasDockerignore,
    score,
    violations,
    safe: blockingCount === 0,
  };
}

export function scaffoldDockerfile(template: "nextjs" | "node" | "bun" = "nextjs"): string {
  if (template === "bun") {
    return `# Hardened Multi-Stage Dockerfile (Bun Runtime)
# Stage 1: Dependency Cache
FROM oven/bun:1 AS base
WORKDIR /app

# Stage 2: Install dependencies (Layer cached)
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 3: Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 4: Production Runner (Zero devDependencies)
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
USER bun

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
`;
  }

  return `# Hardened Multi-Stage Dockerfile (Next.js Standalone / Node)
# Stage 1: Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Layer-cached dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* bun.lock* ./
RUN npm ci

# Stage 3: Compiling application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 4: Minimal Production Runner (Non-root)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  if (args.includes("--scaffold")) {
    const idx = args.indexOf("--scaffold");
    const template = (args[idx + 1] || "nextjs") as "nextjs" | "node" | "bun";
    console.log(scaffoldDockerfile(template));
  } else if (args.includes("--audit")) {
    const idx = args.indexOf("--audit");
    const target = args[idx + 1] && !args[idx + 1].startsWith("-") ? args[idx + 1] : "Dockerfile";
    const report = auditDockerfile(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🐳 Dockerfile Layer Cache & Hygiene Audit: ${report.dockerfilePath}`);
      console.log(`  Multi-Stage: ${report.isMultiStage ? "✅ YES" : "❌ NO"}`);
      console.log(`  .dockerignore: ${report.hasDockerignore ? "✅ YES" : "❌ NO"}`);
      console.log(`  Health Score: ${report.score}/100`);
      console.log(`  Status: ${report.safe ? "✅ SAFE" : "❌ BLOCKED"}`);
      if (report.violations.length === 0) {
        console.log(`  ✅ Clean! Follows multi-stage layer caching and zero-devDep invariants.`);
      } else {
        for (const v of report.violations) {
          console.log(`    - [${v.severity}] Line ${v.line}: ${v.detail} (Fix: ${v.recommendation})`);
        }
      }
    }
  } else {
    console.log("Usage: bun docker-audit.ts [--audit [Dockerfile]] [--scaffold <nextjs|bun>]");
  }
}
