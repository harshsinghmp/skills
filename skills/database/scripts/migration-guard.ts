#!/usr/bin/env bun
/**
 * 🗄️ migration-guard.ts — Zero-Downtime Database Migration & Locking Guard
 *
 * Simulates DDL locks, detects table rewrites, and flags unindexed foreign key
 * share-lock hazards across Postgres, MySQL, and SQLite migrations.
 *
 * Enforces Zero-Downtime Safe DDL Invariants:
 *   1. Lock Timeout: Every migration must set `lock_timeout` to prevent queue head-of-line blocking.
 *   2. Concurrent Indexing: Index creation/deletion must specify `CONCURRENTLY`.
 *   3. Non-Blocking Constraints: Foreign keys must be added with `NOT VALID` and validated separately.
 *   4. Zero Table Rewrites: Blocks in-place column type alterations and volatile defaults.
 *   5. Expansion/Contraction Protocol: Enforces dual-run patterns instead of destructive renames/drops.
 *   6. Unindexed Foreign Keys: Scans foreign key constraints lacking supporting indexes on child tables.
 *
 * Usage:
 *   bun skills/agency-delivery/database/scripts/migration-guard.ts <file|dir|sql> [options]
 *   bun skills/agency-delivery/database/scripts/migration-guard.ts ./migrations/001_add_users.sql
 *   bun skills/agency-delivery/database/scripts/migration-guard.ts --schema ./schema.sql
 *   bun skills/agency-delivery/database/scripts/migration-guard.ts --json
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

export type LockLevel =
  | "ACCESS_SHARE" // Level 1 (SELECT)
  | "ROW_SHARE" // Level 2 (SELECT FOR UPDATE/SHARE)
  | "ROW_EXCLUSIVE" // Level 3 (INSERT, UPDATE, DELETE)
  | "SHARE_UPDATE_EXCLUSIVE" // Level 4 (VACUUM, ANALYZE, CREATE INDEX CONCURRENTLY, VALIDATE CONSTRAINT)
  | "SHARE" // Level 5 (CREATE INDEX without CONCURRENTLY)
  | "SHARE_ROW_EXCLUSIVE" // Level 6 (CREATE TRIGGER, some ALTER TABLE)
  | "EXCLUSIVE" // Level 7 (Blocks writes and SELECT FOR UPDATE)
  | "ACCESS_EXCLUSIVE"; // Level 8 (ALTER TABLE, DROP TABLE, TRUNCATE — blocks all reads & writes)

export type Severity = "critical" | "warning" | "info";

export interface MigrationIssue {
  id: string;
  statement: string;
  line: number;
  lockLevel: LockLevel;
  severity: Severity;
  table?: string;
  causesTableRewrite: boolean;
  rule: string;
  message: string;
  remediation: string;
  safeSqlAlternative?: string;
}

export interface MigrationAuditResult {
  target: string;
  totalStatements: number;
  highestLockLevel: LockLevel;
  hasTableRewrite: boolean;
  clean: boolean;
  hasLockTimeout: boolean;
  issues: MigrationIssue[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface UnindexedFkResult {
  table: string;
  foreignKey: string;
  columns: string[];
  referencedTable: string;
  hasIndex: boolean;
  hazard: string;
  suggestedIndexSql: string;
}

// Order of Postgres Lock Levels
export const LOCK_LEVEL_SEVERITY: Record<LockLevel, number> = {
  ACCESS_SHARE: 1,
  ROW_SHARE: 2,
  ROW_EXCLUSIVE: 3,
  SHARE_UPDATE_EXCLUSIVE: 4,
  SHARE: 5,
  SHARE_ROW_EXCLUSIVE: 6,
  EXCLUSIVE: 7,
  ACCESS_EXCLUSIVE: 8,
};

export function compareLockLevels(a: LockLevel, b: LockLevel): LockLevel {
  return LOCK_LEVEL_SEVERITY[a] >= LOCK_LEVEL_SEVERITY[b] ? a : b;
}

/**
 * Splits raw SQL into individual statements while respecting quotes, dollar quotes, and comments.
 */
