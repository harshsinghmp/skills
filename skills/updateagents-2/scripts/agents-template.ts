import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

export interface AgentTemplateHints {
  projectName?: string;
  projectDesc?: string;
  agentName?: string;
  agentRole?: string;
  intent?: string;
  framework?: string;
  styling?: string;
  animation?: string;
  dependencies?: Record<string, string>;
  governanceModel?: string;
  toolchain?: string;
}

export interface AgentTemplateProfile extends AgentTemplateHints {
  projectName: string;
  projectDesc: string;
  agentName: string;
  agentRole: string;
  governanceModel: string;
  toolchain: string;
  repositoryReferences: string;
  installedModernTools: string[];
  alwaysRequiredStandards: string;
  conditionalStandards: string;
}

const MODERN_TOOL_PAIRS = [
  ["rg", "grep"],
  ["fd", "find"],
  ["bat", "cat"],
  ["eza", "ls"],
  ["sd", "sed"],
  ["choose", "cut"],
  ["gojq", "jq"],
  ["delta", "git diff"],
  ["zoxide", "cd"],
  ["procs", "ps"],
  ["btop", "top"],
  ["ncdu", "du"],
  ["zstd", "gzip"],
] as const;

const ALWAYS_STANDARDS = [
  [
    "Execution & Cognitive Kernel",
    "standards/execution-kernel.md",
    "Judgment rules, modern CLI matrix, sanitization, and refactoring discipline.",
  ],
  [
    "Security & Vibeguard",
    "standards/security-vibeguard.md",
    "Secret isolation, destructive-command gates, and untrusted-output defense.",
  ],
  ["Boundary Governance", "standards/boundary-governance.md", "Goal, facts, method, proof, and scope checkpoints."],
  ["Development Workflows", "standards/workflows.md", "Task tiers, execution phases, and verification gates."],
  [
    "Git Workflow",
    "standards/git-workflow.md",
    "Branches, atomic feature PRs, commit format, releases, and clean package refs.",
  ],
  [
    "Instruction Hierarchy",
    "standards/dox-hierarchy.md",
    "Instruction precedence, subtree contracts, and context closeout.",
  ],
  [
    "Context, Memory & Identity",
    "standards/memory-context.md",
    "Project/global context sources and persistent-memory lifecycle.",
  ],
  ["Anti-Patterns", "standards/anti-patterns.md", "Failure patterns and preferred alternatives."],
  ["Team Roles & Routing", "standards/council-roles.md", "Configured role responsibilities and task routing."],
  ["Project Context Map", "context/index.md", "Project purpose, architecture, current state, decisions, and roadmap."],
] as const;

function oneLine(value: string | undefined, fallback: string): string {
  return (value || fallback).replace(/[\r\n\t]+/g, " ").trim();
}

function markdownLinks(entries: ReadonlyArray<readonly [string, string, string]>): string {
  return entries.map(([label, path]) => `- [${label}](./.agents/${path})`).join("\n");
}

export function checkModernToolsAvailability(): { installed: string[]; missing: string[] } {
  const installed: string[] = [];
  const missing: string[] = [];
  const lookup = process.platform === "win32" ? "where" : "which";

  for (const [tool] of MODERN_TOOL_PAIRS) {
    const result = spawnSync(lookup, [tool], { encoding: "utf8", stdio: "ignore" });
    (result.status === 0 ? installed : missing).push(tool);
  }

  return { installed, missing };
}

