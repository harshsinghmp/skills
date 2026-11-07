---
name: client-comms
aliases: ["client-communication", "status-update", "change-request", "project-handover", "client-feedback", "handover-docs"]
description: "Client-facing communication: status reporting, change-request triage with scoping and approval, project handover with docs and training, client feedback intake, B2B proposals with stop-the-clock terms, automated onboarding intake with scope boundaries, and autonomous C-suite executive pulse briefings — routed through ten modes. Use when asked to write a client status update, triage a scope-change request, hand over a finished project, generate a high-converting client proposal, collect client feedback, generate an executive pulse one-pager, or ingest a new client intake form. Not for internal agency ops (ops) or pricing strategy (growth)."
argument-hint: "[status|change|handover|feedback|proposal|intake|executive-pulse|audit|inbox-triage]"
user-invocable: true
version: 1.6.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 36
  aliases: ["client-communication", "status-update", "change-request", "project-handover", "client-feedback", "handover-docs"]
  suggested_skills: ["ops", "growth", "analytics"]
  hermes:
    tags: ["client-communication", "status-report", "change-request", "scope-triage", "handover", "training", "feedback", "account-management", "client-facing"]
    related_skills: ["ops", "growth", "analytics"]
    suggested_skills: ["ops", "growth", "analytics"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["ops", "growth", "analytics"]
    primary_triggers: ["client status update", "scope change request", "project handover", "client feedback", "change-request triage", "handover docs", "weekly client report", "collect client feedback"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 💬 client-comms — Client Communication Department

One head skill for client-facing communication. Keep the client informed, price the change before you build it, hand over so they never need to call you, and hear feedback before it becomes churn. Outward voice to the client; internal machinery routes to `ops`.

---

## Modes

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **status** | "status update", "weekly report", "where does the client stand" | Client status report: progress, blockers, next steps, in client language | [references/status.md](references/status.md) |
| **change** | "change request", "scope change", "client wants extra" | Change-request triage: impact, options, scoped approval before work | [references/change.md](references/change.md) |
| **handover** | "hand over the project", "handover docs", "client training" | Project handover: docs, credentials, training, and support terms | [references/handover.md](references/handover.md) |
| **feedback** | "collect feedback", "client review", "satisfaction check" | Client feedback intake: structured capture, triage, and response plan | [references/feedback.md](references/feedback.md) |
| **proposal** | "client proposal", "pitch deck", "project pitch", "B2B proposal" | High-converting client proposal and pitch: PAS/AIDA/QUEST architecture, stop-the-clock terms, and milestone proof gates | [references/proposal.md](references/proposal.md) |
| **intake** | "client intake", "intake form", "client onboarding questionnaire", "ingest intake" | Automated client intake ingestion: scope boundary extraction, anti-scope fencing, and vault scaffolding | [references/intake.md](references/intake.md) |
| **executive-pulse** | "executive pulse", "c-suite briefing", "weekly executive update", "client pulse", "one pager report" | Autonomous C-suite weekly briefing generator: layman impact translation (zero jargon), sprint velocity & runway tracking, 48h risk radar, and print-ready HTML one-pagers | [references/executive-pulse.md](references/executive-pulse.md) |
| **`audit`** | "communication audit", "audit client comms", "SLA audit" | Bidirectional SLA conformance, cadence integrity, channel discipline, unresolved threads, escalation signals. | [references/audit.md](references/audit.md) |
| **`inbox-triage`** | "triage the inbox", "client emails", "executive email triage" | Executive email triage and follow-up protocols | [references/inbox-triage.md](references/inbox-triage.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---


### Support references (load on topic)

Loadable by topic; also routable as `/client-comms-<file>` commands (not separate routed modes):

- [factual-reporting.md](references/factual-reporting.md)

## When to Use

- Writing a client status update or progress report.
- Triaging a scope-change request with impact and approval.
- Handing over a finished project with docs and training.
- Collecting and acting on client feedback.
- Ingesting raw client intake questionnaires and auto-scaffolding scope boundaries.
- Generating high-converting B2B client proposals and pitch decks with strict stop-the-clock terms.

### Anti-Triggers

- Internal agency ops, onboarding, SOWs, milestones, retros → `ops`.
- Pricing strategy and value metrics behind proposals → `growth` (proposal mode structures the pitch and boundaries; `growth` owns rate calibration).
- Measuring campaign or product metrics → `analytics`.
- Session handoffs between agents → `handoff`.

---

## Quick Reference

### Routing ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'How do we ingest new client questionnaire answers and establish scope boundaries?' | intake |
| 'How do we present a high-converting pitch and protect scope before signing?' | proposal |
| 'What do we tell the client about progress?' | status |
| 'The client wants something extra — what now?' | change |
| 'How do we give them the keys?' | handover |
| 'What does the client think, and what do we do about it?' | feedback |

Order: proposal → status → change → handover → feedback. Pitch, report, control scope, hand over, then listen.

### Verification gate (every mode)

- Written in the client's language — no internal jargon or tool names.
- Every commitment names an owner and a date.
- Change requests carry impact and written approval before any work.
- Handover leaves the client self-sufficient with a support path.

### Suite contracts

- Internal tracking, SOWs, milestones → `ops`.
- Pricing strategy behind a change → `growth`.
- Metrics and evidence for reports → `analytics`.

---

## Procedure

1. **Intake.** establish the client, the engagement state, and the audience for the message before writing anything — communication without a named reader misses.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Jargon in client-facing text — the client should never need a glossary.
- Verbal scope approval — if it is not written and signed, it did not happen.
- Status with no blockers or asks — reads as noise; every update needs a next step.
- Handover without credentials rotation and access transfer — a security hole.
- Feedback collected and never answered — worse than never asking.
- Promising dates before impact is scoped — change mode first, commitment second.

---

## Verification

- [ ] Exactly one mode resolved and its reference playbook followed end to end.
- [ ] Client language throughout — no internal jargon.
- [ ] Commitments name an owner and a date.
- [ ] Change work has written approval attached to the scoped impact.
- [ ] Handover leaves docs, credentials, training, and support terms complete.
- [ ] Feedback items each have a triage outcome and a response to the client.
