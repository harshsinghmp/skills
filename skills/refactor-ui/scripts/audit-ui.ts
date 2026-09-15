#!/usr/bin/env bun
/**
 * refactor-ui — Static UI Anti-Pattern Auditor (zero dependencies)
 * Port of audit_ui.py (v1.0.0) → Bun/TS, with new patterns from v1.1.0 research:
 * raw z-index values, outline-none without focus-visible, and the original five.
 *
 * Usage: bun refactor-ui/scripts/audit-ui.ts <paths...>
 * Scans .tsx/.jsx/.ts/.js/.vue/.svelte/.html/.css files (recursively for dirs).
 * Exit 0 = clean, 2 = findings.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

interface Pattern {
  id: string;
  regex: RegExp;
  severity: "WARNING" | "SUGGESTION";
  message: string;
}

const PATTERNS: Pattern[] = [
  {
    id: "ARBITRARY_PIXELS",
    regex: /(?:p|m|gap|w|h|text)-\[(\d+)px\]/i,
    severity: "WARNING",
    message:
      "Arbitrary pixel value. Use 4px/8px scale tokens instead (p-4, text-sm, gap-6).",
  },
  {
    id: "INACCESSIBLE_GRAY_TEXT",
    regex: /\btext-(?:gray|slate|zinc|neutral|stone)-(?:200|300|400)\b/i,
    severity: "WARNING",
    message:
      "Potential low-contrast gray text. Verify WCAG AA (>=4.5:1); prefer text-muted-foreground or 600+ for body copy.",
  },
  {
    id: "PURE_BLACK_TEXT",
    regex: /(?:color:\s*#000000|color:\s*#000\b|\btext-black\b)/i,
    severity: "SUGGESTION",
    message:
      "Pure black text. Prefer deep tinted neutrals (#0f172a / zinc-900) to avoid optical vibration.",
  },
  {
    id: "SYMMETRICAL_SHADOW",
    regex: /(?:box-shadow|boxShadow):\s*["']?\s*0\s+0\s+\d+px/i,
    severity: "WARNING",
    message:
      "Symmetrical shadow. Natural light comes from above; ensure vertical Y-offset > 0.",
  },
  {
    id: "ALL_CAPS_NO_TRACKING",
    regex: /\buppercase\b(?!.*\btracking-(?:wider|widest)\b)/i,
    severity: "SUGGESTION",
    message:
      "Uppercase text without wide letter-spacing. Add tracking-wider / tracking-widest.",
  },
  {
    id: "RAW_Z_INDEX",
    regex: /z-(?:\[\d{3,}\]|\d{3,})|z-index:\s*\d{3,}/i,
    severity: "WARNING",
    message:
      "Raw z-index value. Use a named z-scale token (z-top-nav, z-panel, z-drawer); arbitrary 9999 stacking leaks across surfaces.",
  },
  {
    id: "OUTLINE_NONE_NO_FOCUS",
    regex: /outline-none|outline:\s*["']?none/i,
    severity: "WARNING",
    message:
      "outline-none without a visible focus-visible alternative on this line. Keyboard focus must stay visible (focus-visible:ring-2).",
  },
];

const EXTENSIONS = new Set([
  ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".html", ".css",
]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".next", "build"]);

function collectFiles(target: string, out: string[] = []): string[] {
  const st = statSync(target);
  if (st.isFile()) {
    if (EXTENSIONS.has(extname(target))) out.push(target);
    return out;
  }
  for (const entry of readdirSync(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    collectFiles(join(target, entry), out);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(
      "Usage: bun refactor-ui/scripts/audit-ui.ts <paths...>\n" +
        "Scans frontend files for Refactoring-UI anti-patterns (zero dependencies).\n" +
        "Exit 0 = clean, 2 = findings.",
    );
    process.exit(args.length === 0 ? 2 : 0);
  }

  const files: string[] = [];
  for (const arg of args) {
    if (!existsSync(arg)) {
      console.error(`audit-ui: path not found: ${arg}`);
      process.exit(2);
    }
    files.push(...collectFiles(arg));
  }

  let findings = 0;
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const p of PATTERNS) {
        if (p.regex.test(line)) {
          findings++;
          console.log(`${file}:${i + 1} [${p.severity}] ${p.id}: ${p.message}`);
        }
      }
    });
  }

  console.log(
    `\naudit-ui: ${files.length} file(s) scanned, ${findings} finding(s)` +
      (findings === 0 ? " — clean" : ""),
  );
  process.exit(findings > 0 ? 2 : 0);
}

main();
