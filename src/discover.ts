import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DiscoveredSkill, DiscoveryResult } from "./types.ts";

const EXCLUDED_DIR_PARTS = /(^|\/)(node_modules|\.git|\.github|dist|build|\.cache|target|vendor)(\/|$)/;

interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

export async function githubTokenFetch(
  url: string,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "skills-aggregator",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { headers });
}

export async function resolveDefaultBranch(
  repo: string,
  host: "github" | "git",
  token?: string
): Promise<string | undefined> {
  if (host !== "github") return undefined;
  try {
    const res = await githubTokenFetch(`https://api.github.com/repos/${repo}`, token);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { default_branch?: string };
    return data.default_branch;
  } catch {
    return undefined;
  }
}

/**
 * Finds every directory inside an upstream repo that contains a SKILL.md.
 * Uses the GitHub trees API when possible (fast, no clone), and falls back
 * to a shallow blob-less clone for other hosts or when the API fails.
 */
export async function discoverSkillsInRepo(
  repo: string,
  options: {
    host?: "github" | "git";
    branch?: string;
    root?: string;
    token?: string;
  } = {}
): Promise<DiscoveryResult> {
  const host = options.host ?? "github";
  const branch =
    options.branch ??
    (await resolveDefaultBranch(repo, host, options.token)) ??
    "main";

  if (host === "github") {
    const apiResult = await discoverViaGithubApi(repo, branch, options.token);
    if (apiResult) {
      return filterByRoot(apiResult, options.root);
    }
  }

  const cloneResult = await discoverViaClone(repo, branch, host, options.token);
  return filterByRoot(cloneResult, options.root);
}

function filterByRoot(result: DiscoveryResult, root?: string): DiscoveryResult {
  if (!root) return result;
  const prefix = root.replace(/^\/+|\/+$/g, "");
  const skills = result.skills.filter(
    (s) => s.path === prefix || s.path.startsWith(`${prefix}/`)
  );
  if (skills.length === 0) {
    throw new Error(
      `No skills found under '${prefix}' in '${result.repo}' (${result.branch})`
    );
  }
  return { ...result, skills };
}

async function discoverViaGithubApi(
  repo: string,
  branch: string,
  token?: string
): Promise<DiscoveryResult | null> {
  try {
    const res = await githubTokenFetch(
      `https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      token
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tree?: GitHubTreeEntry[];
      truncated?: boolean;
    };
    if (!Array.isArray(data.tree)) return null;

    const skillBlobs = data.tree.filter(
      (e) =>
        e.type === "blob" &&
        e.path.split("/").pop() === "SKILL.md" &&
        !EXCLUDED_DIR_PARTS.test(e.path)
    );

    return {
      repo,
      branch,
      host: "github",
      truncated: Boolean(data.truncated),
      skills: dedupeSkillDirs(
        skillBlobs.map((e) => ({
          dirName: e.path.split("/").slice(-2, -1)[0] ?? "",
          path: e.path.split("/").slice(0, -1).join("/"),
        }))
      ),
    };
  } catch {
    return null;
  }
}

async function discoverViaClone(
  repo: string,
  branch: string,
  host: "github" | "git",
  token?: string
): Promise<DiscoveryResult> {
  const tmp = mkdtempSync(join(tmpdir(), "skills-discover-"));
  try {
    const cloneUrl = buildCloneUrl(repo, host, token);
    execSync(
      `git clone --depth 1 --filter=blob:none "${cloneUrl}" "${tmp}" --branch "${branch}"`,
      { stdio: "pipe", timeout: 60000 }
    );
    const skills = findSkillDirs(tmp);
    if (skills.length === 0) {
      throw new Error(`No SKILL.md files found in '${repo}' (${branch})`);
    }
    return { repo, branch, host, skills };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function buildCloneUrl(repo: string, host: "github" | "git", token?: string): string {
  if (host === "git") {
    return repo;
  }
  return token
    ? `https://x-access-token:${token}@github.com/${repo}.git`
    : `https://github.com/${repo}.git`;
}

function findSkillDirs(root: string): DiscoveredSkill[] {
  const results: DiscoveredSkill[] = [];
  walkForSkillDirs(root, root, results);
  return dedupeSkillDirs(results);
}

function walkForSkillDirs(absRoot: string, current: string, out: DiscoveredSkill[]): void {
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const fullPath = join(current, entry.name);
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (EXCLUDED_DIR_PARTS.test(entry.name)) continue;

    const skillMd = join(fullPath, "SKILL.md");
    if (existsSync(skillMd)) {
      const relPath = fullPath.slice(absRoot.length + 1);
      const frontmatter = parseFrontmatter(readFileSync(skillMd, "utf8"));
      out.push({
        dirName: entry.name,
        path: relPath,
        description: frontmatter?.description,
        declaredName: frontmatter?.name,
      });
      continue;
    }
    walkForSkillDirs(absRoot, fullPath, out);
  }
}

function parseFrontmatter(content: string): { name?: string; description?: string } | null {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = match[1];
  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  const multiline = fm.match(/^description:\s*(?:[>|]-?)\s*\r?\n((?:[ \t]+.+\r?\n?)+)/m);
  let description: string | undefined;
  if (multiline) {
    description = multiline[1].replace(/^[ \t]+/gm, "").replace(/\r?\n/g, " ").trim();
  } else {
    description = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  }
  return { name, description };
}

function dedupeSkillDirs(skills: DiscoveredSkill[]): DiscoveredSkill[] {
  const seen = new Set<string>();
  const out: DiscoveredSkill[] = [];
  for (const s of skills) {
    if (!s.dirName) continue;
    const key = `${s.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
