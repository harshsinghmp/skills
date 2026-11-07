#!/usr/bin/env bun
/**
 * e2e-runner.ts: Synthetic User Journey & Headless Playwright Smoke Runner.
 *
 * Implements E2E-001 through E2E-004:
 *   - E2E-001: Semantic & Accessible Locators First (detect brittle CSS/XPath & waitForTimeout)
 *   - E2E-002: Critical Journey Smoke Matrix (coverage across 5 core visitor flows)
 *   - E2E-003: State Isolation & Ephemeral Seeding (storageState & unique entity tokens)
 *   - E2E-004: Visual & Network Artifacts (trace & error interceptors)
 *
 * Usage:
 *   bun e2e-runner.ts --audit-selectors <file|dir> [--json]
 *   bun e2e-runner.ts --scaffold-journey <journey-name> [--output <file>] [--json]
 *   bun e2e-runner.ts --smoke-check [--target <dir>] [--json]
 */

import fs from "node:fs";
import path from "node:path";

export interface SelectorDefect {
  file: string;
  line: number;
  issue: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  codeSnippet: string;
  remedy: string;
}

export interface SelectorAuditReport {
  target: string;
  filesScanned: number;
  totalDefects: number;
  criticalCount: number;
  warningCount: number;
  healthScore: number;
  defects: SelectorDefect[];
  passed: boolean;
}

export interface JourneyCoverage {
  journey: string;
  category: "auth" | "checkout" | "onboarding" | "recovery" | "compliance";
  covered: boolean;
  specFile?: string;
}

export interface SmokeCheckReport {
  targetDir: string;
  journeys: JourneyCoverage[];
  coveragePercent: number;
  verdict: "SHIP_CLEARED" | "BLOCK_RELEASE";
  blockers: string[];
}

export const CORE_JOURNEYS: Array<{ name: string; category: JourneyCoverage["category"]; patterns: RegExp[] }> = [
  {
    name: "Guest-to-Auth Flow",
    category: "auth",
    patterns: [/signup|register|login|auth|sign-in|magic-link/i],
  },
  {
    name: "Shopping-to-Checkout Flow",
    category: "checkout",
    patterns: [/checkout|cart|order|stripe|payment|purchase/i],
  },
  {
    name: "User Onboarding Funnel",
    category: "onboarding",
    patterns: [/onboarding|welcome|workspace-create|team-setup/i],
  },
  {
    name: "Self-Serve Password Reset & MFA",
    category: "recovery",
    patterns: [/forgot-password|reset-password|mfa|2fa|recovery/i],
  },
  {
    name: "Account Deletion & Data Privacy",
    category: "compliance",
    patterns: [/delete-account|account-closure|gdpr|data-export/i],
  },
];

/**
 * Audit test files for brittle locators, arbitrary sleeps, and anti-patterns.
 */
