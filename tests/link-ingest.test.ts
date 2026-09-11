import { describe, expect, it } from "bun:test";
import { resolveSource } from "../src/resolve.ts";
import { ingestFromUrls } from "../src/ingest.ts";

describe("Link-only ingest contract", () => {
  it("rejects release/archive URLs with an actionable error", () => {
    expect(() => resolveSource("https://github.com/owner/repo/releases")).toThrow();
    expect(() =>
      resolveSource("https://github.com/owner/repo/archive/refs/heads/main.zip")
    ).toThrow();
  });

  it("suffixes single-skill links on name collision instead of erroring", async () => {
    const report = await ingestFromUrls(
      ["https://github.com/some-owner/some-repo/tree/main/skills/animate"],
      { dryRun: true }
    );
    expect(report.registered).toBe(1);
    expect(report.errors.length).toBe(0);
    expect(report.entries[0].name).not.toBe("animate");
    expect(report.entries[0].name.startsWith("animate-")).toBe(true);
  });

  it("skips re-adding an already-registered upstream path", async () => {
    const report = await ingestFromUrls(
      ["https://github.com/obra/superpowers/tree/main/skills/brainstorming"],
      { dryRun: true }
    );
    expect(report.registered).toBe(0);
    expect(report.errors.length).toBe(0);
  });
});
