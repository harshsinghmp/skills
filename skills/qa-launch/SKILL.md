---
name: qa-launch
aliases: ["launch-qa", "pre-launch-qa", "release-qa", "qa-gate", "browser-matrix", "regression-check"]
description: "Pre-launch quality gate: cross-browser and device matrix planning, critical-path functional verification, release-gate checklist with Block-or-Ship verdict, and post-fix regression — routed through four modes. Use when asked to QA a site before launch, verify a release candidate, plan browser and device coverage, or re-verify after fixes. Not for fixing code (webdev), auditing UI visuals (refactor-ui), or deploying (devops)."
argument-hint: "[matrix|functional|gate|regression]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 35
  aliases: ["launch-qa", "pre-launch-qa", "release-qa", "qa-gate", "browser-matrix", "regression-check"]
  suggested_skills: ["webdev", "mobile", "refactor-ui", "devops", "code-review"]
  hermes:
    tags: ["qa", "launch-qa", "quality-gate", "cross-browser", "device-matrix", "functional-testing", "release-gate", "regression", "verification", "block-or-ship"]
    related_skills: ["webdev", "mobile", "refactor-ui", "devops", "code-review"]
    suggested_skills: ["webdev", "mobile", "refactor-ui", "devops", "code-review"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["webdev", "mobile", "refactor-ui", "devops", "code-review"]
    primary_triggers: ["QA a site before launch", "verify a release candidate", "browser and device coverage", "release gate checklist", "Block-or-Ship verdict", "re-verify after fixes", "regression check", "pre-launch quality gate"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🛡️ qa-launch — Pre-Launch Quality Gate

One head skill for launch QA. Verify before you ship: plan the coverage, walk the critical paths, gate the release with a verdict, then re-verify after fixes. This skill finds and reports defects — it never fixes them; fixes route to the owning skill.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **matrix** | "browser coverage", "device matrix", "what should we test on" | Cross-browser and device matrix plan from audience and analytics | [references/matrix.md](references/matrix.md) |
| **functional** | "QA this site", "verify the release candidate", "walk the critical paths" | Critical-path functional verification with pass/fail evidence | [references/functional.md](references/functional.md) |
| **gate** | "ready to ship?", "release gate", "block or ship", "launch checklist" | Release-gate checklist ending in a Block-or-Ship verdict | [references/gate.md](references/gate.md) |
| **regression** | "re-verify after fixes", "regression check", "did the fix break anything" | Post-fix regression: fixed issues plus adjacent blast radius | [references/regression.md](references/regression.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Planning browser and device coverage before a launch.
- Verifying a release candidate against its critical paths.
- Running a release-gate checklist with a ship/no-ship verdict.
- Re-verifying after fixes with a regression pass.

### Anti-Triggers

- Fixing the defects found → `webdev` (code), `mobile` (apps).
- Auditing UI visuals, spacing, or polish → `refactor-ui`.
- Deploying or rolling back the release → `devops`.
- Measuring launch results after ship → `analytics`.

---

## Quick Reference

### Routing ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'What should we test on?' | matrix |
| 'Does the release candidate work?' | functional |
| 'Are we cleared to ship?' | gate |
| 'Did the fixes hold without breaking anything?' | regression |

Order: matrix → functional → gate → regression. Plan coverage, verify, verdict, then re-verify.

### Verification gate (every mode)

- The scope names exact browsers, devices, and critical paths covered.
- Every failure has reproduction steps and environment evidence.
- The verdict is explicit: Ship or Block, with blocking issues listed.
- Fixes are routed, never applied — this skill changes no product code.

### Suite contracts

- Fixing defects → `webdev` / `mobile`.
- Visual defects → `refactor-ui`.
- Deploying the gated release → `devops`.
- Rigorous diff review of fixes → `code-review`.

---

## Procedure

1. **Intake.** establish the release candidate, the scope, and the ship date before verifying anything — QA without a frozen candidate tests a moving target.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Testing a moving candidate — freeze the build before functional and gate.
- Boiling the ocean — critical paths first; exhaustive coverage is a matrix output, not a first pass.
- Verdict with no blocking-issue list — a Block nobody can act on.
- Fixing defects inline instead of routing them — scope creep and unverified fixes.
- Skipping regression after fixes — the fix works and two neighbors break.
- Environment-vague failures — no browser, version, viewport, or steps means no fix.

---

## Verification

- [ ] Exactly one mode resolved and its reference playbook followed end to end.
- [ ] Coverage scope names browsers, devices, and critical paths explicitly.
- [ ] Every failure ships with steps, expected-vs-actual, and environment.
- [ ] The deliverable ends in an explicit Ship or Block verdict.
- [ ] No product code changed — all fixes routed to the owning skill.
- [ ] Post-fix work closed with a regression pass, not a spot check.
