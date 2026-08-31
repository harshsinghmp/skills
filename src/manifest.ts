import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SkillsManifest, SkillEntry } from "./types.ts";

export const DEFAULT_MANIFEST_PATH = "skills.manifest.json";

export function loadManifest(manifestPath = DEFAULT_MANIFEST_PATH): SkillsManifest {
  const fullPath = join(process.cwd(), manifestPath);
  if (!existsSync(fullPath)) {
    throw new Error(`Skills manifest not found at: ${fullPath}`);
  }
  const raw = readFileSync(fullPath, "utf8");
  const data = JSON.parse(raw) as SkillsManifest;

  if (!data.version || !Array.isArray(data.skills)) {
    throw new Error("Invalid manifest format: 'version' and 'skills' array are required.");
  }

  return data;
}

export function saveManifest(manifest: SkillsManifest, manifestPath = DEFAULT_MANIFEST_PATH): void {
  const fullPath = join(process.cwd(), manifestPath);
  manifest.lastUpdated = new Date().toISOString();
  // Sort skills alphabetically for clean git diffs
  manifest.skills.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(fullPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

export function findSkill(manifest: SkillsManifest, name: string): SkillEntry | undefined {
  return manifest.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function addOrUpdateSkill(manifest: SkillsManifest, skill: SkillEntry): void {
  const idx = manifest.skills.findIndex((s) => s.name.toLowerCase() === skill.name.toLowerCase());
  if (idx >= 0) {
    manifest.skills[idx] = skill;
  } else {
    manifest.skills.push(skill);
  }
}
