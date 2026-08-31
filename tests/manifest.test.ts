import { describe, expect, it } from "bun:test";
import { loadManifest, findSkill, addOrUpdateSkill } from "../src/manifest.ts";
import type { SkillsManifest } from "../src/types.ts";

describe("Skills Manifest Engine", () => {
  it("loads and parses a valid skills manifest", () => {
    const manifest = loadManifest();
    expect(manifest.version).toBeDefined();
    expect(Array.isArray(manifest.skills)).toBe(true);
    expect(manifest.skills.length).toBeGreaterThan(0);
  });

  it("finds a skill by case-insensitive name", () => {
    const manifest = loadManifest();
    if (manifest.skills.length > 0) {
      const first = manifest.skills[0];
      const found = findSkill(manifest, first.name.toUpperCase());
      expect(found).toBeDefined();
      expect(found?.name).toBe(first.name);
    }
  });

  it("adds or updates a skill in manifest in-memory", () => {
    const mockManifest: SkillsManifest = {
      version: "1.0.0",
      description: "Test manifest",
      skills: [],
    };

    addOrUpdateSkill(mockManifest, {
      name: "test-skill",
      category: "engineering",
      description: "A test skill for unit testing purposes",
    });

    expect(mockManifest.skills.length).toBe(1);
    expect(mockManifest.skills[0].name).toBe("test-skill");

    // Update existing
    addOrUpdateSkill(mockManifest, {
      name: "test-skill",
      category: "engineering",
      description: "Updated description for testing",
    });

    expect(mockManifest.skills.length).toBe(1);
    expect(mockManifest.skills[0].description).toBe("Updated description for testing");
  });
});
