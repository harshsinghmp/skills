import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "../templates/github");

export interface GitHubRepository {
  owner: string;
  name: string;
  url: string;
}

export interface GitHubScaffoldProfile {
  projectName?: string;
  projectDesc?: string;
  githubProject?: boolean;
  authorName?: string;
  agentName?: string;
  contributors?: string[];
  intent?: string;
  framework?: string;
  deploy?: string;
  packageManager?: string;
  nodeVersion?: string;
  hasPackageLock?: boolean;
  securityContact?: string;
  repositoryUrl?: string;
  packageScripts?: Record<string, string>;
  dependencyEcosystems?: string[];
  hasPythonProject?: boolean;
  hasComposerProject?: boolean;
  composerTestScript?: boolean;
  removeWorkflowsConfirmed?: boolean;
  dryRun?: boolean;
}

export interface GitHubScaffoldResult {
  created: string[];
  skipped: string[];
  removed: string[];
  confirmationRequired: boolean;
  hostUnknown: boolean;
  repository?: GitHubRepository;
}

interface PackageJsonRecord {
  name?: string;
  description?: string;
  author?: string | { name?: string };
  contributors?: Array<string | { name?: string }>;
  repository?: string | { url?: string };
  packageManager?: string;
  engines?: { node?: string };
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function oneLine(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\r\n\t]+/g, " ").trim() : "";
}

export function parseGitHubRemote(remote: string): GitHubRepository | undefined {
  const value = remote.trim();
  const match = value.match(
    /^(?:https?:\/\/(?:[^/@\s]+@)?github\.com\/|ssh:\/\/(?:[^/@\s]+@)?github\.com\/|(?:[^@/:]+@)?github\.com[:/])([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
  );
  if (!match) return undefined;
  const owner = match[1];
  const name = match[2].replace(/\.git$/i, "");
  if (!owner || !name || /[?#]/.test(owner + name)) return undefined;
  return { owner, name, url: `https://github.com/${owner}/${name}` };
}

function readPackageJson(targetDir: string): PackageJsonRecord {
  const path = join(targetDir, "package.json");
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PackageJsonRecord;
  } catch {
    return {};
  }
}

function packageRepositoryUrl(packageJson: PackageJsonRecord): string | undefined {
  const repository = packageJson.repository?.url || packageJson.repository;
  if (typeof repository !== "string") return undefined;
  const value = repository.trim().replace(/^github:/i, "https://github.com/");
  return parseGitHubRemote(value)?.url;
}

function packageAuthor(packageJson: PackageJsonRecord): string | undefined {
  const author = packageJson.author;
  const rawName = typeof author === "string" ? author : author?.name;
  return oneLine(rawName?.replace(/\s*(?:<[^>]*@[^>]*>|\([^)]*@[^)]*\))\s*$/, ""));
}

function detectedContributors(targetDir: string, packageJson: PackageJsonRecord): string[] {
  const fromPackage = Array.isArray(packageJson.contributors)
    ? packageJson.contributors
        .map((person) => oneLine(typeof person === "string" ? person : person.name))
        .map((name) => name.replace(/\s*(?:<[^>]*@[^>]*>|\([^)]*@[^)]*\))\s*$/, ""))
        .filter(Boolean)
    : [];
  const author = packageAuthor(packageJson);
  const gitAuthors = spawnSync("git", ["log", "-n", "100", "--format=%an"], { cwd: targetDir, encoding: "utf8" });
  const committedAuthors = gitAuthors.status === 0 ? gitAuthors.stdout.split(/\r?\n/).map(oneLine).filter(Boolean) : [];
  return [...new Set([...fromPackage, author, ...committedAuthors].filter((name): name is string => Boolean(name)))];
}

function detectedNodeVersion(targetDir: string, packageJson: PackageJsonRecord): string {
  const declared = oneLine(packageJson.engines?.node);
  if (declared && /^\d+(?:\.\d+)?(?:\.\d+)?$/.test(declared)) return declared;
  for (const file of [".nvmrc", ".node-version"]) {
    if (!existsSync(join(targetDir, file))) continue;
    const value = oneLine(readFileSync(join(targetDir, file), "utf8").replace(/^v/, ""));
    if (/^\d+(?:\.\d+)?(?:\.\d+)?$/.test(value)) return value;
  }
  return "22";
}

function targetRepository(
  targetDir: string,
  packageJson: PackageJsonRecord,
  hintedUrl?: string,
): GitHubRepository | undefined {
  const remote = spawnSync("git", ["remote", "get-url", "origin"], { cwd: targetDir, encoding: "utf8" });
  return (
    (remote.status === 0 ? parseGitHubRemote(remote.stdout) : undefined) ||
    parseGitHubRemote(hintedUrl || "") ||
    parseGitHubRemote(packageRepositoryUrl(packageJson) || "")
  );
}

