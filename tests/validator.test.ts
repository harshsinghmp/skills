import { describe, expect, it } from "bun:test";
import { validateSkillsDirectory } from "../src/validator.ts";

describe("Skills Validator Engine", () => {
  it("returns invalid status if directory does not exist", () => {
    const res = validateSkillsDirectory("non-existent-directory-xyz");
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("validates skills directory structure cleanly", () => {
    const res = validateSkillsDirectory("skills");
    // Should return a valid report object with total count and issue lists
    expect(typeof res.totalSkills).toBe("number");
    expect(Array.isArray(res.errors)).toBe(true);
    expect(Array.isArray(res.warnings)).toBe(true);
  });
});
