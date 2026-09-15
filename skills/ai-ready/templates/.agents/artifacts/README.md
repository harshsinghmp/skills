# 🗂️ Artifacts — Research & Planning Working State

Everything an agent produces while **researching, planning, or reporting** lives
here — never in the tracked repo tree, never in `.memory/` (owned by musememory).

## What belongs here

- Research corpora: raw fetches, distilled sources, findings receipts
- Planning docs: task plans, roadmaps-in-progress, decision drafts
- Generated reports: audit/sync/handoff/session reports (dated or fixed-name per the owning skill)

## Conventions

1. **One folder per topic**: `.agents/artifacts/<topic>/` (kebab-case).
2. **Dated for history, fixed for live state**: reports use `<name>-<YYYY-MM-DD>.md`; live-state files keep their skill-defined fixed name (e.g. `HANDOFF.md`).
3. **Method header on research**: every research receipt starts with date, source count, and method so any agent can re-derive or distrust it.
4. **Local-only by default**: this folder is workspace state, not repo content — do not commit it.
5. **Promote or perish**: durable findings move to `.agents/context/` (via `updateagents`) or `.agents/context/decisions.md`; everything unpromoted is disposable at project close. The `audit` skill flags orphaned artifacts.
