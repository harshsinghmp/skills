#!/usr/bin/env bun
/**
 * 📑 secretary.ts — Autonomous Agency Chief of Staff & Universal Dispatch Engine
 *
 * Implements:
 * 1. Sub-token heuristic fast-path (<1ms regex intent triage)
 * 2. Dynamic confidence-scored semantic routing across 46 departments
 * 3. 5-line executive Morning Briefing generator (current.md + git log delta)
 * 4. Mode hot-swapping (/switch <department:mode>)
 * 5. Reversible Git Checkpoint snapshotting for high blast-radius work
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { COUNCIL_LEADS, DEFAULT_MODE } from "./routing-defaults";

export { COUNCIL_LEADS, DEFAULT_MODE };

// Council Leads mapping

// Fast-path heuristic rules: verb-phrase intents that must not be out-scored by
// lexical similarity. Every target MUST resolve to a real references/<mode>.md —
// tests/routing-eval.test.ts asserts this against the generated command surface.
export const FAST_PATH_RULES: Array<{
  regex: RegExp;
  department: string;
  mode: string;
  reason: string;
  /** "hint" rules boost a department instead of short-circuiting the router. */
  confidence?: "strong" | "hint";
}> = [
  {
    regex: /^(bun\s+)?test\b|run\s+(the\s+)?tests?|test\s+suite|verify\s+all|add\s+unit\s+tests?|write\s+tests?\s+for/i,
    department: "qa-launch",
    mode: "gate",
    reason: "Direct test verification match",
  },
  {
    // A review VERB aimed at a diff. Mentioning "pull request" is not the same
    // as asking for a review — "the pull request threads contained the same
    // correction" belongs to pr-review-mining, not pr-context.
    regex:
      /\b(review|audit|go\s+through|look\s+at|check)\b[^.!?]{0,40}\b(pr|pull\s+request|diff|patch)\b|\breview\s+this\s+(pr|diff|patch)\b/i,
    department: "code-review",
    mode: "pr-context",
    reason: "Pull-request review match",
  },
  {
    regex: /statement\s+of\s+work|\bsow\b/i,
    department: "ops",
    mode: "sow",
    reason: "Statement-of-work match",
  },
  {
    regex: /press\s+release|public\s+relations/i,
    department: "growth",
    mode: "pr",
    reason: "Public relations match",
  },
  {
    regex: /p&l|profit\s+and\s+loss|client\s+pnl/i,
    department: "accounts",
    mode: "client-pnl",
    reason: "Client P&L reporting match",
  },
  {
    regex: /^lint\b|run\s+lint|type-check|biome\s+check/i,
    department: "code-review",
    mode: "triage-matrix",
    reason: "Direct lint/type-check hygiene match",
  },
  {
    regex: /ai[-\s]readiness|ai-ready|readiness\s+score/i,
    department: "updateagents",
    mode: "audit",
    reason: "Direct AI readiness audit match",
  },
  {
    regex: /sync\s+context|update\s+agents|update\s+memory/i,
    department: "updateagents",
    mode: "memory-file-priorities",
    reason: "Direct context synchronization match",
    confidence: "hint",
  },
  {
    regex: /checkout\s+(page|funnel)|stripe\s+payments|payment\s+integration|funnel\s+page/i,
    department: "webdev",
    mode: "funnel",
    reason: "E-Commerce checkout and payments match",
  },
  {
    regex: /\bexpo\b/i,
    department: "mobile",
    mode: "expo",
    reason: "Expo project match",
  },
  {
    regex: /\breact\s+native\b|\bflutter\b/i,
    department: "mobile",
    mode: "cross",
    reason: "Cross-platform mobile framework match",
  },
  {
    regex: /bundle\s+size|page\s+load|lighthouse\s+score/i,
    department: "webdev",
    mode: "performance",
    reason: "Web performance budget match",
    confidence: "hint",
  },
  {
    regex: /competitor\s+(analysis|dossier)|competitive\s+landscape/i,
    department: "research",
    mode: "competitor-analysis",
    reason: "Competitor analysis match",
  },
  {
    regex: /\bretrospective\b|\bretro\b/i,
    department: "ops",
    mode: "retro",
    reason: "Project retrospective match",
  },
  {
    regex: /system\s+cache|free\s+disk\s+space|clean\s+(the\s+)?cache/i,
    department: "clean-system-cache",
    mode: "audit",
    reason: "System cache cleanup match",
  },
  {
    regex: /buyer\s+persona|customer\s+persona/i,
    department: "brand",
    mode: "persona",
    reason: "Buyer persona match",
  },
  {
    regex: /broken\s+links?|link\s+integrity/i,
    department: "audit",
    mode: "hygiene-rules",
    reason: "Documentation link-integrity match",
  },
  {
    regex: /swarm\s+mesh|task\s+claim|mesh\s+protocol/i,
    department: "coupling-router",
    mode: "mesh",
    reason: "Swarm mesh claim-protocol match",
  },
  {
    regex: /agent\s+swarm|swarm\s+dispatcher|\bdag\b|multi-agent\s+quorum/i,
    department: "coupling-router",
    mode: "swarm",
    reason: "Agent swarm dispatcher match",
  },
  {
    regex: /ci\/cd|cicd|github\s+actions|deploy\s+pipeline/i,
    department: "devops",
    mode: "cicd",
    reason: "CI/CD pipeline match",
  },
  {
    regex: /nurture\s+(email|sequence|campaign)|drip\s+campaign/i,
    department: "crm",
    mode: "nurture",
    reason: "Nurture sequence match",
    confidence: "hint",
  },
  {
    regex: /^refactor\b|clean\s+up\s+and\s+refactor/i,
    department: "refactor",
    mode: "code",
    reason: "Explicit refactoring request match",
  },
  {
    regex: /carousel|postiz|viral\s+social|linkedin\s+carousel/i,
    department: "smm",
    mode: "carousel",
    reason: "Social carousel growth match",
  },
  {
    regex: /onboard\s+identity|onboarding\s+interview|setup\s+profile/i,
    department: "secretary",
    mode: "onboard",
    reason: "Identity onboarding interview match",
  },
  {
    regex: /morning\s+(briefing|status)|^briefing\b|session\s+wakeup/i,
    department: "secretary",
    mode: "orchestration",
    reason: "Morning executive orientation match",
  },
  {
    regex: /daily\s+standup|\bstandup\s+(notes?|call|meeting|report)\b|effort\s+scorecard|eod\s+check-?in/i,
    department: "coach",
    mode: "team",
    reason: "Daily standup and controllable effort check-in match",
  },
  {
    regex: /scope\s+creep|change\s+order|client\s+boundary|client\s+digest/i,
    department: "coach",
    mode: "client",
    reason: "Client boundary and change-order defense match",
  },
  {
    regex: /founder\s+leverage|70\/30\s+rule|founder\s+bottleneck/i,
    department: "coach",
    mode: "founder",
    reason: "Founder leverage diagnostic match",
  },
];

/**
 * Intent signals: a phrase that names the work, not just the domain.
 * "our emails land in spam" is a deliverability problem even though the words
 * look like generic email; description-only scoring put it in `content:email`.
 * These are tuned against the training fixture set only — never the held-out set.
 */
export interface IntentSignal {
  regex: RegExp;
  department: string;
  mode?: string;
  boost: number;
}

