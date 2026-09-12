---
name: audit
aliases: ["brain-audit","memory-audit","knowledge-audit"]
description: "Knowledge hygiene and referential integrity auditor for AI agent memory banks, documentation trees, and knowledge bases. Audits memory stores, .memory/wiki/, and project documentation for dead links, broken symbol references, orphaned notes, leaked credentials, and stale contradictions, then remediates through a severity-routed repair loop with per-step progress reporting and companion-skill routing. Generates brain-audit-report.md."
version: 1.1.1
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: reflection-maintenance
metadata:
  skill_orchestration:
    pre: ["context-anchor"]
    post: ["dead-letter", "updatedocs"]
    optional: ["updateagents", "evidence-ledger"]
  category: reflection-maintenance
  priority: 18
  aliases: ["brain-audit","memory-audit","knowledge-audit"]
  suggested_skills: ["updatedocs","updateagents","evidence-ledger","dead-letter","ai-ready","coach","periodic-retreat"]
  hermes:
    tags: [knowledge-audit, memory-hygiene, link-integrity, docs-validation, dead-links, secret-scan, ref-integrity, remediation, routing]
    related_skills: [updatedocs, updateagents, evidence-ledger, dead-letter, ai-ready, coach, periodic-retreat]
    suggested_skills: [updatedocs, updateagents, evidence-ledger, dead-letter, ai-ready, coach, periodic-retreat]
    requires_tools: [bash, view_file, grep, glob, write_to_file, replace_file_content]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [updatedocs, updateagents, evidence-ledger, dead-letter, ai-ready, coach, periodic-retreat]
    primary_triggers: ["audit knowledge base","check markdown dead links","audit memory hygiene","brain audit","fix broken documentation links"]
    requires_tools: [bash, view_file, grep, glob, write_to_file, replace_file_content]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🧠 Brain Audit — Knowledge Hygiene & Referential Integrity Auditor

> Systematically audits agent memory banks, `.agents/context/`, `.memory/wiki/`, and documentation trees. Detects dead markdown links, broken symbol references, orphaned memory notes, leaked credentials, and stale contradictory statements — then closes the loop: severity-routed remediation, re-verification, and routing of unresolved findings to companion skills, reported step by step throughout.

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Pre-Release Documentation Audit**: Verifying that all markdown links, table-of-contents anchors, and file references resolve to real files.
2. **Memory Bank Hygiene**: Cleaning up `.memory/wiki/`, `.agents/context/`, or project memory files after extensive multi-agent refactoring.
3. **Preventing Agent Hallucinations**: Stale or broken documentation causes future agents to hallucinate non-existent files or obsolete APIs.
4. **Credential & Secret Sweeps**: Auditing knowledge docs to guarantee zero accidentally pasted API keys or tokens.
5. **Session or Sprint Closeout**: Certifying knowledge hygiene before handing off work, cutting a release, or archiving a session.

### Anti-Triggers
Do NOT use this skill when:
- Writing initial scratch documentation.
- Reviewing pure source code logic without markdown documentation.

---

## Quick Reference

### The 5 Knowledge Audit Checkpoints

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Checkpoint              │ Failure Mode Detected                                  │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Link Integrity       │ 404 dead links, broken local file paths, missing files │
│ 2. Orphaned Notes       │ Files in knowledge tree with zero incoming links       │
│ 3. Stale Contradictions │ Outdated version numbers, renamed skills, obsolete APIs│
│ 4. Secret Leakage       │ Hardcoded `sk-*`, `ghp_*`, or private keys in markdown │
│ 5. Frontmatter Health   │ Invalid YAML delimiters, missing required keys         │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

### Audit Severity Classification

| Severity | Defect Type | Default Action Class |
| :--- | :--- | :--- |
| **🚨 Critical Blocker** | Leaked secrets / credentials or broken core navigation | `PROPOSE-DIFF` (secrets) / `AUTO-REPAIR` (navigation) — repair before release |
| **⚠️ Warning** | Dead relative links or mismatched version strings | `AUTO-REPAIR` with logged evidence |
| **🔍 Notice** | Orphaned markdown file with no incoming references | `PROPOSE-DIFF` or `DEFER-ROUTE` |