export function selectGitHubWorkflowTemplates(profile: GitHubScaffoldProfile): string[] {
  const selected: string[] = [];
  const verificationScripts = ["test", "typecheck", "type-check", "lint", "build"];
  if (verificationScripts.some((name) => profile.packageScripts?.[name])) selected.push("ci-node.yml");
  if (profile.hasPythonProject) selected.push("ci-python.yml");
  if (profile.hasComposerProject) selected.push("ci-composer.yml");
  if (profile.intent === "oss" && profile.packageScripts?.test) selected.push("cli-test.yml");
  return [...new Set(selected)];
}

function markdownText(value: string, fallback: string): string {
  const clean = oneLine(value) || fallback;
  return clean.replace(/[\\`*_{}[\]<>]/g, "\\$&");
}

export function renderGitHubTemplate(
  template: string,
  profile: GitHubScaffoldProfile & { repositoryUrl?: string },
): string {
  const repository = parseGitHubRemote(profile.repositoryUrl || "");
  const repositoryUrl = repository?.url || "Repository URL not configured; ask the project owner before adding a link.";
  const repositoryName = repository ? `${repository.owner}/${repository.name}` : "Not configured";
  const contributors =
    [...(profile.contributors || []), profile.authorName, profile.agentName]
      .map((name) => oneLine(name))
      .filter((name, index, names) => name && names.indexOf(name) === index)
      .map((name) => `- ${markdownText(name, "Unknown contributor")}`)
      .join("\n") ||
    "- Contributor identities were unavailable at scaffold time; ask the project owner before naming contributors.";
  const securityReporting = profile.securityContact
    ? `Contact ${markdownText(profile.securityContact, "the configured security contact")} privately.`
    : repository
      ? `Use [GitHub Security Advisories](${repository.url}/security/advisories/new) if private reporting is enabled. If it is unavailable, ask the project owner for a private contact before reporting; do not post vulnerability details publicly.`
      : "Ask the project owner to configure a private reporting channel before publishing security-reporting instructions.";
  const replacements: Record<string, string> = {
    PROJECT_NAME: markdownText(profile.projectName || "Project", "Project"),
    PROJECT_DESCRIPTION: markdownText(
      profile.projectDesc || "Project description not recorded yet.",
      "Project description not recorded yet.",
    ),
    REPOSITORY_NAME: repositoryName,
    REPOSITORY_URL: repositoryUrl,
    ISSUES_URL: repository
      ? `${repository.url}/issues`
      : "GitHub Issues URL not configured; ask the project owner before adding a link.",
    DISCUSSIONS_URL: repository
      ? `${repository.url}/discussions`
      : "GitHub Discussions URL not configured; ask the project owner before adding a link.",
    SECURITY_REPORTING: securityReporting,
    CONTRIBUTORS: contributors,
    FRAMEWORK: markdownText(profile.framework || "Not detected", "Not detected"),
  };
  const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => replacements[key] ?? "");
  const unresolved = rendered.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved GitHub template placeholders: ${[...new Set(unresolved)].join(", ")}`);
  return rendered;
}

function packageManager(targetDir: string, packageJson: PackageJsonRecord): string {
  const declared = oneLine(packageJson.packageManager).split("@")[0];
  if (["npm", "pnpm", "yarn", "bun"].includes(declared)) return declared;
  for (const [file, manager] of [
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ]) {
    if (existsSync(join(targetDir, file))) return manager;
  }
  return "npm";
}

function workflowContext(
  targetDir: string,
  profile: GitHubScaffoldProfile,
): GitHubScaffoldProfile & { repositoryUrl?: string } {
  const pkg = readPackageJson(targetDir);
  const detectedPackageManager = packageManager(targetDir, pkg);
  const scripts = profile.packageScripts || pkg.scripts || {};
  const framework =
    profile.framework || (pkg.dependencies?.astro ? "astro" : pkg.dependencies?.next ? "nextjs" : "generic");
  const detected: GitHubScaffoldProfile = {
    ...profile,
    projectName: profile.projectName || pkg.name || basename(targetDir),
    projectDesc: profile.projectDesc || pkg.description,
    packageManager: normalizePackageManager(profile.packageManager || detectedPackageManager, detectedPackageManager),
    nodeVersion: profile.nodeVersion || detectedNodeVersion(targetDir, pkg),
    hasPackageLock:
      profile.hasPackageLock ??
      ["bun.lock", "bun.lockb", "pnpm-lock.yaml", "yarn.lock", "package-lock.json"].some((file) =>
        existsSync(join(targetDir, file)),
      ),
    authorName: profile.authorName || packageAuthor(pkg),
    contributors: [...new Set([...(profile.contributors || []), ...detectedContributors(targetDir, pkg)])],
    packageScripts: scripts,
    framework,
    hasPythonProject:
      profile.hasPythonProject ??
      ["pyproject.toml", "requirements.txt", "Pipfile"].some((file) => existsSync(join(targetDir, file))),
    hasComposerProject: profile.hasComposerProject ?? existsSync(join(targetDir, "composer.json")),
    composerTestScript: profile.composerTestScript ?? composerHasTestScript(targetDir),
    dependencyEcosystems: profile.dependencyEcosystems || detectDependencyEcosystems(targetDir, pkg, profile),
  };
  const repository = targetRepository(targetDir, pkg, profile.repositoryUrl);
  return { ...detected, repositoryUrl: repository?.url };
}

function normalizePackageManager(manager: string, fallback: string): string {
  return ["npm", "pnpm", "yarn", "bun"].includes(manager) ? manager : fallback;
}

function detectDependencyEcosystems(
  targetDir: string,
  packageJson: PackageJsonRecord,
  profile: GitHubScaffoldProfile,
): string[] {
  const ecosystems: string[] = [];
  if (existsSync(join(targetDir, "package.json"))) ecosystems.push("npm");
  if (
    profile.hasPythonProject ??
    ["pyproject.toml", "requirements.txt", "Pipfile"].some((file) => existsSync(join(targetDir, file)))
  ) {
    ecosystems.push("pip");
  }
  if (existsSync(join(targetDir, "composer.json"))) ecosystems.push("composer");
  if (existsSync(join(targetDir, "Cargo.toml"))) ecosystems.push("cargo");
  if (existsSync(join(targetDir, "go.mod"))) ecosystems.push("gomod");
  if (
    selectGitHubWorkflowTemplates({ ...profile, packageScripts: profile.packageScripts || packageJson.scripts }).length
  ) {
    ecosystems.push("github-actions");
  }
  return ecosystems;
}

function composerHasTestScript(targetDir: string): boolean {
  try {
    const composer = JSON.parse(readFileSync(join(targetDir, "composer.json"), "utf8"));
    return Boolean(composer.scripts?.test);
  } catch {
    return false;
  }
}

function renderNodeWorkflow(template: string, profile: GitHubScaffoldProfile): string {
  const manager = profile.packageManager || "npm";
  const setup =
    manager === "bun"
      ? "      - uses: oven-sh/setup-bun@v2\n        with:\n          bun-version: latest"
      : `      - uses: actions/setup-node@v4\n        with:\n          node-version: ${profile.nodeVersion || "22"}${manager === "npm" ? "" : `\n          cache: ${manager}`}`;
  const install =
    manager === "bun"
      ? profile.hasPackageLock
        ? "bun install --frozen-lockfile"
        : "bun install"
      : manager === "pnpm"
        ? `corepack enable && pnpm install${profile.hasPackageLock ? " --frozen-lockfile" : ""}`
        : manager === "yarn"
          ? `corepack enable && yarn install${profile.hasPackageLock ? " --immutable" : ""}`
          : profile.hasPackageLock
            ? "npm ci"
            : "npm install";
  const run = manager === "bun" ? "bun run" : `${manager} run`;
  const scripts = profile.packageScripts || {};
  const commands = ["test", "typecheck", "type-check", "lint", "build"]
    .filter((name, index, names) => scripts[name] && names.indexOf(name) === index)
    .map((name) => `      - name: ${name}\n        run: ${run} ${name}`)
    .join("\n");
  return template
    .replace("{{NODE_SETUP}}", setup)
    .replace("{{NODE_INSTALL}}", install)
    .replace("{{NODE_CHECKS}}", commands || '      - run: echo "No recognized verification scripts are configured"');
}

function renderPythonWorkflow(template: string): string {
  return template;
}

function renderComposerWorkflow(template: string, profile: GitHubScaffoldProfile): string {
  const testStep = profile.composerTestScript
    ? "      - name: Run Composer test script\n        run: composer test"
    : "";
  return template.replace("{{COMPOSER_TEST}}", testStep);
}

function renderDependabot(template: string, profile: GitHubScaffoldProfile): string {
  const entries = (profile.dependencyEcosystems || [])
    .map(
      (ecosystem) => `  - package-ecosystem: "${ecosystem}"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5`,
    )
    .join("\n");
  return template.replace(
    "{{DEPENDABOT_ECOSYSTEMS}}",
    entries || "  # No supported dependency ecosystem detected; add one when the stack is selected.",
  );
}

function copyRenderedFile(
  source: string,
  destination: string,
  profile: GitHubScaffoldProfile,
  dryRun: boolean,
): boolean {
  if (existsSync(destination)) return false;
  const content = readFileSync(source, "utf8");
  const rendered = source.endsWith("ci-node.yml")
    ? renderNodeWorkflow(content, profile)
    : source.endsWith("ci-python.yml")
      ? renderPythonWorkflow(content)
      : source.endsWith("ci-composer.yml")
        ? renderComposerWorkflow(content, profile)
        : source.endsWith("dependabot.yml")
          ? renderDependabot(content, profile)
          : renderGitHubTemplate(content, profile);
  if (!dryRun) {
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, rendered, "utf8");
  }
  return true;
}

