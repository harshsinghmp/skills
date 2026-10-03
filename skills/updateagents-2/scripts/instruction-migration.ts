import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";

export interface AgentInstructionSource {
  relativePath: string;
  absolutePath: string;
  content: string;
}

interface ArchivedInstructionSource {
  sourcePath: string;
  archivePath: string;
  sha256: string;
}

export interface InstructionMigrationResult {
  sources: AgentInstructionSource[];
  imported: string[];
  archivePaths: string[];
  canonicalPath?: string;
}

const ADAPTER_MARKER = "<!-- updateagents:adapter -->";
const MANAGED_MARKER = "<!-- updateagents:managed -->";
const MANIFEST_PATH = ".agents/archive/agent-instructions/manifest.json";
const CANONICAL_PATH = ".agents/context/imported-agent-instructions.md";
const SKIP_DIRS = new Set([
  ".agents",
  ".memory",
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  ".next",
  ".astro",
  ".output",
]);
const KNOWN_NAMES = new Set([
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "CODEX.md",
  "OPENCODE.md",
  "OPENCODE_INSTRUCTIONS.md",
  ".cursorrules",
  ".windsurfrules",
  ".clinerules",
  "copilot-instructions.md",
  "AGENT.md",
  "AGENTS.override.md",
  "INSTRUCTIONS.md",
  "AI_INSTRUCTIONS.md",
  "AI_RULES.md",
  "RULES.md",
  "PROMPT.md",
  "WINDSURF.md",
  "CURSOR.md",
  "COPILOT.md",
  "JULES.md",
]);
const RULE_DIRS = new Set([
  ".cursor/rules",
  ".windsurf/rules",
  ".continue/rules",
  ".clinerules",
  ".roo/rules",
  ".opencode",
  ".gemini",
  ".github/instructions",
]);
const TEXT_EXTENSIONS = new Set([".md", ".mdc", ".txt", ".rules"]);

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function portablePath(value: string): string {
  return value.split(sep).join("/");
}

function isInsideRuleDirectory(relativePath: string): boolean {
  const normalized = portablePath(relativePath);
  return [...RULE_DIRS].some((dir) => normalized.startsWith(`${dir}/`)) || /^\.roo\/rules-[^/]+\//.test(normalized);
}

function isInsideGenericInstructionDirectory(relativePath: string): boolean {
  return portablePath(relativePath)
    .split("/")
    .slice(0, -1)
    .some((segment) => /^(?:\.)?(?:agent|rule|instruction|prompt)s?$/i.test(segment));
}

function isInstructionFile(relativePath: string): boolean {
  const normalized = portablePath(relativePath);
  const name = basename(normalized);
  return (
    KNOWN_NAMES.has(name) ||
    name.endsWith(".instructions.md") ||
    /(?:agent|ai|prompt|instruction|convention|rules?)(?:s)?\.(?:md|mdc|txt)$/i.test(name) ||
    ((isInsideRuleDirectory(normalized) || isInsideGenericInstructionDirectory(normalized)) &&
      TEXT_EXTENSIONS.has(extname(name).toLowerCase()))
  );
}

export function isManagedRootAgents(content: string): boolean {
  return (
    content.includes(MANAGED_MARKER) ||
    (content.startsWith("# ") &&
      content.includes("<!-- ALWAYS_REQUIRED_STANDARDS:start -->") &&
      content.includes("<!-- CONDITIONAL_STANDARDS:start -->") &&
      content.includes("<!-- muse-secretary-router:start -->"))
  );
}

function isExpectedAdapter(content: string, relativePath: string): boolean {
  if (relativePath === "CLAUDE.md") return content.trim() === "@AGENTS.md";
  if (!content.includes(ADAPTER_MARKER)) return false;
  return content.trim() === renderAdapter(content, relativePath).trim();
}

function extractFrontmatter(content: string): string {
  const match = content.match(/^(---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$))/);
  return match?.[1] || "";
}