### Remediation Action Classes

| Class | Meaning | Boundary |
| :--- | :--- | :--- |
| `AUTO-REPAIR` | Fix directly: link paths, anchor slugs, frontmatter keys, heading levels | Log every edit with file:line evidence; never touch `.memory/**` or `.agents/**` without explicit permission |
| `PROPOSE-DIFF` | Present the exact minimal edit; apply only after user approval | Required for secrets (never auto-mask a live leak), governance docs, and client-facing content |
| `REPORT-ONLY` | Document the finding with evidence and suggested owner | Default for contradictions between documents and for anything owned by another workflow |
| `DEFER-ROUTE` | Log to the routing table for a companion skill | Finding is real but belongs to another skill's mandate |

### Operating Modes

| Mode | Scope | Checkpoints | Output |
|:---|:---|:---|:---|
| **Quick** | One document or one directory touched this session | 1, 4, 5 | Condensed report + routing line |
| **Standard** | Full knowledge tree (`docs/`, root docs, `.agents/context/`) | All 5 | Full report + routing table |
| **Deep** | Standard + `.memory/wiki/` structure review + cross-repo references | All 5 + orphan reachability walk | Full report + persistent progress log |

Mode is selected once at Step 1 and stated in the report. Escalate Quick → Standard when the target document links into the wider tree; never silently de-escalate.

### Companion Skill Routing

Route findings to the skill that owns the fix. If a companion is not installed, do not force-install: report the exact proposed change and leave the decision to the user.

| Finding | Route To |
|:---|:---|
| Broken references or drift inside shipped docs, `CHANGELOG.md` inconsistencies | `updatedocs` |
| Governance gaps in `AGENTS.md` or `.agents/standards/` | `updateagents` |
| Unverifiable or unsourced claims discovered in documentation | `evidence-ledger` |
| Repeated defect class suggesting a broken upstream process | `dead-letter` (retry packet) |
| Audit surfaced repo-hygiene gaps (missing CI, templates, `.gitignore` guards) | `ai-ready` |
| Contradictions that are strategic decisions, not errors | `periodic-retreat` |
| Session hygiene follow-up from audit findings | `coach` |

---

## Procedure

### 📶 Progress Reporting Protocol (applies to Steps 2–6)

Report one status line as each step starts and completes — never run silently, never essay-dump:

```text
audit · step 3/7 → scanning 186 links across 42 files…
audit · step 3/7 ✓ 183 valid, 3 dead
```

In **Deep** mode also append progress to `.agents/artifacts/audit-progress-<date>.md` (create `.agents/artifacts/` if absent; this is an artifacts write, not a governance mutation) so a long audit survives context loss and can be resumed with `context-anchor`.

### Step 1 — Scope Discovery & Mode Selection

Identify all markdown, knowledge, and memory files in workspace:
- `.agents/context/*.md`
- `docs/*.md`
- `README.md`, `llms.txt`, `AGENTS.md`
- `.memory/wiki/**/*.md` (structure review only — see boundaries below)

Select and state the operating mode (Quick / Standard / Deep). The mode determines checkpoint depth and report format.

### Step 2 — Asset Extraction

1. Extract all markdown links: `[Label](target/path.md)`.
2. Extract all HTML anchor tags and code blocks mentioning file paths.
3. Resolve each path relative to its source file location.
4. Test file existence using filesystem probes.

### Step 3 — Integrity Scan

Run Checkpoints 1, 2, and 5: link resolution, orphan detection, frontmatter health. Emit a progress line with valid/dead counts before moving on.

### Step 4 — Secret & Contradiction Scan

Run Checkpoints 3 and 4:
- API token patterns (`sk-[a-zA-Z0-9]{20,}`, `ghp_[a-zA-Z0-9]{20,}`, private keys).
- Version strings, renamed skills, and cross-document contradictions.

**Secrets are `PROPOSE-DIFF` by default**: report the file, line, and pattern matched, and recommend rotation of the exposed credential. Mask with `[REDACTED]` only with explicit user permission — masking a live leak without rotating the credential is false hygiene. Never write found secrets into the report itself.

### Step 5 — Severity-Routed Remediation

