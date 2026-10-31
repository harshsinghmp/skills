#!/usr/bin/env bun
/**
 * 🗺️ host-vitals.ts — Deterministic Host Vitals & Atlas Machine Inventory Engine
 *
 * Absorbs legacy ATLAS machine inspection logic into clean-system-cache
 * and workspace terrain tooling. Deterministically reports hardware vitals:
 *   - CPU cores, model & architecture
 *   - GPU bus & device info (NVIDIA, AMD, Apple Silicon, Intel)
 *   - Kernel version & OS platform
 *   - Display resolution
 *   - Memory & system capacity
 *
 * Usage:
 *   bun skills/reflection-maintenance/clean-system-cache/scripts/host-vitals.ts
 *   bun skills/reflection-maintenance/clean-system-cache/scripts/host-vitals.ts --json
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { cpus, freemem, hostname, platform, release, totalmem } from "node:os";

export interface HostVitals {
  hostname: string;
  platform: string;
  arch: string;
  kernelVersion: string;
  cpu: {
    cores: number;
    model: string;
    speedMhz?: number;
  };
  gpu: {
    devices: string[];
    primaryBus?: string;
  };
  display: {
    resolution: string;
  };
  memory: {
    totalGb: number;
    freeGb: number;
    usedPercent: number;
  };
  timestamp: string;
}

export function detectGpuDevices(): { devices: string[]; primaryBus?: string } {
  const osType = platform();
  const devices: string[] = [];
  let primaryBus: string | undefined;

  try {
    if (osType === "linux") {
      // Try lspci
      const lspci = spawnSync("lspci", [], { encoding: "utf8" });
      if (lspci.status === 0 && lspci.stdout) {
        for (const line of lspci.stdout.split("\n")) {
          if (/vga|3d|display/i.test(line)) {
            const trimmed = line.trim();
            devices.push(trimmed);
            if (!primaryBus) {
              const busMatch = trimmed.match(/^([0-9a-fA-F:.]+)/);
              if (busMatch) primaryBus = busMatch[1];
            }
          }
        }
      }
      // Try nvidia-smi if no devices found
      if (devices.length === 0) {
        const nv = spawnSync("nvidia-smi", ["--query-gpu=name,pci.bus_id", "--format=csv,noheader"], {
          encoding: "utf8",
        });
        if (nv.status === 0 && nv.stdout.trim()) {
          for (const line of nv.stdout.trim().split("\n")) {
            devices.push(line.trim());
          }
        }
      }
    } else if (osType === "darwin") {
      const sp = spawnSync("system_profiler", ["SPDisplaysDataType"], { encoding: "utf8" });
      if (sp.status === 0 && sp.stdout) {
        for (const line of sp.stdout.split("\n")) {
          const match = line.match(/Chipset Model:\s*(.+)/i);
          if (match) devices.push(match[1].trim());
        }
      }
    } else if (osType === "win32") {
      const wmic = spawnSync("wmic", ["path", "win32_videocontroller", "get", "name"], { encoding: "utf8" });
      if (wmic.status === 0 && wmic.stdout) {
        const lines = wmic.stdout
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && l !== "Name");
        devices.push(...lines);
      }
    }
  } catch {}

  if (devices.length === 0) {
    devices.push("Standard / Generic Display Controller");
  }

  return { devices, primaryBus };
}

export function detectDisplayResolution(): string {
  const osType = platform();

  try {
    if (osType === "linux") {
      // 1. Try xrandr
      const xrandr = spawnSync("xrandr", ["--current"], { encoding: "utf8" });
      if (xrandr.status === 0 && xrandr.stdout) {
        const match = xrandr.stdout.match(/\b(\d{3,5}x\d{3,5})\b/);
        if (match) return match[1];
      }
      // 2. Try sysfs drm modes
      try {
        const drmDir = "/sys/class/drm";
        const entries = readdirSync(drmDir);
        for (const entry of entries) {
          const modeFile = `${drmDir}/${entry}/modes`;
          try {
            const mode = readFileSync(modeFile, "utf8").trim().split("\n")[0];
            if (mode && /\d+x\d+/.test(mode)) return mode;
          } catch {}
        }
      } catch {}
    } else if (osType === "darwin") {
      const sp = spawnSync("system_profiler", ["SPDisplaysDataType"], { encoding: "utf8" });
      if (sp.status === 0 && sp.stdout) {
        const match = sp.stdout.match(/Resolution:\s*(\d+\s*x\s*\d+)/i);
        if (match) return match[1].replace(/\s+/g, "");
      }
    } else if (osType === "win32") {
      const wmic = spawnSync("wmic", ["desktopmonitor", "get", "screenwidth,screenheight"], { encoding: "utf8" });
      if (wmic.status === 0 && wmic.stdout) {
        const nums = wmic.stdout.match(/\d+/g);
        if (nums && nums.length >= 2) return `${nums[0]}x${nums[1]}`;
      }
    }
  } catch {}

  return "1920x1080 (Estimated / Headless Default)";
}

export function getHostVitals(): HostVitals {
  const cpuList = cpus();
  const coreCount = cpuList.length;
  const cpuModel = cpuList[0]?.model || "Generic Processor";
  const speed = cpuList[0]?.speed;

  const totalBytes = totalmem();
  const freeBytes = freemem();
  const totalGb = Number((totalBytes / 1024 ** 3).toFixed(2));
  const freeGb = Number((freeBytes / 1024 ** 3).toFixed(2));
  const usedPercent = Number((((totalBytes - freeBytes) / totalBytes) * 100).toFixed(1));

  const gpuInfo = detectGpuDevices();
  const resolution = detectDisplayResolution();

  return {
    hostname: hostname(),
    platform: platform(),
    arch: process.arch,
    kernelVersion: release(),
    cpu: {
      cores: coreCount,
      model: cpuModel,
      speedMhz: speed,
    },
    gpu: gpuInfo,
    display: {
      resolution,
    },
    memory: {
      totalGb,
      freeGb,
      usedPercent,
    },
    timestamp: new Date().toISOString(),
  };
}

export function formatHostVitalsMarkdown(vitals: HostVitals): string {
  let md = `# 🗺️ Host Machine Vitals & Atlas Hardware Inventory\n\n`;
  md += `> **Host**: \`${vitals.hostname}\` • **Platform**: \`${vitals.platform} (${vitals.arch})\` • **Kernel**: \`${vitals.kernelVersion}\`\n\n`;

  md += `## 1. Compute & Processing (CPU)\n`;
  md += `- **Model**: ${vitals.cpu.model}\n`;
  md += `- **Cores**: ${vitals.cpu.cores} logical threads\n`;
  if (vitals.cpu.speedMhz) md += `- **Clock**: ${vitals.cpu.speedMhz} MHz\n`;
  md += `\n`;

  md += `## 2. Graphics & Display Pipeline (GPU)\n`;
  for (const dev of vitals.gpu.devices) {
    md += `- **Adapter**: \`${dev}\`\n`;
  }
  if (vitals.gpu.primaryBus) {
    md += `- **Primary PCIe Bus**: \`${vitals.gpu.primaryBus}\`\n`;
  }
  md += `- **Display Resolution**: \`${vitals.display.resolution}\`\n`;
  md += `\n`;

  md += `## 3. Memory & System Capacity\n`;
  md += `- **Total RAM**: ${vitals.memory.totalGb} GB\n`;
  md += `- **Available RAM**: ${vitals.memory.freeGb} GB (${(100 - vitals.memory.usedPercent).toFixed(1)}% free)\n`;
  md += `- **Memory Utilization**: ${vitals.memory.usedPercent}%\n`;

  return md;
}

export async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const vitals = getHostVitals();

  if (jsonOutput) {
    console.log(JSON.stringify(vitals, null, 2));
  } else {
    console.log(formatHostVitalsMarkdown(vitals));
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("HostVitals error:", err);
    process.exit(1);
  });
}