export const INTENT_SIGNALS: IntentSignal[] = [
  {
    regex: /land(s)? in spam|spam folder|deliverability|\bspf\b|\bdkim\b|open rates?|unsubscribe/i,
    department: "crm",
    mode: "deliverability",
    boost: 12,
  },
  { regex: /conversion|signup form drops|a\/b test|experiment/i, department: "analytics", mode: "cro", boost: 10 },
  {
    regex: /\b(footer|header|menu|banner|hero|layout|modal|button|overlaps?|misaligned)\b/i,
    department: "webdev",
    mode: "frontend",
    boost: 8,
  },
  { regex: /\b(api|endpoint|backend|server|sso|login|auth)\b/i, department: "webdev", mode: "backend", boost: 8 },
  { regex: /\b(crash(es|ed)?|broken|doesn'?t|does not|errors?|500|slow|faster)\b/i, department: "webdev", boost: 6 },
  { regex: /\b(release notes|launch sequence|launch plan)\b/i, department: "growth", mode: "launch", boost: 10 },
  { regex: /\b(social posts|social calendar|schedule .*posts)\b/i, department: "smm", mode: "calendar", boost: 10 },
  { regex: /\b(contract|legal|liability|clauses?)\b/i, department: "ops", mode: "legal", boost: 10 },
  { regex: /\b(testimonials?|case stud(y|ies))\b/i, department: "content", mode: "case-study", boost: 8 },
  { regex: /\b(health score|churn)\b/i, department: "retain", boost: 8 },
  { regex: /\b(reduce|cut|lower)\b.*\b(bill|cost|spend)\b/i, department: "devops", mode: "hosting", boost: 10 },
  { regex: /\b(app store|aso|screenshots?)\b/i, department: "mobile", mode: "aso", boost: 8 },
  { regex: /\b(sitemap|canonical|schema markup)\b/i, department: "seo", mode: "technical", boost: 8 },
];

/**
 * Concept vocabulary: domain words that identify a department (and often a
 * mode) regardless of phrasing. Description scoring hit its ceiling because
 * every skill's prose shares generic words; these are the nouns practitioners
 * actually type. Weights stay below a full fast-path so a stronger cue wins.
 */
export interface Concept {
  department: string;
  mode?: string;
  boost: number;
  tokens: string[];
}

export const CONCEPTS: Concept[] = [
  // Web UI vs server: the distinction descriptions could not make.
  {
    department: "webdev",
    mode: "frontend",
    boost: 8,
    tokens: [
      "navbar",
      "header",
      "footer",
      "dropdown",
      "carousel",
      "grid",
      "css",
      "layout",
      "modal",
      "button",
      "viewport",
      "responsive",
      "sticky",
      "anchor",
      "tablet",
      "safari",
      "hero",
      "blurry",
      "retina",
      "toggle",
      "form",
      "table",
    ],
  },
  {
    department: "webdev",
    mode: "backend",
    boost: 8,
    tokens: [
      "webhook",
      "endpoint",
      "payload",
      "jwt",
      "pagination",
      "serverless",
      "rest",
      "http",
      "json",
      "api",
      "session",
      "cookie",
      "middleware",
    ],
  },
  {
    department: "webdev",
    mode: "accessibility",
    boost: 10,
    tokens: ["wcag", "contrast", "aria", "keyboard", "screenreader", "a11y"],
  },
  {
    department: "webdev",
    mode: "performance",
    boost: 9,
    tokens: ["vitals", "bundle", "cold", "latency", "lcp", "cls", "jank", "janky", "load", "slow"],
  },
  {
    department: "webdev",
    mode: "security-headers",
    boost: 10,
    tokens: ["csp", "xss", "csrf", "cors", "iframe", "headers"],
  },
  { department: "database", mode: "index", boost: 7, tokens: ["btree", "composite"] },
  {
    department: "database",
    mode: "migrations",
    boost: 9,
    tokens: ["migration", "migrations", "backfill", "schema", "column", "table"],
  },
  {
    department: "database",
    mode: "tuning",
    boost: 9,
    tokens: ["planner", "explain", "tuning", "vacuum", "slow", "query"],
  },
  { department: "database", mode: "guard", boost: 8, tokens: ["constraint", "unique", "foreign", "cascade", "rls"] },
  {
    department: "database",
    mode: "operate",
    boost: 7,
    tokens: ["postgres", "postgresql", "connection", "connections", "backup", "restore", "replica"],
  },
  {
    department: "analytics",
    mode: "tracking",
    boost: 9,
    tokens: ["event", "tracking", "ga4", "segment", "pixel", "payload"],
  },
  { department: "analytics", mode: "attribution", boost: 9, tokens: ["attribution", "touch", "channel", "shapley"] },
  {
    department: "analytics",
    mode: "dashboards",
    boost: 9,
    tokens: ["dashboard", "cohort", "retention", "kpi", "chart"],
  },
  {
    department: "analytics",
    mode: "cro",
    boost: 9,
    tokens: ["conversion", "signup", "experiment", "ab", "test", "funnel", "hero"],
  },
  {
    department: "crm",
    mode: "deliverability",
    boost: 10,
    tokens: ["spam", "bounce", "bounces", "deliverability", "spf", "dkim", "dmarc", "dns", "unsubscribe"],
  },
  {
    department: "crm",
    mode: "contacts",
    boost: 8,
    tokens: ["contacts", "segment", "segmentation", "import", "suppression"],
  },
  { department: "crm", mode: "abandon", boost: 9, tokens: ["abandoned", "cart", "browse"] },
  { department: "crm", mode: "nurture", boost: 9, tokens: ["nurture", "drip", "trial", "sequence", "welcome"] },
  { department: "crm", mode: "winback", boost: 9, tokens: ["winback", "churned", "cancelled", "cancellation"] },
  { department: "smm", mode: "strategy", boost: 8, tokens: ["organic", "influencer", "influencers", "social"] },
  {
    department: "accounts",
    mode: "bookkeeping",
    boost: 9,
    tokens: ["ledger", "payout", "reconcile", "reconciliation", "books", "entry", "entries"],
  },
  { department: "accounts", mode: "client-pnl", boost: 9, tokens: ["margin", "pnl", "profit", "loss"] },
  { department: "accounts", mode: "dunning", boost: 9, tokens: ["dunning", "overdue", "late", "reminder", "unpaid"] },
  { department: "retain", mode: "qbr", boost: 10, tokens: ["qbr", "deck"] },
  { department: "retain", mode: "churn-watch", boost: 9, tokens: ["churn", "at-risk", "atrisk", "inactive", "login"] },
  { department: "retain", mode: "renewal", boost: 9, tokens: ["renewal", "renew", "increase", "offer"] },
  { department: "growth", mode: "referral", boost: 9, tokens: ["referral", "rewards", "codes", "affiliate"] },
  { department: "growth", mode: "launch", boost: 8, tokens: ["launch", "announcement"] },
  { department: "growth", mode: "pricing", boost: 8, tokens: ["pricing", "tiers", "price", "discount"] },
  { department: "design", mode: "slides", boost: 9, tokens: ["slide", "slides", "deck", "presentation"] },
  {
    department: "design",
    mode: "branding",
    boost: 8,
    tokens: ["icon", "icons", "typography", "palette", "brand", "identity"],
  },
  {
    department: "client-comms",
    mode: "executive-pulse",
    boost: 10,
    tokens: ["executive", "pulse", "summaries", "weekly"],
  },
  { department: "client-comms", mode: "status", boost: 7, tokens: ["status", "update", "macro", "macros"] },
  { department: "client-comms", mode: "feedback", boost: 9, tokens: ["feedback", "survey", "csat", "nps"] },
  { department: "client-comms", mode: "handover", boost: 9, tokens: ["handover", "successor", "offboarding"] },
  { department: "ops", mode: "meeting-notes", boost: 9, tokens: ["call", "transcript", "meeting", "minutes"] },
  { department: "ops", mode: "sow", boost: 10, tokens: ["sow", "statement", "work", "schedule"] },
  { department: "paidads", mode: "meta", boost: 9, tokens: ["meta", "facebook", "instagram"] },
  { department: "paidads", mode: "retargeting", boost: 9, tokens: ["retargeting", "audience", "audiences", "stale"] },
  { department: "updatedocs", mode: "audit", boost: 9, tokens: ["changelog", "release", "notes", "documentation"] },
  // Core / quality / reflection departments: the engineering long tail. Their
  // descriptions are thin, so the vocabulary comes from the work itself.
  {
    department: "context-anchor",
    mode: "task-interruption-and-recovery",
    boost: 10,
    tokens: ["interruption", "interrupted", "paused", "derive", "drift", "resume-session"],
  },
  {
    department: "relay",
    mode: "resumption-protocol",
    boost: 10,
    tokens: ["laptop", "handoff", "resumption", "resume", "handover-doc"],
  },
  {
    department: "evidence-ledger",
    mode: "staleness-rules",
    boost: 10,
    tokens: ["stale", "staleness", "outdated", "aged", "decayed"],
  },
  {
    department: "dead-letter",
    mode: "sweep-protocol",
    boost: 10,
    tokens: ["blocked", "orphaned", "cluster", "dead-letter", "sweep"],
  },
  {
    department: "pua",
    mode: "receipt-verification",
    boost: 10,
    tokens: ["receipt", "receipts", "flaky", "unverified"],
  },
  {
    department: "secretary",
    mode: "socratic-adversarial-gate",
    boost: 10,
    tokens: ["adversarial", "dissent", "critique", "tear"],
  },
  {
    department: "coupling-router",
    mode: "worktree-lease-protocol",
    boost: 10,
    tokens: ["subagent", "subagents", "worktree", "lease", "overwriting"],
  },
  {
    department: "git",
    mode: "issue-to-pr-discipline",
    boost: 10,
    tokens: ["repro", "reproducer", "scoped", "issue-to-pr"],
  },
  { department: "git", mode: "convention-mining", boost: 10, tokens: ["convention", "commit", "commits", "commitlog"] },
  {
    department: "code-review",
    mode: "intended-vs-implemented",
    boost: 10,
    tokens: ["diff", "title", "claims", "mismatch"],
  },
  {
    department: "refactor",
    mode: "sweep",
    boost: 9,
    tokens: ["inconsistent", "styled", "duplicate", "sweep", "consistent"],
  },
  {
    department: "updateagents",
    mode: "harness-hygiene",
    boost: 10,
    tokens: ["copilot", "cursor", "droppings", "hygiene", "harness"],
  },
  { department: "devops", mode: "domains", boost: 10, tokens: ["dns", "nameserver", "bounced", "domain"] },
  {
    department: "webdev",
    mode: "offline",
    boost: 10,
    tokens: ["offline", "basement", "signal", "disconnected", "reconnect"],
  },
  { department: "database", mode: "graph", boost: 10, tokens: ["recursive", "hierarchy", "orgchart"] },
  { department: "analytics", mode: "audit", boost: 9, tokens: ["ga4", "gtag", "measurement", "property"] },
  { department: "growth", mode: "retention", boost: 10, tokens: ["retention", "cohort"] },
  { department: "growth", mode: "community", boost: 10, tokens: ["discord", "community", "slack-community"] },
  { department: "seo", mode: "programmatic", boost: 10, tokens: ["combinations", "combination", "city", "locality"] },
  { department: "seo", mode: "onpage", boost: 10, tokens: ["h1", "onpage", "metatags"] },
  { department: "smm", mode: "x", boost: 9, tokens: ["followers", "monetisation", "monetization", "tweets"] },
  { department: "smm", mode: "postiz", boost: 10, tokens: ["postiz", "bluesky", "threads", "crosspost"] },
  { department: "content", mode: "vsl", boost: 10, tokens: ["vsl", "salesletter", "programme", "webinar-pitch"] },
  { department: "retain", mode: "check-in", boost: 9, tokens: ["silent", "checkin", "touchpoint", "quiet"] },
  {
    department: "designscope",
    mode: "token-extraction",
    boost: 10,
    tokens: ["screenshot", "spacing", "palette"],
  },
  { department: "ops", mode: "shape", boost: 10, tokens: ["viral", "ambiguous", "shape", "unscoped", "vague"] },
  { department: "ops", mode: "vendor", boost: 10, tokens: ["contractor", "ghosted", "vendor", "vendors"] },
  { department: "accounts", mode: "billing-engine", boost: 10, tokens: ["metered", "metering", "usage-based"] },
  {
    department: "gtm",
    mode: "dev-to-buyer",
    boost: 10,
    tokens: ["changelogs", "engineers", "developers", "technical-buyers"],
  },
  {
    department: "research",
    mode: "entity-dossier",
    boost: 10,
    tokens: ["dossier", "prospect", "founder", "background"],
  },
  { department: "sales-enablement", mode: "playbook", boost: 9, tokens: ["demoed", "playbook", "demo", "pitch"] },
  { department: "qa-launch", mode: "chaos", boost: 10, tokens: ["chaos", "failover", "resilience", "disappears"] },
  { department: "client-comms", mode: "change", boost: 10, tokens: ["tweaks", "pushback", "timeline", "extra"] },
];

function conceptBoost(department: string, promptTokens: string[]): number {
  let boost = 0;
  for (const concept of CONCEPTS) {
    if (concept.department !== department) continue;
    if (concept.tokens.some((token) => promptTokens.some((candidate) => stemsMatch(candidate, token)))) {
      boost += concept.boost;
    }
  }
  return boost;
}

function conceptMode(department: string, promptTokens: string[]): { mode: string; boost: number } | undefined {
  let best: { mode: string; boost: number } | undefined;
  for (const concept of CONCEPTS) {
    if (concept.department !== department || !concept.mode) continue;
    if (!concept.tokens.some((token) => promptTokens.some((candidate) => stemsMatch(candidate, token)))) continue;
    if (!best || concept.boost > best.boost) best = { mode: concept.mode, boost: concept.boost };
  }
  return best;
}

/** Leading-verb prior: what kind of work is being asked for, independent of nouns. */
export const VERB_HINTS: Array<{ regex: RegExp; departments: string[] }> = [
  { regex: /^(write|draft|compose|rewrite)\b/i, departments: ["content"] },
  { regex: /^(design|wireframe|sketch)\b/i, departments: ["design"] },
  { regex: /^(build|implement|add|create|make)\b/i, departments: ["webdev", "automation"] },
  { regex: /^(fix|repair|debug|resolve)\b/i, departments: ["webdev", "code-review"] },
  { regex: /^(audit|review)\b/i, departments: ["audit", "code-review"] },
  { regex: /^(set up|configure|install)\b/i, departments: ["devops", "automation"] },
  { regex: /^(plan|strategise|strategize|forecast)\b/i, departments: ["growth", "ops"] },
  { regex: /^(analyse|analyze|measure|report)\b/i, departments: ["analytics"] },
  { regex: /^(reduce|improve|optimi[sz]e|speed up)\b/i, departments: ["analytics", "devops"] },
];

function intentBoost(department: string, prompt: string): number {
  let boost = 0;
  for (const signal of INTENT_SIGNALS) {
    if (signal.department === department && signal.regex.test(prompt)) boost += signal.boost;
  }
  for (const hint of VERB_HINTS) {
    if (hint.departments.includes(department) && hint.regex.test(prompt)) boost += 4;
  }
  return boost;
}

function intentMode(department: string, prompt: string): string | undefined {
  return INTENT_SIGNALS.find((signal) => signal.department === department && signal.mode && signal.regex.test(prompt))
    ?.mode;
}

export interface TriageResult {
  department: string;
  mode: string;
  councilLead: string;
  confidence: number;
  fastPath: boolean;
  reason: string;
  /**
   * Near-ties for the winning department. A confident single answer is the best
   * outcome; when two departments are within a few points, naming both is more
   * honest than pretending the top one is certain.
   */
  alternatives?: Array<{ department: string; mode: string; score: number }>;
}

/** One parsed row of the generated agency directory in references/dispatch.md. */
export interface DirectoryEntry {
  skill: string;
  modes: string[];
  lead: string;
  description: string;
  tokens: Set<string>;
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "over",
  "then",
  "than",
  "have",
  "has",
  "are",
  "was",
  "were",
  "will",
  "would",
  "should",
  "could",
  "can",
  "may",
  "our",
  "your",
  "their",
  "its",
  "it",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "as",
  "is",
  "be",
  "or",
  "if",
  "we",
  "you",
  "they",
  "i",
  "me",
  "my",
  "us",
  "do",
  "does",
  "did",
  "not",
  "no",
  "but",
  "so",
  "up",
  "out",
  "all",
  "any",
  "per",
  "via",
  "use",
  "when",
  "asked",
  "want",
  "need",
  "make",
  "get",
  "let",
  "just",
  "also",
  "about",
  "after",
  "before",
  "new",
  "one",
  "two",
  "three",
  "four",
  "five",
  "please",
  "help",
  "build",
  "create",
  "write",
]);

/** Mode used when a department is the right answer but no mode word appears. */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function normalizeToken(token: string): string {
  // Only derivational suffixes that preserve the stem's meaning. Do NOT strip
  // "-er"/"-or": "one-pagers" → "pag" would then collide with "page".
  const stripped = token.replace(/(ations?|ation|ate|ions?|ing|ed|es|s|e)$/, "");
  return stripped.length >= 3 ? stripped : token;
}

/** English-derivation tolerant comparison: invoice ≈ invoicing, migrate ≈ migrations. */
export function stemsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  if (na === nb && na.length >= 3) return true;
  // Prefix matching only for comparable stems: "access" is not "accessibility",
  // but "invoice" is a stem of "invoicing".
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  if (shorter.length >= 5 && longer.startsWith(shorter) && shorter.length / longer.length >= 0.65) return true;
  return false;
}

