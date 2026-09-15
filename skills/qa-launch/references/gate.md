# gate — Release-gate checklist ending in a Block-or-Ship verdict.

## Intake

- Release candidate URL + what changed since last gate
- `functional` results if they exist
- Launch date and rollback owner

## Deliverable

Gate report: checklist with pass/block per item, severity-ordered findings, and a final verdict — **Ship** or **Block** (with the single narrowest unblock condition).

## Procedure

1. Run the gate checklist: critical paths pass, no HIGH findings open, keyboard-only path works, 200% zoom reflows without loss, key pages meet the performance budget on the extremes-first device, no placeholder secrets or debug flags, analytics firing, backups/rollback confirmed with `devops`.
2. Any HIGH open finding = Block. Mediums ship only with a dated owner and ticket.
3. State the verdict in one line plus the narrowest unblock condition; file the report in `.agents/artifacts/qa-gate-<ts>.md`.
4. Solo: rollback owner is you — confirm you can actually execute the rollback alone before a Ship verdict.

## Quality gate

- [ ] Verdict stated (Ship or Block), never hedged.
- [ ] Every Block names its narrowest unblock condition.
- [ ] Rollback owner confirmed before Ship.

## Routing

- Deploy/rollback mechanics → `devops`; visual polish blocks → `refactor-ui`; post-fix proof → `regression`.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
