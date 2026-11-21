# Anti-Slop Issue & PR Triage Guide

This reference defines the non-negotiable classification rules and review gates for issues and pull requests handled by the `git` skill.

---

## 1. The 9-Tier Issue Classification Taxonomy

Before any code is written or any branch is created, every issue or task must be classified into exactly one of these nine tiers:

| Classification | Use When | Required Evidence | Safe Action |
| :--- | :--- | :--- | :--- |
| `actionable-bug` | The report describes a reproducible product failure. | Exact repro steps, failing test, error output with secrets redacted. | Proceed to feature/fix branch (`fix/*`). |
| `actionable-docs` | The report identifies missing, stale, or conflicting documentation. | Current doc path plus desired corrected source of truth. | Proceed to docs branch (`docs/*`) or integrate via `updatedocs`. |
| `actionable-feature` | The request matches project direction and has clear acceptance criteria. | Issue link, user problem statement, concrete acceptance shape. | Proceed to feature branch (`feat/*`). |
| `duplicate` | Another issue or PR already covers the same user-visible outcome. | Link to canonical issue/PR and note any extra evidence. | Cross-link canonical reference; close with polite rationale. |
| `spam-or-promotion` | The content is promotional, irrelevant, or abusive. | Summary excerpt of title/body. | Close immediately per repository policy. |
| `generated-slop-or-hallucinated` | The request or PR is mechanically generated, names APIs/files that don't exist, or lacks real reasoning. | Diff/path examples, missing symbols, unverifiable claims. | Request a narrow reproducer or close with rationale. |
| `unsafe-or-security-sensitive` | The report exposes secrets, credentials, exploit details, or dangerous scripts. | Redacted summary, link to security policy. | Escalate to private security path; do NOT post public details. |
| `not-reproducible-yet` | The claim might be valid but lacks enough evidence to reproduce. | Missing runtime version, environment, expected vs actual behavior. | Ask for reproducer details; do NOT write speculative code. |
| `externally-blocked` | Progress depends on third-party services, APIs, or unavailable human credentials. | Name blocking upstream dependency and owner gate. | Defer with a concrete unblock condition. |

---

## 2. Issue Intake Gate

Every issue triage pass must answer:
1. What is the classification?
2. If actionable, what is the exact minimal fix/implementation scope?
3. If not actionable, what evidence would change the classification?
4. Are credentials, tokens, or private customer data present that must be scrubbed?

---

## 3. Pull Request Review Gate

Every PR review pass must verify:
1. Is the PR a merge candidate, request-changes candidate, duplicate, or generated slop?
2. What reproducible evidence supports that decision (test results, diff review)?
3. Were all automated test suites and linters run locally and green?
4. Does the PR resolve a concrete actionable issue or roadmap milestone?
5. Does the PR introduce any unrequested orthogonal changes, refactors of adjacent code, or modified comments? If yes, demand removal (Karpathy Surgical Changes rule).
