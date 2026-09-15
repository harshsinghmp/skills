# Run Report Template

All modes fill this at delivery. Emoji-moderate: status line only.

---

## ✅ Status: <DONE / PARTIAL / BLOCKED> — <one-line outcome>

### Overview

<3–5 lines: what was asked, what was done, what remains.>

### What Changed

- `<area>`: `path/to/file` — <one-line why>
- Group by area (feat, fix, docs, chore); one bullet per file or file group.

### Verification Evidence

- Tests: `bun test` — <passed X / failed Y, exact numbers>
- Secret scan: <clean / findings + action>
- CI: `gh pr checks` — <green run URL / red check + owner>
- No exact numbers = not verified. Say so plainly.

### Risks & Follow-Ups

- <risk or open item> — <owner / next step>

### Receipts

- PR: <URL>
- Tag: <tag + URL>
- Release: <URL>
- Issue: closed #<id> in <version> / still open because <why>