For each finding, select the action class from the Remediation Action Classes table (full mapping and boundaries in [references/remediation-matrix.md](references/remediation-matrix.md)):

1. `AUTO-REPAIR` items: apply the minimal edit now and log `fixed` with file:line evidence.
2. `PROPOSE-DIFF` items: present the exact replacement and wait for approval.
3. `REPORT-ONLY` items: record evidence, suspected owner document, and suggested action.
4. `DEFER-ROUTE` items: stage them for the Step 7 routing table.

Never escalate from analysis to modification automatically when a permission boundary exists (`.memory/**`, `.agents/**`, generated files).

### Step 6 — Re-Verification & Certification

Re-run only the checks that failed in Steps 3–4. Emit a delta table:

```text
| Checkpoint   | Found | Fixed | Proposed | Deferred | Remaining |
|:-------------|------:|------:|---------:|---------:|----------:|
| Link Integrity  | 3 | 3 | 0 | 0 | 0 |
| Secret Leakage  | 1 | 0 | 1 | 0 | 1 |
```

Certify hygiene only when Remaining critical blockers = 0. Otherwise state explicitly what blocks certification and who owns the resolution.

### Step 7 — Final Report & Skill Routing (`brain-audit-report.md`)

Generate `brain-audit-report.md` cataloging scope, mode, per-step ledger, findings with evidence, remediation delta, and the routing table. See the worked example in [examples/sample-audit-report.md](examples/sample-audit-report.md). The report ends with a **Recommended Companion Handoffs** section: each routed finding names its target skill, the reason, and — when the companion is absent — the fallback action to report the proposed change to the user instead.

---

## Output Format

```markdown
# 🧠 Brain Audit Report — <date>

**Mode:** Quick | Standard | Deep | **Files scanned:** N | **Links extracted:** N

## 📶 Step Ledger
- step 2/7 ✓ … - step 6/7 ✓ (one line per step, completed counts)

## 🚨 Critical Blockers
- <finding> — evidence (file:line) — action class — status

## ⚠️ Warnings & 🔍 Notices
- <finding> — evidence — action class — status

## 🔁 Remediation Delta
<Step 6 delta table>

## 🤝 Recommended Companion Handoffs
- `<skill>` → <finding and reason> (fallback: <action if skill not installed>)

## ✅ Certification
<Hygiene certified | Blocked: <reason, owner>>
```

Omit empty sections. In Quick mode, collapse to: scope line, findings with actions, delta, single routing line, certification.

---

## Pitfalls

- **Silent Link Rot**: Assuming that because a link worked last month, it still resolves after a folder reorganization.
- **Ignoring Code Block Filepaths**: Documentation examples often reference renamed scripts (e.g. `scripts/old-name.ts`) that fail when users copy-paste them.
- **Superficial Audits**: Checking only `README.md` while ignoring subfolder references.
- **Scan-and-Stop**: Producing a findings list and ending the session. An audit without remediation, re-verification, or routing is an inventory, not an audit.
- **Silent Repairs**: Applying `AUTO-REPAIR` edits without logging evidence — every repair must be reconstructable from the report.
- **Masking Without Fixing**: `[REDACTED]`-ing a leaked token while the credential stays live. Report, gate on permission, and recommend rotation.

---

## Verification

Before certifying knowledge hygiene:
1. [ ] 100% of relative markdown links resolve to existing files on disk (or every failure has an logged action class and owner).
2. [ ] Zero plaintext secrets or sensitive tokens exist in documentation; any found leak has a rotation recommendation.
3. [ ] All skill versions in docs match `package.json` `"version"`.
4. [ ] Remediation delta table present; Remaining critical blockers = 0 or certification is explicitly blocked with an owner.
5. [ ] `brain-audit-report.md` includes the step ledger and the companion handoff section.
6. [ ] `.memory/**` untouched; `.agents/**` mutated only with explicit permission.

---

## References

- 📐 [Remediation Matrix & Routing Boundaries](references/remediation-matrix.md)
- 🧼 [Knowledge Hygiene Rules](references/hygiene-rules.md)
- 📄 [Sample Brain Audit Report](examples/sample-audit-report.md)
