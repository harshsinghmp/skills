import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

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

export interface LegacyPromotionOptions {
  content?: string;
  dryRun?: boolean;
  harness?: string;
  force?: boolean;
}

export interface LegacyPromotionResult {
  status: "promoted" | "deduped" | "refused" | "untouched";
  targetPath: string;
  destinationPath?: string;
  reason: string;
  archivePath?: string;
  provenance?: string;
  warnings: string[];
  routerResynced: boolean;
}

export const INVALID_LEGACY_DIRS = new Set([
  ".claude",
  ".gemini",
  ".cursor",
  ".windsurf",
  ".aider",
  ".continue",
  ".codex",
  ".copilot",
  ".github/instructions",
  ".clinerules",
  ".roo",
  ".opencode",
]);

export const INVALID_LEGACY_FILES = new Set([
  "claude.md",
  "claude.local.md",
  "gemini.md",
  "codex.md",
  ".cursorrules",
  ".windsurfrules",
  ".aider.conf.yml",
  ".github/copilot-instructions.md",
  "copilot-instructions.md",
  ".clinerules",
  "opencode.md",
  "opencode_instructions.md",
]);

export function isAllowedUntouchedTarget(targetPath: string): boolean {
  const norm = portablePath(targetPath);
  const base = basename(norm);
  if (base === "AGENTS.md" || base.startsWith("AGENTS.")) return true;
  if (norm.split("/").includes(".agents")) return true;
  if (/(?:^|\/)skills\/[^/]+\/CLAUDE\.md$/i.test(norm) || /(?:^|\/)templates\/CLAUDE\.md$/i.test(norm)) return true;
  return false;
}

export function isCompiledIdeArtifact(targetPath: string): boolean {
  const norm = portablePath(targetPath);
  if (/\.cursor\/rules\/[^/]+\.mdc$/i.test(norm)) return true;
  if (norm.endsWith(".github/copilot-instructions.md") || norm === "copilot-instructions.md") return true;
  return false;
}