export function renderAdapter(original: string, relativePath: string): string {
  if (relativePath === "CLAUDE.md") return "@AGENTS.md\n";
  const frontmatter = extractFrontmatter(original);
  const heading = extname(relativePath).toLowerCase() === ".mdc" ? "# Shared workspace instructions" : "";
  return `${frontmatter}${heading ? `${heading}\n\n` : ""}${ADAPTER_MARKER}\n\nRead and follow the workspace instructions in \`AGENTS.md\` and the complete migrated rules in \`.agents/context/imported-agent-instructions.md\`. Higher-priority system, developer and current user instructions prevail. If imported sources conflict and precedence does not resolve them, report both paths and ask the user; do not silently choose.\n`;
}

export function discoverAgentInstructionSources(
  workspaceRoot: string,
  options: { includeManagedRoot?: boolean } = {},
): AgentInstructionSource[] {
  const root = resolve(workspaceRoot);
  const found: AgentInstructionSource[] = [];

  function walk(directory: string, depth: number): void {
    if (depth > 12) return;
    let entries: Dirent[];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      const relPath = portablePath(relative(root, fullPath));
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(fullPath, depth + 1);
        continue;
      }
      if (!entry.isFile() || !isInstructionFile(relPath)) continue;
      try {
        const content = readFileSync(fullPath, "utf8");
        if (relPath === "AGENTS.md" && !options.includeManagedRoot && isManagedRootAgents(content)) continue;
        if (isExpectedAdapter(content, relPath)) continue;
        found.push({ relativePath: relPath, absolutePath: fullPath, content });
      } catch {
        // Unreadable or non-text candidates remain untouched and are reported by the caller's scan.
      }
    }
  }

  walk(root, 0);
  return found.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function safeArchiveName(sourcePath: string, hash: string): string {
  const safeName = portablePath(sourcePath)
    .replaceAll("/", "__")
    .replace(/[^A-Za-z0-9._-]/g, "_");
  return `.agents/archive/agent-instructions/${hash.slice(0, 12)}-${safeName}`;
}

function assertNoSymlinkSegments(workspaceRoot: string, absolutePath: string): void {
  const root = resolve(workspaceRoot);
  const relativePath = relative(root, resolve(absolutePath));
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Instruction migration path escapes workspace: ${absolutePath}`);
  }
  let current = root;
  for (const segment of relativePath.split(sep).filter(Boolean)) {
    current = join(current, segment);
    try {
      if (lstatSync(current).isSymbolicLink()) {
        throw new Error(`Instruction migration will not follow symlinks: ${current}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

function resolveArchivePath(workspaceRoot: string, archivePath: string): string {
  const segments = archivePath.split(/[\\/]/);
  const absolutePath = resolve(workspaceRoot, archivePath);
  const relativePath = relative(resolve(workspaceRoot), absolutePath);
  if (
    !archivePath.startsWith(".agents/archive/agent-instructions/") ||
    segments.some((segment) => segment === ".." || segment === ".memory") ||
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`Unsafe instruction archive path in migration manifest: ${archivePath}`);
  }
  assertNoSymlinkSegments(workspaceRoot, absolutePath);
  return absolutePath;
}

function loadManifest(root: string): ArchivedInstructionSource[] {
  const manifest = resolveArchivePath(root, MANIFEST_PATH);
  if (!existsSync(manifest)) return [];
  let parsed: { sources?: ArchivedInstructionSource[] };
  try {
    parsed = JSON.parse(readFileSync(manifest, "utf8"));
  } catch {
    throw new Error(`Cannot read instruction migration manifest: ${manifest}`);
  }
  if (!Array.isArray(parsed.sources)) return [];
  return parsed.sources.map((source) => {
    resolveArchivePath(root, source.archivePath);
    return source;
  });
}

