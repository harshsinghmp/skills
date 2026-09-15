---
name: ops
aliases: ["agency-ops", "client-operations", "project-management", "proposals", "sow", "account-management"]
description: "Internal agency operations department: client onboarding, proposals, statements of work, milestone tracking, project retrospectives, and multi-client portfolio management — routed through six modes. Use when asked to onboard a new client, write a proposal or SOW, track project milestones and scope, run a project retro, or manage across multiple client engagements. Not for client-facing delivery work (design/webdev/seo) or session handoffs between agents (handoff)."
argument-hint: "[onboarding|proposal|sow|milestone|retro|multi-client]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 33
  aliases: ["agency-ops", "client-operations", "project-management", "proposals", "sow", "account-management"]
  suggested_skills: ["relay", "context-anchor", "secretary", "evidence-ledger", "git"]
  hermes:
    tags: ["operations", "agency-ops", "onboarding", "proposal", "sow", "scope", "milestones", "retrospective", "multi-client", "project-management", "account-management"]
    related_skills: ["relay", "context-anchor", "secretary", "evidence-ledger", "git"]
    suggested_skills: ["relay", "context-anchor", "secretary", "evidence-ledger", "git"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["relay", "context-anchor", "secretary", "evidence-ledger", "git"]
    primary_triggers: ["onboard a client", "write a proposal", "statement of work", "track milestones", "project retro", "manage multiple clients", "scope a project"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🗂️ ops — Agency Operations Department

One head skill for agency operations. Protect both the client's outcome and the agency's margin. Scope is a promise: write it down, track it, and change it only through an explicit change order. Every client gets a clean workspace, a clear plan, and an honest retrospective.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **onboarding** | "onboard a client", "new client", "kickoff", "client intake" | Client intake and isolated workspace setup | [references/onboarding.md](references/onboarding.md) |
| **proposal** | "write a proposal", "pitch a client", "win this project", "proposal doc" | Client proposal that connects outcome to plan and price | [references/proposal.md](references/proposal.md) |
| **sow** | "statement of work", "sow", "scope document", "contract scope" | Statement of work: scope, deliverables, terms, change process | [references/sow.md](references/sow.md) |
| **milestone** | "track milestones", "scope creep", "project tracking", "delivery status" | Milestone and scope tracking with change control | [references/milestone.md](references/milestone.md) |
| **retro** | "retro", "retrospective", "project review", "what went wrong" | Blameless project retrospective with tracked actions | [references/retro.md](references/retro.md) |
| **multi-client** | "multiple clients", "portfolio", "manage all clients", "capacity planning" | Multi-client portfolio management and capacity planning | [references/multi-client.md](references/multi-client.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Onboarding a new client into a clean workspace.
- Writing a proposal to win an engagement.
- Drafting a statement of work with scope and terms.
- Tracking milestones, scope, and change orders.
- Running a project retrospective.
- Managing a portfolio of concurrent clients.

### Anti-Triggers

- Client-facing delivery (design, code, SEO) → the relevant department skill.
- Session handoff between agents → `handoff`.
- Internal quality and evidence tracking → `secretary` / `evidence-ledger`.
- Billing/accounting software setup → out of scope.

---

## Quick Reference

### Engagement ladder (decide before any mode)

| Engagement | Deliverable spine |
|:---|:---|
| Discovery/consult | Findings doc + recommendation (no build) |
| Fixed-scope project | SOW + milestone plan + change-order process |
| Retainer | Monthly scope + cadence + reporting |
| Multi-client portfolio | Per-client workspace + cross-portfolio dashboard |

Rule: match the paperwork to the risk. Big ambiguous work needs a discovery phase before a fixed price.

### Verification gate (every mode)

- Scope is written, dated, and agreed by both sides.
- Deliverables have owners and dates.
- Changes go through a change order, not a verbal 'sure'.
- Client workspace is isolated and named clearly.

### Suite contracts

- Isolated client workspace scaffold → `new-project` (client mode).
- Session continuity across the engagement → `handoff` / `context-anchor`.
- Evidence of work done → `evidence-ledger`.

---

## Procedure

1. **Intake.** establish the client, the engagement type, and what success looks like for both sides — before promising anything; unwritten scope is how projects lose money.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Starting work before scope is written and signed.
- Verbal scope changes with no change order — margin evaporates.
- Proposals priced before the work is understood.
- Client documents mixed into the agency's own workspace.
- Milestones with no owner or date.
- Retrospectives that blame people instead of fixing process.
- Multi-client context bleed (one client's details in another's work).

---

## Verification

- [ ] Scope written, dated, and agreed before work starts.
- [ ] Deliverables have owners and dates.
- [ ] Change-order process defined and used.
- [ ] Client workspace isolated and clearly named.
- [ ] Retrospectives are blameless with tracked actions.
- [ ] No cross-client context leakage.
