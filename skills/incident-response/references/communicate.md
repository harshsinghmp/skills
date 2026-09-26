# communicate — Status-page and client comms during live incidents, severity-linked cadence.

Default stack: self-hosted status page + Docker logs + Cloudflare analytics (fallbacks: plain-text status file, email thread, any shared channel).

## Intake

- SEV + comms cadence from `triage` (defaults: SEV-2 / 30-min cadence if unknown)
- Audiences: internal team, affected clients, public status page (default: all three get the same facts, tone adjusted)

## Deliverable

Live comms set: status-page post, client update, internal note — all timestamped, all mutually consistent, next-update time stated.

## Procedure

1. Start the clock immediately: SEV-1 every 15 min, SEV-2 every 30 min, SEV-3 hourly, SEV-4 async. A holding update (still investigating, next update at HH:MM) beats silence.
2. Template every update: status (Investigating / Identified / Monitoring / Resolved) → impact (who, what, since when) → what we are doing now → next update time. Never state cause before evidence; never promise an ETA without a range.
3. Keep internal and external timelines identical — every external claim traceable to the incident log. Downgrade tone for clients (calm, no jargon), never the facts.
4. On resolution: send the all-clear with duration, impact, and the retro date. Hand routine follow-up voice back to `client-comms`; this skill owns comms only while the incident is live.

## Comms templates (enrich — source: `BagelHole/incident-response`)

- **Internal.** SEV + commander + blast radius + actions in flight + next
  update time. Facts only, jargon allowed.
- **Stakeholder.** Impact (who, what, since when) → what we are doing →
  next update time. Calm, no jargon, same facts as internal.
- **Breach notice.** What happened + what data affected + what we did +
  what recipients should do + contact. Never state cause before evidence;
  legal review before sending where exposure exists.

## Quality gate

- [ ] Cadence matched severity with no missed window.
- [ ] Every external claim matches the internal timeline; no pre-evidence cause stated.
- [ ] Each update states the next update time; resolution states duration + retro date.
- [ ] Voice handed back to `client-comms` on resolve, not kept here.

## Routing

- Status-as-usual after resolve → `client-comms`; technical detail source → incident log + `mitigate` report.
- Angry-client de-escalation beyond facts → stakeholder, never improvised promises.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
