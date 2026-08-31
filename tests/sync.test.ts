import { describe, expect, it } from "bun:test";
import { syncSkills } from "../src/sync.ts";

describe("Skills Sync Engine", () => {
  it("executes dry-run sync without modifying disk", async () => {
    const report = await syncSkills({ dryRun: true });
    expect(report.total).toBeGreaterThan(0);
    expect(report.details.length).toBeGreaterThan(0);
  });

  it("filters sync targets when filter option is provided", async () => {
    const report = await syncSkills({ dryRun: true, filter: "guardian" });
    for (const d of report.details) {
      expect(d.name.toLowerCase()).toContain("guardian");
    }
  });
});
