---
name: retain
aliases: ["retention-loop", "client-retention", "renewals", "qbr", "review-ask", "referrals"]
description: "Post-delivery retention loop: scheduled check-ins, monthly value notes, quarterly business reviews with transcripts, delight-peak review asks, referral and repurchase offers, and churn-watch signals — routed through six modes. Use when asked to follow up after delivery, prove ongoing value, run a QBR, ask for a review or testimonial, win a referral or repeat purchase, or spot churn risk from usage drops or client silence. Not for churn strategy itself (growth retention mode) or status reporting (client-comms)."
argument-hint: "[check-in|value-note|qbr|review-ask|referral-rebuy|churn-watch]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 43
  aliases: ["retention-loop", "client-retention", "renewals", "qbr", "review-ask", "referrals"]
  suggested_skills: ["growth", "client-comms", "ops", "analytics"]
  hermes:
    tags: ["retention", "check-in", "value-note", "qbr", "quarterly-review", "review-ask", "testimonial", "referral", "repurchase", "renewal", "churn-watch"]
    related_skills: ["growth", "client-comms", "ops", "analytics"]
    suggested_skills: ["growth", "client-comms", "ops", "analytics"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["growth", "client-comms", "ops", "analytics"]
    primary_triggers: ["post-delivery follow-up", "check in with client", "quarterly business review", "ask for a review", "referral offer", "churn signals", "client gone quiet"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🔁 retain — Post-Delivery Retention Loop

One head skill for everything after handoff. Delivery wins the project; the loop wins the next one. Cadence runs delivery+7d → monthly note → QBR w/ transcript → review-ask at delight peak → referral/repurchase offer. Churn signals (usage drop, silence >14d) break the cadence and route to `growth` churn mode.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **check-in** | "check in", "follow up after delivery", "delivery+7d", "how is it going" | Scheduled post-delivery check-in (delivery+7d, then monthly heartbeat) | [references/check-in.md](references/check-in.md) |
| **value-note** | "value note", "prove value", "monthly update", "what did we deliver" | Monthly value note tying shipped work to client outcomes | [references/value-note.md](references/value-note.md) |
| **qbr** | "qbr", "quarterly review", "quarterly business review" | Quarterly business review run from a transcript, decisions logged | [references/qbr.md](references/qbr.md) |
| **review-ask** | "ask for review", "testimonial", "review request", "google review" | Review/testimonial ask timed at the delight peak — this skill owns the review pipe | [references/review-ask.md](references/review-ask.md) |
| **referral-rebuy** | "referral", "refer a friend", "repurchase", "repeat purchase", "renewal offer" | Referral or repurchase/renewal offer after value is proven | [references/referral-rebuy.md](references/referral-rebuy.md) |
| **churn-watch** | "gone quiet", "churn risk", "usage drop", "silence", "at-risk client" | Churn-signal triage (usage drop, silence >14d) → `growth` churn mode | [references/churn-watch.md](references/churn-watch.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Following up after delivery (delivery+7d check-in, monthly heartbeat).
- Proving ongoing value with a monthly value note.
- Running a quarterly business review from a call transcript.
- Asking for a review or testimonial at the delight peak.
- Making a referral or repurchase/renewal offer.
- Spotting churn risk from usage drops or client silence.

### Anti-Triggers

- Churn strategy and save plays → `growth` retention mode (churn-watch routes there).
- Status reporting on active work → `client-comms`.
- Delivery retrospectives looking backward → `ops` retro.
- Measuring retention metrics → `analytics`.

---

## Quick Reference

### Retention cadence (default order)

| Step | Mode | Timing |
|:---|:---|:---|
| 1. Prove it landed | check-in | delivery+7d |
| 2. Prove it keeps paying | value-note | monthly |
| 3. Prove it strategically | qbr | quarterly, transcript in |
| 4. Capture the delight | review-ask | delight peak (delivery +7d, QBR close) |
| 5. Compound it | referral-rebuy | after value proven, never before |

Interrupt: churn signals at any step → churn-watch → `growth` churn mode.

### Tooling

Mechanisms are tool-independent. Default stack where a stack was chosen: check-ins via whatsapp-business + gmail; QBR transcripts via fathom; searches modern-first (`rg`, `fd`) with legacy fallback.

### Suite contracts

- Churn strategy and save/win-back plays → `growth` retention mode.
- QBR transcript capture → fathom pipe; decisions → `ops` + `evidence-ledger`.
- Retention metrics and dashboards → `analytics`.
- Active-work status → `client-comms`.

---

## Procedure

1. **Intake.** Establish delivery date, client, and last contact before running anything — retention without a timeline spams.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Check-in with no reference to what was delivered — generic "just checking in" trains clients to ignore you.
- Value note listing activity instead of outcomes — hours logged is not value proven.
- QBR with no transcript — decisions evaporate; every QBR is transcribed or it didn't happen.
- Review ask at a low point — never ask during an incident or an unpaid invoice.
- Referral offer before value is proven — asking for social capital you haven't earned.
- Sitting on churn signals — silence >14d or a usage drop routes to `growth` immediately, not next quarter.
- Hand-edited claims with no source — every value claim traces to shipped work or a transcript.

---

## Verification

- [ ] Delivery date and last contact established before outreach.
- [ ] Exactly one mode resolved and its reference followed.
- [ ] Value claims trace to shipped work, metrics, or a transcript.
- [ ] QBR decisions logged to `ops` / `evidence-ledger`.
- [ ] Review ask timed at a delight peak, never at a low point.
- [ ] Referral/rebuy offered only after value proven.
- [ ] Churn signals routed to `growth` churn mode, not sat on.
