# ⚓🌊 Layering Protocol — Anchors vs. HANDOFF.md

Normative contract between `context-anchor` (intra-session focus layer) and
`handoff` v2.1.0 (cross-session continuity layer). Both skills reference this
document; edit it co-dependently — changing one side without the other is a
protocol violation.

---

## 1. Division of Labor

| | `context-anchor` | `handoff` |
|:---|:---|:---|
| Question answered | *What am I doing right now, in this lane?* | *Where did this project stand when the last session ended?* |
| File | `.agents/anchor.md` + `.agents/anchors/<slug>.md` | `.agents/artifacts/HANDOFF.md` (+ timestamped packets) |
| Write trigger | Manual drop / park / switch | Passive: checkpoints, decisions, incomplete turn-ends, ending signals |
| Lifetime | Disposable; folded forward at close | Always-current; overwritten in place |
| Reader | The same agent, minutes later; a fresh agent refocusing | Any agent, any future conversation (ladder rung 1) |

## 2. Read Precedence

1. **Workspace entry**: probe `HANDOFF.md` first (handoff State-Source Ladder,
   rung 1). The anchor is *not* the entry artifact.
2. **Mid-session refocus**: the active anchor wins; `HANDOFF.md` is stale by
   definition between checkpoints.
3. **Conflict**: `HANDOFF.md` governs cross-session truth (branch, phase,
   decisions); the anchor governs intra-session focus (exact next action in the
   current lane). When both disagree about the *same fact*, re-derive from the
   repository and rewrite both.

## 3. Flow Between Layers

```
drop anchor (focus) ──► park <slug> (lane switch) ──► session close
                                                      │
                                     fold active anchor ──► HANDOFF.md flush
                                     (Next Step / In-Flight / Decisions)
```

- Anchors fold **into** `HANDOFF.md` at session close; `handoff` owns the flush.
- A workstream parked across sessions is promoted to `HANDOFF.md` In-Flight so it
  survives even if its anchor file is never reopened.
- Anchors never contain a "previous session" section — that is `HANDOFF.md`'s job.

## 4. Freshness Rules (shared)

Both files carry a `branch:` header. A file whose branch mismatches the current
branch, or whose timestamp predates recent commits on that branch, is a **hint,
not truth**: re-derive from git or `.agents/context/current.md`, then overwrite
the file with corrected state. Never resume purely from a stale artifact.

## 5. Boundaries

- One file per layer per workspace. No anchor trails, no history logs.
- `.memory/**` is owned by `musememory` and touched by neither skill.
- Client-confidentiality: both artifacts follow the codename rule and
  close-out hygiene defined in `context-anchor` SKILL.md.
