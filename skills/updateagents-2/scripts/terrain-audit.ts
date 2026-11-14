import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface TerrainAuditResult {
  valid: boolean;
  missingFiles: string[];
  credentialLeaks: Array<{ file: string; line: number; type: string }>;
  hardcodedPaths: Array<{ file: string; line: number; path: string }>;
  details: string;
}

export const CANONICAL_TERRAIN_MAPS = [
  "stack.md",
  "habits.md",
  "ownership.md",
  "packages.md",
  "repo.md",
  "logs.md",
] as const;

export function auditTerrain(targetDir: string): TerrainAuditResult {
  const terrainDir = join(targetDir, ".agents", "terrain");
  const missingFiles: string[] = [];
  const credentialLeaks: Array<{ file: string; line: number; type: string }> = [];
  const hardcodedPaths: Array<{ file: string; line: number; path: string }> = [];

  for (const file of CANONICAL_TERRAIN_MAPS) {
    const filePath = join(terrainDir, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
      continue;
    }

    let content = "";
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      missingFiles.push(file);
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.includes("[REDACTED]") || trimmed.includes("{{") || trimmed.includes("`")) {
        // template token or masked literal
      }

      // Check for credential leaks
      const tokenMatch = line.match(
        /\b(sk-(?:proj-|ant-)?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{50,}|glpat-[A-Za-z0-9_-]{20,})\b/,
      );
      if (tokenMatch && !line.includes("EXAMPLE") && !line.includes("REPLACE") && !line.includes("placeholder")) {
        credentialLeaks.push({ file, line: i + 1, type: tokenMatch[0] });
      }
      if (/-----BEGIN\s+(?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE\s+KEY-----/.test(line)) {
        credentialLeaks.push({ file, line: i + 1, type: "Private Key" });
      }
      const dbMatch = line.match(
        /\b(?:postgres|postgresql|mysql|mongodb|mongodb\+srv|redis|mssql):\/\/(?:[a-zA-Z0-9_\-.%]+):(?:[a-zA-Z0-9_\-.!@#$%^&*()+=]+)@/,
      );
      if (dbMatch && !line.includes("user:password") && !line.includes("localhost") && !line.includes("127.0.0.1")) {
        credentialLeaks.push({ file, line: i + 1, type: "Database Connection String" });
      }

      // Check for hardcoded machine paths
      const hardcodedPathRegex = new RegExp(
        `(?:/home/[a-zA-Z0-9_-]+|/Users/[a-zA-Z0-9_-]+|[A-Za-z]:\\\\Users\\\\[a-zA-Z0-9_-]+|~?\\.config/(?:LIFE${"OS"}))`,
        "i",
      );
      const pathMatch = line.match(hardcodedPathRegex);
      if (pathMatch) {
        hardcodedPaths.push({ file, line: i + 1, path: pathMatch[0] });
      }
    }
  }

  const valid = missingFiles.length === 0 && credentialLeaks.length === 0 && hardcodedPaths.length === 0;
  let details = "";
  if (missingFiles.length > 0) {
    details = `Missing terrain maps: ${missingFiles.join(", ")}`;
  } else if (credentialLeaks.length > 0) {
    details = `Credential leak detected in terrain: ${credentialLeaks.map((c) => `${c.file}:${c.line} (${c.type})`).join(", ")}`;
  } else if (hardcodedPaths.length > 0) {
    details = `Hardcoded user/machine paths in terrain: ${hardcodedPaths.map((p) => `${p.file}:${p.line} (${p.path})`).join(", ")}`;
  } else {
    details =
      "All 6 terrain maps verified (stack, habits, ownership, packages, repo, logs) with zero leaks or hardcoded paths.";
  }

  return {
    valid,
    missingFiles,
    credentialLeaks,
    hardcodedPaths,
    details,
  };
}
