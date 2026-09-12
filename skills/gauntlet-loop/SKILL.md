---
name: gauntlet-loop
aliases: ["gauntlet","quality-loop","verification-loop"]
description: "Bounded multi-agent quality improvement loop that prevents infinite iterations, self-grading delusions, and regression churn. Orchestrates Builder, Fresh Critic, Automated Gate (with web application security headers and visual breakpoint audit), and Integrator roles with strict stop conditions (proof of passing, 2-round score plateau, regression, or max iteration budget). Generates GAUNTLET_JOB_CONTRACT.md, ITERATION_LEDGER.md, and ACCEPTANCE_PACKET.md."
version: 1.2.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: quality-review
metadata:
  skill_orchestration:
    pre: ["code-review"]
    post: ["git"]
    optional: ["secretary"]
  category: quality-review
  priority: 9
  aliases: ["gauntlet","quality-loop","verification-loop"]
  suggested_skills: ["code-review","refactor-ui","secretary","git"]
  hermes:
    tags: [gauntlet, quality-loop, multi-agent, verification, benchmarking, orchestration, governance, security-headers, visual-regression, owasp, responsive-testing]
    related_skills: [code-review, refactor-ui, secretary, git]
    suggested_skills: [code-review, refactor-ui, secretary, git]
    requires_tools: [bash, view_file, write_to_file, replace_file_content, run_command]
  openclaw:
    category: quality-review
    suggested_skills: [code-review, refactor-ui, secretary, git]
    primary_triggers: ["run gauntlet","start quality loop","adversarial refinement","bounded iteration loop"]
    requires_tools: [bash, view_file, write_to_file, replace_file_content, run_command]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🛡️ Gauntlet Loop — Bounded Multi-Agent Quality Improvement Loop

> A deterministic, bounded quality improvement loop that eliminates infinite token burns, self-grading delusions, and regression churn. Deploys an unyielding, 4-role protocol (Freeze → Build → Fresh Critic → Automated Gate → Integrator) with hard mathematically enforced termination boundaries, OWASP security header verification, and multi-viewport visual regression gates.

---

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Multi-Round Code/Doc Refinement**: A complex task requires iterative quality improvement across multiple passes.
2. **Preventing Self-Grading Delusion**: The builder agent must NOT evaluate its own output; an isolated *Fresh Critic* must score the work against frozen criteria.
3. **Web Application Hardening Gate**: Iterating on web apps, frontend templates, or API servers requiring strict security headers (CSP, HSTS) and responsive viewport checks (375px, 768px, 1280px).
4. **Hard Stop Boundaries Required**: Guarding against runaway agent loops where changes oscillate or degrade previous passes.
5. **Mission-Critical Delivery**: High-stakes deliverables requiring an ironclad `ACCEPTANCE_PACKET.md`.

### Anti-Triggers
Do NOT use this skill when:
- The task is a trivial one-liner fix or typo correction (use direct editing).
- The task is exploratory research without a concrete deliverable (use research subagent).
- Task dependencies are heavily coupled and unsplit (run [`coupling-router`](../coupling-router/SKILL.md) first).

---

## Quick Reference

