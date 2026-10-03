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

---

## 🎨 Interactive HTML Milestone Report Template

For comprehensive milestone deliverables and client/executive handoffs, generate the interactive HTML report using the Clay template:
- Generator Script: `bun scripts/gen-report-template.ts` (or `bun scripts/gen-clay-interactive.ts`)
- Canonical HTML Output: `.agents/reports/report-template.html`
- Typography: Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono (code)
- Features: Dual-Mode (Neo-Pop Light / Midnight Dark), SCQA briefing, Roadmap checklist, skill adaptation matrix, and 1-click execution prompts.