export function isInvalidLegacyWriteTarget(targetPath: string): boolean {
  if (isAllowedUntouchedTarget(targetPath)) return false;
  if (isCompiledIdeArtifact(targetPath)) return true;
  const norm = portablePath(targetPath);
  const base = basename(norm).toLowerCase();
  if (INVALID_LEGACY_FILES.has(base)) return true;
  if (base.endsWith(".instructions.md")) return true;
  const segments = norm.split("/");
  for (const dir of INVALID_LEGACY_DIRS) {
    if (segments.includes(dir) || norm.startsWith(`${dir}/`) || norm.includes(`/${dir}/`)) return true;
  }
  return false;
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function classifyInstructionContent(content: string): "rule-like" | "knowledge-facts" {
  const imperativeRegex = /\b(never|always|must|do[- ]not|don't|prefer|avoid|require)\b/i;
  const vocabularyRegex = /\b(conventions?|standards?|polic(?:y|ies)|rules?|guidelines?|adrs?)\b/i;
  if (imperativeRegex.test(content) && vocabularyRegex.test(content)) {
    return "rule-like";
  }
  return "knowledge-facts";
}

export function findAncestorContainer(startDir: string): string | null {
  let curr = resolve(startDir);
  while (true) {
    if (existsSync(join(curr, ".agents")) || existsSync(join(curr, "AGENTS.md"))) {
      return curr;
    }
    const parent = dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return null;
}

function resolveStandardBucket(content: string, targetPath: string): string {
  const lower = content.toLowerCase();
  if (/\b(secrets?|credentials?|tokens?|api[-_ ]keys?|vibeguard|passwords?)\b/i.test(lower))
    return "security-vibeguard.md";
  if (/\b(git|branches?|commits?|pull[-_ ]requests?|\bprs?\b|merg(?:e|ing))\b/i.test(lower)) return "git-workflow.md";
  if (/\b(next(?:\.js)?|react|server[-_ ]components?|app[-_ ]router)\b/i.test(lower)) return "frontend-nextjs.md";
  if (/\b(astro)\b/i.test(lower)) return "frontend-astro.md";
  if (/\b(wordpress)\b/i.test(lower)) return "backend-wordpress.md";
  if (/\b(workers?|hono|cloudflare)\b/i.test(lower)) return "backend-workers-hono.md";
  if (/\b(visual|screenshots?|ui[-_ ]inspections?)\b/i.test(lower)) return "visual-inspection.md";
  if (/\b(motions?|animations?|svg|diagrams?)\b/i.test(lower)) return "motion-diagrams.md";
  if (/\b(anti[-_ ]patterns?|antipatterns?|bad[-_ ]practices?)\b/i.test(lower)) return "anti-patterns.md";
  if (/\b(workflows?|test(?:ing|s)?|verifications?|sprints?)\b/i.test(lower)) return "workflows.md";
  if (/\b(boundar(?:y|ies)|governances?|checkpoints?)\b/i.test(lower)) return "boundary-governance.md";
  if (/\b(councils?|roles?|leads?)\b/i.test(lower)) return "council-roles.md";

  const base = basename(targetPath)
    .replace(/\.(md|txt|rules)$/i, "")
    .toLowerCase();
  if (base && !["claude", "gemini", "codex", "cursorrules", "windsurfrules", "instructions", "prompt"].includes(base)) {
    return `${base}.md`;
  }
  return "execution-kernel.md";
}

function resolveContextBucket(content: string): string {
  const lower = content.toLowerCase();
  if (/\b(decisions?|adrs?|tradeoffs?|rationale|choices?)\b/i.test(lower)) return "decisions.md";
  if (/\b(architectur(?:e|al)|data[- ]flows?|components?|topolog(?:y|ies)|services?)\b/i.test(lower))
    return "architecture.md";
  if (/\b(dependenc(?:y|ies)|packages?|frameworks?|librar(?:y|ies)|toolchains?|runtimes?|stack)\b/i.test(lower))
    return "stack.md";
  if (/\b(current|sprints?|milestones?|shipped|deliverables?|active|status|gotchas?)\b/i.test(lower))
    return "current.md";
  if (/\b(products?|scope|problem[- ]statement|users?|icp|features?)\b/i.test(lower)) return "product.md";
  if (/\b(accounts?|environments?|domains?|endpoints?)\b/i.test(lower)) return "accounts.md";
  if (/\b(roadmaps?|upcoming|future[- ]phases?)\b/i.test(lower)) return "roadmap.md";
  return "imported-agent-instructions.md";
}

function detectHarness(targetPath: string, override?: string): string {
  if (override) return override;
  const norm = portablePath(targetPath).toLowerCase();
  if (norm.includes("claude")) return "Claude";
  if (norm.includes("gemini")) return "Gemini";
  if (norm.includes("cursor")) return "Cursor";
  if (norm.includes("windsurf")) return "Windsurf";
  if (norm.includes("aider")) return "Aider";
  if (norm.includes("codex")) return "Codex";
  if (norm.includes("copilot")) return "GitHub Copilot";
  if (norm.includes("opencode")) return "OpenCode";
  if (norm.includes("cline")) return "Cline";
  if (norm.includes("roo")) return "Roo Code";
  if (norm.includes("continue")) return "Continue";
  return "Foreign Harness";
}

const IMPORTED_INSTRUCTIONS_BLOCK = `<!-- updateagents:imported-instructions-router:start -->
## Imported Agent Instructions

Read \`.agents/context/imported-agent-instructions.md\` before every task when present. It preserves user-authored rules from earlier agent systems with source-path provenance; apply each within its recorded scope and ask the user about conflicts.
<!-- updateagents:imported-instructions-router:end -->`;

export function ensureImportedInstructionsRouter(content: string): { updatedContent: string; modified: boolean } {
  const start = "<!-- updateagents:imported-instructions-router:start -->";
  const end = "<!-- updateagents:imported-instructions-router:end -->";
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end);
  if (startIndex >= 0 && endIndex >= startIndex) {
    const stop = endIndex + end.length;
    const existing = content.slice(startIndex, stop);
    if (existing.trim() === IMPORTED_INSTRUCTIONS_BLOCK.trim()) return { updatedContent: content, modified: false };
    return {
      updatedContent: content.slice(0, startIndex) + IMPORTED_INSTRUCTIONS_BLOCK + content.slice(stop),
      modified: true,
    };
  }
  const separator = content.endsWith("\n\n") ? "" : content.endsWith("\n") ? "\n" : "\n\n";
  return { updatedContent: `${content}${separator}${IMPORTED_INSTRUCTIONS_BLOCK}\n`, modified: true };
}

export function promoteLegacyInstructionWrite(
  workspaceRoot: string,
  targetPath: string,
  options?: LegacyPromotionOptions,
): LegacyPromotionResult {
  const absoluteTarget = isAbsolute(targetPath) ? resolve(targetPath) : resolve(workspaceRoot, targetPath);

  // 1. Allowed & untouched check
  if (isAllowedUntouchedTarget(absoluteTarget)) {
    return {
      status: "untouched",
      targetPath,
      reason: "Target is a canonical Agent Engine file or template (untouched).",
      warnings: [],
      routerResynced: false,
    };
  }

  // 2. Compiled IDE artifact check
  if (isCompiledIdeArtifact(absoluteTarget)) {
    return {
      status: "refused",
      targetPath,
      reason:
        "Refusal: Compiled IDE artifacts (.cursor/rules/*.mdc, .github/copilot-instructions.md) cannot be hand-edited or directly promoted. Run 'updateagents --sync-ide' to regenerate them from .agents/standards/.",
      warnings: [],
      routerResynced: false,
    };
  }

  // 3. Resolve content
  let content = options?.content;
  if (content === undefined) {
    if (existsSync(absoluteTarget)) {
      content = readFileSync(absoluteTarget, "utf8");
    } else {
      return {
        status: "refused",
        targetPath,
        reason: `Refusal: Target file '${targetPath}' does not exist and zero content was provided.`,
        warnings: [],
        routerResynced: false,
      };
    }
  }

  // 4. Size & shell mutation checks
  const byteLength = Buffer.byteLength(content, "utf8");
  if (byteLength > 8192) {
    return {
      status: "refused",
      targetPath,
      reason: `Refusal: Content exceeds 8KB limit (${byteLength} bytes > 8192). Automated promotion refused; manual placement required.`,
      warnings: [],
      routerResynced: false,
    };
  }

  const isShellScript = /^\s*#!\/(?:usr\/)?bin\/(?:ba)?sh\b/m.test(content);
  const hasShellMutation =
    /^\s*(?:curl|wget)\s+.*\|\s*(?:ba)?sh\b/m.test(content) ||
    /^\s*(?:rm\s+-rf\b|sudo\s+|chmod\s+\+x\b)/m.test(content) ||
    /^\s*export\s+[A-Za-z0-9_]+=/m.test(content) ||
    /\b(?:bash|sh)\s+-c\b/.test(content);

  if (isShellScript || hasShellMutation) {
    return {
      status: "refused",
      targetPath,
      reason:
        "Refusal: Content contains shell/bash mutations or script execution. Automated promotion refused; manual placement required.",
      warnings: [],
      routerResynced: false,
    };
  }

  // 5. Routing ladder
  const container = findAncestorContainer(dirname(absoluteTarget));
  let destPath: string;
  let routingReason: string;

  if (container) {
    const classification = classifyInstructionContent(content);
    if (classification === "rule-like") {
      const standardName = resolveStandardBucket(content, absoluteTarget);
      destPath = join(container, ".agents/standards", standardName);
      routingReason = `Rule-like imperatives detected (never/always/must/require + policy/standard/rules); routed to .agents/standards/${standardName}.`;
    } else {
      const contextBucket = resolveContextBucket(content);
      destPath = join(container, ".agents/context", contextBucket);
      routingReason = `Project facts/knowledge detected; routed to .agents/context/${contextBucket}.`;
    }
  } else {
    const home = homedir();
    if (absoluteTarget.startsWith(home)) {
      destPath = join(home, ".agents/AGENTS.md");
      routingReason = "Home-level legacy instruction without container; routed to ~/.agents/AGENTS.md (R2).";
    } else {
      return {
        status: "refused",
        targetPath,
        reason: `Refusal: Target '${targetPath}' is in an unknown scope (outside $HOME and has no ancestor Agent Engine container). Cannot guess promotion target. Escalating to user; promotion aborted without writing global AGENTS.md.`,
        warnings: [],
        routerResynced: false,
      };
    }
  }

  // 6. Whitespace-normalized dedupe check
  if (existsSync(destPath)) {
    const existingDest = readFileSync(destPath, "utf8");
    if (normalizeWhitespace(existingDest).includes(normalizeWhitespace(content))) {
      return {
        status: "deduped",
        targetPath,
        destinationPath: destPath,
        reason: "Content already present in destination file (whitespace-normalized dedupe match). Zero changes made.",
        warnings: [],
        routerResynced: false,
      };
    }
  }

  // 7. Provenance block
  const harness = detectHarness(absoluteTarget, options?.harness);
  const dateStr = new Date().toISOString().slice(0, 10);
  const baseScope = container || homedir();
  const relSource = portablePath(relative(baseScope, absoluteTarget));
  const relDest = portablePath(relative(baseScope, destPath));

  const provenanceBlock = `<!-- updateagents:promoted-legacy-write:start -->
### Promoted from \`${relSource}\` (${harness}) on ${dateStr}
> Reason: ${routingReason}
> Destination: \`${relDest}\`

${content.trim()}
<!-- updateagents:promoted-legacy-write:end -->`;

  // 8. Archive legacy source file (if physically exists on disk and container present)
  let archivePath: string | undefined;
  if (existsSync(absoluteTarget) && container) {
    const hash = sha256(content);
    archivePath = safeArchiveName(relSource, hash);
    const absoluteArchive = resolveArchivePath(container, archivePath);
    if (!options?.dryRun) {
      mkdirSync(dirname(absoluteArchive), { recursive: true });
      if (!existsSync(absoluteArchive)) copyFileSync(absoluteTarget, absoluteArchive);
      const manifestFile = join(container, MANIFEST_PATH);
      const existingManifest = loadManifest(container);
      if (!existingManifest.some((m) => m.sourcePath === relSource && m.sha256 === hash)) {
        existingManifest.push({ sourcePath: relSource, archivePath, sha256: hash });
        mkdirSync(dirname(manifestFile), { recursive: true });
        writeFileSync(manifestFile, `${JSON.stringify({ version: 1, sources: existingManifest }, null, 2)}\n`, "utf8");
      }
      // Replace legacy source file with clean adapter
      const adapter = renderAdapter(content, relSource);
      writeFileSync(absoluteTarget, adapter, "utf8");
    }
  }

  // 9. Write destination file
  if (!options?.dryRun) {
    mkdirSync(dirname(destPath), { recursive: true });
    if (existsSync(destPath)) {
      const existing = readFileSync(destPath, "utf8");
      const sep = existing.endsWith("\n\n") ? "" : existing.endsWith("\n") ? "\n" : "\n\n";
      writeFileSync(destPath, `${existing}${sep}${provenanceBlock}\n`, "utf8");
    } else {
      writeFileSync(destPath, `${provenanceBlock}\n`, "utf8");
    }
  }

  // 10. File size warning check
  const warnings: string[] = [];
  const currentDestBytes = existsSync(destPath) ? statSync(destPath).size : Buffer.byteLength(provenanceBlock, "utf8");
  if (currentDestBytes >= 10240) {
    warnings.push(
      `⚠️ Warning: Destination file reaches or exceeds 10KB size limit (${(currentDestBytes / 1024).toFixed(1)} KB). Consider trimming or splitting.`,
    );
  }

  // 11. Resync Router (AGENTS.md)
  let routerResynced = false;
  if (container && !options?.dryRun) {
    const routerPath = join(container, "AGENTS.md");
    if (existsSync(routerPath)) {
      let routerContent = readFileSync(routerPath, "utf8");
      let modified = false;

      if (destPath.includes("/.agents/standards/")) {
        const standardName = basename(destPath);
        const standardLink = `./.agents/standards/${standardName}`;
        if (!routerContent.includes(standardLink)) {
          const marker = "<!-- CONDITIONAL_STANDARDS:start -->";
          if (routerContent.includes(marker)) {
            const title = standardName.replace(/\.md$/, "").replace(/-/g, " ");
            const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
            const newLine = `- [${capitalizedTitle}](${standardLink}) — Promoted legacy instructions and guidelines.\n`;
            routerContent = routerContent.replace(marker, `${marker}\n${newLine}`);
            modified = true;
          }
        }
      }

      if (destPath.endsWith("imported-agent-instructions.md")) {
        const res = ensureImportedInstructionsRouter(routerContent);
        if (res.modified) {
          routerContent = res.updatedContent;
          modified = true;
        }
      }

      if (modified) {
        writeFileSync(routerPath, routerContent, "utf8");
        routerResynced = true;
      }
    }
  }

  return {
    status: "promoted",
    targetPath,
    destinationPath: destPath,
    reason: routingReason,
    archivePath,
    provenance: provenanceBlock,
    warnings,
    routerResynced,
  };
}