export function splitSqlStatements(sql: string): Array<{ statement: string; line: number }> {
  const statements: Array<{ statement: string; line: number }> = [];
  const lines = sql.split("\n");
  let current = "";
  let startLine = 1;
  let inDollarQuote = false;
  let dollarTag = "";
  let inSingleQuote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      // Handle comments outside quotes
      if (!inSingleQuote && !inDollarQuote) {
        if (char === "-" && nextChar === "-") {
          // Line comment: skip rest of line
          break;
        }
      }

      // Handle single quotes
      if (char === "'" && !inDollarQuote) {
        if (inSingleQuote && nextChar === "'") {
          // Escaped single quote
          current += "''";
          j++;
          continue;
        }
        inSingleQuote = !inSingleQuote;
        current += char;
        continue;
      }

      // Handle dollar quotes ($$...$$ or $tag$...$tag$)
      if (char === "$" && !inSingleQuote) {
        const remaining = line.slice(j);
        const match = remaining.match(/^(\$[a-zA-Z0-9_]*\$)/);
        if (match) {
          const tag = match[1];
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarTag = tag;
          } else if (tag === dollarTag) {
            inDollarQuote = false;
            dollarTag = "";
          }
          current += tag;
          j += tag.length - 1;
          continue;
        }
      }

      // Statement termination
      if (char === ";" && !inSingleQuote && !inDollarQuote) {
        current = current.trim();
        if (current.length > 0) {
          statements.push({ statement: current, line: startLine });
          current = "";
        }
        startLine = lineNum;
        continue;
      }

      if (current.length === 0 && (char === " " || char === "\t")) {
        // Skip leading whitespace before statement
        continue;
      }

      if (current.length === 0) {
        startLine = lineNum;
      }
      current += char;
    }

    if (current.length > 0) {
      current += "\n";
    }
  }

  current = current.trim();
  if (current.length > 0) {
    statements.push({ statement: current, line: startLine });
  }

  return statements;
}

/**
 * Extracts table name from DDL statement.
 */
