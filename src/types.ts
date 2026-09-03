export type UpstreamHost = "github" | "git";

export interface UpstreamSource {
  repo: string;          // e.g. "obra/superpowers" or a full git URL for non-GitHub hosts
  branch?: string;       // default: resolved default branch ("main"/"master")
  sourcePath: string;    // subpath in upstream repo, e.g. "skills/test-driven-development"
  host?: UpstreamHost;   // "github" (default) uses API/raw acceleration; "git" uses pure git protocol
}

export type SkillCategory =
  | "engineering"
  | "creative"
  | "delivery"
  | "governance"
  | "cognitive"
  | "marketing"
  | "general";

export interface SkillEntry {
  name: string;
  category: SkillCategory;
  description: string;
  upstream?: UpstreamSource;
  tags?: string[];
  version?: string;
  /** Set when the entry was auto-registered from repo-level discovery. */
  autoAdded?: boolean;
}

export interface SkillsManifest {
  $schema?: string;
  version: string;
  lastUpdated?: string;
  description: string;
  skills: SkillEntry[];
}

export interface UpstreamMeta {
  upstream: string;
  branch: string;
  sourcePath: string;
  syncedSha: string;
  syncedAt: string;
}

/** A skill directory detected inside an upstream repository. */
export interface DiscoveredSkill {
  /** Directory name in the upstream repo, e.g. "test-driven-development". */
  dirName: string;
  /** Repo-relative path to the skill directory, e.g. "skills/test-driven-development". */
  path: string;
  /** Description parsed from the skill's SKILL.md frontmatter, when available. */
  description?: string;
  /** Name declared in the SKILL.md frontmatter, when available. */
  declaredName?: string;
}

export interface DiscoveryResult {
  repo: string;
  branch: string;
  host: UpstreamHost;
  skills: DiscoveredSkill[];
  /** True when the upstream tree listing was truncated and results may be partial. */
  truncated?: boolean;
}

export interface ResolvedSource {
  repo: string;
  branch?: string;
  sourcePath?: string;
  host: UpstreamHost;
  /** True when the URL pointed at the repo root and all skills should be discovered. */
  wholeRepo: boolean;
}

export interface ValidationIssue {
  skill: string;
  type: "error" | "warning";
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  totalSkills: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface SyncOptions {
  dryRun?: boolean;
  filter?: string;
  concurrency?: number;
  token?: string;
  /** Re-run repo-level discovery to register skills newly added upstream. */
  discover?: boolean;
  /** Number of attempts per repository group before giving up (default 2). */
  attempts?: number;
}

export type SyncDetailStatus = "synced" | "unchanged" | "skipped" | "failed" | "added";

export interface SyncReportDetail {
  name: string;
  status: SyncDetailStatus;
  message?: string;
  sha?: string;
}

export interface SyncReport {
  timestamp: string;
  total: number;
  synced: number;
  unchanged: number;
  added: number;
  skipped: number;
  failed: number;
  details: SyncReportDetail[];
}

export interface IngestOptions {
  category?: SkillCategory;
  dryRun?: boolean;
  /** Sync newly registered entries immediately (default true). */
  sync?: boolean;
  token?: string;
}

export interface IngestReport {
  registered: number;
  skipped: number;
  errors: string[];
  entries: { name: string; source: string; description: string }[];
}
