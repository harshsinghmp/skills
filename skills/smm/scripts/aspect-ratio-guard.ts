#!/usr/bin/env bun

/**
 * 📐 SMM Aspect Ratio & Safe Zone Guard — smm:carousel & smm:content
 *
 * Capabilities:
 *   - Native image dimension parser for PNG, JPEG, and WebP (zero external binaries)
 *   - Aspect ratio detection (9:16 Vertical, 1:1 Square, 4:5 Portrait, 16:9 Landscape)
 *   - Platform preset validator (TikTok, Instagram Reel/Feed, LinkedIn, YouTube Shorts)
 *   - 9:16 Mobile UI Safe Zone calculator (prevents UI overlap on TikTok/Reels)
 *
 * Usage:
 *   bun smm/scripts/aspect-ratio-guard.ts [options]
 *
 * Examples:
 *   bun smm/scripts/aspect-ratio-guard.ts --check-dimensions --width 1080 --height 1920 --platform tiktok
 *   bun smm/scripts/aspect-ratio-guard.ts --safe-zone --height 1920
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

export type AspectRatioType = "9:16" | "1:1" | "4:5" | "16:9" | "custom";

export interface ImageDimensions {
  width: number;
  height: number;
  ratio: number;
  ratioType: AspectRatioType;
}

export interface PlatformRule {
  allowedRatios: AspectRatioType[];
  recommendedWidth: number;
  recommendedHeight: number;
  safeZoneTopPercent: number;
  safeZoneBottomPercent: number;
}

export const PLATFORM_RULES: Record<string, PlatformRule> = {
  tiktok: {
    allowedRatios: ["9:16"],
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    safeZoneTopPercent: 15,
    safeZoneBottomPercent: 20,
  },
  "instagram-reel": {
    allowedRatios: ["9:16"],
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    safeZoneTopPercent: 14,
    safeZoneBottomPercent: 22,
  },
  "instagram-feed": {
    allowedRatios: ["1:1", "4:5"],
    recommendedWidth: 1080,
    recommendedHeight: 1080,
    safeZoneTopPercent: 0,
    safeZoneBottomPercent: 0,
  },
  linkedin: {
    allowedRatios: ["1:1", "4:5", "16:9"],
    recommendedWidth: 1200,
    recommendedHeight: 1200,
    safeZoneTopPercent: 0,
    safeZoneBottomPercent: 0,
  },
  "youtube-shorts": {
    allowedRatios: ["9:16"],
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    safeZoneTopPercent: 15,
    safeZoneBottomPercent: 20,
  },
};

export function classifyAspectRatio(width: number, height: number): { ratio: number; ratioType: AspectRatioType } {
  if (width <= 0 || height <= 0) {
    return { ratio: 0, ratioType: "custom" };
  }
  const ratio = width / height;

  if (Math.abs(ratio - 9 / 16) < 0.03) return { ratio, ratioType: "9:16" };
  if (Math.abs(ratio - 1 / 1) < 0.03) return { ratio, ratioType: "1:1" };
  if (Math.abs(ratio - 4 / 5) < 0.03) return { ratio, ratioType: "4:5" };
  if (Math.abs(ratio - 16 / 9) < 0.03) return { ratio, ratioType: "16:9" };

  return { ratio, ratioType: "custom" };
}

export function parseImageDimensions(buffer: Buffer): ImageDimensions | null {
  try {
    // 1. Check PNG signature (89 50 4E 47 0D 0A 1A 0A)
    if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      const { ratio, ratioType } = classifyAspectRatio(width, height);
      return { width, height, ratio, ratioType };
    }

    // 2. Check JPEG signature (FF D8)
    if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 (0xC0) or SOF2 (0xC2)
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          const { ratio, ratioType } = classifyAspectRatio(width, height);
          return { width, height, ratio, ratioType };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    // 3. Check WebP (RIFF....WEBP)
    if (
      buffer.length >= 30 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      const type = buffer.toString("ascii", 12, 16);
      if (type === "VP8 ") {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        const { ratio, ratioType } = classifyAspectRatio(width, height);
        return { width, height, ratio, ratioType };
      }
      if (type === "VP8L") {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        const { ratio, ratioType } = classifyAspectRatio(width, height);
        return { width, height, ratio, ratioType };
      }
    }
  } catch {}

  return null;
}

export function calculateSafeZone(height: number, platform = "tiktok") {
  const rule = PLATFORM_RULES[platform] || PLATFORM_RULES.tiktok;
  const topPixels = Math.round((height * rule.safeZoneTopPercent) / 100);
  const bottomPixels = Math.round((height * rule.safeZoneBottomPercent) / 100);
  const safeHeight = height - topPixels - bottomPixels;

  return {
    platform,
    totalHeight: height,
    topForbiddenZone: `0px to ${topPixels}px (${rule.safeZoneTopPercent}%)`,
    bottomForbiddenZone: `${height - bottomPixels}px to ${height}px (${rule.safeZoneBottomPercent}%)`,
    safeVerticalWindow: `${topPixels}px to ${height - bottomPixels}px (${safeHeight}px)`,
  };
}

export function validateDimensions(
  width: number,
  height: number,
  platform = "tiktok",
): { valid: boolean; ratioType: AspectRatioType; ratio: number; message: string } {
  const { ratio, ratioType } = classifyAspectRatio(width, height);
  const rule = PLATFORM_RULES[platform];

  if (!rule) {
    return {
      valid: ratioType !== "custom",
      ratioType,
      ratio,
      message: `Detected ${ratioType} ratio (${width}x${height}).`,
    };
  }

  const matches = rule.allowedRatios.includes(ratioType);
  if (!matches) {
    return {
      valid: false,
      ratioType,
      ratio,
      message: `Invalid ratio '${ratioType}' for ${platform}. Platform strictly requires ${rule.allowedRatios.join(" or ")} (e.g. ${rule.recommendedWidth}x${rule.recommendedHeight}).`,
    };
  }

  return {
    valid: true,
    ratioType,
    ratio,
    message: `Valid ${ratioType} aspect ratio for ${platform} (${width}x${height}).`,
  };
}

if (import.meta.main) {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      width: { type: "string" },
      height: { type: "string" },
      platform: { type: "string", default: "tiktok" },
      file: { type: "string" },
      dir: { type: "string" },
      "safe-zone": { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
📐 aspect-ratio-guard.ts — SMM Aspect Ratio & Safe Zone Validator

Usage:
  bun aspect-ratio-guard.ts [options]

Commands:
  --width <w> --height <h>  Validate explicit pixel dimensions against platform rules
  --file <path>             Inspect image file header (PNG/JPEG/WebP) and validate ratio
  --dir <path>              Scan directory of carousel images for aspect ratio uniformity
  --safe-zone               Calculate top/bottom safe zone pixels for 9:16 mobile feeds

Options:
  --platform <name>         Platform target: tiktok, instagram-reel, instagram-feed, linkedin, youtube-shorts (default: tiktok)
  --json                    Output machine-readable JSON
  -h, --help                Show this help message
`);
    process.exit(0);
  }

  if (values["safe-zone"]) {
    const h = values.height ? parseInt(values.height, 10) : 1920;
    const res = calculateSafeZone(h, values.platform);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🛡️ Safe Zone Calculator (${res.platform.toUpperCase()} - Total Height: ${res.totalHeight}px):`);
      console.log(`  Top Forbidden Zone:    ${res.topForbiddenZone} (Header / Status bar)`);
      console.log(`  Bottom Forbidden Zone: ${res.bottomForbiddenZone} (Caption / Music / Action UI)`);
      console.log(`  Active Safe Window:    ${res.safeVerticalWindow}`);
    }
    process.exit(0);
  }

  if (values.file) {
    const filePath = resolve(process.cwd(), values.file);
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    const buf = readFileSync(filePath);
    const dims = parseImageDimensions(buf);
    if (!dims) {
      console.error(`❌ Could not parse image dimensions from header: ${values.file}`);
      process.exit(1);
    }
    const val = validateDimensions(dims.width, dims.height, values.platform);
    if (values.json) {
      console.log(JSON.stringify({ ...dims, validation: val }, null, 2));
    } else {
      console.log(`\n📐 Image Aspect Ratio Inspection:`);
      console.log(`  File:       ${values.file}`);
      console.log(`  Dimensions: ${dims.width}x${dims.height}`);
      console.log(`  Detected:   ${dims.ratioType} (${dims.ratio.toFixed(4)})`);
      console.log(`  Status:     ${val.valid ? "✅ PASS" : "❌ FAIL"} — ${val.message}`);
    }
    process.exit(val.valid ? 0 : 1);
  }

  if (values.dir) {
    const dirPath = resolve(process.cwd(), values.dir);
    if (!existsSync(dirPath)) {
      console.error(`❌ Directory not found: ${dirPath}`);
      process.exit(1);
    }
    const files = readdirSync(dirPath).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    const results = [];
    let allValid = true;

    for (const f of files) {
      const full = resolve(dirPath, f);
      const buf = readFileSync(full);
      const dims = parseImageDimensions(buf);
      if (dims) {
        const val = validateDimensions(dims.width, dims.height, values.platform);
        if (!val.valid) allValid = false;
        results.push({ file: f, ...dims, valid: val.valid, message: val.message });
      }
    }

    if (values.json) {
      console.log(JSON.stringify({ allValid, files: results }, null, 2));
    } else {
      console.log(`\n📁 Directory Aspect Ratio Scan (${results.length} images):`);
      for (const r of results) {
        const icon = r.valid ? "✅" : "❌";
        console.log(`  ${icon} ${r.file.padEnd(20)} ${r.width}x${r.height} (${r.ratioType})`);
      }
      console.log(`\nOverall: ${allValid ? "✅ ALL IMAGES COMPLIANT" : "❌ MISMATCHED RATIOS DETECTED"}`);
    }
    process.exit(allValid ? 0 : 1);
  }

  if (values.width && values.height) {
    const w = parseInt(values.width, 10);
    const h = parseInt(values.height, 10);
    const val = validateDimensions(w, h, values.platform);
    if (values.json) {
      console.log(JSON.stringify(val, null, 2));
    } else {
      console.log(`\n📐 Dimension Validation (${w}x${h} for ${values.platform}):`);
      console.log(`  Status: ${val.valid ? "✅ VALID" : "❌ INVALID"}`);
      console.log(`  Ratio:  ${val.ratioType} (${val.ratio.toFixed(4)})`);
      console.log(`  Detail: ${val.message}`);
    }
    process.exit(val.valid ? 0 : 1);
  }

  console.log("No command passed. Run with --help for options.");
  process.exit(0);
}