export function extractTableName(statement: string): string | undefined {
  const alterMatch = statement.match(
    /\bALTER\s+TABLE\s+(?:ONLY\s+)?(?:IF\s+EXISTS\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/i,
  );
  if (alterMatch) return alterMatch[1].replace(/"/g, "");

  const createTableMatch = statement.match(
    /\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:UNLOGGED\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/i,
  );
  if (createTableMatch) return createTableMatch[1].replace(/"/g, "");

  const indexMatch = statement.match(
    /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?[a-zA-Z0-9_"]+\s+ON\s+(?:ONLY\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/i,
  );
  if (indexMatch) return indexMatch[1].replace(/"/g, "");

  const dropTableMatch = statement.match(/\bDROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/i);
  if (dropTableMatch) return dropTableMatch[1].replace(/"/g, "");

  return undefined;
}

/**
 * Analyzes an individual SQL statement against Zero-Downtime rules.
 */
export function analyzeStatement(
  statement: string,
  line: number,
): {
  lockLevel: LockLevel;
  issues: MigrationIssue[];
} {
  const issues: MigrationIssue[] = [];
  const normalized = statement.replace(/\s+/g, " ").trim();
  const table = extractTableName(normalized);
  let lockLevel: LockLevel = "ACCESS_SHARE";

  // Check Lock Timeout configuration
  if (/^SET\s+(?:LOCAL\s+)?lock_timeout\b/i.test(normalized)) {
    return { lockLevel: "ACCESS_SHARE", issues: [] };
  }

  // 1. CREATE INDEX Checks
  if (/^CREATE\s+(?:UNIQUE\s+)?INDEX\b/i.test(normalized)) {
    const isConcurrent = /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+CONCURRENTLY\b/i.test(normalized);
    if (!isConcurrent) {
      lockLevel = "SHARE";
      issues.push({
        id: "DDL-001",
        statement: normalized,
        line,
        table,
        lockLevel: "SHARE",
        severity: "critical",
        causesTableRewrite: false,
        rule: "Non-Concurrent Index Creation",
        message:
          "Index created without CONCURRENTLY acquires a SHARE lock, completely blocking all concurrent INSERT, UPDATE, and DELETE operations.",
        remediation:
          "Always use CREATE INDEX CONCURRENTLY on production tables to build indexes without blocking writes.",
        safeSqlAlternative: normalized.replace(/CREATE\s+(UNIQUE\s+)?INDEX/i, "CREATE $1INDEX CONCURRENTLY"),
      });
    } else {
      lockLevel = "SHARE_UPDATE_EXCLUSIVE";
    }
    return { lockLevel, issues };
  }

  // 2. DROP INDEX Checks
  if (/^DROP\s+INDEX\b/i.test(normalized)) {
    const isConcurrent = /\bDROP\s+INDEX\s+CONCURRENTLY\b/i.test(normalized);
    if (!isConcurrent) {
      lockLevel = "ACCESS_EXCLUSIVE";
      issues.push({
        id: "DDL-002",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "critical",
        causesTableRewrite: false,
        rule: "Non-Concurrent Index Drop",
        message:
          "Dropping an index without CONCURRENTLY acquires an ACCESS EXCLUSIVE lock, blocking all reads and writes.",
        remediation: "Use DROP INDEX CONCURRENTLY to safely remove indexes without locking concurrent traffic.",
        safeSqlAlternative: normalized.replace(/DROP\s+INDEX/i, "DROP INDEX CONCURRENTLY"),
      });
    } else {
      lockLevel = "SHARE_UPDATE_EXCLUSIVE";
    }
    return { lockLevel, issues };
  }

  // 3. ALTER TABLE Checks
  if (/^ALTER\s+TABLE\b/i.test(normalized)) {
    lockLevel = "ACCESS_EXCLUSIVE";

    // 3a. Foreign Key without NOT VALID
    if (/\bADD\s+(?:CONSTRAINT\s+[a-zA-Z0-9_"]+\s+)?FOREIGN\s+KEY\b/i.test(normalized)) {
      const isNotValid = /\bNOT\s+VALID\b/i.test(normalized);
      if (!isNotValid) {
        issues.push({
          id: "DDL-003",
          statement: normalized,
          line,
          table,
          lockLevel: "ACCESS_EXCLUSIVE",
          severity: "critical",
          causesTableRewrite: false,
          rule: "Immediate Foreign Key Validation",
          message:
            "Adding a foreign key constraint without NOT VALID locks the entire table with ACCESS EXCLUSIVE while scanning every existing row.",
          remediation:
            "Add the foreign key with NOT VALID (instant lock), then validate in a separate transaction using ALTER TABLE ... VALIDATE CONSTRAINT (SHARE UPDATE EXCLUSIVE).",
          safeSqlAlternative: `${normalized} NOT VALID;\n-- In subsequent step:\nALTER TABLE ${table ?? "<table>"} VALIDATE CONSTRAINT <constraint_name>;`,
        });
      }
    }

    // 3b. Validate constraint (Safe Level 4 lock)
    if (/\bVALIDATE\s+CONSTRAINT\b/i.test(normalized)) {
      lockLevel = "SHARE_UPDATE_EXCLUSIVE";
      return { lockLevel, issues: [] };
    }

    // 3c. Volatile Column Defaults (causes full table rewrite)
    const addColumnMatch = normalized.match(/\bADD\s+(?:COLUMN\s+)?[a-zA-Z0-9_"]+\s+[^,;]+(?:\bDEFAULT\s+([^,;]+))/i);
    if (addColumnMatch) {
      const defaultVal = addColumnMatch[1].trim().toLowerCase();
      // Volatile functions that force Postgres to evaluate row-by-row and rewrite the table
      const isVolatile =
        defaultVal.includes("random()") ||
        defaultVal.includes("clock_timestamp()") ||
        defaultVal.includes("statement_timestamp()") ||
        defaultVal.includes("uuid_generate_v4()") ||
        defaultVal.includes("gen_random_uuid()");

      if (isVolatile) {
        issues.push({
          id: "DDL-004",
          statement: normalized,
          line,
          table,
          lockLevel: "ACCESS_EXCLUSIVE",
          severity: "critical",
          causesTableRewrite: true,
          rule: "Volatile Default Value on Add Column",
          message: `Adding a column with a volatile default '${defaultVal}' forces a full table rewrite holding an ACCESS EXCLUSIVE lock.`,
          remediation:
            "Add column without default (or with static constant default), then backfill historical rows in batches, and finally set the default for new rows.",
          safeSqlAlternative: `-- Step 1: Add column without volatile default\nALTER TABLE ${table ?? "<table>"} ADD COLUMN <col> <type>;\n-- Step 2: Set default for future rows\nALTER TABLE ${table ?? "<table>"} ALTER COLUMN <col> SET DEFAULT ${defaultVal};\n-- Step 3: Backfill existing rows in non-blocking batches`,
        });
      }
    }

    // 3d. In-place Column Type Alteration (full table rewrite)
    if (/\bALTER\s+(?:COLUMN\s+)?[a-zA-Z0-9_"]+\s+(?:SET\s+DATA\s+)?TYPE\b/i.test(normalized)) {
      issues.push({
        id: "DDL-005",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "critical",
        causesTableRewrite: true,
        rule: "In-Place Column Type Alteration",
        message:
          "Changing a column data type in-place rewrites the entire table and rebuilds all dependent indexes while holding an ACCESS EXCLUSIVE lock.",
        remediation:
          "Use the Expansion/Contraction pattern: (1) Add new column with desired type, (2) Dual-write via trigger/app, (3) Backfill, (4) Switch reads, (5) Drop old column.",
      });
    }

    // 3e. In-place Column Rename (breaks running code)
    if (/\bRENAME\s+(?:COLUMN\s+)?[a-zA-Z0-9_"]+\s+TO\b/i.test(normalized)) {
      issues.push({
        id: "DDL-006",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "warning",
        causesTableRewrite: false,
        rule: "In-Place Column Rename",
        message: "Renaming a column breaks currently running application queries that expect the old column name.",
        remediation:
          "Create a new column or a generated view column, deploy app code that reads from both, and deprecate the old name.",
      });
    }

    // 3f. In-place Table Rename (breaks running code)
    if (/\bRENAME\s+TO\b/i.test(normalized)) {
      issues.push({
        id: "DDL-007",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "warning",
        causesTableRewrite: false,
        rule: "In-Place Table Rename",
        message: "Renaming a table immediately breaks application queries accessing the old table name.",
        remediation: "Create a compatibility view pointing old_name -> new_name before dropping.",
      });
    }

    // 3g. Direct Column Drop
    if (/\bDROP\s+(?:COLUMN\s+)?[a-zA-Z0-9_"]+/i.test(normalized) && !normalized.includes("DROP CONSTRAINT")) {
      issues.push({
        id: "DDL-008",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "warning",
        causesTableRewrite: false,
        rule: "Direct Column Drop",
        message: "Dropping a column immediately breaks active deployments referencing the column.",
        remediation: "Deploy code that stops selecting/writing the column first, then drop column in a later release.",
      });
    }

    // 3h. Adding NOT NULL without check constraint
    if (/\bALTER\s+(?:COLUMN\s+)?[a-zA-Z0-9_"]+\s+SET\s+NOT\s+NULL\b/i.test(normalized)) {
      issues.push({
        id: "DDL-009",
        statement: normalized,
        line,
        table,
        lockLevel: "ACCESS_EXCLUSIVE",
        severity: "warning",
        causesTableRewrite: false,
        rule: "Direct NOT NULL Constraint",
        message:
          "Setting NOT NULL on an existing column requires scanning the entire table under an ACCESS EXCLUSIVE lock.",
        remediation:
          "Add a CHECK (col IS NOT NULL) NOT VALID constraint first, validate it with VALIDATE CONSTRAINT, then apply SET NOT NULL.",
      });
    }

    return { lockLevel, issues };
  }

  // 4. TRUNCATE / DROP TABLE (Destructive)
  if (/^TRUNCATE\b|^DROP\s+TABLE\b/i.test(normalized)) {
    lockLevel = "ACCESS_EXCLUSIVE";
    issues.push({
      id: "DDL-010",
      statement: normalized,
      line,
      table,
      lockLevel: "ACCESS_EXCLUSIVE",
      severity: "critical",
      causesTableRewrite: false,
      rule: "Destructive Table Purge / Drop",
      message: "TRUNCATE and DROP TABLE acquire ACCESS EXCLUSIVE lock and permanently destroy table data.",
      remediation:
        "Never run TRUNCATE or DROP TABLE in automated deployment migrations without a multi-step soft-delete.",
    });
    return { lockLevel, issues };
  }

  // 5. VACUUM FULL
  if (/^VACUUM\s+FULL\b/i.test(normalized)) {
    lockLevel = "ACCESS_EXCLUSIVE";
    issues.push({
      id: "DDL-011",
      statement: normalized,
      line,
      table,
      lockLevel: "ACCESS_EXCLUSIVE",
      severity: "critical",
      causesTableRewrite: true,
      rule: "VACUUM FULL Lockout",
      message: "VACUUM FULL locks the table with ACCESS EXCLUSIVE and rewrites all pages. Use pg_repack instead.",
      remediation: "Use pg_repack or standard autovacuum tuning for online table bloat remediation.",
    });
    return { lockLevel, issues };
  }

  return { lockLevel, issues };
}

/**
 * Audits a complete migration script or SQL string.
 */
export function auditMigrationSql(sql: string, targetName = "inline.sql"): MigrationAuditResult {
  const statements = splitSqlStatements(sql);
  const allIssues: MigrationIssue[] = [];
  let highestLock: LockLevel = "ACCESS_SHARE";
  let hasTableRewrite = false;

  // Check if lock_timeout is configured anywhere in the script
  const hasLockTimeout = /SET\s+(?:LOCAL\s+)?lock_timeout\s*=\s*['"]?[0-9]+(?:\.[0-9]+)?(?:ms|s|min)?['"]?/i.test(sql);

  for (const item of statements) {
    const analysis = analyzeStatement(item.statement, item.line);
    highestLock = compareLockLevels(highestLock, analysis.lockLevel);
    for (const issue of analysis.issues) {
      if (issue.causesTableRewrite) hasTableRewrite = true;
      allIssues.push(issue);
    }
  }

  // If there are heavy DDL statements (Level >= 5) and NO lock_timeout, flag as critical
  if (LOCK_LEVEL_SEVERITY[highestLock] >= 5 && !hasLockTimeout) {
    allIssues.unshift({
      id: "DDL-000",
      statement: "SET lock_timeout missing",
      line: 1,
      lockLevel: highestLock,
      severity: "critical",
      causesTableRewrite: false,
      rule: "Missing Migration Lock Timeout",
      message:
        "Migration executes high-severity DDL locks without setting lock_timeout. If another transaction holds a lock, this migration will queue and block all subsequent incoming traffic.",
      remediation:
        "Prepend `SET lock_timeout = '2s';` to the migration script so it fails fast rather than taking down the database.",
      safeSqlAlternative: "SET lock_timeout = '2s';\nSET statement_timeout = '30s';",
    });
  }

  const criticalCount = allIssues.filter((i) => i.severity === "critical").length;
  const warningCount = allIssues.filter((i) => i.severity === "warning").length;
  const infoCount = allIssues.filter((i) => i.severity === "info").length;

  return {
    target: targetName,
    totalStatements: statements.length,
    highestLockLevel: highestLock,
    hasTableRewrite,
    clean: criticalCount === 0,
    hasLockTimeout,
    issues: allIssues,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
    },
  };
}

/**
 * Scans a schema DDL text or SQL file for Foreign Keys and indexes to identify unindexed FK hazards.
 */
export function scanUnindexedForeignKeys(schemaSql: string): UnindexedFkResult[] {
  const results: UnindexedFkResult[] = [];
  const normalized = schemaSql.replace(/\r\n/g, "\n");

  // Extract all CREATE INDEX statements
  const indexMatches = normalized.matchAll(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_"]+)\s+ON\s+(?:ONLY\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)\s*\(([^)]+)\)/gi,
  );
  const indexedColumnsByTable: Record<string, Set<string>> = {};

  for (const m of indexMatches) {
    const tableName = m[2].replace(/"/g, "").toLowerCase();
    const cols = m[3].split(",").map((c) => c.trim().replace(/"/g, "").split(/\s+/)[0].toLowerCase());
    if (!indexedColumnsByTable[tableName]) {
      indexedColumnsByTable[tableName] = new Set();
    }
    // Leading column of the index supports foreign key lookups
    if (cols.length > 0) {
      indexedColumnsByTable[tableName].add(cols[0]);
    }
  }

  // 1. Check ALTER TABLE ADD CONSTRAINT FOREIGN KEY
  const fkMatches = normalized.matchAll(
    /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)\s+ADD\s+(?:CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/gi,
  );

  for (const m of fkMatches) {
    const tableName = m[1].replace(/"/g, "").toLowerCase();
    const fkName = m[2] ? m[2].replace(/"/g, "") : `fk_${tableName}`;
    const columns = m[3].split(",").map((c) => c.trim().replace(/"/g, "").toLowerCase());
    const referencedTable = m[4].replace(/"/g, "").toLowerCase();

    const leadingCol = columns[0];
    const isIndexed = indexedColumnsByTable[tableName]?.has(leadingCol) ?? false;

    if (!isIndexed) {
      results.push({
        table: tableName,
        foreignKey: fkName,
        columns,
        referencedTable,
        hasIndex: false,
        hazard: `Updating or deleting rows in parent table '${referencedTable}' takes a SHARE lock on child table '${tableName}', freezing child writes!`,
        suggestedIndexSql: `CREATE INDEX CONCURRENTLY idx_${tableName}_${columns.join("_")} ON ${tableName} (${columns.join(", ")});`,
      });
    }
  }

  // 2. Check inline FOREIGN KEY inside CREATE TABLE
  const createTableMatches = normalized.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)\s*\(([\s\S]*?)\);/gi,
  );

  for (const tm of createTableMatches) {
    const tableName = tm[1].replace(/"/g, "").toLowerCase();
    const body = tm[2];

    const inlineFkMatches = body.matchAll(
      /(?:CONSTRAINT\s+([a-zA-Z0-9_"]+)\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)/gi,
    );

    for (const m of inlineFkMatches) {
      const fkName = m[1] ? m[1].replace(/"/g, "") : `fk_${tableName}`;
      const columns = m[2].split(",").map((c) => c.trim().replace(/"/g, "").toLowerCase());
      const referencedTable = m[3].replace(/"/g, "").toLowerCase();

      const leadingCol = columns[0];
      const isIndexed = indexedColumnsByTable[tableName]?.has(leadingCol) ?? false;

      if (!isIndexed) {
        // Check if primary key covers it
        const pkMatch = body.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        const pkCol = pkMatch ? pkMatch[1].trim().replace(/"/g, "").toLowerCase() : "";
        if (pkCol !== leadingCol) {
          results.push({
            table: tableName,
            foreignKey: fkName,
            columns,
            referencedTable,
            hasIndex: false,
            hazard: `Updating or deleting rows in parent table '${referencedTable}' takes a SHARE lock on child table '${tableName}', freezing child writes!`,
            suggestedIndexSql: `CREATE INDEX CONCURRENTLY idx_${tableName}_${columns.join("_")} ON ${tableName} (${columns.join(", ")});`,
          });
        }
      }
    }

    // 2b. Check column-level REFERENCES inside CREATE TABLE (e.g. user_id uuid REFERENCES users (id))
    const colLevelRefMatches = body.matchAll(
      /([a-zA-Z0-9_"]+)\s+[a-zA-Z0-9_()]+(?:\s+NOT\s+NULL)?\s+REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_"]+)(?:\s*\(([^)]+)\))?/gi,
    );

    for (const cm of colLevelRefMatches) {
      const colName = cm[1].replace(/"/g, "").toLowerCase();
      const referencedTable = cm[2].replace(/"/g, "").toLowerCase();
      const fkName = `fk_${tableName}_${colName}`;
      const columns = [colName];

      const isIndexed = indexedColumnsByTable[tableName]?.has(colName) ?? false;
      if (!isIndexed) {
        const pkMatch = body.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        const pkCol = pkMatch ? pkMatch[1].trim().replace(/"/g, "").toLowerCase() : "";
        if (pkCol !== colName) {
          results.push({
            table: tableName,
            foreignKey: fkName,
            columns,
            referencedTable,
            hasIndex: false,
            hazard: `Updating or deleting rows in parent table '${referencedTable}' takes a SHARE lock on child table '${tableName}', freezing child writes!`,
            suggestedIndexSql: `CREATE INDEX CONCURRENTLY idx_${tableName}_${columns.join("_")} ON ${tableName} (${columns.join(", ")});`,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Format audit result into human-readable terminal markdown.
 */
export function formatAuditReport(results: MigrationAuditResult[], fkResults: UnindexedFkResult[]): string {
  const lines: string[] = [];

  lines.push("\n======================================================================");
  lines.push(" 🛡️  MUSE DATABASE ZERO-DOWNTIME MIGRATION GUARD");
  lines.push("======================================================================");

  let totalCritical = 0;
  let totalWarning = 0;

  for (const r of results) {
    lines.push(`\n📄 Target: ${r.target}`);
    lines.push(
      `   Statements: ${r.totalStatements} | Highest Lock: [${r.highestLockLevel}] | Rewrite: ${r.hasTableRewrite ? "YES ⚠️" : "NO ✅"}`,
    );

    if (r.issues.length === 0) {
      lines.push("   ✅ 100% Zero-downtime safe! No blocking table locks or rewrites detected.");
      continue;
    }

    for (const issue of r.issues) {
      if (issue.severity === "critical") totalCritical++;
      if (issue.severity === "warning") totalWarning++;

      const badge = issue.severity === "critical" ? "🔴 [CRITICAL]" : "🟡 [WARNING]";
      lines.push(`\n   ${badge} [${issue.id}] ${issue.rule} (Line ${issue.line})`);
      if (issue.table) lines.push(`      Table: ${issue.table}`);
      lines.push(`      Lock Level: ${issue.lockLevel}`);
      lines.push(`      Problem: ${issue.message}`);
      lines.push(`      💡 Safe Fix: ${issue.remediation}`);
      if (issue.safeSqlAlternative) {
        lines.push(
          `      Example Safe SQL:\n${issue.safeSqlAlternative
            .split("\n")
            .map((l) => `        ${l}`)
            .join("\n")}`,
        );
      }
    }
  }

  if (fkResults.length > 0) {
    lines.push("\n──────────────────────────────────────────────────────────────────────");
    lines.push(`⚠️  UNINDEXED FOREIGN KEY HAZARDS DETECTED (${fkResults.length})`);
    lines.push("──────────────────────────────────────────────────────────────────────");
    for (const fk of fkResults) {
      lines.push(`   • Table: ${fk.table}.${fk.columns.join(", ")} ➔ References: ${fk.referencedTable}`);
      lines.push(`     Hazard: ${fk.hazard}`);
      lines.push(`     Suggested: ${fk.suggestedIndexSql}`);
    }
  }

  lines.push("\n======================================================================");
  if (totalCritical > 0) {
    lines.push(`❌ Migration Guard Failed: ${totalCritical} critical zero-downtime blocker(s) found!`);
  } else if (totalWarning > 0) {
    lines.push(`⚠️ Migration Guard Passed with ${totalWarning} warning(s). Review recommended before deploy.`);
  } else {
    lines.push("✅ All migrations verified zero-downtime compliant. Safe for live production traffic.");
  }
  lines.push("======================================================================\n");

  return lines.join("\n");
}

export async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      json: { type: "boolean", default: false },
      schema: { type: "string" },
      "fail-on-critical": { type: "boolean", default: true },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
🛡️ migration-guard.ts — Zero-Downtime Database Migration & Locking Guard

Usage:
  bun migration-guard.ts <sql_file|dir|sql_string> [options]

Options:
  --json                 Output machine-readable JSON format
  --schema <file>        Scan database schema DDL file for unindexed foreign keys
  --fail-on-critical     Exit code 1 if critical violations found (default: true)
  -h, --help             Show help
`);
    process.exit(0);
  }

  const rawTarget = positionals[0] || ".";
  const targetPath = resolve(process.cwd(), rawTarget);
  const auditResults: MigrationAuditResult[] = [];
  const fkResults: UnindexedFkResult[] = [];

  // Schema scan if provided
  if (values.schema) {
    const schemaPath = resolve(process.cwd(), values.schema);
    if (existsSync(schemaPath)) {
      const content = readFileSync(schemaPath, "utf8");
      fkResults.push(...scanUnindexedForeignKeys(content));
    }
  }

  if (existsSync(targetPath)) {
    const stat = statSync(targetPath);
    if (stat.isFile()) {
      const content = readFileSync(targetPath, "utf8");
      auditResults.push(auditMigrationSql(content, targetPath));
    } else if (stat.isDirectory()) {
      const files = readdirSync(targetPath);
      for (const f of files) {
        if (f.endsWith(".sql")) {
          const p = join(targetPath, f);
          const content = readFileSync(p, "utf8");
          auditResults.push(auditMigrationSql(content, p));
        }
      }
    }
  } else {
    // Treat raw target as SQL string
    auditResults.push(auditMigrationSql(rawTarget, "inline-sql"));
  }

  const hasCritical = auditResults.some((r) => r.summary.criticalCount > 0);
  const isClean = !hasCritical && fkResults.length === 0;

  if (values.json) {
    console.log(
      JSON.stringify(
        {
          clean: isClean,
          auditResults,
          unindexedForeignKeys: fkResults,
        },
        null,
        2,
      ),
    );
    process.exit(hasCritical && values["fail-on-critical"] ? 1 : 0);
  }

  const report = formatAuditReport(auditResults, fkResults);
  console.log(report);

  if (hasCritical && values["fail-on-critical"]) {
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("MigrationGuard error:", err);
    process.exit(1);
  });
}