export function detectAgentTemplateProfile(targetDir: string, hints: AgentTemplateHints = {}): AgentTemplateProfile {
  let packageJson: Record<string, any> = {};
  const pkgPath = join(targetDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      packageJson = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      // Invalid optional metadata is ignored; verified hints and file markers remain usable.
    }
  }
  let composerJson: Record<string, any> = {};
  const composerPath = join(targetDir, "composer.json");
  if (existsSync(composerPath)) {
    try {
      composerJson = JSON.parse(readFileSync(composerPath, "utf8"));
    } catch {
      // Invalid optional metadata is ignored; verified hints and file markers remain usable.
    }
  }

  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(hints.dependencies || {}),
  } as Record<string, string>;
  const has = (...names: string[]) => names.some((name) => name in dependencies);
  const frameworkHint = oneLine(
    hints.framework ||
      (has("astro") ? "astro" : has("next") ? "nextjs" : has("hono") ? "hono" : has("react") ? "react" : ""),
    "generic",
  ).toLowerCase();
  const framework = /astro/.test(frameworkHint)
    ? "astro"
    : /next/.test(frameworkHint)
      ? "nextjs"
      : /wordpress|bedrock/.test(frameworkHint)
        ? "wordpress"
        : /hono/.test(frameworkHint)
          ? "hono"
          : frameworkHint;
  const intent = oneLine(hints.intent, "").toLowerCase();
  const styling = oneLine(hints.styling, "").toLowerCase();
  const animation = oneLine(hints.animation, "").toLowerCase();
  const frontend = ["astro", "nextjs", "react", "vite", "wordpress", "instatic", "pure-html", "html"].includes(
    framework,
  );
  const projectName = oneLine(hints.projectName || packageJson.name, basename(targetDir));
  let projectDesc = oneLine(hints.projectDesc || packageJson.description, `${projectName} workspace`);
  const readmePath = join(targetDir, "README.md");
  if (!hints.projectDesc && !packageJson.description && existsSync(readmePath)) {
    try {
      const readme = readFileSync(readmePath, "utf8");
      const firstParagraph = readme.match(/^([^#\s][^\r\n]*)/m)?.[1];
      if (firstParagraph) projectDesc = oneLine(firstParagraph, projectDesc);
    } catch {
      // README is optional metadata.
    }
  }

  let repositoryReferences = "No canonical repository reference detected";
  const repository = packageJson.repository?.url || packageJson.repository;
  if (typeof repository === "string" && repository.trim()) {
    repositoryReferences = repository.trim();
  } else {
    const result = spawnSync("git", ["config", "--get", "remote.origin.url"], {
      cwd: targetDir,
      encoding: "utf8",
    });
    if (result.status === 0 && result.stdout.trim()) repositoryReferences = result.stdout.trim();
  }
  repositoryReferences = repositoryReferences.replace(/(https?:\/\/)[^/@\s]+@/i, "$1[REDACTED]@");

  const lockfileManager = [
    ["bun.lock", "Bun"],
    ["bun.lockb", "Bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "Yarn"],
    ["package-lock.json", "npm"],
  ].find(([file]) => existsSync(join(targetDir, file)))?.[1];
  const packageManager = packageJson.packageManager?.split("@")[0] || lockfileManager;
  const runtime = packageJson.engines?.node
    ? `Node.js ${packageJson.engines.node}`
    : "runtime from project configuration";
  const toolchain = oneLine(hints.toolchain, `${packageManager || "project-configured package manager"}; ${runtime}`);

  const all: Array<readonly [string, string, string]> = [...ALWAYS_STANDARDS];
  const add = (label: string, path: string, description: string) => all.push([label, path, description]);
  if (framework === "nextjs")
    add("Next.js & React", "standards/frontend-nextjs.md", "App Router, React patterns, and server/client boundaries.");
  if (framework === "astro")
    add("Astro", "standards/frontend-astro.md", "Static-first pages, interactive islands, and content collections.");
  if (framework === "hono" || has("hono", "wrangler"))
    add(
      "Cloudflare Workers & Hono",
      "standards/backend-workers-hono.md",
      "Worker APIs, Hono routes, and edge data access.",
    );
  if (
    framework === "wordpress" ||
    ["wp-config.php", "web/wp-config.php"].some((file) => existsSync(join(targetDir, file))) ||
    Object.keys({ ...(composerJson.require || {}), ...(composerJson["require-dev"] || {}) }).some((name) =>
      /^(roots\/wordpress|johnpbloch\/wordpress|wordpress\/wordpress)$/.test(name),
    )
  ) {
    add("WordPress", "standards/backend-wordpress.md", "WordPress architecture and operational conventions.");
  }
  if (frontend || ["brochure", "content", "ecommerce", "app", "mobile"].includes(intent)) {
    add("Design System", "brand/design.md", "Design tokens, component states, and responsive visual consistency.");
    add("Accessibility", "brand/a11y.md", "WCAG requirements, contrast, keyboard access, and assistive technology.");
    add(
      "Visual Inspection",
      "standards/visual-inspection.md",
      "Rendered-output checks across relevant viewport states.",
    );
  }
  if (/bem|hybrid/.test(styling))
    add("BEM CSS", "brand/bem-conventions.md", "Block–Element–Modifier naming and shallow selector depth.");
  if (animation && animation !== "none")
    add(
      "Animated Technical Diagrams",
      "standards/motion-diagrams.md",
      "Accessible, lightweight SVG diagrams and data-flow animation.",
    );
  if (has("stripe", "razorpay", "@stripe/stripe-js", "@razorpay/checkout") || intent === "ecommerce") {
    add(
      "Fintech Gateways & Tax Compliance",
      "standards/fintech-gateways.md",
      "Payment settlement, reconciliation, and applicable tax handling.",
    );
  }
  if (existsSync(join(targetDir, "Client-Intake")) || intent === "agency") {
    add(
      "Evidence-Based Client Reporting",
      "standards/client-reporting.md",
      "Progress and delivery claims grounded in artifacts and verification.",
    );
  }
  if (framework !== "generic" || intent)
    add("Agency Tech Stacks", "standards/tech-stacks.md", "Project stack selection and approved tooling boundaries.");
  if (
    framework !== "generic" ||
    has("drizzle-orm", "prisma", "mongoose", "pg", "postgres", "mysql2", "better-sqlite3", "@libsql/client") ||
    ["app", "ecommerce", "mobile"].includes(intent)
  ) {
    add(
      "System, Domain & Resilience Design",
      "standards/system-design.md",
      "Domain modeling, failure handling, and migration resilience.",
    );
  }

  const always = markdownLinks(ALWAYS_STANDARDS);
  const conditional = markdownLinks(all.slice(ALWAYS_STANDARDS.length));
  const installedModernTools = checkModernToolsAvailability().installed;
  return {
    ...hints,
    projectName,
    projectDesc,
    agentName: oneLine(hints.agentName, readConfiguredAgentName() || "User-configured agent name unavailable"),
    agentRole: oneLine(hints.agentRole, "Configured workspace agent"),
    intent,
    framework,
    styling,
    animation,
    dependencies,
    governanceModel: oneLine(
      hints.governanceModel,
      "Secretary intake → applicable skill/mode → verified task closeout",
    ),
    toolchain,
    repositoryReferences: oneLine(repositoryReferences, "No canonical repository reference detected"),
    installedModernTools,
    alwaysRequiredStandards: always,
    conditionalStandards: conditional || "- No conditional standards detected",
  };
}

export function readConfiguredAgentName(): string | undefined {
  const identityPath = join(homedir(), ".agents", "identity", "assistant.md");
  if (!existsSync(identityPath)) return undefined;
  try {
    const content = readFileSync(identityPath, "utf8");
    return content.match(/^\s*-\s*\*\*Default Assistant Identity\*\*:\s*(.+)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

export function renderAgentsTemplate(template: string, profile: AgentTemplateProfile): string {
  const replacements: Record<string, string> = {
    PROJECT_NAME: profile.projectName,
    PROJECT_DESC: profile.projectDesc,
    AGENT_NAME: profile.agentName,
    AGENT_ROLE: profile.agentRole,
    GOVERNANCE_MODEL: profile.governanceModel,
    TOOLCHAIN: profile.toolchain,
    REPOSITORY_REFERENCES: profile.repositoryReferences,
    INSTALLED_MODERN_TOOLS: profile.installedModernTools.join(", ") || "none detected; use the listed fallbacks",
  };
  let rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => replacements[key] ?? "");
  rendered = replaceStandardBlock(rendered, "ALWAYS_REQUIRED_STANDARDS", profile.alwaysRequiredStandards);
  rendered = replaceStandardBlock(rendered, "CONDITIONAL_STANDARDS", profile.conditionalStandards);
  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved AGENTS.md template placeholders: ${[...new Set(unresolved)].join(", ")}`);
  return rendered;
}

function replaceStandardBlock(content: string, name: string, replacement: string): string {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const pattern = new RegExp(`${start}\\r?\\n[\\s\\S]*?\\r?\\n${end}`);
  if (!pattern.test(content)) throw new Error(`Missing ${name} block in AGENTS.md template`);
  return content.replace(pattern, replacement || "- None detected");
}