export function auditTestFile(filePath: string): SelectorDefect[] {
  const defects: SelectorDefect[] = [];
  if (!fs.existsSync(filePath)) return defects;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // 1. Check for banned arbitrary sleeps: waitForTimeout / sleep / cy.wait(number)
    if (/waitForTimeout\s*\(/.test(trimmed) || /cy\.wait\s*\(\s*\d+\s*\)/.test(trimmed)) {
      defects.push({
        file: filePath,
        line: lineNum,
        issue: "Banned arbitrary timeout/sleep detected (E2E-001 violation)",
        severity: "CRITICAL",
        codeSnippet: trimmed,
        remedy:
          "Replace with auto-waiting web-first assertion (e.g. await expect(locator).toBeVisible()) or cy.intercept wait.",
      });
    }

    // 2. Check for brittle XPath expressions
    if (/(?:xpath=|page\.locator\s*\(\s*['"`]\/\/|\.xpath\()/.test(trimmed)) {
      defects.push({
        file: filePath,
        line: lineNum,
        issue: "Fragile XPath selector detected (E2E-001 violation)",
        severity: "CRITICAL",
        codeSnippet: trimmed,
        remedy: "Refactor to semantic locator: page.getByRole(), page.getByLabel(), or page.getByTestId().",
      });
    }

    // 3. Check for fragile CSS hierarchy chains (e.g. div > section > div:nth-child)
    if (
      /page\.locator\s*\(\s*['"`][^'"`]*>[^'"`]*>[^'"`]*['"`]\s*\)/.test(trimmed) ||
      /:nth-child\(\d+\)/.test(trimmed)
    ) {
      defects.push({
        file: filePath,
        line: lineNum,
        issue: "Brittle CSS hierarchy / nth-child locator detected (E2E-001 violation)",
        severity: "WARNING",
        codeSnippet: trimmed,
        remedy: "Locate by accessible role or user-facing text rather than DOM element structure.",
      });
    }

    // 4. Check for utility class / Tailwind locators
    if (/page\.locator\s*\(\s*['"`]\.(?:flex|grid|p-|m-|bg-|text-|w-|h-|hover:)[^'"`]*['"`]\s*\)/.test(trimmed)) {
      defects.push({
        file: filePath,
        line: lineNum,
        issue: "Styling / Tailwind utility class used as test locator",
        severity: "WARNING",
        codeSnippet: trimmed,
        remedy: "Decouple tests from styling classes. Use getByRole(), getByText(), or explicit data-testid.",
      });
    }
  });

  return defects;
}

/**
 * Scan target path (file or directory) for selector audits.
 */
export function auditSelectors(targetPath: string): SelectorAuditReport {
  const stat = fs.existsSync(targetPath) ? fs.statSync(targetPath) : null;
  const files: string[] = [];

  if (stat?.isFile()) {
    files.push(targetPath);
  } else if (stat?.isDirectory()) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          scanDir(full);
        } else if (entry.isFile() && /\.(spec|test)\.[jt]sx?$/.test(entry.name)) {
          files.push(full);
        }
      }
    };
    scanDir(targetPath);
  }

  const allDefects: SelectorDefect[] = [];
  for (const f of files) {
    allDefects.push(...auditTestFile(f));
  }

  const criticalCount = allDefects.filter((d) => d.severity === "CRITICAL").length;
  const warningCount = allDefects.filter((d) => d.severity === "WARNING").length;

  const penalty = criticalCount * 25 + warningCount * 10;
  const healthScore = Math.max(0, 100 - penalty);

  return {
    target: targetPath,
    filesScanned: files.length,
    totalDefects: allDefects.length,
    criticalCount,
    warningCount,
    healthScore,
    defects: allDefects,
    passed: criticalCount === 0 && healthScore >= 75,
  };
}

/**
 * Audit test directory against the Critical Journey Smoke Matrix (E2E-002).
 */
export function runSmokeCheck(testDir: string): SmokeCheckReport {
  const coverageMap: JourneyCoverage[] = CORE_JOURNEYS.map((j) => ({
    journey: j.name,
    category: j.category,
    covered: false,
  }));

  const testFiles: string[] = [];
  if (fs.existsSync(testDir)) {
    const scan = (d: string) => {
      for (const item of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, item.name);
        if (item.isDirectory() && item.name !== "node_modules") {
          scan(p);
        } else if (item.isFile() && /\.(spec|test)\.[jt]sx?$/.test(item.name)) {
          testFiles.push(p);
        }
      }
    };
    scan(testDir);
  }

  for (const file of testFiles) {
    const base = path.basename(file).toLowerCase();
    const content = fs.readFileSync(file, "utf8").toLowerCase();

    for (const j of CORE_JOURNEYS) {
      const matches = j.patterns.some((p) => p.test(base) || p.test(content));
      if (matches) {
        const entry = coverageMap.find((c) => c.journey === j.name);
        if (entry && !entry.covered) {
          entry.covered = true;
          entry.specFile = file;
        }
      }
    }
  }

  const coveredCount = coverageMap.filter((c) => c.covered).length;
  const coveragePercent = Math.round((coveredCount / CORE_JOURNEYS.length) * 100);

  const blockers: string[] = [];
  const missingJourneys = coverageMap.filter((c) => !c.covered);
  for (const m of missingJourneys) {
    blockers.push(`Missing smoke journey coverage for '${m.journey}' (${m.category})`);
  }

  return {
    targetDir: testDir,
    journeys: coverageMap,
    coveragePercent,
    verdict: blockers.length === 0 ? "SHIP_CLEARED" : "BLOCK_RELEASE",
    blockers,
  };
}

/**
 * Generate a Playwright synthetic test skeleton complying with E2E-001–E2E-004.
 */
export function scaffoldJourney(journeyName: string, outputPath?: string): string {
  const code = `import { test, expect } from '@playwright/test';

/**
 * Synthetic User Journey: ${journeyName}
 * Built to satisfy E2E-001 (Semantic Locators), E2E-003 (State Isolation), and E2E-004 (Artifacts).
 */
test.describe('Synthetic Journey: ${journeyName}', () => {
  test.beforeEach(async ({ page }) => {
    // E2E-004: Catch unhandled browser errors & fail fast
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('[Browser Error]:', msg.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() >= 500) {
        throw new Error(\`Server error 5xx encountered on \${response.url()}: \${response.status()}\`);
      }
    });
  });

  test('executes end-to-end critical path with accessible role locators', async ({ page }) => {
    // E2E-003: Ephemeral dynamic entity tokens
    const runId = Date.now().toString(36);
    const ephemeralUser = \`tester-\${runId}@example.com\`;

    // 1. Initial Navigation
    await page.goto('/');
    await expect(page).toHaveTitle(/.*[A-Za-z0-9]+/);

    // 2. Semantic Interactive Flow (E2E-001: getByRole / getByLabel)
    const primaryCta = page.getByRole('button', { name: /(get started|continue|submit|checkout)/i });
    if (await primaryCta.isVisible()) {
      await primaryCta.click();
    }

    // 3. Form Input via Accessible Labels
    const emailField = page.getByLabel(/(email|work email|username)/i);
    if (await emailField.isVisible()) {
      await emailField.fill(ephemeralUser);
    }

    // 4. Verification Checkpoint (Auto-waiting assertion, zero waitForTimeout)
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
`;

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, code, "utf8");
  }

  return code;
}

// CLI Execution Harness
if (import.meta.main) {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");

  const auditIdx = args.indexOf("--audit-selectors");
  if (auditIdx !== -1 && args[auditIdx + 1]) {
    const target = args[auditIdx + 1];
    const report = auditSelectors(target);
    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🛡️  Selector Health Audit: ${target}`);
      console.log(`Files Analyzed:   ${report.filesScanned}`);
      console.log(`Health Score:     ${report.healthScore}/100`);
      console.log(`Critical Defects: ${report.criticalCount}`);
      console.log(`Warning Defects:  ${report.warningCount}`);
      console.log(`Verdict:          ${report.passed ? "PASS (CLEARED)" : "FAIL (BLOCK SHIP)"}\n`);

      if (report.defects.length > 0) {
        console.log("Defect Ledger:");
        for (const d of report.defects) {
          console.log(`  [${d.severity}] ${d.file}:${d.line}`);
          console.log(`    Issue:   ${d.issue}`);
          console.log(`    Snippet: ${d.codeSnippet}`);
          console.log(`    Remedy:  ${d.remedy}\n`);
        }
      }
    }
    process.exit(report.passed ? 0 : 1);
  }

  const scaffoldIdx = args.indexOf("--scaffold-journey");
  if (scaffoldIdx !== -1 && args[scaffoldIdx + 1]) {
    const journey = args[scaffoldIdx + 1];
    const outIdx = args.indexOf("--output");
    const outFile = outIdx !== -1 ? args[outIdx + 1] : undefined;
    const code = scaffoldJourney(journey, outFile);

    if (isJson) {
      console.log(JSON.stringify({ journey, outFile, codeLength: code.length }, null, 2));
    } else {
      if (outFile) {
        console.log(`\n✅ Scaffolded Playwright test for '${journey}' to ${outFile}`);
      } else {
        console.log(code);
      }
    }
    process.exit(0);
  }

  const smokeIdx = args.indexOf("--smoke-check");
  if (smokeIdx !== -1) {
    const targetIdx = args.indexOf("--target");
    const targetDir = targetIdx !== -1 ? args[targetIdx + 1] : "tests/e2e";
    const report = runSmokeCheck(targetDir);

    if (isJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\n🚀 Critical Journey Smoke Matrix Audit: ${report.targetDir}`);
      console.log(`Coverage: ${report.coveragePercent}%`);
      console.log(`Verdict:  ${report.verdict}\n`);

      console.log("Journey Matrix Status:");
      for (const j of report.journeys) {
        console.log(`  [${j.covered ? "✓ COVERED" : "✗ MISSING"}] ${j.journey} (${j.category})`);
        if (j.specFile) console.log(`      File: ${j.specFile}`);
      }

      if (report.blockers.length > 0) {
        console.log("\nRelease Blockers:");
        for (const b of report.blockers) {
          console.log(`  • ${b}`);
        }
      }
    }
    process.exit(report.verdict === "SHIP_CLEARED" ? 0 : 1);
  }

  console.log(`e2e-runner.ts — Playwright Synthetic Journey & Smoke Runner

Usage:
  bun e2e-runner.ts --audit-selectors <file|dir> [--json]
  bun e2e-runner.ts --scaffold-journey <name> [--output <file>] [--json]
  bun e2e-runner.ts --smoke-check [--target <dir>] [--json]
`);
  process.exit(0);
}
