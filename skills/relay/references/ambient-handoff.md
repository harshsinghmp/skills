# 🌊 Ambient Continuity & Live Handoff File Contract

Companion reference for `handoff` v2.1.0 Mode C. Specifies the live-state
file, its write triggers, freshness rules, and the memory hook protocol.
The SKILL.md carries the summary; this file carries the contract.

---

## 1. The Live Handoff File (`.agents/artifacts/HANDOFF.md`)

### File Contract

| Property | Rule |
|:---|:---|
| Path | `.agents/artifacts/HANDOFF.md` (fixed name — never dated) |
| Size | ≤30 lines; a pointer, not a journal |
| Write mode | Overwrite atomically on every state change; never append |
| Sections | Next Step · In-Flight · Ruled Out · Decisions · Verify · Open Questions (omit empty) |
| Header | ISO timestamp + branch + one-line phase |
| Audience | Any agent, any runtime, zero prior context |

### Freshness Rules

A live file is **fresh** when: the branch matches the current branch and the
timestamp is plausible relative to the last commit dates on it. A **stale**
file (branch mismatch, timestamp predates the last several commits) is
treated as a hint, not truth — drop to ladder rung 4 (git forensics) and
rewrite the file with corrected state.

### Directory-Boundary Note

HANDOFF.md lives *inside* the workspace it describes, so boundary isolation
is inherited from the filesystem itself. When reading session memory or
artifacts across directories, apply the strict boundary matching from
[resumption-protocol.md](resumption-protocol.md).

---

## 2. Write Triggers (Passive Layer)

| Trigger | Action |
|:---|:---|
| Checkpoint completed | Overwrite with new Next Step |
| User decision or correction | Record under Decisions; refresh timestamp |
| End of turn, work incomplete | Overwrite; Next Step = the exact next action you would take |
| Ending signal ("close", "wrap up") | Full flush: live file (+ timestamped packet if state is rich) + memory hook |
| Task blocked or abandoned | Next Step = escalation path; also emit a `dead-letter` packet |

**Anti-noise invariant**: refresh only on real state change. Tool calls,
reads, and analysis never trigger writes. Ambient handoff is silent — it
never narrates itself or interrupts the user.

---

## 3. Memory Hook Protocol

The runtime may provide a memory system (e.g. musememory). Integration is
by tool API only:

1. **Write hook** (on outbound dispatch or full flush): push *durable
   decisions only* — choices, corrections, rules — through the runtime's
   memory-write tool. Ephemeral state (in-flight diffs, next actions)
   stays in HANDOFF.md.
2. **Read hook** (ladder rung 2): memory recall filtered strictly to the
   current directory boundary.
3. **No memory tool**: report the durable fact in the output and route
   durable truth to `.agents/context/` via `updateagents` conventions.

**Hard boundary**: never read, write, or modify `.memory/**` by hand. That
path is owned exclusively by `musememory`.
