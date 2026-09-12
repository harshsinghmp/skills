#!/usr/bin/env bun
/**
 * refactor-ui — WCAG Contrast Checker (zero dependencies)
 * Port of check_contrast.py (v1.0.0) → Bun/TS, with AA/AAA and large-text
 * threshold classification added per v1.1.0 (WCAG 2.2 AA is the blocking gate).
 *
 * Usage: bun refactor-ui/scripts/check-contrast.ts <fg> <bg> [--large] [--aaa] [--ui]
 *   fg/bg: hex colors (#3b82f6, 3b82f6, or 3-digit shorthand)
 *   --large  large-text threshold (>=3.0)
 *   --ui     UI-component/graphical-object threshold (>=3.0)
 *   --aaa    evaluate AAA instead of AA
 * Exit 0 = pass, 1 = fail, 2 = usage error.
 */

function parseHex(hexStr: string): [number, number, number] {
  const h = hexStr.trim().replace(/^#/, "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) {
    throw new Error(`Invalid hex color format: #${h}`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(...parseHex(fgHex));
  const l2 = relativeLuminance(...parseHex(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));

  if (positional.length !== 2 || flags.has("--help") || flags.has("-h")) {
    console.log(
      "Usage: bun refactor-ui/scripts/check-contrast.ts <fg> <bg> [--large] [--ui] [--aaa]\n" +
        "Computes the WCAG contrast ratio between two hex colors and evaluates it.\n" +
        "AA: >=4.5 normal text, >=3.0 large text (--large) or UI components (--ui).\n" +
        "AAA (--aaa): >=7 normal text, >=4.5 large text.\n" +
        "Exit 0 = pass, 1 = fail, 2 = usage error.",
    );
    process.exit(positional.length !== 2 ? 2 : 0);
  }

  let ratio: number;
  try {
    ratio = contrastRatio(positional[0], positional[1]);
  } catch (e) {
    console.error(`check-contrast: ${(e as Error).message}`);
    process.exit(2);
  }

  const aaa = flags.has("--aaa");
  const threshold = aaa
    ? flags.has("--large") ? 4.5 : 7
    : flags.has("--large") || flags.has("--ui") ? 3 : 4.5;
  const level = aaa ? "AAA" : flags.has("--large") || flags.has("--ui") ? "AA (large/UI)" : "AA (normal)";

  const pass = ratio >= threshold;
  console.log(
    `Contrast ratio ${positional[0]} vs ${positional[1]}: ${ratio.toFixed(2)}:1 — ` +
      `${pass ? "PASS" : "FAIL"} (${level}, threshold ${threshold}:1)`,
  );
  process.exit(pass ? 0 : 1);
}

main();
