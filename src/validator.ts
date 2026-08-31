import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { ValidationIssue, ValidationResult } from "./types.ts";

export function validateSkillsDirectory(baseDir = "skills"): ValidationResult {
  const root = join(process.cwd(), baseDir);
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!existsSync(root)) {
    return {
      valid: false,
      totalSkills: 0,
      errors: [{ skill: "root", type: "error", message: `Directory '${baseDir}' does not exist` }],
      warnings: [],
    };
  }

  const entries = readdirSync(root, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillName = entry.name;
    const skillPath = join(root, skillName);
    const skillMd = join(skillPath, "SKILL.md");

    count++;

    // 1. Check for SKILL.md existence
    if (!existsSync(skillMd)) {
      errors.push({
        skill: skillName,
        type: "error",
        message: `Missing SKILL.md in skills/${skillName}`,
      });
      continue;
    }

    const content = readFileSync(skillMd, "utf8");

    // 2. Validate YAML Frontmatter
    const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      errors.push({
        skill: skillName,
        type: "error",
        message: `SKILL.md is missing required YAML frontmatter (--- ... ---)`,
      });
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    
    // Extract description supporting both single-line and multiline block scalars (>, |)
    let description = "";
    const multilineMatch = frontmatter.match(/^description:\s*(?:[>|]-?)\s*\r?\n((?:[ \t]+.+\r?\n?)+)/m);
    if (multilineMatch) {
      description = multilineMatch[1].replace(/^[ \t]+/gm, "").replace(/\r?\n/g, " ").trim();
    } else {
      const singleMatch = frontmatter.match(/^description:\s*(.+)$/m);
      if (singleMatch) {
        description = singleMatch[1].trim().replace(/^["']|["']$/g, "");
      }
    }

    if (!nameMatch || !nameMatch[1].trim()) {
      errors.push({
        skill: skillName,
        type: "error",
        message: `YAML frontmatter is missing 'name:' field in SKILL.md`,
      });
    }

    if (!description) {
      errors.push({
        skill: skillName,
        type: "error",
        message: `YAML frontmatter is missing 'description:' field in SKILL.md`,
      });
    } else if (description.length < 15) {
      warnings.push({
        skill: skillName,
        type: "warning",
        message: `Description in SKILL.md is very short (${description.length} chars). Consider making it more descriptive for LLM indexing.`,
      });
    }

    // 3. Name consistency check
    if (nameMatch) {
      const declaredName = nameMatch[1].trim().replace(/^["']|["']$/g, "");
      if (declaredName !== skillName && !declaredName.includes(skillName)) {
        warnings.push({
          skill: skillName,
          type: "warning",
          message: `Folder name '${skillName}' differs from frontmatter name '${declaredName}'`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    totalSkills: count,
    errors,
    warnings,
  };
}
