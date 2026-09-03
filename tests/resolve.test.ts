import { describe, expect, it } from "bun:test";
import { resolveSource, sourceKey } from "../src/resolve.ts";

describe("Source Resolver", () => {
  it("resolves a bare GitHub repo URL as whole-repo discovery", () => {
    const r = resolveSource("https://github.com/obra/superpowers");
    expect(r).toEqual({ repo: "obra/superpowers", host: "github", wholeRepo: true });
  });

  it("resolves owner/repo shorthand", () => {
    const r = resolveSource("obra/superpowers");
    expect(r.repo).toBe("obra/superpowers");
    expect(r.wholeRepo).toBe(true);
  });

  it("resolves a tree URL to a specific skill path with branch", () => {
    const r = resolveSource("https://github.com/obra/superpowers/tree/main/skills/test-driven-development");
    expect(r.repo).toBe("obra/superpowers");
    expect(r.branch).toBe("main");
    expect(r.sourcePath).toBe("skills/test-driven-development");
    expect(r.wholeRepo).toBe(false);
  });

  it("normalizes blob URLs pointing at SKILL.md to the skill directory", () => {
    const r = resolveSource("https://github.com/obra/superpowers/blob/main/skills/tdd/SKILL.md");
    expect(r.sourcePath).toBe("skills/tdd");
    expect(r.branch).toBe("main");
  });

  it("resolves raw.githubusercontent.com URLs", () => {
    const r = resolveSource("https://raw.githubusercontent.com/obra/superpowers/main/skills/tdd/SKILL.md");
    expect(r.repo).toBe("obra/superpowers");
    expect(r.branch).toBe("main");
    expect(r.sourcePath).toBe("skills/tdd");
  });

  it("resolves owner/repo/path shorthand", () => {
    const r = resolveSource("obra/superpowers/skills/tdd");
    expect(r.repo).toBe("obra/superpowers");
    expect(r.sourcePath).toBe("skills/tdd");
    expect(r.wholeRepo).toBe(false);
  });

  it("routes non-GitHub URLs to generic git mode", () => {
    const r = resolveSource("https://gitlab.com/owner/repo");
    expect(r.host).toBe("git");
    expect(r.wholeRepo).toBe(true);
  });

  it("strips trailing .git suffix", () => {
    const r = resolveSource("https://github.com/obra/superpowers.git");
    expect(r.repo).toBe("obra/superpowers");
  });

  it("rejects malformed shorthand", () => {
    expect(() => resolveSource("just-a-name")).toThrow();
  });

  it("builds stable dedup keys", () => {
    const a = sourceKey(resolveSource("https://github.com/o/r/tree/main/skills/x"));
    const b = sourceKey(resolveSource("o/r/skills/x"));
    expect(a).toBe(b);
  });
});
