---
name: incident-response
aliases: ["incident-command", "outage-response", "sev-response", "incident-triage", "postmortem", "stop-the-bleeding"]
description: "Live incident command: severity triage with first-15-minutes checklist, stop-the-bleeding mitigation playbooks for outage breach data-loss and perf-collapse, severity-linked status-page and client communication, and blameless postmortem with tracked actions, routed through four modes. Use when production is down, breached, losing data, or collapsing in performance. Not for planned QA (qa-launch), security audits (audit/code-review), routine client status (client-comms), or infra builds (devops)."
argument-hint: "[triage|mitigate|communicate|retro]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 39
  aliases: ["incident-command", "outage-response", "sev-response", "incident-triage", "postmortem", "stop-the-bleeding"]
  suggested_skills: ["ops", "qa-launch", "client-comms", "devops"]
  hermes:
    tags: ["incident-response", "incident-command", "severity-triage", "outage", "breach", "data-loss", "perf-collapse", "mitigation", "status-page", "postmortem", "blameless-retro", "escalation"]
    related_skills: ["ops", "qa-launch", "client-comms", "devops"]
    suggested_skills: ["ops", "qa-launch", "client-comms", "devops"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["ops", "qa-launch", "client-comms", "devops"]
    primary_triggers: ["production is down", "site is down", "severity triage", "first 15 minutes", "stop the bleeding", "outage mitigation", "status page update", "incident comms", "blameless postmortem", "sev-1", "sev-2"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🚨 incident-response — Live Incident Command

One head skill for live incidents. Triage the severity, stop the bleeding, tell the truth on a cadence, then learn without blame. Every mode runs handsfree — defaults are stated inline, assumptions recorded in the deliverable, zero questions asked.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **triage** | "production is down", "sev-1", "severity", "first 15 minutes", "is this an incident" | Severity classification, escalation spine, first-15-minutes checklist | [references/triage.md](references/triage.md) |
| **mitigate** | "stop the bleeding", "mitigate the outage", "roll back", "site is down", "data loss" | Stop-the-bleeding playbooks per incident class | [references/mitigate.md](references/mitigate.md) |
| **communicate** | "status page update", "tell the client", "incident comms", "draft the update" | Status-page and client comms with severity-linked cadence | [references/communicate.md](references/communicate.md) |
| **retro** | "postmortem", "blameless retro", "what went wrong", "action items" | Blameless postmortem feeding ops/retro with tracked actions | [references/retro.md](references/retro.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Production is down, degraded, breached, losing data, or collapsing in performance.
- Severity needs classifying and an escalation spine needs standing up fast.
- A live incident needs mitigation before root cause is known.
- Stakeholders need truthful updates during a live incident.
- A blameless postmortem with tracked action items is due after the incident.

### Anti-Triggers

- Planned QA before launch → `qa-launch` (incident-response owns live fire, never the release gate).
- Security audits and code-level review → `audit` / `code-review` (this skill mitigates a live breach; audits assess posture when nothing is burning).
- Status-as-usual client updates → `client-comms` (incident-response owns comms only during live incidents; hand the summary back to `client-comms` when resolved).
- Infra builds and deploy pipelines → `devops` (mitigation may call `devops` mechanics; builds stay there).

---

## Quick Reference

### Routing ladder (decide before any mode)

| Question | Mode |
|:---|:---|
| 'How bad is it, who owns it, what happens in the first 15 minutes?' | triage |
| 'How do we stop the bleeding right now?' | mitigate |
| 'What do we tell stakeholders, and how often?' | communicate |
| 'What did we learn, and what changes so it never recurs?' | retro |

Order: triage → mitigate → communicate → retro. Classify, stabilize, narrate, then learn. Communicate runs in parallel with mitigate from minute one — silence is the second outage.

### Verification gate (every mode)

- Severity is stated (SEV-1 through SEV-4) with blast radius and incident commander named.
- Mitigation precedes root cause — service restored first, diagnosis second.
- Every external claim matches the internal timeline; no cause stated before evidence.
- The retro names process fixes with owners and dates, never people to blame.

### Suite contracts

- Fixes to product code → `webdev` / `mobile`; infra mechanics (rollback, failover) → `devops`.
- Routine client voice after resolution → `client-comms`; process retro storage → `ops` retro mode.
- Release-gate proof the fix holds → `qa-launch` regression.

---

## Procedure

1. **Intake.** establish what is broken, who is affected, and when it started before touching anything — an incident without a blast radius gets the wrong severity.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous during live fire → default to triage, state the assumption, proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where responders expect it.

---

## Pitfalls

- Debugging root cause before mitigating — users stay down while you investigate.
- Severity inflation or deflation — SEV-everything pages everyone; SEV-nothing pages no one.
- Silent response — no comms for 30 minutes reads as abandonment, whatever the fix state.
- Declaring cause before evidence — the first theory is usually wrong and always quoted.
- Blameful retro — names in the doc mean silence in the next incident.
- Action items with no owner or date — the same incident recurs on schedule.

---

## Verification

- [ ] Exactly one mode resolved and its reference playbook followed end to end.
- [ ] Severity stated with blast radius, commander, and escalation path.
- [ ] Mitigation attempted or documented before root-cause work.
- [ ] Comms cadence matched severity; external claims match the internal timeline.
- [ ] Retro is blameless with owned, dated action items routed to `ops`.
