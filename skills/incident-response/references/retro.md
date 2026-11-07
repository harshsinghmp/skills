# retro — Blameless postmortem feeding ops/retro, action-item tracking.

Default stack: self-hosted status page + Docker logs + Cloudflare analytics (fallbacks: incident log file, ticket tracker, any shared doc).

## Intake

- Incident log + mitigation report + comms timeline (defaults: reconstruct from chat/log timestamps if the log is thin, marked assumption)
- Attendees or solo (default solo: you are facilitator and scribe — same rigor, shorter doc)

## Deliverable

Postmortem doc filed in `.agents/artifacts/postmortem-<ts>.md`: timeline, five-whys on process (never people), owned dated action items, ops/retro handoff.

## Procedure

1. Rebuild the timeline first: detection → triage → mitigation → comms → resolution, every entry timestamped. Facts before theories.
2. Run five-whys on the process, not the person: why did detection lag, why did mitigation stall, why did comms miss — stop at the process fix, never at a name.
3. Write action items with owner + date + verification method each (default owner: commander if unassigned — an unowned action is a wish). Cap at five; more means unfocused.
4. Feed `ops` retro mode with the postmortem link and action list; schedule the 30-day check that actions actually closed.

## Postmortem triggers + evidence-per-why + facilitation agenda (enrich — source: `wshobson/agents` (`postmortem-facilitation`))

- **Triggers.** Any SEV-1/2, any SEV-3 with user impact > 4h or repeat of an open action, any breach/data-loss regardless of SEV. Solo default: trigger still fires — shorter doc, same rigor.
- **Evidence-per-why.** Each of the five whys cites one artifact (log line, metric snapshot, deploy SHA, comms timestamp). A why without evidence is a theory — mark it as such, never as fact.
- **Facilitation agenda (30 min).** 0–5 timeline readback (corrections only) → 5–15 whys on process → 15–25 actions (owner + date + verification each) → 25–30 ops handoff + 30-day check owner. Scribe ships the doc within 24h.

## Quality gate

- [ ] Timeline complete and timestamped; no blame language anywhere in the doc.
- [ ] Every action item has owner, date, and verification method; max five.
- [ ] Postmortem filed at `.agents/artifacts/postmortem-<ts>.md` and handed to `ops`.
- [ ] 30-day action-close check scheduled.

## Routing

- Process storage → `ops` retro; code/infra fixes → `webdev` / `devops` tickets; release proof → `qa-launch`.
- Repeat incident with open actions from last time → escalate severity of the process finding, say so plainly.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
