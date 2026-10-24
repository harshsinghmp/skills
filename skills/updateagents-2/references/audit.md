# audit — updateagents audit mode

## When to Use

- **Repository AI-readiness audit**: grade the full agent-context surface of a repository against the 13 tracked assets and the 4-tier matrix, without writing anything.
- **Post-sync verification**: confirm a sync actually left curated content intact and the registry/standards state coherent.
- **Onboarding diligence**: before wiring a new repository into the agency, know exactly what is missing and how bad it is.

## The 13 tracked assets, graded

Grade each asset on the 4-tier matrix (0 absent · 1 stub · 2 partial · 3 canonical), and record the evidence path for every non-zero grade — a grade without an artifact path is an assertion, not an audit.

| # | Asset | What "canonical" means |
|:--|:---|:---|
| 1 | Root `AGENTS.md` | Engine-marked or hand-authored with the router sentinel; no template boilerplate |
| 2 | `.agents/context/current.md` | Shipped state + verified reality, dated |
| 3 | `.agents/context/decisions.md` | Dated decision entries with rationale |
| 4 | `.agents/brand/*` | All brand docs the context index advertises, present and non-empty |
| 5 | `.agents/standards/` | Curated standards only; no unrelated canon injected |
| 6 | `.agents/context/imported-agent-instructions.md` | Legacy rules preserved with source-path provenance |
| 7 | `CODE_OF_CONDUCT` / `CONTRIBUTING` / `SECURITY` | Present in established repos, never re-provisioned |
| 8 | `CHANGELOG.md` (+ mirror) | Released sections dated with compare links |
| 9 | Issue/PR templates + `dependabot.yml` | Present and consistent with branch policy |
| 10 | `skills.json` registry | Every entry's `path` resolves; version parity with SKILL.md |
| 11 | Test/verification contract | Gates exist and actually run (lint, type-check, test) |
| 12 | Branch policy | Integration branch protected with required checks |
| 13 | Secrets posture | Zero credentials in tracked files; `.env` ignored |

## Procedure

1. Grade all 13 assets; record evidence path per grade.
2. Classify each gap: `missing` / `stub` / `drifted` (exists but contradicts reality — cite the contradiction).
3. Emit the remediation plan ordered by blast radius (secrets > branch policy > registry parity > docs).
4. Register findings in `.agents/context/current.md` — the next sync starts from this state.

## Rules

- Read-only by default: an audit never writes. Remediation belongs to a follow-up `--sync` run.
- Curated-vs-canon divergences are **reported**, never resolved silently (preserve-not-regenerate).
- Do not treat the engine's own generated files as findings of "drift" — they are destinations, not sources.

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Secrets posture failure | `CRITICAL` | rotate + purge before any other work |
| Registry parity break (`path` unresolved) | `REQUEST-CHANGES` | fix `skills.json` before shipping |
| Asset graded 0–1 on a shipped department | `REPORT-ONLY` | `updateagents --sync` plan |
| Curated file diverges from canon | `REPORT-ONLY` | preserve; ask the owner |

## Sources

- this skill's own 13-asset / 4-tier grading matrix (SKILL.md) — the audit's grading authority
- `skills/references/audit-mode-guidance.md` — the suite's canonical audit-mode spec (severity classes, remediation action classes, companion routing)
