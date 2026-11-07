# audit — updatedocs audit mode

## When to Use

- **Documentation drift audit**: quantify how far every governed doc has drifted from the code it documents.
- **Pre-release docs gate**: certify link integrity, frontmatter health, and canonical-source uniqueness before a tag is cut.
- **Post-refactor doc sweep**: a refactor moved code — find every doc that silently stopped being true.

## Checklist

- [ ] Every relative markdown link in governed docs resolves to a file on disk (0 dead links)
- [ ] Anchors (`#slug`) match real headings in the target file
- [ ] Version strings in docs match `package.json` `version`
- [ ] Skill names referenced in docs exist in `skills.json` (no renamed/removed ghosts)
- [ ] One canonical source per fact: no doc restates a number another doc already owns
- [ ] `docs/` mirrors match their root originals (CHANGELOG.md ↔ docs/CHANGELOG.md)
- [ ] Historical snapshots (`docs/README-v*.md`) are classified HISTORICAL and excluded from live-doc linting
- [ ] Frontmatter of every governed doc: valid YAML delimiters, required keys present
- [ ] No secrets or personal environment values in any governed doc
- [ ] Drift report graded per doc: CURRENT / STALE / CONTRADICTED — with the code fact that contradicts it

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Dead link in live doc | `AUTO-REPAIR` | resolve against the live tree, rewrite path |
| Version drift (docs ≠ package.json) | `AUTO-REPAIR` | sync the version string |
| Contradicted fact (doc says X, code does Y) | `REPORT-ONLY` | rewrite the section with the code as oracle |
| Two docs owning the same fact differently | `REPORT-ONLY` | pick the canonical owner, mirror the rest |
| Frozen snapshot flagged as live | `REPORT-ONLY` | reclassify HISTORICAL under the ownership model |

## Sources

- `audit` skill (this suite) — link-integrity, secret-scan, and remediation-matrix standards
- `skills/core-engine/updatedocs/references/AUDIT-CHECKLIST.md` — the governed-docs checklist this mode operationalizes
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
