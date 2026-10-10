# gate — Release-gate checklist ending in a Block-or-Ship verdict.

## Intake

- Release candidate URL + what changed since last gate
- `functional` results if they exist
- Launch date and rollback owner

## Deliverable

Gate report: checklist with pass/block per item, severity-ordered findings, and a final verdict — **Ship** or **Block** (with the single narrowest unblock condition).

## Procedure

1. Run the gate checklist: critical paths pass, no HIGH findings open, keyboard-only path works, 200% zoom reflows without loss, key pages meet the performance budget on the extremes-first device, no placeholder secrets or debug flags, analytics firing, backups/rollback confirmed with `devops`.
- Validation sweep (award-bar integrity): no placeholder/lorem content; no copied brand identity (logos, names, claims) left from templates; no unsupported claims (fake stats, testimonials, partnerships); all media credited with provenance; split/staggered text exposes one coherent accessible name and never splits links; first frame reads complete with JS/media/WebGL disabled.
2. Any HIGH open finding = Block. Mediums ship only with a dated owner and ticket.
3. State the verdict in one line plus the narrowest unblock condition; file the report in `.agents/artifacts/qa-gate-<ts>.md`.
4. For a launch expected to see concurrency/scalability load, run a load gate first: script realistic VU scenarios (not a single script hammer), assert threshold pass/fail against agreed budgets (latency percentiles, error rate, throughput), and record the result in the gate — functional-only QA does not prove it scales.
5. Solo: rollback owner is you — confirm you can actually execute the rollback alone before a Ship verdict.

## Quality gate

- [ ] Verdict stated (Ship or Block), never hedged.
- [ ] Every Block names its narrowest unblock condition.
- [ ] Rollback owner confirmed before Ship.
- [ ] Release hygiene: linter clean on errors AND warnings, release tag matches the declared version, release artifacts attached.
- [ ] Data isolation proven where user data ships: RLS on every table in an exposed schema, policies pairing `TO <role>` with an ownership predicate in USING (UPDATE also needs WITH CHECK); no bare `auth.role()` checks.
- [ ] No privileged bypasses: views use `security_invoker`, no `SECURITY DEFINER` in `public` without an `auth.uid()` check, `service_role`/secret key never in client bundles; Supabase projects run `supabase db advisors` before Ship.
- [ ] Store candidates: version + build number recorded with source revision; beta track processed with tester access confirmed (a queued upload is not an acceptance).
- [ ] Change classified: hot-swappable (staged channel rollout) vs rebuild-required (new binary + full gate); post-ship health notes crash rate + updated-vs-stale-client split.
- [ ] Public-release readiness (keeper: trailofbits/open-sourcing): secrets history scanned — a repo that ever held keys/client data ships via fresh repo, never rewritten history; license chosen; README build/usage documented; CI + release automation green.
- [ ] Dependency risk swept (keeper: trailofbits/supply-chain-risk-auditor): advisories checked on direct + lockfile tree, no abandoned/archived upstreams without a replacement plan, install scripts reviewed.
- [ ] No Block on unproven findings (keeper: trailofbits/fp-check): each Block restates claim + root cause + trigger + impact; "looks dangerous" or "was vulnerable elsewhere" rejected without traced evidence.
- [ ] Acceptance matrix present for ambitious asks: each gate names verification method + binary pass condition + evidence artifact (keeper: mengto/iterate-until-verified).
- [ ] Full-page evidence trustworthy: lazy content warmed, stitched viewport slices (never a single native fullPage shot on reveal-heavy pages); reject blanks, bands, and narrow strips (keeper: mengto/stitched-full-page-capture).
- [ ] Animation perf verified behaviorally: offscreen-running count 0, visible motion resumes on re-entry, RAF loops gated by visibility with cleanup (keeper: mengto/optimize-web-animations).
- [ ] Originality flags pair exact current-site evidence with exact reference evidence; called risks/overlaps, never legal plagiarism from similarity alone (keeper: mengto/audit-reference-originality).
- [ ] Technical audit scored per dimension (a11y, perf, theming, responsive, integrity) with P0–P3 severities; positives noted (keeper: pbakaus/impeccable).
- [ ] Modal dialogs trap focus while open, restore it on close, and announce state changes (keeper: build-primitive).
- [ ] Pre-ship sweep clean: atomicity/races, error handling, data-store hygiene, no debug flags or placeholder secrets (keeper: wshobson/operating-kit).
- [ ] Edit-round audit clean: safety/confirmation/format contracts kept inline (never relocated where they can be skipped); trigger phrases and exact commands preserved (keeper: 99rebels/skill-polisher).

## Routing

- Deploy/rollback mechanics → `devops`; visual polish blocks → `refactor-ui`; post-fix proof → `regression`.
- Rollout thresholds per stage: advance only if error rate within 10% of baseline, p95 within 20%, no new JS-error types, business metrics neutral; roll back on >2x errors, >50% p95, or any data-integrity/security issue.
- Standing DoD bar: per-task (correctness+quality) / per-feature (+integration+docs) / per-release (full gate); tailor once then freeze — pointer to the `relay` packet's acceptance block (relay owned by Lane A, no edit there). Source: `addyosmani/agent-skills` (`definition-of-done`).
- Error-budget gate: >20% remaining ships normally, 0–20% slow rollouts only, exhausted freezes features for reliability; first-hour post-launch: health 200, no new error types, no latency regression, manual critical-flow pass, rollback dry-run.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
