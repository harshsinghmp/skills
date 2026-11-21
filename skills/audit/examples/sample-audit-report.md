# Sample Brain Audit Report

Worked example of the v1.1.0 output format (Standard mode). Content is
illustrative; every claim in a real report must carry file:line evidence.

```markdown
# 🧠 Brain Audit Report — 2026-09-08

**Mode:** Standard | **Files scanned:** 42 | **Links extracted:** 186

## 📶 Step Ledger
- step 2/7 ✓ extracted 186 links + 37 code-block paths from 42 files
- step 3/7 ✓ 183 valid, 3 dead; 2 orphans; 1 frontmatter defect
- step 4/7 ✓ 1 live secret pattern; 2 version contradictions
- step 5/7 ✓ 4 auto-repaired, 2 proposed, 2 report-only, 1 routed
- step 6/7 ✓ re-scan: 0 remaining critical, 1 remaining warning (gated)
- step 7/7 ✓ report written to brain-audit-report.md

## 🚨 Critical Blockers
- `docs/quickstart.md:41` — live token matching `ghp_[A-Za-z0-9]{20,}`
  — class: `PROPOSE-DIFF` — status: ⛔ awaiting permission to mask;
  rotation recommended (credential is compromised regardless of masking)

## ⚠️ Warnings & 🔍 Notices
- `CONTRIBUTING.md:18` — dead link `docs/setup.md` (renamed to
  `docs/install.md` in v2.4.0) — class: `AUTO-REPAIR` — status: ✅ fixed
- `README.md:230` — anchor `#when-to-use` does not match slug
  `#when-to-use-1` — class: `AUTO-REPAIR` — status: ✅ fixed
- `audit/references/hygiene-rules.md` — orphan (zero incoming links)
  — class: `PROPOSE-DIFF` — status: ⛔ propose linking from SKILL.md → References
- `AGENTS.md:12` — states suite version 2.4.0; `package.json` says 2.6.0
  — class: `REPORT-ONLY` — status: 🤝 routed to `updateagents`
  (governed document; analyze and report only)

## 🔁 Remediation Delta

| Checkpoint      | Found | Fixed | Proposed | Deferred | Remaining |
|:----------------|------:|------:|---------:|---------:|----------:|
| Link Integrity  |     3 |     2 |        1 |        0 |         0 |
| Orphaned Notes  |     2 |     0 |        1 |        1 |         1 |
| Contradictions  |     2 |     0 |        0 |        2 |         2 |
| Secret Leakage  |     1 |     0 |        1 |        0 |         1 |
| Frontmatter     |     1 |     1 |        0 |        0 |         0 |

## 🤝 Recommended Companion Handoffs
- `updateagents` → AGENTS.md version drift in governed agent context
  (fallback: report exact proposed edit, leave decision to user)
- `updatedocs` → orphaned reference doc needs index integration
  (fallback: same)
- `dead-letter` → third occurrence of "renamed doc breaks CONTRIBUTING"
  suggests missing rename SOP; generate retry packet

## ✅ Certification
Blocked: 1 critical blocker (live credential at docs/quickstart.md:41)
awaiting user permission and credential rotation. Owner: repository
maintainer. All other checkpoints certified.
```

---

## Condensed Form (Quick mode)

```markdown
# 🧠 Brain Audit — docs/install.md (Quick)

**Mode:** Quick | **Files scanned:** 1 | **Links extracted:** 9

- 8 valid, 1 dead: `references/setup.md` → `references/install.md` ✅ fixed
- Secret scan: clean · Frontmatter: valid
- Routing: none
- Certification: ✅ hygiene certified (1/1 checkpoints re-verified)
```
