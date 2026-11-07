# Remediation Matrix & Routing Boundaries

Companion reference for `audit` v1.1.0. Maps every audit checkpoint to a
severity, a default remediation action class, and its hard boundaries.
The SKILL.md carries the summary; this file carries the full mapping.

---

## Checkpoint → Severity → Action Class

| Checkpoint | Finding | Severity | Default Class | Notes |
|:---|:---|:---|:---|:---|
| 1. Link Integrity | Dead relative link to a moved/renamed file | ⚠️ Warning | `AUTO-REPAIR` | Resolve the real target before editing; if ambiguous, `PROPOSE-DIFF` |
| 1. Link Integrity | Dead link to a file deleted without replacement | ⚠️ Warning | `PROPOSE-DIFF` | Choosing archive vs. removal is an editorial decision |
| 1. Link Integrity | Broken core navigation (index → main sections) | 🚨 Critical | `AUTO-REPAIR` | Repair immediately; log file:line evidence |
| 1. Link Integrity | Broken external URL | 🔍 Notice | `REPORT-ONLY` | Network reachability is out of scope; record and move on |
| 2. Orphaned Notes | Knowledge file with zero incoming links | 🔍 Notice | `PROPOSE-DIFF` / `DEFER-ROUTE` | Propose an index link; route archival candidates to the routing table |
| 3. Stale Contradictions | Two documents state different facts | ⚠️ Warning | `REPORT-ONLY` | The auditor does not decide which document is true; evidence decides |
| 3. Stale Contradictions | Version string drift vs `package.json` | ⚠️ Warning | `AUTO-REPAIR` | Only when the correct value is directly verifiable from the manifest |
| 4. Secret Leakage | Live credential pattern in any markdown | 🚨 Critical | `PROPOSE-DIFF` | Never auto-mask; recommend rotation; gate the edit on explicit permission |
| 4. Secret Leakage | Credential already inside a code-fence guard pattern / fixture | 🔍 Notice | `REPORT-ONLY` | Verify context before classifying as live |
| 5. Frontmatter Health | Missing required frontmatter key | ⚠️ Warning | `AUTO-REPAIR` | Fill from verifiable repo facts only; never invent values |
| 5. Frontmatter Health | Malformed YAML delimiters | ⚠️ Warning | `AUTO-REPAIR` | Restore delimiters; re-parse to verify |

---

## Hard Boundaries (all action classes)

1. `.memory/**` — never read, write, or repair. Owned exclusively by `musememory`.
2. `.agents/**` — governance container. Structural mutations require explicit user
   permission; `.agents/artifacts/` progress logs are the only standing exception.
3. Generated files (`*.gen.*`, lockfiles, build output) — `REPORT-ONLY` by definition.
4. `LICENSE` — `REPORT-ONLY` unless the user explicitly requests changes.
5. History records (released changelog sections, accepted ADRs) — `REPORT-ONLY`;
   supersede with new records, never rewrite.

## Route-Then-Repair Rule

When a finding's owning document is governed by another workflow
(`AGENTS.md` → `updateagents`, shipped docs → `updatedocs`), route instead of
repairing. Route first, then repair locally only what no companion owns.
If the companion skill is not installed, report the exact proposed change and
leave execution to the user.
