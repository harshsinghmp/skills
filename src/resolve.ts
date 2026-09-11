import type { ResolvedSource } from "./types.ts";

/**
 * Parses an upstream link into a normalized source spec.
 *
 * Accepted formats:
 *  - https://github.com/owner/repo                          → whole-repo discovery
 *  - https://github.com/owner/repo/tree/<ref>/<path>        → single skill (or dir to discover)
 *  - https://github.com/owner/repo/blob/<ref>/<path>        → single skill
 *  - https://raw.githubusercontent.com/owner/repo/<ref>/<path>
 *  - owner/repo                                             → whole-repo discovery
 *  - owner/repo/path                                        → single skill
 *  - https://<any-host>/... (GitLab, self-hosted, .git URLs) → pure git mode
 */
export function resolveSource(input: string): ResolvedSource {
  const raw = input.trim().replace(/\.git\/?$/, "");

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return resolveHttpUrl(raw);
  }
  if (raw.includes("://")) {
    throw new Error(`Unsupported URL protocol in '${input}'`);
  }
  return resolveShorthand(raw);
}

function resolveHttpUrl(url: string): ResolvedSource {
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (host === "raw.githubusercontent.com") {
    const [owner, repo, branch, ...rest] = segments;
    if (!owner || !repo || !branch || rest.length === 0) {
      throw new Error(`Malformed raw GitHub URL: ${url}`);
    }
    return {
      repo: `${owner}/${repo}`,
      branch,
      sourcePath: stripTrailingFile(rest.join("/")),
      host: "github",
      wholeRepo: false,
    };
  }

  if (host === "github.com" || host === "www.github.com") {
    const [owner, repo, kind, branch, ...rest] = segments;
    if (!owner || !repo) {
      throw new Error(`Malformed GitHub URL: ${url}`);
    }
    const repoSlug = `${owner}/${repo}`;
    if (kind === "releases" || kind === "archive") {
      throw new Error(
        `Release/archive URLs not supported: ${url}. Use the repo root or a tree/blob URL instead.`
      );
    }
    if (!kind || kind === "tree") {
      return {
        repo: repoSlug,
        branch: kind === "tree" && branch ? branch : undefined,
        sourcePath: kind === "tree" && branch ? rest.join("/") || undefined : undefined,
        host: "github",
        wholeRepo: !branch || rest.length === 0,
      };
    }
    if (kind === "blob") {
      if (!branch || rest.length === 0) {
        throw new Error(`Malformed GitHub blob URL: ${url}`);
      }
      return {
        repo: repoSlug,
        branch,
        sourcePath: stripTrailingFile(rest.join("/")),
        host: "github",
        wholeRepo: false,
      };
    }
    throw new Error(`Unsupported GitHub URL shape: ${url}`);
  }

  // Generic git host (GitLab, Bitbucket, self-hosted): treat as a git clone target.
  // Path after host is repo path; optional /tree|/-/tree/<ref> segments handled best-effort.
  const isGitlabTree = segments.includes("-") && segments[segments.indexOf("-") + 1] === "tree";
  const treeIdx = segments.findIndex((s, i) => s === "tree" || (i > 0 && segments[i - 1] === "-"));
  if (isGitlabTree || (treeIdx > 0 && segments[treeIdx] === "tree")) {
    const idx = isGitlabTree ? segments.indexOf("-") : treeIdx;
    const repoPath = segments.slice(0, isGitlabTree ? idx : idx).join("/");
    const branch = segments[idx + 1];
    const sourcePath = segments.slice(idx + 2).join("/") || undefined;
    return {
      repo: `${parsed.origin}/${repoPath}`,
      branch: branch || undefined,
      sourcePath,
      host: "git",
      wholeRepo: !sourcePath,
    };
  }

  return { repo: `${parsed.origin}/${segments.join("/")}`, host: "git", wholeRepo: true };
}

function resolveShorthand(raw: string): ResolvedSource {
  const parts = raw.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Expected 'owner/repo' or a full URL, got: '${raw}'`);
  }
  if (parts.length === 2) {
    return { repo: parts.join("/"), host: "github", wholeRepo: true };
  }
  return {
    repo: parts.slice(0, 2).join("/"),
    sourcePath: parts.slice(2).join("/"),
    host: "github",
    wholeRepo: false,
  };
}

function stripTrailingFile(path: string): string {
  // A blob/raw URL may point at SKILL.md itself; normalize to the skill directory.
  const segments = path.split("/").filter(Boolean);
  if (segments[segments.length - 1] === "SKILL.md") {
    segments.pop();
  }
  return segments.join("/");
}

/** Groups an arbitrary URL against the "same source" key for manifest dedup. */
export function sourceKey(source: ResolvedSource): string {
  return `${source.host}:${source.repo}#${source.sourcePath ?? "*"}`;
}