### The 4 Gauntlet Roles & Blind Reference Bar

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────────────┐       ┌─────────────────┐
│     BUILDER     │ ────▶ │  FRESH CRITIC   │ ────▶ │       AUTOMATED GATE        │ ────▶ │   INTEGRATOR    │
│ Minimal, clean  │       │ Blind audit vs  │       │ Tests, types, secret scans, │       │ Merges ONLY the │
│ diff candidate  │       │ NAMED REAL BAR  │       │ security headers & viewports│       │ #1 largest fix  │
└─────────────────┘       └─────────────────┘       └─────────────────────────────┘       └─────────────────┘
```

### 🎯 "The Bar is the Whole Trick" Doctrine

The loop only produces quality if the thing it compares against is **real**:
- **Named**: A specific entity, not an abstract category (*"Nike's running landing page"*, not *"modern athletic sites"*).
- **Fetchable**: The critic can obtain the raw reality (live URL screenshot, published article, test suite).
- **Comparable**: Both artifacts can sit side-by-side so a judge can pick a winner.

| Goal Type | Concrete Passing Bar | Measurable Half |
| :--- | :--- | :--- |
| **Web Apps & UI** | Live site of named best-in-class product screenshotted at 375px & 1440px. | Zero layout shift, CSP/HSTS headers, zero horizontal scroll overflow. |
| **Code & CLI Tools** | Top-tier open source repository implementation (e.g. Bun, Ripgrep, Hono). | Benchmark latency, memory footprint, 100% test pass rate. |
| **Writing & Essays** | Specific published article by named author (e.g. Julia Evans, Paul Graham). | Reading grade level, clarity score, word count parity. |
| **System Research** | Named industry whitepaper or peer-reviewed methods section. | Citation count, empirical receipts, falsifiable claims. |

### Stop Conditions Matrix

| Condition | Trigger Rule | Action |
| :--- | :--- | :--- |
| **✅ Proof of Passing** | All automated tests green + Critic score $\ge 9.0/10$ + zero blockers + security/visual gates pass | **TERMINATE (SUCCESS)** → Output `ACCEPTANCE_PACKET.md` |
| **🛑 Score Plateau** | 2 consecutive rounds without net score improvement ($\Delta \le 0$) | **TERMINATE (PLATEAU)** → Emit Dead-Letter escalation |
| **📉 Score Regression** | Round score drops by $> 1.0$ point or automated tests break | **REVERT** to previous round baseline & halt |
| **⏳ Budget Exhaustion** | Reaches `max_iterations` (default: 3 rounds, hard max: 5) | **TERMINATE (BUDGET)** → Deliver current best checkpoint |
| **👤 Human Override** | Explicit user halt or steering directive | **HALT** immediately |

### Web Application Automated Gate Checklist

When evaluating web endpoints or frontend components:
- **Security Headers (OWASP)**: CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Responsive Viewports**: Tested at `375px` (mobile), `768px` (tablet), `1280px` (desktop) for zero horizontal scrollbar overflow (`scrollWidth === innerWidth`).

---

## Procedure

### Option A: Autonomous Multi-Role Execution Loop

#### Step 1 — Set the Real Bar & Freeze the Job Contract (`GAUNTLET_JOB_CONTRACT.md`)
1. **Name the Bar**: If the user supplied a reference, use it. If not, offer **2 or 3 candidate bars** (one line each) and wait for their pick.
2. **Lock Contract**: Record in workspace root:
   - **Goal**: Precise, measurable objective statement.
   - **Concrete Bar**: Named fetchable reference artifact.
   - **Acceptance Criteria**: 3–5 binary checkboxes + OWASP security headers + responsive viewports.
   - **Automated Proof Commands**: Pinned commands (`bun test`, `tsc --noEmit`, `SecretScan.ts`, curl header audits).
   - **Iteration Budget**: Max rounds (default 3, hard ceiling 5).

#### Step 2 — Round Execution Loop (with Blind A/B Critique)
```
Round N (N = 1..max_rounds):
  1. BUILD: Builder produces candidate patch based strictly on previous round critic feedback.
  2. AUDIT (Blind A/B): Spawn isolated Fresh Critic subagent with NO memory of builder reasoning.
     - Strip labels from candidate and bar.
     - Put candidate next to the bar blind; judge which is better and name the single biggest remaining gap.
     - Score 0.0–10.0 across: Correctness (40%), Minimal Diff (25%), Edge Cases (20%), Architecture (15%).
  3. GATE: Run automated proof suite AND integrity checks AND Web App Security & Visual Gate:
     - Check 5 mandatory security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
     - Check 3 responsive viewports (375px, 768px, 1280px) for zero horizontal overflow.
     - **Quality-bar regression check**: scan the round's diff for a lowered bar — new suppression directives, skipped or deleted tests, weakened assertions, thresholds edited down. Any of these zeroes the round score (0.0): a build that passes because the bar was lowered is a regression, not a pass.
     - **Fail-closed eval check**: confirm the proof suite contains at least one test that CAN fail on the defect class the round claims to fix. If nothing in the suite could have caught the defect, a green run proves nothing — the round does not pass until a capable test exists (write it, watch it fail on the pre-fix state).
     - Any test failure, missing critical security header, visual overflow, quality-bar regression, or failed fail-closed check zeroes the round score (0.0).
  4. RECORD: Append round metrics, header receipts, viewport outcomes, and finding counts (new findings vs fixed findings this round) to ITERATION_LEDGER.md — the ledger is the convergence instrument: when new findings outnumber fixed findings two rounds running, the loop is diverging, not converging — stop and escalate instead of burning the remaining budget.
  5. DECIDE: Evaluate Stop Conditions Matrix.
```

#### Step 3 — Integrator Gate
The Integrator agent NEVER merges bulk diffs. It isolates and applies **only the single highest-impact delta** that directly improved the score, preserving all previously verified baselines.

#### Step 4 — Acceptance Packet Synthesis (`ACCEPTANCE_PACKET.md`)
Upon reaching success termination, compile the final artifact:
- Summary of rounds executed and score trajectory ($R_1 \rightarrow R_N$).
- Verbatim execution receipts of automated proof commands, security headers, and viewport checks.
- Verified diff summary and signature.

---

### Option B: Gauntlet Prompt Synthesizer Mode
When the user asks to *"make a gauntlet prompt"* or *"loop until it beats X"*, craft ONE short, paste-ready prompt (120–180 words):
1. **Set the Bar**: Name a concrete, fetchable reference.
2. **Break into Pieces**: Smallest judgeable components.
3. **Blind Critic Directive**: Fresh critic puts output next to the bar blind with labels stripped and names the #1 biggest gap.
4. **Offer to Run**: Append flat line: `I can run this here.`

---

## Pitfalls

- **Self-Grading Bias**: Never allow the builder subagent to evaluate its own work. The critic MUST run in an isolated conversation context.
- **Overlooking Security Headers**: Shipping web apps or APIs with missing CSP or HSTS headers.
- **Horizontal Scroll Blowout**: Failing to audit the 375px mobile viewport for layout blowouts.
- **Diff Bloat Across Iterations**: Reject candidates that expand the diff surface by $>30\%$ without a proportional score increase.
- **Ignoring Score Plateau**: If round 2 scores 7.5 and round 3 scores 7.4, STOP immediately. Do not attempt round 4.
- **Lowered-Bar Green**: Passing the gate by suppressing, skipping, or weakening checks in the same diff — the gate measures the artifact, not the artifact's ability to evade measurement.
- **Vacuous Green**: Accepting a green proof suite that contains no test capable of failing on the round's defect class — an unevaluatable claim is not a pass; add the capable test first.

---

## Verification

Before declaring gauntlet completion:
1. [ ] `GAUNTLET_JOB_CONTRACT.md` exists with frozen acceptance criteria.
2. [ ] `ITERATION_LEDGER.md` logs every round with objective critic score breakdown.
3. [ ] All automated proof commands exit with return code `0`.
4. [ ] Web applications pass security header audit (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
5. [ ] Multi-viewport visual check passes at 375px, 768px, and 1280px with zero horizontal overflow.
6. [ ] `ACCEPTANCE_PACKET.md` is generated with final verification receipts.