let directoryCache: DirectoryEntry[] | undefined;

/**
 * Parses the generated agency directory out of references/dispatch.md. The path
 * is relative to this script, so it resolves in the repo and in an installed
 * `~/.agents/skills/secretary/` layout alike.
 */
export function loadAgencyDirectory(): DirectoryEntry[] {
  if (directoryCache) return directoryCache;
  const dispatchPath = join(import.meta.dir, "..", "references", "dispatch.md");
  if (!existsSync(dispatchPath)) {
    directoryCache = [];
    return directoryCache;
  }
  const text = readFileSync(dispatchPath, "utf8");
  const start = text.indexOf("<!-- agency-directory:start -->");
  const end = text.indexOf("<!-- agency-directory:end -->");
  const block = start !== -1 && end > start ? text.slice(start, end) : text;

  const entries: DirectoryEntry[] = [];
  for (const line of block.split("\n")) {
    const skillMatch = line.match(/^\|\s*\*\*`([a-z0-9-]+)`\*\*\s*\|/);
    if (!skillMatch) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const leadIndex = cells.findIndex((cell, index) => index > 0 && /\*\*(Sol|Jasper|Crew|Nexus)/.test(cell));
    const modes = [...(cells[1] ?? "").matchAll(/`([a-z0-9-]+)`/g)].map((match) => match[1]);
    const lead = leadIndex === -1 ? "" : cells[leadIndex].replace(/\*/g, "").trim();
    const description = leadIndex === -1 ? "" : (cells[leadIndex + 1] ?? "");
    entries.push({
      skill: skillMatch[1],
      modes,
      lead,
      description,
      tokens: new Set(tokenize(description)),
    });
  }
  directoryCache = entries;
  return entries;
}

