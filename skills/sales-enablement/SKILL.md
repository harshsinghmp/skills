---
name: sales-enablement
aliases: ["sales-enablement", "demo-scripting", "objection-handling", "sales-playbook", "sales-assets"]
description: "Pre-sale sales enablement department: demo scripts and narration, objection-handling handbooks, one-pagers, and sales playbooks — routed through four modes. Use when asked to write a sales demo script, draft objection-handling answers, build a one-pager or leave-behind, or assemble a sales playbook for a client's sales team. Not for proposals or deal terms (ops), outbound pipeline (gtm), or marketing content (content)."
argument-hint: "[demo|objection|one-pager|playbook]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 42
  aliases: ["sales-enablement", "demo-scripting", "objection-handling", "sales-playbook", "sales-assets"]
  suggested_skills: ["growth", "ops", "gtm", "content", "client-comms"]
  hermes:
    tags: ["sales", "sales-enablement", "demo", "objection-handling", "one-pager", "playbook", "pitch", "closing"]
    related_skills: ["growth", "ops", "gtm", "content", "client-comms"]
    suggested_skills: ["growth", "ops", "gtm", "content", "client-comms"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["growth", "ops", "gtm", "content", "client-comms"]
    primary_triggers: ["sales demo script", "objection handling", "sales playbook", "one pager", "pitch deck narration", "close the deal"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🤝 sales-enablement — Pre-Sale Sales Enablement Department

One head skill for the assets a client's sales team needs to win deals: a demo that sells, honest objection answers, a scannable one-pager, and a playbook that makes every rep consistent. Sales enablement is strategy turned into rep-ready artifacts — grounded in the buyer's real objections (win/loss, sales calls, competitor teardowns), never invented friction.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **demo** | "demo script", "sales demo", "walk me through the pitch", "demo narration" | Outcome-led demo script and narration with pause points and proof | [references/demo.md](references/demo.md) |
| **objection** | "objection handling", "faq for sales", "competitor objection", "price objection" | Honest objection-handling handbook keyed to real buyer concerns | [references/objection.md](references/objection.md) |
| **one-pager** | "one pager", "leave-behind", "sales one sheet", "why us" | One-pager: the value in one scannable page for reps to leave behind | [references/one-pager.md](references/one-pager.md) |
| **playbook** | "sales playbook", "sales process", "rep onboarding", "deal playbook" | Sales playbook: stages, scripts, disqualify rules, and pitch paths | [references/playbook.md](references/playbook.md) |
| **audit** | "audit sales assets", "enablement audit", "demo review" | Audit of existing sales assets for consistency and buyer truth | [references/audit.md](references/audit.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- A client's sales team needs a demo script, objection answers, or a playbook.
- Reps are inconsistent, hedge on objections, or lose deals on air.
- Pitch/one-pager assets need to be grounded in the buyer's real language.

### Anti-Triggers

- Proposal, SOW, deal terms → `ops`.
- Outbound pipeline, lead scoring, cold outreach → `gtm`.
- Marketing copy, case-study, blog → `content`.
- Positioning / pricing strategy behind the assets → `growth`.

---

## Quick Reference

### Enablement ladder (decide before any mode)

| Rep problem | Mode |
|:---|:---|
| "They lose interest mid-demo" | demo |
| "They freeze when asked the hard questions" | objection |
| "They want to leave something behind" | one-pager |
| "New reps don't know how to sell it" | playbook |

Order: know the real objections (from win/loss + calls) → one-pager → demo → playbook. Assets are only as honest as the objection intelligence behind them.

### Evidence doctrine (every mode)

- Objections come from real buyer language (calls, win/loss, reviews), not invented friction.
- No unsupported claims — every proof point traces to a verifiable result.
- The voice is the buyer's, not internal jargon.

### Suite contracts

- Strategy inputs → `growth` (positioning/pricing); buyer intelligence → `research` (entity-dossier/market-pulse).
- The assets execute GTM; outbound leads → `gtm`.
- Client status on the program → `client-comms`.

---

## Procedure

1. **Intake.** Establish the buyer, the real objections (from win/loss, sales calls, competitor teardowns), and what success looks like for the client's reps — before writing anything.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Evidence doctrine plus the mode's quality gate, then deliver the asset where the sales team expects it.

---

## Pitfalls

- Demo scripts that list features instead of selling the outcome.
- Objection answers that dodge ("we're different") instead of answering honestly.
- One-pagers that cram everything in and scan as nothing.
- Playbooks built on invented friction instead of real win/loss data.
- Reps left to improvise because the enablement assets don't reflect how deals actually go.
- Assets that contradict positioning or pricing set in `growth`.

---

## Verification

- [ ] Objections sourced from real buyer language, not invented.
- [ ] Every proof point is verifiable, no unsupported claims.
- [ ] The asset reflects the buyer's voice and the client's positioning.
- [ ] Assets are consistent with each other and with `growth` positioning/pricing.
- [ ] Reps can use the deliverable without additional explanation.