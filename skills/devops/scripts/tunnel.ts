#!/usr/bin/env bun

/**
 * 🚇 Cloudflare Tunnel Manager — devops:cloudflare
 *
 * Capabilities:
 *   - Ephemeral Quick Tunnels via try.cloudflare.com (zero account/DNS setup required)
 *   - Auto-detection of cloudflared binary with platform installation recommendations
 *   - Clipboard integration (wl-copy, xclip, pbcopy) for instant URL sharing
 *   - Graceful termination and signal propagation
 *
 * Usage:
 *   bun devops/scripts/tunnel.ts [port|url] [options]
 *
 * Examples:
 *   bun devops/scripts/tunnel.ts 3000
 *   bun devops/scripts/tunnel.ts http://localhost:5173
 *   bun devops/scripts/tunnel.ts 8080 --metrics 9090
 */

import { spawn } from "node:child_process";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    port: { type: "string", short: "p" },
    url: { type: "string", short: "u" },
    metrics: { type: "string", short: "m" },
    name: { type: "string", short: "n" },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
🚇 devops:cloudflare — Cloudflare Quick Tunnel Manager

Usage:
  bun devops/scripts/tunnel.ts [port|url] [options]

Arguments:
  [port|url]          Port number (e.g. 3000) or local target URL (default: 3000)

Options:
  -p, --port <port>   Specify local target port (e.g. 3000, 5173, 8080)
  -u, --url <url>     Specify full target URL (e.g. http://localhost:3000)
  -m, --metrics <port>Local port to expose Prometheus metrics
  -n, --name <name>   Route through a persistent named tunnel instead of quick tunnel
  -h, --help          Show this help message

Workflows:
  • Agency: Share instant live preview with clients; test webhooks (Stripe, Razorpay, Shopify)
  • Mobile QA: Test responsive designs directly on cellular 5G / physical iOS & Android devices
  • Homelab: Temporary external ingress to local self-hosted dashboards and API testbeds
`);
  process.exit(0);
}

// Resolve target URL
let targetUrl = "http://localhost:3000";
const rawTarget = positionals[0] || values.url || values.port;

if (rawTarget) {
  if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
    targetUrl = rawTarget;
  } else if (/^\d+$/.test(rawTarget)) {
    targetUrl = `http://localhost:${rawTarget}`;
  } else {
    targetUrl = `http://${rawTarget}`;
  }
}

// 1. Verify cloudflared binary exists
const cloudflaredBin = Bun.which("cloudflared");

if (!cloudflaredBin) {
  console.error(`
\x1b[31m✖ Error: 'cloudflared' binary was not found in your PATH.\x1b[0m

To launch Cloudflare Quick Tunnels, install cloudflared:

  \x1b[1mArch Linux / CachyOS:\x1b[0m
    sudo pacman -S cloudflared

  \x1b[1mDebian / Ubuntu:\x1b[0m
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
    sudo apt-get update && sudo apt-get install -y cloudflared

  \x1b[1mmacOS (Homebrew):\x1b[0m
    brew install cloudflared

  \x1b[1mDocker Container Alternative (Instant zero-install):\x1b[0m
    docker run --rm -it --net=host cloudflare/cloudflared:latest tunnel --url ${targetUrl}
`);
  process.exit(1);
}

// 2. Build cloudflared command args
const tunnelArgs: string[] = ["tunnel"];

if (values.metrics) {
  tunnelArgs.push("--metrics", `localhost:${values.metrics}`);
}

if (values.name) {
  tunnelArgs.push("run", values.name);
} else {
  tunnelArgs.push("--url", targetUrl);
}

console.log(`\x1b[36m⏳ Initiating Cloudflare Quick Tunnel pointing to ${targetUrl}...\x1b[0m`);

// 3. Spawn cloudflared process
const child = spawn(cloudflaredBin, tunnelArgs, {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

let tunnelUrl: string | null = null;
const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;

function copyToClipboard(text: string) {
  const clipboardTools = [
    { cmd: "wl-copy", args: [] },
    { cmd: "xclip", args: ["-selection", "clipboard"] },
    { cmd: "pbcopy", args: [] },
  ];

  for (const tool of clipboardTools) {
    if (Bun.which(tool.cmd)) {
      try {
        const cp = spawn(tool.cmd, tool.args);
        cp.stdin?.write(text);
        cp.stdin?.end();
        return true;
      } catch {
        // Fallback silently
      }
    }
  }
  return false;
}

function renderBanner(url: string, target: string) {
  const copied = copyToClipboard(url);
  const border = "═".repeat(70);

  console.log(`
\x1b[32m╔${border}╗\x1b[0m
\x1b[32m║\x1b[0m  \x1b[1m\x1b[32m🚀 CLOUDFLARE QUICK TUNNEL ACTIVE\x1b[0m\x1b[32m${" ".repeat(37)}║\x1b[0m
\x1b[32m╠${border}╣\x1b[0m
\x1b[32m║\x1b[0m  \x1b[1m🌐 Public URL:\x1b[0m     \x1b[36m\x1b[4m${url}\x1b[0m ${copied ? "\x1b[33m(Copied to clipboard!)\x1b[0m" : ""}
\x1b[32m║\x1b[0m  \x1b[1m🎯 Local Target:\x1b[0m   ${target}
\x1b[32m║\x1b[0m  \x1b[1m🔒 TLS Security:\x1b[0m  Automated SSL Termination at Cloudflare Edge
\x1b[32m║\x1b[0m  \x1b[1m⚡ Network:\x1b[0m       Global Anycast Cloudflare Edge Network (Zero Open Ports)
\x1b[32m╠${border}╣\x1b[0m
\x1b[32m║\x1b[0m  \x1b[1mAgency & Homelab Playbooks:\x1b[0m
\x1b[32m║\x1b[0m  • \x1b[33mClient Preview:\x1b[0m Share public URL for feedback without staging servers
\x1b[32m║\x1b[0m  • \x1b[33mWebhooks:\x1b[0m       Direct Stripe/Razorpay/Shopify webhook events to local port
\x1b[32m║\x1b[0m  • \x1b[33mMobile Testing:\x1b[0m Open on real iOS/Android devices over cellular 5G
\x1b[32m║\x1b[0m  • \x1b[33mHomelab Ingress:\x1b[0m For permanent tunnels with 2FA/Access, see devops/references
\x1b[32m╚${border}╝\x1b[0m
\x1b[90mPress Ctrl+C to shut down tunnel.\x1b[0m
`);
}

function processOutput(chunk: Buffer) {
  const text = chunk.toString();
  if (!tunnelUrl) {
    const match = text.match(urlRegex);
    if (match) {
      tunnelUrl = match[0];
      renderBanner(tunnelUrl, targetUrl);
    }
  }
}

child.stdout.on("data", processOutput);
child.stderr.on("data", processOutput);

child.on("error", (err) => {
  console.error(`\x1b[31mTunnel process error:\x1b[0m`, err);
});

child.on("close", (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\x1b[33mTunnel process exited with code ${code}\x1b[0m`);
  }
  process.exit(code ?? 0);
});

// Signal handling
const cleanExit = () => {
  console.log(`\n\x1b[33mShutting down Cloudflare tunnel...\x1b[0m`);
  child.kill("SIGINT");
  setTimeout(() => {
    child.kill("SIGKILL");
    process.exit(0);
  }, 1500);
};

process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);