function filesBelow(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesBelow(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

export function scaffoldGitHubAssets(targetDir: string, hints: GitHubScaffoldProfile = {}): GitHubScaffoldResult {
  const result: GitHubScaffoldResult = {
    created: [],
    skipped: [],
    removed: [],
    confirmationRequired: false,
    hostUnknown: false,
  };
  if (!existsSync(TEMPLATES_DIR)) return result;
  const pkg = readPackageJson(targetDir);
  const profile = workflowContext(targetDir, hints);
  const repository = targetRepository(targetDir, pkg, hints.repositoryUrl);
  result.repository = repository;
  const origin = spawnSync("git", ["remote", "get-url", "origin"], { cwd: targetDir, encoding: "utf8" });
  const rawPackageRepository = pkg.repository?.url || pkg.repository;
  const hasPackageRepository = typeof rawPackageRepository === "string" && Boolean(rawPackageRepository.trim());
  const packageRepository = packageRepositoryUrl(pkg);
  const githubOrigin = origin.status === 0 ? parseGitHubRemote(origin.stdout) : undefined;
  const hostKnown = origin.status === 0 || hasPackageRepository || hints.githubProject !== undefined;
  const isGitHubProject =
    origin.status === 0
      ? Boolean(githubOrigin)
      : hints.githubProject !== undefined
        ? hints.githubProject
        : Boolean(packageRepository);
  const workflowsDir = join(targetDir, ".github/workflows");

  if (!hostKnown) {
    result.hostUnknown = true;
    result.skipped.push("GitHub assets (host unknown; ask before scaffolding)");
    return result;
  }

  if (!isGitHubProject && existsSync(workflowsDir)) {
    if (!hints.removeWorkflowsConfirmed) {
      result.confirmationRequired = true;
      result.skipped.push(".github/workflows (non-GitHub origin; confirm removal first)");
    } else {
      for (const file of filesBelow(workflowsDir)) {
        result.removed.push(relative(targetDir, file));
        if (!hints.dryRun) rmSync(file);
      }
    }
  }
  if (!isGitHubProject) return result;

  for (const source of filesBelow(TEMPLATES_DIR)) {
    const sourceRelative = relative(TEMPLATES_DIR, source).replaceAll("\\", "/");
    if (sourceRelative.startsWith("workflows/")) continue;
    const destination = join(targetDir, ".github", sourceRelative);
    if (sourceRelative === "dependabot.yml" && profile.dependencyEcosystems?.length === 0) {
      result.skipped.push(relative(targetDir, destination));
      continue;
    }
    if (copyRenderedFile(source, destination, profile, Boolean(hints.dryRun))) {
      result.created.push(relative(targetDir, destination));
    } else {
      result.skipped.push(relative(targetDir, destination));
    }
  }

  const changelogSource = join(TEMPLATES_DIR, "../CHANGELOG.md");
  const changelogDestination = join(targetDir, "CHANGELOG.md");
  if (
    existsSync(changelogSource) &&
    copyRenderedFile(changelogSource, changelogDestination, profile, Boolean(hints.dryRun))
  ) {
    result.created.push("CHANGELOG.md");
  } else if (existsSync(changelogDestination)) {
    result.skipped.push("CHANGELOG.md");
  }

  const selectedWorkflows = selectGitHubWorkflowTemplates(profile);
  for (const workflow of selectedWorkflows) {
    const source = join(TEMPLATES_DIR, "workflows", workflow);
    const name =
      workflow === "cli-test.yml"
        ? "cli-test.yml"
        : workflow === "ci-python.yml" && selectedWorkflows.includes("ci-node.yml")
          ? "ci-python.yml"
          : workflow === "ci-composer.yml"
            ? "ci-php.yml"
            : "ci.yml";
    const destination = join(workflowsDir, name);
    if (existsSync(source) && copyRenderedFile(source, destination, profile, Boolean(hints.dryRun))) {
      result.created.push(relative(targetDir, destination));
    } else if (existsSync(destination)) {
      result.skipped.push(relative(targetDir, destination));
    }
  }

  return result;
}
