export interface UpstreamSource {
  repo: string;          // e.g. "obra/superpowers" or "harshsinghmp/muse-skills"
  branch?: string;       // default: "main" or "master"
  sourcePath: string;    // subpath in upstream repo, e.g. "skills/test-driven-development"
}

export interface SkillEntry {
  name: string;
  category: "engineering" | "creative" | "delivery" | "governance" | "cognitive" | "marketing" | "general";
  description: string;
  upstream?: UpstreamSource;
  tags?: string[];
  version?: string;
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
}

export interface SyncReport {
  timestamp: string;
  total: number;
  synced: number;
  skipped: number;
  failed: number;
  details: {
    name: string;
    status: "synced" | "skipped" | "failed";
    message?: string;
    sha?: string;
  }[];
}