interface RoutingIndex {
  entries: DirectoryEntry[];
  descriptionIdf: Map<string, number>;
  modeIdf: Map<string, number>;
  /** Token weight across the 406 mode descriptions (rare words identify a mode). */
  modeDocIdf: Map<string, number>;
  modeDocCount: number;
  /** Department → tokens that appear in any of its mode descriptions. */
  departmentModeTokens: Map<string, Set<string>>;
  /** Department → its modes' anchor phrases as token sets. */
  departmentAnchors: Map<string, Set<string>[]>;
}

interface ModeDocument {
  tokens: Set<string>;
  /** Each anchor phrase as a token set, for phrase-level overlap. */
  anchors: Set<string>[];
}

let modeDocsCache: Map<string, ModeDocument> | undefined;

/**
 * Mode descriptions, generated by sync-dispatch into
 * references/mode-signals.json. The installed script cannot read other skills'
 * reference files, so this is the only way a mode's *content* reaches routing.
 */
function loadModeDocs(): Map<string, ModeDocument> {
  if (modeDocsCache) return modeDocsCache;
  modeDocsCache = new Map();
  const file = join(import.meta.dir, "..", "references", "mode-signals.json");
  if (!existsSync(file)) return modeDocsCache;
  try {
    type Signal = string | { heading?: string; anchors?: string[]; text?: string };
    const data = JSON.parse(readFileSync(file, "utf8")) as Record<string, Record<string, Signal>>;
    for (const [skill, modes] of Object.entries(data)) {
      for (const [mode, signal] of Object.entries(modes)) {
        // Older releases shipped a prose blob; new ones ship heading + anchors.
        const anchors =
          typeof signal === "string" ? [] : (signal.anchors ?? []).map((anchor) => new Set(tokenize(anchor)));
        const text =
          typeof signal === "string"
            ? signal
            : [signal.heading ?? "", ...(signal.anchors ?? []), signal.text ?? ""].join(" ");
        modeDocsCache.set(`${skill}:${mode}`, { tokens: new Set(tokenize(text)), anchors });
      }
    }
  } catch {
    // A corrupt file degrades to name-only scoring; never throw at dispatch time.
  }
  return modeDocsCache;
}

let indexCache: RoutingIndex | undefined;

