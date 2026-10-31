# audit — relay audit mode

## When to Use

- **Pre-act handoff audit**: before an agent acts on an inherited session (a `HANDOFF.md`, an anchor, a summary prompt), certify the handoff is trustworthy — its state claims verified against live reality, not trusted as written.
- **Outbound certification**: verify your own handoff is *receivable* before ending a session — the five-section contract complete, every claim spot-checkable, tribal context captured.
- **Staleness sweep**: across a workspace's handoff artifacts and anchors, find which ones describe a state that no longer exists.

## Checklist (verification-over-trust lens)

- [ ] **The plan is not the state**: environments change faster than the documents describing them — verify every handoff claim against live sources (git status/forensics, file existence, branch reality), never against the handoff's own text; relay's state-source ladder (live file → memory recall → project context → git forensics) is the audit instrument
- [ ] **Five-section completeness**: what is being handed off · current state · context that exists nowhere else (verbal decisions, approaches tried and failed — the tribal knowledge most handoffs skip) · what the receiver must verify · escalation path if information is missing
- [ ] **Executable-by-a-stranger test**: can the receiving agent execute the stated next step without asking a question? A runbook only its author could follow fails the audit
- [ ] **Staleness signals**: timestamps older than the last code change; referenced files renamed or deleted; claimed branch does not exist on the remote; "verified on <branch>" claims that the Landing Gate would score LOCAL
- [ ] **Spot check**: pick one claim at random and verify it end to end (the file exists, the command runs, the status matches) — one failed spot check puts the whole handoff in review
- [ ] **Downstream confirmation**: check with the next consumer of the receiving agent's output that the handoff's timeline and deliverables still hold
- [ ] **Boundary safety**: resumed state respects the worktree lease (no cross-checkout collisions); uncommitted work in a shared checkout is named, not assumed away
- [ ] **Freshness re-arm**: after the audit, either re-derive a current handoff or mark the old one superseded — an audit that leaves a stale artifact in place half-passes

## Severity & routing

| Finding | Severity | Action |
|:---|:---|:---|
| Handoff claims contradict git state (landed/claimed work is LOCAL, or files named do not exist) | `BLOCK` | discard the handoff; re-derive state from forensics before any action |
| Tribal-context section missing or empty | `REQUEST-CHANGES` | interview the outgoing state (git log, decisions files) and backfill |
| Stale timestamps but every claim verified live | `PASS-WITH-NOTES` | re-stamp and re-arm freshness |
| Boundary/lease conflicts in resumed state | `REQUEST-CHANGES` | resolve the lease, then proceed |

## Sources

- Eon — 13-Point Disaster Recovery Audit Checklist (2026): "the audit matters more than the plan — environments change faster than the documents describing them"; runbooks must be executable by someone who did not write them
- Tallyfy — Handoff checklist & verification: five-section contract; the 48-hour acceptance rule; mandatory walkthrough; random spot check; downstream confirmation (verified handoffs ≈ 70% less downstream rework)
- IT Dock — IT Documentation Quality Checklist: completeness, accuracy, clarity, security, ownership, links
- This suite's own doctrine: relay's state-source ladder; `.agents/standards/landing-gate.md` (LOCAL vocabulary for unverified claims)
