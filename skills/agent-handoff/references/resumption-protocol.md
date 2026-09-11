# Inbound Session Resumption & Boundary Protection Protocol

This reference governs how agents safely resume interrupted work or pick up context from previous sessions without cross-project hallucination or context bleed.

---

## 1. Strict Directory-Boundary Matching

When matching previous sessions from memory or artifact logs, **never use naive string prefix checks**:

### ❌ Anti-Pattern (Raw Prefix Check)
```ts
// Flawed: Matches "/repo-a-staging" when projectPath is "/repo-a"
session.cwd.startsWith(projectPath)
```

### ✅ Correct Pattern (Boundary Safe Check)
```ts
const sep = path.sep;
const isMatchingSession = 
  session.cwd === projectPath || 
  session.cwd.startsWith(projectPath + sep) ||
  projectPath.startsWith(session.cwd + sep);
```
This guarantees that sibling directories, staging clones, and similarly named repositories remain strictly isolated.

---

## 2. Unanswered Question Priority Rule

If the previous session ended on an **unanswered user-facing question**, surface it **FIRST** before reporting system status or next steps:

1. Inspect the last session's final prompt, `summary`, or dialogue turns.
2. If any recent turn ends in a question mark (`?`) that the user has not yet responded to:
   - Lead the resumption response directly with that question.
   - Do not make assumptions or guess the user's intent.

### Example Resumption Format
```text
Resuming session 7f3a9c2 ("Auth Token Refresh Flow").

❓ Open Question from Last Session:
Should user logout revoke all active device tokens or only the current session token?

👉 Immediate Next Step:
Decide token revocation scope, then implement in auth/logout.ts.
```

---

## 3. Empty Session Fallback

If no previous session matches the current directory boundary:
1. Do not hallucinate previous tasks or invent fictional history.
2. Clearly state: `No prior session history found for this project directory.`
3. Offer to start fresh or run `ai-ready` audit.

## 4. Git Forensics Recipe (Ladder Rung 4)

When no live file, memory, or project context exists, the repository itself
is the last reliable witness. Reconstruct state in this order:

```bash
git status -sb          # branch + uncommitted work = in-flight state
git log --oneline -5    # recent trajectory
ls .agents/artifacts/ 2>/dev/null   # any prior packets despite no HANDOFF.md
```

1. Uncommitted modifications = the in-flight work; `git diff --stat` sizes it.
2. The last commit subject = the most recently completed checkpoint.
3. Untracked files distinguish scratch from staged intent.

**Recovery duty**: after reconstructing, immediately write
`.agents/artifacts/HANDOFF.md` (Mode C contract) so the next agent never
digs again. Forensics is a one-time tax per workspace.

## 5. Token Budget Compliance

Resumption is a ramp, not a report:
- Entry probe: one filesystem test before any analysis.
- Output: ≤5 lines of state before the first productive action.
- Detail (packets, references, memory records): load on demand only.