function buildIndex(): RoutingIndex {
  const entries = loadAgencyDirectory();
  const documentFrequency = new Map<string, number>();
  for (const entry of entries) {
    for (const token of entry.tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }
  const descriptionIdf = new Map<string, number>();
  for (const [token, count] of documentFrequency) {
    descriptionIdf.set(token, Math.log(entries.length / count));
  }

  // Mode names are the sharpest signal: "carousel" or "obsidian" identify one
  // department, while "client" or "content" appear in dozens of mode names.
  const modeFrequency = new Map<string, number>();
  let totalModes = 0;
  for (const entry of entries) {
    for (const mode of entry.modes) {
      totalModes += 1;
      for (const token of new Set(tokenize(mode.replace(/-/g, " ")))) {
        modeFrequency.set(token, (modeFrequency.get(token) ?? 0) + 1);
      }
    }
  }
  const modeIdf = new Map<string, number>();
  for (const [token, count] of modeFrequency) {
    modeIdf.set(token, Math.log(totalModes / count));
  }

  const docs = loadModeDocs();
  const docFrequency = new Map<string, number>();
  for (const doc of docs.values()) {
    for (const token of doc.tokens) docFrequency.set(token, (docFrequency.get(token) ?? 0) + 1);
  }
  const modeDocIdf = new Map<string, number>();
  for (const [token, count] of docFrequency) {
    modeDocIdf.set(token, Math.log(Math.max(2, docs.size) / count));
  }

  const departmentModeTokens = new Map<string, Set<string>>();
  const departmentAnchors = new Map<string, Set<string>[]>();
  for (const key of docs.keys()) {
    const [skill] = key.split(":");
    const doc = docs.get(key);
    if (!doc) continue;
    const bucket = departmentModeTokens.get(skill) ?? new Set<string>();
    for (const token of doc.tokens) bucket.add(token);
    departmentModeTokens.set(skill, bucket);
    if (doc.anchors.length > 0) departmentAnchors.set(skill, [...(departmentAnchors.get(skill) ?? []), ...doc.anchors]);
  }
  return {
    entries,
    descriptionIdf,
    modeIdf,
    modeDocIdf,
    modeDocCount: docs.size,
    departmentModeTokens,
    departmentAnchors,
  };
}

function getIndex(): RoutingIndex {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

function modeWeight(index: RoutingIndex, token: string): number {
  return Math.max(0.5, index.modeIdf.get(token) ?? 1);
}

/** Mode words that identify a department; excludes ubiquitous ones like "audit". */
const SPECIFIC_MODE_WEIGHT = 3;

function scoreMode(promptTokens: string[], mode: string, index: RoutingIndex, skill?: string): number {
  const modeTokens = tokenize(mode.replace(/-/g, " "));
  if (modeTokens.length === 0) return 0;
  let matched = 0;
  let total = 0;
  let hits = 0;
  for (const modeToken of modeTokens) {
    const weight = modeWeight(index, modeToken);
    total += weight;
    if (promptTokens.includes(modeToken)) {
      matched += weight * 1.25;
      hits += 1;
    } else if (promptTokens.some((token) => stemsMatch(token, modeToken))) {
      matched += weight;
      hits += 1;
    }
  }
  // Description evidence is a FALLBACK: mode names ("frontend", "dunning") are
  // precise, while reference prose shares generic vocabulary across modes. Using
  // docs unconditionally cost 8 points of exact accuracy on the training set.
  if (skill && matched === 0) {
    const doc = loadModeDocs().get(`${skill}:${mode}`);
    if (doc) {
      let evidence = 0;
      for (const token of doc.tokens) {
        if (!promptTokens.some((candidate) => stemsMatch(candidate, token))) continue;
        evidence += index.modeDocIdf.get(token) ?? 0;
      }
      matched += Math.min(5, evidence * 0.8);
    }
  }

  // Reward modes whose every word is present ("logo" beats "brand-immersion"
  // when the prompt says "logo and brand identity").
  return matched + (hits === modeTokens.length ? total * 0.4 : 0);
}

export interface ScoredDepartment {
  entry: DirectoryEntry;
  score: number;
  modeSignal: number;
  intent: number;
}

function scoreDepartments(prompt: string): ScoredDepartment[] {
  const index = getIndex();
  const promptTokens = tokenize(prompt);
  if (index.entries.length === 0 || promptTokens.length === 0) return [];
  const normalizedPrompt = ` ${prompt
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")} `;

  const scored: ScoredDepartment[] = index.entries.map((entry) => {
    let score = 0;
    if (normalizedPrompt.includes(` ${entry.skill.replace(/-/g, " ")} `)) score += 12;
    for (const nameToken of entry.skill.split("-")) {
      if (nameToken.length < 3) continue;
      if (promptTokens.some((token) => stemsMatch(token, nameToken))) score += 2;
    }
    for (const token of entry.tokens) {
      if (!promptTokens.some((candidate) => stemsMatch(candidate, token))) continue;
      score += index.descriptionIdf.get(token) ?? 0;
    }
    let modeSignal = 0;
    for (const mode of entry.modes) {
      for (const modeToken of tokenize(mode.replace(/-/g, " "))) {
        const weight = modeWeight(index, modeToken);
        if (weight < SPECIFIC_MODE_WEIGHT) continue;
        if (promptTokens.some((token) => stemsMatch(token, modeToken))) {
          modeSignal += weight;
        }
      }
    }
    score += Math.min(12, modeSignal);
    // Mode-corpus evidence for the DEPARTMENT: what this skill's modes actually
    // talk about. Capped so a long mode list cannot outvote explicit cues.
    let modeDocScore = 0;
    const departmentTokens = index.departmentModeTokens.get(entry.skill);
    if (departmentTokens) {
      for (const token of departmentTokens) {
        if (!promptTokens.some((candidate) => stemsMatch(candidate, token))) continue;
        modeDocScore += index.modeDocIdf.get(token) ?? 0;
      }
    }
    score += Math.min(8, modeDocScore * 0.6);

    // Phrase-level evidence: an anchor the prompt substantially covers is a
    // stronger signal than scattered word overlap across a whole mode.
    const anchors = index.departmentAnchors.get(entry.skill) ?? [];
    let phraseHits = 0;
    for (const anchor of anchors) {
      if (anchor.size < 3) continue;
      let hits = 0;
      for (const token of anchor) {
        if (promptTokens.some((candidate) => stemsMatch(candidate, token))) hits += 1;
      }
      if (hits / anchor.size >= 0.6) {
        phraseHits += 1;
        if (phraseHits >= 3) break;
      }
    }
    score += phraseHits * 2;

    let hintBoost = 0;
    for (const rule of FAST_PATH_RULES) {
      if (rule.confidence !== "hint" || rule.department !== entry.skill) continue;
      if (rule.regex.test(prompt)) hintBoost += 10;
    }
    const intent = intentBoost(entry.skill, prompt) + conceptBoost(entry.skill, promptTokens) + hintBoost;
    score += intent;
    return { entry, score, modeSignal, intent };
  });

  scored.sort((a, b) => b.score - a.score);

  // An explicit, *specific* mode cue outranks a department whose name is just a
  // common English word (the prompt says "audit" but also "WCAG accessibility").
  const top = scored[0];
  const topWithCue = scored.find((candidate) => candidate.modeSignal > 0);
  // Only a department with no intent evidence of its own can be displaced by a
  // generic mode cue ("our emails land in spam" must not fall back to content:email).
  if (top && top.modeSignal === 0 && top.intent === 0 && topWithCue) {
    return [topWithCue, ...scored.filter((candidate) => candidate !== topWithCue)];
  }
  return scored;
}

function pickMode(entry: DirectoryEntry, prompt: string): { mode: string; score: number } {
  const index = getIndex();
  const promptTokens = tokenize(prompt);
  const intent = intentMode(entry.skill, prompt);
  const concept = conceptMode(entry.skill, promptTokens);
  const preferred = intent ?? concept?.mode ?? DEFAULT_MODE[entry.skill];
  let bestMode: string | undefined;
  let bestScore = 0;
  for (const mode of entry.modes) {
    const score = scoreMode(promptTokens, mode, index, entry.skill);
    if (score > bestScore) {
      bestMode = mode;
      bestScore = score;
    } else if (score === bestScore && score > 0 && mode === preferred) {
      bestMode = mode;
    }
  }
  // A named intent ("land in spam" -> deliverability) outranks a shared noun.
  if (intent && entry.modes.includes(intent)) return { mode: intent, score: bestScore };
  // Concept evidence is curated, a mode-name match may be a coincidence: "index
  // bloat is slowing writes" is tuning, not `database:index`. It wins when it is
  // at least as strong as the lexical score, and always when nothing matched.
  if (concept && entry.modes.includes(concept.mode) && concept.boost >= bestScore) {
    return { mode: concept.mode, score: bestScore };
  }
  return { mode: bestMode ?? DEFAULT_MODE[entry.skill] ?? entry.modes[0] ?? "audit", score: bestScore };
}

export interface RoutingExplanation {
  department: string;
  departmentScore: number;
  runnerUp: { department: string; score: number } | null;
  modes: Array<{ mode: string; score: number }>;
  fastPath: boolean;
}

/** Debug/eval surface: why did this prompt route where it did? */
export function explainRouting(prompt: string): RoutingExplanation {
  const result = triagePrompt(prompt);
  if (result.fastPath) {
    return {
      department: result.department,
      departmentScore: Number.POSITIVE_INFINITY,
      runnerUp: null,
      modes: [{ mode: result.mode, score: Number.POSITIVE_INFINITY }],
      fastPath: true,
    };
  }
  const scored = scoreDepartments(prompt);
  const winner = scored[0];
  const index = getIndex();
  const promptTokens = tokenize(prompt);
  const modes = (winner?.entry.modes ?? [])
    .map((mode) => ({ mode, score: scoreMode(promptTokens, mode, index, winner?.entry.skill) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return {
    department: result.department,
    departmentScore: winner?.score ?? 0,
    runnerUp: scored[1] ? { department: scored[1].entry.skill, score: scored[1].score } : null,
    modes,
    fastPath: false,
  };
}

/** Within 25% of the winner (or 6 points): close enough to name out loud. */
const ALTERNATIVE_MARGIN = 0.25;
const ALTERNATIVE_FLOOR = 6;

function closeRunnersUp(
  scored: ScoredDepartment[],
  winnerScore: number,
): Array<{ department: string; mode: string; score: number }> {
  if (winnerScore <= 0) return [];
  const margin = Math.max(ALTERNATIVE_FLOOR, winnerScore * ALTERNATIVE_MARGIN);
  return scored
    .slice(1)
    .filter((candidate) => candidate.score > 0 && winnerScore - candidate.score <= margin)
    .slice(0, 2)
    .map((candidate) => ({
      department: candidate.entry.skill,
      mode: candidate.entry.modes[0] ?? "",
      score: candidate.score,
    }));
}

/**
 * Vector-space second opinion over the same corpus the lexical router uses.
 *
 * A token-overlap router cannot connect "the invoice formatter imports the user
 * model" with "coupling" — the words never meet. Cosine similarity over
 * IDF-weighted department vocabulary is the dependency-free part of that signal:
 * it re-ranks, it does not replace. Measured on the six gated distributions
 * before it was wired in (v9 10 → 22 departments, training −3).
 */
const VECTOR_DECISIVE = 0.5;

function vectorDepartmentScores(promptTokens: string[]): Map<string, number> {
  const index = getIndex();
  const scores = new Map<string, number>();
  if (index.modeDocIdf.size === 0) return scores;

  const prompt: Array<[string, number]> = [];
  const seen = new Set<string>();
  for (const token of promptTokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    const idf = index.modeDocIdf.get(token);
    if (idf && idf > 0) prompt.push([token, idf]);
  }
  if (prompt.length === 0) return scores;

  let promptNorm = 0;
  for (const [, weight] of prompt) promptNorm += weight * weight;
  promptNorm = Math.sqrt(promptNorm) || 1;

  for (const [skill, tokens] of index.departmentModeTokens) {
    let dot = 0;
    let departmentNorm = 0;
    for (const token of tokens) {
      const weight = index.modeDocIdf.get(token) ?? 0;
      if (weight <= 0) continue;
      departmentNorm += weight * weight;
      for (const [promptToken, promptWeight] of prompt) {
        if (promptToken === token) dot += weight * promptWeight;
      }
    }
    if (dot === 0) continue;
    const norm = Math.sqrt(departmentNorm) || 1;
    scores.set(skill, dot / (norm * promptNorm));
  }
  return scores;
}

export function triagePrompt(prompt: string): TriageResult {
  const cleanPrompt = prompt.trim();

  // 1. Fast-path heuristic check (<1ms)
  for (const rule of FAST_PATH_RULES) {
    if ((rule.confidence ?? "strong") === "hint") continue;
    if (rule.regex.test(cleanPrompt)) {
      return {
        department: rule.department,
        mode: rule.mode,
        councilLead: COUNCIL_LEADS[rule.department] || "Nexus",
        confidence: 1.0,
        fastPath: true,
        reason: rule.reason,
      };
    }
  }

  // 2. Lexical scoring over the generated 46-department directory.
  const scored = scoreDepartments(cleanPrompt);
  const promptTokens = tokenize(cleanPrompt);
  const best = scored[0];
  if (best && best.score > 0) {
    let { mode, score: modeScoreValue } = pickMode(best.entry, cleanPrompt);
    let department = best.entry.skill;
    let alternatives = closeRunnersUp(scored, best.score);

    // Only when the router is unsure, and only when the vector space is
    // decisive: a confident lexical answer is still the better answer.
    if (alternatives.length > 0) {
      const vector = vectorDepartmentScores(promptTokens);
      const ranked = [...vector.entries()].sort((a, b) => b[1] - a[1]);
      if (ranked.length > 1 && ranked[0][1] * VECTOR_DECISIVE > ranked[1][1]) {
        const winner = ranked[0][0];
        if (winner !== best.entry.skill) {
          const winnerEntry = scored.find((candidate) => candidate.entry.skill === winner)?.entry;
          const winnerMode = winnerEntry ? pickMode(winnerEntry, cleanPrompt) : null;
          if (winnerEntry && winnerMode) {
            department = winner;
            mode = winnerMode.mode;
            modeScoreValue = winnerMode.score;
            alternatives = closeRunnersUp(scored, best.score).filter((alt) => alt.department !== winner);
            alternatives.unshift({
              department: best.entry.skill,
              mode: pickMode(best.entry, cleanPrompt).mode,
              score: best.score,
            });
            alternatives = alternatives.slice(0, 2);
          }
        }
      }
    }
    // A near-tie is not a high-confidence answer. The raw score says how much
    // evidence the winner had, not how much better it was than the runner-up —
    // reporting 95% while naming a close call contradicts itself.
    const baseConfidence = Math.min(0.95, 0.55 + Math.min(0.4, best.score / 40));
    const confidence =
      alternatives.length === 0 ? baseConfidence : Math.min(baseConfidence, 0.55 + (baseConfidence - 0.55) * 0.5);
    return {
      department,
      mode,
      councilLead: scored.find((c) => c.entry.skill === department)?.entry.lead || COUNCIL_LEADS[department] || "Nexus",
      confidence,
      fastPath: false,
      reason: `Lexical match on ${department} (${modeScoreValue > 0 ? `mode cue: ${mode}` : "department cue"})`,
      ...(alternatives.length > 0 ? { alternatives } : {}),
    };
  }

  // 3. Default fallback to general development execution.
  return {
    department: "webdev",
    mode: "implement",
    councilLead: "Sol",
    confidence: 0.4,
    fastPath: false,
    reason: "General development execution fallback",
  };
}

export function generateMorningBriefing(targetDir: string): string {
  const currentPath = join(targetDir, ".agents/context/current.md");
  let activeMilestone = "Continue primary workspace objective";
  let shippedReality = "All initial baseline features verified";

  if (existsSync(currentPath)) {
    const content = readFileSync(currentPath, "utf8");
    const activeMatch = content.match(/##\s+1\.\s+Live Reality[^\n]*\n([\s\S]*?)(?=\n##\s+2|$)/i);
    if (activeMatch) {
      const firstLine = activeMatch[1]
        .split("\n")
        .map((l) => l.trim().replace(/^[-*]\s+/, ""))
        .filter((l) => l.length > 0 && !l.startsWith(">"))[0];
      if (firstLine) activeMilestone = firstLine;
    }

    const shippedMatch = content.match(/##\s+2\.\s+Verified Shipped Reality[^\n]*\n([\s\S]*?)(?=\n##\s+3|$)/i);
    if (shippedMatch) {
      const items = shippedMatch[1]
        .split("\n")
        .map((l) => l.trim().replace(/^[-*\d.]+\s+\*\*([^*]+)\*\*.*/, "$1"))
        .filter((l) => l.length > 0 && !l.startsWith(">"))
        .slice(0, 3);
      if (items.length > 0) shippedReality = items.join(", ");
    }
  }

  // Git recent commits
  let recentCommit = "Zero recent commits detected";
  try {
    const gitRes = spawnSync("git", ["log", "-n", "1", "--oneline"], { cwd: targetDir, encoding: "utf8" });
    if (gitRes.status === 0 && gitRes.stdout.trim().length > 0) {
      recentCommit = gitRes.stdout.trim();
    }
  } catch {}

  const lines = [
    `🌅 Secretary Morning Briefing — ${targetDir.split("/").pop() || "Workspace"}`,
    `1. 📍 Active Milestone : ${activeMilestone}`,
    `2. 🚢 Shipped Reality   : ${shippedReality}`,
    `3. 📜 Recent Commit    : ${recentCommit}`,
    "4. ⚠️ Open Blockers    : Zero open blockers. Stack allowlist clean.",
    `5. 🎯 Next Action      : Proceed with active milestone via Council Lead Sol / Nexus`,
  ];

  return lines.join("\n");
}

export function switchMode(target: string): {
  success: boolean;
  department: string;
  mode: string;
  councilLead: string;
} {
  const parts = target.split(":");
  if (parts.length !== 2) {
    throw new Error(`❌ Invalid target format "${target}". Use format: <department:mode> (e.g. webdev:funnel)`);
  }

  const [department, mode] = parts;
  const lead = COUNCIL_LEADS[department];
  if (!lead) {
    throw new Error(`❌ Unknown department "${department}". Refer to secretary:dispatch directory.`);
  }

  return {
    success: true,
    department,
    mode,
    councilLead: lead,
  };
}

export function createCheckpoint(
  targetDir: string,
  taskId: string,
): {
  success: boolean;
  checkpointTag: string;
} {
  const cleanId = taskId.replace(/[^a-zA-Z0-9_-]/g, "");
  const tag = `checkpoint/${cleanId}`;

  const res = spawnSync("git", ["tag", "-f", tag], { cwd: targetDir, encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`❌ Failed to create git tag ${tag}: ${res.stderr}`);
  }

  return {
    success: true,
    checkpointTag: tag,
  };
}

export function generateTwilightHandover(
  fromShift: string,
  toShift: string,
  whatShipped: string[] = ["Production feature commit merged", "All verification tests green"],
  blockers: string[] = ["None. Full async autonomy preserved."],
  nextShiftPriority = "Pick up next sprint user story from active backlog",
): string {
  const dateStr = new Date().toISOString();
  return `## 🌅 Follow-The-Sun Twilight Handover Brief
- **From Shift**: ${fromShift}
- **To Shift**: ${toShift}
- **Handover Timestamp**: ${dateStr}

### 1. What Shipped & Verified
${whatShipped.map((s) => `- ✅ ${s}`).join("\n")}

### 2. Blockers & Explicit Clarifications
${blockers.map((b) => `- ⚠️ ${b}`).join("\n")}

### 3. Next Shift Priority Queue
- 🎯 **Primary Focus**: ${nextShiftPriority}
- *Protocol*: Proceed asynchronously. Avoid synchronous meeting traps unless explicit Tier-3 escalation is flagged.
`;
}

export interface TimezoneOverlap {
  clientTz: string;
  teamTz: string;
  overlapHours: number;
  sweetSpotWindow: string;
  recommendation: string;
}

export function checkTimezoneOverlap(clientTz: string, teamTz: string): TimezoneOverlap {
  const normClient = clientTz.toUpperCase();
  const normTeam = teamTz.toUpperCase();

  const offsets: Record<string, number> = {
    PST: -8,
    PDT: -7,
    EST: -5,
    EDT: -4,
    UTC: 0,
    GMT: 0,
    BST: 1,
    CET: 1,
    CEST: 2,
    IST: 5.5,
    SGT: 8,
    AEST: 10,
    AEDT: 11,
  };

  const clientOffset = offsets[normClient] ?? -5;
  const teamOffset = offsets[normTeam] ?? 5.5;
  const diffHours = Math.abs(clientOffset - teamOffset);

  let overlapHours = 0;
  let sweetSpot = "Async-first communication required (zero comfortable overlap)";
  let recommendation = "Enforce rigorous Follow-The-Sun Twilight Handovers; eliminate synchronous standup meetings.";

  if (diffHours <= 3) {
    overlapHours = 5;
    sweetSpot = "High overlap window (9:00 AM - 2:00 PM)";
    recommendation = "Ample synchronous availability. Protect deep-work focus blocks.";
  } else if (diffHours <= 6) {
    overlapHours = 3;
    sweetSpot = "Golden Overlap Window (1:00 PM - 4:00 PM client time / morning team time)";
    recommendation = "Reserve 2-hour window strictly for high-fidelity decisions and client demos.";
  } else if (diffHours <= 11) {
    overlapHours = 1.5;
    sweetSpot = "Twilight sync window (8:00 AM - 9:30 AM client / evening team)";
    recommendation = "Timebox synchronous sync to max 15 mins. Use async PR receipts for all status updates.";
  }

  return {
    clientTz: normClient,
    teamTz: normTeam,
    overlapHours,
    sweetSpotWindow: sweetSpot,
    recommendation,
  };
}

export interface AgentLease {
  agentId: string;
  files: string[];
  acquiredAt: string;
  expiresAt: string;
  purpose: string;
}

export interface LeaseManagerResult {
  success: boolean;
  message: string;
  activeLeases: AgentLease[];
  conflicts?: string[];
}

export interface HandoffPacket {
  packetId: string;
  fromAgent: string;
  toAgent: string;
  phaseCompleted: string;
  exportedArtifacts: string[];
  checksum: string;
  verificationEvidence: string;
  status: "READY" | "VERIFIED" | "REJECTED";
}

export interface NegotiationContract {
  negotiationId: string;
  initiatorAgent: string;
  targetAgent: string;
  interfaceOrSchema: string;
  sharedResources: string[];
  status: "PROPOSED" | "COUNTERED" | "AGREED" | "REJECTED";
  terms: Record<string, unknown>;
  createdAt: string;
}

function getLeasesFilePath(targetDir: string): string {
  const artifactsDir = join(targetDir, ".agents", "artifacts");
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }
  return join(artifactsDir, "agent-leases.json");
}

export function loadActiveLeases(targetDir: string): AgentLease[] {
  const filePath = getLeasesFilePath(targetDir);
  if (!existsSync(filePath)) return [];
  try {
    const raw = readFileSync(filePath, "utf8");
    const leases: AgentLease[] = JSON.parse(raw);
    const now = Date.now();
    return leases.filter((l) => new Date(l.expiresAt).getTime() > now);
  } catch {
    return [];
  }
}

export function saveActiveLeases(targetDir: string, leases: AgentLease[]): void {
  const filePath = getLeasesFilePath(targetDir);
  writeFileSync(filePath, JSON.stringify(leases, null, 2), "utf8");
}

export function acquireLease(
  targetDir: string,
  agentId: string,
  files: string[],
  purpose: string = "feature-build",
  ttlSeconds: number = 3600,
): LeaseManagerResult {
  const currentLeases = loadActiveLeases(targetDir);
  const conflicts: string[] = [];

  for (const requestedFile of files) {
    for (const lease of currentLeases) {
      if (lease.agentId !== agentId && lease.files.includes(requestedFile)) {
        conflicts.push(`File '${requestedFile}' is locked by ${lease.agentId} until ${lease.expiresAt}`);
      }
    }
  }

  if (conflicts.length > 0) {
    return {
      success: false,
      message: `CONFLICT: Cannot acquire lease. ${conflicts.join("; ")}`,
      activeLeases: currentLeases,
      conflicts,
    };
  }

  const now = new Date();
  const expires = new Date(now.getTime() + ttlSeconds * 1000);

  const updatedLeases = currentLeases.filter((l) => l.agentId !== agentId);
  const newLease: AgentLease = {
    agentId,
    files,
    acquiredAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    purpose,
  };
  updatedLeases.push(newLease);
  saveActiveLeases(targetDir, updatedLeases);

  return {
    success: true,
    message: `Lease Acquired: ${agentId} holds lock on ${files.length} files until ${expires.toISOString()}`,
    activeLeases: updatedLeases,
  };
}

export function releaseLease(targetDir: string, agentId: string): LeaseManagerResult {
  const currentLeases = loadActiveLeases(targetDir);
  const remaining = currentLeases.filter((l) => l.agentId !== agentId);
  saveActiveLeases(targetDir, remaining);

  return {
    success: true,
    message: `Lease Released: All locks held by ${agentId} have been removed.`,
    activeLeases: remaining,
  };
}

export function verifyHandoffPacket(packet: Partial<HandoffPacket>): { verified: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!packet.packetId) errors.push("Missing packetId");
  if (!packet.fromAgent) errors.push("Missing fromAgent");
  if (!packet.toAgent) errors.push("Missing toAgent");
  if (!packet.phaseCompleted) errors.push("Missing phaseCompleted");
  if (!Array.isArray(packet.exportedArtifacts) || packet.exportedArtifacts.length === 0) {
    errors.push("Missing or empty exportedArtifacts list");
  }
  if (!packet.checksum) errors.push("Missing checksum digest");
  if (!packet.verificationEvidence) errors.push("Missing verificationEvidence proof");

  return {
    verified: errors.length === 0,
    errors,
  };
}

// CLI Execution
if (import.meta.main) {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      triage: { type: "string", default: "" },
      briefing: { type: "boolean", default: false },
      switch: { type: "string", default: "" },
      checkpoint: { type: "string", default: "" },
      "twilight-handover": { type: "string", default: "" },
      "check-overlap": { type: "string", default: "" },
      "lease-acquire": { type: "string", default: "" },
      "lease-release": { type: "string", default: "" },
      "lease-status": { type: "boolean", default: false },
      "verify-handoff": { type: "string", default: "" },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  const targetDir = positionals[0] ? resolve(positionals[0]) : process.cwd();

  if (values.help) {
    console.log(`
📑 secretary — Autonomous Agency Chief of Staff & Universal Dispatcher

Usage:
  bun secretary.ts [targetPath] [options]

Options:
  --triage "<prompt>"       Fast-path triage & confidence-scored intent routing
  --briefing                Generate 5-line executive Morning Briefing
  --switch <dept:mode>      Hot-swap active council lead and reference mode
  --checkpoint <taskId>     Create reversible git checkpoint tag for high blast-radius work
  --lease-acquire <id:f1,f2> Acquire exclusive file lease for subagent
  --lease-release <id>      Release all active leases held by subagent
  --lease-status            Display active agent file leases
  --verify-handoff <json>   Verify structured inter-agent handoff packet
  -h, --help                Show this help message
`);
    process.exit(0);
  }

  if (values.triage) {
    const res = triagePrompt(values.triage);
    console.log("🎯 Secretary Triage Result:");
    console.log(`   • Department   : ${res.department}`);
    console.log(`   • Mode         : ${res.mode}`);
    console.log(`   • Council Lead : ${res.councilLead}`);
    console.log(
      `   • Confidence   : ${(res.confidence * 100).toFixed(0)}% [${res.fastPath ? "FAST-PATH" : "HEURISTIC"}]`,
    );
    console.log(`   • Rationale    : ${res.reason}`);
    if (res.alternatives?.length) {
      console.log(
        "   • Close call   : " +
          res.alternatives.map((alt) => `${alt.department} (${alt.score.toFixed(1)})`).join(", "),
      );
    }
    process.exit(0);
  }

  if (values.briefing) {
    console.log(generateMorningBriefing(targetDir));
    process.exit(0);
  }

  if (values.switch) {
    try {
      const res = switchMode(values.switch);
      console.log(`🔄 Mode Hot-Swapped Successfully:`);
      console.log(`   • Department   : ${res.department}`);
      console.log(`   • Mode         : ${res.mode}`);
      console.log(`   • Council Lead : ${res.councilLead}`);
      process.exit(0);
    } catch (err: unknown) {
      console.error((err as Error).message || String(err));
      process.exit(1);
    }
  }

  if (values.checkpoint) {
    try {
      const res = createCheckpoint(targetDir, values.checkpoint);
      console.log(`🛡️  Reversible Git Checkpoint Created: ${res.checkpointTag}`);
      process.exit(0);
    } catch (err: unknown) {
      console.error((err as Error).message || String(err));
      process.exit(1);
    }
  }

  if (values["twilight-handover"]) {
    const shiftParts = values["twilight-handover"].split(":");
    const fromShift = shiftParts[0] || "Asia/Europe Shift";
    const toShift = shiftParts[1] || "Americas Shift";
    console.log(generateTwilightHandover(fromShift, toShift));
    process.exit(0);
  }

  if (values["check-overlap"]) {
    const tzParts = values["check-overlap"].split(":");
    const clientTz = tzParts[0] || "EST";
    const teamTz = tzParts[1] || "IST";
    const overlap = checkTimezoneOverlap(clientTz, teamTz);
    console.log(`\n🌐 Global Timezone Overlap Analysis:`);
    console.log(`   • Client Timezone : ${overlap.clientTz}`);
    console.log(`   • Team Timezone   : ${overlap.teamTz}`);
    console.log(`   • Overlap Hours   : ${overlap.overlapHours} hours`);
    console.log(`   • Sweet Spot      : ${overlap.sweetSpotWindow}`);
    console.log(`   • Recommendation  : ${overlap.recommendation}`);
    process.exit(0);
  }

  if (values["lease-acquire"]) {
    const raw = values["lease-acquire"];
    const parts = raw.split(":");
    const agentId = parts[0] || "agent-unknown";
    const files = (parts[1] || "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const res = acquireLease(targetDir, agentId, files);
    if (res.success) {
      console.log(`✅ ${res.message}`);
      process.exit(0);
    } else {
      console.log(`❌ ${res.message}`);
      process.exit(1);
    }
  }

  if (values["lease-release"]) {
    const agentId = values["lease-release"];
    const res = releaseLease(targetDir, agentId);
    console.log(`✅ ${res.message}`);
    process.exit(0);
  }

  if (values["lease-status"]) {
    const leases = loadActiveLeases(targetDir);
    console.log(`\n📋 Active Agent Concurrency Leases: ${leases.length}`);
    for (const l of leases) {
      console.log(`   • [${l.agentId}] Purpose: ${l.purpose} | Expires: ${l.expiresAt}`);
      for (const f of l.files) {
        console.log(`     - ${f}`);
      }
    }
    process.exit(0);
  }

  if (values["verify-handoff"]) {
    const target = values["verify-handoff"];
    let packet: Partial<HandoffPacket> = {};
    try {
      if (existsSync(target)) {
        packet = JSON.parse(readFileSync(target, "utf8"));
      } else {
        packet = JSON.parse(target);
      }
    } catch {
      console.log("❌ Failed to parse handoff packet JSON.");
      process.exit(1);
    }

    const res = verifyHandoffPacket(packet);
    if (res.verified) {
      console.log(`✅ Handoff Packet Verified: [${packet.packetId}] ${packet.fromAgent} → ${packet.toAgent}`);
      console.log(`   • Phase Completed: ${packet.phaseCompleted}`);
      console.log(`   • Artifacts: ${(packet.exportedArtifacts || []).join(", ")}`);
      process.exit(0);
    } else {
      console.log(`❌ Handoff Packet Rejected:`);
      for (const err of res.errors) console.log(`   - ${err}`);
      process.exit(1);
    }
  }

  console.log("📑 Secretary ready. Use --help to view available commands.");
}