function renderCanonical(root: string, sources: ArchivedInstructionSource[]): string {
  const sections = sources
    .slice()
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath) || a.sha256.localeCompare(b.sha256))
    .map((source) => {
      const sourcePath = resolveArchivePath(root, source.archivePath);
      const original = readFileSync(sourcePath, "utf8").trim();
      return `## Source: \`${source.sourcePath}\`\n\n> Original preserved at \`${source.archivePath}\`. Rules remain scoped to the source location and metadata below.\n\n${original}`;
    });
  return `<!-- updateagents:imported-instructions -->
# Imported Agent Instructions

This file contains user-authored instructions migrated from agent-specific files. Treat these as active project rules, applying each within its recorded source scope. Higher-priority system, developer and current user instructions prevail. If imported rules conflict with each other or current project evidence and precedence does not resolve the conflict, name the competing source paths and ask the user before choosing. Do not discard or silently weaken a rule.

## Source map

${sources
  .slice()
  .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath) || a.sha256.localeCompare(b.sha256))
  .map((source) => `- \`${source.sourcePath}\` → \`${source.archivePath}\` (${source.sha256.slice(0, 12)})`)
  .join("\n")}

${sections.join("\n\n---\n\n")}
`;
}

export function migrateAgentInstructions(
  workspaceRoot: string,
  options: { dryRun?: boolean; includeManagedRoot?: boolean } = {},
): InstructionMigrationResult {
  const root = resolve(workspaceRoot);
  const sources = discoverAgentInstructionSources(root, { includeManagedRoot: options.includeManagedRoot });
  const manifestPath = join(root, MANIFEST_PATH);
  const canonicalPath = join(root, CANONICAL_PATH);
  assertNoSymlinkSegments(root, canonicalPath);
  const existing = loadManifest(root);
  const archived = existing.slice();
  const imported: string[] = [];
  const archivePaths: string[] = [];

  for (const source of sources) {
    const hash = sha256(source.content);
    if (archived.some((item) => item.sourcePath === source.relativePath && item.sha256 === hash)) continue;
    const archivePath = safeArchiveName(source.relativePath, hash);
    const absoluteArchive = resolveArchivePath(root, archivePath);
    if (!options.dryRun) {
      mkdirSync(dirname(absoluteArchive), { recursive: true });
      if (!existsSync(absoluteArchive)) copyFileSync(source.absolutePath, absoluteArchive);
    }
    archived.push({ sourcePath: source.relativePath, archivePath, sha256: hash });
    imported.push(source.relativePath);
    archivePaths.push(archivePath);
  }

  // Preserve a human-authored file at the generated destination before replacing it.
  if (existsSync(canonicalPath)) {
    const previous = readFileSync(canonicalPath, "utf8");
    if (!previous.startsWith("<!-- updateagents:imported-instructions -->")) {
      const hash = sha256(previous);
      const sourcePath = CANONICAL_PATH;
      if (!archived.some((item) => item.sourcePath === sourcePath && item.sha256 === hash)) {
        const archivePath = safeArchiveName(sourcePath, hash);
        if (!options.dryRun) {
          mkdirSync(dirname(join(root, archivePath)), { recursive: true });
          writeFileSync(join(root, archivePath), previous, "utf8");
        }
        archived.push({ sourcePath, archivePath, sha256: hash });
        imported.push(sourcePath);
        archivePaths.push(archivePath);
      }
    }
  }

  const hasInstructions = archived.length > 0;
  if (hasInstructions) {
    if (!options.dryRun) {
      const rendered = renderCanonical(root, archived);
      mkdirSync(dirname(canonicalPath), { recursive: true });
      writeFileSync(canonicalPath, rendered, "utf8");
      mkdirSync(dirname(manifestPath), { recursive: true });
      writeFileSync(manifestPath, `${JSON.stringify({ version: 1, sources: archived }, null, 2)}\n`, "utf8");
    }
  }

  return {
    sources,
    imported,
    archivePaths,
    canonicalPath: hasInstructions ? CANONICAL_PATH : undefined,
  };
}

export function adaptAgentInstructionSources(
  sources: AgentInstructionSource[],
  options: { dryRun?: boolean } = {},
): string[] {
  const updated: string[] = [];
  for (const source of sources) {
    if (source.relativePath === "AGENTS.md") continue;
    const adapter = renderAdapter(source.content, source.relativePath);
    if (adapter === source.content) continue;
    if (!options.dryRun) writeFileSync(source.absolutePath, adapter, "utf8");
    updated.push(source.relativePath);
  }
  return updated;
}
